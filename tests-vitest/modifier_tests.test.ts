// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// ModifierContext Tests - Vitest Version

import { Modifier, ModifierContext } from '../src/index';

import { afterAll, beforeAll, describe, test } from 'vitest';

import { Flow } from '../src/flow';
import { createAssert, FONT_STACKS } from './vitest_test_helpers';

describe('ModifierContext', () => {
  let originalFontNames: string[];

  beforeAll(async () => {
    originalFontNames = Flow.getMusicFont();
    Flow.setMusicFont(...FONT_STACKS['Bravura']);
  });

  afterAll(() => {
    Flow.setMusicFont(...originalFontNames);
  });

  test('Modifier Width Test', () => {
    const assert = createAssert();
    const mc = new ModifierContext();
    assert.equal(mc.getWidth(), 0, 'New modifier context has no width');
  });

  test('Modifier Management', () => {
    const assert = createAssert();
    const mc = new ModifierContext();
    const modifier1 = new Modifier();
    const modifier2 = new Modifier();

    mc.addMember(modifier1);
    mc.addMember(modifier2);

    const modifiers = mc.getMembers(Modifier.CATEGORY);
    assert.equal(modifiers.length, 2, 'Added two modifiers');
  });
});
