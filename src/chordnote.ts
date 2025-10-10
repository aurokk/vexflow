// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ChordNote renders chord symbols on a stave, similar to how GlyphNote works.
// It uses the same chord rendering logic as ChordSymbol but as a standalone note.

import { BoundingBox } from './boundingbox';
import { ChordStave } from './chordstave';
import { Font, FontInfo, FontStyle, FontWeight } from './font';
import { Glyph } from './glyph';
import { Note, NoteStruct } from './note';
import { Tables } from './tables';
import { TextFormatter } from './textformatter';
import { Category, isChordStave } from './typeguard';
import { RuntimeError } from './util';

export interface ChordBlock {
  text: string;
  symbolType: SymbolType;
  symbolModifier: SymbolModifier;
  xShift: number;
  yShift: number;
  vAlign: boolean;
  width: number;
  glyph?: Glyph;
}

export enum SymbolType {
  GLYPH = 1,
  TEXT = 2,
  LINE = 3,
}

export enum SymbolModifier {
  NONE = 1,
  SUBSCRIPT = 2,
  SUPERSCRIPT = 3,
}

export interface ChordNoteOptions {
  ignoreTicks?: boolean;
  line?: number;
}

interface ChordSymbolGlyphMetrics {
  leftSideBearing: number;
  advanceWidth: number;
  yOffset: number;
}

interface ChordSymbolMetrics {
  global: {
    superscriptOffset: number;
    subscriptOffset: number;
    kerningOffset: number;
    lowerKerningText: string[];
    upperKerningText: string[];
    spacing: number;
    superSubRatio: number;
  };
  glyphs: Record<string, ChordSymbolGlyphMetrics>;
}

export class ChordNote extends Note {
  static get CATEGORY(): string {
    return Category.ChordNote;
  }

  // Glyph data (same as ChordSymbol)
  static readonly glyphs: Record<string, { code: string }> = {
    diminished: { code: 'csymDiminished' },
    dim: { code: 'csymDiminished' },
    halfDiminished: { code: 'csymHalfDiminished' },
    '+': { code: 'csymAugmented' },
    augmented: { code: 'csymAugmented' },
    majorSeventh: { code: 'csymMajorSeventh' },
    minor: { code: 'csymMinor' },
    '-': { code: 'csymMinor' },
    '(': { code: 'csymParensLeftTall' },
    leftParen: { code: 'csymParensLeftTall' },
    ')': { code: 'csymParensRightTall' },
    rightParen: { code: 'csymParensRightTall' },
    leftBracket: { code: 'csymBracketLeftTall' },
    rightBracket: { code: 'csymBracketRightTall' },
    leftParenTall: { code: 'csymParensLeftVeryTall' },
    rightParenTall: { code: 'csymParensRightVeryTall' },
    '/': { code: 'csymDiagonalArrangementSlash' },
    over: { code: 'csymDiagonalArrangementSlash' },
    '#': { code: 'accidentalSharp' },
    b: { code: 'accidentalFlat' },
  };

  /**
   * Default text font for chord symbols.
   */
  static get TEXT_FONT(): Required<FontInfo> {
    let family = 'Roboto Slab, Times, serif';
    if (Tables.currentMusicFont().getName() === 'Petaluma') {
      family = 'PetalumaScript, Arial, sans-serif';
    }
    return {
      family,
      size: 20,
      weight: FontWeight.NORMAL,
      style: FontStyle.NORMAL,
    };
  }

  static get metrics(): ChordSymbolMetrics {
    const chordSymbol = Tables.currentMusicFont().getMetrics().chordSymbol;
    if (!chordSymbol) throw new RuntimeError('BadMetrics', `chordSymbol missing`);
    return chordSymbol;
  }

  static get engravingFontResolution(): number {
    return Tables.currentMusicFont().getResolution();
  }

  static get spacingBetweenBlocks(): number {
    return ChordNote.metrics.global.spacing / ChordNote.engravingFontResolution;
  }

  static get superSubRatio(): number {
    return ChordNote.metrics.global.superSubRatio;
  }

  static get superscriptOffset(): number {
    return ChordNote.metrics.global.superscriptOffset / ChordNote.engravingFontResolution;
  }

  static get subscriptOffset(): number {
    return ChordNote.metrics.global.subscriptOffset / ChordNote.engravingFontResolution;
  }

  static get kerningOffset(): number {
    return ChordNote.metrics.global.kerningOffset / ChordNote.engravingFontResolution;
  }

