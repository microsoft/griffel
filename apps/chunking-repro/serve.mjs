// Serves the built dist over HTTP so the cascade behavior can be inspected
// in a browser. Pass --split to serve the split-mode build.
import * as http from 'node:http';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const split = process.argv.includes('--split');
const root = path.resolve(__dirname, '..', '..', 'dist/apps/chunking-repro', split ? 'split' : 'default');
const port = Number(process.env.PORT) || 3000;

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
};

http
  .createServer((req, res) => {
    const url = req.url === '/' ? '/page-a.html' : req.url.split('?')[0];
    const filePath = path.join(root, url);
    if (!filePath.startsWith(root)) {
      res.writeHead(403);
      res.end('forbidden');
      return;
    }
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': types[path.extname(filePath)] || 'application/octet-stream' });
      res.end(data);
    });
  })
  .listen(port, () => {
    console.log(`Serving ${path.relative(process.cwd(), root)} at http://localhost:${port}/`);
    console.log(`Pages: http://localhost:${port}/page-a.html  http://localhost:${port}/page-b.html`);
  });
