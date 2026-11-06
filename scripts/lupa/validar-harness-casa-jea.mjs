#!/usr/bin/env node
/*
 * #OBSERVACOES# | CENTRALDARK.HARNESS.CASA_JEA.SENSOR
 * @owner: apps/instinto-superior/config/harness-module-registry.json#casa-jea-winrm
 * @doc_ref: docs/ARQUITETURA/INSTINTO-SUPERIOR-HARNESS-MODULOS.md
 * @last_updated: 2026-10-23T02:50:00.000Z
 * @scope: sensor deterministico da rota Casa JEA (WinRM 5985 via Tailscale). Puro: mesmo input = mesmo veredito.
 * @status: PROVEN_LOCKED_REGISTRY + LIVE_LAYER_SEPARADA
 * @next_cursor: ligar o teste ao CI existente quando o workflow ganhar trilha #OBSERVACOES#.
 *
 * Duas camadas, nunca misturadas:
 *   1. PROVEN (registro): validateEntry() exige evidencia, lock, receita e rollback; zero segredo.
 *   2. SESSAO AO VIVO: classifyLive() le o JSON da suite T1-T8+stop+allow gerado pela skill Hermes
 *      devops/centraldark-casa-jea e devolve LIVE_PASS ou ⚠️ com causa. Nunca rebaixa PROVEN.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REGISTRY = "apps/instinto-superior/config/harness-module-registry.json";
const MODULE_ID = "casa-jea-winrm";
const LOCK = "🟢🔒";
const CAPS = ["ver", "pedir", "mexer", "allow"];
const BRT = /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2} BRT$/;
const SECRET = /CASA_JEA_PASS\s*=|password\s*[:=]\s*\S|BEGIN [A-Z ]*PRIVATE KEY|ghp_[A-Za-z0-9]{20,}/i;

export function validateEntry(entry) {
  const errors = [];
  if (!entry || entry.id !== MODULE_ID) return ["MODULE_MISSING:" + MODULE_ID];
  if (SECRET.test(JSON.stringify(entry))) errors.push("SECRET_PATTERN_IN_REGISTRY");
  if (entry.runtime_status !== "PROVEN") errors.push("RUNTIME_STATUS_NOT_PROVEN");
  if (entry.proof_lock !== "PROVEN_LOCKED") errors.push("PROOF_LOCK_MISSING");
  if (!BRT.test(String(entry.proven_at || ""))) errors.push("PROVEN_AT_NOT_BRT");
  for (const cap of CAPS) {
    const c = entry.capabilities?.[cap];
    if (!c) { errors.push("CAPABILITY_MISSING:" + cap); continue; }
    if (c.state === "PROVEN" && c.lock !== LOCK) errors.push("CAPABILITY_LOCK_MISSING:" + cap);
    if (c.state === "PROVEN" && !String(c.evidence || "").trim()) errors.push("CAPABILITY_EVIDENCE_MISSING:" + cap);
    if (!["PROVEN", "UNKNOWN"].includes(c.state)) errors.push("CAPABILITY_STATE_INVALID:" + cap);
  }
  for (const field of ["vps_log", "casa_transcripts"]) {
    if (!String(entry.audit?.[field] || "").trim()) errors.push("AUDIT_PATH_MISSING:" + field);
  }
  if (!String(entry.allowlist || "").trim()) errors.push("ALLOWLIST_PATH_MISSING");
  if (!/^\/etc\/centraldark\/secrets\/[\w.-]+\.env\b/.test(String(entry.credential_ref || ""))) {
    errors.push("CREDENTIAL_REF_NOT_PATH_ONLY");
  }
  for (const side of ["casa", "vps"]) {
    if (!String(entry.rollback?.[side] || "").trim()) errors.push("ROLLBACK_MISSING:" + side);
  }
  const recipe = entry.recipes?.cockpit_8080_religar;
  for (const field of ["command", "process", "working_directory", "user", "readback"]) {
    if (!String(recipe?.[field] || "").trim()) errors.push("RECIPE_FIELD_MISSING:cockpit_8080_religar:" + field);
  }
  if (recipe && recipe.official !== true) errors.push("RECIPE_NOT_OFFICIAL:cockpit_8080_religar");
  if (entry.sensor !== "scripts/lupa/validar-harness-casa-jea.mjs") errors.push("SENSOR_REF_DRIFT");
  return errors;
}

export function classifyLive(entry, live) {
  const proven = validateEntry(entry).length === 0 ? LOCK + " PROVEN" : "INVALID_REGISTRY";
  const results = live?.results || {};
  const expect = {
    T1: "OK", T2: "OK", T3: "OK", STOP: "OK",
    T4: "NOT_RECOGNIZED", T5: "NOT_RECOGNIZED", T6: "NOT_RECOGNIZED",
    T7: "NEGADO_ALLOWLIST", T8: "NEGADO_ALLOWLIST",
  };
  // Ordem importa: causa mais específica primeiro (refused antes do ConnectionError genérico).
  const causes = [
    [/Connection refused|ECONNREFUSED/i, "WINRM_PARADO"],
    [/timed out|ConnectTimeout|No route to host|Network is unreachable|Name or service not known|ConnectionError/i, "TAILSCALE_OU_VPN"],
    [/\b401\b|Unauthorized|Logon failure|AuthenticationError|credentials were rejected/i, "CREDENCIAL_REJEITADA"],
    [/InvalidResourceUri|configuration name|ConfigurationName|No session configuration/i, "JEA_NAO_REGISTRADO"],
    [/ENOENT|No such file/i, "CREDENCIAL_OU_SKILL_AUSENTE"],
  ];
  const perTest = {};
  let cause = null;
  for (const [test, want] of Object.entries(expect)) {
    const r = results[test];
    if (!r) { perTest[test] = "NAO_MEDIDO"; continue; }
    const text = (r.errors || []).join(" | ");
    const hit = causes.find(([re]) => re.test(text));
    if (hit) { perTest[test] = "⚠️ " + hit[1]; cause = cause || hit[1]; continue; }
    const got = r.ok === true ? "OK"
      : /is not recognized/i.test(text) ? "NOT_RECOGNIZED"
      : /NEGADO_ALLOWLIST/.test(text) ? "NEGADO_ALLOWLIST"
      : "ERRO";
    perTest[test] = got === want ? "PASS" : "DIVERGENTE:" + got;
    if (got !== want) cause = cause || "DIVERGENCIA_" + test;
  }
  // STOP é MEXER real: só entra quando o CHEFE pede; ausente = NAO_MEDIDO, não falha.
  const medidos = Object.values(perTest).filter((v) => v !== "NAO_MEDIDO");
  const live_state = medidos.length === 0 ? "⚠️ SEM_MEDICAO"
    : cause ? "⚠️ " + cause
    : medidos.every((v) => v === "PASS") ? "🟢 LIVE_PASS" : "🟡 LIVE_PARCIAL";
  return { route: MODULE_ID, proven, live_state, measured_at: live?.measured_at || null, per_test: perTest };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
  const registry = JSON.parse(fs.readFileSync(path.join(repo, REGISTRY), "utf8"));
  const entry = (registry.modules || []).find((m) => m.id === MODULE_ID);
  const liveAt = process.argv.indexOf("--live");
  if (liveAt > 0) {
    const live = JSON.parse(fs.readFileSync(process.argv[liveAt + 1], "utf8"));
    console.log(JSON.stringify(classifyLive(entry, live), null, 2));
  } else {
    const errors = validateEntry(entry);
    console.log(JSON.stringify({ route: MODULE_ID, registry: errors.length ? "FAIL" : "PASS", proven: errors.length ? "INVALID" : LOCK + " PROVEN", errors }, null, 2));
    process.exit(errors.length ? 1 : 0);
  }
}
