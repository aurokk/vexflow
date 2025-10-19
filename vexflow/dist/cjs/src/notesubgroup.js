// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author Taehoon Moon 2016
//
// ## Description
//
// This file implements `NoteSubGroup` which is used to format and
// render notes as a `Modifier`
// ex) ClefNote, TimeSigNote and BarNote.
import { Formatter } from './formatter';
import { Modifier } from './modifier';
import { Tables } from './tables';
import { Voice } from './voice';
export class NoteSubGroup extends Modifier {
    static get CATEGORY() {
        return "NoteSubGroup" /* Category.NoteSubGroup */;
    }
    // Arrange groups inside a `ModifierContext`
    static format(groups, state) {
        if (!groups || groups.length === 0)
            return false;
        let width = 0;
        for (let i = 0; i < groups.length; ++i) {
            const group = groups[i];
            group.preFormat();
            width += group.getWidth();
        }
        state.left_shift += width;
        return true;
    }
    constructor(subNotes) {
        super();
        this.preFormatted = false;
        this.position = Modifier.Position.LEFT;
        this.subNotes = subNotes;
        this.subNotes.forEach((subNote) => {
            subNote.setIgnoreTicks(false);
        });
        this.width = 0;
        this.formatter = new Formatter();
        this.voice = new Voice({
            num_beats: 4,
            beat_value: 4,
            resolution: Tables.RESOLUTION,
        }).setStrict(false);
        this.voice.addTickables(this.subNotes);
    }
    preFormat() {
        if (this.preFormatted)
            return;
        this.formatter.joinVoices([this.voice]).format([this.voice], 0);
        this.setWidth(this.formatter.getMinTotalWidth());
        this.preFormatted = true;
    }
    setWidth(width) {
        this.width = width;
        return this;
    }
    getWidth() {
        return this.width;
    }
    draw() {
        const ctx = this.checkContext();
        const note = this.checkAttachedNote();
        this.setRendered();
        this.alignSubNotesWithNote(this.subNotes, note); // Modifier function
        this.subNotes.forEach((subNote) => subNote.setContext(ctx).drawWithStyle());
    }
}
