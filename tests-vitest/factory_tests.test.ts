// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Factory Tests - Vitest Version

import { describe, test } from 'vitest';

import { Factory } from '../src/factory';
import { Flow } from '../src/flow';
import { Renderer } from '../src/renderer';
import { Barline } from '../src/stavebarline';
import { createAssert, FONT_STACKS, generateTestID, makeFactory, TestOptions } from './vitest_test_helpers';

describe('Factory', () => {
  // Helper function to run a test with multiple backends and font stacks
  function runTest(
    testName: string,
    testFunc: (options: TestOptions) => void,
    backends: Array<{ backend: number; fontStacks: string[] }> = [
      { backend: Renderer.Backends.CANVAS, fontStacks: ['Bravura'] },
      { backend: Renderer.Backends.SVG, fontStacks: ['Bravura', 'Gonville', 'Petaluma', 'Leland'] },
    ]
  ) {
    backends.forEach(({ backend, fontStacks }) => {
      fontStacks.forEach((fontStackName) => {
        test(`${testName} - ${backend === Renderer.Backends.SVG ? 'SVG' : 'Canvas'} - ${fontStackName}`, () => {
          const elementId = generateTestID('factory_test');

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
            testFunc(options);
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

  test('Defaults', () => {
    const assert = createAssert();

    // Throws RuntimeError: 'HTML DOM element not set in Factory'
    assert.throws(
      () => new Factory({ renderer: { elementId: '', width: 700, height: 500 } }),
      /renderer\.elementId not set/
    );

    const factory = new Factory({
      renderer: { elementId: null, width: 700, height: 500 },
    });

    // eslint-disable-next-line
    // @ts-ignore access a protected member for testing purposes.
    const factoryOptions = factory.options;
    assert.equal(factoryOptions.renderer.width, 700);
    assert.equal(factoryOptions.renderer.height, 500);
    assert.equal(factoryOptions.renderer.elementId, null);
    assert.equal(factoryOptions.stave.space, 10);
  });

  runTest('Draw', (options: TestOptions) => {
    const assert = createAssert();
    const f = Factory.newFromElementId(options.elementId);
    f.Stave().setClef('treble');
    f.draw();
    assert.ok(true);
  });

  runTest('Draw Tab (repeat barlines must be aligned)', (options: TestOptions) => {
    const assert = createAssert();
    const factory = makeFactory(options.backend, options.elementId, 500, 400);
    const system = factory.System({ width: 500 });
    const stave = factory.Stave().setClef('treble').setKeySignature('C#').setBegBarType(Barline.type.REPEAT_BEGIN);
    const voices = [factory.Voice().addTickables([factory.GhostNote({ duration: 'w' })])];
    system.addStave({ stave, voices });

    const tabStave = factory.TabStave().setClef('tab').setBegBarType(Barline.type.REPEAT_BEGIN);
    const tabVoices = [factory.Voice().addTickables([factory.GhostNote({ duration: 'w' })])];
    system.addStave({ stave: tabStave, voices: tabVoices });

    factory.draw();
    assert.equal(stave.getModifiers()[0].getX(), tabStave.getModifiers()[0].getX());
  });
});
