import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const ROOT = resolve(new URL("../..", import.meta.url).pathname);
const CORE = "LEIA-ME-IA.md";

const ADAPTERS = Object.freeze([
  ["CHATGPT.md", "CHATGPT"],
  ["CLAUDE.md", "CLAUDE"],
  ["GEMINI.md", "GEMINI"],
  ["CODEX.md", "CODEX"],
  [".claude/rules/00-centraldark-boot-universal.md", "CLAUDE_CODE"],
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
  /docs\/ARQUITETURA\//i,
  /\.agents\/skills\//i,
]);

function read(path) {
  return readFileSync(resolve(ROOT, path), "utf8");
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

test("adapters não formam cadeia ou cérebro paralelo", () => {
  const names = ADAPTERS.map(([path]) => path);
  for (const [path] of ADAPTERS) {
    const content = read(path);
    for (const other of names) {
      if (other === path) continue;
      assert.equal(content.includes(other), false, `ADAPTER_CHAIN_FORBIDDEN:${path}->${other}`);
    }
  }
});

test("round-trip preserva identidade do core independentemente da engine", () => {
  const signatures = new Set();
  for (const [path, engine] of ADAPTERS) {
    const content = read(path);
    const core = content.match(/CANONICAL_AGENT_CORE=([^\n\r]+)/)?.[1]?.trim();
    assert.equal(core, CORE, `CORE_ROUTE_MISMATCH:${path}`);
    signatures.add(`${core}|ONE_SOL|LAZY|${engine ? "ENGINE" : "NO_ENGINE"}`);
  }
  const normalized = new Set([...signatures].map((value) => value.replace(/\|ENGINE$/, "|ENGINE")));
  assert.equal(normalized.size, 1, "ADAPTERS_DIVERGED_FROM_SINGLE_CORE");
});
