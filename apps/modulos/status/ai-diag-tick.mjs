#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════
// Setor de Inteligência — Coletor de Diagnóstico (v2)
// ═══════════════════════════════════════════════════════════════════
// Gera ai-diag.json a cada tick (60s via PM2 cron_restart).
// Desacoplado: cada teste é independente. Se um falha, os outros seguem.
// Fallback: se LovableProxy dedicado não existe, tenta ArsenalProxy.
// Se não há chave, marca "aguardando_chave" em vez de fingir erro.
// ═══════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execSync } from 'node:child_process';

const OUT = path.join(process.cwd(), 'ai-diag.json');
const KEY = process.env.LOVABLE_API_KEY || '';
const TEM_CHAVE = Boolean(KEY && KEY.length > 10);

const PROXIES = [
  { nome: 'CentralDark-LovableProxy', url: 'http://127.0.0.1:3102' },
  { nome: 'CentralDark-ArsenalProxy', url: 'http://127.0.0.1:3101' },
];
const GATEWAY = 'https://ai.gateway.lovable.dev';

async function timed(label, fn) {
  const t = Date.now();
  try { const r = await fn(); return { label, ok: true, ms: Date.now() - t, ...r }; }
  catch (e) { return { label, ok: false, ms: Date.now() - t, erro: String(e.message || e).slice(0, 300) }; }
}

function pm2Info() {
  try { return JSON.parse(execSync('pm2 jlist 2>/dev/null', { encoding: 'utf8' }) || '[]'); }
  catch { return []; }
}

function encontrarProxyAtivo(procs) {
  for (const p of PROXIES) {
    const proc = procs.find(x => x.name === p.nome);
    if (proc && proc.pm2_env?.status === 'online') return { ...p, pid: proc.pid };
  }
  return null;
}

function lerErrosPM2(nome, linhas = 15) {
  const errLog = path.join(os.homedir(), '.pm2', 'logs', nome + '-error.log');
  if (!fs.existsSync(errLog)) return { existe: false, arquivo: errLog, linhas: [] };
  try {
    const buf = fs.readFileSync(errLog, 'utf8').trim().split('\n').filter(Boolean);
    return { existe: true, arquivo: errLog, linhas: buf.slice(-linhas) };
  } catch (e) { return { existe: true, arquivo: errLog, linhas: [], erro: e.message }; }
}

async function testeProxyLocal(proxyAtivo) {
  return timed('proxy /health (local)', async () => {
    if (!proxyAtivo) throw new Error('nenhum proxy Lovable/Arsenal online no PM2');
    const r = await fetch(proxyAtivo.url + '/health', { signal: AbortSignal.timeout(5000) });
    const txt = await r.text();
    let corpo; try { corpo = JSON.parse(txt); } catch { corpo = txt.slice(0, 200); }
    return { proxy: proxyAtivo.nome, url: proxyAtivo.url, status: r.status, corpo };
  });
}

async function testeGatewayDireto() {
  return timed('gateway publico (ping)', async () => {
    const r = await fetch(GATEWAY + '/', { signal: AbortSignal.timeout(5000) });
    return { status: r.status, alcancavel: r.status < 500 };
  });
}

async function testeChatCompleto(proxyAtivo) {
  return timed('chat completion end-to-end', async () => {
    if (!TEM_CHAVE) throw new Error('aguardando_chave: LOVABLE_API_KEY nao configurada no PM2');
    if (!proxyAtivo) throw new Error('sem proxy online — nao ha por onde rotear');
    const r = await fetch(proxyAtivo.url + '/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + KEY },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [{ role: 'user', content: 'responda apenas: ok' }],
        max_tokens: 8,
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok) throw new Error('HTTP ' + r.status + ': ' + (await r.text()).slice(0, 200));
    const j = await r.json();
    return {
      proxy: proxyAtivo.nome, status: r.status,
      resposta: j.choices?.[0]?.message?.content?.trim() || '(sem texto)',
      tokens: j.usage || {}, modelo: j.model || 'desconhecido',
    };
  });
}

const procs = pm2Info();
const proxyAtivo = encontrarProxyAtivo(procs);
const nomeProxyParaLogs = proxyAtivo?.nome || 'CentralDark-LovableProxy';

const doc = {
  gerado_em: new Date().toISOString(),
  gerado_em_br: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
  versao_tick: '2.0',
  ambiente: {
    tem_chave_lovable: TEM_CHAVE,
    proxy_ativo: proxyAtivo ? { nome: proxyAtivo.nome, url: proxyAtivo.url } : null,
    proxies_conhecidos: PROXIES.map(p => {
      const proc = procs.find(x => x.name === p.nome);
      return { nome: p.nome, status: proc?.pm2_env?.status || 'ausente' };
    }),
  },
  testes: {
    proxy: await testeProxyLocal(proxyAtivo),
    gateway: await testeGatewayDireto(),
    chat: await testeChatCompleto(proxyAtivo),
    erros_recentes: { label: 'logs de erro (' + nomeProxyParaLogs + ')', ...lerErrosPM2(nomeProxyParaLogs, 15) },
  },
};

const t = doc.testes;
const ok = [t.proxy.ok, t.gateway.ok, t.chat.ok];
doc.placar = {
  ok: ok.filter(Boolean).length, total: ok.length,
  saude: ok.every(Boolean) ? 'saudavel' : ok.some(Boolean) ? 'degradado' : 'critico',
};

fs.writeFileSync(OUT, JSON.stringify(doc, null, 2));
console.log('[ai-diag v2] ' + doc.placar.saude + ' | chave:' + (TEM_CHAVE ? 'OK' : 'FALTA') + ' | proxy:' + (proxyAtivo?.nome || 'NENHUM') + ' | ' +
  Object.entries(t).map(([k, v]) => k + ':' + (v.ok ? 'OK' : 'FAIL')).join(' '));
