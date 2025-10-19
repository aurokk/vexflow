// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Voice Tests - Vitest Version
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
import { Voice } from '../src/voice';
import { MockTickable } from './mocks';
import { createAssert, FONT_STACKS, generateTestID } from './vitest_test_helpers';
const BEAT = (1 * Flow.RESOLUTION) / 4;
// Helper function to create a tickable with a preset number of ticks.
const createTickable = () => new MockTickable().setTicks(BEAT);
describe('Voice', () => {
    // Helper function to run a rendering test with multiple backends and font stacks
    function runTest(testName, testFunc, backends = [
        { backend: Renderer.Backends.CANVAS, fontStacks: ['Bravura'] },
        { backend: Renderer.Backends.SVG, fontStacks: ['Bravura', 'Gonville', 'Petaluma', 'Leland'] },
    ]) {
        return __awaiter(this, void 0, void 0, function* () {
            backends.forEach(({ backend, fontStacks }) => {
                fontStacks.forEach((fontStackName) => {
                    test(`${testName} - ${backend === Renderer.Backends.SVG ? 'SVG' : 'Canvas'} - ${fontStackName}`, () => __awaiter(this, void 0, void 0, function* () {
                        const elementId = generateTestID('voice_test');
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
    test('Strict Test', () => {
        const assert = createAssert();
        const tickables = [createTickable(), createTickable(), createTickable()];
        const voice = new Voice(Flow.TIME4_4);
        assert.equal(voice.getTotalTicks().value(), BEAT * 4, '4/4 Voice has 4 beats');
        assert.equal(voice.getTicksUsed().value(), BEAT * 0, 'No beats in voice');
        voice.addTickables(tickables);
        assert.equal(voice.getTicksUsed().value(), BEAT * 3, 'Three beats in voice');
        voice.addTickable(createTickable());
        assert.equal(voice.getTicksUsed().value(), BEAT * 4, 'Four beats in voice');
        assert.equal(voice.isComplete(), true, 'Voice is complete');
        const numeratorBeforeException = voice.getTicksUsed().numerator;
        assert.throws(() => voice.addTickable(createTickable()), /BadArgument/, '"Too many ticks" exception');
        // Verify that adding too many ticks does not affect the `ticksUsed` property of the voice.
        // See voice.ts: this.ticksUsed.subtract(ticks);
        assert.equal(voice.getTicksUsed().numerator, numeratorBeforeException, 'Revert `ticksUsed` after a "Too many ticks" exception');
        assert.equal(voice.getSmallestTickCount().value(), BEAT, 'Smallest tick count is BEAT');
    });
    test('Ignore Test', () => {
        const assert = createAssert();
        const tickables = [
            createTickable(),
            createTickable(),
            createTickable().setIgnoreTicks(true),
            createTickable(),
            createTickable().setIgnoreTicks(true),
            createTickable(),
        ];
        const voice = new Voice(Flow.TIME4_4);
        voice.addTickables(tickables);
        assert.ok(true, 'all pass');
    });
});
