// @ts-check

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  organizationName: 'microsoft',
  projectName: 'griffel',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  title: 'Griffel',
  tagline: 'Dinosaurs are cool',

  url: 'https://your-docusaurus-test-site.com',
  baseUrl: '/',
  // favicon: 'img/favicon.ico',

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          editUrl: 'https://github.com/microsoft/griffel/tree/main/apps/docs/',
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: '/',
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Griffel',
        // logo: {
        //   alt: 'My Site Logo',
        //   src: 'img/logo.svg',
        // },
        items: [
          {
            type: 'doc',
            docId: 'react/install',
            position: 'left',
            label: 'for React.js',
          },
          {
            href: 'https://github.com/microsoft/griffel',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        prism: {
          additionalLanguages: ['javascript', 'css'],
        },
      },
    }),
};

module.exports = config;
