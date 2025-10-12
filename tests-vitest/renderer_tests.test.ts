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

import { afterAll, beforeAll, describe, test } from 'vitest';

import { createAssert, FONT_STACKS } from './vitest_test_helpers';

function createTestElement() {
  const elementId = 'test_' + Date.now() + '_' + Math.random();
  const element = document.createElement('canvas');
  element.id = elementId;
  document.body.appendChild(element);
  return elementId;
}

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
  let originalFontNames: string[];

  beforeAll(async () => {
    originalFontNames = Flow.getMusicFont();
    Flow.setMusicFont(...FONT_STACKS['Bravura']);
  });

  afterAll(() => {
    Flow.setMusicFont(...originalFontNames);
  });

  test('Random', () => {
    const assert = createAssert();
    const elementId = createTestElement();
    const useElementIDString = Math.random() > 0.5;
    const shouldUseRendererAPI = Math.random() > 0.5;
    const backend = Renderer.Backends.CANVAS;

    if (useElementIDString) {
      if (shouldUseRendererAPI) {
        useRendererAPI(elementId, backend);
      } else {
        useFactoryAPI(elementId, backend);
      }
    } else {
      const element = document.getElementById(elementId) as HTMLCanvasElement | HTMLDivElement;
      if (shouldUseRendererAPI) {
        useRendererAPI(element, backend);
      } else {
        useFactoryAPI(element, backend);
      }
    }

    assert.ok(true);
  });

  test('Renderer API with element ID string', () => {
    const assert = createAssert();
    const elementId = createTestElement();
    useRendererAPI(elementId, Renderer.Backends.CANVAS);
    assert.ok(true);
  });

  test('Renderer API with canvas or div', () => {
    const assert = createAssert();
    const elementId = createTestElement();
    const element = document.getElementById(elementId) as HTMLCanvasElement | HTMLDivElement;
    useRendererAPI(element, Renderer.Backends.CANVAS);
    assert.ok(true);
  });

  test('Renderer API with context', () => {
    const assert = createAssert();
    const elementId = createTestElement();
    let context: RenderContext;
    const element = document.getElementById(elementId) as HTMLCanvasElement | HTMLDivElement;
    if (isHTMLCanvas(element)) {
      const ctx = element.getContext('2d');
      if (!ctx) {
        throw new RuntimeError(`Couldn't get context from element "${elementId}"`);
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

  test('Factory API with element ID string', () => {
    const assert = createAssert();
    const elementId = createTestElement();
    useFactoryAPI(elementId, Renderer.Backends.CANVAS);
    assert.ok(true);
  });

  test('Factory API with canvas or div', () => {
    const assert = createAssert();
    const elementId = createTestElement();
    const element = document.getElementById(elementId) as HTMLCanvasElement | HTMLDivElement;
    useFactoryAPI(element, Renderer.Backends.CANVAS);
    assert.ok(true);
  });
});
