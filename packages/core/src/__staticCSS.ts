/**
 * A version of makeStaticStyles() that accepts build output as an input and skips all runtime transforms & DOM insertion.
 *
 * @internal
 */
export function __staticCSS() {
  function useStaticStyles(): void {}

  return useStaticStyles;
}
