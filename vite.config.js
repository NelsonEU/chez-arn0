import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const libDataDir = resolve(root, 'lib/data');

// Serves lib/data/*.json at /data/*.json — in dev via a middleware, in the
// production build via emitted assets — so pages can fetch() it like a real
// API instead of importing it as a bundled JS module.
function libData() {
  return {
    name: 'lib-data',
    configureServer(server) {
      server.middlewares.use('/data', (req, res, next) => {
        try {
          const file = resolve(libDataDir, '.' + req.url.split('?')[0]);
          res.setHeader('Content-Type', 'application/json');
          res.end(readFileSync(file));
        } catch {
          next();
        }
      });
    },
    generateBundle() {
      for (const name of readdirSync(libDataDir)) {
        this.emitFile({
          type: 'asset',
          fileName: `data/${name}`,
          source: readFileSync(resolve(libDataDir, name)),
        });
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), libData()],
});
