import { makeStyles } from '@griffel/react';
import Head from 'next/head';
import * as React from 'react';

import type { NextPage } from 'next';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '200px',

    border: '2px dashed magenta',
    borderRadius: '5px',
    gap: '5px',
    padding: '10px',
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
