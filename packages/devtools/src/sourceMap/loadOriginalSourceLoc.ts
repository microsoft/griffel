import type { MappedPosition, RawSourceMap } from 'source-map-js';
import { getFilePath, getOriginalPosition, resources } from './sourceMapConsumer';

// when only one source map appears in a source file: source url -> source map JSON
// when more than one source maps appear in a source file: `${source}:${line}:${column}` -> source map JSON
const sourceMapJSONs: Map<string, RawSourceMap> = new Map();

const getComputedSouceMapJSON = ({ source, line, column }: MappedPosition) => {
  return sourceMapJSONs.get(source) ?? sourceMapJSONs.get(`${source}:${line}:${column}`);
};

export async function loadOriginalSourceLoc(sourceUrlWithLoc: string): Promise<MappedPosition> {
  const paths = sourceUrlWithLoc.split(':');
  const column = Number(paths.pop());
  const line = Number(paths.pop());
  const source = paths.join(':');
  if (Number.isNaN(line) || Number.isNaN(column)) {
    return { source, line: 1, column: 0 };
  }
  const sourceLoc: MappedPosition = { source, line, column };

  const sourceMapJSON = getComputedSouceMapJSON(sourceLoc);
  if (sourceMapJSON) {
    return getOriginalPosition(sourceMapJSON, sourceLoc);
  }

  try {
    return extractAndLoadSourceMapJSON(sourceLoc);
  } catch (error) {
    console.warn(`[Griffel devtools] unable to load source map for ${sourceUrlWithLoc}`);
    console.warn(error);
    return sourceLoc;
  }
}

// inspired by https://github.com/facebook/react/blob/b66936ece7d9ad41a33e077933c9af0bda8bff87/packages/react-devtools-shared/src/hooks/parseHookNames/loadSourceAndMetadata.js#L135
async function extractAndLoadSourceMapJSON(sourceLoc: MappedPosition): Promise<MappedPosition> {
  const { source, line, column } = sourceLoc;

  const runtimeSourceCode = await fetchFiles(source);

  const externalSourceMapURLs = [];
  let sourceMapNum = 0;
  const sourceMapRegex = / ?sourceMappingURL=([^\s'"]+)/gm;

  let sourceMappingURLMatch = sourceMapRegex.exec(runtimeSourceCode);
  if (!sourceMappingURLMatch) {
    throw new Error(`[Griffel devtools] extractAndLoadSourceMapJSON() no source map found in ${source}`);
  }

  while (sourceMappingURLMatch) {
    sourceMapNum++;
    const sourceMappingURL = sourceMappingURLMatch[1];

    const hasInlineSourceMap = sourceMappingURL.indexOf('base64,') >= 0;
    if (hasInlineSourceMap) {
      try {
        // Web apps like Code Sandbox embed multiple inline source maps.
        // In this case, we need to loop through and find the right one.
        const trimmed = sourceMappingURL.match(/base64,([a-zA-Z0-9+/=]+)/)?.[1] ?? '';
        const decoded = decodeBase64String(trimmed);
        const sourceMapJSON = JSON.parse(decoded);

        // TODO optionally turn on debug message
        // if (__DEBUG__) {
        //   console.groupCollapsed('[Griffel devtools] extractAndLoadSourceMapJSON() Inline source map');
        //   console.log(sourceMapJSON);
        //   console.groupEnd();
        // }

        if (sourceMapIncludesSource(sourceMapJSON, getFilePath(source))) {
          // store computed sourceMapJSON
          if (sourceMapNum > 1) {
            sourceMapJSONs.set(`${source}:${line}:${column}`, sourceMapJSON);
          } else {
            if (sourceMapRegex.exec(runtimeSourceCode) === null) {
              sourceMapJSONs.set(source, sourceMapJSON);
            } else {
              sourceMapJSONs.set(`${source}:${line}:${column}`, sourceMapJSON);
            }
          }

          return getOriginalPosition(sourceMapJSON, sourceLoc);
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

  // No inline sourcemap found. Check if there's external source map
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
    const lastSlashIdx = source.lastIndexOf('/');
    if (lastSlashIdx !== -1) {
      const baseURL = source.slice(0, lastSlashIdx);
      sourceMappingURL = `${baseURL}/${sourceMappingURL}`;
    }
  }

  const sourceMapContent = await fetchFiles(sourceMappingURL);
  const sourceMapJSON = JSON.parse(sourceMapContent);
  sourceMapJSONs.set(source, sourceMapJSON);

  return getOriginalPosition(sourceMapJSON, sourceLoc);
}

async function fetchFiles(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (response.ok) {
      return response.text();
    }
    throw new Error(`[Griffel devtools] fetchRuntimeSource() bad response fetching ${url}: ${response.status}`);
  } catch (error) {
    // try to get url content from chrome resources api
    const resource = (await resources).find(resource => resource.url === url);
    if (resource) {
      return new Promise(resolve => resource.getContent(content => resolve(content)));
    }
    throw new Error(`[Griffel devtools] fetchFiles() unable to fetch ${url}: ${error}`);
  }
}

function decodeBase64String(encoded: string): string {
  if (typeof atob === 'function') {
    return atob(encoded);
  } else if (typeof Buffer !== 'undefined' && Buffer !== null && typeof Buffer.from === 'function') {
    return Buffer.from(encoded, 'base64').toString('utf-8');
  } else {
    throw Error('[Griffel devtools] Cannot decode base64 string');
  }
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
function sourceMapIncludesSource(sourcemap: RawSourceMap | IndexSourceMap, sourcePath: string): boolean {
  if (sourcemap.mappings === undefined) {
    return (sourcemap as IndexSourceMap).sections.some(section => {
      return sourceMapIncludesSource(section.map, sourcePath);
    });
  }

  return (sourcemap as RawSourceMap).sources.some(s => s === 'Inline Babel script' || s.includes(sourcePath));
}
