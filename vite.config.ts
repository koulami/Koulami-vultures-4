import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { handleGameApiRequest } from './src/server/gameApiHandler.ts';

function gameApiPlugin(): Plugin {
  return {
    name: 'game-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          const handled = await handleGameApiRequest(req, res);
          if (!handled) {
            next();
          }
        } catch (err) {
          console.error('Error in Vite game API middleware:', err);
          next();
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [gameApiPlugin(), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve('.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
