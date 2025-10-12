// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Unison Tests - Vitest Version

import { afterAll, beforeAll, describe, test } from 'vitest';

import { Flow } from '../src/flow';
import { Tables } from '../src/tables';
import { createAssert, FONT_STACKS, makeFactory } from './vitest_test_helpers';

function createTestElement() {
  const elementId = 'test_' + Date.now() + '_' + Math.random();
  const element = document.createElement('canvas');
  element.id = elementId;
  document.body.appendChild(element);
  return elementId;
}

describe('Unison', () => {
  let originalFontNames: string[];

  beforeAll(async () => {
    originalFontNames = Flow.getMusicFont();
    Flow.setMusicFont(...FONT_STACKS['Bravura']);
  });

  afterAll(() => {
    Flow.setMusicFont(...originalFontNames);
  });

  function simple(unison: boolean, voice1: string, voice2: string) {
    return () => {
      const assert = createAssert();
      Tables.UNISON = unison;
      const vf = makeFactory(1, createTestElement(), 500, 200);
      const score = vf.EasyScore();

      const system = vf.System({ y: 40, x: 10, width: 400 });
      system.addStave({
        voices: [score.voice(score.notes(voice1)), score.voice(score.notes(voice2))],
      });

      system.getStaves()[0].setClef('treble');
      system.getStaves()[0].setTimeSignature('4/4');
      vf.draw();
      assert.ok(true);
    };
  }

  function style(unison: boolean) {
    return () => {
      const assert = createAssert();
      Tables.UNISON = unison;
      const vf = makeFactory(1, createTestElement(), 500, 200);
      const score = vf.EasyScore();

      const system = vf.System({ y: 40, x: 10, width: 400 });
      const notes1 = score.notes('e4/q, e4/q, e4/h');
      const notes2 = score.notes('e4/8, e4/8, e4/q, e4/h');
      notes1[2].setStyle({ fillStyle: 'blue', strokeStyle: 'blue' });
      notes2[3].setStyle({ fillStyle: 'green', strokeStyle: 'green' });
      system.addStave({
        voices: [score.voice(notes1), score.voice(notes2)],
      });

      system.getStaves()[0].setClef('treble');
      system.getStaves()[0].setTimeSignature('4/4');
      vf.draw();
      assert.ok(true);
    };
  }

  function breve(unison: boolean) {
    return () => {
      const assert = createAssert();
      Tables.UNISON = unison;
      const vf = makeFactory(1, createTestElement(), 500, 200);
      const score = vf.EasyScore();

      const system = vf.System({ y: 40, x: 10, width: 400 });
      system.addStave({
        voices: [
          score.voice([vf.StaveNote({ keys: ['e/4'], duration: '1/2' })], { time: '8/4' }),
          score.voice(score.notes('e4/1, e4/1'), { time: '8/4' }),
        ],
      });

      system.getStaves()[0].setClef('treble');
      system.getStaves()[0].setTimeSignature('8/4');
      vf.draw();
      assert.ok(true);
    };
  }

  test('Simple(true)', simple(true, 'e4/q, e4/q, e4/h', 'e4/8, e4/8, e4/q, e4/h'));
  test('Simple(false)', simple(false, 'e4/q, e4/q, e4/h', 'e4/8, e4/8, e4/q, e4/h'));
  test('Accidentals(true)', simple(true, 'e4/q, e#4/q, e#4/h', 'e4/8, e4/8, eb4/q, eb4/h'));
  test('Accidentals(false)', simple(false, 'e4/q, e#4/q, e#4/h', 'e4/8, e4/8, eb4/q, eb4/h'));
  test('Dots(true)', simple(true, 'e4/q.., e4/16, e4/h', '(a4 e4)/q., e4/8, e4/h'));
  test('Dots(false)', simple(false, 'e4/q.., e4/16, e4/h', '(a4 e4)/q., e4/8, e4/h'));
  test('Breve(true)', breve(true));
  test('Breve(false)', breve(false));
  test('Style(true)', style(true));
  test('Style(false)', style(false));
});
