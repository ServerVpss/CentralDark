// Testes standalone (Node puro) do admin-guard. Roda com: node --test admin-guard.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-guard-"));
process.env.MCP_AUDIT_DIR = TMP;
process.env.MCP_ADMIN_CHAIN_STATE = path.join(TMP, ".chain.json");
process.env.MCP_ADMIN_STARTUP_LOCK = path.join(TMP, ".startup.json");

const {
  evaluateAdminConfirmation, reconcileCatalog, writeAuditEvent, verifyChain, verifyAuditDirectory,
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
test("nomes herdados de Object.prototype nunca autorizam", () => {
  for (const value of ["toString", "constructor", "__proto__", "hasOwnProperty"]) {
    assert.equal(evaluateAdminConfirmation(value).decision, "blocked", value);
  }
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
test("hash chain: adulteração no meio é detectada sem contaminar os demais testes", async () => {
  const TAMPER = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-tamper-"));
  process.env.MCP_AUDIT_DIR = TAMPER;
  process.env.MCP_ADMIN_CHAIN_STATE = path.join(TAMPER, ".chain.json");
  const { writeAuditEvent: writeTamper } = await import("../src/lib/admin-guard.js?tamper=1");
  await writeTamper({ tool: "t1", decision: "released" });
  await writeTamper({ tool: "t2", decision: "released" });
  await writeTamper({ tool: "t3", decision: "released" });
  const file = path.join(TAMPER, `mcp-admin-audit-${diaHoje()}.jsonl`);
  const lines = fs.readFileSync(file, "utf8").trim().split("\n");
  const target = JSON.parse(lines[1]); target.reason = "ADULTERADO";
  lines[1] = JSON.stringify(target);
  fs.writeFileSync(file, lines.join("\n") + "\n");
  assert.equal(verifyChain(file).ok, false);
  process.env.MCP_AUDIT_DIR = TMP;
  process.env.MCP_ADMIN_CHAIN_STATE = path.join(TMP, ".chain.json");
});

test("hash chain: 20 processos preservam sequência única", async () => {
  const CONC = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-proc-"));
  const moduleUrl = new URL("../src/lib/admin-guard.js", import.meta.url).href;
  const runChild = (i) => new Promise((resolve, reject) => {
    const code = `
      const { writeAuditEvent } = await import(${JSON.stringify(moduleUrl)});
      const result = await writeAuditEvent({
        tool: ${JSON.stringify(`proc_${i}`)},
        decision: "released",
        actor: "process-test",
        correlationId: ${JSON.stringify(`cid_${i}`)},
      });
      process.stdout.write(JSON.stringify(result));
      if (!result.ok) process.exitCode = 1;
    `;
    const child = spawn(process.execPath, ["--input-type=module", "-e", code], {
      env: {
        ...process.env,
        MCP_AUDIT_DIR: CONC,
        MCP_ADMIN_CHAIN_STATE: path.join(CONC, ".chain.json"),
        MCP_ADMIN_STARTUP_LOCK: path.join(CONC, ".startup.json"),
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = ""; let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (codeValue) => {
      if (codeValue !== 0) return reject(new Error(`child ${i}: ${stderr || stdout}`));
      resolve(JSON.parse(stdout));
    });
  });
  const results = await Promise.all(Array.from({ length: 20 }, (_, i) => runChild(i)));
  assert.equal(results.filter((result) => result.ok).length, 20);
  const seqs = results.map((result) => result.seq).sort((a, b) => a - b);
  assert.deepEqual(seqs, Array.from({ length: 20 }, (_, i) => i + 1));
  const file = path.join(CONC, `mcp-admin-audit-${diaHoje()}.jsonl`);
  const verified = verifyChain(file);
  assert.equal(verified.ok, true); assert.equal(verified.verified, 20); assert.equal(verified.lastSeq, 20);
});

test("rollover diário inicia cadeia verificável em GENESIS", async () => {
  const ROLL = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-roll-"));
  process.env.MCP_AUDIT_DIR = ROLL;
  process.env.MCP_ADMIN_CHAIN_STATE = path.join(ROLL, ".chain.json");
  const { writeAuditEvent: writeAt } = await import("../src/lib/admin-guard.js?roll=1");
  const first = await writeAt({ tool: "day_one", decision: "released" }, { timestamp: "2026-07-20T23:59:59.000Z" });
  const second = await writeAt({ tool: "day_two", decision: "released" }, { timestamp: "2026-07-21T00:00:01.000Z" });
  assert.equal(first.prevHash, "GENESIS");
  assert.equal(second.prevHash, first.hash);
  const globalCheck = verifyAuditDirectory(ROLL);
  assert.equal(globalCheck.ok, true); assert.equal(globalCheck.verified, 2); assert.equal(globalCheck.lastSeq, 2);
  assert.equal(verifyChain(path.join(ROLL, "mcp-admin-audit-2026-07-20.jsonl")).ok, true);
  assert.equal(verifyChain(path.join(ROLL, "mcp-admin-audit-2026-07-21.jsonl"), {
    initialPrevHash: first.hash, initialSeq: 1,
  }).ok, true);
  process.env.MCP_AUDIT_DIR = TMP;
  process.env.MCP_ADMIN_CHAIN_STATE = path.join(TMP, ".chain.json");
});
test("sanitização: JWT/sk-/gh_/Bearer não vazam; chaves sensíveis somem", async () => {
  const SAN = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-san-"));
  process.env.MCP_AUDIT_DIR = SAN;
  process.env.MCP_ADMIN_CHAIN_STATE = path.join(SAN, ".chain.json");
  const { writeAuditEvent: w } = await import("../src/lib/admin-guard.js?san=1");
  const fakeProviderKey = "sk-" + "1234567890abcdef1234";
  const fakeGitHubToken = "ghp_" + "ABCDEFGHIJKLMNOPQRSTUVWXYZ012345";
  await w({
    tool: "leak", decision: "blocked",
    reason: `Bearer eyJabc.def.ghi ${fakeProviderKey} ${fakeGitHubToken}`,
    inputPayload: { safe: 1, authorization: "vaza?", refresh_token: "vaza?", api_key: "vaza?" },
  });
  const raw = fs.readFileSync(path.join(SAN, `mcp-admin-audit-${diaHoje()}.jsonl`), "utf8");
  assert.ok(!raw.includes("eyJabc.def.ghi"));
  assert.ok(!raw.includes(fakeProviderKey));
  assert.ok(!raw.includes(fakeGitHubToken));
  assert.ok(raw.includes("[REDACTED"));
  assert.ok(!raw.includes('"authorization"'));
  assert.ok(!raw.includes('"refresh_token"'));
  assert.ok(raw.includes('"safe"'));
  process.env.MCP_AUDIT_DIR = TMP;
  process.env.MCP_ADMIN_CHAIN_STATE = path.join(TMP, ".chain.json");
});

test("guardDestructive: baseline ok + PERMITO PIVETE → allow + executionStatus authorized", async () => {
  const g = await guardDestructive({
    toolName: "admin_pm2_restart", adminAuthorized: true, confirmAdmin: "PERMITO PIVETE",
    runtimeTools: makeRuntime().tools, expectation: getCanonicalExpectation(),
  });
  assert.equal(g.allow, true); assert.equal(g.status, "OK");
  assert.equal(g.executionStatus, "authorized");
});
test("guardDestructive: confirmação herdada é bloqueada mesmo com catálogo válido", async () => {
  const g = await guardDestructive({
    toolName: "admin_pm2_restart", adminAuthorized: true, confirmAdmin: "toString",
    runtimeTools: makeRuntime().tools, expectation: getCanonicalExpectation(),
  });
  assert.equal(g.allow, false); assert.equal(g.status, "CONFIRMACAO_ADMIN_NECESSARIA");
});
test("guardDestructive: escopo admin ausente bloqueia e audita", async () => {
  const g = await guardDestructive({
    toolName: "admin_pm2_restart", adminAuthorized: false, confirmAdmin: "PERMITO PIVETE",
    runtimeTools: makeRuntime().tools, expectation: getCanonicalExpectation(),
    actor: "oauth-user", correlationId: "cid-scope-test",
  });
  assert.equal(g.allow, false); assert.equal(g.status, "ESCOPO_ADMIN_NECESSARIO");
  assert.equal(g.audit.ok, true);
});

test("guardDestructive: divergência bloqueia mesmo com confirmação válida", async () => {
  const semUma = makeRuntime().tools.filter((t) => t.name !== "vps_write_file_safe");
  const g = await guardDestructive({
    toolName: "admin_pm2_restart", adminAuthorized: true, confirmAdmin: "CONFIRMO ADMIN",
    runtimeTools: semUma, expectation: getCanonicalExpectation(),
  });
  assert.equal(g.allow, false); assert.equal(g.status, "DIVERGENCIA_CATALOGO");
  assert.equal(g.executionStatus, "blocked");
});
test("guardDestructive: sem confirmação → blocked (executionStatus blocked)", async () => {
  const g = await guardDestructive({
    toolName: "admin_pm2_restart", adminAuthorized: true, runtimeTools: makeRuntime().tools,
    expectation: getCanonicalExpectation(),
  });
  assert.equal(g.allow, false); assert.equal(g.status, "CONFIRMACAO_ADMIN_NECESSARIA");
  assert.equal(g.executionStatus, "blocked");
});
test("guardDestructive: usa expectativa canônica quando omitida (não deixa passar)", async () => {
  const semUma = makeRuntime().tools.filter((t) => t.name !== "vps_write_file_safe");
  const g = await guardDestructive({
    toolName: "admin_pm2_restart", adminAuthorized: true, confirmAdmin: "PERMITO PIVETE", runtimeTools: semUma,
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
    toolName: "admin_pm2_restart", adminAuthorized: true, confirmAdmin: "PERMITO PIVETE",
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
  assert.equal(a.skipped, false); assert.equal(a.ready, true);
  assert.equal(b.skipped, true); assert.equal(b.ready, true);
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

test("startup falho não cria lock verde e tenta novamente", async () => {
  const BAD_PARENT = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-bad-"));
  const BAD = path.join(BAD_PARENT, "not-a-directory");
  fs.writeFileSync(BAD, "x");
  process.env.MCP_AUDIT_DIR = BAD;
  process.env.MCP_ADMIN_CHAIN_STATE = path.join(BAD, ".chain.json");
  process.env.MCP_ADMIN_STARTUP_LOCK = path.join(BAD, ".startup.json");
  const { auditStartupSnapshot: boot } = await import("../src/lib/admin-guard.js?boot_fail=1");
  const first = await boot(makeRuntime().tools);
  const second = await boot(makeRuntime().tools);
  assert.equal(first.ready, false); assert.equal(first.skipped, false);
  assert.equal(second.ready, false); assert.equal(second.skipped, false);
  assert.equal(fs.existsSync(path.join(BAD, ".startup.json")), false);
  process.env.MCP_AUDIT_DIR = TMP;
  process.env.MCP_ADMIN_CHAIN_STATE = path.join(TMP, ".chain.json");
  process.env.MCP_ADMIN_STARTUP_LOCK = path.join(TMP, ".startup.json");
});

test("leitura simultânea não é bloqueada por destrutiva em reconciliação", async () => {
  const readOnlyPromise = Promise.resolve().then(() => "read-ok");
  const destructivePromise = guardDestructive({
    toolName: "admin_pm2_restart", adminAuthorized: true, confirmAdmin: "CONFIRMO ADMIN",
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
  assert.ok(src.includes("ctx?.admin === true"));
  assert.ok(src.includes('scopes.has("admin")'));
  assert.ok(src.includes("adminAuthorized: true"));
});

test("transporte propaga identidade e impede destrutiva direta", () => {
  const server = fs.readFileSync(new URL("../src/mcp-server.js", import.meta.url), "utf8");
  const index = fs.readFileSync(new URL("../src/index.js", import.meta.url), "utf8");
  assert.ok(server.includes("callerUser: options.callerUser"));
  assert.ok(server.includes("correlationId: options.cid"));
  assert.ok(server.includes('tool.name === "mcp_admin_call"'));
  assert.ok(server.includes("destructiveHint !== true"));
  assert.ok(index.includes("callerUser: at.gh_login"));
  assert.ok(index.includes("oauthScope: scope"));
  assert.ok(index.includes("admin: true"));
});
