declare namespace NodeJS {
  interface ExtendedProcessEnv {
    NODE_ENV?: 'production' | 'development' | 'test';
  }

  /**
   * extending/creating ProcessEnv interface which is used in @types/node to define `process.env`
   *
   * NOTE:
   * To make it work with and without node globals it need to use same token name
   * @see https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/node/v12/globals.d.ts#L764
   */
  export interface ProcessEnv extends ExtendedProcessEnv {}

  /**
   * extending/creating `Process` interface which is used in @types/node to define `process` global
   *
   * NOTE:
   * To make it work with and without node globals it need to use same token name
   * @see https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/node/v12/globals.d.ts#L883
   */
  export interface Process {
    env: ProcessEnv;
  }
}

declare var process: NodeJS.Process;
