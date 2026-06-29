/**
 * Skill: brainstorming
 *
 * Geração de ideias e soluções criativas via Claude (Anthropic API).
 * Fallback para templates fixos se a API não estiver disponível.
 *
 * Uso via executor:
 *   executor.run('brainstorming', { topic: 'melhorar chat', count: 5, mode: 'livre' })
 *
 * Params:
 *   topic   {string}  — tópico obrigatório
 *   count   {number}  — quantidade de ideias (padrão: 5)
 *   context {string}  — contexto adicional opcional
 *   mode    {string}  — 'scamper' | '5porques' | 'livre' (padrão: 'livre')
 */

'use strict';

// ── Configuração da API (mesmo padrão do unified-bot.cjs) ──────────────────
const LLM_BASE  = (process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com').replace(/\/$/, '');
const LLM_KEY   = process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_API_KEY || '';
const LLM_MODEL = process.env.LLM_MODEL || 'claude-sonnet-4-6';

// ── Helpers ────────────────────────────────────────────────────────────────
function getLlmUrl() {
  return LLM_BASE.endsWith('/v1')
    ? `${LLM_BASE}/messages`
    : `${LLM_BASE}/v1/messages`;
}

function buildSystemPrompt(mode) {
  const base =
    'Você é um facilitador criativo especializado em brainstorming. ' +
    'Responda SEMPRE em português do Brasil. ' +
    'Seja direto, prático e criativo. ' +
    'Não use markdown excessivo — use listas numeradas simples.';

  const modeInstructions = {
    scamper:
      'Use o framework SCAMPER para cada ideia: Substituir, Combinar, Adaptar, ' +
      'Modificar, Outro uso, Eliminar, Reverter. ' +
      'Para cada ideia gerada, indique qual letra do SCAMPER ela representa.',
    '5porques':
      'Use a técnica dos 5 Porquês para aprofundar o problema e gerar ideias de solução. ' +
      'Primeiro identifique a causa raiz em 2-3 linhas, depois liste as ideias que atacam essa raiz.',
    livre:
      'Gere ideias criativas e diversas, sem framework fixo. ' +
      'Misture soluções convencionais com ideias inesperadas ou disruptivas.',
  };

  return `${base}\n\n${modeInstructions[mode] || modeInstructions.livre}`;
}

function buildUserPrompt(topic, count, context, mode) {
  const modeLabel = { scamper: 'SCAMPER', '5porques': '5 Porquês', livre: 'Livre' }[mode] || 'Livre';
  let prompt = `Gere exatamente ${count} ideias criativas sobre o seguinte tópico:\n\n"${topic}"`;
  if (context) prompt += `\n\nContexto adicional: ${context}`;
  prompt += `\n\nModo: ${modeLabel}`;
  prompt +=
    '\n\nFormato de resposta:\n' +
    '1. [ideia]\n2. [ideia]\n...\n\n' +
    'Seja específico e aplicável. Cada ideia em uma linha.';
  return prompt;
}

// ── Chamada à API Anthropic ────────────────────────────────────────────────
async function callAnthropicAPI(topic, count, context, mode) {
  const url = getLlmUrl();
  const systemPrompt = buildSystemPrompt(mode);
  const userPrompt   = buildUserPrompt(topic, count, context, mode);

  const r = await fetch(url, {
    method: 'POST',
    headers: {
      'x-api-key':          LLM_KEY,
      'anthropic-version':  '2023-06-01',
      'content-type':       'application/json',
    },
    body: JSON.stringify({
      model:      LLM_MODEL,
      max_tokens: 1024,
      system:     systemPrompt,
      messages:   [{ role: 'user', content: userPrompt }],
    }),
  });

  const data = await r.json().catch(() => ({}));

  if (data.error) {
    throw new Error(data.error.message || JSON.stringify(data.error));
  }

  const rawText = data.content?.[0]?.text;
  if (!rawText) throw new Error('Resposta vazia da API');

  return rawText;
}

// ── Parser da resposta da API → lista de ideias ────────────────────────────
function parseIdeas(rawText, count) {
  const lines = rawText
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && /^\d+\./.test(l))
    .map(l => l.replace(/^\d+\.\s*/, '').trim())
    .filter(Boolean)
    .slice(0, count);

  if (lines.length === 0) {
    // Fallback: qualquer linha não vazia
    return rawText
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)
      .slice(0, count);
  }

  return lines;
}

// ── Templates de fallback (sem IA) ─────────────────────────────────────────
const FALLBACK_FRAMEWORKS = {
  scamper: {
    name: 'SCAMPER',
    questions: [
      'Substituir? — O que pode ser trocado?',
      'Combinar? — O que pode ser unido?',
      'Adaptar? — O que pode ser ajustado?',
      'Modificar? — O que pode ser ampliado ou reduzido?',
      'Outro uso? — Como usar de outra forma?',
      'Eliminar? — O que pode ser removido?',
      'Reverter? — O que pode ser invertido?',
    ],
  },
  '5porques': {
    name: '5 Porquês',
    questions: [
      'Por que esse problema existe?',
      'Por que essa causa ocorre?',
      'Por que esse fator persiste?',
      'Por que essa raiz não foi atacada?',
      'Qual é a causa fundamental?',
    ],
  },
  livre: {
    name: 'Mapa Mental',
    questions: [
      'Qual é a ideia central?',
      'Quais são os ramos principais?',
      'Quais sub-ramos surgem?',
      'Que conexões inesperadas existem?',
      'Quais ideias têm maior impacto?',
    ],
  },
};

function buildFallback(topic, count, context, mode) {
  const fw = FALLBACK_FRAMEWORKS[mode] || FALLBACK_FRAMEWORKS.livre;
  return {
    topic,
    mode,
    framework:  fw.name,
    ideas:      fw.questions.slice(0, count).map((q, i) => ({
      step:      i + 1,
      idea:      `${q} → aplicado a "${topic}"`,
      source:    'template',
    })),
    context:    context || null,
    aiReady:    false,
    note:       'API Anthropic indisponível — usando templates locais.',
    source:     'fallback',
  };
}

// ── Execução principal ─────────────────────────────────────────────────────
module.exports = {
  name:        'brainstorming',
  description: 'Geração de ideias e soluções criativas com IA (Claude)',
  category:    'ai',

  async execute(params = {}) {
    const { topic, count = 5, context = '', mode = 'livre' } = params;

    if (!topic) {
      return { error: 'Informe um tópico: { topic: "..." }' };
    }

    const safeCount = Math.min(Math.max(Number(count) || 5, 1), 20);
    const safeMode  = ['scamper', '5porques', 'livre'].includes(mode) ? mode : 'livre';

    // ── Tenta chamada real à API ───────────────────────────────────────────
    if (LLM_KEY) {
      try {
        const rawText = await callAnthropicAPI(topic, safeCount, context, safeMode);
        const ideas   = parseIdeas(rawText, safeCount);

        return {
          topic,
          mode:      safeMode,
          model:     LLM_MODEL,
          ideas:     ideas.map((idea, i) => ({
            step:    i + 1,
            idea,
            source:  'ai',
          })),
          context:   context || null,
          aiReady:   true,
          source:    'anthropic',
        };
      } catch (err) {
        // Loga o erro sem expor a key
        console.error('[brainstorming] Falha na API Anthropic:', err.message);
        // Cai no fallback abaixo
      }
    }

    // ── Fallback: templates fixos ──────────────────────────────────────────
    return buildFallback(topic, safeCount, context, safeMode);
  },
};
