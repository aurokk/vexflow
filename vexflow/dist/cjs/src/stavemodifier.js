// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// A base class for stave modifiers (e.g. clefs, key signatures)
import { Element } from './element';
import { defined } from './util';
export var StaveModifierPosition;
(function (StaveModifierPosition) {
    StaveModifierPosition[StaveModifierPosition["CENTER"] = 0] = "CENTER";
    StaveModifierPosition[StaveModifierPosition["LEFT"] = 1] = "LEFT";
    StaveModifierPosition[StaveModifierPosition["RIGHT"] = 2] = "RIGHT";
    StaveModifierPosition[StaveModifierPosition["ABOVE"] = 3] = "ABOVE";
    StaveModifierPosition[StaveModifierPosition["BELOW"] = 4] = "BELOW";
    StaveModifierPosition[StaveModifierPosition["BEGIN"] = 5] = "BEGIN";
    StaveModifierPosition[StaveModifierPosition["END"] = 6] = "END";
})(StaveModifierPosition || (StaveModifierPosition = {}));
export class StaveModifier extends Element {
    static get CATEGORY() {
        return "StaveModifier" /* Category.StaveModifier */;
    }
    static get Position() {
        return StaveModifierPosition;
    }
    constructor() {
        super();
        this.width = 0;
        this.x = 0;
        this.padding = 10;
        this.position = StaveModifierPosition.ABOVE;
    }
    getPosition() {
        return this.position;
    }
    setPosition(position) {
        this.position = position;
        return this;
    }
    getStave() {
        return this.stave;
    }
    checkStave() {
        return defined(this.stave, 'NoStave', 'No stave attached to instance.');
    }
    setStave(stave) {
        this.stave = stave;
        return this;
    }
    getWidth() {
        return this.width;
    }
    setWidth(width) {
        this.width = width;
        return this;
    }
    getX() {
        return this.x;
    }
    setX(x) {
        this.x = x;
        return this;
    }
    /**
     * Runs setYShift() for the Glyph object so that it matches the position of line for
     * the Stave provided.  A `customShift` can also be given (measured in the same units
     * as `setYShift` not in lines) and this will be added after all other positions are
     * calculated from the Stave.
     *
     * Note that this routine only sets the yShift; it does not actually "place" (meaning
     * draw) the Glyph on the Stave.  Call .draw() afterwards to do that.
     */
    placeGlyphOnLine(glyph, stave, line, customShift = 0) {
        glyph.setYShift(stave.getYForLine(line !== null && line !== void 0 ? line : 0) - stave.getYForGlyphs() + customShift);
    }
    getPadding(index) {
        return index !== undefined && index < 2 ? 0 : this.padding;
    }
    setPadding(padding) {
        this.padding = padding;
        return this;
    }
    setLayoutMetrics(layoutMetrics) {
        this.layoutMetrics = layoutMetrics;
        return this;
    }
    getLayoutMetrics() {
        return this.layoutMetrics;
    }
    // eslint-disable-next-line
    draw(...args) {
        // DO NOTHING.
    }
}
