// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Barline Tests - Vitest Version

import { describe, test } from 'vitest';

import { Factory } from '../src/factory';
import { Flow } from '../src/flow';
import { Renderer, ContextBuilder } from '../src/renderer';
import { Barline, BarlineType } from '../src/stavebarline';
import { createAssert, expectMatchingScreenshot, FONT_STACKS, generateTestID, TestOptions } from './vitest_test_helpers';

describe('Barline', () => {
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
          const elementId = generateTestID('barline_test');
          const tagName = backend === Renderer.Backends.SVG ? 'div' : 'canvas';
          const element = document.createElement(tagName);
          element.id = elementId;
          document.body.appendChild(element);

          const options: TestOptions = { elementId, params: {}, backend, testName, fontStackName };
          const originalFontNames = Flow.getMusicFont();
          Flow.setMusicFont(...FONT_STACKS[fontStackName]);

          try {
            const contextBuilder: ContextBuilder =
              backend === Renderer.Backends.SVG ? Renderer.getSVGContext : Renderer.getCanvasContext;
            await testFunc(options, contextBuilder);
          } finally {
            Flow.setMusicFont(...originalFontNames);
          }
        });
      });
    });
  }

  test('Enums', () => {
    const assert = createAssert();

    // VexFlow 4.0 renamed Barline.type => BarlineType.
    // The old way still works, for backwards compatibility.
    assert.equal(Barline.type, BarlineType);

    const a = BarlineType['DOUBLE'];
    const b = BarlineType.DOUBLE;
    assert.equal(a, b);
  });

  runTest('Simple BarNotes', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();



    const f = new Factory({ renderer: { elementId: options.elementId, backend: options.backend, width: 380, height: 160 } });
    const stave = f.Stave();

    const notes = [
      f.StaveNote({ keys: ['d/4', 'e/4', 'f/4'], stem_direction: -1, duration: '2' }),
      f.BarNote({ type: 'single' }),
      f
        .StaveNote({ keys: ['c/4', 'f/4', 'a/4'], stem_direction: -1, duration: '2' })
        .addModifier(f.Accidental({ type: 'n' }), 0)
        .addModifier(f.Accidental({ type: '#' }), 1),
    ];

    const voice = f.Voice().addTickables(notes);
    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);
    f.draw();

    await expectMatchingScreenshot(options, 'barline_tests.test.ts');

    if (options.backend === Renderer.Backends.SVG) {
      notes.forEach((note) => {
        assert.notEqual(note.getSVGElement(), undefined);
      });
    }

    assert.ok(true, 'Simple Test');
  });

  runTest('Style BarNotes', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();



    const f = new Factory({ renderer: { elementId: options.elementId, backend: options.backend, width: 380, height: 160 } });
    const stave = f.Stave();

    const notes = [
      f.StaveNote({ keys: ['d/4', 'e/4', 'f/4'], stem_direction: -1, duration: '2' }),
      f.BarNote({ type: 'single' }),
      f
        .StaveNote({ keys: ['c/4', 'f/4', 'a/4'], stem_direction: -1, duration: '2' })
        .addModifier(f.Accidental({ type: 'n' }), 0)
        .addModifier(f.Accidental({ type: '#' }), 1),
    ];
    notes[1].setStyle({ shadowBlur: 15, shadowColor: 'blue', fillStyle: 'blue', strokeStyle: 'blue' });

    const voice = f.Voice().addTickables(notes);
    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);
    f.draw();

    await expectMatchingScreenshot(options, 'barline_tests.test.ts');

    assert.ok(true, 'Style');
  });
});
