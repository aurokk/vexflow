// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// CrossBeam Tests - Vitest Version

import { afterAll, beforeAll, describe, test } from 'vitest';

import { Flow } from '../src/flow';
import { Stave } from '../src/stave';
import { StaveNote } from '../src/stavenote';
import { createAssert, FONT_STACKS, makeFactory } from './vitest_test_helpers';

/**
 * Helper to create a unique element ID and DOM element for testing
 */
function createTestElement() {
  const elementId = 'test_' + Date.now() + '_' + Math.random();
  const element = document.createElement('canvas');
  element.id = elementId;
  document.body.appendChild(element);
  return elementId;
}

interface crossStaveNotes {
  notestring: string;
  clef: string;
}
interface crossStaveVoice {
  notes: crossStaveNotes[];
  stavemask: number[];
  beammask: number[];
  clef: string;
}
interface crossStaveBeamTest {
  title: string;
  time: string;
  voices: crossStaveVoice[];
}

function crossClef(testdata: crossStaveBeamTest) {
  const assert = createAssert();
  const f = makeFactory(1, createTestElement(), 400 + Stave.defaultPadding, 250);
  f.getContext().scale(0.8, 0.8);
  const score = f.EasyScore();
  const system = f.System({
    details: { softmaxFactor: 100 },
    autoWidth: true,
    debugFormatter: false,
  });

  const voicedata: crossStaveVoice[] = testdata.voices;
  const stavemap: Stave[] = [];
  for (let i = 0; i < voicedata.length; ++i) {
    const clef = voicedata[i].clef;
    stavemap.push(system.addStave({ voices: [] }).addClef(clef).addTimeSignature(testdata.time));
  }
  for (let i = 0; i < voicedata.length; ++i) {
    const stavemask = voicedata[i].stavemask;
    let scoreNotes: StaveNote[] = [];
    const voicenotes = voicedata[i].notes;
    for (let k = 0; k < voicenotes.length; ++k) {
      scoreNotes = scoreNotes.concat(
        score.notes(voicenotes[k].notestring, { clef: voicenotes[k].clef }) as StaveNote[]
      );
    }
    const beammask: number[] = voicedata[i].beammask;
    let curGroup: StaveNote[] = [];
    const beamGroups: StaveNote[][] = [];
    for (let j = 0; j < scoreNotes.length; ++j) {
      const note = scoreNotes[j];
      note.setStave(stavemap[stavemask[j]]);

      if (beammask[j] !== 0) {
        note.setStemDirection(beammask[j]);
        curGroup.push(note);
      } else {
        if (curGroup.length) {
          beamGroups.push(curGroup);
          curGroup = [];
        }
      }
    }
    if (curGroup.length) {
      beamGroups.push(curGroup);
    }
    beamGroups.forEach((bg) => {
      score.beam(bg);
    });
    if (scoreNotes.length > 0) {
      const voice = score.voice(scoreNotes, { time: testdata.time });
      system.addVoices([voice]);
    }
  }
  f.draw();
  assert.ok(true);
}

