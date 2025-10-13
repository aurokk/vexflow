// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// StaveModifier Tests - Vitest Version

import { describe, test } from 'vitest';

import { Flow } from '../src/flow';
import { ContextBuilder, Renderer } from '../src/renderer';
import { Stave } from '../src/stave';
import { BarlineType } from '../src/stavebarline';
import { StaveModifierPosition } from '../src/stavemodifier';
import { createAssert, FONT_STACKS, generateTestID, TestOptions } from './vitest_test_helpers';

describe('StaveModifier', () => {
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
          const elementId = generateTestID('stavemodifier_test');

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

  runTest('Stave Draw Test', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const ctx = contextBuilder(options.elementId, 400, 120);
    const stave = new Stave(10, 10, 300);
    stave.setContext(ctx);
    stave.draw();

    assert.equal(stave.getYForNote(0), 100, 'getYForNote(0)');
    assert.equal(stave.getYForLine(5), 100, 'getYForLine(5)');
    assert.equal(stave.getYForLine(0), 50, 'getYForLine(0) - Top Line');
    assert.equal(stave.getYForLine(4), 90, 'getYForLine(4) - Bottom Line');

    assert.ok(true, 'all pass');
  });

  runTest('Begin & End StaveModifier Test', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const ctx = contextBuilder(options.elementId, 500, 240);
    const stave = new Stave(10, 10, 400);
    stave.setContext(ctx);
    stave.setTimeSignature('C|');
    stave.setKeySignature('Db');
    stave.setClef('treble');
    stave.setBegBarType(BarlineType.REPEAT_BEGIN);
    stave.setEndClef('alto');
    stave.setEndTimeSignature('9/8');
    stave.setEndKeySignature('G', 'C#');
    stave.setEndBarType(BarlineType.DOUBLE);
    stave.draw();

    // change
    const END = StaveModifierPosition.END;
    stave.setY(100);
    stave.setTimeSignature('3/4');
    stave.setKeySignature('G', 'C#');
    stave.setClef('bass');
    stave.setBegBarType(BarlineType.SINGLE);
    stave.setClef('treble', undefined, undefined, END);
    stave.setTimeSignature('C', undefined, END);
    stave.setKeySignature('F', undefined, END);
    stave.setEndBarType(BarlineType.SINGLE);
    stave.draw();

    assert.ok(true, 'all pass');
  });
});
