/* eslint-disable @typescript-eslint/no-unused-vars */
export const colorToStop = (() => {
  const x: number; // triggers evaluation crash
  return 'red';
})();
