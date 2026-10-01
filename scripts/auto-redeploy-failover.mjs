#!/usr/bin/env node
/**
 * AUTO REDEPLOY FAILOVER — CentralDark
 * 
 * Monitora upstream (GitHub, Omni Router, VPS, MCP, Screenpipe, Hub)
 * Detecta falha → dispara alarme → aciona failover automático entre:
 *   - Omni Router (providers: nous, hermes, google, claude-code, xai, abacus, openai)
 *   - Arsenal Adapter (Abacus RouteLLM)
 *   - Hermes Coletivo
 *   - Grok / Codex / Claude / ChatGPT via dispatcher
 *   - MCP CentralDark
 *   - VPS health (PM2, Caddy, disco, memória)
 * 
 * Reconhece upstream via GitHub webhook + polling
 * Dispara alarme no Hub (Telegram/Discord) + log estruturado
 * Reutiliza modelos via Omni Router fallback chain
 * Pode rodar como oneshot, daemon ou cron
 */

import { execSync, spawn } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { formatBrasilia } from '../central-horario/node.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(__dirname, '..', '..');
const LOG_DIR = resolve(RAIZ, 'logs', 'auto-failover');
const STATE_FILE = resolve(LOG_DIR, 'failover-state.json');
const HISTORY_FILE = resolve(LOG_DIR, 'failover-history.jsonl');

mkdirSync(LOG_DIR, { recursive: true });

// ============ CONFIG ============
const CONFIG = {
  // Endpoints a monitorar
  endpoints: {
    github: {
      url: 'https://api.github.com/repos/ServerVpss/CentralDark/commits/main',
      timeout: 10000,
      critical: true,
    },
    omniRouter: {
      url: 'http://127.0.0.1:8099/health',
      timeout: 5000,
      critical: true,
    },
    omniModels: {
      url: 'http://127.0.0.1:8099/v1/models',
      timeout: 5000,
      critical: false,
    },
    mcp: {
      url: 'https://mcp.centralldark.com/health',
      timeout: 10000,
      critical: false,
    },
    screenpipe: {
      url: 'http://127.0.0.1:3030/health',
      timeout: 5000,
      critical: false,
    },
    hubApi: {
      url: 'https://api.centralldark.com/health',
      timeout: 10000,
      critical: true,
    },
    hubWeb: {
      url: 'https://centralldark.com',
      timeout: 10000,
      critical: false,
    },
  },

  // Fallback chain do Omni Router (ordem de preferência)
  fallbackChain: [
    'nous',
    'google',
    'claude-code',
    'xai',
    'abacus',
    'openai',
  ],

  // Providers que precisam de credencial externa
  providerCredentials: {
    openai: 'OPENAI_API_KEY',
    google: 'GOOGLE_API_KEY',
    xai: 'XAI_API_KEY',
    abacus: 'ABACUS_API_KEY',
    nous: 'NOUS_API_KEY', // lido do auth.json dinamicamente
  },

  // Limiares
  thresholds: {
    maxFailuresBeforeFailover: 2,
    checkIntervalMs: 30000, // 30s
    healthTimeoutMs: 5000,
    deployTimeoutMs: 300000, // 5 min
    cooldownMs: 60000, // 1 min entre failovers
  },

  // Alarmes
  alarms: {
    telegram: {
      enabled: true,
      botTokenEnv: 'TELEGRAM_BOT_TOKEN',
      chatIdEnv: 'TELEGRAM_CHAT_ID',
    },
    discord: {
      enabled: true,
      webhookUrlEnv: 'DISCORD_WEBHOOK_URL',
    },
    githubIssue: {
      enabled: true,
      repo: 'ServerVpss/CentralDark',
      labels: ['🔴 FALTA-EVIDÊNCIA', '🤖 AUTO', 'auto-failover'],
    },
  },

  // Deploy
  deploy: {
    script: 'scripts/micro_deploy.sh',
    vpsScript: 'scripts/vps-deploy.sh',
    worktrees: [
      'worktrees/pr1393-porta-tokens',
      'worktrees/absorver-para-hermes',
    ],
  },
};

// ============ ESTADO ============
let state = {
  lastCheck: 0,
  consecutiveFailures: {},
  lastFailover: 0,
  currentProvider: 'hermes',
  deployInProgress: false,
  history: [],
};

function loadState() {
  if (existsSync(STATE_FILE)) {
    try {
      state = JSON.parse(readFileSync(STATE_FILE, 'utf8'));
    } catch { /* ignore */ }
  }
  // Inicializa contadores
  for (const key of Object.keys(CONFIG.endpoints)) {
    if (!state.consecutiveFailures[key]) state.consecutiveFailures[key] = 0;
  }
}

