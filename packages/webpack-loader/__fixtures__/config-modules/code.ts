// @ts-expect-error This is a fake module, will be resolved by Webpack aliases
import { makeStyles } from 'react-make-styles';

export const styles = makeStyles({
  root: { backgroundColor: 'red' },
});
