// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// StaveModifier Tests - Vitest Version

import { afterAll, beforeAll, describe, test } from 'vitest';

import { Flow } from '../src/flow';
import { Renderer } from '../src/renderer';
import { Stave } from '../src/stave';
import { BarlineType } from '../src/stavebarline';
import { StaveModifierPosition } from '../src/stavemodifier';
import { createAssert, FONT_STACKS } from './vitest_test_helpers';

function createTestElement() {
  const elementId = 'test_' + Date.now() + '_' + Math.random();
  const element = document.createElement('canvas');
  element.id = elementId;
  document.body.appendChild(element);
  return elementId;
}

describe('StaveModifier', () => {
  let originalFontNames: string[];

  beforeAll(async () => {
    originalFontNames = Flow.getMusicFont();
    Flow.setMusicFont(...FONT_STACKS['Bravura']);
  });

  afterAll(() => {
    Flow.setMusicFont(...originalFontNames);
  });

  test('Stave Draw Test', () => {
    const assert = createAssert();
    const elementId = createTestElement();
    const ctx = Renderer.getCanvasContext(elementId, 400, 120);
    const stave = new Stave(10, 10, 300);
    stave.setContext(ctx);
    stave.draw();

    assert.equal(stave.getYForNote(0), 100, 'getYForNote(0)');
    assert.equal(stave.getYForLine(5), 100, 'getYForLine(5)');
    assert.equal(stave.getYForLine(0), 50, 'getYForLine(0) - Top Line');
    assert.equal(stave.getYForLine(4), 90, 'getYForLine(4) - Bottom Line');

    assert.ok(true, 'all pass');
  });

  test('Begin & End StaveModifier Test', () => {
    const assert = createAssert();
    const elementId = createTestElement();
    const ctx = Renderer.getCanvasContext(elementId, 500, 240);
    const stave = new Stave(10, 10, 400);
    stave.setContext(ctx);
    stave.setTimeSignature('C|');
    stave.setKeySignature('Db');
    stave.setClef('treble');
    stave.setBegBarType(BarlineType.REPEAT_BEGIN);
    stave.setEndClef('alto');
    stave.setEndTimeSignature('9/8');
    stave.setEndKeySignature('G', 'C#');
    stave.setEndBarType(BarlineType.DOUBLE);
    stave.draw();

    // change
    const END = StaveModifierPosition.END;
    stave.setY(100);
    stave.setTimeSignature('3/4');
    stave.setKeySignature('G', 'C#');
    stave.setClef('bass');
    stave.setBegBarType(BarlineType.SINGLE);
    stave.setClef('treble', undefined, undefined, END);
    stave.setTimeSignature('C', undefined, END);
    stave.setKeySignature('F', undefined, END);
    stave.setEndBarType(BarlineType.SINGLE);
    stave.draw();

    assert.ok(true, 'all pass');
  });
});
