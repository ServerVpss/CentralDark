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
