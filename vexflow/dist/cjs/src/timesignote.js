// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author Taehoon Moon 2014
import { Note } from './note';
import { TimeSignature } from './timesignature';
export class TimeSigNote extends Note {
    static get CATEGORY() {
        return "TimeSigNote" /* Category.TimeSigNote */;
    }
    constructor(timeSpec, customPadding) {
        super({ duration: 'b' });
        this.timeSig = new TimeSignature(timeSpec, customPadding);
        this.setWidth(this.timeSig.getGlyph().getMetrics().width);
        // Note properties
        this.ignore_ticks = true;
    }
    /* Overridden to ignore */
    // eslint-disable-next-line
    addToModifierContext(mc) {
        // DO NOTHING.
        return this;
    }
    preFormat() {
        this.preFormatted = true;
        return this;
    }
    draw() {
        const stave = this.checkStave();
        const ctx = this.checkContext();
        this.setRendered();
        const tsGlyph = this.timeSig.getGlyph();
        if (!tsGlyph.getContext()) {
            tsGlyph.setContext(ctx);
        }
        tsGlyph.setStave(stave);
        tsGlyph.setYShift(stave.getYForLine(2) - stave.getYForGlyphs());
        tsGlyph.renderToStave(this.getAbsoluteX());
    }
}
