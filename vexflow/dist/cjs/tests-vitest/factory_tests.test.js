// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Factory Tests - Vitest Version
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
import { Factory } from '../src/factory';
import { Flow } from '../src/flow';
import { Renderer } from '../src/renderer';
import { Barline } from '../src/stavebarline';
import { createAssert, expectMatchingScreenshot, FONT_STACKS, generateTestID, makeFactory } from './vitest_test_helpers';
describe('Factory', () => {
    // Helper function to run a test with multiple backends and font stacks
    function runTest(testName, testFunc, backends = [
        { backend: Renderer.Backends.CANVAS, fontStacks: ['Bravura'] },
        { backend: Renderer.Backends.SVG, fontStacks: ['Bravura', 'Gonville', 'Petaluma', 'Leland'] },
    ]) {
        return __awaiter(this, void 0, void 0, function* () {
            backends.forEach(({ backend, fontStacks }) => {
                fontStacks.forEach((fontStackName) => {
                    test(`${testName} - ${backend === Renderer.Backends.SVG ? 'SVG' : 'Canvas'} - ${fontStackName}`, () => __awaiter(this, void 0, void 0, function* () {
                        const elementId = generateTestID('factory_test');
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
                            yield testFunc(options);
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
    test('Defaults', () => {
        const assert = createAssert();
        // Throws RuntimeError: 'HTML DOM element not set in Factory'
        assert.throws(() => new Factory({ renderer: { elementId: '', width: 700, height: 500 } }), /renderer\.elementId not set/);
        const factory = new Factory({
            renderer: { elementId: null, width: 700, height: 500 },
        });
        // eslint-disable-next-line
        // @ts-ignore access a protected member for testing purposes.
        const factoryOptions = factory.options;
        assert.equal(factoryOptions.renderer.width, 700);
        assert.equal(factoryOptions.renderer.height, 500);
        assert.equal(factoryOptions.renderer.elementId, null);
        assert.equal(factoryOptions.stave.space, 10);
    });
    runTest('Draw', (options) => __awaiter(void 0, void 0, void 0, function* () {
        const assert = createAssert();
        const f = Factory.newFromElementId(options.elementId);
        f.Stave().setClef('treble');
        f.draw();
        yield expectMatchingScreenshot(options, 'factory_tests.test.ts');
        assert.ok(true);
    }));
    runTest('Draw Tab (repeat barlines must be aligned)', (options) => __awaiter(void 0, void 0, void 0, function* () {
        const assert = createAssert();
        const factory = makeFactory(options.backend, options.elementId, 500, 400, options);
        const system = factory.System({ width: 500 });
        const stave = factory.Stave().setClef('treble').setKeySignature('C#').setBegBarType(Barline.type.REPEAT_BEGIN);
        const voices = [factory.Voice().addTickables([factory.GhostNote({ duration: 'w' })])];
        system.addStave({ stave, voices });
        const tabStave = factory.TabStave().setClef('tab').setBegBarType(Barline.type.REPEAT_BEGIN);
        const tabVoices = [factory.Voice().addTickables([factory.GhostNote({ duration: 'w' })])];
        system.addStave({ stave: tabStave, voices: tabVoices });
        factory.draw();
        yield expectMatchingScreenshot(options, 'factory_tests.test.ts');
        assert.equal(stave.getModifiers()[0].getX(), tabStave.getModifiers()[0].getX());
    }));
});
