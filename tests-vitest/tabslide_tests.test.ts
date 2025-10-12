// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// TabSlide Tests - Vitest Version

import { afterAll, beforeAll, describe, test } from 'vitest';

import { Flow } from '../src/flow';
import { Formatter } from '../src/formatter';
import { RenderContext } from '../src/rendercontext';
import { Renderer } from '../src/renderer';
import { TieNotes } from '../src/stavetie';
import { TabNote, TabNoteStruct } from '../src/tabnote';
import { TabSlide } from '../src/tabslide';
import { TabStave } from '../src/tabstave';
import { Voice } from '../src/voice';
import { createAssert, FONT_STACKS } from './vitest_test_helpers';

function createTestElement() {
  const elementId = 'test_' + Date.now() + '_' + Math.random();
  const element = document.createElement('canvas');
  element.id = elementId;
  document.body.appendChild(element);
  return elementId;
}

function tieNotes(notes: TabNote[], indices: number[], stave: TabStave, ctx: RenderContext): void {
  const voice = new Voice(Flow.TIME4_4);
  voice.addTickables(notes);

  new Formatter().joinVoices([voice]).format([voice], 100);
  voice.draw(ctx, stave);

  const tie = new TabSlide(
    {
      first_note: notes[0],
      last_note: notes[1],
      first_indices: indices,
      last_indices: indices,
    },
    TabSlide.SLIDE_UP
  );

  tie.setContext(ctx);
  tie.draw();
}

function setupContext(width?: number): { context: RenderContext; stave: TabStave } {
  const elementId = createTestElement();
  const context = Renderer.getCanvasContext(elementId, 350, 140);
  context.scale(0.9, 0.9);

  context.font = '10pt Arial';
  const stave = new TabStave(10, 10, width || 350).addTabGlyph().setContext(context).draw();

  return { context, stave };
}

// Helper function to create TabNote objects.
const tabNote = (noteStruct: TabNoteStruct) => new TabNote(noteStruct);

describe('TabSlide', () => {
  let originalFontNames: string[];

  beforeAll(async () => {
    originalFontNames = Flow.getMusicFont();
    Flow.setMusicFont(...FONT_STACKS['Bravura']);
  });

  afterAll(() => {
    Flow.setMusicFont(...originalFontNames);
  });

  test('Simple TabSlide', () => {
    const assert = createAssert();
    const { stave, context } = setupContext();

    tieNotes(
      [
        tabNote({ positions: [{ str: 4, fret: 4 }], duration: 'h' }),
        tabNote({ positions: [{ str: 4, fret: 6 }], duration: 'h' }),
      ],
      [0],
      stave,
      context
    );
    assert.ok(true, 'Simple Test');
  });

  /**
   * The slideUp and slideDown tests use a builder function: TabSlide.createSlideUp | TabSlide.createSlideDown.
   */
  function multiTest(buildTabSlide: (notes: TieNotes) => TabSlide) {
    return () => {
      const assert = createAssert();
      const { context, stave } = setupContext(440);

      const notes = [
        tabNote({ positions: [{ str: 4, fret: 4 }], duration: '8' }),
        tabNote({ positions: [{ str: 4, fret: 4 }], duration: '8' }),
        tabNote({
          positions: [
            { str: 4, fret: 4 },
            { str: 5, fret: 4 },
          ],
          duration: '8',
        }),
        tabNote({
          positions: [
            { str: 4, fret: 6 },
            { str: 5, fret: 6 },
          ],
          duration: '8',
        }),
        tabNote({ positions: [{ str: 2, fret: 14 }], duration: '8' }),
        tabNote({ positions: [{ str: 2, fret: 16 }], duration: '8' }),
        tabNote({
          positions: [
            { str: 2, fret: 14 },
            { str: 3, fret: 14 },
          ],
          duration: '8',
        }),
        tabNote({
          positions: [
            { str: 2, fret: 16 },
            { str: 3, fret: 16 },
          ],
          duration: '8',
        }),
      ];

      const voice = new Voice(Flow.TIME4_4).addTickables(notes);
      new Formatter().joinVoices([voice]).format([voice], 300);
      voice.draw(context, stave);

      buildTabSlide({
        first_note: notes[0],
        last_note: notes[1],
        first_indices: [0],
        last_indices: [0],
      })
        .setContext(context)
        .draw();

      assert.ok(true, 'Single note');

      buildTabSlide({
        first_note: notes[2],
        last_note: notes[3],
        first_indices: [0, 1],
        last_indices: [0, 1],
      })
        .setContext(context)
        .draw();

      assert.ok(true, 'Chord');

      buildTabSlide({
        first_note: notes[4],
        last_note: notes[5],
        first_indices: [0],
        last_indices: [0],
      })
        .setContext(context)
        .draw();

      assert.ok(true, 'Single note high-fret');

      buildTabSlide({
        first_note: notes[6],
        last_note: notes[7],
        first_indices: [0, 1],
        last_indices: [0, 1],
      })
        .setContext(context)
        .draw();

      assert.ok(true, 'Chord high-fret');
    };
  }

  test('Slide Up', multiTest(TabSlide.createSlideUp));
  test('Slide Down', multiTest(TabSlide.createSlideDown));
});
