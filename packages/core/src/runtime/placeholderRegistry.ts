/**
 * @internal
 * Shared registry for createVar() placeholders. Lives in its own module so
 * that `resolveVarsInStyles` can look up resolved names without importing
 * `createVar.ts` (which would pull the factory into every makeStyles bundle).
 */
export interface PlaceholderEntry {
  _placeholder: string;
  _resolved: string | undefined;
}

const registry = new Map<string, PlaceholderEntry>();

export function __internal_registerPlaceholder(entry: PlaceholderEntry): void {
  registry.set(entry._placeholder, entry);
}

export function __internal_resolvePlaceholder(placeholder: string, resolvedName: string): void {
  const entry = registry.get(placeholder);
  if (entry && entry._resolved === undefined) {
    entry._resolved = resolvedName;
  }
}

export function __internal_getResolvedName(placeholder: string): string | undefined {
  return registry.get(placeholder)?._resolved;
}

export function __internal_getPlaceholderEntry(placeholder: string): PlaceholderEntry | undefined {
  return registry.get(placeholder);
}
