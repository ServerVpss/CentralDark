import test from "node:test";
import assert from "node:assert/strict";

const { getCatalogSummary } = await import("../src/tools/core/tools-catalog.js");
const summary = getCatalogSummary();

const REQUIRED = [
  "provider", "owner", "execution_class", "declaration_status",
  "runtime_status", "proof_boundary", "readback_required", "mutation_class",
  "source_catalog", "evidence_ref",
];

test("cada entrada do catálogo separa declaração de prova de runtime", () => {
  assert.ok(summary.toolCount > 0);
  for (const tool of summary.tools) {
    for (const key of REQUIRED) assert.ok(Object.hasOwn(tool, key), `${tool.name}.${key}`);
    assert.equal(tool.declaration_status, "declared");
    assert.equal(tool.runtime_status, "unproven");
    assert.equal(tool.proof_boundary, "DECLARED_CAPABILITY != RUNTIME_PROVEN");
    assert.equal(tool.source_catalog, "apps/modulos/mcp/src/tools/core/tools-catalog.js");
    assert.ok(tool.evidence_ref.startsWith("declaration:"));
  }
});

test("classes deterministic, local-ai e hybrid estão presentes", () => {
  const classes = new Set(summary.tools.map((tool) => tool.execution_class));
  assert.deepEqual([...classes].sort(), ["deterministic", "hybrid", "local-ai"]);
});

test("providers declarados cobrem GitHub, Supabase, Cloudflare e IA local", () => {
  const providers = summary.tools.map((tool) => tool.provider).join("|");
  assert.match(providers, /github/);
  assert.match(providers, /supabase/);
  assert.match(providers, /cloudflare/);
  assert.match(providers, /local-ai|kylin/);
});

test("readback acompanha a classe de mutação", () => {
  for (const tool of summary.tools) {
    assert.equal(tool.readback_required, tool.mutation_class !== "read-only", tool.name);
  }
});
