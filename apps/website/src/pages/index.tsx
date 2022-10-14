import Link from '@docusaurus/Link';
import CodeBlock from '@theme/CodeBlock';
import Layout from '@theme/Layout';
import cx from 'clsx';
import * as React from 'react';

import styles from './index.module.css';

const Homepage: React.FC = () => {
  return (
    <Layout>
      <div className={cx('hero hero--dark', styles['hero'])}>
        <div className={styles['meshA']} />
        <div className={styles['meshB']} />

        <div className={cx('container', styles['heroContainer'])}>
          <h1 className={cx('hero__title', styles['heroTitle'])}>CSS-in-JS with ahead-of-time compilation</h1>
          <p className={cx('hero__subtitle', styles['heroSubtitle'])}>
            SSR support, CSS extraction and developer tools
          </p>

          <div className={styles['ctaContainer']}>
            <Link className="button button--primary" to="/react/install">
              Get started
            </Link>
            <Link className="button button--secondary" to="/try-it-out">
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
        </div>
      </div>

      <div className={styles['content']}>
        <div className="container">
          <div className="row">
            <div className="col">
              <h2 className="margin-bottom--none">How it looks?</h2>

              <div className="margin-top--lg">
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

          <div className="row margin-top--md">
            <div className="col">
              <h2>Features</h2>
            </div>
          </div>

          <div className="row">
            <div className="col col--3">
              <h3 className={styles['feature']}>Quick start</h3>
              <p>
                By default, Griffel is a runtime CSS-in-JS engine, you can simply install and use it in code directly.
              </p>
            </div>
            <div className="col col--3">
              <h3 className={styles['feature']}>Server-Side Rendering</h3>
              <p>
                Griffel provides first class support for Server-Side Rendering and supports all tooling required for
                Next.js.
              </p>
            </div>
            <div className="col col--3">
              <h3 className={styles['feature']}>Ahead-of-time compilation</h3>
              <p>
                Griffel only does the expensive runtime on the first render of the component. This work can be further
                optimized at build time by pre-computing and transforming styles.
              </p>
            </div>
            <div className="col col--3">
              <h3 className={styles['feature']}>CSS extraction 🚧</h3>
              <p>
                While ahead-of-time compilation allows performs optimization to reduce runtime work, the goal of CSS
                extraction is to remove runtime insertion to DOM and produce CSS stylesheets.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Homepage;
