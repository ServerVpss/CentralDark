import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeText } from "../src/sanitize.mjs";

test("PAT e JWT são redigidos", () => {
  const input = "github_pat_abcdefghijklmnopqrstuvwxyz eyJabc.def.ghi";
  const output = sanitizeText(input);
  assert.equal(output.includes("github_pat_"), false);
  assert.equal(output.includes("eyJabc"), false);
});

test("camelCase secret é redigido", () => {
  assert.match(sanitizeText("centraldarkApiKey=abc123456789"), /<REDACTED>/);
});

test("private key e AWS access key são redigidas", () => {
  const input = "[REDIGIDO-PRESERVACAO] [REDIGIDO-PRESERVACAO]";
  const output = sanitizeText(input);
  assert.equal(output.includes("BEGIN PRIVATE KEY"), false);
  assert.equal(output.includes("[REDIGIDO-PRESERVACAO]"), false);
});
