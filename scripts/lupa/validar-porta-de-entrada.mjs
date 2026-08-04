#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, posix, resolve } from "node:path";

const argv = process.argv.slice(2);
const valueAfter = (name, fallback) => {
  const index = argv.indexOf(name);
  return index >= 0 && argv[index + 1] ? argv[index + 1] : fallback;
};

const ROOT = resolve(valueAfter("--repo-root", process.cwd()));
const JSON_OUT = argv.includes("--json");
const PORTA = "LEIA-ME-IA.md";
const PORTA_VIVA = "docs/CONSCIENCIA/00-PORTA-DE-ENTRADA-IA.md";
const CONTRATO_DELTA = "docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md";
const CONTRATO_RECONCILIACAO = "docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json";
const IDENTIDADE_LUPA = ".agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA";

const ADAPTADORES = [
  "AGENTS.md",
  "CHATGPT.md",
  "CODEX.md",
  "CLAUDE.md",
  "README.md",
  ".claude/rules/00-centraldark-boot-universal.md",
  ".github/copilot-instructions.md",
  "GEMINI.md",
  ".cursor/rules/centraldark-governanca.mdc",
  ".windsurfrules",
];

const ENTRADAS = [PORTA, ...ADAPTADORES];
const GERADOS = [
  /^docs\/RELATORIOS\//,
  /^apps\/modulos\/status\//,
  /^docs\/ESTADO-DA-RETOMADA\.md$/,
];

const existe = (relativePath) => existsSync(join(ROOT, relativePath));
const ler = (relativePath) => {
  try {
    return readFileSync(join(ROOT, relativePath), "utf8");
  } catch {
    return "";
  }
};
const ehGerado = (relativePath) => GERADOS.some((pattern) => pattern.test(relativePath));

function lerJson(relativePath) {
  try {
    return JSON.parse(ler(relativePath));
  } catch {
    return null;
  }
}

function caminhosCitados(texto) {
  const encontrados = new Set();
  const padroes = [
    /\[[^\]]*\]\(([^)\s#]+)\)/g,
    /`([^`\n]+\.(?:md|mdc|mjs|js|json|py|sh|ps1|yml|yaml))`/g,
    /(?:^|[\s(>])((?:docs|scripts|apps|infra|conexao-ia|\.agents|\.github|\.claude|\.cursor)\/[^\s`)"',;]+)/gm,
  ];

  for (const pattern of padroes) {
    let match;
    while ((match = pattern.exec(texto)) !== null) {
      let candidate = match[1].trim().replace(/^\.\//, "").replace(/[.,;:]+$/, "");
      if (!candidate || candidate.startsWith("http") || candidate.startsWith("#")) continue;
      if (!candidate.includes("/") && !ENTRADAS.includes(candidate)) continue;
      candidate = posix.normalize(candidate);
      if (candidate.startsWith("../") || candidate.startsWith("/")) continue;
      encontrados.add(candidate);
    }
  }

  return [...encontrados];
}

