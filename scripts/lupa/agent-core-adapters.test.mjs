import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const ROOT = resolve(new URL("../..", import.meta.url).pathname);
const CORE = "LEIA-ME-IA.md";
const PORTABLE_BRIDGE = "docs/CONSCIENCIA/ARTEFATOS/centraldark-prompt-universal.md";
const CLAUDE_BRIDGE = "CLAUDE.md";
const CLAUDE_AUTOLOAD = ".claude/rules/00-centraldark-boot-universal.md";
const CLAUDE_SUBAGENT_ROOT = ".claude/agents";
const ALLOWED_ADAPTER_EDGES = new Set([`${CLAUDE_AUTOLOAD}->${CLAUDE_BRIDGE}`]);

const ADAPTERS = Object.freeze([
  ["CHATGPT.md", "CHATGPT"],
  [CLAUDE_BRIDGE, "CLAUDE"],
  ["GEMINI.md", "GEMINI"],
  ["CODEX.md", "CODEX"],
  [CLAUDE_AUTOLOAD, "CLAUDE_CODE"],
  [".cursor/rules/centraldark-governanca.mdc", "CURSOR"],
  [".windsurfrules", "WINDSURF"],
  [".github/copilot-instructions.md", "COPILOT"],
  [".github/codex/prompts/centraldark-system.md", "CODEX_SYSTEM"],
]);

const REQUIRED_ADAPTER_MARKERS = Object.freeze([
  `CANONICAL_AGENT_CORE=${CORE}`,
  "ONE_SOL=true",
  "ONE_CORE=true",
  "LAZY_LOAD_BY_DEMAND=true",
  "ENGINE_IS_REPLACEABLE=true",
  "TOOLS_REQUIRE_RUNTIME_MEASUREMENT=true",
  "DO_NOT_DUPLICATE_GOVERNANCE=true",
  "DO_NOT_DEFINE_IDENTITY=true",
  "DO_NOT_DEFINE_AUTHORITY=true",
  "DO_NOT_DEFINE_MERGE_POLICY=true",
  "DO_NOT_DEFINE_MEMORY=true",
  "DO_NOT_CREATE_PARALLEL_AGENT=true",
  "FUTURE_RULES_CONSUMED_FROM_CORE=true",
]);

const CORE_REQUIRED_MARKERS = Object.freeze([
  "REUSE_BEFORE_CREATE_REQUIRED=true",
  "SOL=ONE",
  "MODELS=REPLACEABLE_ENGINES",
  "FREQUENCY=ADAPTIVE_EXECUTION_PROFILE",
  "ONE_WRITER_PER_SCOPE=true",
  "REALITY_IS_JUDGE=true",
  "#ACORDAR = RECUPERAR O ESTADO REAL ANTES DE CONTINUAR",
  "!CALIBRAR = ALINHAR INTERPRETACAO + PAPEL + ESCOPO + TOOLS + PROVA",
]);

const FORBIDDEN_ADAPTER_POLICY = Object.freeze([
  /NO_HUMAN_REASK_FOR_MERGE/i,
  /MERGE_METHOD\s*=\s*squash/i,
  /Intent-Authorized:/i,
  /Merge-Policy:/i,
  /SEGREDO\/CHEFE\s*=\s*humano/i,
  /PIVETE\/HERMES\s*=\s*executor/i,
  /AUTORIDADE_FINAL\s*=/i,
  /docs\/CONSCIENCIA\//i,
]);

const FORBIDDEN_CLAUDE_SUBAGENT_AUTHORITY = Object.freeze([
  /SUBAGENT_IS_AUTHORITY\s*=\s*true/i,
  /SUBAGENT_CANONICAL_OWNER\s*=\s*true/i,
  /SUBAGENT_LOCAL_MEMORY_IS_CANONICAL\s*=\s*true/i,
  /CANONICAL_AGENT_CORE\s*=\s*(?!LEIA-ME-IA\.md)/i,
  /DO_NOT_DEFINE_AUTHORITY\s*=\s*false/i,
  /DO_NOT_DEFINE_MEMORY\s*=\s*false/i,
]);

