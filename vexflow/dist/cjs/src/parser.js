// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// A generic text parsing class for VexFlow.
import { log, RuntimeError } from './util';
// To enable logging for this class. Set `Vex.Flow.Parser.DEBUG` to `true`.
// eslint-disable-next-line
function L(...args) {
    if (Parser.DEBUG)
        log('Vex.Flow.Parser', args);
}
const NO_ERROR_POS = -1;
// Converts parser results into an easy to reference list that can be
// used in triggers. This function returns:
// - nested array in which the leaf elements are string or null
// - string (including empty strings)
// - null
function flattenMatches(r) {
    if ('matchedString' in r)
        return r.matchedString; // string
    if ('results' in r)
        return flattenMatches(r.results);
    const results = r;
    if (results.length === 1)
        return flattenMatches(results[0]);
    if (results.length === 0)
        return null;
    return results.map(flattenMatches); // nested array
}
// This is the base parser class. Given an arbitrary context-free grammar, it
// can parse any line and execute code when specific rules are met (e.g.,
// when a string is terminated.)
class Parser {
    // For an example of a simple grammar, take a look at tests/parser_tests.ts or
    // the EasyScore grammar in easyscore.ts.
    constructor(grammar) {
        this.grammar = grammar;
        this.line = '';
        this.pos = 0;
        this.errorPos = NO_ERROR_POS;
    }
    // Parse `line` using current grammar. Returns `{success: true}` if the
    // line parsed correctly, otherwise returns `{success: false, errorPos: N}`
    // where `errorPos` is the location of the error in the string.
    parse(line) {
        this.line = line;
        this.pos = 0;
        this.errorPos = NO_ERROR_POS;
        const result = this.expect(this.grammar.begin());
        result.errorPos = this.errorPos;
        return result;
    }
    matchFail(returnPos) {
        if (this.errorPos === NO_ERROR_POS)
            this.errorPos = this.pos;
        this.pos = returnPos;
    }
    matchSuccess() {
        this.errorPos = NO_ERROR_POS;
    }
    // Look for `token` in this.line[this.pos], and return success
    // if one is found. `token` is specified as a regular expression.
    matchToken(token, noSpace = false) {
        const regexp = noSpace ? new RegExp('^((' + token + '))') : new RegExp('^((' + token + ')\\s*)');
        const workingLine = this.line.slice(this.pos);
        const result = workingLine.match(regexp);
        if (result !== null) {
            return {
                success: true,
                matchedString: result[2],
                incrementPos: result[1].length,
                pos: this.pos,
            };
        }
        else {
            return { success: false, pos: this.pos };
        }
    }
    // Execute rule to match a sequence of tokens (or rules). If `maybe` is
    // set, then return success even if the token is not found, but reset
    // the position before exiting.
    // TODO: expectOne(...) is never called with the `maybe` parameter.
    expectOne(rule, maybe = false) {
        const results = [];
        const pos = this.pos;
        let allMatches = true;
        let oneMatch = false;
        maybe = maybe === true || rule.maybe === true;
        // Execute all sub rules in sequence.
        if (rule.expect) {
            for (const next of rule.expect) {
                const localPos = this.pos;
                const result = this.expect(next);
                // If `rule.or` is set, then return success if any one
                // of the subrules match, else all subrules must match.
                if (result.success) {
                    results.push(result);
                    oneMatch = true;
                    if (rule.or)
                        break;
                }
                else {
                    allMatches = false;
                    if (!rule.or) {
                        this.pos = localPos;
                        break;
                    }
                }
            }
        }
        const gotOne = (rule.or && oneMatch) || allMatches;
        const success = gotOne || maybe === true;
        const numMatches = gotOne ? 1 : 0;
        if (maybe && !gotOne)
            this.pos = pos;
        if (success) {
            this.matchSuccess();
        }
        else {
            this.matchFail(pos);
        }
        return { success, results, numMatches };
    }
    // Try to match multiple (one or more) instances of the rule. If `maybe` is set,
    // then a failed match is also a success (but the position is reset).
    expectOneOrMore(rule, maybe = false) {
        const results = [];
        const pos = this.pos;
        let numMatches = 0;
        let more = true;
        do {
            const result = this.expectOne(rule);
            if (result.success && result.results) {
                numMatches++;
                results.push(result.results);
            }
            else {
                more = false;
            }
        } while (more);
        const success = numMatches > 0 || maybe === true;
        if (maybe && !(numMatches > 0))
            this.pos = pos;
        if (success) {
            this.matchSuccess();
        }
        else {
            this.matchFail(pos);
        }
        return { success, results, numMatches };
    }
    // Match zero or more instances of `rule`. Offloads to `expectOneOrMore`.
    expectZeroOrMore(rule) {
        return this.expectOneOrMore(rule, true);
    }
    // Execute the rule produced by the provided `rules` function. This
    // offloads to one of the above matchers and consolidates the results. It is also
    // responsible for executing any code triggered by the rule (in `rule.run`.)
    expect(ruleFunc) {
        L('Evaluating rule function:', ruleFunc);
        if (!ruleFunc) {
            throw new RuntimeError('Invalid rule function');
        }
        let result;
        // Get rule from Grammar class.
        // expect(...) handles both lexing & parsing:
        // - lexer rules produce tokens.
        // - parser rules produce expressions which may trigger code via the
        //   { run: () => ... } trigger functions in easyscore.ts.
        //   These functions build the VexFlow objects that are displayed on screen.
        const rule = ruleFunc.bind(this.grammar)();
        if (rule.token) {
            // A lexer rule has a `token` property.
            // Base case: parse the regex and throw an error if the
            // line doesn't match.
            result = this.matchToken(rule.token, rule.noSpace === true);
            if (result.success) {
                // Token match! Update position and throw away parsed portion
                // of string.
                this.pos += result.incrementPos;
            }
        }
        else if (rule.expect) {
            // A parser rule has an `expect` property.
            if (rule.oneOrMore) {
                result = this.expectOneOrMore(rule);
            }
            else if (rule.zeroOrMore) {
                result = this.expectZeroOrMore(rule);
            }
            else {
                result = this.expectOne(rule);
            }
        }
        else {
            L(rule);
            throw new RuntimeError('Bad grammar! No `token` or `expect` property ' + rule);
        }
        // If there's a trigger attached to this rule, then run it.
        // Make the matches accessible through `state.matches` in the
        // `run: (state) => ...` trigger.
        const matches = [];
        result.matches = matches;
        if (result.results) {
            result.results.forEach((r) => matches.push(flattenMatches(r)));
        }
        if (rule.run && result.success) {
            rule.run({ matches });
        }
        return result;
    }
}
Parser.DEBUG = false;
export { Parser };
