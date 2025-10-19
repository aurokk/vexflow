// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
import { BoundingBox } from './boundingbox';
import { Glyph } from './glyph';
import { Note } from './note';
import { Stem } from './stem';
import { Tables } from './tables';
import { defined, log } from './util';
// eslint-disable-next-line
function L(...args) {
    if (NoteHead.DEBUG)
        log('Vex.Flow.NoteHead', args);
}
/**
 * Draw slashnote head manually. No glyph exists for this.
 * @param ctx the Canvas context
 * @param duration the duration of the note. ex: "4"
 * @param x the x coordinate to draw at
 * @param y the y coordinate to draw at
 * @param stem_direction the direction of the stem
 */
function drawSlashNoteHead(ctx, duration, x, y, stem_direction, staveSpace) {
    const width = Tables.SLASH_NOTEHEAD_WIDTH;
    ctx.save();
    ctx.setLineWidth(Tables.STEM_WIDTH);
    let fill = false;
    if (Tables.durationToNumber(duration) > 2) {
        fill = true;
    }
    if (!fill)
        x -= (Tables.STEM_WIDTH / 2) * stem_direction;
    ctx.beginPath();
    ctx.moveTo(x, y + staveSpace);
    ctx.lineTo(x, y + 1);
    ctx.lineTo(x + width, y - staveSpace);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x, y + staveSpace);
    ctx.closePath();
    if (fill) {
        ctx.fill();
    }
    else {
        ctx.stroke();
    }
    if (Tables.durationToFraction(duration).equals(0.5)) {
        const breve_lines = [-3, -1, width + 1, width + 3];
        for (let i = 0; i < breve_lines.length; i++) {
            ctx.beginPath();
            ctx.moveTo(x + breve_lines[i], y - 10);
            ctx.lineTo(x + breve_lines[i], y + 11);
            ctx.stroke();
        }
    }
    ctx.restore();
}
/**
 * `NoteHeads` are typically not manipulated
 * directly, but used internally in `StaveNote`.
 *
 * See `tests/notehead_tests.ts` for usage examples.
 */
