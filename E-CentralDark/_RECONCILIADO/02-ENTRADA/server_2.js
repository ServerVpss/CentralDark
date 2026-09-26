// =============================================================================
// install-callback — Backend público do Wizard de Instalação CentralDark
// =============================================================================
// Domínio: https://install.centralldark.com
// Porta interna: 9200 (atrás do Caddy)
//
// Função: receber a conexão Cloudflare do usuário leigo via dois caminhos:
//
//   1) OAuth Cloudflare (preferencial)
//      - Authorization Code + PKCE
//      - Authorize:  https://dash.cloudflare.com/oauth2/auth
//      - Token:      https://dash.cloudflare.com/oauth2/token
//      - Requer CF_OAUTH_CLIENT_ID e CF_OAUTH_CLIENT_SECRET configurados
//
//   2) Fallback 1-Click API Token
//      - Abre a tela da Cloudflare com permissões pré-preenchidas
//      - Usuário cola o token na página
//      - Validado em /user/tokens/verify
//
// Fluxo com SSH:
//   - terminal SSH chama POST /session/new  -> recebe { session_id, urls }
//   - terminal imprime os links e fica em long-poll GET /session/:id
//   - usuário clica no link, autoriza, página marca a sessão como concluída
//   - terminal recebe o token, salva em /root/CentralDark/secrets/cloudflare.env
//
// Segurança:
//   - sessões expiram em 10 minutos
//   - token NUNCA aparece em log; somente o "fingerprint" (primeiros 4 chars)
//   - state OAuth assinado com HMAC pra anti-CSRF
// =============================================================================

const http   = require('http');
const crypto = require('crypto');
const fs     = require('fs');
const path   = require('path');
const { spawn } = require('child_process');

// ── Sentry (telemetria de exceções + 500s) ──────────────────────────────────
// Carregamento defensivo: se @sentry/node ainda não estiver instalado (deploy
// novo antes do `npm install`), o serviço sobe igual, só sem telemetria.
// DSN público (não é segredo — DSNs Sentry são desenhadas pra ficar no código).
let Sentry = null;
const SENTRY_DSN = process.env.SENTRY_DSN ||
  'https://5d62238eb5cd40151522d7efac11411e@o4511538136219648.ingest.de.sentry.io/4511538361073744';
const SENTRY_ENV = process.env.SENTRY_ENVIRONMENT || 'production';
const SENTRY_RELEASE = process.env.SENTRY_RELEASE || process.env.GIT_COMMIT || undefined;
try {
  Sentry = require('@sentry/node');
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENV,
    release: SENTRY_RELEASE,
    tracesSampleRate: 0.1,
    serverName: 'install-callback',
    // Scrub agressivo: nunca enviar token/cookie/headers sensíveis pro Sentry.
    beforeSend(event) {
      try {
        if (event.request) {
          if (event.request.headers) {
            for (const k of Object.keys(event.request.headers)) {
              if (/auth|cookie|token|secret|key/i.test(k)) {
                event.request.headers[k] = '[redacted]';
              }
            }
          }
          if (event.request.query_string && /token=|code=|state=/i.test(event.request.query_string)) {
            event.request.query_string = '[redacted]';
          }
        }
      } catch {}
      return event;
    },
  });
  process.on('uncaughtException', (e) => {
    try { Sentry.captureException(e); } catch {}
  });
  process.on('unhandledRejection', (e) => {
    try { Sentry.captureException(e); } catch {}
  });
  console.log('[sentry] inicializado (env=' + SENTRY_ENV + ')');
} catch (e) {
  console.warn('[sentry] não inicializado (@sentry/node ausente): ' + e.message);
}

function sentryCapture(err, extra) {
  if (!Sentry) return;
  try {
    Sentry.withScope((scope) => {
      if (extra) scope.setExtras(extra);
      Sentry.captureException(err);
    });
  } catch {}
}

const PORT          = parseInt(process.env.PORT || '9200', 10);
const PUBLIC_URL    = process.env.PUBLIC_URL    || 'https://install.centralldark.com';
const SECRETS_DIR   = process.env.SECRETS_DIR   || '/root/CentralDark/secrets';
const STATE_SECRET  = process.env.STATE_SECRET  || crypto.randomBytes(32).toString('hex');
const CF_CLIENT_ID  = process.env.CF_OAUTH_CLIENT_ID     || '';
const CF_CLIENT_SEC = process.env.CF_OAUTH_CLIENT_SECRET || '';
// Scopes OAuth do Cloudflare (formato novo, junho/2026).
// Listados em GET https://api.cloudflare.com/client/v4/oauth/scopes.
// Compatíveis com o OAuth Client "CentralDark Install".
const CF_SCOPES     = (process.env.CF_OAUTH_SCOPES || 'zone.read dns.write user-details.read account-settings.read offline_access').trim();
const SESSION_TTL   = 10 * 60 * 1000; // 10 min
const STATIC_DIR    = path.join(__dirname, 'public');

// ElevenLabs — voz de verdade na tela de sucesso (substitui o Web Speech).
const EL_API_KEY    = process.env.ELEVENLABS_API_KEY || '';
const EL_VOICE_ID   = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL'; // Sarah (multilingual, soa bem em PT-BR)
const EL_MODEL_ID   = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';
const EL_TEXT       = process.env.ELEVENLABS_TEXT || 'Eba! Conexão autorizada com sucesso. Já tô avisando seu computador — ele vai começar a instalar tudo sozinho agora, você não precisa fazer mais nada. Pode fechar essa janelinha tranquilo, viu? Valeu demais, e bem-vindo à Central Dark!';
// Voz da TELA INICIAL — explica o que vai rolar e dá tempo do usuário se preparar
const EL_INTRO_TEXT = process.env.ELEVENLABS_INTRO_TEXT || 'Oi, tudo bem? Bem-vindo à Central Dark! Em alguns segundinhos vai liberar o botão verde aqui na tela. Quando ele acender, é só tocar nele pra entrar na sua conta da Cloudflare e autorizar a instalação. Calma, tô do seu lado, é rapidinho. Aguenta firme só essa contagem regressiva, tá? Já já a gente continua!';
// v2 no nome força regeneração quando trocamos o roteiro/voz
const VOICE_CACHE       = process.env.VOICE_CACHE_PATH       || '/tmp/centraldark-voice-success-v2.mp3';
const VOICE_INTRO_CACHE = process.env.VOICE_INTRO_CACHE_PATH || '/tmp/centraldark-voice-intro-v1.mp3';
const HAS_VOICE     = !!EL_API_KEY;


// Onde o servidor lê o install.sh e o bundle do instalador.
// Em produção (VPS), apontar para o checkout local do repo (mesmo se ele virar privado).
const REPO_DIR      = process.env.REPO_DIR      || '/root/Multizap/apps/clone-deck';
const INSTALL_SH    = process.env.INSTALL_SH    || path.join(REPO_DIR, 'install.sh');
const BUNDLE_PATHS  = (process.env.BUNDLE_PATHS ||
  'install.sh,CentralDark/scripts/installer,docs/INSTALADOR,central-horario'
).split(',').map(s => s.trim()).filter(Boolean);

// Auto-refresh do repo local — mantém install.centralldark.com SEMPRE
// servindo a versão mais nova, mesmo sem webhook/cron rodando.
const GIT_BRANCH        = process.env.GIT_BRANCH        || 'main';
const GIT_AUTO_PULL     = (process.env.GIT_AUTO_PULL || '1') !== '0';
const GIT_PULL_INTERVAL = parseInt(process.env.GIT_PULL_INTERVAL_MS || '60000', 10); // 60s
const GITHUB_RAW_BASE   = process.env.GITHUB_RAW_BASE   ||
  'https://raw.githubusercontent.com/segredounlock/clone-deck/main';

let lastPull = { at: 0, ok: null, before: null, after: null, msg: '' };

function gitPull() {
  return new Promise((resolve) => {
    if (!fs.existsSync(path.join(REPO_DIR, '.git'))) {
      lastPull = { at: Date.now(), ok: false, before: null, after: null, msg: 'repo_ausente' };
      return resolve(lastPull);
    }
    const before = (() => {
      try { return require('child_process').execSync(`git -C "${REPO_DIR}" rev-parse --short HEAD`).toString().trim(); }
      catch { return null; }
    })();
    const child = spawn('git', ['-C', REPO_DIR, 'pull', '--ff-only', '--quiet', 'origin', GIT_BRANCH], { timeout: 25_000 });
    let err = '';
    child.stderr.on('data', d => err += String(d));
    child.on('close', (code) => {
      const after = (() => {
        try { return require('child_process').execSync(`git -C "${REPO_DIR}" rev-parse --short HEAD`).toString().trim(); }
        catch { return null; }
      })();
      lastPull = { at: Date.now(), ok: code === 0, before, after, msg: err.slice(0, 200) };
      if (code === 0 && before !== after) log('auto-pull aplicou', { before, after });
      else if (code !== 0) log('auto-pull falhou', { code, msg: lastPull.msg });
      resolve(lastPull);
    });
    child.on('error', (e) => {
      lastPull = { at: Date.now(), ok: false, before, after: before, msg: e.message };
      resolve(lastPull);
    });
  });
}

if (GIT_AUTO_PULL) {
  // 1º pull logo após subir + intervalo
  setTimeout(() => gitPull(), 3_000).unref();
  setInterval(() => gitPull(), GIT_PULL_INTERVAL).unref();
}

