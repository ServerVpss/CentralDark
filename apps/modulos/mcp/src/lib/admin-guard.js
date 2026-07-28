// admin-guard.js — módulo canônico de auditoria + reconciliação para tools destrutivas.
// Uso: importado pelo dispatcher `mcp_admin_call` (tools/core/mcp-admin.js) e pelos testes.
//
// Autolupa aplicada:
// - Baseline canônico único: CANONICAL_DESTRUCTIVE_TOOLS (nenhuma duplicação em teste/dispatcher).
// - Reconciliação com expectativa REAL passada pelo dispatcher (não mais falso verde).
// - Startup snapshot registra lista ordenada + verifyChain + version + fail marcado observável.
// - Mutex intra-processo (promise chain) só na escrita de auditoria. Sem lock global, sem daemon.
// - Append real com O_APPEND (fd.appendFile) e chain head atômico via temp+rename.
// - executionStatus distinto de decision: `authorized` só significa liberado, não executado.
// - Fail-closed: falha de auditoria bloqueia SÓ a destrutiva atual.
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { createHash, randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

const AUDIT_DIR = process.env.MCP_AUDIT_DIR || "/root/CentralDark/logs";
const CHAIN_STATE = process.env.MCP_ADMIN_CHAIN_STATE
  || path.join(AUDIT_DIR, ".mcp-admin-chain.json");
const STARTUP_LOCK = process.env.MCP_ADMIN_STARTUP_LOCK
  || path.join(AUDIT_DIR, ".mcp-admin-startup.json");
const HOSTNAME = os.hostname();
const PID = process.pid;

// ─────────────────── manifesto aprovado de destrutivas ────────────────────
// MOTIVO  > antes existia aqui uma lista escrita a mao, e o comentario dela
//           confessava a origem: "derivada 1x do runtime real em 2026-07-21,
//           congelada aqui como baseline". Uma foto de um dia virou lei.
//           Quando o dispatcher ganhou grupos novos, o runtime passou a ter
//           mais destrutivas que a lista e o guard bloqueou TODAS por
//           divergencia — inclusive as que sempre foram legitimas.
//           A versao do catalogo tambem era uma string fixa ("v1-2026-07-21")
//           que nao mudava quando o conteudo mudava.
// ONDE    > apps/modulos/mcp/src/lib/admin-guard.js, linhas 26 e 37-50.
// RESOLVE > a lista aprovada mora em manifesto-destrutivas.json, versionado e
//           revisado no PR. Este modulo apenas LE. A versao passa a ser
//           derivada do conteudo, entao qualquer mudanca de lista muda a
//           versao sozinha — sem ninguem lembrar de atualizar numero nenhum.
const MANIFESTO_PATH = process.env.MCP_MANIFESTO_DESTRUTIVAS
  || path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "manifesto-destrutivas.json");

function lerManifesto() {
  // Fail-closed no boot: um guard que nao consegue carregar a propria politica
  // NAO deve aceitar trafego. Mas o erro precisa dizer o que houve — um ENOENT
  // ou SyntaxError cru na pilha manda o operador cacar no escuro.
  let bruto;
  try {
    bruto = fs.readFileSync(MANIFESTO_PATH, "utf8");
  } catch (erro) {
    throw new Error(
      `admin-guard: manifesto de destrutivas ilegivel em ${MANIFESTO_PATH}. `
      + `O servico NAO sobe sem a politica de seguranca. Causa: ${erro?.code ?? erro?.message}`);
  }
  let cru;
  try {
    cru = JSON.parse(bruto);
  } catch (erro) {
    throw new Error(
      `admin-guard: manifesto de destrutivas com JSON invalido em ${MANIFESTO_PATH}. `
      + `O servico NAO sobe com politica corrompida. Causa: ${erro?.message}`);
  }
  // SO destrutivasAprovadas entra. destrutivasEmRevisao existe no arquivo de
  // proposito, para ficar visivel, mas NAO autoriza nada: essas tools caem em
  // quarentena pontual ate passarem nos gates.
  const entradas = Array.isArray(cru?.destrutivasAprovadas) ? cru.destrutivasAprovadas : [];
  const emRevisao = Array.isArray(cru?.destrutivasEmRevisao) ? cru.destrutivasEmRevisao : [];
  const nomes = [...new Set(entradas.map((e) => e?.nome).filter((n) => typeof n === "string" && n))].sort();
  if (nomes.length !== entradas.length) {
    throw new Error("manifesto-destrutivas.json tem entrada duplicada ou sem nome");
  }
  const cruzadas = nomes.filter((n) => emRevisao.some((e) => e?.nome === n));
  if (cruzadas.length) {
    throw new Error(`manifesto-destrutivas.json: ${cruzadas.join(", ")} esta em aprovadas E em revisao`);
  }
  return { revisadoEm: String(cru?.revisadoEm ?? "sem-data"), nomes, entradas, emRevisao };
}

