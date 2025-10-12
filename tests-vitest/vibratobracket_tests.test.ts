// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
// Author: Balazs Forian-Szabo
//
// VibratoBracket Tests - Vitest Version

import { afterAll, beforeAll, describe, test } from 'vitest';

import { Factory } from '../src/factory';
import { Flow } from '../src/flow';
import { Note } from '../src/note';
import { Tickable } from '../src/tickable';
import { createAssert, FONT_STACKS, makeFactory } from './vitest_test_helpers';

function createTestElement() {
  const elementId = 'test_' + Date.now() + '_' + Math.random();
  const element = document.createElement('canvas');
  element.id = elementId;
  document.body.appendChild(element);
  return elementId;
}

// Helper function to set up the stave, easyscore, voice, and to format & draw.
function createTest(noteGroup: string, setupVibratoBracket: (f: Factory, notes: Tickable[]) => void) {
  return () => {
    const assert = createAssert();
    const factory = makeFactory(1, createTestElement(), 650, 200);
    const stave = factory.Stave();
    const score = factory.EasyScore();
    const voice = score.voice(score.notes(noteGroup));

    setupVibratoBracket(factory, voice.getTickables());

    factory.Formatter().joinVoices([voice]).formatToStave([voice], stave);
    factory.draw();

    assert.ok(true);
  };
}

describe('VibratoBracket', () => {
  let originalFontNames: string[];

  beforeAll(async () => {
    originalFontNames = Flow.getMusicFont();
    Flow.setMusicFont(...FONT_STACKS['Bravura']);
  });

  afterAll(() => {
    Flow.setMusicFont(...originalFontNames);
  });

  test(
    'Simple VibratoBracket',
    createTest('c4/4, c4, c4, c4', (factory, notes) => {
      factory.VibratoBracket({
        from: notes[0] as Note,
        to: notes[3] as Note,
        options: { line: 2 },
      });
    })
  );

  test(
    'Harsh VibratoBracket Without End Note',
    createTest('c4/4, c4, c4, c4', (factory, notes) => {
      factory.VibratoBracket({
        from: notes[2] as Note,
        to: null,
        options: { line: 2, harsh: true },
      });
    })
  );

  test(
    'Harsh VibratoBracket Without Start Note',
    createTest('c4/4, c4, c4, c4', (factory, notes) => {
      factory.VibratoBracket({
        from: null,
        to: notes[2] as Note,
        options: { line: 2, harsh: true },
      });
    })
  );
});
