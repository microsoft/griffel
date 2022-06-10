import { makeStyles } from '@griffel/core';

export default makeStyles({
  nested: {
    '& span': {
      '& .p': {
        ':hover': {
          color: 'red',
        },
      },
    },
  },
});

export const meta = {
  name: 'Nested selectors',
};
