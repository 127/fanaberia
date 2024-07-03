import { defineConfig } from 'vite';
import { installGlobals } from '@remix-run/node';
import { vitePlugin as remix } from '@remix-run/dev';
import tsconfigPaths from 'vite-tsconfig-paths';

installGlobals();

//TODO: remove prisma alias when fixed
export default defineConfig({
  plugins: [remix(), tsconfigPaths()],
  resolve: {
    alias: {
      '.prisma/client/index-browser':
        './node_modules/.prisma/client/index-browser.js',
    },
  },
});
