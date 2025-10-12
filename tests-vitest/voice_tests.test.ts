// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Voice Tests - Vitest Version

import { afterAll, beforeAll, describe, test } from 'vitest';

import { Flow } from '../src/flow';
import { Formatter } from '../src/formatter';
import { Renderer } from '../src/renderer';
import { Stave } from '../src/stave';
import { Barline } from '../src/stavebarline';
import { StaveNote } from '../src/stavenote';
import { Voice } from '../src/voice';
import { MockTickable } from './mocks';
import { createAssert, FONT_STACKS } from './vitest_test_helpers';

function createTestElement() {
  const elementId = 'test_' + Date.now() + '_' + Math.random();
  const element = document.createElement('canvas');
  element.id = elementId;
  document.body.appendChild(element);
  return elementId;
}

const BEAT = (1 * Flow.RESOLUTION) / 4;

// Helper function to create a tickable with a preset number of ticks.
const createTickable = () => new MockTickable().setTicks(BEAT);

describe('Voice', () => {
  let originalFontNames: string[];

  beforeAll(async () => {
    originalFontNames = Flow.getMusicFont();
    Flow.setMusicFont(...FONT_STACKS['Bravura']);
  });

  afterAll(() => {
    Flow.setMusicFont(...originalFontNames);
  });

  test('Strict Test', () => {
    const assert = createAssert();

    const tickables = [createTickable(), createTickable(), createTickable()];

    const voice = new Voice(Flow.TIME4_4);
    assert.equal(voice.getTotalTicks().value(), BEAT * 4, '4/4 Voice has 4 beats');
    assert.equal(voice.getTicksUsed().value(), BEAT * 0, 'No beats in voice');
    voice.addTickables(tickables);
    assert.equal(voice.getTicksUsed().value(), BEAT * 3, 'Three beats in voice');
    voice.addTickable(createTickable());
    assert.equal(voice.getTicksUsed().value(), BEAT * 4, 'Four beats in voice');
    assert.equal(voice.isComplete(), true, 'Voice is complete');

    const numeratorBeforeException = voice.getTicksUsed().numerator;
    assert.throws(() => voice.addTickable(createTickable()), /BadArgument/, '"Too many ticks" exception');

    // Verify that adding too many ticks does not affect the `ticksUsed` property of the voice.
    // See voice.ts: this.ticksUsed.subtract(ticks);
    assert.equal(
      voice.getTicksUsed().numerator,
      numeratorBeforeException,
      'Revert `ticksUsed` after a "Too many ticks" exception'
    );

    assert.equal(voice.getSmallestTickCount().value(), BEAT, 'Smallest tick count is BEAT');
  });

  test('Ignore Test', () => {
    const assert = createAssert();
    const tickables = [
      createTickable(),
      createTickable(),
      createTickable().setIgnoreTicks(true),
      createTickable(),
      createTickable().setIgnoreTicks(true),
      createTickable(),
    ];

    const voice = new Voice(Flow.TIME4_4);
    voice.addTickables(tickables);
    assert.ok(true, 'all pass');
  });

  test('Full Voice Mode Test', () => {
    const assert = createAssert();
    const elementId = createTestElement();
    const ctx = Renderer.getCanvasContext(elementId, 550, 200);

    const stave = new Stave(10, 50, 500).addClef('treble').addTimeSignature('4/4').setEndBarType(Barline.type.END);

    const notes = [
      new StaveNote({ keys: ['c/4'], duration: '4' }),
      new StaveNote({ keys: ['d/4'], duration: '4' }),
      new StaveNote({ keys: ['r/4'], duration: '4r' }),
    ];

    notes.forEach((note) => note.setStave(stave));

    const voice = new Voice(Flow.TIME4_4).setMode(Voice.Mode.FULL).addTickables(notes);

    new Formatter().joinVoices([voice]).formatToStave([voice], stave);

    stave.setContext(ctx).draw();
    voice.draw(ctx);
    const bb = voice.getBoundingBox();
    if (bb) {
      ctx.rect(bb.getX(), bb.getY(), bb.getW(), bb.getH());
    }
    ctx.stroke();

    assert.throws(
      () => voice.addTickable(new StaveNote({ keys: ['c/4'], duration: '2' })),
      /BadArgument/,
      'Voice cannot exceed full amount of ticks'
    );
  });
});
