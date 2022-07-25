/**
 * Script running in host page's context.
 *
 * When extension requests to read content of a webpack compiled source (to get its sourcemap),
 * its content-script sends request to this script.
 * The script responds to the extension with the source content
 * obtained through reading `window.webpackChunk_<myAppName>` object of host page.
 *
 * `webpackChunk_<myAppName>` contains a map of compiled source path to its content. Example:
 * [
 *   [
 *     ['chunkName'],
 *     { // chunk dictionary:
 *       ./packages/src/styles.js: (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
 *         eval(
 *           // contains compiled source of ./packages/src/styles.js
 *         );
 *       }
 *     },
 *     __webpack_require__ => { ... }
 *   ]
 * ]
 */

/**
 * listens to message from content-script-inject.js and posts response message
 */
const handleRequestFromExtension = async event => {
  if (event.data.from === 'extension-script_request-source' && event.data.filepath) {
    syncWebpackSourceMapsIfNeeded();
    window.postMessage({
      from: `page_respond-source`,
      filepath: event.data.filepath,
      data: webpackInteralMap.get(event.data.filepath),
    });
  }
};
window.addEventListener('message', handleRequestFromExtension);

let needWebpackSync = true;
const callAsap = typeof requestIdleCallback === 'function' ? requestIdleCallback : fn => Promise.resolve().then(fn);
const knownWebpackChunks = new Map();
/**
 * key: compiled source path, for example ./packages/src/styles.js
 * value: content of the compiled source as a string
 */
const webpackInteralMap = new Map();
/**
 * Reads window.webpackChunk_<myAppName> and populates webpackInteralMap
 * @see   {@link https://github.com/lahmatiy/react-render-tracker/blob/2aa1a599740dbf966ec1792d2e53073ab98f034e/src/publisher/utils/resolveSourceLoc.ts#L97}
 */
function syncWebpackSourceMapsIfNeeded() {
  if (!needWebpackSync) {
    return;
  }

  needWebpackSync = false;
  callAsap(() => (needWebpackSync = true));

  for (const name of Object.keys(window)) {
    if (!name.startsWith('webpackChunk_')) {
      continue;
    }

    const knownSize = knownWebpackChunks.get(name) || 0;
    const storage = window[name];

    if (!Array.isArray(storage)) {
      continue;
    }

    for (let i = knownSize; i < storage.length; i++) {
      const storageEntry = storage[i];

      if (Array.isArray(storageEntry) && storageEntry[1] && typeof storageEntry[1] === 'object') {
        for (const [filepath, fn] of Object.entries(storageEntry[1])) {
          webpackInteralMap.set(filepath, String(fn));
        }
      }
    }

    knownWebpackChunks.set(name, storage.length);
  }
}
