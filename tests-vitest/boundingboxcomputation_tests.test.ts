// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// BoundingBoxComputation Tests - Vitest Version

import { BoundingBoxComputation, Factory, Glyph, OutlineCode, RenderContext } from '../src/index';

import { describe, test } from 'vitest';

import { Flow } from '../src/flow';
import { ContextBuilder, Renderer } from '../src/renderer';
import { createAssert, expectMatchingScreenshot, FONT_STACKS, generateTestID, TestOptions } from './vitest_test_helpers';

/**
 * Size the context to fit all the points and a small margin.
 */
function createContext(backend: number, elementId: string, points: number[]): RenderContext {
  let w = points[0];
  let h = points[1];
  for (let i = 2; i < points.length; i += 2) {
    w = Math.max(w, points[i]);
    h = Math.max(h, points[i + 1]);
  }

  const f = new Factory({ renderer: { elementId, backend, width: w + 20, height: h + 20 } });
  const ctx = f.getContext();
  ctx.setLineCap('square');
  return ctx;
}

/**
 * Draw a rectangle on the RenderContext.
 */
function rect(ctx: RenderContext, style: string, lineWidth: number, x: number, y: number, w: number, h: number): void {
  ctx.strokeStyle = style;
  ctx.setLineWidth(lineWidth);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y);
  ctx.stroke();
}

// Each test consists of the control points for a single curve and its expected bounding box.
const quadraticParams = [
  {
    points: [10, 10, 100, 20, 110, 110],
    box: [10, 10, 100, 100],
  },
  {
    points: [110, 10, 60, 110, 10, 20],
    box: [10, 10, 100, 52.63],
  },
  {
    points: [10, 10, 30, 20, 50, 30],
    box: [10, 10, 40, 20],
  },
  {
    points: [100, 30, 30, 110, 20, 30],
    box: [20, 30, 80, 40],
  },
];

// Each test consists of the control points for a single curve and its expected bounding box.
const cubicParams = [
  {
    points: [10, 10, 60, 20, 100, 60, 110, 110],
    box: [10, 10, 100, 100],
  },
  {
    points: [10, 10, 35, 110, 85, 110, 110, 10],
    box: [10, 10, 100, 75],
  },
  {
    points: [10, 110, 90, 10, 30, 10, 110, 110],
    box: [10, 35, 100, 75],
  },
  {
    points: [10, 10, 110, 110, 110, 10, 10, 110],
    box: [10, 10, 75, 100],
  },
  {
    points: [10, 10, 130, 110, -10, 110, 110, 10],
    box: [10, 10, 100, 75],
  },
  {
    points: [50, 10, 10, 110, 110, 110, 74, 10],
    box: [40.38, 10, 41.59, 75],
  },
  {
    points: [10, 30, 35, 60, 110, 110, 60, 10],
    box: [10, 10, 66.82, 59.37],
  },
  {
    points: [210, 70, 10, 10, 190, 10, 120, 90],
    box: [112.02, 27.23, 97.98, 62.77],
  },
  {
    points: [20, 10, 210, 90, 10, 90, 100, 38],
    box: [20, 10, 85.33, 64.06],
  },
  {
    points: [60, 14, 10, 14, 90, 14, 70, 14],
    box: [43.28, 14, 30.01, 0],
  },
  {
    points: [10, 60, 20, 100, 100, 20, 110, 60],
    box: [10, 48.45, 100, 23.1],
  },
];

