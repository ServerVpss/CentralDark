# OUTRO - openai-platform-api-key.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\openai-developers\scripts\openai-platform-api-key.mjs
**SHA:** 7dd08001d0712226
**Timestamp:** 2026-08-26T18:42:42.341365
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/;
- const SAFE_OPENAI_API_KEY_PATTERN = /^sk-[A-Za-z0-9_-]+$/;
- const envPattern = new RegExp(`^(export\\s+)?${envName}=`);

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node

import { randomUUID, webcrypto } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const { subtle } = webcrypto;
const ENCRYPTED_API_KEY_VERSION = 1;
const DEFAULT_ENV_NAME = "OPENAI_API_KEY";
const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/;
const SAFE_OPENAI_API_KEY_PATTERN = /^sk-[A-Za-z0-9_-]+$/;
const OPTIONS_WITH_VALUES = new Set([
  "ciphertext",
  "dir",
  "encrypted-result",
  "env-name",
  "name",
  "private-key",
  "target",
  "workspace",
]);
const VALID_OPTIONS = new Set(OPTIONS_WITH_VALUES);
const OPTIONS_ALLOWING_DASH_VALUES = new Set(["ciphertext"]);

function usage() {
  return `Usage:
  openai-platform-api-key.mjs prepare [--name <key name>] [--dir <state dir>]
  openai-platform-api-key.mjs decrypt --private-key <path> --target <path> (--ciphertext <value> | --encrypted-result <path>) [--env-name OPENAI_API_KEY] [--workspace <repo root>]

Commands:
  prepare   Generate a local RSA-OAEP keypair and public connector request.
  decrypt   Decrypt connector ciphertext locally and upsert an env var file.

The helper never prints the plaintext API key.`;
}

function fail(message, code = 1) {
  process.stderr.write(`${message}\n`);
  process.exit(code);
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) {
      args._.push(arg);
      continue;
    }
    const key = arg.slice(2);
    if (!VALID_OPTIONS.has(key)) {
      fail(`Unknown option: --${key}.`);
    }
    const value = argv[index + 1];
    if (OPTIONS_WITH_VALUES.has(key)) {
      if (value == null) {
        fail(`Missing value for --${key}.`);
      }
      if (value.startsWith("--") && !OPTIONS_ALLOWING_DASH_VALUES.has(key)) {
        fail(`Missing value for --${key}.`);
      }
      args[key] = value;
      index += 1;
      continue;
    }
  }
  return args;
}

function printJson(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function ensureUsableNodeCrypto() {
  if (subtle == null) {
    fail("This helper requires Node.js WebCrypto support.");
  }
}

function resolveOutputDir(rawDir) {
  if (rawDir) {
    const dir = path.resolve(String(rawDir));
    fs.mkdirSync(dir, { mode: 0o700, recursive: true });
    chmodBestEffort(dir, 0o700);
    return dir;
  }
  return fs.mkdtempSync(path.join(os.tmpdir(), "codex-openai-platform-"));
}

function chmodBestEffort(target, mode) {
  try {
    fs.chmodSync(target, mode);
  } catch {
    // Best effort only; chmod is not available on every filesystem.
  }
}

function unlinkBestEffort(target) {
  try {
    fs.unlinkSync(target);
  } catch {
    // Best effort cleanup for temporary files.
  }
}

const NOFOLLOW_OPEN_FLAG = fs.constants.O_NOFOLLOW ?? 0;

function isPathInside(parent, child) {
  const relative = path.relative(parent, child);
  return (
    relative === "" ||
    (relative !== ".." &&
      !relative.startsWith(`..${path.sep}`) &&
      !path.isAbsolute(relative))
  );
}

function realpathSyncOrFail(filePath, label) {
  try {
    return fs.realpathSync(filePath);
  } catch (error) {
    fail(`Failed to resolve ${label}: ${error.message}`);
  }
}

function statDirectoryOrFail(filePath, label) {
  let stat;
  try {
    stat = fs.statSync(filePath);
  } catch (error) {
    fail(`Failed to access ${label}: ${error.message}`);
  }
  if (!stat.isDirectory()) {
    fail(`${label} is not a directory: ${filePath}`);
  }
}

function resolveWorkspaceRoot(rawWorkspace) {
  const workspacePath = path.resolve(rawWorkspace || process.cwd());
  statDirectoryOrFail(workspacePath, "Workspace");
  return {
    requested_path: workspacePath,
    real_path: realpathSyncOrFail(workspacePath, "workspace"),
  };
}

function resolveSafeTarget(targetPath, workspace) {
  const resolvedTarget = path.isAbsolute(targetPath)
    ? path.resolve(targetPath)
    : path.resolve(workspace.requested_path, targetPath);
  const parentPath = path.dirname(resolvedTarget);
  statDirectoryOrFail(parentPath, "Target parent directory");
  const parentRealPath = realpathSyncOrFail(parentPath, "target parent directory");

  if (!isPathInside(workspace.real_path, parentRealPath)) {
    fail(
      `Target env file must be inside the workspace. Workspace: ${workspace.real_path}. Target: ${resolvedTarget}`,
    );
  }

  return path.join(parentRealPath, path.basename(resolvedTarget));
}

function lstatTarget(filePath) {
  try {
    return fs.lstatSync(filePath);
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }
    fail(`Failed to inspect target env file: ${error.message}`);
  }
}

function validateTargetFileType(filePath, stat) {
  if (stat == null) {
    return;
  }
  if (stat.isSymbolicLink()) {
    fail(`Refusing to write API key through symlink target: ${filePath}`);
  }
  if (!stat.isFile()) {
    fail(`Refusing to write API key to non-file target: ${filePath}`);
  }
  if (stat.nl
```