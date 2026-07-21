import http from 'http';

const port = Number(process.env.WEBHOOK_DEPLOY_PORT || 9300);

function json(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(body));
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/webhook') {
    json(res, 410, {
      status: 'retired',
      canonicalDeploy: 'github-actions',
      mutatesRepository: false,
    });
    return;
  }

  if (req.method === 'GET' && (req.url === '/health' || req.url === '/health/')) {
    json(res, 200, {
      status: 'RETIRED',
      service: 'centraldark-webhook-deploy',
      canonicalDeploy: 'github-actions',
      mutatesRepository: false,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  json(res, 404, { error: 'not_found' });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`[deploy] webhook legado em modo inerte em 127.0.0.1:${port}`);
});
