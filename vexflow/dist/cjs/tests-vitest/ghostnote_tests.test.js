// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// GhostNote Tests - Vitest Version
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
import { Renderer } from '../src/renderer';
import { createAssert, expectMatchingScreenshot, FONT_STACKS, generateTestID, makeFactory, } from './vitest_test_helpers';
describe('GhostNote', () => {
    // Helper function to run a test with multiple backends and font stacks
    function runTest(testName, testFunc, backends = [
        { backend: Renderer.Backends.CANVAS, fontStacks: ['Bravura'] },
        { backend: Renderer.Backends.SVG, fontStacks: ['Bravura', 'Gonville', 'Petaluma', 'Leland'] },
    ]) {
        return __awaiter(this, void 0, void 0, function* () {
            backends.forEach(({ backend, fontStacks }) => {
                fontStacks.forEach((fontStackName) => {
                    test(`${testName} - ${backend === Renderer.Backends.SVG ? 'SVG' : 'Canvas'} - ${fontStackName}`, () => __awaiter(this, void 0, void 0, function* () {
                        const elementId = generateTestID('ghostnote_test');
                        // Create the DOM element before the test runs
                        const tagName = backend === Renderer.Backends.SVG ? 'div' : 'canvas';
                        const element = document.createElement(tagName);
                        element.id = elementId;
                        document.body.appendChild(element);
                        const assert = createAssert();
                        const options = {
                            elementId,
                            params: {},
                            backend,
                            testName,
                            fontStackName,
                        };
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
    /**
     * Helper function to set up the stave, easyscore, voice, and to format & draw.
     */
    function createTest(addItems, backend, elementId, options) {
        const assert = createAssert();
        const factory = makeFactory(backend, elementId, 550, undefined, options);
        const stave = factory.Stave();
        const score = factory.EasyScore();
        addItems(factory, score);
        const voices = factory.getVoices();
        factory.Formatter().joinVoices(voices).formatToStave(voices, stave);
        factory.draw();
        assert.ok(true, 'all pass');
    }
    runTest('GhostNote Basic', (options, contextBuilder) => __awaiter(void 0, void 0, void 0, function* () {
        createTest((f, score) => {
            // Top Voice
            const voiceTop = score.voice(score.notes('f#5/4, f5, db5, c5, c5/8, d5, fn5, e5, d5, c5', { stem: 'up' }), {
                time: '7/4',
            });
            const notesTop = voiceTop.getTickables();
            f.Beam({ notes: notesTop.slice(4, 8) });
            f.Beam({ notes: notesTop.slice(8, 10) });
            // Bottom Voice
            score.voice([
                f.GhostNote({ duration: '2' }),
                f.StaveNote({ keys: ['f/4'], stem_direction: -1, duration: '4' }),
                f.GhostNote({ duration: '4' }),
                f.StaveNote({ keys: ['e/4'], stem_direction: -1, duration: '4' }),
                f.GhostNote({ duration: '8' }),
                f
                    .StaveNote({ keys: ['d/4'], stem_direction: -1, duration: '8' })
                    .addModifier(f.Accidental({ type: '##' }), 0),
                f.StaveNote({ keys: ['c/4'], stem_direction: -1, duration: '8' }),
                f.StaveNote({ keys: ['c/4'], stem_direction: -1, duration: '8' }),
            ], { time: '7/4' });
        }, options.backend, options.elementId, options);
        yield expectMatchingScreenshot(options, 'ghostnote_tests.test.ts');
    }));
    runTest('GhostNote Dotted', (options, contextBuilder) => __awaiter(void 0, void 0, void 0, function* () {
        createTest((f, score) => {
            const voice1 = score.voice([
                f.GhostNote({ duration: '4d' }),
                f.StaveNote({ duration: '8', keys: ['f/5'], stem_direction: 1 }),
                f.StaveNote({ duration: '4', keys: ['d/5'], stem_direction: 1 }),
                f.StaveNote({ duration: '8', keys: ['c/5'], stem_direction: 1 }),
                f.StaveNote({ duration: '16', keys: ['c/5'], stem_direction: 1 }),
                f.StaveNote({ duration: '16', keys: ['d/5'], stem_direction: 1 }),
                f.GhostNote({ duration: '2dd' }),
                f.StaveNote({ duration: '8', keys: ['f/5'], stem_direction: 1 }),
            ], { time: '8/4' });
            const voice2 = score.voice([
                f.StaveNote({ duration: '4', keys: ['f/4'], stem_direction: -1 }),
                f.StaveNote({ duration: '8', keys: ['e/4'], stem_direction: -1 }),
                f.StaveNote({ duration: '8', keys: ['d/4'], stem_direction: -1 }),
                f.GhostNote({ duration: '4dd' }),
                f.StaveNote({ duration: '16', keys: ['c/4'], stem_direction: -1 }),
                f.StaveNote({ duration: '2', keys: ['c/4'], stem_direction: -1 }),
                f.StaveNote({ duration: '4', keys: ['d/4'], stem_direction: -1 }),
                f.StaveNote({ duration: '8', keys: ['f/4'], stem_direction: -1 }),
                f.StaveNote({ duration: '8', keys: ['e/4'], stem_direction: -1 }),
            ], { time: '8/4' });
            const notes1 = voice1.getTickables();
            const notes2 = voice2.getTickables();
            const addAccidental = (note, type) => note.addModifier(f.Accidental({ type }), 0);
            addAccidental(notes1[1], 'bb');
            addAccidental(notes1[4], '#');
            addAccidental(notes1[7], 'n');
            addAccidental(notes2[0], '#');
            addAccidental(notes2[4], 'b');
            addAccidental(notes2[5], '#');
            addAccidental(notes2[7], 'n');
            f.Beam({ notes: notes1.slice(3, 6) });
            f.Beam({ notes: notes2.slice(1, 3) });
            f.Beam({ notes: notes2.slice(7, 9) });
        }, options.backend, options.elementId, options);
        yield expectMatchingScreenshot(options, 'ghostnote_tests.test.ts');
    }));
});
