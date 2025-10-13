// Vitest Test Helpers for VexFlow
// Equivalent to vexflow_test_helpers.ts but for Vitest

import { ContextBuilder, Factory, Flow, Font, RenderContext, Renderer } from '../src/index';

import { expect } from 'vitest';

// Re-export ContextBuilder for use in test files
export type { ContextBuilder };

export interface TestOptions {
  elementId: string;
  params: any;
  backend: number;
  contextBuilder?: ContextBuilder;
}

// Vitest assert object that mimics QUnit's assert
export interface Assert {
  ok(value: any, message?: string): void;
  equal(actual: any, expected: any, message?: string): void;
  notEqual(actual: any, expected: any, message?: string): void;
  strictEqual(actual: any, expected: any, message?: string): void;
  propEqual(actual: any, expected: any, message?: string): void;
  throws(fn: () => void, expected?: RegExp | string, message?: string): void;
}

// Create a Vitest-compatible assert object
export function createAssert(): Assert {
  return {
    ok: (value: any, message?: string) => expect(value, message).toBeTruthy(),
    equal: (actual: any, expected: any, message?: string) => expect(actual, message).toBe(expected),
    notEqual: (actual: any, expected: any, message?: string) => expect(actual, message).not.toBe(expected),
    strictEqual: (actual: any, expected: any, message?: string) => expect(actual, message).toBe(expected),
    propEqual: (actual: any, expected: any, message?: string) => expect(actual, message).toEqual(expected),
    throws: (fn: () => void, expected?: RegExp | string, message?: string) => {
      if (expected) {
        expect(fn, message).toThrow(expected);
      } else {
        expect(fn, message).toThrow();
      }
    },
  };
}

// Font stacks for testing
export const FONT_STACKS: Record<string, string[]> = {
  Bravura: ['Bravura', 'Custom'],
  Gonville: ['Gonville', 'Bravura', 'Custom'],
  Petaluma: ['Petaluma', 'Gonville', 'Bravura', 'Custom'],
  Leland: ['Leland', 'Bravura', 'Custom'],
};

// Test configuration for different backends
const CANVAS_TEST_CONFIG = {
  backend: Renderer.Backends.CANVAS,
  tagName: 'canvas',
  testType: 'Canvas',
  fontStacks: ['Bravura'],
};

const SVG_TEST_CONFIG = {
  backend: Renderer.Backends.SVG,
  tagName: 'div',
  testType: 'SVG',
  fontStacks: ['Bravura', 'Gonville', 'Petaluma', 'Leland'],
};

let testIdCounter = 0;

export function generateTestID(prefix: string): string {
  return `${prefix}_${testIdCounter++}`;
}

export function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, '_');
}

export function createTest(elementId: string, testTitle: string, tagName: string, titleId: string = ''): HTMLElement {
  // Create or get the test output element directly
  let vexOutput = document.getElementById(elementId) as HTMLElement;
  if (!vexOutput) {
    vexOutput = document.createElement(tagName);
    vexOutput.className = 'vex-tabdiv';
    vexOutput.id = elementId;

    // Append it to document.body so it can be found by ID
    document.body.appendChild(vexOutput);
  }

  return vexOutput;
}

export function makeFactory(backend: number, elementId: string, width: number = 450, height: number = 140): Factory {
  return new Factory({ renderer: { elementId, backend, width, height } });
}

export function plotLegendForNoteWidth(ctx: RenderContext, x: number, y: number): void {
  ctx.save();
  ctx.setFont(Font.SANS_SERIF, 8);

  const spacing = 12;
  let lastY = y;

  function legend(color: string, text: string) {
    ctx.beginPath();
    ctx.setStrokeStyle(color);
    ctx.setFillStyle(color);
    ctx.setLineWidth(10);
    ctx.moveTo(x, lastY - 4);
    ctx.lineTo(x + 10, lastY - 4);
    ctx.stroke();

    ctx.setFillStyle('black');
    ctx.fillText(text, x + 15, lastY);
    lastY += spacing;
  }

  legend('green', 'Note + Flag');
  legend('red', 'Modifiers');
  legend('#999', 'Displaced Head');
  legend('#DDD', 'Formatter Shift');

  ctx.restore();
}

// Helper to run tests with both Canvas and SVG backends
export function runWithBackends(
  name: string,
  testFunc: (options: TestOptions) => void,
  params?: any,
  runCanvas: boolean = true,
  runSVG: boolean = true
) {
  const configs = [];
  if (runCanvas) configs.push(CANVAS_TEST_CONFIG);
  if (runSVG) configs.push(SVG_TEST_CONFIG);

  configs.forEach(({ backend, tagName, testType, fontStacks }) => {
    fontStacks.forEach((fontStackName: string) => {
      const elementId = generateTestID(`${testType.toLowerCase()}_${fontStackName}`);
      const title = `${name} › ${testType} + ${fontStackName}`;
      const titleId = `${sanitizeName(name)}.${fontStackName}`;

      createTest(elementId, title, tagName, titleId);

      const options: TestOptions = { elementId, params, backend };

      // Set the font stack for this test
      const originalFontNames = Flow.getMusicFont();
      Flow.setMusicFont(...FONT_STACKS[fontStackName]);

      try {
        testFunc(options);
      } finally {
        // Restore original font
        Flow.setMusicFont(...originalFontNames);
      }
    });
  });
}

export const concat = (a: any[], b: any[]): any[] => a.concat(b);

export const MAJOR_KEYS = ['C', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#'];

export const MINOR_KEYS = [
  'Am',
  'Dm',
  'Gm',
  'Cm',
  'Fm',
  'Bbm',
  'Ebm',
  'Abm',
  'Em',
  'Bm',
  'F#m',
  'C#m',
  'G#m',
  'D#m',
  'A#m',
];
