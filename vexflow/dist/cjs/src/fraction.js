// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Author: Joshua Koo / @zz85
// Author: @incompleteopus
import { RuntimeError } from './util';
/** Fraction represents a rational number. */
class Fraction {
    static get CATEGORY() {
        return "Fraction" /* Category.Fraction */;
    }
    /**
     * GCD: Greatest common divisor using the Euclidean algorithm.
     * Note: GCD(0, 0) => 0 and GCD(0, n) => n.
     */
    static GCD(a, b) {
        if (typeof a !== 'number' || Number.isNaN(a) || typeof b !== 'number' || Number.isNaN(b)) {
            throw new RuntimeError('BadArgument', `Invalid numbers: ${a}, ${b}`);
        }
        let t;
        while (b !== 0) {
            t = b;
            b = a % b;
            a = t;
        }
        return a;
    }
    /** LCM: Lowest common multiple. */
    static LCM(a, b) {
        return (a * b) / Fraction.GCD(a, b);
    }
    /** Lowest common multiple for more than two numbers. */
    static LCMM(args) {
        if (args.length === 0) {
            return 0;
        }
        else if (args.length === 1) {
            return args[0];
        }
        else if (args.length === 2) {
            return Fraction.LCM(args[0], args[1]);
        }
        else {
            // args.shift() removes the first number.
            // LCM the first number with the rest of the numbers.
            return Fraction.LCM(args.shift(), Fraction.LCMM(args));
        }
    }
    /** Set the numerator and denominator. */
    constructor(numerator, denominator) {
        this.numerator = 1;
        this.denominator = 1;
        this.set(numerator, denominator);
    }
    /** Set the numerator and denominator. */
    set(numerator = 1, denominator = 1) {
        this.numerator = numerator;
        this.denominator = denominator;
        return this;
    }
    /** Return the value of the fraction. */
    value() {
        return this.numerator / this.denominator;
    }
    /** Simplify numerator and denominator using GCD. */
    simplify() {
        let u = this.numerator;
        let d = this.denominator;
        const gcd = Fraction.GCD(u, d);
        u /= gcd;
        d /= gcd;
        if (d < 0) {
            d = -d;
            u = -u;
        }
        return this.set(u, d);
    }
    /** Add value of another fraction. */
    add(param1 = 0, param2 = 1) {
        const [otherNumerator, otherDenominator] = getNumeratorAndDenominator(param1, param2);
        const lcm = Fraction.LCM(this.denominator, otherDenominator);
        const a = lcm / this.denominator;
        const b = lcm / otherDenominator;
        const u = this.numerator * a + otherNumerator * b;
        return this.set(u, lcm);
    }
    /** Substract value of another fraction. */
    subtract(param1 = 0, param2 = 1) {
        const [otherNumerator, otherDenominator] = getNumeratorAndDenominator(param1, param2);
        const lcm = Fraction.LCM(this.denominator, otherDenominator);
        const a = lcm / this.denominator;
        const b = lcm / otherDenominator;
        const u = this.numerator * a - otherNumerator * b;
        return this.set(u, lcm);
    }
    /** Multiply by value of another fraction. */
    multiply(param1 = 1, param2 = 1) {
        const [otherNumerator, otherDenominator] = getNumeratorAndDenominator(param1, param2);
        return this.set(this.numerator * otherNumerator, this.denominator * otherDenominator);
    }
    /** Divide by value of another Fraction. */
    divide(param1 = 1, param2 = 1) {
        const [otherNumerator, otherDenominator] = getNumeratorAndDenominator(param1, param2);
        return this.set(this.numerator * otherDenominator, this.denominator * otherNumerator);
    }
    /** Simplify both sides and check if they are equal. */
    equals(compare) {
        const a = Fraction.__staticFractionA.copy(compare).simplify();
        const b = Fraction.__staticFractionB.copy(this).simplify();
        return a.numerator === b.numerator && a.denominator === b.denominator;
    }
    /** Greater than operator. */
    greaterThan(compare) {
        const a = Fraction.__staticFractionB.copy(this);
        a.subtract(compare);
        return a.numerator > 0;
    }
    /** Greater than or equals operator. */
    greaterThanEquals(compare) {
        const a = Fraction.__staticFractionB.copy(this);
        a.subtract(compare);
        return a.numerator >= 0;
    }
    /** Less than operator. */
    lessThan(compare) {
        return !this.greaterThanEquals(compare);
    }
    /** Less than or equals operator. */
    lessThanEquals(compare) {
        return !this.greaterThan(compare);
    }
    /** Return a new copy with current values. */
    clone() {
        return new Fraction(this.numerator, this.denominator);
    }
    /** Copy value of another fraction. */
    copy(other) {
        if (typeof other === 'number') {
            return this.set(other, 1);
        }
        else {
            return this.set(other.numerator, other.denominator);
        }
    }
    /** Return the integer component (eg. 5/2 => 2). */
    quotient() {
        return Math.floor(this.numerator / this.denominator);
    }
    /** Return the remainder component (eg. 5/2 => 1). */
    remainder() {
        return this.numerator % this.denominator;
    }
    /** Calculate absolute value. */
    makeAbs() {
        this.denominator = Math.abs(this.denominator);
        this.numerator = Math.abs(this.numerator);
        return this;
    }
    /** Return a raw string representation (eg. "5/2"). */
    toString() {
        return `${this.numerator}/${this.denominator}`;
    }
    /** Return a simplified string respresentation. */
    toSimplifiedString() {
        return Fraction.__staticFractionTmp.copy(this).simplify().toString();
    }
    /** Return string representation in mixed form. */
    toMixedString() {
        let s = '';
        const q = this.quotient();
        const f = Fraction.__staticFractionTmp.copy(this);
        if (q < 0) {
            f.makeAbs();
        }
        if (q !== 0) {
            s += q;
            if (f.numerator !== 0) {
                s += ` ${f.toSimplifiedString()}`;
            }
        }
        else if (f.numerator === 0) {
            s = '0';
        }
        else {
            s = f.toSimplifiedString();
        }
        return s;
    }
    /** Parse a fraction string. */
    parse(str) {
        const i = str.split('/');
        const n = parseInt(i[0], 10);
        const d = i[1] ? parseInt(i[1], 10) : 1;
        return this.set(n, d);
    }
}
// Cached objects for comparisons.
Fraction.__staticFractionA = new Fraction();
Fraction.__staticFractionB = new Fraction();
Fraction.__staticFractionTmp = new Fraction();
export { Fraction };
/** Helper function to extract the numerator and denominator from another fraction. */
function getNumeratorAndDenominator(n, d = 1) {
    if (typeof n === 'number') {
        // Both params are numbers, so we return them as [numerator, denominator].
        return [n, d];
    }
    else {
        // First param is a Fraction object. We ignore the second param.
        return [n.numerator, n.denominator];
    }
}
