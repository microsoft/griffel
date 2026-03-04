/**
 * Evaluation cache for module results.
 * Copied from @linaria/babel-preset v3.0.0-beta.19, adapted to use `debug` package.
 */

import { createHash } from 'node:crypto';
import createDebug from 'debug';

const debug = createDebug('griffel:eval-cache');

const fileHashes = new Map<string, string>();
const evalCache = new Map<string, unknown>();
const fileKeys = new Map<string, string[]>();

const hash = (text: string): string => createHash('sha1').update(text).digest('base64');

let lastText = '';
let lastHash = hash(lastText);

const memoizedHash = (text: string): string => {
  if (lastText !== text) {
    lastHash = hash(text);
    lastText = text;
  }

  return lastHash;
};

const toKey = (filename: string, exports: string[]): string =>
  exports.length > 0 ? `${filename}:${exports.join(',')}` : filename;

export const clear = (): void => {
  fileHashes.clear();
  evalCache.clear();
  fileKeys.clear();
};

export const clearForFile = (filename: string): void => {
  const keys = fileKeys.get(filename) ?? [];

  if (keys.length === 0) {
    return;
  }

  debug('clear-for-file', filename);
  keys.forEach(key => {
    fileHashes.delete(key);
    evalCache.delete(key);
  });
  fileKeys.set(filename, []);
};

export const has = ([filename, ...exports]: string[], text: string): boolean => {
  const key = toKey(filename, exports);
  const textHash = memoizedHash(text);
  debug('has', `${key} ${textHash}`);
  return fileHashes.get(key) === textHash;
};

export const get = ([filename, ...exports]: string[], text: string): unknown => {
  const key = toKey(filename, exports);
  const textHash = memoizedHash(text);
  debug('get', `${key} ${textHash}`);

  if (fileHashes.get(key) !== textHash) {
    return undefined;
  }

  return evalCache.get(key);
};

export const set = ([filename, ...exports]: string[], text: string, value: unknown): void => {
  const key = toKey(filename, exports);
  const textHash = memoizedHash(text);
  debug('set', `${key} ${textHash}`);
  fileHashes.set(key, textHash);
  evalCache.set(key, value);

  if (!fileKeys.has(filename)) {
    fileKeys.set(filename, []);
  }

  fileKeys.get(filename)!.push(key);
};
