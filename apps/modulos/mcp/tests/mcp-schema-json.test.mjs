import assert from "node:assert/strict";
import test from "node:test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const repoRoot = "/data/cache/scratch/CentralDark-mcp-schema-fix";
process.env.CENTRALDARK_ROOT = repoRoot;
process.env.CENTRALDARK_LOG_ROOT = join(repoRoot, ".tmp-test-logs");
mkdirSync(process.env.CENTRALDARK_LOG_ROOT, { recursive: true });

const [{ ALL_TOOLS }, { zodTypeToJsonSchema }, { z }] = await Promise.all([
  import("../src/tools/core/tools-catalog.js"),
  import("../src/mcp-server.js"),
  import("zod"),
]);

test("every published MCP tool has a valid top-level input schema type", () => {
  assert.ok(ALL_TOOLS.length > 0);
  for (const tool of ALL_TOOLS) {
    const schema = zodTypeToJsonSchema(tool.inputSchema);
    assert.equal(schema.type, "object", tool.name);
    assert.ok(schema.properties && typeof schema.properties === "object", tool.name);
  }
});

test("refined skill schemas preserve their object schema", () => {
  for (const name of ["skill_instalar", "skill_status", "skill_atualizar"]) {
    const tool = ALL_TOOLS.find((candidate) => candidate.name === name);
    assert.ok(tool, name);
    assert.equal(zodTypeToJsonSchema(tool.inputSchema).type, "object", name);
  }
});

test("nested Zod arrays retain their item type", () => {
  assert.deepEqual(zodTypeToJsonSchema(z.array(z.string())), {
    type: "array",
    items: { type: "string" },
  });
});
