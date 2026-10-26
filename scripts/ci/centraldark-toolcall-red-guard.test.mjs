import test from "node:test";
import assert from "node:assert/strict";
import { parseAdvertisedTools, classifyToolName, redIdentity } from "./centraldark-toolcall-red-guard.mjs";

const error = "Tool call read_files was rejected before execution: AI_NoSuchToolError: " +
  "Model tried to call unavailable tool 'read_files'. Available tools: " +
  "web_search, composio_manage_connections, composio_multi_execute_tool, " +
  "composio_search_tools, skills, read_files, search_codebase, fetch_web_content, " +
  "editor, ask_question, run_commands";

test("RED #001: hallucinated tools are rejected before any call", () => {
  for (const name of ["ask_ou_bot", "read_arch", "read_file", "comando_shel"]) {
    const r = classifyToolName({ requestedName: name, errorText: error });
    assert.equal(r.state, "NOT_ADVERTISED");
    assert.equal(r.mayExecute, false);
    assert.equal(r.proof, false);
  }
});

test("RED #002: advertised yet rejected is router-parity incident, not an alias problem", () => {
  for (const name of ["read_files", "run_commands"]) {
    const result = classifyToolName({
      requestedName: name,
      errorText: error,
    });
    assert.equal(result.state, "ADVERTISED_BUT_REJECTED");
    assert.equal(result.mayExecute, false);
    assert.equal(result.next, "STOP_ALIAS_GUESSING_AND_DIAGNOSE_DISPATCH");
  }
});

test("An explicit resolver discrepancy is blocked even when advertised", () => {
  const r = classifyToolName({
    requestedName: "read_files",
    advertisedTools: ["read_files", "run_commands"],
    resolverTools: ["web_search"],
  });
  assert.equal(r.state, "TOOL_REGISTRY_PARITY_BLOCKED");
  assert.equal(r.mayExecute, false);
});

test("Case, namespace, spaces and spelling are exact: no auto-alias", () => {
  for (const name of ["READ_FILES", "read files", "CentralDark__read_files", "read_file"]) {
    const r = classifyToolName({
      requestedName: name,
      advertisedTools: ["read_files"],
      resolverTools: ["read_files"],
    });
    assert.equal(r.state, "NOT_ADVERTISED");
  }
});

test("Only a matching advertised + resolver contract is eligible for safe probe", () => {
  const r = classifyToolName({
    requestedName: "read_files",
    advertisedTools: ["read_files"],
    resolverTools: ["read_files"],
  });
  assert.equal(r.state, "PREFLIGHT_MATCH_ONLY");
  assert.equal(r.mayExecute, true);
  assert.equal(r.proof, false); // validation is NOT an execution receipt
});

test("Unknown catalogs and missing schemas fail closed", () => {
  assert.equal(classifyToolName({ requestedName: "read_files" }).state, "UNKNOWN_NO_ADVERTISED_TOOLSET");
  assert.equal(classifyToolName({ requestedName: "read_files", advertisedTools: ["read_files"] }).state, "UNKNOWN_RESOLVER");
  assert.equal(classifyToolName({ advertisedTools: ["read_files"] }).state, "UNKNOWN_NO_TOOL_NAME");
});

test("Repeated identical failure trips breaker without turning RED into PASS", () => {
  const first = classifyToolName({ requestedName: "read_files", errorText: error });
  const second = classifyToolName({
    requestedName: "read_files",
    errorText: error,
    previousFailures: [first.fingerprint],
  });
  assert.equal(second.state, "RETRY_LOOP_BLOCKED");
  assert.equal(second.mayExecute, false);
});

test("Same failure in same host/surface keeps one identity; different host separates", () => {
  const fingerprint = classifyToolName({ requestedName: "read_files", errorText: error }).fingerprint;
  const a = redIdentity({ fingerprint, host: "CASA", surface: "CLINE" });
  assert.equal(a, redIdentity({ fingerprint, host: "CASA", surface: "CLINE" }));
  assert.notEqual(a, redIdentity({ fingerprint, host: "VPS", surface: "HERMES" }));
});

test("Parse list, not models' guesses or a long prose alias catalog", () => {
  const list = parseAdvertisedTools(error);
  assert.equal(list.includes("read_files"), true);
  assert.equal(list.includes("run_commands"), true);
  assert.equal(list.includes("read_file"), false);
  assert.equal(list.includes("comando_shell"), false);
});
