// admin-guard.js — módulo canônico de auditoria + reconciliação para tools destrutivas.
// Uso: importado pelo dispatcher `mcp_admin_call` (tools/core/mcp-admin.js).
//
// Regras (autorizadas pelo Pivete):
// - Aceita EXATAMENTE dois sinais administrativos: "CONFIRMO ADMIN" e "PERMITO PIVETE".
// - Auditoria append-only com hash chain simples (linked-hash) no MESMO diretório
//   canônico já usado por lib/audit.js (nenhum serviço novo, nenhum banco novo).
// - Falha de gravação da auditoria => fail-closed APENAS para a destrutiva atual.
//   Leituras, chat e tools não destrutivas seguem livres.
// - Reconciliação local à requisição, sem lock global, sem fila, sem loop.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { createHash, randomUUID } from "node:crypto";

const AUDIT_DIR = process.env.MCP_AUDIT_DIR || "/root/CentralDark/logs";
const CHAIN_STATE = process.env.MCP_ADMIN_CHAIN_STATE
  || path.join(AUDIT_DIR, ".mcp-admin-chain.json");
const HOSTNAME = os.hostname();
const PID = process.pid;

export const ADMIN_CONFIRMATIONS = Object.freeze({
  "CONFIRMO ADMIN": "confirmo_admin",
  "PERMITO PIVETE": "permito_pivete",
});

const SENSITIVE_KEY_RE = /(authorization|cookie|password|senha|secret|token|api[_-]?key|private[_-]?key|refresh[_-]?token|access[_-]?token|credential|credencial)/i;

function sanitizeReason(reason) {
  if (typeof reason !== "string") return null;
  // remove qualquer coisa parecida com token/bearer/jwt/sk-
  return reason
    .replace(/\bBearer\s+[A-Za-z0-9._~+/=-]{8,}/gi, "Bearer [REDACTED]")
    .replace(/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\b/g, "[REDACTED_JWT]")
    .replace(/\bsk-[A-Za-z0-9_-]{16,}\b/g, "[REDACTED_KEY]")
    .replace(/\bgh[pousr]_[A-Za-z0-9_]{20,}\b/g, "[REDACTED_GH]")
    .slice(0, 500);
}

function safeKeys(input) {
  // Retorna SÓ os nomes de chaves do payload — NUNCA valores.
  if (!input || typeof input !== "object") return [];
  return Object.keys(input)
    .filter((k) => !SENSITIVE_KEY_RE.test(k))
    .slice(0, 30);
}

/**
 * Avalia string de confirmação administrativa.
 * @returns {{ decision: 'released'|'blocked', confirmationMode: string|null, reason: string }}
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

function loadChainHead() {
  try {
    const raw = fs.readFileSync(CHAIN_STATE, "utf8");
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.hash === "string") return parsed;
  } catch { /* primeira execução: cadeia vazia */ }
  return { hash: "GENESIS", seq: 0 };
}

function saveChainHead(next) {
  try {
    fs.mkdirSync(path.dirname(CHAIN_STATE), { recursive: true });
    fs.writeFileSync(CHAIN_STATE, JSON.stringify(next), { mode: 0o600 });
    return true;
  } catch { return false; }
}

/**
 * Snapshot verificável do catálogo em runtime.
 * @param {Array<{name:string, annotations?:{destructiveHint?:boolean}}>} runtimeTools
 * @param {{ expectedDestructiveCount?: number, expectedDestructiveNames?: string[] }} [expectation]
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
    divergences,
    checkedAt: new Date().toISOString(),
  };
}

/**
 * Grava evento na auditoria com hash chain.
 * @returns {{ ok: boolean, hash?: string, prevHash?: string, seq?: number, error?: string }}
 */
