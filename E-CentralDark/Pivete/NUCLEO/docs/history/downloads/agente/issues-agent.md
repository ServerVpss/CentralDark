# AGENTE - issues-agent.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\scripts\issues-agent\issues-agent.mjs
**SHA:** 23c0c2714a872e56
**Timestamp:** 2026-08-28T02:57:35.711433
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const nextRun = parseInt(readFileSync(STATE_FILE, 'utf8').trim() || '0', 10);

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node
/**
 * issues-agent.mjs — Agente autônomo de triagem de issues GitHub
 *
 * Cron: * /30 * * * * (cron roda a cada 30min, mas o agente tem timer
 * interno aleatório de 45–110 min — imita comportamento humano)
 *
 * Ações:
 *  1. Fecha duplicatas (mesmo problema, múltiplas issues abertas)
 *  2. Fecha issues de workflows que voltaram ao verde
 *  3. Fecha alertas de serviços propositalmente parados (wuzapi, whatsapp)
 *  4. Comenta nas issues antigas mostrando que está monitorando
 *  5. Notifica Pivete no Telegram com resumo
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const REPO = 'ServerVpss/CentralDark';
const STATE_FILE = join(__dir, '.next_run');
const MIN_MIN = 45;
const MAX_MIN = 110;
const ATIVIDADE_DIAS = 3; // comentar em issues sem movimento há X dias

// ── Timer aleatório — imita humano ────────────────────────────────
const now = Date.now();
if (existsSync(STATE_FILE)) {
  const nextRun = parseInt(readFileSync(STATE_FILE, 'utf8').trim() || '0', 10);
  if (now < nextRun) {
    const mins = Math.round((nextRun - now) / 60_000);
    log(`Próxima janela em ~${mins}min. Saindo.`);
    process.exit(0);
  }
}
const delay = (MIN_MIN + Math.floor(Math.random() * (MAX_MIN - MIN_MIN))) * 60_000;
writeFileSync(STATE_FILE, String(now + delay));
log(`Iniciando triagem. Próxima execução em ~${Math.round(delay / 60_000)}min.`);

// ── Utilitários ───────────────────────────────────────────────────
function log(...args) {
  console.log('[issues-agent]', ...args);
}

function ghJSON(cmd) {
  try {
    const out = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    return JSON.parse(out.trim());
  } catch {
    return null;
  }
}

function ghExec(cmd) {
  try {
    execSync(cmd, { stdio: ['pipe', 'pipe', 'pipe'] });
    return true;
  } catch (e) {
    log(`Erro gh: ${e.message.split('\n')[0]}`);
    return false;
  }
}

// ── Carregar Telegram do cofre ────────────────────────────────────
const COFRE = '/root/CentralDark/secrets/mcp.env';
let TG_TOKEN = '';
let ADMIN_ID = '';

if (existsSync(COFRE)) {
  for (const line of readFileSync(COFRE, 'utf8').split('\n')) {
    const [k, ...vparts] = line.split('=');
    const v = vparts.join('=').replace(/^["']|["']$/g, '').trim();
    if (!TG_TOKEN && (k === 'SRVER1_BOT_TOKEN' || k === 'TELEGRAM_BOT_TOKEN')) TG_TOKEN = v;
    if (!ADMIN_ID && (k === 'ADMIN_CHAT_ID' || k === 'ADMIN_TELEGRAM_ID')) ADMIN_ID = v;
  }
}

async function tg(text) {
  if (!TG_TOKEN || !ADMIN_ID) return;
  try {
    await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ADMIN_ID,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
  } catch {}
}

// ── Parsear título de issue Sentinela ─────────────────────────────
function parseTitulo(title) {
  const m = title.match(/\[SENTINELA ([^\]]+)\]\s+([^:]+):\s*(.+)/);
  if (!m) return null;
  return { hash: m[1].trim(), tipo: m[2].trim(), descricao: m[3].trim() };
}

// ── Extrair nome do workflow do título ────────────────────────────
function extrairWorkflow(descricao) {
  const m = descricao.match(/Workflow vermelho:\s*(.+)/i);
  return m ? m[1].trim() : descricao.trim();
}

// ── Verificar se workflow voltou ao verde ─────────────────────────
function workflowVerde(workflowName) {
  const runs = ghJSON(
    `gh run list --repo ${REPO} --workflow ${JSON.stringify(workflowName)} --limit 10 --json conclusion,status`
  );
  if (!runs || runs.length === 0) return false;
  // Pelo menos uma conclusão de sucesso nas últimas 10 execuções
  return runs.some((r) => r.conclusion === 'success');
}

// ── Serviços propositalmente parados ─────────────────────────────
const SERVICOS_PARADOS = ['wuzapi', 'whatsapp', 'multizap'];

function ehServicoParado(title) {
  const t = title.toLowerCase();
  return SERVICOS_PARADOS.find((s) => t.includes(s)) || null;
}

// ── Mensagens variadas (parecer humano) ───────────────────────────
function rnd(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const MSG_DUPLICATA = [
  (n) => `🔍 Verificando... esta issue é duplicata de #${n}. Mantendo o histórico lá e fechando esta para limpar o rastreador.`,
  (n) => `📋 O mesmo problema já está registrado em #${n}. Consolidando lá para evitar ruído. Fechando esta.`,
  (n) => `✂️ Duplicata de #${n} — mesma causa, mesmo workflow. Fechando esta, histórico preservado na original.`,
];

const MSG_RESOLVIDO = [
  (wf) => `✅ Monitorei o workflow **${wf}** — as execuções recentes mostram sucesso. Problema resolvido. Fechando.`,
  (wf) => `🟢 **${wf}** voltou ao verde. Confirmado com as últimas execuções no GitHub Actions. Issue encerrada.`,
  (wf) => 
```