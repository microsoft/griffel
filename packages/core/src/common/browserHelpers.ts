// Shared helpers and fixtures for Vitest browser-mode tests in @griffel/core.

import { commands as rawCommands } from 'vitest/browser';
import { createDOMRenderer, makeResetStyles, makeStyles, type GriffelResetStyle, type GriffelStyle } from '../index.js';

// Raw commands is typed as an empty `BrowserCommands` interface. Cast
// locally to expose the mouse commands we register in vitest.config.ts.
// Module augmentation against `vitest/internal/browser` cannot resolve
// under the spec tsconfig's `moduleResolution: "node"`.
export const commands = rawCommands as typeof rawCommands & {
  mouseDown(): Promise<void>;
  mouseUp(): Promise<void>;
};

// CSS named colors as rgb() strings for computed-style assertions.
export const COLORS = {
  WHITE: 'rgb(255, 255, 255)',
  YELLOW: 'rgb(255, 255, 0)',
  CYAN: 'rgb(0, 255, 255)',
  ORANGE: 'rgb(255, 165, 0)',
  BLUE: 'rgb(0, 0, 255)',
  RED: 'rgb(255, 0, 0)',
  BLACK: 'rgb(0, 0, 0)',
};

export function render(html: string): void {
  document.body.innerHTML = html;
}

export function getComputedBackgroundColor(el: Element): string {
  return getComputedStyle(el).backgroundColor;
}

export function getColor(el: Element): string {
  return getComputedStyle(el).color;
}

export function applyStyles<S extends string>(stylesBySlot: Record<S, GriffelStyle>): Record<S, string> {
  const getStyles = makeStyles(stylesBySlot);
  const renderer = createDOMRenderer(document);
  return getStyles({ dir: 'ltr', renderer });
}

export function applyResetStyles(styles: GriffelResetStyle): string {
  const getClassName = makeResetStyles(styles);
  const renderer = createDOMRenderer(document);
  return getClassName({ dir: 'ltr', renderer });
}

/**
 * Clears the DOM and removes Griffel's injected style sheets. Call from
 * `beforeEach` so each test starts from a clean document and an empty
 * renderer cache.
 */
export function resetBrowserTestState(): void {
  document.body.innerHTML = '';
  document.head.querySelectorAll('style[data-make-styles-bucket]').forEach(el => el.remove());
}
