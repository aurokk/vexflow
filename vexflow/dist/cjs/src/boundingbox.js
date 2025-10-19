// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
export class BoundingBox {
    /**
     * Create a new copy.
     */
    static copy(that) {
        return new BoundingBox(that.x, that.y, that.w, that.h);
    }
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    /** Get x position. */
    getX() {
        return this.x;
    }
    /** Get y position. */
    getY() {
        return this.y;
    }
    /** Get width. */
    getW() {
        return this.w;
    }
    /** Get height. */
    getH() {
        return this.h;
    }
    /** Set x position. */
    setX(x) {
        this.x = x;
        return this;
    }
    /** Set y position. */
    setY(y) {
        this.y = y;
        return this;
    }
    /** Set width. */
    setW(w) {
        this.w = w;
        return this;
    }
    /** Set height. */
    setH(h) {
        this.h = h;
        return this;
    }
    /** Move to position. */
    move(x, y) {
        this.x += x;
        this.y += y;
        return this;
    }
    /** Clone. */
    clone() {
        return BoundingBox.copy(this);
    }
    /**
     * Merge my box with given box. Creates a bigger bounding box unless
     * the given box is contained in this one.
     */
    mergeWith(boundingBox) {
        const that = boundingBox;
        const new_x = this.x < that.x ? this.x : that.x;
        const new_y = this.y < that.y ? this.y : that.y;
        const new_w = Math.max(this.x + this.w, that.x + that.w) - new_x;
        const new_h = Math.max(this.y + this.h, that.y + that.h) - new_y;
        this.x = new_x;
        this.y = new_y;
        this.w = new_w;
        this.h = new_h;
        return this;
    }
}
