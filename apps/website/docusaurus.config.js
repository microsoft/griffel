// @ts-check

const lightCodeTheme = require('prism-react-renderer/themes/vsLight');
const darkCodeTheme = require('prism-react-renderer/themes/vsDark');

/** @type {import('@docusaurus/types').Config} */
const config = {
  organizationName: 'microsoft',
  projectName: 'griffel',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',

  title: 'Griffel',
  tagline: 'Dinosaurs are cool',

  url: 'https://griffel.js.org',
  baseUrl: '/',
  // favicon: 'img/favicon.ico',

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
            require.resolve('@codesandbox/sandpack-react/dist/index.css'),
          ],
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      autoCollapseSidebarCategories: false,
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
            label: 'For React.js',
          },
          {
            type: 'doc',
            docId: 'try-it-out',
            position: 'left',
            label: 'Try it out',
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
