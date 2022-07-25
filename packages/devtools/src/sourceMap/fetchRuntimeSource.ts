const runtimeSourcePromises = new Map<string, (value: string | undefined | PromiseLike<string | undefined>) => void>();

/**
 * Fetches source content and invokes a callback.
 *
 * Griffel core obtains location of a makeStyles call from error stack.
 * TODO...
 *
 * @param runtimeSourceUrl
 * @param callback
 */
export async function fetchRuntimeSource(runtimeSourceUrl: string): Promise<string | undefined> {
  try {
    const response = await fetch(runtimeSourceUrl);
    if (response.ok) {
      return response.text();
    }
    console.error(
      `[Griffel devtools] fetchRuntimeSource() bad response fetching ${runtimeSourceUrl}: ${response.status}`,
    );
    return undefined;
  } catch (error) {
    // runtimeSourceUrl probably came from webpack and contains webpack url scheme like webpack-internal://
    if (!runtimeSourceUrl.startsWith('webpack-internal')) {
      console.error(`[Griffel devtools] fetchRuntimeSource() error fetching ${runtimeSourceUrl}: ${error}`);
      return undefined;
    }

    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0] === undefined) {
      console.error(`[Griffel devtools] fetchRuntimeSource() unable to find current tab`);
      return undefined;
    }

    const filepath = runtimeSourceUrl.replace(/^webpack-internal:\/\/\//, '');
    return new Promise(resolve => {
      chrome.tabs.sendMessage(tabs[0].id!, { name: 'extension_request-source', filepath }, function (response) {
        if (response.success) {
          runtimeSourcePromises.set(filepath, resolve);
        } else {
          console.error(
            `[Griffel devtools] fetchRuntimeSource() unable to connect to content-script for fetching ${filepath}`,
          );
          resolve(undefined);
        }
      });
    });
  }
}

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
  if (request.name === 'extension-script_respond-source') {
    const filepath = request.filepath;
    const resolve = runtimeSourcePromises.get(filepath);
    if (resolve) {
      if (request.success) {
        resolve(request.result);
      } else {
        console.error(`[Griffel devtools] fetchRuntimeSource() content-script failed to fetch ${filepath}`);
        resolve(undefined);
      }
      runtimeSourcePromises.delete(filepath);
    }
  }
});
