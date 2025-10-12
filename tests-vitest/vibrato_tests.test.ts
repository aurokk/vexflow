// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Vibrato Tests - Vitest Version

import { Bend, Flow, Font, Formatter, Renderer, TabNote, TabNoteStruct, TabStave, Vibrato } from '../src/index';

import { afterAll, beforeAll, describe, test } from 'vitest';

import { createAssert, FONT_STACKS } from './vitest_test_helpers';

function createTestElement() {
  const elementId = 'test_' + Date.now() + '_' + Math.random();
  const element = document.createElement('canvas');
  element.id = elementId;
  document.body.appendChild(element);
  return elementId;
}

// Helper function to create TabNote objects.
const tabNote = (noteStruct: TabNoteStruct) => new TabNote(noteStruct);

describe('Vibrato', () => {
  let originalFontNames: string[];

  beforeAll(async () => {
    originalFontNames = Flow.getMusicFont();
    Flow.setMusicFont(...FONT_STACKS['Bravura']);
  });

  afterAll(() => {
    Flow.setMusicFont(...originalFontNames);
  });

  test('Simple Vibrato', () => {
    const assert = createAssert();
    const elementId = createTestElement();
    const ctx = Renderer.getCanvasContext(elementId, 500, 240);
    ctx.scale(1.5, 1.5);

    ctx.font = '10pt Arial';
    const stave = new TabStave(10, 10, 450).addTabGlyph().setContext(ctx).draw();

    const notes = [
      tabNote({
        positions: [
          { str: 2, fret: 10 },
          { str: 4, fret: 9 },
        ],
        duration: 'h',
      }).addModifier(new Vibrato(), 0),
      tabNote({
        positions: [{ str: 2, fret: 10 }],
        duration: 'h',
      }).addModifier(new Vibrato(), 0),
    ];

    Formatter.FormatAndDraw(ctx, stave, notes);
    assert.ok(true, 'Simple Vibrato');
  });

  test('Harsh Vibrato', () => {
    const assert = createAssert();
    const elementId = createTestElement();
    const ctx = Renderer.getCanvasContext(elementId, 500, 240);
    ctx.scale(1.5, 1.5);

    ctx.font = '10pt Arial';
    const stave = new TabStave(10, 10, 450).addTabGlyph().setContext(ctx).draw();

    const notes = [
      tabNote({
        positions: [
          { str: 2, fret: 10 },
          { str: 4, fret: 9 },
        ],
        duration: 'h',
      }).addModifier(new Vibrato().setHarsh(true), 0),
      tabNote({
        positions: [{ str: 2, fret: 10 }],
        duration: 'h',
      }).addModifier(new Vibrato().setHarsh(true), 0),
    ];

    Formatter.FormatAndDraw(ctx, stave, notes);
    assert.ok(true, 'Harsh Vibrato');
  });

  test('Vibrato with Bend', () => {
    const assert = createAssert();
    const elementId = createTestElement();
    const ctx = Renderer.getCanvasContext(elementId, 500, 240);
    ctx.scale(1.3, 1.3);

    ctx.setFont(Font.SANS_SERIF, 10);
    const stave = new TabStave(10, 10, 450).addTabGlyph().setContext(ctx).draw();

    const notes = [
      tabNote({
        positions: [
          { str: 2, fret: 9 },
          { str: 3, fret: 9 },
        ],
        duration: 'q',
      })
        .addModifier(new Bend('1/2', true), 0)
        .addModifier(new Bend('1/2', true), 1)
        .addModifier(new Vibrato(), 0),
      tabNote({
        positions: [{ str: 2, fret: 10 }],
        duration: 'q',
      })
        .addModifier(new Bend('Full', false), 0)
        .addModifier(new Vibrato().setVibratoWidth(60), 0),
      tabNote({
        positions: [{ str: 2, fret: 10 }],
        duration: 'h',
      }).addModifier(new Vibrato().setVibratoWidth(120).setHarsh(true), 0),
    ];

    Formatter.FormatAndDraw(ctx, stave, notes);
    assert.ok(true, 'Vibrato with Bend');
  });
});
