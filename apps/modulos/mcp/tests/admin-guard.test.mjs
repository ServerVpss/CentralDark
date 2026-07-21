// Testes standalone (Node puro, sem framework) do admin-guard.
// Roda com: node --test admin-guard.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Isolar o diretório de auditoria pra cada rodada
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-guard-"));
process.env.MCP_AUDIT_DIR = TMP;
process.env.MCP_ADMIN_CHAIN_STATE = path.join(TMP, ".chain.json");

const {
  evaluateAdminConfirmation,
  reconcileCatalog,
  writeAuditEvent,
  verifyChain,
  guardDestructive,
  auditStartupSnapshot,
} = await import("../lib/admin-guard.js");

// Runtime de 83 tools com 12 destrutivas — espelho do estado real
function makeRuntime() {
  const destructiveNames = [
    "admin_git_pull","admin_pm2_restart","admin_shell_exec","admin_vault_write",
    "atualizar_consciencia","execute_command","github_delete_file_safe",
    "github_delete_branch_safe","github_delete_workflow_run","github_merge_pull_request",
    "mcp_admin_call","vps_run_once_script",
  ];
  const tools = destructiveNames.map((name) => ({ name, annotations: { destructiveHint: true } }));
  for (let i = 0; i < 71; i++) tools.push({ name: `read_only_${i}`, annotations: { destructiveHint: false } });
  return { tools, destructiveNames };
}

test("confirmação ausente → blocked", () => {
  const r = evaluateAdminConfirmation(undefined);
  assert.equal(r.decision, "blocked");
  assert.equal(r.confirmationMode, null);
});
test("CONFIRMO ADMIN → released", () => {
  const r = evaluateAdminConfirmation("CONFIRMO ADMIN");
  assert.equal(r.decision, "released");
  assert.equal(r.confirmationMode, "confirmo_admin");
});
test("PERMITO PIVETE → released", () => {
  const r = evaluateAdminConfirmation("PERMITO PIVETE");
  assert.equal(r.decision, "released");
  assert.equal(r.confirmationMode, "permito_pivete");
});
test("confirmação inválida → blocked", () => {
  const r = evaluateAdminConfirmation("qualquer coisa");
  assert.equal(r.decision, "blocked");
});

test("reconcileCatalog: consistente com expectativa 83/12", () => {
  const { tools, destructiveNames } = makeRuntime();
  const rec = reconcileCatalog(tools, {
    expectedDestructiveCount: 12,
    expectedDestructiveNames: destructiveNames,
  });
  assert.equal(rec.ok, true);
  assert.equal(rec.totalRuntimeTools, 83);
  assert.equal(rec.destructiveCount, 12);
});
test("reconcileCatalog: divergência por contagem", () => {
  const { tools } = makeRuntime();
  const rec = reconcileCatalog(tools, { expectedDestructiveCount: 10 });
  assert.equal(rec.ok, false);
  assert.equal(rec.divergences[0].kind, "count_mismatch");
});
test("reconcileCatalog: divergência por lista faltando/sobrando", () => {
  const { tools } = makeRuntime();
  const rec = reconcileCatalog(tools, { expectedDestructiveNames: ["so_essa_aqui"] });
  assert.equal(rec.ok, false);
  const kinds = rec.divergences.map((d) => d.kind).sort();
  assert.deepEqual(kinds, ["extra_destructive","missing_destructive"]);
});

test("hash chain: 3 escritas encadeiam e verifyChain aprova", () => {
  const a = writeAuditEvent({ tool: "t1", decision: "released", reason: "x" });
  const b = writeAuditEvent({ tool: "t2", decision: "blocked", reason: "y" });
  const c = writeAuditEvent({ tool: "t3", decision: "released", reason: "z" });
  assert.ok(a.ok && b.ok && c.ok);
  assert.equal(b.prevHash, a.hash);
  assert.equal(c.prevHash, b.hash);
  const dia = new Date().toISOString().slice(0, 10);
  const arq = path.join(TMP, `mcp-admin-audit-${dia}.jsonl`);
  const v = verifyChain(arq);
  assert.equal(v.ok, true);
});
test("hash chain: adulteração é detectada", () => {
  const dia = new Date().toISOString().slice(0, 10);
  const arq = path.join(TMP, `mcp-admin-audit-${dia}.jsonl`);
  const linhas = fs.readFileSync(arq, "utf8").trim().split("\n");
  const alvo = JSON.parse(linhas[1]);
  alvo.reason = "MOD"; // altera o meio da cadeia
  linhas[1] = JSON.stringify(alvo);
  fs.writeFileSync(arq, linhas.join("\n") + "\n");
  const v = verifyChain(arq);
  assert.equal(v.ok, false);
});

