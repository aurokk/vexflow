// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author: Ron B. Yeh
// MIT License
//
// TypeGuard Tests - Vitest Version

// eslint-disable-next-line
// @ts-nocheck to support ES5 style class declaration in the fakeES5() test case.

import { afterAll, beforeAll, describe, test } from 'vitest';

import { CanvasContext } from '../src/canvascontext';
import { Flow } from '../src/flow';
import { StaveNote } from '../src/stavenote';
import { StemmableNote } from '../src/stemmablenote';
import { TabNote } from '../src/tabnote';
import { isCategory, isNote, isRenderContext, isStaveNote, isStemmableNote, isTabNote } from '../src/typeguard';
import { createAssert, FONT_STACKS } from './vitest_test_helpers';

/**
 * Helper function to test the fake VexFlow objects we create in fakeES5() and fakeES6().
 */
function checkFakeObjects(
  assert: ReturnType<typeof createAssert>,
  fakeStemmableNote: unknown,
  fakeStaveNote: unknown
): void {
  assert.ok(isStemmableNote(fakeStemmableNote), 'Fake StemmableNote is a StemmableNote.');
  assert.notEqual(
    isNote(fakeStemmableNote),
    true,
    'Fake StemmableNote is not a Note (no ancestors with the correct CATEGORY).'
  );

  assert.ok(isCategory(fakeStaveNote, 'StaveNote'), 'Fake StaveNote is a StaveNote.');
  assert.ok(isStaveNote(fakeStaveNote), 'Fake StaveNote is a StaveNote (via helper function).');
  assert.ok(isCategory(fakeStaveNote, 'StemmableNote'), 'Fake StaveNote is also a StemmableNote (via inheritance).');
  assert.notEqual(isNote(fakeStaveNote), true, 'Fake StaveNote is not a Note. CATEGORY does not match.');
}

describe('TypeGuard', () => {
  let originalFontNames: string[];

  beforeAll(async () => {
    originalFontNames = Flow.getMusicFont();
    Flow.setMusicFont(...FONT_STACKS['Bravura']);
  });

  afterAll(() => {
    Flow.setMusicFont(...originalFontNames);
  });

  test('Real VexFlow Types', () => {
    const assert = createAssert();
    const s = new StaveNote({ keys: ['c/4'], duration: 'w' });
    assert.ok(isStaveNote(s), 'isStaveNote helper function');
    assert.ok(isCategory(s, 'StaveNote'), 'Use isCategory(s, "StaveNote") directly');
    assert.notEqual(isTabNote(s), true, 'isTabNote helper function. s is NOT a TabNote.');

    const t = new TabNote({ positions: [{ str: 2, fret: 1 }], duration: '1' });
    assert.ok(isTabNote(t), 'isTabNote helper function');
    assert.notEqual(isStaveNote(t), true, 't is NOT a StaveNote');

    assert.ok(isNote(s), 'StaveNote extends StemmableNote which extends Note, so s is a Note');
    assert.ok(isStemmableNote(t), 'TabNote extends StemmableNote');
    assert.ok(isNote(t), 'TabNote extends StemmableNote which extends Note, so t is a Note');

    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 400;
    const ctx = new CanvasContext(canvas.getContext('2d') as CanvasRenderingContext2D);
    assert.ok(isRenderContext(ctx), 'ctx is a RenderContext');
  });

  test('Fake VexFlow Types in ES5', () => {
    const assert = createAssert();
    function FakeStemmableNote() {
      this.isFake = true;
    }
    FakeStemmableNote.CATEGORY = StemmableNote.CATEGORY;

    function FakeStaveNote() {
      FakeStemmableNote.call(this);
    }
    FakeStaveNote.CATEGORY = StaveNote.CATEGORY;
    FakeStaveNote.prototype = Object.create(FakeStemmableNote.prototype);
    FakeStaveNote.prototype.constructor = FakeStaveNote;

    const fakeStemmableNote = new FakeStemmableNote();
    const fakeStaveNote = new FakeStaveNote();
    checkFakeObjects(assert, fakeStemmableNote, fakeStaveNote);
  });

  test('Fake VexFlow Types in ES6', () => {
    const assert = createAssert();
    class FakeStemmableNote {
      static CATEGORY = StemmableNote.CATEGORY;
    }
    class FakeStaveNote extends FakeStemmableNote {
      static CATEGORY = StaveNote.CATEGORY;
    }

    const fakeStemmableNote = new FakeStemmableNote();
    const fakeStaveNote = new FakeStaveNote();
    checkFakeObjects(assert, fakeStemmableNote, fakeStaveNote);
  });

  test('Edge Case ES5/ES6', () => {
    const assert = createAssert();
    class Z extends Object {}
    class Y extends Z {}
    class X extends Y {}
    const zInstance = new Z();
    const xInstance = new X();

    assert.ok(xInstance instanceof Object, 'es5 & es6: x IS an instanceof Object');

    // If targeting es5, these three assertions only pass if we remove "extends Object" from the class Z definition.
    assert.ok(zInstance instanceof Z, 'es6: z IS an instanceof Z');
    assert.ok(xInstance instanceof Y, 'es6: x IS an instanceof Y');
    assert.ok(xInstance instanceof Z, 'es6: x IS an instanceof Z');
  });
});
