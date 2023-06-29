import { createDOMRenderer } from '@griffel/core';
import type { GriffelRenderer } from '@griffel/core';

/**
 * Creates a renderer that renders <style> elements if .adoptedStyleSheets is not supported.
 */
export const createFallbackRenderer = (shadowRoot: ShadowRoot): GriffelRenderer => {
  const documentFallback: Partial<Document> = {
    head: shadowRoot as unknown as HTMLHeadElement,
    createElement: shadowRoot.ownerDocument.createElement.bind(shadowRoot.ownerDocument),
  };

  return createDOMRenderer(documentFallback as Document);
};
