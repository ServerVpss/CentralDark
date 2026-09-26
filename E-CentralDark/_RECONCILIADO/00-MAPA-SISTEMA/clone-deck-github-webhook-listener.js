require('dotenv').config({ path: __dirname + '/.env', override: true });

const http = require('http');
const crypto = require('crypto');
const { execFile, exec } = require('child_process');
const fs = require('fs');

const PORT = 9003;
const SECRET = process.env.WEBHOOK_SECRET;
const PULL_SCRIPT = '/usr/local/bin/clone-deck-gh-pull';
const POST_DEPLOY = '/root/Multizap/apps/clone-deck/scripts/post-deploy.sh';
const EXPECTED_REPO = 'segredounlock/clone-deck';
const EXPECTED_REF = 'refs/heads/main';
const POST_DEPLOY_LOG = '/var/log/clone-deck-post-deploy.log';
const CRM_DIAG_LOG = '/var/log/clone-deck-crm-build-diag.log';

if (!SECRET) {
  console.error('[FATAL] WEBHOOK_SECRET nao definido em .env. Abortando.');
  process.exit(1);
}

function verifySignature(payload, sig) {
  if (!sig) return false;
  var hmac = crypto.createHmac('sha256', SECRET);
  var digest = 'sha256=' + hmac.update(payload).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(sig));
  } catch(e) { return false; }
}

function _tsBR() {
  const p = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).formatToParts(new Date());
  const g = (t) => (p.find(x => x.type === t) || {}).value || '00';
  return `${g('year')}-${g('month')}-${g('day')} ${g('hour')}:${g('minute')}:${g('second')} -03`;
}
function log(level, msg) {
  console.log('[' + _tsBR() + '] [' + level + '] ' + msg);
}

// Sanitizar logs antes de retornar — nunca expor secrets
function sanitizeLog(text) {
  return text
    .replace(/eyJ[A-Za-z0-9_-]{20,}/g, '***JWT***')
    .replace(/ghp_[A-Za-z0-9]{30,}/g, '***GH_PAT***')
    .replace(/sb_[a-z]+_[A-Za-z0-9_-]{20,}/g, '***SUPA_KEY***')
    .replace(/postgres:\/\/[^@\s]+@/g, 'postgres://***:***@')
    .replace(/https:\/\/[^:]+:[^@]+@/g, 'https://***:***@')
    .replace(/(WEBHOOK_SECRET=).+/g, '$1***')
    .replace(/(SERVICE_ROLE[_KEY]*=).+/g, '$1***')
    .replace(/(DATABASE_URL=).+/g, '$1***')
    .replace(/(TOKEN=).{10,}/g, '$1***')
    .replace(/(PASSWORD=).+/g, '$1***')
    .replace(/(API_KEY=).+/g, '$1***')
    .replace(/(SECRET=).{5,}/g, '$1***');
}

function readLastLines(filePath, n) {
  try {
    var content = fs.readFileSync(filePath, 'utf8');
    var lines = content.split('\n');
    return sanitizeLog(lines.slice(-n).join('\n'));
  } catch(e) {
    return 'Arquivo nao encontrado: ' + filePath;
  }
}

var server = http.createServer(function(req, res) {
  // Health check
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      ok: true,
      service: 'CloneDeck-GitHub-Webhook',
      port: PORT,
      repo: EXPECTED_REPO,
      branch: 'main',
      secret_loaded: true,
      post_deploy: true,
      time: new Date().toISOString()
    }));
  }

  // Log endpoint — retorna últimas 80 linhas do post-deploy log (sanitizado)
  if (req.method === 'GET' && req.url === '/logs') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    var output = '=== POST-DEPLOY LOG (last 80 lines) ===\n';
    output += readLastLines(POST_DEPLOY_LOG, 80);
    output += '\n\n=== CRM BUILD DIAG LOG ===\n';
    output += readLastLines(CRM_DIAG_LOG, 50);

    // Também tentar ler relatório de diag CRM se existir
    var diagFiles = [
      '/tmp/crm-build-diag-' // prefixo — buscar o mais recente
    ];
    try {
      var tmpFiles = fs.readdirSync('/tmp').filter(function(f) { return f.startsWith('crm-build-diag-'); });
      if (tmpFiles.length > 0) {
        tmpFiles.sort().reverse();
        var latest = '/tmp/' + tmpFiles[0];
        output += '\n\n=== CRM BUILD REPORT (' + tmpFiles[0] + ') ===\n';
        output += sanitizeLog(fs.readFileSync(latest, 'utf8'));
      }
    } catch(e) {
      output += '\n\nNenhum relatório CRM encontrado em /tmp';
    }

    return res.end(output);
  }

  // Webhook POST
  if (req.method !== 'POST' || req.url !== '/webhook') {
    res.writeHead(404);
    return res.end('Not found');
  }

  var body = '';
  req.on('data', function(c) { body += c; });
  req.on('end', function() {
    var sig = req.headers['x-hub-signature-256'] || '';
    if (!verifySignature(body, sig)) {
      log('REJECTED', 'Assinatura ausente ou invalida');
      res.writeHead(403);
      return res.end('Forbidden');
    }

    var payload;
    try { payload = JSON.parse(body); } catch(e) {
      res.writeHead(400);
      return res.end('Bad JSON');
    }

    var repo = (payload.repository && payload.repository.full_name) || '';
    var ref = payload.ref || '';

    if (repo !== EXPECTED_REPO) {
      log('IGNORED', 'Repo: ' + repo);
      res.writeHead(200);
      return res.end('Ignored: wrong repo');
    }

    if (ref !== EXPECTED_REF) {
      log('IGNORED', 'Ref: ' + ref);
      res.writeHead(200);
      return res.end('Ignored: not main');
    }

    log('PULL', repo + '@main by ' + ((payload.pusher && payload.pusher.name) || '?'));

    // 1. Git pull
    execFile(PULL_SCRIPT, function(err, stdout, stderr) {
      if (err) {
        log('ERROR', err.message);
        if (stderr) log('STDERR', stderr.trim());
      } else {
        log('OK', stdout.trim());
      }

      // 2. Post-deploy (timeout aumentado para 600s = 10 min para build CRM)
      if (fs.existsSync(POST_DEPLOY)) {
        log('POST-DEPLOY', 'Executando...');
        exec('bash ' + POST_DEPLOY, { timeout: 600000 }, function(pdErr, pdOut, pdStderr) {
          if (pdErr) {
            log('POST-DEPLOY-ERROR', pdErr.message);
          } else {
            log('POST-DEPLOY-OK', (pdOut || '').trim().slice(-200));
          }
        });
      }
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'accepted', repo: repo, ref: ref }));
  });
});

server.listen(PORT, '0.0.0.0', function() {
  log('START', 'CloneDeck-GitHub-Webhook escutando na porta ' + PORT + ' (com post-deploy + /logs)');
});
