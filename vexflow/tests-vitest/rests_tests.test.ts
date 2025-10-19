// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Rests Tests - Vitest Version

import { describe, test } from 'vitest';

import { Beam } from '../src/beam';
import { Dot } from '../src/dot';
import { Flow } from '../src/flow';
import { Formatter } from '../src/formatter';
import { RenderContext } from '../src/rendercontext';
import { Renderer } from '../src/renderer';
import { Stave } from '../src/stave';
import { StaveNote, StaveNoteStruct } from '../src/stavenote';
import { Tuplet } from '../src/tuplet';
import { Voice } from '../src/voice';
import { ContextBuilder, createAssert, expectMatchingScreenshot, FONT_STACKS, generateTestID, TestOptions } from './vitest_test_helpers';

/**
 * Helper function to create a context and stave.
 */
function setupContext(
  contextBuilder: ContextBuilder,
  elementId: string,
  width: number = 350,
  height: number = 150
): { context: RenderContext; stave: Stave } {
  const context = contextBuilder(elementId, width, height);
  context.scale(0.9, 0.9);
  context.font = '10pt Arial';

  const stave = new Stave(10, 30, width).addClef('treble').addTimeSignature('4/4').setContext(context).draw();

  return { context, stave };
}

// Optional: Use a helper function to make your code more concise.
const note = (noteStruct: StaveNoteStruct) => new StaveNote(noteStruct);

