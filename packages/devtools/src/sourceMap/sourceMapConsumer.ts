import { SourceMapConsumer, MappedPosition, RawSourceMap } from 'source-map-js';

export function getOriginalPosition(sourceMapJSON: RawSourceMap, sourceLoc: MappedPosition) {
  const { source, line, column } = sourceLoc;
  try {
    const sourceMapConsumer = new SourceMapConsumer(sourceMapJSON);
    const result = sourceMapConsumer.originalPositionFor({ line, column });
    return { ...result, source: normalizeWebpackURL(sourceMapJSON, result.source) };
  } catch (error) {
    console.warn(`[Griffel devtools] unable to consume source map for ${source}:${line}:${column}`);
    console.warn(error);
    return sourceLoc;
  }
}

function normalizeWebpackURL(sourceMapJSON: RawSourceMap | IndexSourceMap, originalSource: string) {
  // example originalSource: "webpack://@testscope/root/packages/test1/src/App.styles.js"
  // expected result: "webpack://testscope/root/packages/test1/src/App.styles.js"
  const matchGroups = originalSource.match(/^(webpack:\/\/)(.*)$/);
  const scheme = matchGroups?.[1];
  const path = matchGroups?.[2];
  if (scheme && path) {
    if (path.startsWith('@')) {
      return `${scheme}${path.slice(1)}`;
    } else {
      let webpackNamespace = findWebpackNamespace(sourceMapJSON, path);
      if (webpackNamespace) {
        if (webpackNamespace.startsWith('@')) {
          webpackNamespace = webpackNamespace.slice(1);
        }
        if (!path.startsWith(webpackNamespace)) {
          return `${scheme}${webpackNamespace}/${path}`;
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
