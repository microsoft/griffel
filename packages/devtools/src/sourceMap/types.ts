import type { DebugSourceLoc } from '@griffel/core';

export type BasicSourceMap = {
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

export type IndexSourceMap = {
  file?: string;
  mappings?: void;
  sourcesContent?: void;
  sections: IndexSourceMapSection[];
  version: number;
};

export type MixedSourceMap = IndexSourceMap | BasicSourceMap;

export type SearchPosition = Pick<DebugSourceLoc, 'columnNumber' | 'lineNumber'>;
export type ResultPosition = DebugSourceLoc;
export type SourceMapConsumerType = {
  originalPositionFor: (searchPostion: SearchPosition) => ResultPosition;
};
