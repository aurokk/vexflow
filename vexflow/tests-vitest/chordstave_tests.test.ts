// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// ChordStave Tests - Vitest Version

import { describe, test } from 'vitest';

import { ChordNote } from '../src/chordnote';
import { ChordStave } from '../src/chordstave';
import { Flow } from '../src/flow';
import { ContextBuilder, Renderer } from '../src/renderer';
import { Barline, BarlineType } from '../src/stavebarline';
import { createAssert, expectMatchingScreenshot, FONT_STACKS, generateTestID, makeFactory, TestOptions } from './vitest_test_helpers';

describe('ChordStave', () => {
  // Helper function to run a test with multiple backends and font stacks
  async function runTest(
    testName: string,
    testFunc: (options: TestOptions, contextBuilder: ContextBuilder) => void | Promise<void>,
    backends: Array<{ backend: number; fontStacks: string[] }> = [
      { backend: Renderer.Backends.CANVAS, fontStacks: ['Bravura'] },
      { backend: Renderer.Backends.SVG, fontStacks: ['Bravura', 'Gonville', 'Petaluma', 'Leland'] },
    ]
  ) {
    backends.forEach(({ backend, fontStacks }) => {
      fontStacks.forEach((fontStackName) => {
        test(`${testName} - ${backend === Renderer.Backends.SVG ? 'SVG' : 'Canvas'} - ${fontStackName}`, async () => {
          const elementId = generateTestID('chordstave_test');

          // Create the DOM element before the test runs
          const tagName = backend === Renderer.Backends.SVG ? 'div' : 'canvas';
          const element = document.createElement(tagName);
          element.id = elementId;
          document.body.appendChild(element);

          const options: TestOptions = { elementId, params: {}, backend, testName, fontStackName };

          // Set font stack
          const originalFontNames = Flow.getMusicFont();
          Flow.setMusicFont(...FONT_STACKS[fontStackName]);

          try {
            const contextBuilder: ContextBuilder =
              backend === Renderer.Backends.SVG ? Renderer.getSVGContext : Renderer.getCanvasContext;
            await testFunc(options, contextBuilder);
          } finally {
            // Restore original font
            Flow.setMusicFont(...originalFontNames);
            // Don't remove the element so we can see rendered output
            // element.remove();
          }
        });
      });
    });
  }

  runTest('ChordStave Draw Test', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const ctx = contextBuilder(options.elementId, 400, 160);

    const stave = new ChordStave(10, 10, 300);
    stave.setContext(ctx);
    stave.draw();

    await expectMatchingScreenshot(options, 'chordstave_tests.test.ts');

    // ChordStave doesn't have getYForNote - it only has getYForLine
    const assert = createAssert();
    assert.equal(stave.getYForLine(5), 145, 'getYForLine(5)');
    assert.equal(stave.getYForLine(0), 70, 'getYForLine(0) - Top Line');
    assert.equal(stave.getYForLine(4), 130, 'getYForLine(4) - Bottom Line');
    assert.ok(true, 'all pass');
  });

  runTest('ChordStave with Time Signature', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const ctx = contextBuilder(options.elementId, 500, 160);

    const stave = new ChordStave(10, 10, 400);
    stave.setContext(ctx);

    // Add a time signature
    stave.addTimeSignature('4/4');

    stave.draw();

    await expectMatchingScreenshot(options, 'chordstave_tests.test.ts');

    // Verify modifier was added
    const modifiers = stave.getModifiers();
    const assert = createAssert();
    assert.equal(modifiers.length, 1, 'Should have 1 modifier');
    assert.ok(true, 'Time signature renders successfully');
  });

  runTest('Multiple ChordStaves (4x4 Grid)', async (options: TestOptions) => {
    // Create a large canvas for 4 lines of 4 staves each
    const staveWidth = 200;
    const timeSignatureWidth = 40;
    const padding = 10;
    const canvasWidth = padding + timeSignatureWidth + staveWidth * 4 + timeSignatureWidth + padding;
    const f = makeFactory(options.backend, options.elementId, canvasWidth, 400, options);

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

    await expectMatchingScreenshot(options, 'chordstave_tests.test.ts');

    const assert = createAssert();
    assert.equal(chordIndex, 16, 'Should render 16 chords');
    assert.ok(true, '16 ChordStaves with chords render successfully');
  });
});
