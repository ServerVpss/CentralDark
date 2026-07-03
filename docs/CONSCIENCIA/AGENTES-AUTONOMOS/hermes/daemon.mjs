#!/usr/bin/env node
// 🤖 Hermes-Vivo daemon — loop 5s procurando missões em missoes/pendente/
// + retomada automática de missões órfãs em missoes/em-andamento/ (sobrevive a restart/crash)
import { readdir, readFile, writeFile, mkdir, rename, appendFile, stat } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

// Carrega /root/CentralDark/.env no boot — PM2 não herda ~/.bashrc (DARKAI_URL, DARKAI_ANON_KEY, ELITE_ANTHROPIC_TOKEN)
try {
  for (const l of readFileSync('/root/CentralDark/.env', 'utf8').split('\n')) {
    const line = l.split('#')[0].trim();
    if (!line) continue;
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
} catch {}

const { decidir } = await import('./decisor.mjs');
const { executar } = await import('./executor.mjs');

const pexec = promisify(execFile);
const ROOT = '/root/CentralDark/docs/CONSCIENCIA/AGENTES-AUTONOMOS/hermes';
const PENDENTE  = `${ROOT}/missoes/pendente`;
const ANDAMENTO = `${ROOT}/missoes/em-andamento`;
const CONCLUIDA = `${ROOT}/missoes/concluidas`;
const NOTIFY    = `${ROOT}/notify.mjs`;
const INTERVAL  = 5000;
const MAX_FALHAS = 3;

let ocupado = false; // trava: nunca rodar duas missões ao mesmo tempo

const log = (...a) => console.log(`[${new Date().toISOString()}]`, ...a);

async function notificar(titulo, mensagem, destino = 'ambos') {
  try {
    await pexec('node', [NOTIFY, titulo, mensagem, destino], { timeout: 30_000 });
  } catch (e) { log('notify falhou:', e.message.slice(0,150)); }
}

function slugify(s) {
  return s.toLowerCase().replace(/[^\w-]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || `m-${Date.now()}`;
}

async function pegarProximaMissao() {
  if (!existsSync(PENDENTE)) return null;
  const files = (await readdir(PENDENTE)).filter(f => f.endsWith('.md')).sort();
  return files[0] ? join(PENDENTE, files[0]) : null;
}

async function executarMissao(arquivoPendente) {
  const nome = arquivoPendente.split('/').pop().replace('.md', '');
  const slug = slugify(nome);
  const dir = join(ANDAMENTO, slug);
  await mkdir(dir, { recursive: true });

  const missao = (await readFile(arquivoPendente, 'utf8')).trim();
  await rename(arquivoPendente, join(dir, 'missao.md'));

  await notificar(
    `Hermes: nova missão`,
    `🚀 <b>${slug}</b>\n\n<i>${missao.slice(0, 400)}</i>\n\nProgresso será postado a cada etapa.`
  );

  await rodarMissao(dir, slug, missao, [], 0);
}

// 🔄 Missões órfãs: daemon caiu/reiniciou no meio — continua da etapa onde parou usando o state.json
async function retomarOrfas() {
  if (!existsSync(ANDAMENTO)) return;
  const orfas = [];
  for (const nome of await readdir(ANDAMENTO)) {
    const dir = join(ANDAMENTO, nome);
    if (!existsSync(join(dir, 'missao.md'))) continue;
    orfas.push({ dir, nome, mtime: (await stat(dir)).mtimeMs });
  }
  orfas.sort((a, b) => a.mtime - b.mtime);

  for (const { dir, nome } of orfas) {
    let missao = '', historico = [], retomadas = 0;
    try {
      const s = JSON.parse(await readFile(join(dir, 'state.json'), 'utf8'));
      missao = (s.missao || '').trim();
      historico = Array.isArray(s.historico) ? s.historico : [];
      retomadas = s.retomadas || 0;
    } catch { /* state.json ausente/corrompido — cai pro missao.md com histórico zerado */ }
    if (!missao) {
      try { missao = (await readFile(join(dir, 'missao.md'), 'utf8')).trim(); } catch { continue; }
    }
    retomadas++;
    log(`🔄 RETOMADA: ${nome} — continuando da etapa ${historico.length} (retomada #${retomadas})`);
    await notificar(
      'Hermes: RETOMADA 🔄',
      `🔄 <b>${nome}</b>\nDaemon reiniciou no meio da missão — continuando da etapa ${historico.length} (retomada #${retomadas}). Nada foi re-executado.`
    );
    await rodarMissao(dir, nome, missao, historico, retomadas);
  }
}

async function rodarMissao(dir, slug, missao, historico = [], retomadas = 0) {
  const logPath = join(dir, 'hermes.log');
  const statePath = join(dir, 'state.json');
  const lg = (msg) => appendFile(logPath, `[${new Date().toISOString()}] ${msg}\n`).catch(()=>{});

  await lg(historico.length
    ? `🔄 retomando missão: ${slug} (etapa ${historico.length}, retomada #${retomadas})`
    : `🚀 iniciando missão: ${slug}`);

  let falhasSeguidas = 0;
  let etapa = historico.length;

  while (true) {
    etapa++;
    let decisao;
    try {
      decisao = await decidir(missao, historico);
      await lg(`etapa ${etapa} decisão: ${JSON.stringify(decisao).slice(0, 300)}`);
    } catch (e) {
      await lg(`❌ decisor falhou: ${e.message}`);
      await notificar(`Hermes: decisor falhou`, `❌ etapa ${etapa}\n${e.message.slice(0,300)}`);
      falhasSeguidas++;
      if (falhasSeguidas >= MAX_FALHAS) break;
      await new Promise(r => setTimeout(r, 10_000));
      continue;
    }

    const { etapa_titulo, ferramenta, args = {}, terminou, pensamento } = decisao;

    if (terminou) {
      await lg(`🏁 missão concluída na etapa ${etapa}`);
      await notificar(
        `Hermes: MISSÃO CONCLUÍDA 🎉`,
        `✅ <b>${slug}</b>\n\n${(args.mensagem || pensamento || 'concluído').slice(0, 800)}\n\nTotal: ${etapa-1} etapas`
      );
      break;
    }

    const resultado = await executar(ferramenta, args);
    await lg(`etapa ${etapa} resultado ok=${resultado.ok}: ${resultado.saida.slice(0, 200)}`);
    historico.push({ etapa_titulo, ferramenta, args, resultado: resultado.saida, ok: resultado.ok });
    await writeFile(statePath, JSON.stringify({ missao, historico, retomadas }, null, 2));

    const emoji = resultado.ok ? '✅' : '⚠️';
    await notificar(
      `Hermes: etapa ${etapa}`,
      `${emoji} <b>${etapa_titulo}</b>\n<code>${ferramenta}</code>\n\n<pre>${(resultado.saida || '').slice(0, 700).replace(/</g,'&lt;')}</pre>`,
      'admin'
    );

    if (!resultado.ok) {
      falhasSeguidas++;
      if (falhasSeguidas >= MAX_FALHAS) {
        await lg(`🔴 pausando após ${MAX_FALHAS} falhas seguidas`);
        await notificar(
          `Hermes: PAUSEI 🔴`,
          `❌ <b>${slug}</b>\n${MAX_FALHAS} falhas seguidas na etapa ${etapa}.\nÚltimo erro:\n<pre>${resultado.saida.slice(0,500).replace(/</g,'&lt;')}</pre>`
        );
        break;
      }
    } else {
      falhasSeguidas = 0;
    }

    await new Promise(r => setTimeout(r, 2000));
  }

  const hoje = new Date().toISOString().slice(0,10);
  const dest = join(CONCLUIDA, hoje);
  await mkdir(dest, { recursive: true });
  await rename(dir, join(dest, slug));
  await lg(`📦 movido pra concluidas/${hoje}/${slug}`);
}

async function loop() {
  log('🤖 Hermes-Vivo online — vigiando missoes/pendente/');
  await notificar('Hermes: ONLINE', '🟢 daemon vivo, aguardando missões.\n\nEntregue em: <code>missoes/pendente/&lt;nome&gt;.md</code>');

  // Antes de tudo: retoma missões que ficaram órfãs no último restart/crash
  ocupado = true;
  try { await retomarOrfas(); }
  catch (e) {
    log('erro na retomada:', e.message);
    await notificar('Hermes: erro retomada', `⚠️ ${e.message.slice(0,300)}`);
  }
  finally { ocupado = false; }

  while (true) {
    try {
      if (!ocupado) {
        const proxima = await pegarProximaMissao();
        if (proxima) {
          ocupado = true;
          log('nova missão:', proxima);
          try { await executarMissao(proxima); } finally { ocupado = false; }
        }
      }
    } catch (e) {
      ocupado = false;
      log('erro no loop:', e.message);
      await notificar('Hermes: erro loop', `⚠️ ${e.message.slice(0,300)}`);
    }
    await new Promise(r => setTimeout(r, INTERVAL));
  }
}

loop().catch(async e => {
  await notificar('Hermes: CRASH', `💥 ${e.message}`);
  process.exit(1);
});