const MANIFESTO = lerManifesto();

/** Hash do conteudo aprovado. Muda sozinho quando a lista muda. */
// MOTIVO  > a primeira versao deste hash incluia revisadoEm. Com isso, o
//           MESMO conjunto de destrutivas aprovadas produzia identificadores
//           diferentes so por ter sido revisado em outro dia. Dois builds no
//           mesmo dia batiam, o que parecia determinismo — mas era apenas
//           repetibilidade local: a data ainda mandava no identificador.
// ONDE    > apps/modulos/mcp/src/lib/admin-guard.js, MANIFEST_HASH.
// RESOLVE > o identificador canonico passa a depender EXCLUSIVAMENTE do
//           conteudo aprovado. A data continua existindo, mas como metadado
//           separado (MANIFEST_REVIEWED_AT), fora do ID.
//           Consequencia desejada: mesmo conteudo -> mesmo CATALOG_VERSION,
//           em qualquer dia, maquina ou build.
// A revisao independente pegou aqui: JSON.stringify preserva a ordem de
// insercao das chaves. Um formatador que reordene os campos de uma entrada, ou
// um checkout que reordene o array, mudaria o hash sem que NENHUMA regra
// tivesse mudado — e o cliente reconectaria a toa achando que o catalogo mudou.
// Serializacao canonica: chaves ordenadas e entradas ordenadas por nome.
function canonico(valor) {
  if (Array.isArray(valor)) return valor.map(canonico);
  if (valor && typeof valor === "object") {
    return Object.keys(valor).sort().reduce((acc, k) => { acc[k] = canonico(valor[k]); return acc; }, {});
  }
  return valor;
}

export const MANIFEST_HASH = createHash("sha256")
  .update(JSON.stringify(canonico([...MANIFESTO.entradas].sort((a, b) => String(a?.nome).localeCompare(String(b?.nome))))))
  .digest("hex")
  .slice(0, 12);

/** Metadado, NAO faz parte do identificador canonico. */
export const MANIFEST_REVIEWED_AT = MANIFESTO.revisadoEm;

/** Destrutivas que existem no codigo mas reprovaram em algum gate. */
export const DESTRUTIVAS_EM_REVISAO = Object.freeze(MANIFESTO.emRevisao ?? []);

/** Identificador canonico: v1-<hash do conteudo aprovado>. Sem data, sem
 * relogio, sem aleatorio. Mesmo conteudo produz o mesmo valor sempre. */
export const CATALOG_VERSION = `v1-${MANIFEST_HASH}`;

/** Ficha completa de cada destrutiva aprovada (origem, arquivo, se e publica). */
export const MANIFESTO_DESTRUTIVAS = Object.freeze(MANIFESTO.entradas);

export const ADMIN_CONFIRMATIONS = Object.freeze({
  "CONFIRMO ADMIN": "confirmo_admin",
  "PERMITO PIVETE": "permito_pivete",
});

// Fonte unica da verdade: o manifesto aprovado. Este modulo nao guarda
// copia propria da lista — le de manifesto-destrutivas.json (ver acima).
export const CANONICAL_DESTRUCTIVE_TOOLS = Object.freeze(MANIFESTO.nomes);

export function getCanonicalExpectation() {
  return {
    expectedDestructiveCount: CANONICAL_DESTRUCTIVE_TOOLS.length,
    expectedDestructiveNames: CANONICAL_DESTRUCTIVE_TOOLS,
    version: CATALOG_VERSION,
  };
}

