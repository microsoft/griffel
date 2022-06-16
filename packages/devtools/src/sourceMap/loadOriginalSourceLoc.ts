import type { DebugSourceLoc } from '@griffel/core';
import { SourceMapConsumer } from './SourceMapConsumer';
import type { BasicSourceMap, IndexSourceMap, MixedSourceMap } from './types';

// TODO logging
const __DEBUG__ = 0;

// TODO holding to many sourceMapJSON may blow up memory
const sourceMapJSONCache: Map<string, MixedSourceMap> = new Map();

const getCacheKey = ({ sourceURL, lineNumber, columnNumber }: DebugSourceLoc, singleSourceMap = false) =>
  singleSourceMap ? sourceURL : `${sourceURL}:${lineNumber}:${columnNumber}`;

const getCachedSouceMapJSON = (sourceLoc: DebugSourceLoc) => {
  const cached = sourceMapJSONCache.get(sourceLoc.sourceURL);
  return cached ?? sourceMapJSONCache.get(getCacheKey(sourceLoc));
};

// inspired by https://github.com/facebook/react/blob/522f47345f79bb117f338384e75c8a79622bd735/packages/react-devtools-shared/src/hooks/parseHookNames/loadSourceAndMetadata.js#L97
export async function loadOriginalSourceLoc(sourceLoc: DebugSourceLoc): Promise<DebugSourceLoc> {
  const { sourceURL, lineNumber, columnNumber } = sourceLoc;

  let sourceMapJSON = getCachedSouceMapJSON(sourceLoc);
  if (!sourceMapJSON) {
    try {
      sourceMapJSON = await extractAndLoadSourceMapJSON(sourceLoc);
      if (!sourceMapJSON) {
        return sourceLoc;
      }
    } catch (error) {
      console.warn(`[Griffel devtools] unable to load source map for ${sourceURL}`);
      console.warn(error);
      return sourceLoc;
    }
  }

  try {
    const sourceMapConsumer = SourceMapConsumer(sourceMapJSON);
    const originLoc = sourceMapConsumer.originalPositionFor({
      columnNumber,
      lineNumber,
    });
    return originLoc;
  } catch (error) {
    console.warn(`[Griffel devtools] unable to consume source map for ${sourceURL}`);
    console.warn(error);
    return sourceLoc;
  }
}

async function extractAndLoadSourceMapJSON(sourceLoc: DebugSourceLoc) {
  const { sourceURL } = sourceLoc;
  const runtimeSourceCode = await fetchFiles(sourceURL);

  let sourceMapJSON;
  const externalSourceMapURLs = [];
  let sourceMapNum = 0;
  const sourceMapRegex = / ?sourceMappingURL=([^\s'"]+)/gm;

  let sourceMappingURLMatch = sourceMapRegex.exec(runtimeSourceCode);
  if (!sourceMappingURLMatch) {
    throw new Error(`[Griffel devtools] extractAndLoadSourceMapJSON() no source map find in ${sourceURL}`);
  }

  while (sourceMappingURLMatch) {
    sourceMapNum++;

    const sourceMappingURL = sourceMappingURLMatch[1];

    const hasInlineSourceMap = sourceMappingURL.indexOf('base64,') >= 0;
    if (hasInlineSourceMap) {
      try {
        // Web apps like Code Sandbox embed multiple inline source maps.
        // In this case, we need to loop through and find the right one.
        // We may also need to trim any part of this string that isn't based64 encoded data.
        const trimmed = sourceMappingURL.match(/base64,([a-zA-Z0-9+/=]+)/)?.[1] ?? '';
        const decoded = decodeBase64String(trimmed);
        const currSourceMapJSON = JSON.parse(decoded);

        if (__DEBUG__) {
          console.groupCollapsed('[Griffel devtools] extractAndLoadSourceMapJSON() Inline source map');
          console.log(sourceMapJSON);
          console.groupEnd();
        }

        if (sourceMapIncludesSource(currSourceMapJSON, sourceURL)) {
          sourceMapJSON = currSourceMapJSON;
          break;
        }
      } catch (error) {
        // We've likely encountered a string in the source code that looks like a source map but isn't.
        // Maybe the source code contains a "sourceMappingURL" comment or something similar.
        // In either case, let's skip this and keep looking.
      }
    } else {
      externalSourceMapURLs.push(sourceMappingURL);
      sourceMapNum++;
    }

    sourceMappingURLMatch = sourceMapRegex.exec(runtimeSourceCode);
  }

  // populate cache
  if (sourceMapJSON) {
    if (sourceMapNum > 1) {
      sourceMapJSONCache.set(getCacheKey(sourceLoc, false), sourceMapJSON);
    } else {
      if (sourceMapRegex.exec(runtimeSourceCode) === null) {
        sourceMapJSONCache.set(getCacheKey(sourceLoc, true), sourceMapJSON);
      } else {
        sourceMapJSONCache.set(getCacheKey(sourceLoc, false), sourceMapJSON);
      }
    }

    return sourceMapJSON;
  }

  // process external source map
  let sourceMappingURL = externalSourceMapURLs.pop();
  if (!sourceMappingURL) {
    throw new Error(
      `[Griffel devtools] extractAndLoadSourceMapJSON() encountered string "sourceMappingURL" in file ${sourceURL} that does not contain a valid source map`,
    );
  }

  if (externalSourceMapURLs.length > 0) {
    externalSourceMapURLs.forEach(sourceMappingURL => {
      console.warn(
        `[Griffel devtools] extractAndLoadSourceMapJSON() More than one external source map detected in the file ${sourceURL}; skipping "${sourceMappingURL}"`,
      );
    });
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

  sourceMapJSONCache.set(getCacheKey(sourceLoc, true), sourceMapJSON);

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
    throw new Error(`[Griffel devtools] fetchFiles() unable to fetch ${url}: ${err}`);
  }
  return '';
}

function sourceMapIncludesSource(sourcemap: MixedSourceMap, source: string): boolean {
  if (sourcemap.mappings === undefined) {
    const indexSourceMap: IndexSourceMap = sourcemap as IndexSourceMap;
    return indexSourceMap.sections.some(section => {
      return sourceMapIncludesSource(section.map, source);
    });
  }

  const basicMap: BasicSourceMap = sourcemap as BasicSourceMap;
  return basicMap.sources.some(s => s === 'Inline Babel script' || source.endsWith(s));
}
