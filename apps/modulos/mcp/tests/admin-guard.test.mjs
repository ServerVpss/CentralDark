// Testes standalone (Node puro) do admin-guard. Roda com: node --test admin-guard.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-guard-"));
process.env.MCP_AUDIT_DIR = TMP;
process.env.MCP_ADMIN_CHAIN_STATE = path.join(TMP, ".chain.json");
process.env.MCP_ADMIN_STARTUP_LOCK = path.join(TMP, ".startup.json");

const {
  evaluateAdminConfirmation, reconcileCatalog, writeAuditEvent, verifyChain,
  guardDestructive, auditStartupSnapshot, getCanonicalExpectation,
  CANONICAL_DESTRUCTIVE_TOOLS, CATALOG_VERSION,
} = await import("../src/lib/admin-guard.js");

function makeRuntime() {
  const tools = CANONICAL_DESTRUCTIVE_TOOLS.map((name) => ({ name, annotations: { destructiveHint: true } }));
  for (let i = 0; i < 71; i++) tools.push({ name: `read_only_${i}`, annotations: { destructiveHint: false } });
  return { tools };
}
const diaHoje = () => new Date().toISOString().slice(0, 10);
const arqDia = () => path.join(TMP, `mcp-admin-audit-${diaHoje()}.jsonl`);

test("confirmação ausente → blocked", () => {
  assert.equal(evaluateAdminConfirmation(undefined).decision, "blocked");
});
test("CONFIRMO ADMIN → released (confirmo_admin)", () => {
  const r = evaluateAdminConfirmation("CONFIRMO ADMIN");
  assert.equal(r.decision, "released"); assert.equal(r.confirmationMode, "confirmo_admin");
});
test("PERMITO PIVETE → released (permito_pivete)", () => {
  const r = evaluateAdminConfirmation("PERMITO PIVETE");
  assert.equal(r.decision, "released"); assert.equal(r.confirmationMode, "permito_pivete");
});
test("confirmação inválida → blocked", () => {
  assert.equal(evaluateAdminConfirmation("qualquer coisa").decision, "blocked");
});

test("baseline canônico tem 12 destrutivas exatas (inclui vps_write_file_safe)", () => {
  assert.equal(CANONICAL_DESTRUCTIVE_TOOLS.length, 12);
  assert.ok(CANONICAL_DESTRUCTIVE_TOOLS.includes("vps_write_file_safe"));
  assert.ok(!CANONICAL_DESTRUCTIVE_TOOLS.includes("mcp_admin_call"));
});
test("getCanonicalExpectation devolve versão e lista congelada", () => {
  const exp = getCanonicalExpectation();
  assert.equal(exp.expectedDestructiveCount, 12);
  assert.equal(exp.version, CATALOG_VERSION);
  assert.deepEqual([...exp.expectedDestructiveNames].sort(), [...CANONICAL_DESTRUCTIVE_TOOLS].sort());
});

test("reconcileCatalog: runtime = baseline → ok", () => {
  const rec = reconcileCatalog(makeRuntime().tools, getCanonicalExpectation());
  assert.equal(rec.ok, true); assert.equal(rec.destructiveCount, 12);
  assert.equal(rec.totalRuntimeTools, 83); assert.equal(rec.catalogVersion, CATALOG_VERSION);
});
test("reconcileCatalog: contagem divergente → block", () => {
  const rec = reconcileCatalog(makeRuntime().tools, { expectedDestructiveCount: 10 });
  assert.equal(rec.ok, false); assert.equal(rec.divergences[0].kind, "count_mismatch");
});
test("reconcileCatalog: nome faltando/sobrando é detectado", () => {
  const semUma = makeRuntime().tools.filter((t) => t.name !== "vps_write_file_safe");
  const rec = reconcileCatalog(semUma, getCanonicalExpectation());
  assert.equal(rec.ok, false);
  const kinds = rec.divergences.map((d) => d.kind);
  assert.ok(kinds.includes("count_mismatch") && kinds.includes("missing_destructive"));
});
test("reconcileCatalog: flag inconsistente (extra destrutiva) → block", () => {
  const { tools } = makeRuntime();
  tools.push({ name: "algo_estranho_novo", annotations: { destructiveHint: true } });
  const rec = reconcileCatalog(tools, getCanonicalExpectation());
  assert.equal(rec.ok, false);
  const extra = rec.divergences.find((d) => d.kind === "extra_destructive");
  assert.ok(extra && extra.names.includes("algo_estranho_novo"));
});

