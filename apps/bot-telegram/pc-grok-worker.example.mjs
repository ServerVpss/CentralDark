/**
 * PC 24/7 — worker do botão Grok (exemplo)
 *
 * O bot na VPS NÃO chama Grok. Ele só grava/lê:
 *   /tmp/grok_request.json   ← pedido do Telegram
 *   /tmp/grok_response.json  ← resposta pro bot enviar
 *
 * Este script roda no PC (ou na VPS com sshfs / scp loop / agente local)
 * com a key TokenRouter / xAI.
 *
 * Exemplo mínimo (na VPS, se o PC processar via SSH reverso / sync):
 *   node pc-grok-worker.example.mjs
 *
 * Variáveis:
 *   TOKENROUTER_API_KEY, TOKENROUTER_BASE_URL, TOKENROUTER_MODEL
 *   ou XAI_API_KEY
 */
import fs from 'fs';
import path from 'path';

const REQ = process.env.GROK_REQ || '/tmp/grok_request.json';
const RES = process.env.GROK_RES || '/tmp/grok_response.json';
const TR_KEY = process.env.TOKENROUTER_API_KEY || '';
const TR_BASE = (process.env.TOKENROUTER_BASE_URL || 'https://api.tokenrouter.com/v1').replace(/\/$/, '');
const TR_MODEL = process.env.TOKENROUTER_MODEL || 'deepseek/deepseek-v4-pro';
const XAI_KEY = process.env.XAI_API_KEY || '';

let lastId = '';

async function callModel(messages) {
  if (TR_KEY) {
    const r = await fetch(`${TR_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TR_KEY}`,
      },
      body: JSON.stringify({
        model: TR_MODEL,
        messages: [
          {
            role: 'system',
            content:
              'Você é o Grok, parceiro do Pivete no Telegram. PT-BR, curto, humano. Nunca diga Claude.',
          },
          ...messages,
        ],
        max_tokens: 2000,
      }),
    });
    const d = await r.json();
    if (!r.ok) throw new Error(JSON.stringify(d).slice(0, 200));
    const msg = d.choices?.[0]?.message || {};
    return (msg.content || '').trim() || '(vazio)';
  }
  if (XAI_KEY) {
    const r = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${XAI_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.XAI_MODEL || 'grok-3-mini',
        messages: [
          { role: 'system', content: 'Você é Grok, parceiro do Pivete. PT-BR curto.' },
          ...messages,
        ],
        max_tokens: 800,
      }),
    });
    const d = await r.json();
    if (!r.ok) throw new Error(JSON.stringify(d).slice(0, 200));
    return (d.choices?.[0]?.message?.content || '').trim();
  }
  throw new Error('Sem TOKENROUTER_API_KEY nem XAI_API_KEY');
}

async function tick() {
  if (!fs.existsSync(REQ)) return;
  let req;
  try {
    req = JSON.parse(fs.readFileSync(REQ, 'utf8'));
  } catch {
    return;
  }
  if (!req?.id || req.id === lastId) return;
  if (!req.text) return;

  console.log('[pc-grok] request', req.id, String(req.text).slice(0, 80));
  try {
    const hist = Array.isArray(req.history) ? req.history : [];
    const messages = hist.length
      ? hist
      : [{ role: 'user', content: req.text }];
    // garante última user = text
    if (!messages.length || messages[messages.length - 1].content !== req.text) {
      messages.push({ role: 'user', content: req.text });
    }
    const reply = await callModel(messages);
    const out = {
      id: req.id,
      chat_id: req.chat_id,
      reply,
      ts: new Date().toISOString(),
      via: TR_KEY ? 'tokenrouter' : 'xai',
    };
    // write atômico
    const tmp = RES + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(out, null, 2) + '\n');
    fs.renameSync(tmp, RES);
    lastId = req.id;
    console.log('[pc-grok] response ok', req.id, reply.slice(0, 60));
  } catch (e) {
    const out = {
      id: req.id,
      chat_id: req.chat_id,
      reply: 'PC Grok: erro ao processar — ' + e.message,
      ts: new Date().toISOString(),
      error: true,
    };
    fs.writeFileSync(RES, JSON.stringify(out, null, 2) + '\n');
    lastId = req.id;
    console.error('[pc-grok] err', e.message);
  }
}

console.log('[pc-grok] watching', REQ, '→', RES);
setInterval(() => {
  tick().catch((e) => console.error(e));
}, 400);
