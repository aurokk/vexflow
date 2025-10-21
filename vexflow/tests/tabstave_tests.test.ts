// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// TabStave Tests - Vitest Version

import { describe, test } from 'vitest';

import { Flow } from '../src/flow';
import { ContextBuilder, Renderer } from '../src/renderer';
import { TabStave } from '../src/tabstave';
import { createAssert, expectMatchingScreenshot, FONT_STACKS, generateTestID, TestOptions } from './vitest_test_helpers';

describe('TabStave', () => {
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
          const elementId = generateTestID('tabstave_test');

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

  runTest('TabStave Draw Test', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const ctx = contextBuilder(options.elementId, 400, 160);
    const stave = new TabStave(10, 10, 300);
    stave.setNumLines(6);
    stave.setContext(ctx);
    stave.draw();

    await expectMatchingScreenshot(options, 'tabstave_tests.test.ts');

    assert.equal(stave.getYForNote(0), 127, 'getYForNote(0)');
    assert.equal(stave.getYForLine(5), 127, 'getYForLine(5)');
    assert.equal(stave.getYForLine(0), 62, 'getYForLine(0) - Top Line');
    assert.equal(stave.getYForLine(4), 114, 'getYForLine(4) - Bottom Line');

    assert.ok(true, 'all pass');
  });
});
