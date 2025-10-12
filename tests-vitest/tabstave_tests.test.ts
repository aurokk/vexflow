// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// TabStave Tests - Vitest Version

import { afterAll, beforeAll, describe, test } from 'vitest';

import { Flow } from '../src/flow';
import { Renderer } from '../src/renderer';
import { TabStave } from '../src/tabstave';
import { createAssert, FONT_STACKS } from './vitest_test_helpers';

function createTestElement() {
  const elementId = 'test_' + Date.now() + '_' + Math.random();
  const element = document.createElement('canvas');
  element.id = elementId;
  document.body.appendChild(element);
  return elementId;
}

describe('TabStave', () => {
  let originalFontNames: string[];

  beforeAll(async () => {
    originalFontNames = Flow.getMusicFont();
    Flow.setMusicFont(...FONT_STACKS['Bravura']);
  });

  afterAll(() => {
    Flow.setMusicFont(...originalFontNames);
  });

  test('TabStave Draw Test', () => {
    const assert = createAssert();
    const elementId = createTestElement();
    const ctx = Renderer.getCanvasContext(elementId, 400, 160);
    const stave = new TabStave(10, 10, 300);
    stave.setNumLines(6);
    stave.setContext(ctx);
    stave.draw();

    assert.equal(stave.getYForNote(0), 127, 'getYForNote(0)');
    assert.equal(stave.getYForLine(5), 127, 'getYForLine(5)');
    assert.equal(stave.getYForLine(0), 62, 'getYForLine(0) - Top Line');
    assert.equal(stave.getYForLine(4), 114, 'getYForLine(4) - Bottom Line');

    assert.ok(true, 'all pass');
  });
});
