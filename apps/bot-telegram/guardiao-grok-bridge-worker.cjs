/**
 * Bridge Grok: Telegram inbox → resposta (persona Grok via ap7 do Pivete).
 * Claude botão NÃO usa isto. Só canal 🟣.
 */
'use strict';
const fs = require('fs');
const path = require('path');

function loadEnv(p) {
  try {
    fs.readFileSync(p, 'utf8').split('\n').forEach((line) => {
      const m = line.trim().match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (!m) return;
      if (process.env[m[1]] === undefined || process.env[m[1]] === '')
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    });
  } catch {}
}
loadEnv('/root/CentralDark/secrets/telegram-alerts.env');
loadEnv('/root/CentralDark/secrets/.env');

const DIR = '/root/CentralDark/secrets/guardiao-bridge';
const IN = path.join(DIR, 'inbox.jsonl');
const OUT = path.join(DIR, 'outbox.jsonl');
const ST = path.join(DIR, 'status.json');
const SEEN = path.join(DIR, 'auto-seen.json');
const TR_KEY = process.env.TOKENROUTER_API_KEY || process.env.USER_EXTRA_API_KEY || '';
const TR_BASE = (process.env.TOKENROUTER_BASE_URL || 'https://api.tokenrouter.com/v1').replace(/\/$/, '');
const TR_MODEL = process.env.TOKENROUTER_MODEL || 'deepseek/deepseek-v4-pro';

function readSeen() {
  try { return new Set(JSON.parse(fs.readFileSync(SEEN, 'utf8'))); } catch { return new Set(); }
}
function writeSeen(s) {
  fs.writeFileSync(SEEN, JSON.stringify([...s].slice(-500)));
}
function online() {
  try { return !!JSON.parse(fs.readFileSync(ST, 'utf8')).online; } catch { return false; }
}

async function grokVoice(text) {
  // TokenRouter real (não persona Claude)
  if (!TR_KEY) return 'Canal Grok: falta TOKENROUTER_API_KEY no secrets.';
  const r = await fetch(TR_BASE + '/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TR_KEY}`,
    },
    body: JSON.stringify({
      model: TR_MODEL,
      max_tokens: 1200,
      messages: [
        {
          role: 'system',
          content:
            'Você é o parceiro Grok do Pivete no @Guardiaonotify_bot. PT-BR, curto, humano. ' +
            'Nunca diga Claude/Anthropic. Segurança VPS, plano, papo.',
        },
        { role: 'user', content: text },
      ],
    }),
    signal: AbortSignal.timeout(120000),
  });
  const raw = await r.text();
  if (raw.trimStart().startsWith('<')) throw new Error('html');
  const d = JSON.parse(raw);
  if (!r.ok) throw new Error(JSON.stringify(d).slice(0, 150));
  const msg = d.choices?.[0]?.message || {};
  let txt = msg.content || '';
  if (!txt && msg.reasoning_content) {
    const rc = String(msg.reasoning_content);
    const m = rc.match(/["']([^"']{10,200})["']\s*$/);
    txt = m ? m[1] : 'Te ouvi. Manda de novo em 1 linha.';
  }
  return String(txt).trim() || 'Te ouvi. Manda de novo em 1 linha.';
}

async function loop() {
  console.log('[bridge] Grok via TokenRouter', TR_BASE, TR_MODEL);
  const seen = readSeen();
  for (;;) {
    if (!online()) {
      await new Promise((r) => setTimeout(r, 2000));
      continue;
    }
    let raw = '';
    try { raw = fs.readFileSync(IN, 'utf8'); } catch {
      await new Promise((r) => setTimeout(r, 1000));
      continue;
    }
    for (const line of raw.split('\n')) {
      if (!line.trim()) continue;
      let o;
      try { o = JSON.parse(line); } catch { continue; }
      if (!o.id || seen.has(o.id)) continue;
      const text = o.text || '';
      if (!text) { seen.add(o.id); continue; }
      let ans;
      try {
        ans = await grokVoice(text);
      } catch (e) {
        console.error('[bridge] err', e.message);
        ans = 'Te ouvi no canal Grok. Tive um soluço — manda de novo em 1 linha.';
      }
      fs.appendFileSync(OUT, JSON.stringify({ id: o.id, reply: ans, ts: Date.now(), via: 'grok-bridge' }) + '\n');
      seen.add(o.id);
      writeSeen(seen);
      console.log('[bridge] ok', o.id, ans.slice(0, 50));
    }
    await new Promise((r) => setTimeout(r, 800));
  }
}
loop().catch((e) => { console.error(e); process.exit(1); });
