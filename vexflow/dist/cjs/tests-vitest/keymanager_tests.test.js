// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Music Key Management Tests - Vitest Version
//
// TODO: KeyManager.getAccidental(key) specifies that the return value's .accidental property is string | undefined.
//       However, we check it against null.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { KeyManager } from '../src/index';
import { afterAll, beforeAll, describe, test } from 'vitest';
import { Flow } from '../src/flow';
import { createAssert, FONT_STACKS } from './vitest_test_helpers';
describe('KeyManager', () => {
    let originalFontNames;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        originalFontNames = Flow.getMusicFont();
        Flow.setMusicFont(...FONT_STACKS['Bravura']);
    }));
    afterAll(() => {
        Flow.setMusicFont(...originalFontNames);
    });
    test('Valid Notes', () => {
        const assert = createAssert();
        const manager = new KeyManager('g');
        assert.equal(manager.getAccidental('f').accidental, '#');
        manager.setKey('a');
        assert.equal(manager.getAccidental('c').accidental, '#');
        assert.equal(manager.getAccidental('a').accidental, undefined);
        assert.equal(manager.getAccidental('f').accidental, '#');
        manager.setKey('A');
        assert.equal(manager.getAccidental('c').accidental, '#');
        assert.equal(manager.getAccidental('a').accidental, undefined);
        assert.equal(manager.getAccidental('f').accidental, '#');
    });
    test('Select Notes', () => {
        const assert = createAssert();
        const manager = new KeyManager('f');
        assert.equal(manager.selectNote('bb').note, 'bb');
        assert.equal(manager.selectNote('bb').accidental, 'b');
        assert.equal(manager.selectNote('g').note, 'g');
        assert.equal(manager.selectNote('g').accidental, undefined);
        assert.equal(manager.selectNote('b').note, 'b');
        assert.equal(manager.selectNote('b').accidental, undefined);
        assert.equal(manager.selectNote('a#').note, 'bb');
        assert.equal(manager.selectNote('g#').note, 'g#');
        // Changes have no effect?
        assert.equal(manager.selectNote('g#').note, 'g#');
        assert.equal(manager.selectNote('bb').note, 'bb');
        assert.equal(manager.selectNote('bb').accidental, 'b');
        assert.equal(manager.selectNote('g').note, 'g');
        assert.equal(manager.selectNote('g').accidental, undefined);
        assert.equal(manager.selectNote('b').note, 'b');
        assert.equal(manager.selectNote('b').accidental, undefined);
        assert.equal(manager.selectNote('a#').note, 'bb');
        assert.equal(manager.selectNote('g#').note, 'g#');
        // Changes should propagate
        manager.reset();
        assert.equal(manager.selectNote('g#').change, true);
        assert.equal(manager.selectNote('g#').change, false);
        assert.equal(manager.selectNote('g').change, true);
        assert.equal(manager.selectNote('g').change, false);
        assert.equal(manager.selectNote('g#').change, true);
        manager.reset();
        let note = manager.selectNote('bb');
        assert.equal(note.change, false);
        assert.equal(note.accidental, 'b');
        note = manager.selectNote('g');
        assert.equal(note.change, false);
        assert.equal(note.accidental, undefined);
        note = manager.selectNote('g#');
        assert.equal(note.change, true);
        assert.equal(note.accidental, '#');
        note = manager.selectNote('g');
        assert.equal(note.change, true);
        assert.equal(note.accidental, undefined);
        note = manager.selectNote('g');
        assert.equal(note.change, false);
        assert.equal(note.accidental, undefined);
        note = manager.selectNote('g#');
        assert.equal(note.change, true);
        assert.equal(note.accidental, '#');
    });
});
