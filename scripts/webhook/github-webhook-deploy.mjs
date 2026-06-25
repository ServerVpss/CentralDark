import http from 'http';
import { safeResetToOrigin } from './lib/safe-git-deploy.mjs';

const port = process.env.WEBHOOK_DEPLOY_PORT || 9300;
const REPO_PATH = process.env.REPO_PATH || '/root/CentralDark';

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

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
    log('[deploy] gatilho do GitHub recebido — iniciando atualização segura…');
    // Responde já e roda o deploy em background (igual ao comportamento anterior).
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'Deploy iniciado na VPS' }));

    safeResetToOrigin({ repoPath: REPO_PATH, branch: 'main', log })
      .then((r) => {
        if (r.ok) {
          log(`[deploy] OK (stash=${r.stashed} conflito=${r.stashConflict} backup=${r.backupRef || 'nenhum'})`);
        } else {
          log('[deploy] FALHOU — ver mensagens [safe-deploy] acima');
        }
      })
      .catch((e) => log(`[deploy] erro inesperado: ${e.message}`));
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
