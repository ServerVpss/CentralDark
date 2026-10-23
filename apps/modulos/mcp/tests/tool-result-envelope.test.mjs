import test from "node:test";
import assert from "node:assert/strict";
import { decorateToolResult } from "../src/tool-result-envelope.js";

test("success preserves payload and emits explicit communication envelope", () => {
  const result = decorateToolResult({
    content: [{ type: "text", text: "ok" }],
    structuredContent: { item: { id: 7 } },
  }, {
    toolName: "demo",
    correlationId: "cid-12345678",
    startedAt: Date.now() - 5,
  });

  assert.equal(result.isError, false);
  assert.equal(result.structuredContent.item.id, 7);
  assert.equal(result.structuredContent.centraldark.state, "SUCCESS");
  assert.equal(result.structuredContent.centraldark.error_state, "NONE");
  assert.equal(result.structuredContent.centraldark.error_code, "NONE");
  assert.equal(result.structuredContent.centraldark.correlation_id, "cid-12345678");
  assert.equal(result._meta.centraldark.schema, "centraldark.tool-call.v1");
});

test("error is explicit instead of relying on null metadata", () => {
  const result = decorateToolResult({
    isError: true,
    content: [{ type: "text", text: "falhou" }],
  }, {
    toolName: "demo",
    correlationId: "cid-87654321",
    errorCode: "TOOL_EXECUTION_ERROR",
  });

  assert.equal(result.isError, true);
  assert.equal(result.structuredContent.centraldark.state, "ERROR");
  assert.equal(result.structuredContent.centraldark.error_state, "PRESENT");
  assert.equal(result.structuredContent.centraldark.error_code, "TOOL_EXECUTION_ERROR");
});

test("missing correlation is explicit UNKNOWN, never fake PASS", () => {
  const result = decorateToolResult({ content: [{ type: "text", text: "ok" }] }, { toolName: "demo" });
  assert.equal(result.structuredContent.centraldark.correlation_id, "UNKNOWN");
  assert.equal(result.structuredContent.centraldark.action_is_proof, false);
});


test("delegation carries capability and a grounded diagnostic cursor without claiming proof", () => {
  const result = decorateToolResult({
    content: [{ type: "text", text: JSON.stringify({
      ok: false, status: "CONFIRMACAO_ADMIN_NECESSARIA",
      diagnostico: { nextCursor: "exigir_confirmacao_literal_do_usuario" },
    }) }],
    structuredContent: { centraldark_delegation: { tool: "admin_git_pull" } },
  }, { toolName: "mcp_admin_call", correlationId: "cid-delegated" });
  const trace = result.structuredContent.centraldark.continuity;
  assert.equal(trace.capability, "admin_git_pull");
  assert.equal(trace.next_cursor, "exigir_confirmacao_literal_do_usuario");
  assert.equal(trace.proof_verification, "NOT_VERIFIED_AT_ENVELOPE");
  assert.equal(trace.receipt_ref, "UNKNOWN");
});

test("explicit SHA/owner/receipt references are only reported, never certified", () => {
  const sha = "a".repeat(40);
  const result = decorateToolResult({
    structuredContent: { owner: "apps/modulos/mcp", source_sha: sha,
      intent_id: "mcp-lineage", receipt_ref: "receipt-125",
      recipe_fingerprint: "sha256:abc", proof_ref: "proof-01",
      next_cursor: "VALIDATE_RUNTIME" },
  }, { toolName: "deploy_status" });
  const trace = result.structuredContent.centraldark.continuity;
  assert.equal(trace.owner, "apps/modulos/mcp");
  assert.equal(trace.source_sha, sha);
  assert.equal(trace.receipt_ref, "receipt-125");
  assert.equal(trace.next_cursor, "VALIDATE_RUNTIME");
  assert.equal(trace.proof_verification, "NOT_VERIFIED_AT_ENVELOPE");
});

test("credentials and unproven absent metadata never enter the causal envelope", () => {
  const result = decorateToolResult({
    content: [{ type: "text", text: JSON.stringify({
      source_sha: "123", owner: "Bearer leak", next_cursor: "token=secret-value",
      receipt_ref: "-----BEGIN SECRET",
    }) }],
  }, { toolName: "unknown" });
  const trace = result.structuredContent.centraldark.continuity;
  assert.equal(trace.source_sha, "UNKNOWN");
  assert.equal(trace.owner, "UNKNOWN");
  assert.equal(trace.next_cursor, "UNKNOWN");
  assert.equal(trace.receipt_ref, "UNKNOWN");
  assert.equal(trace.proof_verification, "NOT_VERIFIED_AT_ENVELOPE");
});
