#!/usr/bin/env node
/**
 * CentralDark Webhook Deploy — RETIRED.
 * Preserved only as an inert identification surface.
 * Canonical deploy owner: GitHub Actions self-hosted.
 */
import http from 'node:http';

const HOST = process.env.WEBHOOK_DEPLOY_HOST || '127.0.0.1';
const PORT = Number(process.env.WEBHOOK_DEPLOY_PORT || 9300);

const retired = {
  status: 'retired',
  canonicalDeploy: 'github-actions',
  mutatesRepository: false,
};

function json(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(body));
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    return json(res, 200, retired);
  }
  if (req.method === 'POST' && req.url === '/webhook') {
    return json(res, 410, retired);
  }
  return json(res, 404, retired);
});

server.listen(PORT, HOST, () => {
  console.log(JSON.stringify({
    ...retired,
    listen: HOST + ':' + PORT,
  }));
});
