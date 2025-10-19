// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author: Mike Corrigan <corrigan@gmail.com>
// MIT License
import { Glyph } from './glyph';
import { GraceNote } from './gracenote';
import { Modifier } from './modifier';
import { Note } from './note';
import { Stem } from './stem';
import { Tables } from './tables';
import { isGraceNote } from './typeguard';
/** Tremolo implements tremolo notation. */
export class Tremolo extends Modifier {
    static get CATEGORY() {
        return "Tremolo" /* Category.Tremolo */;
    }
    /**
     * @param num number of bars
     */
    constructor(num) {
        super();
        this.num = num;
        this.position = Modifier.Position.CENTER;
        this.code = 'tremolo1';
        // big strokes scales initialised to 1 (no scale)
        this.y_spacing_scale = 1;
        this.extra_stroke_scale = 1;
    }
    /** Draw the tremolo on the rendering context. */
    draw() {
        var _a;
        const ctx = this.checkContext();
        const note = this.checkAttachedNote();
        this.setRendered();
        const stemDirection = note.getStemDirection();
        const start = note.getModifierStartXY(this.position, this.index);
        let x = start.x;
        const gn = isGraceNote(note);
        const scale = gn ? GraceNote.SCALE : 1;
        const category = `tremolo.${gn ? 'grace' : 'default'}`;
        const musicFont = Tables.currentMusicFont();
        let y_spacing = musicFont.lookupMetric(`${category}.spacing`) * stemDirection;
        // add y_spacing_scale for big strokes (#1258)
        y_spacing *= this.y_spacing_scale;
        const height = this.num * y_spacing;
        let y = note.getStemExtents().baseY - height;
        if (stemDirection < 0) {
            y += musicFont.lookupMetric(`${category}.offsetYStemDown`) * scale;
        }
        else {
            y += musicFont.lookupMetric(`${category}.offsetYStemUp`) * scale;
        }
        const fontScale = (_a = musicFont.lookupMetric(`${category}.point`)) !== null && _a !== void 0 ? _a : Note.getPoint(gn ? 'grace' : 'default');
        x += musicFont.lookupMetric(`${category}.offsetXStem${stemDirection === Stem.UP ? 'Up' : 'Down'}`);
        for (let i = 0; i < this.num; ++i) {
            Glyph.renderGlyph(ctx, x, y, fontScale, this.code, { category, scale: this.extra_stroke_scale });
            y += y_spacing;
        }
    }
}
