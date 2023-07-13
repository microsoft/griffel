/* eslint-disable no-fallthrough */
import {
  hash,
  charat,
  strlen,
  indexof,
  replace,
  match,
  MS,
  MOZ,
  WEBKIT,
  Element,
  copy,
  serialize,
  DECLARATION,
  RULESET,
  combine,
  Middleware,
} from 'stylis';

export function prefix(value: string, length: number, children?: Element[]): string {
  switch (hash(value, length)) {
    // color-adjust
    case 5103:
      return WEBKIT + 'print-' + value + value;
    //   backface-visibility, column, box-decoration-break
    case 3191:
    case 6645:
    case 3005:
    // mask, mask-image, mask-(mode|clip|size), mask-(repeat|origin), mask-position, mask-composite,
    case 6391:
    case 5879:
    case 5623:
    case 6135:
    case 4599:
    case 4855:
      return WEBKIT + value + value;
    // tab-size
    case 4789:
      return MOZ + value + value;
    // appearance, user-select, hyphens
    case 5349:
    case 4246:
    case 6968:
      return WEBKIT + value + MOZ + value + MS + value + value;
    // cursor
    // @ts-expect-error fall through is intentional here
    case 6187:
      if (!match(value, /grab/)) {
        return (
          replace(replace(replace(value, /(zoom-|grab)/, WEBKIT + '$1'), /(image-set)/, WEBKIT + '$1'), value, '') +
          value
        );
      }
    // background, background-image
    case 5495:
    case 3959:
      // eslint-disable-next-line no-useless-concat
      return replace(value, /(image-set\([^]*)/, WEBKIT + '$1' + '$`$1');
    // (margin|padding)-inline-(start|end)
    case 4095:
    case 3583:
    case 4068:
    case 2532:
      return replace(value, /(.+)-inline(.+)/, WEBKIT + '$1$2') + value;
    // (min|max)?(width|height|inline-size|block-size)
    case 8116:
    case 7059:
    case 5753:
    case 5535:
    case 5445:
    case 5701:
    case 4933:
    case 4677:
    case 5533:
    case 5789:
    case 5021:
    case 4765:
      // stretch fill-available
      if (strlen(value) - 1 - length > 6)
        switch (charat(value, length + 1)) {
          // (f)ill-available
          // @ts-expect-error fall through is intentional here
          case 102:
            if (charat(value, length + 3) === 108) {
              return (
                replace(
                  value,
                  /(.+:)(.+)-([^]+)/,
                  // eslint-disable-next-line no-useless-concat, eqeqeq
                  '$1' + WEBKIT + '$2-$3' + '$1' + MOZ + (charat(value, length + 3) == 108 ? '$3' : '$2-$3'),
                ) + value
              );
            }
          // (s)tretch
          case 115:
            return ~indexof(value, 'stretch')
              ? prefix(replace(value, 'stretch', 'fill-available'), length, children) + value
              : value;
        }
      break;
  }

  return value;
}

/**
 * @param {object} element
 * @param {number} index
 * @param {object[]} children
 * @param {function} callback
 */
export function prefixer(
  element: Element,
  index: number,
  children: Element[],
  callback: Middleware,
): string | undefined {
  if (element.length > -1)
    if (!element.return)
      switch (element.type) {
        case DECLARATION:
          element.return = prefix(element.value, element.length, children);
          return;
        case RULESET:
          if (element.length)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            return combine(element.props, function (value) {
              switch (match(value, /(::plac\w+|:read-\w+)/)) {
                // :read-(only|write)
                case ':read-only':
                case ':read-write':
                  return serialize(
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    [copy(element, { props: [replace(value, /:(read-\w+)/, ':' + MOZ + '$1')] })],
                    callback,
                  );
                // :placeholder
                case '::placeholder':
                  return serialize(
                    [
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore
                      copy(element, { props: [replace(value, /:(plac\w+)/, ':' + WEBKIT + 'input-$1')] }),
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore
                      copy(element, { props: [replace(value, /:(plac\w+)/, ':' + MOZ + '$1')] }),
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore
                      copy(element, { props: [replace(value, /:(plac\w+)/, MS + 'input-$1')] }),
                    ],
                    callback,
                  );
              }

              return '';
            });
      }

  return undefined;
}
