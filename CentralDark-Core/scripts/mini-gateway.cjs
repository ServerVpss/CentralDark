const http = require('http');
const fs = require('fs');
const PORT = 9000;

// Função auxiliar pra fazer health check de porta
function checkPort(host, port, timeout = 1000) {
  return new Promise((resolve) => {
    const req = http.request({ host, port, method: 'HEAD', timeout }, () => {
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

// Função pra checar acesso ao K:/ (via fs.access)
function checkDiskAccess() {
  return new Promise((resolve) => {
    fs.access('K:/', fs.constants.R_OK, (err) => {
      resolve(err === null);
    });
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.url === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok', gateway: 'casa', time: new Date().toISOString() }));
  } 
  else if (req.url === '/status') {
    // Health check de cada componente
    const checks = {
      gateway: { status: 'online', port: 9000, time: new Date().toISOString() },
      instinto: { port: 8080, status: await checkPort('127.0.0.1', 8080) ? 'online' : 'offline' },
      screenpipe: { port: 3030, status: await checkPort('127.0.0.1', 3030) ? 'online' : 'offline' },
      hermes: { status: 'unknown', note: 'daemon configured' },
      disk_k: { path: 'K:/', status: await checkDiskAccess() ? 'accessible' : 'offline' },
      vps_tailscale: { ip: '100.123.93.25', status: await checkPort('100.123.93.25', 9000, 2000) ? 'online' : 'offline' }
    };
    
    // Calcular saúde geral
    const statuses = Object.values(checks).map(c => c.status);
    const online = statuses.filter(s => s === 'online' || s === 'accessible').length;
    const total = statuses.filter(s => s !== 'unknown').length;
    
    let health = 'green';
    if (online === total) health = 'green';
    else if (online >= total * 0.75) health = 'yellow';
    else health = 'red';
    
    res.writeHead(200);
    res.end(JSON.stringify({
      health,
      components: checks,
      summary: { online, total, percentage: Math.round((online / total) * 100) }
    }));
  }
  else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'not found' }));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('Gateway listening on 0.0.0.0:' + PORT);
});
