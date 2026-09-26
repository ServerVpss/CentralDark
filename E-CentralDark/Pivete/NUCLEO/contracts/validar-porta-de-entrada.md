# CONTRATO - validar-porta-de-entrada.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\scripts\lupa\validar-porta-de-entrada.mjs
**SHA:** 9e75d0c13f3e9b16
**Timestamp:** 2026-08-28T02:57:36.377756
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- const contract = lerJson(CONTRATO_RECONCILIACAO);

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node

import { execFileSync } from "node:child_process";
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
const ESTRUTURA_VPS = "docs/CONSCIENCIA/04-ESTRUTURA-VPS.md";
const RECONCILIATION_SCHEMA_VERSION = 3;
const IDENTIDADE_LUPA = ".agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA";
const BASE_SHA = valueAfter("--base-sha", process.env.BASE_SHA || "");
const HEAD_SHA = valueAfter("--head-sha", process.env.HEAD_SHA || process.env.GITHUB_SHA || "");

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

const BOUNDARY_ENFORCED_FILES = [
  "scripts/checker/_lib.sh",
  "scripts/checker/01-estrutura.sh",
  "scripts/checker/02-logs.sh",
  "scripts/checker/03-github-deploy.sh",
  "scripts/checker/04-pm2.sh",
  "scripts/checker/05-telegram-bot.sh",
  "scripts/checker/06-supabase-sync.sh",
  "scripts/checker/07-whatsapp-wuzapi.sh",
  "scripts/checker/08-chat-ao-vivo.sh",
  "scripts/checker/09-caddy.sh",
  "scripts/checker/10-crm.sh",
  "scripts/checker/11-seguranca.sh",
  "scripts/checker/12-wildcard-dns.sh",
  "scripts/checker/run-all.sh",
  "scripts/clone-deck-gh-pull-with-deploy.sh",
  "scripts/webhook/deploy-job.sh",
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

function git(args) {
  return execFileSync("git", ["-C", ROOT, ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function gitCommitExiste(sha) {
  try {
    git(["rev-parse", "--verify", `${sha}^{commit}`]);
    return true;
  } catch {
    return false;
  }
}

function shaValido(value) {
  return /^[0-9a-f]{40}$/i.test(String(value || ""));
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
if (!existe(ESTRUTURA_VPS)) errors.push(`ESTRUTURA_VPS_AUSENTE:${ESTRUTU
```