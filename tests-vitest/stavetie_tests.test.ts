// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// StaveTie Tests - Vitest Version

import { afterAll, beforeAll, describe, test } from 'vitest';

import { BuilderOptions } from '../src/easyscore';
import { Factory } from '../src/factory';
import { Flow } from '../src/flow';
import { Stave } from '../src/stave';
import { Stem } from '../src/stem';
import { StemmableNote } from '../src/stemmablenote';
import { createAssert, FONT_STACKS, makeFactory } from './vitest_test_helpers';

function createTestElement() {
  const elementId = 'test_' + Date.now() + '_' + Math.random();
  const element = document.createElement('canvas');
  element.id = elementId;
  document.body.appendChild(element);
  return elementId;
}

/**
 * Used by the tests below to set up the stave, easyscore, notes, voice, and to format & draw.
 */
function createTest(
  notesData: [string, BuilderOptions],
  setupTies: (f: Factory, n: StemmableNote[], s: Stave) => void
) {
  return () => {
    const assert = createAssert();
    const factory = makeFactory(1, createTestElement(), 300);
    const stave = factory.Stave();
    const score = factory.EasyScore();
    const notes = score.notes(notesData[0], notesData[1]);
    const voice = score.voice(notes);

    setupTies(factory, notes, stave);

    factory.Formatter().joinVoices([voice]).formatToStave([voice], stave);
    factory.draw();
    assert.ok(true);
  };
}

describe('StaveTie', () => {
  let originalFontNames: string[];

  beforeAll(async () => {
    originalFontNames = Flow.getMusicFont();
    Flow.setMusicFont(...FONT_STACKS['Bravura']);
  });

  afterAll(() => {
    Flow.setMusicFont(...originalFontNames);
  });

  test(
    'Simple StaveTie',
    createTest(['(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }], (f, notes) => {
      f.StaveTie({
        from: notes[0],
        to: notes[1],
        first_indices: [0, 1],
        last_indices: [0, 1],
      });
    })
  );

  test(
    'Chord StaveTie',
    createTest(['(d4 e4 f4)/2, (cn4 f#4 a4)', { stem: 'down' }], (f, notes) => {
      f.StaveTie({
        from: notes[0],
        to: notes[1],
        first_indices: [0, 1, 2],
        last_indices: [0, 1, 2],
      });
    })
  );

  test(
    'Stem Up StaveTie',
    createTest(['(d4 e4 f4)/2, (cn4 f#4 a4)', { stem: 'up' }], (f, notes) => {
      f.StaveTie({
        from: notes[0],
        to: notes[1],
        first_indices: [0, 1, 2],
        last_indices: [0, 1, 2],
      });
    })
  );

  test(
    'No End Note With Clef',
    createTest(['(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }], (f, notes, stave) => {
      stave.addEndClef('treble');
      f.StaveTie({
        from: notes[1],
        first_indices: [2],
        last_indices: [2],
        text: 'slow.',
      });
    })
  );

  test(
    'No End Note',
    createTest(['(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }], (f, notes) => {
      f.StaveTie({
        from: notes[1],
        first_indices: [2],
        last_indices: [2],
        text: 'slow.',
      });
    })
  );

  test(
    'No Start Note With Clef',
    createTest(['(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }], (f, notes, stave) => {
      stave.addClef('treble');
      f.StaveTie({
        to: notes[0],
        first_indices: [2],
        last_indices: [2],
        text: 'H',
      });
    })
  );

  test(
    'No Start Note',
    createTest(['(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }], (f, notes) => {
      f.StaveTie({
        to: notes[0],
        first_indices: [2],
        last_indices: [2],
        text: 'H',
      });
    })
  );

  test(
    'Set Direction Down',
    createTest(['(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }], (f, notes) => {
      f.StaveTie({
        from: notes[0],
        to: notes[1],
        first_indices: [0, 1],
        last_indices: [0, 1],
        options: { direction: Stem.DOWN },
      });
    })
  );

  test(
    'Set Direction Up',
    createTest(['(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }], (f, notes) => {
      f.StaveTie({
        from: notes[0],
        to: notes[1],
        first_indices: [0, 1],
        last_indices: [0, 1],
        options: { direction: Stem.UP },
      });
    })
  );
});
