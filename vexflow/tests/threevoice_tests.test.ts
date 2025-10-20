// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Three Voices Tests - Three voices in single staff.

import { describe, test } from 'vitest';

import { Beam } from '../src/beam';
import { BuilderOptions } from '../src/easyscore';
import { Factory } from '../src/factory';
import { Flow } from '../src/flow';
import { Note } from '../src/note';
import { ContextBuilder, Renderer } from '../src/renderer';
import { Voice } from '../src/voice';
import { concat, createAssert, expectMatchingScreenshot, FONT_STACKS, generateTestID, makeFactory, TestOptions } from './vitest_test_helpers';

describe('Three Voice Rests', () => {
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
          const elementId = generateTestID('threevoice_test');

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

  /**
   * Helper for setting up the first three test cases: threeVoices1, threeVoices2, threeVoices3.
   */
  function createThreeVoicesTest(
    noteGroup1: [string, BuilderOptions],
    noteGroup2: [string, BuilderOptions],
    noteGroup3: [string, BuilderOptions],
    setup: (f: Factory, v: Voice[]) => void
  ) {
    return async (options: TestOptions, contextBuilder: ContextBuilder) => {
      const assert = createAssert();
      const f = makeFactory(options.backend, options.elementId, 600, 200, options);
      const stave = f.Stave().addClef('treble').addTimeSignature('4/4');
      const score = f.EasyScore();

      // Convert each noteGroup array to StaveNote[].
      const noteGroups = [noteGroup1, noteGroup2, noteGroup3].map((args) => score.notes(...args));

      const voices = noteGroups.map((notes) => score.voice(notes));

      setup(f, voices);

      const beams = [
        Beam.applyAndGetBeams(voices[0], +1),
        Beam.applyAndGetBeams(voices[1], -1),
        Beam.applyAndGetBeams(voices[2], -1),
      ].reduce(concat);

      // Set option to position rests near the notes in each voice.
      f.Formatter().joinVoices(voices).formatToStave(voices, stave);

      f.draw();

      for (let i = 0; i < beams.length; i++) {
        beams[i].setContext(f.getContext()).draw();
      }

      await expectMatchingScreenshot(options, 'threevoice_tests.test.ts');

      assert.ok(true);
    };
  }

  runTest(
    'Three Voices - #1',
    createThreeVoicesTest(
      ['e5/2, e5', { stem: 'up' }],
      ['(d4 a4 d#5)/8, b4, (d4 a4 c5), b4, (d4 a4 c5), b4, (d4 a4 c5), b4', { stem: 'down' }],
      ['b3/4, e3, f3, a3', { stem: 'down' }],
      (f, voices) => {
        voices[0].getTickables()[0].addModifier(f.Fingering({ number: '0', position: 'left' }), 0);

        voices[1]
          .getTickables()[0]
          .addModifier(f.Fingering({ number: '0', position: 'left' }), 0)
          .addModifier(f.Fingering({ number: '4', position: 'left' }), 1);
      }
    )
  );

  runTest(
    'Three Voices - #2 Complex',
    createThreeVoicesTest(
      ['(a4 e5)/16, e5, e5, e5, e5/8, e5, e5/2', { stem: 'up' }],
      ['(d4 d#5)/16, (b4 c5), d5, e5, (d4 a4 c5)/8, b4, (d4 a4 c5), b4, (d4 a4 c5), b4', { stem: 'down' }],
      ['b3/8, b3, e3/4, f3, a3', { stem: 'down' }],
      (f, voices) => {
        voices[0]
          .getTickables()[0]
          .addModifier(f.Fingering({ number: '2', position: 'left' }), 0)
          .addModifier(f.Fingering({ number: '0', position: 'above' }), 1);

        voices[1]
          .getTickables()[0]
          .addModifier(f.Fingering({ number: '0', position: 'left' }), 0)
          .addModifier(f.Fingering({ number: '4', position: 'left' }), 1);
      }
    )
  );

  runTest(
    'Three Voices - #3',
    createThreeVoicesTest(
      ['(g4 e5)/4, e5, (g4 e5)/2', { stem: 'up' }],
      ['c#5/4, b4/8, b4/8/r, a4/4., g4/8', { stem: 'down' }],
      ['c4/4, b3, a3, g3', { stem: 'down' }],
      (f, voices) => {
        voices[0]
          .getTickables()[0]
          .addModifier(f.Fingering({ number: '0', position: 'left' }), 0)
          .addModifier(f.Fingering({ number: '0', position: 'left' }), 1);

        voices[1].getTickables()[0].addModifier(f.Fingering({ number: '1', position: 'left' }), 0);

        voices[2].getTickables()[0].addModifier(f.Fingering({ number: '3', position: 'left' }), 0);
      }
    )
  );

  runTest('Auto Adjust Rest Positions - Two Voices', async (options: TestOptions) => {
    const assert = createAssert();
    const f = makeFactory(options.backend, options.elementId, 900, 200, options);
    const score = f.EasyScore();
    let x = 10;

    let beams: Beam[] = [];

    function createMeasure(measureTitle: string, width: number, align_rests: boolean) {
      const stave = f.Stave({ x: x, y: 50, width: width }).setBegBarType(1);
      x += width;

      const noteArrays: Note[][] = [
        score.notes('b4/8/r, e5/16, b4/r, b4/8/r, e5/16, b4/r, b4/8/r, d5/16, b4/r, e5/4', { stem: 'up' }),
        score.notes('c5/16, c4, b4/r, d4, e4, f4, b4/r, g4, g4[stem="up"], a4[stem="up"], b4/r, b4[stem="up"], e4/4', {
          stem: 'down',
        }),
        [f.TextNote({ text: measureTitle, line: -1, duration: '1', smooth: true })],
      ];

      const voices = noteArrays.map((notes) => score.voice(notes));

      beams = beams.concat(Beam.applyAndGetBeams(voices[0], 1)).concat(Beam.applyAndGetBeams(voices[1], -1));

      f.Formatter().joinVoices(voices).formatToStave(voices, stave, { align_rests });
    }

    createMeasure('Default Rest Positions', 400, false);
    createMeasure('Rests Repositioned To Avoid Collisions', 400, true);

    f.draw();

    for (let i = 0; i < beams.length; i++) {
      beams[i].setContext(f.getContext()).draw();
    }

    await expectMatchingScreenshot(options, 'threevoice_tests.test.ts');

    assert.ok(true, 'Auto Adjust Rests - Two Voices');
  });

  runTest('Auto Adjust Rest Positions - Three Voices #1', async (options: TestOptions) => {
    const assert = createAssert();
    const f = makeFactory(options.backend, options.elementId, 850, 200, options);
    const score = f.EasyScore();
    let x = 10;

    function createMeasure(measureTitle: string, width: number, align_rests: boolean) {
      const stave = f.Stave({ x: x, y: 50, width: width }).setBegBarType(1);

      const voices = [
        score.voice(score.notes('b4/4/r, e5, e5/r, e5/r, e5, e5, e5, e5/r', { stem: 'up' }), { time: '8/4' }),
        score.voice(score.notes('b4/4/r, b4/r, b4/r, b4, b4/r, b4/r, b4, b4', { stem: 'down' }), { time: '8/4' }),
        score.voice(score.notes('e4/4/r, e4/r, f4, b4/r, g4, c4, e4/r, c4', { stem: 'down' }), { time: '8/4' }),
        score.voice(
          [
            f.TextNote({ text: measureTitle, duration: '1', line: -1, smooth: true }),
            f.TextNote({ text: '', duration: '1', line: -1, smooth: true }),
          ],
          { time: '8/4' }
        ),
      ];

      f.Formatter().joinVoices(voices).formatToStave(voices, stave, { align_rests });

      x += width;
    }

    createMeasure('Default Rest Positions', 400, false);
    createMeasure('Rests Repositioned To Avoid Collisions', 400, true);
    f.draw();

    await expectMatchingScreenshot(options, 'threevoice_tests.test.ts');

    assert.ok(true);
  });

  runTest('Auto Adjust Rest Positions - Three Voices #2', async (options: TestOptions) => {
    const assert = createAssert();
    const f = makeFactory(options.backend, options.elementId, 850, 200, options);
    const score = f.EasyScore();
    let x = 10;

    function createMeasure(measureTitle: string, width: number, align_rests: boolean) {
      const stave = f.Stave({ x: x, y: 50, width: width }).setBegBarType(1);

      const voices = [
        score.voice(score.notes('b4/16/r, e5, e5/r, e5/r, e5, e5, e5, e5/r'), { time: '2/4' }),
        score.voice(score.notes('b4/16/r, b4/r, b4/r, b4, b4/r, b4/r, b4, b4'), { time: '2/4' }),
        score.voice(score.notes('e4/16/r, e4/r, f4, b4/r, g4, c4, e4/r, c4'), { time: '2/4' }),
        score.voice([f.TextNote({ text: measureTitle, duration: 'h', line: -1, smooth: true })], { time: '2/4' }),
      ];

      f.Formatter().joinVoices(voices).formatToStave(voices, stave, { align_rests });

      x += width;
    }

    createMeasure('Default Rest Positions', 400, false);
    createMeasure('Rests Repositioned To Avoid Collisions', 400, true);
    f.draw();

    await expectMatchingScreenshot(options, 'threevoice_tests.test.ts');

    assert.ok(true);
  });
});
