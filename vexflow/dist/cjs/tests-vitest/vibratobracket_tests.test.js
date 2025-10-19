// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
// Author: Balazs Forian-Szabo
//
// VibratoBracket Tests - Vitest Version
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
import { createAssert, expectMatchingScreenshot, FONT_STACKS, generateTestID, makeFactory } from './vitest_test_helpers';
describe('VibratoBracket', () => {
    // Helper function to run a test with multiple backends and font stacks
    function runTest(testName, noteGroup, setupVibratoBracket, backends = [
        { backend: Renderer.Backends.CANVAS, fontStacks: ['Bravura'] },
        { backend: Renderer.Backends.SVG, fontStacks: ['Bravura', 'Gonville', 'Petaluma', 'Leland'] },
    ]) {
        return __awaiter(this, void 0, void 0, function* () {
            backends.forEach(({ backend, fontStacks }) => {
                fontStacks.forEach((fontStackName) => {
                    test(`${testName} - ${backend === Renderer.Backends.SVG ? 'SVG' : 'Canvas'} - ${fontStackName}`, () => __awaiter(this, void 0, void 0, function* () {
                        const elementId = generateTestID('vibratobracket_test');
                        // Create the DOM element before the test runs
                        const tagName = backend === Renderer.Backends.SVG ? 'div' : 'canvas';
                        const element = document.createElement(tagName);
                        element.id = elementId;
                        document.body.appendChild(element);
                        // Set font stack
                        const originalFontNames = Flow.getMusicFont();
                        Flow.setMusicFont(...FONT_STACKS[fontStackName]);
                        try {
                            const assert = createAssert();
                            const options = {
                                elementId,
                                params: {},
                                backend,
                                testName,
                                fontStackName,
                            };
                            const factory = makeFactory(backend, elementId, 650, 200, options);
                            const stave = factory.Stave();
                            const score = factory.EasyScore();
                            const voice = score.voice(score.notes(noteGroup));
                            setupVibratoBracket(factory, voice.getTickables());
                            factory.Formatter().joinVoices([voice]).formatToStave([voice], stave);
                            factory.draw();
                            yield expectMatchingScreenshot(options, 'vibratobracket_tests.test.ts');
                            assert.ok(true);
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
    runTest('Simple VibratoBracket', 'c4/4, c4, c4, c4', (factory, notes) => {
        factory.VibratoBracket({
            from: notes[0],
            to: notes[3],
            options: { line: 2 },
        });
    });
    runTest('Harsh VibratoBracket Without End Note', 'c4/4, c4, c4, c4', (factory, notes) => {
        factory.VibratoBracket({
            from: notes[2],
            to: null,
            options: { line: 2, harsh: true },
        });
    });
    runTest('Harsh VibratoBracket Without Start Note', 'c4/4, c4, c4, c4', (factory, notes) => {
        factory.VibratoBracket({
            from: null,
            to: notes[2],
            options: { line: 2, harsh: true },
        });
    });
});
