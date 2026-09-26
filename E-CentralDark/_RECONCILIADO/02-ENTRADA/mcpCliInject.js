/**
 * mcpCliInject — injeta o servidor MCP do Overclock na config dos CLIs que NÃO
 * aceitam --mcp-config por flag (gemini, antigravity). Espelha ensureGeminiMcpConfig
 * do bootstrap Electron (packages/shell/src/main/bootstrapMainProcess.ts ~1538),
 * mas recebe a URL streamableHttp já resolvida (fs-puro, sem dep do MCPServerHost).
 *
 * Claude usa --mcp-config (injetado em buildSpawnConfig); estes escrevem arquivos
 * de config no workspace/home antes do spawn. Idempotente (merge, preserva o resto).
 */
import { join, dirname } from 'node:path';
import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const execFileP = promisify(execFile);
const isRecord = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);
const LOCAL_DEV_OBSERVABILITY_RULE = [
    'Internal local-testing rule for every LLM running inside Overclock:',
    '- When testing or debugging the local Overclock app, observe reality through the local/dev diagnostics MCP before relying on user screenshots or terminal guesses.',
    '- Prefer app_observe_once for a single snapshot and app_watch with maxMs for bounded live observation.',
    '- Never start unbounded monitor loops unless the user explicitly asks for continuous monitoring.',
    '- Use app_screenshot only with confirm=true when an explicit temp screenshot is needed; do not request or expose screenshot bytes in text.',
].join('\n');
const GEMINI_CONTEXT = [
    '# Overclock Context',
    '',
    'You are running inside Overclock, a multi-agent IDE with visible pane orchestration.',
    '',
    '- If the user asks to open N panes, call the overclock pane_spawn tool exactly N times. Never open more panes than requested.',
    '- If the user does not specify a CLI/provider/model, open panes with the same CLI/model as the current pane.',
    '- If the user specifies Codex, Gemini, Claude, MIMO, or another provider/model, pass the matching agent/provider/model to pane_spawn.',
    '- If you spawn or use one other pane to answer the user, complete the loop: pane_write, short pane_wait_idle, pane_read, then answer the user in your current pane using the child pane result.',
    '- If you spawn multiple panes, prefer pane_write_many and pane_wait_many(returnOn=any). Let MCP do fine-grained polling, process each completed pane immediately, and keep unfinished panes running.',
    '',
    LOCAL_DEV_OBSERVABILITY_RULE,
    '',
    '- Never stop after pane_write. The task is incomplete until you have read completed child pane output and replied to the user.',
    '- Do not inspect tmux, zellij, terminal splitters, or repository files to satisfy pane-opening requests.',
    '- Panes must be visible Overclock panes. Do not use invisible background agents for delegation.',
    '',
].join('\n');
/**
 * Args de MCP do codex (espelha bootstrap ~6014): codex recebe o servidor MCP via
 * `-c mcp_servers.overclock.url=<toml>` em vez de arquivo. tomlString = JSON.stringify
 * (TOML basic string, escapa "/\). serverUrl = mcpHost.streamableHttpUrl('codex', ...).
 */
export function codexMcpArgs(serverUrl) {
    return [
        '-c', `mcp_servers.overclock.url=${JSON.stringify(serverUrl)}`,
        '-c', `mcp_servers.overclock.default_tools_approval_mode=${JSON.stringify('approve')}`,
    ];
}
async function atomicWrite(path, content) {
    const tmpPath = `${path}.${process.pid}.${randomUUID()}.tmp`;
    await writeFile(tmpPath, content, 'utf8');
    await rename(tmpPath, path);
}
/**
 * Escreve <cwd>/.gemini/settings.json (mcpServers.overclock=http + security.auth
 * herdado do global p/ não travar no "Waiting for authentication" + contextFileName
 * + ui.hideContextSummary + hooksConfig.enabled=false) e o overclock-context.md.
 * serverUrl = mcpHost.streamableHttpUrl('gemini', model, providerId).
 */
