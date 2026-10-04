import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function saveDefaultPdfPlugin(): Plugin {
  return {
    name: 'save-default-pdf-plugin',
    configureServer(server) {
      server.middlewares.use('/api/save-default-pdf', (req, res) => {
        const publicPdfPath = path.resolve(__dirname, 'public/rithu-magazine.pdf');
        if (req.method === 'POST') {
          const chunks: Buffer[] = [];
          req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
          req.on('end', () => {
            try {
              const buffer = Buffer.concat(chunks);
              if (buffer.length < 100) {
                res.statusCode = 400;
                res.end(JSON.stringify({error: 'Empty or invalid PDF payload'}));
                return;
              }
              fs.mkdirSync(path.dirname(publicPdfPath), {recursive: true});
              fs.writeFileSync(publicPdfPath, buffer);
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({ok: true, path: '/rithu-magazine.pdf', bytes: buffer.length}));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({error: String(err)}));
            }
          });
          return;
        }
        if (req.method === 'DELETE') {
          try {
            if (fs.existsSync(publicPdfPath)) {
              fs.unlinkSync(publicPdfPath);
            }
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({ok: true}));
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({error: String(err)}));
          }
          return;
        }
        res.statusCode = 405;
        res.end();
      });
    },
  };
}

export default defineConfig(({command}) => {
  return {
    plugins: [react(), tailwindcss(), saveDefaultPdfPlugin()],
    base: command === 'build' ? './' : '/',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
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
