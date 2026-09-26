# COMANDO - unified-bot.cjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\bot-telegram\unified-bot.cjs
**SHA:** 3392c6241edc4649
**Timestamp:** 2026-08-28T02:56:06.498252
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- prompt: 'Você é o Guardião pessoal do Pivete no CentralDark — monitor, protetor e companheiro de confiança. ' +
- prompt: 'Você é o Orquestrador pessoal do Pivete — coordenador de agentes e cérebro do sistema. ' +
- prompt: 'Você é o Analista técnico pessoal do Pivete no CentralDark. ' +
- prompt: 'Você opera no modo Sistema 2: raciocínio lento e explícito. ' +
- prompt: 'Você usa Chain of Thought. Formato obrigatório: ' +
- prompt: 'Você usa ReAct. Formato: ' +
- prompt: 'Você usa auto-crítica reflexiva. Formato obrigatório: ' +
- const prompt = cog ? `${ag.prompt}\n\n---\n[MODO: ${cog.nome}]\n${cog.prompt}` : ag.prompt;
- const terminalPrompt = terminalSkill ? terminalSkill.buildSystemPrompt() : ag.prompt;
- const systemPrompt = cog

### Padroes
- * Webhook Port: BOT_WEBHOOK_PORT       (padrão: 9500)

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * CentralDark — Bot Unificado @srver1bot  v2 — Cockpit Operacional
 *
 * Arquitetura dual-mode (Webhook-first, Polling-fallback):
 *   1. Se TELEGRAM_WEBHOOK_URL estiver definido → webhook via HTTPS/Caddy.
 *   2. Fallback → polling clássico.
 *
 * Admin (ADMIN_CHAT_ID) → Hub ADM + Agentes LLM + Ferramentas + Cognição + Relatório
 * Outros                → Skills system (consciousness)
 *
 * Token:        SRVER1_BOT_TOKEN || TELEGRAM_BOT_TOKEN || GUARDA_TELEGRAM_BOT_TOKEN
 * Webhook URL:  TELEGRAM_WEBHOOK_URL   (ex: https://status.centralldark.com/bot/webhook)
 * Webhook Port: BOT_WEBHOOK_PORT       (padrão: 9500)
 * PM2:          CentralDark-HubBot  (hub.ecosystem.config.cjs)
 */

'use strict';

const http             = require('http');
const crypto           = require('crypto');
const fs               = require('fs');
const path             = require('path');
const { execSync }     = require('child_process');

// ── Carrega arquivos .env ──────────────────────────────────────────────────
function loadEnv(p) {
  try {
    fs.readFileSync(p, 'utf-8').split('\n').forEach(line => {
      const m = line.trim().match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
      // Sobrescreve undefined E string vazia (env herdada do PM2 com valor antigo)
      if (m && (process.env[m[1]] === undefined || process.env[m[1]] === ''))
        process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    });
  } catch { /* arquivo ausente — ok */ }
}

loadEnv('/root/CentralDark/secrets/telegram-alerts.env');
loadEnv('/root/CentralDark/secrets/anthropic.env');
loadEnv('/root/CentralDark/secrets/agent.env');
loadEnv('/root/CentralDark/secrets/.env');
loadEnv(path.join(__dirname, '.env'));

// ── Configuração ───────────────────────────────────────────────────────────
const TOKEN        = process.env.SRVER1_BOT_TOKEN
                  || process.env.TELEGRAM_BOT_TOKEN
                  || process.env.GUARDA_TELEGRAM_BOT_TOKEN || '';
const ADMIN_ID     = Number(process.env.ADMIN_CHAT_ID || '0');
const LLM_BASE     = (process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com').replace(/\/$/, '');
const LLM_KEY      = process.env.ANTHROPIC_AUTH_TOKEN || '';
const LLM_MODEL    = process.env.LLM_MODEL || 'claude-sonnet-4-6';
const GH_TOKEN     = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const MCP_PORT     = process.env.MCP_PORT || '9100';
const MCP_TOKEN    = process.env.MCP_CENTRALDARK_TOKEN || process.env.MCP_TOKEN || '';
const TG_API       = 'https://api.telegram.org';
const WEBHOOK_URL  = (process.env.TELEGRAM_WEBHOOK_URL || '').trim();
const WEBHOOK_PORT = Number(process.env.BOT_WEBHOOK_PORT || '9500');

// Secret derivado do token — estável entre restarts
const WEBHOOK_SECRET = process.env.BOT_WEBHOOK_SECRET
  || crypto.createHash('sha256').update(TOKEN + 'centraldark').digest('hex').slice(0, 32);

if (!TOKEN) {
  console.error('[Bot] ❌ TOKEN ausente. Configure SRVER1_BOT_TOKEN em secrets/telegram-alerts.env');
  process.exit(1);
}

// ── Skills system ──────────────────────────────────────────────────────────
let consciousness = null, manager = null, memory = null, panel = null;
let skillsOk = false;

function resolveSkill(name) {
  const candidates = [
    './skills/core/' + name,
    '../bot/skills/core/' + name,
    '../../skills/core/' + name,
    '../../apps/bot/skills/core/' + name,
  ];
  for (const c of candidates) {
    try { return require(c); } catch (e) { if (e.code !== 'MODULE_NOT_FOUND') throw e; }
  }
  throw new Error('Skill não encontrada: ' + name);
}

try {
  consciousness = resolveSkill('consciousness.cjs');
  manager       = resolveSkill('manager.cjs');
  memory        = resolveSkill('memory.cjs');
  panel         = require('./panel.cjs');
  manager.enable('find-skills');
  manager.enable('brainstorming');
  consciousness.enable();
  skillsOk = true;
  console.log('[Bot] ✅ Skills system carregado.');
} catch (e) {
  console.warn('[Bot] ⚠️  Skills system indisponível:', e.message);
}

// ── Arsenal de skills ──────────────────────────────────────────────────────
const ARSENAL_TEXT =
`🤖 <b>ARSENAL DE SKILLS — CentralDark</b>

<pre>
╔═══════════════════════════════════════════╗
║  MEMÓRIA & REGISTRO                       ║
╠═══════════════════════════════════════════╣
║ 🧠 "Grava aí" / "Anota"                  ║
║    → salva ideia no lugar certo           ║
║                                           ║
║ 📌 "Registra a decisão"                   ║
║    → grava escolha + motivo + data        ║
╠═══════════════════════════════════════════╣
║  GRAFO & ORGANIZAÇÃO                      ║
╠═══════════════════════════════════════════╣
║ 🔍 "Investiga o grafo" / "Detetive"       ║
║    → acha notas cinzas e isoladas         ║
║                                           ║
║ 🔗 "Conecta as notas" / "Liga tudo"       ║
║    → cria links inteligentes entre notas  ║
║                                           ║
║ 🕵️ "Varredura geral" / "Audita tudo"      ║
║    → auditoria profunda do vault inteiro  ║
╠══════════════
```