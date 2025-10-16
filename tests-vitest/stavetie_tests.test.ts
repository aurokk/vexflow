// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// StaveTie Tests - Vitest Version

import { describe, test } from 'vitest';

import { BuilderOptions } from '../src/easyscore';
import { Factory } from '../src/factory';
import { Flow } from '../src/flow';
import { ContextBuilder, Renderer } from '../src/renderer';
import { Stave } from '../src/stave';
import { Stem } from '../src/stem';
import { StemmableNote } from '../src/stemmablenote';
import { createAssert, expectMatchingScreenshot, FONT_STACKS, generateTestID, makeFactory, TestOptions } from './vitest_test_helpers';

describe('StaveTie', () => {
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
          const elementId = generateTestID('stavetie_test');

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
   * Used by the tests below to set up the stave, easyscore, notes, voice, and to format & draw.
   */
  function createTest(
    notesData: [string, BuilderOptions],
    setupTies: (f: Factory, n: StemmableNote[], s: Stave) => void
  ) {
    return async (options: TestOptions) => {
      const assert = createAssert();
      const factory = makeFactory(options.backend, options.elementId, 300, 140, options);
      const stave = factory.Stave();
      const score = factory.EasyScore();
      const notes = score.notes(notesData[0], notesData[1]);
      const voice = score.voice(notes);

      setupTies(factory, notes, stave);

      factory.Formatter().joinVoices([voice]).formatToStave([voice], stave);
      factory.draw();
      await expectMatchingScreenshot(options, 'stavetie_tests.test.ts');
      assert.ok(true);
    };
  }

  runTest(
    'Simple StaveTie',
    createTest(['(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }], (f, notes) => {
      f.StaveTie({
        from: notes[0],
        to: notes[1],
        first_indices: [0, 1],
        last_indices: [0, 1],
      });
    })
  );

  runTest(
    'Chord StaveTie',
    createTest(['(d4 e4 f4)/2, (cn4 f#4 a4)', { stem: 'down' }], (f, notes) => {
      f.StaveTie({
        from: notes[0],
        to: notes[1],
        first_indices: [0, 1, 2],
        last_indices: [0, 1, 2],
      });
    })
  );

  runTest(
    'Stem Up StaveTie',
    createTest(['(d4 e4 f4)/2, (cn4 f#4 a4)', { stem: 'up' }], (f, notes) => {
      f.StaveTie({
        from: notes[0],
        to: notes[1],
        first_indices: [0, 1, 2],
        last_indices: [0, 1, 2],
      });
    })
  );

  runTest(
    'No End Note With Clef',
    createTest(['(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }], (f, notes, stave) => {
      stave.addEndClef('treble');
      f.StaveTie({
        from: notes[1],
        first_indices: [2],
        last_indices: [2],
        text: 'slow.',
      });
    })
  );

  runTest(
    'No End Note',
    createTest(['(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }], (f, notes) => {
      f.StaveTie({
        from: notes[1],
        first_indices: [2],
        last_indices: [2],
        text: 'slow.',
      });
    })
  );

  runTest(
    'No Start Note With Clef',
    createTest(['(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }], (f, notes, stave) => {
      stave.addClef('treble');
      f.StaveTie({
        to: notes[0],
        first_indices: [2],
        last_indices: [2],
        text: 'H',
      });
    })
  );

  runTest(
    'No Start Note',
    createTest(['(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }], (f, notes) => {
      f.StaveTie({
        to: notes[0],
        first_indices: [2],
        last_indices: [2],
        text: 'H',
      });
    })
  );

  runTest(
    'Set Direction Down',
    createTest(['(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }], (f, notes) => {
      f.StaveTie({
        from: notes[0],
        to: notes[1],
        first_indices: [0, 1],
        last_indices: [0, 1],
        options: { direction: Stem.DOWN },
      });
    })
  );

  runTest(
    'Set Direction Up',
    createTest(['(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }], (f, notes) => {
      f.StaveTie({
        from: notes[0],
        to: notes[1],
        first_indices: [0, 1],
        last_indices: [0, 1],
        options: { direction: Stem.UP },
      });
    })
  );
});
