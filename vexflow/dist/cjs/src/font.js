var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { defined } from './util';
export var FontWeight;
(function (FontWeight) {
    FontWeight["NORMAL"] = "normal";
    FontWeight["BOLD"] = "bold";
})(FontWeight || (FontWeight = {}));
export var FontStyle;
(function (FontStyle) {
    FontStyle["NORMAL"] = "normal";
    FontStyle["ITALIC"] = "italic";
})(FontStyle || (FontStyle = {}));
// Internal <span></span> element for parsing CSS font shorthand strings.
let fontParser;
const Fonts = {};
class Font {
    /**
     * @param fontSize a font size to convert. Can be specified as a CSS length string (e.g., '16pt', '1em')
     * or as a number (the unit is assumed to be 'pt'). See `Font.scaleToPxFrom` for the supported
     * units (e.g., pt, em, %).
     * @returns the number of pixels that is equivalent to `fontSize`
     */
    static convertSizeToPixelValue(fontSize = Font.SIZE) {
        var _a;
        if (typeof fontSize === 'number') {
            // Assume the numeric fontSize is specified in pt.
            return fontSize * Font.scaleToPxFrom.pt;
        }
        else {
            const value = parseFloat(fontSize);
            if (isNaN(value)) {
                return 0;
            }
            const unit = fontSize.replace(/[\d.\s]/g, '').toLowerCase(); // Extract the unit by removing all numbers, dots, spaces.
            const conversionFactor = (_a = Font.scaleToPxFrom[unit]) !== null && _a !== void 0 ? _a : 1;
            return value * conversionFactor;
        }
    }
    /**
     * @param fontSize a font size to convert. Can be specified as a CSS length string (e.g., '16pt', '1em')
     * or as a number (the unit is assumed to be 'pt'). See `Font.scaleToPxFrom` for the supported
     * units (e.g., pt, em, %).
     * @returns the number of points that is equivalent to `fontSize`
     */
    static convertSizeToPointValue(fontSize = Font.SIZE) {
        var _a;
        if (typeof fontSize === 'number') {
            // Assume the numeric fontSize is specified in pt.
            return fontSize;
        }
        else {
            const value = parseFloat(fontSize);
            if (isNaN(value)) {
                return 0;
            }
            const unit = fontSize.replace(/[\d.\s]/g, '').toLowerCase(); // Extract the unit by removing all numbers, dots, spaces.
            const conversionFactor = ((_a = Font.scaleToPxFrom[unit]) !== null && _a !== void 0 ? _a : 1) / Font.scaleToPxFrom.pt;
            return value * conversionFactor;
        }
    }
    /**
     * @param f
     * @param size
     * @param weight
     * @param style
     * @returns the `size` field will include the units (e.g., '12pt', '16px').
     */
    static validate(f, size, weight, style) {
        // If f is a string but all other arguments are undefined, we assume that
        // f is CSS font shorthand (e.g., 'italic bold 10pt Arial').
        if (typeof f === 'string' && size === undefined && weight === undefined && style === undefined) {
            return Font.fromCSSString(f);
        }
        let family;
        if (typeof f === 'object') {
            // f is a FontInfo object, so we extract its fields.
            family = f.family;
            size = f.size;
            weight = f.weight;
            style = f.style;
        }
        else {
            // f is a string representing the font family name or undefined.
            family = f;
        }
        family = family !== null && family !== void 0 ? family : Font.SANS_SERIF;
        size = size !== null && size !== void 0 ? size : Font.SIZE + 'pt';
        weight = weight !== null && weight !== void 0 ? weight : FontWeight.NORMAL;
        style = style !== null && style !== void 0 ? style : FontStyle.NORMAL;
        if (weight === '') {
            weight = FontWeight.NORMAL;
        }
        if (style === '') {
            style = FontStyle.NORMAL;
        }
        // If size is a number, we assume the unit is `pt`.
        if (typeof size === 'number') {
            size = `${size}pt`;
        }
        // If weight is a number (e.g., 900), turn it into a string representation of that number.
        if (typeof weight === 'number') {
            weight = weight.toString();
        }
        // At this point, `family`, `size`, `weight`, and `style` are all strings.
        return { family, size, weight, style };
    }
    /**
     * @param cssFontShorthand a string formatted as CSS font shorthand (e.g., 'italic bold 15pt Arial').
     */
    static fromCSSString(cssFontShorthand) {
        // Let the browser parse this string for us.
        // First, create a span element.
        // Then, set its style.font and extract it back out.
        if (!fontParser) {
            fontParser = document.createElement('span');
        }
        fontParser.style.font = cssFontShorthand;
        const { fontFamily, fontSize, fontWeight, fontStyle } = fontParser.style;
        return { family: fontFamily, size: fontSize, weight: fontWeight, style: fontStyle };
    }
    /**
     * @returns a CSS font shorthand string of the form `italic bold 16pt Arial`.
     */
    static toCSSString(fontInfo) {
        var _a;
        if (!fontInfo) {
            return '';
        }
        let style;
        const st = fontInfo.style;
        if (st === FontStyle.NORMAL || st === '' || st === undefined) {
            style = ''; // no space! Omit the style section.
        }
        else {
            style = st.trim() + ' ';
        }
        let weight;
        const wt = fontInfo.weight;
        if (wt === FontWeight.NORMAL || wt === '' || wt === undefined) {
            weight = ''; // no space! Omit the weight section.
        }
        else if (typeof wt === 'number') {
            weight = wt + ' ';
        }
        else {
            weight = wt.trim() + ' ';
        }
        let size;
        const sz = fontInfo.size;
        if (sz === undefined) {
            size = Font.SIZE + 'pt ';
        }
        else if (typeof sz === 'number') {
            size = sz + 'pt ';
        }
        else {
            // size is already a string.
            size = sz.trim() + ' ';
        }
        const family = (_a = fontInfo.family) !== null && _a !== void 0 ? _a : Font.SANS_SERIF;
        return `${style}${weight}${size}${family}`;
    }
    /**
     * @param fontSize a number representing a font size, or a string font size with units.
     * @param scaleFactor multiply the size by this factor.
     * @returns size * scaleFactor (e.g., 16pt * 3 = 48pt, 8px * 0.5 = 4px, 24 * 2 = 48).
     * If the fontSize argument was a number, the return value will be a number.
     * If the fontSize argument was a string, the return value will be a string.
     */
    static scaleSize(fontSize, scaleFactor) {
        if (typeof fontSize === 'number') {
            return (fontSize * scaleFactor);
        }
        else {
            const value = parseFloat(fontSize);
            const unit = fontSize.replace(/[\d.\s]/g, ''); // Remove all numbers, dots, spaces.
            return `${value * scaleFactor}${unit}`;
        }
    }
    /**
     * @param weight a string (e.g., 'bold') or a number (e.g., 600 / semi-bold in the OpenType spec).
     * @returns true if the font weight indicates bold.
     */
    static isBold(weight) {
        if (!weight) {
            return false;
        }
        else if (typeof weight === 'number') {
            return weight >= 600;
        }
        else {
            // a string can be 'bold' or '700'
            const parsedWeight = parseInt(weight, 10);
            if (isNaN(parsedWeight)) {
                return weight.toLowerCase() === 'bold';
            }
            else {
                return parsedWeight >= 600;
            }
        }
    }
    /**
     * @param style
     * @returns true if the font style indicates 'italic'.
     */
    static isItalic(style) {
        if (!style) {
            return false;
        }
        else {
            return style.toLowerCase() === FontStyle.ITALIC;
        }
    }
    /**
     * @param fontName
     * @param woffURL The absolute or relative URL to the woff file.
     * @param includeWoff2 If true, we assume that a woff2 file is in
     * the same folder as the woff file, and will append a `2` to the url.
     */
    // Support distributions of the typescript compiler that do not yet include the FontFace API declarations.
    // eslint-disable-next-line
    // @ts-ignore
    static loadWebFont(fontName, woffURL, includeWoff2 = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const woff2URL = includeWoff2 ? `url(${woffURL}2) format('woff2'), ` : '';
            const woff1URL = `url(${woffURL}) format('woff')`;
            const woffURLs = woff2URL + woff1URL;
            // eslint-disable-next-line
            // @ts-ignore
            const fontFace = new FontFace(fontName, woffURLs);
            yield fontFace.load();
            // eslint-disable-next-line
            // @ts-ignore
            document.fonts.add(fontFace);
            return fontFace;
        });
    }
    /**
     * Load the web fonts that are used by ChordSymbol. For example, `flow.html` calls:
     *   `await Vex.Flow.Font.loadWebFonts();`
     * Alternatively, you may load web fonts with a stylesheet link (e.g., from Google Fonts),
     * and a @font-face { font-family: ... } rule in your CSS.
     * If you do not load either of these fonts, ChordSymbol will fall back to Times or Arial,
     * depending on the current music engraving font.
     *
     * You can customize `Font.WEB_FONT_HOST` and `Font.WEB_FONT_FILES` to load different fonts
     * for your app.
     */
    static loadWebFonts() {
        return __awaiter(this, void 0, void 0, function* () {
            const host = Font.WEB_FONT_HOST;
            const files = Font.WEB_FONT_FILES;
            for (const fontName in files) {
                const fontPath = files[fontName];
                Font.loadWebFont(fontName, host + fontPath);
            }
        });
    }
    /**
     * @param fontName
     * @param data optionally set the Font object's `.data` property.
     *   This is usually done when setting up a font for the first time.
     * @param metrics optionally set the Font object's `.metrics` property.
     *   This is usually done when setting up a font for the first time.
     * @returns a Font object with the given `fontName`.
     *   Reuse an existing Font object if a matching one is found.
     */
    static load(fontName, data, metrics) {
        let font = Fonts[fontName];
        if (!font) {
            font = new Font(fontName);
            Fonts[fontName] = font;
        }
        if (data) {
            font.setData(data);
        }
        if (metrics) {
            font.setMetrics(metrics);
        }
        return font;
    }
    /**
     * Use `Font.load(fontName)` to get a Font object.
     * Do not call this constructor directly.
     */
    constructor(fontName) {
        this.name = fontName;
    }
    getName() {
        return this.name;
    }
    getData() {
        return defined(this.data, 'FontError', 'Missing font data');
    }
    getMetrics() {
        return defined(this.metrics, 'FontError', 'Missing metrics');
    }
    setData(data) {
        this.data = data;
    }
    setMetrics(metrics) {
        this.metrics = metrics;
    }
    hasData() {
        return this.data !== undefined;
    }
    getResolution() {
        return this.getData().resolution;
    }
    getGlyphs() {
        return this.getData().glyphs;
    }
    /**
     * Use the provided key to look up a value in this font's metrics file (e.g., bravura_metrics.ts, petaluma_metrics.ts).
     * @param key is a string separated by periods (e.g., stave.endPaddingMax, clef.lineCount.'5'.shiftY).
     * @param defaultValue is returned if the lookup fails.
     * @returns the retrieved value (or `defaultValue` if the lookup fails).
     */
    // eslint-disable-next-line
    lookupMetric(key, defaultValue) {
        const keyParts = key.split('.');
        // Start with the top level font metrics object, and keep looking deeper into the object (via each part of the period-delimited key).
        let currObj = this.getMetrics();
        for (let i = 0; i < keyParts.length; i++) {
            const keyPart = keyParts[i];
            const value = currObj[keyPart];
            if (value === undefined) {
                // If the key lookup fails, we fall back to the defaultValue.
                return defaultValue;
            }
            // The most recent lookup succeeded, so we drill deeper into the object.
            currObj = value;
        }
        // After checking every part of the key (i.e., the loop completed), return the most recently retrieved value.
        return currObj;
    }
    /** For debugging. */
    toString() {
        return '[' + this.name + ' Font]';
    }
}
//////////////////////////////////////////////////////////////////////////////////////////////////
// STATIC MEMBERS
/** Default sans-serif font family. */
Font.SANS_SERIF = 'Arial, sans-serif';
/** Default serif font family. */
Font.SERIF = 'Times New Roman, serif';
/** Default font size in `pt`. */
Font.SIZE = 10;
// CSS Font Sizes: 36pt == 48px == 3em == 300% == 0.5in
/** Given a length (for units: pt, px, em, %, in, mm, cm) what is the scale factor to convert it to px? */
Font.scaleToPxFrom = {
    pt: 4 / 3,
    px: 1,
    em: 16,
    '%': 4 / 25,
    in: 96,
    mm: 96 / 25.4,
    cm: 96 / 2.54,
};
/**
 * Customize this field to specify a different CDN for delivering web fonts.
 * Alternative: https://cdn.jsdelivr.net/npm/vexflow-fonts@1.0.3/
 * Or you can use your own host.
 */
Font.WEB_FONT_HOST = 'https://unpkg.com/vexflow-fonts@1.0.3/';
/**
 * These font files will be loaded from the CDN specified by `Font.WEB_FONT_HOST` when
 * `await Font.loadWebFonts()` is called. Customize this field to specify a different
 * set of fonts to load. See: `Font.loadWebFonts()`.
 */
Font.WEB_FONT_FILES = {
    'Roboto Slab': 'robotoslab/RobotoSlab-Medium_2.001.woff',
    PetalumaScript: 'petaluma/PetalumaScript_1.10_FS.woff',
};
export { Font };
