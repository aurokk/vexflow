// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// ModifierContext Tests - Vitest Version
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Modifier, ModifierContext } from '../src/index';
import { afterAll, beforeAll, describe, test } from 'vitest';
import { Flow } from '../src/flow';
import { createAssert, FONT_STACKS } from './vitest_test_helpers';
describe('ModifierContext', () => {
    let originalFontNames;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        originalFontNames = Flow.getMusicFont();
        Flow.setMusicFont(...FONT_STACKS['Bravura']);
    }));
    afterAll(() => {
        Flow.setMusicFont(...originalFontNames);
    });
    test('Modifier Width Test', () => {
        const assert = createAssert();
        const mc = new ModifierContext();
        assert.equal(mc.getWidth(), 0, 'New modifier context has no width');
    });
    test('Modifier Management', () => {
        const assert = createAssert();
        const mc = new ModifierContext();
        const modifier1 = new Modifier();
        const modifier2 = new Modifier();
        mc.addMember(modifier1);
        mc.addMember(modifier2);
        const modifiers = mc.getMembers(Modifier.CATEGORY);
        assert.equal(modifiers.length, 2, 'Added two modifiers');
    });
});