function saveState() {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function appendHistory(event) {
  const entry = { ...event, ts: new Date().toISOString() };
  state.history.push(entry);
  if (state.history.length > 1000) state.history = state.history.slice(-1000);
  writeFileSync(HISTORY_FILE, state.history.map(e => JSON.stringify(e)).join('\n') + '\n', { flag: 'a' });
}

// ============ UTILS ============
function log(level, msg, data = {}) {
  const entry = { level, msg, data, ts: new Date().toISOString() };
  console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](`[${entry.ts}] ${level.toUpperCase()}: ${msg}`, data);
}

function runCmd(cmd, opts = {}) {
  try {
    const out = execSync(cmd, {
      cwd: RAIZ,
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: opts.timeout || 60000,
      env: { ...process.env, ...opts.env },
    });
    return { ok: true, out: out.trim() };
  } catch (e) {
    return { ok: false, err: e.message, stdout: e.stdout?.toString() || '', stderr: e.stderr?.toString() || '' };
  }
}

async function httpCheck(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, method: 'GET' });
    clearTimeout(timer);
    return { ok: res.ok, status: res.status, url };
  } catch (e) {
    clearTimeout(timer);
    return { ok: false, error: e.message, url };
  }
}

function checkCredential(provider) {
  const envKey = CONFIG.providerCredentials[provider];
  if (!envKey) return true; // provider local (hermes, claude-code)
  const val = process.env[envKey];
  return !!val && val.length > 10;
}

// ============ MONITORAMENTO ============
async function checkEndpoints() {
  const results = {};
  for (const [name, ep] of Object.entries(CONFIG.endpoints)) {
    const res = await httpCheck(ep.url, ep.timeout);
    results[name] = { ...res, critical: ep.critical };
    if (res.ok) {
      state.consecutiveFailures[name] = 0;
    } else {
      state.consecutiveFailures[name] = (state.consecutiveFailures[name] || 0) + 1;
      log('warn', `Endpoint ${name} falhou (${state.consecutiveFailures[name]}/${CONFIG.thresholds.maxFailuresBeforeFailover})`, { error: res.error, status: res.status });
    }
  }
  return results;
}

function shouldFailover(results) {
  const now = Date.now();
  if (now - state.lastFailover < CONFIG.thresholds.cooldownMs) return false;
  if (state.deployInProgress) return false;
  for (const [name, ep] of Object.entries(CONFIG.endpoints)) {
    if (ep.critical && state.consecutiveFailures[name] >= CONFIG.thresholds.maxFailuresBeforeFailover) {
      return { trigger: name, reason: `critical endpoint ${name} failed ${state.consecutiveFailures[name]}x` };
    }
  }
  return false;
}

// ============ ALARMES ============
async function fireAlarms(trigger, reason, details = {}) {
  const msg = `🚨 CENTRALDARK FAILOVER\nTrigger: ${trigger}\nReason: ${reason}\nTime: ${formatBrasilia()}\nDetails: ${JSON.stringify(details, null, 2)}`;

  // Telegram
  if (CONFIG.alarms.telegram.enabled) {
    const token = process.env[CONFIG.alarms.telegram.botTokenEnv];
    const chatId = process.env[CONFIG.alarms.telegram.chatIdEnv];
    if (token && chatId) {
      try {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: 'HTML' }),
        });
        log('info', 'Telegram alarm sent');
      } catch (e) { log('warn', 'Telegram alarm failed', { error: e.message }); }
    }
  }

  // Discord
  if (CONFIG.alarms.discord.enabled) {
    const webhook = process.env[CONFIG.alarms.discord.webhookUrlEnv];
    if (webhook) {
      try {
        await fetch(webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: msg }),
        });
        log('info', 'Discord alarm sent');
      } catch (e) { log('warn', 'Discord alarm failed', { error: e.message }); }
    }
  }

  // GitHub Issue
  if (CONFIG.alarms.githubIssue.enabled) {
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    if (token) {
      try {
        await fetch(`https://api.github.com/repos/${CONFIG.alarms.githubIssue.repo}/issues`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: `[auto-failover] ${trigger} falhou — ${formatBrasilia()}`,
            body: msg,
            labels: CONFIG.alarms.githubIssue.labels,
          }),
        });
        log('info', 'GitHub issue created');
      } catch (e) { log('warn', 'GitHub issue failed', { error: e.message }); }
    }
  }

  appendHistory({ type: 'ALARM', trigger, reason, details });
}

