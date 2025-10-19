// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// @author Mohit Cheppudira
// MIT License
import { Accidental } from './accidental';
import { Annotation, AnnotationHorizontalJustify, AnnotationVerticalJustify } from './annotation';
import { Articulation } from './articulation';
import { BarNote } from './barnote';
import { Beam } from './beam';
import { ChordSymbol } from './chordsymbol';
import { ClefNote } from './clefnote';
import { Curve } from './curve';
import { EasyScore } from './easyscore';
import { Element } from './element';
import { Formatter } from './formatter';
import { FretHandFinger } from './frethandfinger';
import { GhostNote } from './ghostnote';
import { GlyphNote } from './glyphnote';
import { GraceNote } from './gracenote';
import { GraceNoteGroup } from './gracenotegroup';
import { KeySigNote } from './keysignote';
import { ModifierContext } from './modifiercontext';
import { MultiMeasureRest } from './multimeasurerest';
import { NoteSubGroup } from './notesubgroup';
import { Ornament } from './ornament';
import { PedalMarking } from './pedalmarking';
import { Renderer } from './renderer';
import { RepeatNote } from './repeatnote';
import { Stave } from './stave';
import { StaveConnector } from './staveconnector';
import { StaveLine } from './staveline';
import { StaveNote } from './stavenote';
import { StaveTie } from './stavetie';
import { StringNumber } from './stringnumber';
import { System } from './system';
import { TabNote } from './tabnote';
import { TabStave } from './tabstave';
import { ChordStave } from './chordstave';
import { TextBracket } from './textbracket';
import { TextDynamics } from './textdynamics';
import { TextNote } from './textnote';
import { TickContext } from './tickcontext';
import { TimeSigNote } from './timesignote';
import { Tuplet } from './tuplet';
import { defined, log, RuntimeError } from './util';
import { VibratoBracket } from './vibratobracket';
import { Voice } from './voice';
import { isHTMLCanvas } from './web';
// eslint-disable-next-line
function L(...args) {
    if (Factory.DEBUG)
        log('Vex.Flow.Factory', args);
}
/**
 * Factory implements a high level API around VexFlow.
 */
