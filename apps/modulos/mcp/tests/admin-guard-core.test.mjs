// Testes standalone (Node puro) do admin-guard. Roda com: node --test admin-guard.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-guard-"));
process.env.MCP_AUDIT_DIR = TMP;
process.env.MCP_ADMIN_CHAIN_STATE = path.join(TMP, ".chain.json");
process.env.MCP_ADMIN_STARTUP_LOCK = path.join(TMP, ".startup.json");

const {
  evaluateAdminConfirmation, reconcileCatalog, writeAuditEvent, verifyChain, verifyAuditDirectory,
  guardDestructive, auditStartupSnapshot, getCanonicalExpectation,
  CANONICAL_DESTRUCTIVE_TOOLS, CATALOG_VERSION, MANIFEST_HASH,
} = await import("../src/lib/admin-guard.js");

// O manifesto aprovado e lido do MESMO arquivo que o guard le. Nenhuma
// contagem escrita a mao nos testes: tudo deriva daqui.
const MANIFESTO_NOMES = JSON.parse(
  fs.readFileSync(new URL("../manifesto-destrutivas.json", import.meta.url), "utf8"),
).destrutivasAprovadas.map((e) => e.nome).sort();

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
test("PERMITO SEGREDO → released (permito_segredo)", () => {
  const r = evaluateAdminConfirmation("PERMITO SEGREDO");
  assert.equal(r.decision, "released"); assert.equal(r.confirmationMode, "permito_segredo");
});
test("PERMITO PIVETE é legado e não concede autoridade", () => {
  assert.equal(evaluateAdminConfirmation("PERMITO PIVETE").decision, "blocked");
});
test("confirmação inválida → blocked", () => {
  assert.equal(evaluateAdminConfirmation("qualquer coisa").decision, "blocked");
});
test("nomes herdados de Object.prototype nunca autorizam", () => {
  for (const value of ["toString", "constructor", "__proto__", "hasOwnProperty"]) {
    assert.equal(evaluateAdminConfirmation(value).decision, "blocked", value);
  }
});

// MOTIVO  > este teste cravava "12 destrutivas exatas". Quando o dispatcher
//           ganhou grupos novos o runtime foi para 17 e o teste ficou
//           vermelho — mas trocar 12 por 17 so moveria o numero magico de
//           lugar e esconderia a proxima divergencia do mesmo jeito.
// ONDE    > apps/modulos/mcp/tests/admin-guard.test.mjs.
// RESOLVE > o teste passa a validar PROPRIEDADE contra o manifesto
//           aprovado, nao contagem. Se o manifesto mudar, o teste continua
//           valendo; se o codigo divergir do manifesto, ele acusa.
test("baseline canônico é exatamente o manifesto aprovado", () => {
  assert.deepEqual([...CANONICAL_DESTRUCTIVE_TOOLS], [...MANIFESTO_NOMES]);
  assert.ok(CANONICAL_DESTRUCTIVE_TOOLS.length > 0, "manifesto não pode ser vazio");
  assert.equal(new Set(CANONICAL_DESTRUCTIVE_TOOLS).size, CANONICAL_DESTRUCTIVE_TOOLS.length,
    "manifesto não pode ter nome duplicado");
  assert.deepEqual([...CANONICAL_DESTRUCTIVE_TOOLS], [...CANONICAL_DESTRUCTIVE_TOOLS].sort(),
    "manifesto deve estar ordenado (diff estável no PR)");
  assert.ok(CANONICAL_DESTRUCTIVE_TOOLS.includes("vps_write_file_safe"));
  assert.ok(!CANONICAL_DESTRUCTIVE_TOOLS.includes("mcp_admin_call"),
    "mcp_admin_call é o próprio dispatcher: não se despacha a si mesmo");
});
test("catalogVersion é derivada do conteúdo, não escrita à mão", () => {
  assert.match(CATALOG_VERSION, /^v1-[0-9a-f]{12}$/,
    "o identificador canônico não pode conter data: só o hash do conteúdo");
  assert.ok(CATALOG_VERSION.endsWith(MANIFEST_HASH));
  assert.ok(!/\d{4}-\d{2}-\d{2}/.test(CATALOG_VERSION),
    "data no identificador quebraria o determinismo por conteúdo");
});
test("getCanonicalExpectation devolve versão e lista congelada", () => {
  const exp = getCanonicalExpectation();
  assert.equal(exp.expectedDestructiveCount, MANIFESTO_NOMES.length);
  assert.equal(exp.version, CATALOG_VERSION);
  assert.deepEqual([...exp.expectedDestructiveNames].sort(), [...CANONICAL_DESTRUCTIVE_TOOLS].sort());
});

