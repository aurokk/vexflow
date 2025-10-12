// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// TextBracket Tests - Vitest Version

import { afterAll, beforeAll, describe, test } from 'vitest';

import { Flow } from '../src/flow';
import { createAssert, FONT_STACKS, makeFactory } from './vitest_test_helpers';

function createTestElement() {
  const elementId = 'test_' + Date.now() + '_' + Math.random();
  const element = document.createElement('canvas');
  element.id = elementId;
  document.body.appendChild(element);
  return elementId;
}

describe('TextBracket', () => {
  let originalFontNames: string[];

  beforeAll(async () => {
    originalFontNames = Flow.getMusicFont();
    Flow.setMusicFont(...FONT_STACKS['Bravura']);
  });

  afterAll(() => {
    Flow.setMusicFont(...originalFontNames);
  });

  test('Simple TextBracket', () => {
    const assert = createAssert();
    const f = makeFactory(1, createTestElement(), 550);
    const stave = f.Stave();
    const score = f.EasyScore();

    const notes = score.notes('c4/4, c4, c4, c4, c4', { stem: 'up' });
    const voice = score.voice(notes, { time: '5/4' });

    f.TextBracket({
      from: notes[0],
      to: notes[4],
      text: '15',
      options: {
        superscript: 'va',
        position: 'top',
      },
    });

    f.TextBracket({
      from: notes[0],
      to: notes[4],
      text: '8',
      options: {
        superscript: 'vb',
        position: 'bottom',
        line: 3,
      },
    });

    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

    f.draw();

    assert.ok(true);
  });

  test('TextBracket Styles', () => {
    const assert = createAssert();
    const f = makeFactory(1, createTestElement(), 550);
    const stave = f.Stave();
    const score = f.EasyScore();

    const notes = score.notes('c4/4, c4, c4, c4, c4', { stem: 'up' });
    const voice = score.voice(notes, { time: '5/4' });

    const topOctaves = [
      f.TextBracket({
        from: notes[0],
        to: notes[1],
        text: 'Cool notes',
        options: {
          superscript: '',
          position: 'top',
        },
      }),
      f.TextBracket({
        from: notes[2],
        to: notes[4],
        text: 'Testing',
        options: {
          position: 'top',
          superscript: 'superscript',
          // weight & style below can be left undefined. They will fall back to the default defined in textbracket.ts.
          font: { family: 'Arial', size: 15, weight: 'normal', style: 'normal' },
        },
      }),
    ];

    const bottomOctaves = [
      f.TextBracket({
        from: notes[0],
        to: notes[1],
        text: '8',
        options: {
          superscript: 'vb',
          position: 'bottom',
          line: 3,
          font: { size: 30 },
        },
      }),
      f.TextBracket({
        from: notes[2],
        to: notes[4],
        text: 'Not cool notes',
        options: {
          superscript: ' super uncool',
          position: 'bottom',
          line: 4,
        },
      }),
    ];

    topOctaves[1].render_options.line_width = 2;
    topOctaves[1].render_options.show_bracket = false;

    bottomOctaves[0].render_options.underline_superscript = false;
    bottomOctaves[0].setDashed(false);

    bottomOctaves[1].render_options.bracket_height = 40;
    bottomOctaves[1].setDashed(true, [2, 2]);

    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

    f.draw();

    assert.ok(true);
  });
});