describe('CrossBeam', () => {
  let originalFontNames: string[];

  beforeAll(async () => {
    originalFontNames = Flow.getMusicFont();
    Flow.setMusicFont(...FONT_STACKS['Bravura']);
  });

  afterAll(() => {
    Flow.setMusicFont(...originalFontNames);
  });

  test('Single clef mixed 1', () => {
    crossClef({
      title: 'Single clef mixed 1',
      time: '3/4',
      voices: [
        {
          notes: [{ notestring: 'g4/16, f4/16, a6/16, g6/16, b4/4/r, g6/8, g4/8 ', clef: 'treble' }],
          stavemask: [0, 0, 0, 0, 0, 0, 0],
          beammask: [1, 1, -1, -1, 0, -1, 1],
          clef: 'treble',
        },
      ],
    });
  });

  test('Single clef mixed 2', () => {
    crossClef({
      title: 'Single clef mixed 2',
      time: '3/4',
      voices: [
        {
          notes: [{ notestring: 'g4/16, f6/16, a4/16, g6/16, b4/4/r, g6/8, g4/8 ', clef: 'treble' }],
          stavemask: [0, 0, 0, 0, 0, 0, 0],
          beammask: [1, -1, 1, -1, 0, -1, 1],
          clef: 'treble',
        },
      ],
    });
  });

  test('Mixed clef voice middle', () => {
    crossClef({
      title: 'Mixed clef voice middle',
      time: '2/4',
      voices: [
        {
          notes: [{ notestring: 'e#5/4, b4/16/r, b4/16, d5/16., c5/32 ', clef: 'treble' }],
          stavemask: [0, 0, 0, 0, 0],
          beammask: [0, 0, 1, 1, 1],
          clef: 'treble',
        },
        {
          notes: [
            { notestring: 'C3/16, B3/16, C4/16', clef: 'bass' },
            { notestring: 'E#4/16', clef: 'treble' },
            { notestring: 'C4/4', clef: 'bass' },
          ],
          stavemask: [1, 1, 1, 0, 1],
          beammask: [1, 1, 1, -1, 0],
          clef: 'bass',
        },
      ],
    });
  });

  test('Vertical alignment - cross stave (beam up1)', () => {
    crossClef({
      title: 'Vertical alignment - cross stave (beam up1)',
      time: '4/4',
      voices: [
        {
          notes: [
            { notestring: 'C#5/q, B4/q, A4/8, E4/8', clef: 'treble' },
            { notestring: 'C4/8, D4/8', clef: 'bass' },
          ],
          beammask: [0, 0, 1, 1, 1, 1],
          stavemask: [0, 0, 0, 0, 1, 1],
          clef: 'treble',
        },
        { notes: [{ notestring: '', clef: 'bass' }], beammask: [], stavemask: [], clef: 'bass' },
      ],
    });
  });

  test('Vertical alignment - cross stave (beam up2)', () => {
    crossClef({
      title: 'Vertical alignment - cross stave (beam up2)',
      time: '4/4',
      voices: [
        {
          notes: [
            { notestring: 'C#5/q, C5/16, B4/q, A4/8, E4/16', clef: 'treble' },
            { notestring: 'C4/8, D4/8', clef: 'bass' },
          ],
          beammask: [0, 0, 0, 1, 1, 1, 1],
          stavemask: [0, 0, 0, 0, 0, 1, 1],
          clef: 'treble',
        },
        { notes: [{ notestring: '', clef: 'bass' }], beammask: [], stavemask: [], clef: 'bass' },
      ],
    });
  });

  test('Vertical alignment - cross stave (beam up3)', () => {
    crossClef({
      title: 'Vertical alignment - cross stave (beam up3)',
      time: '4/4',
      voices: [
        {
          notes: [
            { notestring: 'C#5/q, C5/16, B4/q, A4/8, E4/8', clef: 'treble' },
            { notestring: 'C4/16, D4/8', clef: 'bass' },
          ],
          beammask: [0, 0, 0, 1, 1, 1, 1],
          stavemask: [0, 0, 0, 0, 0, 1, 1],
          clef: 'treble',
        },
        { notes: [{ notestring: '', clef: 'bass' }], beammask: [], stavemask: [], clef: 'bass' },
      ],
    });
  });

  test('Vertical alignment - cross stave (beam up4)', () => {
    crossClef({
      title: 'Vertical alignment - cross stave (beam up4)',
      time: '4/4',
      voices: [
        {
          notes: [
            { notestring: 'C#5/q, C5/8, B4/q, A4/8, E4/16', clef: 'treble' },
            { notestring: 'C4/16, D4/8', clef: 'bass' },
          ],
          beammask: [0, 0, 0, 1, 1, 1, 1],
          stavemask: [0, 0, 0, 0, 0, 1, 1],
          clef: 'treble',
        },
        { notes: [{ notestring: '', clef: 'bass' }], beammask: [], stavemask: [], clef: 'bass' },
      ],
    });
  });

  test('Vertical alignment - cross stave (beam down1)', () => {
    crossClef({
      title: 'Vertical alignment - cross stave (beam down1)',
      time: '4/4',
      voices: [
        {
          notes: [
            { notestring: 'C#5/q, B4/q, A4/8, E4/8', clef: 'treble' },
            { notestring: 'C4/8, D4/8', clef: 'bass' },
          ],
          beammask: [0, 0, -1, -1, -1, -1],
          stavemask: [0, 0, 0, 0, 1, 1],
          clef: 'treble',
        },
        { notes: [{ notestring: '', clef: 'bass' }], beammask: [], stavemask: [], clef: 'bass' },
      ],
    });
  });

  test('Vertical alignment - cross stave (beam down2)', () => {
    crossClef({
      title: 'Vertical alignment - cross stave (beam down2)',
      time: '4/4',
      voices: [
        {
          notes: [
            { notestring: 'C#5/q, C5/16, B4/q, A4/8, E4/16', clef: 'treble' },
            { notestring: 'C4/8, D4/8', clef: 'bass' },
          ],
          beammask: [0, 0, 0, -1, -1, -1, -1],
          stavemask: [0, 0, 0, 0, 0, 1, 1],
          clef: 'treble',
        },
        { notes: [{ notestring: '', clef: 'bass' }], beammask: [], stavemask: [], clef: 'bass' },
      ],
    });
  });

  test('Vertical alignment - cross stave (beam down3)', () => {
    crossClef({
      title: 'Vertical alignment - cross stave (beam down3)',
      time: '4/4',
      voices: [
        {
          notes: [
            { notestring: 'C#5/q, C5/16, B4/q, A4/8, E4/8', clef: 'treble' },
            { notestring: 'C4/16, D4/8', clef: 'bass' },
          ],
          beammask: [0, 0, 0, -1, -1, -1, -1],
          stavemask: [0, 0, 0, 0, 0, 1, 1],
          clef: 'treble',
        },
        { notes: [{ notestring: '', clef: 'bass' }], beammask: [], stavemask: [], clef: 'bass' },
      ],
    });
  });

  test('Vertical alignment - cross stave (beam down4)', () => {
    crossClef({
      title: 'Vertical alignment - cross stave (beam down4)',
      time: '4/4',
      voices: [
        {
          notes: [
            { notestring: 'C#5/q, C5/8, B4/q, A4/8, E4/16', clef: 'treble' },
            { notestring: 'C4/16, D4/8', clef: 'bass' },
          ],
          beammask: [0, 0, 0, -1, -1, -1, -1],
          stavemask: [0, 0, 0, 0, 0, 1, 1],
          clef: 'treble',
        },
        { notes: [{ notestring: '', clef: 'bass' }], beammask: [], stavemask: [], clef: 'bass' },
      ],
    });
  });

  test('Vertical alignment - cross stave (beam middle1)', () => {
    crossClef({
      title: 'Vertical alignment - cross stave (beam middle1)',
      time: '4/4',
      voices: [
        {
          notes: [
            { notestring: 'C#5/q, B4/q, A4/8, E4/8', clef: 'treble' },
            { notestring: 'C4/8, D4/8', clef: 'bass' },
          ],
          beammask: [0, 0, -1, -1, 1, 1],
          stavemask: [0, 0, 0, 0, 1, 1],
          clef: 'treble',
        },
        { notes: [{ notestring: '', clef: 'bass' }], beammask: [], stavemask: [], clef: 'bass' },
      ],
    });
  });

  test('Vertical alignment - cross stave (beam middle2)', () => {
    crossClef({
      title: 'Vertical alignment - cross stave (beam middle2)',
      time: '4/4',
      voices: [
        {
          notes: [
            { notestring: 'C#5/q, C5/16, B4/q, A4/8, E4/16', clef: 'treble' },
            { notestring: 'C4/8, D4/8', clef: 'bass' },
          ],
          beammask: [0, 0, 0, -1, -1, 1, 1],
          stavemask: [0, 0, 0, 0, 0, 1, 1],
          clef: 'treble',
        },
        { notes: [{ notestring: '', clef: 'bass' }], beammask: [], stavemask: [], clef: 'bass' },
      ],
    });
  });

  test('Vertical alignment - cross stave (beam middle3)', () => {
    crossClef({
      title: 'Vertical alignment - cross stave (beam middle3)',
      time: '4/4',
      voices: [
        {
          notes: [
            { notestring: 'C#5/q, C5/16, B4/q, A4/8, E4/8', clef: 'treble' },
            { notestring: 'C4/16, D4/8', clef: 'bass' },
          ],
          beammask: [0, 0, 0, -1, -1, 1, 1],
          stavemask: [0, 0, 0, 0, 0, 1, 1],
          clef: 'treble',
        },
        { notes: [{ notestring: '', clef: 'bass' }], beammask: [], stavemask: [], clef: 'bass' },
      ],
    });
  });

  test('Vertical alignment - cross stave (beam middle4)', () => {
    crossClef({
      title: 'Vertical alignment - cross stave (beam middle4)',
      time: '4/4',
      voices: [
        {
          notes: [
            { notestring: 'C#5/q, C5/8, B4/q, A4/8, E4/16', clef: 'treble' },
            { notestring: 'C4/16, D4/8', clef: 'bass' },
          ],
          beammask: [0, 0, 0, -1, -1, 1, 1],
          stavemask: [0, 0, 0, 0, 0, 1, 1],
          clef: 'treble',
        },
        { notes: [{ notestring: '', clef: 'bass' }], beammask: [], stavemask: [], clef: 'bass' },
      ],
    });
  });
});
