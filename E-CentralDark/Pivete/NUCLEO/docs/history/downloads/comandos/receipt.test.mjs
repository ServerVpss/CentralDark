import test from "node:test";
import assert from "node:assert/strict";
import { buildReceipt, verifyReceiptSignature } from "../src/receipt.mjs";

test("receipt HMAC válido é verificável", () => {
  const receipt = buildReceipt({ command: "#x", mode: "standard", status: "PASS", configHash: "a", prompt: "b", output: "c", target: {} }, { hmacKey: "key" });
  assert.equal(verifyReceiptSignature(receipt, "key"), true);
});

test("receipt adulterado falha", () => {
  const receipt = buildReceipt({ command: "#x", mode: "standard", status: "PASS", configHash: "a", prompt: "b", output: "c", target: {} }, { hmacKey: "key" });
  receipt.status = "FAIL";
  assert.equal(verifyReceiptSignature(receipt, "key"), false);
});

test("receiptHash adulterado falha", () => {
  const receipt = buildReceipt({ command: "#x", mode: "standard", status: "PASS", configHash: "a", prompt: "b", output: "c", target: {} }, { hmacKey: "key" });
  receipt.receiptHash = "0".repeat(64);
  assert.equal(verifyReceiptSignature(receipt, "key"), false);
});
