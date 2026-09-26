# OUTRO - status.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\src\status.ts
**SHA:** df1cd7a9ddc02d2d
**Timestamp:** 2026-08-26T19:32:45.374679
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const missing = [...inCode].filter((n) => !pub.has(n));
- const missing =
- .pill{display:inline-flex;align-items:center;gap:10px;padding:10px 22px;border-radius:999px;font-size:17px;font-weight:800;letter-spacing:.02em}
- .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-top:10px}
- .head{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:8px}

### Ouro Bruto (primeiros 5000 chars)
```
// Página /status do MCP CentralDark — v2.
// Operacional, com cores semânticas (✅ 🟡 ❌ 🔁 ⚠️), comparação de commit
// (GitHub HEAD vs commit local da VPS), diff de catálogo (código vs publicado),
// agrupamento de tools por domínio, lista de tools sugeridas/faltantes e
// recomendações automáticas. Auto-refresh 15s.

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Request, Response } from "express";
import { config } from "./config.js";
import { fetchWithRetry } from "./fetch-retry.js";
import { getStateStats } from "./sessions.js";
import {
  ALL_TOOLS,
  CATALOG_HASH,
  CATALOG_VERSION,
  TOOL_NAMES,
  getCatalogSummary,
} from "./tools-catalog.js";

const startedAt = Date.now();
const STATUS_VERSION = "v2";

// ─────────────────────────── Tipos auxiliares ──────────────────────────────
type Level = "ok" | "warn" | "bad" | "info";

interface ConnectorHealth {
  name: string;
  level: Level;
  detail: string;
  latencyMs?: number;
}

interface Group {
  id: string;
  label: string;
  prefixes: string[];
  exact?: string[];
}

// Agrupamento por prefixo (mais alguns exatos). Ordem da lista = ordem visual.
const GROUPS: Group[] = [
  { id: "github", label: "GitHub", prefixes: ["github_"] },
  { id: "vps", label: "VPS / PM2", prefixes: ["vps_"] },
  { id: "supabase", label: "Supabase", prefixes: ["supabase_"] },
  { id: "deploy", label: "Deploy", prefixes: ["deploy_"] },
  { id: "mcp", label: "MCP interno", prefixes: ["mcp_"] },
  { id: "skill", label: "Skills", prefixes: ["skill_", "kit_"] },
  {
    id: "pendencias",
    label: "Pendências",
    prefixes: ["pendencias_"],
    exact: ["adicionar_pendencia", "fechar_pendencia", "ler_pendencias"],
  },
  {
    id: "consciencia",
    label: "Consciência",
    prefixes: [],
    exact: [
      "ler_consciencia",
      "atualizar_consciencia",
      "ler_regras_invioláveis",
      "ler_instalador",
    ],
  },
  {
    id: "aprendizado",
    label: "Aprendizado",
    prefixes: [],
    exact: ["registrar_aprendizado", "puxar_aprendizados"],
  },
];

// Tools desejadas mas não registradas ainda. Editar aqui é o suficiente
// pra essa seção atualizar — sem mexer no catálogo (evita bump de hash).
interface Suggested {
  name: string;
  priority: "high" | "med" | "low";
  reason: string;
}
const SUGGESTED_TOOLS: Suggested[] = [
  {
    name: "github_upload_binary_file",
    priority: "high",
    reason:
      "Alias direto pra upload binário (hoje só tem github_upload_base64_file, que obriga o cliente a codificar).",
  },
  {
    name: "vps_pm2_logs_stream",
    priority: "med",
    reason: "Streaming de logs PM2 em tempo real pra debug ao vivo.",
  },
  {
    name: "supabase_run_sql_readonly",
    priority: "med",
    reason: "Executar SELECT cru com timeout curto (read-only, sem DDL/DML).",
  },
  {
    name: "vps_caddy_reload_safe",
    priority: "low",
    reason: "Reload do Caddy com validação prévia (caddy validate) antes do reload.",
  },
];

// ─────────────────────────── Helpers de check ──────────────────────────────

async function checkGithubApi(): Promise<ConnectorHealth> {
  const t0 = Date.now();
  try {
    const res = await fetchWithRetry("https://api.github.com/", {
      headers: { "User-Agent": "MCP-CentralDark/status" },
      retries: 1,
      label: "github_health",
    });
    return {
      name: "GitHub API",
      level: res.ok ? "ok" : "bad",
      detail: `HTTP ${res.status}`,
      latencyMs: Date.now() - t0,
    };
  } catch (err) {
    return {
      name: "GitHub API",
      level: "bad",
      detail: String(err).slice(0, 120),
      latencyMs: Date.now() - t0,
    };
  }
}

function checkOAuthConfig(): ConnectorHealth {
  const has = !!config.github.clientSecret;
  return {
    name: "OAuth GitHub",
    level: has ? "ok" : "warn",
    detail: has ? "client_secret presente" : "GITHUB_CLIENT_SECRET ausente",
  };
}

function checkSupabaseConfig(): ConnectorHealth {
  // Não fazemos rede aqui — só checa se cofre/env aponta pra algum projeto.
  const hint =
    process.env.SUPABASE_URL ||
    process.env.SUPABASE_PROJECT_URL ||
    process.env.SUPABASE_REF ||
    "";
  return {
    name: "Supabase",
    level: hint ? "ok" : "warn",
    detail: hint ? "config detectada" : "sem env Supabase (cofre opcional)",
  };
}

function checkSshHint(): ConnectorHealth {
  const has = !!(process.env.VPS_SSH_KEY_LOVABLE || process.env.VPS_HOST_LOVABLE);
  return {
    name: "VPS SSH (hint)",
    level: has ? "ok" : "warn",
    detail: has ? "secret presente no ambiente" : "sem VPS_SSH_KEY_LOVABLE/VPS_HOST_LOVABLE",
  };
}

function checkStatePersistence(stats: ReturnType<typeof getStateStats>): ConnectorHealth {
  return {
    name: "Persistência de estado",
    level: stats.stateFile ? "ok" : "warn",
    detail: stats.stateFile
      ? `arquivo: ${stats.stateFile}`
      : "arquivo de estado não configurado",
  };
}

// ─────────────────────────── Versão & Deploy ─────────────
```

