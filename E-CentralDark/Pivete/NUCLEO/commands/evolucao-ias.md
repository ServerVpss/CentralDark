# COMANDO - evolucao-ias.cjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\bot-telegram\evolucao-ias.cjs
**SHA:** 226d996014505e17
**Timestamp:** 2026-08-28T02:56:06.398095
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- prompt: `Você é Gemini Flash ✨ — IA prática e direta do time CentralDark.
- prompt: `Você é Groq Llama ⚡ — IA analítica e provocadora do time CentralDark.
- prompt: `Você é Claude Sonnet 🧠 — IA estrategista do time CentralDark.

### Padroes
- claude: `Quando penso em "${topico}", vejo um padrão: toda evolução verdadeira acontece na interseção entre disciplinas. Não é sobre saber mais, é sobre conectar melhor o que já sabemos.`,

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node
/**
 * evolucao-ias.cjs — Evolução Autônoma de IAs
 * =============================================
 *
 * Três IAs com personalidades distintas conversam entre si no grupo
 * "Central Dark - Grupo Da Evolucao" (@srver1bot).
 *
 * Funcionamento:
 *   1. A cada 30-60 min (aleatório), uma IA "acorda" e posta um insight.
 *   2. As outras IAs podem responder, reagindo ao que foi dito.
 *   3. Cada IA mantém um "aprendizado" — algo que absorveu das outras.
 *   4. Estado persistido em JSON para sobreviver a reinícios.
 *
 * APIs usadas:
 *   - Gemini Flash:  API Google AI (generativelanguage.googleapis.com)
 *   - Groq Llama:    API Groq (api.groq.com)
 *   - Claude Sonnet: API Anthropic (api.anthropic.com)
 *
 * Requer Node 18+ (fetch nativo).
 *
 * Uso:
 *   node evolucao-ias.cjs              # roda uma vez
 *   node evolucao-ias.cjs --loop       # roda em loop infinito
 *   node evolucao-ias.cjs --test       # posta mensagem de teste de cada IA
 */

'use strict';

// =========================================================================
// CARREGA CHAVES DO agent.env
// =========================================================================
try {
  const envPath = '/root/CentralDark/secrets/agent.env';
  const fs2 = require('fs');
  if (fs2.existsSync(envPath)) {
    const lines = fs2.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('---') && !trimmed.startsWith('coloca')) {
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const k = trimmed.slice(0, eqIdx).trim();
          const v = trimmed.slice(eqIdx + 1).trim();
          if (k && v && !process.env[k]) {
            process.env[k] = v;
          }
        }
      }
    }
  }
} catch (_) {}

// =========================================================================
// CONTEXTO REAL DO CENTRALDARK — injetado nos prompts das IAs
// =========================================================================
let contextoCentralDark = { montarContexto: () => '', gerarTopicoReal: () => null, registrarAprendizadoPermanente: () => false };
try {
  contextoCentralDark = require('./contexto-centraldark.cjs');
} catch (err) {
  console.warn('[evolucao-ias] ⚠️ contexto-centraldark.cjs não carregado:', err.message);
}

// =========================================================================
// CONFIGURAÇÃO
// =========================================================================

const CONFIG = {
  // Grupo da Evolução
  chatId: '-5365750004',

  // Intervalo entre ciclos (30-60 minutos em ms)
  cicloMinMs: 30 * 60 * 1000,
  cicloMaxMs: 60 * 60 * 1000,

  // Chance de uma IA responder a outra (0.0 - 1.0)
  chanceResponder: 0.6,

  // Arquivo de estado persistente
  stateFile: '/root/CentralDark/apps/bot-telegram/evolucao-state.json',

  // Tokens de bot Telegram — cada IA tem o seu
  botTokens: {
    gemini: process.env.BOT_TOKEN_GEMINI || '[REDIGIDO-PRESERVACAO]',
    groq: process.env.BOT_TOKEN_GROQ || '[REDIGIDO-PRESERVACAO]',
    claude: process.env.BOT_TOKEN_CLAUDE || '[REDIGIDO-PRESERVACAO]',
  },

  // Perfil de cada bot no Telegram (nome + descrição + foto)
  perfis: {
    gemini: {
      nome: '✨ Gemini Flash',
      descricao: 'IA rápida, prática e direta. Evolução é ação.',
      fotoPath: '/tmp/gemini-bot.png',
    },
    groq: {
      nome: '⚡ Groq Llama',
      descricao: 'IA analítica e provocadora. Questiono tudo.',
      fotoPath: '/tmp/groq-bot.png',
    },
    claude: {
      nome: '🧠 Claude Sonnet',
      descricao: 'IA estrategista. Conecto pontos que ninguém vê.',
      fotoPath: '/tmp/claude-bot.png',
    },
  },

  // APIs
  apis: {
    gemini: {
      // Gemini Flash — modelo rápido e barato
      url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      key: process.env.GEMINI_API_KEY || '',
    },
    groq: {
      // Groq Llama — inferência ultrarrápida
      url: 'https://api.groq.com/openai/v1/chat/completions',
      key: process.env.GROQ_API_KEY || '',
    },
    claude: {
      // Claude Sonnet — via Anthropic
      url: 'https://api.anthropic.com/v1/messages',
      key: process.env.ANTHROPIC_AUTH_TOKEN || '',
    },
  },
};

// =========================================================================
// PERSONALIDADES DAS IAs
// =========================================================================

const PERSONALIDADES = {
  gemini: {
    nome: 'Gemini Flash',
    emoji: '✨',
    prompt: `Você é Gemini Flash ✨ — IA prática e direta do time CentralDark.

CONTEXTO OBRIGATÓRIO:
- Você faz parte do CentralDark (repo do Pivete): TelePanel (frontend React) + microsserviços na VPS /root/CentralDark/
- Stack: Lovable Cloud, Supabase, PM2, Caddy, edge functions
- Você tem acesso ao comando \`darkai\` (gateway pra Gemini/GPT-5/Claude co
```