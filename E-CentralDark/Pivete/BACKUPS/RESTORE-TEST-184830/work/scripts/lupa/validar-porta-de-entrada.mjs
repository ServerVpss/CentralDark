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
const CONTRATO_DELTA = "docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md";
const IDENTIDADE_LUPA = ".agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA";

const ADAPTADORES = [
  "AGENTS.md",
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
if (!existe(CONTRATO_DELTA)) errors.push(`CONTRATO_DELTA_AUSENTE:${CONTRATO_DELTA}`);
if (!existe(IDENTIDADE_LUPA)) errors.push(`IDENTIDADE_LUPA_AUSENTE:${IDENTIDADE_LUPA}`);

for (const adapter of ADAPTADORES) {
  if (!existe(adapter)) {
    errors.push(`ADAPTADOR_AUSENTE:${adapter}`);
    continue;
  }
  const content = ler(adapter);
  const required = [PORTA, CONTRATO_DELTA, "CENTRALDARK_AI_BOOT", ".agents/skills/meta-lupa/SKILL.md", IDENTIDADE_LUPA];
  for (const token of required) {
    if (!content.includes(token)) errors.push(`ADAPTADOR_SEM_TOKEN:${adapter}:${token}`);
  }
  if (/SKILL_COMMIT_SHA\s*:/i.test(content)) errors.push(`ADAPTADOR_COM_SHA_COPIADO:${adapter}`);
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
  contrato_delta: CONTRATO_DELTA,
  identidade_lupa: IDENTIDADE_LUPA,
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
      `ADAPTADORES=${report.adaptadores_encontrados.length}/${report.adaptadores_obrigatorios.length} ` +
      `CANONICOS=${report.canonicos_encontrados} ` +
      `ALCANCAVEIS=${report.canonicos_alcancaveis} ` +
      `DIVIDA=0 ERROS=${errors.length}`,
  );
}

process.exit(report.ok ? 0 : 1);
