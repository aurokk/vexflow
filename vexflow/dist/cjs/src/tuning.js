// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
import { Tables } from './tables';
import { RuntimeError } from './util';
/** `Tuning` implements varies types of tunings for tablature. */
export class Tuning {
    static get names() {
        return {
            standard: 'E/5,B/4,G/4,D/4,A/3,E/3',
            dagdad: 'D/5,A/4,G/4,D/4,A/3,D/3',
            dropd: 'E/5,B/4,G/4,D/4,A/3,D/3',
            eb: 'Eb/5,Bb/4,Gb/4,Db/4,Ab/3,Db/3',
            standardBanjo: 'D/5,B/4,G/4,D/4,G/5',
            doubleCBanjo: 'D/5,C/5,G/4,C/4,G/5',
            doubleDBanjo: 'E/5,D/5,A/4,D/4,A/5',
            sawmillBanjo: 'D/5,C/5,G/4,D/4,G/5',
        };
    }
    /**
     * Constructor.
     * @param tuningString tuning name (eg. 'dagdad') or comma separated note strings
     */
    constructor(tuningString = 'E/5,B/4,G/4,D/4,A/3,E/3,B/2,E/2') {
        this.tuningValues = [];
        // Default to standard tuning.
        this.setTuning(tuningString);
    }
    /** Return the note number associated to the note string. */
    noteToInteger(noteString) {
        var _a;
        return (_a = Tables.keyProperties(noteString).int_value) !== null && _a !== void 0 ? _a : -1;
    }
    /**
     * Set tuning identified by tuning name (eg. 'dagdad')
     * @param tuningString tuning name (eg. 'dagdad') or comma separated note strings
     */
    setTuning(tuningString) {
        if (Tuning.names[tuningString]) {
            tuningString = Tuning.names[tuningString];
        }
        this.tuningValues = [];
        const keys = tuningString.split(/\s*,\s*/);
        if (keys.length === 0) {
            throw new RuntimeError('BadArguments', `Invalid tuning string: ${tuningString}`);
        }
        for (let i = 0; i < keys.length; ++i) {
            this.tuningValues[i] = this.noteToInteger(keys[i]);
        }
    }
    /** Return the note number associated with a tablature string. */
    getValueForString(stringNum) {
        const s = Number(stringNum);
        if (s < 1 || s > this.tuningValues.length) {
            throw new RuntimeError('BadArguments', `String number must be between 1 and ${this.tuningValues.length}:${stringNum}`);
        }
        return this.tuningValues[s - 1];
    }
    /** Return the note number associated with a tablature string and fret. */
    getValueForFret(fretNum, stringNum) {
        const stringValue = this.getValueForString(stringNum);
        const f = Number(fretNum);
        if (f < 0) {
            throw new RuntimeError('BadArguments', `Fret number must be 0 or higher: ${fretNum}`);
        }
        return stringValue + f;
    }
    /** Return the note string associated with tablature string and fret. */
    getNoteForFret(fretNum, stringNum) {
        const noteValue = this.getValueForFret(fretNum, stringNum);
        const octave = Math.floor(noteValue / 12);
        const value = noteValue % 12;
        return `${Tables.integerToNote(value)}/${octave}`;
    }
}