  static get lowerKerningText(): string[] {
    return ChordNote.metrics.global.lowerKerningText;
  }

  static get upperKerningText(): string[] {
    return ChordNote.metrics.global.upperKerningText;
  }

  static getMetricForGlyph(glyphCode: string): ChordSymbolGlyphMetrics | undefined {
    if (ChordNote.metrics.glyphs[glyphCode]) {
      return ChordNote.metrics.glyphs[glyphCode];
    }
    return undefined;
  }

  static getWidthForGlyph(glyph: Glyph): number {
    const metric = ChordNote.getMetricForGlyph(glyph.code);
    if (!metric) {
      return 0.65;
    }
    return metric.advanceWidth / ChordNote.engravingFontResolution;
  }

  static getYShiftForGlyph(glyph: Glyph): number {
    const metric = ChordNote.getMetricForGlyph(glyph.code);
    if (!metric) {
      return 0;
    }
    return metric.yOffset / ChordNote.engravingFontResolution;
  }

  static getXShiftForGlyph(glyph: Glyph): number {
    const metric = ChordNote.getMetricForGlyph(glyph.code);
    if (!metric) {
      return 0;
    }
    return (-1 * metric.leftSideBearing) / ChordNote.engravingFontResolution;
  }

  static isSuperscript(block: ChordBlock): boolean {
    return block.symbolModifier !== undefined && block.symbolModifier === SymbolModifier.SUPERSCRIPT;
  }

  static isSubscript(block: ChordBlock): boolean {
    return block.symbolModifier !== undefined && block.symbolModifier === SymbolModifier.SUBSCRIPT;
  }

  protected options: Required<ChordNoteOptions>;
  protected chordBlocks: ChordBlock[] = [];
  protected textFormatter!: TextFormatter;
  protected useKerning: boolean = true;

  constructor(noteStruct: NoteStruct, options?: ChordNoteOptions) {
    super(noteStruct);
    this.options = {
      ignoreTicks: false,
      line: 2,
      ...options,
    };

    // Note properties
    this.ignore_ticks = this.options.ignoreTicks;
    this.resetFont();
  }

  /**
   * Override setStave to validate that only ChordStave instances are used.
   * ChordNote can only be rendered on ChordStave, not on regular Stave or its subclasses.
   * @throws RuntimeError if the provided stave is not a ChordStave
   */
  setStave(stave: any): this {
    if (!isChordStave(stave)) {
      throw new RuntimeError(
        'InvalidStaveType',
        'ChordNote can only be attached to ChordStave instances. Use ChordStave instead of Stave.'
      );
    }
    // Store in parent's stave field but as ChordStave type
    // TypeScript sees it as Stave, but at runtime it's a ChordStave
    this.stave = stave as any;
    this.setContext(stave.getContext());
    return this;
  }

  /**
   * Get the ChordStave attached to this note.
   * @returns the ChordStave attached to this note
   */
  getChordStave(): ChordStave | undefined {
    return this.stave as any as ChordStave;
  }

  /**
   * Check and get the ChordStave attached to this note.
   * @throws RuntimeError if no ChordStave is attached
   */
  checkChordStave(): ChordStave {
    const stave = this.checkStave();
    if (!isChordStave(stave)) {
      throw new RuntimeError(
        'InvalidStaveType',
        'ChordNote requires a ChordStave, but a different stave type was attached.'
      );
    }
    return stave as any as ChordStave;
  }

  /**
   * Override getAbsoluteX to work with ChordStave which doesn't have getNoteStartX.
   * For ChordStave, notes start at the stave's X position (no complex formatting).
   */
  getAbsoluteX(): number {
    const tickContext = this.checkTickContext(`Can't getAbsoluteX() without a TickContext.`);
    let x = tickContext.getX();
    const chordStave = this.getChordStave();
    if (chordStave) {
      // ChordStave doesn't have getNoteStartX - just use the stave's X position
      x += chordStave.getX();
    }
    if (this.isCenterAligned()) {
      x += this.getCenterXShift();
    }
    return x;
  }

  /** Add a symbol block to this chord. */
  addSymbolBlock(parameters: any): this {
    this.chordBlocks.push(this.getSymbolBlock(parameters));
    this.updateWidth();
    return this;
  }

  /** Add text. */
  addText(text: string, parameters: any = {}): this {
    const symbolType = SymbolType.TEXT;
    return this.addSymbolBlock({ ...parameters, text, symbolType });
  }

