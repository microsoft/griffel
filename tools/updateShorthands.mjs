import cssTypePkg from 'csstype/package.json' assert { type: 'json' };
import fs from 'node:fs/promises';

const versionRegex = /git\+https:\/\/github.com\/mdn\/data.git#(.+)/;
const mdnDataVersion = cssTypePkg.devDependencies['mdn-data'];

if (!versionRegex.test(mdnDataVersion)) {
  throw new Error('mdn-data version is not in the correct format');
}

const [, currentMdnDataCommit] = mdnDataVersion.split('#');
const url = `https://raw.githubusercontent.com/mdn/data/${currentMdnDataCommit}/css/properties.json`;

const response = await fetch(url);
const data = await response.json();

function isShorthand(property) {
  return Array.isArray(property.computed);
}

const REGEX_KEBAB_SEPARATOR = /-(\w)/g;
const REGEX_VENDOR_PREFIXED = /^-(\w)/;

export function toCamelCase(kebabCase) {
  return kebabCase.replace(REGEX_VENDOR_PREFIXED, toLowerReplacer).replace(REGEX_KEBAB_SEPARATOR, toUpperReplacer);
}

function toUpperReplacer(substring, ...args) {
  return args[0].toUpperCase();
}

function toLowerReplacer(substring, ...args) {
  return args[0].toLowerCase();
}

const REGEX_VENDOR_PROPERTY = /^-/;

function isVendorProperty(name) {
  return REGEX_VENDOR_PROPERTY.test(name);
}

const properties = Object.entries(data);
const shorthandProperties = properties.reduce((acc, [property, value]) => {
  if (isVendorProperty(property)) {
    return acc;
  }

  if (value.status === 'obsolete') {
    return acc;
  }

  if (isShorthand(value)) {
    acc[toCamelCase(property)] = [-1, value.computed.map(toCamelCase)];
  }

  return acc;
}, {});

Object.entries(shorthandProperties)
  .reverse()
  .forEach(([key, value]) => {
    value[1].forEach(property => {
      if (shorthandProperties[property]) {
        shorthandProperties[key][0] = shorthandProperties[property][0] - 1;
      }
    });
  });

await fs.writeFile(
  'packages/core/src/runtime/shorthands.ts',
  `
import type * as CSS from 'csstype';

export const shorthands: Partial<Record<keyof CSS.StandardShorthandProperties, [number, string[]]>> = ${JSON.stringify(
    shorthandProperties,
    null,
    2,
  )};`,
  'utf-8',
);