test("reconcileCatalog: runtime = baseline → ok", () => {
  const rec = reconcileCatalog(makeRuntime().tools, getCanonicalExpectation());
  assert.equal(rec.ok, true);
  assert.equal(rec.destructiveCount, MANIFESTO_NOMES.length);
  assert.equal(rec.totalRuntimeTools, makeRuntime().tools.length);
  assert.equal(rec.catalogVersion, CATALOG_VERSION);
  assert.deepEqual(rec.quarantined, []);
  assert.deepEqual(rec.missing, []);
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

test("guardDestructive: baseline ok + PERMITO SEGREDO → allow + executionStatus authorized", async () => {
  const g = await guardDestructive({
    toolName: "admin_pm2_restart", adminAuthorized: true, confirmAdmin: "PERMITO SEGREDO",
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
    toolName: "admin_pm2_restart", adminAuthorized: false, confirmAdmin: "PERMITO SEGREDO",
    runtimeTools: makeRuntime().tools, expectation: getCanonicalExpectation(),
    actor: "oauth-user", correlationId: "cid-scope-test",
  });
  assert.equal(g.allow, false); assert.equal(g.status, "ESCOPO_ADMIN_NECESSARIO");
  assert.equal(g.audit.ok, true);
});

test("OAuth admin persistente: identidade, escopo e auditoria dispensam frase repetida", async () => {
  const g = await guardDestructive({
    toolName: "admin_pm2_restart", adminAuthorized: true,
    persistentAdminAuthorization: true, actor: "oauth-admin",
    correlationId: "authenticated-request-1", runtimeTools: makeRuntime().tools,
    expectation: getCanonicalExpectation(),
  });
  assert.equal(g.allow, true);
  assert.equal(g.status, "OK");
  assert.equal(g.confirmationEval.confirmationMode, "authenticated_admin_session");
  assert.equal(g.audit.confirmationMode, "authenticated_admin_session");
});
test("Autorizacao persistente sem escopo ou identidade nao concede permissao", async () => {
  for (const input of [
    { adminAuthorized: false, actor: "oauth-admin", correlationId: "id" },
    { adminAuthorized: true, actor: "", correlationId: "id" },
    { adminAuthorized: true, actor: "oauth-admin", correlationId: "" },
  ]) {
    const g = await guardDestructive({
      toolName: "admin_pm2_restart", persistentAdminAuthorization: true,
      runtimeTools: makeRuntime().tools, expectation: getCanonicalExpectation(), ...input,
    });
    assert.equal(g.allow, false);
  }
});
test("Autorizacao persistente nao aceita frase explicitamente invalida", async () => {
  const g = await guardDestructive({
    toolName: "admin_pm2_restart", adminAuthorized: true,
    persistentAdminAuthorization: true, actor: "oauth-admin",
    correlationId: "id", confirmAdmin: "invalida",
    runtimeTools: makeRuntime().tools, expectation: getCanonicalExpectation(),
  });
  assert.equal(g.allow, false);
  assert.equal(g.status, "CONFIRMACAO_ADMIN_NECESSARIA");
});
test("Autorizacao persistente nao tira quarentena de ferramentas", async () => {
  const g = await guardDestructive({
    toolName: "tool_extra", adminAuthorized: true,
    persistentAdminAuthorization: true, actor: "oauth-admin",
    correlationId: "id",
    runtimeTools: [...makeRuntime().tools,
      { name: "tool_extra", annotations: { destructiveHint: true } }],
    expectation: getCanonicalExpectation(),
  });
  assert.equal(g.allow, false);
  assert.equal(g.status, "DESTRUTIVA_EM_QUARENTENA");
});

// MOTIVO  > este teste travava o comportamento antigo: QUALQUER divergencia
//           bloqueava TODA destrutiva. Uma tool desconhecida derrubava o
//           conjunto inteiro, inclusive as aprovadas sem relacao com ela.
// ONDE    > guardDestructive, via reconcileCatalog.
// RESOLVE > vira uma MATRIZ de contrato. A divergencia continua sendo
//           detectada e registrada na auditoria — a prova nao se perde — mas
//           o bloqueio passa a ser pontual, so na tool divergente.
test("matriz do contrato: quem passa, quem cai, e por quê", async () => {
  const APROVADA = CANONICAL_DESTRUCTIVE_TOOLS[0];
  const base = makeRuntime().tools;
  const exp = getCanonicalExpectation();

  // 1. aprovada + escopo admin + confirmação válida -> PERMITE
  const ok = await guardDestructive({
    toolName: APROVADA, adminAuthorized: true, confirmAdmin: "CONFIRMO ADMIN",
    runtimeTools: base, expectation: exp,
  });
  assert.equal(ok.allow, true, "aprovada com tudo em ordem deve passar");

  // 2. aprovada SEM confirmação -> BLOQUEIA
  const semConf = await guardDestructive({
    toolName: APROVADA, adminAuthorized: true, runtimeTools: base, expectation: exp,
  });
  assert.equal(semConf.allow, false);
  assert.equal(semConf.status, "CONFIRMACAO_ADMIN_NECESSARIA");

  // 3. aprovada SEM escopo admin -> BLOQUEIA
  const semEscopo = await guardDestructive({
    toolName: APROVADA, adminAuthorized: false, confirmAdmin: "CONFIRMO ADMIN",
    runtimeTools: base, expectation: exp,
  });
  assert.equal(semEscopo.allow, false);
  assert.equal(semEscopo.status, "ESCOPO_ADMIN_NECESSARIO");

  // 4. destrutiva DESCONHECIDA, mesmo com confirmação válida -> QUARENTENA
  const comIntrusa = [...base, { name: "intrusa_x", annotations: { destructiveHint: true } }];
  const intrusa = await guardDestructive({
    toolName: "intrusa_x", adminAuthorized: true, confirmAdmin: "CONFIRMO ADMIN",
    runtimeTools: comIntrusa, expectation: exp,
  });
  assert.equal(intrusa.allow, false, "confirmação válida não aprova o que não está no manifesto");
  assert.equal(intrusa.status, "DESTRUTIVA_EM_QUARENTENA");

  // 5. na MESMA rodada da intrusa, a aprovada continua passando
  const convive = await guardDestructive({
    toolName: APROVADA, adminAuthorized: true, confirmAdmin: "CONFIRMO ADMIN",
    runtimeTools: comIntrusa, expectation: exp,
  });
  assert.equal(convive.allow, true, "divergência em OUTRA tool não pode derrubar esta");

  // 6. a divergência NÃO some do radar: fica registrada no estado de auditoria
  assert.deepEqual(convive.recon.quarantined, ["intrusa_x"]);
  assert.equal(convive.recon.ok, false, "recon.ok segue false: a divergência é real");
  assert.ok(convive.recon.divergences.some((d) => d.kind === "extra_destructive"));
});

test("aprovada que sumiu do runtime bloqueia a si mesma, e só a si mesma", async () => {
  const alvo = CANONICAL_DESTRUCTIVE_TOOLS[0];
  const outra = CANONICAL_DESTRUCTIVE_TOOLS[1];
  const semAlvo = makeRuntime().tools.filter((t) => t.name !== alvo);
  const exp = getCanonicalExpectation();

  const g = await guardDestructive({
    toolName: alvo, adminAuthorized: true, confirmAdmin: "CONFIRMO ADMIN",
    runtimeTools: semAlvo, expectation: exp,
  });
  assert.equal(g.allow, false);
  assert.equal(g.status, "APROVADA_AUSENTE_NO_RUNTIME");
  assert.deepEqual(g.recon.missing, [alvo]);

  const vizinha = await guardDestructive({
    toolName: outra, adminAuthorized: true, confirmAdmin: "CONFIRMO ADMIN",
    runtimeTools: semAlvo, expectation: exp,
  });
  assert.equal(vizinha.allow, true, "o sumiço de uma não pode bloquear a outra");
});

test("a fonte da aprovação é o manifesto, não o /tools.json nem o runtime", () => {
  // Uma tool destrutiva presente no runtime e ate publicada no catalogo, mas
  // ausente do manifesto aprovado, NAO e autorizada.
  const comPublicada = [...makeRuntime().tools,
    { name: "publicada_mas_nao_aprovada", annotations: { destructiveHint: true } }];
  const rec = reconcileCatalog(comPublicada, getCanonicalExpectation());
  assert.ok(rec.quarantined.includes("publicada_mas_nao_aprovada"));
  assert.ok(!CANONICAL_DESTRUCTIVE_TOOLS.includes("publicada_mas_nao_aprovada"));
});
test("guardDestructive: sem confirmação → blocked (executionStatus blocked)", async () => {
  const g = await guardDestructive({
    toolName: "admin_pm2_restart", adminAuthorized: true, runtimeTools: makeRuntime().tools,
    expectation: getCanonicalExpectation(),
  });
  assert.equal(g.allow, false); assert.equal(g.status, "CONFIRMACAO_ADMIN_NECESSARIA");
  assert.equal(g.executionStatus, "blocked");
});
// MOTIVO  > o teste antigo provava que, sem `expectation`, o guard usava o
//           baseline canonico — mas provava isso pelo efeito colateral do
//           bloqueio GLOBAL, que deixou de existir. A propriedade que importa
//           (nao confiar em expectativa vazia) continua valendo.
// ONDE    > guardDestructive, parametro `expectation` omitido.
// RESOLVE > provar a mesma propriedade pelo caminho direto: sem expectation,
//           uma destrutiva DESCONHECIDA tem de cair em quarentena do mesmo
//           jeito. Se o guard caisse para uma expectativa vazia, ela passaria.
test("sem `expectation`, o guard usa o manifesto — não uma expectativa vazia", async () => {
  const comIntrusa = [...makeRuntime().tools,
    { name: "intrusa_sem_expectation", annotations: { destructiveHint: true } }];
  const g = await guardDestructive({
    toolName: "intrusa_sem_expectation", adminAuthorized: true,
    confirmAdmin: "PERMITO SEGREDO", runtimeTools: comIntrusa,
  });
  assert.equal(g.allow, false, "expectativa vazia deixaria passar — não pode");
  assert.equal(g.status, "DESTRUTIVA_EM_QUARENTENA");
  assert.equal(g.recon.catalogVersion, CATALOG_VERSION, "usou o manifesto, não um objeto vazio");
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
    toolName: "admin_pm2_restart", adminAuthorized: true, confirmAdmin: "PERMITO SEGREDO",
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
  assert.equal(a.snapshot.destructiveCount, MANIFESTO_NOMES.length);
  assert.ok(a.chainCheck);
  const arq = path.join(BOOT, `mcp-admin-audit-${diaHoje()}.jsonl`);
  const startup = JSON.parse(fs.readFileSync(arq, "utf8").trim().split("\n")[0]);
  assert.equal(startup.tool, "__startup__");
  assert.equal(startup.executionStatus, "startup_snapshot");
  assert.equal(startup.destructiveTools.length, MANIFESTO_NOMES.length);
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


// ─────────── cenarios de quarentena (laboratorio A/B/C da missao) ──────────
// MOTIVO  > antes, qualquer divergencia bloqueava TODA destrutiva. Uma tool
//           nova e desconhecida derrubava o conjunto inteiro, inclusive as
//           aprovadas e sem relacao com o problema.
// ONDE    > guardDestructive, via reconcileCatalog.
// RESOLVE > estes tres cenarios travam o comportamento novo: quarentena
//           pontual, sem falso verde e sem bloqueio coletivo.
test("cenario A: tool de leitura nova nao afeta destrutiva aprovada", () => {
  const base = makeRuntime().tools;
  const comLeituraNova = [...base, {
    name: "tool_de_leitura_nova",
    annotations: { readOnlyHint: true, destructiveHint: false },
  }];
  const rec = reconcileCatalog(comLeituraNova, getCanonicalExpectation());
  assert.equal(rec.ok, true, "tool de leitura nova nao pode gerar divergencia");
  assert.deepEqual(rec.quarantined, []);
  assert.equal(rec.totalRuntimeTools, base.length + 1);
});

test("cenario B: destrutiva desconhecida entra em quarentena sozinha", async () => {
  const base = makeRuntime().tools;
  const comIntrusa = [...base, {
    name: "tool_destrutiva_intrusa",
    annotations: { destructiveHint: true },
  }];
  const rec = reconcileCatalog(comIntrusa, getCanonicalExpectation());
  assert.deepEqual(rec.quarantined, ["tool_destrutiva_intrusa"]);
  assert.deepEqual(rec.missing, []);

  // a intrusa e bloqueada...
  const bloqueada = await guardDestructive({
    toolName: "tool_destrutiva_intrusa", confirmAdmin: "CONFIRMO ADMIN",
    runtimeTools: comIntrusa, adminAuthorized: true,
  });
  assert.equal(bloqueada.allow, false);
  assert.equal(bloqueada.status, "DESTRUTIVA_EM_QUARENTENA");

  // ...e uma aprovada, na MESMA rodada, segue liberada
  const aprovada = await guardDestructive({
    toolName: CANONICAL_DESTRUCTIVE_TOOLS[0], confirmAdmin: "CONFIRMO ADMIN",
    runtimeTools: comIntrusa, adminAuthorized: true,
  });
  assert.equal(aprovada.allow, true,
    "divergência em OUTRA tool não pode bloquear esta");
});

test("cenario C: aprovada ausente do runtime avisa, sem falso verde", async () => {
  const alvo = CANONICAL_DESTRUCTIVE_TOOLS[0];
  const semEla = makeRuntime().tools.filter((t) => t.name !== alvo);
  const rec = reconcileCatalog(semEla, getCanonicalExpectation());
  assert.deepEqual(rec.missing, [alvo]);
  assert.equal(rec.ok, false, "sumico de aprovada nao pode passar como ok");

  const r = await guardDestructive({
    toolName: alvo, confirmAdmin: "CONFIRMO ADMIN",
    runtimeTools: semEla, adminAuthorized: true,
  });
  assert.equal(r.allow, false);
  assert.equal(r.status, "APROVADA_AUSENTE_NO_RUNTIME");
});

// ══════════ achados da revisao independente, travados como teste ══════════
// Cada um destes reproduz um buraco REAL apontado por revisor externo e que
// so foi descoberto depois do codigo estar escrito e "verde". Ficam aqui para
// que a correcao nao possa ser desfeita em silencio.

test("achado B: ordem de chaves e de entradas NAO pode mudar o identificador", () => {
  // JSON.stringify preserva ordem de insercao. Um formatador que reordene os
  // campos, ou um checkout que reordene o array, mudaria o hash sem nenhuma
  // regra ter mudado — e o cliente reconectaria a toa.
  const bruto = JSON.parse(
    fs.readFileSync(new URL("../manifesto-destrutivas.json", import.meta.url), "utf8"));

  const canon = (v) => Array.isArray(v) ? v.map(canon)
    : (v && typeof v === "object"
      ? Object.keys(v).sort().reduce((a, k) => { a[k] = canon(v[k]); return a; }, {})
      : v);
  const hashDe = (entradas) => createHash("sha256")
    .update(JSON.stringify(canon([...entradas].sort((a, b) => String(a?.nome).localeCompare(String(b?.nome))))))
    .digest("hex").slice(0, 12);

  const original = bruto.destrutivasAprovadas;
  const embaralhado = [...original].reverse().map((e) => Object.fromEntries(Object.entries(e).reverse()));

  assert.equal(hashDe(embaralhado), hashDe(original), "ordem não pode afetar o hash");
  assert.equal(hashDe(original), MANIFEST_HASH, "o guard usa a mesma serialização canônica");

  const alterado = structuredClone(original);
  alterado[0].escopoExigido = "outro_escopo";
  assert.notEqual(hashDe(alterado), MANIFEST_HASH, "mudança semântica TEM que mudar o hash");
});

test("achado C: nome inexistente ou herdado de Object.prototype é bloqueado", async () => {
  const rt = CANONICAL_DESTRUCTIVE_TOOLS.map((name) => ({ name, annotations: { destructiveHint: true } }));
  for (const nome of ["nao_existe_xyz", "__proto__", "constructor", "toString", "hasOwnProperty", ""]) {
    const r = await guardDestructive({
      toolName: nome, adminAuthorized: true, confirmAdmin: "CONFIRMO ADMIN", runtimeTools: rt,
    });
    assert.equal(r.allow, false, `"${nome}" não pode ser autorizada`);
    assert.equal(r.status, "TOOL_DESCONHECIDA", `"${nome}" deve cair como desconhecida`);
  }
});

test("achado C: aprovada ausente NÃO vira TOOL_DESCONHECIDA (precedência)", async () => {
  // O status generico engolindo o especifico esconderia do operador que a
  // tool sumiu do CODIGO — ele acharia que alguem chamou um nome inventado.
  const alvo = CANONICAL_DESTRUCTIVE_TOOLS[0];
  const semAlvo = makeRuntime().tools.filter((t) => t.name !== alvo);
  const r = await guardDestructive({
    toolName: alvo, adminAuthorized: true, confirmAdmin: "CONFIRMO ADMIN", runtimeTools: semAlvo,
  });
  assert.equal(r.status, "APROVADA_AUSENTE_NO_RUNTIME");
  assert.notEqual(r.status, "TOOL_DESCONHECIDA");
});

test("achado D: TTL das pendências NÃO entra no identificador canônico", () => {
  // ultimoTeste vive em destrutivasEmRevisao. Se ele influenciasse o hash,
  // atualizar a data de um teste mudaria a versao do catalogo e forcaria
  // reconexao de todos os clientes sem nenhuma regra ter mudado.
  const bruto = JSON.parse(
    fs.readFileSync(new URL("../manifesto-destrutivas.json", import.meta.url), "utf8"));
  const nomesAprovados = bruto.destrutivasAprovadas.map((e) => e.nome);
  for (const e of bruto.destrutivasEmRevisao ?? []) {
    assert.ok(!nomesAprovados.includes(e.nome), `${e.nome} não pode estar nas duas listas`);
    assert.ok(e.ultimoTeste, "pendência precisa declarar ultimoTeste");
  }
  assert.ok(!JSON.stringify(bruto.destrutivasAprovadas).includes("ultimoTeste"),
    "ultimoTeste não pode viver dentro das aprovadas (entraria no hash)");
});

test("achado F: manifesto ausente ou corrompido derruba o boot com erro nomeado", async () => {
  const ruim = path.join(TMP, "manifesto-ruim.json");
  fs.writeFileSync(ruim, "{ isto nao e json");
  const antes = process.env.MCP_MANIFESTO_DESTRUTIVAS;

  process.env.MCP_MANIFESTO_DESTRUTIVAS = ruim;
  await assert.rejects(
    () => import("../src/lib/admin-guard.js?manifesto=corrompido"),
    (e) => /JSON invalido/.test(e.message) && /NAO sobe/.test(e.message),
    "JSON inválido tem que dar erro nomeado, não SyntaxError cru");

  process.env.MCP_MANIFESTO_DESTRUTIVAS = path.join(TMP, "nao-existe.json");
  await assert.rejects(
    () => import("../src/lib/admin-guard.js?manifesto=ausente"),
    (e) => /ilegivel/.test(e.message) && /NAO sobe/.test(e.message),
    "manifesto ausente tem que dar erro nomeado, não ENOENT cru");

  if (antes === undefined) delete process.env.MCP_MANIFESTO_DESTRUTIVAS;
  else process.env.MCP_MANIFESTO_DESTRUTIVAS = antes;
});

test("boot não pode ficar não-pronto por quarentena REGISTRADA", async () => {
  // Regressao encontrada EM PRODUCAO em 2026-07-28, e que nenhum teste
  // unitario tinha pego: o bloqueio global foi tirado do guardDestructive mas
  // continuava um nivel acima, em auditStartupSnapshot. Com 17 destrutivas no
  // runtime e 12 no manifesto, auditStartupReady virava false e TODA
  // destrutiva respondia AUDITORIA_STARTUP_INDISPONIVEL — inclusive as 12
  // aprovadas, que nao tinham nada a ver com a divergencia.
  const BOOT = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-boot2-"));
  process.env.MCP_AUDIT_DIR = BOOT;
  process.env.MCP_ADMIN_CHAIN_STATE = path.join(BOOT, ".chain.json");
  process.env.MCP_ADMIN_STARTUP_LOCK = path.join(BOOT, ".startup.json");
  const g = await import("../src/lib/admin-guard.js?boot2=1");

  const aprovadas = g.CANONICAL_DESTRUCTIVE_TOOLS
    .map((name) => ({ name, annotations: { destructiveHint: true } }));
  const quarentena = g.DESTRUTIVAS_EM_REVISAO
    .map((e) => ({ name: e.nome, annotations: { destructiveHint: true } }));
  const leitura = Array.from({ length: 70 }, (_, i) => ({ name: `ro_${i}`, annotations: { destructiveHint: false } }));
  const runtimeReal = [...aprovadas, ...quarentena, ...leitura];

  const ok = await g.auditStartupSnapshot(runtimeReal);
  assert.equal(ok.ready, true,
    "quarentena registrada é estado esperado: não pode deixar o boot não-pronto");

  fs.rmSync(path.join(BOOT, ".startup.json"), { force: true });
  const comIntrusa = await g.auditStartupSnapshot(
    [...runtimeReal, { name: "intrusa_nao_registrada", annotations: { destructiveHint: true } }]);
  assert.equal(comIntrusa.ready, false,
    "destrutiva DESCONHECIDA tem que deixar o boot não-pronto");

  process.env.MCP_AUDIT_DIR = TMP;
});
