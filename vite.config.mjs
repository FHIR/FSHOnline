import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
// import eslint from 'vite-plugin-eslint';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/FSHOnline/',
  define: {
    // Override __dirname in case a dependency (likely SUSHI or GoFSH) tries to use it
    // see: https://main.vitejs.dev/config/shared-options.html#define
    __dirname: '""'
  },
  plugins: [
    react(),
    // eslint(),
    nodePolyfills({
      include: [
        'constants', // resolves some warnings in console
        'fs', // resolves some warnings in console
        'http',
        'os',
        'path',
        'stream', // resolves some warnings in console
        'util'
      ]
    })
  ],
  resolve: {
    alias: {
      'fs-extra': './src/stubs/empty.js',
      'readline-sync': './src/stubs/empty.js',
      tar: './src/stubs/empty.js'
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: 'src/setupTests.js'
  }
});
