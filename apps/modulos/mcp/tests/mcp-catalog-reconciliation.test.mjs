import test from "node:test";
import assert from "node:assert/strict";
import { reconcileCatalogNames } from "../src/tools/core/mcp-diagnostics.js";

test("catalog reconciliation catches dispatcher tools missing from public surface", () => {
  const result = reconcileCatalogNames(["alpha", "beta"], ["alpha"], ["alpha"]);
  assert.equal(result.ok, false);
  assert.deepEqual(result.dispatcherMissingFromPublic, ["beta"]);
});

test("catalog reconciliation classifies known public-only diagnostic tools", () => {
  const result = reconcileCatalogNames(["alpha"], ["alpha", "mcp_catalog_diff"], ["alpha"]);
  assert.equal(result.ok, true);
  assert.deepEqual(result.classifiedPublicOnly, ["mcp_catalog_diff"]);
  assert.deepEqual(result.unclassifiedPublicOnly, []);
});

test("catalog reconciliation fails on unclassified public-only tools and missing expectations", () => {
  const result = reconcileCatalogNames(["alpha"], ["alpha", "surprise"], ["alpha", "required"]);
  assert.equal(result.ok, false);
  assert.deepEqual(result.unclassifiedPublicOnly, ["surprise"]);
  assert.deepEqual(result.expectedMissingPublic, ["required"]);
});

test("catalog reconciliation detects duplicate names on either surface", () => {
  const result = reconcileCatalogNames(["alpha", "alpha"], ["alpha", "alpha"], ["alpha"]);
  assert.equal(result.ok, false);
  assert.deepEqual(result.runtimeDuplicates, ["alpha"]);
  assert.deepEqual(result.publicDuplicates, ["alpha"]);
});
