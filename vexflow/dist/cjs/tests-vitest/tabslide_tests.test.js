// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// TabSlide Tests - Vitest Version
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { describe, test } from 'vitest';
import { Flow } from '../src/flow';
import { Formatter } from '../src/formatter';
import { Renderer } from '../src/renderer';
import { TabNote } from '../src/tabnote';
import { TabSlide } from '../src/tabslide';
import { TabStave } from '../src/tabstave';
import { Voice } from '../src/voice';
import { createAssert, expectMatchingScreenshot, FONT_STACKS, generateTestID } from './vitest_test_helpers';
// Helper function to create TabNote objects.
const tabNote = (noteStruct) => new TabNote(noteStruct);
describe('TabSlide', () => {
    // Helper function to run a test with multiple backends and font stacks
    function runTest(testName, testFunc, backends = [
        { backend: Renderer.Backends.CANVAS, fontStacks: ['Bravura'] },
        { backend: Renderer.Backends.SVG, fontStacks: ['Bravura', 'Gonville', 'Petaluma', 'Leland'] },
    ]) {
        return __awaiter(this, void 0, void 0, function* () {
            backends.forEach(({ backend, fontStacks }) => {
                fontStacks.forEach((fontStackName) => {
                    test(`${testName} - ${backend === Renderer.Backends.SVG ? 'SVG' : 'Canvas'} - ${fontStackName}`, () => __awaiter(this, void 0, void 0, function* () {
                        const elementId = generateTestID('tabslide_test');
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
    function tieNotes(notes, indices, stave, ctx) {
        const voice = new Voice(Flow.TIME4_4);
        voice.addTickables(notes);
        new Formatter().joinVoices([voice]).format([voice], 100);
        voice.draw(ctx, stave);
        const tie = new TabSlide({
            first_note: notes[0],
            last_note: notes[1],
            first_indices: indices,
            last_indices: indices,
        }, TabSlide.SLIDE_UP);
        tie.setContext(ctx);
        tie.draw();
    }
    runTest('Simple TabSlide', (options, contextBuilder) => __awaiter(void 0, void 0, void 0, function* () {
        const assert = createAssert();
        const context = contextBuilder(options.elementId, 350, 140);
        context.scale(0.9, 0.9);
        context.font = '10pt Arial';
        const stave = new TabStave(10, 10, 350).addTabGlyph().setContext(context).draw();
        tieNotes([
            tabNote({ positions: [{ str: 4, fret: 4 }], duration: 'h' }),
            tabNote({ positions: [{ str: 4, fret: 6 }], duration: 'h' }),
        ], [0], stave, context);
        yield expectMatchingScreenshot(options, 'tabslide_tests.test.ts');
        assert.ok(true, 'Simple Test');
    }));
    /**
     * The slideUp and slideDown tests use a builder function: TabSlide.createSlideUp | TabSlide.createSlideDown.
     */
    function multiTest(testName, buildTabSlide) {
        runTest(testName, (options, contextBuilder) => __awaiter(this, void 0, void 0, function* () {
            const assert = createAssert();
            const context = contextBuilder(options.elementId, 440, 140);
            context.scale(0.9, 0.9);
            context.font = '10pt Arial';
            const stave = new TabStave(10, 10, 440).addTabGlyph().setContext(context).draw();
            const notes = [
                tabNote({ positions: [{ str: 4, fret: 4 }], duration: '8' }),
                tabNote({ positions: [{ str: 4, fret: 4 }], duration: '8' }),
                tabNote({
                    positions: [
                        { str: 4, fret: 4 },
                        { str: 5, fret: 4 },
                    ],
                    duration: '8',
                }),
                tabNote({
                    positions: [
                        { str: 4, fret: 6 },
                        { str: 5, fret: 6 },
                    ],
                    duration: '8',
                }),
                tabNote({ positions: [{ str: 2, fret: 14 }], duration: '8' }),
                tabNote({ positions: [{ str: 2, fret: 16 }], duration: '8' }),
                tabNote({
                    positions: [
                        { str: 2, fret: 14 },
                        { str: 3, fret: 14 },
                    ],
                    duration: '8',
                }),
                tabNote({
                    positions: [
                        { str: 2, fret: 16 },
                        { str: 3, fret: 16 },
                    ],
                    duration: '8',
                }),
            ];
            const voice = new Voice(Flow.TIME4_4).addTickables(notes);
            new Formatter().joinVoices([voice]).format([voice], 300);
            voice.draw(context, stave);
            buildTabSlide({
                first_note: notes[0],
                last_note: notes[1],
                first_indices: [0],
                last_indices: [0],
            })
                .setContext(context)
                .draw();
            assert.ok(true, 'Single note');
            buildTabSlide({
                first_note: notes[2],
                last_note: notes[3],
                first_indices: [0, 1],
                last_indices: [0, 1],
            })
                .setContext(context)
                .draw();
            assert.ok(true, 'Chord');
            buildTabSlide({
                first_note: notes[4],
                last_note: notes[5],
                first_indices: [0],
                last_indices: [0],
            })
                .setContext(context)
                .draw();
            assert.ok(true, 'Single note high-fret');
            buildTabSlide({
                first_note: notes[6],
                last_note: notes[7],
                first_indices: [0, 1],
                last_indices: [0, 1],
            })
                .setContext(context)
                .draw();
            yield expectMatchingScreenshot(options, 'tabslide_tests.test.ts');
            assert.ok(true, 'Chord high-fret');
        }));
    }
    multiTest('Slide Up', TabSlide.createSlideUp);
    multiTest('Slide Down', TabSlide.createSlideDown);
});
