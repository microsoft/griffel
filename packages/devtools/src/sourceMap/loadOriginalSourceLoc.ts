import type { DebugSourceLoc } from '@griffel/core';
import { SourceMapConsumer } from './SourceMapConsumer';
import type { MixedSourceMap } from './types';

// TODO logging
const __DEBUG__ = 0;

// TODO holding to many sourceMapJSON may blow up memory
const sourceMapJSONCache: Map<string, MixedSourceMap> = new Map();

// inspired by https://github.com/facebook/react/blob/522f47345f79bb117f338384e75c8a79622bd735/packages/react-devtools-shared/src/hooks/parseHookNames/loadSourceAndMetadata.js#L97
export async function loadOriginalSourceLoc({
  sourceURL,
  lineNumber,
  columnNumber,
}: DebugSourceLoc): Promise<DebugSourceLoc> {
  let sourceMapJSON = sourceMapJSONCache.get(sourceURL);
  if (!sourceMapJSON) {
    sourceMapJSON = await extractAndLoadSourceMapJSON(sourceURL);
  }
  if (!sourceMapJSON) {
    // Bail, jump to processed js
    return new Promise(resolve => resolve({ lineNumber, columnNumber, sourceURL }));
  }
  sourceMapJSONCache.set(sourceURL, sourceMapJSON);

  const sourceMapConsumer = SourceMapConsumer(sourceMapJSON);
  try {
    const origianLoc = sourceMapConsumer.originalPositionFor({
      columnNumber,
      lineNumber,
    });
    return origianLoc;
  } catch (error) {
    console.warn(`[Griffel devtools] unable to consume source map for ${sourceURL}`);
    console.warn(error);
    return {
      sourceURL,
      lineNumber,
      columnNumber,
    };
  }
}

async function extractAndLoadSourceMapJSON(sourceURL: string) {
  const runtimeSourceCode = await fetchFiles(sourceURL);

  let sourceMapJSON;
  const externalSourceMapURLs = [];
  const sourceMapRegex = / ?sourceMappingURL=([^\s'"]+)/gm;

  let sourceMappingURLMatch = sourceMapRegex.exec(runtimeSourceCode);
  if (!sourceMappingURLMatch) {
    console.warn(`[Griffel devtools] extractAndLoadSourceMapJSON() no source map find in ${sourceURL}`);
    return undefined;
  }

  while (sourceMappingURLMatch) {
    const sourceMappingURL = sourceMappingURLMatch[1];

    const hasInlineSourceMap = sourceMappingURL.indexOf('base64,') >= 0;
    if (hasInlineSourceMap) {
      try {
        // Web apps like Code Sandbox embed multiple inline source maps.
        // In this case, we need to loop through and find the right one.
        // We may also need to trim any part of this string that isn't based64 encoded data.
        const trimmed = sourceMappingURL.match(/base64,([a-zA-Z0-9+/=]+)/)?.[1] ?? '';
        const decoded = decodeBase64String(trimmed);
        sourceMapJSON = JSON.parse(decoded);

        if (__DEBUG__) {
          console.groupCollapsed('[Griffel devtools] extractAndLoadSourceMapJSON() Inline source map');
          console.log(sourceMapJSON);
          console.groupEnd();
        }
      } catch (error) {
        // We've likely encountered a string in the source code that looks like a source map but isn't.
        // Maybe the source code contains a "sourceMappingURL" comment or something similar.
        // In either case, let's skip this and keep looking.
      }
    } else {
      externalSourceMapURLs.push(sourceMappingURL);
    }

    sourceMappingURLMatch = sourceMapRegex.exec(runtimeSourceCode);
  }

  if (!sourceMapJSON) {
    let sourceMappingURL = externalSourceMapURLs.pop();
    if (externalSourceMapURLs.length > 0) {
      externalSourceMapURLs.forEach(sourceMappingURL => {
        console.warn(
          `[Griffel devtools] extractAndLoadSourceMapJSON() More than one external source map detected in the source file; skipping "${sourceMappingURL}"`,
        );
      });
    }

    if (!sourceMappingURL) {
      console.warn(
        `[Griffel devtools] extractAndLoadSourceMapJSON() encountered string "sourceMappingURL" in file ${sourceURL} that does not contain a valid source map`,
      );
      return undefined;
    }

    if (!sourceMappingURL.startsWith('http') && !sourceMappingURL.startsWith('/')) {
      // Resolve paths relative to the location of the file name
      const lastSlashIdx = sourceURL.lastIndexOf('/');
      if (lastSlashIdx !== -1) {
        const baseURL = sourceURL.slice(0, lastSlashIdx);
        sourceMappingURL = `${baseURL}/${sourceMappingURL}`;
      }
    }

    const sourceMapContent = await fetchFiles(sourceMappingURL);
    sourceMapJSON = JSON.parse(sourceMapContent);
  }

  return sourceMapJSON;
}

function decodeBase64String(encoded: string): string {
  if (typeof atob === 'function') {
    return atob(encoded);
  } else if (typeof Buffer !== 'undefined' && Buffer !== null && typeof Buffer.from === 'function') {
    return Buffer.from(encoded, 'base64').toString('utf-8');
  } else {
    throw Error('Cannot decode base64 string');
  }
}

async function fetchFiles(url: string) {
  try {
    const response = await fetch(url);
    if (response.ok) {
      return await response.text();
    }
  } catch (err) {
    console.warn(`[Griffel devtools] fetchFiles() unable to fetch ${url}`, err);
  }
  return '';
}
