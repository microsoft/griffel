import type { MappedPosition, RawSourceMap } from 'source-map-js';
import { getFilePath, getOriginalPosition, resources } from './sourceMapConsumer';

// when only one source map appears in a source file: source url -> source map JSON
// when more than one source maps appear in a source file: `${source}:${line}:${column}` -> source map JSON
const sourceMapJSONs: Map<string, RawSourceMap> = new Map();

function getComputedSourceMapJSON({ source, line, column }: MappedPosition) {
  return sourceMapJSONs.get(source) ?? sourceMapJSONs.get(`${source}:${line}:${column}`);
}

export async function loadOriginalSourceLoc(sourceUrlWithLoc: string): Promise<MappedPosition> {
  const sourceLoc = parseSourceUrl(sourceUrlWithLoc);
  if (sourceLoc === null) {
    return { source: sourceUrlWithLoc, line: 1, column: 0 };
  }

  const sourceMapJSON = getComputedSourceMapJSON(sourceLoc);
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

function parseSourceUrl(sourceUrlWithLoc: string): MappedPosition | null {
  const paths = sourceUrlWithLoc.split(':');
  const column = Number(paths.pop());
  const line = Number(paths.pop());

  let source = paths.join(':');
  try {
    // url can contain relative path when webpack is used; normalize it
    const { protocol, pathname } = new URL(source);
    if (!protocol.startsWith('http')) {
      const absPathname = new URL(`http://${pathname}`).pathname; // URL only normalizes pathname for http/https
      source = `${protocol}//${absPathname}`;
    }
  } catch (error) {
    console.warn(error);
  }

  if (Number.isNaN(line) || Number.isNaN(column)) {
    return null;
  }
  return { source, line, column };
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
        const decoded = atob(trimmed);
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
    // Files with external source maps should only have a single source map.
    // More than one result might indicate an edge case,
    // like a string in the source code that matched our "sourceMappingURL" regex.
    // We should just skip over cases like this.
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
    throw error;
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
function isRawSourceMap(sourcemap: RawSourceMap | IndexSourceMap): sourcemap is RawSourceMap {
  return sourcemap.mappings !== undefined;
}
function sourceMapIncludesSource(sourcemap: RawSourceMap | IndexSourceMap, sourcePath: string): boolean {
  if (isRawSourceMap(sourcemap)) {
    return sourcemap.sources.some(s => s === 'Inline Babel script' || s.includes(sourcePath));
  }
  return sourcemap.sections.some(section => {
    return sourceMapIncludesSource(section.map, sourcePath);
  });
}
