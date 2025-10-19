// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
// Author: Mike Corrigan 2012 <corrigan@gmail.com>
//
// Percussion Tests - Vitest Version
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Dot, Font, FontStyle, FontWeight, Renderer, Stave, StaveNote, TickContext, Tremolo, } from '../src/index';
import { describe, test } from 'vitest';
import { Flow } from '../src/flow';
import { createAssert, expectMatchingScreenshot, FONT_STACKS, generateTestID, makeFactory } from './vitest_test_helpers';
/**
 * Helper function used by the drawNotes() test case below.
 */
function showNote(struct, stave, ctx, x) {
    const staveNote = new StaveNote(struct).setStave(stave);
    new TickContext().addTickable(staveNote).preFormat().setX(x);
    staveNote.setContext(ctx).draw();
    return staveNote;
}
/**
 * Helper function for the seven test cases below.
 * Adds a percussion clef (two short vertical bars, like a pause sign) to the stave.
 */
function createSingleMeasureTest(setup, options, contextBuilder) {
    return __awaiter(this, void 0, void 0, function* () {
        const assert = createAssert();
        const f = makeFactory(options.backend, options.elementId, 500, 140, options);
        const stave = f.Stave().addClef('percussion').setTimeSignature('4/4');
        setup(f);
        f.Formatter().joinVoices(f.getVoices()).formatToStave(f.getVoices(), stave);
        f.draw();
        yield expectMatchingScreenshot(options, 'percussion_tests.test.ts');
        assert.ok(true);
    });
}
describe('Percussion', () => {
    // Helper function to run a test with multiple backends and font stacks
    function runTest(testName, testFunc, backends = [
        { backend: Renderer.Backends.CANVAS, fontStacks: ['Bravura'] },
        { backend: Renderer.Backends.SVG, fontStacks: ['Bravura', 'Gonville', 'Petaluma', 'Leland'] },
    ]) {
        return __awaiter(this, void 0, void 0, function* () {
            backends.forEach(({ backend, fontStacks }) => {
                fontStacks.forEach((fontStackName) => {
                    test(`${testName} - ${backend === Renderer.Backends.SVG ? 'SVG' : 'Canvas'} - ${fontStackName}`, () => __awaiter(this, void 0, void 0, function* () {
                        const elementId = generateTestID('percussion_test');
                        // Create the DOM element before the test runs
                        const tagName = backend === Renderer.Backends.SVG ? 'div' : 'canvas';
                        const element = document.createElement(tagName);
                        element.id = elementId;
                        document.body.appendChild(element);
                        const assert = createAssert();
                        const options = { elementId, params: {}, backend, testName, fontStackName };
                        // Set font stack
                        const originalFontNames = Flow.getMusicFont();
                        Flow.setMusicFont(...FONT_STACKS[fontStackName]);
                        try {
                            const contextBuilder = backend === Renderer.Backends.SVG ? Renderer.getSVGContext : Renderer.getCanvasContext;
                            yield testFunc(options, contextBuilder);
                        }
                        finally {
                            // Restore original font
                            Flow.setMusicFont(...originalFontNames);
                            // Don't remove the element so we can see rendered output
                            // element.remove();
                        }
                    }));
                });
            });
        });
    }
    runTest('Percussion Clef', (options, contextBuilder) => __awaiter(void 0, void 0, void 0, function* () {
        const assert = createAssert();
        options.width = 400;
        options.height = 120;
        const ctx = contextBuilder(options.elementId, 400, 120);
        new Stave(10, 10, 300).addClef('percussion').setContext(ctx).draw();
        yield expectMatchingScreenshot(options, 'percussion_tests.test.ts');
        assert.ok(true);
    }));
    runTest('Percussion Notes', (options, contextBuilder) => __awaiter(void 0, void 0, void 0, function* () {
        const assert = createAssert();
        const notes = [
            { keys: ['g/5/d0'], duration: '4' },
            { keys: ['g/5/d1'], duration: '4' },
            { keys: ['g/5/d2'], duration: '4' },
            { keys: ['g/5/d3'], duration: '4' },
            { keys: ['x/'], duration: '1' },
            { keys: ['g/5/t0'], duration: '1' },
            { keys: ['g/5/t1'], duration: '4' },
            { keys: ['g/5/t2'], duration: '4' },
            { keys: ['g/5/t3'], duration: '4' },
            { keys: ['x/'], duration: '1' },
            { keys: ['g/5/x0'], duration: '1' },
            { keys: ['g/5/x1'], duration: '4' },
            { keys: ['g/5/x2'], duration: '4' },
            { keys: ['g/5/x3'], duration: '4' },
        ];
        options.width = notes.length * 25 + 100;
        options.height = 240;
        const ctx = contextBuilder(options.elementId, notes.length * 25 + 100, 240);
        // Draw two staves, one with up-stems and one with down-stems.
        for (let h = 0; h < 2; ++h) {
            const stave = new Stave(10, 10 + h * 120, notes.length * 25 + 75).addClef('percussion').setContext(ctx).draw();
            for (let i = 0; i < notes.length; ++i) {
                const note = notes[i];
                note.stem_direction = h === 0 ? -1 : 1;
                const staveNote = showNote(note, stave, ctx, (i + 1) * 25);
                assert.ok(staveNote.getX() > 0, 'Note ' + i + ' has X value');
                assert.ok(staveNote.getYs().length > 0, 'Note ' + i + ' has Y values');
            }
        }
        yield expectMatchingScreenshot(options, 'percussion_tests.test.ts');
    }));
    runTest('Percussion Basic0', (options, contextBuilder) => __awaiter(void 0, void 0, void 0, function* () {
        yield createSingleMeasureTest((f) => {
            const voice0 = f
                .Voice()
                .addTickables([
                f.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
                f.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
                f.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
                f.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
                f.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
                f.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
                f.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
                f.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
            ]);
            const voice1 = f
                .Voice()
                .addTickables([
                f.StaveNote({ keys: ['f/4'], duration: '8', stem_direction: -1 }),
                f.StaveNote({ keys: ['f/4'], duration: '8', stem_direction: -1 }),
                f.StaveNote({ keys: ['d/4/x2', 'c/5'], duration: '4', stem_direction: -1 }),
                f.StaveNote({ keys: ['f/4'], duration: '8', stem_direction: -1 }),
                f.StaveNote({ keys: ['f/4'], duration: '8', stem_direction: -1 }),
                f.StaveNote({ keys: ['d/4/x2', 'c/5'], duration: '4', stem_direction: -1 }),
            ]);
            f.Beam({ notes: voice0.getTickables() });
            f.Beam({ notes: voice1.getTickables().slice(0, 2) });
            f.Beam({ notes: voice1.getTickables().slice(3, 5) });
        }, options, contextBuilder);
    }));
    runTest('Percussion Basic1', (options, contextBuilder) => __awaiter(void 0, void 0, void 0, function* () {
        yield createSingleMeasureTest((f) => {
            f.Voice().addTickables([
                f.StaveNote({ keys: ['f/5/x2'], duration: '4' }),
                f.StaveNote({ keys: ['f/5/x2'], duration: '4' }),
                f.StaveNote({ keys: ['f/5/x2'], duration: '4' }),
                f.StaveNote({ keys: ['f/5/x2'], duration: '4' }),
            ]);
            f.Voice().addTickables([
                f.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: -1 }),
                f.StaveNote({ keys: ['d/4/x2', 'c/5'], duration: '4', stem_direction: -1 }),
                f.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: -1 }),
                f.StaveNote({ keys: ['d/4/x2', 'c/5'], duration: '4', stem_direction: -1 }),
            ]);
        }, options, contextBuilder);
    }));
    runTest('Percussion Basic2', (options, contextBuilder) => __awaiter(void 0, void 0, void 0, function* () {
        yield createSingleMeasureTest((f) => {
            const voice0 = f
                .Voice()
                .addTickables([
                f.StaveNote({ keys: ['a/5/x3'], duration: '8' }),
                f.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
                f.StaveNote({ keys: ['g/5'], duration: '8' }),
                f.StaveNote({ keys: ['g/4/n', 'g/5/x2'], duration: '8' }),
                f.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
                f.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
                f.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
                f.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
            ]);
            f.Beam({ notes: voice0.getTickables().slice(1, 8) });
            const notes1 = [
                f.StaveNote({ keys: ['f/4'], duration: '8', stem_direction: -1 }),
                f.StaveNote({ keys: ['f/4'], duration: '8', stem_direction: -1 }),
                f.StaveNote({ keys: ['d/4/x2', 'c/5'], duration: '4', stem_direction: -1 }),
                f.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: -1 }),
                f.StaveNote({ keys: ['d/4/x2', 'c/5'], duration: '8d', stem_direction: -1 }),
                f.StaveNote({ keys: ['c/5'], duration: '16', stem_direction: -1 }),
            ];
            Dot.buildAndAttach([notes1[4]], { all: true });
            const voice1 = f.Voice().addTickables(notes1);
            f.Beam({ notes: voice1.getTickables().slice(0, 2) });
            f.Beam({ notes: voice1.getTickables().slice(4, 6) });
        }, options, contextBuilder);
    }));
    runTest('Percussion Snare0', (options, contextBuilder) => __awaiter(void 0, void 0, void 0, function* () {
        yield createSingleMeasureTest((f) => {
            const font = {
                family: Font.SERIF,
                size: 14,
                weight: FontWeight.BOLD,
                style: FontStyle.ITALIC,
            };
            f.Voice().addTickables([
                f
                    .StaveNote({ keys: ['c/5'], duration: '4', stem_direction: -1 })
                    .addModifier(f.Articulation({ type: 'a>' }), 0)
                    .addModifier(f.Annotation({ text: 'L', font }), 0),
                f
                    .StaveNote({ keys: ['c/5'], duration: '4', stem_direction: -1 })
                    .addModifier(f.Annotation({ text: 'R', font }), 0),
                f
                    .StaveNote({ keys: ['c/5'], duration: '4', stem_direction: -1 })
                    .addModifier(f.Annotation({ text: 'L', font }), 0),
                f
                    .StaveNote({ keys: ['c/5'], duration: '4', stem_direction: -1 })
                    .addModifier(f.Annotation({ text: 'L', font }), 0),
            ]);
        }, options, contextBuilder);
    }));
    runTest('Percussion Snare1', (options, contextBuilder) => __awaiter(void 0, void 0, void 0, function* () {
        yield createSingleMeasureTest((f) => {
            f.Voice().addTickables([
                f
                    .StaveNote({ keys: ['g/5/x2'], duration: '4', stem_direction: -1 })
                    .addModifier(f.Articulation({ type: 'ah' }), 0),
                f.StaveNote({ keys: ['g/5/x2'], duration: '4', stem_direction: -1 }),
                f
                    .StaveNote({ keys: ['g/5/x2'], duration: '4', stem_direction: -1 })
                    .addModifier(f.Articulation({ type: 'ah' }), 0),
                f
                    .StaveNote({ keys: ['a/5/x3'], duration: '4', stem_direction: -1 })
                    .addModifier(f.Articulation({ type: 'a,' }), 0),
            ]);
        }, options, contextBuilder);
    }));
    runTest('Percussion Snare2', (options, contextBuilder) => __awaiter(void 0, void 0, void 0, function* () {
        yield createSingleMeasureTest((f) => {
            f.Voice().addTickables([
                f.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: -1 }).addModifier(new Tremolo(1), 0),
                f.GraceNote({ keys: ['c/5'], duration: '4', stem_direction: -1 }).addModifier(new Tremolo(1), 0),
                f.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: -1 }).addModifier(new Tremolo(3), 0),
                f.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: -1 }).addModifier(new Tremolo(4), 0),
            ]);
        }, options, contextBuilder);
    }));
    runTest('Percussion Snare3', (options, contextBuilder) => __awaiter(void 0, void 0, void 0, function* () {
        yield createSingleMeasureTest((factory) => {
            factory
                .Voice()
                .addTickables([
                factory.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: 1 }).addModifier(new Tremolo(2), 0),
                factory.GraceNote({ keys: ['c/5'], duration: '4', stem_direction: 1 }).addModifier(new Tremolo(2), 0),
                factory.GraceNote({ keys: ['c/5'], duration: '4', stem_direction: 1 }).addModifier(new Tremolo(3), 0),
                factory.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: 1 }).addModifier(new Tremolo(4), 0),
            ]);
        }, options, contextBuilder);
    }));
});
