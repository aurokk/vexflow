// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
import { Element } from './element';
import { defined, RuntimeError } from './util';
export var ModifierPosition;
(function (ModifierPosition) {
    ModifierPosition[ModifierPosition["CENTER"] = 0] = "CENTER";
    ModifierPosition[ModifierPosition["LEFT"] = 1] = "LEFT";
    ModifierPosition[ModifierPosition["RIGHT"] = 2] = "RIGHT";
    ModifierPosition[ModifierPosition["ABOVE"] = 3] = "ABOVE";
    ModifierPosition[ModifierPosition["BELOW"] = 4] = "BELOW";
})(ModifierPosition || (ModifierPosition = {}));
// To enable logging for this class. Set `Vex.Flow.Modifier.DEBUG` to `true`.
// function L(...args) { if (Modifier.DEBUG) log('Vex.Flow.Modifier', args); }
/**
 * `Modifier` is an abstract interface for notational elements that modify
 * a `Note`. Examples of modifiers are `Accidental`, `Annotation`, `Stroke`, etc.
 *
 * For a `Modifier` instance to be positioned correctly, it must be part of
 * a `ModifierContext`. All modifiers in the same context are rendered relative to
 * one another.
 *
 * Typically, all modifiers to a note are part of the same `ModifierContext` instance. Also,
 * in multi-voice staves, all modifiers to notes on the same `tick` are part of the same
 * `ModifierContext`. This ensures that multiple voices don't trample all over each other.
 */
export class Modifier extends Element {
    /**
     * Modifiers category string. Every modifier has a different category.
     * The `ModifierContext` uses this to determine the type and order of the modifiers.
     */
    static get CATEGORY() {
        return "Modifier" /* Category.Modifier */;
    }
    /** Modifiers can be positioned almost anywhere, relative to a note. */
    static get Position() {
        return ModifierPosition;
    }
    static get PositionString() {
        return {
            center: ModifierPosition.CENTER,
            above: ModifierPosition.ABOVE,
            below: ModifierPosition.BELOW,
            left: ModifierPosition.LEFT,
            right: ModifierPosition.RIGHT,
        };
    }
    constructor() {
        super();
        this.width = 0;
        // The `text_line` is reserved space above or below a stave.
        this.text_line = 0;
        this.position = Modifier.Position.LEFT;
        this.x_shift = 0;
        this.y_shift = 0;
        this.spacingFromNextModifier = 0;
    }
    /** Called when position changes. */
    reset() {
        // DO NOTHING.
    }
    /** Get modifier widths. */
    getWidth() {
        return this.width;
    }
    /** Set modifier widths. */
    setWidth(width) {
        this.width = width;
        return this;
    }
    /** Get attached note (`StaveNote`, `TabNote`, etc.) */
    getNote() {
        return defined(this.note, 'NoNote', 'Modifier has no note.');
    }
    /**
     * Used in draw() to check and get the attached note (`StaveNote`, `TabNote`, etc.).
     * Also verifies that the index is valid.
     */
    checkAttachedNote() {
        const category = this.getCategory();
        defined(this.index, 'NoIndex', `Can't draw ${category} without an index.`);
        return defined(this.note, 'NoNote', `Can't draw ${category} without a note.`);
    }
    /**
     * Set attached note.
     * @param note (`StaveNote`, `TabNote`, etc.)
     */
    setNote(note) {
        this.note = note;
        return this;
    }
    /** Get note index, which is a specific note in a chord. */
    getIndex() {
        return this.index;
    }
    /** Check and get note index, which is a specific note in a chord. */
    checkIndex() {
        return defined(this.index, 'NoIndex', 'Modifier has an invalid index.');
    }
    /** Set note index, which is a specific note in a chord. */
    setIndex(index) {
        this.index = index;
        return this;
    }
    /** Get `ModifierContext`. */
    getModifierContext() {
        return this.modifierContext;
    }
    /** Check and get `ModifierContext`. */
    checkModifierContext() {
        return defined(this.modifierContext, 'NoModifierContext', 'Modifier Context Required');
    }
    /** Every modifier must be part of a `ModifierContext`. */
    setModifierContext(c) {
        this.modifierContext = c;
        return this;
    }
    /** Get position. */
    getPosition() {
        return this.position;
    }
    /**
     * Set position.
     * @param position CENTER | LEFT | RIGHT | ABOVE | BELOW
     */
    setPosition(position) {
        this.position = typeof position === 'string' ? Modifier.PositionString[position] : position;
        this.reset();
        return this;
    }
    /** Set the `text_line` for the modifier. */
    setTextLine(line) {
        this.text_line = line;
        return this;
    }
    /** Shift modifier down `y` pixels. Negative values shift up. */
    setYShift(y) {
        this.y_shift = y;
        return this;
    }
    /** Set spacing from next modifier. */
    setSpacingFromNextModifier(x) {
        this.spacingFromNextModifier = x;
    }
    /** Get spacing from next modifier. */
    getSpacingFromNextModifier() {
        return this.spacingFromNextModifier;
    }
    /**
     * Shift modifier `x` pixels in the direction of the modifier. Negative values
     * shift reverse.
     */
    setXShift(x) {
        this.x_shift = 0;
        if (this.position === Modifier.Position.LEFT) {
            this.x_shift -= x;
        }
        else {
            this.x_shift += x;
        }
        return this;
    }
    /** Get shift modifier `x` */
    getXShift() {
        return this.x_shift;
    }
    /** Render the modifier onto the canvas. */
    draw() {
        this.checkContext();
        throw new RuntimeError('NotImplemented', 'draw() not implemented for this modifier.');
    }
    // aligns sub notes of NoteSubGroup (or GraceNoteGroup) to the main note with correct x-offset
    alignSubNotesWithNote(subNotes, note) {
        // Shift over the tick contexts of each note
        const tickContext = note.getTickContext();
        const metrics = tickContext.getMetrics();
        const stave = note.getStave();
        const subNoteXOffset = tickContext.getX() - metrics.modLeftPx - metrics.modRightPx + this.getSpacingFromNextModifier();
        subNotes.forEach((subNote) => {
            const subTickContext = subNote.getTickContext();
            if (stave)
                subNote.setStave(stave);
            subTickContext.setXOffset(subNoteXOffset); // don't touch baseX to avoid shift each render
        });
    }
}
