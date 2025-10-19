// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna Cheppudira 2013.
// Co-author: Benjamin W. Bohl
// MIT License
import { Glyph } from './glyph';
import { StaveModifier, StaveModifierPosition } from './stavemodifier';
import { Tables } from './tables';
import { defined, log } from './util';
// eslint-disable-next-line
function L(...args) {
    if (Clef.DEBUG)
        log('Vex.Flow.Clef', args);
}
/**
 * Clef implements various types of clefs that can be rendered on a stave.
 *
 * See `tests/clef_tests.ts` for usage examples.
 */
class Clef extends StaveModifier {
    static get CATEGORY() {
        return "Clef" /* Category.Clef */;
    }
    /**
     * Every clef name is associated with a glyph code from the font file
     * and a default stave line number.
     */
    static get types() {
        return {
            treble: {
                code: 'gClef',
                line: 3,
            },
            bass: {
                code: 'fClef',
                line: 1,
            },
            alto: {
                code: 'cClef',
                line: 2,
            },
            tenor: {
                code: 'cClef',
                line: 1,
            },
            percussion: {
                code: 'unpitchedPercussionClef1',
                line: 2,
            },
            soprano: {
                code: 'cClef',
                line: 4,
            },
            'mezzo-soprano': {
                code: 'cClef',
                line: 3,
            },
            'baritone-c': {
                code: 'cClef',
                line: 0,
            },
            'baritone-f': {
                code: 'fClef',
                line: 2,
            },
            subbass: {
                code: 'fClef',
                line: 0,
            },
            french: {
                code: 'gClef',
                line: 4,
            },
            tab: {
                code: '6stringTabClef',
                line: 2.5,
            },
        };
    }
    static get annotationSmufl() {
        return {
            '8va': 'timeSig8',
            '8vb': 'timeSig8',
        };
    }
    /** Create a new clef. */
    constructor(type, size, annotation) {
        super();
        /**
         * The attribute `clef` must be a key from
         * `Clef.types`
         */
        this.clef = Clef.types['treble'];
        this.setPosition(StaveModifierPosition.BEGIN);
        this.setType(type, size, annotation);
        this.setWidth(Glyph.getWidth(this.clef.code, Clef.getPoint(this.size), `clef_${this.size}`));
        L('Creating clef:', type);
    }
    /** Set clef type, size and annotation. */
    setType(type, size, annotation) {
        this.type = type;
        this.clef = Clef.types[type];
        if (size === undefined) {
            this.size = 'default';
        }
        else {
            this.size = size;
        }
        const musicFont = Tables.currentMusicFont();
        // If an annotation, such as 8va, is specified, add it to the Clef object.
        if (annotation !== undefined) {
            const code = Clef.annotationSmufl[annotation];
            const point = (Clef.getPoint(this.size) / 5) * 3;
            const line = musicFont.lookupMetric(`clef_${this.size}.annotations.${annotation}.${this.type}.line`);
            const x_shift = musicFont.lookupMetric(`clef_${this.size}.annotations.${annotation}.${this.type}.shiftX`);
            this.annotation = { code, point, line, x_shift };
            this.attachment = new Glyph(this.annotation.code, this.annotation.point);
            this.attachment.metrics.x_max = 0;
            this.attachment.setXShift(this.annotation.x_shift);
        }
        else {
            this.annotation = undefined;
        }
        return this;
    }
    /** Get clef width. */
    getWidth() {
        if (this.type === 'tab') {
            defined(this.stave, 'ClefError', "Can't get width without stave.");
        }
        return this.width;
    }
    /** Get point for clefs. */
    static getPoint(size) {
        // for sizes other than 'default', clef is 2/3 of the default value
        return size == 'default' ? Tables.NOTATION_FONT_SCALE : (Tables.NOTATION_FONT_SCALE / 3) * 2;
    }
    /** Set associated stave. */
    setStave(stave) {
        this.stave = stave;
        return this;
    }
    /** Render clef. */
    draw() {
        const stave = this.checkStave();
        const ctx = stave.checkContext();
        this.setRendered();
        this.applyStyle(ctx);
        ctx.openGroup('clef', this.getAttribute('id'));
        Glyph.renderGlyph(ctx, this.x, stave.getYForLine(this.clef.line), Clef.getPoint(this.size), this.clef.code, {
            category: `clef_${this.size}`,
        });
        if (this.annotation !== undefined && this.attachment !== undefined) {
            this.placeGlyphOnLine(this.attachment, stave, this.annotation.line);
            this.attachment.setStave(stave);
            this.attachment.setContext(ctx);
            this.attachment.renderToStave(this.x);
        }
        ctx.closeGroup();
        this.restoreStyle(ctx);
    }
}
/** To enable logging for this class, set `Vex.Flow.Clef.DEBUG` to `true`. */
Clef.DEBUG = false;
export { Clef };
