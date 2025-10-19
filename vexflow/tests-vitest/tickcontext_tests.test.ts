// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// TickContext Tests - Vitest Version

import { afterAll, beforeAll, describe, test } from 'vitest';

import { Flow } from '../src/flow';
import { TickContext } from '../src/tickcontext';
import { MockTickable } from './mocks';
import { createAssert, FONT_STACKS } from './vitest_test_helpers';

describe('TickContext', () => {
  let originalFontNames: string[];

  beforeAll(async () => {
    originalFontNames = Flow.getMusicFont();
    Flow.setMusicFont(...FONT_STACKS['Bravura']);
  });

  afterAll(() => {
    Flow.setMusicFont(...originalFontNames);
  });

  test('Current Tick Test', () => {
    const assert = createAssert();
    const tc = new TickContext();
    assert.equal(tc.getCurrentTick().value(), 0, 'New tick context has no ticks');
  });

  test('Tracking Test', () => {
    const assert = createAssert();
    const BEAT = (1 * Flow.RESOLUTION) / 4;

    const tickables = [
      new MockTickable().setTicks(BEAT).setWidth(10),
      new MockTickable().setTicks(BEAT * 2).setWidth(20),
      new MockTickable().setTicks(BEAT).setWidth(30),
    ];

    const tc = new TickContext();
    tc.setPadding(0);

    tc.addTickable(tickables[0]);
    assert.equal(tc.getMaxTicks().value(), BEAT);

    tc.addTickable(tickables[1]);
    assert.equal(tc.getMaxTicks().value(), BEAT * 2);

    tc.addTickable(tickables[2]);
    assert.equal(tc.getMaxTicks().value(), BEAT * 2);

    assert.equal(tc.getWidth(), 0);
    tc.preFormat();
    assert.equal(tc.getWidth(), 30);
  });
});
