// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Registry Tests - Vitest Version

import { EasyScore, Element, Factory, Flow, Registry, StaveNote } from '../src/index';

import { afterAll, beforeAll, describe, test } from 'vitest';

import { createAssert, FONT_STACKS } from './vitest_test_helpers';

describe('Registry', () => {
  let originalFontNames: string[];

  beforeAll(async () => {
    originalFontNames = Flow.getMusicFont();
    Flow.setMusicFont(...FONT_STACKS['Bravura']);
  });

  afterAll(() => {
    Flow.setMusicFont(...originalFontNames);
  });

  test('Register and Clear', () => {
    const assert = createAssert();
    const registry = new Registry();
    const score = new EasyScore({ factory: Factory.newFromElementId(null) });

    registry.register(score.notes('C4')[0], 'foobar');

    const foobar = registry.getElementById('foobar') as Element;
    assert.ok(foobar);
    assert.equal(foobar.getAttribute('id'), 'foobar');

    registry.clear();
    assert.notEqual(registry.getElementById('foobar'), foobar);

    // eslint-disable-next-line
    // @ts-ignore: intentional type mismatch to trigger an error.
    assert.throws(() => registry.register(score.notes('C4')));

    registry.clear();
    assert.ok(registry.register(score.notes('C4[id="boobar"]')[0]).getElementById('boobar'));
  });

  test('Default Registry', () => {
    const assert = createAssert();
    const registry = new Registry();
    const score = new EasyScore({ factory: Factory.newFromElementId(null) });

    Registry.enableDefaultRegistry(registry);
    score.notes('C4[id="foobar"]');
    const note = registry.getElementById('foobar') as Element;
    assert.ok(note);

    note.setAttribute('id', 'boobar');
    assert.ok(registry.getElementById('boobar'));
    assert.notEqual(registry.getElementById('foobar'), note);

    registry.clear();
    assert.equal(registry.getElementsByType(StaveNote.CATEGORY).length, 0);

    score.notes('C5');
    const elements = registry.getElementsByType(StaveNote.CATEGORY);
    assert.equal(elements.length, 1);
  });

  test('Multiple Classes', () => {
    const assert = createAssert();
    const registry = new Registry();
    const score = new EasyScore({ factory: Factory.newFromElementId(null) });

    Registry.enableDefaultRegistry(registry);
    score.notes('C4[id="foobar"]');
    const note = registry.getElementById('foobar') as Element;

    note.addClass('foo');
    assert.ok(note.hasClass('foo'));
    assert.notEqual(note.hasClass('boo'), true);
    assert.equal(registry.getElementsByClass('foo').length, 1);
    assert.equal(registry.getElementsByClass('boo').length, 0);

    note.addClass('boo');
    assert.ok(note.hasClass('foo'));
    assert.ok(note.hasClass('boo'));
    assert.equal(registry.getElementsByClass('foo').length, 1);
    assert.equal(registry.getElementsByClass('boo').length, 1);

    note.removeClass('boo');
    note.removeClass('foo');
    assert.notEqual(note.hasClass('foo'), true);
    assert.notEqual(note.hasClass('boo'), true);
    assert.equal(registry.getElementsByClass('foo').length, 0);
    assert.equal(registry.getElementsByClass('boo').length, 0);
  });
});
