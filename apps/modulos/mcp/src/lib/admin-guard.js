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

const AUDIT_DIR = process.env.MCP_AUDIT_DIR || "/root/CentralDark/logs";
const CHAIN_STATE = process.env.MCP_ADMIN_CHAIN_STATE
  || path.join(AUDIT_DIR, ".mcp-admin-chain.json");
const STARTUP_LOCK = process.env.MCP_ADMIN_STARTUP_LOCK
  || path.join(AUDIT_DIR, ".mcp-admin-startup.json");
const HOSTNAME = os.hostname();
const PID = process.pid;

export const CATALOG_VERSION = "v1-2026-07-21";

export const ADMIN_CONFIRMATIONS = Object.freeze({
  "CONFIRMO ADMIN": "confirmo_admin",
  "PERMITO PIVETE": "permito_pivete",
});

// Fonte única da verdade da expectativa canônica de destrutivas.
// Usada pelo dispatcher (via getCanonicalExpectation) e pelos testes.
// Extração: derivada 1x do runtime real (mcp_admin_catalog em 2026-07-21, 12 tools com destructiveHint=true),
// congelada aqui como baseline versionado. Divergência com runtime bloqueia a destrutiva.
export const CANONICAL_DESTRUCTIVE_TOOLS = Object.freeze([
  "admin_git_pull",
  "admin_pm2_restart",
  "admin_shell_exec",
  "admin_vault_write",
  "atualizar_consciencia",
  "execute_command",
  "github_delete_branch_safe",
  "github_delete_file_safe",
  "github_delete_workflow_run",
  "github_merge_pull_request",
  "vps_run_once_script",
  "vps_write_file_safe",
]);

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
  const mode = ADMIN_CONFIRMATIONS[trimmed];
  if (mode) return { decision: "released", confirmationMode: mode, reason: "confirmacao_valida" };
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
  if (Array.isArray(expectation.expectedDestructiveNames)) {
    const expected = [...expectation.expectedDestructiveNames].sort();
    const missing = expected.filter((n) => !destructiveTools.includes(n));
    const extra = destructiveTools.filter((n) => !expected.includes(n));
    if (missing.length) divergences.push({ kind: "missing_destructive", names: missing });
    if (extra.length) divergences.push({ kind: "extra_destructive", names: extra });
  }

  return {
    ok: divergences.length === 0,
    totalRuntimeTools: total,
    destructiveCount,
    destructiveTools,
    catalogHash,
    catalogVersion: expectation.version ?? null,
    divergences,
    checkedAt: new Date().toISOString(),
  };
}

// ── Mutex de escrita intra-processo ────────────────────────────────────────
// Serializa APENAS append+chain-head. Leitura e não-destrutivas não passam por aqui.
let auditWriteChain = Promise.resolve();
function withAuditLock(fn) {
  const prev = auditWriteChain;
  const next = prev.then(() => fn()).catch(() => fn());
  auditWriteChain = next.then(() => undefined, () => undefined);
  return next;
}

function readChainHeadSync() {
  try {
    const raw = fs.readFileSync(CHAIN_STATE, "utf8");
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.hash === "string") return parsed;
  } catch { /* primeira execução */ }
  return { hash: "GENESIS", seq: 0 };
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

function appendAuditLine(dia, linha) {
  fs.mkdirSync(AUDIT_DIR, { recursive: true });
  const arquivo = path.join(AUDIT_DIR, `mcp-admin-audit-${dia}.jsonl`);
  const fd = fs.openSync(arquivo, "a", 0o600);
  try { fs.writeSync(fd, linha); } finally { fs.closeSync(fd); }
  return arquivo;
}

/**
 * Grava evento na auditoria com hash chain. Serializada intra-processo.
 */
export function writeAuditEvent(evento) {
  return withAuditLock(async () => {
    try {
      const prev = readChainHeadSync();
      const timestamp = new Date().toISOString();

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

      const dia = timestamp.slice(0, 10);
      appendAuditLine(dia, JSON.stringify(registro) + "\n");

      const persisted = saveChainHeadAtomic({ hash, seq: registro.seq });
      if (!persisted) return { ok: false, error: "chain_head_persist_failed" };
      return { ok: true, hash, prevHash: prev.hash, seq: registro.seq };
    } catch (e) {
      return { ok: false, error: String(e?.message || e) };
    }
  });
}