describe('BoundingBoxComputation', () => {
  // Helper function to run a test with multiple backends and font stacks
  async function runTest(
    testName: string,
    testFunc: (options: TestOptions, contextBuilder: ContextBuilder) => void | Promise<void>,
    backends: Array<{ backend: number; fontStacks: string[] }> = [
      { backend: Renderer.Backends.CANVAS, fontStacks: ['Bravura'] },
      { backend: Renderer.Backends.SVG, fontStacks: ['Bravura', 'Gonville', 'Petaluma', 'Leland'] },
    ]
  ) {
    backends.forEach(({ backend, fontStacks }) => {
      fontStacks.forEach((fontStackName) => {
        test(`${testName} - ${backend === Renderer.Backends.SVG ? 'SVG' : 'Canvas'} - ${fontStackName}`, async () => {
          const elementId = generateTestID('boundingboxcomputation_test');

          // Create the DOM element before the test runs
          const tagName = backend === Renderer.Backends.SVG ? 'div' : 'canvas';
          const element = document.createElement(tagName);
          element.id = elementId;
          document.body.appendChild(element);

          const assert = createAssert();
          const options: TestOptions = { elementId, params: {}, backend, testName, fontStackName };

          // Set font stack
          const originalFontNames = Flow.getMusicFont();
          Flow.setMusicFont(...FONT_STACKS[fontStackName]);

          try {
            const contextBuilder: ContextBuilder =
              backend === Renderer.Backends.SVG ? Renderer.getSVGContext : Renderer.getCanvasContext;
            await testFunc(options, contextBuilder);
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

  test('Point Test', () => {
    const assert = createAssert();
    const bboxComp = new BoundingBoxComputation();
    bboxComp.addPoint(2, 3);
    assert.equal(bboxComp.getX1(), 2, 'Bad X1');
    assert.equal(bboxComp.getY1(), 3, 'Bad Y1');
    assert.equal(bboxComp.width(), 0, 'Bad width');
    assert.equal(bboxComp.height(), 0, 'Bad height');

    bboxComp.addPoint(-5, 7);
    assert.equal(bboxComp.getX1(), -5, 'Bad X1');
    assert.equal(bboxComp.getY1(), 3, 'Bad Y1');
    assert.equal(bboxComp.width(), 7, 'Bad width');
    assert.equal(bboxComp.height(), 4, 'Bad height');
  });

  quadraticParams.forEach((params, index) => {
    runTest(`Quadratic Test ${index}`, async (options: TestOptions, contextBuilder: ContextBuilder) => {
      const assert = createAssert();
      const points = params.points;
      const box = params.box;

      const ctx = createContext(options.backend, options.elementId, points);
      const [x0, y0, x1, y1, x2, y2] = points;

      // Draw expected bounding box.
      let [bx, by, bw, bh] = box;
      rect(ctx, '#0f0', 5, bx, by, bw, bh);

      // Compute the bounding box.
      const bboxComp = new BoundingBoxComputation();
      bboxComp.addQuadraticCurve(x0, y0, x1, y1, x2, y2);

      // Draw computed bounding box.
      [bx, by, bw, bh] = [bboxComp.getX1(), bboxComp.getY1(), bboxComp.width(), bboxComp.height()];
      rect(ctx, '#00f', 3, bx, by, bw, bh);

      // Regression test for a prior bug: compute the bounding box again,
      // this time using the Glyph.getOutlineBoundingBox code path.
      const o = [OutlineCode.MOVE, x0, -y0, OutlineCode.QUADRATIC, x2, -y2, x1, -y1];
      const bbox = Glyph.getOutlineBoundingBox(o, 1, 0, 0);
      rect(ctx, '#fa0', 1, bbox.getX(), bbox.getY(), bbox.getW(), bbox.getH());

      // Draw curve.
      ctx.setLineWidth(1);
      ctx.fillStyle = '#000';
      Glyph.renderOutline(ctx, o, 1, 0, 0);

      // Draw control points.
      ctx.strokeStyle = '#f00';
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      await expectMatchingScreenshot(options, 'boundingboxcomputation_tests.test.ts');

      // Check the expected and computed bounding boxes are close enough.
      assert.ok(Math.abs(bboxComp.getX1() - box[0]) < 0.01, `Bad X1: ${bboxComp.getX1()}`);
      assert.ok(Math.abs(bboxComp.getY1() - box[1]) < 0.01, `Bad Y1: ${bboxComp.getY1()}`);
      assert.ok(Math.abs(bboxComp.width() - box[2]) < 0.01, `Bad width: ${bboxComp.width()}`);
      assert.ok(Math.abs(bboxComp.height() - box[3]) < 0.01, `Bad height: ${bboxComp.height()}`);

      assert.ok(Math.abs(bbox.getX() - box[0]) < 0.01, `Bad X: ${bbox.getX()}`);
      assert.ok(Math.abs(bbox.getY() - box[1]) < 0.01, `Bad Y: ${bbox.getY()}`);
      assert.ok(Math.abs(bbox.getW() - box[2]) < 0.01, `Bad W: ${bbox.getW()}`);
      assert.ok(Math.abs(bbox.getH() - box[3]) < 0.01, `Bad H: ${bbox.getH()}`);
    });
  });

  cubicParams.forEach((params, index) => {
    runTest(`Cubic Test ${index}`, async (options: TestOptions, contextBuilder: ContextBuilder) => {
      const assert = createAssert();
      const points = params.points;
      const box = params.box;

      const ctx = createContext(options.backend, options.elementId, points);
      const [x0, y0, x1, y1, x2, y2, x3, y3] = points;

      // Draw expected bounding box.
      let [bx, by, bw, bh] = box;
      rect(ctx, '#0f0', 5, bx, by, bw, bh);

      // Compute the bounding box.
      const bboxComp = new BoundingBoxComputation();
      bboxComp.addBezierCurve(x0, y0, x1, y1, x2, y2, x3, y3);

      // Draw computed bounding box.
      [bx, by, bw, bh] = [bboxComp.getX1(), bboxComp.getY1(), bboxComp.width(), bboxComp.height()];
      rect(ctx, '#00f', 3, bx, by, bw, bh);

      // Regression test for a prior bug: compute the bounding box again,
      // this time using the Glyph.getOutlineBoundingBox code path.
      const o = [OutlineCode.MOVE, x0, -y0, OutlineCode.BEZIER, x3, -y3, x1, -y1, x2, -y2];
      const bbox = Glyph.getOutlineBoundingBox(o, 1, 0, 0);
      rect(ctx, '#fa0', 1, bbox.getX(), bbox.getY(), bbox.getW(), bbox.getH());

      // Draw curve.
      ctx.setLineWidth(1);
      ctx.fillStyle = '#000';
      Glyph.renderOutline(ctx, o, 1, 0, 0);

      // Draw control points.
      ctx.strokeStyle = '#f00';
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.stroke();

      await expectMatchingScreenshot(options, 'boundingboxcomputation_tests.test.ts');

      // Check the expected and computed bounding boxes are close enough.
      assert.ok(Math.abs(bboxComp.getX1() - box[0]) < 0.01, `Bad X1: ${bboxComp.getX1()}`);
      assert.ok(Math.abs(bboxComp.getY1() - box[1]) < 0.01, `Bad Y1: ${bboxComp.getY1()}`);
      assert.ok(Math.abs(bboxComp.width() - box[2]) < 0.01, `Bad width: ${bboxComp.width()}`);
      assert.ok(Math.abs(bboxComp.height() - box[3]) < 0.01, `Bad height: ${bboxComp.height()}`);

      assert.ok(Math.abs(bbox.getX() - box[0]) < 0.01, `Bad X: ${bbox.getX()}`);
      assert.ok(Math.abs(bbox.getY() - box[1]) < 0.01, `Bad Y: ${bbox.getY()}`);
      assert.ok(Math.abs(bbox.getW() - box[2]) < 0.01, `Bad W: ${bbox.getW()}`);
      assert.ok(Math.abs(bbox.getH() - box[3]) < 0.01, `Bad H: ${bbox.getH()}`);
    });
  });
});
