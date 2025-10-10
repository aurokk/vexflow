// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

import { Element } from './element';
import { RenderContext } from './rendercontext';
import { StaveModifier, StaveModifierPosition } from './stavemodifier';
import { Tables } from './tables';
import { TimeSignature } from './timesignature';
import { Category } from './typeguard';

export interface ChordStaveOptions {
  spacing_between_lines_px?: number;
  space_above_staff_ln?: number;
}

/**
 * ChordStave is a lightweight stave specifically designed for rendering chord symbols.
 * Unlike regular Stave, it doesn't include barlines, staff lines, clefs, key signatures,
 * or other traditional staff notation elements. It provides only the positioning information
 * needed to render ChordNote objects and optional time signatures.
 */
export class ChordStave extends Element {
  static get CATEGORY(): string {
    return Category.ChordStave;
  }

  protected x: number;
  protected y: number;
  protected width: number;
  protected height: number;
  protected spacing_between_lines_px: number;
  protected space_above_staff_ln: number;
  protected modifiers: StaveModifier[] = [];

  constructor(x: number, y: number, width: number, options?: ChordStaveOptions) {
    super();

    this.x = x;
    this.y = y;
    this.width = width;

    // Use defaults similar to Stave but without the full Stave infrastructure
    // Increase spacing between lines by 1.5x for better visual spacing
    const baseSpacing = options?.spacing_between_lines_px ?? Tables.STAVE_LINE_DISTANCE;
    this.spacing_between_lines_px = baseSpacing * 1.5;
    this.space_above_staff_ln = options?.space_above_staff_ln ?? 4;

    // Calculate height based on 5 lines plus spacing above
    // This provides a reasonable vertical space for chord placement
    const num_lines = 5;
    this.height = (num_lines + this.space_above_staff_ln) * this.spacing_between_lines_px;
  }

  /** Get the X position of this stave. */
  getX(): number {
    return this.x;
  }

  /** Set the X position of this stave. */
  setX(x: number): this {
    this.x = x;
    return this;
  }

  /** Get the Y position of this stave. */
  getY(): number {
    return this.y;
  }

  /** Set the Y position of this stave. */
  setY(y: number): this {
    this.y = y;
    return this;
  }

  /** Get the width of this stave. */
  getWidth(): number {
    return this.width;
  }

  /** Set the width of this stave. */
  setWidth(width: number): this {
    this.width = width;
    return this;
  }

  /** Get the height of this stave. */
  getHeight(): number {
    return this.height;
  }

  /** Get the spacing between lines. */
  getSpacingBetweenLines(): number {
    return this.spacing_between_lines_px;
  }

  /**
   * Get the Y position for a given line number.
   * This is used by ChordNote to position chord symbols at specific vertical positions.
   * @param line The line number (0 = top, higher numbers = lower)
   * @returns The Y coordinate for the center of the line
   */
  getYForLine(line: number): number {
    return this.y + line * this.spacing_between_lines_px + this.space_above_staff_ln * this.spacing_between_lines_px;
  }

  /**
   * Get the Y position for glyphs (like clefs and time signatures).
   * For ChordStave, this is similar to getYForLine but used for StaveModifiers.
   * Returns the Y position for line 3 (middle of a 5-line staff area).
   */
  getYForGlyphs(): number {
    return this.getYForLine(3);
  }

  /**
   * Get the number of lines in this stave.
   * Returns 5 to maintain compatibility with Stave.
   */
  getNumLines(): number {
    return 5;
  }

  /**
   * Get the Y position of the top of the top staff line.
   * This is used by barlines and other modifiers.
   */
  getTopLineTopY(): number {
    return this.getYForLine(0);
  }

  /**
   * Get the Y position of the bottom of the bottom staff line.
   * This is used by barlines and other modifiers.
   */
  getBottomLineBottomY(): number {
    return this.getYForLine(4);
  }

  /**
   * Get the Y position for the vertical center between the top and bottom barline positions.
   * This is useful for centering chord symbols vertically relative to the barlines.
   * Returns the Y position of the 3rd staff line (line index 2).
   */
  getCenterY(): number {
    return this.getYForLine(2);
  }

