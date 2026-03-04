/**
 * Custom module system for evaluating code in a sandboxed VM context.
 * Copied from @linaria/babel-preset v3.0.0-beta.19, adapted to use `debug` package
 * and local imports instead of @linaria/* packages.
 *
 * This serves 2 purposes:
 * - Avoid leakage from evaluated code to module cache in current context, e.g. `babel-register`
 * - Allow us to invalidate the module cache without affecting other stuff, necessary for rebuilds
 *
 * We also use it to transpile the code with Babel by default.
 * We also store source maps for it to provide correct error stacktraces.
 */

import fs from 'node:fs';
import NativeModule from 'node:module';
import path, { dirname } from 'node:path';
import vm from 'node:vm';
import createDebug from 'debug';

import { ASSET_TAG_OPEN, ASSET_TAG_CLOSE } from '../constants.mjs';
import * as EvalCache from './evalCache.mjs';
import * as mockProcess from './process.mjs';
import type { EvalRule, StrictOptions } from './types.mjs';

const debug = createDebug('griffel:module');

// Supported node builtins based on the modules polyfilled by webpack
// `true` means module is polyfilled, `false` means module is empty
const builtins: Record<string, boolean> = {
  assert: true,
  buffer: true,
  child_process: false,
  cluster: false,
  console: true,
  constants: true,
  crypto: true,
  dgram: false,
  dns: false,
  domain: true,
  events: true,
  fs: false,
  http: true,
  https: true,
  module: false,
  net: false,
  os: true,
  path: true,
  punycode: true,
  process: true,
  querystring: true,
  readline: false,
  repl: false,
  stream: true,
  string_decoder: true,
  sys: true,
  timers: true,
  tls: false,
  tty: true,
  url: true,
  util: true,
  vm: true,
  zlib: true,
};

// Separate cache for evaluated modules
let cache: Record<string, Module> = {};

const NOOP = () => {};

const createCustomDebug =
  (depth: number) =>
  (namespaces: string, arg1: unknown, ...args: unknown[]) => {
    const modulePrefix = depth === 0 ? 'module' : `sub-module-${depth}`;
    debug(`${modulePrefix}:${namespaces}`, arg1, ...args);
  };

const BABEL_ESM = '/@babel/runtime/helpers/esm/';
const BABEL_CJS = '/@babel/runtime/helpers/';
const SWC_HELPERS_RE = /(@swc\/helpers\/)src(\/.+)\.mjs/;

const cookModuleId = (rawId: string): string => {
  // It's a dirty hack for avoiding conflicts with babel-preset-react-app
  // https://github.com/callstack/linaria/issues/745

  const babelESMIndex = rawId.indexOf(BABEL_ESM);

  if (babelESMIndex !== -1) {
    return rawId.slice(0, babelESMIndex) + BABEL_CJS + rawId.slice(babelESMIndex + BABEL_ESM.length);
  }

  const swcHelpersIndex = rawId.indexOf('@swc/helpers/src/');

  if (swcHelpersIndex === -1) {
    return rawId.replace(SWC_HELPERS_RE, '$1lib$2.js');
  }

  return rawId;
};

export class Module {
  readonly id: string;
  readonly filename: string;
  declare readonly paths: readonly string[];
  options: StrictOptions;
  imports: Map<string, string[]> | null = null;
  dependencies: string[] | null = null;
  transform: ((code: string, filename: string) => string) | null = null;
  exports: unknown = {};
  extensions: string[];

  private debug: (namespaces: string, arg1: unknown, ...args: unknown[]) => void;
  private debuggerDepth: number;

  constructor(filename: string, options: StrictOptions, debuggerDepth = 0) {
    this.id = filename;
    this.filename = filename;
    this.options = options;
    this.debuggerDepth = debuggerDepth;
    this.debug = createCustomDebug(debuggerDepth);

    Object.defineProperties(this, {
      id: {
        value: filename,
        writable: false,
      },
      filename: {
        value: filename,
        writable: false,
      },
      paths: {
        value: Object.freeze(
          (NativeModule as unknown as { _nodeModulePaths: (dir: string) => string[] })._nodeModulePaths(
            path.dirname(filename),
          ),
        ),
        writable: false,
      },
    });

    this.exports = {};
    this.extensions = ['.json', '.js', '.jsx', '.ts', '.tsx', '.cjs'];
    this.debug('prepare', filename);
  }

  resolve = (rawId: string): string => {
    const id = cookModuleId(rawId);
    const extensions = (NativeModule as unknown as { _extensions: Record<string, (...args: unknown[]) => void> })
      ._extensions;
    const added: string[] = [];

    try {
      // Check for supported extensions
      this.extensions.forEach(ext => {
        if (ext in extensions) {
          return;
        }
        // When an extension is not supported, add it
        // And keep track of it to clean it up after resolving
        // Use noop for the transform function since we handle it
        extensions[ext] = NOOP;
        added.push(ext);
      });
      return Module._resolveFilename(id, this);
    } finally {
      // Cleanup the extensions we added to restore previous behaviour
      added.forEach(ext => delete extensions[ext]);
    }
  };