const SENSITIVE_KEY_RE = /(authorization|cookie|password|senha|secret|token|api[_-]?key|private[_-]?key|refresh[_-]?token|access[_-]?token|credential|credencial)/i;

function sanitizeReason(reason) {
  if (typeof reason !== "string") return null;
  return reason
    .replace(/\bBearer\s+[A-Za-z0-9._~+/=-]{8,}/gi, "Bearer [REDACTED]")
    .replace(/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\b/g, "[REDACTED_JWT]")
    .replace(/\bsk-[A-Za-z0-9_-]{16,}\b/g, "[REDACTED_KEY]")
    .replace(/\bgh[pousr]_[A-Za-z0-9_]{20,}\b/g, "[REDACTED_GH]")
    .slice(0, 500);
}

function safeKeys(input) {
  if (!input || typeof input !== "object") return [];
  return Object.keys(input)
    .filter((k) => !SENSITIVE_KEY_RE.test(k))
    .slice(0, 30);
}

/**
 * Avalia confirmação administrativa.
 */
export function evaluateAdminConfirmation(confirmAdmin) {
  if (typeof confirmAdmin !== "string" || !confirmAdmin) {
    return { decision: "blocked", confirmationMode: null, reason: "confirmacao_ausente" };
  }
  const trimmed = confirmAdmin.trim();
  const mode = Object.hasOwn(ADMIN_CONFIRMATIONS, trimmed)
    ? ADMIN_CONFIRMATIONS[trimmed]
    : undefined;
  if (typeof mode === "string") {
    return { decision: "released", confirmationMode: mode, reason: "confirmacao_valida" };
  }
  return { decision: "blocked", confirmationMode: null, reason: "confirmacao_invalida" };
}

/**
 * Snapshot verificável do catálogo em runtime, comparado com expectativa canônica.
 */
export function reconcileCatalog(runtimeTools, expectation = {}) {
  const total = runtimeTools.length;
  const destructiveTools = runtimeTools
    .filter((t) => t?.annotations?.destructiveHint === true)
    .map((t) => t.name)
    .sort();
  const destructiveCount = destructiveTools.length;

  const catalogHash = createHash("sha256")
    .update(JSON.stringify({ total, destructiveTools }))
    .digest("hex")
    .slice(0, 12);

  const divergences = [];
  if (typeof expectation.expectedDestructiveCount === "number"
      && expectation.expectedDestructiveCount !== destructiveCount) {
    divergences.push({
      kind: "count_mismatch",
      expected: expectation.expectedDestructiveCount,
      actual: destructiveCount,
    });
  }
  // MOTIVO  > antes qualquer divergencia deixava recon.ok = false, e o
  //           guardDestructive bloqueava TODA destrutiva por isso — inclusive
  //           as aprovadas, que nao tinham nada a ver com o problema. Uma tool
  //           nova e desconhecida derrubava o conjunto inteiro.
  // ONDE    > apps/modulos/mcp/src/lib/admin-guard.js, reconcileCatalog.
  // RESOLVE > a divergencia passa a ser NOMEADA. quarantined = destrutiva que
  //           apareceu no runtime e nao esta no manifesto aprovado; missing =
  //           aprovada que sumiu do runtime. Quem decide bloquear e o
  //           guardDestructive, e so para a tool que estiver nessas listas.
  //           Leitura e destrutiva aprovada seguem livres.
  let quarantined = [];
  let missing = [];
  if (Array.isArray(expectation.expectedDestructiveNames)) {
    const expected = [...expectation.expectedDestructiveNames].sort();
    missing = expected.filter((n) => !destructiveTools.includes(n));
    quarantined = destructiveTools.filter((n) => !expected.includes(n));
    if (missing.length) divergences.push({ kind: "missing_destructive", names: missing });
    if (quarantined.length) divergences.push({ kind: "extra_destructive", names: quarantined });
  }

  return {
    ok: divergences.length === 0,
    totalRuntimeTools: total,
    destructiveCount,
    destructiveTools,
    catalogHash,
    catalogVersion: expectation.version ?? null,
    divergences,
    quarantined,
    missing,
    checkedAt: new Date().toISOString(),
  };
}

