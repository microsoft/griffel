import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  httpUrl: { backgroundImage: 'url(http://www.example.com)' },
  httpsUrl: { backgroundImage: 'url(https://www.example.com)' },
  httpsUrlWithQuotes: { backgroundImage: 'url("https://www.example.com")' },
  dataUrl: { backgroundImage: 'url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7)' },
  hashOnly: { filter: 'url(#a)' },
});
