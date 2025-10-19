// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author: Ron B. Yeh
// MIT License
//
// Renderer Tests - Vitest Version
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { CanvasContext, Factory, Flow, Formatter, isHTMLCanvas, Renderer, RuntimeError, Stave, StaveNote, SVGContext, } from '../src/index';
import { describe, test } from 'vitest';
import { createAssert, expectMatchingScreenshot, FONT_STACKS, generateTestID } from './vitest_test_helpers';
const STAVE_WIDTH = 700;
const STAVE_HEIGHT = 100;
const STAVE_RIGHT_MARGIN = 10;
const USE_RENDERER = { useRendererAPI: true };
const USE_FACTORY = { useRendererAPI: false };
/**
 * Helper function to add three notes to a stave.
 */
function drawStave(stave, context) {
    stave.addClef('bass').addTimeSignature('3/4').draw();
    Formatter.FormatAndDraw(context, stave, [
        new StaveNote({ keys: ['C/4'], duration: '4' }),
        new StaveNote({ keys: ['E/4'], duration: '4' }),
        new StaveNote({ keys: ['G/4'], duration: '4' }),
    ]);
}
function useRendererAPI(e, backend) {
    const renderer = new Renderer(e, backend);
    renderer.resize(STAVE_WIDTH, STAVE_HEIGHT);
    const context = renderer.getContext();
    drawStave(new Stave(0, 0, STAVE_WIDTH - STAVE_RIGHT_MARGIN).setContext(context), context);
}
function useFactoryAPI(e, backend) {
    const opts = {
        renderer: { elementId: e, width: STAVE_WIDTH, height: STAVE_HEIGHT, backend },
    };
    const factory = new Factory(opts);
    drawStave(factory.Stave(), factory.getContext());
}
describe('Renderer', () => {
    // Helper function to run a test with multiple backends and font stacks
    function runTest(testName, testFunc, backends = [
        { backend: Renderer.Backends.CANVAS, fontStacks: ['Bravura'] },
        { backend: Renderer.Backends.SVG, fontStacks: ['Bravura', 'Gonville', 'Petaluma', 'Leland'] },
    ]) {
        return __awaiter(this, void 0, void 0, function* () {
            backends.forEach(({ backend, fontStacks }) => {
                fontStacks.forEach((fontStackName) => {
                    test(`${testName} - ${backend === Renderer.Backends.SVG ? 'SVG' : 'Canvas'} - ${fontStackName}`, () => __awaiter(this, void 0, void 0, function* () {
                        const elementId = generateTestID('renderer_test');
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
    runTest('Random', (options, contextBuilder) => __awaiter(void 0, void 0, void 0, function* () {
        const assert = createAssert();
        const useElementIDString = Math.random() > 0.5;
        const shouldUseRendererAPI = Math.random() > 0.5;
        if (useElementIDString) {
            if (shouldUseRendererAPI) {
                useRendererAPI(options.elementId, options.backend);
            }
            else {
                useFactoryAPI(options.elementId, options.backend);
            }
        }
        else {
            const element = document.getElementById(options.elementId);
            if (shouldUseRendererAPI) {
                useRendererAPI(element, options.backend);
            }
            else {
                useFactoryAPI(element, options.backend);
            }
        }
        yield expectMatchingScreenshot(options, 'renderer_tests.test.ts');
        assert.ok(true);
    }));
    runTest('Renderer API with element ID string', (options, contextBuilder) => __awaiter(void 0, void 0, void 0, function* () {
        const assert = createAssert();
        useRendererAPI(options.elementId, options.backend);
        yield expectMatchingScreenshot(options, 'renderer_tests.test.ts');
        assert.ok(true);
    }));
    runTest('Renderer API with canvas or div', (options, contextBuilder) => __awaiter(void 0, void 0, void 0, function* () {
        const assert = createAssert();
        const element = document.getElementById(options.elementId);
        useRendererAPI(element, options.backend);
        yield expectMatchingScreenshot(options, 'renderer_tests.test.ts');
        assert.ok(true);
    }));
    runTest('Renderer API with context', (options, contextBuilder) => __awaiter(void 0, void 0, void 0, function* () {
        const assert = createAssert();
        let context;
        const element = document.getElementById(options.elementId);
        if (isHTMLCanvas(element)) {
            const ctx = element.getContext('2d');
            if (!ctx) {
                throw new RuntimeError(`Couldn't get context from element "${options.elementId}"`);
            }
            context = new CanvasContext(ctx);
        }
        else {
            context = new SVGContext(element);
        }
        const renderer = new Renderer(context);
        renderer.resize(STAVE_WIDTH, STAVE_HEIGHT);
        drawStave(new Stave(0, 0, STAVE_WIDTH - STAVE_RIGHT_MARGIN).setContext(context), context);
        yield expectMatchingScreenshot(options, 'renderer_tests.test.ts');
        assert.ok(true);
    }));
    runTest('Factory API with element ID string', (options, contextBuilder) => __awaiter(void 0, void 0, void 0, function* () {
        const assert = createAssert();
        useFactoryAPI(options.elementId, options.backend);
        yield expectMatchingScreenshot(options, 'renderer_tests.test.ts');
        assert.ok(true);
    }));
    runTest('Factory API with canvas or div', (options, contextBuilder) => __awaiter(void 0, void 0, void 0, function* () {
        const assert = createAssert();
        const element = document.getElementById(options.elementId);
        useFactoryAPI(element, options.backend);
        yield expectMatchingScreenshot(options, 'renderer_tests.test.ts');
        assert.ok(true);
    }));
});
