// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// StaveLine Tests - Vitest Version

import { describe, test } from 'vitest';

import { Dot } from '../src/dot';
import { Flow } from '../src/flow';
import { Font, FontStyle } from '../src/font';
import { ContextBuilder, Renderer } from '../src/renderer';
import { createAssert, FONT_STACKS, generateTestID, makeFactory, TestOptions } from './vitest_test_helpers';

describe('StaveLine', () => {
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
          const elementId = generateTestID('staveline_test');

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

  runTest('Simple StaveLine', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const f = makeFactory(options.backend, options.elementId);
    const stave = f.Stave().addClef('treble');

    const notes = [
      f.StaveNote({ keys: ['c/4'], duration: '4', clef: 'treble' }),
      f.StaveNote({ keys: ['c/5'], duration: '4', clef: 'treble' }),
      f.StaveNote({ keys: ['c/4', 'g/4', 'b/4'], duration: '4', clef: 'treble' }),
      f.StaveNote({ keys: ['f/4', 'a/4', 'f/5'], duration: '4', clef: 'treble' }),
    ];

    const voice = f.Voice().addTickables(notes);

    f.StaveLine({
      from: notes[0],
      to: notes[1],
      first_indices: [0],
      last_indices: [0],
      options: {
        font: { family: Font.SERIF, size: 12, style: FontStyle.ITALIC },
        text: 'gliss.',
      },
    });

    const staveLine2 = f.StaveLine({
      from: notes[2],
      to: notes[3],
      first_indices: [2, 1, 0],
      last_indices: [0, 1, 2],
    });
    staveLine2.render_options.line_dash = [10, 10];

    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

    f.draw();

    assert.ok(true);
  });

  runTest('StaveLine Arrow Options', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const f = makeFactory(options.backend, options.elementId, 770);
    const stave = f.Stave().addClef('treble');

    const notes = [
      f.StaveNote({ keys: ['c#/5', 'd/5'], duration: '4', clef: 'treble', stem_direction: -1 }),
      f.StaveNote({ keys: ['c/4'], duration: '4', clef: 'treble' }).addModifier(f.Accidental({ type: '#' }), 0),
      f.StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: '4', clef: 'treble' }),
      f
        .StaveNote({ keys: ['f/4', 'a/4', 'c/5'], duration: '4', clef: 'treble' })
        .addModifier(f.Accidental({ type: '#' }), 2),
      f.StaveNote({ keys: ['c/4'], duration: '4', clef: 'treble' }).addModifier(f.Accidental({ type: '#' }), 0),
      f.StaveNote({ keys: ['c#/5', 'd/5'], duration: '4', clef: 'treble', stem_direction: -1 }),
      f.StaveNote({ keys: ['c/4', 'd/4', 'g/4'], duration: '4', clef: 'treble' }),
      f
        .StaveNote({ keys: ['f/4', 'a/4', 'c/5'], duration: '4', clef: 'treble' })
        .addModifier(f.Accidental({ type: '#' }), 2),
    ];
    Dot.buildAndAttach([notes[0]], { all: true });

    const voice = f.Voice().setStrict(false).addTickables(notes);

    const staveLine0 = f.StaveLine({
      from: notes[0],
      to: notes[1],
      first_indices: [0],
      last_indices: [0],
      options: { text: 'Left' },
    });

    const staveLine4 = f.StaveLine({
      from: notes[2],
      to: notes[3],
      first_indices: [1],
      last_indices: [1],
      options: { text: 'Right' },
    });

    const staveLine1 = f.StaveLine({
      from: notes[4],
      to: notes[5],
      first_indices: [0],
      last_indices: [0],
      options: { text: 'Center' },
    });

    const staveLine2 = f.StaveLine({
      from: notes[6],
      to: notes[7],
      first_indices: [1],
      last_indices: [0],
    });

    const staveLine3 = f.StaveLine({
      from: notes[6],
      to: notes[7],
      first_indices: [2],
      last_indices: [2],
      options: { text: 'Top' },
    });

    staveLine0.render_options.draw_end_arrow = true;
    staveLine0.render_options.text_justification = 1;
    staveLine0.render_options.text_position_vertical = 2;

    staveLine1.render_options.draw_end_arrow = true;
    staveLine1.render_options.arrowhead_length = 30;
    staveLine1.render_options.line_width = 5;
    staveLine1.render_options.text_justification = 2;
    staveLine1.render_options.text_position_vertical = 2;

    staveLine4.render_options.line_width = 2;
    staveLine4.render_options.draw_end_arrow = true;
    staveLine4.render_options.draw_start_arrow = true;
    staveLine4.render_options.arrowhead_angle = 0.5;
    staveLine4.render_options.arrowhead_length = 20;
    staveLine4.render_options.text_justification = 3;
    staveLine4.render_options.text_position_vertical = 2;

    staveLine2.render_options.draw_start_arrow = true;
    staveLine2.render_options.line_dash = [5, 4];

    staveLine3.render_options.draw_end_arrow = true;
    staveLine3.render_options.draw_start_arrow = true;
    staveLine3.render_options.color = 'red';
    staveLine3.render_options.text_position_vertical = 1;

    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

    f.draw();

    assert.ok(true);
  });
});
