// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// CrossBeam Tests - Vitest Version

import { describe, test } from 'vitest';

import { Flow } from '../src/flow';
import { ContextBuilder, Renderer } from '../src/renderer';
import { Stave } from '../src/stave';
import { StaveNote } from '../src/stavenote';
import {
  createAssert,
  expectMatchingScreenshot,
  FONT_STACKS,
  generateTestID,
  makeFactory,
  TestOptions,
} from './vitest_test_helpers';

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

describe('CrossBeam', () => {
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
          const elementId = generateTestID('crossbeam_test');

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
          }
        });
      });
    });
  }

  async function crossClef(testdata: crossStaveBeamTest, options: TestOptions) {
    const assert = createAssert();
    const f = makeFactory(options.backend, options.elementId, 400 + Stave.defaultPadding, 250, options);
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
    await expectMatchingScreenshot(options, 'crossbeam_tests.test.ts');
    assert.ok(true);
  }

  runTest('Single clef mixed 1', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    await crossClef(
      {
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
      },
      options
    );
  });

  runTest('Single clef mixed 2', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    await crossClef(
      {
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
      },
      options
    );
  });

  runTest('Mixed clef voice middle', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    await crossClef(
      {
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
      },
      options
    );
  });

  runTest('Vertical alignment - cross stave (beam up1)', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    await crossClef(
      {
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
      },
      options
    );
  });

  runTest('Vertical alignment - cross stave (beam up2)', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    await crossClef(
      {
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
      },
      options
    );
  });

  runTest('Vertical alignment - cross stave (beam up3)', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    await crossClef(
      {
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
      },
      options
    );
  });

  runTest('Vertical alignment - cross stave (beam up4)', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    await crossClef(
      {
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
      },
      options
    );
  });

  runTest('Vertical alignment - cross stave (beam down1)', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    await crossClef(
      {
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
      },
      options
    );
  });

  runTest('Vertical alignment - cross stave (beam down2)', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    await crossClef(
      {
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
      },
      options
    );
  });

  runTest('Vertical alignment - cross stave (beam down3)', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    await crossClef(
      {
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
      },
      options
    );
  });

  runTest('Vertical alignment - cross stave (beam down4)', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    await crossClef(
      {
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
      },
      options
    );
  });

  runTest('Vertical alignment - cross stave (beam middle1)', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    await crossClef(
      {
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
      },
      options
    );
  });

  runTest('Vertical alignment - cross stave (beam middle2)', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    await crossClef(
      {
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
      },
      options
    );
  });

  runTest('Vertical alignment - cross stave (beam middle3)', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    await crossClef(
      {
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
      },
      options
    );
  });

  runTest('Vertical alignment - cross stave (beam middle4)', async (options: TestOptions, contextBuilder: ContextBuilder) => {
    await crossClef(
      {
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
      },
      options
    );
  });
});
