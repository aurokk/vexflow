// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Tuplet Tests

import { afterAll, beforeAll, describe, test } from 'vitest';

import { Dot } from '../src/dot';
import { Flow } from '../src/flow';
import { Formatter } from '../src/formatter';
import { Stem } from '../src/stem';
import { Tuplet } from '../src/tuplet';
import { createAssert, FONT_STACKS, makeFactory } from './vitest_test_helpers';

function createTestElement() {
  const elementId = 'test_' + Date.now() + '_' + Math.random();
  const element = document.createElement('canvas');
  element.id = elementId;
  document.body.appendChild(element);
  return elementId;
}

// Helper Functions to set the stem direction and duration of the options objects (i.e., StaveNoteStruct)
// that are ultimately passed into Factory.StaveNote().
// eslint-disable-next-line
const set = (key: string) => (value: number | string) => (object: any) => {
  object[key] = value;
  return object;
};
const setStemDirection = set('stem_direction');
const setStemUp = setStemDirection(Stem.UP);
const setStemDown = setStemDirection(Stem.DOWN);
const setDurationToQuarterNote = set('duration')('4');

describe('Tuplet', () => {
  let originalFontNames: string[];

  beforeAll(async () => {
    originalFontNames = Flow.getMusicFont();
    Flow.setMusicFont(...FONT_STACKS['Bravura']);
  });

  afterAll(() => {
    Flow.setMusicFont(...originalFontNames);
  });

  test('Simple Tuplet', () => {
    const assert = createAssert();
    const f = makeFactory(1, createTestElement());
    const stave = f.Stave({ x: 10, y: 10, width: 350 }).addTimeSignature('3/4');

    const notes = [
      { keys: ['g/4'], duration: '4' },
      { keys: ['a/4'], duration: '4' },
      { keys: ['b/4'], duration: '4' },
      { keys: ['b/4'], duration: '8' },
      { keys: ['a/4'], duration: '8' },
      { keys: ['g/4'], duration: '8' },
    ]
      .map(setStemUp)
      .map(f.StaveNote.bind(f));

    f.Tuplet({ notes: notes.slice(0, 3) });
    f.Tuplet({ notes: notes.slice(3, 6) });

    // 3/4 time
    const voice = f
      .Voice({ time: { num_beats: 3, beat_value: 4 } })
      .setStrict(true)
      .addTickables(notes);

    new Formatter().joinVoices([voice]).formatToStave([voice], stave);

    f.draw();

    assert.ok(true, 'Simple Test');
  });

  test('Beamed Tuplet', () => {
    const assert = createAssert();
    const f = makeFactory(1, createTestElement());
    const stave = f.Stave({ x: 10, y: 10, width: 350 }).addTimeSignature('3/8');

    const notes = [
      { keys: ['b/4'], duration: '16' },
      { keys: ['a/4'], duration: '16' },
      { keys: ['g/4'], duration: '16' },
      { keys: ['a/4'], duration: '8' },
      { keys: ['f/4'], duration: '8' },
      { keys: ['a/4'], duration: '8' },
      { keys: ['f/4'], duration: '8' },
      { keys: ['a/4'], duration: '8' },
      { keys: ['f/4'], duration: '8' },
      { keys: ['g/4'], duration: '8' },
    ]
      .map(setStemUp)
      .map(f.StaveNote.bind(f));

    f.Beam({ notes: notes.slice(0, 3) });
    f.Beam({ notes: notes.slice(3, 10) });
    f.Tuplet({ notes: notes.slice(0, 3) });
    f.Tuplet({ notes: notes.slice(3, 10) });

    // 3/8 time
    const voice = f
      .Voice({ time: { num_beats: 3, beat_value: 8 } })
      .setStrict(true)
      .addTickables(notes);

    new Formatter().joinVoices([voice]).formatToStave([voice], stave);

    f.draw();

    assert.ok(true, 'Beamed Test');
  });

  test('Ratioed Tuplet', () => {
    const assert = createAssert();
    const f = makeFactory(1, createTestElement());
    const stave = f.Stave({ x: 10, y: 10, width: 350 }).addTimeSignature('4/4');

    const notes = [
      { keys: ['f/4'], duration: '4' },
      { keys: ['a/4'], duration: '4' },
      { keys: ['b/4'], duration: '4' },
      { keys: ['g/4'], duration: '8' },
      { keys: ['e/4'], duration: '8' },
      { keys: ['g/4'], duration: '8' },
    ]
      .map(setStemUp)
      .map(f.StaveNote.bind(f));

    f.Beam({
      notes: notes.slice(3, 6),
    });

    f.Tuplet({
      notes: notes.slice(0, 3),
      options: {
        ratioed: true,
      },
    });

    f.Tuplet({
      notes: notes.slice(3, 6),
      options: {
        ratioed: true,
        notes_occupied: 4,
      },
    });

    const voice = f.Voice().setStrict(true).addTickables(notes);

    new Formatter().joinVoices([voice]).formatToStave([voice], stave);

    f.draw();

    assert.ok(true, 'Ratioed Test');
  });

  test('Bottom Tuplet', () => {
    const assert = createAssert();
    const f = makeFactory(1, createTestElement(), 350, 160);
    const stave = f.Stave({ x: 10, y: 10 }).addTimeSignature('3/4');

    const notes = [
      { keys: ['f/4'], duration: '4' },
      { keys: ['c/4'], duration: '4' },
      { keys: ['g/4'], duration: '4' },
      { keys: ['d/5'], duration: '8' },
      { keys: ['g/3'], duration: '8' },
      { keys: ['b/4'], duration: '8' },
    ]
      .map(setStemDown)
      .map(f.StaveNote.bind(f));

    f.Beam({
      notes: notes.slice(3, 6),
    });

    f.Tuplet({
      notes: notes.slice(0, 3),
      options: { location: Tuplet.LOCATION_BOTTOM },
    });

    f.Tuplet({
      notes: notes.slice(3, 6),
      options: { location: Tuplet.LOCATION_BOTTOM },
    });

    const voice = f
      .Voice({ time: { num_beats: 3, beat_value: 4 } })
      .setStrict(true)
      .addTickables(notes);

    new Formatter().joinVoices([voice]).formatToStave([voice], stave);

    f.draw();

    assert.ok(true, 'Bottom Test');
  });

  test('Bottom Ratioed Tuplet', () => {
    const assert = createAssert();
    const f = makeFactory(1, createTestElement(), 350, 160);
    const stave = f.Stave({ x: 10, y: 10 }).addTimeSignature('5/8');

    const notes = [
      { keys: ['f/4'], duration: '4' },
      { keys: ['c/4'], duration: '4' },
      { keys: ['d/4'], duration: '4' },
      { keys: ['d/5'], duration: '8' },
      { keys: ['g/5'], duration: '8' },
      { keys: ['b/4'], duration: '8' },
    ]
      .map(setStemDown)
      .map(f.StaveNote.bind(f));

    f.Beam({
      notes: notes.slice(3, 6),
    });

    f.Tuplet({
      notes: notes.slice(0, 3),
      options: {
        location: Tuplet.LOCATION_BOTTOM,
        ratioed: true,
      },
    });

    f.Tuplet({
      notes: notes.slice(3, 6),
      options: {
        location: Tuplet.LOCATION_BOTTOM,
        notes_occupied: 1,
      },
    });

    const voice = f
      .Voice({ time: { num_beats: 5, beat_value: 8 } })
      .setStrict(true)
      .addTickables(notes);

    new Formatter().joinVoices([voice]).formatToStave([voice], stave);

    f.draw();

    assert.ok(true, 'Bottom Ratioed Test');
  });

  test('Awkward Tuplet', () => {
    const assert = createAssert();
    const f = makeFactory(1, createTestElement(), 370, 160);
    const stave = f.Stave({ x: 10, y: 10 });

    const notes = [
      { keys: ['g/4'], duration: '16' },
      { keys: ['b/4'], duration: '16' },
      { keys: ['a/4'], duration: '16' },
      { keys: ['a/4'], duration: '16' },
      { keys: ['g/4'], duration: '16' },
      { keys: ['f/4'], duration: '16' },
      { keys: ['e/4'], duration: '16' },
      { keys: ['c/4'], duration: '16' },
      { keys: ['g/4'], duration: '16' },
      { keys: ['a/4'], duration: '16' },
      { keys: ['f/4'], duration: '16' },
      { keys: ['e/4'], duration: '16' },
      { keys: ['c/4'], duration: '8' },
      { keys: ['d/4'], duration: '8' },
      { keys: ['e/4'], duration: '8' },
    ]
      .map(setStemUp)
      .map(f.StaveNote.bind(f));

    f.Beam({ notes: notes.slice(0, 12) });
    f.Tuplet({
      notes: notes.slice(0, 12),
      options: {
        notes_occupied: 142,
        ratioed: true,
      },
    });

    f.Tuplet({
      notes: notes.slice(12, 15),
      options: {
        ratioed: true,
      },
    }).setBracketed(true);

    const voice = f.Voice().setStrict(false).addTickables(notes);

    new Formatter().joinVoices([voice]).formatToStave([voice], stave);

    f.draw();

    assert.ok(true, 'Awkward Test');
  });

  test('Complex Tuplet', () => {
    const assert = createAssert();
    const f = makeFactory(1, createTestElement(), 600);
    const stave = f.Stave({ x: 10, y: 10 }).addTimeSignature('4/4');

    const notes1 = [
      { keys: ['b/4'], duration: '8d' },
      { keys: ['a/4'], duration: '16' },
      { keys: ['g/4'], duration: '8' },
      { keys: ['a/4'], duration: '16' },
      { keys: ['b/4'], duration: '16r' },
      { keys: ['g/4'], duration: '32' },
      { keys: ['f/4'], duration: '32' },
      { keys: ['g/4'], duration: '32' },
      { keys: ['f/4'], duration: '32' },
      { keys: ['a/4'], duration: '16' },
      { keys: ['f/4'], duration: '8' },
      { keys: ['b/4'], duration: '8' },
      { keys: ['a/4'], duration: '8' },
      { keys: ['g/4'], duration: '8' },
      { keys: ['b/4'], duration: '8' },
      { keys: ['a/4'], duration: '8' },
    ]
      .map(setStemUp)
      .map(f.StaveNote.bind(f));

    Dot.buildAndAttach([notes1[0]], { all: true });

    const notes2 = [{ keys: ['c/4'] }, { keys: ['c/4'] }, { keys: ['c/4'] }, { keys: ['c/4'] }]
      .map(setDurationToQuarterNote)
      .map(setStemDown)
      .map(f.StaveNote.bind(f));

    f.Beam({ notes: notes1.slice(0, 3) });
    f.Beam({ notes: notes1.slice(5, 9) });
    f.Beam({ notes: notes1.slice(11, 16) });

    f.Tuplet({
      notes: notes1.slice(0, 3),
    });

    f.Tuplet({
      notes: notes1.slice(3, 11),
      options: {
        num_notes: 7,
        notes_occupied: 4,
        ratioed: false,
      },
    });

    f.Tuplet({
      notes: notes1.slice(11, 16),
      options: {
        notes_occupied: 4,
      },
    });

    const voice1 = f.Voice().setStrict(true).addTickables(notes1);

    const voice2 = f.Voice().setStrict(true).addTickables(notes2);

    new Formatter().joinVoices([voice1, voice2]).formatToStave([voice1, voice2], stave);

    f.draw();

    assert.ok(true, 'Complex Test');
  });

  test('Mixed Stem Direction Tuplet', () => {
    const assert = createAssert();
    const f = makeFactory(1, createTestElement());
    const stave = f.Stave({ x: 10, y: 10 });

    const notes = [
      { keys: ['a/4'], stem_direction: 1 },
      { keys: ['c/6'], stem_direction: -1 },
      { keys: ['a/4'], stem_direction: 1 },
      { keys: ['f/5'], stem_direction: 1 },
      { keys: ['a/4'], stem_direction: -1 },
      { keys: ['c/6'], stem_direction: -1 },
    ]
      .map(setDurationToQuarterNote)
      .map(f.StaveNote.bind(f));

    f.Tuplet({
      notes: notes.slice(0, 2),
      options: {
        notes_occupied: 3,
      },
    });

    f.Tuplet({
      notes: notes.slice(2, 4),
      options: {
        notes_occupied: 3,
      },
    });

    f.Tuplet({
      notes: notes.slice(4, 6),
      options: {
        notes_occupied: 3,
      },
    });

    const voice = f.Voice().setStrict(false).addTickables(notes);

    new Formatter().joinVoices([voice]).formatToStave([voice], stave);

    f.draw();

    assert.ok(true, 'Mixed Stem Direction Tuplet');
  });

  test('Mixed Stem Direction Bottom Tuplet', () => {
    const assert = createAssert();
    const f = makeFactory(1, createTestElement());
    const stave = f.Stave({ x: 10, y: 10 });

    const notes = [
      { keys: ['f/3'], stem_direction: 1 },
      { keys: ['a/5'], stem_direction: -1 },
      { keys: ['a/4'], stem_direction: 1 },
      { keys: ['f/3'], stem_direction: 1 },
      { keys: ['a/4'], stem_direction: -1 },
      { keys: ['c/4'], stem_direction: -1 },
    ]
      .map(setDurationToQuarterNote)
      .map(f.StaveNote.bind(f));

    f.Tuplet({
      notes: notes.slice(0, 2),
      options: {
        notes_occupied: 3,
      },
    });

    f.Tuplet({
      notes: notes.slice(2, 4),
      options: {
        notes_occupied: 3,
      },
    });

    f.Tuplet({
      notes: notes.slice(4, 6),
      options: {
        notes_occupied: 3,
      },
    });

    const voice = f.Voice().setStrict(false).addTickables(notes);

    new Formatter().joinVoices([voice]).formatToStave([voice], stave);

    f.draw();

    assert.ok(true, 'Mixed Stem Direction Bottom Tuplet');
  });

  test('Nested Tuplets', () => {
    const assert = createAssert();
    const f = makeFactory(1, createTestElement());
    const stave = f.Stave({ x: 10, y: 10 }).addTimeSignature('4/4');

    const notes = [
      // Big triplet 1:
      { keys: ['b/4'], duration: '4' },
      { keys: ['a/4'], duration: '4' },
      { keys: ['g/4'], duration: '16' },
      { keys: ['a/4'], duration: '16' },
      { keys: ['f/4'], duration: '16' },
      { keys: ['a/4'], duration: '16' },
      { keys: ['g/4'], duration: '16' },
      { keys: ['b/4'], duration: '2' },
    ]
      .map(setStemUp)
      .map(f.StaveNote.bind(f));

    f.Beam({
      notes: notes.slice(2, 7),
    });

    f.Tuplet({
      notes: notes.slice(0, 7),
      options: {
        notes_occupied: 2,
        num_notes: 3,
      },
    });

    f.Tuplet({
      notes: notes.slice(2, 7),
      options: {
        notes_occupied: 4,
        num_notes: 5,
      },
    });

    // 4/4 time
    const voice = f.Voice().setStrict(true).addTickables(notes);

    new Formatter().joinVoices([voice]).formatToStave([voice], stave);

    f.draw();

    assert.ok(true, 'Nested Tuplets');
  });

  test('Single Tuplets', () => {
    const assert = createAssert();
    const f = makeFactory(1, createTestElement());
    const stave = f.Stave({ x: 10, y: 10 }).addTimeSignature('4/4');

    const notes = [
      // Big triplet 1:
      { keys: ['c/4'], duration: '4' },
      { keys: ['d/4'], duration: '8' },
      { keys: ['e/4'], duration: '8' },
      { keys: ['f/4'], duration: '8' },
      { keys: ['g/4'], duration: '8' },
      { keys: ['a/4'], duration: '2' },
      { keys: ['b/4'], duration: '4' },
    ]
      .map(setStemUp)
      .map(f.StaveNote.bind(f));

    f.Beam({
      notes: notes.slice(1, 4),
    });

    // big quartuplet
    f.Tuplet({
      notes: notes.slice(0, -1),
      options: {
        num_notes: 4,
        notes_occupied: 3,
        ratioed: true,
        bracketed: true,
      },
    });

    // first singleton
    f.Tuplet({
      notes: notes.slice(0, 1),
      options: {
        num_notes: 3,
        notes_occupied: 2,
        ratioed: true,
      },
    });

    // eighth note triplet
    f.Tuplet({
      notes: notes.slice(1, 4),
      options: {
        num_notes: 3,
        notes_occupied: 2,
      },
    });

    // second singleton
    f.Tuplet({
      notes: notes.slice(4, 5),
      options: {
        num_notes: 3,
        notes_occupied: 2,
        ratioed: true,
        bracketed: true,
      },
    });

    // 4/4 time
    const voice = f
      .Voice({ time: { num_beats: 4, beat_value: 4 } })
      .setStrict(true)
      .addTickables(notes);

    new Formatter().joinVoices([voice]).formatToStave([voice], stave);

    f.draw();

    assert.ok(true, 'Nested Tuplets');
  });
});
