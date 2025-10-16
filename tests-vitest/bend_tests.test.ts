// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Bend Tests - Vitest Version

import { describe, test } from 'vitest';

import { Bend, BendPhrase } from '../src/bend';
import { Flow } from '../src/flow';
import { Font } from '../src/font';
import { Formatter } from '../src/formatter';
import { ModifierContext } from '../src/modifiercontext';
import { Note } from '../src/note';
import { Renderer } from '../src/renderer';
import { TabNote, TabNoteStruct } from '../src/tabnote';
import { TabStave } from '../src/tabstave';
import { TickContext } from '../src/tickcontext';
import { ContextBuilder, createAssert, expectMatchingScreenshot, FONT_STACKS, generateTestID, TestOptions } from './vitest_test_helpers';

// Helper functions for creating TabNote and Bend objects.
const note = (noteStruct: TabNoteStruct) => new TabNote(noteStruct);
const bendWithText = (text: string, release = false) => new Bend(text, release);
const bendWithPhrase = (phrase: BendPhrase[]) => new Bend('', false, phrase);

describe('Bend', () => {
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
          const elementId = generateTestID('test');
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
  runTest('Double Bends', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();

    const renderer = new Renderer(options.elementId, options.backend);
    renderer.resize(500, 240);
    const ctx = renderer.getContext();
    ctx.scale(1.5, 1.5);

    ctx.setFont('Arial', 10);
    const stave = new TabStave(10, 10, 450).addTabGlyph().setContext(ctx).draw();

    const notes = [
      note({
        positions: [
          { str: 2, fret: 10 },
          { str: 4, fret: 9 },
        ],
        duration: 'q',
      })
        .addModifier(bendWithText('Full'), 0)
        .addModifier(bendWithText('1/2'), 1),

      note({
        positions: [
          { str: 2, fret: 5 },
          { str: 3, fret: 5 },
        ],
        duration: 'q',
      })
        .addModifier(bendWithText('1/4'), 0)
        .addModifier(bendWithText('1/4'), 1),

      // This note is not visible because it is pushed off to the right by the ctx.scale(1.5, 1.5) at the top.
      note({
        positions: [{ str: 4, fret: 7 }],
        duration: 'h',
      }),
    ];

    Formatter.FormatAndDraw(ctx, stave, notes);
    notes.forEach((note) => Note.plotMetrics(ctx, note, 140));

    await expectMatchingScreenshot(options, 'bend_tests.test.ts');

    assert.ok(true, 'Double Bends');
  });

  runTest('Reverse Bends', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();

    const renderer = new Renderer(options.elementId, options.backend);
    renderer.resize(500, 240);
    const ctx = renderer.getContext();

    ctx.scale(1.5, 1.5);

    ctx.setFont('Arial', 10);

    const stave = new TabStave(10, 10, 450).addTabGlyph().setContext(ctx).draw();

    const notes = [
      note({
        positions: [
          { str: 2, fret: 10 },
          { str: 4, fret: 9 },
        ],
        duration: 'w',
      })
        .addModifier(bendWithText('Full'), 1)
        .addModifier(bendWithText('1/2'), 0),

      note({
        positions: [
          { str: 2, fret: 5 },
          { str: 3, fret: 5 },
        ],
        duration: 'w',
      })
        .addModifier(bendWithText('1/4'), 1)
        .addModifier(bendWithText('1/4'), 0),

      note({
        positions: [{ str: 4, fret: 7 }],
        duration: 'w',
      }),
    ];

    for (let i = 0; i < notes.length; ++i) {
      const note = notes[i];
      const mc = new ModifierContext();
      note.addToModifierContext(mc);

      const tickContext = new TickContext();
      tickContext
        .addTickable(note)
        .preFormat()
        .setX(75 * i);

      note.setStave(stave).setContext(ctx).draw();
      Note.plotMetrics(ctx, note, 140);
      assert.ok(true, 'Bend ' + i);
    }

    await expectMatchingScreenshot(options, 'bend_tests.test.ts');
  });

  runTest('Bend Phrase', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();

    const renderer = new Renderer(options.elementId, options.backend);
    renderer.resize(500, 240);
    const ctx = renderer.getContext();
    ctx.scale(1.5, 1.5);

    ctx.setFont(Font.SANS_SERIF, Font.SIZE);
    const stave = new TabStave(10, 10, 450).addTabGlyph().setContext(ctx).draw();

    const phrase1 = [
      { type: Bend.UP, text: 'Full' },
      { type: Bend.DOWN, text: 'Monstrous' },
      { type: Bend.UP, text: '1/2' },
      { type: Bend.DOWN, text: '' },
    ];
    const bend1 = bendWithPhrase(phrase1).setContext(ctx);

    const notes = [
      note({
        positions: [{ str: 2, fret: 10 }],
        duration: 'w',
      }).addModifier(bend1, 0),
    ];

    for (let i = 0; i < notes.length; ++i) {
      const note = notes[i];
      note.addToModifierContext(new ModifierContext());

      const tickContext = new TickContext();
      tickContext
        .addTickable(note)
        .preFormat()
        .setX(75 * i);

      note.setStave(stave).setContext(ctx).draw();
      Note.plotMetrics(ctx, note, 140);
      assert.ok(true, 'Bend ' + i);
    }

    await expectMatchingScreenshot(options, 'bend_tests.test.ts');
  });

  runTest('Double Bends With Release', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();

    const renderer = new Renderer(options.elementId, options.backend);
    renderer.resize(550, 240);
    const ctx = renderer.getContext();
    ctx.scale(1.0, 1.0);
    ctx.setBackgroundFillStyle('#FFF');
    ctx.setFont('Arial', 10);
    const stave = new TabStave(10, 10, 550).addTabGlyph().setContext(ctx).draw();

    const notes = [
      note({
        positions: [
          { str: 1, fret: 10 },
          { str: 4, fret: 9 },
        ],
        duration: 'q',
      })
        .addModifier(bendWithText('1/2', true), 0)
        .addModifier(bendWithText('Full', true), 1),

      note({
        positions: [
          { str: 2, fret: 5 },
          { str: 3, fret: 5 },
          { str: 4, fret: 5 },
        ],
        duration: 'q',
      })
        .addModifier(bendWithText('1/4', true), 0)
        .addModifier(bendWithText('Monstrous', true), 1)
        .addModifier(bendWithText('1/4', true), 2),

      note({
        positions: [{ str: 4, fret: 7 }],
        duration: 'q',
      }),
      note({
        positions: [{ str: 4, fret: 7 }],
        duration: 'q',
      }),
    ];

    Formatter.FormatAndDraw(ctx, stave, notes);
    notes.forEach((note) => Note.plotMetrics(ctx, note, 140));

    await expectMatchingScreenshot(options, 'bend_tests.test.ts');

    assert.ok(true, 'Bend Release');
  });

  runTest('Whako Bend', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();

    const renderer = new Renderer(options.elementId, options.backend);
    renderer.resize(400, 240);
    const ctx = renderer.getContext();
    ctx.scale(1.0, 1.0);
    ctx.setBackgroundFillStyle('#FFF');
    ctx.setFont('Arial', 10);
    const stave = new TabStave(10, 10, 350).addTabGlyph().setContext(ctx).draw();

    const phrase1 = [
      { type: Bend.UP, text: 'Full' },
      { type: Bend.DOWN, text: '' },
      { type: Bend.UP, text: '1/2' },
      { type: Bend.DOWN, text: '' },
    ];

    const phrase2 = [
      { type: Bend.UP, text: 'Full' },
      { type: Bend.UP, text: 'Full' },
      { type: Bend.UP, text: '1/2' },
      { type: Bend.DOWN, text: '' },
      { type: Bend.DOWN, text: 'Full' },
      { type: Bend.DOWN, text: 'Full' },
      { type: Bend.UP, text: '1/2' },
      { type: Bend.DOWN, text: '' },
    ];

    const notes = [
      note({
        positions: [
          { str: 2, fret: 10 },
          { str: 3, fret: 9 },
        ],
        duration: 'q',
      })
        .addModifier(bendWithPhrase(phrase1), 0)
        .addModifier(bendWithPhrase(phrase2), 1),
    ];

    Formatter.FormatAndDraw(ctx, stave, notes);
    Note.plotMetrics(ctx, notes[0], 140);

    await expectMatchingScreenshot(options, 'bend_tests.test.ts');

    assert.ok(true, 'Whacko Bend & Release');
  });
});
