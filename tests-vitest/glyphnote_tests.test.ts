// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// GlyphNote Tests - Vitest Version

import { describe, test } from 'vitest';

import { ChordSymbol } from '../src/chordsymbol';
import { Flow } from '../src/flow';
import { Glyph } from '../src/glyph';
import { Note } from '../src/note';
import { Registry } from '../src/registry';
import { ContextBuilder, Renderer } from '../src/renderer';
import { StaveConnector } from '../src/staveconnector';
import { Voice } from '../src/voice';
import { createAssert, FONT_STACKS, generateTestID, makeFactory, TestOptions } from './vitest_test_helpers';

describe('GlyphNote', () => {
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
          const elementId = generateTestID('glyphnote_test');

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

  runTest('GlyphNote with ChordSymbols', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    Registry.enableDefaultRegistry(new Registry());

    const f = makeFactory(options.backend, options.elementId, 300, 200);
    const system = f.System({
      x: 50,
      width: 250,
      debugFormatter: false,
      noPadding: false,
      details: { alpha: undefined },
    });

    const score = f.EasyScore();

    const notes = [
      f.GlyphNote(new Glyph('repeatBarSlash', 40), { duration: 'q' }),
      f.GlyphNote(new Glyph('repeatBarSlash', 40), { duration: 'q' }),
      f.GlyphNote(new Glyph('repeatBarSlash', 40), { duration: 'q' }),
      f.GlyphNote(new Glyph('repeatBarSlash', 40), { duration: 'q' }),
    ];
    const chord1 = f
      .ChordSymbol({ reportWidth: false })
      .addText('F7')
      .setHorizontal('left')
      .addGlyphOrText('(#11b9)', { symbolModifier: ChordSymbol.symbolModifiers.SUPERSCRIPT });
    const chord2 = f
      .ChordSymbol()
      .addText('F7')
      .setHorizontal('left')
      .addGlyphOrText('#11', { symbolModifier: ChordSymbol.symbolModifiers.SUPERSCRIPT })
      .addGlyphOrText('b9', { symbolModifier: ChordSymbol.symbolModifiers.SUBSCRIPT });

    notes[0].addModifier(chord1, 0);
    notes[2].addModifier(chord2, 0);
    const voice = score.voice(notes);
    system.addStave({ voices: [voice], debugNoteMetrics: false });
    system.addConnector().setType(StaveConnector.type.BRACKET);
    f.draw();
    Registry.disableDefaultRegistry();
    assert.ok(true);
  });

  runTest('GlyphNote Positioning', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    Registry.enableDefaultRegistry(new Registry());

    const f = makeFactory(options.backend, options.elementId, 300, 400);
    const system = f.System({
      x: 50,
      width: 250,
      debugFormatter: false,
      noPadding: false,
      details: { alpha: undefined },
    });

    const score = f.EasyScore();

    const newVoice = (notes: Note[]) => score.voice(notes, { time: '1/4' });

    const newStave = (voice: Voice) => system.addStave({ voices: [voice], debugNoteMetrics: false });

    const voices: Note[][] = [
      [f.GlyphNote(new Glyph('repeat1Bar', 40), { duration: 'q' }, { line: 4 })],
      [f.GlyphNote(new Glyph('repeat2Bars', 40), { duration: 'q', align_center: true })],
      [
        f.GlyphNote(new Glyph('repeatBarSlash', 40), { duration: '16' }),
        f.GlyphNote(new Glyph('repeatBarSlash', 40), { duration: '16' }),
        f.GlyphNote(new Glyph('repeat4Bars', 40), { duration: '16' }),
        f.GlyphNote(new Glyph('repeatBarSlash', 40), { duration: '16' }),
      ],
    ];

    voices.map(newVoice).forEach(newStave);
    system.addConnector().setType(StaveConnector.type.BRACKET);

    f.draw();

    Registry.disableDefaultRegistry();
    assert.ok(true);
  });

  runTest('GlyphNote No Stave Padding', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    Registry.enableDefaultRegistry(new Registry());

    const f = makeFactory(options.backend, options.elementId, 300, 400);
    const system = f.System({
      x: 50,
      width: 250,
      debugFormatter: true,
      noPadding: true,
      details: { alpha: undefined },
    });

    const score = f.EasyScore();

    const newVoice = (notes: Note[]) => score.voice(notes, { time: '1/4' });

    const newStave = (voice: Voice) => system.addStave({ voices: [voice], debugNoteMetrics: true });

    const voices: Note[][] = [
      [f.GlyphNote(new Glyph('repeat1Bar', 40), { duration: 'q' }, { line: 4 })],
      [f.GlyphNote(new Glyph('repeat2Bars', 40), { duration: 'q', align_center: true })],
      [
        f.GlyphNote(new Glyph('repeatBarSlash', 40), { duration: '16' }),
        f.GlyphNote(new Glyph('repeatBarSlash', 40), { duration: '16' }),
        f.GlyphNote(new Glyph('repeat4Bars', 40), { duration: '16' }),
        f.GlyphNote(new Glyph('repeatBarSlash', 40), { duration: '16' }),
      ],
    ];

    voices.map(newVoice).forEach(newStave);
    system.addConnector().setType(StaveConnector.type.BRACKET);

    f.draw();

    Registry.disableDefaultRegistry();
    assert.ok(true);
  });

  runTest('GlyphNote RepeatNote', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    Registry.enableDefaultRegistry(new Registry());

    const f = makeFactory(options.backend, options.elementId, 300, 500);
    const system = f.System({
      x: 50,
      width: 250,
      debugFormatter: false,
      noPadding: true,
      details: { alpha: undefined },
    });

    const score = f.EasyScore();

    const createVoice = (notes: Note[]) => score.voice(notes, { time: '1/4' });
    const addStaveWithVoice = (voice: Voice) => system.addStave({ voices: [voice], debugNoteMetrics: false });

    const voices: Note[][] = [
      [f.RepeatNote('1')],
      [f.RepeatNote('2')],
      [f.RepeatNote('4')],
      [
        f.RepeatNote('slash', { duration: '16' }),
        f.RepeatNote('slash', { duration: '16' }),
        f.RepeatNote('slash', { duration: '16' }),
        f.RepeatNote('slash', { duration: '16' }),
      ],
    ];

    voices.map(createVoice).forEach(addStaveWithVoice);
    system.addConnector().setType(StaveConnector.type.BRACKET);

    f.draw();

    Registry.disableDefaultRegistry();
    assert.ok(true);
  });
});