  /**
   * Add a time signature to the ChordStave.
   * @param timeSpec The time signature (e.g., '4/4', '3/4', '6/8', 'C', 'C|')
   * @returns This ChordStave for chaining
   */
  addTimeSignature(timeSpec: string): this {
    const timeSig = new TimeSignature(timeSpec);
    timeSig.setStave(this as any); // Cast to any since TimeSignature expects Stave
    this.modifiers.push(timeSig);
    return this;
  }

  /**
   * Add a barline to the ChordStave.
   * @param barline The Barline or barline type to add
   * @returns This ChordStave for chaining
   */
  addBarline(barline: StaveModifier): this {
    barline.setStave(this as any); // Cast to any since Barline expects Stave

    // Determine position based on X coordinate if already set
    // If barline is positioned at or near the end of the stave, it's an END barline
    if (barline.getX() >= this.x + this.width - 10) {
      barline.setPosition(StaveModifierPosition.END);
    } else if (barline.getPosition() === undefined || barline.getPosition() === 0) {
      // Default to BEGIN if position not set
      barline.setPosition(StaveModifierPosition.BEGIN);
    }

    this.modifiers.push(barline);
    return this;
  }

  /**
   * Get all modifiers attached to this ChordStave.
   */
  getModifiers(): StaveModifier[] {
    return this.modifiers;
  }

  /**
   * Draw staff lines and modifiers (time signatures, barlines, etc.) on the ChordStave.
   */
  draw(): void {
    const ctx = this.checkContext();
    this.setRendered();

    // Staff lines are not drawn for ChordStave (invisible)
    this.applyStyle(ctx);
    ctx.openGroup('chordstave', this.getAttribute('id'));
    ctx.closeGroup();
    this.restoreStyle(ctx);

    // Separate modifiers by position
    const beginModifiers: StaveModifier[] = [];
    const endModifiers: StaveModifier[] = [];

    for (const modifier of this.modifiers) {
      if (modifier.getPosition() === StaveModifierPosition.END) {
        endModifiers.push(modifier);
      } else {
        // Default to BEGIN position if not specified
        beginModifiers.push(modifier);
      }
    }

    // Draw BEGIN modifiers from left to right
    let x = this.x + 10; // Start with some padding from the left edge
    for (let i = 0; i < beginModifiers.length; i++) {
      const modifier = beginModifiers[i];
      // Don't override the x if it was explicitly set (non-zero), otherwise use calculated position
      if (modifier.getX() === 0) {
        modifier.setX(x);
      } else {
        // Use the explicitly set x position, but update our tracking variable
        x = modifier.getX();
      }
      modifier.setContext(ctx);
      // Barlines and some other modifiers expect the stave as a parameter
      if (typeof modifier.draw === 'function') {
        // Try to call with stave parameter (for barlines), fall back to no parameters
        try {
          (modifier.draw as any)(this);
        } catch (e) {
          modifier.draw();
        }
      }
      x += modifier.getWidth() + modifier.getPadding(i); // Add width and padding for next modifier
    }

    // Draw END modifiers from right to left
    x = this.x + this.width;
    for (let i = endModifiers.length - 1; i >= 0; i--) {
      const modifier = endModifiers[i];
      modifier.setContext(ctx);
      // Position the modifier at the right edge (the modifier's x should already be set)
      // Don't override the x if it was explicitly set, otherwise position at the end
      if (modifier.getX() === 0) {
        modifier.setX(x);
      }
      // Barlines and some other modifiers expect the stave as a parameter
      if (typeof modifier.draw === 'function') {
        // Try to call with stave parameter (for barlines), fall back to no parameters
        try {
          (modifier.draw as any)(this);
        } catch (e) {
          modifier.draw();
        }
      }
    }

    return;
  }

  /**
   * Override checkContext to provide better error messages specific to ChordStave.
   */
  checkContext(): RenderContext {
    if (!this.getContext()) {
      throw new Error('ChordStave: No rendering context attached to instance.');
    }
    return this.getContext()!;
  }
}
