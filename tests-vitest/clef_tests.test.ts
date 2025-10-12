// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Clef Tests - Vitest Version

import { afterAll, beforeAll, describe, test } from 'vitest';

import { Factory } from '../src/factory';
import { Flow } from '../src/flow';
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

describe('Clef', () => {
  let originalFontNames: string[];

  beforeAll(async () => {
    originalFontNames = Flow.getMusicFont();
    Flow.setMusicFont(...FONT_STACKS['Bravura']);
  });

  afterAll(() => {
    Flow.setMusicFont(...originalFontNames);
  });

  test('Clef Test', () => {
    const assert = createAssert();
    const f = new Factory({ renderer: { elementId: createTestElement(), backend: 1, width: 800, height: 120 } });
    f.Stave()
      .addClef('treble')
      .addClef('treble', 'default', '8va')
      .addClef('treble', 'default', '8vb')
      .addClef('alto')
      .addClef('tenor')
      .addClef('soprano')
      .addClef('bass')
      .addClef('bass', 'default', '8vb')
      .addClef('mezzo-soprano')
      .addClef('baritone-c')
      .addClef('baritone-f')
      .addClef('subbass')
      .addClef('percussion')
      .addClef('french')
      .addEndClef('treble');
    f.draw();
    assert.ok(true, 'all pass');
  });

  test('Clef End Test', () => {
    const assert = createAssert();
    const f = new Factory({ renderer: { elementId: createTestElement(), backend: 1, width: 800, height: 120 } });
    f.Stave()
      .addClef('bass')
      .addEndClef('treble')
      .addEndClef('treble', 'default', '8va')
      .addEndClef('treble', 'default', '8vb')
      .addEndClef('alto')
      .addEndClef('tenor')
      .addEndClef('soprano')
      .addEndClef('bass')
      .addEndClef('bass', 'default', '8vb')
      .addEndClef('mezzo-soprano')
      .addEndClef('baritone-c')
      .addEndClef('baritone-f')
      .addEndClef('subbass')
      .addEndClef('percussion')
      .addEndClef('french');
    f.draw();
    assert.ok(true, 'all pass');
  });

  test('Small Clef Test', () => {
    const assert = createAssert();
    const f = new Factory({ renderer: { elementId: createTestElement(), backend: 1, width: 800, height: 120 } });
    f.Stave()
      .addClef('treble', 'small')
      .addClef('treble', 'small', '8va')
      .addClef('treble', 'small', '8vb')
      .addClef('alto', 'small')
      .addClef('tenor', 'small')
      .addClef('soprano', 'small')
      .addClef('bass', 'small')
      .addClef('bass', 'small', '8vb')
      .addClef('mezzo-soprano', 'small')
      .addClef('baritone-c', 'small')
      .addClef('baritone-f', 'small')
      .addClef('subbass', 'small')
      .addClef('percussion', 'small')
      .addClef('french', 'small')
      .addEndClef('treble', 'small');
    f.draw();
    assert.ok(true, 'all pass');
  });

  test('Small Clef End Test', () => {
    const assert = createAssert();
    const f = new Factory({ renderer: { elementId: createTestElement(), backend: 1, width: 800, height: 120 } });
    f.Stave()
      .addClef('bass', 'small')
      .addEndClef('treble', 'small')
      .addEndClef('treble', 'small', '8va')
      .addEndClef('treble', 'small', '8vb')
      .addEndClef('alto', 'small')
      .addEndClef('tenor', 'small')
      .addEndClef('soprano', 'small')
      .addEndClef('bass', 'small')
      .addEndClef('bass', 'small', '8vb')
      .addEndClef('mezzo-soprano', 'small')
      .addEndClef('baritone-c', 'small')
      .addEndClef('baritone-f', 'small')
      .addEndClef('subbass', 'small')
      .addEndClef('percussion', 'small')
      .addEndClef('french', 'small');
    f.draw();
    assert.ok(true, 'all pass');
  });

  test('Clef Change Test', () => {
    const assert = createAssert();
    const f = new Factory({ renderer: { elementId: createTestElement(), backend: 1, width: 800, height: 180 } });
    const stave = f.Stave().addClef('treble');
    const notes = [
      f.StaveNote({ keys: ['c/4'], duration: '4', clef: 'treble' }),
      f.ClefNote({ type: 'alto', options: { size: 'small' } }),
      f.StaveNote({ keys: ['c/4'], duration: '4', clef: 'alto' }),
      f.ClefNote({ type: 'tenor', options: { size: 'small' } }),
      f.StaveNote({ keys: ['c/4'], duration: '4', clef: 'tenor' }),
      f.ClefNote({ type: 'soprano', options: { size: 'small' } }),
      f.StaveNote({ keys: ['c/4'], duration: '4', clef: 'soprano' }),
      f.ClefNote({ type: 'bass', options: { size: 'small' } }),
      f.StaveNote({ keys: ['c/4'], duration: '4', clef: 'bass' }),
      f.ClefNote({ type: 'mezzo-soprano', options: { size: 'small' } }),
      f.StaveNote({ keys: ['c/4'], duration: '4', clef: 'mezzo-soprano' }),
      f.ClefNote({ type: 'baritone-c', options: { size: 'small' } }),
      f.StaveNote({ keys: ['c/4'], duration: '4', clef: 'baritone-c' }),
      f.ClefNote({ type: 'baritone-f', options: { size: 'small' } }),
      f.StaveNote({ keys: ['c/4'], duration: '4', clef: 'baritone-f' }),
      f.ClefNote({ type: 'subbass', options: { size: 'small' } }),
      f.StaveNote({ keys: ['c/4'], duration: '4', clef: 'subbass' }),
      f.ClefNote({ type: 'french', options: { size: 'small' } }),
      f.StaveNote({ keys: ['c/4'], duration: '4', clef: 'french' }),
      f.ClefNote({ type: 'treble', options: { size: 'small', annotation: '8vb' } }),
      f.StaveNote({ keys: ['c/4'], duration: '4', clef: 'treble', octave_shift: -1 }),
      f.ClefNote({ type: 'treble', options: { size: 'small', annotation: '8va' } }),
      f.StaveNote({ keys: ['c/4'], duration: '4', clef: 'treble', octave_shift: 1 }),
    ];
    const voice = f.Voice({ time: '12/4' }).addTickables(notes);
    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);
    f.draw();
    assert.ok(true, 'all pass');
  });
});