---

# OUTRO - status.js
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_aiox-core\aiox-core\.aios-core\cli\commands\mcp\status.js
**SHA:** f287a9211f6223b3
**Timestamp:** 2026-08-26T19:43:46.712477
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- console.log('\n💡 Quick start: aios mcp setup --with-defaults');

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * MCP Status Command
 *
 * Shows global/project MCP configuration status.
 *
 * @module cli/commands/mcp/status
 * @version 1.0.0
 * @story 2.11 - MCP System Global
 */

const { Command } = require('commander');
const {
  globalConfigExists,
  listServers,
  readGlobalConfig,
} = require('../../../core/mcp/global-config-manager');
const {
  checkLinkStatus,
  LINK_STATUS,
} = require('../../../core/mcp/symlink-manager');
const {
  getGlobalConfigPath,
  getGlobalMcpDir,
  getOSInfo,
  getLinkType,
} = require('../../../core/mcp/os-detector');
const { detectProjectConfig } = require('../../../core/mcp/config-migrator');

/**
 * Create the status command
 * @returns {Command} Commander command instance
 */
function createStatusCommand() {
  const status = new Command('status');

  status
    .description('Show global and project MCP configuration status')
    .option('--json', 'Output as JSON')
    .option('-v, --verbose', 'Show detailed server information')
    .action(async (options) => {
      await executeStatus(options);
    });

  return status;
}

/**
 * Execute the status command
 * @param {Object} options - Command options
 */
