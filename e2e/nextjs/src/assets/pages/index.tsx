import { makeStyles, shorthands } from '@griffel/react';
import Head from 'next/head';
import * as React from 'react';

import type { NextPage } from 'next';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '200px',

    ...shorthands.border('2px', 'dashed', 'magenta'),
    ...shorthands.borderRadius('5px'),
    ...shorthands.gap('5px'),
    ...shorthands.padding('10px'),
  },
});

const Home: NextPage = () => {
  const styles = useStyles();

  return (
    <>
      <Head>
        <title>My app</title>
      </Head>

      <div className={styles.container}>Hello world!</div>
    </>
  );
};

export default Home;
