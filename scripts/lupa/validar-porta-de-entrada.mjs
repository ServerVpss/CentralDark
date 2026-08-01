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
const CALIBRATION_ONLY = argv.includes("--calibration-only");
const PORTA = "LEIA-ME-IA.md";
const CONTRATO_DELTA = "docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md";
const IDENTIDADE_LUPA = ".agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA";
const CALIBRATION_START = "### 1.2 Recalibração canônica por gatilho";
const CALIBRATION_END = "\n---\n\n## 2. As cinco coisas que não mudam";
const EXPECTED_SOURCE_OF_TRUTH = "ServerVpss/CentralDark";
const EXPECTED_OBSERVED_STATE = "evidência atual medida e separada da fonte canônica";

const CALIBRATION_TOKENS = [
  CALIBRATION_START,
  "#ACORDA",
  "!CALIBRAR",
  "MISSION_ID=UNRESOLVED",
  "STATUS=BLOCKED_GITHUB_UNAVAILABLE",
  "STATUS=STATE_DRIFT",
  "THIS_CHAT_ROLE",
  "COMMITS_SINCE_LAST_PROOF",
  "AUTONOMY_STATUS",
  "CASA_STATE",
  "VPS_STATE",
  "REENTRY_GUARD=ONE_SHOT",
];

const CALIBRATION_RULES = [
  {
    id: "REENTRY_FAIL_CLOSED",
    pattern:
      /O carregamento desta seção \*\*não dispara uma nova recalibração\*\*[\s\S]{0,260}`REENTRY_GUARD=ONE_SHOT`, evitando recursão entre adaptadores\./,
  },
  {
    id: "GITHUB_UNAVAILABLE_SERIALIZATION",
    pattern:
      /Se o GitHub estiver indisponível, a resposta deve começar exatamente com:[\s\S]{0,120}MISSION_ID=UNRESOLVED\nSTATUS=BLOCKED_GITHUB_UNAVAILABLE[\s\S]{0,180}Não apresente estado antigo como atual e não continue por suposição\./,
  },
  {
    id: "EXTERNAL_TRIGGER_GITHUB_FAILURE_SERIALIZATION",
    pattern:
      /Se o GitHub estiver indisponível,[\s\S]{0,180}comece a resposta com MISSION_ID=UNRESOLVED e STATUS=BLOCKED_GITHUB_UNAVAILABLE;[\s\S]{0,100}não use estado antigo como atual\./,
  },
  {
    id: "DRIFT_RECONCILIATION",
    pattern:
      /Compare:[\s\S]{0,180}GitHub remoto;[\s\S]{0,180}estado canônico;[\s\S]{0,180}provas locais fornecidas;[\s\S]{0,180}conversa\.[\s\S]{0,180}O estado comprovado mais recente vence\.[\s\S]{0,140}STATUS=STATE_DRIFT/,
  },
  {
    id: "WRITER_COLLISION_FAIL_CLOSED",
    pattern:
      /Se outro chat, CLI ou agente estiver escrevendo no mesmo escopo:[\s\S]{0,180}THIS_CHAT_ROLE=READ_ONLY[\s\S]{0,160}STATUS=WAITING_ACTIVE_WRITER\|BLOCKED_WRITER_COLLISION[\s\S]{0,180}não editar, commitar, publicar ou resolver threads\./,
  },
  {
    id: "CASA_VPS_UNKNOWN_FAIL_CLOSED",
    pattern:
      /CASA_STATE=UNKNOWN_PENDING_LOCAL_EVIDENCE[\s\S]{0,120}VPS_STATE=UNKNOWN_PENDING_SANITIZED_CAPTURE[\s\S]{0,220}Nunca reutilize captura antiga como estado vivo\./,
  },
  {
    id: "STALE_REVIEW_BLOCKED",
    pattern: /Review em SHA antigo é `STALE_REVIEW`, nunca `PASS` para o HEAD atual\./,
  },
  {
    id: "CHECK_STATE_RELATIONS",
    pattern:
      /Relações obrigatórias de estado:[\s\S]{0,120}CHECK_SUCCESS != ZERO_FINDINGS\nSKIPPED != PASS\nBOT_COMMENTED != BOT_APPROVED\nUNKNOWN != PASS\nTIMEOUT != PASS\nREVIEWED_HEAD_OLD != REVIEWED_HEAD_CURRENT/,
  },
  {
    id: "PASS_REQUIRES_FRESH_PROOF",
    pattern:
      /Só use `PASS` quando houver HEAD exato, teste fresco, prova verificável, escopo conhecido,[\s\S]{0,180}ausência de colisão de Writer e Judge independente quando exigido\./,
  },
];

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

