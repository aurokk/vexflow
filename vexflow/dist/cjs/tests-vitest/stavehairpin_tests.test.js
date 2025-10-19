// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
// Author: Raffaele Viglianti, 2012
//
// StaveHairpin Tests - Vitest Version
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
import { StaveHairpin } from '../src/stavehairpin';
import { createAssert, expectMatchingScreenshot, FONT_STACKS, generateTestID, makeFactory, } from './vitest_test_helpers';
/**
 * Helper function to draw a single hairpin (either crescendo or decrescendo).
 * @param type is StaveHairpin.type.CRESC or StaveHairpin.type.DECRESC.
 * @param position is Modifier.Position.ABOVE or Modifier.Position.BELOW.
 */
function drawHairpin(first_note, last_note, ctx, type, position, options) {
    const hairpin = new StaveHairpin({ first_note, last_note }, type);
    hairpin.setContext(ctx);
    hairpin.setPosition(position);
    if (options) {
        hairpin.setRenderOptions(options);
    }
    hairpin.draw();
}
describe('StaveHairpin', () => {
    // Helper function to run a test with multiple backends and font stacks
    function runTest(testName, testFunc, backends = [
        { backend: Renderer.Backends.CANVAS, fontStacks: ['Bravura'] },
        { backend: Renderer.Backends.SVG, fontStacks: ['Bravura', 'Gonville', 'Petaluma', 'Leland'] },
    ]) {
        return __awaiter(this, void 0, void 0, function* () {
            backends.forEach(({ backend, fontStacks }) => {
                fontStacks.forEach((fontStackName) => {
                    test(`${testName} - ${backend === Renderer.Backends.SVG ? 'SVG' : 'Canvas'} - ${fontStackName}`, () => __awaiter(this, void 0, void 0, function* () {
                        const elementId = generateTestID('stavehairpin_test');
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
    runTest('Simple StaveHairpin', (options, contextBuilder) => __awaiter(void 0, void 0, void 0, function* () {
        const assert = createAssert();
        const factory = makeFactory(options.backend, options.elementId, 450, 140, options);
        const ctx = factory.getContext();
        const stave = factory.Stave();
        const notes = [
            factory
                .StaveNote({ keys: ['c/4', 'e/4', 'a/4'], stem_direction: 1, duration: '4' })
                .addModifier(factory.Accidental({ type: 'b' }), 0)
                .addModifier(factory.Accidental({ type: '#' }), 1),
            factory.StaveNote({ keys: ['d/4'], stem_direction: 1, duration: '4' }),
            factory.StaveNote({ keys: ['e/4'], stem_direction: 1, duration: '4' }),
            factory.StaveNote({ keys: ['f/4'], stem_direction: 1, duration: '4' }),
        ];
        const voice = factory.Voice().addTickables(notes);
        factory.Formatter().joinVoices([voice]).formatToStave([voice], stave);
        factory.draw();
        drawHairpin(notes[0], notes[2], ctx, 1, 4);
        drawHairpin(notes[1], notes[3], ctx, 2, 3);
        yield expectMatchingScreenshot(options, 'stavehairpin_tests.test.ts');
        assert.ok(true, 'Simple Test');
    }));
    runTest('Horizontal Offset StaveHairpin', (options, contextBuilder) => __awaiter(void 0, void 0, void 0, function* () {
        const assert = createAssert();
        const factory = makeFactory(options.backend, options.elementId, 450, 140, options);
        const ctx = factory.getContext();
        const stave = factory.Stave();
        const notes = [
            factory
                .StaveNote({ keys: ['c/4', 'e/4', 'a/4'], stem_direction: 1, duration: '4' })
                .addModifier(factory.Accidental({ type: 'b' }), 0)
                .addModifier(factory.Accidental({ type: '#' }), 1),
            factory.StaveNote({ keys: ['d/4'], stem_direction: 1, duration: '4' }),
            factory.StaveNote({ keys: ['e/4'], stem_direction: 1, duration: '4' }),
            factory.StaveNote({ keys: ['f/4'], stem_direction: 1, duration: '4' }),
        ];
        const voice = factory.Voice().addTickables(notes);
        factory.Formatter().joinVoices([voice]).formatToStave([voice], stave);
        factory.draw();
        drawHairpin(notes[0], notes[2], ctx, 1, 3, {
            height: 10,
            // TODO: these three property names seem to be incorrect.
            // vo => should it be 'y_shift'?
            // left_ho => should it be 'left_shift_px'?
            // right_ho => should it be 'right_shift_px'?
            vo: 20,
            left_ho: 20,
            right_ho: -20, // right horizontal offset
        });
        drawHairpin(notes[3], notes[3], ctx, 2, 4, {
            height: 10,
            y_shift: 0,
            left_shift_px: 0,
            right_shift_px: 120, // right horizontal offset
        });
        yield expectMatchingScreenshot(options, 'stavehairpin_tests.test.ts');
        assert.ok(true, 'Horizontal Offset Test');
    }));
    runTest('Vertical Offset StaveHairpin', (options, contextBuilder) => __awaiter(void 0, void 0, void 0, function* () {
        const assert = createAssert();
        const factory = makeFactory(options.backend, options.elementId, 450, 140, options);
        const ctx = factory.getContext();
        const stave = factory.Stave();
        const notes = [
            factory
                .StaveNote({ keys: ['c/4', 'e/4', 'a/4'], stem_direction: 1, duration: '4' })
                .addModifier(factory.Accidental({ type: 'b' }), 0)
                .addModifier(factory.Accidental({ type: '#' }), 1),
            factory.StaveNote({ keys: ['d/4'], stem_direction: 1, duration: '4' }),
            factory.StaveNote({ keys: ['e/4'], stem_direction: 1, duration: '4' }),
            factory.StaveNote({ keys: ['f/4'], stem_direction: 1, duration: '4' }),
        ];
        const voice = factory.Voice().addTickables(notes);
        factory.Formatter().joinVoices([voice]).formatToStave([voice], stave);
        factory.draw();
        drawHairpin(notes[0], notes[2], ctx, 1, 4, {
            height: 10,
            y_shift: 0,
            left_shift_px: 0,
            right_shift_px: 0, // right horizontal offset
        });
        drawHairpin(notes[2], notes[3], ctx, 2, 4, {
            height: 10,
            y_shift: -15,
            left_shift_px: 2,
            right_shift_px: 0, // right horizontal offset
        });
        yield expectMatchingScreenshot(options, 'stavehairpin_tests.test.ts');
        assert.ok(true, 'Vertical Offset Test');
    }));
    runTest('Height StaveHairpin', (options, contextBuilder) => __awaiter(void 0, void 0, void 0, function* () {
        const assert = createAssert();
        const factory = makeFactory(options.backend, options.elementId, 450, 140, options);
        const ctx = factory.getContext();
        const stave = factory.Stave();
        const notes = [
            factory
                .StaveNote({ keys: ['c/4', 'e/4', 'a/4'], stem_direction: 1, duration: '4' })
                .addModifier(factory.Accidental({ type: 'b' }), 0)
                .addModifier(factory.Accidental({ type: '#' }), 1),
            factory.StaveNote({ keys: ['d/4'], stem_direction: 1, duration: '4' }),
            factory.StaveNote({ keys: ['e/4'], stem_direction: 1, duration: '4' }),
            factory.StaveNote({ keys: ['f/4'], stem_direction: 1, duration: '4' }),
        ];
        const voice = factory.Voice().addTickables(notes);
        factory.Formatter().joinVoices([voice]).formatToStave([voice], stave);
        factory.draw();
        drawHairpin(notes[0], notes[2], ctx, 1, 4, {
            height: 10,
            y_shift: 0,
            left_shift_px: 0,
            right_shift_px: 0, // right horizontal offset
        });
        drawHairpin(notes[2], notes[3], ctx, 2, 4, {
            height: 15,
            y_shift: 0,
            left_shift_px: 2,
            right_shift_px: 0, // right horizontal offset
        });
        yield expectMatchingScreenshot(options, 'stavehairpin_tests.test.ts');
        assert.ok(true, 'Height Test');
    }));
});
