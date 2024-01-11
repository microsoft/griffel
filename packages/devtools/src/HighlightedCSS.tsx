import { makeStyles, shorthands } from '@griffel/react';
import type { PrismTheme } from 'prism-react-renderer';
import Highlight, { defaultProps } from 'prism-react-renderer';
import * as React from 'react';

import { tokens } from './themes';

const customTheme: PrismTheme = {
  plain: {
    color: tokens.foreground,
  },
  styles: [
    {
      types: ['keyword', 'atrule'],
      style: {
        color: tokens.foreground,
      },
    },
    {
      types: ['rule'],
      style: {
        color: tokens.cssAtRule,
      },
    },
    {
      types: ['property'],
      style: {
        color: tokens.cssProperty,
      },
    },
    {
      types: ['punctuation'],
      style: {
        color: tokens.cssPunctuation,
      },
    },
    {
      types: ['selector'],
      style: {
        color: tokens.cssSelector,
      },
    },
    {
      types: ['number'],
      style: {
        color: tokens.cssNumber,
      },
    },
  ],
};

const useColorIndicatorStyles = makeStyles({
  colorIndicator: {
    boxSizing: 'border-box',
    height: '12px',
    width: '12px',
    display: 'inline-block',
    marginLeft: '2px',
    marginRight: '2px',
    verticalAlign: 'text-top',
    ...shorthands.border('1px', 'dotted', 'grey'),
  },
});

export const HighlightedCSS: React.FC<{ code: string }> = ({ code }) => {
  const { colorIndicator } = useColorIndicatorStyles();

  return (
    <Highlight {...defaultProps} code={code} language="css" theme={customTheme}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre className={className} style={{ ...style, display: 'inline-block', textDecorationLine: 'inherit' }}>
          {tokens.map((line, i) => (
            <div {...getLineProps({ line, key: i })}>
              {line.map((token, key) => {
                const tokenProps = getTokenProps({ token, key });
                return tokenProps.className.includes('color') && token.content !== 'transparent' ? (
                  <span
                    {...tokenProps}
                    children={
                      <>
                        {/* show a square color indicator for colors in css */}
                        <span className={colorIndicator} style={{ backgroundColor: token.content }} />
                        <span>{tokenProps.children}</span>
                      </>
                    }
                  />
                ) : (
                  <span {...tokenProps} />
                );
              })}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
};
