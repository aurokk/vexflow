// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// TimeSignature Tests - Vitest Version

import { afterAll, beforeAll, describe, test } from 'vitest';

import { Flow } from '../src/flow';
import { Renderer } from '../src/renderer';
import { Stave, StaveLineConfig } from '../src/stave';
import { StaveConnector } from '../src/staveconnector';
import { TimeSignature } from '../src/timesignature';
import { createAssert, FONT_STACKS, makeFactory } from './vitest_test_helpers';

function createTestElement() {
  const elementId = 'test_' + Date.now() + '_' + Math.random();
  const element = document.createElement('canvas');
  element.id = elementId;
  document.body.appendChild(element);
  return elementId;
}

describe('TimeSignature', () => {
  let originalFontNames: string[];

  beforeAll(async () => {
    originalFontNames = Flow.getMusicFont();
    Flow.setMusicFont(...FONT_STACKS['Bravura']);
  });

  afterAll(() => {
    Flow.setMusicFont(...originalFontNames);
  });

  test('Time Signature Parser', () => {
    const assert = createAssert();
    const timeSig = new TimeSignature();
    assert.equal(timeSig.getTimeSpec(), '4/4', 'default time signature is 4/4');

    const mustFail = ['asdf', '123/', '/10', '/', '4567', 'C+', '1+', '+1', '(3+', '+3)', '()', '(+)'];
    mustFail.forEach((invalidString) => {
      assert.throws(() => timeSig.parseTimeSpec(invalidString), /BadTimeSignature/);
    });

    const mustPass = ['4/4', '10/12', '1/8', '1234567890/1234567890', 'C', 'C|', '+'];
    mustPass.forEach((validString) => timeSig.parseTimeSpec(validString));

    timeSig.setTimeSig('4/4');
    assert.equal(timeSig.getIsNumeric(), true, '4/4 is numeric');
    assert.equal(timeSig.getLine(), 0, 'digits are on line 0');
    timeSig.setTimeSig('C|');
    assert.equal(timeSig.getTimeSpec(), 'C|', 'timeSpec changed to C|');
    assert.equal(timeSig.getIsNumeric(), false, 'cut time is not numeric');
    assert.equal(timeSig.getLine(), 2, 'cut/common are on line 2');

    assert.ok(true, 'all pass');
  });

  test('Basic Time Signatures', () => {
    const assert = createAssert();
    const elementId = createTestElement();
    const ctx = Renderer.getCanvasContext(elementId, 600, 120);

    new Stave(10, 10, 500)
      .addTimeSignature('2/2')
      .addTimeSignature('3/4')
      .addTimeSignature('4/4')
      .addTimeSignature('6/8')
      .addTimeSignature('C')
      .addTimeSignature('C|')
      .addEndTimeSignature('2/2')
      .addEndTimeSignature('3/4')
      .addEndTimeSignature('4/4')
      .addEndClef('treble')
      .addEndTimeSignature('6/8')
      .addEndTimeSignature('C')
      .addEndTimeSignature('C|')
      .setContext(ctx)
      .draw();

    assert.ok(true, 'all pass');
  });

  test('Big Signature Test', () => {
    const assert = createAssert();
    const elementId = createTestElement();
    const ctx = Renderer.getCanvasContext(elementId, 400, 120);

    new Stave(10, 10, 300)
      .addTimeSignature('12/8')
      .addTimeSignature('7/16')
      .addTimeSignature('1234567/890')
      .addTimeSignature('987/654321')
      .setContext(ctx)
      .draw();

    assert.ok(true, 'all pass');
  });

  test('Additive Signature Test', () => {
    const assert = createAssert();
    const elementId = createTestElement();
    const ctx = Renderer.getCanvasContext(elementId, 400, 120);

    new Stave(10, 10, 300).addTimeSignature('2+3+2/8').setContext(ctx).draw();

    assert.ok(true, 'all pass');
  });

  test('Alternating Signature Test', () => {
    const assert = createAssert();
    const elementId = createTestElement();
    const ctx = Renderer.getCanvasContext(elementId, 400, 120);

    new Stave(10, 10, 300).addTimeSignature('6/8').addTimeSignature('+').addTimeSignature('3/4').setContext(ctx).draw();

    assert.ok(true, 'all pass');
  });

  test('Interchangeable Signature Test', () => {
    const assert = createAssert();
    const elementId = createTestElement();
    const ctx = Renderer.getCanvasContext(elementId, 400, 120);

    new Stave(10, 10, 300).addTimeSignature('3/4').addTimeSignature('-').addTimeSignature('2/4').setContext(ctx).draw();

    assert.ok(true, 'all pass');
  });

  test('Aggregate Signature Test', () => {
    const assert = createAssert();
    const elementId = createTestElement();
    const ctx = Renderer.getCanvasContext(elementId, 400, 120);

    new Stave(10, 10, 300)
      .addTimeSignature('2/4')
      .addTimeSignature('+')
      .addTimeSignature('3/8')
      .addTimeSignature('+')
      .addTimeSignature('5/4')
      .setContext(ctx)
      .draw();

    assert.ok(true, 'all pass');
  });

  test('Complex Signature Test', () => {
    const assert = createAssert();
    const elementId = createTestElement();
    const ctx = Renderer.getCanvasContext(elementId, 400, 120);

    new Stave(10, 10, 300)
      .addTimeSignature('(2+3)/16')
      .addTimeSignature('+')
      .addTimeSignature('3/8')
      .setContext(ctx)
      .draw();

    assert.ok(true, 'all pass');
  });

  test('Time Signature multiple staves alignment test', () => {
    const assert = createAssert();
    const elementId = createTestElement();
    const ctx = Renderer.getCanvasContext(elementId, 400, 350);

    const stave1LineConfig: StaveLineConfig[] = [false, false, true, false, false].map((visible) => ({ visible }));
    const stave1 = new Stave(15, 0, 300)
      .setConfigForLines(stave1LineConfig)
      .addClef('percussion')
      .addTimeSignature('4/4', 25)
      .setContext(ctx)
      .draw();
    const stave2 = new Stave(15, 110, 300).addClef('treble').addTimeSignature('4/4').setContext(ctx).draw();
    const stave3 = new Stave(15, 220, 300).addClef('bass').addTimeSignature('4/4').setContext(ctx).draw();

    Stave.formatBegModifiers([stave1, stave2, stave3]);

    new StaveConnector(stave1, stave2).setType('single').setContext(ctx).draw();
    new StaveConnector(stave2, stave3).setType('single').setContext(ctx).draw();
    new StaveConnector(stave2, stave3).setType('brace').setContext(ctx).draw();

    assert.ok(true, 'all pass');
  });

  test('Time Signature Change Test', () => {
    const assert = createAssert();
    const f = makeFactory(1, createTestElement(), 900);
    const stave = f.Stave({ x: 0, y: 0 }).addClef('treble').addTimeSignature('C|');

    const tickables = [
      f.StaveNote({ keys: ['c/4'], duration: '4', clef: 'treble' }),
      f.TimeSigNote({ time: '3/4' }),
      f.StaveNote({ keys: ['d/4'], duration: '4', clef: 'alto' }),
      f.StaveNote({ keys: ['b/3'], duration: '4r', clef: 'alto' }),
      f.TimeSigNote({ time: 'C' }),
      f.StaveNote({ keys: ['c/3', 'e/3', 'g/3'], duration: '4', clef: 'bass' }),
      f.TimeSigNote({ time: '9/8' }),
      f.StaveNote({ keys: ['c/4'], duration: '4', clef: 'treble' }),
    ];
    const voice = f.Voice().setStrict(false).addTickables(tickables);

    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);
    f.draw();

    assert.ok(true, 'all pass');
  });
});