// ── Locks de escrita intra + interprocesso ──────────────────────────────────
// O mutex em memória evita corrida no mesmo processo. O lock de arquivo evita
// que dois workers/PM2 escrevam a mesma sequência simultaneamente.
let auditWriteChain = Promise.resolve();
function withAuditLock(fn) {
  const prev = auditWriteChain;
  const next = prev.then(() => fn(), () => fn());
  auditWriteChain = next.then(() => undefined, () => undefined);
  return next;
}

const FILE_LOCK = `${CHAIN_STATE}.lock`;
const FILE_LOCK_TIMEOUT_MS = 5_000;
const FILE_LOCK_STALE_MS = 30_000;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function acquireFileLock() {
  const started = Date.now();
  fs.mkdirSync(path.dirname(FILE_LOCK), { recursive: true });
  while (Date.now() - started < FILE_LOCK_TIMEOUT_MS) {
    try {
      const handle = await fsp.open(FILE_LOCK, "wx", 0o600);
      await handle.writeFile(JSON.stringify({ pid: PID, hostname: HOSTNAME, at: new Date().toISOString() }));
      return handle;
    } catch (error) {
      if (error?.code !== "EEXIST") throw error;
      try {
        const stat = await fsp.stat(FILE_LOCK);
        let owner = null;
        try { owner = JSON.parse(await fsp.readFile(FILE_LOCK, "utf8")); } catch {}
        const ownerAlive = owner?.hostname === HOSTNAME
          && Number.isInteger(owner?.pid)
          && fs.existsSync(`/proc/${owner.pid}`);
        if (Date.now() - stat.mtimeMs > FILE_LOCK_STALE_MS && !ownerAlive) {
          await fsp.unlink(FILE_LOCK);
          continue;
        }
      } catch (statError) {
        if (statError?.code !== "ENOENT") throw statError;
      }
      await delay(25);
    }
  }
  throw new Error("audit_lock_timeout");
}

async function releaseFileLock(handle) {
  if (!handle) return;
  try { await handle.close(); } catch {}
  try { await fsp.unlink(FILE_LOCK); } catch {}
}

function auditFileForDay(day) {
  return path.join(AUDIT_DIR, `mcp-admin-audit-${day}.jsonl`);
}

function readChainHeadSync() {
  const verified = verifyAuditDirectory(AUDIT_DIR);
  if (!verified.ok) {
    throw new Error(`existing_audit_chain_invalid:${verified.reason || verified.error}`);
  }
  return { hash: verified.lastHash, seq: verified.lastSeq };
}
function saveChainHeadAtomic(next) {
  const tmp = CHAIN_STATE + ".tmp." + process.pid + "." + randomUUID().slice(0, 8);
  try {
    fs.mkdirSync(path.dirname(CHAIN_STATE), { recursive: true });
    fs.writeFileSync(tmp, JSON.stringify(next), { mode: 0o600 });
    fs.renameSync(tmp, CHAIN_STATE);
    return true;
  } catch {
    try { fs.unlinkSync(tmp); } catch {}
    return false;
  }
}

