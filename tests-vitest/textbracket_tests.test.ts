// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// TextBracket Tests - Vitest Version

import { describe, test } from 'vitest';

import { Flow } from '../src/flow';
import { ContextBuilder, Renderer } from '../src/renderer';
import { createAssert, FONT_STACKS, generateTestID, makeFactory, TestOptions } from './vitest_test_helpers';

describe('TextBracket', () => {
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
          const elementId = generateTestID('textbracket_test');

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

  runTest('Simple TextBracket', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const f = makeFactory(options.backend, options.elementId, 550);
    const stave = f.Stave();
    const score = f.EasyScore();

    const notes = score.notes('c4/4, c4, c4, c4, c4', { stem: 'up' });
    const voice = score.voice(notes, { time: '5/4' });

    f.TextBracket({
      from: notes[0],
      to: notes[4],
      text: '15',
      options: {
        superscript: 'va',
        position: 'top',
      },
    });

    f.TextBracket({
      from: notes[0],
      to: notes[4],
      text: '8',
      options: {
        superscript: 'vb',
        position: 'bottom',
        line: 3,
      },
    });

    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

    f.draw();

    assert.ok(true);
  });

  runTest('TextBracket Styles', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const f = makeFactory(options.backend, options.elementId, 550);
    const stave = f.Stave();
    const score = f.EasyScore();

    const notes = score.notes('c4/4, c4, c4, c4, c4', { stem: 'up' });
    const voice = score.voice(notes, { time: '5/4' });

    const topOctaves = [
      f.TextBracket({
        from: notes[0],
        to: notes[1],
        text: 'Cool notes',
        options: {
          superscript: '',
          position: 'top',
        },
      }),
      f.TextBracket({
        from: notes[2],
        to: notes[4],
        text: 'Testing',
        options: {
          position: 'top',
          superscript: 'superscript',
          // weight & style below can be left undefined. They will fall back to the default defined in textbracket.ts.
          font: { family: 'Arial', size: 15, weight: 'normal', style: 'normal' },
        },
      }),
    ];

    const bottomOctaves = [
      f.TextBracket({
        from: notes[0],
        to: notes[1],
        text: '8',
        options: {
          superscript: 'vb',
          position: 'bottom',
          line: 3,
          font: { size: 30 },
        },
      }),
      f.TextBracket({
        from: notes[2],
        to: notes[4],
        text: 'Not cool notes',
        options: {
          superscript: ' super uncool',
          position: 'bottom',
          line: 4,
        },
      }),
    ];

    topOctaves[1].render_options.line_width = 2;
    topOctaves[1].render_options.show_bracket = false;

    bottomOctaves[0].render_options.underline_superscript = false;
    bottomOctaves[0].setDashed(false);

    bottomOctaves[1].render_options.bracket_height = 40;
    bottomOctaves[1].setDashed(true, [2, 2]);

    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

    f.draw();

    assert.ok(true);
  });
});
