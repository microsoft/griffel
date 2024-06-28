import * as React from 'react';
import type { StoryObj } from '@storybook/react';

import { createDOMRenderer } from '@griffel/core';
import { makeStyles, RendererProvider, shorthands } from '../';

const useStyles = makeStyles({
  root: {
    width: '200px',
    height: '100px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    ...shorthands.border('1px', 'solid', '#333'),
    backgroundColor: 'cornflowerblue',
  },
});

const ColorBox: React.FC = () => {
  const classes = useStyles();

  return <div className={classes.root}>blue box</div>;
};

const CustomRendererProvider: React.FC<{ children: React.ReactNode; filterEnabled: boolean }> = ({
  children,
  filterEnabled,
}) => {
  const customDOMRenderer = React.useMemo(() => {
    return createDOMRenderer(undefined, {
      unstable_filterCSSRule: cssRule => {
        // Filter out background-color
        return !filterEnabled || cssRule.indexOf('{background-color:') === -1;
      },
    });
  }, [filterEnabled]);

  return <RendererProvider renderer={customDOMRenderer}>{children}</RendererProvider>;
};

export const DOMRendererFilter: StoryObj<{ filterEnabled: boolean }> = {
  render: ({ filterEnabled }) => {
    return (
      <CustomRendererProvider filterEnabled={filterEnabled}>
        <p>
          It is possible to define a filter function in <code>DOMRenderer</code> to filter out CSS rules before adding
          them to DOM. The classes are still applied to an element.
        </p>
        <p>Once the CSS rule is added, there is no way to remove it.</p>
        <ol>
          <li>Render this story with filter enabled &rarr; it renders the box without a background.</li>
          <li>Disable the filter &rarr; story is re-rendered, blue background is added to the box.</li>
          <li>
            Enable the filter again &rarr; there is still the blue background, you need to refresh the page to get rid
            of the background
          </li>
        </ol>
        <p style={{ color: 'red' }}>
          Filter is currently marked as unstable. This functionality can be changed or removed without considering it a
          breaking change!
        </p>

        <ColorBox />
      </CustomRendererProvider>
    );
  },

  args: {
    filterEnabled: true,
  },
};

export default {
  title: 'unstable_filterCSSRule',
};
