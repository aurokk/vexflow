// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// ChordStave Tests

import { TestOptions, VexFlowTests } from './vexflow_test_helpers';

import { ChordStave } from '../src/chordstave';
import { ContextBuilder } from '../src/renderer';

const ChordStaveTests = {
  Start(): void {
    QUnit.module('ChordStave');
    const run = VexFlowTests.runTests;
    run('ChordStave Draw Test', draw);
  },
};

function draw(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 400, 160);
  const stave = new ChordStave(10, 10, 300);
  stave.setContext(ctx);
  stave.draw();

  options.assert.equal(stave.getYForNote(0), 100, 'getYForNote(0)');
  options.assert.equal(stave.getYForLine(5), 100, 'getYForLine(5)');
  options.assert.equal(stave.getYForLine(0), 50, 'getYForLine(0) - Top Line');
  options.assert.equal(stave.getYForLine(4), 90, 'getYForLine(4) - Bottom Line');

  options.assert.ok(true, 'all pass');
}

VexFlowTests.register(ChordStaveTests);
export { ChordStaveTests };
