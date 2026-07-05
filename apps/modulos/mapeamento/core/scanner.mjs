// Scanner — coleta snapshot do sistema
import fs from 'node:fs/promises';
import path from 'node:path';
import { execSync } from 'node:child_process';

const RAIZ = '/root/CentralDark';

async function listarModulos() {
  const dir = path.join(RAIZ, 'apps/modulos');
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const out = [];
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      const sub = path.join(dir, e.name);
      let contagem = 0;
      try { const files = await fs.readdir(sub, { recursive: true }); contagem = files.length; } catch {}
      out.push({ nome: e.name, arquivos: contagem });
    }
    return out;
  } catch { return []; }
}

function listarPm2() {
  try {
    const raw = execSync('pm2 jlist', { encoding: 'utf8', timeout: 8000 });
    const arr = JSON.parse(raw);
    return arr.map(p => ({
      id: p.pm_id,
      nome: p.name,
      status: p.pm2_env?.status,
      restarts: p.pm2_env?.restart_time,
      mem_mb: Math.round((p.monit?.memory || 0) / 1024 / 1024),
    }));
  } catch { return []; }
}

function gitInfo() {
  try {
    const commit = execSync('git -C /root/CentralDark rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    const branch = execSync('git -C /root/CentralDark rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    return { commit, branch };
  } catch { return {}; }
}

export async function escanear() {
  return {
    coletado_em: new Date().toISOString(),
    modulos: await listarModulos(),
    pm2: listarPm2(),
    git: gitInfo(),
  };
}

export function diff(anterior, atual) {
  const drift = [];
  if (!anterior) return [{ tipo: 'primeiro-mapa', detalhe: 'sem baseline' }];

  const antMod = new Set((anterior.modulos || []).map(m => m.nome));
  const atMod = new Set((atual.modulos || []).map(m => m.nome));
  for (const n of atMod) if (!antMod.has(n)) drift.push({ tipo: 'modulo-novo', detalhe: n });
  for (const n of antMod) if (!atMod.has(n)) drift.push({ tipo: 'modulo-removido', detalhe: n });

  const antPm2 = new Map((anterior.pm2 || []).map(p => [p.nome, p]));
  for (const p of atual.pm2 || []) {
    const a = antPm2.get(p.nome);
    if (!a) drift.push({ tipo: 'pm2-novo', detalhe: p.nome });
    else if (a.status !== p.status) drift.push({ tipo: 'pm2-status-mudou', detalhe: `${p.nome}: ${a.status} → ${p.status}` });
    else if ((p.restarts - a.restarts) > 5) drift.push({ tipo: 'pm2-instavel', detalhe: `${p.nome}: +${p.restarts - a.restarts} restarts` });
  }

  if (anterior.git?.commit && atual.git?.commit && anterior.git.commit !== atual.git.commit) {
    drift.push({ tipo: 'commit-novo', detalhe: `${anterior.git.commit} → ${atual.git.commit}` });
  }
  return drift;
}
