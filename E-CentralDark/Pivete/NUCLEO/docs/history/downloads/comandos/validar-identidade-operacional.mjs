#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

const CONTRACT_PATH = "docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json";
const META_LUPA_PATH = ".agents/skills/meta-lupa/SKILL.md";
const META_LUPA_IDENTITY_PATH = ".agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA";

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
    "INFORMATION_GAIN_REQUIRED=true",
    "LEARNING_REQUIRES_EVIDENCE=true",
    "LEARNING_DELTA_REQUIRED=true",
    "NO_EGO_SCORE=true",
    "SAME_ERROR_NO_NEW_INFO_IS_WASTE=true",
  ],
  "docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md": [
    "IDENTIDADE=SOL_JARVIS_DO_SEGREDO_CHEFE",
    "AUTORIDADE_FINAL=SEGREDO/CHEFE",
    "SOL_IS_MODEL=false",
    "PIVETE_HERMES_IS_EXECUTOR=true",
    "UNKNOWN_IS_NOT_PASS=true",
    "REUSE_BEFORE_CREATE=true",
    "ONE_SYSTEM_ONLY=true",
    "ONE_WRITER_PER_SCOPE=true",
    "INFORMATION_GAIN_REQUIRED=true",
    "LEARNING_REQUIRES_EVIDENCE=true",
    "LEARNING_DELTA_REQUIRED=true",
    "SAME_ERROR_NO_NEW_INFO_IS_WASTE=true",
  ],
  "docs/CONSCIENCIA/CONTRATO-LUPA-BAYESIANA.md": [
    "INFORMATION_GAIN_REQUIRED=true",
    "autoridade humana vigente é `SEGREDO/CHEFE`",
    "Confronto só vira aprendizado promovido com evidência nova + delta reutilizável",
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
    "convergência adversarial total não é gate automático de deploy",
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
    "Confronto não é pontuação de ego",
    "EVIDENCIA_NOVA=SIM",
    "DELTA_DE_CRENCA_OU_REGRA=SIM",
    "DESPERDICIO_DE_CICLO",
  ],
  [META_LUPA_IDENTITY_PATH]: [
    "SEGREDO/CHEFE",
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
  "apps/modulos/pivete-sync/pivete-sync.mjs": [
    "LEGACY_SYNC_DISABLED_CANONICAL_GIT_ONLY",
    "GIT_CANONICAL=true",
    "HUB_TO_GIT=false",
    "GIT_TO_LEGACY_PIVETE_HUB=false",
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
  { code: "AUTORIZACAO_TOKEN_LEGADO_PIVETE", pattern: /\bAUTORIZACAO_DO_PIVETE\b/i },
  { code: "PIVETE_SELOU_AUTORIZACAO", pattern: /\bPivete\s+selou\b/i },
  { code: "UNKNOWN_CONVERTIDO_EM_PASS", pattern: /\bUNKNOWN\s*(?:=|:|→|->)\s*PASS\b/i },
  { code: "SOL_FIXADA_A_MODELO", pattern: /\bSOL\s*=\s*(?:GPT|CLAUDE|GEMINI|GROK|CODEX)\b/i },
]);

const FORBIDDEN_META_LUPA = Object.freeze([
  { code: "META_LUPA_AUTORIZACAO_LEGADA", pattern: /\bAUTORIZACAO_DO_PIVETE\b/i },
]);

const FORBIDDEN_IDENTITY_GUARD = Object.freeze([
  { code: "PERMISSAO_LEGADA_PERMITO_PIVETE", pattern: /\bPERMITO[ _-]?PIVETE\b/i },
]);

