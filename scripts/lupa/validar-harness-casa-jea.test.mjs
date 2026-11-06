/*
 * #OBSERVACOES# | CENTRALDARK.HARNESS.CASA_JEA.SENSOR.TEST
 * @owner: scripts/lupa/validar-harness-casa-jea.mjs
 * @doc_ref: docs/ARQUITETURA/INSTINTO-SUPERIOR-HARNESS-MODULOS.md
 * @last_updated: 2026-10-23T02:50:00.000Z
 * @scope: contraprova deterministica do sensor; fixture = medicao real de 22/10/2026 (sem segredo).
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateEntry, classifyLive } from "./validar-harness-casa-jea.mjs";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const registry = JSON.parse(fs.readFileSync(path.join(repo, "apps/instinto-superior/config/harness-module-registry.json"), "utf8"));
const entry = registry.modules.find((m) => m.id === "casa-jea-winrm");

const notRecognized = (cmd) => ({ ok: false, errors: [`The term '${cmd}' is not recognized as the name of a cmdlet, function, script file, or operable program.`] });
const SESSAO_20261022 = {
  measured_at: "22/10/2026 23:38:13 BRT",
  results: {
    T1: { ok: true, count: 438, errors: [] },
    T2: { ok: true, count: 79, errors: [] },
    T3: { ok: true, count: 1, errors: [] },
    T4: notRecognized("Get-ChildItem"),
    T5: notRecognized("Stop-Process"),
    T6: notRecognized("Invoke-Expression"),
    T7: { ok: false, errors: ["NEGADO_ALLOWLIST: System (PID 4) fora da allowlist"] },
    T8: { ok: false, errors: ["NEGADO_ALLOWLIST: servico Spooler fora da allowlist"] },
    STOP: { ok: true, count: 1, errors: [] },
  },
};
const offline = (msg) => ({
  measured_at: "fixture",
  results: Object.fromEntries(Object.keys(SESSAO_20261022.results).map((k) => [k, { ok: false, errors: [msg] }])),
});

test("registro casa-jea-winrm é PROVEN travado, com receita, rollback e sem segredo", () => {
  assert.deepEqual(validateEntry(entry), []);
});

test("sessão real 22/10/2026: todas as capacidades PASS", () => {
  const v = classifyLive(entry, SESSAO_20261022);
  assert.equal(v.proven, "🟢🔒 PROVEN");
  assert.equal(v.live_state, "🟢 LIVE_PASS");
});

test("mesmo input = mesmo veredito", () => {
  assert.deepEqual(classifyLive(entry, SESSAO_20261022), classifyLive(entry, SESSAO_20261022));
});

test("rota desligada mostra ⚠️ com causa e não rebaixa PROVEN", () => {
  for (const [msg, cause] of [
    ["ConnectTimeout: timed out", "TAILSCALE_OU_VPN"],
    ["ConnectionError: [Errno 111] Connection refused", "WINRM_PARADO"],
    ["AuthenticationError: 401 Unauthorized", "CREDENCIAL_REJEITADA"],
    ["InvalidResourceUri: no session configuration", "JEA_NAO_REGISTRADO"],
  ]) {
    const v = classifyLive(entry, offline(msg));
    assert.equal(v.proven, "🟢🔒 PROVEN");
    assert.equal(v.live_state, "⚠️ " + cause);
  }
});

test("rotina sem STOP (MEXER real) continua LIVE_PASS", () => {
  const rotina = structuredClone(SESSAO_20261022);
  delete rotina.results.STOP;
  const v = classifyLive(entry, rotina);
  assert.equal(v.live_state, "🟢 LIVE_PASS");
  assert.equal(v.per_test.STOP, "NAO_MEDIDO");
});

test("allowlist furada (negação virou OK) é divergência, não PASS", () => {
  const furado = structuredClone(SESSAO_20261022);
  furado.results.T7 = { ok: true, count: 1, errors: [] };
  assert.equal(classifyLive(entry, furado).live_state, "⚠️ DIVERGENCIA_T7");
});

test("segredo ou credencial fora de caminho reprovam o registro", () => {
  assert.ok(validateEntry({ ...entry, note: "CASA_JEA_PASS=xyz" }).includes("SECRET_PATTERN_IN_REGISTRY"));
  assert.ok(validateEntry({ ...entry, credential_ref: "senha123" }).includes("CREDENTIAL_REF_NOT_PATH_ONLY"));
  assert.ok(validateEntry({ ...entry, capabilities: { ...entry.capabilities, mexer: { state: "PROVEN", evidence: "x" } } })
    .includes("CAPABILITY_LOCK_MISSING:mexer"));
});