function appendAuditLine(day, line) {
  fs.mkdirSync(AUDIT_DIR, { recursive: true });
  const file = auditFileForDay(day);
  const fd = fs.openSync(file, "a", 0o600);
  try {
    fs.writeSync(fd, line);
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
  return file;
}

/**
 * Grava evento na auditoria com hash chain. Serializada dentro e entre processos.
 * Os arquivos diários formam uma única cadeia contínua e verificável em ordem cronológica.
 */
export function writeAuditEvent(evento, options = {}) {
  return withAuditLock(async () => {
    let fileLock;
    try {
      fileLock = await acquireFileLock();
      const timestamp = options.timestamp || new Date().toISOString();
      const day = timestamp.slice(0, 10);
      const prev = readChainHeadSync();

      const registro = {
        timestamp,
        seq: prev.seq + 1,
        prevHash: prev.hash,
        event: "admin_confirmation",
        correlationId: evento.correlationId || randomUUID(),
        hostname: HOSTNAME,
        pid: PID,
        actor: evento.actor || process.env.MCP_CALLER_USER || "mcp-local",
        tool: evento.tool,
        decision: evento.decision,
        executionStatus: evento.executionStatus ?? evento.decision,
        confirmationMode: evento.confirmationMode ?? null,
        reason: sanitizeReason(evento.reason),
        catalogHash: evento.catalogHash ?? null,
        catalogVersion: evento.catalogVersion ?? null,
        totalRuntimeTools: evento.totalRuntimeTools ?? null,
        destructiveCount: evento.destructiveCount ?? null,
        destructiveTools: Array.isArray(evento.destructiveTools) ? evento.destructiveTools : null,
        divergences: evento.divergences ?? null,
        inputKeys: safeKeys(evento.inputPayload),
      };

      const hash = createHash("sha256")
        .update(prev.hash + JSON.stringify(registro))
        .digest("hex");
      registro.hash = hash;

      appendAuditLine(day, JSON.stringify(registro) + "\n");
      const persisted = saveChainHeadAtomic({ day, hash, seq: registro.seq });
      if (!persisted) return { ok: false, error: "chain_head_persist_failed" };
      return { ok: true, hash, prevHash: prev.hash, seq: registro.seq, day };
    } catch (error) {
      return { ok: false, error: sanitizeReason(String(error?.message || error)) };
    } finally {
      await releaseFileLock(fileLock);
    }
  });
}
/**
 * Verifica integridade da cadeia relendo o JSONL do dia.
 */
export function verifyChain(filePath, options = {}) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const lines = raw.trim().split("\n").filter(Boolean);
    let prev = options.initialPrevHash ?? "GENESIS";
    let seq = options.initialSeq ?? 0;
    for (const line of lines) {
      const reg = JSON.parse(line);
      if (reg.prevHash !== prev) return { ok: false, brokenAt: reg.seq, reason: "prev_hash_mismatch" };
      if (reg.seq !== seq + 1) return { ok: false, brokenAt: reg.seq, reason: "seq_mismatch" };
      const { hash, ...body } = reg;
      const recomputed = createHash("sha256")
        .update(prev + JSON.stringify(body))
        .digest("hex");
      if (recomputed !== hash) return { ok: false, brokenAt: reg.seq, reason: "hash_mismatch" };
      prev = hash;
      seq = reg.seq;
    }
    return { ok: true, verified: lines.length, lastHash: prev, lastSeq: seq };
  } catch (error) {
    return { ok: false, error: sanitizeReason(String(error?.message || error)) };
  }
}