const FORBIDDEN_PROFILE = Object.freeze([
  ...FORBIDDEN_CANONICAL,
  ...FORBIDDEN_IDENTITY_GUARD,
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

const FORBIDDEN_SYNC = Object.freeze([
  { code: "SYNC_LEGADO_ACESSA_TABELA_PIVETE", pattern: /pivete_consciencia/i },
  { code: "SYNC_LEGADO_LE_SERVICE_ROLE", pattern: /HUB_SUPABASE_SERVICE_ROLE_KEY/i },
  { code: "SYNC_LEGADO_HUB_PARA_VPS", pattern: /hub->vps/i },
  { code: "SYNC_LEGADO_GIT_PUSH", pattern: /git\s+push/i },
]);

const SYNC_SURFACES = Object.freeze([
  "apps/modulos/pivete-sync/pivete-sync.mjs",
]);

const FORBIDDEN_PARALLEL_PATHS = Object.freeze([
  ".github/workflows/intencao-chefe-auto-squash.yml",
]);

const EXTERNAL_SOURCE_RULES = (() => {
  const projectToken = ["ai", "ox"].join("");
  const organizationToken = String.fromCharCode(83, 121, 110, 107, 114, 97, 65, 73);
  const projectDomain = ["ai", "ox", "squad", ".", "ai"].join("");
  return Object.freeze([
    { code: "EXTERNAL_SOURCE_PROJECT_FORBIDDEN", pattern: new RegExp(`\\b${projectToken}\\b`, "i") },
    { code: "EXTERNAL_SOURCE_ORG_FORBIDDEN", pattern: new RegExp(`\\b${organizationToken}\\b`, "i") },
    { code: "EXTERNAL_SOURCE_DOMAIN_FORBIDDEN", pattern: new RegExp(`\\b${projectDomain.replace(".", "\\.")}\\b`, "i") },
  ]);
})();

const TEXT_EXTENSIONS = new Set([
  ".bash", ".cjs", ".conf", ".css", ".go", ".graphql", ".html", ".ini", ".java", ".js",
  ".jsx", ".json", ".kt", ".lock", ".md", ".mdc", ".mjs", ".php", ".py", ".rb", ".rs",
  ".scss", ".sh", ".sql", ".svelte", ".swift", ".toml", ".ts", ".tsx", ".txt", ".vue",
  ".xml", ".yaml", ".yml",
]);
const KNOWN_TEXT_FILENAMES = new Set([
  ".gitmodules", ".npmrc", ".yarnrc", ".yarnrc.yml", "Dockerfile", "Makefile", "Procfile",
]);
const DEPENDENCY_MANIFESTS = new Set([
  "package.json", "requirements.txt", "pyproject.toml", "Pipfile", "Gemfile", "Cargo.toml",
  "go.mod", "composer.json",
]);
const LOCKFILE_NAMES = new Set([
  "package-lock.json", "npm-shrinkwrap.json", "yarn.lock", "pnpm-lock.yaml", "bun.lock",
  "Cargo.lock", "poetry.lock", "uv.lock", "Gemfile.lock",
]);
const APPROVED_REGISTRY_HOSTS = new Set([
  "registry.npmjs.org", "registry.yarnpkg.com", "pypi.org", "files.pythonhosted.org",
  "crates.io", "static.crates.io", "proxy.golang.org", "rubygems.org",
]);
const DOC_LIKE_EXTENSIONS = new Set([".html", ".md", ".mdc", ".txt"]);
const GENERIC_EXTERNAL_RULES = (() => {
  const overrideVerb = ["ign", "ore"].join("");
  const priorWord = ["pre", "vious"].join("");
  const instructionWord = ["instruc", "tions"].join("");
  const overrideVerbPt = ["ign", "ore"].join("");
  const instructionWordPt = ["instru", "ções"].join("");
  const priorWordPt = ["anter", "iores"].join("");
  const overrideAlternatives = [overrideVerb, ["dis", "regard"].join(""), ["over", "ride"].join("")].join("|");
  const priorAlternatives = [priorWord, "prior", "system", "developer"].join("|");
  const instructionAlternatives = [instructionWord, "prompt", "rules"].join("|");
  const overrideAlternativesPt = [overrideVerbPt, "desconsidere", "sobreponha"].join("|");
  const instructionAlternativesPt = [instructionWordPt, "instrucoes", "regras", "prompt"].join("|");
  const priorAlternativesPt = [priorWordPt, "anterior", "sistema", "desenvolvedor"].join("|");
  return Object.freeze([
    {
      code: "EXTERNAL_DELTA_REMOTE_SHELL",
      pattern: /\b(?:curl|wget)\b[^\n|]{0,500}\|\s*(?:sudo\s+)?(?:sh|bash|zsh|fish|python3?|node)\b/i,
    },
    {
      code: "EXTERNAL_DELTA_REMOTE_PROCESS_SUBSTITUTION",
      pattern: /\b(?:sh|bash|zsh)\s*<\(\s*(?:curl|wget)\b/i,
    },
    {
      code: "EXTERNAL_DELTA_REMOTE_POWERSHELL",
      pattern: /\b(?:irm|iwr|Invoke-WebRequest|Invoke-RestMethod)\b[^\n|]{0,500}\|\s*(?:iex|Invoke-Expression)\b/i,
    },
    {
      code: "EXTERNAL_DELTA_REMOTE_CODE_IMPORT",
      pattern: /\b(?:import|export)\b[^\n]{0,300}["']https?:\/\//i,
    },
    {
      code: "EXTERNAL_DELTA_UNICODE_CONTROL",
      pattern: /[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/u,
    },
    {
      code: "EXTERNAL_DELTA_PROMPT_OVERRIDE",
      pattern: new RegExp(
        `\\b(?:${overrideAlternatives})\\b.{0,100}\\b(?:${priorAlternatives})\\b.{0,100}\\b(?:${instructionAlternatives})\\b`,
        "i",
      ),
    },
    {
      code: "EXTERNAL_DELTA_PROMPT_OVERRIDE_PT",
      pattern: new RegExp(
        `\\b(?:${overrideAlternativesPt})\\b.{0,100}\\b(?:${instructionAlternativesPt})\\b.{0,100}\\b(?:${priorAlternativesPt})\\b`,
        "i",
      ),
    },
  ]);
})();
const SENSITIVE_SEGMENTS = new Set([
  ".env", "secrets", "secret", "tokens", "token", "sessions", "session", ".ssh",
  "certs", "certificates", "credentials", "credential", "keys", "key",
]);

function parseArgs(argv) {
  const values = { repoRoot: process.cwd(), profileRoots: [], baseRef: null, headRef: null, json: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--repo-root" && argv[index + 1]) values.repoRoot = argv[++index];
    else if (arg === "--profile-root" && argv[index + 1]) values.profileRoots.push(argv[++index]);
    else if (arg === "--base-ref" && argv[index + 1]) values.baseRef = argv[++index];
    else if (arg === "--head-ref" && argv[index + 1]) values.headRef = argv[++index];
    else if (arg === "--json") values.json = true;
  }
  values.repoRoot = resolve(values.repoRoot);
  values.profileRoots = values.profileRoots.map((item) => resolve(item));
  return values;
}

function lineOf(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

export function findForbidden(text, rules = FORBIDDEN_CANONICAL, path = "<memory>", { redactExcerpt = false, redactedExcerpt = "[PROFILE_CONTENT_REDACTED]" } = {}) {
  const findings = [];
  for (const rule of rules) {
    const match = rule.pattern.exec(text);
    if (!match) continue;
    findings.push({
      code: rule.code,
      path,
      line: lineOf(text, match.index),
      excerpt: redactExcerpt ? redactedExcerpt : match[0].replace(/\s+/g, " ").slice(0, 180),
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

function safeRead(path, maxBytes = 512 * 1024) {
  try {
    const stat = statSync(path);
    if (!stat.isFile() || stat.size > maxBytes) return null;
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

function walkExternalBoundaryFiles(root) {
  const files = [];
  const visit = (directory) => {
    let entries = [];
    try { entries = readdirSync(directory, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      if (entry.isSymbolicLink()) continue;
      const absolute = join(directory, entry.name);
      if (entry.isDirectory()) {
        if ([".git", "node_modules", ".cache", "coverage"].includes(entry.name)) continue;
        visit(absolute);
        continue;
      }
      const extension = extname(entry.name).toLowerCase();
      const environmentTemplate = entry.name === ".env" || entry.name.startsWith(".env.");
      if (entry.isFile() && (TEXT_EXTENSIONS.has(extension) || KNOWN_TEXT_FILENAMES.has(entry.name) || environmentTemplate)) {
        files.push(absolute);
      }
    }
  };
  visit(root);
  return files;
}

export function validateExternalSourceBoundary(repoRoot) {
  const findings = [];
  if (!existsSync(repoRoot)) {
    return [{
      code: "EXTERNAL_SOURCE_ROOT_MISSING",
      path: repoRoot,
      line: null,
      excerpt: "Raiz do repositório ausente; validação não executada.",
    }];
  }
  for (const file of walkExternalBoundaryFiles(repoRoot)) {
    const text = safeRead(file, 16 * 1024 * 1024);
    if (text == null) {
      findings.push({
        code: "EXTERNAL_SOURCE_FILE_UNSCANNABLE",
        path: relative(repoRoot, file),
        line: null,
        excerpt: "Arquivo textual ilegível ou maior que o limite de 16 MiB.",
      });
      continue;
    }
    findings.push(...findForbidden(
      text,
      EXTERNAL_SOURCE_RULES,
      relative(repoRoot, file),
      { redactExcerpt: true, redactedExcerpt: "[EXTERNAL_SOURCE_REFERENCE_REDACTED]" },
    ));
  }
  return findings;
}

function redactedDeltaFinding(code, path, line, detail = "Nova referência externa exige revisão explícita.") {
  return {
    code,
    path,
    line,
    excerpt: `[EXTERNAL_DELTA_REDACTED] ${detail}`,
  };
}

function parseAddedLines(diffText) {
  const additions = [];
  let path = null;
  let newLine = 0;
  for (const rawLine of diffText.split(/\r?\n/)) {
    if (rawLine.startsWith("+++ ")) {
      const candidate = rawLine.slice(4);
      path = candidate === "/dev/null" ? null : candidate.replace(/^b\//, "");
      continue;
    }
    const hunk = rawLine.match(/^@@\s+-\d+(?:,\d+)?\s+\+(\d+)(?:,\d+)?\s+@@/);
    if (hunk) {
      newLine = Number(hunk[1]);
      continue;
    }
    if (!path || rawLine.startsWith("diff --git") || rawLine.startsWith("--- ")) continue;
    if (rawLine.startsWith("+")) {
      additions.push({ path, line: newLine, text: rawLine.slice(1) });
      newLine += 1;
    } else if (!rawLine.startsWith("-")) {
      newLine += 1;
    }
  }
  return additions;
}

function isDependencyManifest(path) {
  return DEPENDENCY_MANIFESTS.has(path.split("/").at(-1));
}

function specialAddedLineFindings({ path, line, text }) {
  const findings = [];
  const normalized = path.replaceAll("\\", "/");
  const fileName = normalized.split("/").at(-1);
  const extension = extname(fileName).toLowerCase();
  const workflow = normalized.startsWith(".github/workflows/") || /(?:^|\/)action\.ya?ml$/i.test(normalized);

  if (normalized === ".gitmodules" && /^\s*url\s*=/.test(text)) {
    findings.push(redactedDeltaFinding("EXTERNAL_DELTA_SUBMODULE_URL", path, line));
  }

  if (workflow) {
    const uses = text.match(/^\s*(?:-\s*)?uses:\s*([^\s#]+)/i)?.[1];
    if (uses && !uses.startsWith("./")) {
      const separator = uses.lastIndexOf("@");
      const ref = separator >= 0 ? uses.slice(separator + 1) : "";
      if (!/^[a-f0-9]{40}$/i.test(ref)) {
        findings.push(redactedDeltaFinding("EXTERNAL_DELTA_UNPINNED_ACTION", path, line, "Action externa sem SHA imutável."));
      }
    }
  }

  if (/^Dockerfile(?:\..+)?$/i.test(fileName)) {
    const image = text.match(/^\s*FROM\s+([^\s]+)/i)?.[1];
    if (image && image.toLowerCase() !== "scratch" && !/@sha256:[a-f0-9]{64}$/i.test(image)) {
      findings.push(redactedDeltaFinding("EXTERNAL_DELTA_UNPINNED_CONTAINER", path, line, "Imagem externa sem digest SHA-256."));
    }
  }

  if (isDependencyManifest(normalized)) {
    const metadataOnly = /^\s*["']?(?:homepage|repository|bugs|funding)["']?\s*[:=]/i.test(text);
    const remoteSpec = /(?:git\+https?:\/\/|git:\/\/|github:|https?:\/\/|file:|git\s*=\s*["']|url\s*=\s*["'])/i.test(text);
    if (remoteSpec && !metadataOnly) {
      findings.push(redactedDeltaFinding("EXTERNAL_DELTA_REMOTE_DEPENDENCY", path, line));
    }
    if (fileName === "package.json") {
      const entry = text.match(/^\s*"([^"]+)"\s*:\s*"([^"]+)"\s*,?\s*$/);
      const metadataKey = /^(?:node|npm|pnpm|yarn|homepage|repository|bugs|funding)$/i.test(entry?.[1] || "");
      if (entry && !metadataKey && /^(?:\^|~|\*|latest$|next$|[<>]=?)/i.test(entry[2])) {
        findings.push(redactedDeltaFinding(
          "EXTERNAL_DELTA_MUTABLE_DEPENDENCY_VERSION",
          path,
          line,
          "Dependência nova sem versão exata.",
        ));
      }
    }
  }

  if (LOCKFILE_NAMES.has(fileName)) {
    for (const match of text.matchAll(/https?:\/\/[^\s"'<>)}\]]+/gi)) {
      let host = null;
      try { host = new URL(match[0]).hostname.toLowerCase(); } catch { host = null; }
      if (!host || !APPROVED_REGISTRY_HOSTS.has(host)) {
        findings.push(redactedDeltaFinding(
          "EXTERNAL_DELTA_UNAPPROVED_LOCK_HOST",
          path,
          line,
          "Lockfile aponta para host fora da allowlist.",
        ));
        break;
      }
    }
  }

  const remoteDownload = /\b(?:curl|wget)\b/i.test(text) &&
    /https?:\/\//i.test(text) &&
    /(?:\s-o\s|\s-O\s|--output(?:-document)?(?:=|\s))/i.test(text);
  if (remoteDownload) {
    findings.push(redactedDeltaFinding("EXTERNAL_DELTA_REMOTE_DOWNLOAD", path, line));
  }

  if (/\bgit\s+(?:clone|fetch|pull|submodule\s+add)\b/i.test(text) &&
      /(?:https?:\/\/|ssh:\/\/|git:\/\/|git@[^\s:]+:)/i.test(text)) {
    findings.push(redactedDeltaFinding("EXTERNAL_DELTA_REMOTE_GIT_FETCH", path, line));
  }

  if (DOC_LIKE_EXTENSIONS.has(extension)) {
    const remoteEmbed = /<(?:script|iframe|object|embed|img|link)\b[^>]*(?:src|href|data)\s*=\s*["']?https?:\/\//i.test(text);
    const remoteImage = /!\[[^\]]*\]\(\s*https?:\/\//i.test(text);
    if (remoteEmbed || remoteImage) {
      findings.push(redactedDeltaFinding("EXTERNAL_DELTA_REMOTE_EMBED", path, line));
    }
  }

  if ([".css", ".scss"].includes(extension) && /@import\s+(?:url\()?\s*["']?https?:\/\//i.test(text)) {
    findings.push(redactedDeltaFinding("EXTERNAL_DELTA_REMOTE_STYLE_IMPORT", path, line));
  }

  return findings;
}

export function validateGenericAddedText(text, path = "<memory>", line = 1) {
  return [
    ...findForbidden(
      text,
      GENERIC_EXTERNAL_RULES,
      path,
      { redactExcerpt: true, redactedExcerpt: "[EXTERNAL_DELTA_REDACTED]" },
    ).map((finding) => ({ ...finding, line })),
    ...specialAddedLineFindings({ path, line, text }),
  ];
}

function changedPathMetadataFindings(repoRoot, baseRef, headRef) {
  const findings = [];
  const output = execFileSync(
    "git",
    ["diff", "--name-only", "-z", "--no-renames", baseRef, headRef, "--"],
    { cwd: repoRoot, encoding: "utf8", maxBuffer: 8 * 1024 * 1024 },
  );
  for (const path of output.split("\0").filter(Boolean)) {
    const normalized = path.replaceAll("\\", "/");
    if (/(?:^|\/)(?:node_modules|\.venv|site-packages|vendor\/bundle)(?:\/|$)/i.test(normalized)) {
      findings.push(redactedDeltaFinding("EXTERNAL_DELTA_VENDORED_DEPENDENCY", path, null));
    }
    if (/\.(?:exe|dll|dylib|so|bin|node|jar|class|wasm)$/i.test(normalized)) {
      findings.push(redactedDeltaFinding("EXTERNAL_DELTA_BINARY_PAYLOAD", path, null));
    }
    let treeEntry = "";
    try {
      treeEntry = execFileSync(
        "git",
        ["ls-tree", headRef, "--", path],
        { cwd: repoRoot, encoding: "utf8", maxBuffer: 1024 * 1024 },
      );
    } catch {
      treeEntry = "";
    }
    const mode = treeEntry.match(/^(\d{6})\s/)?.[1];
    if (mode === "120000") findings.push(redactedDeltaFinding("EXTERNAL_DELTA_SYMLINK", path, null));
    if (mode === "160000") findings.push(redactedDeltaFinding("EXTERNAL_DELTA_GITLINK", path, null));
  }
  return findings;
}

export function validateExternalDelta(repoRoot, { baseRef = null, headRef = null } = {}) {
  if (!baseRef && !headRef) {
    return { status: "NOT_APPLICABLE_NO_DIFF_REFS", base_ref: null, head_ref: null, additions: 0, findings: [] };
  }
  if (!baseRef || !headRef) {
    return {
      status: "BLOCKED_INCOMPLETE_DIFF_REFS",
      base_ref: baseRef,
      head_ref: headRef,
      additions: 0,
      findings: [redactedDeltaFinding("EXTERNAL_DELTA_REF_INCOMPLETE", "<git-diff>", null)],
    };
  }
  try {
    execFileSync("git", ["rev-parse", "--verify", `${baseRef}^{commit}`], { cwd: repoRoot, stdio: "ignore" });
    execFileSync("git", ["rev-parse", "--verify", `${headRef}^{commit}`], { cwd: repoRoot, stdio: "ignore" });
    const diffText = execFileSync(
      "git",
      ["diff", "--no-ext-diff", "--no-renames", "--unified=0", baseRef, headRef, "--"],
      { cwd: repoRoot, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 },
    );
    const additions = parseAddedLines(diffText);
    const findings = additions.flatMap((addition) =>
      validateGenericAddedText(addition.text, addition.path, addition.line));
    findings.push(...changedPathMetadataFindings(repoRoot, baseRef, headRef));
    return {
      status: findings.length === 0 ? "PASS" : "BLOCKED",
      base_ref: baseRef,
      head_ref: headRef,
      additions: additions.length,
      findings,
    };
  } catch {
    return {
      status: "BLOCKED_DIFF_UNAVAILABLE",
      base_ref: baseRef,
      head_ref: headRef,
      additions: 0,
      findings: [redactedDeltaFinding("EXTERNAL_DELTA_UNMEASURED", "<git-diff>", null)],
    };
  }
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

  findings.push(...validateExternalSourceBoundary(repoRoot));

  for (const [path, tokens] of Object.entries(CANONICAL)) {
    const text = safeRead(join(repoRoot, path));
    alreadyChecked.add(path);
    if (text == null) {
      findings.push({ code: "CANONICO_AUSENTE_OU_ILEGIVEL", path, line: null, excerpt: "Arquivo canônico não encontrado ou não legível." });
      continue;
    }
    findings.push(...validateRequiredTokens(text, tokens, path));
    findings.push(...findForbidden(text, FORBIDDEN_CANONICAL, path));
    if (path === META_LUPA_PATH) findings.push(...findForbidden(text, FORBIDDEN_META_LUPA, path));
    if (path === META_LUPA_IDENTITY_PATH) findings.push(...findForbidden(text, FORBIDDEN_IDENTITY_GUARD, path));
  }
  findings.push(...validateAgentClaimPolicy(repoRoot));

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

  for (const path of SYNC_SURFACES) {
    const text = safeRead(join(repoRoot, path));
    if (text == null) continue;
    findings.push(...findForbidden(text, FORBIDDEN_SYNC, path));
  }

  return findings;
}

export function runValidation({ repoRoot, profileRoots = [], baseRef = null, headRef = null }) {
  const externalDelta = validateExternalDelta(repoRoot, { baseRef, headRef });
  const canonicalFindings = [...validateRepository(repoRoot), ...externalDelta.findings];
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
    legacy_sync: "DISABLED_CANONICAL_GIT_ONLY",
    deployment: "PRODUCTION_FIRST + CAUSAL_SCOPE_FIRST",
    merge_policy: "INTENT_AUTHORIZED -> AUTO_SQUASH_IF_CLEAN -> MAIN",
    convergence: "FULL_ADVERSARIAL_ONLY_ON_CHEFE_REQUEST",
    learning: "CONFRONTO -> EVIDENCIA -> DELTA_DE_CRENCA -> REGRA|TESTE|GUARDRAIL|MEMORIA -> OURO",
    information_gain_required: true,
    writer_rule: "WRITER_UNICO",
    unknown_rule: "UNKNOWN_NAO_PASSA",
    agent_claim_rule: "AGENT_CLAIM_CAPABILITY_REQUIRED",
    external_delta: externalDelta,
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
  console.log(
    `IDENTIDADE_OK=${report.ok ? 1 : 0} ` +
      `AUTORIDADE=SEGREDO_CHEFE COORDENADOR=SOL EXECUTOR=PIVETE_HERMES ` +
      `AGENT_CLAIM=AGENT_CLAIM_CAPABILITY_REQUIRED ` +
      `EXTERNAL_DELTA=${report.external_delta.status} ` +
      `ERROS=${report.findings.length}`,
  );
  console.log(`IDENTIDADE_OK=${report.ok ? 1 : 0} AUTORIDADE=SEGREDO_CHEFE COORDENADOR=SOL EXECUTOR=PIVETE_HERMES SOUL=CANONICA MERGE=AUTO_SQUASH_IF_CLEAN ERROS=${report.findings.length}`);
  console.log(`IDENTIDADE_OK=${report.ok ? 1 : 0} AUTORIDADE=SEGREDO_CHEFE COORDENADOR=SOL EXECUTOR=PIVETE_HERMES LOADER=CANONICAL_ALLOWLIST LEGACY_SYNC=DISABLED MERGE=AUTO_SQUASH_IF_CLEAN LEARNING=INFORMATION_GAIN ERROS=${report.findings.length}`);
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
