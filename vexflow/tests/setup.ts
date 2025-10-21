// Vitest setup file
// This runs before all tests

import { Vex } from '../src/index';

import { beforeAll, beforeEach, expect } from 'vitest';

import { loadAllMusicFonts } from '../src/fonts/load_all';
import { loadTextFonts } from '../src/fonts/textfonts';
import { toMatchScreenshotWithinOnePercent, toMatchScreenshotWithinPercent } from './vitest_test_helpers';

// Extend Vitest matchers with custom screenshot matchers
expect.extend({
  toMatchScreenshotWithinPercent,
  toMatchScreenshotWithinOnePercent,
});

// Load VexFlow fonts before all tests
beforeAll(() => {
  // Load all music fonts and text fonts synchronously
  loadAllMusicFonts();
  loadTextFonts();

  // Set up global Vex object for backward compatibility tests
  const globalObj = typeof window !== 'undefined' ? window : (global as any);
  globalObj.Vex = Vex;
});

// Setup global environment before each test
beforeEach(() => {
  // Mock global objects that tests might expect
  const globalObj = typeof window !== 'undefined' ? window : (global as any);
  if (typeof globalObj.$ === 'undefined') {
    globalObj.$ = (param: HTMLElement | string) => {
      let element: HTMLElement;
      if (typeof param !== 'string') {
        element = param;
      } else if (param.startsWith('<')) {
        const tagName = param.match(/[A-Za-z]+/g)![0];
        element = document.createElement(tagName);
      } else {
        element = document.querySelector(param) as HTMLElement;
      }

      const $element = {
        get(index: number) {
          return element;
        },
        addClass(c: string) {
          element.classList.add(c);
          return $element;
        },
        text(t: string) {
          element.textContent = t;
          return $element;
        },
        html(h?: string) {
          if (!h) {
            return element.innerHTML;
          } else {
            element.innerHTML = h;
            return $element;
          }
        },
        append(...elementsToAppend: HTMLElement[]) {
          elementsToAppend.forEach((e) => {
            element.appendChild(e);
          });
          return $element;
        },
        attr(attrName: string, val: string) {
          element.setAttribute(attrName, val);
          return $element;
        },
      };
      return $element;
    };
  }

  // Add basic styling to make rendered output visible
  if (!document.getElementById('vitest-vexflow-styles')) {
    const style = document.createElement('style');
    style.id = 'vitest-vexflow-styles';
    style.textContent = `
      body {
        padding: 20px;
        background: #f5f5f5;
      }
      canvas, div[id^="annotation_test"] {
        display: block;
        margin: 10px;
        border: 1px solid #ccc;
        background: white;
      }
    `;
    document.head.appendChild(style);
  }
});
