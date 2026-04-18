import { GRIFFEL_VAR_PLACEHOLDER_PREFIX, GRIFFEL_VAR_PLACEHOLDER_SUFFIX } from './constants.js';
import type { GriffelVar } from '@griffel/style-types';

interface InternalGriffelVar extends GriffelVar {
  _placeholder: string;
  _resolved: string | undefined;
}

let placeholderCounter = 0;
const registry = new Map<string, InternalGriffelVar>();

/**
 * Creates a reference to a unique CSS custom property.
 *
 * **Must be called at module (program) scope**, bound to a `const`. Do not
 * call inside a function or component body — the returned reference must be
 * shared across renders for SSR output to be stable.
 *
 * **Must be referenced as a key (`[v]: ...`) in at least one `makeStyles`
 * block** before any component render. Vars used only in inline styles
 * (`style={{[v]: 'red'}}`) with no defining `makeStyles` will never be
 * resolved and their internal placeholder string will leak to the DOM.
 *
 * Usage:
 * ```ts
 * const colorVar = createVar();
 *
 * const useStyles = makeStyles({
 *   root: {
 *     [colorVar]: 'blue',                 // DEFINITION
 *     color: `var(${colorVar})`,          // READ
 *   },
 * });
 *
 * function Flex({ color }) {
 *   const classes = useStyles();
 *   return <div className={classes.root} style={{ [colorVar]: color }} />;
 * }
 * ```
 */
export function createVar(): GriffelVar {
  const placeholder = GRIFFEL_VAR_PLACEHOLDER_PREFIX + placeholderCounter++ + GRIFFEL_VAR_PLACEHOLDER_SUFFIX;

  const ref = {
    _placeholder: placeholder,
    _resolved: undefined,
    toString(this: InternalGriffelVar) {
      return this._resolved ?? this._placeholder;
    },
    [Symbol.toPrimitive](this: InternalGriffelVar) {
      return this._resolved ?? this._placeholder;
    },
  } as unknown as InternalGriffelVar;

  registry.set(placeholder, ref);
  return ref;
}

/**
 * @internal
 * Resolves a placeholder to its final CSS variable name. First resolution wins;
 * subsequent calls are no-ops. Called by `resolveStyleRules` after it has
 * computed the block's content hash.
 */
export function __internal_resolvePlaceholder(placeholder: string, resolvedName: string): void {
  const ref = registry.get(placeholder);
  if (ref && ref._resolved === undefined) {
    ref._resolved = resolvedName;
  }
}

/**
 * @internal
 * Returns the GriffelVar ref associated with a placeholder, or undefined
 * if the placeholder is not registered. Used by tests and by resolveStyleRules
 * to look up an already-resolved name.
 */
export function __internal_getPlaceholderOwner(placeholder: string): GriffelVar | undefined {
  return registry.get(placeholder);
}

/**
 * @internal
 * Returns the already-resolved name for a placeholder, or undefined if not
 * yet resolved. Does not trigger resolution.
 */
export function __internal_getResolvedName(placeholder: string): string | undefined {
  return registry.get(placeholder)?._resolved;
}
