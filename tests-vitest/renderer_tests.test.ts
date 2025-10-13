// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author: Ron B. Yeh
// MIT License
//
// Renderer Tests - Vitest Version

import {
  CanvasContext,
  Factory,
  FactoryOptions,
  Flow,
  Formatter,
  isHTMLCanvas,
  RenderContext,
  Renderer,
  RuntimeError,
  Stave,
  StaveNote,
  SVGContext,
} from '../src/index';

import { describe, test } from 'vitest';

import { ContextBuilder, createAssert, FONT_STACKS, generateTestID, TestOptions } from './vitest_test_helpers';


const STAVE_WIDTH = 700;
const STAVE_HEIGHT = 100;
const STAVE_RIGHT_MARGIN = 10;

const USE_RENDERER = { useRendererAPI: true };
const USE_FACTORY = { useRendererAPI: false };

/**
 * Helper function to add three notes to a stave.
 */
function drawStave(stave: Stave, context: RenderContext): void {
  stave.addClef('bass').addTimeSignature('3/4').draw();
  Formatter.FormatAndDraw(context, stave, [
    new StaveNote({ keys: ['C/4'], duration: '4' }),
    new StaveNote({ keys: ['E/4'], duration: '4' }),
    new StaveNote({ keys: ['G/4'], duration: '4' }),
  ]);
}

function useRendererAPI(e: HTMLCanvasElement | HTMLDivElement | string, backend: number) {
  const renderer = new Renderer(e, backend);
  renderer.resize(STAVE_WIDTH, STAVE_HEIGHT);
  const context = renderer.getContext();
  drawStave(new Stave(0, 0, STAVE_WIDTH - STAVE_RIGHT_MARGIN).setContext(context), context);
}

function useFactoryAPI(e: HTMLCanvasElement | HTMLDivElement | string, backend: number) {
  const opts: FactoryOptions = {
    renderer: { elementId: e as string, width: STAVE_WIDTH, height: STAVE_HEIGHT, backend },
  };
  const factory = new Factory(opts);
  drawStave(factory.Stave(), factory.getContext());
}

describe('Renderer', () => {
  // Helper function to run a test with multiple backends and font stacks
  function runTest(
    testName: string,
    testFunc: (options: TestOptions, contextBuilder: ContextBuilder) => void,
    backends: Array<{ backend: number; fontStacks: string[] }> = [
      { backend: Renderer.Backends.CANVAS, fontStacks: ['Bravura'] },
      { backend: Renderer.Backends.SVG, fontStacks: ['Bravura', 'Gonville', 'Petaluma', 'Leland'] },
    ]
  ) {
    backends.forEach(({ backend, fontStacks }) => {
      fontStacks.forEach((fontStackName) => {
        test(`${testName} - ${backend === Renderer.Backends.SVG ? 'SVG' : 'Canvas'} - ${fontStackName}`, () => {
          const elementId = generateTestID('renderer_test');

          // Create the DOM element before the test runs
          const tagName = backend === Renderer.Backends.SVG ? 'div' : 'canvas';
          const element = document.createElement(tagName);
          element.id = elementId;
          document.body.appendChild(element);

          const assert = createAssert();
          const options: TestOptions = { elementId, params: {}, backend };

          // Set font stack
          const originalFontNames = Flow.getMusicFont();
          Flow.setMusicFont(...FONT_STACKS[fontStackName]);

          try {
            const contextBuilder: ContextBuilder =
              backend === Renderer.Backends.SVG ? Renderer.getSVGContext : Renderer.getCanvasContext;
            testFunc(options, contextBuilder);
          } finally {
            // Restore original font
            Flow.setMusicFont(...originalFontNames);
            // Don't remove the element so we can see rendered output
            // element.remove();
          }
        });
      });
    });
  }

  runTest('Random', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const useElementIDString = Math.random() > 0.5;
    const shouldUseRendererAPI = Math.random() > 0.5;

    if (useElementIDString) {
      if (shouldUseRendererAPI) {
        useRendererAPI(options.elementId, options.backend);
      } else {
        useFactoryAPI(options.elementId, options.backend);
      }
    } else {
      const element = document.getElementById(options.elementId) as HTMLCanvasElement | HTMLDivElement;
      if (shouldUseRendererAPI) {
        useRendererAPI(element, options.backend);
      } else {
        useFactoryAPI(element, options.backend);
      }
    }

    assert.ok(true);
  });

  runTest('Renderer API with element ID string', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    useRendererAPI(options.elementId, options.backend);
    assert.ok(true);
  });

  runTest('Renderer API with canvas or div', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const element = document.getElementById(options.elementId) as HTMLCanvasElement | HTMLDivElement;
    useRendererAPI(element, options.backend);
    assert.ok(true);
  });

  runTest('Renderer API with context', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    let context: RenderContext;
    const element = document.getElementById(options.elementId) as HTMLCanvasElement | HTMLDivElement;
    if (isHTMLCanvas(element)) {
      const ctx = element.getContext('2d');
      if (!ctx) {
        throw new RuntimeError(`Couldn't get context from element "${options.elementId}"`);
      }
      context = new CanvasContext(ctx);
    } else {
      context = new SVGContext(element);
    }

    const renderer = new Renderer(context);
    renderer.resize(STAVE_WIDTH, STAVE_HEIGHT);
    drawStave(new Stave(0, 0, STAVE_WIDTH - STAVE_RIGHT_MARGIN).setContext(context), context);
    assert.ok(true);
  });

  runTest('Factory API with element ID string', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    useFactoryAPI(options.elementId, options.backend);
    assert.ok(true);
  });

  runTest('Factory API with canvas or div', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const element = document.getElementById(options.elementId) as HTMLCanvasElement | HTMLDivElement;
    useFactoryAPI(element, options.backend);
    assert.ok(true);
  });
});
