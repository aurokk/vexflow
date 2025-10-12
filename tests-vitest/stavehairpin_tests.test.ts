// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
// Author: Raffaele Viglianti, 2012
//
// StaveHairpin Tests - Vitest Version

import { afterAll, beforeAll, describe, test } from 'vitest';

import { Flow } from '../src/flow';
import { RenderContext } from '../src/rendercontext';
import { StaveHairpin, StaveHairpinRenderOptions } from '../src/stavehairpin';
import { StaveNote } from '../src/stavenote';
import { createAssert, FONT_STACKS, makeFactory } from './vitest_test_helpers';

function createTestElement() {
  const elementId = 'test_' + Date.now() + '_' + Math.random();
  const element = document.createElement('canvas');
  element.id = elementId;
  document.body.appendChild(element);
  return elementId;
}

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

/**
 * Helper function
 */
function createTest(drawTwoHairpins: (ctx: RenderContext, notes: StaveNote[]) => void) {
  return () => {
    const assert = createAssert();
    const factory = makeFactory(1, createTestElement());
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

    drawTwoHairpins(ctx, notes);

    assert.ok(true, 'Simple Test');
  };
}

describe('StaveHairpin', () => {
  let originalFontNames: string[];

  beforeAll(async () => {
    originalFontNames = Flow.getMusicFont();
    Flow.setMusicFont(...FONT_STACKS['Bravura']);
  });

  afterAll(() => {
    Flow.setMusicFont(...originalFontNames);
  });

  test(
    'Simple StaveHairpin',
    createTest((ctx, notes) => {
      drawHairpin(notes[0], notes[2], ctx, 1, 4);
      drawHairpin(notes[1], notes[3], ctx, 2, 3);
    })
  );

  test(
    'Horizontal Offset StaveHairpin',
    createTest((ctx, notes) => {
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
    })
  );

  test(
    'Vertical Offset StaveHairpin',
    createTest((ctx, notes) => {
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
    })
  );

  test(
    'Height StaveHairpin',
    createTest((ctx, notes) => {
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
    })
  );
});
