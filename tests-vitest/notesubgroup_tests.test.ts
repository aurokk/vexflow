// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
// Author: Taehoon Moon 2016
//
// NoteSubGroup Tests - Vitest Version

import { afterAll, beforeAll, describe, test } from 'vitest';

import { BarNote } from '../src/barnote';
import { Factory } from '../src/factory';
import { Flow } from '../src/flow';
import { Note } from '../src/note';
import { BarlineType } from '../src/stavebarline';
import { StaveNote, StaveNoteStruct } from '../src/stavenote';
import { createAssert, FONT_STACKS, makeFactory } from './vitest_test_helpers';

function createTestElement() {
  const elementId = 'test_' + Date.now() + '_' + Math.random();
  const element = document.createElement('canvas');
  element.id = elementId;
  document.body.appendChild(element);
  return elementId;
}

function createShortcuts(f: Factory) {
  return {
    createStaveNote: (noteStruct: StaveNoteStruct) => f.StaveNote(noteStruct),
    addAccidental: (note: StaveNote, accid: string) => note.addModifier(f.Accidental({ type: accid }), 0),
    addSubGroup: (note: StaveNote, subNotes: Note[]) => note.addModifier(f.NoteSubGroup({ notes: subNotes }), 0),
  };
}

describe('NoteSubGroup', () => {
  let originalFontNames: string[];

  beforeAll(async () => {
    originalFontNames = Flow.getMusicFont();
    Flow.setMusicFont(...FONT_STACKS['Bravura']);
  });

  afterAll(() => {
    Flow.setMusicFont(...originalFontNames);
  });

  test('Basic - ClefNote, TimeSigNote and BarNote', () => {
    const assert = createAssert();
    const f = makeFactory(1, createTestElement(), 750, 200);
    const ctx = f.getContext();
    const stave = f.Stave({ width: 600 }).addClef('treble');

    const { createStaveNote, addAccidental, addSubGroup } = createShortcuts(f);

    const notes: StaveNote[] = [
      { keys: ['f/5'], stem_direction: -1, duration: '4' },
      { keys: ['d/4'], stem_direction: -1, duration: '4', clef: 'bass' },
      { keys: ['g/4'], stem_direction: -1, duration: '4', clef: 'alto' },
      { keys: ['a/4'], stem_direction: -1, duration: '4', clef: 'alto' },
      { keys: ['c/4'], stem_direction: -1, duration: '4', clef: 'tenor' },
      { keys: ['c/3'], stem_direction: +1, duration: '4', clef: 'tenor' },
      { keys: ['d/4'], stem_direction: -1, duration: '4', clef: 'tenor' },
      { keys: ['f/4'], stem_direction: -1, duration: '4', clef: 'tenor' },
    ].map(createStaveNote);

    addAccidental(notes[1], '#');
    addAccidental(notes[2], 'n');

    addSubGroup(notes[1], [f.ClefNote({ type: 'bass', options: { size: 'small' } })]);
    addSubGroup(notes[2], [f.ClefNote({ type: 'alto', options: { size: 'small' } })]);
    addSubGroup(notes[4], [f.ClefNote({ type: 'tenor', options: { size: 'small' } }), new BarNote()]);
    addSubGroup(notes[5], [f.TimeSigNote({ time: '6/8' })]);
    addSubGroup(notes[6], [new BarNote(BarlineType.REPEAT_BEGIN)]);

    addAccidental(notes[4], 'b');
    addAccidental(notes[6], 'bb');

    const voice = f.Voice().setStrict(false).addTickables(notes);

    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

    f.draw();

    notes.forEach((note) => Note.plotMetrics(ctx, note, 150));

    assert.ok(true, 'all pass');
  });

  test('Multi Voice', () => {
    const assert = createAssert();
    const f = makeFactory(1, createTestElement(), 550, 200);
    const ctx = f.getContext();
    const stave = f.Stave().addClef('treble');

    const { createStaveNote, addAccidental, addSubGroup } = createShortcuts(f);

    const notes1 = [
      { keys: ['f/5'], stem_direction: 1, duration: '4' },
      { keys: ['d/4'], stem_direction: 1, duration: '4', clef: 'bass' },
      { keys: ['c/5'], stem_direction: 1, duration: '4', clef: 'alto' },
      { keys: ['c/5'], stem_direction: 1, duration: '4', clef: 'soprano' },
    ].map(createStaveNote);

    const notes2 = [
      { keys: ['c/4'], stem_direction: -1, duration: '4' },
      { keys: ['c/3'], stem_direction: -1, duration: '4', clef: 'bass' },
      { keys: ['d/4'], stem_direction: -1, duration: '4', clef: 'alto' },
      { keys: ['f/4'], stem_direction: -1, duration: '4', clef: 'soprano' },
    ].map(createStaveNote);

    addAccidental(notes1[1], '#');

    addSubGroup(notes1[1], [
      f.ClefNote({ type: 'bass', options: { size: 'small' } }),
      new BarNote(BarlineType.REPEAT_BEGIN),
      f.TimeSigNote({ time: '3/4' }),
    ]);
    addSubGroup(notes2[2], [
      f.ClefNote({ type: 'alto', options: { size: 'small' } }),
      f.TimeSigNote({ time: '9/8' }),
      new BarNote(BarlineType.DOUBLE),
    ]);
    addSubGroup(notes1[3], [f.ClefNote({ type: 'soprano', options: { size: 'small' } })]);

    addAccidental(notes1[2], 'b');
    addAccidental(notes2[3], '#');

    const voices = [f.Voice().addTickables(notes1), f.Voice().addTickables(notes2)];

    f.Formatter().joinVoices(voices).formatToStave(voices, stave);

    f.draw();

    notes1.forEach((note) => Note.plotMetrics(ctx, note, 150));

    assert.ok(true, 'all pass');
  });

  test('Multi Voice Multiple Draws', () => {
    const assert = createAssert();
    const f = makeFactory(1, createTestElement(), 550, 200);
    const ctx = f.getContext();
    const stave = f.Stave().addClef('treble');

    const { createStaveNote, addAccidental, addSubGroup } = createShortcuts(f);

    const notes1 = [
      { keys: ['f/5'], stem_direction: 1, duration: '4' },
      { keys: ['d/4'], stem_direction: 1, duration: '4', clef: 'bass' },
      { keys: ['c/5'], stem_direction: 1, duration: '4', clef: 'alto' },
      { keys: ['c/5'], stem_direction: 1, duration: '4', clef: 'soprano' },
    ].map(createStaveNote);

    const notes2 = [
      { keys: ['c/4'], stem_direction: -1, duration: '4' },
      { keys: ['c/3'], stem_direction: -1, duration: '4', clef: 'bass' },
      { keys: ['d/4'], stem_direction: -1, duration: '4', clef: 'alto' },
      { keys: ['f/4'], stem_direction: -1, duration: '4', clef: 'soprano' },
    ].map(createStaveNote);

    addAccidental(notes1[1], '#');

    addSubGroup(notes1[1], [
      f.ClefNote({ type: 'bass', options: { size: 'small' } }),
      new BarNote(BarlineType.REPEAT_BEGIN),
      f.TimeSigNote({ time: '3/4' }),
    ]);
    addSubGroup(notes2[2], [
      f.ClefNote({ type: 'alto', options: { size: 'small' } }),
      f.TimeSigNote({ time: '9/8' }),
      new BarNote(BarlineType.DOUBLE),
    ]);
    addSubGroup(notes1[3], [f.ClefNote({ type: 'soprano', options: { size: 'small' } })]);

    addAccidental(notes1[2], 'b');
    addAccidental(notes2[3], '#');

    const voices = [f.Voice().addTickables(notes1), f.Voice().addTickables(notes2)];

    f.Formatter().joinVoices(voices).formatToStave(voices, stave);

    for (let i = 0; i < 2; i++) {
      f.draw();
    }

    notes1.forEach((note) => Note.plotMetrics(ctx, note, 150));

    assert.ok(true, 'all pass');
  });

  test('Multi Staff', () => {
    const assert = createAssert();
    const f = makeFactory(1, createTestElement(), 550, 400);

    const { createStaveNote, addAccidental, addSubGroup } = createShortcuts(f);

    const stave1 = f.Stave({ x: 15, y: 30, width: 500 }).setClef('treble');
    const notes1 = [
      { keys: ['f/5'], stem_direction: 1, duration: '4' },
      { keys: ['d/4'], stem_direction: 1, duration: '4', clef: 'bass' },
      { keys: ['c/5'], stem_direction: 1, duration: '4', clef: 'alto' },
      { keys: ['c/5'], stem_direction: 1, duration: '4', clef: 'soprano' },
    ].map(createStaveNote);

    const notes2 = [
      { keys: ['c/4'], stem_direction: -1, duration: '4' },
      { keys: ['c/3'], stem_direction: -1, duration: '4', clef: 'bass' },
      { keys: ['d/4'], stem_direction: -1, duration: '4', clef: 'alto' },
      { keys: ['f/4'], stem_direction: -1, duration: '4', clef: 'soprano' },
    ].map(createStaveNote);

    const stave2 = f.Stave({ x: 15, y: 150, width: 500 }).setClef('bass');

    const notes3 = [
      { keys: ['e/3'], duration: '8', stem_direction: -1, clef: 'bass' },
      { keys: ['g/4'], duration: '8', stem_direction: 1, clef: 'treble' },
      { keys: ['d/4'], duration: '8', stem_direction: 1, clef: 'treble' },
      { keys: ['f/4'], duration: '8', stem_direction: 1, clef: 'treble' },
      { keys: ['c/4'], duration: '8', stem_direction: 1, clef: 'treble' },
      { keys: ['g/3'], duration: '8', stem_direction: -1, clef: 'bass' },
      { keys: ['d/3'], duration: '8', stem_direction: -1, clef: 'bass' },
      { keys: ['f/3'], duration: '8', stem_direction: -1, clef: 'bass' },
    ].map(createStaveNote);

    f.StaveConnector({ top_stave: stave1, bottom_stave: stave2, type: 'brace' });
    f.StaveConnector({ top_stave: stave1, bottom_stave: stave2, type: 'singleLeft' });
    f.StaveConnector({ top_stave: stave1, bottom_stave: stave2, type: 'singleRight' });

    f.Beam({ notes: notes3.slice(1, 4) });
    f.Beam({ notes: notes3.slice(5) });

    addAccidental(notes1[1], '#');
    addSubGroup(notes1[1], [f.ClefNote({ type: 'bass', options: { size: 'small' } }), f.TimeSigNote({ time: '3/4' })]);
    addSubGroup(notes2[2], [f.ClefNote({ type: 'alto', options: { size: 'small' } }), f.TimeSigNote({ time: '9/8' })]);
    addSubGroup(notes1[3], [f.ClefNote({ type: 'soprano', options: { size: 'small' } })]);
    addSubGroup(notes3[1], [f.ClefNote({ type: 'treble', options: { size: 'small' } })]);
    addSubGroup(notes3[5], [f.ClefNote({ type: 'bass', options: { size: 'small' } })]);
    addAccidental(notes3[0], '#');
    addAccidental(notes3[3], 'b');
    addAccidental(notes3[5], '#');
    addAccidental(notes1[2], 'b');
    addAccidental(notes2[3], '#');

    const voice1 = f.Voice().addTickables(notes1);
    const voice2 = f.Voice().addTickables(notes2);
    const voice3 = f.Voice().addTickables(notes3);

    f.Formatter().joinVoices([voice1, voice2]).joinVoices([voice3]).formatToStave([voice1, voice2, voice3], stave1);

    f.draw();

    assert.ok(true, 'all pass');
  });
});
