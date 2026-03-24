/** Accumulated shaker timings (ns). Only populated when `collectTimings` is true. */
export const shakerTimings = {
  oxcTransform: 0n,
  oxcParse: 0n,
  graphBuild: 0n,
  shake: 0n,
  calls: 0,
};

export let collectTimings = false;

export function enableTimings(enabled: boolean): void {
  collectTimings = enabled;
}

export function resetTimings(): void {
  shakerTimings.oxcTransform = 0n;
  shakerTimings.oxcParse = 0n;
  shakerTimings.graphBuild = 0n;
  shakerTimings.shake = 0n;
  shakerTimings.calls = 0;
}
