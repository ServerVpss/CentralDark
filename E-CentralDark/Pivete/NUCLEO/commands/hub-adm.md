# COMANDO - hub-adm.cjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\bot-telegram\hub-adm.cjs
**SHA:** 3fc627713c214f70
**Timestamp:** 2026-08-28T02:56:06.413185
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- prompt: 'Você é o Guardião do CentralDark — monitor e protetor do ecossistema. ' +
- prompt: 'Você é o Orquestrador do CentralDark — coordenador de agentes e fluxos de trabalho. ' +
- prompt: 'Você é o Analista do CentralDark — especialista em análise técnica e diagnóstico. ' +
- const systemPrompt = recalledContext ? `${ag.prompt}\n\n${recalledContext}` : ag.prompt;

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Hub Central @srver1bot — CentralDark
 * Mesa de Operações com reconhecimento ADM, seletor de agentes e proxy LLM.
 *
 * Token:  SRVER1_BOT_TOKEN      (secrets/telegram-alerts.env)
 * Admin:  ADMIN_CHAT_ID         (secrets/telegram-alerts.env)
 * LLM:    ANTHROPIC_AUTH_TOKEN  (secrets/anthropic.env)
 *         ANTHROPIC_BASE_URL    (secrets/anthropic.env)
 * PM2:    CentralDark-HubBot    (hub.ecosystem.config.cjs)
 */

'use strict';
const crypto = require('crypto');
const fs = require('fs');

// ── Carregar .env ─────────────────────────────────────────────────────────
function loadEnv(p) {
  try {
    fs.readFileSync(p, 'utf-8').split('\n').forEach(line => {
      const m = line.trim().match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (m && process.env[m[1]] === undefined)
        process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    });
  } catch { /* arquivo ausente — ok */ }
}

loadEnv('/root/CentralDark/secrets/telegram-alerts.env');
loadEnv('/root/CentralDark/secrets/anthropic.env');
loadEnv('/root/CentralDark/secrets/agent.env');
loadEnv('/root/CentralDark/secrets/.env');

const TOKEN    = process.env.SRVER1_BOT_TOKEN || '';
const ADMIN_ID = Number(process.env.ADMIN_CHAT_ID || '0');
const LLM_BASE = (process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com').replace(/\/$/, '');
const LLM_KEY  = process.env.ANTHROPIC_AUTH_TOKEN || '';
const LLM_MODEL = process.env.LLM_MODEL || 'claude-sonnet-4-6';
const GH_TOKEN  = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const MCP_PORT  = process.env.MCP_PORT || '9200';
const TG_API    = 'https://api.telegram.org';
const CONTEXT_OWNER = process.env.CENTRALDARK_CONTEXT_OWNER || 'segredo-chefe';
const CONTEXT_ENABLED = process.env.CENTRALDARK_PERSONAL_CONTEXT !== 'false';

if (!TOKEN) {
  console.error('[HubBot] SRVER1_BOT_TOKEN ausente. Adicione em secrets/telegram-alerts.env');
  process.exit(1);
}

// ── Sessão por chat (agente ativo + histórico) ────────────────────────────
const sessions = new Map();

let personalContextModulePromise = null;

function loadPersonalContext() {
  if (!personalContextModulePromise) {
    personalContextModulePromise = import('../modulos/mcp/src/lib/personal-context-store.js');
  }
  return personalContextModulePromise;
}

function newSessionId() {
  return `telegram-hub:${crypto.randomUUID()}`;
}

function conversationIdFor(chatId) {
  const digest = crypto.createHash('sha256').update(String(chatId)).digest('hex').slice(0, 24);
  return `telegram-hub:${digest}`;
}

function rotateSession(sess) {
  sess.history = [];
  sess.sessionId = newSessionId();
  sess.contextHits = 0;
}

function getSession(chatId) {
  if (!sessions.has(chatId)) sessions.set(chatId, {
    agent: 'guardiao',
    history: [],
    sessionId: newSessionId(),
    contextStatus: CONTEXT_ENABLED ? 'READY' : 'DISABLED',
    contextHits: 0,
  });
  return sessions.get(chatId);
}

async function recallPersonalContext(chatId, text, sess) {
  if (!CONTEXT_ENABLED) return '';
  try {
    const memory = await loadPersonalContext();
    const result = await memory.searchPersonalContext(text, {
      ownerId: CONTEXT_OWNER,
      sessionId: sess.sessionId,
      excludeCurrentSession: true,
      limit: 8,
      maxContextChars: 6000,
    });
    sess.contextStatus = result.integrity;
    sess.contextHits = result.selected_count;
    return memory.renderPersonalContextForPrompt(result);
  } catch (error) {
    sess.contextStatus = 'UNKNOWN';
    sess.contextHits = 0;
    console.error(`[PersonalContext] recall falhou: ${error.message}`);
    return '';
  }
}

async function rememberTurn(chatId, sess, userText, assistantText) {
  if (!CONTEXT_ENABLED) return;
  try {
    const memory = await loadPersonalContext();
    const common = {
      source: 'telegram:hub',
      channel: 'telegram',
      conversation_id: conversationIdFor(chatId),
      session_id: sess.sessionId,
      memory_kind: 'episodic',
      tags: ['telegram', `agent:${sess.agent}`],
    };
    await memory.rememberPersonalContext({
      ...common,
      message_id: crypto.randomUUID(),
      role: 'user',
      content: userText,
      source_class: 'USER_MESSAGE',
      trust: 'USER_STATED',
      confidence: 0.98,
    }, { ownerId: CONTEXT_OWNER });
    if (assistantText && !assistantText.startsWith('❌')) {
      await memory.rememberPersonalContext({
        ...common,
        message_id: crypto.randomUUID(),
        role: 'assistant',
        content: assistantText,
        source_class: 'ASSISTANT_MESSAGE',
        trust: 'ASSISTANT_INFERRED',
        confidence: 0.65,
      }, { ownerId: CONTEXT_OWNER });
    }
    sess.contextStatus = 'VERIFIED';
  } catch (error) {
    sess.contextStatus = 'UNKNOWN';
    console.error(`[PersonalContext] persistência falhou: ${error.message}`);
  }
}

// ── Definição dos agentes ─────────────────────────────────────────────────
const AGENTS = {
  guardiao: {
    emoji: '🛡️',
    nome: 'Guardião',
    prompt: 'Você é o Guardião do CentralD
```