/** Verifica todos os JSONL diários como uma cadeia contínua. */
export function verifyAuditDirectory(dirPath = AUDIT_DIR) {
  try {
    if (!fs.existsSync(dirPath)) return { ok: true, verified: 0, files: 0, lastHash: "GENESIS", lastSeq: 0 };
    const files = fs.readdirSync(dirPath)
      .filter((name) => /^mcp-admin-audit-\d{4}-\d{2}-\d{2}\.jsonl$/.test(name))
      .sort();
    let lastHash = "GENESIS";
    let lastSeq = 0;
    let verified = 0;
    for (const name of files) {
      const check = verifyChain(path.join(dirPath, name), { initialPrevHash: lastHash, initialSeq: lastSeq });
      if (!check.ok) return { ...check, file: name, verified, files: files.length };
      lastHash = check.lastHash;
      lastSeq = check.lastSeq;
      verified += check.verified;
    }
    return { ok: true, verified, files: files.length, lastHash, lastSeq };
  } catch (error) {
    return { ok: false, error: sanitizeReason(String(error?.message || error)) };
  }
}
// ── Startup snapshot idempotente ───────────────────────────────────────────
export async function auditStartupSnapshot(runtimeTools, options = {}) {
  const expectation = options.expectation ?? getCanonicalExpectation();
  const snapshot = reconcileCatalog(runtimeTools, expectation);
  const key = `${PID}:${snapshot.catalogHash}:${expectation.version ?? "no-version"}`;

  try {
    const st = JSON.parse(fs.readFileSync(STARTUP_LOCK, "utf8"));
    if (st.key === key && st.auditOk === true) {
      return { skipped: true, ready: true, reason: "already_registered_this_boot", snapshot };
    }
  } catch { /* primeira execução ou tentativa anterior falhou */ }

  const chainCheck = verifyAuditDirectory(AUDIT_DIR);
  // MOTIVO  > a prontidao do boot usava snapshot.ok, que fica false com
  //           QUALQUER divergencia — inclusive a quarentena que agora e
  //           esperada e registrada. Resultado observado em producao em
  //           2026-07-28: com 17 destrutivas no runtime e 12 no manifesto,
  //           auditStartupReady virou false e TODA destrutiva passou a
  //           responder AUDITORIA_STARTUP_INDISPONIVEL, inclusive as 12
  //           aprovadas. O bloqueio global tinha sido tirado do
  //           guardDestructive mas continuava aqui, um nivel acima.
  // ONDE    > apps/modulos/mcp/src/lib/admin-guard.js, auditStartupSnapshot.
  // RESOLVE > o boot so fica NAO-pronto quando a divergencia e DESCONHECIDA,
  //           isto e, uma destrutiva que nao esta nem nas aprovadas nem em
  //           destrutivasEmRevisao. Quarentena registrada e estado esperado:
  //           nao derruba o boot, e cada tool segue sendo decidida
  //           individualmente pelo guardDestructive.
  const nomesEmRevisao = (MANIFESTO.emRevisao ?? []).map((e) => e?.nome);
  const desconhecidas = (snapshot.quarantined ?? []).filter((n) => !nomesEmRevisao.includes(n));
  const divergenciaDesconhecida = desconhecidas.length > 0 || (snapshot.missing ?? []).length > 0;
  const preconditionsOk = !divergenciaDesconhecida && chainCheck.ok;

  const audit = await writeAuditEvent({
    tool: "__startup__",
    decision: preconditionsOk ? "released" : "blocked",
    executionStatus: "startup_snapshot",
    confirmationMode: "startup_snapshot",
    reason: `runtime_boot chain=${chainCheck.ok ? "ok" : "quebrada"}`
      + ` catalog=${snapshot.ok ? "ok" : (divergenciaDesconhecida ? "divergente_desconhecida" : "quarentena_registrada")}`
      + (desconhecidas.length ? ` desconhecidas=${desconhecidas.join(",")}` : "")
      + ((snapshot.missing ?? []).length ? ` ausentes=${snapshot.missing.join(",")}` : ""),
    catalogHash: snapshot.catalogHash,
    catalogVersion: expectation.version ?? CATALOG_VERSION,
    totalRuntimeTools: snapshot.totalRuntimeTools,
    destructiveCount: snapshot.destructiveCount,
    destructiveTools: snapshot.destructiveTools,
    divergences: snapshot.divergences,
  });
  const ready = preconditionsOk && audit.ok;

  if (ready) {
    try {
      fs.mkdirSync(AUDIT_DIR, { recursive: true });
      const tmp = STARTUP_LOCK + ".tmp." + PID;
      fs.writeFileSync(tmp, JSON.stringify({ key, at: new Date().toISOString(), auditOk: true }), { mode: 0o600 });
      fs.renameSync(tmp, STARTUP_LOCK);
    } catch {
      return { skipped: false, ready: false, snapshot, audit, chainCheck, error: "startup_lock_persist_failed" };
    }
  }

  return { skipped: false, ready, snapshot, audit, chainCheck };
}
/**
 * Guarda destrutiva: reconciliação + confirmação + auditoria → decisão.
 */
