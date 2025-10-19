// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Style Tests - Vitest Version

import { describe, test } from 'vitest';

import { Annotation } from '../src/annotation';
import { Articulation } from '../src/articulation';
import { Bend } from '../src/bend';
import { ElementStyle } from '../src/element';
import { Flow } from '../src/flow';
import { Formatter } from '../src/formatter';
import { KeySignature } from '../src/keysignature';
import { NoteSubGroup } from '../src/notesubgroup';
import { Ornament } from '../src/ornament';
import { ContextBuilder, Renderer } from '../src/renderer';
import { StaveModifierPosition } from '../src/stavemodifier';
import { StaveNote } from '../src/stavenote';
import { Stroke } from '../src/strokes';
import { TabNote, TabNoteStruct } from '../src/tabnote';
import { TabStave } from '../src/tabstave';
import { TimeSignature } from '../src/timesignature';
import {
  createAssert,
  expectMatchingScreenshot,
  FONT_STACKS,
  generateTestID,
  makeFactory,
  TestOptions,
} from './vitest_test_helpers';

/**
 * Helper function to create a ElementStyle options object of the form { fillStyle: XXX, strokeStyle: YYY }.
 * Used for updating the fillStyle and optionally the strokeStyle.
 */
function FS(fillStyle: string, strokeStyle?: string): ElementStyle {
  const ret: ElementStyle = { fillStyle };
  if (strokeStyle) {
    ret.strokeStyle = strokeStyle;
  }
  return ret;
}

describe('Style', () => {
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
          const elementId = generateTestID('style_test');

          // Create the DOM element before the test runs
          const tagName = backend === Renderer.Backends.SVG ? 'div' : 'canvas';
          const element = document.createElement(tagName);
          element.id = elementId;
          document.body.appendChild(element);

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

  runTest('Basic Style', async (options: TestOptions) => {
    const assert = createAssert();
    const f = makeFactory(options.backend, options.elementId, 600, 150, options);
    const stave = f.Stave({ x: 25, y: 20, width: 500 });

    // Stave modifiers test.
    const keySig = new KeySignature('D');
    keySig.addToStave(stave);
    keySig.setStyle(FS('blue'));
    stave.addTimeSignature('4/4');
    const timeSig = stave.getModifiers(StaveModifierPosition.BEGIN, TimeSignature.CATEGORY);
    timeSig[0].setStyle(FS('brown'));

    const notes = [
      f
        .StaveNote({ keys: ['c/4', 'e/4', 'a/4'], stem_direction: 1, duration: '4' })
        .addModifier(f.Accidental({ type: 'b' }), 0)
        .addModifier(f.Accidental({ type: '#' }), 1),
      f
        .StaveNote({ keys: ['c/4', 'e/4', 'a/4'], stem_direction: 1, duration: '4' })
        .addModifier(f.Accidental({ type: 'b' }), 0)
        .addModifier(f.Accidental({ type: '#' }), 1),
      f.StaveNote({ keys: ['e/4'], stem_direction: 1, duration: '4' }),
      f.StaveNote({ keys: ['f/4'], stem_direction: 1, duration: '8' }),

      // voice.draw() test.
      f.TextDynamics({ text: 'sfz', duration: '16' }).setStyle(FS('blue')),

      // GhostNote modifiers test.
      f.GhostNote({ duration: '16' }).addModifier(new Annotation('GhostNote green text').setStyle(FS('green')), 0),
    ];

    const notes0 = notes[0] as StaveNote;
    const notes1 = notes[1] as StaveNote;

    notes0.setKeyStyle(0, FS('red'));
    notes1.setKeyStyle(0, FS('red'));

    // StaveNote modifiers test.
    const mods1 = notes1.getModifiers();
    mods1[0].setStyle(FS('green'));
    notes0.addModifier(new Articulation('a.').setPosition(4).setStyle(FS('green')), 0);
    notes0.addModifier(new Ornament('mordent').setStyle(FS('lightgreen')), 0);

    notes1.addModifier(new Annotation('blue').setStyle(FS('blue')), 0);
    notes1.addModifier(new NoteSubGroup([f.ClefNote({ options: { size: 'small' } }).setStyle(FS('blue'))]), 0);

    const voice = f.Voice().addTickables(notes);

    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

    f.draw();
    await expectMatchingScreenshot(options, 'style_tests.test.ts');
    assert.ok(true, 'Basic Style');
  });

  runTest('TabNote modifiers Style', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const ctx = contextBuilder(options.elementId, 500, 140);
    options.width = 500;
    options.height = 140;

    ctx.font = '10pt Arial';
    const stave = new TabStave(10, 10, 450).addTabGlyph();
    stave.getModifiers()[2].setStyle(FS('blue'));
    stave.setContext(ctx).draw();

    const tabNote = (noteStruct: TabNoteStruct) => new TabNote(noteStruct);

    const notes = [
      tabNote({
        positions: [
          { str: 2, fret: 10 },
          { str: 4, fret: 9 },
        ],
        duration: 'h',
      }).addModifier(new Annotation('green text').setStyle(FS('green')), 0),
      tabNote({
        positions: [
          { str: 2, fret: 10 },
          { str: 4, fret: 9 },
        ],
        duration: 'h',
      })
        .addModifier(new Bend('Full').setStyle(FS('brown')), 0)
        .addStroke(0, new Stroke(1, { all_voices: false }).setStyle(FS('blue'))),
    ];

    Formatter.FormatAndDraw(ctx, stave, notes);
    await expectMatchingScreenshot(options, 'style_tests.test.ts');
    assert.ok(true, 'TabNote Modifiers Style');
  });
});
