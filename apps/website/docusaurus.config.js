// @ts-check

const { themes } = require('prism-react-renderer');
const prismTheme = {
  ...themes.nightOwl,
  plain: {
    ...themes.nightOwl.plain,
    backgroundColor: '#000',
  },
};

/** @type {import('@docusaurus/types').Config} */
const config = {
  organizationName: 'microsoft',
  projectName: 'griffel',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',

  title: 'Griffel',
  // tagline: 'Dinosaurs are cool',

  url: 'https://griffel.js.org',
  baseUrl: '/',
  // favicon: 'img/favicon.ico',

  markdown: {
    mermaid: true,
  },

  plugins: [require.resolve('./src/components/Playground/docusaurusPlugin')],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          editUrl: 'https://github.com/microsoft/griffel/tree/main/apps/website/',
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: '/',
        },
        blog: false,
        theme: {
          customCss: [
            require.resolve('./src/css/custom.css'),
            require.resolve('./src/css/fonts.css'),
            require.resolve('./src/css/theme.css'),
          ],
        },
      }),
    ],
  ],

  themes: ['@docusaurus/theme-mermaid'],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: true,
        respectPrefersColorScheme: false,
      },

      docs: {
        sidebar: {
          autoCollapseCategories: false,
        },
      },
      footer: {
        links: [
          {
            label: 'Open source at Microsoft',
            href: 'https://opensource.microsoft.com',
          },
          {
            label: 'Microsoft Privacy Statement',
            href: 'http://aka.ms/privacy',
          },
        ],
      },
      navbar: {
        logo: {
          alt: 'Griffel.js',
          src: 'img/griffel.png',
        },
        items: [
          {
            type: 'doc',
            docId: 'react/install',
            position: 'right',
            label: 'For React.js',
          },
          {
            type: 'doc',
            docId: 'try-it-out/try-it-out',
            position: 'right',
            label: 'Try it out',
          },
          {
            href: 'https://github.com/microsoft/griffel',
            position: 'right',
            className: 'navbar-github-link',
            html: 'GitHub <span aria-hidden="true" />',
          },
        ],
      },
      prism: {
        darkTheme: prismTheme,
        prism: {
          additionalLanguages: ['javascript', 'css'],
        },
      },
    }),
};

module.exports = config;
