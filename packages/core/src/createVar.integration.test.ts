import { describe, it, expect, beforeEach } from 'vitest';
import { createVar } from './createVar.js';
import { makeStyles } from './makeStyles.js';
import { createDOMRenderer } from './renderer/createDOMRenderer.js';
import { griffelRendererSerializer } from './common/snapshotSerializers.js';
import type { GriffelRenderer } from './types.js';

expect.addSnapshotSerializer(griffelRendererSerializer);

describe('createVar + makeStyles integration', () => {
  let renderer: GriffelRenderer;

  beforeEach(() => {
    process.env.NODE_ENV = 'production';
    document.head.innerHTML = '';
    renderer = createDOMRenderer(document);
  });

  it('emits CSS with a resolved var name and makes the var usable as a key', () => {
    const colorVar = createVar();
    const placeholder = `${colorVar}`;
    const useStyles = makeStyles({
      root: {
        [placeholder]: 'blue',
        color: `var(${placeholder})`,
      },
    });

    const classes = useStyles({ dir: 'ltr', renderer });
    expect(classes.root).toMatch(/^___\w+/);

    // The rendered CSS must contain the resolved var name and NOT contain
    // any placeholder token.
    const cssText = renderer.stylesheets['d0']?.cssRules() ?? [];
    const cssStr = cssText.join('\n');
    expect(cssStr).not.toMatch(/--__g_var_p\d+__/);
    expect(cssStr).toMatch(/--fv-/);
    expect(cssStr).toMatch(/--fv-[\w-]+:\s*blue/);
    expect(cssStr).toContain('color: var(--fv-');
  });

  it('resolved var name is stable across renderers sharing the same makeStyles closure', () => {
    const colorVar = createVar();
    const placeholder = `${colorVar}`;
    const useStyles = makeStyles({
      root: {
        [placeholder]: 'blue',
        color: `var(${placeholder})`,
      },
    });

    const rendererServer = createDOMRenderer(document);
    const rendererClient = createDOMRenderer(document);

    const classesServer = useStyles({ dir: 'ltr', renderer: rendererServer });
    const classesClient = useStyles({ dir: 'ltr', renderer: rendererClient });

    // Same class names on both renderers (makeStyles caches the resolution).
    expect(classesClient.root).toEqual(classesServer.root);

    // After resolution, the var coerces to the stable resolved name.
    expect(`${colorVar}`).toMatch(/^--fv-/);
  });

  it('inline-style use of the var returns the resolved name after useStyles has run', () => {
    const colorVar = createVar();
    const placeholder = `${colorVar}`;
    const useStyles = makeStyles({
      root: { [placeholder]: 'blue', color: `var(${placeholder})` },
    });

    useStyles({ dir: 'ltr', renderer });

    // After useStyles runs, coercion returns the resolved name.
    const coerced = `${colorVar}`;
    expect(coerced).toMatch(/^--fv-/);

    // Simulated component-side usage: `{ [colorVar]: 'red' }` in inline style.
    const inline: Record<string, string> = { [colorVar as unknown as string]: 'red' };
    expect(Object.keys(inline)[0]).toEqual(coerced);
  });

  it('first-definer-wins: a var reused across makeStyles blocks has a single stable name', () => {
    const shared = createVar();
    const sharedPlaceholder = `${shared}`;

    const useA = makeStyles({ root: { [sharedPlaceholder]: 'red' } });
    const useB = makeStyles({ root: { color: `var(${sharedPlaceholder})` } });

    useA({ dir: 'ltr', renderer });
    const nameAfterA = `${shared}`;

    useB({ dir: 'ltr', renderer });
    const nameAfterB = `${shared}`;

    expect(nameAfterB).toEqual(nameAfterA);
    expect(nameAfterA).toMatch(/^--fv-/);
  });
});
