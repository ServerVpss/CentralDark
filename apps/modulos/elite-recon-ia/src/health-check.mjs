#!/usr/bin/env node
// 🩸 elite-recon-ia · Health-check do arsenal (5min via PM2 cron).
import fs from 'node:fs'; import path from 'node:path'; import { execSync } from 'node:child_process';
import { chamarGemini } from './gemini-client.mjs';
const LOG_DIR = path.resolve(process.cwd(), 'logs'); fs.mkdirSync(LOG_DIR, { recursive: true });
const DARKAI_URL = process.env.DARKAI_URL || 'http://localhost:8891/health';
const grava = (ev) => {
  fs.appendFileSync(path.join(LOG_DIR, 'health.jsonl'), JSON.stringify({ ts: new Date().toISOString(), ...ev }) + '\n');
  if (!ev.ok) fs.appendFileSync(path.join(LOG_DIR, 'health-erros.log'), `[${new Date().toISOString()}] ${ev.alvo}: ${ev.erro || 'FALHA'}\n`);
};
async function checaPM2(nome) {
  try { const arr = JSON.parse(execSync('pm2 jlist', { encoding: 'utf8', timeout: 5000 }));
    const p = arr.find(x => x.name === nome); if (!p) return { ok: false, erro: 'PROCESSO_INEXISTENTE' };
    return { ok: p.pm2_env?.status === 'online', status: p.pm2_env?.status, restarts: p.pm2_env?.restart_time ?? 0 };
  } catch (e) { return { ok: false, erro: e.message }; }
}
async function checaGemini(modelo) {
  const t0 = Date.now();
  try { const r = await chamarGemini({ modelo, prompt: 'ping', timeoutMs: 15000 }); return { ok: true, ms: Date.now() - t0, texto_len: (r.texto || '').length }; }
  catch (e) { return { ok: false, ms: Date.now() - t0, status: e.status, erro: (e.message || '').slice(0, 200) }; }
}
async function checaDarkai() {
  const t0 = Date.now();
  try { const { request } = await import('undici'); const { statusCode, body } = await request(DARKAI_URL); await body.text(); return { ok: statusCode < 400, status: statusCode, ms: Date.now() - t0 }; }
  catch (e) { return { ok: false, ms: Date.now() - t0, erro: (e.message || '').slice(0, 200) }; }
}
(async () => {
  const t0 = Date.now(); console.log(`🩸 Health · ${new Date().toISOString()}`);
  const [w, pro, fl, dk] = await Promise.all([checaPM2('CentralDark-CondefonteV35'), checaGemini('gemini-2.5-pro'), checaGemini('gemini-2.5-flash'), checaDarkai()]);
  const alvos = [{ alvo: 'condefonte-watcher(PM2)', ...w }, { alvo: 'gemini-2.5-pro', ...pro }, { alvo: 'gemini-2.5-flash', ...fl }, { alvo: 'darkai', ...dk }];
  for (const a of alvos) { grava(a); console.log(`${a.ok?'✅':'❌'} ${a.alvo}${a.status?' status='+a.status:''}${a.ms?' '+a.ms+'ms':''}${a.erro?' erro='+a.erro:''}`); }
  console.log(`⏱️  ${Date.now() - t0}ms`);
})();
