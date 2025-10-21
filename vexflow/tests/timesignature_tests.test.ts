// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// TimeSignature Tests - Vitest Version

import { describe, test } from 'vitest';

import { Flow } from '../src/flow';
import { ContextBuilder, Renderer } from '../src/renderer';
import { Stave, StaveLineConfig } from '../src/stave';
import { StaveConnector } from '../src/staveconnector';
import { TimeSignature } from '../src/timesignature';
import { createAssert, expectMatchingScreenshot, FONT_STACKS, generateTestID, makeFactory, TestOptions } from './vitest_test_helpers';

describe('TimeSignature', () => {
  test('Time Signature Parser', () => {
    const assert = createAssert();

    // Set up font for unit test
    const originalFontNames = Flow.getMusicFont();
    Flow.setMusicFont(...FONT_STACKS['Bravura']);

    try {
      const timeSig = new TimeSignature();
      assert.equal(timeSig.getTimeSpec(), '4/4', 'default time signature is 4/4');

    const mustFail = ['asdf', '123/', '/10', '/', '4567', 'C+', '1+', '+1', '(3+', '+3)', '()', '(+)'];
    mustFail.forEach((invalidString) => {
      assert.throws(() => timeSig.parseTimeSpec(invalidString), /BadTimeSignature/);
    });

    const mustPass = ['4/4', '10/12', '1/8', '1234567890/1234567890', 'C', 'C|', '+'];
    mustPass.forEach((validString) => timeSig.parseTimeSpec(validString));

      timeSig.setTimeSig('4/4');
      assert.equal(timeSig.getIsNumeric(), true, '4/4 is numeric');
      assert.equal(timeSig.getLine(), 0, 'digits are on line 0');
      timeSig.setTimeSig('C|');
      assert.equal(timeSig.getTimeSpec(), 'C|', 'timeSpec changed to C|');
      assert.equal(timeSig.getIsNumeric(), false, 'cut time is not numeric');
      assert.equal(timeSig.getLine(), 2, 'cut/common are on line 2');

      assert.ok(true, 'all pass');
    } finally {
      // Restore original font
      Flow.setMusicFont(...originalFontNames);
    }
  });

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
          const elementId = generateTestID('timesig_test');

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

  runTest('Basic Time Signatures', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const ctx = contextBuilder(options.elementId, 600, 120);

    new Stave(10, 10, 500)
      .addTimeSignature('2/2')
      .addTimeSignature('3/4')
      .addTimeSignature('4/4')
      .addTimeSignature('6/8')
      .addTimeSignature('C')
      .addTimeSignature('C|')
      .addEndTimeSignature('2/2')
      .addEndTimeSignature('3/4')
      .addEndTimeSignature('4/4')
      .addEndClef('treble')
      .addEndTimeSignature('6/8')
      .addEndTimeSignature('C')
      .addEndTimeSignature('C|')
      .setContext(ctx)
      .draw();

    await expectMatchingScreenshot(options, 'timesignature_tests.test.ts');
    assert.ok(true, 'all pass');
  });

  runTest('Big Signature Test', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const ctx = contextBuilder(options.elementId, 400, 120);

    new Stave(10, 10, 300)
      .addTimeSignature('12/8')
      .addTimeSignature('7/16')
      .addTimeSignature('1234567/890')
      .addTimeSignature('987/654321')
      .setContext(ctx)
      .draw();

    await expectMatchingScreenshot(options, 'timesignature_tests.test.ts');
    assert.ok(true, 'all pass');
  });

  runTest('Additive Signature Test', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const ctx = contextBuilder(options.elementId, 400, 120);

    new Stave(10, 10, 300).addTimeSignature('2+3+2/8').setContext(ctx).draw();

    await expectMatchingScreenshot(options, 'timesignature_tests.test.ts');
    assert.ok(true, 'all pass');
  });

  runTest('Alternating Signature Test', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const ctx = contextBuilder(options.elementId, 400, 120);

    new Stave(10, 10, 300).addTimeSignature('6/8').addTimeSignature('+').addTimeSignature('3/4').setContext(ctx).draw();

    await expectMatchingScreenshot(options, 'timesignature_tests.test.ts');
    assert.ok(true, 'all pass');
  });

  runTest('Interchangeable Signature Test', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const ctx = contextBuilder(options.elementId, 400, 120);

    new Stave(10, 10, 300).addTimeSignature('3/4').addTimeSignature('-').addTimeSignature('2/4').setContext(ctx).draw();

    await expectMatchingScreenshot(options, 'timesignature_tests.test.ts');
    assert.ok(true, 'all pass');
  });

  runTest('Aggregate Signature Test', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const ctx = contextBuilder(options.elementId, 400, 120);

    new Stave(10, 10, 300)
      .addTimeSignature('2/4')
      .addTimeSignature('+')
      .addTimeSignature('3/8')
      .addTimeSignature('+')
      .addTimeSignature('5/4')
      .setContext(ctx)
      .draw();

    await expectMatchingScreenshot(options, 'timesignature_tests.test.ts');
    assert.ok(true, 'all pass');
  });

  runTest('Complex Signature Test', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const ctx = contextBuilder(options.elementId, 400, 120);

    new Stave(10, 10, 300)
      .addTimeSignature('(2+3)/16')
      .addTimeSignature('+')
      .addTimeSignature('3/8')
      .setContext(ctx)
      .draw();

    await expectMatchingScreenshot(options, 'timesignature_tests.test.ts');
    assert.ok(true, 'all pass');
  });

  runTest('Time Signature multiple staves alignment test', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const ctx = contextBuilder(options.elementId, 400, 350);

    const stave1LineConfig: StaveLineConfig[] = [false, false, true, false, false].map((visible) => ({ visible }));
    const stave1 = new Stave(15, 0, 300)
      .setConfigForLines(stave1LineConfig)
      .addClef('percussion')
      .addTimeSignature('4/4', 25)
      .setContext(ctx)
      .draw();
    const stave2 = new Stave(15, 110, 300).addClef('treble').addTimeSignature('4/4').setContext(ctx).draw();
    const stave3 = new Stave(15, 220, 300).addClef('bass').addTimeSignature('4/4').setContext(ctx).draw();

    Stave.formatBegModifiers([stave1, stave2, stave3]);

    new StaveConnector(stave1, stave2).setType('single').setContext(ctx).draw();
    new StaveConnector(stave2, stave3).setType('single').setContext(ctx).draw();
    new StaveConnector(stave2, stave3).setType('brace').setContext(ctx).draw();

    await expectMatchingScreenshot(options, 'timesignature_tests.test.ts');
    assert.ok(true, 'all pass');
  });

  runTest('Time Signature Change Test', async (options: TestOptions) => {
    const assert = createAssert();
    const f = makeFactory(options.backend, options.elementId, 900, 140, options);
    const stave = f.Stave({ x: 0, y: 0 }).addClef('treble').addTimeSignature('C|');

    const tickables = [
      f.StaveNote({ keys: ['c/4'], duration: '4', clef: 'treble' }),
      f.TimeSigNote({ time: '3/4' }),
      f.StaveNote({ keys: ['d/4'], duration: '4', clef: 'alto' }),
      f.StaveNote({ keys: ['b/3'], duration: '4r', clef: 'alto' }),
      f.TimeSigNote({ time: 'C' }),
      f.StaveNote({ keys: ['c/3', 'e/3', 'g/3'], duration: '4', clef: 'bass' }),
      f.TimeSigNote({ time: '9/8' }),
      f.StaveNote({ keys: ['c/4'], duration: '4', clef: 'treble' }),
    ];
    const voice = f.Voice().setStrict(false).addTickables(tickables);

    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);
    f.draw();

    await expectMatchingScreenshot(options, 'timesignature_tests.test.ts');
    assert.ok(true, 'all pass');
  });
});
