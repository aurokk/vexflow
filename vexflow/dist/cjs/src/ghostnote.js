// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
import { StemmableNote } from './stemmablenote';
import { isAnnotation } from './typeguard';
import { RuntimeError } from './util';
const ERROR_MSG = 'Ghost note must have valid initialization data to identify duration.';
export class GhostNote extends StemmableNote {
    static get CATEGORY() {
        return "GhostNote" /* Category.GhostNote */;
    }
    constructor(parameter) {
        if (!parameter) {
            throw new RuntimeError('BadArguments', ERROR_MSG);
        }
        let noteStruct;
        if (typeof parameter === 'string') {
            // Preserve backwards-compatibility
            noteStruct = { duration: parameter };
        }
        else if (typeof parameter === 'object') {
            noteStruct = parameter;
        }
        else {
            throw new RuntimeError('BadArguments', ERROR_MSG);
        }
        super(noteStruct);
        // Note properties
        this.setWidth(0);
    }
    /**
     * @returns true if this note is a type of rest. Rests don't have pitches, but take up space in the score.
     */
    isRest() {
        return true;
    }
    setStave(stave) {
        super.setStave(stave);
        return this;
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
        // Draw Annotations
        this.setRendered();
        for (let i = 0; i < this.modifiers.length; ++i) {
            const modifier = this.modifiers[i];
            if (isAnnotation(modifier)) {
                modifier.setContext(this.getContext());
                modifier.drawWithStyle();
            }
        }
    }
}
