#!/usr/bin/env node
/**
 * Asserts all-zero (null OID) before SHA is handled as SEM_BASE / no-base —
 * never treated as a merge-base/diff base (FABLE JUDGE pattern).
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const NULL_OID = "0000000000000000000000000000000000000000";

test("null OID is recognized as 40 zeros", () => {
  assert.equal(NULL_OID.length, 40);
  assert.match(NULL_OID, /^0{40}$/);
});

test("validateExternalDelta: 40-zero base → SEM_BASE / NOT_APPLICABLE (no merge-base)", async () => {
  const mod = await import(
    join(ROOT, "scripts/lupa/validar-identidade-operacional.mjs")
  );
  assert.equal(typeof mod.isNullOid, "function");
  assert.equal(mod.isNullOid(NULL_OID), true);
  assert.equal(mod.isNullOid("abc"), false);

  const report = mod.validateExternalDelta(ROOT, {
    baseRef: NULL_OID,
    headRef: "HEAD",
  });
  assert.equal(report.status, "NOT_APPLICABLE_NO_DIFF_REFS");
  assert.equal(report.scope, "SEM_BASE");
  assert.equal(report.base_ref, null);
  assert.equal(report.findings.length, 0);
});

test("validateExternalDelta: missing refs still NOT_APPLICABLE", async () => {
  const mod = await import(
    join(ROOT, "scripts/lupa/validar-identidade-operacional.mjs")
  );
  const report = mod.validateExternalDelta(ROOT, {});
  assert.equal(report.status, "NOT_APPLICABLE_NO_DIFF_REFS");
});
