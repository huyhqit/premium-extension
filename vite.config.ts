import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, mkdirSync, readdirSync, existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

function copyManifestAndIcons() {
  return {
    name: 'copy-manifest-and-icons',
    closeBundle() {
      const outDir = resolve(__dirname, 'dist');
      // Copy manifest (paths in manifest already point to dist-relative paths)
      copyFileSync(resolve(__dirname, 'manifest.json'), resolve(outDir, 'manifest.json'));
      // Copy icons
      const iconsSrc = resolve(__dirname, 'icons');
      const iconsDest = resolve(outDir, 'icons');
      if (existsSync(iconsSrc)) {
        mkdirSync(iconsDest, { recursive: true });
        for (const name of readdirSync(iconsSrc)) {
          if (name.endsWith('.png') || name.endsWith('.svg')) {
            copyFileSync(resolve(iconsSrc, name), resolve(iconsDest, name));
          }
        }
      }
      // Copy content script CSS so manifest can load it
      const contentCssSrc = resolve(__dirname, 'src/content/content.css');
      if (existsSync(contentCssSrc)) {
        copyFileSync(contentCssSrc, resolve(outDir, 'content.css'));
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), copyManifestAndIcons()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
        options: resolve(__dirname, 'options.html'),
        background: resolve(__dirname, 'src/background/service-worker.ts'),
        content: resolve(__dirname, 'src/content/content.ts'),
      },
      output: {
        entryFileNames: (chunk) =>
          chunk.name === 'content' || chunk.name === 'background' ? '[name].js' : 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
    sourcemap: true,
  },
});
