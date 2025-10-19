// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
import { Element } from './element';
import { Fraction } from './fraction';
import { Tables } from './tables';
import { defined, RuntimeError } from './util';
/**
 * Tickable represents a element that sit on a score and
 * has a duration, i.e., Tickables occupy space in the musical rendering dimension.
 */
export class Tickable extends Element {
    static get CATEGORY() {
        return "Tickable" /* Category.Tickable */;
    }
    constructor() {
        super();
        this._preFormatted = false;
        this._postFormatted = false;
        // These properties represent the duration of
        // this tickable element.
        this.ticks = new Fraction(0, 1); // Fractional value of ticks
        this.intrinsicTicks = 0; // Floating point value of ticks
        this.tickMultiplier = new Fraction(1, 1);
        // Formatter metrics
        this.width = 0;
        this.x_shift = 0; // Shift from tick context
        this.modifiers = [];
        this.tupletStack = [];
        this.align_center = false;
        this.center_x_shift = 0; // Shift from tick context if center aligned
        // This flag tells the formatter to ignore this tickable during
        // formatting and justification. It is set by tickables such as BarNote.
        this.ignore_ticks = false;
        // This is a space for an external formatting class or function to maintain
        // metrics.
        this.formatterMetrics = {
            // The freedom of a tickable is the distance it can move without colliding
            // with neighboring elements. A formatter can set these values during its
            // formatting pass, which a different formatter can then use to fine tune.
            freedom: { left: 0, right: 0 },
            // The simplified rational duration of this tick as a string. It can be
            // used as an index to a map or hashtable.
            duration: '',
            // The number of formatting iterations undergone.
            iterations: 0,
            // The space in pixels allocated by this formatter, along with the mean space
            // for tickables of this duration, and the deviation from the mean.
            space: {
                used: 0,
                mean: 0,
                deviation: 0,
            },
        };
    }
    /** Reset the Tickable, this function will be overloaded. */
    reset() {
        return this;
    }
    /** Return the ticks. */
    getTicks() {
        return this.ticks;
    }
    /** Check if it ignores the ticks. */
    shouldIgnoreTicks() {
        return this.ignore_ticks;
    }
    /** Ignore the ticks. */
    setIgnoreTicks(flag) {
        this.ignore_ticks = flag;
        return this;
    }
    /** Set width of note. Used by the formatter for positioning. */
    setWidth(width) {
        this.width = width;
    }
    /** Get width of note. Used by the formatter for positioning. */
    getWidth() {
        if (!this._preFormatted) {
            throw new RuntimeError('UnformattedNote', "Can't call GetWidth on an unformatted note.");
        }
        return this.width + (this.modifierContext ? this.modifierContext.getWidth() : 0);
    }
    /** Displace note by `x` pixels. Used by the formatter. */
    setXShift(x) {
        this.x_shift = x;
        return this;
    }
    /** Get the `x` displaced pixels of the note. */
    getXShift() {
        return this.x_shift;
    }
    /** Get `x` position of this tick context. */
    getX() {
        const tickContext = this.checkTickContext(`Can't getX() without a TickContext.`);
        return tickContext.getX() + this.x_shift;
    }
    /** Return the formatterMetrics. */
    getFormatterMetrics() {
        return this.formatterMetrics;
    }
    /** Return the center `x` shift. */
    getCenterXShift() {
        if (this.isCenterAligned()) {
            return this.center_x_shift;
        }
        return 0;
    }
    /** Set the center `x` shift. */
    setCenterXShift(centerXShift) {
        this.center_x_shift = centerXShift;
        return this;
    }
    // Check if tickable is center aligned. */
    isCenterAligned() {
        return this.align_center;
    }
    // Set/unset center alignment. */
    setCenterAlignment(align_center) {
        this.align_center = align_center;
        return this;
    }
    /**
     * Return the associated voice. Every tickable must be associated with a voice.
     * This allows formatters and preFormatter to associate them with the right modifierContexts.
     */
    getVoice() {
        return defined(this.voice, 'NoVoice', 'Tickable has no voice.');
    }
    /** Set the associated voice. */
    setVoice(voice) {
        this.voice = voice;
    }
    /** Get the tuplet. */
    getTuplet() {
        return this.tuplet;
    }
    /** Return a list of Tuplets. */
    getTupletStack() {
        return this.tupletStack;
    }
    /**
     * Reset the specific Tuplet (if this is not provided, all tuplets are reset).
     * Remove any prior tuplets from the tick calculation and
     * reset the intrinsic tick value.
     */
    resetTuplet(tuplet) {
        let noteCount;
        let notesOccupied;
        if (tuplet) {
            const i = this.tupletStack.indexOf(tuplet);
            if (i !== -1) {
                this.tupletStack.splice(i, 1);
                noteCount = tuplet.getNoteCount();
                notesOccupied = tuplet.getNotesOccupied();
                // Revert old multiplier by inverting numerator & denom.:
                this.applyTickMultiplier(noteCount, notesOccupied);
            }
            return this;
        }
        while (this.tupletStack.length) {
            tuplet = this.tupletStack.pop();
            noteCount = tuplet.getNoteCount();
            notesOccupied = tuplet.getNotesOccupied();
            // Revert old multiplier by inverting numerator & denom.:
            this.applyTickMultiplier(noteCount, notesOccupied);
        }
        return this;
    }
    /** Attach to new tuplet. */
    setTuplet(tuplet) {
        if (tuplet) {
            this.tupletStack.push(tuplet);
            const noteCount = tuplet.getNoteCount();
            const notesOccupied = tuplet.getNotesOccupied();
            this.applyTickMultiplier(notesOccupied, noteCount);
        }
        this.tuplet = tuplet;
        return this;
    }
    /**
     * Add self to the provided ModifierContext `mc`.
     * If this tickable has modifiers, set modifierContext.
     * @returns this
     */
    addToModifierContext(mc) {
        this.modifierContext = mc;
        for (let i = 0; i < this.modifiers.length; ++i) {
            this.modifierContext.addMember(this.modifiers[i]);
        }
        this.modifierContext.addMember(this);
        this._preFormatted = false;
        return this;
    }
    /**
     * Optional, if tickable has modifiers, associate a Modifier.
     * @param mod the modifier
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    addModifier(modifier, index = 0) {
        this.modifiers.push(modifier);
        this._preFormatted = false;
        return this;
    }
    /** Get the list of associated modifiers. */
    getModifiers() {
        return this.modifiers;
    }
    /** Set the Tick Context. */
    setTickContext(tc) {
        this.tickContext = tc;
        this._preFormatted = false;
    }
    checkTickContext(message = 'Tickable has no tick context.') {
        return defined(this.tickContext, 'NoTickContext', message);
    }
    /** Preformat the Tickable. */
    preFormat() {
        if (this._preFormatted)
            return;
        this.width = 0;
        if (this.modifierContext) {
            this.modifierContext.preFormat();
            this.width += this.modifierContext.getWidth();
        }
    }
    /** Set preformatted status. */
    set preFormatted(value) {
        this._preFormatted = value;
    }
    get preFormatted() {
        return this._preFormatted;
    }
    /** Postformat the Tickable. */
    postFormat() {
        if (this._postFormatted)
            return this;
        this._postFormatted = true;
        return this;
    }
    /** Set postformatted status. */
    set postFormatted(value) {
        this._postFormatted = value;
    }
    get postFormatted() {
        return this._postFormatted;
    }
    /** Return the intrinsic ticks. */
    getIntrinsicTicks() {
        return this.intrinsicTicks;
    }
    /** Set the intrinsic ticks. */
    setIntrinsicTicks(intrinsicTicks) {
        this.intrinsicTicks = intrinsicTicks;
        this.ticks = this.tickMultiplier.clone().multiply(this.intrinsicTicks);
    }
    /** Get the tick multiplier. */
    getTickMultiplier() {
        return this.tickMultiplier;
    }
    /** Apply a tick multiplier. */
    applyTickMultiplier(numerator, denominator) {
        this.tickMultiplier.multiply(numerator, denominator);
        this.ticks = this.tickMultiplier.clone().multiply(this.intrinsicTicks);
    }
    /** Set the duration. */
    setDuration(duration) {
        const ticks = duration.numerator * (Tables.RESOLUTION / duration.denominator);
        this.ticks = this.tickMultiplier.clone().multiply(ticks);
        this.intrinsicTicks = this.ticks.value();
    }
    getAbsoluteX() {
        const tickContext = this.checkTickContext(`Can't getAbsoluteX() without a TickContext.`);
        return tickContext.getX();
    }
    /** Attach this note to a modifier context. */
    setModifierContext(mc) {
        this.modifierContext = mc;
        return this;
    }
    /** Get `ModifierContext`. */
    getModifierContext() {
        return this.modifierContext;
    }
    /** Check and get `ModifierContext`. */
    checkModifierContext() {
        return defined(this.modifierContext, 'NoModifierContext', 'No modifier context attached to this tickable.');
    }
}
