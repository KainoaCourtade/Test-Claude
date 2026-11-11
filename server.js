'use strict';

// Serveur HTTP minimal, sans aucune dépendance externe (modules natifs Node uniquement).
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;

// Liste blanche des fichiers statiques servis : évite d'exposer server.js, .git, etc.
const STATIC_FILES = {
  '/': { file: 'index.html', type: 'text/html; charset=utf-8' },
  '/index.html': { file: 'index.html', type: 'text/html; charset=utf-8' },
  '/styles.css': { file: 'styles.css', type: 'text/css; charset=utf-8' },
  '/app.js': { file: 'app.js', type: 'application/javascript; charset=utf-8' },
};

function handler(req, res) {
  const { pathname } = new URL(req.url, 'http://localhost');

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8', Allow: 'GET, HEAD' });
    res.end('Method Not Allowed');
    return;
  }

  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(req.method === 'HEAD' ? undefined : 'ok');
    return;
  }

  const entry = STATIC_FILES[pathname];
  if (!entry) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
    return;
  }

  fs.readFile(path.join(ROOT, entry.file), (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Internal Server Error');
      return;
    }
    res.writeHead(200, { 'Content-Type': entry.type, 'Content-Length': data.length });
    res.end(req.method === 'HEAD' ? undefined : data);
  });
}

function createServer() {
  return http.createServer(handler);
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  createServer().listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
  });
}

module.exports = { createServer };
