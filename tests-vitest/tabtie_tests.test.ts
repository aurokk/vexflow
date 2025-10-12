// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// TabTie Tests - Vitest Version

import { afterAll, beforeAll, describe, test } from 'vitest';

import { Annotation } from '../src/annotation';
import { Flow } from '../src/flow';
import { Formatter } from '../src/formatter';
import { Note } from '../src/note';
import { RenderContext } from '../src/rendercontext';
import { Renderer } from '../src/renderer';
import { Stave } from '../src/stave';
import { TieNotes } from '../src/stavetie';
import { TabNote, TabNoteStruct } from '../src/tabnote';
import { TabStave } from '../src/tabstave';
import { TabTie } from '../src/tabtie';
import { Voice } from '../src/voice';
import { createAssert, FONT_STACKS } from './vitest_test_helpers';

function createTestElement() {
  const elementId = 'test_' + Date.now() + '_' + Math.random();
  const element = document.createElement('canvas');
  element.id = elementId;
  document.body.appendChild(element);
  return elementId;
}

/**
 * Helper function to create TabNote objects.
 */
const tabNote = (noteStruct: TabNoteStruct) => new TabNote(noteStruct);

/**
 * Helper function to create a RenderContext and TabStave.
 */
function setupContext(elementId: string, w: number = 0, h: number = 0): { context: RenderContext; stave: TabStave } {
  const context = Renderer.getCanvasContext(elementId, w || 350, h || 160);
  context.setFont('Arial', 10);

  const stave = new TabStave(10, 10, w || 350).addTabGlyph().setContext(context).draw();

  return { context, stave };
}

/**
 * Helper function to create the TabTie between two Note objects.
 */
function tieNotes(notes: Note[], indices: number[], stave: Stave, ctx: RenderContext, text?: string): void {
  const voice = new Voice(Flow.TIME4_4);
  voice.addTickables(notes);

  new Formatter().joinVoices([voice]).format([voice], 100);
  voice.draw(ctx, stave);

  const tie = new TabTie(
    {
      first_note: notes[0],
      last_note: notes[1],
      first_indices: indices,
      last_indices: indices,
    },
    text ?? 'Annotation'
  );

  tie.setContext(ctx);
  tie.draw();
}

describe('TabTie', () => {
  let originalFontNames: string[];

  beforeAll(async () => {
    originalFontNames = Flow.getMusicFont();
    Flow.setMusicFont(...FONT_STACKS['Bravura']);
  });

  afterAll(() => {
    Flow.setMusicFont(...originalFontNames);
  });

  /**
   * Two notes on string 4 with a tie drawn between them.
   */
  test('Simple TabTie', () => {
    const assert = createAssert();
    const elementId = createTestElement();
    const { context, stave } = setupContext(elementId);

    const note1 = tabNote({ positions: [{ str: 4, fret: 4 }], duration: 'h' });
    const note2 = tabNote({ positions: [{ str: 4, fret: 6 }], duration: 'h' });
    tieNotes([note1, note2], [0], stave, context);

    assert.ok(true, 'Simple Test');
  });

  /**
   * Helper function for the two test cases below (simpleHammerOn and simplePullOff).
   */
  function multiTest(createTabTie: (notes: TieNotes) => TabTie): void {
    const assert = createAssert();
    const elementId = createTestElement();
    const { context, stave } = setupContext(elementId, 440, 140);

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

    createTabTie({
      first_note: notes[0],
      last_note: notes[1],
      first_indices: [0],
      last_indices: [0],
    })
      .setContext(context)
      .draw();

    assert.ok(true, 'Single note');

    createTabTie({
      first_note: notes[2],
      last_note: notes[3],
      first_indices: [0, 1],
      last_indices: [0, 1],
    })
      .setContext(context)
      .draw();

    assert.ok(true, 'Chord');

    createTabTie({
      first_note: notes[4],
      last_note: notes[5],
      first_indices: [0],
      last_indices: [0],
    })
      .setContext(context)
      .draw();

    assert.ok(true, 'Single note high-fret');

    createTabTie({
      first_note: notes[6],
      last_note: notes[7],
      first_indices: [0, 1],
      last_indices: [0, 1],
    })
      .setContext(context)
      .draw();

    assert.ok(true, 'Chord high-fret');
  }

  test('Hammerons', () => {
    multiTest(TabTie.createHammeron);
  });

  test('Pulloffs', () => {
    multiTest(TabTie.createPulloff);
  });

  test('Tapping', () => {
    const assert = createAssert();
    const elementId = createTestElement();
    const { context, stave } = setupContext(elementId);

    const note1 = tabNote({ positions: [{ str: 4, fret: 12 }], duration: 'h' }).addModifier(new Annotation('T'), 0);
    const note2 = tabNote({ positions: [{ str: 4, fret: 10 }], duration: 'h' });
    tieNotes([note1, note2], [0], stave, context, 'P');

    assert.ok(true, 'Tapping Test');
  });

  test('Continuous', () => {
    const assert = createAssert();
    const elementId = createTestElement();
    const { context, stave } = setupContext(elementId, 440, 140);

    const notes = [
      tabNote({ positions: [{ str: 4, fret: 4 }], duration: 'q' }),
      tabNote({ positions: [{ str: 4, fret: 5 }], duration: 'q' }),
      tabNote({ positions: [{ str: 4, fret: 6 }], duration: 'h' }),
    ];

    const voice = new Voice(Flow.TIME4_4).addTickables(notes);
    new Formatter().joinVoices([voice]).format([voice], 300);
    voice.draw(context, stave);

    TabTie.createHammeron({
      first_note: notes[0],
      last_note: notes[1],
      first_indices: [0],
      last_indices: [0],
    })
      .setContext(context)
      .draw();

    TabTie.createPulloff({
      first_note: notes[1],
      last_note: notes[2],
      first_indices: [0],
      last_indices: [0],
    })
      .setContext(context)
      .draw();
    assert.ok(true, 'Continuous Hammeron');
  });
});
