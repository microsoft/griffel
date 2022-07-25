import { SourceMapConsumer, MappedPosition, RawSourceMap } from 'source-map-js';

export function getOriginalPosition(sourceMapJSON: RawSourceMap, sourceLoc: MappedPosition) {
  const { source, line, column } = sourceLoc;
  try {
    const sourceMapConsumer = new SourceMapConsumer(sourceMapJSON);
    const result = sourceMapConsumer.originalPositionFor({ line, column });
    return { ...result, source: normalizeWebpackURL(sourceMapJSON, result.source) };
  } catch (error) {
    console.error(`[Griffel devtools] unable to consume source map for ${source}:${line}:${column}`);
    console.error(error);
    return sourceLoc;
  }
}

/**
 * Normalized source url if it came from webpack sourcemap;
 * returns a valid url that can be used to view file in chrome source tab
 */
function normalizeWebpackURL(sourceMapJSON: RawSourceMap | IndexSourceMap, originalSource: string) {
  const matchGroups = originalSource.match(/^(webpack:\/\/)(.*)$/);
  const scheme = matchGroups?.[1];
  const path = matchGroups?.[2];
  if (scheme && path) {
    if (path.startsWith('@')) {
      // By default path start with name in package.json ([output.devtoolnamespace](https://webpack.js.org/configuration/output/#outputdevtoolnamespace)).
      // It may contain '@' symbol which is ommited in chrome source tab
      return `${scheme}${path.slice(1)}`;
    } else {
      let topDir = findWebpackNamespace(sourceMapJSON, path);
      if (topDir) {
        if (topDir.startsWith('@')) {
          topDir = topDir.slice(1);
        }
        if (!path.startsWith(topDir)) {
          // In chrome source tab, all original sources are placed under one directory.
          // SourceMapConsumer reads the url in source map and normalize it, and the directory name can get removed.
          // Example url in source map: "webpack://@testscope/testname/../../component/src/styles.js"
          // After normalized by SourceMapConsumer: "webpack://component/src/styles.js"
          // Real url used in chrome source tab: "webpack://testscope/component/src/styles.js"
          return `${scheme}${topDir}/${path}`;
        }
      }
    }
  }
  return originalSource;
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

function findWebpackNamespace(
  sourceMapJSON: RawSourceMap | IndexSourceMap,
  originalSourcePath: string,
): string | undefined {
  if (sourceMapJSON.mappings === undefined) {
    for (const section of (sourceMapJSON as IndexSourceMap).sections) {
      const result = findWebpackNamespace(section.map, originalSourcePath);
      if (result) {
        return result;
      }
    }
    return undefined;
  }

  return (sourceMapJSON as RawSourceMap).sources.find(s => s.includes(originalSourcePath))?.split('/')?.[2];
}

export function sourceMapIncludesSource(sourcemap: RawSourceMap | IndexSourceMap, source: string): boolean {
  if (sourcemap.mappings === undefined) {
    return (sourcemap as IndexSourceMap).sections.some(section => {
      return sourceMapIncludesSource(section.map, source);
    });
  }

  return (sourcemap as RawSourceMap).sources.some(
    s => s === 'Inline Babel script' || s.includes(source.replace(/^webpack-internal:\/\/\//, '')),
  );
}
