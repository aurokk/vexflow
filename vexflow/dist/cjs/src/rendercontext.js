// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2021.
// MIT License
export class RenderContext {
    static get CATEGORY() {
        return "RenderContext" /* Category.RenderContext */;
    }
    set font(f) {
        this.setFont(f);
    }
    get font() {
        return this.getFont();
    }
    /**
     * This is kept for backwards compatibility with 3.0.9.
     * @deprecated use `setFont(...)` instead since it now supports CSS font shorthand.
     */
    setRawFont(f) {
        this.setFont(f);
        return this;
    }
}
/**
 * Draw a tiny dot marker on the specified context. A great debugging aid.
 * @param ctx context
 * @param x dot x coordinate
 * @param y dot y coordinate
 * @param color
 */
export function drawDot(ctx, x, y, color = '#F55') {
    ctx.save();
    ctx.setFillStyle(color);
    // draw a circle
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}
