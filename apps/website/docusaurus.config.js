// @ts-check

const vsDarkTheme = require('prism-react-renderer/themes/vsDark');
const prismTheme = {
  ...vsDarkTheme,
  plain: {
    ...vsDarkTheme.plain,
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

  plugins: [require.resolve('./src/components/Playground/docusaurusPlugin')],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          editUrl: 'https://github.com/microsoft/griffel/tree/main/apps/website/',
          sidebarPath: require.resolve('./sidebars.js'),
          remarkPlugins: [[require('mdx-mermaid'), {}]],
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
            html: 'Github <span aria-hidden="true" />',
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
