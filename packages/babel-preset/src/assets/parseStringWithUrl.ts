const URL_REGEX = /(.*url\()(.+)(\).*)/;

export function parseStringWithUrl(value: string) {
  const result = value.match(URL_REGEX);

  if (result === null) {
    throw new Error(`parseStringWithUrl(): Failed to find matches of "url()" in "${value}"`);
  }

  return {
    prefix: result[1],
    url: result[2],
    suffix: result[3],
  };
}
