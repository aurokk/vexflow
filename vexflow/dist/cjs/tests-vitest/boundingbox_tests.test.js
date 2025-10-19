// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// BoundingBox Tests - Vitest Version
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { afterAll, beforeAll, describe, test } from 'vitest';
import { BoundingBox } from '../src/boundingbox';
import { Flow } from '../src/flow';
import { createAssert, FONT_STACKS } from './vitest_test_helpers';
describe('BoundingBox', () => {
    let originalFontNames;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        originalFontNames = Flow.getMusicFont();
        Flow.setMusicFont(...FONT_STACKS['Bravura']);
    }));
    afterAll(() => {
        Flow.setMusicFont(...originalFontNames);
    });
    test('Initialization Test', () => {
        const assert = createAssert();
        const bb = new BoundingBox(4, 5, 6, 7);
        assert.equal(bb.getX(), 4, 'Bad X');
        assert.equal(bb.getY(), 5, 'Bad Y');
        assert.equal(bb.getW(), 6, 'Bad W');
        assert.equal(bb.getH(), 7, 'Bad H');
        bb.setX(5);
        assert.equal(bb.getX(), 5, 'Bad X');
    });
    test('Merging Text', () => {
        const assert = createAssert();
        const tests = [
            {
                type: 'Intersection',
                bb1: new BoundingBox(10, 10, 10, 10),
                bb2: new BoundingBox(15, 20, 10, 10),
                merged: new BoundingBox(10, 10, 15, 20),
            },
            {
                type: '1 contains 2',
                bb1: new BoundingBox(10, 10, 30, 30),
                bb2: new BoundingBox(15, 15, 10, 10),
                merged: new BoundingBox(10, 10, 30, 30),
            },
            {
                type: '2 contains 1',
                bb1: new BoundingBox(15, 15, 10, 10),
                bb2: new BoundingBox(10, 10, 30, 30),
                merged: new BoundingBox(10, 10, 30, 30),
            },
        ];
        tests.forEach((test) => {
            const type = test.type;
            const bb1 = test.bb1;
            const bb2 = test.bb2;
            const merged = test.merged;
            bb1.mergeWith(bb2);
            assert.equal(bb1.getX(), merged.getX(), type + ' - Bad X');
            assert.equal(bb1.getY(), merged.getY(), type + ' - Bad Y');
            assert.equal(bb1.getW(), merged.getW(), type + ' - Bad W');
            assert.equal(bb1.getH(), merged.getH(), type + ' - Bad H');
        });
    });
});
