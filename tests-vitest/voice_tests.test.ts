// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Voice Tests - Vitest Version

import { describe, test } from 'vitest';

import { Flow } from '../src/flow';
import { Formatter } from '../src/formatter';
import { ContextBuilder, Renderer } from '../src/renderer';
import { Stave } from '../src/stave';
import { Barline } from '../src/stavebarline';
import { StaveNote } from '../src/stavenote';
import { Voice } from '../src/voice';
import { MockTickable } from './mocks';
import { createAssert, FONT_STACKS, generateTestID, TestOptions } from './vitest_test_helpers';

const BEAT = (1 * Flow.RESOLUTION) / 4;

// Helper function to create a tickable with a preset number of ticks.
const createTickable = () => new MockTickable().setTicks(BEAT);

describe('Voice', () => {
  // Helper function to run a rendering test with multiple backends and font stacks
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
          const elementId = generateTestID('voice_test');

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

  test('Strict Test', () => {
    const assert = createAssert();

    const tickables = [createTickable(), createTickable(), createTickable()];

    const voice = new Voice(Flow.TIME4_4);
    assert.equal(voice.getTotalTicks().value(), BEAT * 4, '4/4 Voice has 4 beats');
    assert.equal(voice.getTicksUsed().value(), BEAT * 0, 'No beats in voice');
    voice.addTickables(tickables);
    assert.equal(voice.getTicksUsed().value(), BEAT * 3, 'Three beats in voice');
    voice.addTickable(createTickable());
    assert.equal(voice.getTicksUsed().value(), BEAT * 4, 'Four beats in voice');
    assert.equal(voice.isComplete(), true, 'Voice is complete');

    const numeratorBeforeException = voice.getTicksUsed().numerator;
    assert.throws(() => voice.addTickable(createTickable()), /BadArgument/, '"Too many ticks" exception');

    // Verify that adding too many ticks does not affect the `ticksUsed` property of the voice.
    // See voice.ts: this.ticksUsed.subtract(ticks);
    assert.equal(
      voice.getTicksUsed().numerator,
      numeratorBeforeException,
      'Revert `ticksUsed` after a "Too many ticks" exception'
    );

    assert.equal(voice.getSmallestTickCount().value(), BEAT, 'Smallest tick count is BEAT');
  });

  test('Ignore Test', () => {
    const assert = createAssert();
    const tickables = [
      createTickable(),
      createTickable(),
      createTickable().setIgnoreTicks(true),
      createTickable(),
      createTickable().setIgnoreTicks(true),
      createTickable(),
    ];

    const voice = new Voice(Flow.TIME4_4);
    voice.addTickables(tickables);
    assert.ok(true, 'all pass');
  });

});
