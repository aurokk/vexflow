// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Curve Tests - Vitest Version

import { describe, test } from 'vitest';

import { CurvePosition } from '../src/curve';
import { BuilderOptions } from '../src/easyscore';
import { Factory } from '../src/factory';
import { Flow } from '../src/flow';
import { ContextBuilder, Renderer } from '../src/renderer';
import { StemmableNote } from '../src/stemmablenote';
import { createAssert, expectMatchingScreenshot, FONT_STACKS, generateTestID, makeFactory, TestOptions } from './vitest_test_helpers';

// Concat helper for flattening arrays
const concat = (a: any, b: any) => a.concat(b);

// Will be used as params for EasyScore.notes(...).
type NoteParams = [string, BuilderOptions];

/**
 * Helper function. Each test case passes in a set of notes and
 * a setupCurves() callback which uses Factory.Curve(...) to build the curves.
 * Curves can be used to indicate slurs (legato articulation).
 */
function createTest(
  noteGroup1: NoteParams,
  noteGroup2: NoteParams,
  setupCurves: (f: Factory, n: StemmableNote[]) => void
) {
  return async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const factory = makeFactory(options.backend, options.elementId, 350, 200, options);
    const stave = factory.Stave({ y: 50 });
    const score = factory.EasyScore();

    // Use .reduce(concat) to flatten the two StaveNote[] into a single StaveNote[].
    const staveNotes = [
      score.beam(score.notes(...noteGroup1)), // group 1
      score.beam(score.notes(...noteGroup2)), // group 2
    ].reduce(concat);

    setupCurves(factory, staveNotes);

    const voices = [score.voice(staveNotes, { time: '4/4' })];
    factory.Formatter().joinVoices(voices).formatToStave(voices, stave);
    factory.draw();

    await expectMatchingScreenshot(options, 'curve_tests.test.ts');

    assert.ok('Simple Curve');
  };
}

const simple = createTest(
  ['c4/8, f5, d5, g5', { stem: 'up' }], // beamGroup1
  ['d6/8, f5, d5, g5', { stem: 'down' }], // beamGroup2
  (f, notes) => {
    f.Curve({
      from: notes[0],
      to: notes[3],
      options: {
        cps: [
          { x: 0, y: 10 },
          { x: 0, y: 50 },
        ],
      },
    });

    f.Curve({
      from: notes[4],
      to: notes[7],
      options: {
        cps: [
          { x: 0, y: 10 },
          { x: 0, y: 20 },
        ],
      },
    });
  }
);

const rounded = createTest(
  ['c5/8, f4, d4, g5', { stem: 'up' }], // beamGroup1
  ['d5/8, d6, d6, g5', { stem: 'down' }], // beamGroup2
  (f, notes) => {
    f.Curve({
      from: notes[0],
      to: notes[3],
      options: {
        x_shift: -10,
        y_shift: 30,
        cps: [
          { x: 0, y: 20 },
          { x: 0, y: 50 },
        ],
      },
    });

    f.Curve({
      from: notes[4],
      to: notes[7],
      options: {
        cps: [
          { x: 0, y: 50 },
          { x: 0, y: 50 },
        ],
      },
    });
  }
);

const thickThin = createTest(
  ['c5/8, f4, d4, g5', { stem: 'up' }], // beamGroup1
  ['d5/8, d6, d6, g5', { stem: 'down' }], // beamGroup2
  (f, notes) => {
    f.Curve({
      from: notes[0],
      to: notes[3],
      options: {
        thickness: 10,
        x_shift: -10,
        y_shift: 30,
        cps: [
          { x: 0, y: 20 },
          { x: 0, y: 50 },
        ],
      },
    });

    f.Curve({
      from: notes[4],
      to: notes[7],
      options: {
        thickness: 0,
        cps: [
          { x: 0, y: 50 },
          { x: 0, y: 50 },
        ],
      },
    });
  }
);

const top = createTest(
  ['c5/8, f4, d4, g5', { stem: 'up' }], // beamGroup1
  ['d5/8, d6, d6, g5', { stem: 'down' }], // beamGroup2
  (f, notes) => {
    f.Curve({
      from: notes[0],
      to: notes[7],
      options: {
        x_shift: -3,
        y_shift: 10,
        position: CurvePosition.NEAR_TOP,
        position_end: CurvePosition.NEAR_HEAD,
        cps: [
          { x: 0, y: 20 },
          { x: 40, y: 80 },
        ],
      },
    });
  }
);

describe('Curve', () => {
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
          const elementId = generateTestID('curve_test');

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

  runTest('Simple Curve', simple);
  runTest('Rounded Curve', rounded);
  runTest('Thick Thin Curves', thickThin);
  runTest('Top Curve', top);
});
