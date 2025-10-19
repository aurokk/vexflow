// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
// Note: Keep this module free of imports to reduce the chance of circular dependencies.
/** `RuntimeError` will be thrown by VexFlow classes in case of error. */
export class RuntimeError extends Error {
    constructor(code, message = '') {
        super('[RuntimeError] ' + code + ': ' + message);
        this.code = code;
    }
}
/** VexFlow can be used outside of the browser (e.g., Node) where `window` may not be defined. */
// eslint-disable-next-line
export function globalObject() {
    if (typeof globalThis !== 'undefined') {
        return globalThis;
    }
    if (typeof self !== 'undefined') {
        return self;
    }
    if (typeof window !== 'undefined') {
        return window;
    }
    if (typeof global !== 'undefined') {
        return global;
    }
    return Function('return this')();
}
/**
 * Check that `x` is of type `T` and not `undefined`.
 * If `x` is `undefined`, throw a RuntimeError with the optionally provided error code and message.
 */
export function defined(x, code = 'undefined', message = '') {
    if (x === undefined) {
        throw new RuntimeError(code, message);
    }
    return x;
}
/** Default log function sends all arguments to console. */
// eslint-disable-next-line
export function log(block, ...args) {
    if (!args)
        return;
    const line = Array.prototype.slice.call(args).join(' ');
    globalObject().console.log(block + ': ' + line);
}
/** Dump warning to console. */
// eslint-disable-next-line
export function warn(...args) {
    const line = args.join(' ');
    const err = new Error();
    globalObject().console.log('Warning: ', line, err.stack);
}
/** Round number to nearest fractional value (`.5`, `.25`, etc.) */
function roundN(x, n) {
    return x % n >= n / 2 ? parseInt(`${x / n}`, 10) * n + n : parseInt(`${x / n}`, 10) * n;
}
/** Locate the mid point between stave lines. Returns a fractional line if a space. */
export function midLine(a, b) {
    let mid_line = b + (a - b) / 2;
    if (mid_line % 2 > 0) {
        mid_line = roundN(mid_line * 10, 5) / 10;
    }
    return mid_line;
}
/**
 * Used by various classes (e.g., SVGContext) to provide a
 * unique prefix to element names (or other keys in shared namespaces).
 */
export function prefix(text) {
    return `vf-${text}`;
}
/**
 * Convert an arbitrary angle in radians to the equivalent one in the range [0, pi).
 */
export function normalizeAngle(a) {
    a = a % (2 * Math.PI);
    if (a < 0) {
        a += 2 * Math.PI;
    }
    return a;
}
/**
 * Return the sum of an array of numbers.
 */
export function sumArray(arr) {
    return arr.reduce((a, b) => a + b, 0);
}
