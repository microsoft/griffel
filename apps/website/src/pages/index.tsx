import Link from '@docusaurus/Link';
// @ts-ignore
import CodeBlock from '@theme/CodeBlock';
import Layout from '@theme/Layout';
import cx from 'clsx';
import * as React from 'react';

import styles from './index.module.css';

const Homepage: React.FC = () => {
  return (
    <Layout>
      <div className={styles['container']}>
        <div className={styles['containerLayer']} />
        <div className={cx('hero hero--dark', styles['hero'])}>
          <div className={cx('container', styles['heroContainer'])}>
            <h1 className={cx('hero__title', styles['heroTitle'])}>
              CSS-in-JS with <b>ahead-of-time compilation</b>
            </h1>

            <div className={styles['ctaContainer']}>
              <Link className="button button--primary button--lg" to="/react/install">
                Get started
              </Link>
              <Link className="button button--secondary button--lg" to="/try-it-out">
                Try it out
              </Link>

              <div className={styles['githubButton']}>
                <iframe
                  src="https://ghbtns.com/github-btn.html?user=microsoft&amp;repo=griffel&amp;type=star&amp;count=true&amp;size=large"
                  width={160}
                  height={32}
                  title="GitHub Stars"
                />
              </div>
            </div>

            <div className={styles['codeContainer']}>
              <CodeBlock language="jsx">
                {`import { makeStyles } from '@griffel/react';

const useClasses = makeStyles({
  icon: { color: 'red', paddingLeft: '5px' },
});

function Component() {
  const classes = useClasses();

  return <span className={classes.icon} />;
}`}
              </CodeBlock>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Homepage;
