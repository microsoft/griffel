import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  // List of shorthand properties is not exhaustive
  // resulting output should be empty anyway
  root: {
    // @ts-expect-error unsupported css properties should be stripped
    all: 'initial',
    // @ts-expect-error unsupported css properties should be stripped
    borderColor: 'value',
    // @ts-expect-error unsupported css properties should be stripped
    borderStyle: 'value',
    // @ts-expect-error unsupported css properties should be stripped
    borderWidth: 'value',
  },
});
