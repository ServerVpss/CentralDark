# COMANDO - openai-platform-api-key.test.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\openai-developers\tests\openai-platform-api-key.test.mjs
**SHA:** ffb13c4e77471fb3
**Timestamp:** 2026-08-26T18:40:23.707575
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- /Treat this as the credential gate: inspect safely, ask reuse-vs-new before API work/,

### Gaps
- const missing = runScriptFailure(["prepare", "--dir", "--name", "Unit Test"]);

### Ouro Bruto (primeiros 5000 chars)
```
import { execFileSync, spawnSync } from "node:child_process";
import { webcrypto } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";

const { subtle } = webcrypto;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.resolve(
  __dirname,
  "../scripts/openai-platform-api-key.mjs",
);
const SKILL = path.resolve(
  __dirname,
  "../skills/openai-platform-api-key/SKILL.md",
);
const SKILL_AGENT_METADATA = path.resolve(
  __dirname,
  "../skills/openai-platform-api-key/agents/openai.yaml",
);
const EVALS = path.resolve(
  __dirname,
  "../skills/openai-platform-api-key/references/evals.md",
);
const PLUGIN_MANIFEST = path.resolve(__dirname, "../.codex-plugin/plugin.json");
const MCP_MANIFEST = path.resolve(__dirname, "../.mcp.json");
const MCP_SERVER = path.resolve(__dirname, "../mcp/server.mjs");
const OPENAI_DOCS_SKILL = path.resolve(
  __dirname,
  "../../../skills/skills/openai-docs/SKILL.md",
);
const APPLIED_OPENAI_DOCS_SKILL = path.resolve(
  __dirname,
  "../../../lib/applied/applied_skills/applied_skills/example_skills/openai-docs/current/SKILL.md",
);
const PLUGIN_ICON = path.resolve(
  __dirname,
  "../assets/openai-platform.png",
);
const APP_ICON = path.resolve(
  __dirname,
  "../../../chatgpt/web/public/images/ecosystem/apps/openai_platform/icon.png",
);
const SECRET = "[REDIGIDO-PRESERVACAO]";

function runScript(args) {
  return execFileSync(process.execPath, [SCRIPT, ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function runScriptFailure(args) {
  return spawnSync(process.execPath, [SCRIPT, ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function runMcpServer(requests) {
  const result = spawnSync(process.execPath, [MCP_SERVER], {
    encoding: "utf8",
    input: `${requests.map((request) => JSON.stringify(request)).join("\n")}\n`,
    stdio: ["pipe", "pipe", "pipe"],
    timeout: 5_000,
  });

  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, "");
  return result.stdout
    .split(/\r?\n/u)
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line));
}

function base64url(bytes) {
  return Buffer.from(bytes).toString("base64url");
}

async function encryptWithPublicJwk(publicJwk, plaintext) {
  const publicKey = await subtle.importKey(
    "jwk",
    publicJwk,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    false,
    ["encrypt"],
  );
  const ciphertext = await subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    publicKey,
    new TextEncoder().encode(plaintext),
  );
  return base64url(ciphertext);
}

test("prepare writes private key locally and emits a public connector request", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "openai-platform-helper-test-"));
  const output = JSON.parse(runScript(["prepare", "--name", "Unit Test", "--dir", dir]));
  const request = JSON.parse(fs.readFileSync(output.request_path, "utf8"));
  const privateKey = JSON.parse(fs.readFileSync(output.private_key_path, "utf8"));

  assert.equal(request.name, "Unit Test");
  assert.deepEqual(Object.keys(request.recipient_public_key_jwk).sort(), ["e", "kty", "n"]);
  assert.equal(request.recipient_public_key_jwk.kty, "RSA");
  assert.equal(request.recipient_public_key_jwk.e, "AQAB");
  assert.equal(Boolean(privateKey.d), true);
  assert.equal(output.recipient_public_key_jwk.d, undefined);
});

test("skill documents picker lookup and local destination confirmation", () => {
  const skill = fs.readFileSync(SKILL, "utf8");

  assert.match(skill, /tool_search/);
  assert.match(skill, /`open_codex_api_key_setup` tool/);
  assert.match(skill, /call `open_codex_api_key_setup` directly with no arguments \(`\{\}`\)/);
  assert.match(skill, /local destination confirmation/);
  assert.match(skill, /OpenAI Developers MCP `confirm_openai_api_key_local_destination` tool/);
  assert.match(skill, /if the picker tool is unavailable or fails before the widget opens/);
  assert.match(skill, /`create_encrypted_openai_api_key`/);
  assert.match(skill, /## Helper/);
});

test("plugin registers the editable local destination confirmation MCP tool", () => {
  const pluginManifest = JSON.parse(fs.readFileSync(PLUGIN_MANIFEST, "utf8"));
  const manifest = JSON.parse(fs.readFileSync(MCP_MANIFEST, "utf8"));
  const responses = runMcpServer([
    {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-11-25",
        capabilities: {},
        clientInfo: { name: "openai-developers-test", version: "0.1.0" },
      },
    },
    {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
      params: {},
    },
  ]);

  assert.equal(pluginManifest.mcpServers, "./.mcp.json");
  assert.deepEqual(
    manifest.mcpServers["openai-api-key-loc
```