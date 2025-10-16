// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// MultiMeasureRest Tests - Vitest Version

import { describe, test } from 'vitest';

import { Flow } from '../src/flow';
import { Font } from '../src/font';
import { MultimeasureRestRenderOptions } from '../src/multimeasurerest';
import { ContextBuilder, Renderer } from '../src/renderer';
import { createAssert, expectMatchingScreenshot, FONT_STACKS, generateTestID, makeFactory, TestOptions } from './vitest_test_helpers';


describe('MultiMeasureRest', () => {
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
          const elementId = generateTestID('multimeasurerest_test');

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

  runTest('Simple Test', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const width = 910;
    const f = makeFactory(options.backend, options.elementId, width, 300, options);
    const line_spacing_15px = { options: { spacing_between_lines_px: 15 } };

    // Each item below is an array that contains:
    //   item[0] => staveParams to adjust vertical spacing between lines
    //   item[1] => multiMeasureRestParams
    // eslint-disable-next-line
    const params: [any, MultimeasureRestRenderOptions][] = [
      [{}, { number_of_measures: 2, show_number: false }],
      [{}, { number_of_measures: 2 }],
      [{}, { number_of_measures: 2, line_thickness: 8, serif_thickness: 3 }],
      [{}, { number_of_measures: 1, use_symbols: true }],
      [{}, { number_of_measures: 2, use_symbols: true }],
      [{}, { number_of_measures: 3, use_symbols: true }],
      [{}, { number_of_measures: 4, use_symbols: true }],
      [{}, { number_of_measures: 5, use_symbols: true }],
      [{}, { number_of_measures: 6, use_symbols: true }],
      [{}, { number_of_measures: 7, use_symbols: true }],
      [{}, { number_of_measures: 8, use_symbols: true }],
      [{}, { number_of_measures: 9, use_symbols: true }],
      [{}, { number_of_measures: 10, use_symbols: true }],
      [{}, { number_of_measures: 11, use_symbols: true }],
      [{}, { number_of_measures: 11, use_symbols: false, padding_left: 20, padding_right: 20 }],
      [{}, { number_of_measures: 11, use_symbols: true, symbol_spacing: 5 }],
      [{}, { number_of_measures: 11, use_symbols: false, line: 3, number_line: 2 }],
      [{}, { number_of_measures: 11, use_symbols: true, line: 3, number_line: 2 }],
      [line_spacing_15px, { number_of_measures: 12 }],
      [line_spacing_15px, { number_of_measures: 9, use_symbols: true }],
      [line_spacing_15px, { number_of_measures: 12, spacing_between_lines_px: 15, number_glyph_point: 40 * 1.5 }],
      [
        line_spacing_15px,
        {
          number_of_measures: 9,
          spacing_between_lines_px: 15,
          use_symbols: true,
          number_glyph_point: 40 * 1.5,
        },
      ],
      [
        line_spacing_15px,
        {
          number_of_measures: 9,
          spacing_between_lines_px: 15,
          use_symbols: true,
          number_glyph_point: 40 * 1.5,
          semibreve_rest_glyph_scale: Flow.NOTATION_FONT_SCALE * 1.5,
        },
      ],
    ];

    const staveWidth = 100;
    let x = 0;
    let y = 0;
    const mmRests = params.map((param) => {
      if (x + staveWidth * 2 > width) {
        x = 0;
        y += 80;
      }
      const staveParams = param[0];
      const mmRestParams = param[1];
      staveParams.x = x;
      staveParams.y = y;
      staveParams.width = staveWidth;
      x += staveWidth;
      const stave = f.Stave(staveParams);
      return f.MultiMeasureRest(mmRestParams).setStave(stave);
    });

    f.draw();

    const xs = mmRests[0].getXs();
    // eslint-disable-next-line
    const strY = mmRests[0].getStave()!.getYForLine(-0.5);
    const str = 'TACET';
    const context = f.getContext();
    context.save();
    context.setFont(Font.SERIF, 16, 'bold');
    const metrics = context.measureText(str);
    context.fillText(str, xs.left + (xs.right - xs.left) * 0.5 - metrics.width * 0.5, strY);
    context.restore();

    await expectMatchingScreenshot(options, 'multimeasurerest_tests.test.ts');

    assert.ok(true, 'Simple Test');
  });

  runTest('Stave with modifiers Test', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const width = 910;
    const f = makeFactory(options.backend, options.elementId, width, 200, options);
    let x = 0;
    let y = 0;

    // eslint-disable-next-line
    const params: [any, MultimeasureRestRenderOptions][] = [
      [{ clef: 'treble', params: { width: 150 } }, { number_of_measures: 5 }],
      [{ clef: 'treble', keySig: 'G', params: { width: 150 } }, { number_of_measures: 5 }],
      [{ clef: 'treble', timeSig: '4/4', keySig: 'G', params: { width: 150 } }, { number_of_measures: 5 }],
      [{ clef: 'treble', endClef: 'bass', params: { width: 150 } }, { number_of_measures: 5 }],
      [{ clef: 'treble', endKeySig: 'F', params: { width: 150 } }, { number_of_measures: 5 }],
      [{ clef: 'treble', endTimeSig: '2/4', params: { width: 150 } }, { number_of_measures: 5 }],
      [{ clef: 'treble', endClef: 'bass', endTimeSig: '2/4', params: { width: 150 } }, { number_of_measures: 5 }],
      [
        { clef: 'treble', endClef: 'bass', endTimeSig: '2/4', params: { width: 150 } },
        { number_of_measures: 5, use_symbols: true },
      ],
    ];

    params.forEach((param) => {
      const staveOptions = param[0];
      // eslint-disable-next-line
      const staveParams = staveOptions.params!;
      const mmrestParams = param[1];

      if (x + staveParams.width > width) {
        x = 0;
        y += 80;
      }

      staveParams.x = x;
      x += staveParams.width;
      staveParams.y = y;
      const stave = f.Stave(staveParams);
      if (staveOptions.clef) {
        stave.addClef(staveOptions.clef);
      }
      if (staveOptions.timeSig) {
        stave.addTimeSignature(staveOptions.timeSig);
      }
      if (staveOptions.keySig) {
        stave.addKeySignature(staveOptions.keySig);
      }
      if (staveOptions.endClef) {
        stave.addEndClef(staveOptions.endClef);
      }
      if (staveOptions.endKeySig) {
        stave.setEndKeySignature(staveOptions.endKeySig);
      }
      if (staveOptions.endTimeSig) {
        stave.setEndTimeSignature(staveOptions.endTimeSig);
      }
      return f.MultiMeasureRest(mmrestParams).setStave(stave);
    });

    f.draw();

    await expectMatchingScreenshot(options, 'multimeasurerest_tests.test.ts');

    assert.ok(true, 'Stave with modifiers Test');
  });
});