export function writeAuditEvent(evento) {
  try {
    fs.mkdirSync(AUDIT_DIR, { recursive: true });
    const prev = loadChainHead();
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
      decision: evento.decision,                       // "blocked" | "released"
      confirmationMode: evento.confirmationMode ?? null,
      reason: sanitizeReason(evento.reason),
      catalogHash: evento.catalogHash ?? null,
      catalogVersion: evento.catalogVersion ?? null,
      totalRuntimeTools: evento.totalRuntimeTools ?? null,
      destructiveCount: evento.destructiveCount ?? null,
      divergences: evento.divergences ?? null,
      inputKeys: safeKeys(evento.inputPayload),        // só nomes de chaves, nunca valores
    };

    const hash = createHash("sha256")
      .update(prev.hash + JSON.stringify(registro))
      .digest("hex");
    registro.hash = hash;

    const dia = timestamp.slice(0, 10);
    const arquivo = path.join(AUDIT_DIR, `mcp-admin-audit-${dia}.jsonl`);
    fs.appendFileSync(arquivo, JSON.stringify(registro) + "\n", { mode: 0o600 });

    const persisted = saveChainHead({ hash, seq: registro.seq });
    if (!persisted) {
      // linha gravada, mas cabeça da cadeia não persistiu — fail-closed pra próxima
      return { ok: false, error: "chain_head_persist_failed" };
    }
    return { ok: true, hash, prevHash: prev.hash, seq: registro.seq };
  } catch (e) {
    return { ok: false, error: String(e?.message || e) };
  }
}

/**
 * Verifica integridade da cadeia relendo o JSONL do dia.
 * Útil pra teste de adulteração.
 */
export function verifyChain(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const linhas = raw.trim().split("\n").filter(Boolean);
    let prev = "GENESIS";
    for (const linha of linhas) {
      const reg = JSON.parse(linha);
      if (reg.prevHash !== prev) {
        return { ok: false, brokenAt: reg.seq, reason: "prev_hash_mismatch" };
      }
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

// ── Startup snapshot idempotente ─────────────────────────────────────
// Idempotente pela chave (PID + catalogHash): não duplica na mesma inicialização.
const STARTUP_LOCK = path.join(AUDIT_DIR, ".mcp-admin-startup.json");
export function auditStartupSnapshot(runtimeTools) {
  const snapshot = reconcileCatalog(runtimeTools);
  const key = `${PID}:${snapshot.catalogHash}`;
  try {
    const raw = fs.readFileSync(STARTUP_LOCK, "utf8");
    const st = JSON.parse(raw);
    if (st.key === key) return { skipped: true, reason: "already_registered_this_boot", snapshot };
  } catch { /* primeira execução */ }
  const res = writeAuditEvent({
    tool: "__startup__",
    decision: "released",
    confirmationMode: "startup_snapshot",
    reason: "runtime_boot",
    catalogHash: snapshot.catalogHash,
    totalRuntimeTools: snapshot.totalRuntimeTools,
    destructiveCount: snapshot.destructiveCount,
    divergences: snapshot.divergences,
  });
  try {
    fs.mkdirSync(AUDIT_DIR, { recursive: true });
    fs.writeFileSync(STARTUP_LOCK, JSON.stringify({ key, at: new Date().toISOString() }), { mode: 0o600 });
  } catch { /* best effort */ }
  return { skipped: false, snapshot, audit: res };
}

/**
 * Guarda destrutiva de alto nível: junta reconciliação + confirmação + auditoria.
 * Retorna decisão pronta pro dispatcher chamar tool.handler ou retornar erro.
 */
export function guardDestructive({ toolName, confirmAdmin, runtimeTools, expectation, inputPayload, actor, correlationId }) {
  const recon = reconcileCatalog(runtimeTools, expectation);
  const evalRes = evaluateAdminConfirmation(confirmAdmin);
  const wouldRelease = evalRes.decision === "released" && recon.ok;

  const audit = writeAuditEvent({
    tool: toolName,
    decision: wouldRelease ? "released" : "blocked",
    confirmationMode: evalRes.confirmationMode,
    reason: !recon.ok ? "catalog_divergence" : evalRes.reason,
    catalogHash: recon.catalogHash,
    totalRuntimeTools: recon.totalRuntimeTools,
    destructiveCount: recon.destructiveCount,
    divergences: recon.divergences,
    inputPayload,
    actor,
    correlationId,
  });

  // fail-closed: se a auditoria não gravou, negar SÓ esta destrutiva
  if (!audit.ok) {
    return {
      allow: false,
      status: "AUDITORIA_INDISPONIVEL",
      recon,
      auditError: audit.error,
      httpSafe: "Auditoria fail-closed: destrutiva bloqueada pontualmente. Leituras seguem livres.",
    };
  }
  if (!recon.ok) {
    return { allow: false, status: "DIVERGENCIA_CATALOGO", recon, audit };
  }
  if (evalRes.decision === "blocked") {
    return { allow: false, status: "CONFIRMACAO_ADMIN_NECESSARIA", recon, audit, confirmationEval: evalRes };
  }
  return { allow: true, status: "OK", recon, audit, confirmationEval: evalRes };
}