// ============ FAILOVER ============
async function selectNextProvider() {
  const idx = CONFIG.fallbackChain.indexOf(state.currentProvider);
  const nextIdx = (idx + 1) % CONFIG.fallbackChain.length;
  const next = CONFIG.fallbackChain[nextIdx];
  
  // Verifica se tem credencial
  if (checkCredential(next)) {
    state.currentProvider = next;
    log('info', `Failover: trocando para provider ${next}`);
    appendHistory({ type: 'FAILOVER', from: CONFIG.fallbackChain[idx], to: next, reason: 'credential_ok' });
    return next;
  }
  
  // Tenta o próximo da cadeia
  for (let i = 0; i < CONFIG.fallbackChain.length; i++) {
    const candidate = CONFIG.fallbackChain[(nextIdx + i) % CONFIG.fallbackChain.length];
    if (checkCredential(candidate)) {
      state.currentProvider = candidate;
      log('info', `Failover: pulando para ${candidate} (sem credencial para ${next})`);
      appendHistory({ type: 'FAILOVER', from: CONFIG.fallbackChain[idx], to: candidate, reason: 'skipped_no_credential' });
      return candidate;
    }
  }
  
  log('error', 'Nenhum provider com credencial disponível na cadeia!');
  return null;
}

async function triggerOmniRouterFailover(newProvider) {
  // O Omni Router já faz fallback automático via CENTRALDARK_FALLBACK_CHAIN
  // Aqui apenas garantimos que a variável de ambiente reflete a escolha
  process.env.CENTRALDARK_FALLBACK_CHAIN = CONFIG.fallbackChain.join(',');
  process.env.CENTRALDARK_DEFAULT_ENGINE = newProvider;
  
  // Força reload do router (se estiver rodando via PM2)
  const res = runCmd('pm2 reload centraldark-omni-router --update-env 2>/dev/null || true', { timeout: 30000 });
  if (!res.ok) log('warn', 'pm2 reload falhou (pode não estar rodando localmente)', { err: res.err });
  
  appendHistory({ type: 'ROUTER_RELOAD', provider: newProvider });
}

async function runDeploy() {
  state.deployInProgress = true;
  log('info', 'Iniciando micro-deploy...');
  
  const res = runCmd(`bash ${CONFIG.deploy.script}`, { timeout: CONFIG.thresholds.deployTimeoutMs });
  
  state.deployInProgress = false;
  
  if (res.ok) {
    log('info', 'Micro-deploy concluído com sucesso');
    appendHistory({ type: 'DEPLOY', status: 'success', output: res.out.slice(-500) });
    return true;
  } else {
    log('error', 'Micro-deploy falhou', { err: res.err, stderr: res.stderr });
    appendHistory({ type: 'DEPLOY', status: 'fail', error: res.err });
    return false;
  }
}

async function runVPSDeploy() {
  log('info', 'Iniciando deploy VPS...');
  const res = runCmd(`bash ${CONFIG.deploy.vpsScript}`, { timeout: CONFIG.thresholds.deployTimeoutMs * 2 });
  if (res.ok) {
    log('info', 'Deploy VPS concluído');
    appendHistory({ type: 'VPS_DEPLOY', status: 'success' });
    return true;
  } else {
    log('error', 'Deploy VPS falhou', { err: res.err });
    appendHistory({ type: 'VPS_DEPLOY', status: 'fail', error: res.err });
    return false;
  }
}

async function syncWorktrees() {
  for (const wt of CONFIG.deploy.worktrees) {
    const wtPath = resolve(RAIZ, wt);
    if (existsSync(wtPath)) {
      log('info', `Sincronizando worktree ${wt}`);
      runCmd(`cd "${wtPath}" && git fetch origin && git rebase origin/main`, { timeout: 60000 });
    }
  }
}