export async function guardDestructive({ toolName, confirmAdmin, runtimeTools, expectation, inputPayload, actor, correlationId, adminAuthorized }) {
  const effectiveExpectation = expectation ?? getCanonicalExpectation();
  const recon = reconcileCatalog(runtimeTools, effectiveExpectation);
  const evalRes = evaluateAdminConfirmation(confirmAdmin);
  const hasAdminScope = adminAuthorized === true;
  // Fail-closed PONTUAL: so bloqueia por catalogo se a tool PEDIDA for a
  // divergente. Divergencia em outra tool nao derruba esta. Ver MOTIVO em
  // reconcileCatalog.
  const emQuarentena = (recon.quarantined ?? []).includes(toolName);
  const sumiuDoRuntime = (recon.missing ?? []).includes(toolName);
  // A revisao independente pegou um fail-OPEN: uma toolName que nao existe em
  // runtimeTools NEM no manifesto nao caia em quarantined (que so lista
  // destrutivas VISTAS no runtime) nem em missing (que so lista aprovadas), e
  // por isso escapava das duas checagens de catalogo.
  // Listas sao arrays e a busca e por .includes(), entao nome herdado de
  // Object.prototype ("__proto__", "constructor", "toString") nao casa com
  // nada — mas isso agora esta travado por teste, nao por argumento.
  const nomeValido = typeof toolName === "string" && toolName.length > 0;
  const existeNoRuntime = Array.isArray(runtimeTools)
    && runtimeTools.some((t) => t?.name === toolName);
  // PRECEDENCIA: uma tool APROVADA que sumiu do runtime tambem "nao existe no
  // runtime", mas ela nao e desconhecida — ela esta no manifesto. Merece o
  // status proprio APROVADA_AUSENTE_NO_RUNTIME, que diz ao operador que a
  // tool sumiu do codigo, e nao que alguem chamou um nome inventado.
  // Os testes 22 e 34 pegaram exatamente essa inversao.
  const desconhecidaDeTodo = !nomeValido || (!existeNoRuntime && !sumiuDoRuntime);
  const catalogoOkParaEstaTool = !emQuarentena && !sumiuDoRuntime && !desconhecidaDeTodo;
  const wouldAuthorize = hasAdminScope && evalRes.decision === "released" && catalogoOkParaEstaTool;

  const audit = await writeAuditEvent({
    tool: toolName,
    decision: wouldAuthorize ? "released" : "blocked",
    executionStatus: wouldAuthorize ? "authorized" : "blocked",
    confirmationMode: evalRes.confirmationMode,
    reason: !hasAdminScope
      ? "admin_scope_required"
      : (desconhecidaDeTodo ? "tool_desconhecida"
        : (emQuarentena ? "destrutiva_em_quarentena"
          : (sumiuDoRuntime ? "aprovada_ausente_no_runtime" : evalRes.reason))),
    catalogHash: recon.catalogHash,
    catalogVersion: recon.catalogVersion,
    totalRuntimeTools: recon.totalRuntimeTools,
    destructiveCount: recon.destructiveCount,
    destructiveTools: recon.destructiveTools,
    divergences: recon.divergences,
    inputPayload,
    actor,
    correlationId,
  });

  if (!audit.ok) {
    return {
      allow: false,
      status: "AUDITORIA_INDISPONIVEL",
      executionStatus: "audit_failed",
      recon,
      auditError: audit.error,
      httpSafe: "Auditoria fail-closed: destrutiva bloqueada pontualmente. Leituras seguem livres.",
    };
  }
  if (!hasAdminScope) {
    return { allow: false, status: "ESCOPO_ADMIN_NECESSARIO", executionStatus: "blocked", recon, audit };
  }
  if (desconhecidaDeTodo) {
    return {
      allow: false, status: "TOOL_DESCONHECIDA", executionStatus: "blocked", recon, audit,
      httpSafe: "Ferramenta desconhecida: nao existe no runtime carregado. Bloqueada por padrao.",
    };
  }
  if (emQuarentena) {
    return {
      allow: false, status: "DESTRUTIVA_EM_QUARENTENA", executionStatus: "blocked", recon, audit,
      httpSafe: `A ferramenta "${toolName}" e destrutiva e nao consta no manifesto aprovado. `
        + "Quarentena pontual: as demais ferramentas seguem liberadas. Para aprova-la, rode "
        + "scripts/gerar-manifesto-destrutivas.mjs --revisar e acrescente a entrada no PR.",
    };
  }
  if (sumiuDoRuntime) {
    return {
      allow: false, status: "APROVADA_AUSENTE_NO_RUNTIME", executionStatus: "blocked", recon, audit,
      httpSafe: `A ferramenta "${toolName}" esta no manifesto aprovado mas nao foi encontrada no runtime.`,
    };
  }
  if (evalRes.decision === "blocked") {
    return { allow: false, status: "CONFIRMACAO_ADMIN_NECESSARIA", executionStatus: "blocked", recon, audit, confirmationEval: evalRes };
  }
  return { allow: true, status: "OK", executionStatus: "authorized", recon, audit, confirmationEval: evalRes };
}
