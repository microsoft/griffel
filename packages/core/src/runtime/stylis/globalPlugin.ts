import { RULESET, tokenize } from 'stylis';
import type { Middleware } from 'stylis';

export const globalPlugin: Middleware = element => {
  switch (element.type) {
    case RULESET:
      if (typeof element.props === 'string') {
        throw new Error(
          `"element.props" has type "string" (${JSON.stringify(
            element.props,
            null,
            2,
          )}), it's not expected. Please report a bug if it happens.`,
        );
      }

      element.props = element.props.map(value => {
        // Avoids calling tokenize() on every string
        if (value.indexOf(':global(') === -1) {
          return value;
        }

        return tokenize(value)
          .reduce<string[]>((acc, value, index, children) => {
            if (value === 'global') {
              const selector = children[index + 1].slice(1, -1);

              // A separator between selectors i.e. "body .class"
              acc.unshift(' ');
              acc.unshift(selector);

              if (acc[acc.length - 1] !== ':') {
                throw new Error(`A token before "global()" selector should be ":": ${JSON.stringify(acc)}`);
              }

              delete acc[acc.length - 1];
              delete children[index + 1];

              return acc;
            }

            acc.push(value);

            return acc;
          }, [])
          .join('');
      });
  }
};
