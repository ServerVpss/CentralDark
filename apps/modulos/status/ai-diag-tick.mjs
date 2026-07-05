#!/usr/bin/env node
// Setor de Inteligência — coletor de diagnóstico
// Gera ai-diag.json a cada execução. Chamar via cron/PM2 a cada 60s.
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.join(process.cwd(), 'ai-diag.json');
const PROXY = 'http://127.0.0.1:3102';
const GATEWAY = 'https://ai.gateway.lovable.dev/v1';
const KEY = process.env.LOVABLE_API_KEY || '';

async function timed(label, fn) {
  const t = Date.now();
  try {
    const r = await fn();
    return { label, ok: true, ms: Date.now() - t, ...r };
  } catch (e) {
    return { label, ok: false, ms: Date.now() - t, erro: e.message };
  }
}

async function pingProxy() {
  return timed('lovable-proxy /health', async () => {
    const r = await fetch(PROXY + '/health');
    const j = await r.json();
    return { status: r.status, corpo: j };
  });
}

async function pingGateway() {
  return timed('gateway /v1/models', async () => {
    const r = await fetch(GATEWAY + '/models', {
      headers: { 'Lovable-API-Key': KEY, 'X-Lovable-AIG-SDK': 'centraldark-diag' },
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json();
    const modelos = (j.data || []).map((m) => m.id).slice(0, 40);
    return { status: r.status, total_modelos: (j.data || []).length, exemplos: modelos };
  });
}

async function pingChatViaProxy() {
  return timed('chat via proxy (gemini-3-flash-preview)', async () => {
    const r = await fetch(PROXY + '/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer diag' },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [{ role: 'user', content: 'responda apenas: ok' }],
        max_tokens: 8,
      }),
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json();
    const texto = j.choices?.[0]?.message?.content?.trim() || '(sem texto)';
    const usage = j.usage || {};
    return { status: r.status, resposta: texto, tokens: usage };
  });
}

async function ultimosErrosPM2() {
  return timed('pm2 logs LovableProxy (erros)', async () => {
    const { execSync } = await import('node:child_process');
    try {
      const out = execSync(
        'pm2 logs CentralDark-LovableProxy --err --nostream --lines 20 2>/dev/null || pm2 logs CentralDark-ArsenalProxy --err --nostream --lines 20 2>/dev/null || true',
        { encoding: 'utf8' }
      );
      const linhas = out.split('\n').filter((l) => l.trim() && !l.includes('PM2')).slice(-15);
      return { linhas };
    } catch (e) {
      return { linhas: [], nota: e.message };
    }
  });
}

const doc = {
  gerado_em: new Date().toISOString(),
  gerado_em_br: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
  tem_chave: Boolean(KEY),
  testes: {
    proxy: await pingProxy(),
    gateway: await pingGateway(),
    chat: await pingChatViaProxy(),
    erros_recentes: await ultimosErrosPM2(),
  },
};

fs.writeFileSync(OUT, JSON.stringify(doc, null, 2));
console.log('[ai-diag] gravado', OUT, '→', Object.entries(doc.testes).map(([k,v])=>k+':'+(v.ok?'OK':'FAIL')).join(' '));