// ============ LOOP PRINCIPAL ============
async function mainLoop() {
  log('info', '=== AUTO FAILOVER INICIADO ===');
  log('info', `Fallback chain: ${CONFIG.fallbackChain.join(' → ')}`);
  log('info', `Current provider: ${state.currentProvider}`);

  while (true) {
    try {
      // 1. Check endpoints
      const results = await checkEndpoints();
      
      // 2. Verifica se precisa failover
      const failover = shouldFailover(results);
      
      if (failover) {
        log('warn', `FAILOVER TRIGGERED: ${failover.trigger} - ${failover.reason}`);
        
        // Dispara alarmes
        await fireAlarms(failover.trigger, failover.reason, { results, currentProvider: state.currentProvider });
        
        // Seleciona próximo provider
        const newProvider = await selectNextProvider();
        if (newProvider) {
          await triggerOmniRouterFailover(newProvider);
          
          // Aguarda estabilização
          await new Promise(r => setTimeout(r, 10000));
          
          // Re-check
          const recheck = await checkEndpoints();
          const stillFailing = Object.entries(recheck).some(([k, v]) => 
            CONFIG.endpoints[k]?.critical && !v.ok
          );
          
          if (stillFailing) {
            log('error', 'Failover não resolveu — iniciando micro-deploy');
            await fireAlarms('DEPLOY', 'Failover não resolveu, iniciando micro-deploy', { provider: newProvider });
            
            const deployOk = await runDeploy();
            if (!deployOk) {
              await runVPSDeploy();
            }
            
            await syncWorktrees();
          } else {
            log('info', 'Failover resolveu — endpoints saudáveis');
            appendHistory({ type: 'FAILOVER_SUCCESS', provider: newProvider });
          }
        }
        
        state.lastFailover = Date.now();
        saveState();
      } else {
        // Log periódico de saúde
        const failing = Object.entries(results).filter(([_, v]) => !v.ok).map(([k]) => k);
        if (failing.length > 0) {
          log('info', `Health check: ${failing.length} endpoints com problemas`, { failing });
        } else {
          log('debug', 'All endpoints healthy');
        }
      }

      // 3. Persiste estado
      state.lastCheck = Date.now();
      saveState();

    } catch (e) {
      log('error', 'Erro no loop principal', { error: e.message, stack: e.stack });
      appendHistory({ type: 'ERROR', error: e.message });
    }

    // Aguarda próximo ciclo
    await new Promise(r => setTimeout(r, CONFIG.thresholds.checkIntervalMs));
  }
}

// ============ ENTRY POINTS ============
async function runOnce() {
  log('info', 'Modo oneshot — verificação única');
  const results = await checkEndpoints();
  const failover = shouldFailover(results);
  
  console.log(JSON.stringify({ results, failover, state: { currentProvider: state.currentProvider, consecutiveFailures: state.consecutiveFailures } }, null, 2));
  
  if (failover) {
    await fireAlarms(failover.trigger, failover.reason, { results });
    const newProvider = await selectNextProvider();
    if (newProvider) {
      await triggerOmniRouterFailover(newProvider);
      console.log(`Failover para ${newProvider} disparado`);
    }
  }
}

function printUsage() {
  console.log(`
AUTO REDEPLOY FAILOVER — CentralDark

Uso:
  node auto-redeploy-failover.mjs [comando]

Comandos:
  daemon      - Roda loop contínuo (padrão)
  once        - Verificação única e exit
  status      - Mostra estado atual
  test-alarm  - Dispara alarme de teste
  failover    - Força failover manual para próximo provider
  deploy      - Roda micro-deploy manual
  vps-deploy  - Roda deploy VPS manual

Variáveis de ambiente necessárias:
  GITHUB_TOKEN / GH_TOKEN          - Para GitHub API
  TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID - Para Telegram
  DISCORD_WEBHOOK_URL              - Para Discord
  OPENAI_API_KEY, GOOGLE_API_KEY, etc. - Credenciais dos providers
  CENTRALDARK_ROUTER_TOKEN         - Token do Omni Router (opcional)

Endpoints monitorados:
  - GitHub (main branch)
  - Omni Router :8099 (/health, /v1/models)
  - MCP CentralDark
  - Screenpipe :3030
  - Hub API (api.centralldark.com)
  - Hub Web (centralldark.com)

Fallback chain: ${CONFIG.fallbackChain.join(' → ')}
`);
}

// ============ MAIN ============
loadState();

const cmd = process.argv[2] || 'daemon';

switch (cmd) {
  case 'daemon':
    mainLoop().catch(e => {
      log('error', 'Daemon crashed', { error: e.message });
      process.exit(1);
    });
    break;
  case 'once':
    runOnce().catch(e => { log('error', e.message); process.exit(1); });
    break;
  case 'status':
    console.log(JSON.stringify({ state, config: { fallbackChain: CONFIG.fallbackChain } }, null, 2));
    break;
  case 'test-alarm':
    fireAlarms('TEST', 'Teste manual de alarme', { manual: true }).then(() => process.exit(0));
    break;
  case 'failover':
    selectNextProvider().then(p => {
      if (p) triggerOmniRouterFailover(p).then(() => console.log(`Failover para ${p} disparado`));
    });
    break;
  case 'deploy':
    runDeploy().then(ok => process.exit(ok ? 0 : 1));
    break;
  case 'vps-deploy':
    runVPSDeploy().then(ok => process.exit(ok ? 0 : 1));
    break;
  default:
    printUsage();
    process.exit(1);
}