  /** Add text with superscript modifier. */
  addTextSuperscript(text: string): this {
    const symbolType = SymbolType.TEXT;
    const symbolModifier = SymbolModifier.SUPERSCRIPT;
    return this.addSymbolBlock({ text, symbolType, symbolModifier });
  }

  /** Add text with subscript modifier. */
  addTextSubscript(text: string): this {
    const symbolType = SymbolType.TEXT;
    const symbolModifier = SymbolModifier.SUBSCRIPT;
    return this.addSymbolBlock({ text, symbolType, symbolModifier });
  }

  /** Add glyph. */
  addGlyph(glyph: string, params: any = {}): this {
    const symbolType = SymbolType.GLYPH;
    return this.addSymbolBlock({ ...params, glyph, symbolType });
  }

  /** Add glyph with superscript modifier. */
  addGlyphSuperscript(glyph: string): this {
    const symbolType = SymbolType.GLYPH;
    const symbolModifier = SymbolModifier.SUPERSCRIPT;
    return this.addSymbolBlock({ glyph, symbolType, symbolModifier });
  }

  /** Add glyph or text for each character. */
  addGlyphOrText(text: string, params: any = {}): this {
    let str = '';
    for (let i = 0; i < text.length; ++i) {
      const char = text[i];
      if (ChordNote.glyphs[char]) {
        if (str.length > 0) {
          this.addText(str, params);
          str = '';
        }
        this.addGlyph(char, params);
      } else {
        str += char;
      }
    }
    if (str.length > 0) {
      this.addText(str, params);
    }
    return this;
  }

  /** Add a line of the given width. */
  addLine(width: number, params: any = {}): this {
    const symbolType = SymbolType.LINE;
    return this.addSymbolBlock({ ...params, symbolType, width });
  }

  setEnableKerning(val: boolean): this {
    this.useKerning = val;
    return this;
  }

  protected getSymbolBlock(params: any = {}): ChordBlock {
    const symbolType = params.symbolType ?? SymbolType.TEXT;
    const symbolBlock: ChordBlock = {
      text: params.text ?? '',
      symbolType,
      symbolModifier: params.symbolModifier ?? SymbolModifier.NONE,
      xShift: 0,
      yShift: 0,
      vAlign: false,
      width: 0,
    };

    if (symbolType === SymbolType.GLYPH && typeof params.glyph === 'string') {
      const glyphArgs = ChordNote.glyphs[params.glyph];
      const glyphPoints = 20;
      symbolBlock.glyph = new Glyph(glyphArgs.code, glyphPoints, { category: 'chordSymbol' });
    } else if (symbolType === SymbolType.TEXT) {
      symbolBlock.width = this.textFormatter.getWidthForTextInEm(symbolBlock.text);
    } else if (symbolType === SymbolType.LINE) {
      symbolBlock.width = params.width;
    }

    return symbolBlock;
  }

  protected updateWidth(): void {
    let width = 0;
    this.chordBlocks.forEach((block) => {
      width += block.vAlign ? 0 : block.width;
    });
    this.setWidth(width);
  }

  updateOverBarAdjustments(): void {
    const barIndex = this.chordBlocks.findIndex(
      ({ symbolType, glyph }: ChordBlock) =>
        symbolType === SymbolType.GLYPH && glyph !== undefined && glyph.code === 'csymDiagonalArrangementSlash'
    );

    if (barIndex < 0) {
      return;
    }
    const bar = this.chordBlocks[barIndex];
    const xoff = bar.width / 4;
    const yoff = 0.25 * this.textFormatter.fontSizeInPixels;
    let symIndex = 0;
    for (symIndex = 0; symIndex < barIndex; ++symIndex) {
      const symbol = this.chordBlocks[symIndex];
      symbol.xShift = symbol.xShift + xoff;
      symbol.yShift = symbol.yShift - yoff;
    }

    for (symIndex = barIndex + 1; symIndex < this.chordBlocks.length; ++symIndex) {
      const symbol = this.chordBlocks[symIndex];
      symbol.xShift = symbol.xShift - xoff;
      symbol.yShift = symbol.yShift + yoff;
    }
  }

  updateKerningAdjustments(): void {
    let accum = 0;
    for (let j = 0; j < this.chordBlocks.length; ++j) {
      const symbol = this.chordBlocks[j];
      accum += this.getKerningAdjustment(j);
      symbol.xShift += accum;
    }
  }

