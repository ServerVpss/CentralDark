import http from 'http';
import { exec } from 'child_process';

const port = process.env.WEBHOOK_DEPLOY_PORT || 9300;
const REPO_PATH = process.env.REPO_PATH || '/root/CentralDark';

// CORS global pro painel status.centralldark.com (e qualquer painel público).
function applyCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Vary', 'Origin');
}

const server = http.createServer((req, res) => {
  applyCors(res);

  // Preflight responde 204 imediato.
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/webhook') {
    console.log('[deploy] gatilho do GitHub recebido — iniciando git fetch/reset…');
    exec(
      `cd ${REPO_PATH} && git fetch origin main && git reset --hard origin/main`,
      (err, stdout, stderr) => {
        if (err) {
          console.error(`[deploy] erro: ${err}`);
          return;
        }
        console.log(`[deploy] OK: ${stdout}`);
      },
    );
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'Deploy iniciado na VPS' }));
    return;
  }

  if (req.url === '/health' || req.url === '/health/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'UP',
        service: 'centraldark-webhook-deploy',
        port,
        timestamp: new Date().toISOString(),
      }),
    );
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'not_found' }));
});

server.listen(port, '127.0.0.1', () => {
  console.log(`[deploy] webhook escutando em http://127.0.0.1:${port}`);
});
