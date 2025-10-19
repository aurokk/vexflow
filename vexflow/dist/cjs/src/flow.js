var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Accidental } from './accidental';
import { Annotation, AnnotationHorizontalJustify, AnnotationVerticalJustify } from './annotation';
import { Articulation } from './articulation';
import { BarNote } from './barnote';
import { Beam } from './beam';
import { Bend } from './bend';
import { BoundingBox } from './boundingbox';
import { BoundingBoxComputation } from './boundingboxcomputation';
import { CanvasContext } from './canvascontext';
import { ChordSymbol, ChordSymbolHorizontalJustify, ChordSymbolVerticalJustify, SymbolModifiers, SymbolTypes, } from './chordsymbol';
import { Clef } from './clef';
import { ClefNote } from './clefnote';
import { Crescendo } from './crescendo';
import { Curve, CurvePosition } from './curve';
import { Dot } from './dot';
import { EasyScore } from './easyscore';
import { Element } from './element';
import { Factory } from './factory';
import { Font, FontStyle, FontWeight } from './font';
import { Formatter } from './formatter';
import { Fraction } from './fraction';
import { FretHandFinger } from './frethandfinger';
import { GhostNote } from './ghostnote';
import { Glyph } from './glyph';
import { GlyphNote } from './glyphnote';
import { GraceNote } from './gracenote';
import { GraceNoteGroup } from './gracenotegroup';
import { GraceTabNote } from './gracetabnote';
import { KeyManager } from './keymanager';
import { KeySignature } from './keysignature';
import { KeySigNote } from './keysignote';
import { Modifier, ModifierPosition } from './modifier';
import { ModifierContext } from './modifiercontext';
import { MultiMeasureRest } from './multimeasurerest';
import { Music } from './music';
import { Note } from './note';
import { NoteHead } from './notehead';
import { NoteSubGroup } from './notesubgroup';
import { Ornament } from './ornament';
import { Parenthesis } from './parenthesis';
import { Parser } from './parser';
import { PedalMarking } from './pedalmarking';
import { Registry } from './registry';
import { RenderContext } from './rendercontext';
import { Renderer, RendererBackends, RendererLineEndType } from './renderer';
import { RepeatNote } from './repeatnote';
import { Stave } from './stave';
import { Barline, BarlineType } from './stavebarline';
import { StaveConnector } from './staveconnector';
import { StaveHairpin } from './stavehairpin';
import { StaveLine } from './staveline';
import { StaveModifier, StaveModifierPosition } from './stavemodifier';
import { StaveNote } from './stavenote';
import { Repetition } from './staverepetition';
import { StaveTempo } from './stavetempo';
import { StaveText } from './stavetext';
import { StaveTie } from './stavetie';
import { Volta, VoltaType } from './stavevolta';
import { Stem } from './stem';
import { StringNumber } from './stringnumber';
import { Stroke } from './strokes';
import { SVGContext } from './svgcontext';
import { System } from './system';
import { Tables } from './tables';
import { TabNote } from './tabnote';
import { TabSlide } from './tabslide';
import { TabStave } from './tabstave';
import { TabTie } from './tabtie';
import { TextBracket, TextBracketPosition } from './textbracket';
import { TextDynamics } from './textdynamics';
import { TextFormatter } from './textformatter';
import { TextJustification, TextNote } from './textnote';
import { TickContext } from './tickcontext';
import { TimeSignature } from './timesignature';
import { TimeSigNote } from './timesignote';
import { Tremolo } from './tremolo';
import { Tuning } from './tuning';
import { Tuplet } from './tuplet';
import { DATE, ID, VERSION } from './version';
import { Vibrato } from './vibrato';
import { VibratoBracket } from './vibratobracket';
import { Voice, VoiceMode } from './voice';
class Flow {
    static get BUILD() {
        return {
            /** version number. */
            VERSION: VERSION,
            /** git commit ID that this library was built from. */
            ID: ID,
            /** The date when this library was compiled. */
            DATE: DATE,
        };
    }
    /**
     * Examples:
     * ```
     * Vex.Flow.setMusicFont('Petaluma');
     * Vex.Flow.setMusicFont('Bravura', 'Gonville');
     * ```
     *
     * **CASE 1**: You are using `vexflow.js`, which includes all music fonts (Bravura, Gonville, Petaluma, Custom).
     * In this case, calling this method is optional, since VexFlow already defaults to a music font stack of:
     * 'Bravura', 'Gonville', 'Custom'.
     *
     * **CASE 2**: You are using `vexflow-bravura.js` or `vexflow-petaluma.js` or `vexflow-gonville.js`,
     * which includes a single music font. Calling this method is unnecessary.
     *
     * **CASE 3**: You are using the light weight `vexflow-core.js` to take advantage of lazy loading for fonts.
     * In this case, the default music font stack is empty.
     * Example:
     * ```
     * await Vex.Flow.fetchMusicFont('Petaluma');
     * Vex.Flow.setMusicFont('Petaluma');
     * ... (do VexFlow stuff) ...
     * ```
     * See `demos/fonts/` for more examples.
     *
     * @returns an array of Font objects corresponding to the provided `fontNames`.
     */
    static setMusicFont(...fontNames) {
        // Convert the array of font names into an array of Font objects.
        const fonts = fontNames.map((fontName) => Font.load(fontName));
        Tables.MUSIC_FONT_STACK = fonts;
        Glyph.MUSIC_FONT_STACK = fonts.slice();
        Glyph.CURRENT_CACHE_KEY = fontNames.join(',');
        return fonts;
    }
    /**
     * Used with vexflow-core which supports dynamic font loading.
     */
    // eslint-disable-next-line
    static fetchMusicFont(fontName, fontModuleOrPath) {
        return __awaiter(this, void 0, void 0, function* () {
            // The default implementation does nothing.
            // See vexflow-core.ts for the implementation that vexflow-core.js uses.
        });
    }
    static getMusicFont() {
        const fonts = Tables.MUSIC_FONT_STACK;
        return fonts.map((font) => font.getName());
    }
    static getMusicFontStack() {
        return Tables.MUSIC_FONT_STACK;
    }
    static get RENDER_PRECISION_PLACES() {
        return Tables.RENDER_PRECISION_PLACES;
    }
    static set RENDER_PRECISION_PLACES(precision) {
        Tables.RENDER_PRECISION_PLACES = precision;
    }
    static get SOFTMAX_FACTOR() {
        return Tables.SOFTMAX_FACTOR;
    }
    static set SOFTMAX_FACTOR(factor) {
        Tables.SOFTMAX_FACTOR = factor;
    }
    static get NOTATION_FONT_SCALE() {
        return Tables.NOTATION_FONT_SCALE;
    }
    static set NOTATION_FONT_SCALE(value) {
        Tables.NOTATION_FONT_SCALE = value;
    }
    static get TABLATURE_FONT_SCALE() {
        return Tables.TABLATURE_FONT_SCALE;
    }
    static set TABLATURE_FONT_SCALE(value) {
        Tables.TABLATURE_FONT_SCALE = value;
    }
    static get RESOLUTION() {
        return Tables.RESOLUTION;
    }
    static set RESOLUTION(value) {
        Tables.RESOLUTION = value;
    }
    static get SLASH_NOTEHEAD_WIDTH() {
        return Tables.SLASH_NOTEHEAD_WIDTH;
    }
    static set SLASH_NOTEHEAD_WIDTH(value) {
        Tables.SLASH_NOTEHEAD_WIDTH = value;
    }
    static get STAVE_LINE_DISTANCE() {
        return Tables.STAVE_LINE_DISTANCE;
    }
    static set STAVE_LINE_DISTANCE(value) {
        Tables.STAVE_LINE_DISTANCE = value;
    }
    static get STAVE_LINE_THICKNESS() {
        return Tables.STAVE_LINE_THICKNESS;
    }
    static set STAVE_LINE_THICKNESS(value) {
        Tables.STAVE_LINE_THICKNESS = value;
    }
    static get STEM_HEIGHT() {
        return Tables.STEM_HEIGHT;
    }
    static set STEM_HEIGHT(value) {
        Tables.STEM_HEIGHT = value;
    }
    static get STEM_WIDTH() {
        return Tables.STEM_WIDTH;
    }
    static set STEM_WIDTH(value) {
        Tables.STEM_WIDTH = value;
    }
    static get TIME4_4() {
        return Tables.TIME4_4;
    }
    static get accidentalMap() {
        return Tables.accidentalMap;
    }
    static get unicode() {
        return Tables.unicode;
    }
    static keySignature(spec) {
        return Tables.keySignature(spec);
    }
    static hasKeySignature(spec) {
        return Tables.hasKeySignature(spec);
    }
    static getKeySignatures() {
        return Tables.getKeySignatures();
    }
    static clefProperties(clef) {
        return Tables.clefProperties(clef);
    }
    // eslint-disable-next-line
    static keyProperties(key, clef, params) {
        return Tables.keyProperties(key, clef, params);
    }
    static durationToTicks(duration) {
        return Tables.durationToTicks(duration);
    }
}
Flow.Accidental = Accidental;
Flow.Annotation = Annotation;
Flow.Articulation = Articulation;
Flow.Barline = Barline;
Flow.BarNote = BarNote;
Flow.Beam = Beam;
Flow.Bend = Bend;
Flow.BoundingBox = BoundingBox;
Flow.BoundingBoxComputation = BoundingBoxComputation;
Flow.CanvasContext = CanvasContext;
Flow.ChordSymbol = ChordSymbol;
Flow.Clef = Clef;
Flow.ClefNote = ClefNote;
Flow.Crescendo = Crescendo;
Flow.Curve = Curve;
Flow.Dot = Dot;
Flow.EasyScore = EasyScore;
Flow.Element = Element;
Flow.Factory = Factory;
Flow.Font = Font;
Flow.Formatter = Formatter;
Flow.Fraction = Fraction;
Flow.FretHandFinger = FretHandFinger;
Flow.GhostNote = GhostNote;
Flow.Glyph = Glyph;
Flow.GlyphNote = GlyphNote;
Flow.GraceNote = GraceNote;
Flow.GraceNoteGroup = GraceNoteGroup;
Flow.GraceTabNote = GraceTabNote;
Flow.KeyManager = KeyManager;
Flow.KeySignature = KeySignature;
Flow.KeySigNote = KeySigNote;
Flow.Modifier = Modifier;
Flow.ModifierContext = ModifierContext;
Flow.MultiMeasureRest = MultiMeasureRest;
Flow.Music = Music;
Flow.Note = Note;
Flow.NoteHead = NoteHead;
Flow.NoteSubGroup = NoteSubGroup;
Flow.Ornament = Ornament;
Flow.Parenthesis = Parenthesis;
Flow.Parser = Parser;
Flow.PedalMarking = PedalMarking;
Flow.Registry = Registry;
Flow.RenderContext = RenderContext;
Flow.Renderer = Renderer;
Flow.RepeatNote = RepeatNote;
Flow.Repetition = Repetition;
Flow.Stave = Stave;
Flow.StaveConnector = StaveConnector;
Flow.StaveHairpin = StaveHairpin;
Flow.StaveLine = StaveLine;
Flow.StaveModifier = StaveModifier;
Flow.StaveNote = StaveNote;
Flow.StaveTempo = StaveTempo;
Flow.StaveText = StaveText;
Flow.StaveTie = StaveTie;
Flow.Stem = Stem;
Flow.StringNumber = StringNumber;
Flow.Stroke = Stroke;
Flow.SVGContext = SVGContext;
Flow.System = System;
Flow.TabNote = TabNote;
Flow.TabSlide = TabSlide;
Flow.TabStave = TabStave;
Flow.TabTie = TabTie;
Flow.TextBracket = TextBracket;
Flow.TextDynamics = TextDynamics;
Flow.TextFormatter = TextFormatter;
Flow.TextNote = TextNote;
Flow.TickContext = TickContext;
Flow.TimeSignature = TimeSignature;
Flow.TimeSigNote = TimeSigNote;
Flow.Tremolo = Tremolo;
Flow.Tuning = Tuning;
Flow.Tuplet = Tuplet;
Flow.Vibrato = Vibrato;
Flow.VibratoBracket = VibratoBracket;
Flow.Voice = Voice;
Flow.Volta = Volta;
// Exported Enums.
// Sorted by the module / file they are exported from.
Flow.AnnotationHorizontalJustify = AnnotationHorizontalJustify;
Flow.AnnotationVerticalJustify = AnnotationVerticalJustify;
Flow.ChordSymbolHorizontalJustify = ChordSymbolHorizontalJustify;
Flow.ChordSymbolVerticalJustify = ChordSymbolVerticalJustify;
Flow.SymbolTypes = SymbolTypes;
Flow.SymbolModifiers = SymbolModifiers;
Flow.CurvePosition = CurvePosition;
Flow.FontWeight = FontWeight;
Flow.FontStyle = FontStyle;
Flow.ModifierPosition = ModifierPosition;
Flow.RendererBackends = RendererBackends;
Flow.RendererLineEndType = RendererLineEndType;
Flow.BarlineType = BarlineType;
Flow.StaveModifierPosition = StaveModifierPosition;
Flow.VoltaType = VoltaType;
Flow.TextBracketPosition = TextBracketPosition;
Flow.TextJustification = TextJustification;
Flow.VoiceMode = VoiceMode;
export { Flow };
