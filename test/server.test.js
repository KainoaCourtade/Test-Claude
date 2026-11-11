'use strict';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createServer } = require('../server.js');

let server;
let baseUrl;

before(async () => {
  server = createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test('GET /health répond ok', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.equal(res.status, 200);
  assert.equal(await res.text(), 'ok');
});

test('GET / sert index.html', async () => {
  const res = await fetch(`${baseUrl}/`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /text\/html/);
  const expected = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.equal(await res.text(), expected);
});

test('les ressources de index.html sont servies', async () => {
  for (const [file, type] of [['styles.css', /text\/css/], ['app.js', /javascript/]]) {
    const res = await fetch(`${baseUrl}/${file}`);
    assert.equal(res.status, 200, file);
    assert.match(res.headers.get('content-type'), type);
  }
});

test('une route inconnue renvoie 404 et server.js n\'est pas exposé', async () => {
  for (const p of ['/inconnu', '/server.js', '/../package.json']) {
    const res = await fetch(`${baseUrl}${p}`);
    assert.equal(res.status, 404, p);
  }
});

test('une méthode non GET renvoie 405', async () => {
  const res = await fetch(`${baseUrl}/health`, { method: 'POST' });
  assert.equal(res.status, 405);
});
