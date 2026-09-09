import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { loadProviderCredentialPointers } from "../src/provider-admin-bridge.js";

const KEYS = [
  "CONTABO_CLIENT_ID",
  "CONTABO_CLIENT_SECRET",
  "CONTABO_API_USER",
  "CONTABO_API_PASSWORD",
];

function clearProviderEnv() {
  for (const key of KEYS) {
    delete process.env[key];
    delete process.env[`${key}_FILE`];
  }
  delete process.env.CENTRALDARK_PROVIDER_ENV_FILE;
}

test("provider credentials can come from one local env-file pointer without leaking values", () => {
  clearProviderEnv();
  const dir = mkdtempSync(join(tmpdir(), "centraldark-provider-"));
  const envFile = join(dir, "provider.env");
  try {
    writeFileSync(envFile, [
      "CONTABO_CLIENT_ID=id-from-file",
      "CONTABO_CLIENT_SECRET=placeholder",
      "CONTABO_API_USER=user-from-file",
      "CONTABO_API_PASSWORD=placeholder",
      "UNRELATED_SHOULD_NOT_LOAD=nope",
    ].join("\n"), { mode: 0o600 });
    process.env.CENTRALDARK_PROVIDER_ENV_FILE = envFile;

    const result = loadProviderCredentialPointers(process.env);

    assert.equal(result.configured, true);
    assert.deepEqual(new Set(result.loadedKeys), new Set(KEYS));
    assert.equal(process.env.CONTABO_CLIENT_ID, "id-from-file");
    assert.equal(process.env.CONTABO_CLIENT_SECRET, "placeholder");
    assert.equal(process.env.UNRELATED_SHOULD_NOT_LOAD, undefined);
    assert.equal(JSON.stringify(result).includes("placeholder"), false);
  } finally {
    clearProviderEnv();
    rmSync(dir, { recursive: true, force: true });
  }
});

test("direct environment keeps precedence over local file pointers", () => {
  clearProviderEnv();
  const dir = mkdtempSync(join(tmpdir(), "centraldark-provider-"));
  const secretFile = join(dir, "client-id");
  try {
    writeFileSync(secretFile, "from-file\n", { mode: 0o600 });
    process.env.CONTABO_CLIENT_ID = "already-configured";
    process.env.CONTABO_CLIENT_ID_FILE = secretFile;

    const result = loadProviderCredentialPointers(process.env);

    assert.equal(process.env.CONTABO_CLIENT_ID, "already-configured");
    assert.equal(result.loadedKeys.includes("CONTABO_CLIENT_ID"), false);
  } finally {
    clearProviderEnv();
    rmSync(dir, { recursive: true, force: true });
  }
});
