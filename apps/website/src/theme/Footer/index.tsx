import { useThemeConfig } from '@docusaurus/theme-common';
import FooterLinks from '@theme/Footer/Links';
import * as React from 'react';

function Footer() {
  const { footer } = useThemeConfig();

  if (!footer) {
    return null;
  }

  const { links } = footer;

  return (
    <div className="container margin-top--xl">
      <FooterLinks links={links} />
    </div>
  );
}
export default React.memo(Footer);
