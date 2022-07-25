const callbackMap = new Map<string, (runtimeSourceCode: undefined | Promise<string>) => void>();

/**
 * Fetches source content and invokes a callback.
 *
 * Griffel core obtains location of a makeStyles call from error stack.
 * TODO...
 *
 * @param runtimeSourceUrl
 * @param callback
 */
export async function fetchRuntimeSource(
  runtimeSourceUrl: string,
  callback: (runtimeSourceCode: undefined | Promise<string>) => void,
) {
  try {
    const response = await fetch(runtimeSourceUrl);
    if (response.ok) {
      return callback(response.text());
    }
    console.error(
      `[Griffel devtools] fetchRuntimeSource() bad response fetching ${runtimeSourceUrl}: ${response.status}`,
    );
    return callback(undefined);
  } catch (error) {
    // runtimeSourceUrl probably came from webpack and contains webpack url scheme like webpack-internal://
    if (!runtimeSourceUrl.startsWith('webpack-internal')) {
      console.error(`[Griffel devtools] fetchRuntimeSource() error fetching ${runtimeSourceUrl}: ${error}`);
      return callback(undefined);
    }

    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0] === undefined) {
      console.error(`[Griffel devtools] fetchRuntimeSource() unable to find current tab`);
      return callback(undefined);
    }

    const filepath = runtimeSourceUrl.replace(/^webpack-internal:\/\/\//, '');
    chrome.tabs.sendMessage(tabs[0].id!, { name: 'extension_request-source', filepath }, function (response) {
      if (response.success) {
        callbackMap.set(filepath, callback);
      } else {
        console.error(
          `[Griffel devtools] fetchRuntimeSource() unable to connect to content-script for fetching ${filepath}`,
        );
        callback(undefined);
      }
    });
  }
}

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
  if (request.name === 'extension-script_respond-source') {
    const filepath = request.filepath;
    const callback = callbackMap.get(filepath);
    if (callback) {
      if (request.success) {
        callback(request.result);
      } else {
        console.error(`[Griffel devtools] fetchRuntimeSource() content-script failed to fetch ${filepath}`);
        callback(undefined);
      }
      callbackMap.delete(filepath);
    }
  }
});
