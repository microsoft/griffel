import { useThemeConfig } from '@docusaurus/theme-common';
import FooterLinks from '@theme/Footer/Links';
import * as React from 'react';

import { TeamsIcon } from '../../components/icons';
import styles from './index.module.css';

function Footer() {
  const { footer } = useThemeConfig();

  if (!footer) {
    return null;
  }

  const { links } = footer;

  return (
    <div className="container margin-top--xl">
      <div className="row row--no-gutters">
        <div className="col">
          <div className={styles['teamsLink']}>
            <TeamsIcon />
            <a
              href="https://teams.microsoft.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__link-item"
            >
              Created by Teams
            </a>
          </div>
        </div>

        <div className="col">
          <FooterLinks links={links} />
        </div>
      </div>
    </div>
  );
}
export default React.memo(Footer);
