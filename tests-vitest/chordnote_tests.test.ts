// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// ChordNote Tests - Vitest Version

import { describe, test } from 'vitest';

import { ChordNote } from '../src/chordnote';
import { Flow } from '../src/flow';
import { ContextBuilder, Renderer } from '../src/renderer';
import {
  createAssert,
  expectMatchingScreenshot,
  FONT_STACKS,
  generateTestID,
  makeFactory,
  TestOptions,
} from './vitest_test_helpers';

describe('ChordNote', () => {
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
          const elementId = generateTestID('chordnote_test');

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

  runTest('ChordNote - Basic Rendering', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const f = makeFactory(options.backend, options.elementId, 600, 200, options);
    const stave = f.ChordStave({ x: 10, y: 40, width: 500 });

    // Create a chord note with chord symbols
    const chordNote = new ChordNote({ duration: 'q' }, { line: 0 }).addText('C').addTextSuperscript('maj7');

    chordNote.setStave(stave);
    chordNote.setContext(f.getContext());

    const voice = f.Voice().setStrict(false).addTickables([chordNote]);

    f.Formatter().joinVoices([voice]).format([voice], 500);
    f.draw();

    await expectMatchingScreenshot(options, 'chordnote_tests.test.ts');

    createAssert().ok(true, 'ChordNote renders successfully');
  });

  runTest('ChordNote - Multiple Chords', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const f = makeFactory(options.backend, options.elementId, 600, 200, options);
    const stave = f.ChordStave({ x: 10, y: 40, width: 500 });

    const chordNote1 = new ChordNote({ duration: 'q' }, { line: 0 }).addText('C').addTextSuperscript('maj7');

    const chordNote2 = new ChordNote({ duration: 'q' }, { line: 0 })
      .addText('D')
      .addGlyph('minor')
      .addTextSuperscript('7');

    const chordNote3 = new ChordNote({ duration: 'h' }, { line: 0 }).addText('G').addTextSuperscript('7');

    chordNote1.setStave(stave);
    chordNote2.setStave(stave);
    chordNote3.setStave(stave);

    const voice = f.Voice().setStrict(false).addTickables([chordNote1, chordNote2, chordNote3]);

    f.Formatter().joinVoices([voice]).format([voice], 500);
    f.draw();

    await expectMatchingScreenshot(options, 'chordnote_tests.test.ts');

    createAssert().ok(true, 'Multiple ChordNotes render successfully');
  });

  runTest('ChordNote - Different Positions', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const f = makeFactory(options.backend, options.elementId, 600, 300, options);
    const stave = f.ChordStave({ x: 10, y: 40, width: 500 });

    const chordNote1 = new ChordNote({ duration: 'q' }, { line: 0 }).addText('C').addTextSuperscript('maj7');

    const chordNote2 = new ChordNote({ duration: 'q' }, { line: 2.5 })
      .addText('F')
      .addGlyph('#')
      .addTextSuperscript('7');

    const chordNote3 = new ChordNote({ duration: 'q' }, { line: 4 }).addText('B').addGlyph('b').addGlyph('minor');

    chordNote1.setStave(stave);
    chordNote2.setStave(stave);
    chordNote3.setStave(stave);

    const voice = f.Voice().setStrict(false).addTickables([chordNote1, chordNote2, chordNote3]);

    f.Formatter().joinVoices([voice]).format([voice], 500);
    f.draw();

    await expectMatchingScreenshot(options, 'chordnote_tests.test.ts');

    createAssert().ok(true, 'ChordNotes at different positions render successfully');
  });

  runTest('ChordNote - Complex Chords', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const f = makeFactory(options.backend, options.elementId, 800, 200, options);
    const stave = f.ChordStave({ x: 10, y: 40, width: 750 });

    // Test various complex chord notations
    const chordNote1 = new ChordNote({ duration: 'q' }, { line: 0 })
      .addText('C')
      .addGlyph('minor')
      .addTextSuperscript('7')
      .addGlyph('b')
      .addTextSuperscript('5');

    const chordNote2 = new ChordNote({ duration: 'q' }, { line: 0 }).addText('F').addGlyph('#').addGlyph('dim');

    const chordNote3 = new ChordNote({ duration: 'q' }, { line: 0 })
      .addText('A')
      .addGlyph('b')
      .addGlyph('majorSeventh');

    const chordNote4 = new ChordNote({ duration: 'q' }, { line: 0 }).addGlyphOrText('(#9)');

    chordNote1.setStave(stave);
    chordNote2.setStave(stave);
    chordNote3.setStave(stave);
    chordNote4.setStave(stave);

    const voice = f.Voice().setStrict(false).addTickables([chordNote1, chordNote2, chordNote3, chordNote4]);

    f.Formatter().joinVoices([voice]).format([voice], 500);
    f.draw();

    await expectMatchingScreenshot(options, 'chordnote_tests.test.ts');

    createAssert().ok(true, 'Complex ChordNotes render successfully');
  });

  runTest('ChordNote - Over Bar Notation', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const f = makeFactory(options.backend, options.elementId, 600, 200, options);
    const stave = f.ChordStave({ x: 10, y: 40, width: 500 });

    // Test over bar notation (C/G means C chord over G bass)
    const chordNote1 = new ChordNote({ duration: 'q' }, { line: 0 }).addText('C').addGlyph('/').addText('G');

    const chordNote2 = new ChordNote({ duration: 'q' }, { line: 0 })
      .addText('D')
      .addGlyph('minor')
      .addGlyph('/')
      .addText('F');

    const chordNote3 = new ChordNote({ duration: 'h' }, { line: 0 })
      .addText('F')
      .addGlyph('#')
      .addTextSuperscript('7')
      .addGlyph('/')
      .addText('A')
      .addGlyph('#');

    chordNote1.setStave(stave);
    chordNote2.setStave(stave);
    chordNote3.setStave(stave);

    const voice = f.Voice().setStrict(false).addTickables([chordNote1, chordNote2, chordNote3]);

    f.Formatter().joinVoices([voice]).format([voice], 500);
    f.draw();

    await expectMatchingScreenshot(options, 'chordnote_tests.test.ts');

    createAssert().ok(true, 'Over bar notation ChordNotes render successfully');
  });
});
