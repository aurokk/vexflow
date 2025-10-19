// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
//
// This class implements various types of members to notes (e.g. bends,
// fingering positions etc.).  The ModifierContext works with tickables
// that are at the same tick to ensure that they and their modifiers
// all have proper alignment.  (Note that the ModifierContext also
// runs the spacing of the tickable).
//
// see https://github.com/0xfe/vexflow/wiki/How-Formatting-Works
import { Accidental } from './accidental';
import { Annotation } from './annotation';
import { Articulation } from './articulation';
import { Bend } from './bend';
import { ChordSymbol } from './chordsymbol';
import { Dot } from './dot';
import { FretHandFinger } from './frethandfinger';
import { GraceNoteGroup } from './gracenotegroup';
import { NoteSubGroup } from './notesubgroup';
import { Ornament } from './ornament';
import { Parenthesis } from './parenthesis';
import { StaveNote } from './stavenote';
import { StringNumber } from './stringnumber';
import { Stroke } from './strokes';
import { log, RuntimeError } from './util';
import { Vibrato } from './vibrato';
// To enable logging for this class. Set `Vex.Flow.ModifierContext.DEBUG` to `true`.
// eslint-disable-next-line
function L(...args) {
    if (ModifierContext.DEBUG)
        log('Vex.Flow.ModifierContext', args);
}
class ModifierContext {
    constructor() {
        // Formatting data.
        this.state = {
            left_shift: 0,
            right_shift: 0,
            text_line: 0,
            top_text_line: 0,
        };
        // Current members -- a mapping of Category (string) to a list of Tickables, Modifiers,
        // StaveNotes, TabNotes, etc.
        this.members = {};
        this.preFormatted = false;
        this.postFormatted = false;
        this.formatted = false;
        this.width = 0;
        this.spacing = 0;
    }
    addModifier(member) {
        L('addModifier is deprecated, use addMember instead.');
        return this.addMember(member);
    }
    /**
     * this.members maps CATEGORY strings to arrays of Tickable | Modifier | StaveNote | TabNote.
     * Here we add a new member to this.members, and create a new array if needed.
     * @param member
     * @returns this
     */
    addMember(member) {
        const category = member.getCategory();
        if (!this.members[category]) {
            this.members[category] = [];
        }
        this.members[category].push(member);
        member.setModifierContext(this);
        this.preFormatted = false;
        return this;
    }
    /**
     * @deprecated
     */
    getModifiers(category) {
        L('getModifiers is deprecated, use getMembers instead.');
        return this.getMembers(category);
    }
    getMembers(category) {
        var _a;
        return (_a = this.members[category]) !== null && _a !== void 0 ? _a : [];
    }
    /**
     * Get the width of the entire
     */
    getWidth() {
        return this.width;
    }
    getLeftShift() {
        return this.state.left_shift;
    }
    getRightShift() {
        return this.state.right_shift;
    }
    getState() {
        return this.state;
    }
    getMetrics() {
        if (!this.formatted) {
            throw new RuntimeError('UnformattedMember', 'Unformatted member has no metrics.');
        }
        return {
            width: this.state.left_shift + this.state.right_shift + this.spacing,
            spacing: this.spacing,
        };
    }
    preFormat() {
        if (this.preFormatted)
            return;
        L('Preformatting ModifierContext');
        const state = this.state;
        const members = this.members;
        // The ordering below determines when different members are formatted and rendered.
        StaveNote.format(members["StaveNote" /* Category.StaveNote */], state);
        Parenthesis.format(members["Parenthesis" /* Category.Parenthesis */], state);
        Dot.format(members["Dot" /* Category.Dot */], state);
        FretHandFinger.format(members["FretHandFinger" /* Category.FretHandFinger */], state);
        Accidental.format(members["Accidental" /* Category.Accidental */], state);
        Stroke.format(members["Stroke" /* Category.Stroke */], state);
        GraceNoteGroup.format(members["GraceNoteGroup" /* Category.GraceNoteGroup */], state);
        NoteSubGroup.format(members["NoteSubGroup" /* Category.NoteSubGroup */], state);
        StringNumber.format(members["StringNumber" /* Category.StringNumber */], state);
        Articulation.format(members["Articulation" /* Category.Articulation */], state);
        Ornament.format(members["Ornament" /* Category.Ornament */], state);
        Annotation.format(members["Annotation" /* Category.Annotation */], state);
        ChordSymbol.format(members["ChordSymbol" /* Category.ChordSymbol */], state);
        Bend.format(members["Bend" /* Category.Bend */], state);
        Vibrato.format(members["Vibrato" /* Category.Vibrato */], state, this);
        // Update width of this member context
        this.width = state.left_shift + state.right_shift;
        this.preFormatted = true;
    }
    postFormat() {
        if (this.postFormatted)
            return;
        L('Postformatting ModifierContext');
        // If post-formatting is required for an element, add more lines below.
        StaveNote.postFormat(this.getMembers("StaveNote" /* Category.StaveNote */));
    }
}
ModifierContext.DEBUG = false;
export { ModifierContext };
