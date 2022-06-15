import { decode, SourceMapMappings } from 'sourcemap-codec';
import type {
  BasicSourceMap,
  IndexSourceMap,
  MixedSourceMap,
  ResultPosition,
  SearchPosition,
  SourceMapConsumerType,
} from './types';

// inspired by https://github.com/facebook/react/blob/522f47345f79bb117f338384e75c8a79622bd735/packages/react-devtools-shared/src/hooks/SourceMapConsumer.js#L37
export function SourceMapConsumer(sourceMapJSON: MixedSourceMap): SourceMapConsumerType {
  if ('sections' in sourceMapJSON) {
    return IndexedSourceMapConsumer(sourceMapJSON);
  } else {
    return BasicSourceMapConsumer(sourceMapJSON);
  }
}

function BasicSourceMapConsumer(sourceMapJSON: BasicSourceMap): SourceMapConsumerType {
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

    if (nearestEntry == null || nearestEntry.length < 4) {
      throw new Error(
        `[Griffel devtools] BasicSourceMapConsumer() Could not find runtime location for line:${lineNumber} and column:${columnNumber}`,
      );
    }

    const sourceIndex = nearestEntry[1];
    const sourceURL = sourceIndex !== undefined ? sourceMapJSON.sources[sourceIndex] : undefined;
    const resultLine = nearestEntry[2]! + 1;
    const resultColumn = nearestEntry[3]!;

    if (sourceURL === undefined) {
      throw new Error(
        `[Griffel devtools] BasicSourceMapConsumer() Could not find original source for line:${lineNumber} and column:${columnNumber}`,
      );
    }

    return {
      columnNumber: resultColumn,
      lineNumber: resultLine,
      sourceURL: sourceURL.replace(/\/.\//g, '/'),
    };
  }

  return { originalPositionFor };
}

type Section = {
  generatedColumn: number;
  generatedLine: number;
  map: MixedSourceMap;
  // Lazily parsed only when/as the section is needed.
  sourceMapConsumer: SourceMapConsumerType | null;
};

function IndexedSourceMapConsumer(sourceMapJSON: IndexSourceMap) {
  let lastOffset = {
    line: -1,
    column: 0,
  };

  const sections: Section[] = sourceMapJSON.sections.map(section => {
    const offset = section.offset;
    const offsetLine = offset.line;
    const offsetColumn = offset.column;

    if (offsetLine < lastOffset.line || (offsetLine === lastOffset.line && offsetColumn < lastOffset.column)) {
      throw new Error(
        '[Griffel devtools] IndexedSourceMapConsumer() Section offsets must be ordered and non-overlapping.',
      );
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
      throw new Error(
        `[Griffel devtools] IndexedSourceMapConsumer() Could not find matching section for line:${lineNumber} and column:${columnNumber}`,
      );
    }

    if (section.sourceMapConsumer === null) {
      // Lazily parse the section only when it's needed.
      section.sourceMapConsumer = SourceMapConsumer(section.map);
    }

    return section.sourceMapConsumer.originalPositionFor({
      columnNumber,
      lineNumber,
    });
  }

  return { originalPositionFor };
}
