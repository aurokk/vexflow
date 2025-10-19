// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Vibrato Tests - Vitest Version
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
import { Bend } from '../src/bend';
import { Renderer } from '../src/renderer';
import { Flow } from '../src/flow';
import { Font } from '../src/font';
import { Formatter } from '../src/formatter';
import { TabNote } from '../src/tabnote';
import { TabStave } from '../src/tabstave';
import { Vibrato } from '../src/vibrato';
import { createAssert, expectMatchingScreenshot, FONT_STACKS, generateTestID } from './vitest_test_helpers';
// Helper function to create TabNote objects.
const tabNote = (noteStruct) => new TabNote(noteStruct);
describe('Vibrato', () => {
    // Helper function to run a test with multiple backends and font stacks
    function runTest(testName, testFunc, backends = [
        { backend: Renderer.Backends.CANVAS, fontStacks: ['Bravura'] },
        { backend: Renderer.Backends.SVG, fontStacks: ['Bravura', 'Gonville', 'Petaluma', 'Leland'] },
    ]) {
        return __awaiter(this, void 0, void 0, function* () {
            backends.forEach(({ backend, fontStacks }) => {
                fontStacks.forEach((fontStackName) => {
                    test(`${testName} - ${backend === Renderer.Backends.SVG ? 'SVG' : 'Canvas'} - ${fontStackName}`, () => __awaiter(this, void 0, void 0, function* () {
                        const elementId = generateTestID('vibrato_test');
                        // Create the DOM element before the test runs
                        const tagName = backend === Renderer.Backends.SVG ? 'div' : 'canvas';
                        const element = document.createElement(tagName);
                        element.id = elementId;
                        document.body.appendChild(element);
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
    runTest('Simple Vibrato', (options, contextBuilder) => __awaiter(void 0, void 0, void 0, function* () {
        const assert = createAssert();
        const ctx = contextBuilder(options.elementId, 500, 240);
        ctx.scale(1.5, 1.5);
        ctx.font = '10pt Arial';
        const stave = new TabStave(10, 10, 450).addTabGlyph().setContext(ctx).draw();
        const notes = [
            tabNote({
                positions: [
                    { str: 2, fret: 10 },
                    { str: 4, fret: 9 },
                ],
                duration: 'h',
            }).addModifier(new Vibrato(), 0),
            tabNote({
                positions: [{ str: 2, fret: 10 }],
                duration: 'h',
            }).addModifier(new Vibrato(), 0),
        ];
        Formatter.FormatAndDraw(ctx, stave, notes);
        yield expectMatchingScreenshot(options, 'vibrato_tests.test.ts');
        assert.ok(true, 'Simple Vibrato');
    }));
    runTest('Harsh Vibrato', (options, contextBuilder) => __awaiter(void 0, void 0, void 0, function* () {
        const assert = createAssert();
        const ctx = contextBuilder(options.elementId, 500, 240);
        ctx.scale(1.5, 1.5);
        ctx.font = '10pt Arial';
        const stave = new TabStave(10, 10, 450).addTabGlyph().setContext(ctx).draw();
        const notes = [
            tabNote({
                positions: [
                    { str: 2, fret: 10 },
                    { str: 4, fret: 9 },
                ],
                duration: 'h',
            }).addModifier(new Vibrato().setHarsh(true), 0),
            tabNote({
                positions: [{ str: 2, fret: 10 }],
                duration: 'h',
            }).addModifier(new Vibrato().setHarsh(true), 0),
        ];
        Formatter.FormatAndDraw(ctx, stave, notes);
        yield expectMatchingScreenshot(options, 'vibrato_tests.test.ts');
        assert.ok(true, 'Harsh Vibrato');
    }));
    runTest('Vibrato with Bend', (options, contextBuilder) => __awaiter(void 0, void 0, void 0, function* () {
        const assert = createAssert();
        const ctx = contextBuilder(options.elementId, 500, 240);
        ctx.scale(1.3, 1.3);
        ctx.setFont(Font.SANS_SERIF, 10);
        const stave = new TabStave(10, 10, 450).addTabGlyph().setContext(ctx).draw();
        const notes = [
            tabNote({
                positions: [
                    { str: 2, fret: 9 },
                    { str: 3, fret: 9 },
                ],
                duration: 'q',
            })
                .addModifier(new Bend('1/2', true), 0)
                .addModifier(new Bend('1/2', true), 1)
                .addModifier(new Vibrato(), 0),
            tabNote({
                positions: [{ str: 2, fret: 10 }],
                duration: 'q',
            })
                .addModifier(new Bend('Full', false), 0)
                .addModifier(new Vibrato().setVibratoWidth(60), 0),
            tabNote({
                positions: [{ str: 2, fret: 10 }],
                duration: 'h',
            }).addModifier(new Vibrato().setVibratoWidth(120).setHarsh(true), 0),
        ];
        Formatter.FormatAndDraw(ctx, stave, notes);
        yield expectMatchingScreenshot(options, 'vibrato_tests.test.ts');
        assert.ok(true, 'Vibrato with Bend');
    }));
});
