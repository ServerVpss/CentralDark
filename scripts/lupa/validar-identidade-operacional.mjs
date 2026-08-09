#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

const CONTRACT_PATH = "docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json";
const META_LUPA_PATH = ".agents/skills/meta-lupa/SKILL.md";
const META_LUPA_IDENTITY_PATH = ".agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA";

const CANONICAL = Object.freeze({
  "LEIA-ME-IA.md": [
    "SEGREDO/CHEFE COMANDA",
    "SOL ORGANIZA",
    "PIVETE/HERMES PRESERVA E EXECUTA",
  ],
  "AGENTS.md": [
    "existe somente um escritor por escopo",
    "SEGREDO/CHEFE permanece autoridade humana final",
    "SOL coordena, PIVETE/HERMES preserva e executa",
    "CAPTURE → SANITIZE + HASH → DECIDE → APPLY → JUDGE → CHEFE → RECEIPT + LEARNING → LOOP",
  ],
  "docs/CONSCIENCIA/JEITO-CORRETO-DO-PIVETE.md": [
    "SEGREDO/CHEFE = humano e autoridade final",
    "SOL = coordenadora da casa e organizadora dos agentes",
    "PIVETE/HERMES = mordomo de casa, executor e guardião da continuidade",
    "WRITER_UNICO=true",
    "UNKNOWN_NAO_PASSA=true",
    "CHEFE_SEGREDO_NECESSARIO",
  ],
  "docs/CONSCIENCIA/DICIONARIO-PIVETE-GITHUB.md": [
    "SEGREDO/CHEFE = humano e autoridade final",
    "PIVETE = Hermes treinado",
  ],
  [META_LUPA_PATH]: [
    "AUTORIZACAO_DO_SEGREDO_CHEFE:",
    "sem prometer certeza absoluta",
  ],
  [META_LUPA_IDENTITY_PATH]: [
    "SEGREDO/CHEFE",
  ],
});

const FORBIDDEN_CANONICAL = Object.freeze([
  {
    code: "PIVETE_COMO_AUTORIDADE_FINAL",
    pattern: /\bO Pivete é a autoridade final\b/i,
  },
  {
    code: "TITULO_AUTORIDADE_DO_PIVETE",
    pattern: /\bAutoridade do Pivete\b/i,
  },
  {
    code: "PIVETE_GOVERNA_INTENCAO",
    pattern: /\bO Pivete governa a intenção\b/i,
  },
  {
    code: "DECISAO_FINAL_ATRIBUIDA_AO_PIVETE",
    pattern: /\bdecisão final do Pivete\b/i,
  },
  {
    code: "PIVETE_AUTORIDADE_FINAL_MAQUINA",
    pattern: /\bPIVETE\s*=\s*AUTORIDADE_FINAL\b/i,
  },
  {
    code: "UNKNOWN_CONVERTIDO_EM_PASS",
    pattern: /\bUNKNOWN\s*(?:=|:|→|->)\s*PASS\b/i,
  },
  {
    code: "META_LUPA_AUTORIZACAO_LEGADA",
    pattern: /\bAUTORIZACAO_DO_PIVETE\b/i,
  },
  {
    code: "PERMISSAO_LEGADA_PERMITO_PIVETE",
    pattern: /\bPERMITO[ _-]?PIVETE\b/i,
  },
]);

const FORBIDDEN_PROFILE = Object.freeze([
  ...FORBIDDEN_CANONICAL,
  {
    code: "ESCRITA_DEPENDE_DE_AUTORIZACAO_DO_PIVETE",
    pattern: /nenhuma ação de escrita[\s\S]{0,180}autorização explícita[\s\S]{0,80}Pivete/i,
  },
]);

const REQUIRED_CLAIM_SURFACES = Object.freeze([
  "chatgpt",
  "claude",
  "codex",
  "gemini",
  "copilot",
  "cursor",
  "windsurf",
  "hermes",
  "plugins",
  "future_agents",
  "mcp",
  "webui",
  "cli",
  "ci",
  "cd",
  "telegram",
]);

const TEXT_EXTENSIONS = new Set([".md", ".mdc", ".txt", ".yaml", ".yml", ".json"]);
const SENSITIVE_SEGMENTS = new Set([
  ".env",
  "secrets",
  "secret",
  "tokens",
  "token",
  "sessions",
  "session",
  ".ssh",
  "certs",
  "certificates",
  "credentials",
  "credential",
  "keys",
  "key",
]);

