// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// PedalMarking Tests - Vitest Version
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
function createTest(makePedal, options, contextBuilder) {
    return __awaiter(this, void 0, void 0, function* () {
        const assert = createAssert();
        const f = makeFactory(options.backend, options.elementId, 550, 200, options);
        const score = f.EasyScore();
        const stave0 = f.Stave({ width: 250 }).addClef('treble');
        const voice0 = score.voice(score.notes('b4/4, b4, b4, b4[stem="down"]', { stem: 'up' }));
        f.Formatter().joinVoices([voice0]).formatToStave([voice0], stave0);
        const stave1 = f.Stave({ width: 260, x: 250 });
        const voice1 = score.voice(score.notes('c4/4, c4, c4, c4', { stem: 'up' }));
        f.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);
        makePedal(f, voice0.getTickables(), voice1.getTickables());
        f.draw();
        yield expectMatchingScreenshot(options, 'pedalmarking_tests.test.ts');
        assert.ok(true, 'Must render');
    });
}
function withSimplePedal(style) {
    return (factory, notes0, notes1) => factory.PedalMarking({
        notes: [notes0[0], notes0[2], notes0[3], notes1[3]],
        options: { style },
    });
}
function withReleaseAndDepressedPedal(style) {
    return (factory, notes0, notes1) => factory.PedalMarking({
        notes: [notes0[0], notes0[3], notes0[3], notes1[1], notes1[1], notes1[3]],
        options: { style },
    });
}
describe('PedalMarking', () => {
    // Helper function to run a test with multiple backends and font stacks
    function runTest(testName, makePedal, backends = [
        { backend: Renderer.Backends.CANVAS, fontStacks: ['Bravura'] },
        { backend: Renderer.Backends.SVG, fontStacks: ['Bravura', 'Gonville', 'Petaluma', 'Leland'] },
    ]) {
        return __awaiter(this, void 0, void 0, function* () {
            backends.forEach(({ backend, fontStacks }) => {
                fontStacks.forEach((fontStackName) => {
                    test(`${testName} - ${backend === Renderer.Backends.SVG ? 'SVG' : 'Canvas'} - ${fontStackName}`, () => __awaiter(this, void 0, void 0, function* () {
                        const elementId = generateTestID('pedalmarking_test');
                        // Create the DOM element before the test runs
                        const tagName = backend === Renderer.Backends.SVG ? 'div' : 'canvas';
                        const element = document.createElement(tagName);
                        element.id = elementId;
                        document.body.appendChild(element);
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
                            yield createTest(makePedal, options, contextBuilder);
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
    runTest('Simple Pedal 1', withSimplePedal('text'));
    runTest('Simple Pedal 2', withSimplePedal('bracket'));
    runTest('Simple Pedal 3', withSimplePedal('mixed'));
    runTest('Release and Depress on Same Note 1', withReleaseAndDepressedPedal('bracket'));
    runTest('Release and Depress on Same Note 2', withReleaseAndDepressedPedal('mixed'));
    runTest('Custom Text 1', (factory, notes0, notes1) => {
        const pedal = factory.PedalMarking({
            notes: [notes0[0], notes1[3]],
            options: { style: 'text' },
        });
        pedal.setCustomText('una corda', 'tre corda');
        return pedal;
    });
    runTest('Custom Text 2', (factory, notes0, notes1) => {
        const pedal = factory.PedalMarking({
            notes: [notes0[0], notes1[3]],
            options: { style: 'mixed' },
        });
        pedal.setCustomText('Sost. Ped.');
        return pedal;
    });
});
