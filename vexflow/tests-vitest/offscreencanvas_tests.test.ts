// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2021.
// MIT License
//
// OffscreenCanvas Tests - Vitest Version

import { afterAll, beforeAll, describe, test } from 'vitest';

import { CanvasContext } from '../src/canvascontext';
import { Flow } from '../src/flow';
import { Formatter } from '../src/formatter';
import { Stave } from '../src/stave';
import { BarlineType } from '../src/stavebarline';
import { StaveNote } from '../src/stavenote';
import { globalObject } from '../src/util';
import { createAssert, FONT_STACKS } from './vitest_test_helpers';

describe('OffscreenCanvas', () => {
  let originalFontNames: string[];

  beforeAll(async () => {
    originalFontNames = Flow.getMusicFont();
    Flow.setMusicFont(...FONT_STACKS['Bravura']);

    // Skip tests if OffscreenCanvas is not available
    if (globalObject().OffscreenCanvas === undefined) {
      console.log('Skipping OffscreenCanvas tests: OffscreenCanvas is not available');
    }
  });

  afterAll(() => {
    Flow.setMusicFont(...originalFontNames);
  });

  test('Simple Test', () => {
    const assert = createAssert();

    // Skip test if OffscreenCanvas is not available
    if (globalObject().OffscreenCanvas === undefined) {
      assert.ok(true, 'Skipped: OffscreenCanvas not available');
      return;
    }

    // Create a CanvasContext from an OffscreenCanvas.
    // eslint-disable-next-line
    // @ts-ignore
    const offscreenCanvas = new OffscreenCanvas(550, 200);
    // eslint-disable-next-line
    // @ts-ignore
    const offscreenCtx: OffscreenCanvasRenderingContext2D = offscreenCanvas.getContext('2d');
    if (offscreenCtx == null) {
      throw new Error("Couldn't create offscreen context");
    }
    const ctx = new CanvasContext(offscreenCtx);

    // Render to the OffscreenCavans.
    const stave = new Stave(10, 50, 200);
    stave.setEndBarType(BarlineType.END);
    stave.addClef('treble').setContext(ctx).draw();
    const notes = [
      new StaveNote({ keys: ['c/4'], duration: 'q' }),
      new StaveNote({ keys: ['d/4'], duration: 'q' }),
      new StaveNote({ keys: ['r/4'], duration: 'qr' }),
      new StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: 'q' }),
    ];
    Formatter.FormatAndDraw(ctx, stave, notes);

    // Copy the contents of the OffscreenCanvas to an HTMLCanvasElement.
    const imgBmp = offscreenCanvas.transferToImageBitmap();
    const canvas = document.createElement('canvas');
    canvas.width = offscreenCanvas.width;
    canvas.height = offscreenCanvas.height;
    const canvasCtx = canvas.getContext('2d');
    if (canvasCtx == null) {
      throw new Error("Couldn't create canvas context");
    }
    canvasCtx.drawImage(imgBmp, 0, 0);
    document.body.appendChild(canvas);

    assert.ok(true, 'all pass');
  });
});