export async function ensureGeminiMcpConfig(cwd, serverUrl) {
    const geminiDir = join(cwd, '.gemini');
    const settingsPath = join(geminiDir, 'settings.json');
    const contextRelPath = join('.gemini', 'overclock-context.md');
    const contextPath = join(cwd, contextRelPath);
    let settings = {};
    try {
        const parsed = JSON.parse(await readFile(settingsPath, 'utf8'));
        if (isRecord(parsed))
            settings = { ...parsed };
    }
    catch {
        settings = {};
    }
    const currentMcpServers = isRecord(settings.mcpServers) ? settings.mcpServers : {};
    settings.mcpServers = {
        ...currentMcpServers,
        overclock: { url: serverUrl, type: 'http', trust: true },
    };
    // Preserva o auth method: settings de projeto sem security.auth faz o Gemini
    // largar a seleção global e travar em "Waiting for authentication". Herda o
    // selectedType global (default oauth-personal).
    if (!isRecord(settings.security) || !isRecord(settings.security.auth)) {
        let selectedType = 'oauth-personal';
        try {
            const globalSettings = JSON.parse(await readFile(join(homedir(), '.gemini', 'settings.json'), 'utf8'));
            const sel = isRecord(globalSettings) && isRecord(globalSettings.security) && isRecord(globalSettings.security.auth)
                ? globalSettings.security.auth.selectedType
                : undefined;
            if (typeof sel === 'string' && sel)
                selectedType = sel;
        }
        catch { /* sem global — fallback oauth-personal */ }
        settings.security = {
            ...(isRecord(settings.security) ? settings.security : {}),
            auth: { selectedType },
        };
    }
    const currentContextFileName = Array.isArray(settings.contextFileName)
        ? settings.contextFileName.filter((item) => typeof item === 'string')
        : typeof settings.contextFileName === 'string'
            ? [settings.contextFileName]
            : ['GEMINI.md'];
    settings.contextFileName = Array.from(new Set([...currentContextFileName, contextRelPath]));
    settings.ui = { ...(isRecord(settings.ui) ? settings.ui : {}), hideContextSummary: true };
    settings.hooksConfig = { ...(isRecord(settings.hooksConfig) ? settings.hooksConfig : {}), enabled: false };
    await mkdir(geminiDir, { recursive: true });
    await atomicWrite(contextPath, GEMINI_CONTEXT);
    await atomicWrite(settingsPath, `${JSON.stringify(settings, null, 2)}\n`);
}
const ANTIGRAVITY_CONTEXT = [
    '# Overclock Context',
    '',
    'You are running inside Overclock through the Antigravity/agy CLI with visible pane orchestration.',
    '',
    LOCAL_DEV_OBSERVABILITY_RULE,
    '',
    '- Panes must be visible Overclock panes. Do not use invisible background agents for delegation.',
    '',
].join('\n');
// Antigravity usa o dir .gemini do workspace só p/ contextFileName (não mcpServers —
// esse vai pros mcp_config.json no home). Espelha bootstrap 1620.
async function ensureAntigravityWorkspaceContext(cwd) {
    const geminiDir = join(cwd, '.gemini');
    const settingsPath = join(geminiDir, 'settings.json');
    const contextRelPath = join('.gemini', 'overclock-context.md');
    const contextPath = join(cwd, contextRelPath);
    let settings = {};
    try {
        const parsed = JSON.parse(await readFile(settingsPath, 'utf8'));
        if (isRecord(parsed))
            settings = { ...parsed };
    }
    catch {
        settings = {};
    }
    const currentContextFileName = Array.isArray(settings.contextFileName)
        ? settings.contextFileName.filter((item) => typeof item === 'string')
        : typeof settings.contextFileName === 'string'
            ? [settings.contextFileName]
            : ['GEMINI.md'];
    settings.contextFileName = Array.from(new Set([...currentContextFileName, contextRelPath]));
    await mkdir(geminiDir, { recursive: true });
    await atomicWrite(contextPath, ANTIGRAVITY_CONTEXT);
    await atomicWrite(settingsPath, `${JSON.stringify(settings, null, 2)}\n`);
}
/**
 * Merge mcpServers.overclock={serverUrl,disabled:false,enabledTools} num mcp_config.json
 * do antigravity. Espelha bootstrap 1715 (config inválido → backup .invalid-, não throw).
 */
export async function writeAntigravityMcpConfig(configPath, serverUrl, enabledTools) {
    let config = {};
    if (existsSync(configPath)) {
        const rawConfig = await readFile(configPath, 'utf8');
        let parsed;
        try {
            parsed = rawConfig.trim() ? JSON.parse(rawConfig) : {};
        }
        catch {
            const backupPath = `${configPath}.invalid-${process.pid}-${randomUUID().slice(0, 8)}`;
            await rename(configPath, backupPath);
            parsed = {};
        }
        if (isRecord(parsed))
            config = { ...parsed };
    }
    const currentMcpServers = isRecord(config.mcpServers) ? { ...config.mcpServers } : {};
    const currentOverclock = isRecord(currentMcpServers.overclock) ? { ...currentMcpServers.overclock } : {};
    delete currentOverclock.url;
    delete currentOverclock.type;
    currentMcpServers.overclock = { ...currentOverclock, serverUrl, disabled: false, enabledTools };
    config.mcpServers = currentMcpServers;
    await mkdir(dirname(configPath), { recursive: true });
    await atomicWrite(configPath, `${JSON.stringify(config, null, 2)}\n`);
}
/**
 * Injeta o MCP do Overclock no antigravity: contextFileName no workspace + mcp_config.json
 * nos 4 paths candidatos do home (config/antigravity/antigravity-cli/antigravity-ide).
 * homeBase parametrizado p/ testabilidade (default homedir()). serverUrl =
 * mcpHost.streamableHttpUrl('antigravity', ...). Espelha bootstrap 1694.
 */
/**
 * Registra o servidor MCP do Overclock no Grok CLI via `grok mcp add --scope user`.
 * Idempotente: remove entrada anterior (se existir) antes de re-adicionar com a URL
 * atual (que embute callerPaneId). serverUrl = mcpHost.streamableHttpUrl('grok', ...).
 */
export async function ensureGrokMcpConfig(serverUrl) {
    // Remove stale entry — ignore error (entry may not exist yet)
    try {
        await execFileP('grok', ['mcp', 'remove', 'overclock']);
    }
    catch { /* not present */ }
    // Register fresh entry with current URL (includes callerPaneId)
    await execFileP('grok', ['mcp', 'add', '--transport', 'http', '--scope', 'user', 'overclock', serverUrl]);
}
export async function ensureAntigravityMcpConfig(cwd, serverUrl, enabledTools, homeBase = homedir()) {
    try {
        await ensureAntigravityWorkspaceContext(cwd);
    }
    catch {
        /* segue só com o mcp_config se o context falhar */
    }
    const configPaths = [
        join(homeBase, '.gemini', 'config', 'mcp_config.json'),
        join(homeBase, '.gemini', 'antigravity', 'mcp_config.json'),
        join(homeBase, '.gemini', 'antigravity-cli', 'mcp_config.json'),
        join(homeBase, '.gemini', 'antigravity-ide', 'mcp_config.json'),
    ];
    for (const configPath of configPaths) {
        await writeAntigravityMcpConfig(configPath, serverUrl, enabledTools);
    }
}
//# sourceMappingURL=mcpCliInject.js.map