#!/usr/bin/env node
// Canal LOCAL de inspecao humana de credencial (Missao 9, opcao 1).
// Imprime o valor real SOMENTE num terminal interativo, direto em /dev/tty.
// Recusa: stdin/stdout/stderr redirecionados, nome fora da allowlist canonica, sem /dev/tty.
// Auditoria: grava nome, tamanho, fingerprint parcial, usuario e hora. NUNCA o valor.
// Nunca e importado pelo servidor MCP e nao e exposto como ferramenta.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { findCredentialSpec, resolveCredential, fingerprintOf } from "../src/lib/credential-metadata.js";

function die(code, msg) {
  process.stderr.write(`inspect-credential-local: ${msg}\n`);
  process.exit(code);
}

function parseEnvFile(file, wanted) {
  const out = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(line);
    if (m && wanted.includes(m[1])) out[m[1]] = m[2].replace(/^(["'])(.*)\1$/, "$2");
  }
  return out;
}

const args = process.argv.slice(2);
const name = args.find((a) => !a.startsWith("--"));
const envFileIdx = args.indexOf("--env-file");
const envFile = envFileIdx >= 0 ? args[envFileIdx + 1] : null;

if (!name) die(2, "uso: inspect-credential-local.mjs NOME_CANONICO [--env-file caminho]");
const spec = findCredentialSpec(name);
if (!spec) die(2, "nome fora da allowlist canonica (src/lib/credential-metadata.js)");

if (!process.stdin.isTTY || !process.stdout.isTTY || !process.stderr.isTTY) {
  die(3, "recusado: exige terminal interativo (sem pipe/redirecionamento)");
}

let env = process.env;
if (envFile) {
  try {
    env = { ...parseEnvFile(envFile, spec.aliases) };
  } catch {
    die(4, "nao foi possivel ler o env-file informado");
  }
}
const found = resolveCredential(env, spec.aliases);
if (!found) die(5, `${name}: AUSENTE na fonte informada`);

let ttyFd;
try {
  ttyFd = fs.openSync("/dev/tty", "w");
} catch {
  die(6, "recusado: sem /dev/tty de controle");
}

const auditFile = process.env.CENTRALDARK_LOCAL_AUDIT || path.join(os.homedir(), ".centraldark", "credential-inspect.log");
fs.mkdirSync(path.dirname(auditFile), { recursive: true, mode: 0o700 });
fs.appendFileSync(
  auditFile,
  JSON.stringify({
    ts: new Date().toISOString(),
    event: "local_credential_inspect",
    name,
    origin: `env:${found.alias}`,
    length: found.raw.length,
    fingerprint: fingerprintOf(found.raw),
    user: os.userInfo().username,
  }) + "\n",
  { mode: 0o600 },
);

fs.writeSync(ttyFd, `${name} (${found.raw.length} chars, env:${found.alias}):\n${found.raw}\n`);
fs.closeSync(ttyFd);