class NoteHead extends Note {
    static get CATEGORY() {
        return "NoteHead" /* Category.NoteHead */;
    }
    constructor(noteStruct) {
        super(noteStruct);
        this.custom_glyph = false;
        this.stem_up_x_offset = 0;
        this.stem_down_x_offset = 0;
        this.index = noteStruct.index;
        this.x = noteStruct.x || 0;
        this.y = noteStruct.y || 0;
        if (noteStruct.note_type)
            this.noteType = noteStruct.note_type;
        this.displaced = noteStruct.displaced || false;
        this.stem_direction = noteStruct.stem_direction || Stem.UP;
        this.line = noteStruct.line || 0;
        // Get glyph code based on duration and note type. This could be
        // regular notes, rests, or other custom codes.
        this.glyphProps = Tables.getGlyphProps(this.duration, this.noteType);
        defined(this.glyphProps, 'BadArguments', `No glyph found for duration '${this.duration}' and type '${this.noteType}'`);
        // Swap out the glyph with ledger lines
        if ((this.line > 5 || this.line < 0) && this.glyphProps.ledger_code_head) {
            this.glyphProps.code_head = this.glyphProps.ledger_code_head;
        }
        this.glyph_code = this.glyphProps.code_head;
        this.x_shift = noteStruct.x_shift || 0;
        if (noteStruct.custom_glyph_code) {
            this.custom_glyph = true;
            this.glyph_code = noteStruct.custom_glyph_code;
            this.stem_up_x_offset = noteStruct.stem_up_x_offset || 0;
            this.stem_down_x_offset = noteStruct.stem_down_x_offset || 0;
        }
        this.setStyle(noteStruct.style);
        this.slashed = noteStruct.slashed || false;
        this.render_options = Object.assign(Object.assign({}, this.render_options), { 
            // font size for note heads
            glyph_font_scale: noteStruct.glyph_font_scale || Tables.NOTATION_FONT_SCALE });
        this.setWidth(this.custom_glyph &&
            !this.glyph_code.startsWith('noteheadSlashed') &&
            !this.glyph_code.startsWith('noteheadCircled')
            ? Glyph.getWidth(this.glyph_code, this.render_options.glyph_font_scale)
            : this.glyphProps.getWidth(this.render_options.glyph_font_scale));
    }
    /** Get the width of the notehead. */
    getWidth() {
        return this.width;
    }
    /** Determine if the notehead is displaced. */
    isDisplaced() {
        return this.displaced === true;
    }
    /** Set the X coordinate. */
    setX(x) {
        this.x = x;
        return this;
    }
    /** Get the Y coordinate. */
    getY() {
        return this.y;
    }
    /** Set the Y coordinate. */
    setY(y) {
        this.y = y;
        return this;
    }
    /** Get the stave line the notehead is placed on. */
    getLine() {
        return this.line;
    }
    /** Set the stave line the notehead is placed on. */
    setLine(line) {
        this.line = line;
        return this;
    }
    /** Get the canvas `x` coordinate position of the notehead. */
    getAbsoluteX() {
        // If the note has not been preformatted, then get the static x value
        // Otherwise, it's been formatted and we should use it's x value relative
        // to its tick context
        const x = !this.preFormatted ? this.x : super.getAbsoluteX();
        // For a more natural displaced notehead, we adjust the displacement amount
        // by half the stem width in order to maintain a slight overlap with the stem
        const displacementStemAdjustment = Stem.WIDTH / 2;
        const musicFont = Tables.currentMusicFont();
        const fontShift = musicFont.lookupMetric('notehead.shiftX', 0) * this.stem_direction;
        const displacedFontShift = musicFont.lookupMetric('noteHead.displacedShiftX', 0) * this.stem_direction;
        return (x +
            fontShift +
            (this.displaced ? (this.width - displacementStemAdjustment) * this.stem_direction + displacedFontShift : 0));
    }
    /** Get the `BoundingBox` for the `NoteHead`. */
    getBoundingBox() {
        const spacing = this.checkStave().getSpacingBetweenLines();
        const half_spacing = spacing / 2;
        const min_y = this.y - half_spacing;
        return new BoundingBox(this.getAbsoluteX(), min_y, this.width, spacing);
    }
    /** Set notehead to a provided `stave`. */
    setStave(stave) {
        const line = this.getLine();
        this.stave = stave;
        if (this.stave) {
            this.setY(this.stave.getYForNote(line));
            this.setContext(this.stave.getContext());
        }
        return this;
    }
    /** Pre-render formatting. */
    preFormat() {
        if (this.preFormatted)
            return this;
        const width = this.getWidth() + this.leftDisplacedHeadPx + this.rightDisplacedHeadPx;
        this.setWidth(width);
        this.preFormatted = true;
        return this;
    }
    /** Draw the notehead. */
    draw() {
        const ctx = this.checkContext();
        this.setRendered();
        let head_x = this.getAbsoluteX();
        if (this.custom_glyph) {
            // head_x += this.x_shift;
            head_x +=
                this.stem_direction === Stem.UP
                    ? this.stem_up_x_offset +
                        (this.glyphProps.stem ? this.glyphProps.getWidth(this.render_options.glyph_font_scale) - this.width : 0)
                    : this.stem_down_x_offset;
        }
        const y = this.y;
        L("Drawing note head '", this.noteType, this.duration, "' at", head_x, y);
        // Begin and end positions for head.
        const stem_direction = this.stem_direction;
        const glyph_font_scale = this.render_options.glyph_font_scale;
        const categorySuffix = `${this.glyph_code}Stem${stem_direction === Stem.UP ? 'Up' : 'Down'}`;
        if (this.noteType === 's') {
            const staveSpace = this.checkStave().getSpacingBetweenLines();
            drawSlashNoteHead(ctx, this.duration, head_x, y, stem_direction, staveSpace);
        }
        else {
            Glyph.renderGlyph(ctx, head_x, y, glyph_font_scale, this.glyph_code, {
                category: `noteHead.${categorySuffix}`,
            });
        }
    }
}
/** To enable logging for this class. Set `Vex.Flow.NoteHead.DEBUG` to `true`. */
NoteHead.DEBUG = false;
export { NoteHead };
