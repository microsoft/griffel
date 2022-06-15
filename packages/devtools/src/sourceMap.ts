import type { DebugSourceMap } from '@griffel/core';
import { decode, SourceMapMappings } from 'sourcemap-codec';

type BasicSourceMap = {
  file?: string;
  mappings: string;
  names: string[];
  sourceRoot?: string;
  sources: string[];
  sourcesContent?: string[];
  version: number;
};

type IndexSourceMapSection = {
  map: IndexSourceMap | BasicSourceMap;
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

type MixedSourceMap = IndexSourceMap | BasicSourceMap;

type SearchPosition = {
  columnNumber: number;
  lineNumber: number;
};

type ResultPosition = {
  columnNumber: number;
  lineNumber: number;
  sourceContent: string;
  sourceURL: string;
};

type SourceMapConsumerType = {
  originalPositionFor: (searchPostion: SearchPosition) => ResultPosition;
};

function SourceMapConsumer(sourceMapJSON: MixedSourceMap | IndexSourceMap): SourceMapConsumerType {
  if ((sourceMapJSON as IndexSourceMap).sections != null) {
    return IndexedSourceMapConsumer(sourceMapJSON as IndexSourceMap);
  } else {
    return BasicSourceMapConsumer(sourceMapJSON as BasicSourceMap);
  }
}

function BasicSourceMapConsumer(sourceMapJSON: BasicSourceMap) {
  const decodedMappings: SourceMapMappings = decode(sourceMapJSON.mappings);

  function originalPositionFor({ columnNumber, lineNumber }: SearchPosition): ResultPosition {
    // Error.prototype.stack columns are 1-based (like most IDEs) but ASTs are 0-based.
    const targetColumnNumber = columnNumber - 1;

    const lineMappings = decodedMappings[lineNumber - 1];

    let nearestEntry = null;

    let startIndex = 0;
    let stopIndex = lineMappings.length - 1;
    let index = -1;
    while (startIndex <= stopIndex) {
      index = Math.floor((stopIndex + startIndex) / 2);
      nearestEntry = lineMappings[index];

      const currentColumn = nearestEntry[0];
      if (currentColumn === targetColumnNumber) {
        break;
      } else {
        if (currentColumn > targetColumnNumber) {
          if (stopIndex - index > 0) {
            stopIndex = index;
          } else {
            index = stopIndex;
            break;
          }
        } else {
          if (index - startIndex > 0) {
            startIndex = index;
          } else {
            index = startIndex;
            break;
          }
        }
      }
    }

    // We have found either the exact element, or the next-closest element.
    // However there may be more than one such element.
    // Make sure we always return the smallest of these.
    while (index > 0) {
      const previousEntry = lineMappings[index - 1];
      const currentColumn = previousEntry[0];
      if (currentColumn !== targetColumnNumber) {
        break;
      }
      index--;
    }

    if (nearestEntry == null) {
      // TODO maybe fall back to the runtime source instead of throwing?
      throw Error(`Could not find runtime location for line:${lineNumber} and column:${columnNumber}`);
    }

    const sourceIndex = nearestEntry[1];
    const sourceContent = sourceMapJSON.sourcesContent != null ? sourceMapJSON.sourcesContent[sourceIndex!] : null;
    const sourceURL = sourceMapJSON.sources[sourceIndex!] ?? null;
    const line = nearestEntry[2]! + 1;
    const column = nearestEntry[3];

    if (sourceContent === null || sourceURL === null) {
      // TODO maybe fall back to the runtime source instead of throwing?
      throw Error(`Could not find original source for line:${lineNumber} and column:${columnNumber}`);
    }

    return {
      columnNumber: column!,
      lineNumber: line,
      sourceContent: sourceContent,
      // normalize sourceURL
      sourceURL: sourceURL.replace(/\/.\//g, '/'),
    };
  }

  return { originalPositionFor };
}

function IndexedSourceMapConsumer(sourceMapJSON: IndexSourceMap) {
  let lastOffset = {
    line: -1,
    column: 0,
  };

  const sections = sourceMapJSON.sections.map(section => {
    const offset = section.offset;
    const offsetLine = offset.line;
    const offsetColumn = offset.column;

    if (offsetLine < lastOffset.line || (offsetLine === lastOffset.line && offsetColumn < lastOffset.column)) {
      throw new Error('Section offsets must be ordered and non-overlapping.');
    }

    lastOffset = offset;

    return {
      // The offset fields are 0-based, but we use 1-based indices when encoding/decoding from VLQ.
      generatedLine: offsetLine + 1,
      generatedColumn: offsetColumn + 1,
      map: section.map,
      sourceMapConsumer: null,
    };
  });

  function originalPositionFor({ columnNumber, lineNumber }: SearchPosition): ResultPosition {
    // Error.prototype.stack columns are 1-based (like most IDEs) but ASTs are 0-based.
    const targetColumnNumber = columnNumber - 1;

    let section = null;

    let startIndex = 0;
    let stopIndex = sections.length - 1;
    let index = -1;
    while (startIndex <= stopIndex) {
      index = Math.floor((stopIndex + startIndex) / 2);
      section = sections[index];

      const currentLine = section.generatedLine;
      if (currentLine === lineNumber) {
        const currentColumn = section.generatedColumn;
        if (currentColumn === lineNumber) {
          break;
        } else {
          if (currentColumn > targetColumnNumber) {
            if (stopIndex - index > 0) {
              stopIndex = index;
            } else {
              index = stopIndex;
              break;
            }
          } else {
            if (index - startIndex > 0) {
              startIndex = index;
            } else {
              index = startIndex;
              break;
            }
          }
        }
      } else {
        if (currentLine > lineNumber) {
          if (stopIndex - index > 0) {
            stopIndex = index;
          } else {
            index = stopIndex;
            break;
          }
        } else {
          if (index - startIndex > 0) {
            startIndex = index;
          } else {
            index = startIndex;
            break;
          }
        }
      }
    }

    if (section == null) {
      // TODO maybe fall back to the runtime source instead of throwing?
      throw Error(`Could not find matching section for line:${lineNumber} and column:${columnNumber}`);
    }

    if (section.sourceMapConsumer === null) {
      // Lazily parse the section only when it's needed.
      // @ts-ignore
      section.sourceMapConsumer = new SourceMapConsumer(section.map);
    }

    // @ts-ignore
    return section.sourceMapConsumer.originalPositionFor({
      columnNumber,
      lineNumber,
    });
  }

  return { originalPositionFor };
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

export type SourceMapPosition = DebugSourceMap & {
  locationOrigin: string;
};

// inspired by https://github.com/facebook/react/blob/50263d3273b6fc983acc5b0fd52e670399b248b1/packages/react-devtools-shared/src/hooks/parseHookNames/loadSourceAndMetadata.js#L97
export const parseSourceMap = async ({
  sourceURL,
  locationOrigin,
  lineNumber,
  columnNumber,
}: SourceMapPosition): Promise<DebugSourceMap> => {
  // const url = 'http://localhost:4400/main.iframe.bundle.js';
  // const locationOrigin = 'http://localhost:4400';
  // const lineNumber = 77;

  // load source file
  const response = await fetch(sourceURL);
  if (!response.ok) {
    // Bail, jump to processed js
    return new Promise(resolve => resolve({ lineNumber, columnNumber, sourceURL }));
  }
  const runtimeSourceCode = await response.text();

  // find and extract sourcemap
  let sourceMapJSON;
  const externalSourceMapURLs = [];
  const sourceMapRegex = / ?sourceMappingURL=([^\s'"]+)/gm;
  let sourceMappingURLMatch = sourceMapRegex.exec(runtimeSourceCode);
  if (!sourceMappingURLMatch) {
    // Bail, jump to processed js
    return new Promise(resolve => resolve({ lineNumber, columnNumber, sourceURL }));
  }
  while (sourceMappingURLMatch) {
    const sourceMappingURL = sourceMappingURLMatch[1];

    const hasInlineSourceMap = sourceMappingURL.indexOf('base64,') >= 0;
    if (hasInlineSourceMap) {
      try {
        // TODO (named hooks) deduplicate parsing in this branch (similar to fetching in the other branch)
        // since there can be multiple location keys per source map.

        // Web apps like Code Sandbox embed multiple inline source maps.
        // In this case, we need to loop through and find the right one.
        // We may also need to trim any part of this string that isn't based64 encoded data.
        const trimmed = sourceMappingURL.match(/base64,([a-zA-Z0-9+/=]+)/)?.[1] ?? '';
        const decoded = decodeBase64String(trimmed);

        sourceMapJSON = JSON.parse(decoded);

        // TODO wth??
        // // Hook source might be a URL like "https://4syus.csb.app/src/App.js"
        // // Parsed source map might be a partial path like "src/App.js"
        // if (sourceMapIncludesSource(sourceMapJSON, runtimeSourceURL)) {
        //   hookSourceAndMetadata.sourceMapJSON = sourceMapJSON;

        //   break;
        // }
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
        console.warn(`More than one external source map detected in the source file; skipping "${sourceMappingURL}"`);
      });
    }

    if (!sourceMappingURL) {
      // Bail, jump to processed js
      return new Promise(resolve => resolve({ lineNumber, columnNumber, sourceURL }));
    }

    if (!sourceMappingURL.startsWith('http') && !sourceMappingURL.startsWith('/')) {
      // Resolve paths relative to the location of the file name
      sourceMappingURL = `${locationOrigin}/${sourceMappingURL}`;
    }

    const response = await fetch(sourceMappingURL);
    if (!response.ok) {
      // Bail, jump to processed js
      return new Promise(resolve => resolve({ lineNumber, columnNumber, sourceURL }));
    }
    const sourceMapContent = await response.text();
    sourceMapJSON = JSON.parse(sourceMapContent);
  }

  const sourceMapConsumer = SourceMapConsumer(sourceMapJSON);

  return new Promise(resolve =>
    resolve(
      sourceMapConsumer.originalPositionFor({
        columnNumber,
        lineNumber,
      }),
    ),
  );
};