/**
 * Verifica integridade da cadeia relendo o JSONL do dia.
 */
export function verifyChain(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const linhas = raw.trim().split("\n").filter(Boolean);
    let prev = "GENESIS";
    for (const linha of linhas) {
      const reg = JSON.parse(linha);
      if (reg.prevHash !== prev) return { ok: false, brokenAt: reg.seq, reason: "prev_hash_mismatch" };
      const { hash, ...body } = reg;
      const recomputed = createHash("sha256")
        .update(prev + JSON.stringify(body))
        .digest("hex");
      if (recomputed !== hash) return { ok: false, brokenAt: reg.seq, reason: "hash_mismatch" };
      prev = hash;
    }
    return { ok: true, verified: linhas.length };
  } catch (e) { return { ok: false, error: String(e?.message || e) }; }
}

// ── Startup snapshot idempotente ───────────────────────────────────────────
export async function auditStartupSnapshot(runtimeTools, options = {}) {
  const expectation = options.expectation ?? getCanonicalExpectation();
  const snapshot = reconcileCatalog(runtimeTools, expectation);
  const key = `${PID}:${snapshot.catalogHash}:${expectation.version ?? "no-version"}`;

  try {
    const raw = fs.readFileSync(STARTUP_LOCK, "utf8");
    const st = JSON.parse(raw);
    if (st.key === key) return { skipped: true, reason: "already_registered_this_boot", snapshot };
  } catch { /* primeira execução */ }

  const dia = new Date().toISOString().slice(0, 10);
  const arqDia = path.join(AUDIT_DIR, `mcp-admin-audit-${dia}.jsonl`);
  const chainCheck = fs.existsSync(arqDia)
    ? verifyChain(arqDia)
    : { ok: true, verified: 0, note: "sem_entradas_hoje" };

  const audit = await writeAuditEvent({
    tool: "__startup__",
    decision: "released",
    executionStatus: "startup_snapshot",
    confirmationMode: "startup_snapshot",
    reason: `runtime_boot chain=${chainCheck.ok ? "ok" : "quebrada:" + (chainCheck.reason || chainCheck.error)}`,
    catalogHash: snapshot.catalogHash,
    catalogVersion: expectation.version ?? CATALOG_VERSION,
    totalRuntimeTools: snapshot.totalRuntimeTools,
    destructiveCount: snapshot.destructiveCount,
    destructiveTools: snapshot.destructiveTools,
    divergences: snapshot.divergences,
  });

  try {
    fs.mkdirSync(AUDIT_DIR, { recursive: true });
    const tmp = STARTUP_LOCK + ".tmp." + PID;
    fs.writeFileSync(tmp, JSON.stringify({ key, at: new Date().toISOString(), auditOk: !!audit.ok }), { mode: 0o600 });
    fs.renameSync(tmp, STARTUP_LOCK);
  } catch { /* best effort */ }

  return { skipped: false, snapshot, audit, chainCheck };
}

/**
 * Guarda destrutiva: reconciliação + confirmação + auditoria → decisão.
 */
export async function guardDestructive({ toolName, confirmAdmin, runtimeTools, expectation, inputPayload, actor, correlationId }) {
  const effectiveExpectation = expectation ?? getCanonicalExpectation();
  const recon = reconcileCatalog(runtimeTools, effectiveExpectation);
  const evalRes = evaluateAdminConfirmation(confirmAdmin);
  const wouldAuthorize = evalRes.decision === "released" && recon.ok;

  const audit = await writeAuditEvent({
    tool: toolName,
    decision: wouldAuthorize ? "released" : "blocked",
    executionStatus: wouldAuthorize ? "authorized" : "blocked",
    confirmationMode: evalRes.confirmationMode,
    reason: !recon.ok ? "catalog_divergence" : evalRes.reason,
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
  if (!recon.ok) {
    return { allow: false, status: "DIVERGENCIA_CATALOGO", executionStatus: "blocked", recon, audit };
  }
  if (evalRes.decision === "blocked") {
    return { allow: false, status: "CONFIRMACAO_ADMIN_NECESSARIA", executionStatus: "blocked", recon, audit, confirmationEval: evalRes };
  }
  return { allow: true, status: "OK", executionStatus: "authorized", recon, audit, confirmationEval: evalRes };
}
