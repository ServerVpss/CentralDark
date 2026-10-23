import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  normalizeRedReport, receiptComment, isSameRed,
  RED_EVENT_SCHEMA, RED_PR_NUMBER, RED_PR_BRANCH,
} from "./centraldark-red-intake.mjs";

const sample = {
  surface: "CLINE", category: "ADVERTISED_BUT_REJECTED",
  error_code: "AI_NoSuchToolError", tool_name: "read_files",
  host: "CASA", model: "nemotron-3.5", source_sha: "deadbeef",
};

test("RED v1 reproduz fingerprint estável, sem dados brutos", () => {
  const a = normalizeRedReport(sample);
  const b = normalizeRedReport({ ...sample, raw_error: "Bearer secret; PRIVATE_PROMPT" });
  assert.deepEqual(a, b);
  assert.equal(a.schema, RED_EVENT_SCHEMA);
  assert.equal(a.fingerprint.length, 24);
  assert.equal(a.pr_number, 1903);
  assert.equal(a.proof_state, "FAIL_OBSERVED");
  assert.equal(JSON.stringify(a).includes("PRIVATE_PROMPT"), false);
});

test("Categorias, origens e ferramentas inválidas falham fechadas", () => {
  for (const payload of [
    null, [], {}, { ...sample, category: "ADMIN_ROOT_OVERRIDE" },
    { ...sample, surface: "PUBLIC_ANON" },
    { ...sample, error_code: "anything;rm -rf" },
    { ...sample, tool_name: "read_files --token PRIVATE" },
    { ...sample, tool_name: "" },
  ]) assert.throws(() => normalizeRedReport(payload));
});

test("Modelos e comandos nunca criam lógica privilegiada", () => {
  const a = normalizeRedReport({ ...sample, model: "Luna 5.6", message: "Authorization: Bearer SECRET" });
  assert.equal(a.model, "UNKNOWN");
  assert.equal("message" in a, false);
  assert.equal(a.error_code, sample.error_code);
});

test("Identidade diferencia superfície, host, classe e ferramenta", () => {
  const a = normalizeRedReport(sample);
  for (const differing of [
    { host: "VPS" }, { tool_name: "run_commands" },
    { surface: "HERMES" }, { category: "NOT_ADVERTISED" },
  ]) assert.notEqual(a.fingerprint, normalizeRedReport({ ...sample, ...differing }).fingerprint);
});

test("Comentário PR é legível, deduplicável, sem falsely fixed", () => {
  const a = normalizeRedReport(sample);
  const comment = receiptComment(a, 2);
  assert.equal(isSameRed(comment, a.fingerprint), true);
  assert.equal(isSameRed("other receipt", a.fingerprint), false);
  assert.match(comment, /RED #002/);
  assert.match(comment, /FIX_PENDING/);
  assert.match(comment, /SOURCE_EVENT != ROOT_CAUSE_PROVEN/);
});

test("Branch, PR, workflow e cockpit existentes preservam boundary", () => {
  assert.equal(RED_PR_BRANCH, "fix/pr-dos-red-cline-toolcall-20261022");
  assert.equal(RED_PR_NUMBER, 1903);
  const flow = readFileSync(new URL("../../.github/workflows/centraldark-pr-dos-red.yml", import.meta.url), "utf8");
  const panel = readFileSync(new URL("../../apps/instinto-superior/src/components/central/CentralNotificacoes.tsx", import.meta.url), "utf8");
  const hook = readFileSync(new URL("../../apps/instinto-superior/src/hooks/useNotificationsLog.ts", import.meta.url), "utf8");
  assert.match(flow, /repository_dispatch/);
  assert.match(flow, /centraldark_red_v1/);
  assert.match(flow, /CENTRALDARK_SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(flow, /persist-credentials: false/);
  assert.match(flow, /ref: main/);
  assert.match(panel, /Filtro do PR dos RED/);
  assert.match(panel, /linkRedValido/);
  assert.match(hook, /postgres_changes/);
  assert.match(hook, /notifications_log/);
});

test("Publicador não cria arquitetura paralela nem client secret frontend", () => {
  const code = readFileSync(new URL("./centraldark-red-publish.mjs", import.meta.url), "utf8");
  assert.match(code, /SUPABASE_SECRET_BINDINGS_ABSENT/);
  assert.match(code, /githubReceipt/);
  assert.match(code, /dedupe_hash/);
  assert.match(code, /receipt\.sha/);
  assert.doesNotMatch(code, /reset --hard|git clean -fdx|force.push/);
  assert.doesNotMatch(code, /process\.stdout\.write\(JSON\.stringify\(input\)/);
});

test("RED #003: comando executado no shell errado difere de NoSuchToolError", () => {
  const previous = normalizeRedReport({
    surface: "CLINE", host: "CASA", category: "ADVERTISED_BUT_REJECTED",
    error_code: "AI_NoSuchToolError", tool_name: "read_files",
  });
  const shell = normalizeRedReport({
    surface: "CLINE", host: "CASA", category: "SHELL_CONTEXT_ERROR",
    error_code: "COMMAND_FAILED", tool_name: "run_commands",
  });
  assert.notEqual(shell.fingerprint, previous.fingerprint);
  assert.equal(shell.proof_state, "FAIL_OBSERVED");
  assert.match(receiptComment(shell, 3), /RED #003/);
});
