import { GRIFFEL_VAR_PLACEHOLDER_PREFIX, GRIFFEL_VAR_PLACEHOLDER_SUFFIX } from './constants.js';
import type { GriffelVar } from '@griffel/style-types';
import {
  type PlaceholderEntry,
  __internal_registerPlaceholder,
  __internal_resolvePlaceholder,
  __internal_getResolvedName,
  __internal_getPlaceholderEntry,
} from './runtime/placeholderRegistry.js';
import { __registerVarResolver } from './runtime/resolveStyleRules.js';
import { resolveVarsInStyles } from './runtime/resolveVarsInStyles.js';

// Loading this module wires the var resolver into the makeStyles engine.
// Consumers who never import createVar never pay for the walker/registry:
// resolveStyleRules skips resolution when no resolver is registered.
__registerVarResolver(resolveVarsInStyles);

interface InternalGriffelVar extends GriffelVar, PlaceholderEntry {}

let placeholderCounter = 0;

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

  __internal_registerPlaceholder(ref);
  return ref;
}

export { __internal_resolvePlaceholder, __internal_getResolvedName };

/**
 * @internal
 * Returns the GriffelVar ref associated with a placeholder, or undefined
 * if the placeholder is not registered. Used by tests.
 */
export function __internal_getPlaceholderOwner(placeholder: string): GriffelVar | undefined {
  return __internal_getPlaceholderEntry(placeholder) as GriffelVar | undefined;
}
