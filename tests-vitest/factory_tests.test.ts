// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Factory Tests - Vitest Version

import { afterAll, beforeAll, describe, test } from 'vitest';

import { Factory } from '../src/factory';
import { Flow } from '../src/flow';
import { Barline } from '../src/stavebarline';
import { createAssert, FONT_STACKS, makeFactory } from './vitest_test_helpers';

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

describe('Factory', () => {
  let originalFontNames: string[];

  beforeAll(async () => {
    originalFontNames = Flow.getMusicFont();
    Flow.setMusicFont(...FONT_STACKS['Bravura']);
  });

  afterAll(() => {
    Flow.setMusicFont(...originalFontNames);
  });

  test('Defaults', () => {
    const assert = createAssert();

    // Throws RuntimeError: 'HTML DOM element not set in Factory'
    assert.throws(
      () => new Factory({ renderer: { elementId: '', width: 700, height: 500 } }),
      /renderer\.elementId not set/
    );

    const factory = new Factory({
      renderer: { elementId: null, width: 700, height: 500 },
    });

    // eslint-disable-next-line
    // @ts-ignore access a protected member for testing purposes.
    const options = factory.options;
    assert.equal(options.renderer.width, 700);
    assert.equal(options.renderer.height, 500);
    assert.equal(options.renderer.elementId, null);
    assert.equal(options.stave.space, 10);
  });

  test('Draw', () => {
    const assert = createAssert();
    const elementId = createTestElement();
    const f = Factory.newFromElementId(elementId);
    f.Stave().setClef('treble');
    f.draw();
    assert.ok(true);
  });

  test('Draw Tab (repeat barlines must be aligned)', () => {
    const assert = createAssert();
    const factory = makeFactory(1, createTestElement(), 500, 400);
    const system = factory.System({ width: 500 });
    const stave = factory.Stave().setClef('treble').setKeySignature('C#').setBegBarType(Barline.type.REPEAT_BEGIN);
    const voices = [factory.Voice().addTickables([factory.GhostNote({ duration: 'w' })])];
    system.addStave({ stave, voices });

    const tabStave = factory.TabStave().setClef('tab').setBegBarType(Barline.type.REPEAT_BEGIN);
    const tabVoices = [factory.Voice().addTickables([factory.GhostNote({ duration: 'w' })])];
    system.addStave({ stave: tabStave, voices: tabVoices });

    factory.draw();
    assert.equal(stave.getModifiers()[0].getX(), tabStave.getModifiers()[0].getX());
  });
});
