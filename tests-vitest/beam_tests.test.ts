// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Beam Tests - Vitest Version

import {
  AnnotationVerticalJustify,
  Beam,
  Dot,
  Factory,
  Font,
  FontStyle,
  FontWeight,
  StaveNoteStruct,
  Stem,
  StemmableNote,
  TabNoteStruct,
  Voice,
} from '../src/index';

import { describe, test } from 'vitest';

import { Flow } from '../src/flow';
import { Renderer, ContextBuilder } from '../src/renderer';
import { createAssert, FONT_STACKS, generateTestID, TestOptions } from './vitest_test_helpers';

// Helper to flatten arrays
const concat = <T>(a: T[], b: T[]): T[] => a.concat(b);

describe('Beam', () => {
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
          const elementId = generateTestID('test');
          const tagName = backend === Renderer.Backends.SVG ? 'div' : 'canvas';
          const element = document.createElement(tagName);
          element.id = elementId;
          document.body.appendChild(element);

          const options: TestOptions = { elementId, params: {}, backend };
          const originalFontNames = Flow.getMusicFont();
          Flow.setMusicFont(...FONT_STACKS[fontStackName]);

          try {
            const contextBuilder: ContextBuilder =
              backend === Renderer.Backends.SVG ? Renderer.getSVGContext : Renderer.getCanvasContext;
            testFunc(options, contextBuilder);
          } finally {
            Flow.setMusicFont(...originalFontNames);
          }
        });
      });
    });
  }
  runTest('Simple Beam', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const f = new Factory({ renderer: { elementId: options.elementId, backend: options.backend, width: 450, height: 140 } });
    const stave = f.Stave();
    const score = f.EasyScore();

    const beam = score.beam.bind(score);
    const notes = score.notes.bind(score);

    const voice = score.voice(
      [
        notes('(cb4 e#4 a4)/2'),
        beam(notes('(cb4 e#4 a4)/8, (d4 f4 a4), (ebb4 g##4 b4), (f4 a4 c5)', { stem: 'up' })),
      ].reduce(concat),
      { time: '2/2' }
    );

    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

    f.draw();

    assert.ok(true, 'Simple Test');
  });

  runTest('Multi Beam', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const f = new Factory({ renderer: { elementId: options.elementId, backend: options.backend, width: 450, height: 140 } });
    const stave = f.Stave();
    const score = f.EasyScore();

    const voice = score.voice.bind(score);
    const beam = score.beam.bind(score);
    const notes = score.notes.bind(score);

    const voices = [
      voice(
        [beam(notes('f5/8, e5, d5, c5', { stem: 'up' })), beam(notes('c5, d5, e5, f5', { stem: 'up' }))].reduce(concat)
      ),
      voice(
        [beam(notes('f4/8, e4, d4, c4', { stem: 'down' })), beam(notes('c4/8, d4, e4, f4', { stem: 'down' }))].reduce(
          concat
        )
      ),
    ];

    f.Formatter().joinVoices(voices).formatToStave(voices, stave);

    f.draw();

    assert.ok(true, 'Multi Test');
  });

  runTest('Sixteenth Beam', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const f = new Factory({ renderer: { elementId: options.elementId, backend: options.backend, width: 450, height: 140 } });
    const stave = f.Stave();
    const score = f.EasyScore();

    const voice = score.voice.bind(score);
    const beam = score.beam.bind(score);
    const notes = score.notes.bind(score);

    const voices = [
      voice(
        [
          beam(notes('f5/16, f5, d5, c5', { stem: 'up' })),
          beam(notes('c5/16, d5, f5, e5', { stem: 'up' })),
          notes('f5/2', { stem: 'up' }),
        ].reduce(concat)
      ),
      voice(
        [
          beam(notes('f4/16, e4/16, d4/16, c4/16', { stem: 'down' })),
          beam(notes('c4/16, d4/16, f4/16, e4/16', { stem: 'down' })),
          notes('f4/2', { stem: 'down' }),
        ].reduce(concat)
      ),
    ];

    f.Formatter().joinVoices(voices).formatToStave(voices, stave);

    f.draw();

    assert.ok(true, 'Sixteenth Test');
  });

  runTest('Slopey Beam', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const f = new Factory({ renderer: { elementId: options.elementId, backend: options.backend, width: 350, height: 140 } });
    const stave = f.Stave({ y: 20 });
    const score = f.EasyScore();

    const beam = score.beam.bind(score);
    const notes = score.notes.bind(score);
    const voice = score.voice(
      [
        beam(notes('c4/8, f4/8, d5/8, g5/8', { stem: 'up' })),
        beam(notes('d6/8, f5/8, d4/8, g3/8', { stem: 'up' })),
      ].reduce(concat)
    );

    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

    f.draw();

    assert.ok(true, 'Slopey Test');
  });

  runTest('Auto-stemmed Beam', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const f = new Factory({ renderer: { elementId: options.elementId, backend: options.backend, width: 350, height: 140 } });
    const stave = f.Stave({ y: 20 });
    const score = f.EasyScore();

    const voice = score.voice(score.notes('a4/8, b4/8, g4/8, c5/8, f4/8, d5/8, e4/8, e5/8, b4/8, b4/8, g4/8, d5/8'), {
      time: '6/4',
    });

    const notes = voice.getTickables() as StemmableNote[];

    const beams = [
      f.Beam({ notes: notes.slice(0, 2), options: { autoStem: true } }),
      f.Beam({ notes: notes.slice(2, 4), options: { autoStem: true } }),
      f.Beam({ notes: notes.slice(4, 6), options: { autoStem: true } }),
      f.Beam({ notes: notes.slice(6, 8), options: { autoStem: true } }),
      f.Beam({ notes: notes.slice(8, 10), options: { autoStem: true } }),
      f.Beam({ notes: notes.slice(10, 12), options: { autoStem: true } }),
    ];

    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

    const UP = Stem.UP;
    const DOWN = Stem.DOWN;

    assert.equal(beams[0].getStemDirection(), UP);
    assert.equal(beams[1].getStemDirection(), UP);
    assert.equal(beams[2].getStemDirection(), UP);
    assert.equal(beams[3].getStemDirection(), UP);
    assert.equal(beams[4].getStemDirection(), DOWN);
    assert.equal(beams[5].getStemDirection(), DOWN);

    f.draw();

    assert.ok(true, 'AutoStem Beam Test');
  });

  runTest('Mixed Beam 1', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const f = new Factory({ renderer: { elementId: options.elementId, backend: options.backend, width: 350, height: 140 } });
    const stave = f.Stave({ y: 20 });
    const score = f.EasyScore();

    const voice1 = score.voice(
      score.notes('f5/8, d5/16, c5/16, c5/16, d5/16, e5/8, f5/8, d5/16, c5/16, c5/16, d5/16, e5/8', { stem: 'up' })
    );

    const voice2 = score.voice(
      score.notes('f4/16, e4/8, d4/16, c4/16, d4/8, f4/16, f4/16, e4/8, d4/16, c4/16, d4/8, f4/16', { stem: 'down' })
    );

    [
      [0, 4],
      [4, 8],
      [8, 12],
    ].forEach((range) => f.Beam({ notes: voice1.getTickables().slice(range[0], range[1]) as StemmableNote[] }));

    [
      [0, 4],
      [4, 8],
      [8, 12],
    ].forEach((range) => f.Beam({ notes: voice2.getTickables().slice(range[0], range[1]) as StemmableNote[] }));

    f.Formatter().joinVoices([voice1, voice2]).formatToStave([voice1, voice2], stave);

    f.draw();

    assert.ok(true, 'Multi Test');
  });

  runTest('Mixed Beam 2', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const f = new Factory({ renderer: { elementId: options.elementId, backend: options.backend, width: 450, height: 180 } });
    const stave = f.Stave({ y: 20 });
    const score = f.EasyScore();

    const voice = score.voice(
      score.notes('f5/32, d5/16, c5/32, c5/64, d5/128, e5/8, f5/16, d5/32, c5/64, c5/32, d5/16, e5/128', {
        stem: 'up',
      }),
      { time: '31/64' }
    );

    const voice2 = score.voice(
      score.notes('f4/32, d4/16, c4/32, c4/64, d4/128, e4/8, f4/16, d4/32, c4/64, c4/32, d4/16, e4/128', {
        stem: 'down',
      }),
      { time: '31/64' }
    );

    f.Beam({ notes: voice.getTickables().slice(0, 12) as StemmableNote[] });
    f.Beam({ notes: voice2.getTickables().slice(0, 12) as StemmableNote[] });

    f.Formatter().joinVoices([voice, voice2]).formatToStave([voice, voice2], stave);

    f.draw();

    assert.ok(true, 'Multi Test');
  });

  runTest('Dotted Beam', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const f = new Factory({ renderer: { elementId: options.elementId, backend: options.backend, width: 450, height: 140 } });
    const stave = f.Stave();
    const score = f.EasyScore();

    const voice = score.voice(
      score.notes('d4/8, b3/8., a3/16, a3/8, b3/8., c4/16, d4/8, b3/8, a3/8., a3/16, b3/8., c4/16', { stem: 'up' }),
      { time: '6/4' }
    );

    const notes = voice.getTickables() as StemmableNote[];
    f.Beam({ notes: notes.slice(0, 4) });
    f.Beam({ notes: notes.slice(4, 8) });
    f.Beam({ notes: notes.slice(8, 12) });

    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

    f.draw();

    assert.ok(true, 'Dotted Test');
  });

  runTest('Partial Beam', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const f = new Factory({ renderer: { elementId: options.elementId, backend: options.backend, width: 450, height: 140 } });
    const stave = f.Stave();
    const score = f.EasyScore();

    const voice = score.voice(
      score.notes(
        'd4/8, b3/32, c4/16., d4/16., e4/8, c4/64, c4/32, a3/8., b3/32., c4/8, e4/64, b3/16., b3/64, f4/8, e4/8, g4/64, e4/8'
      ),
      { time: '89/64' }
    );

    const notes = voice.getTickables() as StemmableNote[];
    f.Beam({ notes: notes.slice(0, 3) });
    f.Beam({ notes: notes.slice(3, 9) });
    f.Beam({ notes: notes.slice(9, 13) });
    f.Beam({ notes: notes.slice(13, 17) });

    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

    f.draw();

    assert.ok(true, 'Partial Test');
  });

  runTest('Close Trade-offs Beam', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const f = new Factory({ renderer: { elementId: options.elementId, backend: options.backend, width: 450, height: 140 } });
    const stave = f.Stave();
    const score = f.EasyScore();

    const voice = score.voice(score.notes('a4/8, b4/8, c4/8, d4/8, g4/8, a4/8, b4/8, c4/8', { stem: 'up' }));

    const notes = voice.getTickables() as StemmableNote[];
    f.Beam({ notes: notes.slice(0, 4) });
    f.Beam({ notes: notes.slice(4, 8) });

    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

    f.draw();

    assert.ok(true, 'Close Trade-offs Test');
  });

  runTest('Insane Beam', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const f = new Factory({ renderer: { elementId: options.elementId, backend: options.backend, width: 450, height: 180 } });
    const stave = f.Stave({ y: 20 });
    const score = f.EasyScore();

    const voice = score.voice(
      score.notes('g4/8, g5/8, c4/8, b5/8, g4/8[stem="down"], a5[stem="down"], b4[stem="down"], c4/8', { stem: 'up' })
    );

    const notes = voice.getTickables() as StemmableNote[];
    f.Beam({ notes: notes.slice(0, 4) });
    f.Beam({ notes: notes.slice(4, 7) });

    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

    f.draw();

    assert.ok(true, 'Insane Test');
  });

  runTest('Lengthy Beam', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const f = new Factory({ renderer: { elementId: options.elementId, backend: options.backend, width: 450, height: 180 } });
    const stave = f.Stave({ y: 20 });
    const score = f.EasyScore();

    const voice = score.voice(score.beam(score.notes('g4/8, g4, g4, a4', { stem: 'up' })), { time: '2/4' });

    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

    f.draw();

    assert.ok(true, 'Lengthy Test');
  });

  runTest('Outlier Beam', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const f = new Factory({ renderer: { elementId: options.elementId, backend: options.backend, width: 450, height: 180 } });
    const stave = f.Stave({ y: 20 });
    const score = f.EasyScore();

    const voice = score.voice(
      score.notes(
        [
          'g4/8[stem="up"],   f4[stem="up"],   d5[stem="up"],   e4[stem="up"]',
          'd5/8[stem="down"], d5[stem="down"], c5[stem="down"], d5[stem="down"]',
        ].join()
      )
    );

    const notes = voice.getTickables() as StemmableNote[];
    f.Beam({ notes: notes.slice(0, 4) });
    f.Beam({ notes: notes.slice(4, 8) });

    f.Formatter().joinVoices([voice]).formatToStave([voice], stave, { stave: stave });

    f.draw();

    assert.ok(true, 'Outlier Test');
  });

  runTest('Break Secondary Beams', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const f = new Factory({ renderer: { elementId: options.elementId, backend: options.backend, width: 600, height: 200 } });
    const stave = f.Stave({ y: 20 });
    const score = f.EasyScore();

    const voice = score.voice.bind(score);
    const beam = score.beam.bind(score);
    const notes = score.notes.bind(score);

    const voices = [
      voice(
        [
          beam(notes('f5/16., f5/32, c5/16., d5/32, c5/16., d5/32', { stem: 'up' }), { secondaryBeamBreaks: [1, 3] }),
          beam(notes('f5/16, e5, e5, e5, e5, e5', { stem: 'up' }), { secondaryBeamBreaks: [2] }),
        ].reduce(concat),
        { time: '3/4' }
      ),
      voice(
        [
          beam(notes('f4/32, d4, e4, c4, d4, c4, f4, d4, e4, c4, c4, d4', { stem: 'down' }), {
            secondaryBeamBreaks: [3, 7],
          }),
          beam(notes('d4/16, f4, d4, e4, e4, e4', { stem: 'down' }), { secondaryBeamBreaks: [3] }),
        ].reduce(concat),
        { time: '3/4' }
      ),
    ];

    f.Formatter().joinVoices(voices).formatToStave(voices, stave);

    f.draw();

    assert.ok(true, 'Breaking Secondary Beams Test');
  });

  runTest('Partial Beam Direction', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const f = new Factory({ renderer: { elementId: options.elementId, backend: options.backend, width: 600, height: 200 } });
    const stave = f.Stave({ y: 20 });
    const score = f.EasyScore();

    const voice = score.voice.bind(score);
    const beam = score.beam.bind(score);
    const notes = score.notes.bind(score);

    const voices = [
      voice(
        [
          // Default beaming:
          beam(notes('f4/8, f4/16, f4/8, f4/16', { stem: 'up' })),
          // Force first 16th beam right
          beam(notes('f4/8, f4/16, f4/8, f4/16', { stem: 'up' }), { partialBeamDirections: { '1': 'R' } }),
          // Force first 16th beam left
          beam(notes('f4/8, f4/16, f4/8, f4/16', { stem: 'up' }), { partialBeamDirections: { '1': 'L' } }),
        ].reduce(concat),
        { time: '9/8' }
      ),
    ];

    f.Formatter().joinVoices(voices).formatToStave(voices, stave);

    f.draw();

    assert.ok(true, 'Partial beam direction test');
  });

  runTest('TabNote Beams Up', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const f = new Factory({ renderer: { elementId: options.elementId, backend: options.backend, width: 600, height: 200 } });
    const stave = f.TabStave({ y: 20 });

    const specs: TabNoteStruct[] = [
      {
        positions: [
          { str: 3, fret: 6 },
          { str: 4, fret: 25 },
        ],
        duration: '4',
      },
      {
        positions: [
          { str: 2, fret: 10 },
          { str: 5, fret: 12 },
        ],
        duration: '8',
      },
      {
        positions: [
          { str: 1, fret: 6 },
          { str: 4, fret: 5 },
        ],
        duration: '8',
      },
      {
        positions: [
          { str: 1, fret: 6 },
          { str: 4, fret: 5 },
        ],
        duration: '16',
      },
      {
        positions: [
          { str: 1, fret: 6 },
          { str: 4, fret: 5 },
        ],
        duration: '32',
      },
      {
        positions: [
          { str: 1, fret: 6 },
          { str: 4, fret: 5 },
        ],
        duration: '64',
      },
      {
        positions: [
          { str: 1, fret: 6 },
          { str: 4, fret: 5 },
        ],
        duration: '128',
      },
      { positions: [{ str: 3, fret: 6 }], duration: '8' },
      { positions: [{ str: 3, fret: 6 }], duration: '8' },
      { positions: [{ str: 3, fret: 6 }], duration: '8' },
      { positions: [{ str: 3, fret: 6 }], duration: '8' },
    ];

    const notes = specs.map((struct) => {
      const tabNote = f.TabNote(struct);
      tabNote.render_options.draw_stem = true;
      return tabNote;
    });

    f.Beam({ notes: notes.slice(1, 7) });
    f.Beam({ notes: notes.slice(8, 11) });
    f.Tuplet({ notes: notes.slice(8, 11), options: { ratioed: true } });

    const voice = f.Voice().setMode(Voice.Mode.SOFT).addTickables(notes);

    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

    f.draw();

    assert.ok(true, 'All objects have been drawn');
  });

  runTest('TabNote Beams Down', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const f = new Factory({ renderer: { elementId: options.elementId, backend: options.backend, width: 600, height: 250 } });
    const stave = f.TabStave({ options: { num_lines: 10 } });

    const specs: TabNoteStruct[] = [
      {
        stem_direction: -1,
        positions: [
          { str: 3, fret: 6 },
          { str: 4, fret: 25 },
        ],
        duration: '4',
      },
      {
        stem_direction: -1,
        positions: [
          { str: 2, fret: 10 },
          { str: 5, fret: 12 },
        ],
        duration: '8dd',
      },
      {
        stem_direction: -1,
        positions: [
          { str: 1, fret: 6 },
          { str: 4, fret: 5 },
        ],
        duration: '8',
      },
      {
        stem_direction: -1,
        positions: [
          { str: 1, fret: 6 },
          { str: 4, fret: 5 },
        ],
        duration: '16',
      },
      {
        stem_direction: -1,
        positions: [
          { str: 1, fret: 6 },
          { str: 4, fret: 5 },
        ],
        duration: '32',
      },
      {
        stem_direction: -1,
        positions: [
          { str: 1, fret: 6 },
          { str: 4, fret: 5 },
        ],
        duration: '64',
      },
      {
        stem_direction: -1,
        positions: [
          { str: 1, fret: 6 },
          { str: 4, fret: 5 },
        ],
        duration: '128',
      },
      { stem_direction: -1, positions: [{ str: 1, fret: 6 }], duration: '8' },
      { stem_direction: -1, positions: [{ str: 1, fret: 6 }], duration: '8' },
      { stem_direction: -1, positions: [{ str: 1, fret: 6 }], duration: '8' },
      { stem_direction: -1, positions: [{ str: 7, fret: 6 }], duration: '8' },
      { stem_direction: -1, positions: [{ str: 7, fret: 6 }], duration: '8' },
      { stem_direction: -1, positions: [{ str: 10, fret: 6 }], duration: '8' },
      { stem_direction: -1, positions: [{ str: 10, fret: 6 }], duration: '8' },
    ];

    const notes = specs.map((struct) => {
      const tabNote = f.TabNote(struct);
      tabNote.render_options.draw_stem = true;
      tabNote.render_options.draw_dots = true;
      return tabNote;
    });

    Dot.buildAndAttach([notes[1], notes[1]]);

    f.Beam({ notes: notes.slice(1, 7) });
    f.Beam({ notes: notes.slice(8, 11) });

    f.Tuplet({ notes: notes.slice(8, 11), options: { location: -1 } });
    f.Tuplet({ notes: notes.slice(11, 14), options: { location: -1 } });

    const voice = f.Voice().setMode(Voice.Mode.SOFT).addTickables(notes);

    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

    f.draw();

    assert.ok(true, 'All objects have been drawn');
  });

  runTest('TabNote Auto Create Beams', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const f = new Factory({ renderer: { elementId: options.elementId, backend: options.backend, width: 600, height: 200 } });
    const stave = f.TabStave();

    const specs: TabNoteStruct[] = [
      {
        positions: [
          { str: 1, fret: 6 },
          { str: 4, fret: 5 },
        ],
        duration: '8',
      },
      {
        positions: [
          { str: 1, fret: 6 },
          { str: 4, fret: 5 },
        ],
        duration: '8',
      },
      {
        positions: [
          { str: 1, fret: 6 },
          { str: 4, fret: 5 },
        ],
        duration: '16',
      },
      {
        positions: [
          { str: 1, fret: 6 },
          { str: 4, fret: 5 },
        ],
        duration: '16',
      },
      { positions: [{ str: 1, fret: 6 }], duration: '32' },
      { positions: [{ str: 1, fret: 6 }], duration: '32' },
      { positions: [{ str: 1, fret: 6 }], duration: '32' },
      { positions: [{ str: 6, fret: 6 }], duration: '32' },
      { positions: [{ str: 6, fret: 6 }], duration: '16' },
      { positions: [{ str: 6, fret: 6 }], duration: '16' },
      { positions: [{ str: 6, fret: 6 }], duration: '16' },
      { positions: [{ str: 6, fret: 6 }], duration: '16' },
    ];

    const notes = specs.map((struct) => {
      const tabNote = f.TabNote(struct);
      tabNote.render_options.draw_stem = true;
      tabNote.render_options.draw_dots = true;
      return tabNote;
    });

    const voice = f.Voice().setMode(Voice.Mode.SOFT).addTickables(notes);
    const beams = Beam.applyAndGetBeams(voice, -1);

    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

    f.draw();

    beams.forEach((beam) => beam.setContext(f.getContext()).draw());

    assert.ok(true, 'All objects have been drawn');
  });

  runTest('TabNote Beams Auto Stem', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const f = new Factory({ renderer: { elementId: options.elementId, backend: options.backend, width: 600, height: 300 } });
    const stave = f.TabStave();

    const specs: TabNoteStruct[] = [
      {
        positions: [
          { str: 1, fret: 6 },
          { str: 4, fret: 5 },
        ],
        duration: '8',
        stem_direction: -1,
      },
      {
        positions: [
          { str: 1, fret: 6 },
          { str: 4, fret: 5 },
        ],
        duration: '8',
        stem_direction: 1,
      },
      {
        positions: [
          { str: 1, fret: 6 },
          { str: 4, fret: 5 },
        ],
        duration: '16',
        stem_direction: -1,
      },
      {
        positions: [
          { str: 1, fret: 6 },
          { str: 4, fret: 5 },
        ],
        duration: '16',
        stem_direction: 1,
      },
      { positions: [{ str: 1, fret: 6 }], duration: '32', stem_direction: 1 },
      { positions: [{ str: 1, fret: 6 }], duration: '32', stem_direction: -1 },
      { positions: [{ str: 1, fret: 6 }], duration: '32', stem_direction: -1 },
      { positions: [{ str: 6, fret: 6 }], duration: '32', stem_direction: -1 },
      { positions: [{ str: 6, fret: 6 }], duration: '16', stem_direction: 1 },
      { positions: [{ str: 6, fret: 6 }], duration: '16', stem_direction: 1 },
      { positions: [{ str: 6, fret: 6 }], duration: '16', stem_direction: 1 },
      { positions: [{ str: 6, fret: 6 }], duration: '16', stem_direction: -1 },
    ];

    const notes = specs.map((struct) => {
      const tabNote = f.TabNote(struct);
      tabNote.render_options.draw_stem = true;
      tabNote.render_options.draw_dots = true;
      return tabNote;
    });

    // Stems should format down
    f.Beam({ notes: notes.slice(0, 8), options: { autoStem: true } });
    // Stems should format up
    f.Beam({ notes: notes.slice(8, 12), options: { autoStem: true } });

    const voice = f.Voice().setMode(Voice.Mode.SOFT).addTickables(notes);

    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

    f.draw();

    assert.ok(true, 'All objects have been drawn');
  });

  runTest('Complex Beams with Annotations', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const factory = new Factory({ renderer: { elementId: options.elementId, backend: options.backend, width: 500, height: 200 } });
    const stave = factory.Stave({ y: 40 });

    const s1: StaveNoteStruct[] = [
      { keys: ['e/4'], duration: '128', stem_direction: 1 },
      { keys: ['d/4'], duration: '16', stem_direction: 1 },
      { keys: ['e/4'], duration: '8', stem_direction: 1 },
      { keys: ['c/4', 'g/4'], duration: '32', stem_direction: 1 },
      { keys: ['c/4'], duration: '32', stem_direction: 1 },
      { keys: ['c/4'], duration: '32', stem_direction: 1 },
      { keys: ['c/4'], duration: '32', stem_direction: 1 },
    ];

    const s2: StaveNoteStruct[] = [
      { keys: ['e/5'], duration: '128', stem_direction: -1 },
      { keys: ['d/5'], duration: '16', stem_direction: -1 },
      { keys: ['e/5'], duration: '8', stem_direction: -1 },
      { keys: ['c/5', 'g/5'], duration: '32', stem_direction: -1 },
      { keys: ['c/5'], duration: '32', stem_direction: -1 },
      { keys: ['c/5'], duration: '32', stem_direction: -1 },
      { keys: ['c/5'], duration: '32', stem_direction: -1 },
    ];

    const font = {
      family: Font.SERIF,
      size: 14,
      weight: FontWeight.BOLD,
      style: FontStyle.ITALIC,
    };

    const notes1 = s1.map((struct) =>
      factory
        .StaveNote(struct) //
        .addModifier(factory.Annotation({ text: '1', vJustify: AnnotationVerticalJustify.TOP, font }), 0)
    );

    const notes2 = s2.map((struct) =>
      factory
        .StaveNote(struct) //
        .addModifier(factory.Annotation({ text: '3', vJustify: AnnotationVerticalJustify.BOTTOM, font }), 0)
    );

    factory.Beam({ notes: notes1 });
    factory.Beam({ notes: notes2 });

    const voice = factory.Voice().setMode(Voice.Mode.SOFT).addTickables(notes1).addTickables(notes2);

    factory.Formatter().joinVoices([voice]).formatToStave([voice], stave, { stave: stave });

    factory.draw();

    assert.ok(true, 'Complex beam annotations');
  });

  runTest('Complex Beams with Articulations', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const f = new Factory({ renderer: { elementId: options.elementId, backend: options.backend, width: 500, height: 200 } });
    const stave = f.Stave({ y: 40 });

    const s1: StaveNoteStruct[] = [
      { keys: ['e/4'], duration: '128', stem_direction: 1 },
      { keys: ['d/4'], duration: '16', stem_direction: 1 },
      { keys: ['e/4'], duration: '8', stem_direction: 1 },
      { keys: ['c/4', 'g/4'], duration: '32', stem_direction: 1 },
      { keys: ['c/4'], duration: '32', stem_direction: 1 },
      { keys: ['c/4'], duration: '32', stem_direction: 1 },
      { keys: ['c/4'], duration: '32', stem_direction: 1 },
    ];

    const s2: StaveNoteStruct[] = [
      { keys: ['e/5'], duration: '128', stem_direction: -1 },
      { keys: ['d/5'], duration: '16', stem_direction: -1 },
      { keys: ['e/5'], duration: '8', stem_direction: -1 },
      { keys: ['c/5', 'g/5'], duration: '32', stem_direction: -1 },
      { keys: ['c/5'], duration: '32', stem_direction: -1 },
      { keys: ['c/5'], duration: '32', stem_direction: -1 },
      { keys: ['c/5'], duration: '32', stem_direction: -1 },
    ];

    const notes1 = s1.map((struct) =>
      f.StaveNote(struct).addModifier(f.Articulation({ type: 'am', position: 'above' }), 0)
    );
    const notes2 = s2.map((struct) =>
      f.StaveNote(struct).addModifier(f.Articulation({ type: 'a>', position: 'below' }), 0)
    );

    f.Beam({ notes: notes1 });
    f.Beam({ notes: notes2 });

    const voice = f.Voice().setMode(Voice.Mode.SOFT).addTickables(notes1).addTickables(notes2);

    f.Formatter().joinVoices([voice]).formatToStave([voice], stave, { stave: stave });

    f.draw();

    assert.ok(true, 'Complex beam articulations');
  });

  runTest('Complex Beams with Articulations two Staves', (options: TestOptions, contextBuilder: ContextBuilder) => {
    const assert = createAssert();
    const f = new Factory({ renderer: { elementId: options.elementId, backend: options.backend, width: 500, height: 300 } });
    const system = f.System();

    const s1: StaveNoteStruct[] = [
      { keys: ['e/4'], duration: '128', stem_direction: 1 },
      { keys: ['d/4'], duration: '16', stem_direction: 1 },
      { keys: ['e/4'], duration: '8', stem_direction: 1 },
      { keys: ['c/4', 'g/4'], duration: '32', stem_direction: 1 },
      { keys: ['c/4'], duration: '32', stem_direction: 1 },
      { keys: ['c/4'], duration: '32', stem_direction: 1 },
      { keys: ['c/4'], duration: '32', stem_direction: 1 },
    ];

    const s2: StaveNoteStruct[] = [
      { keys: ['e/5'], duration: '128', stem_direction: -1 },
      { keys: ['d/5'], duration: '16', stem_direction: -1 },
      { keys: ['e/5'], duration: '8', stem_direction: -1 },
      { keys: ['c/5', 'g/5'], duration: '32', stem_direction: -1 },
      { keys: ['c/5'], duration: '32', stem_direction: -1 },
      { keys: ['c/5'], duration: '32', stem_direction: -1 },
      { keys: ['c/5'], duration: '32', stem_direction: -1 },
    ];

    const notes1 = s1.map((struct) =>
      f.StaveNote(struct).addModifier(f.Articulation({ type: 'am', position: 'above' }), 0)
    );
    const notes2 = s2.map((struct) =>
      f.StaveNote(struct).addModifier(f.Articulation({ type: 'a>', position: 'below' }), 0)
    );

    const notes3 = s1.map((struct) =>
      f.StaveNote(struct).addModifier(f.Articulation({ type: 'am', position: 'above' }), 0)
    );
    const notes4 = s2.map((struct) =>
      f.StaveNote(struct).addModifier(f.Articulation({ type: 'a>', position: 'below' }), 0)
    );

    f.Beam({ notes: notes1 });
    f.Beam({ notes: notes2 });
    f.Beam({ notes: notes3 });
    f.Beam({ notes: notes4 });

    const voice1 = f.Voice().setMode(Voice.Mode.SOFT).addTickables(notes1).addTickables(notes2);
    const voice2 = f.Voice().setMode(Voice.Mode.SOFT).addTickables(notes3).addTickables(notes4);

    system.addStave({ voices: [voice1] });
    system.addStave({ voices: [voice2] });

    f.draw();

    assert.ok(true, 'Complex beam articulations two staves');
  });
});
