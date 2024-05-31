import type { GriffelStyle } from '@griffel/react';
import { makeStyles } from '@griffel/react';

const switchClassName = 'fui-Switch';
let _a: Record<string, GriffelStyle>;

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
