import { build } from 'vite';
import { fileURLToPath } from 'node:url';
await build({
  configFile: false,
  publicDir: false,
  logLevel: 'warn',
  build: {
    outDir: fileURLToPath(new URL('../public/admin/', import.meta.url)),
    emptyOutDir: false,
    lib: { entry: fileURLToPath(new URL('./cms-entry.mjs', import.meta.url)), formats: ['es'], fileName: () => 'cms.js' },
    rollupOptions: { output: { chunkFileNames: 'chunks/[name]-[hash].js', assetFileNames: 'assets/[name]-[hash][extname]' } },
    sourcemap: false,
    chunkSizeWarningLimit: 5000
  }
});
console.log('Bundled pinned Sveltia CMS and lazy chunks locally.');
