import { makeStyles } from '@griffel/react';
import { createModule } from './module';

export const useStyles = makeStyles({
  container: {
    color: 'red',
  },
});

createModule().baz();
