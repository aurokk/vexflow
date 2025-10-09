import { Stave, StaveOptions } from './stave';
import { Category } from './typeguard';

export class ChordStave extends Stave {
  static get CATEGORY(): string {
    return Category.ChordStave;
  }

  constructor(x: number, y: number, width: number, options?: StaveOptions) {
    super(x, y, width, options);

    // make barlines invisible
    const config = [...Array(5)].map(() => ({ visible: false }));
    this.setConfigForLines(config);
  }
}
