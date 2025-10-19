// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// GlyphNote Tests - Vitest Version
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
import { ChordSymbol } from '../src/chordsymbol';
import { Flow } from '../src/flow';
import { Glyph } from '../src/glyph';
import { Registry } from '../src/registry';
import { Renderer } from '../src/renderer';
import { StaveConnector } from '../src/staveconnector';
import { createAssert, expectMatchingScreenshot, FONT_STACKS, generateTestID, makeFactory, } from './vitest_test_helpers';
describe('GlyphNote', () => {
    // Helper function to run a test with multiple backends and font stacks
    function runTest(testName, testFunc, backends = [
        { backend: Renderer.Backends.CANVAS, fontStacks: ['Bravura'] },
        { backend: Renderer.Backends.SVG, fontStacks: ['Bravura', 'Gonville', 'Petaluma', 'Leland'] },
    ]) {
        return __awaiter(this, void 0, void 0, function* () {
            backends.forEach(({ backend, fontStacks }) => {
                fontStacks.forEach((fontStackName) => {
                    test(`${testName} - ${backend === Renderer.Backends.SVG ? 'SVG' : 'Canvas'} - ${fontStackName}`, () => __awaiter(this, void 0, void 0, function* () {
                        const elementId = generateTestID('glyphnote_test');
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
    runTest('GlyphNote with ChordSymbols', (options, contextBuilder) => __awaiter(void 0, void 0, void 0, function* () {
        const assert = createAssert();
        Registry.enableDefaultRegistry(new Registry());
        const f = makeFactory(options.backend, options.elementId, 300, 200, options);
        const system = f.System({
            x: 50,
            width: 250,
            debugFormatter: false,
            noPadding: false,
            details: { alpha: undefined },
        });
        const score = f.EasyScore();
        const notes = [
            f.GlyphNote(new Glyph('repeatBarSlash', 40), { duration: 'q' }),
            f.GlyphNote(new Glyph('repeatBarSlash', 40), { duration: 'q' }),
            f.GlyphNote(new Glyph('repeatBarSlash', 40), { duration: 'q' }),
            f.GlyphNote(new Glyph('repeatBarSlash', 40), { duration: 'q' }),
        ];
        const chord1 = f
            .ChordSymbol({ reportWidth: false })
            .addText('F7')
            .setHorizontal('left')
            .addGlyphOrText('(#11b9)', { symbolModifier: ChordSymbol.symbolModifiers.SUPERSCRIPT });
        const chord2 = f
            .ChordSymbol()
            .addText('F7')
            .setHorizontal('left')
            .addGlyphOrText('#11', { symbolModifier: ChordSymbol.symbolModifiers.SUPERSCRIPT })
            .addGlyphOrText('b9', { symbolModifier: ChordSymbol.symbolModifiers.SUBSCRIPT });
        notes[0].addModifier(chord1, 0);
        notes[2].addModifier(chord2, 0);
        const voice = score.voice(notes);
        system.addStave({ voices: [voice], debugNoteMetrics: false });
        system.addConnector().setType(StaveConnector.type.BRACKET);
        f.draw();
        yield expectMatchingScreenshot(options, 'glyphnote_tests.test.ts');
        Registry.disableDefaultRegistry();
        assert.ok(true);
    }));
    runTest('GlyphNote Positioning', (options, contextBuilder) => __awaiter(void 0, void 0, void 0, function* () {
        const assert = createAssert();
        Registry.enableDefaultRegistry(new Registry());
        const f = makeFactory(options.backend, options.elementId, 300, 400, options);
        const system = f.System({
            x: 50,
            width: 250,
            debugFormatter: false,
            noPadding: false,
            details: { alpha: undefined },
        });
        const score = f.EasyScore();
        const newVoice = (notes) => score.voice(notes, { time: '1/4' });
        const newStave = (voice) => system.addStave({ voices: [voice], debugNoteMetrics: false });
        const voices = [
            [f.GlyphNote(new Glyph('repeat1Bar', 40), { duration: 'q' }, { line: 4 })],
            [f.GlyphNote(new Glyph('repeat2Bars', 40), { duration: 'q', align_center: true })],
            [
                f.GlyphNote(new Glyph('repeatBarSlash', 40), { duration: '16' }),
                f.GlyphNote(new Glyph('repeatBarSlash', 40), { duration: '16' }),
                f.GlyphNote(new Glyph('repeat4Bars', 40), { duration: '16' }),
                f.GlyphNote(new Glyph('repeatBarSlash', 40), { duration: '16' }),
            ],
        ];
        voices.map(newVoice).forEach(newStave);
        system.addConnector().setType(StaveConnector.type.BRACKET);
        f.draw();
        yield expectMatchingScreenshot(options, 'glyphnote_tests.test.ts');
        Registry.disableDefaultRegistry();
        assert.ok(true);
    }));
    runTest('GlyphNote No Stave Padding', (options, contextBuilder) => __awaiter(void 0, void 0, void 0, function* () {
        const assert = createAssert();
        Registry.enableDefaultRegistry(new Registry());
        const f = makeFactory(options.backend, options.elementId, 300, 400, options);
        const system = f.System({
            x: 50,
            width: 250,
            debugFormatter: true,
            noPadding: true,
            details: { alpha: undefined },
        });
        const score = f.EasyScore();
        const newVoice = (notes) => score.voice(notes, { time: '1/4' });
        const newStave = (voice) => system.addStave({ voices: [voice], debugNoteMetrics: true });
        const voices = [
            [f.GlyphNote(new Glyph('repeat1Bar', 40), { duration: 'q' }, { line: 4 })],
            [f.GlyphNote(new Glyph('repeat2Bars', 40), { duration: 'q', align_center: true })],
            [
                f.GlyphNote(new Glyph('repeatBarSlash', 40), { duration: '16' }),
                f.GlyphNote(new Glyph('repeatBarSlash', 40), { duration: '16' }),
                f.GlyphNote(new Glyph('repeat4Bars', 40), { duration: '16' }),
                f.GlyphNote(new Glyph('repeatBarSlash', 40), { duration: '16' }),
            ],
        ];
        voices.map(newVoice).forEach(newStave);
        system.addConnector().setType(StaveConnector.type.BRACKET);
        f.draw();
        yield expectMatchingScreenshot(options, 'glyphnote_tests.test.ts');
        Registry.disableDefaultRegistry();
        assert.ok(true);
    }));
    runTest('GlyphNote RepeatNote', (options, contextBuilder) => __awaiter(void 0, void 0, void 0, function* () {
        const assert = createAssert();
        Registry.enableDefaultRegistry(new Registry());
        const f = makeFactory(options.backend, options.elementId, 300, 500, options);
        const system = f.System({
            x: 50,
            width: 250,
            debugFormatter: false,
            noPadding: true,
            details: { alpha: undefined },
        });
        const score = f.EasyScore();
        const createVoice = (notes) => score.voice(notes, { time: '1/4' });
        const addStaveWithVoice = (voice) => system.addStave({ voices: [voice], debugNoteMetrics: false });
        const voices = [
            [f.RepeatNote('1')],
            [f.RepeatNote('2')],
            [f.RepeatNote('4')],
            [
                f.RepeatNote('slash', { duration: '16' }),
                f.RepeatNote('slash', { duration: '16' }),
                f.RepeatNote('slash', { duration: '16' }),
                f.RepeatNote('slash', { duration: '16' }),
            ],
        ];
        voices.map(createVoice).forEach(addStaveWithVoice);
        system.addConnector().setType(StaveConnector.type.BRACKET);
        f.draw();
        yield expectMatchingScreenshot(options, 'glyphnote_tests.test.ts');
        Registry.disableDefaultRegistry();
        assert.ok(true);
    }));
});
