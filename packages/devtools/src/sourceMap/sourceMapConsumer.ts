import { SourceMapConsumer, MappedPosition, RawSourceMap } from 'source-map-js';

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
    return { ...result, source: await getSourceTabURL(result.source) };
  } catch (error) {
    console.error(`[Griffel devtools] unable to consume source map for ${source}:${line}:${column}`);
    console.error(error);
    return sourceLoc;
  }
}

/**
 * The source url in sourcemap is not always a valid url for chrome source tab.
 */
async function getSourceTabURL(originalSource: string) {
  // example:
  // originalSource: webpack://src/a -> path: src/a
  // originalSource: webpack://@test/pkg/src/a -> path: test/pkg/src/a
  // originalSource: /pkg/src/a -> path: pkg/src/a
  const path = originalSource.match(/^([a-z]+:\/\/|)([./@]*)(.*)$/)?.[3] ?? '';
  if (path) {
    return (await resources).find(resource => resource.url.includes(path))?.url ?? originalSource;
  }

  return originalSource;
}