function read(path) {
  return readFileSync(resolve(ROOT, path), "utf8");
}

function claudeSubagents() {
  return readdirSync(resolve(ROOT, CLAUDE_SUBAGENT_ROOT), { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => `${CLAUDE_SUBAGENT_ROOT}/${entry.name}`)
    .sort();
}

function pythonSelfTest(script) {
  const candidates = ["python3", "python"];
  let last = null;
  for (const command of candidates) {
    const result = spawnSync(command, [resolve(ROOT, script), "--self-test"], {
      cwd: ROOT,
      encoding: "utf8",
      timeout: 30_000,
    });
    if (result.error?.code === "ENOENT") {
      last = result;
      continue;
    }
    assert.equal(result.status, 0, `${script} failed\nstdout=${result.stdout}\nstderr=${result.stderr}`);
    const parsed = JSON.parse(result.stdout);
    assert.equal(parsed.status, "PASS", `${script} status=${parsed.status}`);
    return parsed;
  }
  assert.fail(`PYTHON_RUNTIME_NOT_FOUND:${script}:${last?.error?.message || "unknown"}`);
}

test("LEIA-ME-IA permanece o core singleton e contém invariantes roteadores", () => {
  const core = read(CORE);
  for (const marker of CORE_REQUIRED_MARKERS) {
    assert.ok(core.includes(marker), `CORE_MARKER_MISSING:${marker}`);
  }
});

test("todos os adapters ativos são finos, substituíveis e apontam somente para o core", () => {
  for (const [path, engine] of ADAPTERS) {
    const content = read(path);
    assert.ok(content.includes(`ENGINE=${engine}`), `ENGINE_MARKER_MISSING:${path}:${engine}`);
    for (const marker of REQUIRED_ADAPTER_MARKERS) {
      assert.ok(content.includes(marker), `ADAPTER_MARKER_MISSING:${path}:${marker}`);
    }
    assert.ok(content.length <= 2400, `ADAPTER_TOO_LARGE:${path}:${content.length}`);
    for (const forbidden of FORBIDDEN_ADAPTER_POLICY) {
      assert.equal(forbidden.test(content), false, `ADAPTER_REDEFINED_CANONICAL_POLICY:${path}:${forbidden}`);
    }
  }
});

test("adapters não formam cadeia; só Claude autoload pode atravessar Claude.md antes do core", () => {
  const names = ADAPTERS.map(([path]) => path);
  for (const [path] of ADAPTERS) {
    const content = read(path);
    for (const other of names) {
      if (other === path) continue;
      const edge = `${path}->${other}`;
      if (ALLOWED_ADAPTER_EDGES.has(edge)) {
        assert.ok(content.includes(other), `REQUIRED_ADAPTER_EDGE_MISSING:${edge}`);
        continue;
      }
      assert.equal(content.includes(other), false, `ADAPTER_CHAIN_FORBIDDEN:${edge}`);
    }
  }
  assert.deepEqual([...ALLOWED_ADAPTER_EDGES], [`${CLAUDE_AUTOLOAD}->${CLAUDE_BRIDGE}`]);
});

test("round-trip de qualquer engine termina no mesmo core", () => {
  const coreRefs = new Set();
  for (const [path] of ADAPTERS) {
    const content = read(path);
    const core = content.match(/CANONICAL_AGENT_CORE=([^\n\r]+)/)?.[1]?.trim();
    assert.equal(core, CORE, `CORE_ROUTE_MISMATCH:${path}`);
    coreRefs.add(core);
  }
  assert.deepEqual([...coreRefs], [CORE]);
});

test("CARACOL fecha ida e volta sem fragmento e bloqueia duplicata", () => {
  const out = pythonSelfTest("scripts/trigger-fabric/spiral_traversal.py");
  assert.equal(out.forward_reverse_same_denominator, true);
  assert.equal(out.nucleus_tail_proven, true);
  assert.equal(out.duplicate_negative_test_blocks, true);
});

test("Runtime Plug valida manifesto, resource-fit, lease e swap A↔B", () => {
  const out = pythonSelfTest("scripts/trigger-fabric/runtime_plug_conformance.py");
  assert.equal(out.passed, out.denominator);
  for (const [name, value] of Object.entries(out.checks)) {
    assert.equal(value, true, `RUNTIME_PLUG_CHECK_FAIL:${name}`);
  }
});

test("Claude descobre subagentes sem inverter autoridade do core", () => {
  const bridge = read(CLAUDE_BRIDGE);
  const autoload = read(CLAUDE_AUTOLOAD);

  for (const marker of [
    "SUBAGENT_ROOT=.claude/agents",
    "CLAUDE_DISCOVERS_SUBAGENTS=true",
    "SUBAGENTS_INHERIT_CANONICAL_CORE=true",
    "SUBAGENT_IS_AUTHORITY=false",
    "PROVIDER_LOCAL_MEMORY_IS_CANONICAL=false",
    "CAPABILITY_SELECTION_OWNER=.agents/skills/capability-contract-router/SKILL.md",
    "DELEGATION_OWNER=scripts/agent-call.mjs",
  ]) {
    assert.ok(bridge.includes(marker), `CLAUDE_BRIDGE_MARKER_MISSING:${marker}`);
  }

  for (const marker of [
    "SUBAGENT_ROOT=.claude/agents",
    "ALL_CLAUDE_SUBAGENTS_INHERIT_CORE=true",
    "SUBAGENT_IS_AUTHORITY=false",
    "SUBAGENT_CANONICAL_OWNER=false",
    "SUBAGENT_LOCAL_MEMORY_IS_CANONICAL=false",
    "CAPABILITY_ROUTER=.agents/skills/capability-contract-router/SKILL.md",
    "DELEGATION_GATE=scripts/agent-call.mjs",
    "AUTHORITY_FLOW_REVERSED=false",
  ]) {
    assert.ok(autoload.includes(marker), `CLAUDE_AUTOLOAD_MARKER_MISSING:${marker}`);
  }

  const subagents = claudeSubagents();
  assert.ok(subagents.length > 0, "CLAUDE_SUBAGENT_DENOMINATOR_EMPTY");
  for (const path of subagents) {
    const content = read(path);
    for (const forbidden of FORBIDDEN_CLAUDE_SUBAGENT_AUTHORITY) {
      assert.equal(forbidden.test(content), false, `CLAUDE_SUBAGENT_AUTHORITY_DRIFT:${path}:${forbidden}`);
    }
  }
});

test("prompt universal é ponte gerada, não segunda governança manual", () => {
  const content = read(PORTABLE_BRIDGE);
  for (const marker of [
    `CANONICAL_AGENT_CORE=${CORE}`,
    "PORTABLE_GENERATOR=scripts/lupa/portable-kernel.mjs",
    "ONE_SOL=true",
    "ONE_CORE=true",
    "MANUAL_GOVERNANCE_COPY=false",
    "PORTABLE_PACKAGE_IS_CACHE_NOT_AUTHORITY=true",
    "PORTABLE_PACKAGE_SOURCE=LIVE_REPOSITORY_CANONICAL_FILES",
    "STALE_PACKAGE_ACTION=REBUILD_FROM_LIVE_REPOSITORY",
    "ENGINE_IS_REPLACEABLE=true",
    "FUTURE_RULES_CONSUMED_FROM_CORE=true",
  ]) {
    assert.ok(content.includes(marker), `PORTABLE_BRIDGE_MARKER_MISSING:${marker}`);
  }
  assert.ok(content.length <= 3200, `PORTABLE_BRIDGE_TOO_LARGE:${content.length}`);
  for (const forbidden of [
    /NO_HUMAN_REASK_FOR_MERGE/i,
    /MERGE_METHOD\s*=\s*squash/i,
    /Intent-Authorized:/i,
    /Merge-Policy:/i,
    /SEGREDO\/CHEFE\s*=\s*humano/i,
    /PIVETE\/HERMES\s*=\s*executor/i,
  ]) {
    assert.equal(forbidden.test(content), false, `PORTABLE_BRIDGE_REDEFINED_POLICY:${forbidden}`);
  }
});
