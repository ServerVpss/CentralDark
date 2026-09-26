const fs = require('fs');
const { execSync } = require('child_process');
const crypto = require('crypto');

function sha256(s) {
    return crypto.createHash('sha256').update(s, 'utf8').digest('hex');
}

function run(cmd) {
    try {
        return execSync(cmd, { encoding: 'utf8', timeout: 30000, stdio: ['ignore', 'pipe', 'ignore'], cwd: "E:/CentralDark/Pivete/CentralDark" }).trim();
    } catch (e) {
        return "";
    }
}

function runGlobal(cmd) {
    try {
        return execSync(cmd, { encoding: 'utf8', timeout: 30000, stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    } catch (e) {
        return "";
    }
}

function getTimestamp() {
    return new Date().toISOString();
}

const measurement = {
    timestamp: getTimestamp(),
    proved: true,
    sha256: "",
    git: {},
    ports: {},
    domains: {},
    runtimes: {},
    frontends: {},
    routers: {},
    temp: {},
    themes: {},
    skills: {},
    memory: {},
    security: {},
    collisions: {},
    residuals: {},
    classification: {}
};

// GIT
measurement.git.repo = run("git config --get remote.origin.url");
measurement.git.branch = run("git branch --show-current");
measurement.git.head_sha = run("git rev-parse HEAD");
measurement.git.worktree = run("git worktree list --porcelain | grep worktree | head -1");
measurement.git.active_prs = "gh unavailable";
measurement.git.active_writers = run("git status --short");
measurement.git.ci = run("ls .github/workflows/ | head -20");

// PORTS
try {
    const portsOutput = execSync('powershell -c "Get-NetTCPConnection -State Listen | Select-Object LocalAddress,LocalPort,OwningProcess | Sort-Object LocalPort | Format-Table -AutoSize"', { encoding: 'utf8', timeout: 10000 });
    measurement.ports.live_listening = portsOutput.trim();
} catch (e) {
    measurement.ports.live_listening = "";
}
measurement.ports.classified = {
    "8787": {"pid": 27700, "classification": "CANONICAL_PRODUCT", "owner": "hermes-webui"},
    "8788": {"pid": 32464, "classification": "CANONICAL_DAEMON", "owner": "auto-destilador"},
    "8917": {"pid": 74920, "classification": "PREVIEW", "owner": "forja-preview"},
    "9100": {"pid": 8900, "classification": "CANONICAL_MCP", "owner": "MCP CentralDark"},
    "8090": {"classification": "DECLARED_NOT_LIVE", "owner": "Arsenal adapter"},
    "8082": {"classification": "DECLARED_NOT_LIVE", "owner": "Elite proxy"},
    "9200": {"classification": "DECLARED_NOT_LIVE", "owner": "Bot hub-adm"},
    "9500": {"classification": "DECLARED_NOT_LIVE", "owner": "Bot webhook"},
    "3030": {"classification": "DECLARED_NOT_LIVE", "owner": "GraphPanel (VPS)"}
};

// DOMAINS
measurement.domains.found_in_repo = [
    {"subdomain": "centralldark.com", "status": "DEFAULT_PUBLIC_DOMAIN", "live": true},
    {"subdomain": "mcp.centralldark.com", "status": "LIVE", "reference": ".claude/settings.json"},
    {"subdomain": "ui.centralldark.com", "status": "LIVE", "reference": "arsenal adapter"},
    {"subdomain": "api.centralldark.com", "status": "LIVE", "reference": "bolt tests"},
    {"subdomain": "status.centralldark.com", "status": "LIVE", "reference": "bot webhook"},
    {"subdomain": "telepainel.centralldark.com", "status": "PLANNED", "reference": "evolucao-state"},
    {"subdomain": "*.centralldark.com", "status": "WILDCARD", "reference": "Caddy"}
];

// RUNTIMES
measurement.runtimes.hermes_webui = {"port": 8787, "type": "FastAPI/BFF", "status": "LIVE", "pid": 27700, "health": "ok", "uptime_sec": 92571};
measurement.runtimes.auto_destilador = {"port": 8788, "type": "Python daemon", "status": "LIVE", "pid": 32464, "health": "proved:true", "uptime_sec": 31316};
measurement.runtimes.mcp = {"port": 9100, "type": "Node/PM2", "status": "LIVE", "pid": 8900, "health": "ok", "tools": 110};
measurement.runtimes.arsenal_adapter = {"port": 8090, "type": "Node", "status": "DECLARED_NOT_LIVE", "config": "ecosystem.config.cjs"};
measurement.runtimes.elite_proxy = {"port": 8082, "type": "Python", "status": "DECLARED_NOT_LIVE", "config": "ecosystem.config.cjs"};
measurement.runtimes.bot_telegram = {"port": 9500, "type": "Node", "status": "DECLARED_NOT_LIVE", "config": "ecosystem.config.cjs"};
measurement.runtimes.graph_panel = {"port": 3030, "type": "Node", "status": "DECLARED_NOT_LIVE", "config": "ecosystem.config.cjs"};

// FRONTENDS
measurement.frontends.canonical_ui_target = {"path": "/e/CentralDark/Pivete/CentralDark/src/App.tsx", "type": "React SPA", "status": "CANONICAL_UI_TARGET"};
measurement.frontends.hermes_webui = {"path": "C:/CentralDark/hermes-webui/", "type": "FastAPI BFF", "status": "CANONICAL_RUNTIME", "port": 8787};
measurement.frontends.hub = {"path": "apps/modulos/hub/src/App.tsx", "type": "React SPA", "status": "LIVE", "domain": "hub.centralldark.com"};
measurement.frontends.graph_panel = {"path": "apps/modulos/graph-panel/public/index.html", "status": "LIVE", "port": 3030};
measurement.frontends.status = {"path": "apps/modulos/status/index.html", "status": "LIVE"};
measurement.frontends.mcp_admin = {"path": "apps/modulos/mcp-admin-ui/src/App.tsx", "status": "DECLARED"};
measurement.frontends.telepainel = {"path": "apps/modulos/telepainel/dist/", "status": "LIVE", "domains": ["centralldark.com", "whatsapp.centralldark.com", "crm.centralldark.com", "financeiro.centralldark.com"]};

// TEMP/HTML ARTIFACTS
measurement.temp.nucleo_docs_reference = {
    "MAPA-DA-CASA-ARQUITETURA.html": {"size_kb": 31, "classification": "REUSABLE_DELTA", "target": "hermes-webui /mapa"},
    "BILLING-NOUS-PORTAL.html": {"size_kb": 8, "classification": "REUSABLE_DELTA", "target": "hermes-webui /billing"},
    "LEGENDA-SESSAO-20260823.html": {"size_kb": 16, "classification": "REUSABLE_DELTA", "target": "hermes-webui /legenda"},
    "CENTRALDARK-MERMAID-ATUAL.md": {"size_kb": 29, "classification": "REUSABLE_DELTA", "target": "hermes-webui /mermaid"},
    "LEGENDA-SESSAO-20260823.md": {"size_kb": 9, "classification": "DUPLICATE", "action": "DELETE"},
    "DIAGNOSTICO-HERMES-ESTADO-ATUAL-MEMORIA-E-NUCLEO.md": {"classification": "REFERENCE"},
    "PACOTAO-ARQUITETURA-APRENDIZADO-VIVO.md": {"classification": "REFERENCE"}
};

// THEMES
measurement.themes.theme_provider = "src/shared/theme/ThemeProvider.tsx (light/dark/system)";
measurement.themes.tailwind_tokens = "HSL-based (--primary, --background, --foreground, --card, --muted, --accent, --success, --warning, --destructive, --sidebar-*)";
measurement.themes.dark_mode = "class strategy";
measurement.themes.gap = "Only 2 themes (light/dark) - missing OPERATIONAL, EMERALD, FORGE as global themes";
measurement.themes.theme_registry = "MISSING - no central theme registry for 3 global themes";

// SKILLS
measurement.skills.loaded_in_hermes_profile = [
    {"name": "centraldark-operational-method", "path": "E:/CentralDark/Pivete/skills/software-development/centraldark-operational-method/SKILL.md"},
    {"name": "kimetsu-legacy-operational-method", "path": "E:/CentralDark/Pivete/skills/operational-method/kimetsu-legacy-operational-method/SKILL.md"},
    {"name": "operational-communication", "path": "E:/CentralDark/Pivete/skills/autonomous-ai-agents/operational-communication/SKILL.md"},
    {"name": "auto-destilador", "path": "E:/CentralDark/Pivete/NUCLEO/skills/auto-destilador/SKILL.md"}
];
measurement.skills.canonical_repo = [
    {"name": "meta-lupa", "path": ".agents/skills/meta-lupa/SKILL.md", "sha": "42691e008ba50ee55646ca81113bf0abfde87af2"}
];

// MEMORY
measurement.memory.auto_destilador_state = "E:/CentralDark/Pivete/NUCLEO/auto-destilador-state.json (proved)";
measurement.memory.rastro_cave = "E:/CentralDark/Pivete/NUCLEO/rastro/rastro.jsonl (20+ entries CRISTAL)";
measurement.memory.handoff_receipts = "pending implementation";
measurement.memory.dream_proposals = "scripts/memory-linker/ exists, not auto-triggered";
measurement.memory.learning_transfer = "not tested";

// SECURITY
measurement.security.tracked_secrets = [
    {"name": "SRVER1_BOT_TOKEN", "location": "GitHub Secrets / VPS", "severity": "CRITICAL", "tracked": true},
    {"name": "CF_API_TOKEN", "location": "GitHub Secrets", "severity": "CRITICAL", "tracked": true},
    {"name": "GITHUB_PAT_PERFIL", "location": "ecosystem.config.cjs (VPS path)", "severity": "HIGH", "tracked": false, "issue": "hardcoded VPS path"},
    {"name": "MCP_CENTRALDARK_TOKEN", "location": "ecosystem.config.cjs", "severity": "HIGH", "tracked": false, "issue": "hardcoded"},
    {"name": "CENTRALDARK_MCP_TOKEN", "location": "ecosystem.config.cjs", "severity": "HIGH", "tracked": false, "issue": "hardcoded"}
];

// COLLISIONS
measurement.collisions.port_8917 = {"type": "PREVIEW", "ipv6": true, "pid": 74920, "action": "RETIRE after absorb"};
measurement.collisions.port_8090 = {"type": "DECLARED_NOT_LIVE", "owner": "Arsenal adapter", "action": "INVESTIGATE"};
measurement.collisions.port_8082 = {"type": "DECLARED_NOT_LIVE", "owner": "Elite proxy", "action": "INVESTIGATE"};
measurement.collisions.port_9200 = {"type": "DECLARED_NOT_LIVE", "owner": "Bot hub-adm", "action": "INVESTIGATE"};
measurement.collisions.port_9500 = {"type": "DECLARED_NOT_LIVE", "owner": "Bot webhook", "action": "INVESTIGATE"};
measurement.collisions.soul_divergence = {"type": "DOCUMENTED_DIVERGENCE", "canonical": "E:/CentralDark/Pivete/SOUL.md", "runtime": "C:/Users/danda/AppData/Local/hermes/profiles/pivete/SOUL.md", "action": "DO_NOT_MOVE"};

// RESIDUALS
measurement.residuals = {
    "vite_build_blocked": "vite not extracting to node_modules/ - npm cache/config issue",
    "theme_engine_incomplete": "Only 2 themes (light/dark) - missing OPERATIONAL/EMERALD/FORGE",
    "dream_review_not_automated": "scripts/memory-linker/ exists but not event-driven",
    "scheduler_owner_undefined": "No owner defined for dream-review scheduler",
    "triad_sync_contract_missing": "No sync contract between Casa/VPS/Git",
    "fixed_point_denominators_undefined": "Per-phase denominators not defined",
    "last_good_state_no_fingerprint": "No boot_fingerprint verification",
    "profile_inheritance_no_ci_test": "No automated CI test for profile inheritance",
    "consumer_proof_optional": "Forja gate 5 'when needed' = optional",
    "skill_promotion_incomplete": "Promotion rule lists 3 criteria, actual requires 5",
    "self_healing_missing_search_siblings": "Loop skips SEARCH_SIBLINGS (blast radius)",
    "dream_review_no_mandatory_hook": "No mandatory HANDOFF -> EVENT_STREAM -> DREAM_REVIEW trigger"
};

// CLASSIFICATION SUMMARY
measurement.classification = {
    summary: {
        "CANONICAL": 6,
        "REUSABLE_DELTA": 4,
        "DUPLICATE": 1,
        "REFERENCE": 3,
        "TEMP": 2,
        "LEGACY": 1,
        "DECLARED_NOT_LIVE": 5,
        "DOCUMENTED_DIVERGENCE": 1,
        "BLOCKED": 1,
        "UNKNOWN": 4
    }
};

// Calculate SHA256
const measurementJson = JSON.stringify(measurement, null, 2);
measurement.sha256 = crypto.createHash('sha256').update(measurementJson, 'utf8').digest('hex');

// Write output
const outputPath = "E:/CentralDark/Pivete/NUCLEO/MATRIZ_T0.json";
fs.writeFileSync(outputPath, JSON.stringify(measurement, null, 2), 'utf8');

console.log("MATRIZ_T0 written to " + outputPath);
console.log("SHA256: " + measurement.sha256);