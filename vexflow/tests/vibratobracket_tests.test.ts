// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
// Author: Balazs Forian-Szabo
//
// VibratoBracket Tests - Vitest Version

import { describe, test } from 'vitest';

import { Factory } from '../src/factory';
import { Flow } from '../src/flow';
import { Note } from '../src/note';
import { Renderer } from '../src/renderer';
import { Tickable } from '../src/tickable';
import { createAssert, expectMatchingScreenshot, FONT_STACKS, generateTestID, makeFactory, TestOptions } from './vitest_test_helpers';

describe('VibratoBracket', () => {
  // Helper function to run a test with multiple backends and font stacks
  async function runTest(
    testName: string,
    noteGroup: string,
    setupVibratoBracket: (f: Factory, notes: Tickable[]) => void,
    backends: Array<{ backend: number; fontStacks: string[] }> = [
      { backend: Renderer.Backends.CANVAS, fontStacks: ['Bravura'] },
      { backend: Renderer.Backends.SVG, fontStacks: ['Bravura', 'Gonville', 'Petaluma', 'Leland'] },
    ]
  ) {
    backends.forEach(({ backend, fontStacks }) => {
      fontStacks.forEach((fontStackName) => {
        test(`${testName} - ${backend === Renderer.Backends.SVG ? 'SVG' : 'Canvas'} - ${fontStackName}`, async () => {
          const elementId = generateTestID('vibratobracket_test');

          // Create the DOM element before the test runs
          const tagName = backend === Renderer.Backends.SVG ? 'div' : 'canvas';
          const element = document.createElement(tagName);
          element.id = elementId;
          document.body.appendChild(element);

          // Set font stack
          const originalFontNames = Flow.getMusicFont();
          Flow.setMusicFont(...FONT_STACKS[fontStackName]);

          try {
            const assert = createAssert();
            const options: TestOptions = {
              elementId,
              params: {},
              backend,
              testName,
              fontStackName,
            };
            const factory = makeFactory(backend, elementId, 650, 200, options);
            const stave = factory.Stave();
            const score = factory.EasyScore();
            const voice = score.voice(score.notes(noteGroup));

            setupVibratoBracket(factory, voice.getTickables());

            factory.Formatter().joinVoices([voice]).formatToStave([voice], stave);
            factory.draw();

            await expectMatchingScreenshot(options, 'vibratobracket_tests.test.ts');

            assert.ok(true);
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

  runTest('Simple VibratoBracket', 'c4/4, c4, c4, c4', (factory, notes) => {
    factory.VibratoBracket({
      from: notes[0] as Note,
      to: notes[3] as Note,
      options: { line: 2 },
    });
  });

  runTest('Harsh VibratoBracket Without End Note', 'c4/4, c4, c4, c4', (factory, notes) => {
    factory.VibratoBracket({
      from: notes[2] as Note,
      to: null,
      options: { line: 2, harsh: true },
    });
  });

  runTest('Harsh VibratoBracket Without Start Note', 'c4/4, c4, c4, c4', (factory, notes) => {
    factory.VibratoBracket({
      from: null,
      to: notes[2] as Note,
      options: { line: 2, harsh: true },
    });
  });
});