function parseArgs(argv) {
  const values = {
    repoRoot: process.cwd(),
    profileRoots: [],
    json: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--repo-root" && argv[index + 1]) {
      values.repoRoot = argv[++index];
      continue;
    }
    if (arg === "--profile-root" && argv[index + 1]) {
      values.profileRoots.push(argv[++index]);
      continue;
    }
    if (arg === "--json") values.json = true;
  }

  values.repoRoot = resolve(values.repoRoot);
  values.profileRoots = values.profileRoots.map((item) => resolve(item));
  return values;
}

function lineOf(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

export function findForbidden(
  text,
  rules = FORBIDDEN_CANONICAL,
  path = "<memory>",
  { redactExcerpt = false } = {},
) {
  const findings = [];
  for (const rule of rules) {
    const match = rule.pattern.exec(text);
    if (!match) continue;
    findings.push({
      code: rule.code,
      path,
      line: lineOf(text, match.index),
      excerpt: redactExcerpt
        ? "[PROFILE_CONTENT_REDACTED]"
        : match[0].replace(/\s+/g, " ").slice(0, 180),
    });
  }
  return findings;
}

export function validateRequiredTokens(text, tokens, path = "<memory>") {
  return tokens
    .filter((token) => !text.includes(token))
    .map((token) => ({
      code: "TOKEN_DE_IDENTIDADE_AUSENTE",
      path,
      line: null,
      excerpt: token,
    }));
}

function safeRead(path) {
  try {
    const stat = statSync(path);
    if (!stat.isFile() || stat.size > 512 * 1024) return null;
    return readFileSync(path, "utf8");
  } catch {
    return null;
  }
}

function safeJson(path) {
  const text = safeRead(path);
  if (text == null) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function isSensitive(relativePath) {
  const normalized = relativePath.split(sep).map((part) => part.toLowerCase());
  return normalized.some((part) => {
    const stem = part.replace(/\.[^.]+$/, "");
    return (
      SENSITIVE_SEGMENTS.has(part) ||
      SENSITIVE_SEGMENTS.has(stem) ||
      part.startsWith(".env.")
    );
  });
}

function walkTextFiles(root) {
  const files = [];
  const visit = (directory) => {
    let entries = [];
    try {
      entries = readdirSync(directory, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (entry.isSymbolicLink()) continue;
      const absolute = join(directory, entry.name);
      const rel = relative(root, absolute);
      if (isSensitive(rel)) continue;
      if (entry.isDirectory()) {
        if ([".git", "node_modules", "dist", "build", ".cache"].includes(entry.name)) continue;
        visit(absolute);
        continue;
      }
      if (!entry.isFile() || !TEXT_EXTENSIONS.has(extname(entry.name).toLowerCase())) continue;
      files.push(absolute);
    }
  };
  visit(root);
  return files;
}

export function validateProfileRoot(root) {
  const findings = [];
  if (!existsSync(root)) {
    findings.push({
      code: "PROFILE_ROOT_AUSENTE",
      path: root,
      line: null,
      excerpt: "O caminho informado não existe neste ambiente.",
    });
    return findings;
  }

  for (const file of walkTextFiles(root)) {
    const text = safeRead(file);
    if (text == null) continue;
    findings.push(
      ...findForbidden(text, FORBIDDEN_PROFILE, relative(root, file), {
        redactExcerpt: true,
      }),
    );
  }
  return findings;
}

export function validateAgentClaimPolicy(repoRoot) {
  const findings = [];
  const path = join(repoRoot, CONTRACT_PATH);
  const contract = safeJson(path);
  if (!contract) {
    findings.push({
      code: "AGENT_CLAIM_CONTRATO_AUSENTE_OU_INVALIDO",
      path: CONTRACT_PATH,
      line: null,
      excerpt: "Contrato machine-readable ausente ou inválido.",
    });
    return findings;
  }

  const policy = contract.agent_claim_policy ?? {};
  const checks = [
    [policy.marker === "AGENT_CLAIM_CAPABILITY_REQUIRED", "AGENT_CLAIM_MARKER_AUSENTE"],
    [policy.narrative_changes_system_state === false, "AGENT_CLAIM_NARRATIVA_MUDA_ESTADO"],
    [policy.claim_must_not_exceed_observable_capability === true, "AGENT_CLAIM_CAPACIDADE_NAO_LIMITA_ALEGACAO"],
    [policy.permanent_behavior_without_proved_persistence === "BLOCK", "AGENT_CLAIM_PROMESSA_PERMANENTE_NAO_BLOQUEADA"],
    [policy.absolute_commitment_without_verifiable_mechanism === "REWRITE_TO_OBSERVABLE_SCOPE", "AGENT_CLAIM_ABSOLUTO_SEM_REBAIXAMENTO"],
    [policy.communication_policy?.critique_target === "SYSTEM_OR_ARTIFACT_NOT_HUMAN", "AGENT_CLAIM_CRITICA_PODE_ATINGIR_HUMANO"],
    [policy.communication_policy?.status_colors?.YELLOW === "CONCRETE_WORK_IN_PROGRESS_OR_TARGET_PROOF_PENDING", "AGENT_CLAIM_AMARELO_SEM_PENDENCIA_CONCRETA"],
    [policy.communication_policy?.status_colors?.NONE === "UNKNOWN_NOT_MEASURED_NOT_APPLICABLE_OR_DESCRIPTIVE", "AGENT_CLAIM_NAO_MEDIDO_COM_ALERTA"],
    [policy.integration?.one_policy_for_all_adapters === true, "AGENT_CLAIM_POLITICA_FRAGMENTADA"],
    [policy.integration?.external_vendor_ui === "OUT_OF_REPO_CONTROL", "AGENT_CLAIM_UI_EXTERNA_SUPERDECLARADA"],
  ];

  for (const [ok, code] of checks) {
    if (!ok) findings.push({ code, path: CONTRACT_PATH, line: null, excerpt: policy.marker || "AUSENTE" });
  }

  const applies = new Set(Array.isArray(contract.applies_to) ? contract.applies_to : []);
  for (const surface of REQUIRED_CLAIM_SURFACES) {
    if (!applies.has(surface)) {
      findings.push({
        code: "AGENT_CLAIM_SUPERFICIE_AUSENTE",
        path: CONTRACT_PATH,
        line: null,
        excerpt: surface,
      });
    }
  }

  return findings;
}

export function validateRepository(repoRoot) {
  const findings = [];
  for (const [path, tokens] of Object.entries(CANONICAL)) {
    const absolute = join(repoRoot, path);
    const text = safeRead(absolute);
    if (text == null) {
      findings.push({
        code: "CANONICO_AUSENTE_OU_ILEGIVEL",
        path,
        line: null,
        excerpt: "Arquivo canônico não encontrado ou não legível.",
      });
      continue;
    }
    findings.push(...validateRequiredTokens(text, tokens, path));
    findings.push(...findForbidden(text, FORBIDDEN_CANONICAL, path));
  }
  findings.push(...validateAgentClaimPolicy(repoRoot));
  return findings;
}

export function runValidation({ repoRoot, profileRoots = [] }) {
  const canonicalFindings = validateRepository(repoRoot);
  const profileReports = profileRoots.map((root) => ({
    root,
    findings: validateProfileRoot(root),
  }));
  const profileFindings = profileReports.flatMap((item) =>
    item.findings.map((finding) => ({ ...finding, profile_root: item.root })),
  );

  return {
    guardrail: "validar-identidade-operacional",
    authority: "SEGREDO/CHEFE",
    coordinator: "SOL",
    executor: "PIVETE/HERMES",
    writer_rule: "WRITER_UNICO",
    unknown_rule: "UNKNOWN_NAO_PASSA",
    agent_claim_rule: "AGENT_CLAIM_CAPABILITY_REQUIRED",
    canonical_findings: canonicalFindings,
    profile_reports: profileReports,
    findings: [...canonicalFindings, ...profileFindings],
    ok: canonicalFindings.length === 0 && profileFindings.length === 0,
  };
}

function printHuman(report) {
  for (const finding of report.findings) {
    const location = `${finding.profile_root ? `${finding.profile_root}:` : ""}${finding.path}${
      finding.line ? `:${finding.line}` : ""
    }`;
    console.error(`IDENTIDADE_ERRO ${finding.code} ${location} :: ${finding.excerpt}`);
  }
  console.log(
    `IDENTIDADE_OK=${report.ok ? 1 : 0} ` +
      `AUTORIDADE=SEGREDO_CHEFE COORDENADOR=SOL EXECUTOR=PIVETE_HERMES ` +
      `AGENT_CLAIM=AGENT_CLAIM_CAPABILITY_REQUIRED ` +
      `ERROS=${report.findings.length}`,
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const report = runValidation(args);
  if (args.json) console.log(JSON.stringify(report, null, 2));
  else printHuman(report);
  process.exitCode = report.ok ? 0 : 1;
}

const isMain = process.argv[1] &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url;

if (isMain) {
  main().catch((error) => {
    console.error(`IDENTIDADE_VALIDATOR_FATAL=${error?.stack || error}`);
    process.exitCode = 1;
  });
}