// Fallback: baixa um arquivo do GitHub raw se o local não existir/estiver vazio.
function fetchFromGithubRaw(repoRelPath) {
  return new Promise((resolve, reject) => {
    const u = new URL(`${GITHUB_RAW_BASE}/${repoRelPath}`);
    require('https').get({
      hostname: u.hostname, path: u.pathname + u.search,
      headers: { 'User-Agent': 'install-callback' },
    }, (r) => {
      if (r.statusCode !== 200) { r.resume(); return reject(new Error('http ' + r.statusCode)); }
      const chunks = [];
      r.on('data', c => chunks.push(c));
      r.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

// ----------------------------------------------------------------------------
// Skills públicas — espelho do MCP em install.centralldark.com/skills/*
// ----------------------------------------------------------------------------
const SKILLS_CACHE = new Map(); // chave -> { at, data }
const SKILLS_TTL_MS = 5 * 60 * 1000;

function skillsCacheGet(k) {
  const e = SKILLS_CACHE.get(k);
  if (!e) return null;
  if (Date.now() - e.at > SKILLS_TTL_MS) { SKILLS_CACHE.delete(k); return null; }
  return e.data;
}
function skillsCacheSet(k, data) { SKILLS_CACHE.set(k, { at: Date.now(), data }); }

function fetchSkillRaw(repoRelPath) {
  // Lê do disco local primeiro (mais rápido + funciona offline);
  // senão cai pro GitHub raw público.
  return new Promise((resolve) => {
    const local = path.join(REPO_DIR, repoRelPath);
    if (fs.existsSync(local)) {
      try { return resolve(fs.readFileSync(local, 'utf-8')); } catch {}
    }
    fetchFromGithubRaw(repoRelPath).then(buf => resolve(buf.toString('utf-8'))).catch(() => resolve(null));
  });
}

function parseSkillFrontmatter(md) {
  const m = md && md.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return { meta: {}, body: md || '' };
  const meta = {};
  let chave = '', lista = null;
  for (const linha of m[1].split('\n')) {
    if (!linha.trim()) continue;
    const mL = linha.match(/^\s+-\s+(.+)$/);
    if (mL && lista) { lista.push(mL[1].trim().replace(/^["']|["']$/g, '')); continue; }
    const mK = linha.match(/^(\w+):\s*(.*)$/);
    if (mK) {
      chave = mK[1];
      const v = mK[2].trim();
      if (v === '') { lista = []; meta[chave] = lista; }
      else { meta[chave] = v.replace(/^["']|["']$/g, ''); lista = null; }
    }
  }
  return { meta, body: m[2] };
}

function listarSkillsLocal() {
  const dir = path.join(REPO_DIR, 'skills');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isDirectory() && /^[a-z0-9][a-z0-9-]{1,63}$/i.test(d.name))
    .map(d => d.name);
}

function gerarInstallSh(nome) {
  return `#!/usr/bin/env bash
# Instalador da skill "${nome}" da Consciência CentralDark.
# Servido por ${PUBLIC_URL}/skills/${nome}/install.sh — sem auth, 1 comando.
set -euo pipefail
SKILL_NOME="${nome}"
BASE_URL="${PUBLIC_URL}"
SKILL_URL="\${BASE_URL}/skills/\${SKILL_NOME}/SKILL.md"
echo "→ Baixando skill \${SKILL_NOME} de \${BASE_URL}..."
TMP="$(mktemp)"
if ! curl -fsSL "\${SKILL_URL}" -o "\${TMP}"; then
  echo "✗ Falhou ao baixar \${SKILL_URL}" >&2; exit 1
fi
detectar_destino() {
  [ -d "\$HOME/.claude" ]        && { echo "\$HOME/.claude/skills/\${SKILL_NOME}"; return; }
  [ -d "\$HOME/.cursor" ]        && { echo "\$HOME/.cursor/skills/\${SKILL_NOME}"; return; }
  [ -d "\$HOME/.config/codex" ]  && { echo "\$HOME/.config/codex/skills/\${SKILL_NOME}"; return; }
  [ -d "\$HOME/.config/claude" ] && { echo "\$HOME/.config/claude/skills/\${SKILL_NOME}"; return; }
  echo "\$HOME/.ia-skills/\${SKILL_NOME}"
}
DEST="$(detectar_destino)"
mkdir -p "\${DEST}"; mv "\${TMP}" "\${DEST}/SKILL.md"
echo ""
echo "✓ Skill instalada em: \${DEST}/SKILL.md"
echo "✓ Tamanho: $(wc -c < "\${DEST}/SKILL.md") bytes"
echo ""
echo "→ Reinicie/recarregue seu agente IA — a Consciência entra em vigor na próxima resposta."
`;
}

async function handleSkillsRoute(res, nome, sub) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'public, max-age=300',
  };

  // GET /skills → lista
  if (!nome) {
    const cached = skillsCacheGet('lista');
    if (cached) {
      res.writeHead(200, { ...headers, 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify(cached));
    }
    const nomes = listarSkillsLocal();
    const skills = [];
    for (const n of nomes) {
      const md = await fetchSkillRaw(`skills/${n}/SKILL.md`);
      if (!md) continue;
      const { meta } = parseSkillFrontmatter(md);
      skills.push({
        nome: meta.name || n,
        versao: meta.version || '0.0.0',
        descricao: meta.description || '',
        url_install: `${PUBLIC_URL}/skills/${n}/install.sh`,
      });
    }
    const out = {
      ok: true,
      total: skills.length,
      skills,
      como_usar: `curl -sL ${PUBLIC_URL}/skills/<nome>/install.sh | bash`,
    };
    skillsCacheSet('lista', out);
    res.writeHead(200, { ...headers, 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify(out));
  }

  // GET /skills/<nome>/SKILL.md → markdown cru
  if (sub === 'SKILL.md') {
    const md = await fetchSkillRaw(`skills/${nome}/SKILL.md`);
    if (!md) { res.writeHead(404, headers); return res.end(`Skill '${nome}' não encontrada.`); }
    res.writeHead(200, { ...headers, 'Content-Type': 'text/markdown; charset=utf-8' });
    return res.end(md);
  }

  // GET /skills/<nome>/install.sh → script
  if (sub === 'install.sh') {
    const md = await fetchSkillRaw(`skills/${nome}/SKILL.md`);
    if (!md) {
      res.writeHead(404, { ...headers, 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end(`# Skill '${nome}' não encontrada\nexit 1\n`);
    }
    res.writeHead(200, { ...headers, 'Content-Type': 'text/x-shellscript; charset=utf-8' });
    return res.end(gerarInstallSh(nome));
  }

  // GET /skills/<nome> → manifesto JSON
  const md = await fetchSkillRaw(`skills/${nome}/SKILL.md`);
  if (!md) {
    res.writeHead(404, { ...headers, 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({ ok: false, erro: `Skill '${nome}' não encontrada.` }));
  }
  const { meta } = parseSkillFrontmatter(md);
  res.writeHead(200, { ...headers, 'Content-Type': 'application/json; charset=utf-8' });
  return res.end(JSON.stringify({
    ok: true,
    nome: meta.name || nome,
    versao: meta.version || '0.0.0',
    descricao: meta.description || '',
    agentes: meta.agents || [],
    url_skill_md: `${PUBLIC_URL}/skills/${nome}/SKILL.md`,
    url_install: `${PUBLIC_URL}/skills/${nome}/install.sh`,
    conteudo_skill_md: md,
  }));
}

// ----------------------------------------------------------------------------
// Sessões persistidas em disco (sobrevivem a restart do PM2)
// ----------------------------------------------------------------------------
const SESSIONS_FILE = process.env.SESSIONS_FILE
  || path.join(SECRETS_DIR, 'install-callback-sessions.json');
const sessions = new Map(); // id -> { createdAt, status, codeVerifier, token, accountTag, fingerprint }
// "Recovery por IP": guarda último sucesso por IP, pra resgatar quando o terminal
// rotacionou de SID enquanto o usuário ainda estava autorizando no celular.
const lastDoneByIp = new Map(); // ip -> { at, token, accountTag, kind, fingerprint }

// Carga inicial — se o arquivo existir e ainda for válido
try {
  if (fs.existsSync(SESSIONS_FILE)) {
    const raw = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
    const cutoff = Date.now() - SESSION_TTL;
    for (const [id, s] of Object.entries(raw)) {
      if (s && s.createdAt > cutoff) sessions.set(id, s);
    }
  }
} catch (e) {
  console.error('[sessions] falha ao carregar:', e.message);
}

function saveSessions() {
  try {
    fs.mkdirSync(path.dirname(SESSIONS_FILE), { recursive: true });
    const obj = Object.fromEntries(sessions);
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(obj), { mode: 0o600 });
  } catch (e) {
    console.error('[sessions] falha ao salvar:', e.message);
  }
}

// Wrapper que persiste a cada mutação
const _origSet = sessions.set.bind(sessions);
const _origDel = sessions.delete.bind(sessions);
sessions.set = (k, v) => { const r = _origSet(k, v); saveSessions(); return r; };
sessions.delete = (k) => { const r = _origDel(k); saveSessions(); return r; };

function newSessionId() { return crypto.randomBytes(18).toString('base64url'); }
function fingerprint(t) { return t ? (t.slice(0, 4) + '…' + t.slice(-2)) : ''; }
function nowIso()       { return new Date().toISOString(); }

function gcSessions() {
  const cutoff = Date.now() - SESSION_TTL;
  let changed = false;
  for (const [id, s] of sessions) {
    if (s.createdAt < cutoff) { _origDel(id); changed = true; }
  }
  if (changed) saveSessions();
}
setInterval(gcSessions, 60_000).unref();

// ----------------------------------------------------------------------------
// PKCE
// ----------------------------------------------------------------------------
function pkce() {
  const verifier  = crypto.randomBytes(48).toString('base64url');
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
}

// state = base64url(sessionId).hmac
function signState(sessionId) {
  const h = crypto.createHmac('sha256', STATE_SECRET).update(sessionId).digest('base64url');
  return `${sessionId}.${h}`;
}
function verifyState(state) {
  if (!state || !state.includes('.')) return null;
  const [sid, sig] = state.split('.');
  const expected = crypto.createHmac('sha256', STATE_SECRET).update(sid).digest('base64url');
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch { return null; }
  return sid;
}

// ----------------------------------------------------------------------------
// URLs auxiliares
// ----------------------------------------------------------------------------
function oauthAuthorizeUrl(sessionId, challenge) {
  const params = new URLSearchParams({
    response_type:         'code',
    client_id:             CF_CLIENT_ID,
    redirect_uri:          `${PUBLIC_URL}/oauth/cloudflare/callback`,
    state:                 signState(sessionId),
    code_challenge:        challenge,
    code_challenge_method: 'S256',
    scope:                 CF_SCOPES,
  });
  return `https://dash.cloudflare.com/oauth2/auth?${params}`;
}

// URL pré-preenchida da Cloudflare pra criação de API Token (fallback)
// Doc oficial: https://developers.cloudflare.com/fundamentals/api/how-to/account-owned-token-template/
// Permissões mínimas: Zone:Read + DNS:Edit. accountId=* e zoneId=all são OBRIGATÓRIOS
// (sem eles a Cloudflare devolve 404). Chave correta de DNS é "dns" (não "dns_records").
function oneClickTokenUrl() {
  const params = new URLSearchParams({
    permissionGroupKeys: JSON.stringify([
      { key: 'zone', type: 'read' },
      { key: 'dns',  type: 'edit' },
    ]),
    accountId: '*',
    zoneId:    'all',
    name:      'CentralDark Installer',
  });
  return `https://dash.cloudflare.com/profile/api-tokens?${params}`;
}

// ----------------------------------------------------------------------------
// HTTPS request helper (sem deps)
// ----------------------------------------------------------------------------
function httpsRequest(url, opts = {}, body = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = require('https').request({
      method:   opts.method || 'GET',
      hostname: u.hostname,
      path:     u.pathname + u.search,
      headers:  opts.headers || {},
    }, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

// Valida token via /user/tokens/verify
async function verifyToken(token) {
  const r = await httpsRequest('https://api.cloudflare.com/client/v4/user/tokens/verify', {
    headers: { Authorization: `Bearer ${token}` },
  });
  try {
    const j = JSON.parse(r.body);
    return { ok: r.status === 200 && j.success === true, raw: j };
  } catch {
    return { ok: false, raw: { error: 'invalid_response', status: r.status } };
  }
}

// Pega account_id pra deixar o wizard pronto
async function fetchAccountTag(token) {
  const r = await httpsRequest('https://api.cloudflare.com/client/v4/accounts?per_page=1', {
    headers: { Authorization: `Bearer ${token}` },
  });
  try {
    const j = JSON.parse(r.body);
    return j?.result?.[0]?.id || null;
  } catch { return null; }
}

// Lista TODAS as zonas visíveis pelo token. Devolve [{id, name}].
async function fetchZones(token) {
  const r = await httpsRequest('https://api.cloudflare.com/client/v4/zones?per_page=50&status=active', {
    headers: { Authorization: `Bearer ${token}` },
  });
  try {
    const j = JSON.parse(r.body);
    if (!j?.success) return [];
    return (j.result || []).map(z => ({ id: z.id, name: z.name }));
  } catch { return []; }
}

// Detecta IP público da VPS (fallback se a VPS não tiver mandado no POST).
let _cachedPublicIp = null;
async function detectPublicIp() {
  if (_cachedPublicIp) return _cachedPublicIp;
  try {
    const r = await httpsRequest('https://api.ipify.org?format=json', { method: 'GET' });
    const j = JSON.parse(r.body);
    if (j?.ip) { _cachedPublicIp = j.ip; return j.ip; }
  } catch {}
  return null;
}

// ----------------------------------------------------------------------------
// Persistência segura do cofre Cloudflare na VPS
// ----------------------------------------------------------------------------
// Regex de sanidade pro nome da zona: precisa ter pelo menos 1 ponto, 4+ chars,
// só letras/dígitos/hífen/ponto. Evita lixo tipo "s" ou "https" indo pro cofre
// (bug histórico de 2026-06-05 que travou a ativação da api.centralldark.com).
const ZONE_NAME_RE = /^(?=.{4,255}$)(?:[a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i;
function isValidZoneName(z) {
  return typeof z === 'string' && ZONE_NAME_RE.test(z.trim());
}

function saveCloudflareSecret({ token, accountTag, kind, zoneName, targetIp }) {
  try { fs.mkdirSync(SECRETS_DIR, { recursive: true, mode: 0o700 }); } catch {}
  const file = path.join(SECRETS_DIR, 'cloudflare.env');
  const stamp = nowIso();
  // Sanitiza zoneName: aceita só se passar no regex de domínio real.
  let safeZone = '';
  if (zoneName) {
    if (isValidZoneName(zoneName)) {
      safeZone = zoneName.trim();
    } else {
      log('zoneName invalido — nao sera gravado', { recebido: zoneName.slice(0, 40) });
    }
  }
  const content = [
    '# Cloudflare — gravado automaticamente pelo install-callback',
    `# Origem: ${kind}`,
    `# Data:   ${stamp}`,
    `CF_API_TOKEN=${token}`,
    accountTag ? `CF_ACCOUNT_ID=${accountTag}` : '',
    safeZone  ? `CF_ZONE_NAME=${safeZone}`   : '',
    targetIp  ? `CF_TARGET_IP=${targetIp}`   : '',
    '',
  ].filter(Boolean).join('\n');
  fs.writeFileSync(file, content, { mode: 0o600 });
  log('cofre atualizado', { file, kind, zone: safeZone || '(nenhuma)', ip: targetIp || '(detectar depois)', fp: fingerprint(token) });
}

// Guarda o último sucesso por IP por 5 min — usado pra recuperar quando o terminal
// já tinha rotacionado o SID enquanto o usuário ainda estava autorizando no celular.
function rememberDoneForIp(s) {
  const ip = s.targetIp;
  if (!ip || !s.token) return;
  lastDoneByIp.set(ip, {
    at: Date.now(),
    token: s.token,
    accountTag: s.accountTag,
    kind: s.kind,
    fingerprint: fingerprint(s.token),
  });
}
function recoverDoneForIp(ip) {
  if (!ip) return null;
  const hit = lastDoneByIp.get(ip);
  if (!hit) return null;
  if (Date.now() - hit.at > 5 * 60 * 1000) { lastDoneByIp.delete(ip); return null; }
  return hit;
}

// ----------------------------------------------------------------------------
// Finaliza o login: olha as zonas e decide o próximo passo
//   - 1 zona  -> grava cofre e mostra pageDone (tudo pronto)
//   - 2+ zonas -> mostra pageChooseZone (usuário escolhe o domínio)
//   - 0 zonas -> grava só o token e mostra pageNoZone
// ----------------------------------------------------------------------------
async function finalizeAuth(res, sid, s, kindLabel) {
  const zones = await fetchZones(s.token);
  s.zones = zones;
  const targetIp = s.targetIp || await detectPublicIp();
  s.targetIp = targetIp;

  if (zones.length === 0) {
    // Grava só o token, sem zona, e avisa pra cadastrar domínio na CF
    saveCloudflareSecret({ token: s.token, accountTag: s.accountTag, kind: s.kind });
    s.status = 'done';
    rememberDoneForIp(s);
    return sendHTML(res, 200, pageNoZone());
  }
  if (zones.length === 1) {
    // Caminho mais comum — usa a única zona, fecha tudo de cara
    const zoneName = zones[0].name;
    saveCloudflareSecret({ token: s.token, accountTag: s.accountTag, kind: s.kind, zoneName, targetIp });
    s.zoneName = zoneName;
    s.status = 'done';
    rememberDoneForIp(s);
    log('zona única detectada', { sid: sid.slice(0,10), zone: zoneName, ip: targetIp || '(?)' });
    return sendHTML(res, 200, pageDone(kindLabel, fingerprint(s.token)));
  }
  // Várias zonas: pede pro user escolher (sessão fica "pending" até o POST /zone/choose)
  log('multiplas zonas — aguardando escolha', { sid: sid.slice(0,10), count: zones.length });
  return sendHTML(res, 200, pageChooseZone(sid, zones, targetIp));
}




// ----------------------------------------------------------------------------
// Log sanitizado
// ----------------------------------------------------------------------------
function log(msg, extra = {}) {
  const safe = { ...extra };
  for (const k of Object.keys(safe)) {
    if (/token|secret|password|authorization|apikey/i.test(k)) safe[k] = '***';
  }
  console.log(JSON.stringify({ t: nowIso(), msg, ...safe }));
}

// ----------------------------------------------------------------------------
// Páginas HTML
// ----------------------------------------------------------------------------
function pageShell(title, body) {
  return `<!doctype html><html lang="pt-BR"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<style>
:root{color-scheme:dark}
*{box-sizing:border-box}
body{margin:0;font-family:-apple-system,Segoe UI,Roboto,system-ui,sans-serif;background:#0a0f0a;color:#e6f6e6;min-height:100vh;overflow-y:auto;padding:24px}
.card{max-width:560px;width:min(100%,560px);margin:24px auto;background:rgba(20,40,25,.7);border:1px solid rgba(120,255,160,.2);border-radius:18px;padding:36px;box-shadow:0 0 60px rgba(0,255,120,.08),inset 0 0 30px rgba(0,255,120,.05);backdrop-filter:blur(10px)}
h1{margin:0 0 8px;font-size:22px;font-weight:600;letter-spacing:-.01em}
p{color:#a7c9b0;line-height:1.55;margin:8px 0 18px;font-size:14px}
.btn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:14px 18px;border-radius:10px;border:0;font-size:15px;font-weight:600;cursor:pointer;text-decoration:none;transition:.15s;margin:8px 0}
.btn.primary{background:linear-gradient(135deg,#22c55e,#16a34a);color:#06140a}
.btn.primary:hover{filter:brightness(1.1)}
.btn.ghost{background:transparent;color:#a7e5b9;border:1px solid rgba(120,255,160,.3)}
.btn.ghost:hover{background:rgba(120,255,160,.07)}
.muted{font-size:12px;color:#6f8a76;text-align:center;margin-top:18px}
input,textarea{width:100%;padding:12px 14px;border-radius:10px;border:1px solid rgba(120,255,160,.25);background:rgba(0,0,0,.3);color:#e6f6e6;font-size:14px;font-family:ui-monospace,Menlo,monospace}
input:focus,textarea:focus{outline:none;border-color:#22c55e}
.ok{color:#4ade80}.err{color:#f87171}
hr{border:none;border-top:1px solid rgba(120,255,160,.15);margin:24px 0}
.fp{font-family:ui-monospace,Menlo,monospace;background:rgba(0,0,0,.3);padding:2px 6px;border-radius:4px;font-size:12px}
@media (max-width: 640px){body{padding:14px}.card{margin:0 auto;padding:22px;border-radius:14px}}
</style></head><body><div class="card">${body}</div></body></html>`;
}

function pageConnect(sessionId, hasOAuth) {
  const tokenUrl = oneClickTokenUrl();
  const voiceTag = HAS_VOICE
    ? `<audio id="cd-intro-audio" src="/voice/intro.mp3" preload="auto" playsinline></audio>`
    : '';
  return pageShell('Conectar Cloudflare — CentralDark', `
    <h1>🛡️ Conectar Cloudflare</h1>
    <p>Pra terminar a instalação da sua VPS, a CentralDark precisa de permissão pra editar o DNS do seu domínio na Cloudflare. Escolha um dos caminhos abaixo — os dois são seguros e a sessão expira em 10 minutos.</p>

    <!-- Indicador da assistente falando -->
    <div id="cd-assist" style="display:none;margin:8px 0 14px;padding:10px 12px;border-radius:10px;background:rgba(34,197,94,.08);border:1px solid rgba(120,255,160,.25);font-size:12px;color:#a7c9b0;text-align:center">
      🎙️ <span id="cd-assist-label">a assistente tá te explicando…</span>
    </div>

    ${hasOAuth ? `
      <div style="position:relative">
        <a id="cd-oauth-btn" class="btn primary" href="/oauth/cloudflare/start?sid=${sessionId}" data-href="/oauth/cloudflare/start?sid=${sessionId}">
          <span id="cd-oauth-label">🔐 Abrindo Cloudflare em <span id="cd-oauth-n">2</span>s…</span>
        </a>
        <div style="margin-top:8px;height:6px;background:rgba(0,0,0,.3);border-radius:3px;overflow:hidden">
          <div id="cd-oauth-bar" style="height:100%;width:0%;background:linear-gradient(90deg,#22c55e,#16a34a);transition:width .9s linear"></div>
        </div>
      </div>
      <p style="text-align:center;font-size:12px;color:#6f8a76;margin:6px 0 18px">Você loga direto no site da Cloudflare. Nenhuma senha passa por aqui. Se nada abrir sozinho, toca no botão verde.</p>
      <hr>
    ` : ''}
    <a class="btn ghost" href="${tokenUrl}" target="_blank" rel="noopener">
      🔑 Criar token na Cloudflare (1 clique)
    </a>
    <form method="POST" action="/token/cloudflare?sid=${sessionId}" style="margin-top:14px">
      <input name="token" placeholder="Cole aqui o token criado" autocomplete="off" required>
      <button class="btn primary" type="submit" style="margin-top:10px">Validar e Conectar</button>
    </form>
    <p class="muted">Sessão: <span class="fp">${sessionId.slice(0,10)}…</span></p>

    ${voiceTag}

    <script>
      (function(){
        var WAIT = 2;
        var n = WAIT;
        var btn  = document.getElementById('cd-oauth-btn');
        var lab  = document.getElementById('cd-oauth-n');
        var bar  = document.getElementById('cd-oauth-bar');
        var labelBox = document.getElementById('cd-oauth-label');
        var assist = document.getElementById('cd-assist');
        var assistLbl = document.getElementById('cd-assist-label');
        var audio  = document.getElementById('cd-intro-audio');
        var redirecionou = false;

        function liberar(){
          if (!btn) return;
          labelBox.innerHTML = '🔐 Entrar com Cloudflare';
        }
        function irOAuth(){
          if (!btn || redirecionou) return;
          redirecionou = true;
          window.location.href = btn.getAttribute('data-href') || btn.href;
        }
        function tick(){
          if (!btn) return;
          if (n <= 0){ liberar(); irOAuth(); return; }
          lab.textContent = n;
          if (bar) bar.style.width = ((WAIT - n) / WAIT * 100) + '%';
          n--;
          setTimeout(tick, 1000);
        }

        function fallbackTTS(){
          try{
            var u = new SpeechSynthesisUtterance(${JSON.stringify(EL_INTRO_TEXT)});
            u.lang = 'pt-BR'; u.rate = 1.02; u.pitch = 1.05;
            speechSynthesis.cancel(); speechSynthesis.speak(u);
            assist.style.display='block'; assistLbl.textContent = 'a assistente tá te explicando…';
            u.onend = function(){ assistLbl.textContent = 'pronto! agora é só esperar o botão liberar 👇'; };
          }catch(e){}
        }

        function tocarVoz(){
          if (!audio){ fallbackTTS(); return; }
          assist.style.display = 'block';
          assistLbl.textContent = 'a assistente tá te explicando…';
          audio.addEventListener('ended', function(){
            assistLbl.textContent = 'pronto! agora é só esperar o botão liberar 👇';
          });
          audio.addEventListener('error', fallbackTTS, { once: true });
          var p = audio.play();
          if (p && typeof p.then === 'function') p.catch(function(){});
        }

        // Inicia a contagem do botão imediatamente
        tick();
        setTimeout(tocarVoz, 300);
      })();
    </script>
  `);
}


function pageDone(kind, fp) {
  // Tela de sucesso com mini-assistente IA (voz alegre via ElevenLabs).
  // Estratégia de áudio em 3 camadas:
  //  1) autoplay direto (funciona na maioria, pois usuário acabou de clicar no Cloudflare)
  //  2) se autoplay for bloqueado → MODAL educativo cobrindo a tela com botão grandão "Permitir áudio"
  //  3) se MP3 falhar de vez → Web Speech API nativa do sistema
  const voiceTag = HAS_VOICE
    ? `<audio id="cd-audio" src="/voice/success.mp3" preload="auto" autoplay playsinline></audio>`
    : '';
  return pageShell('Conectado ✅', `
    <h1 class="ok">✅ Cloudflare conectada</h1>
    <p>Origem: <b>${kind}</b><br>Token: <span class="fp">${fp}</span></p>
    <p>O instalador na VPS já recebeu a confirmação e <b>vai continuar sozinho</b> — sincronizando subdiretórios, gerando DNS e finalizando a instalação.</p>

    <div style="margin:20px 0;padding:14px;border-radius:10px;background:rgba(34,197,94,.08);border:1px solid rgba(120,255,160,.25);text-align:center">
      <div id="cd-count" style="font-size:32px;font-weight:700;color:#4ade80;font-family:ui-monospace,Menlo,monospace">8</div>
      <div style="font-size:13px;color:#a7c9b0;margin-top:6px">Fechando esta aba em <span id="cd-label">8 segundos</span>…</div>
      <div style="margin-top:12px;height:4px;background:rgba(0,0,0,.3);border-radius:2px;overflow:hidden">
        <div id="cd-bar" style="height:100%;width:100%;background:linear-gradient(90deg,#22c55e,#16a34a);transition:width 1s linear"></div>
      </div>
      <div id="cd-voice" style="font-size:11px;color:#7ba089;margin-top:8px;opacity:.85">🎙️ a assistente vai dar um recado pra você…</div>
    </div>
    ${voiceTag}
    <button id="cd-close" class="btn ghost" type="button">Fechar agora</button>
    <p class="muted">Pode voltar pro terminal SSH a qualquer momento — o processo lá já tá rodando.</p>

    <!-- MODAL educativo de permissão de áudio (aparece só se autoplay for bloqueado) -->
    <div id="cd-modal" role="dialog" aria-modal="true" aria-labelledby="cd-modal-title" style="display:none;position:fixed;inset:0;z-index:9999;background:rgba(2,10,6,.78);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);align-items:center;justify-content:center;padding:20px">
      <div style="max-width:380px;width:100%;background:linear-gradient(180deg,#0a1f12,#06160c);border:1px solid rgba(120,255,160,.35);border-radius:18px;padding:26px 22px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.6),0 0 0 1px rgba(34,197,94,.15) inset">
        <div style="font-size:56px;line-height:1;margin-bottom:10px">🔊</div>
        <h2 id="cd-modal-title" style="margin:0 0 8px;font-size:20px;color:#bbf7d0">Liberar o som?</h2>
        <p style="margin:0 0 18px;font-size:14px;color:#a7c9b0;line-height:1.5">Seu celular bloqueou o áudio automático. A assistente quer te dar um <b>recadinho rápido</b> avisando que deu tudo certo. Toca em <b>Permitir áudio</b> pra ouvir.</p>
        <button id="cd-allow" type="button" style="width:100%;padding:18px 14px;border:0;border-radius:14px;background:linear-gradient(135deg,#22c55e,#16a34a);color:#04130a;font-size:17px;font-weight:800;cursor:pointer;box-shadow:0 8px 24px rgba(34,197,94,.35),0 0 0 1px rgba(120,255,160,.4) inset">
          ✅ Permitir áudio
        </button>
        <button id="cd-skip" type="button" style="margin-top:10px;background:transparent;border:0;color:#7ba089;font-size:13px;cursor:pointer;text-decoration:underline">Pular e fechar</button>
        <p style="margin:14px 0 0;font-size:11px;color:#5d8870">Dica: aumenta o volume do celular pra ouvir melhor.</p>
      </div>
    </div>

    <script>
      (function(){
        var TOTAL = 8;
        var n = TOTAL;
        var el = document.getElementById('cd-count');
        var lbl = document.getElementById('cd-label');
        var bar = document.getElementById('cd-bar');
        var voiceLbl = document.getElementById('cd-voice');
        var audio = document.getElementById('cd-audio');
        var modal = document.getElementById('cd-modal');
        var allowBtn = document.getElementById('cd-allow');
        var skipBtn = document.getElementById('cd-skip');
        var closed = false;
        var pararContador = false; // pausa enquanto modal aberto
        var TEXTO = ${JSON.stringify(EL_TEXT)};

        function close(){ if(closed) return; closed = true; try{ window.close(); }catch(e){} document.title='Pode fechar esta aba'; }
        document.getElementById('cd-close').addEventListener('click', close);

        function setLbl(t){ if(voiceLbl) voiceLbl.textContent = t; }
        function abrirModal(){
          if(!modal) return;
          modal.style.display = 'flex';
          pararContador = true;
          setLbl('👆 toca em "Permitir áudio" pra ouvir o recadinho');
        }
        function fecharModal(){
          if(!modal) return;
          modal.style.display = 'none';
          pararContador = false;
        }

        function fallbackWebSpeech(){
          try {
            if (!('speechSynthesis' in window)) { setLbl('(seu navegador não toca voz, mas tá tudo certo ✓)'); return; }
            var msg = new SpeechSynthesisUtterance(TEXTO);
            msg.lang = 'pt-BR'; msg.rate = 1.02; msg.pitch = 1.05; msg.volume = 1.0;
            var voices = window.speechSynthesis.getVoices() || [];
            var pt = voices.find(function(v){return /pt[-_]BR/i.test(v.lang);}) || voices.find(function(v){return /^pt/i.test(v.lang);});
            if (pt) msg.voice = pt;
            msg.onstart = function(){ setLbl('🎙️ a assistente tá falando…'); };
            msg.onend   = function(){ setLbl('✓ recado entregue, valeu!'); };
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(msg);
          } catch(e) { setLbl('(voz indisponível, mas tá tudo certo ✓)'); }
        }

        function tentarTocar(){
          if (!audio) { fallbackWebSpeech(); return; }
          try { audio.volume = 1.0; } catch(e){}
          var p = audio.play();
          if (p && typeof p.then === 'function') {
            p.then(function(){ fecharModal(); })
             .catch(function(){
               // Autoplay bloqueado → modal educativo
               abrirModal();
             });
          }
        }

        if (audio) {
          audio.addEventListener('playing', function(){ setLbl('🎙️ a assistente tá falando…'); fecharModal(); });
          audio.addEventListener('ended',   function(){ setLbl('✓ recado entregue, valeu!'); });
          audio.addEventListener('error',   function(){ fecharModal(); fallbackWebSpeech(); });
        }

        if (allowBtn) {
          allowBtn.addEventListener('click', function(){
            fecharModal();
            if (audio) { try { audio.currentTime = 0; } catch(e){} tentarTocar(); }
            else { fallbackWebSpeech(); }
          });
        }
        if (skipBtn) {
          skipBtn.addEventListener('click', function(){ fecharModal(); setLbl('(sem som, mas tá tudo certo ✓)'); });
        }

        // Dispara tentativa de autoplay imediatamente
        if (audio) { tentarTocar(); } else { fallbackWebSpeech(); }

        var t = setInterval(function(){
          if (pararContador) return; // segura enquanto modal aberto
          n--; if(el) el.textContent=n; if(lbl) lbl.textContent=n+' segundo'+(n===1?'':'s');
          if(bar) bar.style.width=Math.max(0,(n/TOTAL*100))+'%';
          if(n<=0){
            clearInterval(t);
            // Espera a fala terminar antes de fechar (até +5s de tolerância)
            var waited = 0;
            var w = setInterval(function(){
              waited += 200;
              var tocando = (audio && !audio.paused && !audio.ended && audio.readyState > 2) ||
                            (('speechSynthesis' in window) && window.speechSynthesis.speaking);
              if (!tocando || waited >= 5000) { clearInterval(w); close(); }
            }, 200);
          }
        }, 1000);
      })();
    </script>
  `);
}




function pageError(msg) {
  return pageShell('Erro', `
    <h1 class="err">❌ Algo deu errado</h1>
    <p>${msg}</p>
    <a class="btn ghost" href="javascript:history.back()">Voltar</a>
  `);
}

// Página de escolha do domínio quando a conta tem MAIS de uma zona ativa.
function pageChooseZone(sessionId, zones, targetIp) {
  const ipLinha = targetIp
    ? `<p class="muted">DNS vai apontar pra <b>${escHtml(targetIp)}</b> (IP público da VPS).</p>`
    : `<p class="muted">A VPS vai detectar o IP público sozinha.</p>`;
  const opcoes = zones.map(z => `
    <button type="submit" name="zone_name" value="${escHtml(z.name)}"
      style="display:block;width:100%;margin:8px 0;padding:16px 14px;border:1px solid rgba(120,255,160,.35);border-radius:12px;background:linear-gradient(180deg,#0a1f12,#06160c);color:#bbf7d0;font-size:16px;font-weight:700;cursor:pointer;text-align:left">
      🌐 ${escHtml(z.name)}
    </button>
  `).join('');
  return pageShell('Escolha o domínio', `
    <h1 class="ok">🌐 Qual domínio você vai usar?</h1>
    <p>Sua conta tem <b>${zones.length} domínios</b> na Cloudflare. Toca naquele que vai apontar pra essa VPS — o instalador vai criar os subdomínios <code>@</code>, <code>www</code> e <code>*</code> nele.</p>
    ${ipLinha}
    <form method="POST" action="/zone/choose?sid=${encodeURIComponent(sessionId)}">
      ${opcoes}
    </form>
    <p class="muted" style="margin-top:18px">Não tá vendo o domínio certo? Cadastra ele primeiro na <a href="https://dash.cloudflare.com/" target="_blank" rel="noopener">Cloudflare</a> e refaz o fluxo.</p>
  `);
}

// Página quando a conta CF não tem nenhuma zona ativa ainda.
function pageNoZone() {
  return pageShell('Nenhum domínio na conta', `
    <h1 class="err">⚠️ Sua conta Cloudflare ainda não tem domínio</h1>
    <p>Pra continuar, cadastra um domínio em <a href="https://dash.cloudflare.com/" target="_blank" rel="noopener">dash.cloudflare.com</a> primeiro (botão <b>Add a site</b>) e depois roda o instalador de novo.</p>
    <p class="muted">O token já foi salvo na VPS — quando voltar com o domínio, é só rodar <code>./install.sh --connect</code> de novo.</p>
  `);
}



// ----------------------------------------------------------------------------
// Landing oficial + Documentação (servida do próprio repo)
// ----------------------------------------------------------------------------
const DOCS_DIR = path.join(REPO_DIR, 'docs', 'INSTALADOR');

function escHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// Mini renderer Markdown -> HTML (sem dependência externa)
function renderMarkdown(md) {
  const lines = md.split(/\r?\n/);
  let html = '', inCode = false, inList = false, inTable = false;
  const inline = (s) => escHtml(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, u) => `<a href="${u}">${t}</a>`);
  for (let raw of lines) {
    if (/^```/.test(raw)) {
      if (!inCode) { html += '<pre><code>'; inCode = true; }
      else { html += '</code></pre>'; inCode = false; }
      continue;
    }
    if (inCode) { html += escHtml(raw) + '\n'; continue; }
    if (/^\s*$/.test(raw)) {
      if (inList) { html += '</ul>'; inList = false; }
      if (inTable) { html += '</tbody></table>'; inTable = false; }
      html += '\n'; continue;
    }
    let m;
    if ((m = raw.match(/^(#{1,4})\s+(.*)$/))) { html += `<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`; continue; }
    if (/^\s*[-*]\s+/.test(raw)) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += `<li>${inline(raw.replace(/^\s*[-*]\s+/, ''))}</li>`; continue;
    }
    if (/^\|.*\|$/.test(raw)) {
      if (!inTable) { html += '<table><tbody>'; inTable = true; }
      if (/^\|[-:\s|]+\|$/.test(raw)) continue;
      const cells = raw.slice(1, -1).split('|').map(c => `<td>${inline(c.trim())}</td>`).join('');
      html += `<tr>${cells}</tr>`; continue;
    }
    if (inList) { html += '</ul>'; inList = false; }
    if (inTable) { html += '</tbody></table>'; inTable = false; }
    html += `<p>${inline(raw)}</p>`;
  }
  if (inList) html += '</ul>';
  if (inTable) html += '</tbody></table>';
  if (inCode) html += '</code></pre>';
  return html;
}

function pageDocsShell(title, body) {
  return `<!doctype html><html lang="pt-BR"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escHtml(title)} — install.centralldark.com</title>
<link rel="icon" href="/favicon.png">
<meta name="description" content="Documentação e instalador oficial do CentralDark. VPS pronta em um comando: OAuth Cloudflare, DNS wildcard, Caddy, PM2 e MCP.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap">
<style>
/* =========================================================================
   CentralDark Installer — paleta Emerald Prestige (SaaS empresarial)
   bg #07120d · surface #0d1e16 · border emerald sutil · accent #10b981
   gold accent #c9a84c (raro, só pra cabeçalhos de seção)
   tipografia: Space Grotesk (display) + Inter (body) + JetBrains Mono (code)
   ========================================================================= */
:root{
  color-scheme:dark;
  --bg:#07120d;
  --bg-2:#0a1812;
  --surface:#0d1e16;
  --surface-2:#102619;
  --surface-3:#13301f;
  --border:rgba(201,168,76,.10);
  --border-strong:rgba(201,168,76,.22);
  --border-emerald:rgba(16,185,129,.18);
  --text:#e8efe9;
  --text-muted:#94a89a;
  --text-dim:#6b7d72;
  --accent:#10b981;
  --accent-2:#0d7a5f;
  --accent-soft:rgba(16,185,129,.10);
  --gold:#c9a84c;
  --gold-soft:rgba(201,168,76,.10);
  --radius:10px;
  --radius-lg:14px;
  --shadow-sm:0 1px 2px rgba(0,0,0,.4);
  --shadow:0 4px 16px rgba(0,0,0,.35);
  --shadow-lg:0 10px 40px rgba(0,0,0,.5);
  --font-sans:'Inter','Segoe UI',system-ui,-apple-system,sans-serif;
  --font-display:'Space Grotesk','Inter',system-ui,sans-serif;
  --font-mono:'JetBrains Mono',ui-monospace,'SF Mono',Menlo,monospace;
}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{
  font-family:var(--font-sans);
  background:var(--bg);
  color:var(--text);
  min-height:100vh;
  font-size:15px;
  line-height:1.6;
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
}

/* ── App shell ───────────────────────────────────────────────────────── */
.appbar{
  position:sticky;top:0;z-index:40;
  background:rgba(7,18,13,.85);
  backdrop-filter:saturate(140%) blur(12px);
  -webkit-backdrop-filter:saturate(140%) blur(12px);
  border-bottom:1px solid var(--border);
}
.appbar-inner{
  max-width:1200px;margin:0 auto;
  padding:14px 28px;
  display:flex;align-items:center;justify-content:space-between;gap:24px;
}
.brand{
  display:inline-flex;align-items:center;gap:10px;
  text-decoration:none;color:var(--text);
  font-family:var(--font-display);font-weight:700;font-size:15px;letter-spacing:-.01em;
}
.brand-mark{
  width:26px;height:26px;border-radius:7px;
  background:linear-gradient(135deg,var(--accent-2),var(--accent));
  display:inline-flex;align-items:center;justify-content:center;
  color:#03150c;font-weight:800;font-size:14px;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.18);
}
.brand-host{color:var(--text-muted);font-weight:500;font-size:13.5px}
.nav{display:flex;align-items:center;gap:4px}
.nav a{
  color:var(--text-muted);text-decoration:none;
  padding:7px 12px;border-radius:7px;font-size:13.5px;font-weight:500;
  transition:.15s ease;
}
.nav a:hover{color:var(--text);background:var(--surface-2)}
.nav a.cta{
  background:var(--accent);color:#03150c;font-weight:600;
  border:1px solid var(--accent);margin-left:8px;
}
.nav a.cta:hover{background:#0fd394;color:#03150c}

.wrap{max-width:1200px;margin:0 auto;padding:36px 28px 80px}

/* ── Card (container principal de cada seção) ───────────────────────── */
.card{
  background:transparent;
  border:none;
  padding:0;
}

/* ── Hero ────────────────────────────────────────────────────────────── */
.hero{
  text-align:left;
  padding:28px 0 36px;
  border-bottom:1px solid var(--border);
  margin-bottom:40px;
}
.hero h1{
  font-family:var(--font-display);
  font-size:44px;font-weight:700;letter-spacing:-.025em;line-height:1.08;
  margin:0 0 14px;
  color:var(--text);
  background:none;-webkit-text-fill-color:initial;
}
.hero p{font-size:17px;color:var(--text-muted);max-width:680px;margin:0 0 20px;line-height:1.55}
.badges{display:flex;gap:8px;flex-wrap:wrap;margin:0;justify-content:flex-start}
.badge{
  background:var(--surface);
  border:1px solid var(--border);
  color:var(--text-muted);
  padding:5px 11px;border-radius:6px;
  font-size:12px;font-weight:500;
  display:inline-flex;align-items:center;gap:6px;
}

/* ── Tipografia geral ────────────────────────────────────────────────── */
h1,h2,h3,h4{font-family:var(--font-display);color:var(--text);letter-spacing:-.015em}
h1{font-size:32px;font-weight:700;margin:0 0 16px}
h2{
  font-size:13px;font-weight:600;
  text-transform:uppercase;letter-spacing:.10em;
  color:var(--gold);
  margin:48px 0 6px;
  padding:0;border:none;
}
h2 + p{margin-top:0;color:var(--text);font-size:22px;font-family:var(--font-display);font-weight:600;letter-spacing:-.015em;line-height:1.3;margin-bottom:20px;text-align:left}
h2 + p.muted{font-size:14px;font-family:var(--font-sans);font-weight:400;color:var(--text-muted);text-align:left;margin-bottom:24px}
h3{font-size:18px;font-weight:600;margin:24px 0 10px}
h4{font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.08em;margin:20px 0 8px}
p,li{color:var(--text);font-size:14.5px;line-height:1.65}
a{color:var(--accent);text-decoration:none}
a:hover{text-decoration:underline}
ul{padding-left:22px}
.muted{color:var(--text-muted);font-size:13.5px}

code{
  font-family:var(--font-mono);
  background:var(--surface-2);
  color:var(--accent);
  padding:2px 6px;border-radius:5px;font-size:12.5px;
  border:1px solid var(--border);
}
pre{
  background:var(--bg-2);
  border:1px solid var(--border);
  border-radius:var(--radius);
  padding:16px;overflow:auto;
  font-family:var(--font-mono);font-size:13px;line-height:1.55;
}
pre code{background:transparent;border:none;padding:0;color:#cfe6d8}

table{width:100%;border-collapse:collapse;margin:14px 0}
td{padding:10px 12px;border-bottom:1px solid var(--border);font-size:14px;color:var(--text-muted);vertical-align:top}
tr:first-child td{color:var(--text);font-weight:600;background:var(--surface-2)}

/* ── Comando hero (o destaque principal) ─────────────────────────────── */
.cmd-hero{
  position:relative;display:block;width:100%;
  background:var(--surface);
  color:#cfe6d8;
  padding:22px 26px;
  border-radius:var(--radius-lg);
  font-family:var(--font-mono);font-size:15px;font-weight:500;
  letter-spacing:0;
  border:1px solid var(--border-emerald);
  box-shadow:var(--shadow);
  text-align:left;
  cursor:pointer;transition:.15s ease;
  overflow:auto;white-space:nowrap;
  margin:8px 0 0;
}
.cmd-hero::before{
  content:"$";position:absolute;left:10px;top:50%;transform:translateY(-50%);
  color:var(--text-dim);font-family:var(--font-mono);font-size:14px;display:none;
}
.cmd-hero::after{
  content:"Copiar";
  position:absolute;top:50%;right:14px;transform:translateY(-50%);
  background:var(--surface-3);color:var(--accent);
  font-family:var(--font-sans);font-size:11.5px;font-weight:600;
  letter-spacing:.04em;
  padding:5px 12px;border-radius:6px;
  border:1px solid var(--border-emerald);
  transition:.15s;
}
.cmd-hero:hover{border-color:var(--accent-2);background:var(--surface-2)}
.cmd-hero:hover::after{background:var(--accent);color:#03150c;border-color:var(--accent)}
.cmd-hero.copied{border-color:var(--accent)}
.cmd-hero.copied::after{content:"Copiado ✓";background:var(--accent);color:#03150c}

/* features sob o comando hero */
.hero-pitch{
  display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
  gap:12px;margin:20px 0 0;
}
.hero-pitch .hp{
  background:var(--surface);
  border:1px solid var(--border);
  border-radius:var(--radius);
  padding:14px 16px;
  font-size:13px;color:var(--text-muted);line-height:1.5;
  transition:.15s;
}
.hero-pitch .hp:hover{border-color:var(--border-strong)}
.hero-pitch .hp b{
  color:var(--text);display:block;
  font-family:var(--font-display);font-size:13.5px;font-weight:600;
  margin-bottom:4px;letter-spacing:-.01em;text-transform:none;
}

/* alternativa não-interativa */
details{margin-top:14px}
details summary{cursor:pointer;color:var(--text-muted);font-size:13px;list-style:none}
details summary::-webkit-details-marker{display:none}
details summary::before{content:"▸ ";color:var(--accent);transition:.15s}
details[open] summary::before{content:"▾ "}
.cmd-copy{
  position:relative;cursor:pointer;
  background:var(--bg-2);color:#cfe6d8;
  font-family:var(--font-mono);font-size:13px;
  padding:12px 14px;border-radius:var(--radius);
  border:1px solid var(--border);
  overflow:auto;white-space:nowrap;
}
.cmd-copy:hover{border-color:var(--border-strong)}
.cmd-copy::after{
  content:"copiar";position:absolute;top:50%;right:10px;transform:translateY(-50%);
  font-family:var(--font-sans);font-size:10.5px;color:var(--text-dim);
  letter-spacing:.05em;text-transform:uppercase;
}
.cmd-copy.copied::after{content:"copiado ✓";color:var(--accent)}

/* ── Grid de modos do instalador ─────────────────────────────────────── */
.mode-grid{
  display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));
  gap:14px;margin-top:18px;
}
.mode-card{
  position:relative;display:flex;flex-direction:column;gap:12px;
  padding:18px 20px;
  background:var(--surface);
  border:1px solid var(--border);
  border-radius:var(--radius-lg);
  cursor:pointer;transition:.15s ease;
  text-align:left;font:inherit;color:inherit;width:100%;
}
.mode-card:hover{
  border-color:var(--border-emerald);
  background:var(--surface-2);
  transform:translateY(-1px);
  box-shadow:var(--shadow);
}
.mode-card:active{transform:translateY(0)}
.mode-card .mc-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.mode-card .mc-flag{
  color:var(--accent);
  background:var(--accent-soft);
  padding:3px 9px;border-radius:5px;
  font-family:var(--font-mono);font-size:11.5px;font-weight:500;
  border:1px solid var(--border-emerald);
}
.mode-card .mc-title{
  color:var(--text);
  font-family:var(--font-display);font-weight:600;font-size:15px;
  letter-spacing:-.01em;flex:1;
}
.mode-card .mc-desc{
  color:var(--text-muted);font-size:13px;line-height:1.55;
  min-height:38px;
}
.mode-card .mc-cmd{
  background:var(--bg-2);
  color:#cfe6d8;
  padding:9px 11px;border-radius:7px;
  font-family:var(--font-mono);font-size:11.5px;
  border:1px solid var(--border);
  overflow:auto;white-space:nowrap;margin-top:auto;
}
.mode-card .mc-copy{
  position:absolute;top:14px;right:16px;
  font-size:10.5px;color:var(--text-dim);
  letter-spacing:.05em;text-transform:uppercase;
  transition:.15s;
}
.mode-card:hover .mc-copy{color:var(--accent)}
.mode-card.copied{border-color:var(--accent)}
.mode-card.copied .mc-copy{color:var(--accent)}
.mode-card.copied .mc-copy::after{content:" ✓"}

/* ── Endpoints (lista de rotas) ──────────────────────────────────────── */
ul.endpoints{
  list-style:none;padding:0;margin:8px 0 0;
  display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:8px;
}
ul.endpoints li{
  background:var(--surface);
  border:1px solid var(--border);
  border-radius:var(--radius);
  padding:11px 14px;font-size:13.5px;color:var(--text-muted);
}
ul.endpoints code{
  color:var(--accent);background:transparent;border:none;padding:0;margin-right:8px;
  font-weight:500;
}

/* ── Grid de docs ────────────────────────────────────────────────────── */
.grid{
  display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));
  gap:12px;margin-top:18px;
}
.doc-card{
  display:block;padding:18px 20px;
  background:var(--surface);
  border:1px solid var(--border);
  border-radius:var(--radius-lg);
  text-decoration:none;transition:.15s ease;
}
.doc-card:hover{
  border-color:var(--border-emerald);
  background:var(--surface-2);
  transform:translateY(-1px);
  text-decoration:none;
}
.doc-card .n{
  color:var(--gold);
  font-family:var(--font-mono);font-size:11px;
  letter-spacing:.05em;
  font-weight:500;
}
.doc-card .t{
  color:var(--text);
  font-family:var(--font-display);font-weight:600;
  margin:6px 0 4px;font-size:15px;letter-spacing:-.01em;
}
.doc-card .d{color:var(--text-muted);font-size:12.5px;line-height:1.5}

/* ── Toast ───────────────────────────────────────────────────────────── */
.toast{
  position:fixed;bottom:24px;left:50%;
  transform:translateX(-50%) translateY(20px);
  background:var(--surface-2);color:var(--accent);
  border:1px solid var(--border-emerald);
  padding:10px 18px;border-radius:8px;
  font-family:var(--font-sans);font-size:13px;font-weight:600;
  box-shadow:var(--shadow-lg);
  opacity:0;pointer-events:none;
  transition:.22s ease;z-index:50;
}
.toast.show{opacity:1;transform:translateX(-50%) translateY(0)}

/* ── Footer ──────────────────────────────────────────────────────────── */
.footer{
  max-width:1200px;margin:0 auto;
  padding:32px 28px 40px;
  border-top:1px solid var(--border);
  margin-top:40px;
  display:flex;justify-content:space-between;align-items:center;gap:16px;
  flex-wrap:wrap;
  color:var(--text-dim);font-size:13px;
}
.footer code{font-size:12px;color:var(--text-muted);background:var(--surface);border-color:var(--border)}
.footer .foot-right{display:flex;gap:18px;align-items:center}
.footer a{color:var(--text-muted)}
.footer a:hover{color:var(--accent)}

/* ── Responsivo ──────────────────────────────────────────────────────── */
@media (max-width:720px){
  .appbar-inner{padding:12px 18px}
  .wrap{padding:24px 18px 60px}
  .hero h1{font-size:32px}
  .hero p{font-size:15px}
  h2 + p{font-size:18px}
  .nav{gap:0}
  .nav a{padding:6px 9px;font-size:12.5px}
  .brand-host{display:none}
  .cmd-hero{font-size:13px;padding:18px 18px 18px 20px}
  .cmd-hero::after{display:none}
}
</style></head><body>
<header class="appbar">
  <div class="appbar-inner">
    <a class="brand" href="/">
      <span class="brand-mark">C</span>
      CentralDark <span class="brand-host">/ install</span>
    </a>
    <nav class="nav">
      <a href="/">Início</a>
      <a href="/docs">Documentação</a>
      <a href="/install.sh">install.sh</a>
      <a href="/status">Status</a>
      <a class="cta" href="https://github.com/segredounlock/clone-deck" target="_blank" rel="noopener">GitHub</a>
    </nav>
  </div>
</header>
<main class="wrap">
  ${body}
</main>
<footer class="footer">
  <div>© CentralDark · Painel oficial de instalação</div>
  <div class="foot-right">
    <span>Servido por <code>install-callback</code></span>
    <a href="/health">Health</a>
    <a href="/status">Status</a>
  </div>
</footer>
<div id="toast" class="toast">Copiado ✓</div>
<script>
(function(){
  function showToast(msg){
    var t=document.getElementById('toast');
    if(!t)return;
    t.textContent=msg||'Copiado ✓';
    t.classList.add('show');
    clearTimeout(t._h);
    t._h=setTimeout(function(){t.classList.remove('show')},1600);
  }
  function copyText(txt){
    if(navigator.clipboard&&navigator.clipboard.writeText){
      return navigator.clipboard.writeText(txt);
    }
    return new Promise(function(res,rej){
      try{
        var ta=document.createElement('textarea');
        ta.value=txt;ta.style.position='fixed';ta.style.opacity='0';
        document.body.appendChild(ta);ta.select();
        document.execCommand('copy');document.body.removeChild(ta);res();
      }catch(e){rej(e)}
    });
  }
  document.addEventListener('click',function(e){
    var el=e.target.closest('[data-copy]');
    if(!el)return;
    e.preventDefault();
    var txt=el.getAttribute('data-copy');
    copyText(txt).then(function(){
      el.classList.add('copied');
      showToast('Comando copiado ✓');
      setTimeout(function(){el.classList.remove('copied')},1500);
    }).catch(function(){showToast('Erro ao copiar')});
  });
})();
</script>
</body></html>`;
}

// Lista os arquivos docs/INSTALADOR/*.md → [{slug, num, title, desc, raw}]
function loadDocsIndex() {
  if (!fs.existsSync(DOCS_DIR)) return [];
  const files = fs.readdirSync(DOCS_DIR).filter(f => f.endsWith('.md') && f !== 'README.md').sort();
  return files.map(f => {
    const full = path.join(DOCS_DIR, f);
    const md = fs.readFileSync(full, 'utf8');
    const slug = f.replace(/\.md$/, '');
    const num = (slug.match(/^(\d+)/) || [])[1] || '';
    const firstH1 = (md.match(/^#\s+(.+)$/m) || [])[1] || slug;
    // primeira linha não-vazia depois do H1 como descrição
    const after = md.split(/\r?\n/).slice(md.split(/\r?\n/).findIndex(l => /^#\s/.test(l)) + 1);
    const desc = (after.find(l => l.trim() && !/^#/.test(l)) || '').replace(/[*_`]/g, '').slice(0, 110);
    return { slug, num, title: firstH1.replace(/^\d+\s*[—\-:]\s*/, ''), desc };
  });
}

// Mantida em sincronia com `main()` do install.sh.
// Sempre que adicionar/renomear flag no instalador, atualizar aqui também.
const INSTALLER_MODES = [
  { flag: '--check',        title: 'Verificar ambiente',        desc: 'Roda o precheck (SO, CPU, RAM, Node, PM2, Caddy, portas, paths). Se passar, abre o painel automaticamente.' },
  { flag: '--install',      title: 'Instalar base + checker',   desc: 'Instala o CentralDark do zero (estrutura, deps, repo, PM2) e roda o checker end-to-end no fim.' },
  { flag: '--connect',      title: 'Conectar Cloudflare (QR)',  desc: 'Imprime um QR no terminal. Escaneia pelo celular, autoriza o Cloudflare e o token chega na VPS sozinho.' },
  { flag: '--wildcard',     title: 'Wildcard DNS (@, www, *)',  desc: 'Wizard que cria os 3 registros DNS, valida e prepara o Caddy. Inclui online-check no fim.' },
  { flag: '--mcp',          title: 'MCP CentralDark',           desc: 'Sobe/atualiza o servidor MCP (porta 9100, domínio mcp.centralldark.com, OAuth GitHub).' },
  { flag: '--menu',         title: 'Menu colorido (cdmenu)',    desc: 'Instala o menu interativo da VPS: cdmenu, cdstatus, atalhos.' },
  { flag: '--check-final',  title: 'Checker end-to-end',        desc: 'Roda os 12 blocos do checker (estrutura, PM2, bot, sync, WhatsApp, chat, Caddy, segurança) + relatório.' },
  { flag: '--update',       title: 'Atualizar instalador',      desc: 'git pull no repo local + força re-download do install.sh (auto-update).' },
];

function pageLanding() {
  const docs = loadDocsIndex();
  const cards = docs.map(d => `
    <a class="doc-card" href="/docs/${d.slug}">
      <div class="n">${d.num ? d.num.padStart(2, '0') : '··'}</div>
      <div class="t">${escHtml(d.title)}</div>
      <div class="d">${escHtml(d.desc)}</div>
    </a>`).join('');
  const modeCards = INSTALLER_MODES.map(m => {
    const cmd = `curl -fsSL https://install.centralldark.com | bash -s -- ${m.flag}`;
    return `
    <button type="button" class="mode-card" data-copy="${escHtml(cmd)}" title="Clica pra copiar">
      <span class="mc-copy">clica pra copiar</span>
      <div class="mc-head">
        <span class="mc-flag">${escHtml(m.flag)}</span>
        <span class="mc-title">${escHtml(m.title)}</span>
      </div>
      <div class="mc-desc">${escHtml(m.desc)}</div>
      <div class="mc-cmd">${escHtml(cmd)}</div>
    </button>`;
  }).join('');
  const startCmd = 'bash <(curl -sSL https://install.centralldark.com)';
  const startCmdAlt = 'curl -fsSL https://install.centralldark.com | bash';
  return pageDocsShell('CentralDark Installer', `
    <div class="card">
      <div class="hero">
        <h1>CentralDark Installer</h1>
        <p>Sua VPS pronta em um comando. OAuth Cloudflare, DNS wildcard, Caddy, PM2 e MCP — tudo automatizado.</p>
        <div class="badges">
          <span class="badge">✅ Idempotente</span>
          <span class="badge">🔒 OAuth Cloudflare</span>
          <span class="badge">🛡️ Sem expor secret</span>
          <span class="badge">🔁 Auto-update</span>
        </div>
      </div>

      <h2>🚀 Começar agora</h2>
      <p class="muted" style="text-align:center">O jeito recomendado. Cola no SSH da VPS e ele cuida de tudo — abre o menu interativo, atualiza o instalador, instala dependências, corrige problemas automaticamente.</p>
      <div class="cmd-hero" data-copy="${escHtml(startCmd)}" title="Clica pra copiar">${escHtml(startCmd)}</div>
      <div class="hero-pitch">
        <div class="hp"><b>🖥️ Menu interativo</b>Abre o painel colorido com todas as opções numeradas</div>
        <div class="hp"><b>🔁 Auto-update</b>Atualiza o próprio instalador antes de rodar</div>
        <div class="hp"><b>🛠️ Auto-fix</b>Detecta e instala curl, jq, qrencode, dig, git...</div>
        <div class="hp"><b>🆘 Resolve sozinho</b>Se algo travar, ele tenta consertar e segue</div>
      </div>
      <details style="margin-top:14px">
        <summary class="muted" style="cursor:pointer;font-size:12.5px">Alternativa não-interativa (sem menu)</summary>
        <div class="cmd cmd-copy" data-copy="${escHtml(startCmdAlt)}" title="Clica pra copiar" style="margin-top:10px">${escHtml(startCmdAlt)}</div>
      </details>

      <h2>🧰 Todos os modos do instalador</h2>
      <p class="muted">Cada card é uma tarefa específica. <strong>Clica em cima do card pra copiar o comando</strong> e cola no SSH da VPS.</p>
      <div class="mode-grid">${modeCards}</div>

      <h2>📦 Endpoints úteis</h2>
      <ul class="endpoints">
        <li><code>GET /</code> — esta página (ou bootstrap se UA = curl/wget)</li>
        <li><code>GET /install.sh</code> — bootstrap pequeno (baixa o tarball e roda)</li>
        <li><code>GET /raw/install.sh</code> — <code>install.sh</code> real do repo (usado pelo auto-update)</li>
        <li><code>GET /installer.tar.gz</code> — tarball completo (install.sh + scripts + docs)</li>
        <li><code>GET /connect/&lt;id&gt;</code> — wizard Cloudflare iniciado pela VPS</li>
        <li><code>GET /docs</code> · <code>GET /docs/&lt;slug&gt;</code> — documentação navegável</li>
        <li><code>GET /health</code> — status do serviço (JSON)</li>
      </ul>

      <h2>📚 Documentação completa</h2>
      <p class="muted">Tudo que o instalador faz, em ordem. Atualizado a cada commit no repo.</p>
      <div class="grid">${cards || '<p class="muted">Documentação ainda não disponível neste host.</p>'}</div>
    </div>
  `);
}


function pageDoc(slug) {
  const file = path.join(DOCS_DIR, `${slug}.md`);
  if (!fs.existsSync(file) || !file.startsWith(DOCS_DIR)) return null;
  const md = fs.readFileSync(file, 'utf8');
  const html = renderMarkdown(md);
  const docs = loadDocsIndex();
  const i = docs.findIndex(d => d.slug === slug);
  const prev = i > 0 ? docs[i - 1] : null;
  const next = i >= 0 && i < docs.length - 1 ? docs[i + 1] : null;
  const nav = `
    <div style="display:flex;justify-content:space-between;gap:12px;margin-top:32px;padding-top:20px;border-top:1px solid rgba(120,255,160,.15)">
      ${prev ? `<a class="doc-card" style="flex:1" href="/docs/${prev.slug}"><div class="n">← anterior</div><div class="t">${escHtml(prev.title)}</div></a>` : '<div style="flex:1"></div>'}
      ${next ? `<a class="doc-card" style="flex:1;text-align:right" href="/docs/${next.slug}"><div class="n">próximo →</div><div class="t">${escHtml(next.title)}</div></a>` : '<div style="flex:1"></div>'}
    </div>`;
  return pageDocsShell(slug, `<div class="card">${html}${nav}</div>`);
}


// ----------------------------------------------------------------------------
// HTTP server
// ----------------------------------------------------------------------------
function sendJSON(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}
function sendHTML(res, status, html) {
  res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}
function readBody(req) {
  return new Promise((resolve) => {
    let d = ''; req.on('data', (c) => d += c); req.on('end', () => resolve(d));
  });
}

// OAuth Cloudflare está temporariamente desabilitado por padrão (2026-06-09):
// o fluxo OAuth retorna access_token formato "cfoa..." que NÃO é aceito como
// API Token em /client/v4/*, gravando cofre quebrado. Caminho oficial agora é
// o 1-Click Token. Pra reativar quando consertarmos: CF_OAUTH_ENABLED=1 no .env.
const CF_OAUTH_ENABLED = process.env.CF_OAUTH_ENABLED === '1';
const HAS_OAUTH = !!(CF_CLIENT_ID && CF_CLIENT_SEC) && CF_OAUTH_ENABLED;

// Detecta se a requisição veio de curl/wget/fetch — nesse caso a raiz devolve
// o script de bootstrap em vez do HTML, pra `curl ... | bash` funcionar liso.
function isCliClient(req) {
  const ua = String(req.headers['user-agent'] || '').toLowerCase();
  return /\b(curl|wget|httpie|fetch|powershell|libfetch)\b/.test(ua);
}

// Bootstrap servido em / (CLI) e em /install.sh:
// baixa o tarball, extrai e roda o install.sh real, repassando argumentos.
function bootstrapScript() {
  return `#!/usr/bin/env bash
# CentralDark Installer — bootstrap
# Uso:
#   curl -fsSL https://install.centralldark.com | bash
#   curl -fsSL https://install.centralldark.com | bash -s -- --connect
set -euo pipefail
URL="${PUBLIC_URL}"
TMP="$(mktemp -d -t centraldark-XXXXXX)"
trap 'rm -rf "$TMP"' EXIT
echo "[CentralDark] baixando instalador de $URL ..."
if ! command -v curl >/dev/null 2>&1; then
  echo "[CentralDark] curl ausente — instalando..."
  (command -v apt-get >/dev/null && apt-get update -y -qq && apt-get install -y curl) \\
    || (command -v dnf >/dev/null && dnf install -y curl) \\
    || (command -v apk >/dev/null && apk add --no-cache curl) \\
    || { echo "Instale curl manualmente e tente de novo."; exit 1; }
fi
curl -fsSL "$URL/installer.tar.gz" -o "$TMP/inst.tgz"
mkdir -p "$TMP/x"
tar -xzf "$TMP/inst.tgz" -C "$TMP/x"
cd "$TMP/x"
chmod +x install.sh CentralDark/scripts/installer/*.sh 2>/dev/null || true
exec bash ./install.sh "$@"
`;
}

// ----------------------------------------------------------------------------
// Rate limit simples por IP (proteção anti-abuso básica, in-memory).
// Suficiente pra ambiente atual; pra produção dura, evoluir pra Cloudflare
// Turnstile + ban list persistente. Acompanhar pendência futura.
// ----------------------------------------------------------------------------
const RATE_BUCKETS = new Map(); // ip -> { route -> [timestamps] }
const RATE_RULES = {
  '/session/new':              { max: 20, windowMs: 10 * 60 * 1000 },
  '/oauth/cloudflare/start':   { max: 10, windowMs: 10 * 60 * 1000 },
  '/token/cloudflare':         { max: 10, windowMs: 10 * 60 * 1000 },
};
function clientIp(req) {
  const xff = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return xff || req.socket.remoteAddress || 'unknown';
}
function rateLimit(req, route) {
  const rule = RATE_RULES[route];
  if (!rule) return { ok: true };
  const ip = clientIp(req);
  const now = Date.now();
  let bucket = RATE_BUCKETS.get(ip);
  if (!bucket) { bucket = {}; RATE_BUCKETS.set(ip, bucket); }
  const arr = (bucket[route] || []).filter(t => now - t < rule.windowMs);
  if (arr.length >= rule.max) {
    log('rate limit hit', { ip, route, count: arr.length });
    return { ok: false, retryAfter: Math.ceil(rule.windowMs / 1000) };
  }
  arr.push(now);
  bucket[route] = arr;
  return { ok: true };
}
// Limpeza periódica dos buckets antigos
setInterval(() => {
  const now = Date.now();
  for (const [ip, bucket] of RATE_BUCKETS) {
    let any = false;
    for (const route of Object.keys(bucket)) {
      const rule = RATE_RULES[route];
      const arr = bucket[route].filter(t => now - t < (rule?.windowMs || 600000));
      if (arr.length === 0) delete bucket[route];
      else { bucket[route] = arr; any = true; }
    }
    if (!any) RATE_BUCKETS.delete(ip);
  }
}, 5 * 60 * 1000).unref();

// ----------------------------------------------------------------------------
// Voz ElevenLabs — gera UMA vez, cacheia em disco, serve via /voice/success.mp3
// ----------------------------------------------------------------------------
let voiceGenPromise = {};
async function gerarVoz(kind) {
  if (!HAS_VOICE) throw new Error('ELEVENLABS_API_KEY ausente');
  const cfg = kind === 'intro'
    ? { cache: VOICE_INTRO_CACHE, text: EL_INTRO_TEXT, settings: { stability: 0.45, similarity_boost: 0.80, style: 0.45, use_speaker_boost: true } }
    : { cache: VOICE_CACHE,       text: EL_TEXT,       settings: { stability: 0.35, similarity_boost: 0.80, style: 0.55, use_speaker_boost: true } };
  if (fs.existsSync(cfg.cache) && fs.statSync(cfg.cache).size > 1000) return cfg.cache;
  if (voiceGenPromise[kind]) return voiceGenPromise[kind];
  voiceGenPromise[kind] = (async () => {
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${EL_VOICE_ID}?output_format=mp3_44100_128`;
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'xi-api-key': EL_API_KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
      body: JSON.stringify({ text: cfg.text, model_id: EL_MODEL_ID, voice_settings: cfg.settings }),
    });
    if (!r.ok) {
      const errTxt = await r.text().catch(() => '');
      voiceGenPromise[kind] = null;
      throw new Error(`ElevenLabs HTTP ${r.status}: ${errTxt.slice(0, 200)}`);
    }
    const buf = Buffer.from(await r.arrayBuffer());
    const tmp = cfg.cache + '.part';
    fs.writeFileSync(tmp, buf);
    fs.renameSync(tmp, cfg.cache);
    log('voz gerada', { kind, bytes: buf.length, voice: EL_VOICE_ID });
    return cfg.cache;
  })();
  return voiceGenPromise[kind];
}
// Wrapper p/ compat
async function gerarVozSucesso() { return gerarVoz('success'); }
// Pré-aquece no boot (best-effort, não bloqueia)
if (HAS_VOICE) {
  gerarVoz('success').catch(e => log('voz pre-aquecimento (success) falhou', { msg: e.message }));
  gerarVoz('intro').catch(e   => log('voz pre-aquecimento (intro) falhou',   { msg: e.message }));
}


const server = http.createServer(async (req, res) => {
  const url  = new URL(req.url, PUBLIC_URL);
  const path = url.pathname;




  try {
    // Health
    if (path === '/health') {
      return sendJSON(res, 200, {
        ok: true,
        oauth: HAS_OAUTH,
        ts: Date.now(),
        repo: { dir: REPO_DIR, branch: GIT_BRANCH, exists: fs.existsSync(REPO_DIR) },
        last_pull: lastPull,
      });
    }

    // ── Página pública de status do MCP ──────────────────────────────────
    // Lê /var/lib/mcp-watchdog/status.json (gerado pelo cron mcp-watchdog.sh)
    // /status.json → JSON cru, /status → HTML bonitinho
    if (path === '/status.json' && (req.method === 'GET' || req.method === 'HEAD')) {
      try {
        const raw = fs.readFileSync('/var/lib/mcp-watchdog/status.json', 'utf-8');
        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
          'Access-Control-Allow-Origin': '*',
        });
        return res.end(raw);
      } catch (e) {
        return sendJSON(res, 503, { ok: false, error: 'watchdog ainda não rodou', detail: e.message });
      }
    }

    if (path === '/status' && (req.method === 'GET' || req.method === 'HEAD')) {
      let st = null;
      try { st = JSON.parse(fs.readFileSync('/var/lib/mcp-watchdog/status.json', 'utf-8')); } catch {}

      const healthy = st && st.healthy === true;
      const dot = healthy ? '#22c55e' : '#ef4444';
      const titulo = healthy ? 'Tudo no ar' : 'Incidente em curso';
      const subtitulo = healthy
        ? 'Todos os serviços do CentralDark respondendo normalmente.'
        : 'Um ou mais serviços com falha — equipe já foi notificada por Telegram.';

      const fmtUptime = (ms) => {
        if (!ms) return '—';
        const s = Math.floor((Date.now() - Number(ms)) / 1000);
        if (s < 60) return s + 's';
        if (s < 3600) return Math.floor(s/60) + 'min';
        if (s < 86400) return Math.floor(s/3600) + 'h ' + Math.floor((s%3600)/60) + 'min';
        return Math.floor(s/86400) + 'd ' + Math.floor((s%86400)/3600) + 'h';
      };

      const checks = st?.checks || {};
      const linha = (nome, val, ok) => `
        <tr>
          <td>${nome}</td>
          <td><span class="pill" style="background:${ok?'#16351f':'#3b1414'};color:${ok?'#4ade80':'#fca5a5'}">${val}</span></td>
        </tr>`;

      const linhas = st ? [
        linha('MCP local (127.0.0.1:9100)',  'HTTP ' + checks.mcp_local?.status,      checks.mcp_local?.status === 200),
        linha('MCP público (mcp.centralldark.com)', 'HTTP ' + checks.mcp_public?.status, checks.mcp_public?.status === 200),
        linha('Install público (install.centralldark.com)', 'HTTP ' + checks.install_public?.status, checks.install_public?.status === 200),
        linha('Caddy (proxy reverso)', checks.caddy?.state, checks.caddy?.state === 'active'),
        linha('MCP PM2', (st.mcp?.pm2_status || 'unknown') + ' · uptime ' + fmtUptime(st.mcp?.pm2_uptime_ms), st.mcp?.pm2_status === 'online'),
        linha('Tools publicadas', String(st.mcp?.tools || '?'), true),
      ].join('') : `<tr><td colspan="2" style="opacity:.6">Aguardando primeira execução do watchdog…</td></tr>`;

      const problemas = (st?.problems || []).length
        ? `<div class="card alerta">
            <h3>Problemas detectados</h3>
            <ul>${st.problems.map(p => `<li>${p.replace(/</g,'&lt;')}</li>`).join('')}</ul>
          </div>` : '';

      const erros = (st?.last_errors || []).length
        ? `<div class="card">
            <h3>Últimos erros do proxy / watchdog</h3>
            <pre>${st.last_errors.map(e => String(e).replace(/</g,'&lt;')).join('\n')}</pre>
          </div>` : '';

      const html = `<!doctype html>
<html lang="pt-BR"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Status — CentralDark</title>
<link rel="icon" href="/favicon.png">
<meta name="description" content="Status público do CentralDark — MCP, Caddy, install e Cloudflare.">
<style>
  *{box-sizing:border-box}
  body{margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,system-ui,sans-serif;
       background:#0a0e14;color:#e6e8ec;line-height:1.5;padding:32px 16px;min-height:100vh}
  .wrap{max-width:760px;margin:0 auto}
  header{display:flex;align-items:center;gap:16px;margin-bottom:32px}
  .dot{width:14px;height:14px;border-radius:50%;background:${dot};
       box-shadow:0 0 24px ${dot};animation:pulso 2s ease-in-out infinite}
  @keyframes pulso{0%,100%{opacity:1}50%{opacity:.55}}
  h1{margin:0;font-size:28px;font-weight:600;letter-spacing:-.02em}
  .sub{opacity:.7;margin-top:4px;font-size:14px}
  .card{background:#121821;border:1px solid #1f2733;border-radius:14px;
        padding:20px 22px;margin-bottom:16px}
  .card h3{margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:.05em;opacity:.7}
  .alerta{border-color:#5b1d1d;background:#1d0f0f}
  .alerta h3{color:#fca5a5}
  table{width:100%;border-collapse:collapse;font-size:14px}
  td{padding:10px 0;border-bottom:1px solid #1f2733}
  tr:last-child td{border-bottom:none}
  td:last-child{text-align:right}
  .pill{display:inline-block;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:600}
  pre{white-space:pre-wrap;font-size:12px;opacity:.75;margin:0;font-family:'SF Mono',Menlo,monospace}
  footer{margin-top:24px;font-size:12px;opacity:.5;text-align:center}
  a{color:#60a5fa;text-decoration:none}
  a:hover{text-decoration:underline}
</style>
</head><body>
<div class="wrap">
  <header>
    <span class="dot"></span>
    <div>
      <h1>${titulo}</h1>
      <div class="sub">${subtitulo}</div>
    </div>
  </header>

  ${problemas}

  <div class="card">
    <h3>Componentes</h3>
    <table><tbody>${linhas}</tbody></table>
  </div>

  ${erros}

  <footer>
    Atualizado em ${st?.checked_at || '—'} · checagem a cada minuto<br>
    <a href="/status.json">/status.json</a> ·
    <a href="/health">/health</a> ·
    <a href="/">início</a>
  </footer>
</div>
<script>setTimeout(()=>location.reload(), 30000);</script>
</body></html>`;

      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      });
      return res.end(html);
    }



    // Estáticos da marca (logo, favicon, etc.) — servidos de public/
    if ((req.method === 'GET' || req.method === 'HEAD') &&
        /^\/(logo\.png|logo@2x\.png|favicon\.ico|favicon\.png|apple-touch-icon\.png|og-image\.png)$/.test(path)) {
      const file = require('path').join(STATIC_DIR, path.replace(/^\//, ''));
      if (fs.existsSync(file)) {
        const ext = require('path').extname(file).toLowerCase();
        const mime = ext === '.png' ? 'image/png' : ext === '.ico' ? 'image/x-icon' : 'application/octet-stream';
        const stat = fs.statSync(file);
        res.writeHead(200, {
          'Content-Type': mime,
          'Content-Length': stat.size,
          'Cache-Control': 'public, max-age=86400',
          'Access-Control-Allow-Origin': '*',
        });
        return fs.createReadStream(file).pipe(res);
      }
    }

    // Voz (ElevenLabs) — success ou intro — MP3 cacheado em disco
    const voiceMatch = path.match(/^\/voice\/(success|intro)\.mp3$/);
    if (voiceMatch && (req.method === 'GET' || req.method === 'HEAD')) {
      const kind = voiceMatch[1];

      if (!HAS_VOICE) { res.writeHead(404); return res.end(); }
      try {
        const file = await gerarVoz(kind);
        const stat = fs.statSync(file);
        res.writeHead(200, {
          'Content-Type': 'audio/mpeg',
          'Content-Length': stat.size,
          'Cache-Control': 'public, max-age=86400, immutable',
          'Access-Control-Allow-Origin': '*',
        });
        return fs.createReadStream(file).pipe(res);
      } catch (e) {
        log('voz erro', { msg: e.message });
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        return res.end('voz indisponivel');
      }
    }

    if (path === '/refresh' && (req.method === 'POST' || req.method === 'GET')) {
      const r = await gitPull();
      return sendJSON(res, 200, r);
    }

    // install.sh / bootstrap explícito (o que `curl install.centralldark.com | bash` usa)
    if ((path === '/install.sh' || path === '/install' || path === '/bootstrap.sh') && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'text/x-shellscript; charset=utf-8' });
      return res.end(bootstrapScript());
    }

    // install.sh REAL do repo local — usado pelo self_update do próprio install.sh.
    // Fallback: se o arquivo local sumir, baixa direto do GitHub raw.
    if ((path === '/raw/install.sh' || path === '/install.sh.full') && req.method === 'GET') {
      try {
        if (fs.existsSync(INSTALL_SH)) {
          res.writeHead(200, { 'Content-Type': 'text/x-shellscript; charset=utf-8' });
          return res.end(fs.readFileSync(INSTALL_SH));
        }
        const buf = await fetchFromGithubRaw('install.sh');
        res.writeHead(200, { 'Content-Type': 'text/x-shellscript; charset=utf-8', 'X-Source': 'github-raw' });
        return res.end(buf);
      } catch (e) {
        return sendJSON(res, 503, { error: 'install_sh_missing', msg: e.message });
      }
    }



    // Tarball auto-contido com tudo que o instalador precisa
    if (path === '/installer.tar.gz' && req.method === 'GET') {
      if (!fs.existsSync(REPO_DIR)) return sendJSON(res, 503, { error: 'bundle_unavailable' });
      const args = ['-czf', '-', '-C', REPO_DIR, ...BUNDLE_PATHS.filter(p => fs.existsSync(require('path').join(REPO_DIR, p)))];
      res.writeHead(200, {
        'Content-Type': 'application/gzip',
        'Content-Disposition': 'attachment; filename="centraldark-installer.tar.gz"',
      });
      const tar = spawn('tar', args);
      tar.stdout.pipe(res);
      tar.stderr.on('data', d => log('tar stderr', { msg: String(d).slice(0, 200) }));
      tar.on('error', e => { try { res.end(); } catch(_){} log('tar erro', { msg: e.message }); });
      return;
    }

    // ─────── Skills públicas — espelho do MCP, sem auth ───────
    // Qualquer IA externa puxa via:
    //   curl -sL https://install.centralldark.com/skills/<nome>/install.sh | bash
    {
      const mSkill = path.match(/^\/skills(?:\/([a-z0-9][a-z0-9-]{1,63}))?(?:\/(SKILL\.md|install\.sh))?\/?$/i);
      if (mSkill && req.method === 'GET') {
        const nome = mSkill[1] || null;
        const sub  = mSkill[2] || null;
        try {
          return await handleSkillsRoute(res, nome, sub);
        } catch (e) {
          log('skills erro', { msg: e.message });
          return sendJSON(res, 500, { ok: false, erro: 'skills_indisponivel' });
        }
      }
    }


    // Landing geral — CLI recebe o bootstrap; browser recebe a página rica
    if (path === '/' && req.method === 'GET') {
      if (isCliClient(req)) {
        res.writeHead(200, { 'Content-Type': 'text/x-shellscript; charset=utf-8' });
        return res.end(bootstrapScript());
      }
      return sendHTML(res, 200, pageLanding());
    }

    // Documentação — índice e páginas individuais
    if (path === '/docs' || path === '/docs/') {
      const docs = loadDocsIndex();
      const cards = docs.map(d => `
        <a class="doc-card" href="/docs/${d.slug}">
          <div class="n">${d.num ? d.num.padStart(2,'0') : '··'}</div>
          <div class="t">${escHtml(d.title)}</div>
          <div class="d">${escHtml(d.desc)}</div>
        </a>`).join('');
      return sendHTML(res, 200, pageDocsShell('Documentação', `
        <div class="card">
          <h1>📚 Documentação CentralDark</h1>
          <p class="muted">Toda a documentação do instalador, em ordem de execução. Sincronizada com o repositório <code>segredounlock/clone-deck</code> a cada commit.</p>
          <div class="grid">${cards || '<p class="muted">Sem documentação disponível.</p>'}</div>
        </div>
      `));
    }
    if (path.startsWith('/docs/') && req.method === 'GET') {
      const slug = path.slice('/docs/'.length).replace(/[^a-zA-Z0-9._-]/g, '');
      const html = pageDoc(slug);
      if (!html) return sendHTML(res, 404, pageError('Documento não encontrado. Volte pra <a href="/docs">/docs</a>.'));
      return sendHTML(res, 200, html);
    }



    // Cria sessão (chamada pelo SSH).
    // Aceita { target_ip } opcional pro install-connect.sh já dizer qual IP
    // a VPS quer apontar no DNS — assim a página de escolha de zona já mostra.
    if (path === '/session/new' && req.method === 'POST') {
      const rl = rateLimit(req, '/session/new');
      if (!rl.ok) { res.setHeader('Retry-After', rl.retryAfter); return sendJSON(res, 429, { error: 'rate_limited', retry_after: rl.retryAfter }); }
      let targetIp = null;
      try {
        const rawBody = await readBody(req);
        if (rawBody) {
          const j = JSON.parse(rawBody);
          if (j && typeof j.target_ip === 'string' && /^[0-9a-fA-F.:]{3,45}$/.test(j.target_ip)) {
            targetIp = j.target_ip;
          }
        }
      } catch {}
      const id = newSessionId();
      sessions.set(id, { createdAt: Date.now(), status: 'pending', targetIp });
      log('sessao criada', { sid: id.slice(0,10), ip: targetIp || '(detectar)' });
      return sendJSON(res, 200, {
        session_id:  id,
        connect_url: `${PUBLIC_URL}/connect/${id}`,
        oauth_url:   HAS_OAUTH ? `${PUBLIC_URL}/oauth/cloudflare/start?sid=${id}` : null,
        token_url:   oneClickTokenUrl(),
        ttl_seconds: SESSION_TTL / 1000,
      });
    }



    // Long-poll status (chamado pelo SSH)
    if (path.startsWith('/session/') && req.method === 'GET') {
      const id = path.split('/')[2];
      const s = sessions.get(id);
      if (!s) return sendJSON(res, 404, { error: 'session_not_found' });
      const wait = parseInt(url.searchParams.get('wait') || '0', 10);
      const deadline = Date.now() + Math.min(wait, 25) * 1000;
      while (s.status === 'pending' && Date.now() < deadline) {
        // Recuperação por IP: se o usuário autorizou em um SID antigo (rotacionado)
        // mas o IP bate, aproveita o sucesso e marca esta sessão como done.
        const rec = recoverDoneForIp(s.targetIp);
        if (rec) {
          s.token = rec.token; s.accountTag = rec.accountTag; s.kind = rec.kind;
          s.status = 'done';
          log('sessao recuperada por ip', { sid: id.slice(0,10), ip: s.targetIp, fp: rec.fingerprint });
          break;
        }
        await new Promise(r => setTimeout(r, 500));
      }
      if (s.status === 'done') {
        // Entrega o token UMA vez e remove
        const payload = { status: 'done', token: s.token, account_id: s.accountTag, kind: s.kind, fingerprint: fingerprint(s.token) };
        sessions.delete(id);
        return sendJSON(res, 200, payload);
      }
      return sendJSON(res, 200, { status: s.status });
    }


    // Página de conexão
    if (path.startsWith('/connect/') && req.method === 'GET') {
      const id = path.split('/')[2];
      const s = sessions.get(id);
      if (!s) return sendHTML(res, 404, pageError('Sessão expirada ou inválida. Rode o instalador de novo.'));
      return sendHTML(res, 200, pageConnect(id, HAS_OAUTH));
    }

    // Início OAuth
    if (path === '/oauth/cloudflare/start' && req.method === 'GET') {
      const rl = rateLimit(req, '/oauth/cloudflare/start');
      if (!rl.ok) { res.setHeader('Retry-After', rl.retryAfter); return sendHTML(res, 429, pageError('Muitas tentativas. Aguarde alguns minutos.')); }
      if (!HAS_OAUTH) return sendHTML(res, 400, pageError('OAuth da Cloudflare não está configurado nesta VPS. Use o caminho do token.'));
      const sid = url.searchParams.get('sid');
      const s = sessions.get(sid);
      if (!s) return sendHTML(res, 404, pageError('Sessão expirada.'));
      const { verifier, challenge } = pkce();
      s.codeVerifier = verifier;
      const authUrl = oauthAuthorizeUrl(sid, challenge);
      log('oauth start', { sid: sid.slice(0,10) });
      res.writeHead(302, { Location: authUrl });
      return res.end();
    }

    // Callback OAuth
    if (path === '/oauth/cloudflare/callback' && req.method === 'GET') {
      const code  = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const err   = url.searchParams.get('error');
      if (err)  return sendHTML(res, 400, pageError(`Cloudflare retornou: ${err}`));
      if (!code || !state) return sendHTML(res, 400, pageError('Resposta inválida da Cloudflare.'));
      const sid = verifyState(state);
      if (!sid) return sendHTML(res, 400, pageError('State inválido (anti-CSRF).'));
      const s = sessions.get(sid);
      if (!s || !s.codeVerifier) return sendHTML(res, 404, pageError('Sessão expirada.'));

      // Troca code -> token
      const body = new URLSearchParams({
        grant_type:    'authorization_code',
        client_id:     CF_CLIENT_ID,
        redirect_uri:  `${PUBLIC_URL}/oauth/cloudflare/callback`,
        code,
        code_verifier: s.codeVerifier,
      }).toString();
      const basic = Buffer.from(`${CF_CLIENT_ID}:${CF_CLIENT_SEC}`).toString('base64');
      const tk = await httpsRequest('https://dash.cloudflare.com/oauth2/token', {
        method: 'POST',
        headers: {
          Authorization:  `Basic ${basic}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }, body);
      if (tk.status !== 200) {
        log('oauth token erro', { sid: sid.slice(0,10), status: tk.status });
        return sendHTML(res, 502, pageError(`Falha ao trocar code por token (HTTP ${tk.status}).`));
      }
      const json = JSON.parse(tk.body);
      const token = json.access_token;
      // Defesa em profundidade: valida que o access_token funciona como API Token
      // antes de gravar o cofre. OAuth da Cloudflare devolve "cfoa..." que rejeita
      // em /client/v4/* — gravava cofre quebrado e travava a ativação.
      const v = await verifyToken(token);
      if (!v.ok) {
        log('oauth token rejeitado como API token', { sid: sid.slice(0,10), fp: fingerprint(token) });
        return sendHTML(res, 400, pageError('O token devolvido pela Cloudflare via OAuth não é aceito como API Token. Use o caminho do 1-Click Token (botão verde).'));
      }
      const accountTag = await fetchAccountTag(token);
      s.token = token; s.accountTag = accountTag; s.kind = 'oauth';
      log('oauth ok', { sid: sid.slice(0,10), account: accountTag, fp: fingerprint(token) });
      return await finalizeAuth(res, sid, s, 'OAuth Cloudflare');
    }

    // Submissão do 1-click token
    if (path === '/token/cloudflare' && req.method === 'POST') {
      const rl = rateLimit(req, '/token/cloudflare');
      if (!rl.ok) { res.setHeader('Retry-After', rl.retryAfter); return sendHTML(res, 429, pageError('Muitas tentativas. Aguarde alguns minutos.')); }
      const sid = url.searchParams.get('sid');
      const s = sessions.get(sid);
      if (!s) return sendHTML(res, 404, pageError('Sessão expirada.'));
      const raw = await readBody(req);
      const params = new URLSearchParams(raw);
      const token = (params.get('token') || '').trim();
      if (!token || token.length < 20) return sendHTML(res, 400, pageError('Token vazio ou muito curto.'));
      const v = await verifyToken(token);
      if (!v.ok) {
        log('token invalido', { sid: sid.slice(0,10), fp: fingerprint(token) });
        return sendHTML(res, 400, pageError('A Cloudflare rejeitou o token. Confira se você marcou DNS:Edit e Zone:Read.'));
      }
      const accountTag = await fetchAccountTag(token);
      s.token = token; s.accountTag = accountTag; s.kind = '1click-token';
      log('token ok', { sid: sid.slice(0,10), account: accountTag, fp: fingerprint(token) });
      return await finalizeAuth(res, sid, s, '1-Click Token');
    }

    // Escolha do domínio quando a conta tem mais de uma zona.
    // Grava CF_ZONE_NAME + CF_TARGET_IP no cofre e fecha a sessão.
    if (path === '/zone/choose' && req.method === 'POST') {
      const sid = url.searchParams.get('sid');
      const s = sessions.get(sid);
      if (!s || !s.token) return sendHTML(res, 404, pageError('Sessão expirada. Refaça a conexão.'));
      const raw = await readBody(req);
      const params = new URLSearchParams(raw);
      const zoneName = (params.get('zone_name') || '').trim();
      if (!zoneName || !/^[a-z0-9.-]{3,255}$/i.test(zoneName)) {
        return sendHTML(res, 400, pageError('Domínio inválido.'));
      }
      // Confere se a zona realmente pertence à conta (anti-trampa)
      const zonas = s.zones || await fetchZones(s.token);
      if (!zonas.find(z => z.name === zoneName)) {
        return sendHTML(res, 400, pageError(`A zona "${escHtml(zoneName)}" não está disponível nessa conta.`));
      }
      const targetIp = s.targetIp || await detectPublicIp();
      saveCloudflareSecret({ token: s.token, accountTag: s.accountTag, kind: s.kind, zoneName, targetIp });
      s.zoneName = zoneName;
      s.targetIp = targetIp;
      s.status = 'done';
      rememberDoneForIp(s);
      log('zona escolhida', { sid: sid.slice(0,10), zone: zoneName, ip: targetIp || '(?)' });
      return sendHTML(res, 200, pageDone(s.kind === 'oauth' ? 'OAuth Cloudflare' : '1-Click Token', fingerprint(s.token)));
    }


    return sendHTML(res, 404, pageError('Página não encontrada.'));
  } catch (e) {
    log('erro', { msg: e.message });
    sentryCapture(e, {
      method: req.method,
      path: req.url ? String(req.url).split('?')[0] : null,
      ua: req.headers && req.headers['user-agent'],
    });
    return sendHTML(res, 500, pageError('Erro interno. Veja os logs.'));
  }
});

server.listen(PORT, '127.0.0.1', () => {
  log('install-callback online', { port: PORT, oauth: HAS_OAUTH, public_url: PUBLIC_URL });
});
