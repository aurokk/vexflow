// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author: Ron B. Yeh
// MIT License
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Use instead of `instanceof` as a more flexible type guard.
 * @param obj check if this object's CATEGORY matches the provided category.
 * @param category a string representing a category of VexFlow objects.
 * @param checkAncestors defaults to `true`, so we walk up the prototype chain to look for a matching `CATEGORY`.
 *        If `false`, we do not check the superclass or other ancestors.
 * @returns true if `obj` has a static `CATEGORY` property that matches `category`.
 */
export function isCategory(obj, category, checkAncestors = true) {
    // obj is undefined, a number, a primitive string, or null.
    if (typeof obj !== 'object' || obj === null) {
        return false;
    }
    // `obj.constructor` is a reference to the constructor function that created the `obj` instance.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/constructor
    let constructorFcn = obj.constructor;
    // Check if the object's static .CATEGORY matches the provided category.
    if (checkAncestors) {
        // Walk up the prototype chain to look for a matching obj.constructor.CATEGORY.
        while (obj !== null) {
            constructorFcn = obj.constructor;
            if ('CATEGORY' in constructorFcn && constructorFcn.CATEGORY === category) {
                return true;
            }
            obj = Object.getPrototypeOf(obj);
        }
        return false;
    }
    else {
        // Do not walk up the prototype chain. Just check this particular object's static .CATEGORY string.
        return 'CATEGORY' in constructorFcn && constructorFcn.CATEGORY === category;
    }
}
export const isAccidental = (obj) => isCategory(obj, "Accidental" /* Category.Accidental */);
export const isAnnotation = (obj) => isCategory(obj, "Annotation" /* Category.Annotation */);
export const isBarline = (obj) => isCategory(obj, "Barline" /* Category.Barline */);
export const isChordNote = (obj) => isCategory(obj, "ChordNote" /* Category.ChordNote */);
export const isChordStave = (obj) => isCategory(obj, "ChordStave" /* Category.ChordStave */);
export const isDot = (obj) => isCategory(obj, "Dot" /* Category.Dot */);
export const isGraceNote = (obj) => isCategory(obj, "GraceNote" /* Category.GraceNote */);
export const isGraceNoteGroup = (obj) => isCategory(obj, "GraceNoteGroup" /* Category.GraceNoteGroup */);
export const isNote = (obj) => isCategory(obj, "Note" /* Category.Note */);
export const isRenderContext = (obj) => isCategory(obj, "RenderContext" /* Category.RenderContext */);
export const isStaveNote = (obj) => isCategory(obj, "StaveNote" /* Category.StaveNote */);
export const isStemmableNote = (obj) => isCategory(obj, "StemmableNote" /* Category.StemmableNote */);
export const isTabNote = (obj) => isCategory(obj, "TabNote" /* Category.TabNote */);
