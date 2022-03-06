//@ts-check
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
