// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// ChordNote Tests - Vitest Version

import { afterAll, beforeAll, describe, test } from 'vitest';

import { ChordNote } from '../src/chordnote';
import { Flow } from '../src/flow';
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

describe('ChordNote', () => {
  let originalFontNames: string[];

  beforeAll(async () => {
    originalFontNames = Flow.getMusicFont();
    Flow.setMusicFont(...FONT_STACKS['Bravura']);
  });

  afterAll(() => {
    Flow.setMusicFont(...originalFontNames);
  });

  test('ChordNote - Basic Rendering', () => {
    const assert = createAssert();
    const f = makeFactory(1, createTestElement(), 600, 200);
    const stave = f.ChordStave({ x: 10, y: 40, width: 500 });

    // Create a chord note with chord symbols
    const chordNote = new ChordNote({ duration: 'q' }, { line: 0 }).addText('C').addTextSuperscript('maj7');

    chordNote.setStave(stave);
    chordNote.setContext(f.getContext());

    const voice = f.Voice().setStrict(false).addTickables([chordNote]);

    f.Formatter().joinVoices([voice]).format([voice], 500);
    f.draw();

    assert.ok(true, 'ChordNote renders successfully');
  });

  test('ChordNote - Multiple Chords', () => {
    const assert = createAssert();
    const f = makeFactory(1, createTestElement(), 600, 200);
    const stave = f.ChordStave({ x: 10, y: 40, width: 500 });

    const chordNote1 = new ChordNote({ duration: 'q' }, { line: 0 }).addText('C').addTextSuperscript('maj7');

    const chordNote2 = new ChordNote({ duration: 'q' }, { line: 0 })
      .addText('D')
      .addGlyph('minor')
      .addTextSuperscript('7');

    const chordNote3 = new ChordNote({ duration: 'h' }, { line: 0 }).addText('G').addTextSuperscript('7');

    chordNote1.setStave(stave);
    chordNote2.setStave(stave);
    chordNote3.setStave(stave);

    const voice = f.Voice().setStrict(false).addTickables([chordNote1, chordNote2, chordNote3]);

    f.Formatter().joinVoices([voice]).format([voice], 500);
    f.draw();

    assert.ok(true, 'Multiple ChordNotes render successfully');
  });

  test('ChordNote - Different Positions', () => {
    const assert = createAssert();
    const f = makeFactory(1, createTestElement(), 600, 300);
    const stave = f.ChordStave({ x: 10, y: 40, width: 500 });

    const chordNote1 = new ChordNote({ duration: 'q' }, { line: 0 }).addText('C').addTextSuperscript('maj7');

    const chordNote2 = new ChordNote({ duration: 'q' }, { line: 2.5 })
      .addText('F')
      .addGlyph('#')
      .addTextSuperscript('7');

    const chordNote3 = new ChordNote({ duration: 'q' }, { line: 4 }).addText('B').addGlyph('b').addGlyph('minor');

    chordNote1.setStave(stave);
    chordNote2.setStave(stave);
    chordNote3.setStave(stave);

    const voice = f.Voice().setStrict(false).addTickables([chordNote1, chordNote2, chordNote3]);

    f.Formatter().joinVoices([voice]).format([voice], 500);
    f.draw();

    assert.ok(true, 'ChordNotes at different positions render successfully');
  });

  test('ChordNote - Complex Chords', () => {
    const assert = createAssert();
    const f = makeFactory(1, createTestElement(), 800, 200);
    const stave = f.ChordStave({ x: 10, y: 40, width: 750 });

    // Test various complex chord notations
    const chordNote1 = new ChordNote({ duration: 'q' }, { line: 0 })
      .addText('C')
      .addGlyph('minor')
      .addTextSuperscript('7')
      .addGlyph('b')
      .addTextSuperscript('5');

    const chordNote2 = new ChordNote({ duration: 'q' }, { line: 0 }).addText('F').addGlyph('#').addGlyph('dim');

    const chordNote3 = new ChordNote({ duration: 'q' }, { line: 0 })
      .addText('A')
      .addGlyph('b')
      .addGlyph('majorSeventh');

    const chordNote4 = new ChordNote({ duration: 'q' }, { line: 0 }).addGlyphOrText('(#9)');

    chordNote1.setStave(stave);
    chordNote2.setStave(stave);
    chordNote3.setStave(stave);
    chordNote4.setStave(stave);

    const voice = f.Voice().setStrict(false).addTickables([chordNote1, chordNote2, chordNote3, chordNote4]);

    f.Formatter().joinVoices([voice]).format([voice], 500);
    f.draw();

    assert.ok(true, 'Complex ChordNotes render successfully');
  });

  test('ChordNote - Over Bar Notation', () => {
    const assert = createAssert();
    const f = makeFactory(1, createTestElement(), 600, 200);
    const stave = f.ChordStave({ x: 10, y: 40, width: 500 });

    // Test over bar notation (C/G means C chord over G bass)
    const chordNote1 = new ChordNote({ duration: 'q' }, { line: 0 }).addText('C').addGlyph('/').addText('G');

    const chordNote2 = new ChordNote({ duration: 'q' }, { line: 0 })
      .addText('D')
      .addGlyph('minor')
      .addGlyph('/')
      .addText('F');

    const chordNote3 = new ChordNote({ duration: 'h' }, { line: 0 })
      .addText('F')
      .addGlyph('#')
      .addTextSuperscript('7')
      .addGlyph('/')
      .addText('A')
      .addGlyph('#');

    chordNote1.setStave(stave);
    chordNote2.setStave(stave);
    chordNote3.setStave(stave);

    const voice = f.Voice().setStrict(false).addTickables([chordNote1, chordNote2, chordNote3]);

    f.Formatter().joinVoices([voice]).format([voice], 500);
    f.draw();

    assert.ok(true, 'Over bar notation ChordNotes render successfully');
  });
});
