/**
 * A version of makeStaticStyles() that accepts build output as an input and skips all runtime transforms & DOM insertion.
 *
 * @internal
 */
export function __staticCSS() {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  function useStaticStyles(): void {}

  return useStaticStyles;
}