  /** Do some basic kerning so that letter chords like 'A' don't have the extensions hanging off to the right. */
  getKerningAdjustment(j: number): number {
    if (!this.useKerning) {
      return 0;
    }
    const currSymbol = this.chordBlocks[j];
    const prevSymbol = j > 0 ? this.chordBlocks[j - 1] : undefined;
    let adjustment = 0;

    // Move things into the '/' over bar
    if (
      currSymbol.symbolType === SymbolType.GLYPH &&
      currSymbol.glyph !== undefined &&
      currSymbol.glyph.code === ChordNote.glyphs.over.code
    ) {
      adjustment += currSymbol.glyph.metrics.x_shift;
    }

    if (
      prevSymbol !== undefined &&
      prevSymbol.symbolType === SymbolType.GLYPH &&
      prevSymbol.glyph !== undefined &&
      prevSymbol.glyph.code === ChordNote.glyphs.over.code
    ) {
      adjustment += prevSymbol.glyph.metrics.x_shift;
    }

    // For superscripts that follow a letter without much top part, move it to the left slightly
    let preKernUpper = false;
    let preKernLower = false;
    if (prevSymbol !== undefined && prevSymbol.symbolType === SymbolType.TEXT) {
      preKernUpper = ChordNote.upperKerningText.some((xx) => xx === prevSymbol.text[prevSymbol.text.length - 1]);
      preKernLower = ChordNote.lowerKerningText.some((xx) => xx === prevSymbol.text[prevSymbol.text.length - 1]);
    }

    const kerningOffsetPixels = ChordNote.kerningOffset * this.textFormatter.fontSizeInPixels;
    if (preKernUpper && currSymbol.symbolModifier === SymbolModifier.SUPERSCRIPT) {
      adjustment += kerningOffsetPixels;
    }

    if (preKernLower && currSymbol.symbolType === SymbolType.TEXT) {
      if (currSymbol.text[0] >= 'a' && currSymbol.text[0] <= 'z') {
        adjustment += kerningOffsetPixels / 2;
      }
      if (ChordNote.upperKerningText.some((xx) => xx === prevSymbol?.text[prevSymbol.text.length - 1])) {
        adjustment += kerningOffsetPixels / 2;
      }
    }
    return adjustment;
  }

  getYOffsetForText(text: string): number {
    let acc = 0;
    let i = 0;
    for (i = 0; i < text.length; ++i) {
      const metrics = this.textFormatter.getGlyphMetrics(text[i]);
      if (metrics) {
        const yMax = metrics.y_max ?? 0;
        acc = yMax < acc ? yMax : acc;
      }
    }

    const resolution = this.textFormatter.getResolution();
    return i > 0 ? -1 * (acc / resolution) : 0;
  }

  get superscriptOffset(): number {
    return ChordNote.superscriptOffset * this.textFormatter.fontSizeInPixels;
  }

  get subscriptOffset(): number {
    return ChordNote.subscriptOffset * this.textFormatter.fontSizeInPixels;
  }

  setFont(f?: string | FontInfo, size?: string | number, weight?: string | number, style?: string): this {
    super.setFont(f, size, weight, style);
    this.textFormatter = TextFormatter.create(this.textFont);
    return this;
  }

  getBoundingBox(): BoundingBox | undefined {
    const width = this.getWidth();
    const chordStave = this.getChordStave();
    if (chordStave) {
      const y = chordStave.getYForLine(this.options.line);
      return new BoundingBox(this.getAbsoluteX(), y - 20, width, 40);
    }
    return undefined;
  }

  preFormat(): this {
    if (!this.preFormatted && this.modifierContext) {
      this.modifierContext.preFormat();
    }
    this.preFormatted = true;
    return this;
  }

  drawModifiers(): void {
    const ctx = this.checkContext();
    for (let i = 0; i < this.modifiers.length; i++) {
      const modifier = this.modifiers[i];
      modifier.setContext(ctx);
      modifier.drawWithStyle();
    }
  }

  getChordWidth(): number {
    let width = 0;
    this.chordBlocks.forEach((symbol) => {
      width += symbol.vAlign ? 0 : symbol.width;
    });
    return width;
  }

