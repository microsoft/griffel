import { SourceMapConsumer, MappedPosition, RawSourceMap } from 'source-map-js';

const urls = new Set<string>();
chrome.devtools.inspectedWindow.onResourceAdded.addListener(resource => {
  if (!resource.url.startsWith('debugger')) {
    urls.add(resource.url);
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
function getSourceTabURL(originalSource: string) {
  return new Promise<string>(resolve => {
    // example:
    // originalSource: webpack://src/a -> path: src/a
    // originalSource: webpack://@test/pkg/src/a -> path: test/pkg/src/a
    // originalSource: /pkg/src/a -> path: pkg/src/a
    const path = originalSource.match(/^([a-z]+:\/\/|)([./@]*)(.*)$/)?.[3] ?? '';
    if (!path) {
      resolve(originalSource);
    }

    if (urls.size) {
      urls.forEach(url => {
        if (url.includes(path)) {
          resolve(url);
        }
      });
      resolve(originalSource);
    } else {
      chrome.devtools.inspectedWindow.getResources(resources => {
        let match: string | undefined;
        resources.forEach(resource => {
          urls.add(resource.url);
          if (!match && resource.url.includes(path)) {
            match = resource.url;
          }
        });
        if (match) {
          resolve(match);
        }
        resolve(originalSource);
      });
    }
  });
}