test("hash chain: 3 escritas sequenciais encadeiam", async () => {
  const a = await writeAuditEvent({ tool: "t1", decision: "released", reason: "x" });
  const b = await writeAuditEvent({ tool: "t2", decision: "blocked", reason: "y" });
  const c = await writeAuditEvent({ tool: "t3", decision: "released", reason: "z" });
  assert.ok(a.ok && b.ok && c.ok);
  assert.equal(b.prevHash, a.hash); assert.equal(c.prevHash, b.hash);
  assert.equal(verifyChain(arqDia()).ok, true);
});
test("hash chain: adulteração no meio é detectada", () => {
  const linhas = fs.readFileSync(arqDia(), "utf8").trim().split("\n");
  const alvo = JSON.parse(linhas[1]); alvo.reason = "ADULTERADO";
  linhas[1] = JSON.stringify(alvo);
  fs.writeFileSync(arqDia(), linhas.join("\n") + "\n");
  assert.equal(verifyChain(arqDia()).ok, false);
});

test("hash chain: 20 escritas concorrentes não corrompem a cadeia", async () => {
  const CONC = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-conc-"));
  process.env.MCP_AUDIT_DIR = CONC;
  process.env.MCP_ADMIN_CHAIN_STATE = path.join(CONC, ".chain.json");
  const { writeAuditEvent: w, verifyChain: v } = await import("../src/lib/admin-guard.js?conc=1");
  const N = 20;
  const resultados = await Promise.all(
    Array.from({ length: N }, (_, i) => w({ tool: `conc_${i}`, decision: "released", reason: `p${i}` }))
  );
  assert.equal(resultados.filter((r) => r.ok).length, N);
  const seqs = resultados.map((r) => r.seq).sort((a, b) => a - b);
  assert.deepEqual(seqs, Array.from({ length: N }, (_, i) => i + 1));
  const check = v(path.join(CONC, `mcp-admin-audit-${diaHoje()}.jsonl`));
  assert.equal(check.ok, true); assert.equal(check.verified, N);
  process.env.MCP_AUDIT_DIR = TMP;
  process.env.MCP_ADMIN_CHAIN_STATE = path.join(TMP, ".chain.json");
});

test("sanitização: JWT/sk-/gh_/Bearer não vazam; chaves sensíveis somem", async () => {
  const SAN = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-san-"));
  process.env.MCP_AUDIT_DIR = SAN;
  process.env.MCP_ADMIN_CHAIN_STATE = path.join(SAN, ".chain.json");
  const { writeAuditEvent: w } = await import("../src/lib/admin-guard.js?san=1");
  await w({
    tool: "leak", decision: "blocked",
    reason: "Bearer eyJabc.def.ghi sk-1234567890abcdef1234 ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ012345",
    inputPayload: { safe: 1, authorization: "vaza?", refresh_token: "vaza?", api_key: "vaza?" },
  });
  const raw = fs.readFileSync(path.join(SAN, `mcp-admin-audit-${diaHoje()}.jsonl`), "utf8");
  assert.ok(!raw.includes("eyJabc.def.ghi"));
  assert.ok(!raw.includes("sk-1234567890abcdef1234"));
  assert.ok(!raw.includes("ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ"));
  assert.ok(raw.includes("[REDACTED"));
  assert.ok(!raw.includes('"authorization"'));
  assert.ok(!raw.includes('"refresh_token"'));
  assert.ok(raw.includes('"safe"'));
  process.env.MCP_AUDIT_DIR = TMP;
  process.env.MCP_ADMIN_CHAIN_STATE = path.join(TMP, ".chain.json");
});