function canonicos() {
  const output = [];
  const walk = (directory) => {
    let entries = [];
    try {
      entries = readdirSync(join(ROOT, directory), { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const relativePath = posix.join(directory, entry.name);
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) {
        if (!/^(?:node_modules|\.git)$/.test(entry.name)) walk(relativePath);
        continue;
      }
      if (!entry.name.endsWith(".md") || ehGerado(relativePath)) continue;
      if (/^status:\s*"?CAN[OÔ]NICO"?/im.test(ler(relativePath).slice(0, 700))) output.push(relativePath);
    }
  };

  walk("docs");
  walk(".agents");
  return output;
}

const errors = [];
const warnings = [];

if (!existe(PORTA)) errors.push(`PORTA_AUSENTE:${PORTA}`);
if (!existe(PORTA_VIVA)) errors.push(`PORTA_VIVA_AUSENTE:${PORTA_VIVA}`);
if (!existe(CONTRATO_DELTA)) errors.push(`CONTRATO_DELTA_AUSENTE:${CONTRATO_DELTA}`);
if (!existe(CONTRATO_RECONCILIACAO)) errors.push(`CONTRATO_RECONCILIACAO_AUSENTE:${CONTRATO_RECONCILIACAO}`);
if (!existe(IDENTIDADE_LUPA)) errors.push(`IDENTIDADE_LUPA_AUSENTE:${IDENTIDADE_LUPA}`);

for (const adapter of ADAPTADORES) {
  if (!existe(adapter)) {
    errors.push(`ADAPTADOR_AUSENTE:${adapter}`);
    continue;
  }

  const content = ler(adapter);
  for (const token of [PORTA, CONTRATO_DELTA, "CENTRALDARK_AI_BOOT", ".agents/skills/meta-lupa/SKILL.md", IDENTIDADE_LUPA]) {
    if (!content.includes(token)) errors.push(`ADAPTADOR_SEM_TOKEN:${adapter}:${token}`);
  }
  if (/SKILL_COMMIT_SHA\s*:/i.test(content)) errors.push(`ADAPTADOR_COM_SHA_COPIADO:${adapter}`);
}

const semanticRequirements = new Map([
  [PORTA, [
    "REUSE_BEFORE_CREATE_REQUIRED",
    CONTRATO_RECONCILIACAO,
    "FALHA_DE_RECONCILIACAO_DE_CONTEXTO",
    "context_reconciliation: LOADED",
  ]],
  ["AGENTS.md", [
    "REUSE_BEFORE_CREATE_REQUIRED",
    CONTRATO_RECONCILIACAO,
    "FALHA_DE_RECONCILIACAO_DE_CONTEXTO",
    "tarefa simples não vira swarm",
  ]],
  [PORTA_VIVA, [
    "REUSE_BEFORE_CREATE_REQUIRED",
    CONTRATO_RECONCILIACAO,
    "PROGRAM_ONLY",
    "FALHA_DE_RECONCILIACAO_DE_CONTEXTO",
    "Fluxo proporcional ao risco",
  ]],
  [".claude/rules/00-centraldark-boot-universal.md", [
    "REUSE_BEFORE_CREATE_REQUIRED",
    CONTRATO_RECONCILIACAO,
    "FALHA_DE_RECONCILIACAO_DE_CONTEXTO",
  ]],
  ["CHATGPT.md", [
    "REUSE_BEFORE_CREATE_REQUIRED",
    CONTRATO_RECONCILIACAO,
    "FALHA_DE_RECONCILIACAO_DE_CONTEXTO",
  ]],
]);

for (const [source, tokens] of semanticRequirements) {
  const content = ler(source);
  for (const token of tokens) {
    if (!content.includes(token)) errors.push(`RECONCILIACAO_SEM_TOKEN:${source}:${token}`);
  }
}

const agentsContent = ler("AGENTS.md");
if (/META_LUPA_BOOT_REQUIRED\s*:\s*SIM/i.test(agentsContent)) {
  errors.push("CONTRADICAO_COMPLEXIDADE:AGENTS_META_LUPA_PARA_TODA_TAREFA");
}
if (/Antes de alterar qualquer arquivo[\s\S]{0,220}BEGIN\+FINAL/i.test(agentsContent)) {
  errors.push("CONTRADICAO_COMPLEXIDADE:AGENTS_LEDGER_PARA_TODA_TAREFA");
}
if (/## Fluxo único dos agentes/i.test(ler(PORTA_VIVA))) {
  errors.push("CONTRADICAO_COMPLEXIDADE:PORTA_FLUXO_CRITICO_DECLARADO_UNICO");
}

const contract = lerJson(CONTRATO_RECONCILIACAO);
if (!contract) {
  errors.push(`CONTRATO_RECONCILIACAO_JSON_INVALIDO:${CONTRATO_RECONCILIACAO}`);
} else {
  if (contract.schema_version !== 1) errors.push("CONTRATO_RECONCILIACAO_SCHEMA_INVALIDO");
  if (contract.status !== "CANONICAL") errors.push("CONTRATO_RECONCILIACAO_NAO_CANONICO");
  if (contract.marker !== "REUSE_BEFORE_CREATE_REQUIRED") errors.push("CONTRATO_RECONCILIACAO_MARKER_INVALIDO");

  const requiredSequence = [
    "resolve_user_intent",
    "search_existing_capabilities",
    "open_primary_implementation_files",
    "cross_reference_capabilities_with_request",
    "classify_authority_and_runtime_state",
    "reuse_or_extend_before_create",
  ];
  const sequence = contract.mandatory_pre_solution_sequence;
  if (!Array.isArray(sequence)) {
    errors.push("CONTRATO_RECONCILIACAO_SEQUENCIA_AUSENTE");
  } else {
    for (const step of requiredSequence) {
      if (!sequence.includes(step)) errors.push(`CONTRATO_RECONCILIACAO_ETAPA_AUSENTE:${step}`);
    }
  }

  const rules = contract.decision_rules ?? {};
  if (rules.new_component_requires_proved_gap !== true) errors.push("CONTRATO_RECONCILIACAO_GAP_NAO_OBRIGATORIO");
  if (rules.proposal_without_inventory !== "BOOT_BLOCKED") errors.push("CONTRATO_RECONCILIACAO_SEM_FAIL_CLOSED");
  if (rules.file_found_but_not_cross_referenced !== "CONTEXT_RECONCILIATION_FAILURE") errors.push("CONTRATO_RECONCILIACAO_SEM_CROSS_REFERENCE");
  if (rules.open_or_draft_pr_is_operational_authority !== false) errors.push("CONTRATO_RECONCILIACAO_PR_DRAFT_COM_AUTORIDADE");
  if (rules.program_document_is_runtime_proof !== false) errors.push("CONTRATO_RECONCILIACAO_PROGRAMA_COMO_RUNTIME");
  if (rules.formal_proof_without_user_request !== "FORBIDDEN_FOR_SIMPLE_TASKS") errors.push("CONTRATO_RECONCILIACAO_FORMALISMO_SEM_LIMITE");
  if (contract.complexity_policy?.never_expose_internal_governance_as_user_bureaucracy !== true) {
    errors.push("CONTRATO_RECONCILIACAO_GOVERNANCA_EXPOSTA_AO_USUARIO");
  }
}

for (const entrypoint of ENTRADAS) {
  if (!existe(entrypoint)) continue;
  for (const cited of caminhosCitados(ler(entrypoint))) {
    if (/[*<>]/.test(cited)) continue;
    if (!existe(cited)) errors.push(`CAMINHO_MORTO:${entrypoint}:${cited}`);
  }
}

const canonicalDocuments = canonicos();
const reachable = new Set();
let currentLevel = ENTRADAS.filter(existe);
for (let depth = 0; depth < 2; depth += 1) {
  const nextLevel = [];
  for (const document of currentLevel) {
    for (const cited of caminhosCitados(ler(document))) {
      if (ehGerado(cited) || reachable.has(cited) || !existe(cited)) continue;
      reachable.add(cited);
      if (/\.mdc?$/.test(cited)) nextLevel.push(cited);
    }
  }
  currentLevel = nextLevel;
}

for (const canonical of canonicalDocuments) {
  if (!reachable.has(canonical)) errors.push(`CANONICO_ORFAO:${canonical}`);
}

const report = {
  guardrail: "validar-porta-de-entrada",
  porta: PORTA,
  porta_viva: PORTA_VIVA,
  contrato_delta: CONTRATO_DELTA,
  contrato_reconciliacao: CONTRATO_RECONCILIACAO,
  identidade_lupa: IDENTIDADE_LUPA,
  reuse_before_create_required: true,
  adaptadores_obrigatorios: ADAPTADORES,
  adaptadores_encontrados: ADAPTADORES.filter(existe),
  canonicos_encontrados: canonicalDocuments.length,
  canonicos_alcancaveis: canonicalDocuments.filter((item) => reachable.has(item)).length,
  errors,
  warnings,
  known_debt_exceptions: 0,
  ok: errors.length === 0,
};

if (JSON_OUT) console.log(JSON.stringify(report, null, 2));
else {
  for (const warning of warnings) console.log(`AVISO ${warning}`);
  for (const error of errors) console.error(`ERRO ${error}`);
  console.log(
    `PORTA_OK=${report.ok ? 1 : 0} ` +
      `REUSE_BEFORE_CREATE=${report.reuse_before_create_required ? 1 : 0} ` +
      `ADAPTADORES=${report.adaptadores_encontrados.length}/${report.adaptadores_obrigatorios.length} ` +
      `CANONICOS=${report.canonicos_encontrados} ` +
      `ALCANCAVEIS=${report.canonicos_alcancaveis} ` +
      `DIVIDA=0 ERROS=${errors.length}`,
  );
}

process.exit(report.ok ? 0 : 1);
