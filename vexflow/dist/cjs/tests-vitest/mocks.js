// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// TickContext Mocks
import { Fraction } from '../src/fraction';
import { Tickable } from '../src/tickable';
class MockTickable extends Tickable {
    constructor() {
        super(...arguments);
        this.ticks = new Fraction(1, 1);
        this.width = 0;
        this.ignore_ticks = false;
    }
    init() {
        // DO NOTHING.
    }
    getX() {
        // eslint-disable-next-line
        return this.tickContext.getX();
    }
    getIntrinsicTicks() {
        return this.ticks.value();
    }
    getTicks() {
        return this.ticks;
    }
    setTicks(t) {
        this.ticks = new Fraction(t, 1);
        return this;
    }
    // Called by TickContext.preFormat().
    getMetrics() {
        return {
            width: 0,
            glyphWidth: 0,
            notePx: this.width,
            modLeftPx: 0,
            modRightPx: 0,
            leftDisplacedHeadPx: 0,
            rightDisplacedHeadPx: 0,
            glyphPx: 0,
        };
    }
    getWidth() {
        return this.width;
    }
    setWidth(w) {
        this.width = w;
        return this;
    }
    setVoice(v) {
        this.voice = v;
        return this;
    }
    setStave(stave) {
        this.stave = stave;
        return this;
    }
    getStave() {
        return this.stave;
    }
    setTickContext(tc) {
        this.tickContext = tc;
        return this;
    }
    setIgnoreTicks(flag) {
        this.ignore_ticks = flag;
        return this;
    }
    shouldIgnoreTicks() {
        return this.ignore_ticks;
    }
    preFormat() {
        // DO NOTHING.
    }
    // eslint-disable-next-line
    draw(...args) {
        // DO NOTHING.
    }
}
export { MockTickable };
