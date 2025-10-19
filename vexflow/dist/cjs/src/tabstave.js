// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
import { Stave } from './stave';
export class TabStave extends Stave {
    static get CATEGORY() {
        return "TabStave" /* Category.TabStave */;
    }
    constructor(x, y, width, options) {
        const tab_options = Object.assign({ spacing_between_lines_px: 13, num_lines: 6, top_text_position: 1 }, options);
        super(x, y, width, tab_options);
    }
    getYForGlyphs() {
        return this.getYForLine(2.5);
    }
    // Deprecated
    addTabGlyph() {
        this.addClef('tab');
        return this;
    }
}