function extrairSecao(texto, inicio, fim) {
  const start = texto.indexOf(inicio);
  if (start < 0) return "";
  const end = texto.indexOf(fim, start);
  return end < 0 ? texto.slice(start) : texto.slice(start, end);
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
if (!CALIBRATION_ONLY && !existe(CONTRATO_DELTA)) errors.push(`CONTRATO_DELTA_AUSENTE:${CONTRATO_DELTA}`);
if (!CALIBRATION_ONLY && !existe(IDENTIDADE_LUPA)) errors.push(`IDENTIDADE_LUPA_AUSENTE:${IDENTIDADE_LUPA}`);

const portaContent = ler(PORTA);
const calibrationSection = extrairSecao(portaContent, CALIBRATION_START, CALIBRATION_END);
const calibrationTokensPresent = CALIBRATION_TOKENS.filter((token) => calibrationSection.includes(token));
const calibrationRulesPresent = CALIBRATION_RULES.filter((rule) => rule.pattern.test(calibrationSection));
const tokensOk = calibrationTokensPresent.length === CALIBRATION_TOKENS.length;
const regrasOk = calibrationRulesPresent.length === CALIBRATION_RULES.length;
const sourceOfTruthOk = new RegExp(
  `^source_of_truth:\\s*"${EXPECTED_SOURCE_OF_TRUTH.replace("/", "\\/")}"\\s*$`,
  "m",
).test(portaContent.slice(0, 700));
const observedStateOk = portaContent.includes(
  `observed_state: "${EXPECTED_OBSERVED_STATE}"`,
);

for (const token of CALIBRATION_TOKENS) {
  if (!calibrationSection.includes(token)) errors.push(`PORTA_SEM_CALIBRACAO:${token}`);
}
for (const rule of CALIBRATION_RULES) {
  if (!rule.pattern.test(calibrationSection)) errors.push(`PORTA_REGRA_CALIBRACAO_INVALIDA:${rule.id}`);
}
if (!sourceOfTruthOk) errors.push("PORTA_SOURCE_OF_TRUTH_DIVERGENTE");
if (!observedStateOk) errors.push("PORTA_SEM_ESTADO_OBSERVADO_SEPARADO");

const calibrationReport = {
  gatilhos: ["#ACORDA", "!CALIBRAR"],
  reentry_guard: "ONE_SHOT",
  tokens_ok: tokensOk,
  regras_ok: regrasOk,
  source_of_truth_ok: sourceOfTruthOk,
  observed_state_ok: observedStateOk,
  tokens_presentes: calibrationTokensPresent.length,
  tokens_obrigatorios: CALIBRATION_TOKENS.length,
  regras_presentes: calibrationRulesPresent.length,
  regras_obrigatorias: CALIBRATION_RULES.length,
  regras: CALIBRATION_RULES.map((rule) => ({ id: rule.id, ok: rule.pattern.test(calibrationSection) })),
  ok: tokensOk && regrasOk && sourceOfTruthOk && observedStateOk,
};

if (CALIBRATION_ONLY) {
  const report = {
    guardrail: "validar-porta-de-entrada",
    mode: "calibration-only",
    porta: PORTA,
    calibracao: calibrationReport,
    errors,
    warnings,
    ok: errors.length === 0 && calibrationReport.ok,
  };
  if (JSON_OUT) console.log(JSON.stringify(report, null, 2));
  else {
    for (const error of errors) console.error(`ERRO ${error}`);
    console.log(
      `CALIBRACAO_OK=${report.ok ? 1 : 0} ` +
        `TOKENS=${calibrationReport.tokens_presentes}/${calibrationReport.tokens_obrigatorios} ` +
        `REGRAS=${calibrationReport.regras_presentes}/${calibrationReport.regras_obrigatorias} ` +
        `SOURCE=${calibrationReport.source_of_truth_ok ? 1 : 0} ` +
        `OBSERVED=${calibrationReport.observed_state_ok ? 1 : 0} ` +
        `ERROS=${errors.length}`,
    );
  }
  process.exit(report.ok ? 0 : 1);
}

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
  calibracao: calibrationReport,
  adaptadores_obrigatorios: ADAPTADORES,
  adaptadores_encontrados: ADAPTADORES.filter(existe),
  canonicos_encontrados: canonicalDocuments.length,
  canonicos_alcancaveis: canonicalDocuments.filter((item) => reachable.has(item)).length,
  errors,
  warnings,
  known_debt_exceptions: 0,
  ok: errors.length === 0 && calibrationReport.ok,
};

if (JSON_OUT) console.log(JSON.stringify(report, null, 2));
else {
  for (const warning of warnings) console.log(`AVISO ${warning}`);
  for (const error of errors) console.error(`ERRO ${error}`);
  console.log(
    `PORTA_OK=${report.ok ? 1 : 0} ` +
      `CALIBRACAO_TOKENS=${report.calibracao.tokens_presentes}/${report.calibracao.tokens_obrigatorios} ` +
      `CALIBRACAO_REGRAS=${report.calibracao.regras_presentes}/${report.calibracao.regras_obrigatorias} ` +
      `SOURCE=${report.calibracao.source_of_truth_ok ? 1 : 0} ` +
      `OBSERVED=${report.calibracao.observed_state_ok ? 1 : 0} ` +
      `ADAPTADORES=${report.adaptadores_encontrados.length}/${report.adaptadores_obrigatorios.length} ` +
      `CANONICOS=${report.canonicos_encontrados} ` +
      `ALCANCAVEIS=${report.canonicos_alcancaveis} ` +
      `DIVIDA=0 ERROS=${errors.length}`,
  );
}

process.exit(report.ok ? 0 : 1);