test("guardDestructive: baseline ok + PERMITO PIVETE → allow + executionStatus authorized", async () => {
  const g = await guardDestructive({
    toolName: "admin_pm2_restart", confirmAdmin: "PERMITO PIVETE",
    runtimeTools: makeRuntime().tools, expectation: getCanonicalExpectation(),
  });
  assert.equal(g.allow, true); assert.equal(g.status, "OK");
  assert.equal(g.executionStatus, "authorized");
});
test("guardDestructive: divergência bloqueia mesmo com confirmação válida", async () => {
  const semUma = makeRuntime().tools.filter((t) => t.name !== "vps_write_file_safe");
  const g = await guardDestructive({
    toolName: "admin_pm2_restart", confirmAdmin: "CONFIRMO ADMIN",
    runtimeTools: semUma, expectation: getCanonicalExpectation(),
  });
  assert.equal(g.allow, false); assert.equal(g.status, "DIVERGENCIA_CATALOGO");
  assert.equal(g.executionStatus, "blocked");
});
test("guardDestructive: sem confirmação → blocked (executionStatus blocked)", async () => {
  const g = await guardDestructive({
    toolName: "admin_pm2_restart", runtimeTools: makeRuntime().tools,
    expectation: getCanonicalExpectation(),
  });
  assert.equal(g.allow, false); assert.equal(g.status, "CONFIRMACAO_ADMIN_NECESSARIA");
  assert.equal(g.executionStatus, "blocked");
});
test("guardDestructive: usa expectativa canônica quando omitida (não deixa passar)", async () => {
  const semUma = makeRuntime().tools.filter((t) => t.name !== "vps_write_file_safe");
  const g = await guardDestructive({
    toolName: "admin_pm2_restart", confirmAdmin: "PERMITO PIVETE", runtimeTools: semUma,
  });
  assert.equal(g.allow, false, "sem expectation deveria usar baseline canônico");
  assert.equal(g.status, "DIVERGENCIA_CATALOGO");
});
test("guardDestructive: input keys sensíveis sanitizadas em disco", async () => {
  const SEN = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-sen-"));
  process.env.MCP_AUDIT_DIR = SEN;
  process.env.MCP_ADMIN_CHAIN_STATE = path.join(SEN, ".chain.json");
  const { guardDestructive: g, getCanonicalExpectation: ge, CANONICAL_DESTRUCTIVE_TOOLS: names } =
    await import("../src/lib/admin-guard.js?sen=1");
  const tools = names.map((n) => ({ name: n, annotations: { destructiveHint: true } }));
  for (let i = 0; i < 71; i++) tools.push({ name: `ro_${i}`, annotations: { destructiveHint: false } });
  await g({
    toolName: "admin_pm2_restart", confirmAdmin: "PERMITO PIVETE",
    runtimeTools: tools, expectation: ge(),
    inputPayload: { name: "x", authorization: "Bearer VAZAR" },
  });
  const raw = fs.readFileSync(path.join(SEN, `mcp-admin-audit-${diaHoje()}.jsonl`), "utf8");
  assert.ok(!raw.includes("Bearer VAZAR"));
  assert.ok(!raw.includes('"authorization"'));
  process.env.MCP_AUDIT_DIR = TMP;
  process.env.MCP_ADMIN_CHAIN_STATE = path.join(TMP, ".chain.json");
});

test("startup snapshot: lista ordenada + chainCheck + idempotente", async () => {
  const BOOT = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-boot-"));
  process.env.MCP_AUDIT_DIR = BOOT;
  process.env.MCP_ADMIN_CHAIN_STATE = path.join(BOOT, ".chain.json");
  process.env.MCP_ADMIN_STARTUP_LOCK = path.join(BOOT, ".startup.json");
  const { auditStartupSnapshot: boot } = await import("../src/lib/admin-guard.js?boot=1");
  const { tools } = makeRuntime();
  const a = await boot(tools); const b = await boot(tools);
  assert.equal(a.skipped, false); assert.equal(b.skipped, true);
  assert.equal(a.snapshot.destructiveCount, 12);
  assert.ok(a.chainCheck);
  const arq = path.join(BOOT, `mcp-admin-audit-${diaHoje()}.jsonl`);
  const startup = JSON.parse(fs.readFileSync(arq, "utf8").trim().split("\n")[0]);
  assert.equal(startup.tool, "__startup__");
  assert.equal(startup.executionStatus, "startup_snapshot");
  assert.equal(startup.destructiveTools.length, 12);
  assert.deepEqual(startup.destructiveTools, [...CANONICAL_DESTRUCTIVE_TOOLS].sort());
  assert.equal(startup.catalogVersion, CATALOG_VERSION);
  assert.ok(startup.reason.startsWith("runtime_boot chain="));
  process.env.MCP_AUDIT_DIR = TMP;
  process.env.MCP_ADMIN_CHAIN_STATE = path.join(TMP, ".chain.json");
  process.env.MCP_ADMIN_STARTUP_LOCK = path.join(TMP, ".startup.json");
});

test("leitura simultânea não é bloqueada por destrutiva em reconciliação", async () => {
  const readOnlyPromise = Promise.resolve().then(() => "read-ok");
  const destructivePromise = guardDestructive({
    toolName: "admin_pm2_restart", confirmAdmin: "CONFIRMO ADMIN",
    runtimeTools: makeRuntime().tools, expectation: getCanonicalExpectation(),
  });
  const [r, d] = await Promise.all([readOnlyPromise, destructivePromise]);
  assert.equal(r, "read-ok"); assert.equal(d.allow, true);
});

test("dispatcher: mcp-admin.js passa getCanonicalExpectation() ao guardDestructive", () => {
  const src = fs.readFileSync(new URL("../src/tools/core/mcp-admin.js", import.meta.url), "utf8");
  assert.ok(src.includes("guardDestructive"));
  assert.ok(src.includes("getCanonicalExpectation()"));
  assert.ok(src.includes("expectation: getCanonicalExpectation()"));
  assert.ok(!/guardDestructive\(\s*\{\s*[^}]*expectation:\s*\{\s*\}\s*[,}]/s.test(src));
});
