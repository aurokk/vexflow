// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Rhythm Tests - Vitest Version

import { describe, test } from 'vitest';

import { Annotation } from '../src/annotation';
import { Beam } from '../src/beam';
import { Flow } from '../src/flow';
import { Formatter } from '../src/formatter';
import { Renderer } from '../src/renderer';
import { Stave } from '../src/stave';
import { BarlineType } from '../src/stavebarline';
import { StaveNote } from '../src/stavenote';
import { ContextBuilder, createAssert, FONT_STACKS, generateTestID, TestOptions } from './vitest_test_helpers';

describe('Rhythm', () => {
  // Helper function to run a test with multiple backends and font stacks
  function runTest(
    testName: string,
    testFunc: (options: TestOptions, contextBuilder: ContextBuilder) => void,
    backends: Array<{ backend: number; fontStacks: string[] }> = [
      { backend: Renderer.Backends.CANVAS, fontStacks: ['Bravura'] },
      { backend: Renderer.Backends.SVG, fontStacks: ['Bravura', 'Gonville', 'Petaluma', 'Leland'] },
    ]
  ) {
    backends.forEach(({ backend, fontStacks }) => {
      fontStacks.forEach((fontStackName) => {
        test(`${testName} - ${backend === Renderer.Backends.SVG ? 'SVG' : 'Canvas'} - ${fontStackName}`, () => {
          const elementId = generateTestID('rhythm_test');

          // Create the DOM element before the test runs
          const tagName = backend === Renderer.Backends.SVG ? 'div' : 'canvas';
          const element = document.createElement(tagName);
          element.id = elementId;
          document.body.appendChild(element);

          const assert = createAssert();
          const options: TestOptions = { elementId, params: {}, backend };

          // Set font stack
          const originalFontNames = Flow.getMusicFont();
          Flow.setMusicFont(...FONT_STACKS[fontStackName]);

          try {
            const contextBuilder: ContextBuilder =
              backend === Renderer.Backends.SVG ? Renderer.getSVGContext : Renderer.getCanvasContext;
            testFunc(options, contextBuilder);
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

  runTest('Rhythm Draw - slash notes', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const ctx = contextBuilder(options.elementId, 800, 150);

    // bar 1
    const staveBar1 = new Stave(10, 30, 150);
    staveBar1.setBegBarType(BarlineType.DOUBLE);
    staveBar1.setEndBarType(BarlineType.SINGLE);
    staveBar1.addClef('treble');
    staveBar1.addTimeSignature('4/4');
    staveBar1.addKeySignature('C');
    staveBar1.setContext(ctx).draw();

    const notesBar1 = [new StaveNote({ keys: ['b/4'], duration: '1s', stem_direction: -1 })];

    // Helper function to justify and draw a 4/4 voice
    Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);

    // bar 2 - juxtaposing second bar next to first bar
    const staveBar2 = new Stave(staveBar1.getWidth() + staveBar1.getX(), staveBar1.getY(), 120);
    staveBar2.setBegBarType(BarlineType.SINGLE);
    staveBar2.setEndBarType(BarlineType.SINGLE);
    staveBar2.setContext(ctx).draw();

    // bar 2
    const notesBar2 = [
      new StaveNote({ keys: ['b/4'], duration: '2s', stem_direction: -1 }),
      new StaveNote({ keys: ['b/4'], duration: '2s', stem_direction: -1 }),
    ];

    // Helper function to justify and draw a 4/4 voice
    Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);

    // bar 3 - juxtaposing second bar next to first bar
    const staveBar3 = new Stave(staveBar2.getWidth() + staveBar2.getX(), staveBar2.getY(), 170);
    staveBar3.setContext(ctx).draw();

    // bar 3
    const notesBar3 = [
      new StaveNote({
        keys: ['b/4'],
        duration: '4s',
        stem_direction: -1,
      }),
      new StaveNote({
        keys: ['b/4'],
        duration: '4s',
        stem_direction: -1,
      }),
      new StaveNote({
        keys: ['b/4'],
        duration: '4s',
        stem_direction: -1,
      }),
      new StaveNote({
        keys: ['b/4'],
        duration: '4s',
        stem_direction: -1,
      }),
    ];

    // Helper function to justify and draw a 4/4 voice
    Formatter.FormatAndDraw(ctx, staveBar3, notesBar3);

    // bar 4 - juxtaposing second bar next to first bar
    const staveBar4 = new Stave(staveBar3.getWidth() + staveBar3.getX(), staveBar3.getY(), 200);
    staveBar4.setContext(ctx).draw();

    // bar 4
    const notesBar4 = [
      new StaveNote({
        keys: ['b/4'],
        duration: '8s',
        stem_direction: -1,
      }),
      new StaveNote({
        keys: ['b/4'],
        duration: '8s',
        stem_direction: -1,
      }),
      new StaveNote({
        keys: ['b/4'],
        duration: '8s',
        stem_direction: -1,
      }),
      new StaveNote({
        keys: ['b/4'],
        duration: '8s',
        stem_direction: -1,
      }),
      new StaveNote({
        keys: ['b/4'],
        duration: '8s',
        stem_direction: -1,
      }),
      new StaveNote({
        keys: ['b/4'],
        duration: '8s',
        stem_direction: -1,
      }),
      new StaveNote({
        keys: ['b/4'],
        duration: '8s',
        stem_direction: -1,
      }),
      new StaveNote({
        keys: ['b/4'],
        duration: '8s',
        stem_direction: -1,
      }),
    ];

    // Helper function to justify and draw a 4/4 voice
    Formatter.FormatAndDraw(ctx, staveBar4, notesBar4);
    assert.ok(true);
  });

  runTest('Rhythm Draw - beamed slash notes', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const ctx = contextBuilder(options.elementId, 800, 150);

    // bar 1
    const staveBar1 = new Stave(10, 30, 300);
    staveBar1.setBegBarType(BarlineType.DOUBLE);
    staveBar1.setEndBarType(BarlineType.SINGLE);
    staveBar1.addClef('treble');
    staveBar1.addTimeSignature('4/4');
    staveBar1.addKeySignature('C');
    staveBar1.setContext(ctx).draw();

    // bar 4
    const notesBar1_part1 = [
      new StaveNote({
        keys: ['b/4'],
        duration: '8s',
        stem_direction: -1,
      }),
      new StaveNote({
        keys: ['b/4'],
        duration: '8s',
        stem_direction: -1,
      }),
      new StaveNote({
        keys: ['b/4'],
        duration: '8s',
        stem_direction: -1,
      }),
      new StaveNote({
        keys: ['b/4'],
        duration: '8s',
        stem_direction: -1,
      }),
    ];

    const notesBar1_part2 = [
      new StaveNote({
        keys: ['b/4'],
        duration: '8s',
        stem_direction: -1,
      }),
      new StaveNote({
        keys: ['b/4'],
        duration: '8s',
        stem_direction: -1,
      }),
      new StaveNote({
        keys: ['b/4'],
        duration: '8s',
        stem_direction: -1,
      }),
      new StaveNote({
        keys: ['b/4'],
        duration: '8s',
        stem_direction: -1,
      }),
    ];

    // create the beams for 8th notes in 2nd measure
    const beam1 = new Beam(notesBar1_part1);
    const beam2 = new Beam(notesBar1_part2);
    const notesBar1 = notesBar1_part1.concat(notesBar1_part2);

    // Helper function to justify and draw a 4/4 voice
    Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);

    // Render beams
    beam1.setContext(ctx).draw();
    beam2.setContext(ctx).draw();

    assert.ok(true);
  });

  runTest('Rhythm Draw - beamed slash notes, some rests', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const ctx = contextBuilder(options.elementId, 800, 150);

    // bar 1
    const staveBar1 = new Stave(10, 30, 300);
    staveBar1.setBegBarType(BarlineType.DOUBLE);
    staveBar1.setEndBarType(BarlineType.SINGLE);
    staveBar1.addClef('treble');
    staveBar1.addTimeSignature('4/4');
    staveBar1.addKeySignature('F');
    staveBar1.setContext(ctx).draw();

    // bar 1
    const notesBar1_part1 = [
      new StaveNote({
        keys: ['b/4'],
        duration: '8s',
        stem_direction: -1,
      }),
      new StaveNote({ keys: ['b/4'], duration: '8s', stem_direction: -1 }),
    ];

    notesBar1_part1[0].addModifier(new Annotation('C7').setFont('Times', 12), 0);

    const notesBar1_part2 = [
      new StaveNote({
        keys: ['b/4'],
        duration: '8r',
        stem_direction: -1,
      }),
      new StaveNote({
        keys: ['b/4'],
        duration: '8s',
        stem_direction: -1,
      }),
      new StaveNote({
        keys: ['b/4'],
        duration: '8r',
        stem_direction: -1,
      }),
      new StaveNote({
        keys: ['b/4'],
        duration: '8s',
        stem_direction: -1,
      }),
      new StaveNote({
        keys: ['b/4'],
        duration: '8r',
        stem_direction: -1,
      }),
      new StaveNote({
        keys: ['b/4'],
        duration: '8s',
        stem_direction: -1,
      }),
    ];

    // create the beams for 8th notes in 2nd measure
    const beam1 = new Beam(notesBar1_part1);

    // Helper function to justify and draw a 4/4 voice
    Formatter.FormatAndDraw(ctx, staveBar1, notesBar1_part1.concat(notesBar1_part2));

    // Render beams
    beam1.setContext(ctx).draw();

    // bar 2 - juxtaposing second bar next to first bar
    const staveBar2 = new Stave(staveBar1.getWidth() + staveBar1.getX(), staveBar1.getY(), 220);
    staveBar2.setContext(ctx).draw();

    const notesBar2 = [
      new StaveNote({
        keys: ['b/4'],
        duration: '1s',
        stem_direction: -1,
      }),
    ];

    notesBar2[0].addModifier(new Annotation('F').setFont('Times', 12), 0);
    // Helper function to justify and draw a 4/4 voice
    Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);

    assert.ok(true);
  });

  runTest('Rhythm Draw - 16th note rhythm with scratches', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const ctx = contextBuilder(options.elementId, 800, 150);

    // bar 1
    const staveBar1 = new Stave(10, 30, 300);
    staveBar1.setBegBarType(BarlineType.DOUBLE);
    staveBar1.setEndBarType(BarlineType.SINGLE);
    staveBar1.addClef('treble');
    staveBar1.addTimeSignature('4/4');
    staveBar1.addKeySignature('F');
    staveBar1.setContext(ctx).draw();

    // bar 1
    const notesBar1_part1 = [
      new StaveNote({
        keys: ['b/4'],
        duration: '16s',
        stem_direction: -1,
      }),
      new StaveNote({
        keys: ['b/4'],
        duration: '16s',
        stem_direction: -1,
      }),
      new StaveNote({
        keys: ['b/4'],
        duration: '16m',
        stem_direction: -1,
      }),
      new StaveNote({
        keys: ['b/4'],
        duration: '16s',
        stem_direction: -1,
      }),
    ];

    const notesBar1_part2 = [
      new StaveNote({
        keys: ['b/4'],
        duration: '16m',
        stem_direction: -1,
      }),
      new StaveNote({
        keys: ['b/4'],
        duration: '16s',
        stem_direction: -1,
      }),
      new StaveNote({
        keys: ['b/4'],
        duration: '16r',
        stem_direction: -1,
      }),
      new StaveNote({
        keys: ['b/4'],
        duration: '16s',
        stem_direction: -1,
      }),
    ];

    notesBar1_part1[0].addModifier(new Annotation('C7').setFont('Times', 13), 0);

    // create the beams for 8th notes in 2nd measure
    const beam1 = new Beam(notesBar1_part1);
    const beam2 = new Beam(notesBar1_part2);

    // Helper function to justify and draw a 4/4 voice
    Formatter.FormatAndDraw(ctx, staveBar1, notesBar1_part1.concat(notesBar1_part2));

    // Render beams
    beam1.setContext(ctx).draw();
    beam2.setContext(ctx).draw();

    assert.ok(true);
  });

  runTest('Rhythm Draw - 32nd note rhythm with scratches', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const ctx = contextBuilder(options.elementId, 800, 150);

    // bar 1
    const staveBar1 = new Stave(10, 30, 300);
    staveBar1.setBegBarType(BarlineType.DOUBLE);
    staveBar1.setEndBarType(BarlineType.SINGLE);
    staveBar1.addClef('treble');
    staveBar1.addTimeSignature('4/4');
    staveBar1.addKeySignature('F');
    staveBar1.setContext(ctx).draw();

    // bar 1
    const notesBar1_part1 = [
      new StaveNote({
        keys: ['b/4'],
        duration: '32s',
        stem_direction: 1,
      }),
      new StaveNote({
        keys: ['b/4'],
        duration: '32s',
        stem_direction: 1,
      }),
      new StaveNote({
        keys: ['b/4'],
        duration: '32m',
        stem_direction: 1,
      }),
      new StaveNote({
        keys: ['b/4'],
        duration: '32s',
        stem_direction: 1,
      }),
      new StaveNote({
        keys: ['b/4'],
        duration: '32m',
        stem_direction: 1,
      }),
      new StaveNote({
        keys: ['b/4'],
        duration: '32s',
        stem_direction: 1,
      }),
      new StaveNote({
        keys: ['b/4'],
        duration: '32r',
        stem_direction: 1,
      }),
      new StaveNote({
        keys: ['b/4'],
        duration: '32s',
        stem_direction: 1,
      }),
    ];

    notesBar1_part1[0].addModifier(new Annotation('C7').setFont('Times', 13), 0);

    // Create the beams for 8th notes in 2nd measure.
    const beam1 = new Beam(notesBar1_part1);

    // Helper function to justify and draw a 4/4 voice.
    Formatter.FormatAndDraw(ctx, staveBar1, notesBar1_part1);

    // Render beams
    beam1.setContext(ctx).draw();

    assert.ok(true);
  });
});
