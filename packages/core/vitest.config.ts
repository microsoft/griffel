import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { defineBrowserCommand } from '@vitest/browser-playwright';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/packages/core',
  plugins: [nxViteTsPaths()],
  test: {
    watch: false,
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/packages/core',
      provider: 'v8',
    },
    projects: [
      {
        plugins: [nxViteTsPaths()],
        test: {
          name: 'unit',
          environment: 'jsdom',
          include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
          exclude: ['{src,tests}/**/*.browser.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        },
      },
      {
        plugins: [nxViteTsPaths()],
        test: {
          name: 'browser',
          include: ['{src,tests}/**/*.browser.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: 'chromium' }],
            commands: {
              mouseDown: defineBrowserCommand(async ({ page }) => {
                await page.mouse.down();
              }),
              mouseUp: defineBrowserCommand(async ({ page }) => {
                await page.mouse.up();
              }),
            },
          },
        },
      },
    ],
  },
});
