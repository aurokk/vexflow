// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// GraceTabNote Tests - Vitest Version

import { afterAll, beforeAll, describe, test } from 'vitest';

import { Flow } from '../src/flow';
import { Formatter } from '../src/formatter';
import { GraceNoteGroup } from '../src/gracenotegroup';
import { GraceTabNote } from '../src/gracetabnote';
import { Renderer } from '../src/renderer';
import { TabNote, TabNoteStruct } from '../src/tabnote';
import { TabStave } from '../src/tabstave';
import { Voice } from '../src/voice';
import { createAssert, FONT_STACKS } from './vitest_test_helpers';

/**
 * Helper to create a unique element ID and DOM element for testing
 */
function createTestElement() {
  const elementId = 'test_' + Date.now() + '_' + Math.random();
  const element = document.createElement('canvas');
  element.id = elementId;
  document.body.appendChild(element);
  return elementId;
}

// Helper functions to create TabNote and GraceTabNote objects.
const tabNote = (noteStruct: TabNoteStruct) => new TabNote(noteStruct);
const graceTabNote = (noteStruct: TabNoteStruct) => new GraceTabNote(noteStruct);

describe('Grace Tab Notes', () => {
  let originalFontNames: string[];

  beforeAll(async () => {
    originalFontNames = Flow.getMusicFont();
    Flow.setMusicFont(...FONT_STACKS['Bravura']);
  });

  afterAll(() => {
    Flow.setMusicFont(...originalFontNames);
  });

  test('Grace Tab Note Simple', () => {
    const assert = createAssert();
    const elementId = createTestElement();
    const context = Renderer.getCanvasContext(elementId, 350, 140);
    const stave = new TabStave(10, 10, 350).addTabGlyph().setContext(context).draw();

    const note0 = tabNote({ positions: [{ str: 4, fret: 6 }], duration: '4' });
    const note1 = tabNote({ positions: [{ str: 4, fret: 12 }], duration: '4' });
    const note2 = tabNote({ positions: [{ str: 4, fret: 10 }], duration: '4' });
    const note3 = tabNote({ positions: [{ str: 4, fret: 10 }], duration: '4' });

    const gracenote_group0 = [{ positions: [{ str: 4, fret: 'x' }], duration: '8' }];

    const gracenote_group1 = [
      { positions: [{ str: 4, fret: 9 }], duration: '16' },
      { positions: [{ str: 4, fret: 10 }], duration: '16' },
    ];

    const gracenote_group2 = [{ positions: [{ str: 4, fret: 9 }], duration: '8' }];
    const gracenote_group3 = [
      { positions: [{ str: 5, fret: 10 }], duration: '8' },
      { positions: [{ str: 4, fret: 9 }], duration: '8' },
    ];

    const gracenotes0 = gracenote_group0.map(graceTabNote);
    const gracenotes1 = gracenote_group1.map(graceTabNote);
    const gracenotes2 = gracenote_group2.map(graceTabNote);
    gracenotes2[0].setGhost(true);
    const gracenotes3 = gracenote_group3.map(graceTabNote);

    note0.addModifier(new GraceNoteGroup(gracenotes0), 0);
    note1.addModifier(new GraceNoteGroup(gracenotes1), 0);
    note2.addModifier(new GraceNoteGroup(gracenotes2), 0);
    note3.addModifier(new GraceNoteGroup(gracenotes3), 0);

    const voice = new Voice(Flow.TIME4_4);
    voice.addTickables([note0, note1, note2, note3]);

    new Formatter().joinVoices([voice]).format([voice], 250);

    voice.draw(context, stave);

    assert.ok(true, 'Simple Test');
  });

  test('Grace Tab Note Slurred', () => {
    const assert = createAssert();
    const elementId = createTestElement();
    const context = Renderer.getCanvasContext(elementId, 350, 140);
    const stave = new TabStave(10, 10, 350).addTabGlyph().setContext(context).draw();

    const note0 = tabNote({ positions: [{ str: 4, fret: 12 }], duration: 'h' });
    const note1 = tabNote({ positions: [{ str: 4, fret: 10 }], duration: 'h' });

    const gracenote_group0 = [
      { positions: [{ str: 4, fret: 9 }], duration: '8' },
      { positions: [{ str: 4, fret: 10 }], duration: '8' },
    ];

    const gracenote_group1 = [
      { positions: [{ str: 4, fret: 7 }], duration: '16' },
      { positions: [{ str: 4, fret: 8 }], duration: '16' },
      { positions: [{ str: 4, fret: 9 }], duration: '16' },
    ];

    const gracenotes0 = gracenote_group0.map(graceTabNote);
    const gracenotes1 = gracenote_group1.map(graceTabNote);

    note0.addModifier(new GraceNoteGroup(gracenotes0, true), 0);
    note1.addModifier(new GraceNoteGroup(gracenotes1, true), 0);

    const voice = new Voice(Flow.TIME4_4);
    voice.addTickables([note0, note1]);

    new Formatter().joinVoices([voice]).format([voice], 200);

    voice.draw(context, stave);

    assert.ok(true, 'Slurred Test');
  });
});
