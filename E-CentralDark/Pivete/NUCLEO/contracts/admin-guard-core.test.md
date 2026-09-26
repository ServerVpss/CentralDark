# CONTRATO - admin-guard-core.test.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\tests\admin-guard-core.test.mjs
**SHA:** a05c6a1938fd042e
**Timestamp:** 2026-08-28T02:54:51.462667
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- test("matriz do contrato: quem passa, quem cai, e por quê", async () => {

### Ouro Bruto (primeiros 5000 chars)
```
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
  assert.equal(rec.catalogVersion, CAT
```