test("sanitização: segredos no reason não são gravados em claro", () => {
  const fresh = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-guard-san-"));
  process.env.MCP_AUDIT_DIR = fresh;
  process.env.MCP_ADMIN_CHAIN_STATE = path.join(fresh, ".chain.json");
  return import("../lib/admin-guard.js?v=san").then(({ writeAuditEvent: w }) => {
    w({ tool: "leak", decision: "blocked",
      reason: "Bearer eyJabc.def.ghi sk-1234567890abcdef1234 ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890" });
    const dia = new Date().toISOString().slice(0, 10);
    const raw = fs.readFileSync(path.join(fresh, `mcp-admin-audit-${dia}.jsonl`), "utf8");
    assert.ok(!raw.includes("eyJabc.def.ghi"), "JWT vazou");
    assert.ok(!raw.includes("sk-1234567890abcdef1234"), "sk- vazou");
    assert.ok(!raw.includes("ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ"), "gh token vazou");
    assert.ok(raw.includes("[REDACTED"), "redação não aplicada");
    process.env.MCP_AUDIT_DIR = TMP;
    process.env.MCP_ADMIN_CHAIN_STATE = path.join(TMP, ".chain.json");
  });
});

test("guardDestructive: catálogo consistente + PERMITO PIVETE → allow", () => {
  const { tools, destructiveNames } = makeRuntime();
  const g = guardDestructive({
    toolName: "admin_pm2_restart", confirmAdmin: "PERMITO PIVETE",
    runtimeTools: tools,
    expectation: { expectedDestructiveCount: 12, expectedDestructiveNames: destructiveNames },
    inputPayload: { name: "hub-bot", secret: "NAO_DEVE_APARECER" },
  });
  assert.equal(g.allow, true);
  assert.equal(g.status, "OK");
});
test("guardDestructive: divergência bloqueia mesmo com confirmação", () => {
  const { tools } = makeRuntime();
  const g = guardDestructive({
    toolName: "admin_pm2_restart", confirmAdmin: "CONFIRMO ADMIN",
    runtimeTools: tools,
    expectation: { expectedDestructiveCount: 999 },
  });
  assert.equal(g.allow, false);
  assert.equal(g.status, "DIVERGENCIA_CATALOGO");
});
test("guardDestructive: input keys sanitizadas (sem valores)", () => {
  const { tools, destructiveNames } = makeRuntime();
  guardDestructive({
    toolName: "admin_pm2_restart", confirmAdmin: "PERMITO PIVETE",
    runtimeTools: tools,
    expectation: { expectedDestructiveCount: 12, expectedDestructiveNames: destructiveNames },
    inputPayload: { name: "x", authorization: "Bearer secret" },
  });
  const dia = new Date().toISOString().slice(0, 10);
  const raw = fs.readFileSync(path.join(TMP, `mcp-admin-audit-${dia}.jsonl`), "utf8");
  assert.ok(!raw.includes("Bearer secret"));
  assert.ok(!raw.includes('"authorization"'), "chave sensível não foi filtrada");
});

test("startup snapshot: idempotente na mesma inicialização", () => {
  const { tools } = makeRuntime();
  const a = auditStartupSnapshot(tools);
  const b = auditStartupSnapshot(tools);
  assert.equal(a.skipped, false);
  assert.equal(b.skipped, true);
  assert.equal(a.snapshot.totalRuntimeTools, 83);
  assert.equal(a.snapshot.destructiveCount, 12);
});

test("concorrência: leitura segue livre enquanto destrutiva reconcilia", async () => {
  const { tools, destructiveNames } = makeRuntime();
  const readOnlyPromise = Promise.resolve().then(() => "read-ok");
  const destructivePromise = Promise.resolve().then(() => guardDestructive({
    toolName: "admin_pm2_restart", confirmAdmin: "CONFIRMO ADMIN", runtimeTools: tools,
    expectation: { expectedDestructiveCount: 12, expectedDestructiveNames: destructiveNames },
  }));
  const [r, d] = await Promise.all([readOnlyPromise, destructivePromise]);
  assert.equal(r, "read-ok");
  assert.equal(d.allow, true);
});
