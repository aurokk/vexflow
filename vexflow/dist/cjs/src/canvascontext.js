// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
import { Font } from './font';
import { RenderContext } from './rendercontext';
import { globalObject, warn } from './util';
import { isHTMLCanvas } from './web';
/**
 * A rendering context for the Canvas backend. This class serves as a proxy for the
 * underlying CanvasRenderingContext2D object, part of the browser's API.
 */
export class CanvasContext extends RenderContext {
    static get WIDTH() {
        return 600;
    }
    static get HEIGHT() {
        return 400;
    }
    static get CANVAS_BROWSER_SIZE_LIMIT() {
        return 32767; // Chrome/Firefox. Could be determined more precisely by npm module canvas-size.
    }
    /**
     * Ensure that width and height do not exceed the browser limit.
     * @returns array of [width, height] clamped to the browser limit.
     */
    static sanitizeCanvasDims(width, height) {
        const limit = this.CANVAS_BROWSER_SIZE_LIMIT;
        if (Math.max(width, height) > limit) {
            warn('Canvas dimensions exceed browser limit. Cropping to ' + limit);
            if (width > limit) {
                width = limit;
            }
            if (height > limit) {
                height = limit;
            }
        }
        return [width, height];
    }
    constructor(context) {
        super();
        /** Height of one line of text (in pixels). */
        this.textHeight = 0;
        this.context2D = context;
        if (!context.canvas) {
            this.canvas = {
                width: CanvasContext.WIDTH,
                height: CanvasContext.HEIGHT,
            };
        }
        else {
            this.canvas = context.canvas;
        }
    }
    /**
     * Set all pixels to transparent black rgba(0,0,0,0).
     */
    clear() {
        this.context2D.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    // eslint-disable-next-line
    openGroup(cls, id, attrs) {
        // Containers not implemented.
    }
    closeGroup() {
        // Containers not implemented.
    }
    // eslint-disable-next-line
    add(child) {
        // Containers not implemented.
    }
    setFillStyle(style) {
        this.context2D.fillStyle = style;
        return this;
    }
    /** CanvasContext ignores `setBackgroundFillStyle()`. */
    // eslint-disable-next-line
    setBackgroundFillStyle(style) {
        // DO NOTHING
        return this;
    }
    setStrokeStyle(style) {
        this.context2D.strokeStyle = style;
        return this;
    }
    setShadowColor(color) {
        this.context2D.shadowColor = color;
        return this;
    }
    setShadowBlur(blur) {
        // CanvasRenderingContext2D does not scale the shadow blur by the current
        // transform, so we have to do it manually. We assume uniform scaling
        // (though allow for rotation) because the blur can only be scaled
        // uniformly anyway.
        const t = this.context2D.getTransform();
        const scale = Math.sqrt(t.a * t.a + t.b * t.b + t.c * t.c + t.d * t.d);
        this.context2D.shadowBlur = scale * blur;
        return this;
    }
    setLineWidth(width) {
        this.context2D.lineWidth = width;
        return this;
    }
    setLineCap(capType) {
        this.context2D.lineCap = capType;
        return this;
    }
    setLineDash(dash) {
        this.context2D.setLineDash(dash);
        return this;
    }
    scale(x, y) {
        this.context2D.scale(x, y);
        return this;
    }
    resize(width, height, devicePixelRatio) {
        var _a;
        const canvas = this.context2D.canvas;
        const dpr = (_a = devicePixelRatio !== null && devicePixelRatio !== void 0 ? devicePixelRatio : globalObject().devicePixelRatio) !== null && _a !== void 0 ? _a : 1;
        // eslint-disable-next-line no-console
        // Scale the canvas size by the device pixel ratio clamping to the maximum supported size.
        [width, height] = CanvasContext.sanitizeCanvasDims(width * dpr, height * dpr);
        // Divide back down by the pixel ratio and convert to integers.
        width = (width / dpr) | 0;
        height = (height / dpr) | 0;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        // The canvas could be an instance of either HTMLCanvasElement or an OffscreenCanvas.
        // Only HTMLCanvasElement has a style attribute.
        if (isHTMLCanvas(canvas)) {
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
        }
        return this.scale(dpr, dpr);
    }
    rect(x, y, width, height) {
        this.context2D.rect(x, y, width, height);
        return this;
    }
    fillRect(x, y, width, height) {
        this.context2D.fillRect(x, y, width, height);
        return this;
    }
    /**
     * Set the pixels in a rectangular area to transparent black rgba(0,0,0,0).
     */
    clearRect(x, y, width, height) {
        this.context2D.clearRect(x, y, width, height);
        return this;
    }
    beginPath() {
        this.context2D.beginPath();
        return this;
    }
    moveTo(x, y) {
        this.context2D.moveTo(x, y);
        return this;
    }
    lineTo(x, y) {
        this.context2D.lineTo(x, y);
        return this;
    }
    bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
        this.context2D.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
        return this;
    }
    quadraticCurveTo(cpx, cpy, x, y) {
        this.context2D.quadraticCurveTo(cpx, cpy, x, y);
        return this;
    }
    arc(x, y, radius, startAngle, endAngle, counterclockwise) {
        this.context2D.arc(x, y, radius, startAngle, endAngle, counterclockwise);
        return this;
    }
    fill() {
        this.context2D.fill();
        return this;
    }
    stroke() {
        this.context2D.stroke();
        return this;
    }
    closePath() {
        this.context2D.closePath();
        return this;
    }
    measureText(text) {
        const metrics = this.context2D.measureText(text);
        let y = 0;
        let height = 0;
        if (metrics.fontBoundingBoxAscent) {
            y = -metrics.fontBoundingBoxAscent;
            height = metrics.fontBoundingBoxDescent + metrics.fontBoundingBoxAscent;
        }
        else {
            y = -metrics.actualBoundingBoxAscent;
            height = metrics.actualBoundingBoxDescent + metrics.actualBoundingBoxAscent;
        }
        // Return x, y, width & height in the same manner as svg getBBox
        return {
            x: 0,
            y: y,
            width: metrics.width,
            height: height,
        };
    }
    fillText(text, x, y) {
        this.context2D.fillText(text, x, y);
        return this;
    }
    save() {
        this.context2D.save();
        return this;
    }
    restore() {
        this.context2D.restore();
        return this;
    }
    set fillStyle(style) {
        this.context2D.fillStyle = style;
    }
    get fillStyle() {
        return this.context2D.fillStyle;
    }
    set strokeStyle(style) {
        this.context2D.strokeStyle = style;
    }
    get strokeStyle() {
        return this.context2D.strokeStyle;
    }
    /**
     * @param f is 1) a `FontInfo` object or
     *             2) a string formatted as CSS font shorthand (e.g., 'bold 10pt Arial') or
     *             3) a string representing the font family (one of `size`, `weight`, or `style` must also be provided).
     * @param size a string specifying the font size and unit (e.g., '16pt'), or a number (the unit is assumed to be 'pt').
     * @param weight is a string (e.g., 'bold', 'normal') or a number (100, 200, ... 900).
     * @param style is a string (e.g., 'italic', 'normal').
     */
    setFont(f, size, weight, style) {
        const fontInfo = Font.validate(f, size, weight, style);
        this.context2D.font = Font.toCSSString(fontInfo);
        this.textHeight = Font.convertSizeToPixelValue(fontInfo.size);
        return this;
    }
    /** Return a string of the form `'italic bold 15pt Arial'` */
    getFont() {
        return this.context2D.font;
    }
}
