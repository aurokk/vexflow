// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// TabTie Tests - Vitest Version

import { describe, test } from 'vitest';

import { Annotation } from '../src/annotation';
import { Flow } from '../src/flow';
import { Formatter } from '../src/formatter';
import { Note } from '../src/note';
import { RenderContext } from '../src/rendercontext';
import { ContextBuilder, Renderer } from '../src/renderer';
import { Stave } from '../src/stave';
import { TieNotes } from '../src/stavetie';
import { TabNote, TabNoteStruct } from '../src/tabnote';
import { TabStave } from '../src/tabstave';
import { TabTie } from '../src/tabtie';
import { Voice } from '../src/voice';
import { createAssert, expectMatchingScreenshot, FONT_STACKS, generateTestID, TestOptions } from './vitest_test_helpers';

/**
 * Helper function to create TabNote objects.
 */
const tabNote = (noteStruct: TabNoteStruct) => new TabNote(noteStruct);

/**
 * Helper function to create the TabTie between two Note objects.
 */
function tieNotes(notes: Note[], indices: number[], stave: Stave, ctx: RenderContext, text?: string): void {
  const voice = new Voice(Flow.TIME4_4);
  voice.addTickables(notes);

  new Formatter().joinVoices([voice]).format([voice], 100);
  voice.draw(ctx, stave);

  const tie = new TabTie(
    {
      first_note: notes[0],
      last_note: notes[1],
      first_indices: indices,
      last_indices: indices,
    },
    text ?? 'Annotation'
  );

  tie.setContext(ctx);
  tie.draw();
}

describe('TabTie', () => {
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
          const elementId = generateTestID('tabtie_test');

          // Create the DOM element before the test runs
          const tagName = backend === Renderer.Backends.SVG ? 'div' : 'canvas';
          const element = document.createElement(tagName);
          element.id = elementId;
          document.body.appendChild(element);

          const assert = createAssert();
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

  /**
   * Two notes on string 4 with a tie drawn between them.
   */
  runTest('Simple TabTie', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const context = contextBuilder(options.elementId, 350, 160);
    context.setFont('Arial', 10);
    const stave = new TabStave(10, 10, 350).addTabGlyph().setContext(context).draw();

    const note1 = tabNote({ positions: [{ str: 4, fret: 4 }], duration: 'h' });
    const note2 = tabNote({ positions: [{ str: 4, fret: 6 }], duration: 'h' });
    tieNotes([note1, note2], [0], stave, context);

    await expectMatchingScreenshot(options, 'tabtie_tests.test.ts');
    assert.ok(true, 'Simple Test');
  });

  /**
   * Helper function for the two test cases below (simpleHammerOn and simplePullOff).
   */
  function multiTest(testName: string, createTabTie: (notes: TieNotes) => TabTie): void {
    runTest(testName, async (options: TestOptions, contextBuilder: ContextBuilder) => {
      const assert = createAssert();
      const context = contextBuilder(options.elementId, 440, 140);
      context.setFont('Arial', 10);
      const stave = new TabStave(10, 10, 440).addTabGlyph().setContext(context).draw();

      const notes = [
        tabNote({ positions: [{ str: 4, fret: 4 }], duration: '8' }),
        tabNote({ positions: [{ str: 4, fret: 4 }], duration: '8' }),
        tabNote({
          positions: [
            { str: 4, fret: 4 },
            { str: 5, fret: 4 },
          ],
          duration: '8',
        }),
        tabNote({
          positions: [
            { str: 4, fret: 6 },
            { str: 5, fret: 6 },
          ],
          duration: '8',
        }),
        tabNote({ positions: [{ str: 2, fret: 14 }], duration: '8' }),
        tabNote({ positions: [{ str: 2, fret: 16 }], duration: '8' }),
        tabNote({
          positions: [
            { str: 2, fret: 14 },
            { str: 3, fret: 14 },
          ],
          duration: '8',
        }),
        tabNote({
          positions: [
            { str: 2, fret: 16 },
            { str: 3, fret: 16 },
          ],
          duration: '8',
        }),
      ];

      const voice = new Voice(Flow.TIME4_4).addTickables(notes);
      new Formatter().joinVoices([voice]).format([voice], 300);
      voice.draw(context, stave);

      createTabTie({
        first_note: notes[0],
        last_note: notes[1],
        first_indices: [0],
        last_indices: [0],
      })
        .setContext(context)
        .draw();

      assert.ok(true, 'Single note');

      createTabTie({
        first_note: notes[2],
        last_note: notes[3],
        first_indices: [0, 1],
        last_indices: [0, 1],
      })
        .setContext(context)
        .draw();

      assert.ok(true, 'Chord');

      createTabTie({
        first_note: notes[4],
        last_note: notes[5],
        first_indices: [0],
        last_indices: [0],
      })
        .setContext(context)
        .draw();

      assert.ok(true, 'Single note high-fret');

      createTabTie({
        first_note: notes[6],
        last_note: notes[7],
        first_indices: [0, 1],
        last_indices: [0, 1],
      })
        .setContext(context)
        .draw();

      await expectMatchingScreenshot(options, 'tabtie_tests.test.ts');
      assert.ok(true, 'Chord high-fret');
    });
  }

  multiTest('Hammerons', TabTie.createHammeron);
  multiTest('Pulloffs', TabTie.createPulloff);

  runTest('Tapping', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const context = contextBuilder(options.elementId, 350, 160);
    context.setFont('Arial', 10);
    const stave = new TabStave(10, 10, 350).addTabGlyph().setContext(context).draw();

    const note1 = tabNote({ positions: [{ str: 4, fret: 12 }], duration: 'h' }).addModifier(new Annotation('T'), 0);
    const note2 = tabNote({ positions: [{ str: 4, fret: 10 }], duration: 'h' });
    tieNotes([note1, note2], [0], stave, context, 'P');

    await expectMatchingScreenshot(options, 'tabtie_tests.test.ts');
    assert.ok(true, 'Tapping Test');
  });

  runTest('Continuous', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const context = contextBuilder(options.elementId, 440, 140);
    context.setFont('Arial', 10);
    const stave = new TabStave(10, 10, 440).addTabGlyph().setContext(context).draw();

    const notes = [
      tabNote({ positions: [{ str: 4, fret: 4 }], duration: 'q' }),
      tabNote({ positions: [{ str: 4, fret: 5 }], duration: 'q' }),
      tabNote({ positions: [{ str: 4, fret: 6 }], duration: 'h' }),
    ];

    const voice = new Voice(Flow.TIME4_4).addTickables(notes);
    new Formatter().joinVoices([voice]).format([voice], 300);
    voice.draw(context, stave);

    TabTie.createHammeron({
      first_note: notes[0],
      last_note: notes[1],
      first_indices: [0],
      last_indices: [0],
    })
      .setContext(context)
      .draw();

    TabTie.createPulloff({
      first_note: notes[1],
      last_note: notes[2],
      first_indices: [0],
      last_indices: [0],
    })
      .setContext(context)
      .draw();

    await expectMatchingScreenshot(options, 'tabtie_tests.test.ts');
    assert.ok(true, 'Continuous Hammeron');
  });
});
