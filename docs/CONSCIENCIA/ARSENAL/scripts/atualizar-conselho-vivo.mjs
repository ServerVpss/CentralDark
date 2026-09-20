#!/usr/bin/env node
// Gera apps/modulos/status/conselho-vivo.json a partir dos DEBATES + EVOLUCAO do Arsenal.
// Roda no cron a cada 5 min.

import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = '/root/CentralDark';
const ARSENAL = join(ROOT, 'docs/CONSCIENCIA/ARSENAL');
const DEBATES = join(ARSENAL, 'DEBATES');
const EVOLUCAO = join(ARSENAL, 'EVOLUCAO');
const REGRAS = join(ARSENAL, 'regras.json');
const OUT = join(ROOT, 'apps/modulos/status/conselho-vivo.json');

async function listRecursive(dir, limit = 20) {
  const out = [];
  async function walk(p) {
    let entries;
    try { entries = await readdir(p, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const full = join(p, e.name);
      if (e.isDirectory()) await walk(full);
      else if (e.isFile() && e.name.endsWith('.md')) {
        const st = await stat(full);
        out.push({ path: full, mtime: st.mtimeMs, size: st.size, name: e.name });
      }
    }
  }
  await walk(dir);
  return out.sort((a, b) => b.mtime - a.mtime).slice(0, limit);
}

function firstLines(txt, n = 3) {
  return txt.split('\n').filter(l => l.trim()).slice(0, n).join(' · ').slice(0, 240);
}

async function main() {
  const debates = await listRecursive(DEBATES, 8);
  const evol = await listRecursive(EVOLUCAO, 8);

  const debatesData = await Promise.all(debates.map(async d => {
    const txt = await readFile(d.path, 'utf8').catch(() => '');
    return { arquivo: d.path.replace(ROOT + '/', ''), quando: new Date(d.mtime).toISOString(), preview: firstLines(txt) };
  }));
  const evolData = await Promise.all(evol.map(async e => {
    const txt = await readFile(e.path, 'utf8').catch(() => '');
    return { arquivo: e.path.replace(ROOT + '/', ''), quando: new Date(e.mtime).toISOString(), preview: firstLines(txt) };
  }));

  let regras = {};
  try { regras = JSON.parse(await readFile(REGRAS, 'utf8')); } catch {}

  const payload = {
    atualizadoEm: new Date().toISOString(),
    slots: regras.slots || {},
    timeouts: regras.timeouts || {},
    stats: { totalDebates: debatesData.length, totalEvolucoes: evolData.length },
    ultimosDebates: debatesData,
    ultimasEvolucoes: evolData,
  };

  await writeFile(OUT, JSON.stringify(payload, null, 2));
  console.log(`✅ conselho-vivo.json atualizado — ${debatesData.length} debates · ${evolData.length} evoluções`);
}

main().catch(e => { console.error('❌', e); process.exit(1); });
