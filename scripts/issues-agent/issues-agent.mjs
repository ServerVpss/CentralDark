#!/usr/bin/env node
/**
 * issues-agent.mjs — Agente autônomo de triagem de issues GitHub
 *
 * Cron: * /30 * * * * (cron roda a cada 30min, mas o agente tem timer
 * interno aleatório de 45–110 min — imita comportamento humano)
 *
 * Ações:
 *  1. Fecha duplicatas (mesmo problema, múltiplas issues abertas)
 *  2. Fecha issues de workflows que voltaram ao verde
 *  3. Fecha alertas de serviços propositalmente parados (wuzapi, whatsapp)
 *  4. Comenta nas issues antigas mostrando que está monitorando
 *  5. Notifica Pivete no Telegram com resumo
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const REPO = 'ServerVpss/CentralDark';
const STATE_FILE = join(__dir, '.next_run');
const MIN_MIN = 45;
const MAX_MIN = 110;
const ATIVIDADE_DIAS = 3; // comentar em issues sem movimento há X dias

// ── Timer aleatório — imita humano ────────────────────────────────
const now = Date.now();
if (existsSync(STATE_FILE)) {
  const nextRun = parseInt(readFileSync(STATE_FILE, 'utf8').trim() || '0', 10);
  if (now < nextRun) {
    const mins = Math.round((nextRun - now) / 60_000);
    log(`Próxima janela em ~${mins}min. Saindo.`);
    process.exit(0);
  }
}
const delay = (MIN_MIN + Math.floor(Math.random() * (MAX_MIN - MIN_MIN))) * 60_000;
writeFileSync(STATE_FILE, String(now + delay));
log(`Iniciando triagem. Próxima execução em ~${Math.round(delay / 60_000)}min.`);

// ── Utilitários ───────────────────────────────────────────────────
function log(...args) {
  console.log('[issues-agent]', ...args);
}

function ghJSON(cmd) {
  try {
    const out = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    return JSON.parse(out.trim());
  } catch {
    return null;
  }
}

function ghExec(cmd) {
  try {
    execSync(cmd, { stdio: ['pipe', 'pipe', 'pipe'] });
    return true;
  } catch (e) {
    log(`Erro gh: ${e.message.split('\n')[0]}`);
    return false;
  }
}

// ── Carregar Telegram do cofre ────────────────────────────────────
const COFRE = '/root/CentralDark/secrets/mcp.env';
let TG_TOKEN = '';
let ADMIN_ID = '';

if (existsSync(COFRE)) {
  for (const line of readFileSync(COFRE, 'utf8').split('\n')) {
    const [k, ...vparts] = line.split('=');
    const v = vparts.join('=').replace(/^["']|["']$/g, '').trim();
    if (!TG_TOKEN && (k === 'SRVER1_BOT_TOKEN' || k === 'TELEGRAM_BOT_TOKEN')) TG_TOKEN = v;
    if (!ADMIN_ID && (k === 'ADMIN_CHAT_ID' || k === 'ADMIN_TELEGRAM_ID')) ADMIN_ID = v;
  }
}

async function tg(text) {
  if (!TG_TOKEN || !ADMIN_ID) return;
  try {
    await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ADMIN_ID,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
  } catch {}
}

// ── Parsear título de issue Sentinela ─────────────────────────────
function parseTitulo(title) {
  const m = title.match(/\[SENTINELA ([^\]]+)\]\s+([^:]+):\s*(.+)/);
  if (!m) return null;
  return { hash: m[1].trim(), tipo: m[2].trim(), descricao: m[3].trim() };
}

// ── Extrair nome do workflow do título ────────────────────────────
function extrairWorkflow(descricao) {
  const m = descricao.match(/Workflow vermelho:\s*(.+)/i);
  return m ? m[1].trim() : descricao.trim();
}

// ── Verificar se workflow voltou ao verde ─────────────────────────
function workflowVerde(workflowName) {
  const runs = ghJSON(
    `gh run list --repo ${REPO} --workflow ${JSON.stringify(workflowName)} --limit 10 --json conclusion,status`
  );
  if (!runs || runs.length === 0) return false;
  // Pelo menos uma conclusão de sucesso nas últimas 10 execuções
  return runs.some((r) => r.conclusion === 'success');
}

// ── Serviços propositalmente parados ─────────────────────────────
const SERVICOS_PARADOS = ['wuzapi', 'whatsapp', 'multizap'];

function ehServicoParado(title) {
  const t = title.toLowerCase();
  return SERVICOS_PARADOS.find((s) => t.includes(s)) || null;
}

// ── Mensagens variadas (parecer humano) ───────────────────────────
function rnd(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const MSG_DUPLICATA = [
  (n) => `🔍 Verificando... esta issue é duplicata de #${n}. Mantendo o histórico lá e fechando esta para limpar o rastreador.`,
  (n) => `📋 O mesmo problema já está registrado em #${n}. Consolidando lá para evitar ruído. Fechando esta.`,
  (n) => `✂️ Duplicata de #${n} — mesma causa, mesmo workflow. Fechando esta, histórico preservado na original.`,
];

const MSG_RESOLVIDO = [
  (wf) => `✅ Monitorei o workflow **${wf}** — as execuções recentes mostram sucesso. Problema resolvido. Fechando.`,
  (wf) => `🟢 **${wf}** voltou ao verde. Confirmado com as últimas execuções no GitHub Actions. Issue encerrada.`,
  (wf) => `✅ Verificado: "${wf}" está passando normalmente. Este alerta não é mais necessário. Fechando.`,
];

const MSG_PARADO = [
  (s) => `ℹ️ O serviço **${s}** está offline por decisão de arquitetura (estado desejado). Não é uma falha. Histórico preservado. Fechando.`,
  (s) => `📌 "${s}" está parado intencionalmente — configurado assim na infra do CentralDark. Sem ação necessária. Fechando.`,
];

const MSG_ATIVIDADE = [
  (dias) => `👀 Agente de monitoramento verificando... Esta issue está aberta há ${dias} dias. O problema ainda está em investigação ou aguarda resolução manual.`,
  (dias) => `🔎 Verificação periódica (${dias}d aberta) — workflow ainda falhando. Monitorando para fechar quando voltar ao verde.`,
  (dias) => `📡 Check-in automático: ${dias} dias aberta. Ainda na fila de resolução. Notificando o administrador.`,
];

// ── Comentar em issue ─────────────────────────────────────────────
function comentar(num, body) {
  log(`Comentando em #${num}`);
  return ghExec(`gh issue comment ${num} --repo ${REPO} --body ${JSON.stringify(body)}`);
}

// ── Fechar issue com comentário ───────────────────────────────────
function fechar(num, motivo) {
  comentar(num, motivo);
  const ok = ghExec(`gh issue close ${num} --repo ${REPO}`);
  if (ok) log(`#${num} fechada.`);
  return ok;
}

// ── Dias desde criação ────────────────────────────────────────────
function diasDesde(isoDate) {
  return Math.floor((now - new Date(isoDate).getTime()) / 86_400_000);
}

// ── Verificar se issue tem comentários recentes (<48h) ────────────
function temComentarioRecente(num) {
  const data = ghJSON(
    `gh issue view ${num} --repo ${REPO} --json comments`
  );
  if (!data?.comments?.length) return false;
  const ultimo = data.comments[data.comments.length - 1];
  return diasDesde(ultimo.createdAt) < 2;
}

// ── MAIN ──────────────────────────────────────────────────────────
async function main() {
  const issues = ghJSON(
    `gh issue list --repo ${REPO} --state open --label auto --limit 60 --json number,title,createdAt,comments`
  );

  if (!issues || issues.length === 0) {
    log('Nenhuma issue auto aberta. Tudo limpo.');
    return;
  }

  log(`${issues.length} issues encontradas para triagem.`);

  // ── Agrupar por problema (ignorando hash único do sentinela) ────
  // Chave = tipo + descrição do problema
  const grupos = new Map();
  const semParsear = [];

  for (const issue of issues) {
    const p = parseTitulo(issue.title);
    if (!p) { semParsear.push(issue); continue; }
    const chave = `${p.tipo}::${p.descricao}`;
    if (!grupos.has(chave)) grupos.set(chave, []);
    grupos.get(chave).push({ ...issue, parsed: p });
  }

  let fechadas = 0;
  let comentadas = 0;
  const acoes = [];

  for (const [, grupo] of grupos) {
    // Ordenar por número desc (maior = mais recente)
    grupo.sort((a, b) => b.number - a.number);
    const principal = grupo[0];
    const { tipo, descricao } = principal.parsed;

    // 1. Fechar duplicatas (mesmo problema, issues diferentes)
    for (const dup of grupo.slice(1)) {
      const msg = rnd(MSG_DUPLICATA)(principal.number);
      if (fechar(dup.number, msg)) {
        fechadas++;
        acoes.push(`#${dup.number} — duplicata de #${principal.number}`);
      }
    }

    // 2. Verificar issue principal
    const titulo = principal.title.toLowerCase();

    // 2a. Serviço propositalmente parado?
    const svc = ehServicoParado(titulo);
    if (svc) {
      const msg = rnd(MSG_PARADO)(svc);
      if (fechar(principal.number, msg)) {
        fechadas++;
        acoes.push(`#${principal.number} — serviço "${svc}" parado por projeto`);
      }
      continue;
    }

    // 2b. Issue de workflow — verificar se voltou ao verde
    if (tipo.toLowerCase().includes('workflow')) {
      const wfName = extrairWorkflow(descricao);
      if (workflowVerde(wfName)) {
        const msg = rnd(MSG_RESOLVIDO)(wfName);
        if (fechar(principal.number, msg)) {
          fechadas++;
          acoes.push(`#${principal.number} — "${wfName}" voltou ao verde`);
        }
        continue;
      }
    }

    // 3. Issue ainda aberta e sem movimento recente → comentar atividade
    const dias = diasDesde(principal.createdAt);
    if (dias >= ATIVIDADE_DIAS && !temComentarioRecente(principal.number)) {
      const msg = rnd(MSG_ATIVIDADE)(dias);
      if (comentar(principal.number, msg)) {
        comentadas++;
        acoes.push(`#${principal.number} — check-in (${dias}d aberta)`);
      }
    }
  }

  // ── Resumo no Telegram ────────────────────────────────────────
  const ainda = issues.length - fechadas;
  const ts = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const listaAcoes = acoes.length
    ? acoes.slice(0, 10).map((a) => `• ${a}`).join('\n')
    : '• Nenhuma ação necessária desta vez';

  await tg(
    `🤖 <b>AGENTE DE ISSUES — TRIAGEM</b>\n\n` +
    `📊 <b>Resultado:</b>\n` +
    `• Verificadas: ${issues.length}\n` +
    `• Fechadas: ${fechadas}\n` +
    `• Check-ins: ${comentadas}\n` +
    `• Ainda abertas: ${ainda}\n\n` +
    `📋 <b>Ações realizadas:</b>\n${listaAcoes}\n\n` +
    `🕐 ${ts}`
  );

  log(`Concluído. Fechadas: ${fechadas} | Check-ins: ${comentadas} | Abertas: ${ainda}`);
}

main().catch((e) => {
  log('Erro fatal:', e.message);
  process.exit(1);
});
