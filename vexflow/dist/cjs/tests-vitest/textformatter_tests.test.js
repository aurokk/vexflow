// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// TextFormatter Tests - Vitest Version
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { describe, test } from 'vitest';
import { Flow } from '../src/flow';
import { Font, FontStyle, FontWeight } from '../src/font';
import { Renderer } from '../src/renderer';
import { TextFormatter } from '../src/textformatter';
import { createAssert, expectMatchingScreenshot, FONT_STACKS, generateTestID } from './vitest_test_helpers';
describe('TextFormatter', () => {
    // Helper function to run a test with multiple backends and font stacks
    function runTest(testName, testFunc, backends = [
        { backend: Renderer.Backends.CANVAS, fontStacks: ['Bravura'] },
        { backend: Renderer.Backends.SVG, fontStacks: ['Bravura', 'Gonville', 'Petaluma', 'Leland'] },
    ]) {
        return __awaiter(this, void 0, void 0, function* () {
            backends.forEach(({ backend, fontStacks }) => {
                fontStacks.forEach((fontStackName) => {
                    test(`${testName} - ${backend === Renderer.Backends.SVG ? 'SVG' : 'Canvas'} - ${fontStackName}`, () => __awaiter(this, void 0, void 0, function* () {
                        const elementId = generateTestID('textformatter_test');
                        // Create the DOM element before the test runs
                        const tagName = backend === Renderer.Backends.SVG ? 'div' : 'canvas';
                        const element = document.createElement(tagName);
                        element.id = elementId;
                        document.body.appendChild(element);
                        const assert = createAssert();
                        const options = {
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
                            const contextBuilder = backend === Renderer.Backends.SVG ? Renderer.getSVGContext : Renderer.getCanvasContext;
                            yield testFunc(options, contextBuilder);
                        }
                        finally {
                            // Restore original font
                            Flow.setMusicFont(...originalFontNames);
                            // Don't remove the element so we can see rendered output
                            // element.remove();
                        }
                    }));
                });
            });
        });
    }
    test('Basic', () => {
        var _a;
        const assert = createAssert();
        // See: src/fonts/textfonts.ts > loadTextFonts()
        const registeredFamilies = TextFormatter.getFontFamilies();
        assert.equal(registeredFamilies.length, 5, `There are five registered font families: 'Roboto Slab' & 'PetalumaScript' and default 'Serif', 'Serif-Bold' and 'Sans'`);
        // Verify the advanceWidth and other metrics by opening the font file with a glyph inspector:
        // https://fontdrop.info/
        // https://opentype.js.org/glyph-inspector.html
        const petalumaFormatterInfo = TextFormatter.getInfo('PetalumaScript');
        assert.equal((_a = petalumaFormatterInfo === null || petalumaFormatterInfo === void 0 ? void 0 : petalumaFormatterInfo.glyphs) === null || _a === void 0 ? void 0 : _a.C.advanceWidth, 623, 'PetalumaScript advanceWidth of C character is 623.');
        const formatterForPetalumaScript = TextFormatter.create({ family: 'PetalumaScript', size: '100px' });
        const metricsPetalumaScriptH = formatterForPetalumaScript.getGlyphMetrics('H');
        assert.equal(metricsPetalumaScriptH.leftSideBearing, 37);
        const formatterForRobotoSlab = TextFormatter.create({ family: 'Roboto Slab', size: '100px', style: 'italic' });
        const metricsRobotoSlabH = formatterForRobotoSlab.getGlyphMetrics('H');
        assert.equal(metricsRobotoSlabH.advanceWidth, 1578);
        // eslint-disable-next-line
        // @ts-ignore direct access to protected variable .cacheKey
        assert.equal(formatterForRobotoSlab.cacheKey, 'Roboto_Slab%75%normal%normal');
    });
    runTest('Accuracy', (options, contextBuilder) => __awaiter(void 0, void 0, void 0, function* () {
        const assert = createAssert();
        const ctx = contextBuilder(options.elementId, 600, 500);
        const lineHeight = 30;
        const startX = 50;
        const fonts = [
            {
                family: Font.SERIF,
                size: 14,
                weight: FontWeight.NORMAL,
                style: FontStyle.NORMAL,
            },
            {
                family: 'Roboto Slab',
                size: 14,
                weight: FontWeight.NORMAL,
                style: FontStyle.NORMAL,
            },
            {
                family: Font.SANS_SERIF,
                size: 14,
                weight: FontWeight.BOLD,
                style: FontStyle.NORMAL,
            },
        ];
        let startY = 20;
        for (let j = 0; j < fonts.length; ++j) {
            const font = fonts[j];
            const textFormatter = TextFormatter.create(font);
            ctx.setFont(font);
            const texts = ['AVo(i)a', 'bghjIVex1/2', '@@@@@@@@', 'a very long String with Mixed Case Text,(0123456789)'];
            for (let i = 0; i < texts.length; i++) {
                ctx.setFillStyle('black');
                ctx.fillText(texts[i], startX, startY);
                startY += 5;
                ctx.setFillStyle('#3a2');
                ctx.fillRect(startX, startY, textFormatter.getWidthForTextInPx(texts[i]), 2);
                ctx.setFillStyle('#32a');
                startY += 5;
                ctx.fillRect(startX, startY, ctx.measureText(texts[i]).width, 2);
                startY += lineHeight;
            }
        }
        yield expectMatchingScreenshot(options, 'textformatter_tests.test.ts');
        assert.ok(true, 'all pass');
    }));
    runTest('Box Text', (options, contextBuilder) => __awaiter(void 0, void 0, void 0, function* () {
        const assert = createAssert();
        const ctx = contextBuilder(options.elementId, 600, 800);
        let startY = 35;
        const boxBorder = 2;
        const boxPadding = 3;
        const startX = 50;
        const fonts = [
            {
                family: Font.SERIF,
                size: 14,
                weight: FontWeight.NORMAL,
                style: FontStyle.NORMAL,
            },
            {
                family: 'Roboto Slab',
                size: 14,
                weight: FontWeight.NORMAL,
                style: FontStyle.NORMAL,
            },
            {
                family: Font.SANS_SERIF,
                size: 14,
                weight: FontWeight.NORMAL,
                style: FontStyle.NORMAL,
            },
        ];
        const texts = ['AVID', 'bghjIVex1/2', '@@@@@@@@'];
        for (let j = 0; j < fonts.length; ++j) {
            const font = fonts[j];
            const textFormatter = TextFormatter.create(font);
            ctx.save();
            ctx.setFont(font);
            for (let i = 0; i < texts.length; i++) {
                const textY = textFormatter.getYForStringInPx(texts[i]);
                const height = textY.height + 2 * boxPadding;
                const headroom = -1 * textY.yMin;
                const width = textFormatter.getWidthForTextInPx(texts[i]) + 2 * boxPadding;
                ctx.setFillStyle('black');
                ctx.fillText(texts[i], startX + boxPadding, startY - boxPadding);
                ctx.setLineWidth(boxBorder);
                ctx.setStrokeStyle('#3a2');
                ctx.setFillStyle('#3a2');
                ctx.beginPath();
                ctx.rect(startX, startY - height + headroom, width, height);
                ctx.stroke();
                startY += height * 1.5 + boxBorder * 3;
                const measureBox = ctx.measureText(texts[i]);
                const mwidth = measureBox.width + boxBorder * 2;
                const mheight = measureBox.height + boxBorder * 2;
                ctx.setFillStyle('black');
                ctx.fillText(texts[i], startX + boxPadding, startY - boxPadding);
                ctx.setStrokeStyle('#32a');
                ctx.setFillStyle('#32a');
                ctx.beginPath();
                ctx.rect(startX, startY - mheight, mwidth, mheight);
                ctx.stroke();
                startY += mheight * 1.5 + boxBorder * 3;
            }
            ctx.restore();
        }
        yield expectMatchingScreenshot(options, 'textformatter_tests.test.ts');
        assert.ok(true, 'all pass');
    }));
});
