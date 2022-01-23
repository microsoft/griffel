import { makeStyles, MakeStylesStyle } from '@griffel/react';

const switchClassName = 'fui-Switch';
let _a: Record<string, MakeStylesStyle>;

export const useStyles = makeStyles({
  root:
    ((_a = {}),
    (_a[':hover .' + switchClassName] = {
      ':before': {
        backgroundColor: 'red',
      },
    }),
    _a),
});