describe('Rests', () => {
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
          const elementId = generateTestID('rests_test');

          // Create the DOM element before the test runs
          const tagName = backend === Renderer.Backends.SVG ? 'div' : 'canvas';
          const element = document.createElement(tagName);
          element.id = elementId;
          document.body.appendChild(element);

          const assert = createAssert();
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

  /**
   * Use the ledger glyph if the whole or half rest is above/below the staff
   */
  runTest('Outside Stave', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const { context, stave } = setupContext(contextBuilder, options.elementId, 700);

    const notes = [
      new StaveNote({ keys: ['a/5'], stem_direction: 1, duration: 'wr' }),
      new StaveNote({ keys: ['c/6'], stem_direction: 1, duration: 'hr' }),
      new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: 'hr' }),
      new StaveNote({ keys: ['a/3'], stem_direction: 1, duration: 'wr' }),
      new StaveNote({ keys: ['f/3'], stem_direction: 1, duration: 'hr' }),
      new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: 'wr' }),
    ];
    Formatter.FormatAndDraw(context, stave, notes);

    await expectMatchingScreenshot(options, 'rests_tests.test.ts');
    assert.ok(true, 'Leger/Ledger Rest Test');
  });

  /**
   * Dotted rests (whole to 128th).
   * The rest duration is specified as 'wr', 'hr', ..., '128r'.
   */
  runTest('Dotted', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const { context, stave } = setupContext(contextBuilder, options.elementId, 700);

    const notes = [
      new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '1/2r' }),
      new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: 'wr' }),
      new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: 'hr' }),
      new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '4r' }),
      new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '8r' }),
      new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '16r' }),
      new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '32r' }),
      new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '64r' }),
      new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '128r' }),
      new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '256r' }),
    ];
    Dot.buildAndAttach(notes, { all: true });

    Formatter.FormatAndDraw(context, stave, notes);

    await expectMatchingScreenshot(options, 'rests_tests.test.ts');
    assert.ok(true, 'Dotted Rest Test');
  });

  /**
   * Rests are intermixed within beamed notes (with the stems and beams at the top).
   */
  runTest('Auto Align - Beamed Notes Stems Up', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const { context, stave } = setupContext(contextBuilder, options.elementId, 600, 160);

    const notes = [
      note({ keys: ['e/5'], stem_direction: 1, duration: '8' }),
      note({ keys: ['b/4'], stem_direction: 1, duration: '8r' }),
      note({ keys: ['b/5'], stem_direction: 1, duration: '8' }),
      note({ keys: ['c/5'], stem_direction: 1, duration: '8' }),

      note({ keys: ['b/4', 'd/5', 'a/5'], stem_direction: 1, duration: '8' }),
      note({ keys: ['b/4'], stem_direction: 1, duration: '8r' }),
      note({ keys: ['b/4'], stem_direction: 1, duration: '8r' }),
      note({ keys: ['c/4'], stem_direction: 1, duration: '8' }),

      note({ keys: ['b/4', 'd/5', 'a/5'], stem_direction: 1, duration: '8' }),
      note({ keys: ['b/4'], stem_direction: 1, duration: '8' }),
      note({ keys: ['b/4'], stem_direction: 1, duration: '8r' }),
      note({ keys: ['c/4'], stem_direction: 1, duration: '8' }),
    ];

    const beam1 = new Beam(notes.slice(0, 4));
    const beam2 = new Beam(notes.slice(4, 8));
    const beam3 = new Beam(notes.slice(8, 12));

    Formatter.FormatAndDraw(context, stave, notes);

    beam1.setContext(context).draw();
    beam2.setContext(context).draw();
    beam3.setContext(context).draw();

    await expectMatchingScreenshot(options, 'rests_tests.test.ts');
    assert.ok(true, 'Auto Align Rests - Beams Up Test');
  });

  /**
   * Rests are intermixed within beamed notes (with the stems and beams at the bottom).
   */
  runTest('Auto Align - Beamed Notes Stems Down', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const { context, stave } = setupContext(contextBuilder, options.elementId, 600, 160);

    const notes = [
      note({ keys: ['a/5'], stem_direction: -1, duration: '8' }),
      note({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
      note({ keys: ['b/5'], stem_direction: -1, duration: '8' }),
      note({ keys: ['c/5'], stem_direction: -1, duration: '8' }),

      note({ keys: ['b/4', 'd/5', 'a/5'], stem_direction: -1, duration: '8' }),
      note({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
      note({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
      note({ keys: ['e/4'], stem_direction: -1, duration: '8' }),

      note({ keys: ['b/4', 'd/5', 'a/5'], stem_direction: -1, duration: '8' }),
      note({ keys: ['b/4'], stem_direction: -1, duration: '8' }),
      note({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
      note({ keys: ['e/4'], stem_direction: -1, duration: '8' }),
    ];

    const beam1 = new Beam(notes.slice(0, 4));
    const beam2 = new Beam(notes.slice(4, 8));
    const beam3 = new Beam(notes.slice(8, 12));

    Formatter.FormatAndDraw(context, stave, notes);

    beam1.setContext(context).draw();
    beam2.setContext(context).draw();
    beam3.setContext(context).draw();

    await expectMatchingScreenshot(options, 'rests_tests.test.ts');
    assert.ok(true, 'Auto Align Rests - Beams Down Test');
  });

  /**
   * Call setTupletLocation(Tuplet.LOCATION_TOP) to place the tuplet indicator (bracket and number) at the
   * top of the group of notes. Tuplet.LOCATION_TOP is the default, so this is optional.
   */
  runTest('Auto Align - Tuplets Stems Up', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const { context, stave } = setupContext(contextBuilder, options.elementId, 600, 160);

    const notes = [
      note({ keys: ['b/4'], stem_direction: 1, duration: '4' }),
      note({ keys: ['b/4'], stem_direction: 1, duration: '4' }),
      note({ keys: ['a/5'], stem_direction: 1, duration: '4r' }),

      note({ keys: ['a/5'], stem_direction: 1, duration: '4r' }),
      note({ keys: ['g/5'], stem_direction: 1, duration: '4r' }),
      note({ keys: ['b/5'], stem_direction: 1, duration: '4' }),

      note({ keys: ['a/5'], stem_direction: 1, duration: '4' }),
      note({ keys: ['g/5'], stem_direction: 1, duration: '4r' }),
      note({ keys: ['b/4'], stem_direction: 1, duration: '4' }),

      note({ keys: ['a/5'], stem_direction: 1, duration: '4' }),
      note({ keys: ['b/4'], stem_direction: 1, duration: '4r' }),
      note({ keys: ['b/4'], stem_direction: 1, duration: '4r' }),
    ];

    const tuplet1 = new Tuplet(notes.slice(0, 3)).setTupletLocation(Tuplet.LOCATION_TOP);
    const tuplet2 = new Tuplet(notes.slice(3, 6)).setTupletLocation(Tuplet.LOCATION_TOP);
    const tuplet3 = new Tuplet(notes.slice(6, 9)).setTupletLocation(Tuplet.LOCATION_TOP);
    const tuplet4 = new Tuplet(notes.slice(9, 12)).setTupletLocation(Tuplet.LOCATION_TOP);

    Formatter.FormatAndDraw(context, stave, notes);

    tuplet1.setContext(context).draw();
    tuplet2.setContext(context).draw();
    tuplet3.setContext(context).draw();
    tuplet4.setContext(context).draw();

    await expectMatchingScreenshot(options, 'rests_tests.test.ts');
    assert.ok(true, 'Auto Align Rests - Tuplets Stem Up Test');
  });

  /**
   * Call setTupletLocation(Tuplet.LOCATION_BOTTOM) to place the tuplet indicator (bracket and number) at the
   * bottom of the group of notes.
   */
  runTest('Auto Align - Tuplets Stems Down', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const { context, stave } = setupContext(contextBuilder, options.elementId, 600, 160);

    const notes = [
      note({ keys: ['a/5'], stem_direction: -1, duration: '8r' }),
      note({ keys: ['g/5'], stem_direction: -1, duration: '8r' }),
      note({ keys: ['b/4'], stem_direction: -1, duration: '8' }),

      note({ keys: ['a/5'], stem_direction: -1, duration: '8r' }),
      note({ keys: ['g/5'], stem_direction: -1, duration: '8' }),
      note({ keys: ['b/5'], stem_direction: -1, duration: '8' }),

      note({ keys: ['a/5'], stem_direction: -1, duration: '8' }),
      note({ keys: ['g/5'], stem_direction: -1, duration: '8r' }),
      note({ keys: ['b/4'], stem_direction: -1, duration: '8' }),

      note({ keys: ['a/5'], stem_direction: -1, duration: '8' }),
      note({ keys: ['g/5'], stem_direction: -1, duration: '8r' }),
      note({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
    ];

    const beam1 = new Beam(notes.slice(0, 3));
    const beam2 = new Beam(notes.slice(3, 6));
    const beam3 = new Beam(notes.slice(6, 9));
    const beam4 = new Beam(notes.slice(9, 12));

    const tuplet1 = new Tuplet(notes.slice(0, 3)).setTupletLocation(Tuplet.LOCATION_BOTTOM);
    const tuplet2 = new Tuplet(notes.slice(3, 6)).setTupletLocation(Tuplet.LOCATION_BOTTOM);
    const tuplet3 = new Tuplet(notes.slice(6, 9)).setTupletLocation(Tuplet.LOCATION_BOTTOM);
    const tuplet4 = new Tuplet(notes.slice(9, 12)).setTupletLocation(Tuplet.LOCATION_BOTTOM);

    Formatter.FormatAndDraw(context, stave, notes);

    tuplet1.setContext(context).draw();
    tuplet2.setContext(context).draw();
    tuplet3.setContext(context).draw();
    tuplet4.setContext(context).draw();

    beam1.setContext(context).draw();
    beam2.setContext(context).draw();
    beam3.setContext(context).draw();
    beam4.setContext(context).draw();

    await expectMatchingScreenshot(options, 'rests_tests.test.ts');
    assert.ok(true, 'Auto Align Rests - Tuplets Stem Down Test');
  });

  /**
   * By default rests are centered vertically within the stave, except
   * when they are inside a group of beamed notes (in which case they are
   * centered vertically within that group).
   */
  runTest('Auto Align - Single Voice (Default)', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const { context, stave } = setupContext(contextBuilder, options.elementId, 600, 160);

    const notes = [
      note({ keys: ['b/4'], stem_direction: -1, duration: '4r' }),
      note({ keys: ['b/4'], stem_direction: -1, duration: '4r' }),
      note({ keys: ['f/4'], stem_direction: -1, duration: '4' }),
      note({ keys: ['e/5'], stem_direction: -1, duration: '8' }),
      note({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),

      note({ keys: ['a/5'], stem_direction: -1, duration: '8' }),
      note({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
      note({ keys: ['b/4'], stem_direction: -1, duration: '8' }),
      note({ keys: ['e/5'], stem_direction: -1, duration: '8' }),

      note({ keys: ['a/5'], stem_direction: 1, duration: '4' }),
      note({ keys: ['b/4'], stem_direction: 1, duration: '4r' }),
      note({ keys: ['b/5'], stem_direction: 1, duration: '4' }),

      note({ keys: ['d/5'], stem_direction: -1, duration: '4' }),
      note({ keys: ['g/5'], stem_direction: -1, duration: '4' }),
      note({ keys: ['b/4'], stem_direction: -1, duration: '4r' }),
      note({ keys: ['b/4'], stem_direction: -1, duration: '4r' }),
    ];

    const beam = new Beam(notes.slice(5, 9));
    const tuplet = new Tuplet(notes.slice(9, 12)).setTupletLocation(Tuplet.LOCATION_TOP);

    Formatter.FormatAndDraw(context, stave, notes);

    tuplet.setContext(context).draw();
    beam.setContext(context).draw();

    await expectMatchingScreenshot(options, 'rests_tests.test.ts');
    assert.ok(true, 'Auto Align Rests - Default Test');
  });

  /**
   * The only difference between staveRestsAll() and staveRests() is that this test case
   * passes { align_rests: true } to Formatter.FormatAndDraw(...).
   */
  runTest('Auto Align - Single Voice (Align All)', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const { context, stave } = setupContext(contextBuilder, options.elementId, 600, 160);

    const notes = [
      note({ keys: ['b/4'], stem_direction: -1, duration: '4r' }),
      note({ keys: ['b/4'], stem_direction: -1, duration: '4r' }),
      note({ keys: ['f/4'], stem_direction: -1, duration: '4' }),
      note({ keys: ['e/5'], stem_direction: -1, duration: '8' }),
      note({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),

      note({ keys: ['a/5'], stem_direction: -1, duration: '8' }),
      note({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
      note({ keys: ['b/4'], stem_direction: -1, duration: '8' }),
      note({ keys: ['e/5'], stem_direction: -1, duration: '8' }),

      note({ keys: ['a/5'], stem_direction: 1, duration: '4' }),
      note({ keys: ['b/4'], stem_direction: 1, duration: '4r' }),
      note({ keys: ['b/5'], stem_direction: 1, duration: '4' }),

      note({ keys: ['d/5'], stem_direction: -1, duration: '4' }),
      note({ keys: ['g/5'], stem_direction: -1, duration: '4' }),
      note({ keys: ['b/4'], stem_direction: -1, duration: '4r' }),
      note({ keys: ['b/4'], stem_direction: -1, duration: '4r' }),
    ];

    const beam = new Beam(notes.slice(5, 9));
    const tuplet = new Tuplet(notes.slice(9, 12)).setTupletLocation(Tuplet.LOCATION_TOP);

    // Set { align_rests: true } to align rests (vertically) with nearby notes in each voice.
    Formatter.FormatAndDraw(context, stave, notes, { align_rests: true });

    tuplet.setContext(context).draw();
    beam.setContext(context).draw();

    await expectMatchingScreenshot(options, 'rests_tests.test.ts');
    assert.ok(true, 'Auto Align Rests - Align All Test');
  });

  /**
   * Multi Voice
   * The top voice shows quarter-note chords alternating with quarter rests.
   * The bottom voice shows two groups of beamed eighth notes, with eighth rests.
   */
  runTest('Auto Align - Multi Voice', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const ctx = contextBuilder(options.elementId, 600, 200);
    const stave = new Stave(50, 10, 500).addClef('treble').setContext(ctx).addTimeSignature('4/4').draw();

    const noteOnStave = (noteStruct: StaveNoteStruct) => new StaveNote(noteStruct).setStave(stave);

    const notes1 = [
      noteOnStave({ keys: ['c/4', 'e/4', 'g/4'], duration: '4' }),
      noteOnStave({ keys: ['b/4'], duration: '4r' }),
      noteOnStave({ keys: ['c/4', 'd/4', 'a/4'], duration: '4' }),
      noteOnStave({ keys: ['b/4'], duration: '4r' }),
    ];

    const notes2 = [
      noteOnStave({ keys: ['e/3'], stem_direction: -1, duration: '8' }),
      noteOnStave({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
      noteOnStave({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
      noteOnStave({ keys: ['e/3'], stem_direction: -1, duration: '8' }),
      noteOnStave({ keys: ['e/3'], stem_direction: -1, duration: '8' }),
      noteOnStave({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
      noteOnStave({ keys: ['e/3'], stem_direction: -1, duration: '8' }),
      noteOnStave({ keys: ['e/3'], stem_direction: -1, duration: '8' }),
    ];

    const voice1 = new Voice(Flow.TIME4_4).addTickables(notes1);
    const voice2 = new Voice(Flow.TIME4_4).addTickables(notes2);

    // Set { align_rests: true } to align rests (vertically) with nearby notes in each voice.
    new Formatter().joinVoices([voice1, voice2]).formatToStave([voice1, voice2], stave, { align_rests: true });

    const beam2_1 = new Beam(notes2.slice(0, 4));
    const beam2_2 = new Beam(notes2.slice(4, 8));

    // Important Note: we need to draw voice2 first, since voice2 generates ledger lines.
    // Otherwise, the ledger lines will be drawn on top of middle C notes in voice1.
    voice2.draw(ctx);
    voice1.draw(ctx);
    beam2_1.setContext(ctx).draw();
    beam2_2.setContext(ctx).draw();

    await expectMatchingScreenshot(options, 'rests_tests.test.ts');
    assert.ok(true, 'Strokes Test Multi Voice');
  });
});
