// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Barline Tests - Vitest Version

import { afterAll, beforeAll, describe, test } from 'vitest';

import { Factory } from '../src/factory';
import { Flow } from '../src/flow';
import { Renderer } from '../src/renderer';
import { Barline, BarlineType } from '../src/stavebarline';
import { ContextBuilder, createAssert, FONT_STACKS, TestOptions } from './vitest_test_helpers';

describe('Barline', () => {
  let originalFontNames: string[];

  beforeAll(async () => {
    originalFontNames = Flow.getMusicFont();
    Flow.setMusicFont(...FONT_STACKS['Bravura']);
  });

  afterAll(() => {
    Flow.setMusicFont(...originalFontNames);
  });

  test('Enums', () => {
    const assert = createAssert();

    // VexFlow 4.0 renamed Barline.type => BarlineType.
    // The old way still works, for backwards compatibility.
    assert.equal(Barline.type, BarlineType);

    const a = BarlineType['DOUBLE'];
    const b = BarlineType.DOUBLE;
    assert.equal(a, b);
  });

  function runTest(
    name: string,
    testFn: (options: TestOptions, contextBuilder: ContextBuilder) => void,
    width = 450,
    height = 140
  ) {
    test(name, async () => {
      await testFn({ elementId: '', params: {}, backend: Renderer.Backends.CANVAS }, {} as ContextBuilder);
    });
  }

  runTest('Simple BarNotes', (options: TestOptions) => {
    const assert = createAssert();
    const elementId = 'test_' + Date.now() + '_' + Math.random();
    const element = document.createElement('canvas');
    element.id = elementId;
    document.body.appendChild(element);

    const f = new Factory({ renderer: { elementId, backend: options.backend, width: 380, height: 160 } });
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

    if (options.backend === Renderer.Backends.SVG) {
      notes.forEach((note) => {
        assert.notEqual(note.getSVGElement(), undefined);
      });
    }

    assert.ok(true, 'Simple Test');
  });

  runTest('Style BarNotes', (options: TestOptions) => {
    const assert = createAssert();
    const elementId = 'test_' + Date.now() + '_' + Math.random();
    const element = document.createElement('canvas');
    element.id = elementId;
    document.body.appendChild(element);

    const f = new Factory({ renderer: { elementId, backend: options.backend, width: 380, height: 160 } });
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

    assert.ok(true, 'Style');
  });
});
