#!/usr/bin/env node
// 🩸 elite-recon-ia · Varredura paralela Gemini 2.5 Pro + Flash.
import fs from 'node:fs'; import path from 'node:path';
import { chamarGemini } from './gemini-client.mjs';
import { bucketFor, chamarComBackoff } from './rate-limiter.mjs';
const LOG_DIR = path.resolve(process.cwd(), 'logs'); fs.mkdirSync(LOG_DIR, { recursive: true });
const MODELOS = [
  { nome: 'gemini-2.5-pro',   rpm: 5,  burst: 2 },
  { nome: 'gemini-2.5-flash', rpm: 15, burst: 5 },
];
const logL = (ev) => fs.appendFileSync(path.join(LOG_DIR, 'recon.jsonl'), JSON.stringify({ ts: new Date().toISOString(), ...ev }) + '\n');
async function varrer(prompt, { system } = {}) {
  console.log(`\n🩸 Varredura paralela · ${MODELOS.length} modelos · ${prompt.length} chars\n`);
  return Promise.all(MODELOS.map(async (m) => {
    const b = bucketFor(m.nome, m); const t0 = Date.now();
    const r = await chamarComBackoff(b, () => chamarGemini({ modelo: m.nome, prompt, system }));
    const ms = Date.now() - t0;
    if (r.ok) { console.log(`✅ [${m.nome}] ${ms}ms tentativa ${r.tentativa}`); console.log('─'.repeat(60)); console.log(r.res.texto); console.log('─'.repeat(60));
      logL({ modelo: m.nome, ok: true, ms, tentativa: r.tentativa, uso: r.res.uso, prompt_len: prompt.length }); }
    else { console.log(`❌ [${m.nome}] ${r.erro} (status ${r.status ?? '-'})`);
      logL({ modelo: m.nome, ok: false, ms, tentativa: r.tentativa, erro: r.erro, status: r.status }); }
    return { modelo: m.nome, ...r, ms };
  }));
}
const args = process.argv.slice(2);
if (!args.length) { console.log('uso: node src/recon.mjs "<prompt>" | --arquivo alvo.txt [--system "..."] | --lote prompts.jsonl'); process.exit(1); }
let prompt = '', system;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--arquivo') prompt = fs.readFileSync(args[++i], 'utf8');
  else if (args[i] === '--system') system = args[++i];
  else if (args[i] === '--lote') { for (const l of fs.readFileSync(args[++i], 'utf8').split('\n').filter(Boolean)) { const o = JSON.parse(l); await varrer(o.prompt, { system: o.system }); } process.exit(0); }
  else if (!prompt) prompt = args[i];
}
if (!prompt) { console.error('❌ prompt vazio'); process.exit(1); }
await varrer(prompt, { system });
