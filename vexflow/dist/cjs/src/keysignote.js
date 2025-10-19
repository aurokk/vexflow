// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author Mark Meeus 2019
import { KeySignature } from './keysignature';
import { Note } from './note';
export class KeySigNote extends Note {
    static get CATEGORY() {
        return "KeySigNote" /* Category.KeySigNote */;
    }
    constructor(keySpec, cancelKeySpec, alterKeySpec) {
        super({ duration: 'b' });
        this.keySignature = new KeySignature(keySpec, cancelKeySpec, alterKeySpec);
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
        this.keySignature.setStave(this.checkStave());
        this.setWidth(this.keySignature.getWidth());
        return this;
    }
    draw() {
        const ctx = this.checkStave().checkContext();
        this.setRendered();
        this.keySignature.setX(this.getAbsoluteX());
        this.keySignature.setContext(ctx);
        this.keySignature.draw();
    }
}
