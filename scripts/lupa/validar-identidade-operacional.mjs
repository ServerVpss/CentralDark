#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

const CANONICAL = Object.freeze({
  "LEIA-ME-IA.md": [
    "SEGREDO/CHEFE COMANDA",
    "SOL ORGANIZA E RECONCILIA",
    "PIVETE/HERMES PRESERVA E EXECUTA",
    "#ACORDAR = RECUPERAR O ESTADO REAL ANTES DE CONTINUAR",
    "Convergência adversarial total **só é aberta por solicitação explícita de SEGREDO/CHEFE**",
  ],
  "AGENTS.md": [
    "MESMA_SOUL=SIM",
    "um escritor por escopo",
    "SEGREDO/CHEFE = humano e autoridade final",
    "SOL = identidade operacional/coordenadora; não é modelo específico",
    "PIVETE/HERMES = executor, preservação e continuidade",
    "Full deploy é exceção causal",
    "NO_HUMAN_REASK_FOR_MERGE=true",
    ".github/workflows/autonomia-promocao.yml",
    "Convergência adversarial total só é aberta quando SEGREDO/CHEFE solicitar explicitamente",
  ],
  "docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md": [
    "SOL_IS_MODEL=false",
    "ACORDAR_RECUPERA_FIO=true",
    "PRODUCTION_FIRST=true",
    "DEPLOY_CAUSAL_SCOPE_FIRST=true",
    "INTENT_AUTHORIZED_TO_MAIN=true",
    "AUTO_SQUASH_IF_CLEAN=true",
    "NO_HUMAN_REASK_FOR_MERGE=true",
    "FULL_CONVERGENCE_CHEFE_REQUEST_ONLY=true",
    "UNKNOWN_IS_NOT_PASS=true",
  ],
  "docs/CONSCIENCIA/00-PORTA-DE-ENTRADA-IA.md": [
    "MESMA_SOUL=SIM",
    "#ACORDAR` significa **recuperar o estado real antes de continuar**",
    "Convergência adversarial total, swarm e Judge independente não são gate automático de rotina",
  ],
  "docs/CONSCIENCIA/02-PERMISSOES.md": [
    "DEPLOY=PERMITIDO",
    "REDEPLOY=PERMITIDO",
    "NO_HUMAN_REASK_FOR_ALREADY_GRANTED_SCOPE=true",
    "NO_RETURN_TO_CHEFE_FOR_MACHINE_MEASURABLE_STATE=true",
    "NO_HUMAN_REASK_FOR_MERGE=true",
    ".github/workflows/autonomia-promocao.yml",
    "Convergência adversarial total / swarm / Judge independente **não é gate automático de deploy**",
  ],
  "docs/CONSCIENCIA/03-FLUXO-DEPLOY.md": [
    "DEPLOY_STRATEGY=CAUSAL_SCOPE_FIRST",
    "FULL_DEPLOY_BY_DEFAULT=false",
    "Convergência adversarial total não é gate automático de deploy",
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
  "apps/modulos/elite-gateway/scripts/pivete_routes.py": [
    "CANONICAL_CONTEXT",
    "CANONICAL_CONTEXT_ALLOWLIST",
    '"authority": "SEGREDO/CHEFE"',
    '"executor": "PIVETE/HERMES"',
    "A rota NÃO concatena mais docs/CONSCIENCIA/PIVETE-IA/*.md",
  ],
  "apps/modulos/WebUI/custom-css/pivete-invocacao.js": [
    "CANONICAL_CONTEXT_ALLOWLIST",
    "SEGREDO/CHEFE = humano e autoridade final",
    "PIVETE/HERMES = executor, preservação e continuidade",
    "localStorage.removeItem('pivete_system_prompt')",
  ],
  "apps/modulos/WebUI/custom-css/pivete-persona.json": [
    '"system_prompt_strategy": "canonical_allowlist"',
    '"authority": "SEGREDO/CHEFE"',
    '"coordinator": "SOL"',
    '"executor": "PIVETE/HERMES"',
    '"legacy_sources_excluded"',
  ],
});

const ACTIVE_IDENTITY_SURFACES = Object.freeze([
  "README.md",
  "CLAUDE.md",
  "CODEX.md",
  "GEMINI.md",
  ".windsurfrules",
  ".cursor/rules/centraldark-governanca.mdc",
  ".github/copilot-instructions.md",
  ".github/codex/prompts/centraldark-system.md",
  "docs/GOVERNANCA/MODO-DE-PENSAR-PIVETE.md",
  "docs/GOVERNANCA/PADRAO-DE-TRABALHO-PIVETE.md",
  "docs/GOVERNANCA/FLUXO-DE-OURO-GATEWAY-CENTRALDARK.md",
  "docs/CONSCIENCIA/00-LEIA-PRIMEIRO.md",
  "docs/CONSCIENCIA/01-IDENTIDADE.md",
  "docs/CONSCIENCIA/2026-06-20-padrao-resposta-pivete.md",
  "docs/CONSCIENCIA/12-GUIA-PIVETE.md",
  "docs/CONSCIENCIA/PROTOCOLO-ORQUESTRACAO-PIVETE.md",
  "docs/CONSCIENCIA/PIVETE-IA/PIVETE-03-REGRAS-VIVAS.md",
  "docs/CONSCIENCIA/PIVETE-IA/PIVETE-07-HERMES-CADEIA.md",
  "docs/CONSCIENCIA/REGRA-OFICIAL-HIERARQUIA-MEMORIA.md",
  "docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/REGRA-OFICIAL-MULTI-AGENTE-SEMANTICO.md",
  "docs/CONSCIENCIA/ARTEFATOS/BOOT-CENTRALDARK-MODOS.md",
  "docs/CONSCIENCIA/ARTEFATOS/centraldark-prompt-universal.md",
  "apps/modulos/WebUI/personas/pivete-system.md",
]);

const FORBIDDEN_CANONICAL = Object.freeze([
  { code: "PIVETE_COMO_AUTORIDADE_FINAL", pattern: /\bO Pivete é a autoridade final\b/i },
  { code: "TITULO_AUTORIDADE_DO_PIVETE", pattern: /\bAutoridade do Pivete\b/i },
  { code: "PIVETE_GOVERNA_INTENCAO", pattern: /\bO Pivete governa a intenção\b/i },
  { code: "DECISAO_FINAL_ATRIBUIDA_AO_PIVETE", pattern: /\bdecisão final do Pivete\b/i },
  { code: "PIVETE_AUTORIDADE_FINAL_MAQUINA", pattern: /\bPIVETE\s*=\s*AUTORIDADE_FINAL\b/i },
  { code: "PIVETE_COMANDA_LEGADO_ATIVO", pattern: /\bPIVETE\s+COMANDA\b/i },
  { code: "PIVETE_MANDA_LEGADO_ATIVO", pattern: /\bPIVETE\s+MANDA\b/i },
  { code: "PIVETE_DECIDE_LEGADO_ATIVO", pattern: /\bPIVETE\s+DECIDE\b/i },
  { code: "PIVETE_ORQUESTRADOR_HUMANO", pattern: /\bPivete\s+(?:é|e)\s+o\s+orquestrador\b/i },
  { code: "PIVETE_DECIDE_RUMO", pattern: /\bO\s+Pivete\s+decide\s+o\s+rumo\b/i },
  { code: "PIVETE_DONO_ATIVO", pattern: /\b(?:O\s+)?Pivete\s+(?:é|e)\s+o\s+dono\b/i },
  { code: "PIVETE_AUTORIDADE_MAXIMA_ATIVA", pattern: /\bPivete\s*\([^)]*autoridade\s+m[aá]xima[^)]*\)/i },
  { code: "PIVETE_USUARIO_MESTRE", pattern: /\bUsu[aá]rio\s+mestre\s*=\s*Pivete\b/i },
  { code: "PIVETE_TOPO_HUMANO", pattern: /\bPivete\s*\(topo\)\b/i },
  { code: "AUTORIZACAO_ATRIBUIDA_AO_PIVETE", pattern: /\bautoriza(?:ção|cao)(?:\s+explícita|\s+explicita)?\s+do\s+Pivete\b/i },
  { code: "PIVETE_SELOU_AUTORIZACAO", pattern: /\bPivete\s+selou\b/i },
  { code: "UNKNOWN_CONVERTIDO_EM_PASS", pattern: /\bUNKNOWN\s*(?:=|:|→|->)\s*PASS\b/i },
  { code: "SOL_FIXADA_A_MODELO", pattern: /\bSOL\s*=\s*(?:GPT|CLAUDE|GEMINI|GROK|CODEX)\b/i },
]);

