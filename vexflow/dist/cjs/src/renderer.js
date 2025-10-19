// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
import { CanvasContext } from './canvascontext';
import { SVGContext } from './svgcontext';
import { isRenderContext } from './typeguard';
import { RuntimeError } from './util';
import { isHTMLCanvas, isHTMLDiv } from './web';
export var RendererBackends;
(function (RendererBackends) {
    RendererBackends[RendererBackends["CANVAS"] = 1] = "CANVAS";
    RendererBackends[RendererBackends["SVG"] = 2] = "SVG";
})(RendererBackends || (RendererBackends = {}));
// End of line types
export var RendererLineEndType;
(function (RendererLineEndType) {
    RendererLineEndType[RendererLineEndType["NONE"] = 1] = "NONE";
    RendererLineEndType[RendererLineEndType["UP"] = 2] = "UP";
    RendererLineEndType[RendererLineEndType["DOWN"] = 3] = "DOWN";
})(RendererLineEndType || (RendererLineEndType = {}));
/**
 * Support Canvas & SVG rendering contexts.
 */
class Renderer {
    static buildContext(elementId, backend, width, height, background = '#FFF') {
        const renderer = new Renderer(elementId, backend);
        if (width && height) {
            renderer.resize(width, height);
        }
        const ctx = renderer.getContext();
        ctx.setBackgroundFillStyle(background);
        Renderer.lastContext = ctx;
        return ctx;
    }
    static getCanvasContext(elementId, width, height, background) {
        return Renderer.buildContext(elementId, Renderer.Backends.CANVAS, width, height, background);
    }
    static getSVGContext(elementId, width, height, background) {
        return Renderer.buildContext(elementId, Renderer.Backends.SVG, width, height, background);
    }
    // Draw a dashed line (horizontal, vertical or diagonal
    // dashPattern = [3,3] draws a 3 pixel dash followed by a three pixel space.
    // setting the second number to 0 draws a solid line.
    static drawDashedLine(context, fromX, fromY, toX, toY, dashPattern) {
        context.beginPath();
        const dx = toX - fromX;
        const dy = toY - fromY;
        const angle = Math.atan2(dy, dx);
        let x = fromX;
        let y = fromY;
        context.moveTo(fromX, fromY);
        let idx = 0;
        let draw = true;
        while (!((dx < 0 ? x <= toX : x >= toX) && (dy < 0 ? y <= toY : y >= toY))) {
            const dashLength = dashPattern[idx++ % dashPattern.length];
            const nx = x + Math.cos(angle) * dashLength;
            x = dx < 0 ? Math.max(toX, nx) : Math.min(toX, nx);
            const ny = y + Math.sin(angle) * dashLength;
            y = dy < 0 ? Math.max(toY, ny) : Math.min(toY, ny);
            if (draw) {
                context.lineTo(x, y);
            }
            else {
                context.moveTo(x, y);
            }
            draw = !draw;
        }
        context.closePath();
        context.stroke();
    }
    constructor(arg0, arg1) {
        if (isRenderContext(arg0)) {
            // The user has provided what looks like a RenderContext, let's just use it.
            this.ctx = arg0;
        }
        else {
            if (arg1 === undefined) {
                // The backend must be specified if the render context isn't directly provided.
                throw new RuntimeError('InvalidArgument', 'Missing backend argument');
            }
            const backend = arg1;
            let element;
            if (typeof arg0 == 'string') {
                const maybeElement = document.getElementById(arg0);
                if (!maybeElement) {
                    throw new RuntimeError('BadElementId', `Can't find element with ID "${maybeElement}"`);
                }
                element = maybeElement;
            }
            else {
                element = arg0;
            }
            // Verify backend and create context
            if (backend === Renderer.Backends.CANVAS) {
                if (!isHTMLCanvas(element)) {
                    throw new RuntimeError('BadElement', 'CANVAS context requires an HTMLCanvasElement.');
                }
                const context = element.getContext('2d', { willReadFrequently: true });
                if (!context) {
                    throw new RuntimeError('BadElement', "Can't get canvas context");
                }
                this.ctx = new CanvasContext(context);
            }
            else if (backend === Renderer.Backends.SVG) {
                if (!isHTMLDiv(element)) {
                    throw new RuntimeError('BadElement', 'SVG context requires an HTMLDivElement.');
                }
                this.ctx = new SVGContext(element);
            }
            else {
                throw new RuntimeError('InvalidBackend', `No support for backend: ${backend}`);
            }
        }
    }
    resize(width, height) {
        this.ctx.resize(width, height);
        return this;
    }
    getContext() {
        return this.ctx;
    }
}
Renderer.Backends = RendererBackends;
Renderer.LineEndType = RendererLineEndType;
// Used by vexflow_test_helpers.ts
// Should this be private?
// Can we do this in a cleaner way?
Renderer.lastContext = undefined;
export { Renderer };
