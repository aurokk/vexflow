// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
// Author: Raffaele Viglianti, 2012
//
// StaveHairpin Tests - Vitest Version

import { describe, test } from 'vitest';

import { Flow } from '../src/flow';
import { RenderContext } from '../src/rendercontext';
import { ContextBuilder, Renderer } from '../src/renderer';
import { StaveHairpin, StaveHairpinRenderOptions } from '../src/stavehairpin';
import { StaveNote } from '../src/stavenote';
import { createAssert, FONT_STACKS, generateTestID, makeFactory, TestOptions } from './vitest_test_helpers';

/**
 * Helper function to draw a single hairpin (either crescendo or decrescendo).
 * @param type is StaveHairpin.type.CRESC or StaveHairpin.type.DECRESC.
 * @param position is Modifier.Position.ABOVE or Modifier.Position.BELOW.
 */
function drawHairpin(
  first_note: StaveNote,
  last_note: StaveNote,
  ctx: RenderContext,
  type: number,
  position: number,
  options?: StaveHairpinRenderOptions
) {
  const hairpin = new StaveHairpin({ first_note, last_note }, type);
  hairpin.setContext(ctx);
  hairpin.setPosition(position);
  if (options) {
    hairpin.setRenderOptions(options);
  }
  hairpin.draw();
}

describe('StaveHairpin', () => {
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
          const elementId = generateTestID('stavehairpin_test');

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

  runTest('Simple StaveHairpin', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const factory = makeFactory(options.backend, options.elementId);
    const ctx = factory.getContext();
    const stave = factory.Stave();

    const notes = [
      factory
        .StaveNote({ keys: ['c/4', 'e/4', 'a/4'], stem_direction: 1, duration: '4' })
        .addModifier(factory.Accidental({ type: 'b' }), 0)
        .addModifier(factory.Accidental({ type: '#' }), 1),
      factory.StaveNote({ keys: ['d/4'], stem_direction: 1, duration: '4' }),
      factory.StaveNote({ keys: ['e/4'], stem_direction: 1, duration: '4' }),
      factory.StaveNote({ keys: ['f/4'], stem_direction: 1, duration: '4' }),
    ];

    const voice = factory.Voice().addTickables(notes);

    factory.Formatter().joinVoices([voice]).formatToStave([voice], stave);
    factory.draw();

    drawHairpin(notes[0], notes[2], ctx, 1, 4);
    drawHairpin(notes[1], notes[3], ctx, 2, 3);

    assert.ok(true, 'Simple Test');
  });

  runTest('Horizontal Offset StaveHairpin', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const factory = makeFactory(options.backend, options.elementId);
    const ctx = factory.getContext();
    const stave = factory.Stave();

    const notes = [
      factory
        .StaveNote({ keys: ['c/4', 'e/4', 'a/4'], stem_direction: 1, duration: '4' })
        .addModifier(factory.Accidental({ type: 'b' }), 0)
        .addModifier(factory.Accidental({ type: '#' }), 1),
      factory.StaveNote({ keys: ['d/4'], stem_direction: 1, duration: '4' }),
      factory.StaveNote({ keys: ['e/4'], stem_direction: 1, duration: '4' }),
      factory.StaveNote({ keys: ['f/4'], stem_direction: 1, duration: '4' }),
    ];

    const voice = factory.Voice().addTickables(notes);

    factory.Formatter().joinVoices([voice]).formatToStave([voice], stave);
    factory.draw();

    drawHairpin(notes[0], notes[2], ctx, 1, 3, {
      height: 10,
      // TODO: these three property names seem to be incorrect.
      // vo => should it be 'y_shift'?
      // left_ho => should it be 'left_shift_px'?
      // right_ho => should it be 'right_shift_px'?
      vo: 20, // vertical offset
      left_ho: 20, // left horizontal offset
      right_ho: -20, // right horizontal offset
    } as unknown as StaveHairpinRenderOptions);
    drawHairpin(notes[3], notes[3], ctx, 2, 4, {
      height: 10,
      y_shift: 0, // vertical offset
      left_shift_px: 0, // left horizontal offset
      right_shift_px: 120, // right horizontal offset
    });

    assert.ok(true, 'Horizontal Offset Test');
  });

  runTest('Vertical Offset StaveHairpin', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const factory = makeFactory(options.backend, options.elementId);
    const ctx = factory.getContext();
    const stave = factory.Stave();

    const notes = [
      factory
        .StaveNote({ keys: ['c/4', 'e/4', 'a/4'], stem_direction: 1, duration: '4' })
        .addModifier(factory.Accidental({ type: 'b' }), 0)
        .addModifier(factory.Accidental({ type: '#' }), 1),
      factory.StaveNote({ keys: ['d/4'], stem_direction: 1, duration: '4' }),
      factory.StaveNote({ keys: ['e/4'], stem_direction: 1, duration: '4' }),
      factory.StaveNote({ keys: ['f/4'], stem_direction: 1, duration: '4' }),
    ];

    const voice = factory.Voice().addTickables(notes);

    factory.Formatter().joinVoices([voice]).formatToStave([voice], stave);
    factory.draw();

    drawHairpin(notes[0], notes[2], ctx, 1, 4, {
      height: 10,
      y_shift: 0, // vertical offset
      left_shift_px: 0, // left horizontal offset
      right_shift_px: 0, // right horizontal offset
    });
    drawHairpin(notes[2], notes[3], ctx, 2, 4, {
      height: 10,
      y_shift: -15, // vertical offset
      left_shift_px: 2, // left horizontal offset
      right_shift_px: 0, // right horizontal offset
    });

    assert.ok(true, 'Vertical Offset Test');
  });

  runTest('Height StaveHairpin', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const factory = makeFactory(options.backend, options.elementId);
    const ctx = factory.getContext();
    const stave = factory.Stave();

    const notes = [
      factory
        .StaveNote({ keys: ['c/4', 'e/4', 'a/4'], stem_direction: 1, duration: '4' })
        .addModifier(factory.Accidental({ type: 'b' }), 0)
        .addModifier(factory.Accidental({ type: '#' }), 1),
      factory.StaveNote({ keys: ['d/4'], stem_direction: 1, duration: '4' }),
      factory.StaveNote({ keys: ['e/4'], stem_direction: 1, duration: '4' }),
      factory.StaveNote({ keys: ['f/4'], stem_direction: 1, duration: '4' }),
    ];

    const voice = factory.Voice().addTickables(notes);

    factory.Formatter().joinVoices([voice]).formatToStave([voice], stave);
    factory.draw();

    drawHairpin(notes[0], notes[2], ctx, 1, 4, {
      height: 10,
      y_shift: 0, // vertical offset
      left_shift_px: 0, // left horizontal offset
      right_shift_px: 0, // right horizontal offset
    });
    drawHairpin(notes[2], notes[3], ctx, 2, 4, {
      height: 15,
      y_shift: 0, // vertical offset
      left_shift_px: 2, // left horizontal offset
      right_shift_px: 0, // right horizontal offset
    });

    assert.ok(true, 'Height Test');
  });
});
