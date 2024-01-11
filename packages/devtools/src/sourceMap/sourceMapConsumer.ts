import type { MappedPosition, RawSourceMap } from 'source-map-js';
import { SourceMapConsumer } from 'source-map-js';

export const resources: Promise<chrome.devtools.inspectedWindow.Resource[]> = new Promise(resolve => {
  chrome.devtools.inspectedWindow.getResources(currResources => {
    resolve(currResources);
  });
});
chrome.devtools.inspectedWindow.onResourceAdded.addListener(async resource => {
  if (!resource.url.startsWith('debugger')) {
    (await resources).push(resource);
  }
});

export async function getOriginalPosition(sourceMapJSON: RawSourceMap, sourceLoc: MappedPosition) {
  const { source, line, column } = sourceLoc;
  try {
    const sourceMapConsumer = new SourceMapConsumer(sourceMapJSON);
    const result = sourceMapConsumer.originalPositionFor({ line, column });

    // The url in source map is not always the url used in chrome source tab.
    // We find the real url by searching the path of url in chrome resources.
    let originalSource = result.source;
    const path = getFilePath(result.source);
    if (path) {
      originalSource = (await resources).find(resource => resource.url.includes(path))?.url ?? originalSource;
    }

    return { ...result, source: originalSource };
  } catch (error) {
    console.error(`[Griffel devtools] unable to consume source map for ${source}:${line}:${column}`);
    console.error(error);
    return sourceLoc;
  }
}

/**
 * @param url
 * @returns path of the url, for example:
 * webpack-interal://src/a -> src/a
 * webpack://@test/pkg/src/a -> test/pkg/src/a
 * /pkg/src/a -> pkg/src/a
 */
export function getFilePath(url: string) {
  return url.match(/^([^:]+:\/\/|)([./@]*)(.*)$/)?.[3] ?? '';
}
