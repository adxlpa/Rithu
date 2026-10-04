import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function saveDefaultPdfPlugin(): Plugin {
  return {
    name: 'save-default-pdf-plugin',
    configureServer(server) {
      server.middlewares.use('/api/save-pdf-page', (req, res) => {
        const pdfPagesDir = path.resolve(__dirname, 'public/pdf-pages');
        const manifestPath = path.resolve(pdfPagesDir, 'manifest.json');

        if (req.method === 'POST') {
          const chunks: Buffer[] = [];
          req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
          req.on('end', () => {
            try {
              const bodyStr = Buffer.concat(chunks).toString('utf8');
              const payload = JSON.parse(bodyStr);

              fs.mkdirSync(pdfPagesDir, {recursive: true});

              if (payload.reset) {
                if (fs.existsSync(pdfPagesDir)) {
                  for (const f of fs.readdirSync(pdfPagesDir)) {
                    fs.unlinkSync(path.join(pdfPagesDir, f));
                  }
                }
              }

              const pageNum = Number(payload.pageIndex) + 1;
              const totalPages = Number(payload.totalPages) || 74;
              const dataUrl: string = payload.dataUrl || '';
              const base64Part = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;

              if (base64Part) {
                const imgBuffer = Buffer.from(base64Part, 'base64');
                fs.writeFileSync(path.join(pdfPagesDir, `page-${pageNum}.jpg`), imgBuffer);
              }

              if (payload.isLast || pageNum === totalPages) {
                const pagesList = [];
                for (let i = 1; i <= totalPages; i++) {
                  const isCover = i === 1;
                  const isBack = i === totalPages;
                  pagesList.push({
                    id: `pdf-page-${i}`,
                    pageNumber: i - 1,
                    type: isCover ? 'cover' : isBack ? 'back-cover' : 'content',
                    title: isCover ? 'Cover' : isBack ? 'Back Cover' : `Page ${i}`,
                    subtitle: `PDF Page ${i} of ${totalPages}`,
                    pdfImageUrl: `pdf-pages/page-${i}.jpg`,
                  });
                }
                const manifest = {
                  edition: payload.edition || {
                    title: 'Rithu — College Magazine',
                    year: '2026',
                    institution: 'College of Engineering Munnar',
                    totalPages,
                    sourceType: 'pdf',
                    fileName: 'Rithu_Magazine.pdf',
                    updatedAt: 'Published PDF Edition',
                  },
                  pages: pagesList,
                };
                fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
              }

              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({ok: true, pageNum}));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({error: String(err)}));
            }
          });
          return;
        }

        if (req.method === 'DELETE') {
          try {
            if (fs.existsSync(pdfPagesDir)) {
              for (const f of fs.readdirSync(pdfPagesDir)) {
                fs.unlinkSync(path.join(pdfPagesDir, f));
              }
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
