// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Key Signature Tests - Vitest Version
//

import { describe, test } from 'vitest';

import { Flow } from '../src/flow';
import { Glyph } from '../src/glyph';
import { KeySignature } from '../src/keysignature';
import { ContextBuilder, Renderer } from '../src/renderer';
import { Stave } from '../src/stave';
import { BarlineType } from '../src/stavebarline';
import { createAssert, expectMatchingScreenshot, FONT_STACKS, generateTestID, MAJOR_KEYS, makeFactory, MINOR_KEYS, TestOptions } from './vitest_test_helpers';


const fontWidths = () => {
  const glyphScale = 39; // default font scale
  const sharpWidth = Glyph.getWidth('accidentalSharp', glyphScale) + 1;
  const flatWidth = Glyph.getWidth('accidentalFlat', glyphScale) + 1;
  const naturalWidth = Glyph.getWidth('accidentalNatural', glyphScale) + 2;
  const clefWidth = Glyph.getWidth('gClef', glyphScale) * 2; // widest clef
  return { sharpWidth, flatWidth, naturalWidth, clefWidth };
};

describe('KeySignature', () => {
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
          const elementId = generateTestID('keysignature_test');

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

  test('Key Parser Test', () => {
    const assert = createAssert();

    function catchError(spec: string): void {
      assert.throws(() => Flow.keySignature(spec), /BadKeySignature/);
    }

    catchError('asdf');
    catchError('D!');
    catchError('E#');
    catchError('D#');
    catchError('#');
    catchError('b');
    catchError('Kb');
    catchError('Fb');
    catchError('Dbm');
    catchError('B#m');

    Flow.keySignature('B');
    Flow.keySignature('C');
    Flow.keySignature('Fm');
    Flow.keySignature('Ab');
    Flow.keySignature('Abm');
    Flow.keySignature('F#');
    Flow.keySignature('G#m');

    assert.ok(true, 'all pass');
  });

  runTest('Major Key Test', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const w = fontWidths();
    const accidentalCount = 28; // total number in all the keys
    const casePadding = 10; // hard-coded in staveModifier
    const testCases = 7; // all keys, but includes key of C
    const sharpTestWidth = accidentalCount * w.sharpWidth + casePadding * testCases + Stave.defaultPadding;
    const flatTestWidth = accidentalCount * w.flatWidth + casePadding * testCases + Stave.defaultPadding;

    const ctx = contextBuilder(options.elementId, Math.max(sharpTestWidth, flatTestWidth) + 100, 240);
    const stave1 = new Stave(10, 10, flatTestWidth);
    const stave2 = new Stave(10, 90, sharpTestWidth);
    const keys = MAJOR_KEYS;

    let keySig = null;
    for (let i = 0; i < 8; ++i) {
      keySig = new KeySignature(keys[i]);
      keySig.addToStave(stave1);
    }

    for (let n = 8; n < keys.length; ++n) {
      keySig = new KeySignature(keys[n]);
      keySig.addToStave(stave2);
    }

    stave1.setContext(ctx);
    stave1.draw();
    stave2.setContext(ctx);
    stave2.draw();

    await expectMatchingScreenshot(options, 'keysignature_tests.test.ts');

    assert.ok(true, 'all pass');
  });

  runTest('Minor Key Test', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const accidentalCount = 28; // total number in all the keys
    const w = fontWidths();
    const casePadding = 10; // hard-coded in staveModifier
    const testCases = 7; // all keys, but includes key of C
    const sharpTestWidth = accidentalCount * w.sharpWidth + casePadding * testCases + Stave.defaultPadding;
    const flatTestWidth = accidentalCount * w.flatWidth + casePadding * testCases + Stave.defaultPadding;

    const ctx = contextBuilder(options.elementId, Math.max(sharpTestWidth, flatTestWidth) + 100, 240);
    const stave1 = new Stave(10, 10, flatTestWidth);
    const stave2 = new Stave(10, 90, sharpTestWidth);
    const keys = MINOR_KEYS;

    let keySig = null;
    for (let i = 0; i < 8; ++i) {
      keySig = new KeySignature(keys[i]);
      keySig.addToStave(stave1);
    }

    for (let n = 8; n < keys.length; ++n) {
      keySig = new KeySignature(keys[n]);
      keySig.addToStave(stave2);
    }

    stave1.setContext(ctx);
    stave1.draw();
    stave2.setContext(ctx);
    stave2.draw();

    await expectMatchingScreenshot(options, 'keysignature_tests.test.ts');

    assert.ok(true, 'all pass');
  });

  runTest('Stave Helper', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const w = fontWidths();
    const accidentalCount = 28; // total number in all the keys
    const casePadding = 10; // hard-coded in staveModifier
    const testCases = 7; // all keys, but includes key of C
    const sharpTestWidth = accidentalCount * w.sharpWidth + casePadding * testCases + Stave.defaultPadding;
    const flatTestWidth = accidentalCount * w.flatWidth + casePadding * testCases + Stave.defaultPadding;

    const ctx = contextBuilder(options.elementId, Math.max(sharpTestWidth, flatTestWidth) + 100, 240);
    const stave1 = new Stave(10, 10, flatTestWidth);
    const stave2 = new Stave(10, 90, sharpTestWidth);
    const keys = MAJOR_KEYS;

    for (let i = 0; i < 8; ++i) {
      stave1.addKeySignature(keys[i]);
    }

    for (let n = 8; n < keys.length; ++n) {
      stave2.addKeySignature(keys[n]);
    }

    stave1.setContext(ctx);
    stave1.draw();
    stave2.setContext(ctx);
    stave2.draw();

    await expectMatchingScreenshot(options, 'keysignature_tests.test.ts');

    assert.ok(true, 'all pass');
  });

  runTest('Cancelled key test', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const scale = 0.9;
    const w = fontWidths();
    const flatPadding = 18;
    const sharpPadding = 20;
    const flatTestCases = 8;
    const sharpTestCases = 7;
    // magic numbers are the numbers of that symbol that appear in the test case
    const sharpTestWidth =
      28 * w.sharpWidth + 21 * w.naturalWidth + sharpPadding * sharpTestCases + Stave.defaultPadding + w.clefWidth;
    const flatTestWidth =
      28 * w.flatWidth + 28 * w.naturalWidth + flatPadding * flatTestCases + Stave.defaultPadding + w.clefWidth;
    const eFlatTestWidth =
      28 * w.flatWidth + 32 * w.naturalWidth + flatPadding * flatTestCases + Stave.defaultPadding + w.clefWidth;
    const eSharpTestWidth =
      28 * w.sharpWidth + 28 * w.naturalWidth + sharpPadding * sharpTestCases + Stave.defaultPadding + w.clefWidth;
    const maxWidth = Math.max(Math.max(sharpTestWidth, flatTestWidth, Math.max(eSharpTestWidth, eFlatTestWidth)));
    const ctx = contextBuilder(options.elementId, maxWidth + 100, 500);
    ctx.scale(scale, scale);
    const stave1 = new Stave(10, 10, flatTestWidth).addClef('treble');
    const stave2 = new Stave(10, 90, sharpTestWidth).addClef('treble');
    const stave3 = new Stave(10, 170, eFlatTestWidth).addClef('treble');
    const stave4 = new Stave(10, 250, eSharpTestWidth).addClef('treble');
    const keys = MAJOR_KEYS;

    let keySig = null;
    let i;
    let n;
    for (i = 0; i < 8; ++i) {
      keySig = new KeySignature(keys[i]);
      keySig.cancelKey('Cb');
      keySig.setPadding(flatPadding);
      keySig.addToStave(stave1);
    }

    for (n = 8; n < keys.length; ++n) {
      keySig = new KeySignature(keys[n]);
      keySig.cancelKey('C#');
      keySig.setPadding(sharpPadding);
      keySig.addToStave(stave2);
    }

    for (i = 0; i < 8; ++i) {
      keySig = new KeySignature(keys[i]);
      keySig.cancelKey('E');
      keySig.setPadding(flatPadding);
      keySig.addToStave(stave3);
    }

    for (n = 8; n < keys.length; ++n) {
      keySig = new KeySignature(keys[n]);
      keySig.cancelKey('Ab');
      keySig.setPadding(sharpPadding);
      keySig.addToStave(stave4);
    }

    stave1.setContext(ctx);
    stave1.draw();
    stave2.setContext(ctx);
    stave2.draw();
    stave3.setContext(ctx);
    stave3.draw();
    stave4.setContext(ctx);
    stave4.draw();

    await expectMatchingScreenshot(options, 'keysignature_tests.test.ts');

    assert.ok(true, 'all pass');
  });

  runTest('Cancelled key (for each clef) test', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const scale = 0.8;
    const w = fontWidths();
    const keyPadding = 10;
    const keys = ['C#', 'Cb'];
    const flatsKey = [7, 14];
    const sharpsKey = [14, 7];
    const natsKey = [7, 7];
    const max = 21 * Math.max(w.sharpWidth, w.flatWidth) * 2 + keyPadding * 6 + Stave.defaultPadding + w.clefWidth;
    const ctx = contextBuilder(options.elementId, max + 100, 380);
    ctx.scale(scale, scale);

    const x = 20;
    let y = 20;
    let tx = x;
    ['bass', 'tenor', 'soprano', 'mezzo-soprano', 'baritone-f'].forEach(function (clef) {
      keys.forEach((key, keyIx) => {
        const cancelKey = keys[(keyIx + 1) % 2];
        const width =
          flatsKey[keyIx] * w.flatWidth +
          natsKey[keyIx] * w.naturalWidth +
          sharpsKey[keyIx] * w.sharpWidth +
          keyPadding * 3 +
          w.clefWidth +
          Stave.defaultPadding;
        const stave = new Stave(tx, y, width);
        stave.setClef(clef);
        stave.addKeySignature(cancelKey);
        stave.addKeySignature(key, cancelKey);
        stave.addKeySignature(key);
        stave.setContext(ctx).draw();
        tx += width;
      });
      tx = x;
      y += 80;
    });

    await expectMatchingScreenshot(options, 'keysignature_tests.test.ts');

    assert.ok(true, 'all pass');
  });

  runTest('Altered key test', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const ctx = contextBuilder(options.elementId, 780, 500);
    ctx.scale(0.9, 0.9);
    const stave1 = new Stave(10, 10, 750).addClef('treble');
    const stave2 = new Stave(10, 90, 750).addClef('treble');
    const stave3 = new Stave(10, 170, 750).addClef('treble');
    const stave4 = new Stave(10, 250, 750).addClef('treble');
    const keys = MAJOR_KEYS;

    let keySig = null;
    let i;
    let n;
    for (i = 0; i < 8; ++i) {
      keySig = new KeySignature(keys[i]);
      keySig.alterKey(['bs', 'bs']);
      keySig.setPadding(18);
      keySig.addToStave(stave1);
    }

    for (n = 8; n < keys.length; ++n) {
      keySig = new KeySignature(keys[n]);
      keySig.alterKey(['+', '+', '+']);
      keySig.setPadding(20);
      keySig.addToStave(stave2);
    }

    for (i = 0; i < 8; ++i) {
      keySig = new KeySignature(keys[i]);
      keySig.alterKey(['n', 'bs', 'bb']);
      keySig.setPadding(18);
      keySig.addToStave(stave3);
    }

    for (n = 8; n < keys.length; ++n) {
      keySig = new KeySignature(keys[n]);
      keySig.alterKey(['++', '+', 'n', '+']);
      keySig.setPadding(20);
      keySig.addToStave(stave4);
    }

    stave1.setContext(ctx);
    stave1.draw();
    stave2.setContext(ctx);
    stave2.draw();
    stave3.setContext(ctx);
    stave3.draw();
    stave4.setContext(ctx);
    stave4.draw();

    await expectMatchingScreenshot(options, 'keysignature_tests.test.ts');

    assert.ok(true, 'all pass');
  });

  runTest('End key with clef test', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const ctx = contextBuilder(options.elementId, 400, 200);
    ctx.scale(0.9, 0.9);
    const stave1 = new Stave(10, 10, 350);
    stave1
      .setKeySignature('G')
      .setBegBarType(BarlineType.REPEAT_BEGIN)
      .setEndBarType(BarlineType.REPEAT_END)
      .setClef('treble')
      .addTimeSignature('4/4')
      .setEndClef('bass')
      .setEndKeySignature('Cb');
    const stave2 = new Stave(10, 90, 350);
    stave2.setKeySignature('Cb').setClef('bass').setEndClef('treble').setEndKeySignature('G');

    stave1.setContext(ctx).draw();
    stave2.setContext(ctx).draw();

    await expectMatchingScreenshot(options, 'keysignature_tests.test.ts');

    assert.ok(true, 'all pass');
  });

  runTest('Key Signature Change test', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const f = makeFactory(options.backend, options.elementId, 900, undefined, options);

    // The previous code was buggy: f.Stave(10, 10, 800), even though Factory.Stave() only accepts 1 argument.
    const stave = f.Stave({ x: 10, y: 10, width: 800 }).addClef('treble').addTimeSignature('C|');

    const voice = f
      .Voice()
      .setStrict(false)
      .addTickables([
        f.KeySigNote({ key: 'Bb' }),
        f.StaveNote({ keys: ['c/4'], duration: '1' }),
        f.BarNote(),
        f.KeySigNote({ key: 'D', cancelKey: 'Bb' }),
        f.StaveNote({ keys: ['c/4'], duration: '1' }),
        f.BarNote(),
        f.KeySigNote({ key: 'Bb' }),
        f.StaveNote({ keys: ['c/4'], duration: '1' }),
        f.BarNote(),
        f.KeySigNote({ key: 'D', alterKey: ['b', 'n'] }), // TODO: alterKey needs to be a string[]
        f.StaveNote({ keys: ['c/4'], duration: '1' }),
      ]);

    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

    f.draw();

    await expectMatchingScreenshot(options, 'keysignature_tests.test.ts');

    assert.ok(true, 'all pass');
  });

  runTest('Key Signature with/without clef symbol', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const f = makeFactory(options.backend, options.elementId, 900, undefined, options);
    const stave = f.Stave({ x: 10, y: 10, width: 800 }).addClef('bass').addTimeSignature('C|').setClefLines('bass');

    const voice = f
      .Voice()
      .setStrict(false)
      .addTickables([
        f.KeySigNote({ key: 'Bb' }),
        f.StaveNote({ keys: ['c/4'], duration: '1', clef: 'bass' }),
        f.BarNote(),
        f.KeySigNote({ key: 'D', cancelKey: 'Bb' }),
        f.StaveNote({ keys: ['c/4'], duration: '1', clef: 'bass' }),
        f.BarNote(),
        f.KeySigNote({ key: 'Bb' }),
        f.StaveNote({ keys: ['c/4'], duration: '1', clef: 'bass' }),
        f.BarNote(),
        f.KeySigNote({ key: 'D', alterKey: ['b', 'n'] }),
        f.StaveNote({ keys: ['c/4'], duration: '1', clef: 'bass' }),
      ]);

    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

    f.draw();

    await expectMatchingScreenshot(options, 'keysignature_tests.test.ts');

    assert.ok(true, 'all pass');
  });
});
