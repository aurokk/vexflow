// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// PedalMarking Tests - Vitest Version

import { describe, test } from 'vitest';

import { Factory } from '../src/factory';
import { Flow } from '../src/flow';
import { ContextBuilder, Renderer } from '../src/renderer';
import { StaveNote } from '../src/stavenote';
import { Tickable } from '../src/tickable';
import { createAssert, FONT_STACKS, generateTestID, makeFactory, TestOptions } from './vitest_test_helpers';

function createTest(
  makePedal: (f: Factory, v1: Tickable[], v2: Tickable[]) => void,
  options: TestOptions,
  contextBuilder: ContextBuilder
) {
  const assert = createAssert();
  const f = makeFactory(options.backend, options.elementId, 550, 200);
  const score = f.EasyScore();

  const stave0 = f.Stave({ width: 250 }).addClef('treble');
  const voice0 = score.voice(score.notes('b4/4, b4, b4, b4[stem="down"]', { stem: 'up' }));
  f.Formatter().joinVoices([voice0]).formatToStave([voice0], stave0);

  const stave1 = f.Stave({ width: 260, x: 250 });
  const voice1 = score.voice(score.notes('c4/4, c4, c4, c4', { stem: 'up' }));
  f.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);

  makePedal(f, voice0.getTickables(), voice1.getTickables());

  f.draw();

  assert.ok(true, 'Must render');
}

function withSimplePedal(style: string) {
  return (factory: Factory, notes0: Tickable[], notes1: Tickable[]) =>
    factory.PedalMarking({
      notes: [notes0[0], notes0[2], notes0[3], notes1[3]] as StaveNote[],
      options: { style },
    });
}

function withReleaseAndDepressedPedal(style: string) {
  return (factory: Factory, notes0: Tickable[], notes1: Tickable[]) =>
    factory.PedalMarking({
      notes: [notes0[0], notes0[3], notes0[3], notes1[1], notes1[1], notes1[3]] as StaveNote[],
      options: { style },
    });
}

describe('PedalMarking', () => {
  // Helper function to run a test with multiple backends and font stacks
  function runTest(
    testName: string,
    makePedal: (f: Factory, v1: Tickable[], v2: Tickable[]) => void,
    backends: Array<{ backend: number; fontStacks: string[] }> = [
      { backend: Renderer.Backends.CANVAS, fontStacks: ['Bravura'] },
      { backend: Renderer.Backends.SVG, fontStacks: ['Bravura', 'Gonville', 'Petaluma', 'Leland'] },
    ]
  ) {
    backends.forEach(({ backend, fontStacks }) => {
      fontStacks.forEach((fontStackName) => {
        test(`${testName} - ${backend === Renderer.Backends.SVG ? 'SVG' : 'Canvas'} - ${fontStackName}`, () => {
          const elementId = generateTestID('pedalmarking_test');

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
            createTest(makePedal, options, contextBuilder);
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

  runTest('Simple Pedal 1', withSimplePedal('text'));
  runTest('Simple Pedal 2', withSimplePedal('bracket'));
  runTest('Simple Pedal 3', withSimplePedal('mixed'));
  runTest('Release and Depress on Same Note 1', withReleaseAndDepressedPedal('bracket'));
  runTest('Release and Depress on Same Note 2', withReleaseAndDepressedPedal('mixed'));

  runTest('Custom Text 1', (factory, notes0, notes1) => {
    const pedal = factory.PedalMarking({
      notes: [notes0[0], notes1[3]] as StaveNote[],
      options: { style: 'text' },
    });
    pedal.setCustomText('una corda', 'tre corda');
    return pedal;
  });

  runTest('Custom Text 2', (factory, notes0, notes1) => {
    const pedal = factory.PedalMarking({
      notes: [notes0[0], notes1[3]] as StaveNote[],
      options: { style: 'mixed' },
    });
    pedal.setCustomText('Sost. Ped.');
    return pedal;
  });
});
