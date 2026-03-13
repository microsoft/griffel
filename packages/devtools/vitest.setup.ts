import { vi } from 'vitest';

const chrome = {
  devtools: {
    inspectedWindow: {
      getResources: vi.fn((cb: (resources: unknown[]) => void) => {
        cb([
          {
            url: 'webpack://testscope/root/packages/test1/src/App.styles.js?42f2',
            type: 'sm-script',
            getContent: () => '',
            setContent: () => ({}),
          },
        ]);
      }),
      onResourceAdded: {
        addListener: vi.fn(),
      },
    },
    panels: {
      themeName: 'dark',
      elements: {
        createSidebarPane: vi.fn(),
      },
    },
  },
};

Object.assign(globalThis, { chrome });
