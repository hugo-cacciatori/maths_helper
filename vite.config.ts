/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

/** KaTeX ships every font as woff2 + woff + ttf; all supported browsers/webviews read woff2, so drop the rest before inlining. */
function katexWoff2Only(): Plugin {
  return {
    name: 'katex-woff2-only',
    enforce: 'pre',
    transform(code, id) {
      if (!id.includes('katex') || !id.split('?')[0].endsWith('.css')) return;
      return code.replace(/,\s*url\([^)]*\.(?:woff|ttf)\)\s*format\("(?:woff|truetype)"\)/g, '');
    },
  };
}

export default defineConfig({
  plugins: [katexWoff2Only(), react(), tailwindcss(), viteSingleFile()],
  // One self-contained index.html: used as-is for the web release and embedded by the desktop shell.
  build: { outDir: 'dist-web', emptyOutDir: true, assetsInlineLimit: 100_000_000, chunkSizeWarningLimit: 4000 },
  server: { port: 5173, strictPort: true },
  clearScreen: false,
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.{ts,tsx}'],
    setupFiles: ['tests/setup.ts'],
  },
});
