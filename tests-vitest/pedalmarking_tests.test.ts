// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// PedalMarking Tests - Vitest Version

import { afterAll, beforeAll, describe, test } from 'vitest';

import { Factory } from '../src/factory';
import { Flow } from '../src/flow';
import { StaveNote } from '../src/stavenote';
import { Tickable } from '../src/tickable';
import { createAssert, FONT_STACKS, makeFactory } from './vitest_test_helpers';

function createTestElement() {
  const elementId = 'test_' + Date.now() + '_' + Math.random();
  const element = document.createElement('canvas');
  element.id = elementId;
  document.body.appendChild(element);
  return elementId;
}

function createTest(makePedal: (f: Factory, v1: Tickable[], v2: Tickable[]) => void) {
  return () => {
    const assert = createAssert();
    const f = makeFactory(1, createTestElement(), 550, 200);
    const score = f.EasyScore();

    const stave0 = f.Stave({ width: 250 }).addClef('treble');
    const voice0 = score.voice(score.notes('b4/4, b4, b4, b4[stem="down"]', { stem: 'up' }));
    f.Formatter().joinVoices([voice0]).formatToStave([voice0], stave0);

    const stave1 = f.Stave({ width: 260, x: 250 });
    const voice1 = score.voice(score.notes('c4/4, c4, c4, c4', { stem: 'up' }));
    f.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);

    makePedal(f, voice0.getTickables(), voice1.getTickables());

    f.draw();

    assert.ok(true, 'Must render');
  };
}

function withSimplePedal(style: string) {
  return (factory: Factory, notes0: Tickable[], notes1: Tickable[]) =>
    factory.PedalMarking({
      notes: [notes0[0], notes0[2], notes0[3], notes1[3]] as StaveNote[],
      options: { style },
    });
}

function withReleaseAndDepressedPedal(style: string) {
  return (factory: Factory, notes0: Tickable[], notes1: Tickable[]) =>
    factory.PedalMarking({
      notes: [notes0[0], notes0[3], notes0[3], notes1[1], notes1[1], notes1[3]] as StaveNote[],
      options: { style },
    });
}

describe('PedalMarking', () => {
  let originalFontNames: string[];

  beforeAll(async () => {
    originalFontNames = Flow.getMusicFont();
    Flow.setMusicFont(...FONT_STACKS['Bravura']);
  });

  afterAll(() => {
    Flow.setMusicFont(...originalFontNames);
  });

  test('Simple Pedal 1', createTest(withSimplePedal('text')));
  test('Simple Pedal 2', createTest(withSimplePedal('bracket')));
  test('Simple Pedal 3', createTest(withSimplePedal('mixed')));
  test('Release and Depress on Same Note 1', createTest(withReleaseAndDepressedPedal('bracket')));
  test('Release and Depress on Same Note 2', createTest(withReleaseAndDepressedPedal('mixed')));

  test(
    'Custom Text 1',
    createTest((factory, notes0, notes1) => {
      const pedal = factory.PedalMarking({
        notes: [notes0[0], notes1[3]] as StaveNote[],
        options: { style: 'text' },
      });
      pedal.setCustomText('una corda', 'tre corda');
      return pedal;
    })
  );

  test(
    'Custom Text 2',
    createTest((factory, notes0, notes1) => {
      const pedal = factory.PedalMarking({
        notes: [notes0[0], notes1[3]] as StaveNote[],
        options: { style: 'mixed' },
      });
      pedal.setCustomText('Sost. Ped.');
      return pedal;
    })
  );
});