  require: ((id: string) => unknown) & {
    ensure: () => void;
    cache: Record<string, Module>;
    resolve: (id: string) => string;
  } = Object.assign(
    (rawId: string): unknown => {
      const id = cookModuleId(rawId);
      this.debug('require', id);

      if (id in builtins) {
        // The module is in the allowed list of builtin node modules
        // Ideally we should prevent importing them, but webpack polyfills some
        // So we check for the list of polyfills to determine which ones to support
        if (builtins[id]) {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          return require(id);
        }

        return null;
      }

      // Resolve module id (and filename) relatively to parent module
      const filename = this.resolve(id);

      if (filename === id && !path.isAbsolute(id)) {
        // The module is a builtin node modules, but not in the allowed list
        throw new Error(`Unable to import "${id}". Importing Node builtins is not supported in the sandbox.`);
      }

      this.dependencies?.push(id);
      let cacheKey = filename;
      let only: string[] = [];

      if (this.imports?.has(id)) {
        // We know what exactly we need from this module. Let's shake it!
        only = this.imports.get(id)!.sort();

        if (only.length === 0) {
          // Probably the module is used as a value itself
          // like `'The answer is ' + require('./module')`
          only = ['default'];
        }

        cacheKey += `:${only.join(',')}`;
      }

      let m = cache[cacheKey];

      if (!m) {
        this.debug('cached:not-exist', id);
        // Create the module if cached module is not available
        m = new Module(filename, this.options, this.debuggerDepth + 1);
        m.transform = this.transform;
        // Store it in cache at this point, otherwise
        // we would end up in infinite loop with cyclic dependencies
        cache[cacheKey] = m;

        if (this.extensions.includes(path.extname(filename))) {
          // To evaluate the file, we need to read it first
          const code = fs.readFileSync(filename, 'utf-8');

          if (/\.json$/.test(filename)) {
            // For JSON files, parse it to a JS object similar to Node
            m.exports = JSON.parse(code);
          } else {
            // For JS/TS files, evaluate the module
            // The module will be transpiled using provided transform
            m.evaluate(code, only.includes('*') ? ['*'] : only);
          }
        } else {
          // For non JS/JSON requires, export the resolved absolute path wrapped in asset tags.
          // This allows downstream tools (e.g. webpack plugin) to resolve the path correctly
          // when CSS is extracted to a different location.
          m.exports = ASSET_TAG_OPEN + filename + ASSET_TAG_CLOSE;
        }
      } else {
        this.debug('cached:exist', id);
      }

      return m.exports;
    },
    {
      ensure: NOOP,
      cache,
      resolve: this.resolve,
    },
  );

  evaluate(text: string, only: string[] | null = null): void {
    const { filename } = this;
    // Find last matching rule (iterate backwards, break on first match)
    let action: EvalRule['action'] = 'ignore';

    for (let i = this.options.rules.length - 1; i >= 0; i--) {
      const { test } = this.options.rules[i];

      if (!test || (typeof test === 'function' ? test(filename) : test instanceof RegExp && test.test(filename))) {
        action = this.options.rules[i].action;
        break;
      }
    }

    const cacheKey = [this.filename, ...(only ?? [])];

    if (EvalCache.has(cacheKey, text)) {
      this.exports = EvalCache.get(cacheKey, text);
      return;
    }

    let code: string;

    if (action === 'ignore') {
      this.debug('ignore', `${filename}`);
      code = text;
    } else {
      // Action can be a function or a module name
      const evaluator =
        typeof action === 'function'
          ? action
          : (
              require(require.resolve(action, {
                paths: [dirname(this.filename)],
              })) as { default: (...args: unknown[]) => [string, Map<string, string[]> | null] }
            ).default;

      // For JavaScript files, we need to transpile it and to get the exports of the module
      let imports: Map<string, string[]> | null;
      this.debug('prepare-evaluation', this.filename, 'using', evaluator.name);
      [code, imports] = evaluator(this.filename, this.options, text, only);
      this.imports = imports;
      this.debug('evaluate', `${this.filename} (only ${(only || []).join(', ')}):\n${code}`);
    }

    const script = new vm.Script(`(function (exports) { ${code}\n})(exports);`, {
      filename: this.filename,
    });

    script.runInContext(
      vm.createContext({
        clearImmediate: NOOP,
        clearInterval: NOOP,
        clearTimeout: NOOP,
        setImmediate: NOOP,
        setInterval: NOOP,
        setTimeout: NOOP,
        global,
        process: mockProcess,
        module: this,
        exports: this.exports,
        require: this.require,
        __filename: this.filename,
        __dirname: path.dirname(this.filename),
      }),
    );

    EvalCache.set(cacheKey, text, this.exports);
  }

  static invalidate = (): void => {
    cache = {};
  };

  static invalidateEvalCache = (): void => {
    EvalCache.clear();
  };

  // Alias to resolve the module using node's resolve algorithm
  // This static property can be overridden by the webpack loader
  // This allows us to use webpack's module resolution algorithm
  static _resolveFilename = (id: string, options: { filename: string; paths: readonly string[] }): string =>
    (NativeModule as unknown as { _resolveFilename: (id: string, options: unknown) => string })._resolveFilename(
      id,
      options,
    );

  static _nodeModulePaths = (filename: string): string[] =>
    (NativeModule as unknown as { _nodeModulePaths: (dir: string) => string[] })._nodeModulePaths(filename);
}
