#!/usr/bin/env node
// CHEFE: Hermes gateway delegator — expõe terminal/shell/automação via HTTP/Tailscale
// Configurado 2026-10-23 para permitir delegação de tarefas entre CASA ↔ VPS
// Autenticação: Bearer token (REDACTED_ADMIN_TOKEN)

const http = require('http');
const url = require('url');

const PORT = 9000;
const ADMIN_TOKEN = '[REDACTED_ADMIN_TOKEN]'; // CHEFE: token admin configurado 2026-10-23
const CASA_ENDPOINT = 'http://127.0.0.1:8080';
const HERMES_API = 'http://127.0.0.1:18434/v1'; // kylin bridge (VPS style)

const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Auth check
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ') || authHeader.slice(7) !== ADMIN_TOKEN) {
    res.writeHead(401);
    res.end(JSON.stringify({ error: 'Unauthorized' }));
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // GET /health
  if (pathname === '/health' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({ 
      status: 'ok', 
      gateway: 'hermes-delegator', 
      version: '2026.10.23',
      casa: process.env.CASA_NAME || 'CASA-k7',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // POST /delegate — execute command on Windows (Hermes terminal)
  if (pathname === '/delegate' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        const { command, tool = 'terminal', timeout = 30 } = payload;

        if (!command) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Missing command field' }));
          return;
        }

        // Simple delegation: exec command via Node child_process
        // SEGURO: gateway é interno (Tailscale) e requer Bearer token admin.
        // Input vem de CHEFE/admin autorizado, não de usuário untrusted.
        const { execSync } = require('child_process');
        try {
          const result = execSync(command, { encoding: 'utf8', timeout: timeout * 1000 });
          res.writeHead(200);
          res.end(JSON.stringify({
            ok: true,
            tool,
            command,
            output: result,
            timestamp: new Date().toISOString()
          }));
        } catch (execError) {
          res.writeHead(500);
          res.end(JSON.stringify({
            ok: false,
            tool,
            command,
            error: execError.message,
            stderr: execError.stderr ? execError.stderr.toString() : '',
            timestamp: new Date().toISOString()
          }));
        }
      } catch (parseError) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // 404
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Hermes Gateway Delegator] listening on 0.0.0.0:${PORT}`);
  console.log(`[CASA]  terminal backend configured for Windows delegation`);
  console.log(`[Auth]  Bearer token required (check HERMES_GATEWAY_TOKEN)`);
  console.log(`[Endpoints]`);
  console.log(`  GET  /health              — gateway status`);
  console.log(`  POST /delegate            — execute command`);
});
