// CentralDark RED v1 — normalizacao segura do evento, sem logs, comandos ou secrets.
// A fonte de verdade do erro e o actor/receipt; a notificação é uma projeção.
import { createHash } from "node:crypto";

const MAX_LENGTH = 90;
export const RED_EVENT_SCHEMA = "centraldark.red.report.v1";
export const RED_PR_NUMBER = 1903;
export const RED_PR_BRANCH = "fix/pr-dos-red-cline-toolcall-20261022";
export const RED_RECEIPT_PATH = "docs/CONSCIENCIA/RECEIPTS/2026-10-22-pr-dos-red-cline-tool-routing.md";
const ALLOWED_SURFACES = new Set(["CLINE", "ZENDRIVE", "HERMES", "MCP", "COCKPIT", "GITHUB_ACTIONS"]);
const ALLOWED_CATEGORIES = new Set([
  "NOT_ADVERTISED", "ADVERTISED_BUT_REJECTED", "TOOL_REGISTRY_PARITY_BLOCKED",
  "RETRY_LOOP_BLOCKED", "SHELL_CONTEXT_ERROR", "COMMAND_EXECUTION_ERROR",
  "BUILD_TEST_FAIL", "RUNTIME_PROOF_FAIL", "OTHER_REPRODUCED_ERROR",
]);
const ALLOWED_ERROR_CODES = new Set([
  "AI_NoSuchToolError", "INVALID_ARGUMENTS", "COMMAND_FAILED",
  "TIMEOUT", "CI_FAILED", "RUNTIME_FAILED", "UNKNOWN_ERROR",
]);

function limited(value, fallback = "UNKNOWN") {
  const v = typeof value === "string" ? value.trim() : "";
  if (!v) return fallback;
  // Permit only opaque identifiers; no raw logs, URL credentials, emails or multiline.
  if (!/^[A-Za-z0-9_.:/-]{1,90}$/.test(v)) return fallback;
  return v.slice(0, MAX_LENGTH);
}

export function normalizeRedReport(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("RED_INPUT_NOT_OBJECT");
  }
  const surface = limited(input.surface, "");
  const category = limited(input.category, "");
  const errorCode = limited(input.error_code, "");
  const toolName = limited(input.tool_name, "");
  if (!ALLOWED_SURFACES.has(surface)) throw new Error("RED_SURFACE_INVALID");
  if (!ALLOWED_CATEGORIES.has(category)) throw new Error("RED_CATEGORY_INVALID");
  if (!ALLOWED_ERROR_CODES.has(errorCode)) throw new Error("RED_ERROR_CODE_INVALID");
  if (!toolName || toolName === "UNKNOWN") throw new Error("RED_TOOL_NAME_REQUIRED");

  const host = limited(input.host);
  const model = limited(input.model);
  const sourceSha = limited(input.source_sha);
  const intentId = limited(input.intent_id, "CENTRALDARK-MICHELIN-50-FIXED-POINT");
  const identity = [surface,host,category,errorCode,toolName].join("|");
  const fingerprint = createHash("sha256").update(identity).digest("hex").slice(0, 24);
  return Object.freeze({
    schema: RED_EVENT_SCHEMA,
    surface, category, error_code: errorCode, tool_name: toolName,
    host, model, source_sha: sourceSha, intent_id: intentId,
    fingerprint,
    proof_state: "FAIL_OBSERVED",
    publication_mode: "AUTOMATED_PROJECTION_NOT_RUNTIME_FIX",
    pr_number: RED_PR_NUMBER,
    next_cursor: "DIAGNOSE_OWNER_THEN_CONTRAPROOF",
  });
}

export function receiptComment(red, seq) {
  const redId = Number.isInteger(seq) && seq > 0 ? String(seq).padStart(3, "0") : "UNNUMBERED";
  const marker = "<!-- centraldark.red.v1:" + red.fingerprint + " -->";
  return [
    marker,
    "🔴 **RED #" + redId + " · " + red.error_code + "**",
    "",
    "| Campo | Valor |", "|---|---|",
    "| Origem | \`" + red.surface + "\` · \`" + red.host + "\` |",
    "| Ferramenta | \`" + red.tool_name + "\` |",
    "| Categoria | \`" + red.category + "\` |",
    "| Fingerprint | \`" + red.fingerprint + "\` |",
    "| Modelo informado | \`" + red.model + "\` |",
    "| Source SHA | \`" + red.source_sha + "\` |",
    "| Estado | 🔴 FAIL_OBSERVED · FIX_PENDING |",
    "| Próxima etapa | \`" + red.next_cursor + "\` |",
    "",
    "Fonte: observação do executor autenticado; sem logs brutos, tokens, prompts ou segredos.",
    "SOURCE_EVENT != ROOT_CAUSE_PROVEN != TOOL_ROUTER_FIXED != END_TO_END_PASS.",
  ].join("\n");
}

export function isSameRed(comment, fingerprint) {
  return typeof comment === "string"
    && comment.includes("<!-- centraldark.red.v1:" + fingerprint + " -->");
}
