// Global type declarations for Vitest custom matchers

import 'vitest';

declare module 'vitest' {
  interface Assertion<T = any> {
    /**
     * Asserts that screenshot difference percentage is within a given threshold.
     * @param threshold - The maximum allowed difference percentage (default: 1%)
     * @example
     * expect(diffPercentage).toMatchScreenshotWithinPercent(0.5)
     * expect(diffPercentage).toMatchScreenshotWithinPercent(2)
     */
    toMatchScreenshotWithinPercent(threshold?: number): T;

    /**
     * Asserts that screenshot difference is within 1%.
     * This is a convenience wrapper around toMatchScreenshotWithinPercent(1).
     * @example
     * expect(diffPercentage).toMatchScreenshotWithinOnePercent()
     */
    toMatchScreenshotWithinOnePercent(): T;
  }

  interface AsymmetricMatchersContaining {
    /**
     * Asserts that screenshot difference percentage is within a given threshold.
     * @param threshold - The maximum allowed difference percentage (default: 1%)
     */
    toMatchScreenshotWithinPercent(threshold?: number): any;

    /**
     * Asserts that screenshot difference is within 1%.
     */
    toMatchScreenshotWithinOnePercent(): any;
  }
}