  draw(): void {
    const chordStave = this.checkChordStave();
    const ctx = chordStave.checkContext();
    this.setRendered();
    this.applyStyle(ctx);
    ctx.openGroup('chordNote', this.getAttribute('id'));

    const x = this.isCenterAligned() ? this.getAbsoluteX() - this.getWidth() / 2 : this.getAbsoluteX();
    // Use getCenterY if available and line is 2 (default middle), otherwise use getYForLine
    const baseY =
      this.options.line === 2 && 'getCenterY' in chordStave
        ? (chordStave as any).getCenterY()
        : chordStave.getYForLine(this.options.line);

    // Render the chord blocks
    ctx.save();
    const textFont = this.fontInfo;
    ctx.setFont(textFont);

    const fontSize = this.textFormatter.fontSizeInPixels;
    // Offset to center text vertically (baseline is typically around 0.75 of font height from top)
    const verticalCenterOffset = fontSize * 0.3;
    const y = baseY + verticalCenterOffset;
    const fontAdj = Font.scaleSize(fontSize, 0.05);
    const glyphAdj = fontAdj * 2;

    let width = 0;
    let nonSuperWidth = 0;
    let vAlign = false;

    // Process and format each chord block (similar to ChordSymbol.format)
    for (let j = 0; j < this.chordBlocks.length; ++j) {
      const block = this.chordBlocks[j];
      const sup = ChordNote.isSuperscript(block);
      const sub = ChordNote.isSubscript(block);
      const superSubScale = sup || sub ? ChordNote.superSubRatio : 1;
      const adj = block.symbolType === SymbolType.GLYPH ? glyphAdj * superSubScale : fontAdj * superSubScale;

      const superSubFontSize = fontSize * superSubScale;
      if (block.symbolType === SymbolType.GLYPH && block.glyph !== undefined) {
        block.width = ChordNote.getWidthForGlyph(block.glyph) * superSubFontSize;
        block.yShift += ChordNote.getYShiftForGlyph(block.glyph) * superSubFontSize;
        block.xShift += ChordNote.getXShiftForGlyph(block.glyph) * superSubFontSize;
        block.glyph.scale = block.glyph.scale * adj;
      } else if (block.symbolType === SymbolType.TEXT) {
        block.width = block.width * superSubFontSize;
        block.yShift += this.getYOffsetForText(block.text) * adj;
      }

      block.width += ChordNote.spacingBetweenBlocks * fontSize * superSubScale;

      // Handle subscript/superscript vertical alignment
      if (sup && j > 0) {
        const prev = this.chordBlocks[j - 1];
        if (!ChordNote.isSuperscript(prev)) {
          nonSuperWidth = width;
        }
      }
      if (sub && nonSuperWidth > 0) {
        vAlign = true;
        block.xShift = block.xShift + (nonSuperWidth - width);
        width = nonSuperWidth;
        nonSuperWidth = 0;
        this.setEnableKerning(false);
      }
      if (!sup && !sub) {
        nonSuperWidth = 0;
      }
      block.vAlign = vAlign;
      width += block.width;
    }

    // Apply kerning and over bar adjustments
    this.updateKerningAdjustments();
    this.updateOverBarAdjustments();

    // Draw the chord blocks
    let currentX = x;
    this.chordBlocks.forEach((symbol) => {
      const isSuper = ChordNote.isSuperscript(symbol);
      const isSub = ChordNote.isSubscript(symbol);
      let curY = y;

      if (isSuper) {
        curY += this.superscriptOffset;
      }
      if (isSub) {
        curY += this.subscriptOffset;
      }

      if (symbol.symbolType === SymbolType.TEXT) {
        if (isSuper || isSub) {
          ctx.save();
          const { family, size, weight, style } = textFont;
          const smallerFontSize = Font.scaleSize(size, ChordNote.superSubRatio);
          ctx.setFont(family, smallerFontSize, weight, style);
        }
        ctx.fillText(symbol.text, currentX + symbol.xShift, curY + symbol.yShift);
        if (isSuper || isSub) {
          ctx.restore();
        }
      } else if (symbol.symbolType === SymbolType.GLYPH && symbol.glyph) {
        symbol.glyph.render(ctx, currentX + symbol.xShift, curY + symbol.yShift);
      } else if (symbol.symbolType === SymbolType.LINE) {
        ctx.beginPath();
        ctx.setLineWidth(1);
        ctx.moveTo(currentX, y);
        ctx.lineTo(currentX + symbol.width, curY);
        ctx.stroke();
      }

      currentX += symbol.width;
      if (symbol.vAlign) {
        currentX += symbol.xShift;
      }
    });

    ctx.restore();
    this.drawModifiers();
    ctx.closeGroup();
    this.restoreStyle(ctx);
  }
}
