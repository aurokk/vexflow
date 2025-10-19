// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// Utility methods used by the rest of the VexFlow codebase.
import { Flow } from './flow';
import { log, RuntimeError } from './util';
class Vex {
    // Users of `Vex.forEach(a, fn)` should use `Array.prototype.forEach()` instead.
    // static forEach<T>(arr: T[], callbackFn: (value: T, index: number, array: T[]) => void) {
    //   arr.forEach(callbackFn);
    // }
    /**
     * Take `arr` and return a new list consisting of the sorted, unique,
     * contents of arr. Does not modify `arr`.
     */
    // eslint-disable-next-line
    static sortAndUnique(arr, cmp, eq) {
        if (arr.length > 1) {
            const newArr = [];
            let last;
            arr.sort(cmp);
            for (let i = 0; i < arr.length; ++i) {
                if (i === 0 || !eq(arr[i], last)) {
                    newArr.push(arr[i]);
                }
                last = arr[i];
            }
            return newArr;
        }
        else {
            return arr;
        }
    }
    /** Check if array `arr` contains `obj`. */
    // eslint-disable-next-line
    static contains(arr, obj) {
        let i = arr.length;
        while (i--) {
            if (arr[i] === obj) {
                return true;
            }
        }
        return false;
    }
    // Get the 2D Canvas context from DOM element `canvas_sel`.
    static getCanvasContext(canvasSelector) {
        if (!canvasSelector) {
            throw new RuntimeError('BadArgument', 'Invalid canvas selector: ' + canvasSelector);
        }
        const canvas = document.getElementById(canvasSelector);
        if (!(canvas && canvas.getContext)) {
            throw new RuntimeError('UnsupportedBrowserError', 'This browser does not support HTML5 Canvas');
        }
        return canvas.getContext('2d');
    }
    /** Benchmark. Run function `f` once and report time elapsed shifted by `s` milliseconds. */
    // eslint-disable-next-line
    static benchmark(s, f) {
        const start_time = new Date().getTime();
        f();
        const elapsed = new Date().getTime() - start_time;
        log(s, elapsed + 'ms');
    }
    // Get stack trace.
    static stackTrace() {
        const err = new Error();
        return err.stack;
    }
}
Vex.Flow = Flow;
export { Vex };
