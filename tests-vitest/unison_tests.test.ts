// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Unison Tests - Vitest Version

import { describe, test } from 'vitest';

import { Flow } from '../src/flow';
import { ContextBuilder, Renderer } from '../src/renderer';
import { Tables } from '../src/tables';
import { createAssert, FONT_STACKS, generateTestID, makeFactory, TestOptions } from './vitest_test_helpers';

describe('Unison', () => {
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
          const elementId = generateTestID('unison_test');

          // Create the DOM element before the test runs
          const tagName = backend === Renderer.Backends.SVG ? 'div' : 'canvas';
          const element = document.createElement(tagName);
          element.id = elementId;
          document.body.appendChild(element);

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

  function simple(unison: boolean, voice1: string, voice2: string) {
    return (options: TestOptions, contextBuilder: ContextBuilder) => {
      const assert = createAssert();
      Tables.UNISON = unison;
      const vf = makeFactory(options.backend, options.elementId, 500, 200);
      const score = vf.EasyScore();

      const system = vf.System({ y: 40, x: 10, width: 400 });
      system.addStave({
        voices: [score.voice(score.notes(voice1)), score.voice(score.notes(voice2))],
      });

      system.getStaves()[0].setClef('treble');
      system.getStaves()[0].setTimeSignature('4/4');
      vf.draw();
      assert.ok(true);
    };
  }

  function style(unison: boolean) {
    return (options: TestOptions, contextBuilder: ContextBuilder) => {
      const assert = createAssert();
      Tables.UNISON = unison;
      const vf = makeFactory(options.backend, options.elementId, 500, 200);
      const score = vf.EasyScore();

      const system = vf.System({ y: 40, x: 10, width: 400 });
      const notes1 = score.notes('e4/q, e4/q, e4/h');
      const notes2 = score.notes('e4/8, e4/8, e4/q, e4/h');
      notes1[2].setStyle({ fillStyle: 'blue', strokeStyle: 'blue' });
      notes2[3].setStyle({ fillStyle: 'green', strokeStyle: 'green' });
      system.addStave({
        voices: [score.voice(notes1), score.voice(notes2)],
      });

      system.getStaves()[0].setClef('treble');
      system.getStaves()[0].setTimeSignature('4/4');
      vf.draw();
      assert.ok(true);
    };
  }

  function breve(unison: boolean) {
    return (options: TestOptions, contextBuilder: ContextBuilder) => {
      const assert = createAssert();
      Tables.UNISON = unison;
      const vf = makeFactory(options.backend, options.elementId, 500, 200);
      const score = vf.EasyScore();

      const system = vf.System({ y: 40, x: 10, width: 400 });
      system.addStave({
        voices: [
          score.voice([vf.StaveNote({ keys: ['e/4'], duration: '1/2' })], { time: '8/4' }),
          score.voice(score.notes('e4/1, e4/1'), { time: '8/4' }),
        ],
      });

      system.getStaves()[0].setClef('treble');
      system.getStaves()[0].setTimeSignature('8/4');
      vf.draw();
      assert.ok(true);
    };
  }

  runTest('Simple(true)', simple(true, 'e4/q, e4/q, e4/h', 'e4/8, e4/8, e4/q, e4/h'));
  runTest('Simple(false)', simple(false, 'e4/q, e4/q, e4/h', 'e4/8, e4/8, e4/q, e4/h'));
  runTest('Accidentals(true)', simple(true, 'e4/q, e#4/q, e#4/h', 'e4/8, e4/8, eb4/q, eb4/h'));
  runTest('Accidentals(false)', simple(false, 'e4/q, e#4/q, e#4/h', 'e4/8, e4/8, eb4/q, eb4/h'));
  runTest('Dots(true)', simple(true, 'e4/q.., e4/16, e4/h', '(a4 e4)/q., e4/8, e4/h'));
  runTest('Dots(false)', simple(false, 'e4/q.., e4/16, e4/h', '(a4 e4)/q., e4/8, e4/h'));
  runTest('Breve(true)', breve(true));
  runTest('Breve(false)', breve(false));
  runTest('Style(true)', style(true));
  runTest('Style(false)', style(false));
});
