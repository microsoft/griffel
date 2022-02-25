import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  // List of shorthand properties is not exhaustive
  // resulting output should be empty anyway
  root: {
    // @ts-expect-error unsupported css properties should be stripped
    background: 'value',
    // @ts-expect-error unsupported css properties should be stripped
    border: 'value',
    // @ts-expect-error unsupported css properties should be stripped
    borderRadius: 'value',
    // @ts-expect-error unsupported css properties should be stripped
    gap: 'value',
    // @ts-expect-error unsupported css properties should be stripped
    grid: 'value',
    // @ts-expect-error unsupported css properties should be stripped
    margin: 'value',
    // @ts-expect-error unsupported css properties should be stripped
    padding: 'value',
  },
});