class Factory {
    /**
     * Static simplified function to access constructor without providing FactoryOptions
     *
     * Example:
     *
     * Create an SVG renderer and attach it to the DIV element named "boo" to render using <page-width> 1200 and <page-height> 600
     *
     * `const vf: Factory = Vex.Flow.Factory.newFromElementId('boo', 1200, 600 );`
     */
    static newFromElementId(elementId, width = 500, height = 200) {
        return new Factory({ renderer: { elementId, width, height } });
    }
    /**
     * Example:
     *
     * Create an SVG renderer and attach it to the DIV element named "boo" to render using <page-width> 1200 and <page-height> 600
     *
     * `const vf: Factory = new Vex.Flow.Factory({renderer: { elementId: 'boo', width: 1200, height: 600 }});`
     */
    constructor(options = {}) {
        L('New factory: ', options);
        this.options = {
            stave: {
                space: 10,
            },
            renderer: {
                elementId: '',
                width: 500,
                height: 200,
                background: '#FFF',
            },
            font: Factory.TEXT_FONT,
        };
        this.setOptions(options);
    }
    reset() {
        this.renderQ = [];
        this.systems = [];
        this.staves = [];
        this.voices = [];
        this.stave = undefined; // current stave
    }
    setOptions(options) {
        this.options = Object.assign(Object.assign({}, this.options), options);
        this.initRenderer();
        this.reset();
    }
    initRenderer() {
        const { elementId, width, height, background } = this.options.renderer;
        if (elementId == null) {
            return;
        }
        if (elementId == '') {
            L(this);
            throw new RuntimeError('renderer.elementId not set in FactoryOptions');
        }
        let backend = this.options.renderer.backend;
        if (backend === undefined) {
            const elem = document.getElementById(elementId);
            // We use a custom type check here, because node-canvas mimics canvas,
            // but is not an instance of window.HTMLCanvasElement.
            // In fact, `window` might be undefined here.
            // See: https://www.npmjs.com/package/canvas
            if (isHTMLCanvas(elem)) {
                backend = Renderer.Backends.CANVAS;
            }
            else {
                backend = Renderer.Backends.SVG;
            }
        }
        this.context = Renderer.buildContext(elementId, backend, width, height, background);
    }
    getContext() {
        return this.context;
    }
    setContext(context) {
        this.context = context;
        return this;
    }
    getStave() {
        return this.stave;
    }
    getVoices() {
        return this.voices;
    }
    /** Return pixels from current stave spacing. */
    Stave(params) {
        const staveSpace = this.options.stave.space;
        const p = Object.assign({ x: 0, y: 0, width: this.options.renderer.width - staveSpace * 1.0, options: { spacing_between_lines_px: staveSpace * 1.0 } }, params);
        const stave = new Stave(p.x, p.y, p.width, p.options);
        this.staves.push(stave);
        stave.setContext(this.context);
        this.stave = stave;
        return stave;
    }
    TabStave(params) {
        const staveSpace = this.options.stave.space;
        const p = Object.assign({ x: 0, y: 0, width: this.options.renderer.width - staveSpace * 1.0, options: { spacing_between_lines_px: staveSpace * 1.3 } }, params);
        const stave = new TabStave(p.x, p.y, p.width, p.options);
        this.staves.push(stave);
        stave.setContext(this.context);
        this.stave = stave;
        return stave;
    }
    ChordStave(params) {
        const staveSpace = this.options.stave.space;
        const p = Object.assign({ x: 0, y: 0, width: this.options.renderer.width - staveSpace * 1.0, options: { spacing_between_lines_px: staveSpace * 1.0 } }, params);
        const chordStave = new ChordStave(p.x, p.y, p.width, p.options);
        // Note: ChordStave is not added to this.staves array since it's not a Stave
        // It's a separate, independent element for chord symbols only
        chordStave.setContext(this.context);
        this.renderQ.push(chordStave); // Add to renderQ so it gets drawn if needed
        return chordStave;
    }
    StaveNote(noteStruct) {
        const note = new StaveNote(noteStruct);
        if (this.stave)
            note.setStave(this.stave);
        note.setContext(this.context);
        this.renderQ.push(note);
        return note;
    }
    GlyphNote(glyph, noteStruct, options) {
        const note = new GlyphNote(glyph, noteStruct, options);
        if (this.stave)
            note.setStave(this.stave);
        note.setContext(this.context);
        this.renderQ.push(note);
        return note;
    }
    RepeatNote(type, noteStruct, options) {
        const note = new RepeatNote(type, noteStruct, options);
        if (this.stave)
            note.setStave(this.stave);
        note.setContext(this.context);
        this.renderQ.push(note);
        return note;
    }
    GhostNote(noteStruct) {
        const ghostNote = new GhostNote(noteStruct);
        if (this.stave)
            ghostNote.setStave(this.stave);
        ghostNote.setContext(this.context);
        this.renderQ.push(ghostNote);
        return ghostNote;
    }
    TextNote(noteStruct) {
        const textNote = new TextNote(noteStruct);
        if (this.stave)
            textNote.setStave(this.stave);
        textNote.setContext(this.context);
        this.renderQ.push(textNote);
        return textNote;
    }
    BarNote(params = {}) {
        const barNote = new BarNote(params.type);
        if (this.stave)
            barNote.setStave(this.stave);
        barNote.setContext(this.context);
        this.renderQ.push(barNote);
        return barNote;
    }
    ClefNote(params) {
        const p = Object.assign({ type: 'treble', options: {
                size: 'default',
                annotation: undefined,
            } }, params);
        const clefNote = new ClefNote(p.type, p.options.size, p.options.annotation);
        if (this.stave)
            clefNote.setStave(this.stave);
        clefNote.setContext(this.context);
        this.renderQ.push(clefNote);
        return clefNote;
    }
    TimeSigNote(params) {
        const p = Object.assign({ time: '4/4' }, params);
        const timeSigNote = new TimeSigNote(p.time);
        if (this.stave)
            timeSigNote.setStave(this.stave);
        timeSigNote.setContext(this.context);
        this.renderQ.push(timeSigNote);
        return timeSigNote;
    }
    KeySigNote(params) {
        const keySigNote = new KeySigNote(params.key, params.cancelKey, params.alterKey);
        if (this.stave)
            keySigNote.setStave(this.stave);
        keySigNote.setContext(this.context);
        this.renderQ.push(keySigNote);
        return keySigNote;
    }
    TabNote(noteStruct) {
        const note = new TabNote(noteStruct);
        if (this.stave)
            note.setStave(this.stave);
        note.setContext(this.context);
        this.renderQ.push(note);
        return note;
    }
    GraceNote(noteStruct) {
        const note = new GraceNote(noteStruct);
        if (this.stave)
            note.setStave(this.stave);
        note.setContext(this.context);
        return note;
    }
    GraceNoteGroup(params) {
        const group = new GraceNoteGroup(params.notes, params.slur);
        group.setContext(this.context);
        return group;
    }
    Accidental(params) {
        const accid = new Accidental(params.type);
        accid.setContext(this.context);
        return accid;
    }
    Annotation(params) {
        const p = Object.assign({ text: 'p', hJustify: AnnotationHorizontalJustify.CENTER, vJustify: AnnotationVerticalJustify.BOTTOM }, params);
        const annotation = new Annotation(p.text);
        annotation.setJustification(p.hJustify);
        annotation.setVerticalJustification(p.vJustify);
        annotation.setFont(p.font);
        annotation.setContext(this.context);
        return annotation;
    }
    ChordSymbol(params) {
        const p = Object.assign({ vJustify: 'top', hJustify: 'center', kerning: true, reportWidth: true }, params);
        const chordSymbol = new ChordSymbol();
        chordSymbol.setHorizontal(p.hJustify);
        chordSymbol.setVertical(p.vJustify);
        chordSymbol.setEnableKerning(p.kerning);
        chordSymbol.setReportWidth(p.reportWidth);
        // There is a default font based on the engraving font.  Only set then
        // font if it is specific, else use the default
        if (typeof p.fontFamily === 'string' && typeof p.fontSize === 'number') {
            if (typeof p.fontWeight === 'string')
                chordSymbol.setFont(p.fontFamily, p.fontSize, p.fontWeight);
            else
                chordSymbol.setFont(p.fontFamily, p.fontSize, '');
        }
        else if (typeof p.fontSize === 'number') {
            chordSymbol.setFontSize(p.fontSize);
        }
        chordSymbol.setContext(this.context);
        return chordSymbol;
    }
    Articulation(params) {
        var _a;
        const articulation = new Articulation((_a = params === null || params === void 0 ? void 0 : params.type) !== null && _a !== void 0 ? _a : 'a.');
        if ((params === null || params === void 0 ? void 0 : params.position) != undefined)
            articulation.setPosition(params.position);
        if ((params === null || params === void 0 ? void 0 : params.betweenLines) != undefined)
            articulation.setBetweenLines(params.betweenLines);
        articulation.setContext(this.context);
        return articulation;
    }
    Ornament(type, params) {
        const options = Object.assign({ type, position: 0, accidental: '' }, params);
        const ornament = new Ornament(type);
        ornament.setPosition(options.position);
        if (options.upperAccidental) {
            ornament.setUpperAccidental(options.upperAccidental);
        }
        if (options.lowerAccidental) {
            ornament.setLowerAccidental(options.lowerAccidental);
        }
        if (typeof options.delayed !== 'undefined') {
            ornament.setDelayed(options.delayed);
        }
        ornament.setContext(this.context);
        return ornament;
    }
    TextDynamics(params) {
        const p = Object.assign({ text: 'p', duration: 'q', dots: 0, line: 0 }, params);
        const text = new TextDynamics({
            text: p.text,
            line: p.line,
            duration: p.duration,
            dots: p.dots,
        });
        if (this.stave)
            text.setStave(this.stave);
        text.setContext(this.context);
        this.renderQ.push(text);
        return text;
    }
    Fingering(params) {
        const p = Object.assign({ number: '0', position: 'left' }, params);
        const fingering = new FretHandFinger(p.number);
        fingering.setPosition(p.position);
        fingering.setContext(this.context);
        return fingering;
    }
    StringNumber(params, drawCircle = true) {
        const stringNumber = new StringNumber(params.number);
        stringNumber.setPosition(params.position);
        stringNumber.setContext(this.context);
        stringNumber.setDrawCircle(drawCircle);
        return stringNumber;
    }
    TickContext() {
        return new TickContext();
    }
    ModifierContext() {
        return new ModifierContext();
    }
    MultiMeasureRest(params) {
        const numMeasures = defined(params.number_of_measures, 'NoNumberOfMeasures');
        const multiMeasureRest = new MultiMeasureRest(numMeasures, params);
        multiMeasureRest.setContext(this.context);
        this.renderQ.push(multiMeasureRest);
        return multiMeasureRest;
    }
    Voice(params) {
        const p = Object.assign({ time: '4/4' }, params);
        const voice = new Voice(p.time);
        this.voices.push(voice);
        return voice;
    }
    StaveConnector(params) {
        const connector = new StaveConnector(params.top_stave, params.bottom_stave);
        connector.setType(params.type).setContext(this.context);
        this.renderQ.push(connector);
        return connector;
    }
    Formatter(options) {
        return new Formatter(options);
    }
    Tuplet(params) {
        const p = Object.assign({ notes: [], options: {} }, params);
        const tuplet = new Tuplet(p.notes, p.options).setContext(this.context);
        this.renderQ.push(tuplet);
        return tuplet;
    }
    Beam(params) {
        var _a, _b, _c, _d, _e;
        const beam = new Beam(params.notes, (_a = params.options) === null || _a === void 0 ? void 0 : _a.autoStem).setContext(this.context);
        beam.breakSecondaryAt((_c = (_b = params.options) === null || _b === void 0 ? void 0 : _b.secondaryBeamBreaks) !== null && _c !== void 0 ? _c : []);
        if ((_d = params.options) === null || _d === void 0 ? void 0 : _d.partialBeamDirections) {
            Object.entries((_e = params.options) === null || _e === void 0 ? void 0 : _e.partialBeamDirections).forEach(([noteIndex, direction]) => {
                beam.setPartialBeamSideAt(Number(noteIndex), direction);
            });
        }
        this.renderQ.push(beam);
        return beam;
    }
    Curve(params) {
        const curve = new Curve(params.from, params.to, params.options).setContext(this.context);
        this.renderQ.push(curve);
        return curve;
    }
    StaveTie(params) {
        var _a;
        const tie = new StaveTie({
            first_note: params.from,
            last_note: params.to,
            first_indices: params.first_indices,
            last_indices: params.last_indices,
        }, params.text);
        if ((_a = params.options) === null || _a === void 0 ? void 0 : _a.direction)
            tie.setDirection(params.options.direction);
        tie.setContext(this.context);
        this.renderQ.push(tie);
        return tie;
    }
    StaveLine(params) {
        var _a, _b;
        const line = new StaveLine({
            first_note: params.from,
            last_note: params.to,
            first_indices: params.first_indices,
            last_indices: params.last_indices,
        });
        if ((_a = params.options) === null || _a === void 0 ? void 0 : _a.text)
            line.setText(params.options.text);
        if ((_b = params.options) === null || _b === void 0 ? void 0 : _b.font)
            line.setFont(params.options.font);
        line.setContext(this.context);
        this.renderQ.push(line);
        return line;
    }
    VibratoBracket(params) {
        const vibratoBracket = new VibratoBracket({
            start: params.from,
            stop: params.to,
        });
        if (params.options.line)
            vibratoBracket.setLine(params.options.line);
        if (params.options.harsh)
            vibratoBracket.setHarsh(params.options.harsh);
        vibratoBracket.setContext(this.context);
        this.renderQ.push(vibratoBracket);
        return vibratoBracket;
    }
    TextBracket(params) {
        const textBracket = new TextBracket({
            start: params.from,
            stop: params.to,
            text: params.text,
            superscript: params.options.superscript,
            position: params.options.position,
        });
        if (params.options.line)
            textBracket.setLine(params.options.line);
        if (params.options.font)
            textBracket.setFont(params.options.font);
        textBracket.setContext(this.context);
        this.renderQ.push(textBracket);
        return textBracket;
    }
    System(params = {}) {
        params.factory = this;
        const system = new System(params).setContext(this.context);
        this.systems.push(system);
        return system;
    }
    /**
     * Creates EasyScore. Normally the first step after constructing a Factory. For example:
     * ```
     * const vf: Factory = new Vex.Flow.Factory({renderer: { elementId: 'boo', width: 1200, height: 600 }});
     * const score: EasyScore = vf.EasyScore();
     * ```
     * @param options.factory optional instance of Factory
     * @param options.builder instance of Builder
     * @param options.commitHooks function to call after a note element is created
     * @param options.throwOnError throw error in case of parsing error
     */
    EasyScore(options = {}) {
        options.factory = this;
        return new EasyScore(options);
    }
    PedalMarking(params) {
        const p = Object.assign({ notes: [], options: {
                style: 'mixed',
            } }, params);
        const pedal = new PedalMarking(p.notes);
        pedal.setType(PedalMarking.typeString[p.options.style]);
        pedal.setContext(this.context);
        this.renderQ.push(pedal);
        return pedal;
    }
    NoteSubGroup(params) {
        const p = Object.assign({ notes: [] }, params);
        const group = new NoteSubGroup(p.notes);
        group.setContext(this.context);
        return group;
    }
    /** Render the score. */
    draw() {
        const ctx = this.context;
        this.systems.forEach((s) => s.setContext(ctx).format());
        this.staves.forEach((s) => s.setContext(ctx).draw());
        this.voices.forEach((v) => v.setContext(ctx).draw());
        this.renderQ.forEach((e) => {
            if (!e.isRendered())
                e.setContext(ctx).draw();
        });
        this.systems.forEach((s) => s.setContext(ctx).draw());
        this.reset();
    }
}
/** To enable logging for this class. Set `Vex.Flow.Factory.DEBUG` to `true`. */
Factory.DEBUG = false;
/** Default text font. */
Factory.TEXT_FONT = Object.assign({}, Element.TEXT_FONT);
export { Factory };
