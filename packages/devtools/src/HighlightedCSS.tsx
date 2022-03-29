import Highlight, { defaultProps, PrismTheme } from 'prism-react-renderer';
import { default as themeDark } from 'prism-react-renderer/themes/vsDark';
import { default as themeLight } from 'prism-react-renderer/themes/vsLight';
import * as React from 'react';

import { makeStyles, shorthands } from '@griffel/react';

import { DARK_THEME_COLOR_TOKENS, LIGHT_THEME_COLOR_TOKENS } from './colorTokens';
import { useThemeContext } from './ThemeContext';
import type { BrowserTheme } from './types';

function getCustomTheme(theme?: BrowserTheme): PrismTheme {
  const colortokens = theme === 'dark' ? DARK_THEME_COLOR_TOKENS : LIGHT_THEME_COLOR_TOKENS;
  return {
    plain: {
      color: colortokens.foreground,
    },
    styles: [
      ...(theme === 'dark' ? themeDark.styles : themeLight.styles),
      {
        types: ['keyword', 'atrule'],
        style: {
          color: colortokens.foreground,
        },
      },
      {
        types: ['rule'],
        style: {
          color: colortokens.cssAtRule,
        },
      },
      {
        types: ['property'],
        style: {
          color: colortokens.cssProperty,
        },
      },
      {
        types: ['punctuation'],
        style: {
          color: colortokens.cssPunctuation,
        },
      },
      {
        types: ['selector'],
        style: {
          color: colortokens.cssSelector,
        },
      },
    ],
  };
}

const useColorIndicatorStyles = makeStyles({
  colorIndicator: {
    height: '10px',
    width: '10px',
    display: 'inline-block',
    marginLeft: '2px',
    marginRight: '2px',
    ...shorthands.border('1px', 'dotted', 'grey'),
  },
});

export const HighlightedCSS: React.FC<{ code: string }> = ({ code }) => {
  const theme = useThemeContext();
  const customTheme = React.useMemo(() => getCustomTheme(theme), [theme]);

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
                        <span
                          key={`${i}-color`}
                          className={colorIndicator}
                          style={{ backgroundColor: token.content }}
                        />
                        {tokenProps.children}
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
