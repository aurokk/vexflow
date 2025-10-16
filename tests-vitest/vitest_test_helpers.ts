// Vitest Test Helpers for VexFlow
// Equivalent to vexflow_test_helpers.ts but for Vitest

import { ContextBuilder, Factory, Flow, Font, RenderContext, Renderer } from '../src/index';

import { server } from '@vitest/browser/context';
import { Canvg } from 'canvg';
import pixelmatch from 'pixelmatch';
import * as UPNG from 'upng-js';
import { expect } from 'vitest';

// Re-export ContextBuilder for use in test files
export type { ContextBuilder };

export interface TestOptions {
  elementId: string;
  params: any;
  backend: number;
  contextBuilder?: ContextBuilder;
  testName?: string;
  fontStackName?: string;
  width?: number;
  height?: number;
  scale?: number;
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
    ok: (value: any, message?: string) => expect(value).toBeTruthy(),
    equal: (actual: any, expected: any, message?: string) => expect(actual).toBe(expected),
    notEqual: (actual: any, expected: any, message?: string) => expect(actual).not.toBe(expected),
    strictEqual: (actual: any, expected: any, message?: string) => expect(actual).toBe(expected),
    propEqual: (actual: any, expected: any, message?: string) => expect(actual).toEqual(expected),
    throws: (fn: () => void, expected?: RegExp | string, message?: string) => {
      if (expected) {
        expect(fn).toThrow(expected);
      } else {
        expect(fn).toThrow();
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

export function makeFactory(
  backend: number,
  elementId: string,
  width: number = 450,
  height: number = 140,
  testOptions?: TestOptions
): Factory {
  // Store dimensions in testOptions for screenshot comparison
  if (testOptions) {
    testOptions.width = width;
    testOptions.height = height;
  }
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

// Screenshot comparison utilities
const { readFile, writeFile } = server.commands;

function buf2hex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, '0')).join('');
}

function hex2buf(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes.buffer;
}

export interface ScreenshotOptions {
  filepath: string;
  width: number;
  height: number;
}

/**
 * Reads or saves a screenshot PNG file.
 *
 * Behavior:
 * - If the file doesn't exist, it saves the new screenshot and returns it
 * - If the file exists, it returns the existing screenshot for comparison
 *
 * Usage:
 * - Normal mode: `npm run test:vitest` or `npm run test:vitest:ci` - compares against existing screenshots
 * - To update screenshots: `npm run test:vitest:clean` then re-run tests
 */
export async function readOrSaveScreenshot(newpng: ArrayBuffer, options: ScreenshotOptions): Promise<ArrayBuffer> {
  const { filepath } = options;

  let oldpng: ArrayBuffer | null = null;

  // Try to read existing screenshot
  try {
    const oldhex = await readFile(filepath, { encoding: 'hex' });
    oldpng = hex2buf(oldhex);
  } catch {
    // File doesn't exist, will create it below
  }

  // If no existing screenshot, save the new one
  if (!oldpng) {
    const newhex = buf2hex(newpng);
    await writeFile(filepath, newhex, { encoding: 'hex' });
    const oldhex = await readFile(filepath, { encoding: 'hex' });
    oldpng = hex2buf(oldhex);
  }

  return oldpng;
}

/**
 * Captures a canvas screenshot and encodes it as PNG.
 */
export function captureCanvasScreenshot(canvas: HTMLCanvasElement): ArrayBuffer {
  const width = canvas.width;
  const height = canvas.height;
  const imageData = canvas.getContext('2d')!.getImageData(0, 0, width, height).data;
  return UPNG.encode([imageData.buffer], width, height, 0);
}

/**
 * Captures an SVG screenshot by converting it to a canvas and encoding as PNG.
 */
export async function captureSvgScreenshot(svgHTML: string, width: number, height: number): Promise<ArrayBuffer> {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  const canvg = Canvg.fromString(context, svgHTML);
  canvg.resize(width, height, true);
  await canvg.render();

  const imageData = context.getImageData(0, 0, width, height).data;
  return UPNG.encode([imageData.buffer], width, height, 0);
}

/**
 * Compares two PNG buffers and returns the pixel difference percentage.
 */
export function compareScreenshots(oldpng: ArrayBuffer, newpng: ArrayBuffer, width: number, height: number): number {
  const oldDecoded = UPNG.decode(oldpng);
  const newDecoded = UPNG.decode(newpng);

  const diff = pixelmatch(
    new Uint8Array(UPNG.toRGBA8(oldDecoded)[0]),
    new Uint8Array(UPNG.toRGBA8(newDecoded)[0]),
    new Uint8Array(width * height * 4),
    width,
    height
  );

  return (diff * 100) / (width * height * 4);
}

/**
 * Custom Vitest matcher to assert that screenshot difference is within a threshold.
 */
export function toMatchScreenshotWithinPercent(received: number, threshold: number = 1) {
  const pass = received <= threshold;

  return {
    pass,
    message: () =>
      pass
        ? `Expected screenshot difference ${received.toFixed(4)}% to exceed ${threshold}%`
        : `Expected screenshot difference ${received.toFixed(4)}% to be within ${threshold}%`,
  };
}

/**
 * Custom Vitest matcher to assert that screenshot difference is within 1%.
 * This is a convenience wrapper around toMatchScreenshotWithinPercent with a 1% threshold.
 */
export function toMatchScreenshotWithinOnePercent(received: number) {
  return toMatchScreenshotWithinPercent(received, 1);
}

/**
 * All-in-one screenshot comparison for rendering tests.
 *
 * This function:
 * 1. Captures a screenshot (Canvas or SVG based on backend)
 * 2. Reads or saves the reference screenshot
 * 3. Compares the screenshots and asserts the difference is within threshold
 *
 * @param options - Test options containing elementId, backend, testName, and fontStackName
 * @param testFilename - The test file name (e.g., 'accidental_tests.test.ts')
 * @param threshold - Maximum allowed pixel difference percentage (default: 1%)
 *
 * @example
 * // In your test:
 * await expectMatchingScreenshot(options, 'accidental_tests.test.ts');
 */
export async function expectMatchingScreenshot(
  options: TestOptions,
  testFilename: string,
  threshold: number = 1
): Promise<void> {
  if (options.backend === Renderer.Backends.CANVAS) {
    const canvas = document.getElementById(options.elementId) as HTMLCanvasElement;
    const width = canvas.width;
    const height = canvas.height;
    const filepath = `tests-vitest/__screenshots__/${testFilename}/${options.testName} - Canvas - ${options.fontStackName}.png`;

    const newpng = captureCanvasScreenshot(canvas);
    const oldpng = await readOrSaveScreenshot(newpng, { filepath, width, height });
    const diffPercentage = compareScreenshots(oldpng, newpng, width, height);

    expect(diffPercentage).toMatchScreenshotWithinPercent(threshold);
  } else if (options.backend === Renderer.Backends.SVG) {
    const div = document.getElementById(options.elementId) as HTMLDivElement;
    const svg = div.querySelector('svg') as SVGSVGElement;

    if (!svg) {
      throw new Error(`No SVG element found in ${options.elementId}`);
    }

    // Extract dimensions directly from the SVG element
    const svgWidth = parseFloat(svg.getAttribute('width') || '700');
    const svgHeight = parseFloat(svg.getAttribute('height') || '240');

    // Use scale from options if available, otherwise default to 2x for higher quality screenshots
    const scale = options.scale ?? 2;
    const width = Math.round(svgWidth * scale);
    const height = Math.round(svgHeight * scale);

    const filepath = `tests-vitest/__screenshots__/${testFilename}/${options.testName} - SVG - ${options.fontStackName}.png`;

    const newpng = await captureSvgScreenshot(div.innerHTML, width, height);
    const oldpng = await readOrSaveScreenshot(newpng, { filepath, width, height });
    const diffPercentage = compareScreenshots(oldpng, newpng, width, height);

    expect(diffPercentage).toMatchScreenshotWithinPercent(threshold);
  }
}