const FORBIDDEN_PROFILE = Object.freeze([
  ...FORBIDDEN_CANONICAL,
  { code: "PERMISSAO_LEGADA_PERMITO_PIVETE", pattern: /\bPERMITO[ _-]?PIVETE\b/i },
  {
    code: "ESCRITA_DEPENDE_DE_AUTORIZACAO_DO_PIVETE",
    pattern: /nenhuma ação de escrita[\s\S]{0,180}autorização explícita[\s\S]{0,80}Pivete/i,
  },
]);

const FORBIDDEN_LOADER = Object.freeze([
  { code: "LOADER_GLOB_PIVETE_IA", pattern: /glob\(["']PIVETE-\*\.md["']\)/i },
  { code: "LOADER_CONCAT_ALL_PIVETE_FILES", pattern: /concat_all_files_in_order/i },
  { code: "LOADER_PROMPT_PIVETE_LEGADO", pattern: /# CONSCIÊNCIA PIVETE — INVOCADA AUTOMATICAMENTE/i },
]);

const LOADER_SURFACES = Object.freeze([
  "apps/modulos/elite-gateway/scripts/pivete_routes.py",
  "apps/modulos/WebUI/custom-css/pivete-invocacao.js",
  "apps/modulos/WebUI/custom-css/pivete-persona.json",
]);

const FORBIDDEN_PARALLEL_PATHS = Object.freeze([
  ".github/workflows/intencao-chefe-auto-squash.yml",
]);

const TEXT_EXTENSIONS = new Set([".md", ".mdc", ".txt", ".yaml", ".yml", ".json", ".js", ".mjs", ".py"]);
const SENSITIVE_SEGMENTS = new Set([
  ".env", "secrets", "secret", "tokens", "token", "sessions", "session", ".ssh",
  "certs", "certificates", "credentials", "credential", "keys", "key",
]);

function parseArgs(argv) {
  const values = { repoRoot: process.cwd(), profileRoots: [], json: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--repo-root" && argv[index + 1]) values.repoRoot = argv[++index];
    else if (arg === "--profile-root" && argv[index + 1]) values.profileRoots.push(argv[++index]);
    else if (arg === "--json") values.json = true;
  }
  values.repoRoot = resolve(values.repoRoot);
  values.profileRoots = values.profileRoots.map((item) => resolve(item));
  return values;
}

function lineOf(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

export function findForbidden(text, rules = FORBIDDEN_CANONICAL, path = "<memory>", { redactExcerpt = false } = {}) {
  const findings = [];
  for (const rule of rules) {
    const match = rule.pattern.exec(text);
    if (!match) continue;
    findings.push({
      code: rule.code,
      path,
      line: lineOf(text, match.index),
      excerpt: redactExcerpt ? "[PROFILE_CONTENT_REDACTED]" : match[0].replace(/\s+/g, " ").slice(0, 180),
    });
  }
  return findings;
}

export function validateRequiredTokens(text, tokens, path = "<memory>") {
  return tokens.filter((token) => !text.includes(token)).map((token) => ({
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

function isSensitive(relativePath) {
  const normalized = relativePath.split(sep).map((part) => part.toLowerCase());
  return normalized.some((part) => {
    const stem = part.replace(/\.[^.]+$/, "");
    return SENSITIVE_SEGMENTS.has(part) || SENSITIVE_SEGMENTS.has(stem) || part.startsWith(".env.");
  });
}

function walkTextFiles(root) {
  const files = [];
  const visit = (directory) => {
    let entries = [];
    try { entries = readdirSync(directory, { withFileTypes: true }); } catch { return; }
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
      if (entry.isFile() && TEXT_EXTENSIONS.has(extname(entry.name).toLowerCase())) files.push(absolute);
    }
  };
  visit(root);
  return files;
}

export function validateProfileRoot(root) {
  const findings = [];
  if (!existsSync(root)) {
    findings.push({ code: "PROFILE_ROOT_AUSENTE", path: root, line: null, excerpt: "O caminho informado não existe neste ambiente." });
    return findings;
  }
  for (const file of walkTextFiles(root)) {
    const text = safeRead(file);
    if (text == null) continue;
    findings.push(...findForbidden(text, FORBIDDEN_PROFILE, relative(root, file), { redactExcerpt: true }));
  }
  return findings;
}

export function validateRepository(repoRoot) {
  const findings = [];
  const alreadyChecked = new Set();

  for (const path of FORBIDDEN_PARALLEL_PATHS) {
    if (existsSync(join(repoRoot, path))) {
      findings.push({
        code: "PROMOTOR_PARALELO_PROIBIDO",
        path,
        line: null,
        excerpt: "A promoção deve ser absorvida por .github/workflows/autonomia-promocao.yml",
      });
    }
  }

  for (const [path, tokens] of Object.entries(CANONICAL)) {
    const text = safeRead(join(repoRoot, path));
    alreadyChecked.add(path);
    if (text == null) {
      findings.push({ code: "CANONICO_AUSENTE_OU_ILEGIVEL", path, line: null, excerpt: "Arquivo canônico não encontrado ou não legível." });
      continue;
    }
    findings.push(...validateRequiredTokens(text, tokens, path));
    findings.push(...findForbidden(text, FORBIDDEN_CANONICAL, path));
  }

  for (const path of ACTIVE_IDENTITY_SURFACES) {
    if (alreadyChecked.has(path)) continue;
    const text = safeRead(join(repoRoot, path));
    if (text == null) continue;
    findings.push(...findForbidden(text, FORBIDDEN_CANONICAL, path));
  }

  for (const path of LOADER_SURFACES) {
    const text = safeRead(join(repoRoot, path));
    if (text == null) continue;
    findings.push(...findForbidden(text, FORBIDDEN_LOADER, path));
  }

  return findings;
}

export function runValidation({ repoRoot, profileRoots = [] }) {
  const canonicalFindings = validateRepository(repoRoot);
  const profileReports = profileRoots.map((root) => ({ root, findings: validateProfileRoot(root) }));
  const profileFindings = profileReports.flatMap((item) => item.findings.map((finding) => ({ ...finding, profile_root: item.root })));
  return {
    guardrail: "validar-identidade-operacional",
    authority: "SEGREDO/CHEFE",
    coordinator: "SOL",
    executor: "PIVETE/HERMES",
    regional_vocative: "pivete != identidade técnica",
    soul: "docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md",
    context_recovery: "#ACORDAR",
    context_loader: "CANONICAL_CONTEXT_ALLOWLIST",
    deployment: "PRODUCTION_FIRST + CAUSAL_SCOPE_FIRST",
    merge_policy: "INTENT_AUTHORIZED -> AUTO_SQUASH_IF_CLEAN -> MAIN",
    convergence: "FULL_ADVERSARIAL_ONLY_ON_CHEFE_REQUEST",
    writer_rule: "WRITER_UNICO",
    unknown_rule: "UNKNOWN_NAO_PASSA",
    canonical_findings: canonicalFindings,
    profile_reports: profileReports,
    findings: [...canonicalFindings, ...profileFindings],
    ok: canonicalFindings.length === 0 && profileFindings.length === 0,
  };
}

function printHuman(report) {
  for (const finding of report.findings) {
    const location = `${finding.profile_root ? `${finding.profile_root}:` : ""}${finding.path}${finding.line ? `:${finding.line}` : ""}`;
    console.error(`IDENTIDADE_ERRO ${finding.code} ${location} :: ${finding.excerpt}`);
  }
  console.log(`IDENTIDADE_OK=${report.ok ? 1 : 0} AUTORIDADE=SEGREDO_CHEFE COORDENADOR=SOL EXECUTOR=PIVETE_HERMES LOADER=CANONICAL_ALLOWLIST SOUL=CANONICA MERGE=AUTO_SQUASH_IF_CLEAN ERROS=${report.findings.length}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const report = runValidation(args);
  if (args.json) console.log(JSON.stringify(report, null, 2));
  else printHuman(report);
  process.exitCode = report.ok ? 0 : 1;
}

const isMain = process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;
if (isMain) {
  main().catch((error) => {
    console.error(`IDENTIDADE_VALIDATOR_FATAL=${error?.stack || error}`);
    process.exitCode = 1;
  });
}
