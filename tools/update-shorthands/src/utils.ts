import { type MdnProperty, type MdnShorthandProperty } from './types';

const REGEX_KEBAB_SEPARATOR = /-(\w)/g;
const REGEX_VENDOR_PREFIXED = /^-(\w)/;

export function isShorthandProperty(property: MdnProperty): property is MdnShorthandProperty {
  return Array.isArray(property.computed);
}

function toUpperReplacer(_: string, ...args: string[]) {
  return args[0].toUpperCase();
}

function toLowerReplacer(_: string, ...args: string[]) {
  return args[0].toLowerCase();
}

export function toCamelCase(kebabCase: string) {
  return kebabCase.replace(REGEX_VENDOR_PREFIXED, toLowerReplacer).replace(REGEX_KEBAB_SEPARATOR, toUpperReplacer);
}

const REGEX_VENDOR_PROPERTY = /^-/;

export function isVendorProperty(name: string): boolean {
  return REGEX_VENDOR_PROPERTY.test(name);
}
