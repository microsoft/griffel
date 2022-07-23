import { SourceMapConsumer, MappedPosition, RawSourceMap } from 'source-map-js';

// TODO logging
const __DEBUG__ = 0;

// TODO holding too many sourceMapJSON may blow up memory
const sourceMapJSONCache: Map<string, RawSourceMap> = new Map();

const getCachedSouceMapJSON = ({ source, line, column }: MappedPosition) => {
  return sourceMapJSONCache.get(source) ?? sourceMapJSONCache.get(`${source}:${line}:${column}`);
};

// inspired by https://github.com/facebook/react/blob/522f47345f79bb117f338384e75c8a79622bd735/packages/react-devtools-shared/src/hooks/parseHookNames/loadSourceAndMetadata.js#L97
export async function loadOriginalSourceLoc(sourceUrlWithLoc: string): Promise<MappedPosition> {
  const paths = sourceUrlWithLoc.split(':');
  const columnStr = paths.pop();
  const lineStr = paths.pop();
  const source = paths.join(':');

  const line = Number(lineStr);
  const column = Number(columnStr);
  const sourceLoc: MappedPosition = { source, line, column };
  if (Number.isNaN(line) || Number.isNaN(column)) {
    return sourceLoc;
  }

  let sourceMapJSON = getCachedSouceMapJSON(sourceLoc);
  if (!sourceMapJSON) {
    try {
      sourceMapJSON = await extractAndLoadSourceMapJSON(sourceLoc);
      if (!sourceMapJSON) {
        return sourceLoc;
      }
    } catch (error) {
      console.warn(`[Griffel devtools] unable to load source map for ${sourceUrlWithLoc}`);
      console.warn(error);
      return sourceLoc;
    }
  }

  try {
    const sourceMapConsumer = new SourceMapConsumer(sourceMapJSON);
    const result = sourceMapConsumer.originalPositionFor({ line, column });
    return { ...result, source: normalizeWebpackURL(result.source) };
  } catch (error) {
    console.warn(`[Griffel devtools] unable to consume source map for ${sourceUrlWithLoc}`);
    console.warn(error);
    return sourceLoc;
  }
}

function normalizeWebpackURL(source: string) {
  // example source: "webpack://@testscope/root/packages/test1/src/App.styles.js"
  // expected result: "webpack://testscope/root/packages/test1/src/App.styles.js"
  const matchGroups = source.match(/^(webpack:\/\/)(.*)$/);
  const scheme = matchGroups?.[1];
  const path = matchGroups?.[2];
  if (scheme && path) {
    if (path.startsWith('@')) {
      return `${scheme}${path.slice(1)}`;
    }
  }
  return source;
}

async function extractAndLoadSourceMapJSON(sourceLoc: MappedPosition) {
  const { source, line, column } = sourceLoc;
  const runtimeSourceCode = await fetchFiles(source);

  let sourceMapJSON;
  const externalSourceMapURLs = [];
  let sourceMapNum = 0;
  const sourceMapRegex = / ?sourceMappingURL=([^\s'"]+)/gm;

  let sourceMappingURLMatch = sourceMapRegex.exec(runtimeSourceCode);
  if (!sourceMappingURLMatch) {
    throw new Error(`[Griffel devtools] extractAndLoadSourceMapJSON() no source map find in ${source}`);
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

        if (sourceMapIncludesSource(currSourceMapJSON, source)) {
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

  if (sourceMapJSON) {
    // populate cache
    if (sourceMapNum > 1) {
      sourceMapJSONCache.set(`${source}:${line}:${column}`, sourceMapJSON);
    } else {
      if (sourceMapRegex.exec(runtimeSourceCode) === null) {
        sourceMapJSONCache.set(source, sourceMapJSON);
      } else {
        sourceMapJSONCache.set(`${source}:${line}:${column}`, sourceMapJSON);
      }
    }

    return sourceMapJSON;
  }

  // process external source map
  let sourceMappingURL = externalSourceMapURLs.pop();
  if (!sourceMappingURL) {
    throw new Error(
      `[Griffel devtools] extractAndLoadSourceMapJSON() encountered string "sourceMappingURL" in file ${source} that does not contain a valid source map`,
    );
  }

  if (externalSourceMapURLs.length > 0) {
    console.warn(
      `[Griffel devtools] extractAndLoadSourceMapJSON() More than one external source map detected in the file ${source}:`,
    );
    externalSourceMapURLs.forEach(sourceMappingURL => {
      console.warn(`[Griffel devtools] extractAndLoadSourceMapJSON() skipping source map "${sourceMappingURL}"`);
    });
  }

  if (!sourceMappingURL.startsWith('http') && !sourceMappingURL.startsWith('/')) {
    // Resolve paths relative to the location of the file name
    const lastSlashIdx = source.lastIndexOf('/');
    if (lastSlashIdx !== -1) {
      const baseURL = source.slice(0, lastSlashIdx);
      sourceMappingURL = `${baseURL}/${sourceMappingURL}`;
    }
  }

  const sourceMapContent = await fetchFiles(sourceMappingURL);
  sourceMapJSON = JSON.parse(sourceMapContent);

  sourceMapJSONCache.set(source, sourceMapJSON);

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

type IndexSourceMapSection = {
  map: IndexSourceMap | RawSourceMap;
  offset: {
    line: number;
    column: number;
  };
};
type IndexSourceMap = {
  file?: string;
  mappings?: void;
  sourcesContent?: void;
  sections: IndexSourceMapSection[];
  version: number;
};
function sourceMapIncludesSource(sourcemap: RawSourceMap | IndexSourceMap, source: string): boolean {
  if (sourcemap.mappings === undefined) {
    return (sourcemap as IndexSourceMap).sections.some(section => {
      return sourceMapIncludesSource(section.map, source);
    });
  }

  return (sourcemap as RawSourceMap).sources.some(s => s === 'Inline Babel script' || source.endsWith(s));
}