async function executeStatus(options) {
  const projectRoot = process.cwd();

  // Gather status information
  const globalExists = globalConfigExists();
  const linkStatus = checkLinkStatus(projectRoot);
  const projectConfig = detectProjectConfig(projectRoot);
  const osInfo = getOSInfo();
  const serverList = globalExists ? listServers() : { servers: [], total: 0, enabled: 0 };
  const globalConfig = globalExists ? readGlobalConfig() : null;

  // JSON output
  if (options.json) {
    const jsonOutput = {
      global: {
        exists: globalExists,
        path: getGlobalConfigPath(),
        version: globalConfig?.version || null,
        servers: serverList,
      },
      project: {
        path: projectRoot,
        linkStatus: linkStatus.status,
        linkPath: linkStatus.linkPath,
        linkTarget: linkStatus.target || null,
        hasLocalConfig: projectConfig.found,
        localConfigPath: projectConfig.path,
      },
      os: {
        type: osInfo.type,
        linkType: getLinkType(),
      },
    };
    console.log(JSON.stringify(jsonOutput, null, 2));
    return;
  }

  // Human-readable output
  console.log('MCP Configuration Status\n');
  console.log('═'.repeat(50));

  // Global Config Section
  console.log('\n📁 Global Config');
  console.log('─'.repeat(30));

  if (globalExists) {
    console.log(`  Path: ${getGlobalConfigPath()}`);
    console.log(`  Version: ${globalConfig?.version || 'unknown'}`);
    console.log(`  Servers: ${serverList.total} configured, ${serverList.enabled} enabled`);
  } else {
    console.log('  Status: ❌ Not configured');
    console.log('  Run "aios mcp setup" to create global config');
  }

  // Project Link Section
  console.log('\n🔗 Project Link');
  console.log('─'.repeat(30));
  console.log(`  Path: ${linkStatus.linkPath}`);

  switch (linkStatus.status) {
    case LINK_STATUS.LINKED:
      console.log('  Status: ✅ Linked to global');
      console.log(`  Target: ${linkStatus.target}`);
      console.log(`  Type: ${linkStatus.type}`);
      break;
    case LINK_STATUS.NOT_LINKED:
      console.log('  Status: ⚪ Not linked');
      console.log('  Run "aios mcp link" to link project to global config');
      break;
    case LINK_STATUS.BROKEN:
      console.log('  Status: 🔴 Broken link');
      console.log(`  Target: ${linkStatus.target}`);
      console.log('  Run "aios mcp link --force" to fix');
      break;
    case LINK_STATUS.DIRECTORY:
      console.log('  Status: 📁 Local directory (not linked)');
      if (projectConfig.found) {
        console.log(`  Local config: ${projectConfig.serverCount} servers`);
        console.log('  Run "aios mcp link --migrate" to use global config');
      }
      break;
    default:
      console.log(`  Status: ⚠️ ${linkStatus.message}`);
  }

  // Servers Section
  if (globalExists && serverList.servers.length > 0) {
    console.log('\n📡 Servers');
    console.log('─'.repeat(30));

    for (const server of serverList.servers) {
      const statusIcon = server.enabled ? '✅' : '❌';
      const typeLabel = server.type === 'sse' ? '(SSE)' : '(npx)';

      console.log(`  ${statusIcon} ${server.name} ${typeLabel}`);

      if (options.verbose) {
        if (server.url) {
          console.log(`     URL: ${server.url}`);
        }
        if (server.command) {
          console.log(`     Command: ${server.command}`);
        }
      }
    }
  }

  // OS Information
  if (options.verbose) {
    console.log('\n💻 System');
    console.log('─'.repeat(30));
    console.log(`  OS: ${osInfo.type} (${osInfo.platform})`);
    console.log(`  Arch: ${osInfo.arch}`);
    console.log(`  Link type: ${getLinkType()}`);
    console.log(`  Home: ${osInfo.homeDir}`);
  }

  console.log('\n' + '═'.repeat(50));

  // Quick actions
  if (!globalExists) {
    console.log('\n💡 Quick start: aios mcp setup
```

---

# OUTRO - status.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\dist\tools\status.js
**SHA:** 54eaa234974813c0
**Timestamp:** 2026-08-28T02:54:51.838064
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const missing = [...inCode].filter((n) => !pub.has(n));
- const missing = diff.missingPublish.length > 0
- .pill{display:inline-flex;align-items:center;gap:10px;padding:10px 22px;border-radius:999px;font-size:17px;font-weight:800;letter-spacing:.02em}
- .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-top:10px}
- .head{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:8px}

### Ouro Bruto (primeiros 5000 chars)
```
// Página /status do MCP CentralDark — v2.
// Operacional, com cores semânticas (✅ 🟡 ❌ 🔁 ⚠️), comparação de commit
// (GitHub HEAD vs commit local da VPS), diff de catálogo (código vs publicado),
// agrupamento de tools por domínio, lista de tools sugeridas/faltantes e
// recomendações automáticas. Auto-refresh 15s.
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "../config.js";
import { fetchWithRetry } from "../lib/fetch-retry.js";
import { getStateStats } from "../sessions.js";
import { ALL_TOOLS, CATALOG_HASH, CATALOG_VERSION, TOOL_NAMES, getCatalogSummary, } from "./core/tools-catalog.js";
const startedAt = Date.now();
const STATUS_VERSION = "v2";
// Agrupamento por prefixo (mais alguns exatos). Ordem da lista = ordem visual.
const GROUPS = [
    { id: "github", label: "GitHub", prefixes: ["github_"] },
    { id: "vps", label: "VPS / PM2", prefixes: ["vps_"] },
    { id: "supabase", label: "Supabase", prefixes: ["supabase_"] },
    { id: "deploy", label: "Deploy", prefixes: ["deploy_"] },
    { id: "mcp", label: "MCP interno", prefixes: ["mcp_"] },
    { id: "skill", label: "Skills", prefixes: ["skill_", "kit_"] },
    {
        id: "pendencias",
        label: "Pendências",
        prefixes: ["pendencias_"],
        exact: ["adicionar_pendencia", "fechar_pendencia", "ler_pendencias"],
    },
    {
        id: "consciencia",
        label: "Consciência",
        prefixes: [],
        exact: [
            "ler_consciencia",
            "atualizar_consciencia",
            "ler_regras_inviolaveis",
            "ler_instalador",
        ],
    },
    {
        id: "aprendizado",
        label: "Aprendizado",
        prefixes: [],
        exact: ["registrar_aprendizado", "puxar_aprendizados"],
    },
];
const SUGGESTED_TOOLS = [
    {
        name: "github_upload_binary_file",
        priority: "high",
        reason: "Alias direto pra upload binário (hoje só tem github_upload_base64_file, que obriga o cliente a codificar).",
    },
    {
        name: "vps_pm2_logs_stream",
        priority: "med",
        reason: "Streaming de logs PM2 em tempo real pra debug ao vivo.",
    },
    {
        name: "supabase_run_sql_readonly",
        priority: "med",
        reason: "Executar SELECT cru com timeout curto (read-only, sem DDL/DML).",
    },
    {
        name: "vps_caddy_reload_safe",
        priority: "low",
        reason: "Reload do Caddy com validação prévia (caddy validate) antes do reload.",
    },
];
// ─────────────────────────── Helpers de check ──────────────────────────────
async function checkGithubApi() {
    const t0 = Date.now();
    try {
        const res = await fetchWithRetry("https://api.github.com/", {
            headers: { "User-Agent": "MCP-CentralDark/status" },
            retries: 1,
            label: "github_health",
        });
        return {
            name: "GitHub API",
            level: res.ok ? "ok" : "bad",
            detail: `HTTP ${res.status}`,
            latencyMs: Date.now() - t0,
        };
    }
    catch (err) {
        return {
            name: "GitHub API",
            level: "bad",
            detail: String(err).slice(0, 120),
            latencyMs: Date.now() - t0,
        };
    }
}
function checkOAuthConfig() {
    const has = !!config.github.clientSecret;
    return {
        name: "OAuth GitHub",
        level: has ? "ok" : "warn",
        detail: has ? "client_secret presente" : "GITHUB_CLIENT_SECRET ausente",
    };
}
function checkSupabaseConfig() {
    // Não fazemos rede aqui — só checa se cofre/env aponta pra algum projeto.
    const hint = process.env.SUPABASE_URL ||
        process.env.SUPABASE_PROJECT_URL ||
        process.env.SUPABASE_REF ||
        "";
    return {
        name: "Supabase",
        level: hint ? "ok" : "warn",
        detail: hint ? "config detectada" : "sem env Supabase (cofre opcional)",
    };
}
function checkSshHint() {
    const has = !!(process.env.VPS_SSH_KEY_LOVABLE || process.env.VPS_HOST_LOVABLE);
    return {
        name: "VPS SSH (hint)",
        level: has ? "ok" : "warn",
        detail: has ? "secret presente no ambiente" : "sem VPS_SSH_KEY_LOVABLE/VPS_HOST_LOVABLE",
    };
}
function checkStatePersistence(stats) {
    return {
        name: "Persistência de estado",
        level: stats.stateFile ? "ok" : "warn",
        detail: stats.stateFile
            ? `arquivo: ${stats.stateFile}`
            : "arquivo de estado não configurado",
    };
}
const COMMIT_CACHE = { at: 0, value: null };
async function fetchGithubHead() {
    // Cache 30s pra não estourar rate-limit anônimo.
    if (COMMIT_CACHE.value && Date.now() - COMMIT_CACHE.at < 30_000) {
        return COMMIT_CACHE.value;
    }
    try {
        const owner = config.github.owner;
        const repo = config.github.repo;
        const url = `https://api.github.com/repos/${owner}/${repo}/commits/main`;
        const res = await fetchWithRetry(url, {
          
```

---

# OUTRO - status.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\src\tools\status.js
**SHA:** 95e432bdd2ce7a83
**Timestamp:** 2026-08-28T02:55:03.397283
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const missing = [...inCode].filter((n) => !pub.has(n));
- const missing = diff.missingPublish.length > 0
- .pill{display:inline-flex;align-items:center;gap:10px;padding:10px 22px;border-radius:999px;font-size:17px;font-weight:800;letter-spacing:.02em}
- .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-top:10px}
- .head{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:8px}

### Ouro Bruto (primeiros 5000 chars)
```
// Página /status do MCP CentralDark — v2.
// Operacional, com cores semânticas (✅ 🟡 ❌ 🔁 ⚠️), comparação de commit
// (GitHub HEAD vs commit local da VPS), diff de catálogo (código vs publicado),
// agrupamento de tools por domínio, lista de tools sugeridas/faltantes e
// recomendações automáticas. Auto-refresh 15s.
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "../config.js";
import { fetchWithRetry } from "../lib/fetch-retry.js";
import { getStateStats } from "../sessions.js";
import { ALL_TOOLS, CATALOG_HASH, CATALOG_VERSION, TOOL_NAMES, getCatalogSummary, } from "./core/tools-catalog.js";
const startedAt = Date.now();
const STATUS_VERSION = "v2";
// Agrupamento por prefixo (mais alguns exatos). Ordem da lista = ordem visual.
const GROUPS = [
    { id: "github", label: "GitHub", prefixes: ["github_"] },
    { id: "vps", label: "VPS / PM2", prefixes: ["vps_"] },
    { id: "supabase", label: "Supabase", prefixes: ["supabase_"] },
    { id: "deploy", label: "Deploy", prefixes: ["deploy_"] },
    { id: "mcp", label: "MCP interno", prefixes: ["mcp_"] },
    { id: "skill", label: "Skills", prefixes: ["skill_", "kit_"] },
    {
        id: "pendencias",
        label: "Pendências",
        prefixes: ["pendencias_"],
        exact: ["adicionar_pendencia", "fechar_pendencia", "ler_pendencias"],
    },
    {
        id: "consciencia",
        label: "Consciência",
        prefixes: [],
        exact: [
            "ler_consciencia",
            "atualizar_consciencia",
            "ler_regras_inviolaveis",
            "ler_instalador",
        ],
    },
    {
        id: "aprendizado",
        label: "Aprendizado",
        prefixes: [],
        exact: ["registrar_aprendizado", "puxar_aprendizados"],
    },
];
const SUGGESTED_TOOLS = [
    {
        name: "github_upload_binary_file",
        priority: "high",
        reason: "Alias direto pra upload binário (hoje só tem github_upload_base64_file, que obriga o cliente a codificar).",
    },
    {
        name: "vps_pm2_logs_stream",
        priority: "med",
        reason: "Streaming de logs PM2 em tempo real pra debug ao vivo.",
    },
    {
        name: "supabase_run_sql_readonly",
        priority: "med",
        reason: "Executar SELECT cru com timeout curto (read-only, sem DDL/DML).",
    },
    {
        name: "vps_caddy_reload_safe",
        priority: "low",
        reason: "Reload do Caddy com validação prévia (caddy validate) antes do reload.",
    },
];
// ─────────────────────────── Helpers de check ──────────────────────────────
async function checkGithubApi() {
    const t0 = Date.now();
    try {
        const res = await fetchWithRetry("https://api.github.com/", {
            headers: { "User-Agent": "MCP-CentralDark/status" },
            retries: 1,
            label: "github_health",
        });
        return {
            name: "GitHub API",
            level: res.ok ? "ok" : "bad",
            detail: `HTTP ${res.status}`,
            latencyMs: Date.now() - t0,
        };
    }
    catch (err) {
        return {
            name: "GitHub API",
            level: "bad",
            detail: String(err).slice(0, 120),
            latencyMs: Date.now() - t0,
        };
    }
}
function checkOAuthConfig() {
    const has = !!config.github.clientSecret;
    return {
        name: "OAuth GitHub",
        level: has ? "ok" : "warn",
        detail: has ? "client_secret presente" : "GITHUB_CLIENT_SECRET ausente",
    };
}
function checkSupabaseConfig() {
    // Não fazemos rede aqui — só checa se cofre/env aponta pra algum projeto.
    const hint = process.env.SUPABASE_URL ||
        process.env.SUPABASE_PROJECT_URL ||
        process.env.SUPABASE_REF ||
        "";
    return {
        name: "Supabase",
        level: hint ? "ok" : "warn",
        detail: hint ? "config detectada" : "sem env Supabase (cofre opcional)",
    };
}
function checkSshHint() {
    const has = !!(process.env.VPS_SSH_KEY_LOVABLE || process.env.VPS_HOST_LOVABLE);
    return {
        name: "VPS SSH (hint)",
        level: has ? "ok" : "warn",
        detail: has ? "secret presente no ambiente" : "sem VPS_SSH_KEY_LOVABLE/VPS_HOST_LOVABLE",
    };
}
function checkStatePersistence(stats) {
    return {
        name: "Persistência de estado",
        level: stats.stateFile ? "ok" : "warn",
        detail: stats.stateFile
            ? `arquivo: ${stats.stateFile}`
            : "arquivo de estado não configurado",
    };
}
const COMMIT_CACHE = { at: 0, value: null };
async function fetchGithubHead() {
    // Cache 30s pra não estourar rate-limit anônimo.
    if (COMMIT_CACHE.value && Date.now() - COMMIT_CACHE.at < 30_000) {
        return COMMIT_CACHE.value;
    }
    try {
        const owner = config.github.owner;
        const repo = config.github.repo;
        const url = `https://api.github.com/repos/${owner}/${repo}/commits/main`;
        const res = await fetchWithRetry(url, {
          
```

---

# OUTRO - status.html
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\elite-anthropic-proxy\status.html
**SHA:** 699c470374230d05
**Timestamp:** 2026-08-28T02:56:22.914243
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- .btn-restart:hover{box-shadow:0 4px 12px rgba(245,158,11,.3)}
- .btn-start:hover{box-shadow:0 4px 12px rgba(16,185,129,.3)}

### Gaps
- .header-left{display:flex;align-items:center;gap:12px}
- .status-badge{display:flex;align-items:center;gap:8px;padding:8px 16px;border-radius:99px;font-size:13px;font-weight:600;transition:all .3s}
- .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:20px}
- .logs-controls{display:flex;gap:8px}
- .actions{display:flex;gap:8px;margin-top:16px;flex-wrap:wrap}
- .actions button{display:flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;border:0;font-size:13px;font-weight:500;cursor:pointer;transition:all .2s}
- @media(max-width:600px){.header{flex-direction:column;align-items:flex-start;gap:12px}.grid{grid-template-columns:1fr 1fr}}

### Ouro Bruto (primeiros 5000 chars)
```
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Elite Proxy — Status</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  :root {
    --bg: #0b1120;
    --card: #131c31;
    --border: #1e2d4a;
    --text: #e2e8f0;
    --mut: #64748b;
    --ok: #10b981;
    --err: #ef4444;
    --warn: #f59e0b;
    --pri: #3b82f6;
    --glow-ok: 0 0 20px rgba(16,185,129,.3);
    --glow-err: 0 0 20px rgba(239,68,68,.3);
  }
  *{box-sizing:border-box}
  body{margin:0;font-family:'Inter',system-ui,-apple-system,sans-serif;background:var(--bg);color:var(--text);padding:20px;min-height:100vh}
  .container{max-width:900px;margin:0 auto}

  /* Header */
  .header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid var(--border)}
  .header-left{display:flex;align-items:center;gap:12px}
  .logo{width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:#fff}
  .header h1{font-size:20px;margin:0;font-weight:600}
  .header .sub{font-size:12px;color:var(--mut);margin-top:2px}

  /* Status Badge */
  .status-badge{display:flex;align-items:center;gap:8px;padding:8px 16px;border-radius:99px;font-size:13px;font-weight:600;transition:all .3s}
  .status-badge.online{background:rgba(16,185,129,.15);color:var(--ok);border:1px solid rgba(16,185,129,.3);box-shadow:var(--glow-ok)}
  .status-badge.offline{background:rgba(239,68,68,.15);color:var(--err);border:1px solid rgba(239,68,68,.3);box-shadow:var(--glow-err)}
  .status-badge .dot{width:10px;height:10px;border-radius:50%;display:inline-block}
  .status-badge.online .dot{background:var(--ok);box-shadow:0 0 8px var(--ok);animation:pulse 2s infinite}
  .status-badge.offline .dot{background:var(--err);box-shadow:0 0 8px var(--err)}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}

  /* Cards Grid */
  .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:20px}
  .stat-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px;transition:border-color .3s}
  .stat-card .label{font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:var(--mut);margin-bottom:6px}
  .stat-card .value{font-size:24px;font-weight:700;font-variant-numeric:tabular-nums}
  .stat-card .value.ok{color:var(--ok)}.stat-card .value.err{color:var(--err)}.stat-card .value.warn{color:var(--warn)}.stat-card .value.pri{color:var(--pri)}

  /* Logs */
  .logs-section{margin-top:20px}
  .logs-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
  .logs-header h3{margin:0;font-size:15px;font-weight:600}
  .logs-controls{display:flex;gap:8px}
  .logs-controls button,.btn-clear{background:var(--card);border:1px solid var(--border);color:var(--text);padding:6px 14px;border-radius:8px;cursor:pointer;font-size:12px;transition:all .2s}
  .logs-controls button:hover,.btn-clear:hover{background:var(--border)}
  .logs-controls button.active{background:var(--pri);border-color:var(--pri);color:#fff}
  .log-container{background:#060a14;border:1px solid var(--border);border-radius:12px;padding:12px;height:320px;overflow-y:auto;font-family:'JetBrains Mono','Fira Code',monospace;font-size:12px;line-height:1.6}
  .log-container::-webkit-scrollbar{width:6px}
  .log-container::-webkit-scrollbar-track{background:transparent}
  .log-container::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}
  .log-line{padding:2px 8px;border-radius:4px;white-space:pre-wrap;word-break:break-all;transition:background .2s}
  .log-line:hover{background:rgba(255,255,255,.03)}
  .log-line .ts{color:var(--mut);margin-right:8px}
  .log-line .level-INFO{color:var(--pri)}
  .log-line .level-ERROR{color:var(--err);font-weight:600}
  .log-line .level-WARN{color:var(--warn)}
  .log-line .level-DEBUG{color:var(--mut)}
  .log-line .highlight{background:rgba(59,130,246,.1);border-left:2px solid var(--pri)}
  .log-line .highlight-err{background:rgba(239,68,68,.1);border-left:2px solid var(--err)}
  .log-empty{color:var(--mut);text-align:center;padding:40px;font-size:13px}

  /* Actions */
  .actions{display:flex;gap:8px;margin-top:16px;flex-wrap:wrap}
  .actions button{display:flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;border:0;font-size:13px;font-weight:500;cursor:pointer;transition:all .2s}
  .actions button:hover{transform:translateY(-1px)}
  .btn-restart{background:var(--warn);color:#000}
  .btn-restart:hover{box-shadow:0 4px 12px rgba(245,158,11,.3)}
  .btn-stop{background:var(--err);color:#fff}
  .btn-stop:hover{box-shadow:0 4px 12px rgba(239,68,68,.3)}
  .btn-start{background:var(--ok);color:#000}
  .btn-start:hover{box-shadow:0 4px 12px rgba(16,185,129,.3)}
  .btn-refresh{background:var(--card);color:var(--text);border:1px solid var(--border)!important}
  .btn-ref
```

---

# OUTRO - STATUS.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\docs\CONSCIENCIA\AGENTES-AUTONOMOS\HERMES\STATUS.md
**SHA:** 2322588fe60b1538
**Timestamp:** 2026-08-28T02:56:49.971648
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- > Regra: bloco vai SEMPRE colado no fim do card admin, depois do "PRÓXIMO PASSO". No canal público, jamais.

### Ouro Bruto (primeiros 5000 chars)
```
---
title: "STATUS"
date: 2026-07-05
tags: ["consciencia"]
updated: 2026-07-05
---

# HERMES — STATUS / NÍVEL / SKILLS

> Fonte da verdade do "onde o Hermes tá agora". Toda notificação Telegram no **privado do admin** DEVE anexar o bloco `<pre>` renderizado a partir daqui. **Canal público NÃO leva esse bloco** (só linha curta).

---

## 📈 Sistema de Nível

XP acumulado (soma dos +XP de cada AULA/BLOCO fechado).

| Nível | Título          | XP necessário |
|-------|-----------------|---------------|
| 1     | Aprendiz        | 0             |
| 2     | Escudeiro       | 50            |
| 3     | Operador        | 120           |
| 4     | Tático          | 220           |
| 5     | Estrategista    | 350           |
| 6     | Mestre de Guerra| 500           |
| 7     | Arquiteto       | 700           |
| 8     | Lenda           | 1000          |

## 🎯 Nível atual

- **XP total:** 180
- **Nível:** 3 — Operador
- **Próximo:** Tático (faltam 40 XP)

## 🛠️ Skills (0–100)

| Skill                       | Nível | Barra                                   |
|-----------------------------|-------|-----------------------------------------|
| Telegram (post/HTML/`<pre>`)| 85    | `▓▓▓▓▓▓▓▓▓░`                            |
| WebUI (restart/health)      | 70    | `▓▓▓▓▓▓▓░░░`                            |
| Arsenal Council (rotas)     | 75    | `▓▓▓▓▓▓▓▓░░`                            |
| Carga/baseline (curl 4v)    | 60    | `▓▓▓▓▓▓░░░░`                            |
| Debate + refino             | 80    | `▓▓▓▓▓▓▓▓░░`                            |
| Esmeralda (UI 3D)           | 55    | `▓▓▓▓▓░░░░░`                            |
| Aprendizados/rastro         | 90    | `▓▓▓▓▓▓▓▓▓░`                            |
| Auto-diagnóstico            | 45    | `▓▓▓▓░░░░░░`                            |

## 📝 Como atualizar

Após cada AULA/BLOCO fechado:
1. Somar `+XP` do bloco ao total.
2. Recalcular nível pela tabela.
3. Bumpar skill(s) tocada(s) no bloco (+5 a +10).
4. Regerar bloco `<pre>` (ver template abaixo) e anexar no card admin.

## 📦 Template `<pre>` (só admin)

```html
<pre>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 HERMES · Nv.3 Operador · 180 XP
Próx: Tático (▓▓▓▓▓▓▓▓░░ 40 XP)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Telegram      ▓▓▓▓▓▓▓▓▓░ 85
WebUI         ▓▓▓▓▓▓▓░░░ 70
Arsenal       ▓▓▓▓▓▓▓▓░░ 75
Carga 4v      ▓▓▓▓▓▓░░░░ 60
Debate/refino ▓▓▓▓▓▓▓▓░░ 80
Esmeralda     ▓▓▓▓▓░░░░░ 55
Rastro/apr.   ▓▓▓▓▓▓▓▓▓░ 90
Auto-diag.    ▓▓▓▓░░░░░░ 45
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
</pre>
```

> Regra: bloco vai SEMPRE colado no fim do card admin, depois do "PRÓXIMO PASSO". No canal público, jamais.

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre

```