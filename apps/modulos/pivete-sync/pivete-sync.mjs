#!/usr/bin/env node
/**
 * pivete-sync.mjs — Sync bidirecional pivete: VPS ↔ HUB Supabase
 * ----------------------------------------------------------------
 * Roda a cada 5min via PM2 (app CentralDark-PiveteSync).
 *
 * Regra do merge:
 *   1. Lê todos os PIVETE-*.md do disco (VPS).
 *   2. Lê snapshot atual do HUB (hub.pivete_consciencia).
 *   3. Pra cada arquivo:
 *      - Se hash igual         → noop (log opcional)
 *      - Se local mais recente → UPSERT no HUB
 *      - Se HUB mais recente   → escreve local + git commit
 *   4. Registra tudo em hub.pivete_sync_log.
 *
 * ENV necessário:
 *   HUB_SUPABASE_URL
 *   HUB_SUPABASE_SERVICE_ROLE_KEY
 */

import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const PASTA = '/root/CentralDark/docs/CONSCIENCIA/PIVETE-IA';
const LOG_MARKER = '/root/CentralDark/logs/pivete-sync-last.txt';
const HUB_URL = process.env.HUB_SUPABASE_URL;
const HUB_KEY = process.env.HUB_SUPABASE_SERVICE_ROLE_KEY;
const INTERVALO_MS = parseInt(process.env.PIVETE_SYNC_INTERVALO_MS || '300000', 10);

if (!HUB_URL || !HUB_KEY) {
  console.error('🔴 HUB_SUPABASE_URL / HUB_SUPABASE_SERVICE_ROLE_KEY nao setados. Abortando.');
  process.exit(1);
}

function hash(txt) {
  return createHash('sha256').update(txt).digest('hex');
}

function log(msg) {
  const linha = `[${new Date().toISOString()}] ${msg}`;
  console.log(linha);
  try {
    writeFileSync(LOG_MARKER, linha, { flag: 'w' });
  } catch (e) {
    /* nada */
  }
}

async function hubFetch(path, opts = {}) {
  const url = `${HUB_URL}/rest/v1${path}`;
  const res = await fetch(url, {
    ...opts,
    headers: {
      apikey: HUB_KEY,
      Authorization: `Bearer ${HUB_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`HUB ${res.status}: ${await res.text()}`);
  return res.json();
}

async function upsertArquivo(nome, conteudo, origem) {
  return hubFetch('/pivete_consciencia?on_conflict=nome', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify([
      {
        nome,
        conteudo,
        hash: hash(conteudo),
        origem,
        atualizado_em: new Date().toISOString(),
      },
    ]),
  });
}

async function registrarLog(arquivo, direcao, status, detalhe = '') {
  try {
    await hubFetch('/pivete_sync_log', {
      method: 'POST',
      body: JSON.stringify([{ arquivo, direcao, status, detalhe }]),
    });
  } catch (e) {
    console.error('log falhou:', e.message);
  }
}

async function sincronizarUmaVez() {
  const inicio = Date.now();
  const arquivos = readdirSync(PASTA)
    .filter((f) => f.startsWith('PIVETE-') && f.endsWith('.md'))
    .sort();

  log(`🔄 Iniciando sync · ${arquivos.length} arquivos locais`);

  // 1. snapshot atual do HUB
  const hubSnapshot = await hubFetch('/pivete_consciencia?select=nome,hash,atualizado_em');
  const hubMap = new Map(hubSnapshot.map((r) => [r.nome, r]));

  let novos = 0;
  let atualizados = 0;
  let iguais = 0;

  for (const nome of arquivos) {
    const caminho = join(PASTA, nome);
    const conteudo = readFileSync(caminho, 'utf8');
    const h = hash(conteudo);
    const emHub = hubMap.get(nome);

    if (!emHub) {
      await upsertArquivo(nome, conteudo, 'vps');
      await registrarLog(nome, 'vps->hub', 'ok', 'novo');
      novos++;
      continue;
    }

    if (emHub.hash === h) {
      iguais++;
      continue;
    }

    // Diferente: quem venceu? Comparamos mtime local vs atualizado_em do HUB.
    const mtimeLocal = statSync(caminho).mtimeMs;
    const mtimeHub = new Date(emHub.atualizado_em).getTime();

    if (mtimeLocal >= mtimeHub) {
      await upsertArquivo(nome, conteudo, 'vps');
      await registrarLog(nome, 'vps->hub', 'ok', 'local mais novo');
      atualizados++;
    } else {
      // HUB venceu → escreve no disco e commita
      const cheio = await hubFetch(
        `/pivete_consciencia?nome=eq.${encodeURIComponent(nome)}&select=conteudo`,
      );
      if (cheio[0]) {
        writeFileSync(caminho, cheio[0].conteudo, 'utf8');
        try {
          execSync(
            `cd /root/CentralDark && git add "docs/CONSCIENCIA/PIVETE-IA/${nome}" && ` +
              `git commit -m "sync(pivete): ${nome} do HUB [skip ci]" && git push`,
            { stdio: 'pipe' },
          );
        } catch (e) {
          log(`⚠️ git falhou pra ${nome}: ${e.message.slice(0, 200)}`);
        }
        await registrarLog(nome, 'hub->vps', 'ok', 'hub mais novo');
        atualizados++;
      }
    }
  }

  const dur = Date.now() - inicio;
  log(`✅ Sync fim · novos=${novos} · atualizados=${atualizados} · iguais=${iguais} · ${dur}ms`);
}

async function loop() {
  while (true) {
    try {
      await sincronizarUmaVez();
    } catch (e) {
      log(`🔴 erro no sync: ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, INTERVALO_MS));
  }
}

loop();
