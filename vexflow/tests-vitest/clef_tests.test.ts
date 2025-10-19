// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Clef Tests - Vitest Version

import { describe, test } from 'vitest';

import { Factory } from '../src/factory';
import { Flow } from '../src/flow';
import { Renderer } from '../src/renderer';
import { createAssert, expectMatchingScreenshot, FONT_STACKS, generateTestID, TestOptions } from './vitest_test_helpers';

describe('Clef', () => {
  // Helper function to run a test with multiple backends and font stacks
  async function runTest(
    testName: string,
    testFunc: (options: TestOptions) => void | Promise<void>,
    backends: Array<{ backend: number; fontStacks: string[] }> = [
      { backend: Renderer.Backends.CANVAS, fontStacks: ['Bravura'] },
      { backend: Renderer.Backends.SVG, fontStacks: ['Bravura', 'Gonville', 'Petaluma', 'Leland'] },
    ]
  ) {
    backends.forEach(({ backend, fontStacks }) => {
      fontStacks.forEach((fontStackName) => {
        test(`${testName} - ${backend === Renderer.Backends.SVG ? 'SVG' : 'Canvas'} - ${fontStackName}`, async () => {
          const elementId = generateTestID('clef_test');

          // Create the DOM element before the test runs
          const tagName = backend === Renderer.Backends.SVG ? 'div' : 'canvas';
          const element = document.createElement(tagName);
          element.id = elementId;
          document.body.appendChild(element);

          const options: TestOptions = {
            elementId,
            params: {},
            backend,
            testName,
            fontStackName,
          };

          // Set font stack
          const originalFontNames = Flow.getMusicFont();
          Flow.setMusicFont(...FONT_STACKS[fontStackName]);

          try {
            await testFunc(options);
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

  runTest('Clef Test', async (options: TestOptions) => {
    const f = new Factory({
      renderer: { elementId: options.elementId, backend: options.backend, width: 800, height: 120 },
    });
    f.Stave()
      .addClef('treble')
      .addClef('treble', 'default', '8va')
      .addClef('treble', 'default', '8vb')
      .addClef('alto')
      .addClef('tenor')
      .addClef('soprano')
      .addClef('bass')
      .addClef('bass', 'default', '8vb')
      .addClef('mezzo-soprano')
      .addClef('baritone-c')
      .addClef('baritone-f')
      .addClef('subbass')
      .addClef('percussion')
      .addClef('french')
      .addEndClef('treble');
    f.draw();

    await expectMatchingScreenshot(options, 'clef_tests.test.ts');

    createAssert().ok(true, 'all pass');
  });

  runTest('Clef End Test', async (options: TestOptions) => {
    const f = new Factory({
      renderer: { elementId: options.elementId, backend: options.backend, width: 800, height: 120 },
    });
    f.Stave()
      .addClef('bass')
      .addEndClef('treble')
      .addEndClef('treble', 'default', '8va')
      .addEndClef('treble', 'default', '8vb')
      .addEndClef('alto')
      .addEndClef('tenor')
      .addEndClef('soprano')
      .addEndClef('bass')
      .addEndClef('bass', 'default', '8vb')
      .addEndClef('mezzo-soprano')
      .addEndClef('baritone-c')
      .addEndClef('baritone-f')
      .addEndClef('subbass')
      .addEndClef('percussion')
      .addEndClef('french');
    f.draw();

    await expectMatchingScreenshot(options, 'clef_tests.test.ts');

    createAssert().ok(true, 'all pass');
  });

  runTest('Small Clef Test', async (options: TestOptions) => {
    const f = new Factory({
      renderer: { elementId: options.elementId, backend: options.backend, width: 800, height: 120 },
    });
    f.Stave()
      .addClef('treble', 'small')
      .addClef('treble', 'small', '8va')
      .addClef('treble', 'small', '8vb')
      .addClef('alto', 'small')
      .addClef('tenor', 'small')
      .addClef('soprano', 'small')
      .addClef('bass', 'small')
      .addClef('bass', 'small', '8vb')
      .addClef('mezzo-soprano', 'small')
      .addClef('baritone-c', 'small')
      .addClef('baritone-f', 'small')
      .addClef('subbass', 'small')
      .addClef('percussion', 'small')
      .addClef('french', 'small')
      .addEndClef('treble', 'small');
    f.draw();

    await expectMatchingScreenshot(options, 'clef_tests.test.ts');

    createAssert().ok(true, 'all pass');
  });

  runTest('Small Clef End Test', async (options: TestOptions) => {
    const f = new Factory({
      renderer: { elementId: options.elementId, backend: options.backend, width: 800, height: 120 },
    });
    f.Stave()
      .addClef('bass', 'small')
      .addEndClef('treble', 'small')
      .addEndClef('treble', 'small', '8va')
      .addEndClef('treble', 'small', '8vb')
      .addEndClef('alto', 'small')
      .addEndClef('tenor', 'small')
      .addEndClef('soprano', 'small')
      .addEndClef('bass', 'small')
      .addEndClef('bass', 'small', '8vb')
      .addEndClef('mezzo-soprano', 'small')
      .addEndClef('baritone-c', 'small')
      .addEndClef('baritone-f', 'small')
      .addEndClef('subbass', 'small')
      .addEndClef('percussion', 'small')
      .addEndClef('french', 'small');
    f.draw();

    await expectMatchingScreenshot(options, 'clef_tests.test.ts');

    createAssert().ok(true, 'all pass');
  });

  runTest('Clef Change Test', async (options: TestOptions) => {
    const f = new Factory({
      renderer: { elementId: options.elementId, backend: options.backend, width: 800, height: 180 },
    });
    const stave = f.Stave().addClef('treble');
    const notes = [
      f.StaveNote({ keys: ['c/4'], duration: '4', clef: 'treble' }),
      f.ClefNote({ type: 'alto', options: { size: 'small' } }),
      f.StaveNote({ keys: ['c/4'], duration: '4', clef: 'alto' }),
      f.ClefNote({ type: 'tenor', options: { size: 'small' } }),
      f.StaveNote({ keys: ['c/4'], duration: '4', clef: 'tenor' }),
      f.ClefNote({ type: 'soprano', options: { size: 'small' } }),
      f.StaveNote({ keys: ['c/4'], duration: '4', clef: 'soprano' }),
      f.ClefNote({ type: 'bass', options: { size: 'small' } }),
      f.StaveNote({ keys: ['c/4'], duration: '4', clef: 'bass' }),
      f.ClefNote({ type: 'mezzo-soprano', options: { size: 'small' } }),
      f.StaveNote({ keys: ['c/4'], duration: '4', clef: 'mezzo-soprano' }),
      f.ClefNote({ type: 'baritone-c', options: { size: 'small' } }),
      f.StaveNote({ keys: ['c/4'], duration: '4', clef: 'baritone-c' }),
      f.ClefNote({ type: 'baritone-f', options: { size: 'small' } }),
      f.StaveNote({ keys: ['c/4'], duration: '4', clef: 'baritone-f' }),
      f.ClefNote({ type: 'subbass', options: { size: 'small' } }),
      f.StaveNote({ keys: ['c/4'], duration: '4', clef: 'subbass' }),
      f.ClefNote({ type: 'french', options: { size: 'small' } }),
      f.StaveNote({ keys: ['c/4'], duration: '4', clef: 'french' }),
      f.ClefNote({ type: 'treble', options: { size: 'small', annotation: '8vb' } }),
      f.StaveNote({ keys: ['c/4'], duration: '4', clef: 'treble', octave_shift: -1 }),
      f.ClefNote({ type: 'treble', options: { size: 'small', annotation: '8va' } }),
      f.StaveNote({ keys: ['c/4'], duration: '4', clef: 'treble', octave_shift: 1 }),
    ];
    const voice = f.Voice({ time: '12/4' }).addTickables(notes);
    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);
    f.draw();

    await expectMatchingScreenshot(options, 'clef_tests.test.ts');

    createAssert().ok(true, 'all pass');
  });
});
