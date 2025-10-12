// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// ChordStave Tests - Vitest Version

import { afterAll, beforeAll, describe, test } from 'vitest';

import { ChordNote } from '../src/chordnote';
import { ChordStave } from '../src/chordstave';
import { Flow } from '../src/flow';
import { Renderer } from '../src/renderer';
import { Barline, BarlineType } from '../src/stavebarline';
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

describe('ChordStave', () => {
  let originalFontNames: string[];

  beforeAll(async () => {
    originalFontNames = Flow.getMusicFont();
    Flow.setMusicFont(...FONT_STACKS['Bravura']);
  });

  afterAll(() => {
    Flow.setMusicFont(...originalFontNames);
  });

  test('ChordStave Draw Test', () => {
    const assert = createAssert();
    const elementId = createTestElement();
    const renderer = new Renderer(elementId, Renderer.Backends.CANVAS);
    renderer.resize(400, 160);
    const ctx = renderer.getContext();

    const stave = new ChordStave(10, 10, 300);
    stave.setContext(ctx);
    stave.draw();

    // ChordStave doesn't have getYForNote - it only has getYForLine
    assert.equal(stave.getYForLine(5), 145, 'getYForLine(5)');
    assert.equal(stave.getYForLine(0), 70, 'getYForLine(0) - Top Line');
    assert.equal(stave.getYForLine(4), 130, 'getYForLine(4) - Bottom Line');

    assert.ok(true, 'all pass');
  });

  test('ChordStave with Time Signature', () => {
    const assert = createAssert();
    const elementId = createTestElement();
    const renderer = new Renderer(elementId, Renderer.Backends.CANVAS);
    renderer.resize(500, 160);
    const ctx = renderer.getContext();

    const stave = new ChordStave(10, 10, 400);
    stave.setContext(ctx);

    // Add a time signature
    stave.addTimeSignature('4/4');

    stave.draw();

    // Verify modifier was added
    const modifiers = stave.getModifiers();
    assert.equal(modifiers.length, 1, 'Should have 1 modifier');
    assert.ok(true, 'Time signature renders successfully');
  });

  test('Multiple ChordStaves (4x4 Grid)', () => {
    const assert = createAssert();

    // Create a large canvas for 4 lines of 4 staves each
    const staveWidth = 200;
    const timeSignatureWidth = 40;
    const padding = 10;
    const canvasWidth = padding + timeSignatureWidth + staveWidth * 4 + timeSignatureWidth + padding;
    const f = makeFactory(1, createTestElement(), canvasWidth, 400);

    const startX = padding + timeSignatureWidth;
    const startY = 10;
    const spacingX = 200; // No padding between staves
    const spacingY = 100;

    // Define 16 different chords to display
    const chords = [
      { root: 'C', ext: 'maj7' },
      { root: 'D', ext: 'min7' },
      { root: 'E', ext: '7' },
      { root: 'F', ext: 'maj' },
      { root: 'G', ext: '7' },
      { root: 'A', ext: 'min' },
      { root: 'B', ext: 'dim' },
      { root: 'C', ext: '#5' },
      { root: 'D', ext: 'sus4' },
      { root: 'E', ext: 'min7' },
      { root: 'F', ext: '#7' },
      { root: 'G', ext: 'min' },
      { root: 'A', ext: '7' },
      { root: 'B', ext: 'b7' },
      { root: 'C', ext: 'dim7' },
      { root: 'D', ext: 'aug' },
    ];

    let chordIndex = 0;

    // Create a time signature stave to display before the first row
    const timeSigStave = new ChordStave(10, startY, timeSignatureWidth, { space_above_staff_ln: 2 });
    timeSigStave.setContext(f.getContext());
    timeSigStave.addTimeSignature('4/4');
    timeSigStave.draw();

    // Create 4 lines of 4 staves
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const x = startX + col * spacingX;
        const y = startY + row * spacingY;

        // Create ChordStave with custom spacing to center content better
        const stave = new ChordStave(x, y, staveWidth, { space_above_staff_ln: 2 });
        const ctx = f.getContext();
        stave.setContext(ctx);

        // Add barline at the beginning of each stave
        const beginBarline = new Barline(BarlineType.SINGLE);
        beginBarline.setX(x);
        stave.addBarline(beginBarline);

        // Add end barline at the end of each line (last column of each row)
        if (col === 3) {
          const endBarline = new Barline(row === 3 ? BarlineType.END : BarlineType.SINGLE);
          endBarline.setX(x + staveWidth - 1);
          stave.addBarline(endBarline);
        }

        stave.draw();

        // Create ChordNote with a chord symbol centered vertically (line 2 is middle of 5-line staff)
        const chord = chords[chordIndex];
        const chordNote = new ChordNote({ duration: 'w' }, { line: 2 })
          .addText(chord.root)
          .addTextSuperscript(chord.ext);

        chordNote.setStave(stave);
        chordNote.setContext(f.getContext());

        // Create a voice and format it with padding: 8px left margin + chord width + 8px right margin
        const voice = f.Voice().setStrict(false).addTickables([chordNote]);
        const formatterWidth = staveWidth - 16; // Reserve 8px on each side
        f.Formatter().joinVoices([voice]).format([voice], formatterWidth, { align_rests: false });

        // Manually adjust position to add 8px left padding
        const tickContext = chordNote.getTickContext();
        if (tickContext) {
          tickContext.setX(8);
        }

        // Draw the chord note
        chordNote.draw();

        chordIndex++;
      }
    }

    assert.equal(chordIndex, 16, 'Should render 16 chords');
    assert.ok(true, '16 ChordStaves with chords render successfully');
  });
});
