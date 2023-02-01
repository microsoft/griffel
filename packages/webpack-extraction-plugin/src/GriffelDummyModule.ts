import { Module } from 'webpack';

const TYPES = new Set(['unknown']);

export class GriffelDummyModule extends Module {
  readonly #identifier: string;

  constructor() {
    super('unknown', undefined);

    this.#identifier = 'griffel-dummy-module';

    this.buildInfo = {};
    this.buildMeta = {};
  }

  override identifier() {
    return this.#identifier;
  }

  override getSourceTypes() {
    return TYPES;
  }

  override size() {
    return 0;
  }
}
