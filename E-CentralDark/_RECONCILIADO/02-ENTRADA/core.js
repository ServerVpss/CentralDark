/**
 * core.ts — wiring do core do Overclock sob o transporte WS (sidecar Tauri).
 *
 * SLICE FASE 1: pty real (shell) — spawn/write/read/resize/kill/list + eventos
 * pty:output / pty:exit, espelhando os canais que o preload do Electron expõe.
 * `@lydell/node-pty` é N-API → roda sob Node puro sem rebuild.
 *
 * ESCOPO: panes SHELL. Panes de agente (claude/codex/...) dependem do
 * spawnPaneInternal do bootstrap (providers/isolation) e entram quando o
 * createCore compartilhado for extraído. Os handlers de pty aqui são finos e
 * espelham packages/shell/src/main/ipc/registerPtyIpcHandlers.ts; a
 * consolidação DRY num packages/core é follow-up.
 */
import { homedir, release } from 'node:os';
import { readLocalStorageValue } from './chromiumLocalStorage.js';
import { resolveQuery } from './navigateResolver.js';
import { join, isAbsolute, resolve, sep, relative } from 'node:path';
import { existsSync, readFileSync, writeFileSync, mkdirSync, chmodSync, unlinkSync, renameSync, symlinkSync, cpSync, statSync, readdirSync, accessSync, constants as fsConstants, openSync, writeSync, closeSync } from 'node:fs';
import { dirname } from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { startPreviewServer } from './previewServer.js';
import { PtyManager, resolveCommand } from '@overclock-app/pty';
// Namespace import (not named): listBuiltinManifest may not exist in older builds;
// namespace access degrades to undefined → [] instead of hard-crashing module linking.
import * as mcpPkg from '@overclock-app/mcp';
import { ConfigStore, WorkspaceConfigStore, ServiceKeysStore, aesGcmKeystoreCrypto, isKeystoreCiphertext, serviceKeysPublicView, applyServiceKeyPatch, testServiceKey, listServiceModels, getNativeDisabled, setNativeDisabled, resolveModel, computeProviderList, CliDetector, readSquadsFile, writeSquadsFile, buildSquadCallable, makeWidthCap, makeLoopDetector, createMissionStore, normalizeMissionCreateInput, normalizeMissionUpdateInput, filterMissions, isMissionStatus, sanitizeMissionText, sanitizeMissionTitle, SessionManager, detectShells, ClaudeSessionsService, validateClaudeRestorePanes, ProviderSessionsService, SESSION_ADAPTERS, sessionAdapterFor, PROVIDER_TEMPLATES, GLM_TEXT_MODELS, ProviderStore, setProviderCrypto, readClaudeAccountStatus, listModelsFromEndpoint, healthCheckProviderEndpoint, isClaudeAccountProvider, isCodexAccountProvider, resolveCodexOssProvider, codexOssBaseUrl, codexRemoteOpenAiBaseUrl, ensureCodexChatProxy, TodoStore, MCPServerHost, makeBridge, mcpCoreToolNames, mcpDiagnosticToolNames, generateImageWithGemini, generateImageWithOpenAI, generateVideoWithReplicate, generateAudioWithElevenLabs, AudioConfigStore, validateAudioPatch, listRemoteHosts, testRemoteHost, clockVoiceAccessFromProfile, clockVoiceAccessError, PER_ACCOUNT_PROXY_OWNER_EMAIL, transcribeAudioLocally, transcribeAudioWithGroq, resolveLocalWhisperBinary, createDesktopAuthState, buildAuthUrl, exchangeDesktopAuthCode, isDevSidecarInstance, createMultiAccountGuard, addClaudeAccountSafe, addCodexAccountSafe, probeClaudeCliKeychainScoping, spawnIsolatedAgent, 
// Claude orchestrator/worker arg assembly (shared with Electron bootstrap so Tauri
// produces byte-identical args — see TASK/validate-spawn-args-snapshot.mjs).
buildClaudeSpawnArgs, stripManagedPaneArgs, buildSquadPromptBlock, 
// Remote workspace routing (ssh:// URIs) — fixes the Tauri "VPS false-connect" bug
// where buildSpawnConfig built a LOCAL PaneConfig with cwd=ssh://.
parseWorkspaceRef, RemoteSshTmuxManager, shouldBlockSquadPaneSpawn, isRemoteSquadSpawn, wireCallerMapListener, resolveWakeTarget, createCronStore, resolveOverclockHome, migrateElectronLegacyData, 
// F-033: full-cargo rehydration on resume (persisted panes.json entry → spawn input).
rehydratePaneCargo, isJarvisEnabled, isInheritedAccountConfigDir, 
// C-064.4: compiles a 'data' orchestration style's flow.entry role into the spawn flags
// the wizard's hardcoded 1:1:N defaults would otherwise carry for every agentic style.
compileStyleEntrySpawn, } from '@overclock-app/core';
import { writeClaudeSkillGate, writeResourceGate, writeDangerousCommandGate, writeHandoffEnforcementHooks, writeWorkflowDenyGate, ensureSkillsForCli, workspaceAccessInstruction, paneIdNumber, nextPaneId, paneFilesDir } from './spawnHelpers.js';
import { resolvePersistedSquadFlags, buildSpawnInputSquadOverrides, squadSpawnGateError, needsHandoffEnforcement } from './squadPersistFields.js';
import { buildWakeMessage } from './handoffWakeMessage.js';
import { shouldUseBracketedPaste, panePastePayload } from './panePaste.js';
import { detectRemoteClis, listRemoteOrphanSessions, shQuote } from './remoteSpawn.js';
import { wireOnboarding } from './wireOnboarding.js';
import { RemoteBridge } from './remoteBridge.js';
import { ensureGeminiMcpConfig, ensureAntigravityMcpConfig, ensureGrokMcpConfig, codexMcpArgs } from './mcpCliInject.js';
import { JarvisService } from './JarvisService.js';
import { getWorkspaceDb, aggregateTokensByTask, aggregateTokensBySession, aggregateTokensByWorkspace, listActivityLog } from './db.js';
import { ClaudeTranscriptWatcher } from './ClaudeTranscriptWatcher.js';
import { CodexTranscriptWatcher } from './CodexTranscriptWatcher.js';
import { CronTickLoop } from './cronTickLoop.js';
import { promises as fsPromises } from 'node:fs';
import { dirname as pathDirname } from 'node:path';
import { parseAgent, parseHook, parseMcp, parsePlugin, parseRule, parseSkill, parseSquad, parseTool, identityKey as catalogIdentityKey, } from '@overclock-app/catalog';
import { getGlobalDb, ensureCatalogSchema, ensureOverlaySchema, listCatalogItems, catalogList, removeCatalogItem, removeMissingCatalogItems, scanCatalog, setCatalogItemDisabled, listUncategorized, listAllForCatalog, catalogStateCounts, upsertOverlay, listCategorizedForSynthesis, replaceStacks, listStacks, getStack, getOverlayMap, } from './catalogStore.js';
import { promises as fsp } from 'node:fs';
import { basename } from 'node:path';
import { writeAgentSpec } from './agentSpecWriter.js';
import { clarifyBroadcastPayload } from './clarifyBroadcast.js';
const APP_VERSION = process.env['OVERCLOCK_VERSION'] ?? '0.8.0';
const CATALOG_CATEGORIZER_VERSION = 1;
const CATALOG_SYNTHESIZER_VERSION = 1;
const WEB_BASE = process.env['OCSWARM_WEB_BASE'] ?? 'https://overclock.sh';
// Supabase auth (publishable anon key — safe to embed). Mirrors packages/shell/src/main/auth.ts.
// The Tauri sidecar reads the access token from session.json but the Electron-era auto-refresh was
// never ported here, so the ~1h Supabase access token would expire and force a re-login (ClockVoice
// gate flips even on Boost Pro). This refresh closes that gap: login once, the refresh_token keeps
// the access token alive. NEVER log token values.
const SUPABASE_URL = 'https://ncdtxsykyretslaimiow.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_v3cWJ5wnlLAEb2Kgth12vg_X8lODxso';
/**
 * Pure decision: should the stored session be refreshed BEFORE it is used?
 * True when an expiry is known and is in the past, or within `skewMs` of now
 * (default 60s) so a token that is about to die is renewed proactively. A null
 * expiresAt means "unknown" — we do not force a refresh on it (the verify path
 * still reacts to a 401). Exported for unit testing without network/fs.
 */
export function shouldRefreshSession(expiresAt, now, skewMs = 60_000) {
    if (expiresAt === null)
        return false;
    return now > expiresAt - skewMs;
}
/** Exchange a Supabase refresh_token for a fresh access token. Returns null on any failure. */
async function refreshSupabaseToken(refreshToken) {
    try {
        const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
            body: JSON.stringify({ refresh_token: refreshToken }),
            signal: AbortSignal.timeout(8000),
        });
        if (!res.ok)
            return null;
        const d = await res.json();
        if (typeof d.access_token !== 'string' || typeof d.refresh_token !== 'string')
            return null;
        const expiresIn = typeof d.expires_in === 'number' ? d.expires_in : 3600;
        return { accessToken: d.access_token, refreshToken: d.refresh_token, expiresAt: Date.now() + expiresIn * 1000 };
    }
    catch {
        return null;
    }
}
// Per-pane file name prefixes written into panesDir (per-instance paneFilesDir — F-067) while a
// pane is alive: the MCP config plus the
// gate/hook/marker files (see spawnHelpers.ts writeClaudeSkillGate/writeResourceGate/
// writeHandoffEnforcementHooks). Used by the boot cleanup to remove ORPHANED files for ANY paneId
// on sidecar restart (all prior pane processes are dead). mcp-pane carries a .json suffix; the
// rest are matched by prefix.
const ORPHAN_PANE_FILE_PREFIXES = [
    'skill-gate-',
    'resource-gate-',
    'handoff-marker-',
    'handoff-stopcount-',
    'handoff-post-',
    'handoff-stop-',
    'clarify-marker-',
    'skill-loaded-',
];
// Remove EVERY per-pane artifact for a known paneId: the mcp-pane json + all gate/hook/marker files
// (verified against spawnHelpers.ts). Called on intentional close and on spawn failure (where the
// files were written before the process existed and closePane never runs). Each unlink is
// best-effort — a missing file is the normal case for panes that were never gated.
async function cleanupPaneFiles(panesDir, paneId) {
    const exact = [
        `mcp-pane-${paneId}.json`,
        `skill-gate-${paneId}.mjs`,
        `resource-gate-${paneId}.mjs`,
        `handoff-marker-${paneId}`,
        `handoff-stopcount-${paneId}`,
        `handoff-post-${paneId}.mjs`,
        `handoff-stop-${paneId}.mjs`,
        `clarify-marker-${paneId}`,
    ];
    await Promise.all(exact.map((f) => fsp.unlink(join(panesDir, f)).catch(() => { })));
    // skill-loaded-<id>-<skill> markers carry a variable per-skill suffix → match by prefix in one
    // readdir pass. The trailing '-' keeps paneId 'x' from matching paneId 'x2' markers.
    const markerPrefix = `skill-loaded-${paneId}-`;
    try {
        const files = await fsp.readdir(panesDir);
        await Promise.all(files.filter((f) => f.startsWith(markerPrefix)).map((f) => fsp.unlink(join(panesDir, f)).catch(() => { })));
    }
    catch {
        /* best-effort */
    }
}
// Abre URL externa via comando do SO (strangler — paridade real = tauri-plugin-opener no
// renderer, follow-up). Fire-and-forget, detached/unref.
function openExternalUrl(url) {
    try {
        const child = process.platform === 'darwin'
            ? spawn('open', [url], { detached: true, stdio: 'ignore' })
            : process.platform === 'win32'
                ? spawn('rundll32', ['url.dll,FileProtocolHandler', url], { detached: true, stdio: 'ignore' })
                : spawn('xdg-open', [url], { detached: true, stdio: 'ignore' });
        child.unref();
    }
    catch { /* best-effort */ }
}
// Guard de path-traversal: resolve relPath DENTRO do workspace root; rejeita escape (..).
// Single-window Tauri: confia no workspacePath passado pelo renderer (cliente único). Per-window
// access-control completo (workspaceForSender) = Fase 2 (multi-window/panes).
function resolveInWorkspace(workspacePath, relPath) {
    const root = resolve(workspacePath);
    const target = resolve(root, relPath || '.');
    if (target !== root && !target.startsWith(root + sep))
        return null;
    return { root, target };
}
// RSS/CPU por pid via ps (macOS/Linux; win32 = vazio). Port de bootstrap; o ~370MB/agente vive
// nos filhos CLI do pty, medidos por pid.
async function rssCpuForPids(pids) {
    const out = new Map();
    const valid = [...new Set(pids.filter((n) => Number.isInteger(n) && n > 1))];
    if (valid.length === 0 || process.platform === 'win32')
        return out;
    try {
        const { execFile } = await import('node:child_process');
        const { promisify } = await import('node:util');
        const { stdout } = await promisify(execFile)('ps', ['-o', 'pid=,rss=,pcpu=', '-p', valid.join(',')], { timeout: 3000, maxBuffer: 256000 });
        for (const line of String(stdout).trim().split('\n')) {
            const m = line.trim().match(/^(\d+)\s+(\d+)\s+([\d.]+)/);
            if (m)
                out.set(Number(m[1]), { rssMB: Math.round(Number(m[2]) / 1024), cpu: Number(m[3]) });
        }
    }
    catch { /* best-effort */ }
    return out;
}
// claude:summary — extrai o 1º texto de usuário do transcript jsonl do Claude Code
// (~/.claude/projects/<slug>/<sessionId>.jsonl). Fs puro, read-only; espelha
// registerSupportIpcHandlers.ts (adoção compartilhada via core = follow-up).
function firstTextFromMessageContent(content) {
    if (typeof content === 'string')
        return content;
    if (!Array.isArray(content))
        return null;
    for (const part of content) {
        if (part && typeof part === 'object' && part.type === 'text') {
            const text = part.text;
            if (typeof text === 'string')
                return text;
        }
    }
    return null;
}
async function readClaudeSummary(sessionId) {
    if (!sessionId)
        return null;
    try {
        const projectsDir = join(homedir(), '.claude', 'projects');
        const { readdir, readFile: rf } = await import('node:fs/promises');
        const slugs = await readdir(projectsDir).catch(() => []);
        for (const slug of slugs) {
            const file = join(projectsDir, slug, `${sessionId}.jsonl`);
            const data = await rf(file, 'utf-8').catch(() => null);
            if (!data)
                continue;
            for (const line of data.split('\n')) {
                if (!line.trim())
                    continue;
                let obj;
                try {
                    obj = JSON.parse(line);
                }
                catch {
                    continue;
                }
                if (obj.type !== 'user')
                    continue;
                const msg = obj.message;
                if (!msg)
                    continue;
                const text = firstTextFromMessageContent(msg.content);
                if (text && text.trim().length > 0 && !text.startsWith('<')) {
                    return text.trim().replace(/\s+/g, ' ').slice(0, 100);
                }
            }
        }
        return null;
    }
    catch {
        return null;
    }
}
function normalizeProviderToken(value) {
    return value.trim().replace(/^authorization:\s*bearer\s+/i, '').replace(/^bearer\s+/i, '').replace(/^["']|["']$/g, '').trim();
}
function normalizeProviderBaseUrl(value) {
    return value.trim().replace(/\/+$/, '');
}
function localPlaceholderToken(args) {
    if (args.authMode !== 'none')
        return normalizeProviderToken(args.token ?? '');
    return args.baseUrl.toLowerCase().includes('1234') ? 'lm-studio' : 'ollama';
}
function isFireworksBaseUrl(baseUrl) {
    return baseUrl.toLowerCase().includes('api.fireworks.ai');
}
function defaultAnthropicProbeModel(baseUrl) {
    const lower = baseUrl.toLowerCase();
    if (lower.includes('xiaomimimo.com'))
        return 'mimo-v2.5-pro';
    if (lower.includes('api.moonshot.ai'))
        return 'kimi-k2.6';
    if (lower.includes('api.z.ai'))
        return GLM_TEXT_MODELS[0] ?? 'glm-5.1';
    if (lower.includes('api.fireworks.ai'))
        return 'accounts/fireworks/models/kimi-k2p6';
    return 'claude-haiku-4-5';
}
function defaultOpenAIProbeModel(baseUrl) {
    return isFireworksBaseUrl(baseUrl) ? 'accounts/fireworks/models/kimi-k2p6' : 'gpt-4o-mini';
}
function providerProbeHeaders(args, contentType = false) {
    const token = localPlaceholderToken(args);
    const headers = {};
    if (contentType)
        headers['content-type'] = 'application/json';
    if (args.baseUrl.toLowerCase().includes('openrouter.ai')) {
        headers['HTTP-Referer'] = 'https://overclock.sh';
        headers['X-OpenRouter-Title'] = 'Overclock';
    }
    if (args.type === 'anthropic-compat') {
        headers['x-api-key'] = token;
        headers['authorization'] = `Bearer ${token}`;
        headers['anthropic-version'] = '2023-06-01';
    }
    else if (args.type === 'openai-compat') {
        headers['authorization'] = `Bearer ${token}`;
    }
    return headers;
}
async function testProviderToken(args) {
    const { type, model } = args;
    const baseUrl = normalizeProviderBaseUrl(args.baseUrl);
    const token = localPlaceholderToken(args);
    if (!baseUrl)
        return { ok: false, reason: 'base_url_required' };
    if (args.authMode === 'none')
        return healthCheckProviderEndpoint(args);
    if (!token || token.trim().length < 8)
        return { ok: false, reason: 'token_too_short' };
    try {
        let url;
        let headers;
        let body;
        if (type === 'anthropic-compat') {
            const probeModel = model?.trim() || defaultAnthropicProbeModel(baseUrl);
            url = `${baseUrl}/v1/messages`;
            headers = providerProbeHeaders(args, true);
            body = JSON.stringify({ model: probeModel, max_tokens: 1, messages: [{ role: 'user', content: 'hi' }] });
        }
        else if (type === 'openai-compat') {
            if (isFireworksBaseUrl(baseUrl)) {
                const probeModel = model?.trim() || defaultOpenAIProbeModel(baseUrl);
                url = `${baseUrl}/responses`;
                headers = providerProbeHeaders(args, true);
                body = JSON.stringify({ model: probeModel, input: 'hi', max_output_tokens: 1 });
            }
            else {
                url = `${baseUrl}/models`;
                headers = providerProbeHeaders(args);
            }
        }
        else {
            return { ok: false, reason: 'unsupported_type' };
        }
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 8000);
        const res = await fetch(url, { method: body ? 'POST' : 'GET', headers, body, signal: ctrl.signal });
        clearTimeout(timer);
        if (res.ok || res.status === 200)
            return { ok: true, status: res.status };
        const errBody = await res.text().catch(() => '');
        const isMimo = baseUrl.includes('xiaomimimo.com');
        const isDeepSeek = baseUrl.includes('api.deepseek.com');
        const isFireworks = isFireworksBaseUrl(baseUrl);
        const reason = res.status === 401 || res.status === 403 ? 'auth_failed' : 'api_error';
        let hint;
        if (isMimo && (res.status === 401 || res.status === 403))
            hint = 'MIMO requer "Dedicated API Key". Confira se a key é Dedicated e se o cluster selecionado é o mesmo da conta: SGP, CN ou AMS.';
        else if (isMimo && res.status === 400)
            hint = 'MIMO recusou o payload. Confira se a rota SGP/CN/AMS bate com a Token Plan/Dedicated key e se o modelo selecionado existe nesse plano.';
        else if (isDeepSeek && (res.status === 401 || res.status === 403))
            hint = 'DeepSeek recusou a credencial. Use uma API key gerada em platform.deepseek.com, cole só o valor da key sem "Bearer", e confira se a conta/API está ativa.';
        else if (isFireworks && (res.status === 401 || res.status === 403))
            hint = 'Fireworks recusou a credencial. Use uma API key da Fireworks e confira se a conta tem acesso ao modelo selecionado.';
        else if (isFireworks && res.status === 400)
            hint = 'Fireworks recusou o payload. Confira se o modelo selecionado existe na conta e se a rota OpenAI usa /inference/v1.';
        return { ok: false, status: res.status, reason, hint, body: errBody.slice(0, 200) };
    }
    catch (err) {
        return { ok: false, reason: 'network_error', hint: err instanceof Error ? err.message : String(err) };
    }
}
// permissionMode → flags de CLI (claude --permission-mode/--dangerously-skip-permissions;
// codex --sandbox + --ask-for-approval). Port de applyPermissionFlags/CODEX_PERMISSION_MODE_FLAGS
// do bootstrap. (isOpenCodeProvider edge + provider.defaultPermissionMode = follow-up.)
const CODEX_PERM_FLAGS = {
    default: ['workspace-write', 'untrusted'],
    auto: ['workspace-write', 'on-request'],
    plan: ['read-only', 'untrusted'],
    bypassPermissions: ['danger-full-access', 'never'],
};
function resolveSpawnPermissionMode(mode, agent) {
    if (mode)
        return mode;
    if (agent === 'claude')
        return 'bypassPermissions';
    if (agent === 'codex')
        return 'auto';
    return 'default';
}
function applyPermissionArgs(agent, args, mode) {
    if (agent === 'claude' && !args.includes('--permission-mode') && !args.includes('--dangerously-skip-permissions')) {
        if (mode === 'bypassPermissions')
            args.push('--dangerously-skip-permissions');
        else
            args.push('--permission-mode', mode);
        return;
    }
    if (agent === 'grok') {
        if (args.includes('--always-approve') || args.includes('--permission-mode'))
            return;
        if (mode === 'bypassPermissions')
            args.push('--always-approve');
        else
            args.push('--permission-mode', mode);
        return;
    }
    if (agent !== 'codex')
        return;
    if (args.includes('--sandbox') || args.includes('--ask-for-approval'))
        return;
    const flags = CODEX_PERM_FLAGS[mode];
    if (flags)
        args.push('--sandbox', flags[0], '--ask-for-approval', flags[1]);
}
function missionStatusToMcp(status) {
    if (status === 'blocked')
        return 'blocked';
    if (status === 'archived')
        return 'archived';
    if (status === 'ready_to_integrate')
        return 'done';
    return 'in_progress';
}
function missionStatusFromMcp(status) {
    if (status === 'blocked')
        return 'blocked';
    if (status === 'archived')
        return 'archived';
    if (status === 'done')
        return 'ready_to_integrate';
    if (status === 'in_progress')
        return 'running';
    if (status === 'draft')
        return 'active';
    return undefined;
}
function missionToMcpRecord(m) {
    return {
        id: m.id,
        // F-058: surface the owning workspace so clients can scope mission lists.
        workspaceId: m.workspaceId,
        title: m.title,
        description: m.objective,
        status: missionStatusToMcp(m.status),
        worktreePath: m.worktreePath,
        // Surface the squad link so a client can track which mission a headless squad runs under
        // (overclock_squad_spawn sets it; the MCP record previously omitted it).
        ...(m.squadId ? { squadId: m.squadId } : {}),
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
    };
}
class DiagnosticsRing {
    capacity = 500;
    events = [];
    seq = 0;
    record(e) {
        this.events.push({ ...e, id: (this.seq += 1), ts: Date.now() });
        if (this.events.length > this.capacity)
            this.events.shift();
    }
    list(req = {}) {
        let out = this.events;
        if (!req.includeInternal)
            out = out.filter((e) => !e.internal);
        if (req.level)
            out = out.filter((e) => e.level === req.level);
        if (req.source)
            out = out.filter((e) => e.source === req.source);
        const limit = req.limit && req.limit > 0 ? req.limit : out.length;
        return out.slice(-limit);
    }
}
let paneSeq = 0;
export function wireCore(host, opts) {
    const pty = new PtyManager();
    const configs = new Map();
    // MCP host (sidecar): roda o mesmo MCPServerHost do Electron, montando um bridge
    // com as capacidades reais do PtyManager/stores. Os agentes (claude) recebem o
    // mcp-config via --mcp-config no spawn. Setup no fim do wireCore (após handlers).
    const todoStore = new TodoStore();
    const diagnostics = new DiagnosticsRing();
    // Multi-account guard (INV-3/INV-5/INV-6): estado em memória por processo. onAlert →
    // broadcast WS (canal providers:multi-account-alert), substituindo o safeSend do Electron.
    const multiAccountGuard = createMultiAccountGuard({ onAlert: (ch, p) => host.broadcast.send(ch, p) });
    let activeWorkspace = process.cwd();
    let mcpConfigPath = null;
    let mcpHost = null;
    let remoteBridge = null;
    // diagnosticsEnabled flag for buildClaudeSpawnArgs (the host's isLocalDiagnosticsEnabled
    // equivalent). The sidecar has no isDev concept; its MCP host ADVERTISES core + diagnostic
    // tools unconditionally (see `mcpHost = new MCPServerHost(... isDiagnosticsEnabled=true)`
    // below), so the Claude --allowedTools / gate must include the 6 app_* tools to match what
    // the session can actually call. Default true; OVERCLOCK_SIDECAR_DIAGNOSTICS=0 to mirror
    // Electron production (diagnostics off) for parity testing. This is a DELIBERATE divergence
    // from Electron prod and is asserted by TASK/validate-sidecar-spawn-symmetry.mjs.
    const sidecarDiagnosticsEnabled = process.env['OVERCLOCK_SIDECAR_DIAGNOSTICS'] !== '0';
    // PTY full-session log (dev only). Set OVERCLOCK_PTY_LOG=1 in the dev runner.
    // Every raw byte from every pane is appended to ~/.overclock-app/pty-logs/<paneId>.log
    // so post-run decision auditing can replay the full tool-call / reasoning / gate trace.
    // NEVER active in prod — logs contain user prompts and tool outputs.
    const ptyLogGate = process.env['OVERCLOCK_PTY_LOG'] === '1';
    const ptyLogDir = join(homedir(), '.overclock-app', 'pty-logs');
    // per-pane open file descriptors; opened on first data, closed on pane exit
    const ptyLogFds = new Map();
    // Eventos do PtyManager → renderer, nos MESMOS canais do preload Electron.
    // F-017: coalesce per-pane PTY output before the WS broadcast. A repainting TUI
    // (Claude spinner/diff) emits hundreds of tiny chunks/sec; one JSON.stringify+ws.send
    // per chunk (WsHost.broadcast) across N streaming panes monopolizes the single Node
    // event loop and head-of-line-blocks a NEW pane's pty:spawn invoke AND its first
    // pty:output — the chunk that lifts the renderer's "Starting" overlay — behind the
    // flood, stretching boot to 5-15s (F-017). Batching collapses a repaint burst into ONE
    // message per pane per frame (~16ms) with zero visual cost (sub-frame: the renderer
    // can't paint faster than a frame anyway), draining the loop so the new pane gets in.
    const OUTPUT_FLUSH_MS = 16;
    const f017Debug = process.env['OVERCLOCK_F017_DEBUG'] === '1';
    let f017Chunks = 0;
    let f017Bytes = 0;
    const pendingOutput = new Map();
    let outputFlushScheduled = false;
    const flushOutput = () => {
        outputFlushScheduled = false;
        if (pendingOutput.size === 0)
            return;
        // Per-pane concat preserves byte order within a pane; cross-pane order is irrelevant.
        for (const [paneId, data] of pendingOutput)
            host.broadcast.send('pty:output', paneId, data);
        pendingOutput.clear();
    };
    // Drain ONE pane's pending bytes immediately — used before its exit event so output
    // never lands after the exit (would reorder/lose the pane's last frame).
    const flushPane = (paneId) => {
        const pending = pendingOutput.get(paneId);
        if (pending == null)
            return;
        pendingOutput.delete(paneId);
        host.broadcast.send('pty:output', paneId, pending);
    };
    const onData = (e) => {
        if (e.data == null)
            return;
        if (f017Debug) {
            f017Chunks += 1;
            f017Bytes += e.data.length;
        }
        noteWorkerActivity(e.paneId); // F-N04: output = liveness; resets the stall watchdog for this worker
        const prev = pendingOutput.get(e.paneId);
        pendingOutput.set(e.paneId, prev != null ? prev + e.data : e.data);
        if (!outputFlushScheduled) {
            outputFlushScheduled = true;
            setTimeout(flushOutput, OUTPUT_FLUSH_MS);
        }
        // remoteBridge mirror stays per-chunk — remote SSH panes mirror the raw stream.
        remoteBridge?.onPtyData(e.paneId, e.data);
        // Mode-A preview: scan mission pane output for a dev-server URL.
        const _pmId = configs.get(e.paneId)?.missionId;
        if (_pmId && !missionPreviewUrls.has(_pmId)) {
            const _buf = ((previewUrlBuf.get(e.paneId) ?? '') + e.data).slice(-2048);
            previewUrlBuf.set(e.paneId, _buf);
            const _m = DEV_SERVER_URL_RE.exec(_buf);
            if (_m)
                missionPreviewUrls.set(_pmId, _m[0]);
        }
        // Dev PTY log — full byte stream per pane for post-run decision auditing.
        if (ptyLogGate) {
            try {
                let fd = ptyLogFds.get(e.paneId);
                if (fd == null) {
                    mkdirSync(ptyLogDir, { recursive: true });
                    const logPath = join(ptyLogDir, `${e.paneId}.log`);
                    fd = openSync(logPath, 'a');
                    const ws = configs.get(e.paneId)?.workspacePath ?? '';
                    // Claude Code JSONL dir: workspace path with '/' → '-' (leading slash → leading '-')
                    const wsHash = ws.replace(/\//g, '-');
                    const header = `\n=== PTY LOG pane=${e.paneId} ws=${ws}\n=== JSONL: ~/.claude/projects/${wsHash}/\n\n`;
                    writeSync(fd, header);
                    ptyLogFds.set(e.paneId, fd);
                }
                writeSync(fd, e.data);
            }
            catch { /* best-effort — never throw into the PTY data path */ }
        }
    };
    // Push fresh pane/mission snapshots to phone clients on host lifecycle events (spawn/exit/status).
    // Without this the bridge defined broadcastPanes()/broadcastMissions() but nothing ever called
    // them, so the phone's pane list/status was a frozen one-shot from connect time. The bridge
    // re-reads live state via its listPanes/readMissions deps, so a plain call after the change is
    // enough. No-op until the bridge is started (remoteBridge assigned later; closure reads it lazily).
    const pushRemoteState = () => {
        remoteBridge?.broadcastPanes();
        void remoteBridge?.broadcastMissions().catch(() => { });
    };
    // F-070: panes the caller closed on purpose via pane_close (bridge closePane marks BEFORE the
    // SIGTERM). Their exit must NOT fire the death wake — the caller asked for it; the closure is
    // recorded silently in the registry as 'closed_by_caller'. Unsolicited deaths keep alarming.
    const intentionallyClosedPanes = new Set();
    const onExit = (e) => {
        flushPane(e.paneId); // last bytes before the exit event — preserve output→exit order
        // A signal-kill (e.g. SIGTERM) yields exitCode 0 + signal=15 from node-pty (exitCode is a
        // NON-nullable number), so a `e.exitCode ?? (128+signum)` never reaches the signum branch —
        // `0 ?? x === 0` — and a KILLED worker reads as a clean success the orchestrator never flags.
        // Gate on the SIGNAL FIRST: when present, POSIX-encode it as 128+signum (SIGTERM 15 → 143) so
        // the exit code itself carries the reason. `signal` arrives as a stringified number (PtyManager:
        // String(signal)); named internal sentinels (SIGKILL_TIMEOUT) parse to NaN and fall through to
        // the real exitCode (those finalize with exitCode=1).
        const sigNum = e.signal != null ? Number(e.signal) : Number.NaN;
        const code = e.signal != null && Number.isFinite(sigNum) ? 128 + sigNum : (e.exitCode ?? 0);
        host.broadcast.send('pty:exit', e.paneId, code);
        previewUrlBuf.delete(e.paneId);
        workerAgentNames.delete(e.paneId);
        diagnostics.record({ level: 'info', source: 'pane', name: 'pane.exit', paneId: e.paneId, data: { exitCode: code, signal: e.signal ?? null } });
        // Wake event-driven dos orquestradores: handoff_wait acorda quando o worker morre.
        // F-070: morte SOLICITADA (pane_close) registra silencioso — sem wake, sem alarme.
        if (intentionallyClosedPanes.delete(e.paneId)) {
            mcpHost?.handoffRegistry.submitPaneClosedByCaller(e.paneId, code);
        }
        else {
            mcpHost?.handoffRegistry.submitWorkerExited(e.paneId, code);
        }
        forgetWorkerActivity(e.paneId); // F-N04: pane gone → drop its liveness tracking
        if (ptyLogGate && ptyLogFds.has(e.paneId)) {
            try {
                closeSync(ptyLogFds.get(e.paneId));
            }
            catch { }
            ptyLogFds.delete(e.paneId);
        }
        pushRemoteState(); // pane gone → refresh the phone's pane list
    };
    if (f017Debug) {
        setInterval(() => {
            if (f017Chunks > 0)
                process.stderr.write(`[SC][F017] ${f017Chunks} chunks / ${f017Bytes}B in 1s (all panes)\n`);
            f017Chunks = 0;
            f017Bytes = 0;
        }, 1000).unref?.();
    }
    pty.on('data', onData);
    pty.on('exit', onExit);
    // Remote SSH panes (ssh:// workspaces) — same manager Electron uses, now in @overclock-app/core.
    // Emits on the SAME pty:output/pty:exit channels so the renderer treats remote panes identically.
    // Fixes the Tauri "VPS false-connect": before this, pty:spawn built a LOCAL PaneConfig with
    // cwd=ssh:// and the PtyManager cwd guard skipped url-scheme cwds, so a bogus local spawn
    // returned {ok:true}. Now ssh:// routes here and spawns a real `ssh -tt` child.
    const remotePty = new RemoteSshTmuxManager();
    remotePty.on('data', onData);
    remotePty.on('exit', onExit);
    const remotePaneIds = new Set();
    // ── Squad handoff delivery (worker → orchestrator wake) ─────────────────────
    // Port of the Electron bootstrap mechanism (bootstrapMainProcess.ts ~2737-2747 + ~5127-5180
    // + pokeOrchestrator ~5410). Without it the Tauri sidecar recorded a worker's handoff/exit in
    // the registry but NEVER woke the orchestrator pane — so a squad dispatched a worker and then
    // hung forever (the orchestrator ends its turn after invoking and is resumed ONLY by this poke).
    const workerToCaller = new Map();
    const callerInvokedWorkers = new Map();
    const workerAgentNames = new Map(); // workerId → agentName (guard-b dedup key)
    const pendingWorkers = new Map();
    const pendingMarkerPath = (caller) => join(panesDir, 'handoff-pending-' + caller);
    const markWorkerPending = (worker, caller) => {
        const set = pendingWorkers.get(caller) ?? new Set();
        set.add(worker);
        pendingWorkers.set(caller, set);
        try {
            writeFileSync(pendingMarkerPath(caller), String(set.size));
        }
        catch { }
    };
    const clearWorkerPending = (worker, caller) => {
        const set = pendingWorkers.get(caller);
        if (!set)
            return;
        set.delete(worker);
        if (set.size === 0) {
            pendingWorkers.delete(caller);
            try {
                unlinkSync(pendingMarkerPath(caller));
            }
            catch { }
        }
        else {
            try {
                writeFileSync(pendingMarkerPath(caller), String(set.size));
            }
            catch { }
        }
    };
    // ── Worker liveness / stall watchdog (F-N04) ────────────────────────────────
    // submitWorkerExited fires only on a PTY *exit*. A worker that HANGS — process alive, no output,
    // never exits — therefore never wakes the orchestrator, which ends its turn after dispatch and is
    // resumed ONLY by a poke. So a hung worker stalls the whole mission silently. This watchdog tracks
    // last-output time per pending worker and, once one goes mute past WORKER_STALL_THRESHOLD_MS while
    // still alive, pokes the orchestrator with a STALL reason (distinct from a clean exit) via the same
    // handoff submit→wake path. Skeleton is deliberately reusable: phase-2 debug-mode instrumentation
    // can extend checkWorkerStalls / tune the threshold without reworking the wake wiring.
    // Threshold set well above any legit silent tool call (docker/npm install, a long test suite,
    // cold first-byte, quiet reasoning) so a healthy quiet worker is not flagged. Even on a false
    // positive the wake is a SOFT 'stalled' probe (non-terminal), never a kill/re-invoke.
    const WORKER_STALL_THRESHOLD_MS = 600_000;
    const WORKER_STALL_SCAN_MS = 30_000;
    const lastWorkerActivity = new Map();
    const stalledWorkers = new Set(); // poked once per stall; re-armed when output resumes
    const noteWorkerActivity = (paneId) => {
        if (!workerToCaller.has(paneId))
            return;
        lastWorkerActivity.set(paneId, Date.now());
        stalledWorkers.delete(paneId); // fresh output → not hung anymore; re-arm the detector
    };
    const forgetWorkerActivity = (paneId) => {
        lastWorkerActivity.delete(paneId);
        stalledWorkers.delete(paneId);
    };
    const checkWorkerStalls = (now = Date.now()) => {
        for (const [worker, caller] of workerToCaller) {
            if (worker === caller)
                continue; // self-loop, not a dispatched worker
            if (stalledWorkers.has(worker))
                continue; // already poked, awaiting resume or exit
            if (!pty.hasPane(worker))
                continue; // dead → submitWorkerExited owns the wake
            const last = lastWorkerActivity.get(worker);
            if (last == null) {
                lastWorkerActivity.set(worker, now);
                continue;
            } // seed on first sighting
            if (now - last < WORKER_STALL_THRESHOLD_MS)
                continue;
            stalledWorkers.add(worker);
            mcpHost?.handoffRegistry.submitWorkerStalled(worker, now - last);
        }
    };
    const workerStallTimer = setInterval(() => checkWorkerStalls(), WORKER_STALL_SCAN_MS);
    workerStallTimer.unref?.();
    const widthCap = makeWidthCap(5);
    const loopDetect = makeLoopDetector();
    const squadWorkerPanes = new Set();
    const autoClosePanes = new Set();
    const previewUrlBuf = new Map(); // paneId → rolling 2KB tail for dev-server URL detection
    const missionPreviewUrls = new Map(); // missionId → captured dev-server URL (Mode A)
    const openedPreviews = new Map(); // missionId → preview server handle (dedup + cleanup)
    const DEV_SERVER_URL_RE = /https?:\/\/(localhost|127\.0\.0\.1):\d{4,5}/;
    const browserPanes = new Map();
    const openBrowserPane = (url, missionId, workspacePath) => {
        // Dedup: reuse existing pane for same (url, missionId) — never stack duplicates.
        for (const entry of browserPanes.values()) {
            if (entry.url === url && entry.missionId === missionId) {
                host.broadcast.send('pane:focus', { paneId: entry.paneId });
                return { paneId: entry.paneId, url: entry.url };
            }
        }
        const paneId = allocatePaneId();
        browserPanes.set(paneId, { paneId, url, missionId, workspacePath, createdAt: Date.now() });
        host.broadcast.send('pane:added', { kind: 'browser', paneId, url, missionId, workspacePath, activate: true });
        return { paneId, url };
    };
    const tryOpenMissionPreview = async (missionId, capturedUrl, workspacePath) => {
        if (openedPreviews.has(missionId))
            return;
        const writePreviewMarker = (url, mode) => {
            try {
                const dir = join(workspacePath, '.overclock-app');
                mkdirSync(dir, { recursive: true });
                writeFileSync(join(dir, 'preview-opened.json'), JSON.stringify({ missionId, url, mode, ts: Date.now() }));
            }
            catch { /* best-effort */ }
            process.stderr.write(`[preview-open] FIRED mission=${missionId} url=${url}\n`);
        };
        if (capturedUrl) {
            openedPreviews.set(missionId, { close: () => { } });
            openBrowserPane(capturedUrl, missionId, workspacePath);
            writePreviewMarker(capturedUrl, 'A');
            return;
        }
        if (!workspacePath || !existsSync(join(workspacePath, 'index.html')))
            return;
        try {
            const { port, close } = await startPreviewServer(workspacePath);
            openedPreviews.set(missionId, { close });
            // Auto-close the static server after 30 min to avoid leaked handles.
            setTimeout(() => { openedPreviews.get(missionId)?.close(); openedPreviews.delete(missionId); }, 30 * 60_000);
            const staticUrl = `http://127.0.0.1:${port}`;
            openBrowserPane(staticUrl, missionId, workspacePath);
            writePreviewMarker(staticUrl, 'B');
        }
        catch { /* static server failed to start — silent */ }
    };
    const recordInvokedWorker = (workerPaneId, callerPaneId, opts) => {
        workerToCaller.set(workerPaneId, callerPaneId);
        const set = callerInvokedWorkers.get(callerPaneId) ?? new Set();
        set.add(workerPaneId);
        callerInvokedWorkers.set(callerPaneId, set);
        markWorkerPending(workerPaneId, callerPaneId);
        // squadWorkerPanes drives the 30s auto-close on a clean done (attachHandoffDelivery). Only
        // agent_invoke workers are throwaway; a visible pane_spawn worker must stay open after handoff,
        // so it registers the wake mapping but opts OUT of auto-close.
        if (opts?.throwaway !== false)
            squadWorkerPanes.add(workerPaneId);
        if (opts?.autoClose)
            autoClosePanes.add(workerPaneId);
    };
    // Collapse worker-controlled content to ONE safe PTY input line — no CR/LF/C0/C1/DEL that would
    // submit early or corrupt the orchestrator's input line.
    const sanitizeInline = (s) => s.replace(/[\u0000-\u001f\u007f-\u009f]/g, ' ').replace(/\s+/g, ' ').trim();
    // Serialized per-caller wake: type the finished worker's result into the orchestrator input + Enter.
    // Chained per caller so two concurrent worker completions can't garble one input line.
    const orchestratorPokeChains = new Map();
    const pokeOrchestrator = (caller, msg) => {
        const prev = orchestratorPokeChains.get(caller) ?? Promise.resolve();
        const next = prev.then(async () => {
            if (!pty.hasPane(caller))
                return;
            pty.write(caller, msg);
            // A long result line needs the TUI to finish ingesting/rendering before Enter, or the
            // \r races the render and is swallowed (symptom: result lands in the input but the
            // orchestrator doesn't resume until the user presses Enter manually). Settle, submit,
            // then a SECOND Enter in case the first was eaten mid-render.
            await new Promise((r) => setTimeout(r, 800));
            if (!pty.hasPane(caller))
                return;
            pty.write(caller, '\r');
            await new Promise((r) => setTimeout(r, 400));
            if (!pty.hasPane(caller))
                return;
            pty.write(caller, '\r');
            await new Promise((r) => setTimeout(r, 350));
        }).catch(() => { });
        orchestratorPokeChains.set(caller, next);
        void next.finally(() => { if (orchestratorPokeChains.get(caller) === next)
            orchestratorPokeChains.delete(caller); });
    };
    // C-064.4: an entry pane bound to a style whose missionClose is 'handoff' (e.g. scout-dispatch's
    // persistent orquestrador) closes the mission ONLY by explicit human/handoff decision — NEVER by
    // the pty-exit/handoff-done auto-close below (the 1:1:N piloto's pty-exit path stays untouched;
    // spec docs/superpowers/specs/2026-07-03-estilos-orquestracao-agentico-formato.md §3).
    const missionClosesByHandoff = (cfg) => mcpPkg.getStyle(cfg?.styleId ?? '')?.missionClose === 'handoff';
    const attachHandoffDelivery = () => {
        if (!mcpHost)
            return;
        // Broadcast pane status for every submit, regardless of workerToCaller wiring.
        // Registered first to match the original single-listener order.
        mcpHost.handoffRegistry.on('submit', (entry) => {
            // F-070: closed_by_caller = pane intentionally killed and already gone from the grid —
            // broadcasting the fallthrough 'error' chip would flash a false red alarm for a
            // requested close. Skip the status chip entirely; the remote state push below suffices.
            if (entry.status === 'closed_by_caller') {
                pushRemoteState();
                return;
            }
            // awaiting_clarification, stalled and progress (F-131) are non-terminal — keep the chip
            // 'running' so the renderer does not colour the pane as failed (worker still alive/working).
            // done→'done', everything terminal→'error'.
            const chipStatus = entry.status === 'done' ? 'done'
                : entry.status === 'awaiting_clarification' || entry.status === 'stalled' || entry.status === 'progress' ? 'running'
                    : 'error';
            host.broadcast.send('pane:status', entry.paneId, chipStatus);
            const clarifyPayload = clarifyBroadcastPayload(entry);
            if (clarifyPayload) {
                host.broadcast.send('pane:clarify', clarifyPayload.paneId, {
                    question: clarifyPayload.question,
                    suggestions: clarifyPayload.suggestions,
                });
            }
            pushRemoteState(); // status changed → push pane/mission state to phone
        });
        // F2: auto-close mission when the TOP agentic orchestrator submits done.
        // A top agentic orchestrator = delegateOnly + squadRole='orchestrator' with a bound missionId.
        // When it calls handoff_submit({status:'done'}), mark the mission ready_to_integrate so the
        // driver/user sees it complete without requiring a manual overclock_mission_set_status call.
        // Idempotent: already-done/archived missions are skipped.
        mcpHost.handoffRegistry.on('submit', (entry) => {
            if (entry.status !== 'done')
                return;
            const cfg = configs.get(entry.paneId);
            if (!cfg?.delegateOnly || cfg?.squadRole !== 'orchestrator' || !cfg?.missionId)
                return;
            if (missionClosesByHandoff(cfg))
                return;
            const missionId = cfg.missionId;
            void missionStore.mutateMissionsFile(async (missions) => {
                const idx = missions.findIndex((m) => m.id === missionId);
                if (idx < 0)
                    return;
                if (missions[idx].status === 'ready_to_integrate' || missions[idx].status === 'archived')
                    return;
                missions[idx] = { ...missions[idx], status: 'ready_to_integrate', updatedAt: Date.now() };
            }).then(() => {
                host.broadcast.send('missions:updated');
                const ws = cfg.workspacePath ?? cfg.cwd ?? '';
                if (ws)
                    void tryOpenMissionPreview(missionId, missionPreviewUrls.get(missionId), ws);
            }).catch(() => { });
        });
        // BUG3: auto-open the deliverable the MOMENT the BUILD chefe delivers — don't wait for the
        // piloto to sequence completion (the piloto tends to describe + ask instead of completing).
        // A chefe = delegateOnly + squadRole !== 'orchestrator'; we gate on 'builder' so a scout/
        // reviewer phase doesn't pop a window. tryOpenMissionPreview is idempotent (openedPreviews
        // dedup per mission), so the later piloto-done path above won't double-open.
        mcpHost.handoffRegistry.on('submit', (entry) => {
            if (entry.status !== 'done')
                return;
            const cfg = configs.get(entry.paneId);
            if (!cfg?.delegateOnly || cfg?.squadRole !== 'builder' || !cfg?.missionId)
                return;
            const ws = cfg.workspacePath ?? cfg.cwd ?? '';
            if (ws)
                void tryOpenMissionPreview(cfg.missionId, missionPreviewUrls.get(cfg.missionId), ws);
        });
        // F2-poke: auto-close mission when the TOP-LEVEL agentic orchestrator exits cleanly.
        // Top orchestrators communicate results via PTY output (poke mechanism), NOT handoff_submit,
        // so the listener above never fires for them. A clean exit (code 0) after all workers have
        // delivered signals successful completion. Sub-orchestrators (callerPaneId set) are excluded —
        // they use handoff_submit and are covered above. Non-zero exit = crash/kill → skip (leave
        // the mission in its current status for human inspection).
        pty.on('exit', (e) => {
            const sigNum = e.signal != null ? Number(e.signal) : Number.NaN;
            const code = e.signal != null && Number.isFinite(sigNum) ? 128 + sigNum : (e.exitCode ?? 0);
            if (code !== 0)
                return;
            const cfg = configs.get(e.paneId);
            // workerToCaller tracks panes spawned by agent_invoke (sub-orchestrators/workers).
            // A pane NOT in workerToCaller was spawned directly by the driver — it IS the top orchestrator.
            if (!cfg?.delegateOnly || cfg?.squadRole !== 'orchestrator' || !cfg?.missionId || workerToCaller.has(e.paneId))
                return;
            if (missionClosesByHandoff(cfg))
                return;
            const missionId = cfg.missionId;
            void missionStore.mutateMissionsFile(async (missions) => {
                const idx = missions.findIndex((m) => m.id === missionId);
                if (idx < 0)
                    return;
                if (missions[idx].status === 'ready_to_integrate' || missions[idx].status === 'archived')
                    return;
                missions[idx] = { ...missions[idx], status: 'ready_to_integrate', updatedAt: Date.now() };
            }).then(() => {
                host.broadcast.send('missions:updated');
                const ws = cfg.workspacePath ?? cfg.cwd ?? '';
                if (ws)
                    void tryOpenMissionPreview(missionId, missionPreviewUrls.get(missionId), ws);
            }).catch(() => { });
        });
        // wireCallerMapListener is the extracted, exported core of the workerToCaller
        // mutation path — it attaches the real submit listener using shouldClearCallerMapping
        // and fires onWake(caller, entry) when the orchestrator must be poked.  Because
        // wireCallerMapListener is a pure exported function it is unit-tested directly in
        // handoffRegistry without needing to spin up the full sidecar HTTP server.
        wireCallerMapListener(mcpHost.handoffRegistry, workerToCaller, (caller, entry) => {
            // F-070: wireCallerMapListener already filters closed_by_caller before onWake; this
            // defensive return also narrows entry.status for buildWakeMessage's stricter union.
            if (entry.status === 'closed_by_caller')
                return;
            // caller is undefined when the wake fired purely because the handoff is ADDRESSED
            // (entry.to, C-060) and the submitter has no spawner mapping (human-opened pane).
            if (caller)
                clearWorkerPending(entry.paneId, caller);
            // Squad workers (agent_invoke) are throwaway: auto-close 30s after a clean done — the result
            // lives in the handoff. Failed/blocked panes stay open for inspection.
            if (entry.status === 'done' && squadWorkerPanes.has(entry.paneId)) {
                squadWorkerPanes.delete(entry.paneId);
                setTimeout(() => { try {
                    pty.kill(entry.paneId);
                }
                catch { /* already gone */ } }, 30_000);
            }
            // pane_spawn workers that opted in to autoCloseOnHandoff: same 30s clean-done kill.
            if (entry.status === 'done' && autoClosePanes.has(entry.paneId)) {
                autoClosePanes.delete(entry.paneId);
                setTimeout(() => { try {
                    pty.kill(entry.paneId);
                }
                catch { /* gone */ } }, 30_000);
            }
            // C-060: the wake destination is entry.to when it is a LIVE pane inside the submitter's
            // workspace/mission (same boundary rule as allowCross*); anything invalid falls back to
            // the caller so a handoff is never lost. ONLY the wake destination changes — pending
            // markers, auto-close and the caller mapping above keep following the real spawner.
            const wakeTarget = resolveWakeTarget(entry, caller, (to) => {
                if (!pty.hasPane(to))
                    return false;
                const fromCfg = configs.get(entry.paneId);
                const toCfg = configs.get(to);
                const fromWs = fromCfg?.workspacePath ?? fromCfg?.cwd;
                const toWs = toCfg?.workspacePath ?? toCfg?.cwd;
                // Undeterminable submitter scope → nothing to enforce against (assertPaneInScope parity).
                if (!fromCfg || (!fromCfg.missionId && !fromWs))
                    return true;
                const sameMission = Boolean(fromCfg.missionId) && toCfg?.missionId === fromCfg.missionId;
                const sameWorkspace = Boolean(fromWs) && toWs === fromWs;
                return sameMission || sameWorkspace;
            });
            if (!wakeTarget) {
                // F-164: a wake dying here was invisible (no log, no trace) — record it so a lost
                // wake (dead/out-of-scope `to` AND no caller) shows up in diagnostics.
                diagnostics.record({
                    level: 'warn', source: 'pane', name: 'handoff.wake_drop', paneId: entry.paneId,
                    data: { reason: 'no_wake_target', handoffId: entry.id ?? null, status: entry.status, to: entry.to ?? null },
                });
                return;
            }
            // Conversational wake: a colleague's one-liner, not a robotic wall. The full result +
            // evidence stay lossless in handoff_list (pulled on demand) — never inlined here.
            // Message shape (pane + item ref when the summary cites one + human summary + pointer)
            // lives in buildWakeMessage (handoffWakeMessage.ts) so it's unit-testable (F-012).
            const cfg = configs.get(entry.paneId);
            const msg = sanitizeInline(buildWakeMessage({ ...entry, status: entry.status }, cfg?.squadRole));
            host.broadcast.send('pane:status', wakeTarget, 'running');
            pushRemoteState(); // orchestrator resumed → push pane/mission state to phone
            pokeOrchestrator(wakeTarget, msg);
        }, (entry) => {
            // F-164: submit with NO caller mapping and NO `to` — before the fix this was the
            // silent death of every wake from a persistent worker after its first done. Kept
            // instrumented so any residual mapping loss (e.g. sidecar restart wiping the
            // in-memory workerToCaller Map) is visible instead of a mystery.
            diagnostics.record({
                level: 'warn', source: 'pane', name: 'handoff.wake_drop', paneId: entry.paneId,
                data: { reason: 'no_caller_no_to', handoffId: entry.id ?? null, status: entry.status },
            });
        });
    };
    host.ipcMain.handle('app:version', () => APP_VERSION);
    // Open a URL in the OS default browser. Used by the in-app browser pane's "open
    // externally" button for sites that refuse to be framed (X-Frame-Options/CSP).
    host.ipcMain.handle('app:openExternal', (_e, url) => {
        if (typeof url === 'string' && /^https?:\/\//i.test(url))
            openExternalUrl(url);
        return { ok: true };
    });
    // Open a file at an absolute path in the OS default app (Finder / default viewer).
    // Expands ~ to home. Does NOT sandbox — caller is responsible for only passing paths
    // the user explicitly clicked in the terminal. No file content is read into the editor.
    host.ipcMain.handle('files:openExternal', (_e, absPath) => {
        if (typeof absPath !== 'string')
            return { ok: false, error: 'invalid path' };
        const home = process.env['HOME'] ?? homedir();
        const expanded = absPath.startsWith('~/') && home ? `${home}/${absPath.slice(2)}` : absPath;
        if (!expanded.startsWith('/') && !/^[A-Za-z]:[\\/]/.test(expanded)) {
            return { ok: false, error: 'path must be absolute' };
        }
        openExternalUrl(expanded);
        return { ok: true };
    });
    // Data dir único: resolveOverclockHome() lê OVERCLOCK_HOME (multi-profile opt-in)
    // → OVERCLOCK_DATA_DIR (Rust/Tauri backward-compat) → ~/.overclock-app (default).
    // Override por-store via OVERCLOCK_<X>_JSON ainda funciona em testes.
    const dataDir = resolveOverclockHome();
    // F-171: Electron 0.7.x no Windows guardava os stores em %APPDATA%\Overclock (userData);
    // o Tauri lê ~/.overclock-app — pós-update a lista de workspaces vinha vazia ("perdi tudo").
    // Migração one-shot copy-se-ausente. Gate por basename: só o dataDir default de PRODUÇÃO
    // (.overclock-app) — dev (-dev) e perfis custom (OVERCLOCK_HOME) nunca sugam dado legado.
    if (process.platform === 'win32' && basename(dataDir) === '.overclock-app') {
        const legacyElectronDir = join(process.env['APPDATA'] ?? join(homedir(), 'AppData', 'Roaming'), 'Overclock');
        const migrated = migrateElectronLegacyData(legacyElectronDir, dataDir);
        if (migrated.length > 0) {
            process.stderr.write(`[sidecar] F-171: migrated legacy Electron stores (${migrated.join(', ')}) from ${legacyElectronDir}\n`);
        }
    }
    // F-068: app lançado de dentro de um pane Claude de conta extra (ex. `tauri dev` no terminal
    // de um pane acc-N) herda o CLAUDE_CONFIG_DIR daquela conta — o scrub F-019 do PtyManager só
    // cobre CLAUDECODE/CLAUDE_CODE_*. Herdado, ele envenena os DOIS lados do restore: o scan
    // (ClaudeSessionsService trata a conta do pane como root "default" → sessões de ~/.claude do
    // prod invisíveis) e o spawn (pane sem providerId resume na conta errada → "No conversation
    // found"). Valor dentro de <dataDir>/claude-accounts é sempre env de pane, nunca relocação
    // legítima do usuário — descarta na boot; spawns de conta extra seguem setando o próprio
    // config.env.CLAUDE_CONFIG_DIR explícito (merge pós-scrub, intocado).
    if (isInheritedAccountConfigDir(process.env['CLAUDE_CONFIG_DIR'], join(dataDir, 'claude-accounts'))) {
        delete process.env['CLAUDE_CONFIG_DIR'];
    }
    // F-067: per-pane artifacts live in a per-instance dir (dev subdir, prod = dataDir itself) so
    // two live sidecars sharing dataDir never overwrite or boot-clean each other's pane files.
    const panesDir = paneFilesDir(dataDir);
    try {
        mkdirSync(panesDir, { recursive: true });
    }
    catch { /* best-effort; writes below surface errors */ }
    // Boot cleanup: mcp-pane-*.json (per-pane MCP configs) AND the per-pane gate/hook/marker files
    // (skill-gate / resource-gate / handoff-* / skill-loaded — see ORPHAN_PANE_FILE_PREFIXES) are
    // only needed while the pane process is alive. On sidecar restart all prior pane processes are
    // dead, so every existing file is an orphan. Delete them all now in a single readdir pass
    // (F-008 — ~150 stale files; gate/hook/marker files previously leaked forever). Scans ONLY this
    // instance's panesDir (F-067) — a dev restart must never delete the prod panes' live files.
    fsp.readdir(panesDir)
        .then(files => Promise.all(files
        .filter(f => (f.startsWith('mcp-pane-') && f.endsWith('.json')) ||
        ORPHAN_PANE_FILE_PREFIXES.some(p => f.startsWith(p)))
        .map(f => fsp.unlink(join(panesDir, f)).catch(() => { }))))
        .catch(() => { });
    // F-008: paneSeq (module-level) resets to 0 on every sidecar restart, so a raw `pane-${++seq}`
    // re-emits the ids of panes RESUMED from panes.json (which re-enter with their explicit high id
    // via input.paneId) as the counter climbs — colliding with the LIVE caller. Two things fix it:
    //   (1) persist a monotonic high-water mark across restarts (so a number is never reused by a
    //       later session — no dead-homonym token-telemetry inheritance, no restorable-entry clobber);
    //   (2) at each allocation, jump past every currently-known id (live local/remote/browser panes),
    //       so even if the counter file is lost a restored pane's id is still avoided.
    // pane-seq.json is NOT matched by the boot-cleanup readdir above (only mcp-pane-*.json + the
    // ORPHAN_PANE_FILE_PREFIXES are unlinked), so the high-water mark survives restart.
    //
    // F-130: pane-seq.json MUST live in the PER-INSTANCE dir (panesDir = paneFilesDir(dataDir):
    // pane-files.dev for dev, dataDir for prod), NOT raw dataDir. When it sat on the shared dataDir,
    // dev and prod (dogfooded on the SAME ~/.overclock-app) read the SAME high-water into their
    // OWN in-memory counters and BOTH allocated the next number (e.g. pane-417) — a cross-instance
    // id collision. F-112 (agentic spawn → nextPaneId instead of agent_<ts>) newly exposed it: every
    // mission pilot got a colliding pane-N, the pilot died on spawn (code=1), and creation looked
    // dead. Same per-identity recipe as F-010 (mcp-port.dev) / F-017 (panes.dev.json): dev keeps its
    // OWN counter, prod's path is UNCHANGED (paneFilesDir(dataDir) === dataDir for prod).
    const paneSeqFile = join(panesDir, 'pane-seq.json');
    try {
        const parsed = JSON.parse(readFileSync(paneSeqFile, 'utf8'));
        if (typeof parsed.seq === 'number' && Number.isFinite(parsed.seq) && parsed.seq > paneSeq) {
            paneSeq = Math.floor(parsed.seq);
        }
    }
    catch { /* no persisted counter yet — start from 0 */ }
    const allocatePaneId = () => {
        const used = [];
        for (const id of configs.keys()) {
            const n = paneIdNumber(id);
            if (n !== null)
                used.push(n);
        }
        for (const id of browserPanes.keys()) {
            const n = paneIdNumber(id);
            if (n !== null)
                used.push(n);
        }
        for (const id of remotePaneIds) {
            const n = paneIdNumber(id);
            if (n !== null)
                used.push(n);
        }
        const next = nextPaneId(paneSeq, used);
        paneSeq = next.seq;
        try {
            writeFileSync(paneSeqFile, JSON.stringify({ seq: paneSeq }), 'utf8');
        }
        catch { /* best-effort */ }
        return next.id;
    };
    // appConfig: ConfigStore standalone (lê o MESMO arquivo do Electron).
    const configStore = new ConfigStore(process.env['OVERCLOCK_CONFIG_JSON'] ?? join(dataDir, 'config.json'));
    host.ipcMain.handle('appConfig:get', () => configStore.get());
    host.ipcMain.handle('appConfig:set', (_e, patch) => {
        configStore.set(patch);
        return configStore.get();
    });
    // workspaceConfig: WorkspaceConfigStore standalone (reads <workspace>/.overclock-app/workspace.json).
    const workspaceConfigStore = new WorkspaceConfigStore();
    host.ipcMain.handle('workspaceConfig:get', (_e, wsPath) => {
        // Path vazio → default (mesmo que o Electron: defaultWorkspaceConfig()), não cwd (review #4).
        if (typeof wsPath !== 'string' || !wsPath.trim())
            return WorkspaceConfigStore.defaultConfig();
        return workspaceConfigStore.get(wsPath);
    });
    host.ipcMain.handle('workspaceConfig:set', (_e, wsPath, cfg) => {
        if (typeof wsPath !== 'string' || !wsPath.trim())
            return;
        workspaceConfigStore.set(wsPath, cfg);
    });
    // serviceKeys: MESMA lógica compartilhada do handler Electron (@overclock-app/
    // core/serviceKeys) — get retorna publicView completa (5 campos), save retorna
    // {ok,config}, test roda o auth check real (fetch nativo). Zero divergência.
    // Encrypt the media service-keys store at rest when the Tauri shell handed over a keystore key
    // (stdin handoff). Without it (dev/standalone), the store stays plaintext — same as before.
    // Build failure (e.g. bad key length) degrades to plaintext rather than crashing the sidecar.
    const keys = opts?.keystoreKeys ?? (opts?.keystoreMasterKey ? { fileKey: opts.keystoreMasterKey } : null);
    let keystoreCrypto;
    let legacyCrypto;
    if (keys?.fileKey) {
        try {
            keystoreCrypto = aesGcmKeystoreCrypto(keys.fileKey);
        }
        catch (err) {
            process.stderr.write(`[sidecar] keystore crypto disabled: ${err instanceof Error ? err.message : String(err)}\n`);
        }
    }
    if (keys?.legacyKey) {
        try {
            legacyCrypto = aesGcmKeystoreCrypto(keys.legacyKey);
        }
        catch { /* ignore — migration is best-effort */ }
    }
    const serviceKeysPath = process.env['OVERCLOCK_SERVICE_KEYS_JSON'] ?? join(dataDir, 'service-keys.json');
    // Key-rotation migration (keychain → file key): if file is OCK1 and primary key fails to decrypt,
    // try the legacy key; on success, immediately re-encrypt with the file key (one-shot migration).
    if (keystoreCrypto && legacyCrypto && existsSync(serviceKeysPath)) {
        try {
            const buf = readFileSync(serviceKeysPath);
            if (isKeystoreCiphertext(buf)) {
                const withFileKey = keystoreCrypto.decrypt(buf);
                if (withFileKey === null) {
                    const withLegacy = legacyCrypto.decrypt(buf);
                    if (withLegacy !== null) {
                        writeFileSync(serviceKeysPath, keystoreCrypto.encrypt(withLegacy));
                        try {
                            chmodSync(serviceKeysPath, 0o600);
                        }
                        catch { /* non-fatal on win */ }
                        process.stderr.write('[sidecar] service-keys re-encrypted with file key (keychain→file migration)\n');
                    }
                }
            }
        }
        catch (err) {
            process.stderr.write(`[sidecar] keychain→file migration skipped: ${err instanceof Error ? err.message : String(err)}\n`);
        }
    }
    const serviceKeysStore = new ServiceKeysStore(serviceKeysPath, keystoreCrypto);
    // One-time at-rest migration: if crypto is now available but the file is still plaintext (legacy),
    // re-write it encrypted immediately so `cat` stops revealing keys — don't wait for the next save.
    if (keystoreCrypto) {
        try {
            if (existsSync(serviceKeysPath) && !isKeystoreCiphertext(readFileSync(serviceKeysPath))) {
                serviceKeysStore.write(serviceKeysStore.read());
                process.stderr.write('[sidecar] service-keys migrated to encrypted at rest\n');
            }
        }
        catch (err) {
            process.stderr.write(`[sidecar] service-keys encryption migration skipped: ${err instanceof Error ? err.message : String(err)}\n`);
        }
    }
    host.ipcMain.handle('serviceKeys:get', () => serviceKeysPublicView(serviceKeysStore));
    host.ipcMain.handle('serviceKeys:save', (_e, patch) => applyServiceKeyPatch(serviceKeysStore, patch));
    host.ipcMain.handle('serviceKeys:test', (_e, id) => testServiceKey(serviceKeysStore, id));
    host.ipcMain.handle('serviceKeys:listModels', (_e, id) => listServiceModels(serviceKeysStore, id));
    host.ipcMain.handle('serviceKeys:getNativeDisabled', () => getNativeDisabled(serviceKeysStore));
    host.ipcMain.handle('serviceKeys:setNativeDisabled', (_e, ids) => setNativeDisabled(serviceKeysStore, ids));
    // F-009: pre-warm service-keys file cache at boot so first Settings → Mídia open is fast.
    // store.read() is sync (file read + AES-GCM decrypt); cold OS page-cache is the only cost.
    try {
        serviceKeysPublicView(serviceKeysStore);
    }
    catch { /* best-effort, never blocks boot */ }
    // providers:list — merge dos builtins (com detecção de modelos) + providers do
    // usuário, MASCARADO. Lê providers.json plaintext (OC1\0-encriptado = só builtins,
    // até a migração D2). Presence mínima (claude incluído; detecção de CLI = follow-up).
    const providersPath = process.env['OVERCLOCK_PROVIDERS_JSON'] ?? join(dataDir, 'providers.json');
    const ENC_MAGIC = Buffer.from('OC1\0');
    // C-102 BUG 1 fix: the proxy gate must read the same email the UI reads
    // (auth:profile's session.json), NOT getLicenseProfile — that one hardcodes
    // email:null in dev builds and holds the Overclock SUBSCRIPTION email in
    // prod, which can differ from the logged-in account. Mirrors auth:profile's
    // own session read (~2818) rather than reusing its handler (kept separate,
    // untouched).
    const readSessionEmail = () => {
        const sessionPath = process.env['OVERCLOCK_SESSION_JSON'] ?? join(dataDir, 'session.json');
        if (!existsSync(sessionPath))
            return null;
        try {
            const buf = readFileSync(sessionPath);
            if (buf.length > ENC_MAGIC.length && buf.subarray(0, ENC_MAGIC.length).equals(ENC_MAGIC))
                return null;
            const session = JSON.parse(buf.toString('utf-8'));
            return session?.email ?? null;
        }
        catch {
            return null;
        }
    };
    const readProvidersFile = () => {
        const empty = { userProviders: [], builtinModels: {}, builtinEnabled: {}, builtinSettings: {} };
        if (!existsSync(providersPath))
            return empty;
        try {
            const buf = readFileSync(providersPath);
            if (buf.length > ENC_MAGIC.length && buf.subarray(0, ENC_MAGIC.length).equals(ENC_MAGIC))
                return empty; // encrypted: D2 follow-up
            const data = JSON.parse(buf.toString('utf-8'));
            return {
                userProviders: Array.isArray(data.providers) ? data.providers : [],
                builtinModels: data.builtinModels ?? {},
                builtinEnabled: data.builtinEnabled ?? {},
                builtinSettings: data.builtinSettings ?? {},
            };
        }
        catch {
            return empty;
        }
    };
    const cliDetector = new CliDetector();
    // ProviderStore (core) = writer único do providers.json (save/delete/setDefaultModel/accounts),
    // mesma classe do Electron, crypto plaintext passthrough. setProviderCrypto MUST be called
    // BEFORE the ProviderStore constructor (which calls load() + writeToDisk() for migrations).
    // v1 keeps the existing plaintext passthrough (isEncryptionAvailable=false → no OC1 magic);
    // real keychain injection (safeStorage/Tauri) is a later phase (keystone).
    const plaintextBackend = {
        isEncryptionAvailable: () => false,
        encryptString: (s) => Buffer.from(s, 'utf-8'),
        decryptString: (b) => b.toString('utf-8'),
    };
    setProviderCrypto(plaintextBackend);
    const providerStore = new ProviderStore(providersPath);
    // ── Token telemetry: ClaudeTranscriptWatcher ──────────────────────────────
    // Captura o burn real dos panes Claude CLI lendo ~/.claude/projects/<slug>/*.jsonl e
    // gravando em token_usage (db.ts). Sem isto o DB nunca é escrito → tokens:global e
    // tokens:byPane retornam estático/vazio (bug de telemetria pós-migração Electron→Tauri,
    // a captura ficou no ClaudeTranscriptWatcher do Electron e não foi portada).
    const claudeProjectsRoots = () => providerStore.listClaudeAccounts()
        .filter((p) => p.enabled !== false && typeof p.claudeConfigDir === 'string' && p.claudeConfigDir.length > 0)
        .map((p) => join(p.claudeConfigDir, 'projects'));
    // Atribui um transcript ao pane. Fast-path DETERMINÍSTICO: panes claude frescos são spawnados
    // com `--session-id <uuid>` ditado (stampado em cfg.claudeSessionId), então um transcript cujo
    // filename bate nesse id pertence àquele pane, exato. Fallback (legado/sem id): slug do cwd +
    // spawn mais recente na janela — EXCLUINDO panes já donos de outra sessão, senão N spawns
    // paralelos no mesmo cwd caem todos no último (F-001: session ids duplicados entre panes).
    const lookupPaneBySlug = (slug, sessionId, windowMs = 120_000) => {
        if (sessionId) {
            for (const p of pty.listPanes()) {
                if (configs.get(p.paneId)?.claudeSessionId === sessionId)
                    return p.paneId;
            }
        }
        const now = Date.now();
        let bestId = null;
        let bestAt = 0;
        for (const p of pty.listPanes()) {
            if (p.cwd.replaceAll('/', '-') !== slug)
                continue;
            const pcfg = configs.get(p.paneId);
            const known = pcfg?.claudeSessionId;
            // F-019: pane com rotação PENDENTE (spawn --resume forka pra uuid novo) é elegível
            // mesmo "dono" de outra sessão — senão o transcript forkado nunca resolve e o badge
            // consulta a sessão morta pra sempre.
            if (sessionId && known && known !== sessionId && !pcfg?.claudeSessionRotatePending)
                continue;
            const t = p.spawnedAt.getTime();
            if (now - t > windowMs)
                continue;
            if (!bestId || t > bestAt) {
                bestId = p.paneId;
                bestAt = t;
            }
        }
        return bestId;
    };
    const transcriptWatcher = new ClaudeTranscriptWatcher((wsPath) => getWorkspaceDb(wsPath), ({ slug, sessionId }) => lookupPaneBySlug(slug, sessionId), () => host.broadcast.send('tokens:updated', { taskId: null }), claudeProjectsRoots, 
    // Resume capture (root of the "SAVED context but no --resume" restore bug): the
    // transcript filename is the claude session uuid, but NOTHING populated
    // cfg.claudeSessionId for a live pane — so a closed+restored pane cold-booted a
    // fresh conversation. When the watcher resolves a transcript to a live claude pane,
    // stamp its session id onto the config and persist, so the next restore --resumes it.
    (paneId, sessionId) => {
        const cfg = configs.get(paneId);
        // NUNCA sobrescrever id existente: o id ditado no spawn (`--session-id`) é autoritativo;
        // o watcher é fallback só pra pane sem id. Sobrescrever cross-stampava a sessão de um
        // worker paralelo no pane errado (F-001) — restore dava --resume na conversa errada.
        if (cfg && cfg.agent === 'claude' && cfg.claudeSessionRotatePending && cfg.claudeSessionId !== sessionId) {
            // F-019: rotação ESPERADA (resume-fork) — única exceção ao guard abaixo. Re-stampa o
            // id vivo e limpa a flag; o badge (tokens:byPane) volta a somar a sessão certa.
            cfg.claudeSessionId = sessionId;
            cfg.claudeSessionRotatePending = false;
            void saveAllWorkspaces();
        }
        else if (cfg && cfg.agent === 'claude' && !cfg.claudeSessionId) {
            cfg.claudeSessionId = sessionId;
            void saveAllWorkspaces();
        }
    });
    // ── Token telemetry: CodexTranscriptWatcher ───────────────────────────────
    // Espelho do Claude p/ os panes Codex CLI. Os rollouts vivem em
    // ~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl (por DATA, não por slug), então o
    // watcher observa o ROOT global e resolve workspace+pane por arquivo (cwd lido do
    // session_meta). Multi-conta: cada CODEX_HOME tem seu próprio sessions/.
    const codexSessionsRoots = () => {
        // Env-derived default (config-location-independent): a user-set CODEX_HOME relocates the
        // sessions dir; the adapter's sessionsRoot resolves it from the shell env. Per-account
        // CODEX_HOME dirs append below; the Set dedups the default-vs-account overlap.
        const roots = [SESSION_ADAPTERS.codex.sessionsRoot(process.env)];
        try {
            for (const p of providerStore.listCodexAccounts()) {
                if (p.enabled === false || typeof p.codexHomeDir !== 'string' || !p.codexHomeDir)
                    continue;
                roots.push(join(p.codexHomeDir, 'sessions'));
            }
        }
        catch { /* provider store indisponível */ }
        return [...new Set(roots)];
    };
    // Atribui um rollout ao pane: bate o cwd da sessão e pega o spawn codex mais recente
    // na janela. Filtra agent==='codex' (senão um rollout cairia num pane claude do mesmo cwd).
    const lookupCodexPaneByCwd = (cwd, windowMs = 120_000) => {
        const now = Date.now();
        let bestId = null;
        let bestAt = 0;
        for (const p of pty.listPanes()) {
            if (p.cwd !== cwd)
                continue;
            if (configs.get(p.paneId)?.agent !== 'codex')
                continue;
            const t = p.spawnedAt.getTime();
            if (now - t > windowMs)
                continue;
            if (!bestId || t > bestAt) {
                bestId = p.paneId;
                bestAt = t;
            }
        }
        return bestId;
    };
    const codexWatcher = new CodexTranscriptWatcher((wsPath) => getWorkspaceDb(wsPath), ({ cwd }) => lookupCodexPaneByCwd(cwd), () => host.broadcast.send('tokens:updated', { taskId: null }), codexSessionsRoots, 
    // Resume capture (mirror of claude's at the transcriptWatcher above): the rollout uuid
    // is the codex session id, but nothing populated cfg.session for a live codex pane — so a
    // closed+restored pane cold-booted fresh. When the watcher resolves a rollout to a live
    // codex pane, stamp cfg.session so the next restore `codex resume <id>` instead.
    (paneId, sessionId) => {
        const cfg = configs.get(paneId);
        if (cfg && cfg.agent === 'codex' && cfg.session?.id !== sessionId) {
            cfg.session = { provider: 'codex', id: sessionId, capturedAt: Date.now(), confidence: 'high', source: 'session-file' };
            void saveAllWorkspaces();
        }
    });
    // Gemini/antigravity têm NENHUM watcher de arquivo (só listGemini/listAntigravity no restore).
    // Captura mínima: após o spawn, um poll curto debounced consulta o providerSessionsService
    // (já com roots env-derivados) p/ o cwd do pane e estampa cfg.session do provider — assim o
    // restore tem um id p/ resumir em vez de cold-boot. Reusa o locate existente (zero novo scan
    // custom). Roda algumas vezes dentro da janela; também no kill (id final do antigravity).
    const captureNonWatchedSession = (cfg) => {
        const agent = cfg.agent;
        const cwd = cfg.cwd;
        const paneId = cfg.id;
        if (!paneId || !cwd || (agent !== 'gemini' && agent !== 'antigravity'))
            return;
        const attempt = async () => {
            const live = configs.get(paneId);
            if (!live || live.agent !== agent || live.session?.id)
                return true; // gone or already stamped
            let sessions = [];
            try {
                sessions = await providerSessions.list(cwd);
            }
            catch {
                return false;
            }
            const match = sessions
                .map((s) => s.panes[0]?.session)
                .filter((s) => !!s && s.provider === agent && !!s.id)
                .sort((a, b) => (b.capturedAt ?? 0) - (a.capturedAt ?? 0))[0];
            if (!match)
                return false;
            live.session = match;
            void saveAllWorkspaces();
            return true;
        };
        let tries = 0;
        const tick = () => {
            tries += 1;
            void attempt().then((done) => { if (!done && tries < 6)
                setTimeout(tick, 5_000); });
        };
        setTimeout(tick, 3_000);
    };
    // Idempotente: liga o watcher pro cwd de todo pane Claude spawnado (panes podem viver
    // em workspaces != activeWorkspace). Espelha bootstrap ~6358 (start por claude spawn).
    // O codex watcher é GLOBAL (1 root), então start() é chamado 1x no 1º spawn codex.
    // configDir do pane (cfg.env.CLAUDE_CONFIG_DIR) torna o root do watcher env-correto.
    const watchClaudeCwd = (cfg) => {
        if (cfg.agent === 'claude' && cfg.cwd) {
            // F-019: sessão ditada no spawn é fresca — o seed do watcher não pode pinar o offset
            // dela (transcript escrito durante/antes do seed sumia inteiro do badge).
            if (cfg.claudeSessionId)
                transcriptWatcher.expectFreshSession(cfg.claudeSessionId);
            void transcriptWatcher.start(cfg.cwd, cfg.env?.CLAUDE_CONFIG_DIR).catch(() => { });
        }
        if (cfg.agent === 'codex')
            void codexWatcher.start().catch(() => { });
        if (cfg.agent === 'gemini' || cfg.agent === 'antigravity')
            captureNonWatchedSession(cfg);
    };
    // Presence real via probe de PATH (mesma lógica do Electron) — builtins dos CLIs
    // instalados (gemini/codex/etc.), não só claude. Reusado por providers:list + bridge MCP.
    const cliPresence = () => {
        const detected = new Set(cliDetector.getAll().filter((d) => d.found).map((d) => d.name));
        return {
            claude: detected.has('claude'),
            gemini: detected.has('gemini'),
            codex: detected.has('codex'),
            kimi: detected.has('kimi'),
            antigravity: detected.has('antigravity'),
            cursor: detected.has('cursor'),
            copilot: detected.has('copilot'),
            grok: detected.has('grok'),
        };
    };
    // Mirror do estado de missões do renderer (zustand/localStorage = fonte de verdade
    // do sidebar). Alimentado via IPC 'mission:syncState' (preload/shim). Sem isto, o
    // sidecar não conhece a MISSÃO ATIVA do workspace, então pane_spawn via MCP herda a
    // missão do caller (cai na aba errada) e não resolve missões criadas na UI (nanoid).
    const rendererMissionsMirror = {
        missionsByWorkspace: {},
        activeMissionByWorkspace: {},
    };
    // Missão a usar quando o caller não passa missionId explícito: a ativa do workspace
    // focado (a aba que o usuário vê). Squad workers SEMPRE passam missionId → não caem aqui.
    const resolveActiveMissionId = (workspacePath) => {
        if (!workspacePath)
            return undefined;
        return rendererMissionsMirror.activeMissionByWorkspace[workspacePath] || undefined;
    };
    // buildSpawnConfig — builder único de PaneConfig (args do agente + provider env +
    // injeção do mcp-config p/ claude). Usado pelo handler pty:spawn E pelo bridge MCP
    // (spawnPane), garantindo paridade. Espelha spawnPaneInternal do Electron (INV-3/INV-5/INV-6):
    // contas extras recebem CLAUDE_CONFIG_DIR/CODEX_HOME isolado; gate de kill-switch + probe.
    const buildSpawnConfig = async (input) => {
        const id = input.paneId || allocatePaneId();
        // ── F-033: resume rehydration — reconstitute the pane's CARGO, not just its transcript. ──
        // A spawn that re-uses a canonical `pane-N` id with no live config is a restore/reattach
        // (fresh ids never collide with saved entries — F-008 allocator invariant). The renderer
        // only forwards a subset of the original spawn input (savedPaneSquadFields) and MCP/headless
        // restore paths forward nothing, so the persisted panes.json entry is the source of truth:
        // fill every cargo field the caller left undefined (gates, effort, roles, media allowlists,
        // parenthood), and apply the mission rule — original mission sticks (no silent rebind);
        // an ORPHAN pane (no persisted missionId) binds to the caller's active mission; a caller
        // may deliberately override via input.missionRebindExplicit (the explicit-rebind seam).
        if (input.paneId && paneIdNumber(input.paneId) !== null && !configs.has(input.paneId)) {
            const cargoWs = input.workspacePath ?? input.cwd ?? activeWorkspace;
            if (cargoWs && !cargoWs.startsWith('ssh://')) {
                try {
                    const savedSessions = await sessionManager.loadAll(cargoWs);
                    const savedEntry = savedSessions.flatMap((s) => s.panes).find((p) => p.id === input.paneId);
                    if (savedEntry)
                        rehydratePaneCargo(input, savedEntry);
                }
                catch { /* best-effort — a fresh boot is still better than no boot */ }
            }
        }
        // ── C-064.4: compile the 'data' style's flow.entry spawn ──────────────────────────
        // MissionWizard.handleSpawnAgentic sends the SAME hardcoded 1:1:N flags (delegateOnly:true,
        // squadRole:'orchestrator', squadCallable:[]) for every agentic style — only the compiled
        // style knows the REAL topology (spec docs/superpowers/specs/2026-07-03-estilos-
        // orquestracao-agentico-formato.md §2), so it wins here, overriding the wizard's defaults.
        // 'one-one-n'/absent/unknown styleId → getStyle misses or enforcement!=='data' →
        // compileStyleEntrySpawn returns null and the hardcoded path is byte-identical to today
        // (decisão 4 do brainstorm). A style/allowlist conflict fails the spawn outright (same
        // error codes cli_not_allowed/skill_not_allowed the invoke-layer gates use) rather than
        // spawning a pane that silently ignores the mission's R5 allowlists.
        if (input.styleId) {
            try {
                const compiled = compileStyleEntrySpawn(mcpPkg.getStyle(input.styleId), {
                    allowedCLIs: input.allowedCLIs,
                    missionAllowedSkills: input.missionAllowedSkills,
                });
                if (compiled) {
                    input.delegateOnly = compiled.delegateOnly;
                    input.leaf = compiled.leaf;
                    input.squadRole = compiled.squadRole;
                    if (compiled.model)
                        input.model = compiled.model;
                    if (compiled.effort)
                        input.effort = compiled.effort;
                    input.orchestratorAllowedSkills = compiled.allowedSkills;
                    input.extraSystemPrompt = [compiled.promptContract, input.extraSystemPrompt]
                        .filter((p) => !!p && p.trim().length > 0)
                        .join('\n\n');
                    input.squadCallable = compiled.squadCallable;
                }
            }
            catch (err) {
                return { id, error: err instanceof Error ? err.message : String(err) };
            }
        }
        // F-061: an explicit providerId without an agent (the MCP pane_spawn multi-account path)
        // must resolve the CLI host FROM the provider — otherwise input.agent stays undefined,
        // config.agent falls back to 'shell' below, and the pane boots a bare shell fed CLI args
        // like `--model …` (immediate exit 128) instead of launching the provider's CLI.
        // ProviderHost values are the same set as the agent enum, so the host IS the agent.
        if (!input.agent && input.providerId) {
            const providerHost = providerStore.get(input.providerId)?.host;
            if (providerHost)
                input.agent = providerHost;
        }
        // Resume strips the saved managed block (--mcp-config/--append-system-prompt/
        // --allowedTools/--model/permission flags/codex -c overrides) BEFORE rebuild, so a
        // stale per-pane mcp-config path from the original spawn can't make the CLI exit at
        // boot. Mirrors Electron bootstrap ~5637/~5962. buildClaudeSpawnArgs re-adds each
        // fragment with current paths via its !includes guards.
        const agentArgs = Array.isArray(input.args) ? stripManagedPaneArgs(input.agent, input.args) : [];
        // codex resume is a SUBCOMMAND, so a previously-resumed codex pane carries a leading
        // `resume <id>` positional pair in its saved args. stripManagedPaneArgs can't drop it (it
        // strips flags, not positionals), so remove it here BEFORE rebuilding: the codex case below
        // re-adds a fresh `resume <id>` when a session id is available, and a fresh boot (no resumeId)
        // must not inherit a stale resume.
        if (input.agent === 'codex' && agentArgs[0] === 'resume')
            agentArgs.splice(0, 2);
        if (input.model && input.agent !== 'antigravity' && !agentArgs.includes('--model')) {
            agentArgs.push('--model', input.model);
        }
        // Bug A (restore-resume): resume is provider-agnostic. Prefer the explicit
        // claudeSessionId, else the universal session.id — a pane whose id lives only in
        // `session` (e.g. surfaced via SessionManager.loadAll after the normalize backfill)
        // must still resume instead of cold-booting fresh. Each CLI gets its OWN verified
        // resume flag — flags below were checked against the installed binaries' --help, NOT
        // guessed; DO NOT cross-wire one provider's flag onto another.
        const resumeId = input.claudeSessionId ?? input.session?.id;
        if (resumeId && !agentArgs.includes('--resume') && !agentArgs.some((a) => a.startsWith('--resume='))) {
            // First-class CLIs (claude/codex/gemini/antigravity) route through the single
            // SESSION_ADAPTERS table — one source of truth for the verified resume invocation,
            // killing the per-provider switch drift (gemini had a dead break, antigravity no case
            // at all → both cold-booted on restore). codex's `resume <id>` is a leading subcommand
            // positional, so it's UNSHIFTED to the front; everyone else PUSHES the flag pair.
            const adapter = sessionAdapterFor(input.agent);
            if (adapter) {
                const args = adapter.resumeArgs(resumeId);
                if (input.agent === 'codex')
                    agentArgs.unshift(...args);
                else
                    agentArgs.push(...args);
                // F-019: claude --resume FORKA (uuid novo, desconhecido aqui — --session-id junto com
                // --resume é rejeitado pelo CLI). Marca a rotação esperada pro watcher re-stampar.
                if (input.agent === 'claude')
                    input.claudeSessionRotatePending = true;
            }
            else {
                switch (input.agent) {
                    case 'kimi':
                        // kimi --help: `-S,-r / --session,--resume TEXT` — "With ID: resume that session."
                        agentArgs.push('--resume', resumeId);
                        break;
                    case 'cursor':
                        // cursor-agent --help: `--resume [chatId]` — resume by chat id (binary cursor-agent).
                        agentArgs.push('--resume', resumeId);
                        break;
                    case 'copilot':
                        // copilot --help: `--resume[=value]` is an optional-value flag — the id MUST ride
                        // as `--resume=<id>` (a separate token would be parsed as a positional, not the value).
                        agentArgs.push(`--resume=${resumeId}`);
                        break;
                    default:
                        break;
                }
            }
        }
        else if (!resumeId && input.agent === 'claude') {
            // DICTATE (claude only): a FRESH claude pane pre-generates its session id and hands it to
            // the CLI via `--session-id <uuid>`, then stamps input.claudeSessionId in place so the
            // config-field spread below persists it. Zero filesystem race — the id is known at spawn,
            // not discovered later by the transcript watcher (that path stays as a fallback). Guarded
            // on !resumeId so a restore never gets BOTH --session-id and --resume (claude rejects that).
            const dictated = randomUUID();
            agentArgs.push(...SESSION_ADAPTERS.claude.dictateArgs(dictated));
            input.claudeSessionId = dictated;
        }
        const permissionMode = resolveSpawnPermissionMode(input.permissionMode, input.agent ?? 'shell');
        if (input.agent && input.agent !== 'shell') {
            applyPermissionArgs(input.agent, agentArgs, permissionMode);
        }
        // ── Claude orchestrator/worker arg assembly — byte-identical to Electron bootstrap ──
        // Replaces the previous bare `--mcp-config` push: now the orchestrator gets the full
        // system prompt + squad roster + skill gate + strict MCP, exactly like Electron.
        // Mirrors bootstrapMainProcess.ts ~5967 (effort cap) → ~5986-6148 (build) → ~6322-6336
        // (--settings hooks). The byte-identity baseline is TASK/validate-spawn-args-snapshot.mjs.
        if (input.agent === 'claude') {
            // Provider type drives the thinking-disable settings below. Third-party Anthropic-compatible
            // endpoints (MIMO, Kimi, etc.) emit tool_calls inside reasoning_content when thinking is on,
            // which Claude CLI never dispatches — and an ultracode squad orchestrator on such an endpoint
            // hits the API 400 "thinking blocks cannot be modified". Mirrors bootstrap ~5957-5958.
            const claudeProvider = input.providerId ? providerStore.get(input.providerId) : null;
            const isAnthropicCompat = claudeProvider?.type === 'anthropic-compat';
            // Squad orchestrator effort cap → 'high' when carrying a roster and no effort set
            // (bootstrap ~5967). Applied to a local so both the builder and --settings read it.
            let claudeEffort = input.effort;
            if (input.squadCallable && input.squadCallable.length > 0 && !claudeEffort) {
                claudeEffort = 'high';
            }
            // workspace policy prompt (bootstrap ~5986). workspacePath drives the boundary text.
            const workspacePath = input.workspacePath ?? input.cwd ?? activeWorkspace;
            const workspacePolicyPrompt = workspaceAccessInstruction(workspacePath, dataDir, workspaceConfigStore);
            // orchestrator own-skill scope + roster prompt block + per-squad instructions
            // (bootstrap ~5991-6002). ensureSkillsForCli mirrors bound skills into the CLI dir.
            const orchAllowedSkills = input.orchestratorAllowedSkills?.length ? input.orchestratorAllowedSkills : null;
            if (input.squadCallable?.length)
                ensureSkillsForCli(input.agent, orchAllowedSkills);
            // routeOnly (T1 PILOT opening) applies only to the piloto (squadRole==='orchestrator').
            // A chefe (delegateOnly:true but NOT orchestrator) must get the T2/ORCHESTRATOR opening,
            // not the T1 routing opening — see buildClaudeSpawnArgs.ts:buildDelegateOnlyRule which
            // already gates on squadRole==='orchestrator' for the ABSOLUTE RULE text.
            const isPiloto = input.squadRole === 'orchestrator' && input.delegateOnly === true;
            let capabilityMap;
            if (isPiloto && overclockBridge.catalogList) {
                const [skillItems, rawProviders] = await Promise.all([
                    overclockBridge.catalogList({ type: 'skill', includeMissing: false }),
                    overclockBridge.mediaProviders ? overclockBridge.mediaProviders() : Promise.resolve([]),
                ]);
                // Ground the piloto in CAPABILITY, not slugs: carry each skill's first
                // sentence so it can map "user wants a site whose look they like" →
                // overclock-site-design-dna (extracts a design system from a real site).
                // A bare slug is opaque and the piloto falls back to generic tech questions.
                const skills = skillItems.map((s) => {
                    const first = (s.description ?? '').split(/(?<=[.!?])\s/)[0].trim();
                    const gist = first.length > 160 ? `${first.slice(0, 157)}…` : first;
                    return gist ? `${s.name} — ${gist}` : s.name;
                });
                const providers = Array.isArray(rawProviders)
                    ? rawProviders
                        .filter((p) => p && (p.type || p.kind))
                        .map((p) => `${p.type ?? p.kind}(${p.label ?? p.type ?? p.kind})`)
                    : [];
                const catalogDb = getGlobalDb(dataDir);
                ensureCatalogSchema(catalogDb);
                ensureOverlaySchema(catalogDb);
                const organized = listUncategorized(catalogDb, 'skill').length === 0 &&
                    listUncategorized(catalogDb, 'agent').length === 0;
                const overlayMap = getOverlayMap(catalogDb);
                const byCategory = {};
                const inventory = listCategorizedForSynthesis(catalogDb);
                for (const row of inventory) {
                    ;
                    (byCategory[row.category] ??= []).push(row.name);
                }
                const stacks = listStacks(catalogDb).map((s) => ({
                    name: s.name,
                    summary: s.summary,
                    // member_keys is typed string[] but the synthesizer can write objects (e.g. {key,name}) —
                    // the `as string[]` cast lies, so a bare k.split('…') threw "k.split is not a function" and
                    // crashed the whole agentic launch. Coerce each entry to a string before splitting.
                    members: s.member_keys
                        .map((raw) => {
                        if (typeof raw === 'string')
                            return raw;
                        const o = raw;
                        return String(o?.key ?? o?.name ?? '');
                    })
                        .filter((k) => k.length > 0)
                        .map((k) => {
                        const ov = overlayMap.get(k);
                        const nm = k.split(':').slice(1).join(':') || k;
                        return ov?.purpose ? `${nm} — ${ov.purpose}` : nm;
                    }),
                }));
                capabilityMap = { skills, providers, organized, stacks, byCategory };
            }
            const squadPromptBlock = buildSquadPromptBlock(input.squadCallable, orchAllowedSkills, isPiloto, capabilityMap);
            const squadInstructionParts = [
                input.nativeInstructions?.trim() ? input.nativeInstructions.trim() : '',
                input.orchestratorInstructions?.trim() ? `## Squad-specific orchestrator instructions (from this squad's config)\n${input.orchestratorInstructions.trim()}` : '',
            ].filter(Boolean);
            // Per-pane MCP config when the pane carries squad-selected media providers — mirrors
            // Electron ensureMcpConfigForClaudePane(mcpSpawnDefaults). The defaults ride as query
            // params on the SSE URL so overclock_image_generate/video_generate route to the selected
            // provider for THIS pane without the agent choosing. The shared mcpConfigPath (no per-pane
            // defaults) stays the path for panes without media providers.
            let claudeMcpConfigPath = mcpConfigPath ?? null;
            // Per-pane MCP config carries the pane's OWN id as callerPaneId so handoff_submit /
            // handoff_list / pane_spawn resolve the pane by its MCP connection. REQUIRED for EVERY
            // claude pane — not just squad/handoff/media panes. A plain pane_spawn worker without
            // callerPaneId got "no paneId could be resolved" on handoff and the orchestrator never
            // woke (the worker→caller wake mapping below also depends on the worker resolving its id).
            // Previously gated on requireHandoff/squadCallable/media, which left ad-hoc pane_spawn
            // workers (the common orchestration case) unable to hand off. callerPaneId=id is always
            // safe; the media/allowlist fields stay conditional inside the write.
            if (mcpHost && mcpConfigPath) {
                const paneConfigPath = join(panesDir, `mcp-pane-${id}.json`);
                // Resolve the mission early (mirrors the resolution at config-object construction ~line 941)
                // so the per-pane config can carry it as defaults.missionId. Without this, overclock_agent_invoke
                // reads defaults?.missionId = undefined and workers fall to resolveActiveMissionId (the focused
                // tab at spawn-time), landing in the wrong mission when the user navigates between squads.
                const callerMissionIdForConfig = input.callerPaneId ? configs.get(input.callerPaneId)?.missionId : undefined;
                const resolvedMissionIdForConfig = input.missionId ?? callerMissionIdForConfig ?? resolveActiveMissionId(input.workspacePath);
                const disabledNativeForConfig = serviceKeysStore.readNativeDisabled();
                try {
                    await mcpHost.writeConfig(paneConfigPath, {
                        agent: 'claude',
                        providerId: input.providerId,
                        model: input.model,
                        callerPaneId: id,
                        ...(resolvedMissionIdForConfig ? { missionId: resolvedMissionIdForConfig } : {}),
                        ...(input.imageProvider ? { imageProvider: input.imageProvider } : {}),
                        ...(input.videoProvider ? { videoProvider: input.videoProvider } : {}),
                        ...(input.audioProvider ? { audioProvider: input.audioProvider } : {}),
                        ...(input.allowedImageProviders?.length ? { allowedImageProviders: input.allowedImageProviders } : {}),
                        ...(input.allowedVideoProviders?.length ? { allowedVideoProviders: input.allowedVideoProviders } : {}),
                        ...(input.allowedAudioProviders?.length ? { allowedAudioProviders: input.allowedAudioProviders } : {}),
                        ...(input.allowedImageModels?.length ? { allowedImageModels: input.allowedImageModels } : {}),
                        ...(input.allowedVideoModels?.length ? { allowedVideoModels: input.allowedVideoModels } : {}),
                        ...(disabledNativeForConfig.length ? { disabledNativeProviders: disabledNativeForConfig } : {}),
                        ...(input.allowedCLIs !== undefined ? { allowedCLIs: input.allowedCLIs } : {}),
                        ...(input.allowedAgents?.length ? { allowedAgents: input.allowedAgents } : {}),
                        ...(input.missionAllowedSkills?.length ? { missionAllowedSkills: input.missionAllowedSkills } : {}),
                        // F-176: the pane's orchestration style feeds the chef_invoke mode gate (torre ↔
                        // cadeia mutual exclusion). Same rail as the R5 allowlists above.
                        ...(input.styleId ? { styleId: input.styleId } : {}),
                        // F-176 r3: the pane's squad role feeds the chef_invoke piloto-only gate — an
                        // avulso pane (no squadRole) must not be able to summon chefes.
                        ...(input.squadRole ? { squadRole: input.squadRole } : {}),
                    });
                    claudeMcpConfigPath = paneConfigPath;
                }
                catch (err) {
                    process.stderr.write(`[sidecar] per-pane MCP config falhou (${id}); usando o config compartilhado: ${err instanceof Error ? err.message : String(err)}\n`);
                }
            }
            const claudeBuild = buildClaudeSpawnArgs({
                args: agentArgs,
                config: {
                    agent: 'claude',
                    effort: claudeEffort,
                    squadCallable: input.squadCallable,
                    orchestratorAllowedSkills: input.orchestratorAllowedSkills,
                    squadId: input.squadId,
                    requireHandoff: input.requireHandoff,
                    squadRole: input.squadRole,
                    delegateOnly: input.delegateOnly,
                    leaf: input.leaf,
                    nativeInstructions: input.nativeInstructions,
                    orchestratorInstructions: input.orchestratorInstructions,
                    extraSystemPrompt: input.extraSystemPrompt,
                    extraAllowedTools: input.extraAllowedTools,
                    claudeSkillGate: input.claudeSkillGate,
                    wardrobe: input.wardrobe,
                },
                // provider defaults resolved below (after provider lookup) would be circular here;
                // the sidecar passes the per-pane effort only (provider defaultEffort/Verbose =
                // follow-up, same as the codex branch which the sidecar also omits). The snapshot
                // baseline passes config.effort directly, matching this.
                workspacePolicyPrompt,
                squadPromptBlock,
                squadInstructionParts,
                orchAllowedSkills,
                mcpConfigPath: claudeMcpConfigPath,
                diagnosticsEnabled: sidecarDiagnosticsEnabled,
            });
            // ── --settings: skill gate (PreToolUse) + handoff hooks (PostToolUse/Stop) ──
            // Mirrors bootstrap ~6302-6337. The gate/hook .mjs files land in dataDir (the sidecar's
            // GLOBAL_DIR equivalent). buildClaudeSpawnArgs returns the gate DESCRIPTOR; the host writes it.
            if (!agentArgs.includes('--settings')) {
                const settings = {};
                // Third-party Anthropic-compatible endpoints: force-disable thinking so tool-use lands in
                // normal content and squad panes don't hit the 400 "thinking cannot be modified" (bootstrap
                // ~6307-6311). Must precede ultracode so an explicit ultracode request still wins below.
                if (isAnthropicCompat) {
                    settings.alwaysThinkingEnabled = false;
                    settings.effortLevel = 'low';
                    if (input.model)
                        settings.model = input.model;
                }
                if (claudeEffort === 'ultracode')
                    settings.ultracode = true;
                if (permissionMode === 'bypassPermissions')
                    settings.skipDangerousModePermissionPrompt = true;
                const hookGroups = {};
                // PreToolUse composes two independent gates: the skill/tool gate (which of hundreds of tools)
                // and the PreResourceUse gate (media-resource access — keep generation inside the tools).
                const preHooks = [];
                const gate = claudeBuild.claudeSkillGate;
                if (gate) {
                    const gatePath = writeClaudeSkillGate(panesDir, id, gate.allowedSkills, gate.allowedTools, gate.deniedTools ?? null, gate.requiredSkillsForMedia ?? null);
                    if (gatePath)
                        preHooks.push({ type: 'command', command: `node ${JSON.stringify(gatePath)}` });
                }
                // PreResourceUse — a squad/media pane must not bypass overclock_*_generate by reading the
                // key store or curling a provider host. Applies whenever the pane is a squad worker or has
                // media providers threaded (the panes that are supposed to generate via the tools).
                const resourceGated = !!(input.requireHandoff || input.squadId ||
                    input.imageProvider || input.videoProvider || input.audioProvider ||
                    input.allowedImageProviders?.length || input.allowedVideoProviders?.length || input.allowedAudioProviders?.length);
                if (resourceGated) {
                    preHooks.push({ type: 'command', command: `node ${JSON.stringify(writeResourceGate(panesDir, id))}` });
                }
                // Dangerous-command gate — screens Bash tool_input.command against the destructive-op catalog.
                // OPT-IN ABSOLUTE: gate hook is pushed ONLY when workspace config explicitly sets
                // dangerousCommandGate (non-null). Absent config => no hook pushed, behaviour identical
                // to today (avulso / cinema / squad flows unaffected). Hard block (exits 2) only when
                // blockMode=true; warn-only (exits 0) when blockMode=false.
                {
                    try {
                        const wsConfig = workspaceConfigStore.get(workspacePath);
                        const dcCfg = wsConfig.dangerousCommandGate;
                        if (dcCfg !== null && dcCfg !== undefined) {
                            const dcBlockMode = dcCfg.blockMode === true;
                            const dcAllowlist = Array.isArray(dcCfg.allowlist) ? dcCfg.allowlist : [];
                            preHooks.push({ type: 'command', command: `node ${JSON.stringify(writeDangerousCommandGate(panesDir, id, dcAllowlist, dcBlockMode))}` });
                        }
                    }
                    catch { /* best-effort — any error => no gate pushed (safe default) */ }
                }
                // Workflow-tool DENY gate for delegation chefes: delegateOnly + requireHandoff panes are
                // sub-level orchestrators whose job is visible pane delegation (agent_invoke). Blocking
                // Workflow here is the HARD enforcement of AGENTS.md's visible-delegation principle.
                // Prose instructions alone failed (Run4 chefe used Workflow → 5 invisible background agents).
                // Top orchestrators (delegateOnly but no requireHandoff) are intentionally NOT blocked.
                if (input.delegateOnly && input.requireHandoff) {
                    preHooks.push({ type: 'command', command: `node ${JSON.stringify(writeWorkflowDenyGate(panesDir, id))}` });
                }
                if (preHooks.length > 0)
                    hookGroups.PreToolUse = [{ matcher: '*', hooks: preHooks }];
                // F-037: hooks armed by requireHandoff (squad contract) OR callerPaneId — a pane_spawn
                // worker carries no requireHandoff (the tool schema has no such field) but its caller is
                // blocked on handoff_submit all the same; without the Stop hook the worker declared "done"
                // in its own terminal, idled, and the orchestrator was never woken. callerPaneId persists
                // through restore (rehydratePaneCargo), so resumed workers keep the enforcement.
                if (needsHandoffEnforcement(input)) {
                    const h = writeHandoffEnforcementHooks(panesDir, id);
                    hookGroups.PostToolUse = [{ matcher: '*', hooks: [{ type: 'command', command: `node ${JSON.stringify(h.post)}` }] }];
                    hookGroups.Stop = [{ hooks: [{ type: 'command', command: `node ${JSON.stringify(h.stop)}` }] }];
                }
                if (Object.keys(hookGroups).length > 0)
                    settings.hooks = hookGroups;
                if (Object.keys(settings).length > 0)
                    agentArgs.push('--settings', JSON.stringify(settings));
            }
        }
        // F-178: provider LOCAL via codex (Ollama/LM Studio) roteia pela via OSS nativa do CLI
        // (espelha bootstrap Electron ~6037). Sem `--oss --local-provider`, o codex logado numa
        // conta ChatGPT ignora o env OPENAI_BASE_URL e sobe cloud, rejeitando o modelo local.
        // F-186: rota 'cloud' (--oss sem --local-provider, F-181) revertida — o binário exige
        // backend Ollama e sai na hora com base URL remota. Só local resolve aqui.
        // O env CODEX_OSS_BASE_URL correspondente entra no bloco de env do provider abaixo.
        const spawnCodexOssProvider = input.agent === 'codex' && input.providerId
            ? resolveCodexOssProvider(providerStore.get(input.providerId))
            : null;
        if (spawnCodexOssProvider && !agentArgs.includes('--oss')) {
            agentArgs.push('--oss', '--local-provider', spawnCodexOssProvider);
        }
        // F-186: provider openai-compat REMOTO via codex (DeepSeek, Fireworks…) roteia pelo
        // codexChatProxy local — codex >= 0.142 só fala Responses API (`wire_api = "chat"`
        // removido) e esses providers só expõem /chat/completions. O proxy traduz os dois
        // sentidos; a API key real fica no sidecar (nunca no argv do pane).
        if (input.agent === 'codex' && input.providerId && !spawnCodexOssProvider) {
            const remoteProvider = providerStore.get(input.providerId);
            const remoteBaseUrl = codexRemoteOpenAiBaseUrl(remoteProvider);
            const remoteApiKey = remoteProvider?.env?.OPENAI_API_KEY;
            if (remoteBaseUrl && remoteApiKey && !agentArgs.some((a) => a.startsWith('model_provider='))) {
                try {
                    const proxyPort = await ensureCodexChatProxy({
                        providerId: input.providerId,
                        upstreamBaseUrl: remoteBaseUrl,
                        apiKey: remoteApiKey,
                    });
                    agentArgs.push('-c', 'model_provider=overclock', '-c', `model_providers.overclock.name=${remoteProvider?.label ?? 'Overclock'}`, '-c', `model_providers.overclock.base_url=http://127.0.0.1:${proxyPort}/v1`, '-c', 'model_providers.overclock.env_key=OPENAI_API_KEY', '-c', 'model_providers.overclock.wire_api=responses');
                }
                catch (err) {
                    process.stderr.write(`[sidecar] [spawn] codexChatProxy falhou pro provider ${input.providerId}: ${String(err)}\n`);
                }
            }
        }
        // Codex: MCP via -c mcp_servers.overclock.* (args, espelha bootstrap ~6014).
        // mcpConfigPath = sinal de host pronto (streamableHttpUrl exige port>0).
        if (input.agent === 'codex' && mcpHost && mcpConfigPath && !agentArgs.some((a) => a.includes('mcp_servers.overclock.'))) {
            // Thread media-provider defaults into the codex MCP URL so applyAllowlistToSchema and
            // resolveProvider apply to codex workers just like they do for claude workers (which get the
            // allowlist via per-pane MCP config). Without this codex workers see overclock_image_generate
            // with the full provider enum regardless of what the squad restricted.
            // callerPaneId=id is ALWAYS threaded so a codex pane_spawn worker resolves its own paneId on
            // handoff_submit (claude parity — see the per-pane MCP config above). Media/allowlist fields
            // ride alongside only when the squad pinned them.
            const codexMcpMediaDefaults = {
                callerPaneId: id,
                ...(input.imageProvider ? { imageProvider: input.imageProvider } : {}),
                ...(input.videoProvider ? { videoProvider: input.videoProvider } : {}),
                ...(input.audioProvider ? { audioProvider: input.audioProvider } : {}),
                ...(input.allowedImageProviders?.length ? { allowedImageProviders: input.allowedImageProviders } : {}),
                ...(input.allowedVideoProviders?.length ? { allowedVideoProviders: input.allowedVideoProviders } : {}),
                ...(input.allowedAudioProviders?.length ? { allowedAudioProviders: input.allowedAudioProviders } : {}),
                ...(input.allowedImageModels?.length ? { allowedImageModels: input.allowedImageModels } : {}),
                ...(input.allowedVideoModels?.length ? { allowedVideoModels: input.allowedVideoModels } : {}),
                ...(input.allowedCLIs !== undefined ? { allowedCLIs: input.allowedCLIs } : {}),
                ...(input.allowedAgents?.length ? { allowedAgents: input.allowedAgents } : {}),
                ...(input.missionAllowedSkills?.length ? { missionAllowedSkills: input.missionAllowedSkills } : {}),
            };
            agentArgs.push(...codexMcpArgs(mcpHost.streamableHttpUrl('codex', input.model, input.providerId, codexMcpMediaDefaults)));
        }
        // The mission of the pane that invoked this spawn (if any) — so swarms launched from a
        // pane stay in THAT pane's mission, not whatever tab the user navigated to afterward.
        const callerMissionId = input.callerPaneId ? configs.get(input.callerPaneId)?.missionId : undefined;
        const config = {
            id,
            agent: input.agent || 'shell',
            cwd: input.cwd || process.cwd(),
            shellPath: input.shellPath,
            cols: input.cols ?? 80,
            rows: input.rows ?? 24,
            ...(agentArgs.length ? { args: agentArgs } : {}),
            // Squad metadata for the worker roster lookup (spawnIsolatedAgent reads these off
            // the orchestrator pane's stored config). workspacePath also feeds handoff scoping.
            ...(input.squadCallable ? { squadCallable: input.squadCallable } : {}),
            ...(input.squadId ? { squadId: input.squadId } : {}),
            // Persist leaf+delegateOnly via resolvePersistedSquadFlags (pure helper, unit-tested in
            // packages/sidecar). leaf feeds the CLI-agnostic depth-cap gate (spawnIsolatedAgent.ts);
            // delegateOnly feeds the pane_spawn bridge gate (shouldBlockSquadPaneSpawn). Both MUST
            // be stored in SidecarPaneConfig so configs.get(paneId) returns them on subsequent MCP
            // requests — without storage both gates are always no-ops.
            ...resolvePersistedSquadFlags(input),
            // G1-restore: squadRole, nativeInstructions, and orchestratorAllowedSkills were previously
            // consumed at spawn-time only and never stored on SidecarPaneConfig. Without storage they
            // are lost on cold-restore: squadRole=undefined → isPiloto=false (wrong T2 route); the
            // squad playbook and skill gate are silently dropped. All three must round-trip through
            // SessionManager so handleRestorePane can re-inject them into the new spawn.
            ...(input.squadRole ? { squadRole: input.squadRole } : {}),
            ...(input.nativeInstructions ? { nativeInstructions: input.nativeInstructions } : {}),
            ...(input.orchestratorAllowedSkills !== undefined ? { orchestratorAllowedSkills: input.orchestratorAllowedSkills } : {}),
            ...(input.workspacePath ? { workspacePath: input.workspacePath } : {}),
            // Mission resolution order: (1) explicit missionId; (2) the CALLER pane's OWN mission —
            // a swarm launched from a pane in Mission A must land in A even if the user has since
            // navigated to Mission B in the UI; (3) the workspace's active mission (the focused tab)
            // as a last resort for direct UI/MCP spawns with no caller context.
            ...((input.missionId ?? callerMissionId ?? resolveActiveMissionId(input.workspacePath)) ? { missionId: input.missionId ?? callerMissionId ?? resolveActiveMissionId(input.workspacePath) } : {}),
            // C2b: persist the model so SessionManager.save() writes it to panes.json and the
            // restore card shows the correct model version (e.g. fable-5). Without this field the
            // model lived only in agentArgs and was lost when the pane exited.
            ...(input.model ? { model: input.model } : {}),
            // Persist the providerId and session fields so they survive a kill→reload cycle
            // and the restore card can resume under the correct account/session.
            ...(input.providerId ? { providerId: input.providerId } : {}),
            ...(input.session ? { session: input.session } : {}),
            ...(input.claudeSessionId ? { claudeSessionId: input.claudeSessionId } : {}),
            ...(input.claudeSessionRotatePending ? { claudeSessionRotatePending: true } : {}),
            // F-003: persist the spawner's pane id so panes.json / restore cards can show
            // parenthood (who spawned whom). Previously threaded through input only for
            // mission resolution + roster gate, never stored on the config itself.
            ...(input.callerPaneId ? { callerPaneId: input.callerPaneId } : {}),
            // Media providers persisted on the pane config so spawnIsolatedAgent (configs.get(callerId))
            // can inherit them into nested workers, mirroring the Electron orchestrator pane config.
            ...(input.imageProvider ? { imageProvider: input.imageProvider } : {}),
            ...(input.videoProvider ? { videoProvider: input.videoProvider } : {}),
            ...(input.audioProvider ? { audioProvider: input.audioProvider } : {}),
            ...(input.allowedImageProviders?.length ? { allowedImageProviders: input.allowedImageProviders } : {}),
            ...(input.allowedVideoProviders?.length ? { allowedVideoProviders: input.allowedVideoProviders } : {}),
            ...(input.allowedAudioProviders?.length ? { allowedAudioProviders: input.allowedAudioProviders } : {}),
            ...(input.allowedImageModels?.length ? { allowedImageModels: input.allowedImageModels } : {}),
            ...(input.allowedVideoModels?.length ? { allowedVideoModels: input.allowedVideoModels } : {}),
            ...(input.allowedCLIs !== undefined ? { allowedCLIs: input.allowedCLIs } : {}),
            ...(input.allowedAgents?.length ? { allowedAgents: input.allowedAgents } : {}),
            ...(input.missionAllowedSkills?.length ? { missionAllowedSkills: input.missionAllowedSkills } : {}),
            // F-033: persist the REST of the cargo — previously consumed at spawn-time only, so a
            // resumed pane lost its gates/hooks/dossier/effort. save() spreads the whole config into
            // panes.json; rehydratePaneCargo re-applies these on the next spawn of this paneId.
            ...(input.effort ? { effort: input.effort } : {}),
            permissionMode,
            ...(input.requireHandoff ? { requireHandoff: true } : {}),
            ...(input.claudeSkillGate ? { claudeSkillGate: input.claudeSkillGate } : {}),
            ...(input.extraSystemPrompt ? { extraSystemPrompt: input.extraSystemPrompt } : {}),
            ...(input.extraAllowedTools !== undefined ? { extraAllowedTools: input.extraAllowedTools } : {}),
            ...(input.orchestratorInstructions ? { orchestratorInstructions: input.orchestratorInstructions } : {}),
            ...(input.wardrobe ? { wardrobe: input.wardrobe } : {}),
            ...(input.styleId ? { styleId: input.styleId } : {}),
        };
        if (input.providerId && config.agent !== 'shell') {
            const provider = providerStore.get(input.providerId);
            if (provider) {
                if (!isClaudeAccountProvider(provider) && !isCodexAccountProvider(provider)) {
                    // Provider normal (endpoint/token custom): injeta env direto.
                    if (provider.env)
                        config.env = { ...provider.env };
                    // F-178: a via OSS do codex lê CODEX_OSS_BASE_URL (OPENAI_BASE_URL não muda a rota).
                    if (spawnCodexOssProvider) {
                        const ossBaseUrl = codexOssBaseUrl(provider);
                        if (ossBaseUrl)
                            config.env = { ...(config.env ?? {}), CODEX_OSS_BASE_URL: ossBaseUrl };
                    }
                }
                else if (isClaudeAccountProvider(provider) && provider.claudeConfigDir) {
                    // INV-6: kill-switch antes de qualquer spawn de conta extra.
                    if (multiAccountGuard.isMultiAccountDisabled()) {
                        process.stderr.write(`[sidecar] [spawn] multi-account kill-switch ativo — abortando pane ${id}\n`);
                        return { id, error: 'Multi-conta desabilitada (kill-switch/watchdog). Verifique seu login e rode `claude update`.' };
                    }
                    // INV-2/INV-3: probe de versão ANTES de CLAUDE_CONFIG_DIR; falha → aborta (NUNCA spawn sem isolação).
                    const probe = await probeClaudeCliKeychainScoping(resolveCommand('claude').binary);
                    if (!probe.ok) {
                        const reason = `Multi-account pane blocked: CLI ${probe.version ?? 'unknown'} não suporta keychains isolados (requer >= ${probe.required}). Rode \`claude update\`.`;
                        process.stderr.write(`[sidecar] [spawn] CLI keychain gate recusado — ${reason}\n`);
                        return { id, error: reason };
                    }
                    // INV-5: snapshot da conta principal na 1ª spawn de conta extra.
                    const mainStatus = await readClaudeAccountStatus(null);
                    multiAccountGuard.snapshotMainAccount(mainStatus.email);
                    config.env = { ...(config.env ?? {}), CLAUDE_CONFIG_DIR: provider.claudeConfigDir };
                    // Bound squad skills are seeded into the DEFAULT ~/.claude/skills, but this pane runs
                    // under a DIFFERENT account's CLAUDE_CONFIG_DIR — without mirroring them there the agent
                    // gets "Unknown skill" (e.g. the researcher loading overclock-squad-catalog-search on a
                    // non-default Claude account). Mirror the bound skills into the account's skills dir.
                    try {
                        const boundSkills = [
                            ...(input.orchestratorAllowedSkills ?? []),
                            ...(input.claudeSkillGate?.allowedSkills ?? []),
                        ];
                        if (boundSkills.length > 0) {
                            const srcRoot = join(homedir(), '.claude', 'skills');
                            const dstRoot = join(provider.claudeConfigDir, 'skills');
                            mkdirSync(dstRoot, { recursive: true });
                            for (const skill of new Set(boundSkills)) {
                                const s = join(srcRoot, skill);
                                const d = join(dstRoot, skill);
                                if (existsSync(d) || !existsSync(s))
                                    continue;
                                try {
                                    symlinkSync(s, d, 'dir');
                                }
                                catch {
                                    try {
                                        cpSync(s, d, { recursive: true });
                                    }
                                    catch { /* best-effort */ }
                                }
                            }
                        }
                    }
                    catch { /* best-effort skill mirror */ }
                }
                else if (isCodexAccountProvider(provider) && provider.codexHomeDir) {
                    // Codex: auth em arquivo dentro do CODEX_HOME (sem keychain compartilhada → sem probe).
                    try {
                        mkdirSync(provider.codexHomeDir, { recursive: true, mode: 0o700 });
                    }
                    catch { /* já existe */ }
                    config.env = { ...(config.env ?? {}), CODEX_HOME: provider.codexHomeDir };
                }
                // C-102: per-account proxy — Claude accounts only, defense in depth via
                // session-email gate (UI already hides the field for other users). Uses
                // readSessionEmail (same source as auth:profile), NOT getLicenseProfile
                // (BUG 1: that one hardcodes email:null in dev and holds the SUBSCRIPTION
                // email in prod, which can differ from the logged-in account).
                if (provider.host === 'claude' && provider.proxyUrl) {
                    if (readSessionEmail() === PER_ACCOUNT_PROXY_OWNER_EMAIL) {
                        config.env = {
                            ...(config.env ?? {}),
                            HTTPS_PROXY: provider.proxyUrl,
                            HTTP_PROXY: provider.proxyUrl,
                            ALL_PROXY: provider.proxyUrl,
                            NO_PROXY: 'localhost,127.0.0.1',
                        };
                    }
                }
            }
        }
        // C-063: Claude Code 2.x roda o TUI no alternate buffer, que no xterm.js nasce sem
        // scrollback (hardcoded) — a roda vira setas pro TUI e o viewport nunca overflowa,
        // então scrollbar/posição são impossíveis por construção (F-063 Correção 4). O env
        // oficial CLAUDE_CODE_DISABLE_ALTERNATE_SCREEN devolve o renderer de buffer normal:
        // o transcript flui pro scrollback do xterm e a barra vermelha do pane volta a
        // mostrar posição real (mesmo comportamento do pane de shell). codex/gemini não têm
        // equivalente e seguem em alt-screen. Provado A/B fora do app: com o env o CLI não
        // emite CSI ?1049h nem mouse-tracking (?1000h/?1002h/?1003h).
        if (config.agent === 'claude') {
            config.env = { ...(config.env ?? {}), CLAUDE_CODE_DISABLE_ALTERNATE_SCREEN: '1' };
        }
        // F-030/F-033: identity env for EVERY agent pane — previously only the spawnIsolatedAgent
        // wrapper injected these, so a direct pty:spawn pane (and every RESUMED pane) booted with
        // no self-identity. Placed after the provider block so provider env is preserved; the
        // spawnIsolatedAgent wrapper re-sets the same values (idempotent). PtyManager merges
        // config.env after its inherited-env scrub, so these survive to the CLI.
        if (config.agent && config.agent !== 'shell') {
            config.env = {
                ...(config.env ?? {}),
                OVERCLOCK_PANE_ID: id,
                ...(config.missionId ? { OVERCLOCK_MISSION_ID: config.missionId } : {}),
            };
        }
        return { id, config };
    };
    // injectCliMcp — CLIs sem flag --mcp-config (gemini) recebem o MCP via arquivo de
    // config no workspace, escrito antes do spawn. Claude já vai por --mcp-config
    // (buildSpawnConfig). No-op se o host MCP ainda não subiu (mcpConfigPath null).
    // paneId is threaded as callerPaneId in the MCP URL so the sidecar can resolve
    // callerCfg for this pane on every MCP request — required for the leaf depth-cap
    // gate and roster gate to fire for gemini/antigravity workers (mirrors the claude
    // per-pane MCP config at ~1124 and the codex codexMcpMediaDefaults at ~1226).
    const injectCliMcp = async (agent, cwd, paneId, model, providerId) => {
        if (!mcpHost || !mcpConfigPath)
            return;
        const mcpDefaults = paneId ? { callerPaneId: paneId } : undefined;
        if (agent === 'gemini') {
            try {
                await ensureGeminiMcpConfig(cwd, mcpHost.streamableHttpUrl('gemini', model, providerId, mcpDefaults));
            }
            catch (err) {
                process.stderr.write(`[sidecar] gemini MCP inject falhou: ${err instanceof Error ? err.message : String(err)}\n`);
            }
        }
        else if (agent === 'antigravity') {
            try {
                await ensureAntigravityMcpConfig(cwd, mcpHost.streamableHttpUrl('antigravity', model, providerId, mcpDefaults), mcpCoreToolNames());
            }
            catch (err) {
                process.stderr.write(`[sidecar] antigravity MCP inject falhou: ${err instanceof Error ? err.message : String(err)}\n`);
            }
        }
        else if (agent === 'grok') {
            try {
                await ensureGrokMcpConfig(mcpHost.streamableHttpUrl('grok', model, providerId, mcpDefaults));
            }
            catch (err) {
                process.stderr.write(`[sidecar] grok MCP inject falhou: ${err instanceof Error ? err.message : String(err)}\n`);
            }
        }
    };
    const tryRemoteSpawn = async (id, input) => {
        const agent = input.agent || 'shell';
        let cwdRef, wsRef;
        try {
            cwdRef = parseWorkspaceRef(input.cwd ?? '');
            wsRef = parseWorkspaceRef(input.workspacePath ?? '');
        }
        catch (err) {
            return { remote: true, result: { ok: false, error: err instanceof Error ? err.message : String(err) } };
        }
        const remoteRef = cwdRef.kind === 'remote' ? cwdRef : wsRef.kind === 'remote' ? wsRef : null;
        if (!remoteRef)
            return { remote: false };
        const remoteWorkspacePath = wsRef.kind === 'remote' ? wsRef.raw : remoteRef.raw;
        const remoteCwd = cwdRef.kind === 'remote' ? cwdRef.path : remoteRef.path;
        let remoteArgs;
        // Orphan reattach: the agent already runs inside the existing tmux session — skip CLI detection
        // and arg building entirely, just attach (RemoteSshTmuxManager handles it via remoteTmuxSession).
        if (agent !== 'shell' && !input.remoteTmuxSession) {
            // HARD-FAIL when the remote CLI is absent (bootstrap ~5796-5798) — never fall back
            // to a local spawn with a bogus ssh:// cwd.
            const found = await detectRemoteClis(remoteRef.hostAlias);
            if (!found.has(agent)) {
                return { remote: true, result: { ok: false, error: `${agent} CLI was not found on remote host ${remoteRef.hostAlias}.` } };
            }
            // Build remote agent args: strip managed flags is local-only; apply permission + model
            // (mirrors buildRemoteAgentArgs ~5636-5652). Resume/MCP/squad blocks stay local-only here
            // (remote squad orchestration = follow-up; same scope boundary as the Electron remote path).
            const rArgs = Array.isArray(input.args) ? [...input.args] : [];
            applyPermissionArgs(agent, rArgs, resolveSpawnPermissionMode(input.permissionMode, agent));
            if (agent !== 'antigravity' && input.model && !rArgs.includes('--model')) {
                rArgs.push('--model', input.model);
            }
            remoteArgs = rArgs;
        }
        // MCP parity for remote panes (Fase 1: claude). When the MCP host is up, generate the same
        // mcp-config the local panes get (callerPaneId=id so handoff_*/pane_spawn/mission_* resolve
        // THIS pane) and pass it + the host port to the SSH manager, which reverse-tunnels the port and
        // writes the config on the remote, then injects --mcp-config. Without this the remote agent has
        // no overclock MCP → can't add a pane to the same mission. Codex/gemini remote MCP = follow-up.
        let mcpPort;
        let mcpConfigJson;
        if (agent === 'claude' && mcpHost && mcpConfigPath) {
            const port = mcpHost.status().port;
            if (port && port > 0) {
                mcpPort = port;
                mcpConfigJson = mcpHost.buildConfigJson({
                    agent: 'claude',
                    providerId: input.providerId,
                    model: input.model,
                    callerPaneId: id,
                });
            }
        }
        // Mission resolution mirrors the local path (explicit → caller's → active). Computed BEFORE the
        // spawn so it can be tagged onto the tmux session on the host (@ovc_mission) — that tag is what
        // lets a session survive local-state loss and still group under its mission on the next scan.
        const resolvedMissionId = input.missionId
            ?? (input.callerPaneId ? configs.get(input.callerPaneId)?.missionId : undefined)
            ?? resolveActiveMissionId(remoteWorkspacePath);
        try {
            const result = await remotePty.spawn({
                id,
                agent,
                hostAlias: remoteRef.hostAlias,
                cwd: remoteCwd,
                workspacePath: remoteWorkspacePath,
                shellPath: agent === 'shell' ? input.shellPath : undefined,
                args: remoteArgs,
                mcpPort,
                mcpConfigJson,
                remoteTmuxSession: input.remoteTmuxSession,
                ...(resolvedMissionId ? { missionId: resolvedMissionId } : {}),
                ...(input.model ? { model: input.model } : {}),
            });
            remotePaneIds.add(id);
            if (agent !== 'shell')
                activeWorkspace = remoteWorkspacePath;
            // Record the remote pane in `configs` (same map as local panes) so: (1) a swarm spawned
            // FROM this pane resolves its mission via configs.get(callerPaneId)?.missionId; (2) it lands
            // in the right mission in the grid; (3) session:save-current persists it to panes.json for
            // restore.
            configs.set(id, {
                id,
                agent: agent || 'shell',
                cwd: remoteWorkspacePath,
                cols: 80,
                rows: 24,
                workspacePath: remoteWorkspacePath,
                ...(remoteArgs?.length ? { args: remoteArgs } : {}),
                ...(resolvedMissionId ? { missionId: resolvedMissionId } : {}),
                ...(input.providerId ? { providerId: input.providerId } : {}),
                ...(input.model ? { model: input.model } : {}),
                remoteHostAlias: remoteRef.hostAlias,
                remotePath: remoteCwd,
            });
            diagnostics.record({ level: 'info', source: 'pane', name: 'pane.spawned', paneId: id, workspacePath: remoteWorkspacePath, data: { agent, remote: true } });
            // Persist immediately so the remote pane is restorable after close/restart WITHOUT needing a
            // graceful quit. Remote restore (_scanRemote) reads panes.json only — there is no local
            // ~/.claude transcript scan for remote panes (local panes get that for free). Best-effort.
            try {
                const remoteForWs = new Map([...configs.entries()].filter(([pid, c]) => remotePaneIds.has(pid) && (c.workspacePath ?? c.cwd) === remoteWorkspacePath));
                await sessionManager.save(remoteWorkspacePath, remoteForWs);
            }
            catch (err) {
                process.stderr.write(`[sidecar] persist remote pane falhou (${id}): ${err instanceof Error ? err.message : String(err)}\n`);
            }
            return { remote: true, result: { ok: true, paneId: result.paneId, pid: result.pid, missionId: resolvedMissionId } };
        }
        catch (err) {
            return { remote: true, result: { ok: false, error: err instanceof Error ? err.message : String(err) } };
        }
    };
    host.ipcMain.handle('providers:list', () => {
        const file = readProvidersFile();
        // Apply factory defaults so the renderer badge never falls back to models[0] (fable-5)
        // when defaultModel is unset — same guard as the listProviders bridge below.
        const FACTORY_DEFAULTS = { 'claude-oauth': 'claude-opus-4-8' };
        return computeProviderList(cliPresence(), file, { mask: true }).map((p) => {
            const factory = FACTORY_DEFAULTS[p.id];
            const defaultModel = p.defaultModel ?? (factory && p.models?.includes(factory) ? factory : p.models?.[0]);
            return { ...p, defaultModel };
        });
    });
    // providers:save — upsert de um provider no providers.json (plaintext). Recusa
    // arquivo OC1\0-encriptado (não corrompe; migração D2 é follow-up). Preserva os
    // demais campos do FileShape. Versão simplificada (sem a validação/encriptação
    // do ProviderStore Electron — este user é plaintext; parity = follow-up).
    // providers:save/delete/setDefaultModel + contas claude/codex — via a classe ProviderStore
    // (writer único, formato FileShape correto). Guard anti-clobber p/ arquivo encriptado.
    host.ipcMain.handle('providers:save', (_e, raw) => {
        const p = raw;
        if (!p || typeof p.id !== 'string' || !p.id.trim())
            return { ok: false, error: 'invalid provider (id required)' };
        return providerStore.save(p);
    });
    host.ipcMain.handle('providers:delete', (_e, id) => {
        if (typeof id !== 'string')
            return { ok: false, error: 'invalid provider id' };
        return providerStore.delete(id);
    });
    host.ipcMain.handle('providers:setDefaultModel', (_e, providerId, model) => {
        if (typeof providerId !== 'string' || typeof model !== 'string')
            return { ok: false, error: 'providerId and model must be strings' };
        return providerStore.setLastSelectedModel(providerId, model);
    });
    host.ipcMain.handle('providers:addClaudeAccount', async (_e, label) => {
        if (typeof label !== 'string' || !label.trim())
            return { ok: false, error: 'label required' };
        // Coleta workspacePaths recentes p/ preseed de trust (espelha addClaudeAccountWithPreseed).
        const wsJsonPath = process.env['OVERCLOCK_WORKSPACES_JSON'] ?? join(dataDir, 'workspaces.json');
        let recentPaths = [];
        try {
            const parsed = JSON.parse(readFileSync(wsJsonPath, 'utf-8'));
            recentPaths = Array.isArray(parsed.recent) ? parsed.recent.map((e) => e.path).filter(Boolean) : [];
        }
        catch { /* sem workspaces.json — segue sem trust */ }
        const workspacePaths = [...new Set([activeWorkspace, ...recentPaths])].filter((p) => Boolean(p) && !p.startsWith('ssh://'));
        return addClaudeAccountSafe(providerStore, resolveCommand('claude').binary, workspacePaths, label.trim(), multiAccountGuard);
    });
    host.ipcMain.handle('providers:renameClaudeAccount', (_e, id, label) => {
        if (typeof id !== 'string' || !id)
            return { ok: false, error: 'invalid account id' };
        if (typeof label !== 'string' || !label.trim())
            return { ok: false, error: 'label required' };
        return providerStore.renameClaudeAccount(id, label.trim());
    });
    // C-102 — per-account proxy. Defense in depth: gate server-side too, not just
    // the UI's own hide/show (spec 2026-07-05-per-account-proxy-design.md). Gate
    // reads readSessionEmail() (same source as auth:profile/the UI), NOT
    // getLicenseProfile (BUG 1 — see readSessionEmail definition above).
    host.ipcMain.handle('providers:setClaudeAccountProxy', (_e, id, proxyUrl) => {
        if (typeof id !== 'string' || !id)
            return { ok: false, error: 'invalid account id' };
        if (typeof proxyUrl !== 'string')
            return { ok: false, error: 'proxyUrl required' };
        if (readSessionEmail() !== PER_ACCOUNT_PROXY_OWNER_EMAIL)
            return { ok: false, error: 'not authorized' };
        return providerStore.setClaudeAccountProxy(id, proxyUrl);
    });
    host.ipcMain.handle('providers:testProxy', async (_e, proxyUrl) => {
        if (typeof proxyUrl !== 'string' || !/^https?:\/\//i.test(proxyUrl)) {
            return { ok: false, error: 'invalid proxy url' };
        }
        if (readSessionEmail() !== PER_ACCOUNT_PROXY_OWNER_EMAIL)
            return { ok: false, error: 'not authorized' };
        try {
            const { ProxyAgent, fetch: undiciFetch } = await import('undici');
            const dispatcher = new ProxyAgent(proxyUrl);
            const res = await undiciFetch('https://ifconfig.me/ip', { dispatcher, signal: AbortSignal.timeout(10_000) });
            if (!res.ok)
                return { ok: false, error: `HTTP ${res.status}` };
            const ip = (await res.text()).trim();
            return { ok: true, ip };
        }
        catch (err) {
            return { ok: false, error: err instanceof Error ? err.message : String(err) };
        }
    });
    host.ipcMain.handle('providers:addCodexAccount', async (_e, label) => {
        if (typeof label !== 'string' || !label.trim())
            return { ok: false, error: 'label required' };
        return addCodexAccountSafe(providerStore, label.trim());
    });
    host.ipcMain.handle('providers:renameCodexAccount', (_e, id, label) => {
        if (typeof id !== 'string' || !id)
            return { ok: false, error: 'invalid account id' };
        if (typeof label !== 'string' || !label.trim())
            return { ok: false, error: 'label required' };
        return providerStore.renameCodexAccount(id, label.trim());
    });
    // remove*Account: a classe retorna configDir/homeDir; se deleteData, rm o dir isolado (fs).
    host.ipcMain.handle('providers:removeClaudeAccount', async (_e, id, deleteData) => {
        if (typeof id !== 'string' || !id)
            return { ok: false, error: 'invalid account id' };
        const r = providerStore.removeClaudeAccount(id);
        if (r.ok && deleteData === true && r.configDir) {
            try {
                const { rm } = await import('node:fs/promises');
                await rm(r.configDir, { recursive: true, force: true });
            }
            catch { /* best-effort */ }
        }
        return { ok: r.ok, error: r.error };
    });
    host.ipcMain.handle('providers:removeCodexAccount', async (_e, id, deleteData) => {
        if (typeof id !== 'string' || !id)
            return { ok: false, error: 'invalid account id' };
        const r = providerStore.removeCodexAccount(id);
        if (r.ok && deleteData === true && r.homeDir) {
            try {
                const { rm } = await import('node:fs/promises');
                await rm(r.homeDir, { recursive: true, force: true });
            }
            catch { /* best-effort */ }
        }
        return { ok: r.ok, error: r.error };
    });
    // providers:claudeAccounts/codexAccounts — rows pro UI multi-conta (email/loggedIn lidos do
    // config dir; NUNCA tokens). INV-5 watchdog: quando há contas extras, compara o email atual
    // da conta principal com o snapshot — se mudou, dispara alerta + kill-switch (corrupção).
    host.ipcMain.handle('providers:claudeAccounts', async () => {
        const main = await readClaudeAccountStatus(null);
        const claudeAccountRows = providerStore.listClaudeAccounts();
        if (claudeAccountRows.length > 0)
            multiAccountGuard.runMainAccountWatchdog(main.email);
        const extras = await Promise.all(claudeAccountRows.map(async (p) => {
            const status = await readClaudeAccountStatus(p.claudeConfigDir);
            return { id: p.id, label: p.accountLabel ?? p.label, email: status.email, loggedIn: status.loggedIn, isMain: false, enabled: p.enabled !== false, proxySet: Boolean(p.proxyUrl) };
        }));
        const mainProvider = providerStore.get('claude-oauth');
        return {
            rows: [
                { id: 'claude-oauth', label: mainProvider?.accountLabel ?? 'Principal', email: main.email, loggedIn: main.loggedIn, isMain: true, enabled: true, proxySet: Boolean(mainProvider?.proxyUrl) },
                ...extras,
            ],
        };
    });
    host.ipcMain.handle('providers:codexAccounts', () => {
        const codexLoggedIn = (homeDir) => existsSync(join(homeDir ?? join(homedir(), '.codex'), 'auth.json'));
        const mainProvider = providerStore.get('codex-cli');
        const extras = providerStore.listCodexAccounts().map((p) => ({
            id: p.id, label: p.accountLabel ?? p.label, loggedIn: codexLoggedIn(p.codexHomeDir ?? null), isMain: false, enabled: p.enabled !== false,
        }));
        return {
            rows: [
                { id: 'codex-cli', label: mainProvider?.accountLabel ?? 'Principal', loggedIn: codexLoggedIn(null), isMain: true, enabled: true },
                ...extras,
            ],
        };
    });
    // cli:detect / cli:redetect — detecção de CLIs instaladas (local; workspace remoto
    // = follow-up). Reusa a instância do CliDetector usada no providers:list.
    host.ipcMain.handle('cli:detect', () => cliDetector.getAll());
    host.ipcMain.handle('cli:redetect', () => {
        // Refresh button: re-check binary PRESENCE *and* bust the per-CLI model-detection
        // caches (claude binary scan is cached 5min). Without the cache bust the button
        // re-detected presence only and never surfaced a newly-released model — looked
        // like a no-op. The renderer's loadProviders() right after re-scans the binary.
        const detections = cliDetector.redetect();
        providerStore.refreshCliModelCaches();
        return detections;
    });
    // Onboarding v0.9 (wizard "Modo Guiado") — handlers isolados em wireOnboarding pra
    // não inchar wireCore: cli:install/envStatus/login/loginStatus/loginWatch +
    // onboarding:getState/setState/createDefaultWorkspace. Push events
    // (cli:install:progress, cli:login:changed) via host.broadcast.send (mirror missions).
    const onboarding = wireOnboarding({ host, configStore, cliDetector, providerStore });
    // auth:status — versão MÍNIMA (presence + expiry + e2e bypass) pra desbloquear o
    // AuthGate (app renderiza). SEM verify de licença/Supabase (network) por ora —
    // strangler stub; verifySession completo + login flow (open-* via opener Tauri)
    // + logout/profile = follow-up. Session encriptada (OC1\0) = tratada como não-auth.
    // Atomic session write: write to a sibling temp file then rename, so a crash mid-write never
    // leaves a half-written session.json (which would read as corrupt → forced re-login). NEVER
    // logs token values.
    const writeSessionAtomic = (sessionPath, session) => {
        const tmp = `${sessionPath}.tmp-${process.pid}`;
        try {
            writeFileSync(tmp, JSON.stringify(session, null, 2), 'utf-8');
            renameSync(tmp, sessionPath);
        }
        catch {
            try {
                if (existsSync(tmp))
                    unlinkSync(tmp);
            }
            catch { /* best-effort */ }
        }
    };
    host.ipcMain.handle('auth:status', async () => {
        if (process.env['OCSWARM_E2E'] === '1')
            return { authenticated: true, email: 'e2e@test.local' };
        const sessionPath = process.env['OVERCLOCK_SESSION_JSON'] ?? join(dataDir, 'session.json');
        if (!existsSync(sessionPath))
            return { authenticated: false };
        try {
            const buf = readFileSync(sessionPath);
            if (buf.length > ENC_MAGIC.length && buf.subarray(0, ENC_MAGIC.length).equals(ENC_MAGIC))
                return { authenticated: false };
            const s = JSON.parse(buf.toString('utf-8'));
            if (!s || typeof s.email !== 'string')
                return { authenticated: false };
            const expiresAt = typeof s.expiresAt === 'number' ? s.expiresAt : null;
            // Valid (or no expiry recorded) → authenticated as-is.
            if (!shouldRefreshSession(expiresAt, Date.now())) {
                return { authenticated: true, email: s.email };
            }
            // Expired / about-to-expire with a refresh_token → renew first so the ~1h Supabase token
            // never forces a manual re-login. On success, persist the fresh tokens atomically and stay
            // authenticated; on failure, fall through to the unauthenticated path (E4 — graceful).
            if (typeof s.refreshToken === 'string' && s.refreshToken.length > 0) {
                const next = await refreshSupabaseToken(s.refreshToken);
                if (next) {
                    writeSessionAtomic(sessionPath, { accessToken: next.accessToken, refreshToken: next.refreshToken, email: s.email, expiresAt: next.expiresAt });
                    return { authenticated: true, email: s.email };
                }
            }
            return { authenticated: false, reason: 'session_expired' };
        }
        catch {
            return { authenticated: false };
        }
    });
    // auth:logout — apaga a session.json + broadcast auth:state (espelha registerSupportIpcHandlers;
    // clearLicenseProfileCache é cache em memória do Electron = no-op aqui). login/verifySession = follow-up.
    host.ipcMain.handle('auth:logout', () => {
        const sessionPath = process.env['OVERCLOCK_SESSION_JSON'] ?? join(dataDir, 'session.json');
        try {
            if (existsSync(sessionPath))
                unlinkSync(sessionPath);
        }
        catch { /* best-effort */ }
        host.broadcast.send('auth:state', { authenticated: false, reason: 'session_expired' });
        return { ok: true };
    });
    // auth:open-terms/privacy/billing — abre URLs estáticas no browser (sem desktop_state).
    host.ipcMain.handle('auth:open-terms', () => { openExternalUrl(`${WEB_BASE}/terms`); });
    host.ipcMain.handle('auth:open-privacy', () => { openExternalUrl(`${WEB_BASE}/privacy`); });
    host.ipcMain.handle('auth:open-billing', () => { openExternalUrl(`${WEB_BASE}/app/billing`); });
    // auth:open-login/signup — OAuth desktop: gera state (TTL), monta URL, abre browser, e sobe
    // um http server em 17778 que aguarda o redirect da web (?desktop_code&desktop_state) →
    // exchangeDesktopAuthCode → grava session.json → broadcast auth:success. Funcs no core
    // (desktopAuth, Electron-free).
    //
    // C-105: isDev REAL (isDevSidecarInstance — mesma heurística do F-010). Dev manda
    // `desktop_dev=1` → a web redireciona pro callback localhost 17778 (server abaixo).
    // Packaged manda `desktop=1` → a web redireciona pro deep link `overclock://callback`
    // (capturado pelo shell Rust → renderer → auth:exchange-desktop-auth-code). O server
    // 17778 sobe nos DOIS casos como plano B — barato, e não regride o caminho dev.
    const desktopAuthState = createDesktopAuthState();
    const DEV_AUTH_PORT = Number(process.env['DEV_AUTH_PORT'] ?? '17778');
    const spawnDesktopAuthServer = (flow) => {
        const state = randomUUID();
        desktopAuthState.registerDesktopAuthState(state);
        const url = buildAuthUrl({
            webBase: WEB_BASE,
            pathname: flow === 'login' ? '/app/login' : '/app/signup',
            flow,
            state,
            isDev: isDevSidecarInstance(),
        });
        openExternalUrl(url);
        const sessionPath = process.env['OVERCLOCK_SESSION_JSON'] ?? join(dataDir, 'session.json');
        const server = createServer(async (req, res) => {
            try {
                const reqUrl = new URL(req.url ?? '/', `http://127.0.0.1:${DEV_AUTH_PORT}`);
                if (reqUrl.pathname !== '/auth/callback') {
                    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
                    res.end('Not found');
                    return;
                }
                const desktopCode = reqUrl.searchParams.get('desktop_code');
                const desktopState = reqUrl.searchParams.get('desktop_state');
                const desktopFlow = reqUrl.searchParams.get('desktop_flow')?.toLowerCase() ?? null;
                if (!desktopCode || !desktopState) {
                    res.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' });
                    res.end('Unable to complete login callback.');
                    server.close();
                    return;
                }
                if (!desktopAuthState.isKnownDesktopAuthState(desktopState)) {
                    res.writeHead(401, { 'content-type': 'text/plain; charset=utf-8' });
                    res.end('Invalid or expired auth state.');
                    server.close();
                    return;
                }
                desktopAuthState.consumeDesktopAuthState(desktopState);
                const exchanged = await exchangeDesktopAuthCode(desktopCode, desktopState, desktopFlow, { webBase: WEB_BASE });
                if (!exchanged) {
                    res.writeHead(401, { 'content-type': 'text/html; charset=utf-8' });
                    res.end('<!doctype html><meta charset="utf-8"><title>Overclock</title><body style="background:#000;color:#ddd;font:12px monospace">Overclock could not complete login. Return to the app and try again.</body>');
                    server.close();
                    return;
                }
                const session = {
                    accessToken: exchanged.accessToken,
                    refreshToken: exchanged.refreshToken,
                    email: exchanged.email,
                    expiresAt: Date.now() + (exchanged.expiresIn ?? 3600) * 1000,
                };
                try {
                    writeFileSync(sessionPath, JSON.stringify(session), 'utf-8');
                }
                catch { /* best-effort */ }
                host.broadcast.send('auth:state', { authenticated: true, email: session.email });
                host.broadcast.send('auth:success', { email: session.email });
                res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
                res.end('<!doctype html><meta charset="utf-8"><title>Overclock</title><body style="background:#000;color:#ddd;font:12px monospace">Overclock received the login callback. Return to the app.</body>');
                server.close();
            }
            catch {
                res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
                res.end('Auth callback failed.');
                server.close();
            }
        });
        server.on('error', () => { });
        server.listen(DEV_AUTH_PORT, '127.0.0.1');
    };
    host.ipcMain.handle('auth:open-login', () => { spawnDesktopAuthServer('login'); });
    host.ipcMain.handle('auth:open-signup', () => { spawnDesktopAuthServer('signup'); });
    // auth:exchange-desktop-auth-code — Wire phase: packaged-Tauri deep-link login path.
    // Called by the renderer when it receives a "deep-link:url" Tauri event with an
    // overclock:// URL (the web app redirects here after OAuth completes).
    //
    // Parses desktop_code / desktop_state / desktop_flow from the URL, validates the
    // state (must have been registered via auth:open-login/signup), exchanges the code
    // for tokens, writes session.json, and broadcasts auth:state + auth:success — the
    // SAME sequence as the 17778 http-server path, but triggered via Tauri event instead.
    host.ipcMain.handle('auth:exchange-desktop-auth-code', async (_e, rawUrl) => {
        // C-105: falha de deep link NUNCA é beco silencioso — o AuthGate mostra o erro
        // (reason 'desktop_auth_failed'). Só broadcasta se NÃO há sessão gravada: um deep
        // link velho/expirado não pode derrubar a UI de um usuário já logado.
        const failLoud = (error) => {
            const sp = process.env['OVERCLOCK_SESSION_JSON'] ?? join(dataDir, 'session.json');
            if (!existsSync(sp)) {
                host.broadcast.send('auth:state', { authenticated: false, reason: 'desktop_auth_failed' });
            }
            return { ok: false, error };
        };
        if (typeof rawUrl !== 'string' || !rawUrl.trim())
            return failLoud('invalid url');
        try {
            // Support both `overclock://callback?...` and any overclock:// URL with query params.
            // URL() doesn't parse custom schemes reliably across all Node versions; normalize to https.
            const normalized = rawUrl.replace(/^overclock:\/\//, 'https://overclock-placeholder/');
            const parsed = new URL(normalized);
            const desktopCode = parsed.searchParams.get('desktop_code');
            const desktopState = parsed.searchParams.get('desktop_state');
            const desktopFlow = parsed.searchParams.get('desktop_flow')?.toLowerCase() ?? null;
            if (!desktopCode || !desktopState) {
                return failLoud('missing desktop_code or desktop_state');
            }
            if (!desktopAuthState.isKnownDesktopAuthState(desktopState)) {
                // App reiniciou no meio do login (state em memória perdido) ou TTL de 10 min
                // estourou — erro claro na tela, usuário reinicia o login pelo app.
                return failLoud('unknown or expired desktop_state — restart login');
            }
            desktopAuthState.consumeDesktopAuthState(desktopState);
            const exchanged = await exchangeDesktopAuthCode(desktopCode, desktopState, desktopFlow, { webBase: WEB_BASE });
            if (!exchanged)
                return failLoud('token exchange failed');
            const sessionPath = process.env['OVERCLOCK_SESSION_JSON'] ?? join(dataDir, 'session.json');
            const session = {
                accessToken: exchanged.accessToken,
                refreshToken: exchanged.refreshToken,
                email: exchanged.email,
                expiresAt: Date.now() + (exchanged.expiresIn ?? 3600) * 1000,
            };
            try {
                writeFileSync(sessionPath, JSON.stringify(session), 'utf-8');
            }
            catch { /* best-effort */ }
            host.broadcast.send('auth:state', { authenticated: true, email: session.email });
            host.broadcast.send('auth:success', { email: session.email });
            return { ok: true, email: session.email };
        }
        catch (err) {
            return failLoud(err instanceof Error ? err.message : String(err));
        }
    });
    // auth:diagnose — probe de conectividade (Supabase health + license verify). Inline de
    // diagnoseAuthConnectivity (auth.ts); SUPABASE_URL é o endpoint público do projeto.
    host.ipcMain.handle('auth:diagnose', async () => {
        const targets = [
            { host: 'Supabase (login)', url: 'https://ncdtxsykyretslaimiow.supabase.co/auth/v1/health' },
            { host: 'overclock.sh (licença)', url: `${WEB_BASE}/api/license/verify` },
        ];
        return Promise.all(targets.map(async (t) => {
            try {
                const res = await fetch(t.url, { signal: AbortSignal.timeout(6000) });
                return { host: t.host, ok: true, detail: `HTTP ${res.status}` };
            }
            catch (err) {
                const e = err;
                const detail = e?.cause?.code ?? (e?.name === 'TimeoutError' ? 'timeout' : e?.message ?? 'erro');
                return { host: t.host, ok: false, detail };
            }
        }));
    });
    // audio:getConfig/saveConfig — AudioConfigStore (core, compartilhado c/ Electron). View
    // pública mascara apiKey. saveConfig valida o patch + merge (apiKey: ignora valor mascarado)
    // + write normalizado. license/ClockVoice gate (publicAudioConfig) + transcribe = follow-up
    // (transcribe precisa de whisper local/groq + license).
    const audioConfigStore = new AudioConfigStore(process.env['OVERCLOCK_AUDIO_CONFIG_JSON'] ?? join(dataDir, 'audio-config.json'));
    // getLicenseProfile — verifica licença/ClockVoice (GET /api/license/verify) com cache 60s
    // (audio:getConfig é chamado a cada render — sem cache seria 1 fetch por render). Token NUNCA logado.
    let _licenseCache = null;
    // Perfis de FALHA (sem sessão / verify indisponível) cacheiam só 5s — um hiccup transitório de
    // rede/sessão no boot (o pre-warm roda antes da rede estar pronta) NÃO pode pinar o ClockVoice em
    // "ASSINAR" por 60s. Perfis válidos cacheiam 60s (audio:getConfig é chamado a cada render).
    const licenseTtl = (p) => (p.noSession || p.unavailable || !p.valid) ? 5_000 : 60_000;
    const licenseCacheFresh = () => _licenseCache != null && Date.now() - _licenseCache.at < licenseTtl(_licenseCache.profile);
    const getLicenseProfile = async (refresh = false) => {
        // Dev builds (sidecar runs from the repo at /packages/sidecar/, not a packaged app, OR
        // OVERCLOCK_DEV=1) always get Boost Pro so every license-gated feature (ClockVoice etc.)
        // works without a logged-in session. Release/packaged builds fall through to /api/license/verify.
        if ((process.argv[1] ?? '').includes('/packages/sidecar/') || process.env['OVERCLOCK_DEV'] === '1') {
            const devProfile = { email: null, valid: true, plan: 'boost_pro', status: 'active', periodEnd: null, entitlements: ['clock_voice'], features: { clockVoice: true }, unavailable: false, noSession: false };
            _licenseCache = { profile: devProfile, at: Date.now() };
            return devProfile;
        }
        if (!refresh && licenseCacheFresh())
            return _licenseCache.profile;
        const sessionPath = process.env['OVERCLOCK_SESSION_JSON'] ?? join(dataDir, 'session.json');
        let accessToken = null;
        let email = null;
        let refreshToken = null;
        let expiresAt = null;
        if (existsSync(sessionPath)) {
            try {
                const buf = readFileSync(sessionPath);
                if (!(buf.length > ENC_MAGIC.length && buf.subarray(0, ENC_MAGIC.length).equals(ENC_MAGIC))) {
                    const s = JSON.parse(buf.toString('utf-8'));
                    accessToken = s?.accessToken ?? null;
                    email = s?.email ?? null;
                    refreshToken = s?.refreshToken ?? null;
                    expiresAt = typeof s?.expiresAt === 'number' ? s.expiresAt : null;
                }
            }
            catch { /* session ilegível = sem token */ }
        }
        // Persist refreshed tokens back so login survives forever (one login, auto-renew).
        const saveSession = (tok) => {
            writeSessionAtomic(sessionPath, { accessToken: tok.accessToken, refreshToken: tok.refreshToken, email, expiresAt: tok.expiresAt });
        };
        // Proactive refresh: token expired (or within 60s of it) and we hold a refresh_token → renew first.
        if (refreshToken && shouldRefreshSession(expiresAt, Date.now())) {
            const next = await refreshSupabaseToken(refreshToken);
            if (next) {
                accessToken = next.accessToken;
                refreshToken = next.refreshToken;
                expiresAt = next.expiresAt;
                saveSession(next);
            }
        }
        const noSession = { email: null, valid: false, plan: null, status: null, periodEnd: null, entitlements: [], features: { clockVoice: false }, unavailable: false, noSession: true };
        let profile = noSession;
        if (accessToken) {
            try {
                const verifyOnce = (token) => fetch(`${WEB_BASE}/api/license/verify`, {
                    headers: { Authorization: `Bearer ${token}`, 'X-Overclock-App-Version': APP_VERSION, 'X-Overclock-App-Channel': 'desktop', 'X-Overclock-Platform': process.platform, 'X-Overclock-Arch': process.arch },
                    signal: AbortSignal.timeout(3000),
                });
                let res = await verifyOnce(accessToken);
                // Reactive refresh: a 401 means the token died early (rotated/revoked) — renew once and retry,
                // so a transient expiry never forces a manual re-login.
                if (res.status === 401 && refreshToken) {
                    const next = await refreshSupabaseToken(refreshToken);
                    if (next) {
                        saveSession(next);
                        res = await verifyOnce(next.accessToken);
                    }
                }
                if (!res.ok) {
                    profile = { ...noSession, email, unavailable: true, noSession: false };
                }
                else {
                    const data = await res.json();
                    const feats = (data.features && typeof data.features === 'object' && !Array.isArray(data.features)) ? data.features : {};
                    profile = { email, valid: data.valid !== false, plan: data.plan ?? null, status: data.status ?? null, periodEnd: data.period_end ?? null, entitlements: Array.isArray(data.entitlements) ? data.entitlements.filter((x) => typeof x === 'string') : [], features: { clockVoice: feats['clockVoice'] === true }, unavailable: false, noSession: false };
                }
            }
            catch {
                profile = { ...noSession, email, unavailable: true, noSession: false };
            }
        }
        _licenseCache = { profile, at: Date.now() };
        return profile;
    };
    // publicAudioConfig — MESMO shape que o renderer espera (Electron publicAudioConfig):
    // config SEM apiKey + apiKeySet + localReady + clockVoiceAccess. SEM clockVoiceAccess o
    // WorkspaceTabs crasha (audioConfig.clockVoiceAccess.allowed) e trava a UI inteira.
    //
    // Stale-while-revalidate: retorna do cache imediatamente (sem bloquear na rede).
    // Quando o cache está frio (primeiro boot), dispara fetch em background e retorna
    // noSession como placeholder; quando resolve → broadcast 'audio:configUpdated'.
    const publicAudioConfig = async (refreshLicense = false) => {
        const cfg = audioConfigStore.read();
        const { apiKey: _ak, ...rest } = cfg;
        const buildCfg = (profile) => ({
            ...rest,
            apiKeySet: cfg.apiKey.trim().length > 0,
            localReady: Boolean(resolveLocalWhisperBinary(cfg)) && Boolean(cfg.localModelPath.trim() && existsSync(cfg.localModelPath.trim())),
            clockVoiceAccess: clockVoiceAccessFromProfile(profile),
        });
        if (!refreshLicense && _licenseCache) {
            // Cache hit: retorna imediatamente. Se stale (TTL curto p/ falhas), refresh em background + broadcast.
            if (!licenseCacheFresh()) {
                void getLicenseProfile(true).then((p) => host.broadcast.send('audio:configUpdated', buildCfg(p)));
            }
            return buildCfg(_licenseCache.profile);
        }
        if (!refreshLicense) {
            // Cache frio (primeiro boot): retorna noSession imediatamente, fetch em background.
            const coldProfile = { email: null, valid: false, plan: null, status: null, periodEnd: null, entitlements: [], features: { clockVoice: false }, unavailable: false, noSession: true };
            void getLicenseProfile().then((p) => host.broadcast.send('audio:configUpdated', buildCfg(p)));
            return buildCfg(coldProfile);
        }
        // refreshLicense=true (refresh explícito, ex: Settings): aguarda resultado fresco.
        const profile = await getLicenseProfile(true);
        return buildCfg(profile);
    };
    host.ipcMain.handle('audio:getConfig', () => publicAudioConfig());
    // Pre-warm license cache no startup: garante que o primeiro audio:getConfig do renderer
    // acerte o cache em vez de bloquear na rede (ClockVoice aparece instantaneamente).
    void getLicenseProfile();
    host.ipcMain.handle('audio:saveConfig', async (_e, patchInput) => {
        const patch = validateAudioPatch(patchInput);
        if (!patch)
            return { ok: false, error: 'invalid audio config' };
        const current = audioConfigStore.read();
        const next = {
            ...current,
            ...patch,
            baseUrl: (patch.baseUrl ?? current.baseUrl).trim(),
            apiKey: patch.apiKey !== undefined && !/^\*+$/.test(patch.apiKey) ? patch.apiKey.trim() : current.apiKey,
            model: (patch.model ?? current.model).trim(),
            localBinaryPath: (patch.localBinaryPath ?? current.localBinaryPath).trim(),
            localModelPath: (patch.localModelPath ?? current.localModelPath).trim(),
            language: (patch.language ?? current.language).trim(),
            prompt: (patch.prompt ?? current.prompt).trim(),
        };
        if (!next.baseUrl || !next.model)
            return { ok: false, error: 'baseUrl and model required' };
        audioConfigStore.write(next);
        return { ok: true, config: await publicAudioConfig() };
    });
    // audio:transcribe — gate ClockVoice (license) + dispatch local(whisper)/groq.
    host.ipcMain.handle('audio:transcribe', async (_e, args) => {
        const access = clockVoiceAccessFromProfile(await getLicenseProfile());
        if (!access.allowed)
            return { ok: false, error: clockVoiceAccessError(access) };
        const cfg = audioConfigStore.read();
        return cfg.provider === 'local'
            ? transcribeAudioLocally(args, cfg)
            : transcribeAudioWithGroq(args, cfg);
    });
    // auth:profile — verifica licença/plano: lê o accessToken da session (NUNCA loga) + GET
    // /api/license/verify com Bearer. Simplificado: refresh-on-401 (refreshAccessToken) = follow-up
    // (401 → unavailable); cache + last-known-good = follow-up. session encriptada = não-auth.
    host.ipcMain.handle('auth:profile', async () => {
        const sessionPath = process.env['OVERCLOCK_SESSION_JSON'] ?? join(dataDir, 'session.json');
        let session = null;
        if (existsSync(sessionPath)) {
            try {
                const buf = readFileSync(sessionPath);
                if (!(buf.length > ENC_MAGIC.length && buf.subarray(0, ENC_MAGIC.length).equals(ENC_MAGIC))) {
                    session = JSON.parse(buf.toString('utf-8'));
                }
            }
            catch {
                session = null;
            }
        }
        const none = (extra) => ({ email: session?.email ?? null, valid: false, plan: null, status: null, periodEnd: null, ...extra });
        if (!session?.accessToken)
            return none({ unavailable: false, noSession: !session });
        try {
            const res = await fetch(`${WEB_BASE}/api/license/verify`, {
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                    'X-Overclock-App-Version': APP_VERSION,
                    'X-Overclock-App-Channel': 'desktop',
                    'X-Overclock-Platform': process.platform,
                    'X-Overclock-Arch': process.arch,
                },
                signal: AbortSignal.timeout(8000),
            });
            if (!res.ok)
                return none({ unavailable: true, noSession: false });
            const data = await res.json();
            return { email: session.email ?? null, valid: data.valid !== false, plan: data.plan ?? null, status: data.status ?? null, periodEnd: data.period_end ?? null, unavailable: false, noSession: false };
        }
        catch {
            return none({ unavailable: true, noSession: false });
        }
    });
    // diagnostics:snapshot — health do app/dataDir/providers (dados reais). mcp (host no sidecar),
    // osProcessScan (scanLocalRuntimeProcesses) e workspace.active (applyWorkspace) = follow-up.
    host.ipcMain.handle('diagnostics:snapshot', () => {
        // pathHealth — DiagnosticsPathHealth completo (path/exists/readable/writable/fileCount/dirCount),
        // nunca campos undefined (F-022: renderer faz .length/.filter sem guard nesses dados).
        const pathHealth = (p) => {
            const exists = existsSync(p);
            let readable = false, writable = false, fileCount = 0, dirCount = 0;
            if (exists) {
                try {
                    accessSync(p, fsConstants.R_OK);
                    readable = true;
                }
                catch { /* não legível */ }
                try {
                    accessSync(p, fsConstants.W_OK);
                    writable = true;
                }
                catch { /* não gravável */ }
                try {
                    if (statSync(p).isDirectory()) {
                        for (const entry of readdirSync(p, { withFileTypes: true })) {
                            if (entry.isDirectory())
                                dirCount++;
                            else
                                fileCount++;
                        }
                    }
                }
                catch { /* scan best-effort */ }
            }
            return { path: p, exists, readable, writable, fileCount, dirCount };
        };
        const fileHealth = (name) => pathHealth(join(dataDir, name));
        const baseUrlOf = (p) => p.env?.['ANTHROPIC_BASE_URL'] ?? p.env?.['OPENAI_BASE_URL'] ?? p.env?.['BASE_URL'] ?? null;
        return {
            osProcessScan: { ok: false, platform: process.platform, scannedAt: Date.now(), processes: [], error: undefined },
            app: { version: APP_VERSION, platform: process.platform, arch: process.arch, osRelease: release(), hardwareAccelerationDisabled: false },
            workspace: { active: activeWorkspace ?? null },
            dataDir: {
                active: pathHealth(dataDir),
                legacy: pathHealth(dataDir),
                source: 'tauri',
                migration: { attempted: false, copied: [], skipped: [] },
                files: {
                    providers: fileHealth('providers.json'), config: fileHealth('config.json'),
                    workspaces: fileHealth('workspaces.json'), mcpConfig: fileHealth('mcp-config.json'),
                    squads: fileHealth('squads.json'), audioConfig: fileHealth('audio-config.json'),
                    globalDb: fileHealth('messages.db'),
                },
            },
            mcp: mcpHost?.status() ?? { active: false, port: null, sseUrl: null, streamableHttpUrl: null, toolCount: 0, tools: [] },
            providers: providerStore.list().map((p) => ({
                id: p.id, label: p.label, type: p.type, host: p.host ?? null,
                baseUrl: baseUrlOf(p), models: p.models ?? [], envKeys: Object.keys(p.env ?? {}).sort(),
            })),
            // F-002: era stub `[]` da migração — o modal comparava a UI contra backend sempre-vazio,
            // marcava TODOS os panes como "UI sem backend" e o botão "Limpar UI" removeria o grid
            // inteiro. Mesmo mapeamento do handler pty:list (local + remoto).
            backendPanes: [
                ...pty.listPanes().map((p) => {
                    const cfg = configs.get(p.paneId);
                    return { ...p, agent: cfg?.agent ?? p.agent, cwd: cfg?.cwd ?? p.cwd, shellPath: cfg?.shellPath };
                }),
                ...remotePty.listPanes().map((p) => ({ ...p })),
            ],
            clis: [],
            lastError: null,
        };
    });
    // workspaces:recent — lê workspaces.json (GLOBAL_DIR), top-10 por lastOpened.
    // activitiesCount simplificado (0 — badge UI; count real via DB do workspace = follow-up).
    host.ipcMain.handle('workspaces:recent', () => {
        const wsPath = process.env['OVERCLOCK_WORKSPACES_JSON'] ?? join(dataDir, 'workspaces.json');
        let recent = [];
        if (existsSync(wsPath)) {
            try {
                const data = JSON.parse(readFileSync(wsPath, 'utf-8'));
                recent = Array.isArray(data.recent) ? data.recent : [];
            }
            catch {
                /* keep [] */
            }
        }
        return recent
            .slice()
            .sort((a, b) => b.lastOpened - a.lastOpened)
            .slice(0, 10)
            .map((e) => ({ path: e.path, lastOpened: e.lastOpened, activitiesCount: 0 }));
    });
    // workspaces:touch — atualiza lastOpened (find/add) na workspaces.json, top-50, write atômico
    // (tmp+rename). Omite o guard recentlyDeleted (bootstrap-state do fluxo de delete = follow-up).
    host.ipcMain.handle('workspaces:touch', (_e, workspacePath) => {
        if (typeof workspacePath !== 'string' || !workspacePath)
            return;
        // Workspace ativo p/ os defaults de spawn do MCP host (getWorkspace).
        if (!workspacePath.startsWith('ssh://'))
            activeWorkspace = workspacePath;
        const wsPath = process.env['OVERCLOCK_WORKSPACES_JSON'] ?? join(dataDir, 'workspaces.json');
        const data = { recent: [] };
        if (existsSync(wsPath)) {
            try {
                const parsed = JSON.parse(readFileSync(wsPath, 'utf-8'));
                if (Array.isArray(parsed.recent))
                    data.recent = parsed.recent;
            }
            catch { /* empty */ }
        }
        const now = Date.now();
        const idx = data.recent.findIndex((e) => e.path === workspacePath);
        if (idx >= 0)
            data.recent[idx].lastOpened = now;
        else
            data.recent.push({ path: workspacePath, lastOpened: now });
        data.recent.sort((a, b) => b.lastOpened - a.lastOpened);
        data.recent = data.recent.slice(0, 50);
        try {
            mkdirSync(dirname(wsPath), { recursive: true });
            const tmp = `${wsPath}.${process.pid}.${now}.tmp`;
            writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
            renameSync(tmp, wsPath);
        }
        catch { /* best-effort */ }
    });
    // workspaces:remove — remove da recent (workspaces.json) + mata os panes cujo cwd
    // casa (single-window Tauri). detached-windows/activities/recentlyDeleted-guard = Fase 2.
    host.ipcMain.handle('workspaces:remove', async (_e, workspacePath) => {
        if (typeof workspacePath !== 'string' || !workspacePath)
            return;
        for (const p of pty.listPanes()) {
            if (configs.get(p.paneId)?.cwd === workspacePath) {
                try {
                    pty.kill(p.paneId);
                }
                catch { /* ignore */ }
                configs.delete(p.paneId);
            }
        }
        const wsPath = process.env['OVERCLOCK_WORKSPACES_JSON'] ?? join(dataDir, 'workspaces.json');
        if (!existsSync(wsPath))
            return;
        try {
            const parsed = JSON.parse(readFileSync(wsPath, 'utf-8'));
            const recent = (Array.isArray(parsed.recent) ? parsed.recent : []).filter((e) => e.path !== workspacePath);
            mkdirSync(dirname(wsPath), { recursive: true });
            const tmp = `${wsPath}.${process.pid}.${Date.now()}.tmp`;
            writeFileSync(tmp, JSON.stringify({ recent }, null, 2), 'utf-8');
            renameSync(tmp, wsPath);
        }
        catch { /* best-effort */ }
    });
    // tasks:list — lista do todoStore (mesmo store do MCP todo_manager). { list, activeTaskId }.
    host.ipcMain.handle('tasks:list', () => ({ list: todoStore.list(), activeTaskId: todoStore.activeTaskId() }));
    // remoteHosts:list/test — SSH hosts do ~/.ssh/config (core/remoteHosts, Electron-free).
    // remote:pairingCode/revokeAllTokens → RemoteBridge (WSS thin-client) instanciado ao fim do wireCore.
    host.ipcMain.handle('remoteHosts:list', async () => {
        try {
            return { ok: true, hosts: await listRemoteHosts() };
        }
        catch (err) {
            return { ok: false, hosts: [], error: err instanceof Error ? err.message : String(err) };
        }
    });
    host.ipcMain.handle('remoteHosts:test', async (_e, alias) => {
        if (typeof alias !== 'string')
            return { ok: false, error: 'invalid host alias' };
        return testRemoteHost(alias);
    });
    // workspace:set — subset portável do applyWorkspace: seta o workspace ativo (drive os
    // defaults de spawn do MCP/getWorkspace). DB-swap/ClaudeTranscriptWatcher/window-title =
    // Electron-coupled/Fase 2 (sidecar single-window, sem bus por-workspace ainda). Remote = Fase 2.
    host.ipcMain.handle('workspace:set', async (_e, dir) => {
        if (typeof dir !== 'string' || !dir.trim())
            return null;
        const normalizedDir = dir.trim();
        if (normalizedDir.startsWith('ssh://'))
            return null;
        activeWorkspace = normalizedDir;
        // Liga a captura de tokens pros transcripts deste workspace (idempotente).
        void transcriptWatcher.start(normalizedDir).catch(() => { });
        // Codex watcher é global (root único) — start idempotente pega panes codex restaurados no boot.
        void codexWatcher.start().catch(() => { });
        return normalizedDir;
    });
    // tokens:[REDIGIDO-PRESERVACAO] + log:list — leitura do messages.db do workspace ativo
    // via node:sqlite (db.ts). Read-only (recording = ClaudeTranscriptWatcher fica no Electron).
    const emptyTokens = { input: 0, output: 0, cache_read: 0, cache_write: 0, cost_usd: 0 };
    host.ipcMain.handle('tokens:byTask', (_e, taskId) => {
        try {
            if (!activeWorkspace || activeWorkspace.startsWith('ssh://') || typeof taskId !== 'string')
                return emptyTokens;
            return aggregateTokensByTask(getWorkspaceDb(activeWorkspace), taskId);
        }
        catch {
            return emptyTokens;
        }
    });
    // Badge do pane = agregado da SESSÃO ATUAL do pane (C-037: fonte única por session_id).
    // Resolve a sessão viva do pane (claudeSessionId ditado / session.id do codex) e soma só ela —
    // pane com id reusado após restart nasce zerado porque a sessão é outra (F-013 morto). Sem
    // sessão ainda (pane recém-spawnado, turn 0) → zero, não o extrato de vidas passadas do id.
    host.ipcMain.handle('tokens:byPane', (_e, paneId) => {
        try {
            if (typeof paneId !== 'string')
                return emptyTokens;
            const cfg = configs.get(paneId);
            const sessionId = cfg?.claudeSessionId ?? cfg?.session?.id;
            if (!sessionId)
                return emptyTokens;
            // F-019: o watcher grava no DB do CWD do pane (watchClaudeCwd passa cfg.cwd) — ler o
            // workspace ATIVO mostrava zero pra pane vivendo em outro workspace do grid.
            const wsForDb = (typeof cfg?.cwd === 'string' && cfg.cwd && !cfg.cwd.startsWith('ssh://')) ? cfg.cwd : activeWorkspace;
            if (!wsForDb || wsForDb.startsWith('ssh://'))
                return emptyTokens;
            return aggregateTokensBySession(getWorkspaceDb(wsForDb), sessionId);
        }
        catch {
            return emptyTokens;
        }
    });
    // F-020: aceita workspacePath explícito — cada mascote lê o SEU workspace. Sem isso todos
    // liam o ativo: grid/mini flipavam juntos ao trocar de workspace e zeravam no instante da
    // troca (activeWorkspace em trânsito → [] → forma base → morph down/up = "level instável").
    host.ipcMain.handle('tokens:byWorkspace', (_e, opts = {}) => {
        try {
            const ws = typeof opts?.workspacePath === 'string' && opts.workspacePath ? opts.workspacePath : activeWorkspace;
            if (!ws || ws.startsWith('ssh://'))
                return [];
            const sinceMs = typeof opts?.sinceMs === 'number' ? opts.sinceMs : Date.now() - 7 * 24 * 3_600_000;
            return aggregateTokensByWorkspace(getWorkspaceDb(ws), sinceMs);
        }
        catch {
            return [];
        }
    });
    // XP weight por modelo. Só claude+codex/gpt-5 contam; qualquer outro → 0.
    function modelXpWeight(model) {
        const m = model.toLowerCase();
        if (m.includes('claude') || m.includes('fable')) {
            if (m.includes('opus'))
                return 1.0;
            if (m.includes('haiku'))
                return 0.08;
            return 0.30; // sonnet, fable, outros claude
        }
        if (m.startsWith('codex'))
            return 0.50;
        if (m.includes('gpt-5') || m.includes('gpt5')) {
            if (m.includes('5.5') || m.includes('5-5'))
                return 0.80;
            if (m.includes('5.3') || m.includes('5-3'))
                return 0.40;
            return 0.50;
        }
        return 0; // gemini, llama, etc. — não conta
    }
    // Helper: coleta paths de workspaces conhecidos.
    const knownWorkspacePaths = () => {
        const wsJsonPath = process.env['OVERCLOCK_WORKSPACES_JSON'] ?? join(dataDir, 'workspaces.json');
        let paths = [];
        try {
            const parsed = JSON.parse(readFileSync(wsJsonPath, 'utf-8'));
            paths = Array.isArray(parsed.recent)
                ? parsed.recent.map((e) => e.path).filter((p) => Boolean(p) && !p.startsWith('ssh://'))
                : [];
        }
        catch { /* workspaces.json ausente */ }
        if (activeWorkspace && !activeWorkspace.startsWith('ssh://') && !paths.includes(activeWorkspace)) {
            paths.unshift(activeWorkspace);
        }
        return paths;
    };
    // tokens:global — soma all-time de todos os workspaces conhecidos (lifetime global).
    // Retorna raw input/output/total + xp ponderado por modelo.
    host.ipcMain.handle('tokens:global', () => {
        try {
            let input = 0, output = 0, xp = 0;
            for (const p of knownWorkspacePaths()) {
                try {
                    for (const row of aggregateTokensByWorkspace(getWorkspaceDb(p), 0)) {
                        input += row.input;
                        output += row.output;
                        xp += (row.input + row.output) * modelXpWeight(row.model);
                    }
                }
                catch { /* DB indisponível para este workspace */ }
            }
            return { input, output, total: input + output, xp: Math.floor(xp) };
        }
        catch {
            return { input: 0, output: 0, total: 0, xp: 0 };
        }
    });
    // tokens:breakdown — breakdown all-time por modelo atraves de todos os workspaces.
    // Usado pelo popover clicavel do MascotTokenXP (F-004).
    host.ipcMain.handle('tokens:breakdown', () => {
        try {
            const modelMap = new Map();
            for (const p of knownWorkspacePaths()) {
                try {
                    for (const row of aggregateTokensByWorkspace(getWorkspaceDb(p), 0)) {
                        const prev = modelMap.get(row.model) ?? { input: 0, output: 0, xp: 0, cost_usd: 0 };
                        modelMap.set(row.model, {
                            input: prev.input + row.input,
                            output: prev.output + row.output,
                            xp: prev.xp + (row.input + row.output) * modelXpWeight(row.model),
                            cost_usd: prev.cost_usd + row.cost_usd,
                        });
                    }
                }
                catch { /* DB indisponível */ }
            }
            const byModel = [...modelMap.entries()]
                .map(([model, v]) => ({ model, input: v.input, output: v.output, xp: Math.floor(v.xp), cost_usd: v.cost_usd }))
                .sort((a, b) => b.xp - a.xp);
            const total = byModel.reduce((acc, r) => ({ input: acc.input + r.input, output: acc.output + r.output, xp: acc.xp + r.xp, cost_usd: acc.cost_usd + r.cost_usd }), { input: 0, output: 0, xp: 0, cost_usd: 0 });
            return { byModel, total };
        }
        catch {
            return { byModel: [], total: { input: 0, output: 0, xp: 0, cost_usd: 0 } };
        }
    });
    // leaderboard token reporter — opt-in sync do xp lifetime pro overclock.sh.
    // Roda periodicamente + quando configStore muda. Offline-safe (best-effort).
    // Endpoint: POST overclock.sh/api/leaderboard/sync (auth Bearer JWT da session; body {total_tokens, level}).
    const LEADERBOARD_SYNC_MS = 10 * 60 * 1000;
    // Level a partir do xp ponderado — mesma curva exponencial do mascote (MascotTokenXP).
    const levelForXp = (xp) => (xp < 50_000 ? 1 : Math.floor(Math.log(xp / 50_000) / Math.log(4)) + 2);
    const computeGlobalXp = () => {
        let xp = 0;
        for (const p of knownWorkspacePaths()) {
            try {
                for (const row of aggregateTokensByWorkspace(getWorkspaceDb(p), 0)) {
                    xp += (row.input + row.output) * modelXpWeight(row.model);
                }
            }
            catch { /* DB unavailable */ }
        }
        return Math.floor(xp);
    };
    const pushLeaderboardTokens = async () => {
        if (!configStore.get().leaderboard.shareTokens)
            return;
        const sessionPath = process.env['OVERCLOCK_SESSION_JSON'] ?? join(dataDir, 'session.json');
        if (!existsSync(sessionPath))
            return;
        let accessToken = null;
        try {
            const buf = readFileSync(sessionPath);
            if (buf.length > ENC_MAGIC.length && buf.subarray(0, ENC_MAGIC.length).equals(ENC_MAGIC))
                return;
            const s = JSON.parse(buf.toString('utf-8'));
            if (!s?.accessToken || (s.expiresAt && s.expiresAt <= Date.now()))
                return;
            accessToken = s.accessToken;
        }
        catch {
            return;
        }
        const xp = computeGlobalXp();
        if (xp === 0)
            return;
        try {
            await fetch(`${WEB_BASE}/api/leaderboard/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
                body: JSON.stringify({ total_tokens: xp, level: levelForXp(xp) }),
                signal: AbortSignal.timeout(10_000),
            });
        }
        catch { /* offline-safe */ }
    };
    const leaderboardTimer = setInterval(() => { pushLeaderboardTokens().catch(() => { }); }, LEADERBOARD_SYNC_MS);
    if (typeof leaderboardTimer.unref === 'function')
        leaderboardTimer.unref();
    configStore.onChange(() => { pushLeaderboardTokens().catch(() => { }); });
    host.ipcMain.handle('log:list', (_e, opts = {}) => {
        try {
            if (!activeWorkspace || activeWorkspace.startsWith('ssh://'))
                return [];
            // coerção de limit (inteiro 1..10000) — defesa contra interpolação de SQL no db.ts
            const limit = Math.max(1, Math.min(10000, Math.floor(Number(opts?.limit) || 500)));
            return listActivityLog(getWorkspaceDb(activeWorkspace), { ...opts, limit });
        }
        catch {
            return [];
        }
    });
    // workspace:save — grava o workspace config em <ws>/.overclock-app/config.json (fs puro).
    host.ipcMain.handle('workspace:save', async (_e, config) => {
        if (activeWorkspace.startsWith('ssh://'))
            return { ok: false, error: 'remote workspace config is read-only' };
        try {
            const { mkdir, writeFile } = await import('node:fs/promises');
            const dir = join(activeWorkspace, '.overclock-app');
            await mkdir(dir, { recursive: true });
            await writeFile(join(dir, 'config.json'), JSON.stringify(config, null, 2), 'utf-8');
            return { ok: true };
        }
        catch (err) {
            return { ok: false, error: err instanceof Error ? err.message : String(err) };
        }
    });
    // ── catalog:list/scan/remove/removeMissing — store node:sqlite (catalogStore.ts) no
    //    GLOBAL messages.db + scanAllClis (fs). catalog:updated via broadcast (sem BrowserWindow).
    const CATALOG_TYPES_SET = new Set(['agent', 'skill', 'mcp', 'tool', 'plugin', 'hook', 'rule', 'squad']);
    const isCatalogType = (v) => typeof v === 'string' && CATALOG_TYPES_SET.has(v);
    const isRec = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);
    const parseCandidateLocal = async (candidate) => {
        if (candidate.type === 'agent')
            return parseAgent(candidate);
        if (candidate.type === 'skill')
            return parseSkill(candidate);
        if (candidate.type === 'mcp')
            return parseMcp(candidate);
        if (candidate.type === 'plugin')
            return parsePlugin(candidate);
        if (candidate.type === 'hook')
            return parseHook(candidate);
        if (candidate.type === 'rule')
            return parseRule(candidate);
        if (candidate.type === 'squad')
            return parseSquad(candidate);
        return parseTool(candidate);
    };
    const catalogHomeDir = process.env['OVERCLOCK_CATALOG_HOME_DIR']?.trim() || homedir();
    // Scan-on-cold (catalog first-open race): catalog:list is a passive DB read, so on a cold/first
    // launch a tab returns [] and renders "empty" until the boot warm-scan lands. For CHEAP file-backed
    // types, scan synchronously the first time the disk store is cold so the tab populates on first
    // open. 'tool'/'mcp' are EXCLUDED — their scan can spawn MCP servers (multi-second block); those
    // stay on the boot warm-scan + manual Refresh. Once-per-process via warmedColdTypes (no rescan storm).
    const COLD_SCAN_TYPES = new Set(['agent', 'skill', 'plugin', 'hook', 'rule']);
    const warmedColdTypes = new Set();
    host.ipcMain.handle('catalog:list', async (_e, args) => {
        if (!isRec(args) || !isCatalogType(args['type']))
            return [];
        const type = args['type'];
        const includeMissing = args['includeMissing'] === true;
        if (COLD_SCAN_TYPES.has(type) && !warmedColdTypes.has(type)) {
            // Use the RAW disk rows (listCatalogItems) for the cold check — for skill/agent, catalogList
            // unions the in-bundle built-ins so it is never empty even when the user's disk is unscanned.
            const diskRows = listCatalogItems(getGlobalDb(dataDir), { type, includeMissing: true });
            if (diskRows.length === 0) {
                warmedColdTypes.add(type); // mark BEFORE the await so a concurrent list won't kick a 2nd scan
                try {
                    await scanCatalog({
                        db: getGlobalDb(dataDir),
                        type,
                        scannerOptions: { homeDir: catalogHomeDir, workspaces: [activeWorkspace].filter(Boolean), squadsJson: join(dataDir, 'squads.json') },
                        parseCandidate: parseCandidateLocal,
                    });
                }
                catch { /* scan failed → type stays warmed (no retry storm); manual Refresh remains */ }
            }
        }
        const items = (type === 'skill' || type === 'agent')
            ? catalogList(getGlobalDb(dataDir), { type, includeMissing })
            : listCatalogItems(getGlobalDb(dataDir), { type, includeMissing });
        const overlay = getOverlayMap(getGlobalDb(dataDir));
        const enriched = items.map((item) => {
            const ov = overlay.get(catalogIdentityKey(item));
            return {
                ...item,
                category: ov?.category ?? null,
                purpose: ov?.purpose ?? null,
                when_to_use: ov?.when_to_use ?? null,
            };
        });
        if (type !== 'skill')
            return enriched;
        return Promise.all(enriched.map(async (item) => ({
            ...item,
            installations: await Promise.all(item.installations.map(async (inst) => {
                const dir = inst.path.endsWith('SKILL.md') ? pathDirname(inst.path) : inst.path;
                try {
                    return { ...inst, isSymlink: (await fsPromises.lstat(dir)).isSymbolicLink() };
                }
                catch {
                    return inst;
                }
            })),
        })));
    });
    host.ipcMain.handle('catalog:scan', async (_e, args) => {
        if (!isRec(args) || !isCatalogType(args['type']))
            return { ok: false, error: 'invalid catalog type' };
        const type = args['type'];
        try {
            const result = await scanCatalog({
                db: getGlobalDb(dataDir),
                type,
                scannerOptions: { homeDir: catalogHomeDir, workspaces: [activeWorkspace].filter(Boolean), squadsJson: join(dataDir, 'squads.json') },
                parseCandidate: parseCandidateLocal,
            });
            host.broadcast.send('catalog:updated', { type });
            return { ok: true, ...result };
        }
        catch (error) {
            return { ok: false, error: error instanceof Error ? error.message : String(error) };
        }
    });
    host.ipcMain.handle('catalog:remove', async (_e, args) => {
        if (!isRec(args) || typeof args['id'] !== 'number' || !Number.isFinite(args['id']))
            return { ok: false, error: 'invalid catalog item id' };
        try {
            removeCatalogItem(getGlobalDb(dataDir), { id: args['id'] });
            return { ok: true };
        }
        catch (error) {
            return { ok: false, error: error instanceof Error ? error.message : String(error) };
        }
    });
    host.ipcMain.handle('catalog:setDisabled', async (_e, args) => {
        if (!isRec(args) || !isCatalogType(args['type']) || typeof args['name'] !== 'string')
            return { ok: false, error: 'invalid args' };
        const type = args['type'];
        try {
            setCatalogItemDisabled(getGlobalDb(dataDir), { type, name: args['name'], disabled: args['disabled'] === true });
            host.broadcast.send('catalog:updated', { type });
            return { ok: true };
        }
        catch (error) {
            return { ok: false, error: error instanceof Error ? error.message : String(error) };
        }
    });
    host.ipcMain.handle('catalog:removeMissing', async (_e, args) => {
        if (!isRec(args) || !isCatalogType(args['type']))
            return { ok: false, error: 'invalid catalog type' };
        const type = args['type'];
        try {
            const removed = removeMissingCatalogItems(getGlobalDb(dataDir), { type });
            host.broadcast.send('catalog:updated', { type });
            return { ok: true, removed };
        }
        catch (error) {
            return { ok: false, error: error instanceof Error ? error.message : String(error) };
        }
    });
    host.ipcMain.handle('catalog:stacks', async () => {
        const db = getGlobalDb(dataDir);
        ensureCatalogSchema(db);
        ensureOverlaySchema(db);
        return listStacks(db);
    });
    // ── catalog fs handlers (copyToCli/deleteFile/saveAgentSpec/reveal) + marketplace
    //    (search/install) — fs/fetch puros (sem shell.* do Electron). Espelha registerCatalogIpcHandlers.
    const _isSameOrChildPath = (parent, child) => {
        const rel = relative(resolve(parent), resolve(child));
        return rel === '' || (!!rel && !rel.startsWith('..') && !isAbsolute(rel));
    };
    const _expandHome = (p) => {
        const home = homedir();
        if (p === '~')
            return home;
        if (p.startsWith('~/') || p.startsWith('~\\'))
            return resolve(home, p.slice(2));
        return p;
    };
    host.ipcMain.handle('catalog:copyToCli', async (_e, args) => {
        if (!isRec(args) || typeof args['sourcePath'] !== 'string' || typeof args['targetCli'] !== 'string')
            return { ok: false, error: 'invalid args' };
        const targetCli = args['targetCli'];
        if (!['claude', 'codex', 'antigravity'].includes(targetCli))
            return { ok: false, error: 'unknown target CLI' };
        const home = homedir();
        const source = resolve(_expandHome(args['sourcePath'].trim()));
        const skillRoots = [resolve(home, '.claude', 'skills'), resolve(home, '.claude', 'plugins', 'cache'), resolve(home, '.agents', 'skills'), resolve(home, '.codex', 'skills'), resolve(home, '.gemini', 'config', 'skills')];
        const agentRoots = [resolve(home, '.claude', 'agents'), resolve(home, '.codex', 'agents'), resolve(home, '.gemini', 'antigravity-cli', 'agents'), resolve(home, '.gemini', 'antigravity', 'agents')];
        const agentSourceRoot = agentRoots.find((r) => _isSameOrChildPath(r, source));
        const isPluginBundledAgent = !agentSourceRoot && source.endsWith('.md') && basename(dirname(source)) === 'agents';
        const skillSourceRoot = skillRoots.find((r) => _isSameOrChildPath(r, source));
        if (!agentSourceRoot && !isPluginBundledAgent && !skillSourceRoot)
            return { ok: false, error: 'source path outside known skill or agent roots' };
        try {
            if (agentSourceRoot || isPluginBundledAgent) {
                const targetAgentRoot = targetCli === 'codex' ? resolve(home, '.codex', 'agents') : targetCli === 'antigravity' ? resolve(home, '.gemini', 'antigravity-cli', 'agents') : resolve(home, '.claude', 'agents');
                const isFlatFile = source.endsWith('.md') && (isPluginBundledAgent || (agentSourceRoot != null && dirname(source) === agentSourceRoot));
                let sourceUnit = source;
                let symlinkType = 'file';
                if (!isFlatFile && basename(source).toLowerCase() === 'agent.md') {
                    sourceUnit = dirname(source);
                    symlinkType = 'dir';
                }
                else if (isFlatFile) {
                    symlinkType = 'file';
                }
                else {
                    return { ok: false, error: 'cannot infer agent unit to copy' };
                }
                if (isFlatFile && targetCli === 'antigravity') {
                    const agentName = basename(source, '.md');
                    const targetDir = join(targetAgentRoot, agentName);
                    try {
                        await fsp.access(targetDir);
                        return { ok: false, error: `target already exists: ${targetDir}` };
                    }
                    catch { /* proceed */ }
                    const mdContent = await fsp.readFile(source, 'utf-8');
                    const fmMatch = mdContent.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
                    let description = agentName;
                    let body = mdContent;
                    if (fmMatch) {
                        const descMatch = fmMatch[1].match(/^description:\s*(.+)$/m);
                        if (descMatch) {
                            const raw = descMatch[1].trim().replace(/^["']|["']$/g, '');
                            if (raw && raw !== '|' && raw !== '>')
                                description = raw;
                        }
                        body = mdContent.slice(fmMatch[0].length).trim();
                    }
                    await fsp.mkdir(targetDir, { recursive: true });
                    await fsp.writeFile(join(targetDir, 'agent.json'), JSON.stringify({ name: agentName, display_name: agentName, description, system_prompt: body }, null, 2), 'utf-8');
                    host.broadcast.send('catalog:updated', { type: 'agent' });
                    return { ok: true, target: targetDir };
                }
                const unitName = basename(sourceUnit);
                const targetPath = join(targetAgentRoot, unitName);
                try {
                    await fsp.access(targetPath);
                    return { ok: false, error: `target already exists: ${targetPath}` };
                }
                catch { /* proceed */ }
                await fsp.mkdir(targetAgentRoot, { recursive: true });
                await fsp.symlink(sourceUnit, targetPath, symlinkType);
                host.broadcast.send('catalog:updated', { type: 'agent' });
                return { ok: true, target: targetPath };
            }
            const sourceRoot = skillSourceRoot;
            let sourceDir = source;
            if (source.endsWith('SKILL.md'))
                sourceDir = dirname(source);
            if (!sourceDir || sourceDir === sourceRoot)
                return { ok: false, error: 'cannot infer skill folder' };
            const skillName = basename(sourceDir);
            const targetRoot = targetCli === 'codex' ? resolve(home, '.agents', 'skills') : targetCli === 'antigravity' ? resolve(home, '.gemini', 'config', 'skills') : resolve(home, '.claude', 'skills');
            const targetDir = join(targetRoot, skillName);
            try {
                await fsp.access(targetDir);
                return { ok: false, error: `target already exists: ${targetDir}` };
            }
            catch { /* proceed */ }
            await fsp.mkdir(targetRoot, { recursive: true });
            await fsp.symlink(sourceDir, targetDir, 'dir');
            host.broadcast.send('catalog:updated', { type: 'skill' });
            return { ok: true, target: targetDir };
        }
        catch (err) {
            return { ok: false, error: err instanceof Error ? err.message : String(err) };
        }
    });
    host.ipcMain.handle('catalog:deleteFile', async (_e, args) => {
        if (!isRec(args) || typeof args['path'] !== 'string' || !args['path'].trim())
            return { ok: false, error: 'invalid path' };
        const home = homedir();
        const skillAllowedRoots = [resolve(home, '.claude', 'skills'), resolve(home, '.agents', 'skills'), resolve(home, '.codex', 'skills'), resolve(home, '.gemini', 'config', 'skills')];
        const agentAllowedRoots = [resolve(home, '.claude', 'agents'), resolve(home, '.codex', 'agents'), resolve(home, '.gemini', 'antigravity-cli', 'agents'), resolve(home, '.gemini', 'antigravity', 'agents')];
        const pluginCacheRoots = [resolve(home, '.claude', 'plugins', 'cache'), resolve(home, '.codex', 'plugins', 'cache')];
        const target = resolve(_expandHome(args['path'].trim()));
        if (pluginCacheRoots.some((r) => _isSameOrChildPath(r, target)))
            return { ok: false, error: 'refuse: plugin cache is read-only' };
        const skillRootMatch = skillAllowedRoots.find((r) => _isSameOrChildPath(r, target));
        const agentRootMatch = agentAllowedRoots.find((r) => _isSameOrChildPath(r, target));
        const rootMatch = skillRootMatch ?? agentRootMatch;
        if (!rootMatch)
            return { ok: false, error: 'refuse: path outside known skill or agent roots' };
        if (!target.endsWith('SKILL.md') && !target.endsWith('.md'))
            return { ok: false, error: 'refuse: only .md files can be deleted' };
        try {
            await fsp.unlink(target);
            const parent = dirname(target);
            try {
                const remaining = await fsp.readdir(parent);
                if (remaining.length === 0 && parent !== rootMatch)
                    await fsp.rmdir(parent);
            }
            catch { /* ignore */ }
            host.broadcast.send('catalog:updated', { type: agentRootMatch ? 'agent' : 'skill' });
            return { ok: true };
        }
        catch (err) {
            return { ok: false, error: err instanceof Error ? err.message : String(err) };
        }
    });
    host.ipcMain.handle('catalog:saveAgentSpec', async (_e, args) => {
        if (!isRec(args) || typeof args['path'] !== 'string' || !args['path'].trim())
            return { ok: false, error: 'invalid path' };
        if (!isRec(args['patch']))
            return { ok: false, error: 'invalid patch' };
        const home = homedir();
        const target = resolve(_expandHome(args['path'].trim()));
        const allowedRoots = [resolve(home, '.claude', 'agents'), resolve(home, '.codex', 'agents'), resolve(home, '.gemini', 'antigravity-cli', 'agents'), resolve(home, '.gemini', 'antigravity', 'agents')];
        if (!allowedRoots.some((r) => _isSameOrChildPath(r, target)))
            return { ok: false, error: 'refuse: agent path outside known roots' };
        if (!target.endsWith('.md') && !target.endsWith('agent.json'))
            return { ok: false, error: 'refuse: only .md or agent.json files' };
        const p = args['patch'];
        const normalized = {
            tools: Array.isArray(p['tools']) ? p['tools'].filter((v) => typeof v === 'string') : (p['tools'] === null ? null : undefined),
            allowedSkills: Array.isArray(p['allowedSkills']) ? p['allowedSkills'].filter((v) => typeof v === 'string') : (p['allowedSkills'] === null ? null : undefined),
            systemPrompt: typeof p['systemPrompt'] === 'string' ? p['systemPrompt'] : null,
            category: typeof p['category'] === 'string' ? p['category'] : (p['category'] === null ? null : undefined),
            model: typeof p['model'] === 'string' ? p['model'] : (p['model'] === null ? null : undefined),
            effort: typeof p['effort'] === 'string' ? p['effort'] : (p['effort'] === null ? null : undefined),
        };
        try {
            await writeAgentSpec(target, normalized);
            host.broadcast.send('catalog:updated', { type: 'agent' });
            return { ok: true };
        }
        catch (err) {
            return { ok: false, error: err instanceof Error ? err.message : String(err) };
        }
    });
    host.ipcMain.handle('catalog:reveal', () => ({ ok: false, error: 'reveal not supported in sidecar' }));
    host.ipcMain.handle('overclock-catalog:search', async (_e, rawArgs) => {
        const args = (isRec(rawArgs) ? rawArgs : {});
        const q = typeof args['q'] === 'string' ? args['q'].trim() : '';
        const kind = args['kind'] === 'agent' || args['kind'] === 'skill' ? args['kind'] : null;
        const url = new URL('/api/catalog/search', WEB_BASE);
        url.searchParams.set('limit', '100');
        if (q)
            url.searchParams.set('q', q);
        if (kind)
            url.searchParams.set('kind', kind);
        try {
            const res = await fetch(url, { headers: { 'User-Agent': 'overclock' }, signal: AbortSignal.timeout(10_000) });
            if (!res.ok)
                return { ok: false, error: `catalog endpoint ${res.status}` };
            const payload = await res.json();
            const results = (payload.results ?? []).filter((r) => typeof r['slug'] === 'string' && typeof r['name'] === 'string').map((r) => ({
                slug: r['slug'],
                kind: r['kind'] === 'skill' ? 'skill' : 'agent',
                category: typeof r['category'] === 'string' ? r['category'] : '',
                name: r['name'],
                description: typeof r['description'] === 'string' ? r['description'] : '',
                descriptionPt: typeof r['description_pt'] === 'string' ? r['description_pt'] : null,
                tags: Array.isArray(r['tags']) ? r['tags'].filter((t) => typeof t === 'string') : [],
                downloads: typeof r['downloads'] === 'number' ? r['downloads'] : null,
            }));
            return { ok: true, count: typeof payload.count === 'number' ? payload.count : results.length, results };
        }
        catch (err) {
            return { ok: false, error: err instanceof Error ? err.message : String(err) };
        }
    });
    // F-170: install ESCREVE em ~/.claude mas o menu/gate leem o catalog DB — sem rescan pós-write
    // o item instalado não aparece (catalog:list) e não resolve (agent_invoke/allowlist do gate).
    // Espelha o installCatalogComponent do Electron (bootstrapMainProcess ~627): write → scan → broadcast.
    // Compartilhado pelo IPC overclock-catalog:install (UI) e pelo bridge.catalogInstall (MCP
    // overclock_catalog_install — estava não-ligado no sidecar e respondia "not available").
    const rescanCatalogType = async (type) => {
        try {
            await scanCatalog({
                db: getGlobalDb(dataDir),
                type,
                scannerOptions: { homeDir: catalogHomeDir, workspaces: [activeWorkspace].filter(Boolean), squadsJson: join(dataDir, 'squads.json') },
                parseCandidate: parseCandidateLocal,
            });
        }
        catch { /* file is installed; scan retries on next launch/refresh */ }
    };
    const installCatalogComponent = async (kind, slug) => {
        if (!slug || slug.includes('..') || slug.startsWith('/'))
            return { ok: false, error: 'invalid slug' };
        const home = homedir();
        const slugBase = basename(slug);
        try {
            if (kind === 'agent') {
                const destName = slugBase.endsWith('.md') ? slugBase : `${slugBase}.md`;
                const targetPath = join(home, '.claude', 'agents', destName);
                if (existsSync(targetPath))
                    return { ok: true, skipped: true };
                const resp = await fetch(`https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/agents/${slug}.md`, { headers: { 'User-Agent': 'overclock' } });
                if (!resp.ok)
                    return { ok: false, error: `fetch failed: ${resp.status} ${resp.statusText}` };
                await fsp.mkdir(join(home, '.claude', 'agents'), { recursive: true });
                await fsp.writeFile(targetPath, await resp.text(), 'utf-8');
                await rescanCatalogType('agent');
                host.broadcast.send('catalog:updated', { type: 'agent' });
                return { ok: true, installed: { name: destName, path: targetPath } };
            }
            const targetDir = join(home, '.claude', 'skills', slugBase);
            if (existsSync(targetDir))
                return { ok: true, skipped: true };
            const queue = [{ apiUrl: `https://api.github.com/repos/davila7/claude-code-templates/contents/cli-tool/components/skills/${slug}`, localDir: targetDir }];
            while (queue.length > 0) {
                const { apiUrl: currentApiUrl, localDir: currentLocalDir } = queue.shift();
                const r = await fetch(currentApiUrl, { headers: { 'User-Agent': 'overclock' } });
                if (!r.ok)
                    return { ok: false, error: `GitHub API ${r.status}: ${currentApiUrl}` };
                const items = await r.json();
                await fsp.mkdir(currentLocalDir, { recursive: true });
                for (const item of items) {
                    if (item.type === 'file' && item.download_url) {
                        const fr = await fetch(item.download_url, { headers: { 'User-Agent': 'overclock' } });
                        if (!fr.ok)
                            return { ok: false, error: `fetch file failed: ${fr.status}` };
                        await fsp.writeFile(join(currentLocalDir, item.name), await fr.text(), 'utf-8');
                    }
                    else if (item.type === 'dir') {
                        queue.push({ apiUrl: item.url, localDir: join(currentLocalDir, item.name) });
                    }
                }
            }
            await rescanCatalogType('skill');
            host.broadcast.send('catalog:updated', { type: 'skill' });
            return { ok: true, installed: { name: slugBase, path: targetDir } };
        }
        catch (err) {
            return { ok: false, error: err instanceof Error ? err.message : String(err) };
        }
    };
    host.ipcMain.handle('overclock-catalog:install', async (_e, rawArgs) => {
        const args = (isRec(rawArgs) ? rawArgs : {});
        const kind = args['kind'] === 'agent' || args['kind'] === 'skill' ? args['kind'] : null;
        const slug = typeof args['slug'] === 'string' ? args['slug'].trim() : '';
        if (!kind || !slug)
            return { ok: false, error: 'kind (agent|skill) and slug required' };
        return installCatalogComponent(kind, slug);
    });
    // workspace:mkdir / workspace:scan(local) / files:saveDropped — fs puro, stateless,
    // sem deps de Electron (subset puro de registerWorkspaceFilesIpcHandlers). O resto do
    // grupo (open/save/files:read/write/list) precisa de access-control + applyWorkspace
    // + dialog nativo → createCore (follow-up). Remote SSH = Fase 2 (aqui é local-only).
    host.ipcMain.handle('workspace:mkdir', async (_e, dirPath) => {
        if (typeof dirPath !== 'string' || !dirPath)
            return { ok: false, error: 'invalid path' };
        try {
            const { mkdir } = await import('node:fs/promises');
            await mkdir(dirPath, { recursive: true });
            return { ok: true, path: dirPath };
        }
        catch (err) {
            return { ok: false, error: err instanceof Error ? err.message : String(err) };
        }
    });
    host.ipcMain.handle('workspace:scan', async (_e, workspacePath) => {
        if (typeof workspacePath !== 'string' || !workspacePath)
            return { ok: false, error: 'invalid path' };
        try {
            const { readFile, readdir } = await import('node:fs/promises');
            const pkgJson = await readFile(join(workspacePath, 'package.json'), 'utf-8').catch(() => null);
            const readme = await readFile(join(workspacePath, 'README.md'), 'utf-8')
                .catch(() => readFile(join(workspacePath, 'readme.md'), 'utf-8').catch(() => null));
            const entries = await readdir(workspacePath).catch(() => []);
            const topLevel = entries.filter((e) => !e.startsWith('.') && !['node_modules', 'dist', 'build', 'out'].includes(e));
            let pkg = null;
            if (pkgJson) {
                try {
                    pkg = JSON.parse(pkgJson);
                }
                catch { /* ignore */ }
            }
            const stack = [];
            if (pkg?.dependencies) {
                const d = pkg.dependencies;
                if (d['next'])
                    stack.push('Next.js');
                if (d['react'])
                    stack.push('React');
                if (d['vue'])
                    stack.push('Vue');
                if (d['svelte'])
                    stack.push('Svelte');
                if (d['vite'])
                    stack.push('Vite');
                if (d['typescript'] || pkg.devDependencies?.['typescript'])
                    stack.push('TypeScript');
                if (d['tailwindcss'] || pkg.devDependencies?.['tailwindcss'])
                    stack.push('Tailwind');
            }
            if (entries.includes('Cargo.toml'))
                stack.push('Rust');
            if (entries.includes('pyproject.toml') || entries.includes('requirements.txt'))
                stack.push('Python');
            if (entries.includes('go.mod'))
                stack.push('Go');
            return {
                ok: true,
                path: workspacePath,
                name: pkg?.name ?? workspacePath.split('/').pop(),
                version: pkg?.version,
                description: pkg?.description,
                stack,
                readme: readme ? readme.slice(0, 1500) : null,
                topLevel: topLevel.slice(0, 30),
                fileCount: entries.length,
            };
        }
        catch (err) {
            return { ok: false, error: err instanceof Error ? err.message : String(err) };
        }
    });
    host.ipcMain.handle('files:saveDropped', async (_e, name, bytes) => {
        try {
            const { mkdir, writeFile } = await import('node:fs/promises');
            const dir = join(dataDir, 'dropped');
            await mkdir(dir, { recursive: true });
            const safe = (typeof name === 'string' ? name : 'image.png').replace(/[^A-Za-z0-9._-]/g, '_').slice(-80) || 'image.png';
            const target = join(dir, `${Date.now()}-${safe}`);
            // bytes arrives as a base64 string over the WS shim (ArrayBuffer drops to "{}" there) or as a
            // real ArrayBuffer under Electron IPC — accept both. Empty/garbage = bad payload, fail loud.
            const buf = typeof bytes === 'string' ? Buffer.from(bytes, 'base64') : Buffer.from(bytes);
            if (buf.length === 0)
                return { ok: false, error: 'empty payload' };
            await writeFile(target, buf);
            return { ok: true, path: target };
        }
        catch (err) {
            return { ok: false, error: err instanceof Error ? err.message : String(err) };
        }
    });
    // files:list/read — navegação de arquivos do workspace com guard de path-traversal
    // (resolveInWorkspace). Single-window: confia no workspacePath do renderer. Remote SSH +
    // per-window access-control + files:write (mutating) = Fase 2/follow-up.
    host.ipcMain.handle('files:list', async (_e, workspacePath, subPath = '') => {
        if (typeof workspacePath !== 'string' || typeof subPath !== 'string')
            return { ok: false, error: 'invalid path' };
        if (workspacePath.startsWith('ssh://'))
            return { ok: false, error: 'remote workspace = Fase 2' };
        const r = resolveInWorkspace(workspacePath, subPath);
        if (!r)
            return { ok: false, error: 'path escapes workspace' };
        try {
            const { readdir, stat } = await import('node:fs/promises');
            const entries = await readdir(r.target, { withFileTypes: true });
            const SKIP = new Set(['node_modules', '.git', 'dist', 'build', 'out', '.next', '.turbo', '.cache']);
            const items = await Promise.all(entries.filter((e) => !SKIP.has(e.name)).map(async (e) => {
                const fullPath = join(r.target, e.name);
                const isDir = e.isDirectory();
                let isExecutable = false;
                if (!isDir) {
                    try {
                        isExecutable = ((await stat(fullPath)).mode & 0o111) !== 0;
                    }
                    catch {
                        isExecutable = false;
                    }
                }
                return { name: e.name, isDir, isExecutable, path: relative(r.root, fullPath) };
            }));
            items.sort((a, b) => (a.isDir === b.isDir ? a.name.localeCompare(b.name) : a.isDir ? -1 : 1));
            return { ok: true, items };
        }
        catch (err) {
            return { ok: false, error: err instanceof Error ? err.message : String(err) };
        }
    });
    host.ipcMain.handle('files:read', async (_e, workspacePath, relPath) => {
        if (typeof workspacePath !== 'string' || typeof relPath !== 'string')
            return { ok: false, error: 'invalid path' };
        if (workspacePath.startsWith('ssh://'))
            return { ok: false, error: 'remote workspace = Fase 2' };
        const r = resolveInWorkspace(workspacePath, relPath);
        if (!r)
            return { ok: false, error: 'path escapes workspace' };
        try {
            const { readFile, stat } = await import('node:fs/promises');
            const st = await stat(r.target);
            if (st.size > 5 * 1024 * 1024)
                return { ok: false, error: 'file too large' };
            const bytes = await readFile(r.target);
            if (bytes.subarray(0, 8000).includes(0))
                return { ok: false, error: 'binary file cannot be previewed', binary: true };
            return { ok: true, content: bytes.toString('utf-8') };
        }
        catch (err) {
            return { ok: false, error: err instanceof Error ? err.message : String(err) };
        }
    });
    // files:write — escreve dentro do workspace (mesmo guard de traversal). Mutating, mas contido
    // pelo guard. Remote SSH + per-window access-control = Fase 2/follow-up.
    host.ipcMain.handle('files:write', async (_e, workspacePath, relPath, content) => {
        if (typeof workspacePath !== 'string' || typeof relPath !== 'string' || typeof content !== 'string')
            return { ok: false, error: 'invalid file write' };
        if (workspacePath.startsWith('ssh://'))
            return { ok: false, error: 'remote workspace = Fase 2' };
        const r = resolveInWorkspace(workspacePath, relPath);
        if (!r)
            return { ok: false, error: 'path escapes workspace' };
        try {
            const { writeFile } = await import('node:fs/promises');
            await writeFile(r.target, content, 'utf-8');
            return { ok: true };
        }
        catch (err) {
            return { ok: false, error: err instanceof Error ? err.message : String(err) };
        }
    });
    // squads:list/save/delete — store json puro (squads.json). readSquadsFile/writeSquadsFile
    // são compartilhados com o Electron via @overclock-app/core (zero divergência; inclui o
    // recovery de corrupção por prefixo-válido + write atômico por tmp-por-processo).
    const squadsJson = join(dataDir, 'squads.json');
    // BUG-RACE: every squads.json writer (the 4 boot seeds + IPC squads:save/delete + the MCP
    // squadSave bridge) does read → mutate → write. Run concurrently they all read the same
    // (empty, first boot) file and the last rename clobbers the rest — only 1 of 4 builtin squads
    // survives. withSquadsLock funnels every writer through one promise-queue so each
    // read-modify-write completes before the next begins. Hold it AROUND the whole read+write pair.
    let squadsWriteChain = Promise.resolve();
    const withSquadsLock = (fn) => {
        const run = squadsWriteChain.catch(() => undefined).then(fn);
        squadsWriteChain = run.catch(() => undefined);
        return run;
    };
    // C-096 (decisão fechada 2026-07-04, verbatim "nao tem mais squad originals.. eles q criem"):
    // ZERO squads de fábrica. Sem seeding, sem flag pra ressuscitar. Boot só faz limpeza — remove
    // os builtin:true JÁ SEMEADOS por instalações antigas; squads salvos pelo usuário (builtin
    // ausente/false) ficam intocados.
    {
        const BUILTIN_IDS = ['squad-former', 'absurd-landing', 'cinema', 'cinema-site', 'qa-swarm'];
        void (async () => {
            await withSquadsLock(async () => {
                const squads = await readSquadsFile(squadsJson);
                const kept = squads.filter((s) => !(s.builtin && BUILTIN_IDS.includes(s.id)));
                if (kept.length !== squads.length) {
                    await writeSquadsFile(squadsJson, kept);
                    process.stderr.write(`[sidecar] removed ${squads.length - kept.length} factory builtin squad(s)\n`);
                }
            });
            for (const type of ['agent', 'skill']) {
                try {
                    await scanCatalog({
                        db: getGlobalDb(dataDir),
                        type,
                        scannerOptions: { homeDir: catalogHomeDir, workspaces: [activeWorkspace].filter(Boolean), squadsJson },
                        parseCandidate: parseCandidateLocal,
                    });
                    host.broadcast.send('catalog:updated', { type });
                }
                catch (err) {
                    process.stderr.write(`[sidecar] post-seed catalog scan (${type}) failed — ${err instanceof Error ? err.message : String(err)}\n`);
                }
            }
        })().catch((err) => {
            process.stderr.write(`[sidecar] seed+catalog-scan threw — ${err instanceof Error ? err.message : String(err)}\n`);
        });
    }
    host.ipcMain.handle('squads:list', async () => readSquadsFile(squadsJson));
    host.ipcMain.handle('squads:save', async (_e, squad) => withSquadsLock(async () => {
        const squads = await readSquadsFile(squadsJson);
        const idx = squads.findIndex((s) => s.id === squad.id);
        if (idx >= 0)
            squads[idx] = squad;
        else
            squads.push(squad);
        await writeSquadsFile(squadsJson, squads);
        return { ok: true };
    }));
    host.ipcMain.handle('squads:delete', async (_e, id) => withSquadsLock(async () => {
        const squads = (await readSquadsFile(squadsJson)).filter((s) => s.id !== id);
        await writeSquadsFile(squadsJson, squads);
        return { ok: true };
    }));
    // recipes:save/list — user-composed recipes persisted to recipes.json (origin:'user').
    // Mirrors the squads pattern: atomic write via tmp rename + promise-queue lock.
    const recipesJson = join(dataDir, 'recipes.json');
    let recipesWriteChain = Promise.resolve();
    const withRecipesLock = (fn) => {
        const run = recipesWriteChain.catch(() => undefined).then(fn);
        recipesWriteChain = run.catch(() => undefined);
        return run;
    };
    const readRecipesFile = async () => {
        try {
            const { readFile } = await import('node:fs/promises');
            const raw = await readFile(recipesJson, 'utf-8');
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed))
                return [];
            return parsed.filter((r) => r !== null && typeof r === 'object' && typeof r.id === 'string' && typeof r.name === 'string' && typeof r.deliverable === 'string');
        }
        catch {
            return [];
        }
    };
    const writeRecipesFile = async (recipes) => {
        const { writeFile, rename } = await import('node:fs/promises');
        const tmp = recipesJson + '.tmp.' + process.pid;
        await writeFile(tmp, JSON.stringify(recipes, null, 2), 'utf-8');
        await rename(tmp, recipesJson);
    };
    // recipes:list — union baked-in (origin:'overclock', readOnly:true) + user-saved (origin:'user', readOnly:false)
    host.ipcMain.handle('recipes:list', async () => {
        const { listRecipes } = await import('@overclock-app/mcp');
        const baked = listRecipes().map((r) => ({ ...r, readOnly: true }));
        const userRaw = await readRecipesFile();
        const user = userRaw.map((r) => ({ ...r, readOnly: false }));
        return { ok: true, recipes: [...baked, ...user] };
    });
    // recipes:get — full readable detail for ONE recipe (favoriteModel + spine steps +
    // bundled agents/skills), baked-in first then user-saved. Powers Harness › Receitas (C-081):
    // clicking a recipe must OPEN and SHOW its content, which recipes:list (lightweight) can't.
    host.ipcMain.handle('recipes:get', async (_e, id) => {
        const rid = typeof id === 'string' ? id.trim() : '';
        if (!rid)
            return { ok: false, error: 'id required' };
        const { resolveRecipe } = await import('@overclock-app/mcp');
        const baked = resolveRecipe(rid);
        if (baked)
            return { ok: true, recipe: { ...baked, readOnly: true } };
        const user = (await readRecipesFile()).find((r) => r.id === rid);
        if (user)
            return { ok: true, recipe: { ...user, readOnly: false } };
        return { ok: false, error: `no recipe with id ${rid}` };
    });
    // C-081.13 (b): LINT de harness no SAVE de receita — todo agent×skill referenciado (acionamentos
    // chefes[].activations, spine pool/activations, bundledAgents/Skills) DEVE existir no universo
    // COMPLETO: catálogo instalado + baked (AGENT_DEFS via listBuiltinManifest no catalogList) +
    // chefes fixos. Nome desconhecido SEM `gap` explícito no acionamento = REJEITA citando os
    // válidos (F-105: dado > prompt — validar o retorno em vez de confiar). Acionamento com `gap`
    // explícito passa: o gap fica VISÍVEL na receita salva e o runtime já tem protocolo (C-093).
    const lintRecipeAgainstCatalog = (r) => {
        const db = getGlobalDb(dataDir);
        const validAgents = new Set([
            ...catalogList(db, { type: 'agent', includeMissing: false }, { excludeDisabled: true }).map((i) => i.name),
            ...mcpPkg.builtinAgenticSet().agents,
        ]);
        const validSkills = new Set(catalogList(db, { type: 'skill', includeMissing: false }, { excludeDisabled: true }).map((i) => i.name));
        const badAgents = new Set();
        const badSkills = new Set();
        const hasGap = (a) => typeof a.gap === 'string' && a.gap.trim().length > 0;
        const checkAgent = (name, gapOk = false) => {
            if (typeof name === 'string' && name.trim() && !gapOk && !validAgents.has(name.trim()))
                badAgents.add(name.trim());
        };
        const checkSkill = (name, gapOk = false) => {
            if (typeof name === 'string' && name.trim() && !gapOk && !validSkills.has(name.trim()))
                badSkills.add(name.trim());
        };
        const recs = (v) => (Array.isArray(v) ? v.filter(isRec) : []);
        for (const ch of recs(r.chefes)) {
            for (const a of recs(ch.activations)) {
                checkAgent(a.agent, hasGap(a));
                checkSkill(a.skill, hasGap(a));
            }
        }
        for (const ph of recs(r.spine)) {
            for (const p of Array.isArray(ph.pool) ? ph.pool : [])
                checkAgent(p);
            for (const a of recs(ph.activations)) {
                checkAgent(a.agent, hasGap(a));
                for (const s of Array.isArray(a.skills) ? a.skills : [])
                    checkSkill(s, hasGap(a));
            }
        }
        for (const a of Array.isArray(r.bundledAgents) ? r.bundledAgents : [])
            checkAgent(a);
        for (const s of Array.isArray(r.bundledSkills) ? r.bundledSkills : [])
            checkSkill(s);
        if (badAgents.size === 0 && badSkills.size === 0)
            return null;
        const sample = (set) => [...set].slice(0, 8).join(', ');
        const parts = [];
        if (badAgents.size > 0)
            parts.push(`agent(s) inexistente(s): ${[...badAgents].join(', ')} (válidos p.ex.: ${sample(validAgents)})`);
        if (badSkills.size > 0)
            parts.push(`skill(s) inexistente(s): ${[...badSkills].join(', ')} (válidas p.ex.: ${sample(validSkills)})`);
        return `receita cita ${parts.join('; ')} — universo válido = catálogo baked+instalados. ` +
            'Corrija via overclock_agent_list/overclock_skill_list, ou marque `gap` explícito no acionamento.';
    };
    // recipes:save — persist a user recipe (Harness › Receitas "Salvar", C-081 r8 #4). Powers the
    // SALVAR button on a generated possibility: the proposed recipe (favoriteModel + usage + steps
    // with per-step model/tools) is written to recipes.json (origin:'user') and shows up in the saved
    // list, re-openable via recipes:get. Atomic write under the shared recipes lock.
    host.ipcMain.handle('recipes:save', async (_e, payload) => {
        const r = (payload ?? {});
        const name = typeof r.name === 'string' ? r.name.trim() : '';
        if (!name)
            return { ok: false, error: 'name required' };
        const lintErr = lintRecipeAgainstCatalog(r);
        if (lintErr)
            return { ok: false, error: lintErr };
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'receita';
        try {
            return await withRecipesLock(async () => {
                const existing = await readRecipesFile();
                const id = typeof r.id === 'string' && r.id.trim()
                    ? r.id.trim()
                    : (existing.some((x) => x.id === slug) ? `${slug}-${existing.length + 1}` : slug);
                const entry = {
                    ...r,
                    id,
                    name,
                    deliverable: typeof r.deliverable === 'string' ? r.deliverable : '',
                    origin: 'user',
                };
                const next = [...existing.filter((x) => x.id !== id), entry];
                await writeRecipesFile(next);
                return { ok: true, id };
            });
        }
        catch (err) {
            return { ok: false, error: err instanceof Error ? err.message : String(err) };
        }
    });
    // harness:enrichedCatalog — carrega as anotações F5 JÁ persistidas (harness-enriched-catalog.json)
    // pra o renderer popular os badges tier/chefe na montagem, SEM re-rodar F5 (C-081 r8: dados
    // persistem ao fechar/reabrir). Vazio se nunca enriqueceu.
    host.ipcMain.handle('harness:enrichedCatalog', async () => {
        const { loadEnrichedCatalog } = await import('./harnessAssistant.js');
        return { ok: true, items: Object.values(loadEnrichedCatalog(dataDir)) };
    });
    // harness:enrich / harness:propose (C-081) — F5 e a aba Receitas do Harness chamam o modelo
    // default autenticado (claude-agent-sdk OAuth-CLI) via harnessAssistant. Handler NOVO, off
    // JarvisService.ts/GeminiLiveSession.ts (pane da voz continua vivo lá).
    // harness:defaultModel — surfaces WHICH model runs enrich/propose (C-081 r8 #3), so the UI can
    // show it and offer it as the selector's default.
    host.ipcMain.handle('harness:defaultModel', async () => {
        const { harnessEngine } = await import('./harnessAssistant.js');
        const { model, effort } = harnessEngine();
        return { ok: true, model, effort };
    });
    // harness:builtinAgentic — nomes JÁ wired na composição agêntica builtin (3 chefes + workers de
    // receita + suas skills). O renderer marca esses como rank CHEFE; resto = WORKER (C-081 r8, 2º selo).
    host.ipcMain.handle('harness:builtinAgentic', async () => {
        const { builtinAgenticSet } = await import('@overclock-app/mcp');
        return { ok: true, ...builtinAgenticSet() };
    });
    host.ipcMain.handle('harness:enrich', async (_e, payload) => {
        const p = (payload ?? {});
        const agents = Array.isArray(p.agents) ? p.agents.filter((x) => typeof x === 'string') : [];
        const skills = Array.isArray(p.skills) ? p.skills.filter((x) => typeof x === 'string') : [];
        const model = typeof p.model === 'string' ? p.model : undefined;
        const effort = typeof p.effort === 'string' ? p.effort : undefined;
        try {
            const { enrichCatalog, saveEnrichedCatalog } = await import('./harnessAssistant.js');
            const items = await enrichCatalog({ agents, skills, model, effort });
            // PERSIST → the MCP (agent_list/skill_list) consumes these annotations during agentic
            // mission creation so the orchestrator picks the right skill per role/tier at runtime.
            saveEnrichedCatalog(dataDir, items);
            return { ok: true, items };
        }
        catch (err) {
            const code = err instanceof Error ? err.code : undefined;
            if (code === 'claude_cli_missing')
                return { ok: false, error: 'claude_cli_missing', items: [] };
            return { ok: false, error: err instanceof Error ? err.message : String(err), items: [] };
        }
    });
    host.ipcMain.handle('harness:propose', async (_e, payload) => {
        const p = (payload ?? {});
        const arr = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []);
        const model = typeof p.model === 'string' ? p.model : undefined;
        const effort = typeof p.effort === 'string' ? p.effort : undefined;
        try {
            const { proposeRecipes } = await import('./harnessAssistant.js');
            return { ok: true, recipes: await proposeRecipes({ agents: arr(p.agents), skills: arr(p.skills), media: arr(p.media), llms: arr(p.llms), model, effort }) };
        }
        catch (err) {
            const code = err instanceof Error ? err.code : undefined;
            if (code === 'claude_cli_missing')
                return { ok: false, error: 'claude_cli_missing', recipes: [] };
            return { ok: false, error: err instanceof Error ? err.message : String(err), recipes: [] };
        }
    });
    // mission:list/create/update/archive — store json (missions.json) via createMissionStore
    // (core, compartilhável com Electron — adoção no createCore). createWorktree/getGitStatus
    // são git-coupled → ficam pro createCore. Remote workspace = Fase 2 (local-only aqui).
    const missionStore = createMissionStore(join(dataDir, 'missions.json'), dataDir);
    // ── Cron scheduler — store initialised here; tick loop wired after bridgeDeps ──
    // crons.json persists job definitions; the tick loop fires them every 60s.
    // Jobs are distinct from the Claude harness /schedule (cloud routines) — these
    // spawn visible Overclock panes on the host. Missed-while-sleeping = skip-if-stale.
    const cronStore = createCronStore(process.env['OVERCLOCK_CRONS_JSON'] ?? join(dataDir, 'crons.json'), dataDir);
    // mission:syncState — renderer empurra o snapshot do store de missões (sidebar) pro
    // sidecar, que assim conhece a missão ATIVA por workspace (usada como default no spawn).
    host.ipcMain.handle('mission:syncState', async (_e, payload) => {
        if (typeof payload === 'object' && payload !== null
            && typeof payload.missionsByWorkspace === 'object'
            && typeof payload.activeMissionByWorkspace === 'object') {
            const p = payload;
            rendererMissionsMirror.missionsByWorkspace = p.missionsByWorkspace ?? {};
            rendererMissionsMirror.activeMissionByWorkspace = p.activeMissionByWorkspace ?? {};
            // F-014: persistir o snapshot do renderer em missions.json (upsert por id,
            // newest-wins) — sem isto, missões criadas na UI viviam só no localStorage +
            // neste mirror em RAM (perdidas no restart, invisíveis a mission:list, à MCP
            // overclock_mission_list e aos agents). UPSERT (nunca delete por ausência):
            // missões criadas por MCP/agent que o renderer ainda não ingeriu sobrevivem.
            const incoming = Object.values(rendererMissionsMirror.missionsByWorkspace).flat();
            if (incoming.length > 0) {
                try {
                    await missionStore.mutateMissionsFile((missions) => {
                        const byId = new Map(missions.map((m) => [m.id, m]));
                        for (const m of incoming) {
                            // Mesmo gate do readMissionsFile: garante que o que gravamos sobrevive ao re-read.
                            if (!m || typeof m.id !== 'string' || typeof m.workspaceId !== 'string'
                                || typeof m.title !== 'string' || typeof m.createdAt !== 'number'
                                || typeof m.updatedAt !== 'number' || !isMissionStatus(m.status))
                                continue;
                            const existing = byId.get(m.id);
                            if (!existing || m.updatedAt >= (existing.updatedAt ?? 0)) {
                                byId.set(m.id, { ...existing, ...m });
                            }
                        }
                        missions.length = 0;
                        missions.push(...byId.values());
                    });
                }
                catch { /* mirror já atualizado; o próximo sync (debounce 200ms) re-tenta */ }
            }
        }
        return { ok: true };
    });
    host.ipcMain.handle('mission:list', async (_e, options = {}) => {
        try {
            if (options && options.workspaceId !== undefined && typeof options.workspaceId !== 'string') {
                return { ok: false, missions: [], error: 'invalid mission filter' };
            }
            if (options && options.includeArchived !== undefined && typeof options.includeArchived !== 'boolean') {
                return { ok: false, missions: [], error: 'invalid mission filter' };
            }
            const missions = await missionStore.readMissionsFile();
            return { ok: true, missions: filterMissions(missions, options.workspaceId, options.includeArchived === true) };
        }
        catch (err) {
            return { ok: false, missions: [], error: err instanceof Error ? err.message : String(err) };
        }
    });
    host.ipcMain.handle('mission:create', async (_e, inputRaw) => {
        const input = normalizeMissionCreateInput(inputRaw);
        if (!input)
            return { ok: false, error: 'invalid mission payload' };
        const workspacePath = input.workspaceId.trim();
        if (!workspacePath)
            return { ok: false, error: 'invalid workspaceId' };
        let mission = null;
        await missionStore.mutateMissionsFile(async (missions) => {
            const now = Date.now();
            mission = { ...input, status: input.status ?? 'active', id: randomUUID(), createdAt: now, updatedAt: now };
            missions.push(mission);
        });
        if (!mission)
            return { ok: false, error: 'unable to create mission' };
        // F-019: notifica o renderer p/ re-hidratar do missions.json em tempo real
        // (a missão aparece no sidebar sem restart).
        host.broadcast.send('missions:updated');
        return { ok: true, mission };
    });
    host.ipcMain.handle('mission:update', async (_e, inputRaw) => {
        const input = normalizeMissionUpdateInput(inputRaw);
        if (!input)
            return { ok: false, error: 'invalid mission payload' };
        let updated = null;
        let notFound = false;
        await missionStore.mutateMissionsFile(async (missions) => {
            const idx = missions.findIndex((m) => m.id === input.id);
            if (idx < 0) {
                notFound = true;
                return;
            }
            const current = missions[idx];
            const next = { ...current, id: current.id, updatedAt: Date.now() };
            if (input.title)
                next.title = input.title;
            if (input.objective !== undefined)
                next.objective = input.objective;
            if (input.status)
                next.status = input.status;
            if (input.branch !== undefined)
                next.branch = input.branch;
            if (input.worktreePath !== undefined)
                next.worktreePath = input.worktreePath;
            missions[idx] = next;
            updated = next;
        });
        if (notFound || !updated)
            return { ok: false, error: 'mission not found' };
        return { ok: true, mission: updated };
    });
    host.ipcMain.handle('mission:archive', async (_e, missionId) => {
        if (typeof missionId !== 'string' || !missionId.trim())
            return { ok: false, error: 'invalid missionId' };
        let updated = null;
        let notFound = false;
        await missionStore.mutateMissionsFile(async (missions) => {
            const idx = missions.findIndex((m) => m.id === missionId);
            if (idx < 0) {
                notFound = true;
                return;
            }
            const next = { ...missions[idx], status: 'archived', updatedAt: Date.now() };
            missions[idx] = next;
            updated = next;
        });
        if (notFound || !updated)
            return { ok: false, error: 'mission not found' };
        return { ok: true, mission: updated };
    });
    // electronMissions:read — migração Electron→Tauri. Lê o blob do Zustand persist
    // ('overclock-app-missions') do Local Storage do app Electron, pro Tauri (webview
    // com localStorage próprio vazio) semear o histórico no 1º launch. value=null se
    // não achar (sem leveldb / valor só no .ldb comprimido) → renderer não semeia.
    host.ipcMain.handle('electronMissions:read', async () => {
        try {
            const support = process.platform === 'darwin'
                ? join(homedir(), 'Library', 'Application Support')
                : process.platform === 'win32'
                    ? (process.env['APPDATA'] ?? join(homedir(), 'AppData', 'Roaming'))
                    : join(homedir(), '.config');
            const dir = join(support, 'Overclock', 'Local Storage', 'leveldb');
            return { ok: true, value: readLocalStorageValue(dir, 'overclock-app-missions') };
        }
        catch (err) {
            return { ok: false, value: null, error: err instanceof Error ? err.message : String(err) };
        }
    });
    // mission:getGitStatus — status/branch do worktree da mission (git exec, read-only).
    // mission:createWorktree fica: precisa de resolveWorkspaceFromMissionId/normalizeWorktreePath
    // (bootstrap) = follow-up.
    host.ipcMain.handle('mission:getGitStatus', async (_e, missionId) => {
        if (typeof missionId !== 'string' || !missionId.trim())
            return { ok: false, error: 'invalid missionId' };
        const mission = await missionStore.getMissionById(missionId.trim());
        if (!mission)
            return { ok: false, error: 'mission not found' };
        const wt = mission.worktreePath;
        if (!wt)
            return { ok: false, error: 'mission without worktreePath' };
        try {
            const { execFile } = await import('node:child_process');
            const { promisify } = await import('node:util');
            const exec = promisify(execFile);
            const runGit = async (args) => {
                const { stdout } = await exec('git', args, { cwd: wt, timeout: 30000 });
                return typeof stdout === 'string' ? stdout : String(stdout);
            };
            const status = await runGit(['status', '--short']);
            const branch = (await runGit(['rev-parse', '--abbrev-ref', 'HEAD'])).trim();
            const lines = status.split('\n').map((l) => l.trim()).filter(Boolean);
            return { ok: true, worktreePath: wt, branch, clean: lines.length === 0, status: lines };
        }
        catch (err) {
            return { ok: false, error: err instanceof Error ? err.message : String(err) };
        }
    });
    // mission:createWorktree — cria worktree git pra mission (worktree add -b + salva branch/worktreePath).
    // Helpers (resolveWorkspace/normalizeWorktreePath/validateBranch) inline. Remote workspace = não-local.
    host.ipcMain.handle('mission:createWorktree', async (_e, missionId, options = {}) => {
        if (typeof missionId !== 'string' || !missionId.trim())
            return { ok: false, error: 'invalid missionId' };
        const mission = await missionStore.getMissionById(missionId.trim());
        if (!mission)
            return { ok: false, error: 'mission not found' };
        const workspacePath = mission.workspaceId.trim();
        if (!workspacePath || workspacePath.startsWith('ssh://'))
            return { ok: false, error: 'mission workspace is not local' };
        const validateBranch = (v) => {
            const s = sanitizeMissionText(v);
            return s ? s.replace(/[^0-9A-Za-z._/-]/g, '-').replace(/\/+/g, '/').replace(/^-+|\/+$/g, '') : undefined;
        };
        const branch = validateBranch(options?.branch) ?? mission.branch ?? `mission-${mission.id.slice(0, 8)}`;
        const baseRef = sanitizeMissionText(options?.baseRef) ?? 'HEAD';
        const reqWt = options?.worktreePath?.trim();
        const worktreePath = reqWt ? (isAbsolute(reqWt) ? reqWt : join(workspacePath, reqWt)) : join(workspacePath, '.overclock-missions', mission.id);
        const { execFile } = await import('node:child_process');
        const { promisify } = await import('node:util');
        const exec = promisify(execFile);
        const runGit = async (cwd, args) => {
            const { stdout } = await exec('git', args, { cwd, timeout: 30000 });
            return typeof stdout === 'string' ? stdout : String(stdout);
        };
        const { mkdir } = await import('node:fs/promises');
        try {
            await mkdir(join(workspacePath, '.overclock-missions'), { recursive: true });
            if (existsSync(worktreePath)) {
                try {
                    await runGit(worktreePath, ['rev-parse', '--is-inside-work-tree']);
                }
                catch {
                    return { ok: false, error: 'worktreePath already exists' };
                }
                const status = await runGit(worktreePath, ['status', '--short']);
                return { ok: true, mission, branch, worktreePath, existed: true, status: status.split('\n').map((e) => e.trim()).filter(Boolean) };
            }
        }
        catch (err) {
            return { ok: false, error: err instanceof Error ? err.message : String(err) };
        }
        try {
            await runGit(workspacePath, ['worktree', 'add', '-b', branch, worktreePath, baseRef]);
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            if (!/already exists|fatal: A branch named/.test(msg)) {
                try {
                    await runGit(workspacePath, ['worktree', 'add', worktreePath, baseRef]);
                }
                catch {
                    return { ok: false, error: msg };
                }
            }
            else {
                return { ok: false, error: msg };
            }
        }
        await missionStore.mutateMissionsFile(async (missions) => {
            const idx = missions.findIndex((m) => m.id === mission.id);
            if (idx >= 0)
                missions[idx] = { ...missions[idx], branch, worktreePath, updatedAt: Date.now() };
        });
        const refreshed = (await missionStore.getMissionById(mission.id)) ?? { ...mission, branch, worktreePath, updatedAt: Date.now() };
        return { ok: true, mission: refreshed, branch, worktreePath, existed: false };
    });
    // session:loadAll/deleteOne/load/clear — restore de panes por workspace (panes.json +
    // session.json). SessionManager vive em @overclock-app/core (compartilhado c/ Electron);
    // usa o mesmo `pty` do sidecar pro buffer-reader (save() = quando agent panes entrarem).
    // remoteStorageDir MUST be passed: ssh:// panes.json lands under
    // <remoteStorageDir>/<sha256-24>/. Without it SessionManager falls back to
    // resolve('.')/.overclock-remote-workspaces — the sidecar's CWD, which is
    // unstable across restarts → a remote pane saved on spawn can't be found on
    // restore (empty MissionRestoreCards for ssh:// workspaces). Electron passed
    // join(GLOBAL_DIR, 'remote-workspaces') (bootstrapMainProcess.ts ~4254); the
    // Tauri port dropped it. dataDir is the sidecar's stable equivalent.
    const sessionManager = new SessionManager(pty, join(dataDir, 'remote-workspaces'));
    // Invalidates the ProviderSessionsService 15s scan cache after every panes.json write so
    // restore lists see the new snapshot immediately. Set once providerSessions is constructed
    // (below); callable from saveAllWorkspaces and the close-pane save path.
    let providerSessionsInvalidate = null;
    // F-065 round 4: resolveTranscriptOwner is bound after claudeSessions is constructed below
    // (forward ref — same lazy-assign idiom as providerSessionsInvalidate). session:loadAll returns
    // the RAW panes.json (loadMissionRestoreSessions/"Panes salvos desta missão" reads it directly,
    // bypassing claude:sessions/provider-sessions:list's M2/M3 gate), so without this a card whose
    // sid never got a transcript (pane closed before first message) or whose stale providerId tag
    // no longer matches the real root stays offered and resume dies with "No conversation found".
    let resolveTranscriptOwner = null;
    host.ipcMain.handle('session:loadAll', async (_e, workspacePath) => {
        try {
            const rawLocal = await sessionManager.loadAll(workspacePath);
            const local = resolveTranscriptOwner
                ? await validateClaudeRestorePanes(rawLocal, resolveTranscriptOwner)
                : rawLocal;
            // VPS mode: the host is the source of truth. Local panes.json only holds the few panes THIS
            // install spawned-and-persisted; sessions launched by an earlier build, another machine, or an
            // agent's MCP pane_spawn live only as tmux on the host. Merge them in (with the missionId
            // recovered from the @ovc_mission tag) so per-mission history (loadMissionRestoreSessions) groups
            // remote sessions under their mission instead of dropping them into "sem missão".
            if (!workspacePath.startsWith('ssh://'))
                return local;
            let alias;
            try {
                const ref = parseWorkspaceRef(workspacePath);
                if (ref.kind !== 'remote')
                    return local;
                alias = ref.hostAlias;
            }
            catch {
                return local;
            }
            const localPaneIds = new Set();
            for (const s of local)
                for (const p of s.panes)
                    localPaneIds.add(p.id);
            const live = await listRemoteOrphanSessions(alias).catch(() => []);
            const merged = [...local];
            for (const o of live) {
                const paneId = o.paneId ?? o.session;
                if (localPaneIds.has(paneId))
                    continue; // already tracked on disk — no duplicate
                const agent = o.agent || 'claude';
                const pane = {
                    id: paneId,
                    agent,
                    cwd: workspacePath,
                    lastLines: o.preview ? [o.preview] : [],
                    remoteHostAlias: alias,
                    remoteTmuxSession: o.session,
                    ...(o.missionId ? { missionId: o.missionId } : {}),
                    ...(o.model ? { model: o.model } : {}),
                };
                merged.push({ id: `tmux:${o.session}`, workspacePath, savedAt: o.lastActivity || 0, panes: [pane] });
            }
            return merged;
        }
        catch {
            return [];
        }
    });
    host.ipcMain.handle('session:deleteOne', async (_e, workspacePath, sessionId) => {
        try {
            await sessionManager.deleteSession(workspacePath, sessionId);
            return { ok: true };
        }
        catch {
            return { ok: false };
        }
    });
    host.ipcMain.handle('session:load', async (_e, workspacePath) => {
        try {
            return await sessionManager.load(workspacePath);
        }
        catch {
            return null;
        }
    });
    host.ipcMain.handle('session:clear', async (_e, workspacePath) => {
        try {
            await sessionManager.clear(workspacePath);
            return { ok: true };
        }
        catch {
            return { ok: false };
        }
    });
    // saveAllWorkspaces — persist every workspace's panes to panes.json.
    // Saves ALL configs (live + done/exited), not only those in pty.listPanes():
    // done panes may have exited between autosave ticks and would be silently lost
    // if filtered by pty.listPanes() (F-001). SessionManager.save() already guards
    // against unstarted claude panes via the session-id check. Remote (ssh://) panes
    // are grouped by their remote workspacePath and saved too.
    const saveAllWorkspaces = async () => {
        const byWorkspace = new Map();
        for (const [paneId, cfg] of configs.entries()) {
            const ws = cfg.workspacePath ?? activeWorkspace;
            if (!ws)
                continue;
            let map = byWorkspace.get(ws);
            if (!map) {
                map = new Map();
                byWorkspace.set(ws, map);
            }
            map.set(paneId, cfg);
        }
        for (const [ws, map] of byWorkspace) {
            try {
                await sessionManager.save(ws, map);
                providerSessionsInvalidate?.(ws);
            }
            catch (err) {
                process.stderr.write(`[sidecar] autosave workspace "${ws}" failed (non-fatal): ${err instanceof Error ? err.message : String(err)}\n`);
            }
        }
        // Write browser-panes.json per workspace (separate from PTY session state — browser panes
        // have no PTY buffer so they can't go through sessionManager.save()).
        const browserByWorkspace = new Map();
        for (const entry of browserPanes.values()) {
            const ws = entry.workspacePath ?? activeWorkspace;
            if (!ws)
                continue;
            const list = browserByWorkspace.get(ws) ?? [];
            list.push(entry);
            browserByWorkspace.set(ws, list);
        }
        for (const [ws, entries] of browserByWorkspace) {
            try {
                const dir = join(ws, '.overclock-app');
                mkdirSync(dir, { recursive: true });
                writeFileSync(join(dir, 'browser-panes.json'), JSON.stringify(entries), 'utf-8');
            }
            catch { /* best-effort */ }
        }
    };
    // session:save-current — graceful quit hook (Wire phase, approach a).
    // Called by the renderer shim's respondQuit(true) BEFORE acking the Rust quit-gate,
    // so the PTY session state is persisted to panes.json before the process exits.
    // Now saves ALL open workspaces (not just the active one) for parity with Electron.
    host.ipcMain.handle('session:save-current', async () => {
        try {
            await saveAllWorkspaces();
            return { ok: true };
        }
        catch (err) {
            process.stderr.write(`[sidecar] session:save-current failed (non-fatal): ${err instanceof Error ? err.message : String(err)}\n`);
            return { ok: false };
        }
    });
    // Periodic autosave (30s) — Electron parity (bootstrapMainProcess had a 30s setInterval).
    // The graceful-quit hook alone is fragile: a crash, a force-quit, or the Rust quit-gate not
    // firing respondQuit(true) all leave panes.json stale → empty mission restore cards. This
    // timer keeps panes.json fresh so a session captured mid-run survives an ungraceful exit.
    // .unref() so it never keeps the event loop alive on its own.
    const autosaveTimer = setInterval(() => { void saveAllWorkspaces(); }, 30_000);
    autosaveTimer.unref();
    // session:setMission — reassign a LIVE pane to a different mission (or unassign with null).
    // Updates the sidecar-local config so the change persists through the next autosave to
    // panes.json (else a restart would revert to the spawn-time missionId). The renderer also
    // updates its own panes store for the immediate visual move; this keeps disk in sync.
    host.ipcMain.handle('session:setMission', async (_e, paneId, missionId) => {
        try {
            const cfg = configs.get(paneId);
            if (!cfg)
                return { ok: false, error: 'pane not found' };
            cfg.missionId = missionId ?? undefined;
            configs.set(paneId, cfg);
            void saveAllWorkspaces();
            return { ok: true };
        }
        catch (err) {
            return { ok: false, error: err instanceof Error ? err.message : String(err) };
        }
    });
    // claude:summary — fs puro (transcript jsonl do Claude Code).
    host.ipcMain.handle('claude:summary', async (_e, sessionId) => readClaudeSummary(sessionId));
    // claude:sessions — lista sessões Claude restauráveis do workspace (scan de
    // ~/.claude/projects/<slug> + merge c/ panes salvos). ClaudeSessionsService no core,
    // compartilhado c/ Electron.
    // F-065: account roots multi-conta LIGADOS ao ProviderStore — sem eles o scan só via
    // <default>/projects e as sessões das contas extras (claude-accounts/<id>/projects)
    // ficavam invisíveis na lista de restore E sem a tag providerId; um resume dessas
    // sessões spawnava na conta default e o claude respondia "No conversation found"
    // (o resume só acha o transcript sob o MESMO CLAUDE_CONFIG_DIR + mesmo cwd).
    const claudeSessions = new ClaudeSessionsService(sessionManager, () => providerStore.listClaudeAccounts()
        .filter((p) => p.claudeConfigDir)
        .map((p) => ({ providerId: p.id, projectsRoot: join(p.claudeConfigDir, 'projects') })));
    host.ipcMain.handle('claude:sessions', async (_e, workspacePath) => {
        if (typeof workspacePath !== 'string')
            return [];
        return claudeSessions.list(workspacePath);
    });
    // Wire session:loadAll's mission-cards validation now that claudeSessions exists (F-065 r4).
    resolveTranscriptOwner = (sessionId, cwd) => claudeSessions.resolveTranscriptOwner(sessionId, cwd);
    // provider-sessions:list — restore multi-provider (claude/codex/gemini/kimi/antigravity/
    // cursor/copilot) escaneando os dirs nativos de cada CLI + merge c/ panes salvos.
    // ProviderSessionsService no core; copilot via node:sqlite readonly (graceful se DB ausente).
    const providerSessions = new ProviderSessionsService(claudeSessions, sessionManager);
    // Wire the invalidate callback now that providerSessions is constructed.
    providerSessionsInvalidate = (ws) => providerSessions.invalidate(ws);
    host.ipcMain.handle('provider-sessions:list', async (_e, workspacePath) => {
        if (typeof workspacePath !== 'string')
            return [];
        return providerSessions.list(workspacePath);
    });
    // remote:listTmuxSessions — orphan recovery. Lists overclock_* tmux sessions still alive on a
    // remote host so the UI can offer reattach (RemoteSshTmuxManager.remoteTmuxSession). Accepts a
    // host alias or an ssh:// workspace path (the alias is parsed out).
    host.ipcMain.handle('remote:listTmuxSessions', async (_e, hostOrWorkspace) => {
        if (typeof hostOrWorkspace !== 'string' || !hostOrWorkspace.trim())
            return [];
        let alias = hostOrWorkspace.trim();
        if (alias.startsWith('ssh://')) {
            try {
                const ref = parseWorkspaceRef(alias);
                if (ref.kind !== 'remote')
                    return [];
                alias = ref.hostAlias;
            }
            catch {
                return [];
            }
        }
        return listRemoteOrphanSessions(alias);
    });
    // remote:killTmuxSession — kill an orphan overclock_* tmux session on a remote host and remove
    // it from panes.json. Idempotent: session already gone → returns ok. Session name validated
    // against /^overclock_[0-9a-f_-]+$/ before use; shell-quoted via shQuote (same as listRemote).
    host.ipcMain.handle('remote:killTmuxSession', async (_e, hostOrWorkspace, session) => {
        if (typeof hostOrWorkspace !== 'string' || !hostOrWorkspace.trim())
            return { ok: false, error: 'invalid workspace' };
        if (typeof session !== 'string' || !/^overclock_[0-9a-f_-]+$/.test(session))
            return { ok: false, error: 'invalid session name' };
        const workspacePath = hostOrWorkspace.trim();
        let alias = workspacePath;
        if (alias.startsWith('ssh://')) {
            try {
                const ref = parseWorkspaceRef(alias);
                if (ref.kind !== 'remote')
                    return { ok: false, error: 'not a remote workspace' };
                alias = ref.hostAlias;
            }
            catch (err) {
                return { ok: false, error: err instanceof Error ? err.message : String(err) };
            }
        }
        if (!/^[A-Za-z0-9._-]+$/.test(alias) || alias.startsWith('-'))
            return { ok: false, error: 'invalid host alias' };
        // Kill the tmux session on the remote. `|| true` makes it idempotent (already gone → ok).
        try {
            const { execFile: _execFileKill } = await import('node:child_process');
            const { promisify: _prmify } = await import('node:util');
            const _exec = _prmify(_execFileKill);
            await _exec('ssh', [
                '-o', 'BatchMode=yes',
                '-o', 'ConnectTimeout=8',
                alias,
                `tmux kill-session -t ${shQuote(session)} 2>/dev/null || true`,
            ], { encoding: 'utf8', timeout: 12_000 });
        }
        catch (err) {
            return { ok: false, error: `kill-session failed: ${err instanceof Error ? err.message : String(err)}` };
        }
        // Remove all panes.json entries whose remoteTmuxSession matches this session (best-effort).
        try {
            const wsSessions = await sessionManager.loadAll(workspacePath);
            for (const ws of wsSessions) {
                for (const pane of ws.panes) {
                    if (pane.remoteTmuxSession === session) {
                        await sessionManager.deleteSession(workspacePath, pane.id);
                    }
                }
            }
        }
        catch { /* best-effort — kill already succeeded */ }
        return { ok: true };
    });
    // providers:templates — catálogo estático de presets de provider (UI "adicionar provider").
    // PROVIDER_TEMPLATES compartilhado via @overclock-app/core (data pura).
    host.ipcMain.handle('providers:templates', () => PROVIDER_TEMPLATES);
    // providers:testToken — valida credencial/endpoint do provider antes de salvar (probe network).
    host.ipcMain.handle('providers:testToken', async (_e, args) => testProviderToken(args));
    // providers:listModels — lista modelos do endpoint (módulo provider-endpoint do core).
    host.ipcMain.handle('providers:listModels', async (_e, args) => listModelsFromEndpoint(args));
    // providers:healthCheck — multi-probe (models + generation + tools + context) do endpoint.
    host.ipcMain.handle('providers:healthCheck', async (_e, args) => healthCheckProviderEndpoint(args));
    // providers:refreshModels — re-detecta modelos de um provider salvo (get + listModels do endpoint).
    // Simplificado (sem análise launchable/route OpenRouter — usa checkSmallGeneration/etc = follow-up).
    host.ipcMain.handle('providers:refreshModels', async (_e, providerId) => {
        if (typeof providerId !== 'string')
            return { ok: false, error: 'invalid providerId' };
        const provider = providerStore.get(providerId);
        if (!provider)
            return { ok: false, error: 'provider not found' };
        if (provider.type !== 'openai-compat' && provider.type !== 'anthropic-compat') {
            return { ok: false, error: 'provider does not expose a model catalog endpoint' };
        }
        const baseUrl = provider.env?.['OPENAI_BASE_URL'] ?? provider.env?.['ANTHROPIC_BASE_URL'] ?? provider.env?.['BASE_URL'] ?? '';
        if (!baseUrl)
            return { ok: false, error: 'provider base URL missing' };
        const token = provider.env?.['OPENROUTER_API_KEY'] ?? provider.env?.['OPENAI_API_KEY'] ?? provider.env?.['ANTHROPIC_AUTH_TOKEN'] ?? provider.env?.['TOKEN'];
        const result = await listModelsFromEndpoint({ type: provider.type, host: provider.host, baseUrl, token, authMode: provider.authMode });
        return { ok: result.ok, models: result.models, count: result.models.length, reason: result.reason, status: result.status, hint: result.hint };
    });
    // shells:list — detectShells compartilhado via @overclock-app/core (probe de binários de shell).
    host.ipcMain.handle('shells:list', () => detectShells());
    // skill:status/installOverclock/uninstallOverclock — fs/git puro (gerencia ~/.claude/skills/
    // overclock-skill). Self-contained; espelha registerConfigCliIpcHandlers.ts.
    host.ipcMain.handle('skill:status', async () => {
        try {
            const target = join(homedir(), '.claude', 'skills', 'overclock-skill');
            const { access } = await import('node:fs/promises');
            await access(target);
            return { installed: true, path: target };
        }
        catch {
            return { installed: false };
        }
    });
    host.ipcMain.handle('skill:uninstallOverclock', async () => {
        try {
            const target = join(homedir(), '.claude', 'skills', 'overclock-skill');
            const { rm } = await import('node:fs/promises');
            await rm(target, { recursive: true, force: true });
            return { ok: true };
        }
        catch (err) {
            return { ok: false, error: err instanceof Error ? err.message : String(err) };
        }
    });
    host.ipcMain.handle('skill:installOverclock', async () => {
        try {
            const skillsDir = join(homedir(), '.claude', 'skills');
            const target = join(skillsDir, 'overclock-skill');
            const { mkdir, access } = await import('node:fs/promises');
            const { execFile } = await import('node:child_process');
            const { promisify } = await import('node:util');
            const exec = promisify(execFile);
            await mkdir(skillsDir, { recursive: true });
            let action = 'cloned';
            try {
                await access(target);
                await exec('git', ['-C', target, 'pull', '--ff-only'], { timeout: 30000 });
                action = 'updated';
            }
            catch {
                await exec('git', ['clone', '--depth', '1', 'https://github.com/BFLabsAI/overclock-skill.git', target], { timeout: 60000 });
            }
            return { ok: true, action, path: target };
        }
        catch (err) {
            return { ok: false, error: err instanceof Error ? err.message : String(err) };
        }
    });
    // ── Camada 1 (vestiário) resolver — C-048/D3, shared ─────────────────────────────────────────
    // Resolves a persona name into cli/model/effort/systemPrompt and validates it against
    // allowedSkills (T-014). Referenced here but only called once bridgeDeps.catalogList is set
    // (bridgeDeps is assigned further down; this closes over it — fine, both call sites below
    // only invoke it at spawn time, long after setup finishes). Used by BOTH bridgeDeps.spawnPane
    // (mission_spawn_pane, MCP) and the pty:spawn IPC handler (renderer "aplicar" button, C-047
    // item 5) so the two callers dress a worker identically instead of duplicating resolution.
    async function resolvePersonaForSpawn(opts) {
        let resolvedCli;
        let resolvedModel;
        let resolvedEffort;
        let extraSystemPrompt;
        if (opts.persona) {
            const spec = await mcpPkg.resolveAgentSpec({ catalogList: bridgeDeps.catalogList }, opts.persona, opts.agent);
            mcpPkg.validateSkillComposition(spec.agentName, spec.declaredSkills, opts.allowedSkills ?? null);
            resolvedCli = spec.cli;
            resolvedModel = spec.model;
            resolvedEffort = spec.effort;
            extraSystemPrompt = spec.systemPrompt ?? undefined;
        }
        const claudeSkillGate = opts.allowedSkills !== undefined && opts.allowedSkills !== null
            ? { allowedSkills: opts.allowedSkills, allowedTools: null, deniedTools: null, requiredSkillsForMedia: null }
            : undefined;
        const agent = opts.agent ?? resolvedCli;
        if (opts.allowedSkills && opts.allowedSkills.length > 0)
            ensureSkillsForCli(agent, opts.allowedSkills);
        return { agent, model: resolvedModel, effort: resolvedEffort, extraSystemPrompt, claudeSkillGate };
    }
    // ── Agent reachability of pty:spawn (re-review #11) ──────────────────────────────────────────
    // pty:spawn is a RENDERER→MAIN Electron IPC handler.  It is called exclusively by renderer
    // code via window.overclockApp.pty.spawn (overclockAppShim.ts) or the preload bridge.
    // Agent CLIs (Claude Code, Codex, Gemini, …) run as child processes outside the Electron
    // renderer context.  They can only reach Overclock via the MCP HTTP server — specifically the
    // pane_spawn / overclock_mission_spawn_pane / overclock_squad_spawn / overclock_agent_invoke
    // tools, all of which go through bridgeDeps.spawnPane where shouldBlockSquadPaneSpawn fires.
    // There is NO path from an agent tool-call to pty:spawn — adding the gate here would be dead
    // code and confusing. The gate therefore lives ONLY in bridgeDeps.spawnPane (above).
    // C-047 item 5 exception: persona/allowedSkills (camada 1) ARE resolved+validated here too —
    // resolvePersonaForSpawn above, shared with bridgeDeps.spawnPane — so a recipe's "aplicar"
    // button can dress a worker from the renderer without a squad-gate bypass (squad enforcement
    // itself, shouldBlockSquadPaneSpawn, is untouched and still lives only on the MCP path).
    host.ipcMain.handle('pty:spawn', async (_e, raw) => {
        const input = (raw ?? {});
        if (input.persona || input.allowedSkills !== undefined) {
            try {
                const persona = await resolvePersonaForSpawn({ persona: input.persona, allowedSkills: input.allowedSkills, agent: input.agent });
                if (persona.agent)
                    input.agent = persona.agent;
                if (!input.model && persona.model)
                    input.model = persona.model;
                if (!input.effort && persona.effort)
                    input.effort = persona.effort;
                if (persona.extraSystemPrompt) {
                    input.extraSystemPrompt = input.extraSystemPrompt
                        ? `${input.extraSystemPrompt}\n\n${persona.extraSystemPrompt}`
                        : persona.extraSystemPrompt;
                }
                if (persona.claudeSkillGate)
                    input.claudeSkillGate = persona.claudeSkillGate;
            }
            catch (err) {
                return { ok: false, error: err instanceof Error ? err.message : String(err) };
            }
        }
        // F-014: pin the allocated id onto input BEFORE buildSpawnConfig runs — buildSpawnConfig
        // does its own `input.paneId || allocatePaneId()` fallback, so leaving input.paneId unset
        // here burned a SECOND id per spawn (the discarded `id`), wasting every other number.
        // F-015: only honor an explicit input.paneId when it's already a canonical `pane-N`
        // (a resume/reattach of a pane this allocator minted before) — any other shape (e.g. a
        // renderer-side nanoid for a brand-new pane) falls through to allocatePaneId() instead
        // of being adopted as-is.
        const id = (input.paneId && paneIdNumber(input.paneId) !== null) ? input.paneId : allocatePaneId();
        input.paneId = id;
        // Defense-in-depth: refuse a squad spawn (delegateOnly / squadCallable) aimed at a
        // remote workspace BEFORE tryRemoteSpawn runs. tryRemoteSpawn silently drops all squad
        // enforcement fields (buildSpawnConfig never runs), producing a full-tools orchestrator.
        // The renderer guard (WorkspaceTabs F-003) is the primary check; this catches any path
        // that bypasses it (headless callers, integration tests, future APIs).
        // Pass BOTH cwd and workspacePath to mirror tryRemoteSpawn's OR-routing:
        // it routes remote when EITHER ref is ssh://, so the guard must refuse when
        // EITHER is ssh:// (a local cwd + remote workspacePath would otherwise bypass).
        if (isRemoteSquadSpawn(input.cwd, input.squadCallable, input.workspacePath)) {
            return { ok: false, error: 'Squad spawn refused: local-only squad enforcement (delegateOnly / squadCallable) cannot run on an ssh:// workspace. Use Modo Livre with CLIs installed on the remote host.' };
        }
        // ── Remote (ssh://) routing via the shared tryRemoteSpawn helper. ──
        // When cwd or workspacePath is ssh://, the spawn is routed to the SSH manager and we
        // return BEFORE touching the local pty/buildSpawnConfig. Same helper drives bridge.spawnPane.
        const remote = await tryRemoteSpawn(id, input);
        if (remote.remote)
            return remote.result;
        const result = await buildSpawnConfig(input);
        if ('error' in result)
            return { ok: false, error: result.error };
        const { id: localId, config } = result;
        await injectCliMcp(config.agent, config.cwd, localId, input.model, input.providerId);
        try {
            const { pid } = await pty.spawn(config);
            configs.set(localId, config);
            // PERSIST-ON-CREATE (mission-170): write this pane's SavedPane entry to panes.json
            // immediately, so a pane spawned-typed-closed inside the 30s autosave window still
            // restores. Reuses saveAllWorkspaces (the autosave fn) — the config is already in
            // `configs`, which saveAllWorkspaces snapshots synchronously. Best-effort/non-blocking.
            void saveAllWorkspaces();
            watchClaudeCwd(config);
            if (config.agent !== 'shell')
                activeWorkspace = config.cwd;
            pushRemoteState(); // new pane → push the fresh pane list to phone
            // C2b: return model and providerId so the renderer can use them in addPane without
            // having to fall back to the saved pane values (which may be stale on a model upgrade).
            // F-033: also return the RESOLVED missionId — on resume the sidecar keeps the pane's
            // ORIGINAL mission (no silent rebind), which may differ from the missionId the renderer
            // sent (the active one). The renderer can consume this to bucket the pane correctly.
            return { ok: true, paneId: localId, pid, model: config.model, providerId: config.providerId, missionId: config.missionId ?? null };
        }
        catch (err) {
            return { ok: false, error: String(err) };
        }
    });
    // Route pane ops to the remote SSH manager when the pane is remote; else local PtyManager.
    const mgr = (paneId) => (remotePaneIds.has(paneId) ? remotePty : pty);
    host.ipcMain.handle('pty:write', (_e, paneId, data) => {
        try {
            mgr(paneId).write(paneId, data);
            return { ok: true };
        }
        catch (err) {
            return { ok: false, error: String(err) };
        }
    });
    host.ipcMain.handle('pty:read', (_e, paneId, lastN) => {
        try {
            return { ok: true, lines: mgr(paneId).getBuffer(paneId).readPlain(lastN ?? 50) };
        }
        catch (err) {
            return { ok: false, lines: [], error: String(err) };
        }
    });
    host.ipcMain.handle('pty:readRaw', (_e, paneId, lastN) => {
        try {
            return { ok: true, lines: mgr(paneId).getBuffer(paneId).readRaw(lastN ?? 50) };
        }
        catch (err) {
            return { ok: false, lines: [], error: String(err) };
        }
    });
    host.ipcMain.handle('pty:readRawText', (_e, paneId) => {
        try {
            return { ok: true, text: mgr(paneId).getBuffer(paneId).readRawText() };
        }
        catch (err) {
            return { ok: false, text: '', error: String(err) };
        }
    });
    // C-063: geometry-tolerant restore for no-alt-screen TUI panes (claude). Serialized
    // grid+scrollback instead of raw re-execution — see OutputBuffer.readSerialized.
    host.ipcMain.handle('pty:readSerialized', (_e, paneId) => {
        try {
            return { ok: true, text: mgr(paneId).getBuffer(paneId).readSerialized() };
        }
        catch (err) {
            return { ok: false, text: '', error: String(err) };
        }
    });
    host.ipcMain.handle('pty:resize', (_e, paneId, cols, rows) => {
        try {
            mgr(paneId).resize(paneId, cols, rows);
            return { ok: true };
        }
        catch (err) {
            return { ok: false, error: String(err) };
        }
    });
    host.ipcMain.handle('pty:kill', async (_e, paneId) => {
        try {
            const cfg = configs.get(paneId);
            // F-N03: await the SIGTERM→SIGKILL escalation instead of fire-and-forget kill().
            // killAndWait resolves false when the process tree survives — fire-and-forget
            // returned ok:true unconditionally even for a child that ignored the kill.
            const killed = await mgr(paneId).killAndWait(paneId);
            // F-026: intentional close (X) dismisses the session from the GENERAL restore list
            // (F-008: no native-scanner accumulation) but KEEPS the pane in panes.json so it
            // stays recoverable in its mission's restore cards (loadAll). saveAllWorkspaces keeps
            // all other live configs.
            if (cfg) {
                const ws = cfg.workspacePath ?? activeWorkspace;
                if (ws) {
                    void sessionManager.dismissSession(ws, paneId).then(() => providerSessionsInvalidate?.(ws)).catch(() => { });
                }
            }
            void cleanupPaneFiles(panesDir, paneId);
            // Antigravity flushes its session id (last_conversations.json) at session end/update, so
            // a fast open→close may never have stamped cfg.session via the post-spawn poll. Re-run the
            // capture HERE (before configs.delete) to catch the final id on close. Best-effort/non-blocking.
            if (cfg?.agent === 'antigravity')
                captureNonWatchedSession(cfg);
            // Belt-and-suspenders (mission-170): persist this pane's latest config (e.g. a
            // claudeSessionId captured since the last autosave) BEFORE dropping it from `configs`.
            // saveAllWorkspaces snapshots `configs` synchronously, so the pane is captured before
            // configs.delete below — an abrupt close inside the autosave window can't lose it.
            void saveAllWorkspaces();
            configs.delete(paneId);
            remotePaneIds.delete(paneId);
            // F-N03: ok now reflects the TRUE kill outcome — false means a child survived
            // the escalation and the renderer should not treat the pane as cleanly closed.
            return { ok: killed };
        }
        catch (err) {
            return { ok: false, error: String(err) };
        }
    });
    // pty:hibernate — suspende o pane (mantém buffer+config, emite 'suspend'); RAM lever.
    host.ipcMain.handle('pty:hibernate', async (_e, paneId) => {
        if (typeof paneId !== 'string')
            return { ok: false, error: 'invalid paneId' };
        try {
            const ok = await pty.suspend(paneId);
            return { ok };
        }
        catch (err) {
            return { ok: false, error: err instanceof Error ? err.message : String(err) };
        }
    });
    // pty:wake — re-spawna um pane hibernado a partir do config preservado (pty.resumeConfig
    // pop + pty.spawn). Espelha bootstrap 5099. Sessão claude --resume + restauração de buffer
    // = follow-up (mesma limitação do scope "agent panes básicos" do sidecar).
    host.ipcMain.handle('pty:wake', async (_e, paneId) => {
        if (typeof paneId !== 'string')
            return { ok: false, error: 'invalid paneId' };
        if (!pty.isHibernated(paneId))
            return { ok: false, error: 'not hibernated' };
        const cfg = pty.resumeConfig(paneId) ?? configs.get(paneId);
        if (!cfg)
            return { ok: false, error: 'no config for pane' };
        try {
            const { pid } = await pty.spawn(cfg);
            configs.set(paneId, cfg);
            watchClaudeCwd(cfg);
            return { ok: true, paneId, pid };
        }
        catch (err) {
            return { ok: false, error: err instanceof Error ? err.message : String(err) };
        }
    });
    // perf:snapshot — RAM/CPU dos agent panes (o lever de ~370MB/agente) + RSS do sidecar.
    // No Tauri, o array "electron" reporta o processo do sidecar (Node); a RAM do shell Rust não
    // é medida aqui (getAppMetrics é Electron-only). Genuíno (ps real), não stub.
    host.ipcMain.handle('perf:snapshot', async () => {
        const panes = pty.listPanes();
        const byPid = await rssCpuForPids(panes.map((p) => p.pid));
        const paneRows = panes.map((p) => ({ paneId: p.paneId, agent: p.agent, pid: p.pid, rssMB: byPid.get(p.pid)?.rssMB ?? 0, cpu: byPid.get(p.pid)?.cpu ?? 0 }));
        const sidecarRssMB = Math.round(process.memoryUsage().rss / 1024 / 1024);
        const panesRssMB = paneRows.reduce((s, p) => s + p.rssMB, 0);
        return {
            at: Date.now(),
            totalRssMB: sidecarRssMB + panesRssMB,
            electronRssMB: sidecarRssMB,
            panesRssMB,
            paneCount: paneRows.length,
            electron: [{ pid: process.pid, type: 'sidecar', rssMB: sidecarRssMB, cpu: 0 }],
            panes: paneRows,
        };
    });
    host.ipcMain.handle('pty:list', () => {
        const local = pty.listPanes().map((p) => {
            const cfg = configs.get(p.paneId);
            return {
                ...p,
                agent: cfg?.agent ?? p.agent,
                cwd: cfg?.cwd ?? p.cwd,
                shellPath: cfg?.shellPath,
            };
        });
        // Include remote (ssh://) panes so the renderer grid shows them too.
        const remote = remotePty.listPanes().map((p) => ({ ...p }));
        return [...local, ...remote];
    });
    // ─────────────────────────────────────────────────────────────────────────
    // MCP host — bridge com as capacidades reais do sidecar (mesmo MCPServerHost
    // do Electron). Provê os 8 métodos core do BridgeDeps + listProviders. Os
    // opcionais pesados (catalog/agent/image/video/squad/spawnIsolated) ficam
    // ausentes → as tools correspondentes degradam com {ok:false} (guard no server).
    // mission_* deferido: enum de status core (active/archived) ≠ mcp
    // (draft/in_progress/...) — precisa de mapeamento cuidadoso (follow-up).
    // overclock_mission_spawn_pane funciona (roteia por spawnPane com missionId).
    // ─────────────────────────────────────────────────────────────────────────
    // waitIdle — resolve quando o PtyManager emite 'idle' p/ o pane, ou no timeout.
    // Tipicamente chamado após um write (atividade → idle dispara). Activity-state
    // tracking (pane já idle antes da chamada) = follow-up do waitPaneIdleAfterWrite.
    const waitIdle = (paneId, timeoutMs) => new Promise((resolveIdle) => {
        // Select the emitter by pane locality: remote (ssh://) panes emit 'idle' on remotePty,
        // local panes on pty. RemoteSshTmuxManager emits the same {paneId} idle shape. Without this,
        // pane_wait_idle on a remote pane only listened on pty and ALWAYS timed out — breaking the
        // handoff orchestration the v7.5 remote feature depends on. (Explicit branch, not a ternary —
        // a union of the two EventEmitter subclasses is not callable.)
        const isRemote = remotePaneIds.has(paneId);
        const subscribe = (fn) => isRemote ? remotePty.on('idle', fn) : pty.on('idle', fn);
        const unsubscribe = (fn) => isRemote ? remotePty.off('idle', fn) : pty.off('idle', fn);
        const started = Date.now();
        let settled = false;
        const onIdle = (e) => {
            if (e.paneId !== paneId || settled)
                return;
            settled = true;
            unsubscribe(onIdle);
            clearTimeout(timer);
            resolveIdle({ idle: true, timedOut: false, waitingForMs: Date.now() - started });
        };
        const timer = setTimeout(() => {
            if (settled)
                return;
            settled = true;
            unsubscribe(onIdle);
            resolveIdle({ idle: false, timedOut: true, waitingForMs: Date.now() - started });
        }, Math.max(1, timeoutMs));
        subscribe(onIdle);
    });
    // F-091 r2: wizard-set style/model/account must never claim success without the MissionWizard
    // actually mutating the ACTIVE screen. The broadcast carries an ackId; the renderer reports the
    // real outcome via 'ui:wizard-set-ack'. No reply within the timeout = no wizard applied it.
    const wizardSetAcks = new Map();
    host.ipcMain.handle('ui:wizard-set-ack', (_e, ackId, applied, message) => {
        const resolve = typeof ackId === 'string' ? wizardSetAcks.get(ackId) : undefined;
        if (resolve) {
            wizardSetAcks.delete(ackId);
            resolve({ applied: applied === true, message: typeof message === 'string' ? message : '' });
        }
        return { ok: true };
    });
    const waitWizardSetAck = (ackId, timeoutMs = 5000) => new Promise((resolve) => {
        const timer = setTimeout(() => {
            wizardSetAcks.delete(ackId);
            resolve(null);
        }, timeoutMs);
        wizardSetAcks.set(ackId, (r) => { clearTimeout(timer); resolve(r); });
    });
    const bridgeDeps = {
        spawnPane: async (req) => {
            // cwd default = the CALLER pane's own workspace, NOT the globally-focused activeWorkspace.
            // With cwd omitted, the previous activeWorkspace fallback raced the UI focus: if the user
            // navigated tabs while the spawn resolved, the worker was born in the wrong (cross-)workspace.
            // Resolve the caller pane's persisted workspace deterministically; activeWorkspace is the last
            // resort only when there is no caller (direct UI/MCP spawn with no orchestrator context).
            const callerCfg = req.callerPaneId ? configs.get(req.callerPaneId) : undefined;
            // ── Roster gate: enforced-squad panes MUST use agent_invoke, not pane_spawn ────────
            // OPT-IN: only fire for panes with delegateOnly:true OR leaf:true (the qa-swarm
            // enforced tree). A plain squad orchestrator (cinema-crew, absurd, etc.) is allowed to
            // pane_spawn for parallel work — only the piloto/chefes/workers that are explicitly
            // flagged must route through overclock_agent_invoke so the roster gate in
            // spawnIsolatedAgent fires (CLI-agnostic, width-cap, leaf-depth-cap).
            // Avulso panes (callerCfg undefined) are unrestricted — back-compat preserved.
            // The squadSpawn orchestrator-creation call is exempted automatically: the CALLER there is
            // the user/host session, which has no pane config at all (callerCfg === undefined).
            if (shouldBlockSquadPaneSpawn(callerCfg)) {
                throw new Error('roster_violation: squad panes must use agent_invoke, not pane_spawn');
            }
            // ── Camada 1 (harness/vestiário) — C-048/D3 ────────────────────────────────────────
            // Aditive: only runs when the caller (mission_spawn_pane today) passes persona/allowedSkills.
            // resolvePersonaForSpawn (above) does the resolution — shared with pty:spawn (C-047 item 5)
            // so the two callers dress a worker identically, without pulling in agentInvoke's squad-only
            // gates (harnessRecord/roster — camada 2, out of scope here).
            const persona = await resolvePersonaForSpawn({ persona: req.persona, allowedSkills: req.allowedSkills, agent: req.agent });
            const resolvedPersonaModel = persona.model;
            const resolvedPersonaEffort = persona.effort;
            const personaExtraSystemPrompt = persona.extraSystemPrompt;
            const personaClaudeSkillGate = persona.claudeSkillGate;
            // An explicit req.agent (CLI host) always wins; the persona's own cli is only a fallback
            // for the case where the caller omitted agent entirely (resolvePersonaForSpawn already
            // applies that precedence).
            const personaResolvedCli = persona.agent;
            // C-092.5 (F-098 voice path): mission spawn with no explicit model/providerId defaults to
            // agenticOrchestratorModel/ProviderId from config — so voice-triggered missions respect
            // the model configured in Settings instead of falling back to provider default (fable).
            // Caller that passes explicit model/providerId continues to win (no regression).
            if (req.missionId && !req.model) {
                const cfg = configStore.get();
                if (cfg.agenticOrchestratorModel)
                    req.model = cfg.agenticOrchestratorModel;
                if (!req.providerId && cfg.agenticOrchestratorProviderId)
                    req.providerId = cfg.agenticOrchestratorProviderId;
            }
            const callerWorkspace = callerCfg?.workspacePath ?? callerCfg?.cwd;
            const cwd = req.cwd ?? req.workspacePath ?? callerWorkspace ?? activeWorkspace;
            const workspacePath = req.workspacePath ?? callerWorkspace;
            // ── Remote (ssh://) routing FIRST — same shared helper the pty:spawn IPC handler uses.
            // pane_spawn / overclock_mission_spawn_pane on a remote workspace must hit the SSH manager,
            // NOT buildSpawnConfig → local pty.spawn (the VPS false-connect bug on the orchestrator path).
            const paneId = allocatePaneId();
            const remote = await tryRemoteSpawn(paneId, {
                agent: req.agent,
                cwd,
                workspacePath,
                model: req.model,
                providerId: req.providerId,
                missionId: req.missionId,
                callerPaneId: req.callerPaneId,
                paneId,
            });
            if (remote.remote) {
                if (!remote.result.ok)
                    throw new Error(remote.result.error);
                // Register worker→caller so this worker's handoff_submit wakes the orchestrator (the wake
                // listener in attachHandoffDelivery is a no-op without this mapping). Non-throwaway: a
                // visible pane_spawn worker must not auto-close after a clean done.
                if (req.callerPaneId && req.callerPaneId !== remote.result.paneId) {
                    recordInvokedWorker(remote.result.paneId, req.callerPaneId, { throwaway: false, autoClose: req.autoCloseOnHandoff });
                }
                // Use the mission tryRemoteSpawn RESOLVED (explicit → caller's pane → active), not the raw
                // req — so an agent's pane_spawn lands in ITS mission instead of nowhere.
                const resolvedMissionId = remote.result.missionId ?? req.missionId ?? null;
                diagnostics.record({ level: 'info', source: 'pane', name: 'pane_spawn.ok', paneId: remote.result.paneId, workspacePath: req.workspacePath ?? cwd, missionId: resolvedMissionId ?? undefined, data: { agent: req.agent ?? 'shell', providerId: req.providerId ?? null, model: req.model ?? null, remote: true } });
                // Tell the renderer to render the pane in the grid (Electron parity: bootstrap
                // broadcasts 'pane:added' on the MCP spawn path). Without this, MCP-spawned panes
                // run but never appear in the UI.
                host.broadcast.send('pane:added', {
                    paneId: remote.result.paneId,
                    agent: req.agent ?? 'shell',
                    cwd,
                    workspacePath: req.workspacePath ?? cwd,
                    missionId: resolvedMissionId,
                    providerId: req.providerId,
                    model: req.model,
                    ...(req.effort ? { effort: req.effort } : {}),
                    ...(req.squadRole ? { squadRole: req.squadRole } : {}),
                });
                pushRemoteState(); // new remote pane → push the fresh pane list to phone
                return {
                    paneId: remote.result.paneId,
                    agent: (req.agent ?? 'shell'),
                    cwd,
                    workspacePath: req.workspacePath,
                    missionId: resolvedMissionId ?? undefined,
                    providerId: req.providerId,
                    model: req.model,
                    effort: req.effort,
                };
            }
            const spawnResult = await buildSpawnConfig({
                // F-014: reuse the id already allocated above for tryRemoteSpawn — omitting it made
                // buildSpawnConfig allocate a SECOND id via its own `input.paneId || allocatePaneId()`
                // fallback, burning one number per spawn on this path.
                paneId,
                // personaResolvedCli already prefers req.agent when set (camada 1 fallback only).
                agent: personaResolvedCli,
                providerId: req.providerId,
                // Per-task caller value wins over the persona's default (mirrors agentInvoke.ts precedence).
                model: req.model ?? resolvedPersonaModel,
                cwd,
                // Effort was dropped on the MCP spawn path (the pane_spawn schema exposes it but it never
                // reached buildSpawnConfig). Forward it so the squad orchestrator's pinned effort applies
                // (and pane_spawn's documented effort param finally takes effect).
                ...((req.effort ?? resolvedPersonaEffort) ? { effort: req.effort ?? resolvedPersonaEffort } : {}),
                // Camada 1 (harness) — C-048/D3: persona systemPrompt + skill gate, resolved above.
                // Aditive: both are undefined when persona/allowedSkills are absent (zero regression).
                ...(personaExtraSystemPrompt ? { extraSystemPrompt: personaExtraSystemPrompt } : {}),
                ...(personaClaudeSkillGate ? { claudeSkillGate: personaClaudeSkillGate } : {}),
                ...(req.wardrobe ? { wardrobe: req.wardrobe } : {}),
                // Forward the routing/context fields so buildSpawnConfig's mission resolution actually
                // runs — previously dropped, which is why MCP-spawned panes ignored the caller's mission
                // and fell back to whatever tab the user had focused.
                ...(workspacePath ? { workspacePath } : {}),
                ...(req.missionId ? { missionId: req.missionId } : {}),
                ...(req.callerPaneId ? { callerPaneId: req.callerPaneId } : {}),
                // Squad-orchestrator bootstrap (overclock_squad_spawn): forward the roster + squad context
                // that buildSpawnConfig already accepts (L997/L1062/L1165) but the MCP path previously
                // dropped — so a HEADLESS orchestrator boots with its roster, skill-gate and instructions.
                ...(req.squadCallable ? { squadCallable: req.squadCallable } : {}),
                ...(req.squadId ? { squadId: req.squadId } : {}),
                ...(req.squadRole ? { squadRole: req.squadRole } : {}),
                // P2 fix: use buildSpawnInputSquadOverrides so leaf is forwarded alongside
                // delegateOnly — previously only delegateOnly was spread here, meaning a
                // pane_spawn call with leaf:true silently dropped the flag and the Claude
                // tool-strip never ran for that pane.
                ...buildSpawnInputSquadOverrides(req),
                ...(req.orchestratorAllowedSkills !== undefined ? { orchestratorAllowedSkills: req.orchestratorAllowedSkills } : {}),
                ...(req.nativeInstructions ? { nativeInstructions: req.nativeInstructions } : {}),
                ...(req.orchestratorInstructions ? { orchestratorInstructions: req.orchestratorInstructions } : {}),
                // Media providers/allowlists ride to the orchestrator so its workers inherit the squad engine.
                ...(req.imageProvider ? { imageProvider: req.imageProvider } : {}),
                ...(req.videoProvider ? { videoProvider: req.videoProvider } : {}),
                ...(req.audioProvider ? { audioProvider: req.audioProvider } : {}),
                ...(req.allowedImageProviders?.length ? { allowedImageProviders: req.allowedImageProviders } : {}),
                ...(req.allowedVideoProviders?.length ? { allowedVideoProviders: req.allowedVideoProviders } : {}),
                ...(req.allowedAudioProviders?.length ? { allowedAudioProviders: req.allowedAudioProviders } : {}),
                ...(req.allowedImageModels?.length ? { allowedImageModels: req.allowedImageModels } : {}),
                ...(req.allowedVideoModels?.length ? { allowedVideoModels: req.allowedVideoModels } : {}),
            });
            if ('error' in spawnResult)
                throw new Error(spawnResult.error);
            const { id, config } = spawnResult;
            await injectCliMcp(config.agent, config.cwd, id, req.model, req.providerId);
            try {
                await pty.spawn(config);
            }
            catch (err) {
                // F3: buildSpawnConfig wrote the mcp-config + gate files before the process existed;
                // configs.set never ran so closePane will never reach them. The throw IS the only cleanup point.
                await cleanupPaneFiles(panesDir, id).catch(() => { });
                throw err;
            }
            configs.set(id, config);
            // PERSIST-ON-CREATE (mission-170): persist this MCP-spawned pane at once (see pty:spawn).
            void saveAllWorkspaces();
            // Register worker→caller so this worker's handoff_submit wakes the orchestrator (no-op in
            // attachHandoffDelivery without this). Non-throwaway: a visible pane_spawn worker stays open.
            if (req.callerPaneId && req.callerPaneId !== id) {
                recordInvokedWorker(id, req.callerPaneId, { throwaway: false, autoClose: req.autoCloseOnHandoff });
            }
            watchClaudeCwd(config);
            if (config.agent !== 'shell')
                activeWorkspace = config.cwd;
            diagnostics.record({ level: 'info', source: 'pane', name: 'pane_spawn.ok', paneId: id, workspacePath: config.workspacePath ?? config.cwd, missionId: config.missionId, data: { agent: config.agent ?? 'shell', providerId: req.providerId ?? null, model: req.model ?? null, delegateOnly: req.delegateOnly ?? false } });
            // Electron parity: broadcast 'pane:added' so the renderer renders the MCP-spawned
            // pane in the grid (without this, pane_spawn panes run but never appear).
            host.broadcast.send('pane:added', {
                paneId: id,
                agent: config.agent ?? 'shell',
                cwd: config.cwd,
                shellPath: config.agent === 'shell' ? config.shellPath : undefined,
                workspacePath: config.workspacePath ?? req.workspacePath ?? config.cwd,
                // Use the RESOLVED mission (caller's mission / active), not the raw req — so the renderer
                // renders the pane in the mission it actually belongs to.
                missionId: config.missionId ?? null,
                providerId: req.providerId,
                model: req.model,
                // F-043: effort was resolved and applied to the actual CLI spawn but never reached the
                // renderer — the pane info popover showed "não rastreado" even though the value existed.
                ...(req.effort ? { effort: req.effort } : {}),
                // F-label: carry squadRole/delegateOnly/callerPaneId so the renderer stores them on the
                // pane — needed for the roster gate (shouldBlockSquadPaneSpawn reads configs.get(callerPaneId).delegateOnly)
                // and for UI badge rendering. Previously dropped on the MCP spawn path.
                ...(req.squadRole ? { squadRole: req.squadRole } : {}),
                ...(req.delegateOnly ? { delegateOnly: req.delegateOnly } : {}),
                ...(req.callerPaneId ? { callerPaneId: req.callerPaneId } : {}),
                // F-123: a chefe spawning a worker via mission_spawn_pane (persona/allowedSkills) resolved
                // those into cli/model/systemPrompt above but never surfaced them as squadAgentName/squadSkill
                // — the same fields the agent_invoke path (spawnIsolatedAgent) sets — so the grid's worker
                // label (MissionBadge) rendered with no agent/skill identity.
                ...(req.persona ? { squadAgentName: req.persona } : {}),
                ...(req.allowedSkills?.length ? { squadSkill: req.allowedSkills.join(', ') } : {}),
            });
            pushRemoteState(); // new pane → push the fresh pane list to phone
            // F-047: extraSystemPrompt only reaches the spawned process via buildClaudeSpawnArgs
            // (claude-only) — a persona resolved for codex/gemini/etc dressed cli/model/effort but
            // its systemPrompt had no channel to ride on. Flag it instead of silent drop.
            const personaSystemPromptDropped = !!personaExtraSystemPrompt && config.agent !== 'claude';
            return {
                paneId: id,
                agent: config.agent ?? 'shell',
                cwd: config.cwd,
                workspacePath: config.workspacePath ?? req.workspacePath,
                missionId: config.missionId,
                providerId: req.providerId,
                model: req.model,
                effort: req.effort,
                ...(personaSystemPromptDropped ? { personaSystemPromptDropped: true } : {}),
            };
        },
        writePane: async (paneId, text, submit = true) => {
            const writeId = randomUUID();
            const bytesWritten = Buffer.byteLength(text);
            // Route to the remote SSH manager when the pane is remote (same selector the IPC
            // handlers use). Without this, pane_write on a remote orchestrator/worker pane wrote
            // into a non-existent local pty.
            const m = mgr(paneId);
            // F-169: bracketed paste (port do Electron que ficou pra trás no strangler). Texto cru
            // no PTY faz cada \n agir como Enter — briefing multi-linha submetia no primeiro \n e
            // chegava CORTADO no worker. O wrap \x1b[200~…\x1b[201~ entrega o bloco inteiro como
            // UM paste; só o \r explícito abaixo submete. Helpers puros em panePaste.ts.
            const pasteMode = shouldUseBracketedPaste(configs.get(paneId)?.agent, text) ? 'bracketed' : 'direct';
            m.write(paneId, panePastePayload(text, pasteMode));
            let submittedAt;
            if (submit) {
                const pollStart = Date.now();
                // Poll for TUI-ready before submitting (fixes startup race: fixed 120ms was too short
                // for a fresh CLI boot — the \r landed before stdin was open → prompt swallowed →
                // turn:0+0 stall). Only for local panes (remote panes fall back to 120ms since we
                // cannot read their buffer locally).
                let tuiReadyMs = null;
                if (pty.hasPane(paneId)) {
                    const cli = configs.get(paneId)?.agent ?? 'claude';
                    const deadline = Date.now() + 12_000;
                    let tuiReady = false;
                    while (Date.now() < deadline) {
                        try {
                            const tail = pty.getBuffer(paneId).readPlain(30).slice(-10).join('\n');
                            if (/^\s*[>❯](\s|$)/m.test(tail)) {
                                tuiReady = true;
                                break;
                            }
                            if (cli === 'claude' && tail.includes('? for shortcuts')) {
                                tuiReady = true;
                                break;
                            }
                        }
                        catch {
                            break;
                        }
                        await new Promise((r) => setTimeout(r, 150));
                    }
                    tuiReadyMs = tuiReady ? (Date.now() - pollStart) : null;
                    if (!tuiReady)
                        await new Promise((r) => setTimeout(r, 800));
                }
                else {
                    await new Promise((r) => setTimeout(r, 120));
                }
                submittedAt = Date.now();
                m.write(paneId, '\r');
                // Idempotent bare-Enter nudge: if the first \r was swallowed by a still-booting TUI,
                // this re-submits without re-typing the prompt (an extra Enter on an empty input is a
                // no-op on all supported CLIs). Mirrors spawnIsolatedAgent's swallowed-Enter recovery.
                await new Promise((r) => setTimeout(r, 50));
                m.write(paneId, '\r');
                // ── TIMING DIAGNOSTIC (RACE-001 disambiguation) ────────────────────────
                // Log timing so we can tell: was the stall a \r-dropped race, or API latency?
                // Post-submit buffer check: 400ms after \r, is the submitted text still in the
                // input box? If yes → \r was dropped (race). If no → \r landed, stall is API.
                void (async () => {
                    await new Promise((r) => setTimeout(r, 400));
                    try {
                        if (!pty.hasPane(paneId))
                            return;
                        const postBuf = pty.getBuffer(paneId).readPlain(30).slice(-5).join('\n');
                        // If the submitted text (first 40 chars) is still visible → \r was dropped.
                        const snippet = text.slice(0, 40).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        const promptStuck = snippet.length > 0 && new RegExp(snippet).test(postBuf);
                        diagnostics.record({
                            level: 'info', source: 'pane', name: 'pane_write.timing', paneId,
                            data: {
                                writeId,
                                isLocalPane: true,
                                pollTookMs: submittedAt - pollStart,
                                tuiReadyMs, // null = timed out (tui not ready in 12s)
                                promptStuck, // true = \r dropped, false = submitted ok (API latency)
                                postBufSnippet: postBuf.slice(-120),
                            }
                        });
                    }
                    catch { /* pane gone */ }
                })();
            }
            return {
                ok: true,
                paneId,
                writeId,
                submitted: submit,
                bytesWritten,
                pasteMode,
                submittedAt,
                confirmation: submit ? 'not_observed_yet' : 'not_requested',
                next: submit
                    ? 'Use pane_read to inspect output, or pane_wait_idle to await completion.'
                    : `submit=false left text in the input for pane ${paneId}.`,
            };
        },
        readPane: async (paneId, lastN) => ({ lines: mgr(paneId).getBuffer(paneId).readPlain(lastN ?? 50) }),
        waitPaneIdle: (paneId, timeoutMs) => waitIdle(paneId, timeoutMs),
        listPanes: async () => {
            const toInfo = (p) => {
                const cfg = configs.get(p.paneId);
                // F-096: status DERIVADO do sinal real do PTY, nunca fabricado — 'running'
                // hardcoded fazia o Jarvis narrar "trabalhando" pra pane parado num erro de
                // créditos. Mesmo limiar do IdleDetector (3s sem output = idle); idleForMs
                // deixa o consumidor distinguir "acabou de parar" de "parado há minutos".
                const idleFor = Date.now() - p.lastOutputAt;
                const idle = idleFor >= 3_000;
                return {
                    paneId: p.paneId,
                    agent: (cfg?.agent ?? p.agent ?? 'shell'),
                    cwd: cfg?.cwd ?? p.cwd,
                    workspacePath: cfg?.workspacePath,
                    missionId: cfg?.missionId,
                    ...(cfg?.squadRole ? { squadRole: cfg.squadRole } : {}),
                    status: idle ? 'idle' : 'running',
                    ...(idle ? { idleForMs: idleFor } : {}),
                    lastInputAt: p.lastInputAt,
                    lastOutputAt: p.lastOutputAt,
                    lastActivityAt: p.lastActivityAt,
                    outputLineCount: p.lineCount,
                };
            };
            const browserEntries = [...browserPanes.values()].map((b) => ({
                paneId: b.paneId,
                agent: 'browser',
                cwd: b.workspacePath ?? '',
                workspacePath: b.workspacePath,
                missionId: b.missionId,
                status: 'running',
                url: b.url,
            }));
            // Concat local + remote (ssh://) panes so pane_list shows remote orchestrators/workers too.
            return [...pty.listPanes().map(toInfo), ...remotePty.listPanes().map(toInfo), ...browserEntries];
        },
        listProviders: async () => {
            // computeProviderList intentionally omits resolveDefaultModel (F-025).
            // Apply factory defaults here so the renderer badge never falls back to models[0] (fable-5).
            const FACTORY_DEFAULTS = { 'claude-oauth': 'claude-opus-4-8' };
            return computeProviderList(cliPresence(), readProvidersFile(), { mask: true }).map((p) => {
                const factory = FACTORY_DEFAULTS[p.id];
                const defaultModel = p.defaultModel ??
                    (factory && p.models?.includes(factory) ? factory : p.models?.[0]);
                return {
                    id: p.id,
                    label: p.label,
                    type: p.type,
                    host: p.host,
                    authMode: p.authMode,
                    models: p.models,
                    defaultModel,
                    enabled: p.enabled,
                };
            });
        },
        todoManager: async (args, scope) => todoStore.apply(args, scope),
        closePane: async (paneId) => {
            // Route to the remote SSH manager when the pane is remote (same selector as the IPC handler).
            const m = mgr(paneId);
            const existed = m.listPanes().some((p) => p.paneId === paneId);
            const cfg = configs.get(paneId);
            // F-070: mark BEFORE the SIGTERM so the exit event (which races this await) is already
            // classifiable as intentional. Pane already gone = no exit will ever fire → skip the
            // mark so the set never leaks entries for panes that were never alive here.
            if (existed)
                intentionallyClosedPanes.add(paneId);
            // F-N03: await the SIGTERM→SIGKILL escalation so `closed` reflects the real kill
            // outcome. Fire-and-forget kill() reported closed purely from prior existence, so a
            // child surviving the escalation was still reported as a clean close. killAndWait
            // resolves false when PIDs remain alive after the force-kill path.
            let killed = false;
            try {
                killed = await m.killAndWait(paneId);
            }
            catch { /* ignore */ }
            // F-026: intentional close dismisses from the GENERAL restore list (F-008) but KEEPS
            // the pane in panes.json so it stays recoverable in its mission's restore cards
            // (loadAll). Mirrors the pty:kill dismiss path.
            if (cfg) {
                const ws = cfg.workspacePath ?? activeWorkspace;
                if (ws) {
                    void sessionManager.dismissSession(ws, paneId).then(() => providerSessionsInvalidate?.(ws)).catch(() => { });
                }
            }
            void cleanupPaneFiles(panesDir, paneId);
            // Belt-and-suspenders (mission-170): persist this pane's latest config before
            // configs.delete (see pty:kill) — config captured synchronously by saveAllWorkspaces.
            void saveAllWorkspaces();
            browserPanes.delete(paneId);
            configs.delete(paneId);
            remotePaneIds.delete(paneId);
            // F-N03: closed = the pane existed AND its process tree actually died. A pane that
            // existed but survived the kill escalation now reports closed:false instead of true.
            return { ok: true, paneId, closed: existed && killed };
        },
        // mission_* — paridade com o bridge Electron (4691): mapeia status core↔mcp.
        // workspaceId no create = activeWorkspace (single-window). overclock_mission_spawn_pane
        // não passa por aqui (roteia por spawnPane com missionId).
        missionList: async () => {
            const missions = await missionStore.readMissionsFile();
            return filterMissions(missions, undefined, true).map(missionToMcpRecord);
        },
        missionGet: async (missionId) => {
            const m = await missionStore.getMissionById(missionId);
            return m ? missionToMcpRecord(m) : null;
        },
        missionCreate: async (request) => {
            const now = Date.now();
            const mission = {
                id: randomUUID(),
                workspaceId: activeWorkspace,
                title: sanitizeMissionTitle(request.title) ?? request.title.trim(),
                objective: request.description?.trim(),
                status: missionStatusFromMcp(request.status) ?? 'active',
                worktreePath: request.worktreePath?.trim(),
                createdAt: now,
                updatedAt: now,
            };
            await missionStore.mutateMissionsFile(async (missions) => { missions.push(mission); });
            // F-019: missão criada via MCP (overclock_mission_create) → notifica o renderer
            // p/ re-hidratar e mostrar no sidebar em tempo real (sem restart).
            host.broadcast.send('missions:updated');
            return missionToMcpRecord(mission);
        },
        missionSetStatus: async (request) => {
            const nextStatus = missionStatusFromMcp(request.status);
            if (!nextStatus)
                throw new Error('invalid mission status');
            let updated = null;
            await missionStore.mutateMissionsFile(async (missions) => {
                const idx = missions.findIndex((m) => m.id === request.missionId);
                if (idx < 0)
                    return;
                const next = { ...missions[idx], status: nextStatus, updatedAt: Date.now() };
                missions[idx] = next;
                updated = next;
            });
            if (!updated)
                throw new Error('mission not found');
            return missionToMcpRecord(updated);
        },
        // squadSave — overclock_squad_save: upsert na squads.json + broadcast. Espelha
        // bootstrap 4784 (normaliza allowedSkills: null/[] → unrestricted, remove o campo).
        squadSave: async (preset) => {
            try {
                for (const member of preset.agents ?? []) {
                    const skills = member.allowedSkills;
                    if (skills === null || (Array.isArray(skills) && skills.length === 0)) {
                        delete member.allowedSkills;
                        continue;
                    }
                    if (skills !== undefined && (!Array.isArray(skills) || !skills.every((s) => typeof s === 'string'))) {
                        return { ok: false, error: `invalid allowedSkills for member "${member.agentName ?? member.id}": must be an array of strings` };
                    }
                }
                await withSquadsLock(async () => {
                    const squads = await readSquadsFile(squadsJson);
                    const idx = squads.findIndex((s) => s.id === preset.id);
                    if (idx >= 0)
                        squads[idx] = preset;
                    else
                        squads.push(preset);
                    await writeSquadsFile(squadsJson, squads);
                });
                host.broadcast.send('squads:updated');
                return { ok: true };
            }
            catch (err) {
                return { ok: false, error: err instanceof Error ? err.message : String(err) };
            }
        },
        // squadList/squadGet — leitura de presets p/ overclock_squad_list / overclock_squad_get
        // (a UI tinha IPC squads:list mas faltava tool MCP de leitura). Mesmo store da squadSave.
        squadList: async () => readSquadsFile(squadsJson),
        squadGet: async (squadId) => {
            const squads = await readSquadsFile(squadsJson);
            return squads.find((s) => s.id === squadId) ?? null;
        },
        // recipeSave/recipeListUser — overclock_recipe_save + recipe_list union.
        // User-composed recipes persist in recipes.json (origin:'user'). Same lock/atomic-write
        // pattern as squadSave. No seeding: user recipes are always empty on first boot.
        recipeSave: async (recipe) => {
            try {
                // C-081.13 (b/c): mesmo lint do recipes:save no caminho MCP (piloto modo Outro, C-093) —
                // agent/skill pinado tem que existir no universo baked+instalados, ou vir com gap explícito.
                const lintErr = lintRecipeAgainstCatalog(recipe);
                if (lintErr)
                    return { ok: false, error: lintErr };
                await withRecipesLock(async () => {
                    const recipes = await readRecipesFile();
                    const entry = { ...recipe, origin: 'user' };
                    const idx = recipes.findIndex((r) => r.id === entry.id);
                    if (idx >= 0)
                        recipes[idx] = entry;
                    else
                        recipes.push(entry);
                    await writeRecipesFile(recipes);
                });
                return { ok: true };
            }
            catch (err) {
                return { ok: false, error: err instanceof Error ? err.message : String(err) };
            }
        },
        recipeListUser: () => readRecipesFile(),
        // squadSpawn — overclock_squad_spawn: replica handleSpawnSquad (WorkspaceTabs.tsx:970-1074)
        // FORA do React. Lê o preset, monta o roster (buildSquadCallable — fonte única), cria/marca
        // a missão com squadId, e spawna SÓ o orquestrador (workers nascem on-demand via
        // overclock_agent_invoke). O motor (buildSpawnConfig + buildSquadPromptBlock + handoff +
        // skill-gate) já roda headless; isto é só o bootstrap server-side do orquestrador.
        squadSpawn: async (squadId, opts) => {
            // FIX 3 (squad_spawn handler gate, CLI-agnostic): tool-strip is Claude-only; for
            // Codex/Gemini/MIMO close the same hole here. If the MCP session invoking squad_spawn
            // has a callerPaneId whose config is delegateOnly||leaf, refuse — a leaf/delegateOnly
            // pane must not bootstrap a full orchestrator (that defeats depth-cap).
            // The user/host bootstrap (no callerCfg, e.g. direct UI click) stays allowed.
            // Decision extracted to squadSpawnGateError (pure helper, unit-tested in squadPersistFields.test.ts).
            if (opts?.callerPaneId) {
                const callerCfg = configs.get(opts.callerPaneId);
                const gateErr = squadSpawnGateError(callerCfg);
                if (gateErr)
                    throw new Error(gateErr);
            }
            const squads = await readSquadsFile(squadsJson);
            const preset = squads.find((s) => s.id === squadId);
            if (!preset)
                throw new Error(`squad not found: ${squadId}`);
            // Resolve cli/description dos workers contra o catálogo de agentes (paridade com o renderer:
            // worker fora do catálogo é descartado por buildSquadCallable).
            const catalog = listCatalogItems(getGlobalDb(dataDir), { type: 'agent', includeMissing: false });
            const byName = new Map(catalog.map((it) => [it.name, {
                    cli: it.installations[0]?.cli ?? it.metadata?.cli,
                    description: it.description,
                }]));
            const squadCallable = buildSquadCallable(preset, (name) => byName.get(name));
            if (squadCallable.length === 0)
                throw new Error(`squad "${preset.name}" has no invocable workers in the catalog`);
            // Orquestrador = piloto canônico (claude/Opus por padrão; editável no preset).
            const orchRef = preset.agents.find((a) => a.category === 'orchestrator');
            // 'claude-oauth' = conta principal → omite (mesma regra do spawn libre).
            const orchProviderId = orchRef?.providerId && orchRef.providerId !== 'claude-oauth' ? orchRef.providerId : undefined;
            // Missão (F-031): default = VINCULAR à missão ativa do caller, nunca criar. Cadeia de
            // resolução (mesma do spawnPane/F-029): missionId explícito → missão do pane chamador
            // (configs) → missão da sessão MCP (callerMissionId) → missão ativa do workspace focado.
            // Criar missão nova é ato EXPLÍCITO: createMission:true, ou nada resolvido na cadeia
            // (squad precisa de uma missão pra existir). Antes disto, todo squad_spawn sem missionId
            // criava missão — dezenas de missões efêmeras (1 por spawn) nos workspaces de benchmark.
            let missionId = opts?.missionId;
            if (!missionId && !opts?.createMission) {
                const callerMission = opts?.callerPaneId ? configs.get(opts.callerPaneId)?.missionId : undefined;
                missionId = callerMission ?? opts?.callerMissionId ?? resolveActiveMissionId(activeWorkspace);
                // Missão herdada pode já ter morrido (arquivada/apagada) — id fantasma cairia no branch
                // de attach como no-op e o squad nasceria órfão; valida e deixa cair no create.
                if (missionId) {
                    const m = await missionStore.getMissionById(missionId);
                    if (!m || m.status === 'archived')
                        missionId = undefined;
                }
            }
            // BUG-B: the orchestrator must be born in the mission's workspace, NOT the global
            // activeWorkspace. squadSpawn previously passed neither cwd nor workspacePath to spawnPane,
            // so workspacePath resolved undefined (no caller pane) and buildSpawnConfig fell back to the
            // global workspace. Resolve the mission's workspace and forward it (mirrors how pty:spawn
            // forwards the renderer's cwd/workspacePath).
            let missionWorkspace = activeWorkspace;
            if (missionId) {
                const mid = missionId;
                await missionStore.mutateMissionsFile(async (missions) => {
                    const m = missions.find((x) => x.id === mid);
                    if (m) {
                        if (m.workspaceId)
                            missionWorkspace = m.workspaceId;
                        if (!m.squadId) {
                            m.squadId = preset.id;
                            m.updatedAt = Date.now();
                        }
                    }
                });
            }
            else {
                const now = Date.now();
                const mission = {
                    id: randomUUID(),
                    workspaceId: activeWorkspace,
                    title: preset.name,
                    objective: opts?.input?.trim() || undefined,
                    status: 'running',
                    squadId: preset.id,
                    createdAt: now,
                    updatedAt: now,
                };
                await missionStore.mutateMissionsFile(async (missions) => { missions.push(mission); });
                missionId = mission.id;
            }
            host.broadcast.send('missions:updated');
            // Defense-in-depth: squad blocks (delegateOnly / squadCallable / tool-strip /
            // route-only prompt) are local-only. If the resolved workspace is remote, the
            // orchestrator would be born via tryRemoteSpawn which silently drops all squad
            // enforcement, producing a piloto with full tools. Refuse loudly instead.
            if (isRemoteSquadSpawn(missionWorkspace, squadCallable)) {
                throw new Error('Squad spawn refused: local-only squad enforcement (delegateOnly / squadCallable) cannot run on an ssh:// workspace. Use Modo Livre with CLIs installed on the remote host.');
            }
            // Spawna SÓ o orquestrador, forwarding squadCallable+squadId+instructions+media via spawnPane
            // (que agora repassa esses campos a buildSpawnConfig).
            const spawn = await bridgeDeps.spawnPane({
                agent: (orchRef?.cli ?? 'claude'),
                providerId: orchProviderId,
                model: orchRef?.model,
                effort: orchRef?.effort,
                // BUG-B: pin the orchestrator to the mission's workspace so it (and the workers it spawns)
                // run there instead of falling back to the global workspace.
                cwd: missionWorkspace,
                workspacePath: missionWorkspace,
                missionId,
                squadRole: 'orchestrator',
                squadId: preset.id,
                squadCallable,
                delegateOnly: orchRef?.delegateOnly,
                leaf: orchRef?.leaf,
                orchestratorAllowedSkills: orchRef?.allowedSkills ?? null,
                nativeInstructions: preset.nativeInstructions,
                orchestratorInstructions: preset.orchestratorInstructions,
                imageProvider: preset.imageProvider,
                videoProvider: preset.videoProvider,
                audioProvider: preset.audioProvider,
                allowedImageProviders: preset.allowedImageProviders,
                allowedVideoProviders: preset.allowedVideoProviders,
                allowedAudioProviders: preset.allowedAudioProviders,
                allowedImageModels: preset.allowedImageModels,
                allowedVideoModels: preset.allowedVideoModels,
            });
            return { missionId, orchestratorPaneId: spawn.paneId, squadId: preset.id };
        },
        // image/video_generate — key fica no sidecar (serviceKeysStore.resolve); o agente
        // só passa prompt e recebe o path do arquivo escrito no workspace ativo. Espelha
        // bootstrap 4633/4651. provider explícito → squad-selected → google/replicate-video.
        imageGenerate: async (args) => {
            const providerId = args.provider === 'openai-image' ? 'openai-image' : 'google-image';
            const modelResult = resolveModel(serviceKeysStore, providerId, args.model);
            if ('error' in modelResult)
                return { ok: false, error: modelResult.error };
            const cfg = { ...serviceKeysStore.resolve(providerId), model: modelResult.model };
            return providerId === 'openai-image'
                ? generateImageWithOpenAI(cfg, args, activeWorkspace)
                : generateImageWithGemini(cfg, args, activeWorkspace);
        },
        videoGenerate: async (args) => {
            const modelResult = resolveModel(serviceKeysStore, 'replicate-video', args.model);
            if ('error' in modelResult)
                return { ok: false, error: modelResult.error };
            const cfg = { ...serviceKeysStore.resolve('replicate-video'), model: modelResult.model };
            return generateVideoWithReplicate(cfg, args, activeWorkspace);
        },
        audioGenerate: async (args) => generateAudioWithElevenLabs(serviceKeysStore.resolve('elevenlabs'), args, activeWorkspace),
        // Diagnostics (app_status/app_events/app_observe_once/app_watch) — observabilidade
        // do app sob Tauri. isDiagnosticsEnabled=true habilita as tools no server.
        isDiagnosticsEnabled: () => true,
        appEvents: async (request = {}) => {
            const events = diagnostics.list({
                limit: typeof request.limit === 'number' ? request.limit : undefined,
                level: request.level,
                source: request.source,
                includeInternal: request.includeInternal === true,
            });
            return { ok: true, count: events.length, ringBufferSize: diagnostics.capacity, events };
        },
        appStatus: async () => {
            const panes = pty.listPanes();
            const st = mcpHost?.status();
            return {
                ok: true,
                diagnosticsEnabled: true,
                visibleCount: panes.length,
                backgroundCount: 0,
                runtimeCount: panes.length,
                currentWorkspacePath: activeWorkspace || null,
                currentMissionId: null,
                toolCount: st?.toolCount ?? 0,
                diagnostics: { ringBufferSize: diagnostics.capacity, eventCount: diagnostics.list({ includeInternal: true }).length },
                app: { version: APP_VERSION, platform: process.platform, arch: process.arch },
                windows: {},
                mcp: st ?? {},
                workspace: { active: activeWorkspace || null },
                panes: { count: panes.length, ids: panes.map((p) => p.paneId) },
            };
        },
        // catalogList — catalog_items fresh do global db (node:sqlite). Habilita
        // overclock_agent_list/get/invoke. Espelha bootstrap 4762.
        catalogList: async (args) => {
            // excludeDisabled: the bridge feeds the squad capability map (and agent_list/get);
            // a skill/agent the user disabled in the catalog must not surface to the piloto.
            const items = listCatalogItems(getGlobalDb(dataDir), { type: args.type, includeMissing: !!args.includeMissing }, { excludeDisabled: true })
                .map((item) => ({
                name: item.name,
                description: item.description,
                metadata: item.metadata,
                installations: item.installations.map((i) => ({ cli: i.cli, path: i.path })),
            }));
            if (args.type !== 'agent')
                return items;
            // C-081.13: merge dos workers first-party BAKED (AGENT_DEFS, in-binary). Eles sempre foram
            // INVOCÁVEIS (agent_invoke/resolveAgentSpec resolvem AGENT_DEFS ANTES do catálogo), mas o
            // bridge só devolvia o disco → agent_list não os surfava e o chefe declarava gap FALSO
            // (caso vivo C-081.13: overclock-worker-media). Disco vence colisão de nome.
            const present = new Set(items.map((i) => i.name));
            return [...items, ...mcpPkg.listBakedAgentItems().filter((b) => !present.has(b.name))];
        },
        // catalogInstall — habilita o MCP overclock_catalog_install (squad-former marketplace install).
        // F-170: não-ligado no port do sidecar → a tool respondia "not available in this build".
        catalogInstall: async (args) => installCatalogComponent(args.kind, args.slug),
        // getHarnessRoles — enriched-catalog annotations from F5 (C-081 r7) so agent_list/skill_list
        // surface role+tier+when/how to the agentic orchestrator at mission-creation time. Best-effort:
        // no file yet (never enriched) = {}.
        getHarnessRoles: async () => {
            try {
                const { loadEnrichedCatalog } = await import('./harnessAssistant.js');
                const map = loadEnrichedCatalog(dataDir);
                // C-081 r8 (7b): tier ∈ {scout,builder,reviewer} é o contrato de dado que o spawn agêntico
                // filtra por chefe. role morreu; tier vale pra agent E skill. whenHow = blurb.
                const out = {};
                for (const [name, it] of Object.entries(map)) {
                    out[name] = { tier: it.tier, whenHow: it.blurb || undefined };
                }
                return out;
            }
            catch {
                return {};
            }
        },
        // spawnIsolatedAgent — extração Electron-free (core/spawnIsolatedAgent.ts). Habilita
        // overclock_agent_invoke + catalog:invokeAgent. SIMPLIFICADO vs Electron: agy sandbox +
        // skill-gate hook + requireHandoff hook = soft (system-prompt), não hard (hooks PreToolUse/Stop).
        spawnIsolatedAgent: async (args) => {
            // guard-b: idempotent re-dispatch guard. If a live same-agentName worker from this caller
            // already submitted done, poke the caller with the prior result and block the re-spawn.
            // Scope-limiter: pty.hasPane → only fires while the prior worker is still alive (~30s window).
            if (args.callerPaneId && args.agentName) {
                const callerWorkers = callerInvokedWorkers.get(args.callerPaneId) ?? new Set();
                for (const wId of callerWorkers) {
                    if (workerAgentNames.get(wId) !== args.agentName)
                        continue;
                    if (!pty.hasPane(wId))
                        continue; // prior worker closed — sequential reuse allowed
                    const entries = mcpHost?.handoffRegistry.list([wId]) ?? [];
                    const done = entries.find((e) => e.status === 'done');
                    if (done) {
                        pokeOrchestrator(args.callerPaneId, `[guard-b] re-dispatch blocked — worker ${wId} already submitted done. Prior result: ${done.summary ?? '(no summary)'}`);
                        throw new Error(`guard-b: duplicate dispatch of ${args.agentName} from ${args.callerPaneId} — pane ${wId} already done`);
                    }
                }
            }
            const deps = {
                pty,
                configs: configs,
                activeWorkspace,
                dataDir,
                // F-112: mesmo gerador do path normal (line ~1269) — sem isso, spawn agêntico caía no
                // fallback `agent_<ts>_<rand6>` em vez de pane-N.
                nextPaneId: allocatePaneId,
                spawnPane: async (opts) => {
                    const spawnResult = await buildSpawnConfig({
                        paneId: opts.paneId,
                        agent: opts.agent,
                        cwd: opts.cwd,
                        model: opts.model,
                        providerId: opts.providerId,
                        effort: opts.effort,
                        // Worker HARD enforcement: the LEAN system prompt + handoff Stop hook + skill gate.
                        // buildSpawnConfig's Claude block writes the gate/handoff hooks into --settings.
                        extraSystemPrompt: opts.extraSystemPrompt,
                        squadRole: opts.squadRole,
                        delegateOnly: opts.delegateOnly,
                        // SpawnIsolatedAgentDeps.spawnPane.squadCallable is now SquadCallableAgentLike[]
                        // (role/cli/allowedSkills required), matching SpawnInput.squadCallable here — no cast.
                        squadCallable: opts.squadCallable,
                        leaf: opts.leaf,
                        requireHandoff: opts.requireHandoff,
                        claudeSkillGate: opts.claudeSkillGate,
                        missionId: opts.missionId,
                        // F-029: thread the spawning pane's id so buildSpawnConfig's mission fallback
                        // (input.missionId ?? caller config's missionId ?? active mission) actually fires
                        // for squad workers — and the child config persists parenthood (F-003).
                        callerPaneId: opts.callerPaneId,
                        workspacePath: opts.cwd,
                        // Squad workers inherit the orchestrator's media providers (spawnIsolatedAgent reads
                        // these off the caller pane config and forwards them here) so image/video_generate
                        // route to the squad-selected provider. Mirrors Electron bootstrap ~4894-4895.
                        imageProvider: opts.imageProvider,
                        videoProvider: opts.videoProvider,
                        audioProvider: opts.audioProvider,
                        allowedImageProviders: opts.allowedImageProviders,
                        allowedVideoProviders: opts.allowedVideoProviders,
                        allowedAudioProviders: opts.allowedAudioProviders,
                        allowedImageModels: opts.allowedImageModels,
                        allowedVideoModels: opts.allowedVideoModels,
                        allowedCLIs: opts.allowedCLIs,
                        allowedAgents: opts.allowedAgents,
                        missionAllowedSkills: opts.missionAllowedSkills,
                    });
                    if ('error' in spawnResult)
                        return { ok: false, error: spawnResult.error };
                    const { id, config } = spawnResult;
                    // F-030: worker self-identity via env — second channel alongside the PANE IDENTITY
                    // prompt line (spawnIsolatedAgent). config.missionId is the FULLY-resolved mission
                    // (explicit → caller inheritance → active mission), richer than what core resolves.
                    // Merged after buildSpawnConfig so provider env (CLAUDE_CONFIG_DIR etc.) is preserved;
                    // PtyManager merges config.env after its inherited-env scrub, so these survive.
                    config.env = {
                        ...(config.env ?? {}),
                        OVERCLOCK_PANE_ID: id,
                        ...(config.missionId ? { OVERCLOCK_MISSION_ID: config.missionId } : {}),
                    };
                    await injectCliMcp(config.agent, config.cwd, id, opts.model, opts.providerId);
                    try {
                        const { pid } = await pty.spawn(config);
                        void pid;
                        configs.set(id, config);
                        if (args.agentName)
                            workerAgentNames.set(id, args.agentName);
                        // PERSIST-ON-CREATE (mission-170): squad-worker pane persisted at spawn (see pty:spawn).
                        void saveAllWorkspaces();
                        watchClaudeCwd(config);
                        if (config.agent !== 'shell')
                            activeWorkspace = config.cwd;
                        diagnostics.record({ level: 'info', source: 'pane', name: 'agent_spawn.ok', paneId: id, workspacePath: config.cwd });
                        // Electron parity: render the squad-worker pane in the grid.
                        host.broadcast.send('pane:added', {
                            paneId: id,
                            agent: config.agent ?? 'shell',
                            cwd: config.cwd,
                            workspacePath: opts.cwd,
                            // F-029: broadcast the RESOLVED mission (config.missionId includes the
                            // caller-inheritance fallback), not the raw opts value — the renderer buckets
                            // the worker pane into the mission layout from this event.
                            missionId: config.missionId ?? null,
                            providerId: opts.providerId,
                            model: opts.model,
                            // F-043: resolvedEffort reaches buildSpawnConfig (line above) and the actual CLI
                            // flag, but was never forwarded to the renderer — popover showed "não rastreado"
                            // for every agent_invoke-spawned worker even when effort was set.
                            ...(opts.effort ? { effort: opts.effort } : {}),
                            squadRole: opts.squadRole,
                            squadAgentName: opts.squadAgentName,
                            squadSkill: opts.squadSkill,
                            callerPaneId: args.callerPaneId,
                            delegateOnly: opts.delegateOnly,
                            leaf: opts.leaf,
                        });
                        return { ok: true, paneId: id };
                    }
                    catch (err) {
                        // F3: gate/mcp files were written by buildSpawnConfig before spawn; configs.set never
                        // ran so closePane won't reach them. This catch is the only cleanup point.
                        await cleanupPaneFiles(panesDir, id).catch(() => { });
                        return { ok: false, error: String(err) };
                    }
                },
                writePane: (paneId, text) => { try {
                    pty.write(paneId, text);
                }
                catch { /* pane gone */ } },
                checkWidthCap: (callerPaneId, agentName) => widthCap.allow(callerPaneId, agentName),
                checkLoopDetect: (callerPaneId, agentName, prompt) => loopDetect.check(callerPaneId, agentName, prompt),
                onWorkerSpawned: (workerPaneId, callerPaneId) => {
                    // Register the worker → orchestrator mapping so the handoff-delivery listener can wake
                    // the orchestrator when this worker submits/exits (see attachHandoffDelivery).
                    if (callerPaneId)
                        recordInvokedWorker(workerPaneId, callerPaneId);
                    diagnostics.record({ level: 'info', source: 'pane', name: 'isolated_agent.spawned', paneId: workerPaneId, data: { callerPaneId: callerPaneId ?? null } });
                },
                surfaceHandoffError: (workerPaneId, summary) => {
                    try {
                        const reg = mcpHost?.handoffRegistry;
                        if (!reg || reg.list([workerPaneId]).length > 0)
                            return;
                        reg.submit({ paneId: workerPaneId, submittedAt: Date.now(), summary, status: 'error' });
                    }
                    catch { /* registry not ready */ }
                },
            };
            return spawnIsolatedAgent(args, deps);
        },
        // ── Cron bridge — overclock_cron_create / _list / _delete ────────────────
        cronCreate: async (input) => cronStore.createCron(input),
        cronList: async () => cronStore.listCrons(),
        cronDelete: async (jobId) => cronStore.deleteCron(jobId),
        // ── overclock_navigate — UI navigation by intent ───────────────────────
        navigate: async (request) => {
            if (request.target === 'home') {
                host.broadcast.send('app:navigate', { target: 'home' });
                return { ok: true, message: 'navigated to overview', payload: { target: 'home' } };
            }
            if (request.target === 'wizard-advance') {
                host.broadcast.send('app:navigate', { target: 'wizard-advance' });
                return { ok: true, message: 'wizard advanced', payload: { target: 'wizard-advance' } };
            }
            if (request.target === 'mission-new') {
                // F-057: open the Nova Missão modal (MissionWizard) at the mode-choice step in the
                // active workspace — the voice/programmatic mirror of clicking "+ Nova Missão".
                // Never ack without a workspace: App.tsx guards on workspacePath, so an empty one
                // would be a silent no-op narrated as success (false-success pattern).
                if (!activeWorkspace) {
                    return { ok: false, message: 'mission-new: nenhum workspace ativo — abra um workspace primeiro (navigate workspace-open).' };
                }
                const payload = { target: 'mission-new', workspacePath: activeWorkspace };
                host.broadcast.send('app:navigate', payload);
                return { ok: true, message: 'Modal Nova Missão aberto no passo MODO. Narre os 3 modos (Livre / Squad / Agêntico) com as palavras da tela e pergunte qual.', payload };
            }
            if (request.target === 'wizard-set') {
                // F-057: set a field in the OPEN MissionWizard. Query = "key:value" (first colon splits).
                const raw = (request.query ?? '').trim();
                const colon = raw.indexOf(':');
                const key = colon === -1 ? raw : raw.slice(0, colon).trim();
                const value = colon === -1 ? '' : raw.slice(colon + 1).trim();
                const validKeys = ['mode', 'count', 'clis', 'squad', 'goal', 'midia', 'style', 'model', 'account'];
                if (!validKeys.includes(key) || !value) {
                    return { ok: false, message: `wizard-set: query must be "key:value" with key ∈ ${validKeys.join('|')} (got "${raw}").` };
                }
                // F-120: TODO key round-trips pelo ack — o sidecar não vê a tela, então nenhum
                // wizard-set pode alegar sucesso às cegas (era o caso de clis/count/mode/squad/goal/
                // midia; style/model/account já tinham isso desde F-091). Sem isso, "clis:opus"
                // devolvia ok:true mesmo sem casar CLI nenhuma, e a alocação zerada por `count` também
                // saía como sucesso — o walk seguia feliz enquanto a tela ficava travada em 0/N.
                const ackId = randomUUID();
                const ackPayload = { target: 'wizard-set', query: raw, ackId };
                host.broadcast.send('app:navigate', ackPayload);
                const ack = await waitWizardSetAck(ackId);
                if (!ack) {
                    return { ok: false, message: `wizard-set: ${key} NÃO aplicado — nenhum wizard aberto respondeu. Abra o wizard (navigate mission-new) e tente de novo.` };
                }
                return { ok: ack.applied, message: `wizard-set: ${key} = ${value}. ${ack.message}`, payload: ack.applied ? ackPayload : undefined };
            }
            if (request.target === 'wizard-fire') {
                // F-120: trigger com ACK round-trip (mesmo mecanismo do wizard-set) — o fire só claim
                // sucesso quando o MissionWizard confirmou um spawn REAL. Recorrência confirmada 2x
                // (Laschuk: "ele disse q iniciou a missao. mas s[em iniciar]") do bug de ok:true cego.
                const ackId = randomUUID();
                const ackPayload = { target: 'wizard-fire', ackId };
                host.broadcast.send('app:navigate', ackPayload);
                const ack = await waitWizardSetAck(ackId, 15000); // spawn (squad/agêntico) pode levar mais que um field-set
                if (!ack) {
                    return { ok: false, message: 'wizard-fire: NÃO aplicado — nenhum wizard aberto respondeu. Abra o wizard (navigate mission-new) e tente de novo — NUNCA peça pro usuário reiniciar; re-tente você mesmo com wizard-set/wizard-fire.' };
                }
                if (!ack.applied) {
                    return { ok: false, message: `wizard-fire: não disparou — ${ack.message} NÃO peça pro usuário reiniciar: corrija com wizard-set (a mensagem diz o que falta) e chame wizard-fire de novo.` };
                }
                // F-091 D4: o objetivo NÃO é passo do wizard (nenhuma tela pede) — é conversa
                // PÓS-START: missão aberta → perguntar o objetivo → a resposta falada vira o
                // PRIMEIRO PROMPT despachado pro orquestrador/pane da missão (via delegar).
                return { ok: true, message: `${ack.message} Narre em 1 frase e PERGUNTE o objetivo da missão; a resposta falada vira o PRIMEIRO PROMPT: despache via delegar ("envia como primeiro prompt pro pane orquestrador da missão que acabou de abrir: <objetivo>").`, payload: ackPayload };
            }
            if (request.target === 'wizard-cancel') {
                // F-120 defeito 4: "cancela a missão" com o wizard aberto é AÇÃO DIRETA (clica Cancelar),
                // não pergunta "pra onde". Ack round-trip só pra confirmar que havia wizard montado.
                const ackId = randomUUID();
                host.broadcast.send('app:navigate', { target: 'wizard-cancel', ackId });
                const ack = await waitWizardSetAck(ackId, 3000);
                if (!ack || !ack.applied) {
                    return { ok: false, message: 'wizard-cancel: nenhum wizard Nova Missão aberto pra cancelar.' };
                }
                return { ok: true, message: 'Modal Nova Missão fechado (Cancelar).', payload: { target: 'wizard-cancel' } };
            }
            if (request.target === 'view-files') {
                // Show the Files view in the active workspace tab (no query — baseline = active tab).
                host.broadcast.send('app:navigate', { target: 'view-files' });
                return { ok: true, message: 'files view opened', payload: { target: 'view-files' } };
            }
            if (request.target === 'view-sessions') {
                // Show the Sessions view in the active workspace tab (no query — baseline = active tab).
                host.broadcast.send('app:navigate', { target: 'view-sessions' });
                return { ok: true, message: 'sessions view opened', payload: { target: 'view-sessions' } };
            }
            if (request.target === 'tab-close') {
                // Close a workspace tab. Query is OPTIONAL: empty → active tab; otherwise the renderer
                // resolves it as an index, path, or name (the tab list lives in the renderer's nav store,
                // not here). On last close the renderer falls back to Home. Pass-through like view-files.
                const tabQuery = (request.query ?? '').trim();
                const payload = { target: 'tab-close', ...(tabQuery ? { query: tabQuery } : {}) };
                host.broadcast.send('app:navigate', payload);
                return {
                    ok: true,
                    message: tabQuery ? `tab-close: ${tabQuery}` : 'tab-close: active tab',
                    payload,
                };
            }
            if (request.target === 'back') {
                // Go back to the previous view in history (no query). The history lives in the renderer's
                // nav store, so this is a pass-through like tab-next — the renderer calls back().
                host.broadcast.send('app:navigate', { target: 'back' });
                return { ok: true, message: 'navigated back to the previous view', payload: { target: 'back' } };
            }
            if (request.target === 'tab-next') {
                // Cycle to the next workspace tab (no query). The tab list lives in the renderer's nav
                // store, so this is a pass-through like view-files — the renderer calls cycleNext().
                host.broadcast.send('app:navigate', { target: 'tab-next' });
                return { ok: true, message: 'cycled to next workspace tab', payload: { target: 'tab-next' } };
            }
            if (request.target === 'tab-prev') {
                // Cycle to the previous workspace tab (no query). The tab list lives in the renderer's nav
                // store, so this is a pass-through like tab-next — the renderer calls cyclePrev().
                host.broadcast.send('app:navigate', { target: 'tab-prev' });
                return { ok: true, message: 'cycled to previous workspace tab', payload: { target: 'tab-prev' } };
            }
            if (request.target === 'tab-switch') {
                // Switch to a workspace tab by numeric position. Query is REQUIRED and must be a
                // 1-based positive integer. The tab list lives in the renderer's nav store, so this is
                // a pass-through with the validated index — the renderer calls switchByIndex(n-1).
                // Out-of-range index is a renderer no-op (switchByIndex guards bounds).
                const tabQuery = (request.query ?? '').trim();
                const n = Number(tabQuery);
                if (!tabQuery || !Number.isInteger(n) || n < 1) {
                    return { ok: false, message: 'tab-switch: query must be a 1-based tab index (e.g. "1" = first tab).' };
                }
                const payload = { target: 'tab-switch', query: String(n) };
                host.broadcast.send('app:navigate', payload);
                return { ok: true, message: `tab-switch: ${n}`, payload };
            }
            const query = (request.query ?? '').trim();
            if (!query)
                return { ok: false, message: 'navigate: empty query.' };
            // resolveQuery is extracted to navigateResolver.ts (tested independently).
            // Precedence: exact id → exact title → title contains (case-insensitive). Never guesses.
            const resolve = (items, idOf, titleOf) => resolveQuery(items, idOf, titleOf, query);
            const emit = (payload, message) => {
                host.broadcast.send('app:navigate', payload);
                return { ok: true, message, payload };
            };
            const reject = (kind, matches, all) => ({
                ok: false,
                message: matches.length >= 2
                    ? `Ambiguous query: ${matches.length} ${kind} match "${query}". Refine the query.`
                    : `No ${kind} found for "${query}".`,
                candidates: matches.length >= 2 ? matches : all,
            });
            if (request.target === 'run-squad') {
                // No id/title resolution — `query` IS the squad preset id. The renderer opens the real
                // MissionWizard for this squad and drives it through summon (handleSpawnSquad), exactly as
                // a user clicking + → squad → <squad> → summon. activeWorkspace targets the right tab.
                return emit({ target: 'run-squad', squadId: query, workspacePath: activeWorkspace }, `run-squad: ${query}`);
            }
            if (request.target === 'run-agentic') {
                // `query` is an ABSOLUTE workspace path for the isolated agentic run.
                // The renderer opens the workspace tab VISIBLY (via requestOpenWorkspace → workspaces.touch)
                // and then drives the MissionWizard through Agêntico → config → Iniciar.
                // NO silent mkdirSync here — folder creation goes through the renderer's touch flow.
                if (!isAbsolute(query)) {
                    return { ok: false, message: 'run-agentic: query must be an absolute workspace path (e.g. /Users/foo/benchmark/teste-agente-1)' };
                }
                return emit({ target: 'run-agentic', workspacePath: query, model: request.model, goal: request.goal }, `run-agentic: opening MissionWizard for ${basename(query) || query}`);
            }
            // workspace-create: VISIBLE creation path — renderer calls workspaces.touch (on-screen).
            // NO silent mkdirSync — folder creation is the renderer's responsibility via the visible flow.
            if (request.target === 'workspace-create') {
                if (!query || !isAbsolute(query)) {
                    return { ok: false, message: 'workspace-create: query must be an absolute path (e.g. /Users/foo/projects/my-site)' };
                }
                return emit({ target: 'workspace-create', workspacePath: query }, `workspace-create: ${basename(query) || query}`);
            }
            // workspace-open (alias: workspace) — pure tab switch, NEVER creates a folder.
            if (request.target === 'workspace' || request.target === 'workspace-open') {
                const known = new Set();
                if (activeWorkspace && !activeWorkspace.startsWith('ssh://'))
                    known.add(activeWorkspace);
                for (const ws of Object.keys(rendererMissionsMirror.missionsByWorkspace)) {
                    if (ws)
                        known.add(ws);
                }
                // Also include recent workspaces from workspaces.json
                try {
                    const wsJson = process.env['OVERCLOCK_WORKSPACES_JSON'] ?? join(dataDir, 'workspaces.json');
                    const parsed = JSON.parse(readFileSync(wsJson, 'utf-8'));
                    for (const e of parsed.recent ?? []) {
                        if (e.path && !e.path.startsWith('ssh://'))
                            known.add(e.path);
                    }
                }
                catch { /* workspaces.json absent — fine */ }
                const workspaces = [...known];
                const describe = (ws) => `${basename(ws) || ws} (${ws})`;
                const matches = resolve(workspaces, (ws) => ws, (ws) => basename(ws) || ws);
                if (matches.length !== 1) {
                    return reject('workspace', matches.map(describe), workspaces.map(describe));
                }
                const workspacePath = matches[0];
                return emit({ target: 'workspace', workspacePath }, `workspace activated: ${describe(workspacePath)}`);
            }
            if (request.target === 'mission') {
                // Union mirror (renderer-created) + missions.json (MCP-created) deduplicated by id.
                const all = [];
                const seen = new Set();
                for (const [ws, missions] of Object.entries(rendererMissionsMirror.missionsByWorkspace)) {
                    for (const mission of missions) {
                        if (mission.status === 'archived')
                            continue;
                        if (seen.has(mission.id))
                            continue;
                        seen.add(mission.id);
                        all.push({ workspacePath: ws, mission });
                    }
                }
                try {
                    for (const mission of await missionStore.readMissionsFile()) {
                        if (mission.status === 'archived')
                            continue;
                        if (seen.has(mission.id))
                            continue;
                        seen.add(mission.id);
                        all.push({ workspacePath: mission.worktreePath || mission.workspaceId, mission });
                    }
                }
                catch { /* no missions.json */ }
                const describe = (entry) => `"${entry.mission.title}" (id ${entry.mission.id}, workspace ${basename(entry.workspacePath) || entry.workspacePath})`;
                const matches = resolve(all, (e) => e.mission.id, (e) => e.mission.title);
                if (matches.length !== 1)
                    return reject('mission', matches.map(describe), all.map(describe));
                const { workspacePath, mission } = matches[0];
                return emit({ target: 'mission', workspacePath, missionId: mission.id, missionTitle: mission.title }, `mission activated: "${mission.title}" (workspace ${basename(workspacePath) || workspacePath})`);
            }
            if (request.target === 'screen') {
                // Only 'grid' has a renderer route. 'catalog' and 'settings' have no nav route yet —
                // return ok:false so callers are not lied to about navigation success.
                const navigableScreens = ['grid'];
                const allScreens = ['grid', 'catalog', 'settings'];
                const matches = resolve(allScreens, (s) => s, (s) => s);
                if (matches.length !== 1)
                    return reject('screen', matches, allScreens);
                const screen = matches[0];
                if (!navigableScreens.includes(screen)) {
                    return {
                        ok: false,
                        message: `screen "${screen}" is not yet navigable (no dedicated route). Use "grid" instead.`,
                        candidates: navigableScreens,
                    };
                }
                return emit({ target: 'screen', screen }, `screen opened: ${screen}`);
            }
            // pane: resolve by paneId or agent type; use configs map for workspacePath
            const items = pty.listPanes().map((p) => {
                const cfg = configs.get(p.paneId);
                return { paneId: p.paneId, agent: p.agent, workspacePath: cfg?.workspacePath };
            });
            const describePane = (item) => `${item.paneId} (${item.agent}${item.workspacePath ? `, workspace ${basename(item.workspacePath)}` : ''})`;
            const matches = resolve(items, (item) => item.paneId, (item) => item.agent);
            if (matches.length !== 1)
                return reject('pane', matches.map(describePane), items.map(describePane));
            const matched = matches[0];
            return emit({ target: 'pane', paneId: matched.paneId, workspacePath: matched.workspacePath }, `pane focused: ${describePane(matched)}`);
        },
    };
    // ── Cron tick loop — wired here so bridgeDeps is already defined ────────────
    // Fires due active jobs every 60s; skips stale ones (missed while laptop slept).
    // workspacePath on job MUST be within the active workspace (CLAUDE.md: cwd outside
    // workspace = invisible pane). Fallback: activeWorkspace at fire time.
    // NOTE: for squad-type jobs workspacePath is NOT threaded into squadSpawn (the
    // squadSpawn signature has no cwd param; it uses the squad's own workspace
    // resolution). workspacePath is only honoured for agentName and plain pane spawns.
    const cronTickLoop = new CronTickLoop({
        cronStore,
        fireJob: async ({ job }) => {
            try {
                const cwd = job.workspacePath ?? activeWorkspace;
                if (job.squadId && bridgeDeps.squadSpawn) {
                    // workspacePath is intentionally not passed here — squadSpawn resolves its
                    // own workspace from the squad definition, not from the job's workspacePath.
                    const result = await bridgeDeps.squadSpawn(job.squadId, { input: job.brief });
                    return result.orchestratorPaneId;
                }
                if (job.agentName && bridgeDeps.spawnIsolatedAgent) {
                    const result = await bridgeDeps.spawnIsolatedAgent({
                        agentName: job.agentName,
                        cli: 'claude',
                        spec: { tools: null, allowedSkills: null, systemPrompt: null },
                        prompt: job.brief,
                        cwd,
                    });
                    return result.paneId;
                }
                // Fallback: plain pane spawn; agent/user types the brief
                const result = await bridgeDeps.spawnPane({ cwd, workspacePath: cwd });
                return result.paneId;
            }
            catch (err) {
                process.stderr.write(`[cron] fireCronJob error for "${job.name}": ${err instanceof Error ? err.message : String(err)}\n`);
                return null;
            }
        },
    });
    cronTickLoop.start();
    // Advertise core + diagnostic tools (isDiagnosticsEnabled=true habilita os app_*).
    const overclockBridge = makeBridge(bridgeDeps);
    // handoff_list scoping: an orchestrator only sees ITS OWN invoked workers' handoffs (a stale
    // entry from another pane otherwise reads as "my worker failed"). Mirrors Electron ~5050.
    overclockBridge.workersOfCaller = (callerPaneId) => [...(callerInvokedWorkers.get(callerPaneId) ?? [])];
    const _discoveryLog = new Map();
    overclockBridge.markDiscoveryCall = (paneId, tool) => {
        if (!_discoveryLog.has(paneId))
            _discoveryLog.set(paneId, new Set());
        _discoveryLog.get(paneId).add(tool);
    };
    overclockBridge.hasDiscoveryHistory = (paneId) => {
        const called = _discoveryLog.get(paneId) ?? new Set();
        return {
            skillList: called.has('overclock_skill_list'),
            agentList: called.has('overclock_agent_list'),
            modelList: called.has('overclock_model_list'),
        };
    };
    overclockBridge.getCatalogStamp = async (type) => {
        if (!overclockBridge.catalogList)
            return 'nocatalog';
        const items = await overclockBridge.catalogList({ type, includeMissing: false });
        const sorted = [...items.map((i) => i.name)].sort().join('\x00');
        return createHash('sha256').update(sorted).digest('hex').slice(0, 8);
    };
    overclockBridge.catalogUncategorized = async (args) => {
        const db = getGlobalDb(dataDir);
        ensureCatalogSchema(db);
        ensureOverlaySchema(db);
        // scope:'all' = the explicit recatalog path — every active item, categorized or not.
        const list = args?.scope === 'all' ? listAllForCatalog : listUncategorized;
        if (args?.type)
            return list(db, args.type);
        return [...list(db, 'skill'), ...list(db, 'agent')];
    };
    overclockBridge.catalogStatus = async () => {
        const db = getGlobalDb(dataDir);
        ensureCatalogSchema(db);
        ensureOverlaySchema(db);
        return catalogStateCounts(db);
    };
    overclockBridge.catalogOverlayWrite = async (args) => {
        const db = getGlobalDb(dataDir);
        ensureCatalogSchema(db);
        ensureOverlaySchema(db);
        const written = upsertOverlay(db, args.rows, CATALOG_CATEGORIZER_VERSION);
        return { written };
    };
    overclockBridge.catalogInventory = async () => {
        const db = getGlobalDb(dataDir);
        ensureCatalogSchema(db);
        ensureOverlaySchema(db);
        const overlayItems = listCategorizedForSynthesis(db);
        // Merge pre-categorized built-ins (origin:'overclock') so the piloto sees them
        // even when the user's ~/.claude is empty and the overlay DB has no rows.
        const listBuiltin = mcpPkg.listBuiltinManifest;
        const builtinEntries = typeof listBuiltin === 'function' ? listBuiltin() : [];
        const overlayKeys = new Set(overlayItems.map((i) => i.identity_key));
        const builtinRows = builtinEntries
            .filter((b) => !overlayKeys.has(b.identity_key))
            .map((b) => ({
            identity_key: b.identity_key,
            type: b.type,
            name: b.name,
            category: b.category,
            purpose: b.purpose,
            when_to_use: '',
            path: '',
            origin: 'overclock',
        }));
        return [...overlayItems, ...builtinRows];
    };
    overclockBridge.catalogStacksWrite = async (args) => {
        const db = getGlobalDb(dataDir);
        ensureCatalogSchema(db);
        ensureOverlaySchema(db);
        const written = replaceStacks(db, args.stacks, CATALOG_SYNTHESIZER_VERSION);
        return { written };
    };
    overclockBridge.catalogStackGet = (id) => {
        try {
            const db = getGlobalDb(dataDir);
            ensureCatalogSchema(db);
            ensureOverlaySchema(db);
            return { ok: true, stack: getStack(db, id) };
        }
        catch {
            return { ok: false, stack: null };
        }
    };
    // chefInvoke — PILOTO-tier delegation (1:1:N topology enforcement).
    // 1-per-area gate uses direct configs access (not in spawnIsolatedAgent — roster-based gate
    // doesn't fire for piloto which has squadCallable:[]).
    overclockBridge.chefInvoke = async (args) => {
        // F-176: the controller (Torre de Controle) is the one chef that WRITES to the registry
        // (TASK/items/ + commits) and runs its own diagnosis — it must NOT be born delegateOnly
        // (that strip would remove Read/Bash/Edit and kill its register-and-dispatch contract).
        // The 3 classic chefes stay pure delegators (delegateOnly:true), unchanged.
        const chefDelegateOnly = args.area !== 'controller';
        const livePaneIds = new Set(pty.listPanes().map((p) => p.paneId));
        for (const [existingPaneId, cfg] of configs.entries()) {
            // F-129: mission-scope the reuse — a chefe of another mission (different missionId) is a
            // different mission's builder/scout/reviewer, not this piloto's. Without this check the
            // piloto found and poked a foreign mission's chefe (cross-mission delegation leak). Only
            // skip reuse when BOTH sides carry a known missionId and they differ; an unset missionId on
            // either side keeps the legacy (pre-mission) unrestricted match.
            if (args.missionId && cfg.missionId && args.missionId !== cfg.missionId)
                continue;
            // Reuse match: same squadRole + live. The delegateOnly check only applies to the classic
            // chefes (their squadRole values 'scout'/'builder'/'reviewer' can collide with non-chefe
            // squad panes); 'controller' is a chef-only squadRole, matched by role alone.
            if ((chefDelegateOnly ? cfg.delegateOnly === true : true) && cfg.squadRole === args.area && livePaneIds.has(existingPaneId)) {
                // BUG9: the chefe→piloto wake mapping was DELETED on its prior handoff done
                // (shouldClearCallerMapping('done')===true — correct for one-shot workers, wrong for a
                // persistent chefe that handoffs once per piloto task). Without re-establishing it, the
                // chefe's SECOND done finds no caller and never wakes the piloto. Re-record the mapping on
                // every reuse ({throwaway:false} = no auto-close, just workerToCaller + pending tracking).
                if (args.callerPaneId)
                    recordInvokedWorker(existingPaneId, args.callerPaneId, { throwaway: false });
                // BUG8: a reused chefe already finished its prior turn (handoff done) and is idle at the
                // prompt. A raw `task + '\n'` lands the text in the input box but does NOT submit it in the
                // Claude TUI (Enter is '\r', and the render needs to settle first) — so the chefe never
                // re-engages and just re-handoffs. Use the proven pokeOrchestrator sequence (write → settle
                // → '\r' → '\r') that the worker-wake path already relies on, so the new task is actually
                // submitted and the chefe executes it.
                pokeOrchestrator(existingPaneId, args.task);
                return { paneId: existingPaneId, reused: true };
            }
        }
        if (!bridgeDeps.spawnIsolatedAgent)
            throw new Error('spawnIsolatedAgent not available');
        const result = await bridgeDeps.spawnIsolatedAgent({
            agentName: args.agentName,
            cli: args.cli,
            spec: {
                ...args.spec,
                // Thread mission allowlists into the chefe spec so spawnIsolatedAgent persists them
                // on the chefe pane config (callerCfg for its worker spawns).
            },
            prompt: args.task,
            missionId: args.missionId,
            callerPaneId: args.callerPaneId,
            effort: args.effort ?? 'high',
            squadRole: args.area,
            delegateOnly: chefDelegateOnly,
            invokedCategory: args.area,
        });
        // Thread mission allowlists onto the spawned chefe's pane config so they propagate to workers.
        if (result.paneId && (args.allowedCLIs !== undefined || args.allowedAgents?.length || args.missionAllowedSkills?.length)) {
            const cfg = configs.get(result.paneId);
            if (cfg) {
                if (args.allowedCLIs !== undefined)
                    cfg.allowedCLIs = args.allowedCLIs;
                if (args.allowedAgents?.length)
                    cfg.allowedAgents = args.allowedAgents;
                if (args.missionAllowedSkills?.length)
                    cfg.missionAllowedSkills = args.missionAllowedSkills;
            }
        }
        // Chefe persists across handoffs (1:1:N): undo the throwaway registration that
        // onWorkerSpawned adds by default — chefe must survive after delivering to the piloto.
        squadWorkerPanes.delete(result.paneId);
        return { paneId: result.paneId, reused: false, isolationDir: result.isolationDir };
    };
    // overclock_media_providers: which image/video providers have an API key set (Settings → API
    // Keys). The squad-former calls this before pinning a squad's imageProvider/videoProvider so it
    // only offers providers the user can actually run (or warns when the wanted one isn't set up).
    // Each provider exposes configured + the REAL selected/default model + the user's enabledModels
    // (model ids only — NEVER the apiKey) so the squad checks the model that is actually enabled
    // instead of guessing the code default (which generated false "switch your model" blockers).
    overclockBridge.mediaProviders = async () => {
        const entry = (id, label) => ({
            id,
            label,
            configured: serviceKeysStore.hasKey(id),
            ...serviceKeysStore.models(id),
        });
        return {
            ok: true,
            image: [
                entry('openai-image', 'gpt-image (OpenAI key)'),
                entry('google-image', 'nano-banana (Google key)'),
            ],
            video: [
                entry('replicate-video', 'Replicate (Seedance)'),
            ],
            audio: [
                entry('elevenlabs', 'ElevenLabs'),
            ],
        };
    };
    // overclock_marketplace_search: query the Overclock web catalog so the squad-former researcher
    // can find components NOT installed locally. Was unwired in the sidecar (researcher saw only the
    // installed catalog → "marketplace offline"). Mirrors Electron searchOverclockMarketplace ~376.
    overclockBridge.openBrowserPane = async (args) => {
        let url = args.url;
        // Local path (absolute, not http/https) → spin up a static preview server so the
        // piloto can call overclock_open_browser(workspacePath) and get a tracked localhost pane.
        if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
            const abs = isAbsolute(url) ? url : args.workspacePath ? join(args.workspacePath, url) : null;
            if (abs) {
                // Dedup: same mission's local deliverable must reuse the existing pane — not spin a
                // second static server on a different port (URL-based dedup would miss it).
                if (args.missionId) {
                    for (const entry of browserPanes.values()) {
                        if (entry.missionId === args.missionId && entry.workspacePath === args.workspacePath) {
                            host.broadcast.send('pane:focus', { paneId: entry.paneId });
                            return { paneId: entry.paneId, url: entry.url };
                        }
                    }
                }
                const serveDir = (() => { try {
                    return statSync(abs).isDirectory() ? abs : dirname(abs);
                }
                catch {
                    return abs;
                } })();
                try {
                    const { port } = await startPreviewServer(serveDir);
                    url = `http://127.0.0.1:${port}`;
                }
                catch { /* serve failed — keep original url so the pane still registers */ }
            }
        }
        return openBrowserPane(url, args.missionId, args.workspacePath);
    };
    overclockBridge.marketplaceSearch = async (args) => {
        const q = typeof args.q === 'string' ? args.q.trim() : '';
        const kind = args.kind === 'agent' || args.kind === 'skill' ? args.kind : null;
        const url = new URL('/api/catalog/search', WEB_BASE);
        url.searchParams.set('limit', '100');
        if (q)
            url.searchParams.set('q', q);
        if (kind)
            url.searchParams.set('kind', kind);
        try {
            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), 10_000);
            const res = await fetch(url, { headers: { 'User-Agent': 'overclock' }, signal: ctrl.signal });
            clearTimeout(timer);
            if (!res.ok)
                return { ok: false, error: `catalog endpoint ${res.status}` };
            const payload = await res.json();
            const results = (payload.results ?? [])
                .filter((r) => typeof r.slug === 'string' && typeof r.name === 'string')
                .map((r) => ({
                slug: r.slug,
                kind: r.kind === 'skill' ? 'skill' : 'agent',
                category: typeof r.category === 'string' ? r.category : '',
                name: r.name,
                description: typeof r.description === 'string' ? r.description : '',
                descriptionPt: typeof r.description_pt === 'string' ? r.description_pt : null,
                tags: Array.isArray(r.tags) ? r.tags.filter((t) => typeof t === 'string') : [],
                downloads: typeof r.downloads === 'number' ? r.downloads : null,
            }));
            return { ok: true, count: typeof payload.count === 'number' ? payload.count : results.length, results };
        }
        catch (err) {
            return { ok: false, error: err instanceof Error ? err.message : String(err) };
        }
    };
    mcpHost = new MCPServerHost(overclockBridge, () => activeWorkspace, () => [...mcpCoreToolNames(), ...mcpDiagnosticToolNames()]);
    // Wire the worker → orchestrator wake now that the registry exists.
    attachHandoffDelivery();
    // Swarm-level stall watchdog: surface a synthetic error handoff for any invoked worker that
    // has been silent for 20min without handing off. Complements the per-spawn watchdog in
    // spawnIsolatedAgent.ts (early-fire net). Created ONCE here — NOT inside per-spawn methods.
    const WATCHDOG_SCAN_MS = 5 * 60_000;
    const WATCHDOG_STALL_MS = 20 * 60_000;
    const watchdogTimer = setInterval(() => {
        const reg = mcpHost?.handoffRegistry;
        if (!reg)
            return;
        const now = Date.now();
        const byId = new Map(pty.listPanes().map((p) => [p.paneId, p]));
        for (const workers of callerInvokedWorkers.values())
            for (const paneId of workers) {
                if (reg.list([paneId]).length > 0)
                    continue;
                const p = byId.get(paneId);
                if (!p)
                    continue;
                const last = p.lastOutputAt ?? p.lastActivityAt ?? 0;
                if (now - last < WATCHDOG_STALL_MS)
                    continue;
                reg.submit({ paneId, submittedAt: now, summary: `watchdog: worker pane ${paneId} stalled (no output >20min, no handoff)`, status: 'error' });
            }
    }, WATCHDOG_SCAN_MS);
    if (typeof watchdogTimer.unref === 'function')
        watchdogTimer.unref();
    host.ipcMain.handle('mcp:status', () => mcpHost?.status() ?? {
        active: false, port: null, sseUrl: null, streamableHttpUrl: null, toolCount: 0, tools: [],
    });
    // catalog:invokeAgent — spawna um agente isolado do catálogo (bridge.spawnIsolatedAgent).
    // Espelha bootstrap ~5115. Reusa bridgeDeps já montado.
    host.ipcMain.handle('catalog:invokeAgent', async (_e, args) => {
        try {
            if (!args || typeof args !== 'object')
                return { ok: false, error: 'invalid args' };
            const a = args;
            const agentName = typeof a['agentName'] === 'string' ? a['agentName'] : '';
            const cli = a['cli'];
            const spec = a['spec'];
            const prompt = typeof a['prompt'] === 'string' ? a['prompt'] : '';
            if (!agentName || !cli || !spec)
                return { ok: false, error: 'missing agentName/cli/spec' };
            const result = await bridgeDeps.spawnIsolatedAgent({ agentName, cli, spec, prompt });
            return { ok: true, paneId: result.paneId, isolationDir: result.isolationDir };
        }
        catch (err) {
            return { ok: false, error: err instanceof Error ? err.message : String(err) };
        }
    });
    // Start assíncrono (wireCore é síncrono): liga o HTTP host + escreve o mcp-config
    // que o claude consome via --mcp-config (injetado em buildSpawnConfig). Nome
    // distinto (mcp-config.sidecar.json) p/ não colidir com o do Electron no mesmo dataDir.
    // Dev (sidecar runs from the repo) gets a FIXED MCP port (53700) + a DISTINCT config file so the
    // dev-observation tooling always reaches the dev instance, and dev/prod agents never read each
    // other's mcp-config (they share ~/.overclock-app). Release falls through to the dynamic port.
    const isDevSidecar = (process.argv[1] ?? '').includes('/packages/sidecar/') || process.env['OVERCLOCK_DEV'] === '1';
    if (isDevSidecar && !process.env['OVERCLOCK_MCP_PORT'])
        process.env['OVERCLOCK_MCP_PORT'] = '53700';
    const mcpConfigTarget = join(dataDir, isDevSidecar ? 'mcp-config.sidecar.dev.json' : 'mcp-config.sidecar.json');
    void (async () => {
        try {
            const { port } = await mcpHost.start();
            await mcpHost.writeConfig(mcpConfigTarget);
            mcpConfigPath = mcpConfigTarget;
            process.stderr.write(`[sidecar] MCP host on 127.0.0.1:${port} → ${mcpConfigTarget}\n`);
        }
        catch (err) {
            process.stderr.write(`[sidecar] MCP host failed to start: ${err instanceof Error ? err.message : String(err)}\n`);
        }
    })();
    // ─── Remote Bridge (WSS thin-client server for iPhone / remote control) ────
    remoteBridge = new RemoteBridge({
        dataDir,
        listPanes: () => {
            const toInfo = (p) => {
                const cfg = configs.get(p.paneId);
                return { paneId: p.paneId, agent: cfg?.agent ?? p.agent, cwd: cfg?.cwd ?? p.cwd ?? '', status: 'running', model: cfg?.model, missionId: cfg?.missionId };
            };
            return [...pty.listPanes().map(toInfo), ...remotePty.listPanes().map(toInfo)];
        },
        readMissions: () => missionStore.readMissionsFile(),
        getPaneBuffer: (id) => (pty.hasPane(id) ? pty.getBuffer(id) : remotePty.getBuffer(id)),
        writePaneInput: (id, text) => { if (pty.hasPane(id)) {
            pty.write(id, text);
        }
        else {
            remotePty.write(id, text);
        } },
        hasPane: (id) => pty.hasPane(id) || remotePty.hasPane(id),
        resizePane: (id, cols, rows) => { if (pty.hasPane(id)) {
            pty.resize(id, cols, rows);
        }
        else if (remotePty.hasPane(id)) {
            remotePty.resize(id, cols, rows);
        } },
        spawnPane: async (opts) => {
            // Spawn an agent CLI (or shell) on the host as a fresh overclock_* tmux session, via the
            // local self-ssh alias, so it surfaces in listPanes for the remote client.
            const alias = process.env['OVERCLOCK_ADOPT_HOST_ALIAS'] || 'overclock-local';
            const agent = opts.agent || 'claude';
            const id = `term-${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;
            const args = [];
            if (agent !== 'shell') {
                args.push('--dangerously-skip-permissions');
                if (opts.model)
                    args.push('--model', opts.model);
                if (opts.effort)
                    args.push('--effort', opts.effort);
            }
            await remotePty.spawn({
                id,
                agent,
                hostAlias: alias,
                cwd: opts.cwd || '/home/overclock',
                workspacePath: `ssh://${alias}/`,
                ...(args.length ? { args } : {}),
            });
            return id;
        },
    });
    remoteBridge.start().catch((err) => {
        process.stderr.write(`[remote-bridge] Failed to start: ${err instanceof Error ? err.message : String(err)}\n`);
    });
    // Headless mode: print pair code to stderr so VPS operators can read it without a renderer.
    if (process.env['OVERCLOCK_HEADLESS'] === '1') {
        const printCode = (code) => {
            process.stderr.write(`[remote-bridge] PAIR CODE: ${code} (valid 5 min) — use this to pair your remote client\n`);
        };
        printCode(remoteBridge.getPairCode().code);
        remoteBridge.on('pairCode', printCode);
    }
    // Headless: adopt pre-existing local overclock_* tmux sessions so a remote client (phone) can
    // see/control agents this instance did not spawn (created by another Overclock over SSH).
    if (process.env['OVERCLOCK_ADOPT_LOCAL_TMUX'] === '1') {
        const adoptAlias = process.env['OVERCLOCK_ADOPT_HOST_ALIAS'] || 'overclock-local';
        const adoptFilter = process.env['OVERCLOCK_ADOPT_FILTER'] || '';
        void (async () => {
            try {
                const sessions = await listRemoteOrphanSessions(adoptAlias);
                const picked = adoptFilter ? sessions.filter((x) => x.session.includes(adoptFilter)) : sessions;
                process.stderr.write(`[adopt] ${adoptAlias}: ${sessions.length} found, adopting ${picked.length}\n`);
                for (const sess of picked) {
                    const id = sess.paneId || sess.session;
                    try {
                        await remotePty.spawn({
                            id,
                            agent: (sess.agent || 'claude'),
                            hostAlias: adoptAlias,
                            cwd: '/',
                            workspacePath: `ssh://${adoptAlias}/`,
                            remoteTmuxSession: sess.session,
                            ...(sess.missionId ? { missionId: sess.missionId } : {}),
                            ...(sess.model ? { model: sess.model } : {}),
                        });
                        process.stderr.write(`[adopt] attached ${sess.session} -> ${id}\n`);
                    }
                    catch (e) {
                        process.stderr.write(`[adopt] FAIL ${sess.session}: ${e instanceof Error ? e.message : String(e)}\n`);
                    }
                }
            }
            catch (e) {
                process.stderr.write(`[adopt] scan failed: ${e instanceof Error ? e.message : String(e)}\n`);
            }
        })();
    }
    host.ipcMain.handle('remote:pairingCode', () => remoteBridge?.getPairCode() ?? { code: '------', expiresAt: 0 });
    host.ipcMain.handle('remote:revokeAllTokens', () => { remoteBridge?.revokeAllTokens(); return true; });
    // ─── Jarvis (C-050.1): agentic text-in/text-out — gate OVERCLOCK_JARVIS=1 ──
    let jarvisService = null;
    if (isJarvisEnabled()) {
        jarvisService = new JarvisService({
            bridge: overclockBridge,
            getWorkspace: () => activeWorkspace,
            getHandoffRegistry: () => mcpHost?.handoffRegistry,
            emit: (event) => { host.broadcast.send('jarvis:event', event); },
            getGoogleKey: () => serviceKeysStore.resolve('gemini-live').apiKey || undefined,
            getSharedMemory: () => mcpHost?.sharedMemory,
            // C-091: panes SALVOS (fechados) da missão pro contexto/consultar — MESMA fonte de dados
            // que MissionRestoreCards (session:loadAll), só filtrada por missionId.
            loadSavedPanes: async (workspacePath, missionId) => {
                const sessions = await sessionManager.loadAll(workspacePath);
                return sessions
                    .flatMap((s) => s.panes)
                    .filter((p) => p.missionId === missionId)
                    .map((p) => ({ paneId: p.id, agent: p.agent, squadRole: p.squadRole, delegateOnly: p.delegateOnly, leaf: p.leaf, callerPaneId: p.callerPaneId, model: p.model }));
            },
            // C-091: reusa o ACK genérico do wizard-set/wizard-fire (waitWizardSetAck) — o renderer
            // reporta via o MESMO app.wizardSetAck já exposto, sem canal/IPC novo.
            waitForAck: (ackId, timeoutMs) => waitWizardSetAck(ackId, timeoutMs),
        });
        host.ipcMain.handle('jarvis:send', (_e, args) => jarvisService.send(args));
        host.ipcMain.handle('jarvis:confirm', (_e, args) => jarvisService.confirm(args));
        host.ipcMain.handle('jarvis:history', (_e, args) => {
            const a = args;
            return jarvisService.history(a?.workspacePath);
        });
        host.ipcMain.handle('jarvis:getConfig', () => jarvisService.getConfig());
        host.ipcMain.handle('jarvis:setConfig', (_e, patch) => jarvisService.setConfig(patch));
        // C-056.1: tela visível do renderer → contexto do agente (Live [update] + brain por turno)
        // F-094 r2: payload pode vir { text, missionId } — missão aberta NA TELA escopa o
        // inventário de panes; string pura (sem missão na tela) continua aceita.
        host.ipcMain.handle('jarvis:screen', (_e, payload) => {
            const p = typeof payload === 'string'
                ? { text: payload }
                : (payload && typeof payload === 'object'
                    ? payload
                    : {});
            // F-102: panes visíveis + pane focado (ids reais do renderer) escopam a resolução de
            // 'comandar' e o contexto do brain ao que o usuário efetivamente vê na tela.
            const visiblePaneIds = Array.isArray(p.visiblePaneIds)
                ? p.visiblePaneIds.filter((id) => typeof id === 'string')
                : undefined;
            // F-118: HOME GLOBAL — nomes reais dos workspaces da lista (dado rotulado, não instrução).
            const isHome = p.isHome === true;
            const workspaceNames = Array.isArray(p.workspaceNames)
                ? p.workspaceNames.filter((n) => typeof n === 'string')
                : undefined;
            jarvisService.updateScreen(typeof p.text === 'string' ? p.text : '', typeof p.missionId === 'string' && p.missionId ? p.missionId : undefined, visiblePaneIds, typeof p.focusedPaneId === 'string' && p.focusedPaneId ? p.focusedPaneId : undefined, isHome, workspaceNames);
            return { ok: true };
        });
        // F-056: Gemini Live (voz full-duplex) — start/stop/mic bridge (preload/shim já expunham
        // os 3 canais desde o port do renderer; só faltava o handler do sidecar).
        host.ipcMain.handle('jarvis:live:start', (_e, args) => {
            const a = args;
            // C-070: persona sanitizada (tamanhos limitados — vai pro system prompt da Live).
            const p = a?.persona;
            const persona = p ? {
                userName: typeof p.userName === 'string' ? p.userName.slice(0, 60) : undefined,
                customPrompt: typeof p.customPrompt === 'string' ? p.customPrompt.slice(0, 2000) : undefined,
                assistantName: typeof p.assistantName === 'string' ? p.assistantName.slice(0, 60) : undefined,
                greetOnConnect: p.greetOnConnect === true,
            } : undefined;
            return jarvisService.startLive(a?.workspacePath || activeWorkspace, a?.voiceName, persona);
        });
        host.ipcMain.handle('jarvis:live:stop', () => { jarvisService.stopLive(); return { ok: true }; });
        host.ipcMain.handle('jarvis:live:mic', (_e, args) => {
            const chunk = typeof args === 'string' ? Buffer.from(args, 'base64') : Buffer.from(args);
            jarvisService.pushLiveMic(chunk);
        });
        host.ipcMain.handle('jarvis:live:endTurn', () => {
            jarvisService.endLiveMicTurn();
            return { ok: true };
        });
        process.stderr.write('[sidecar] Jarvis enabled (OVERCLOCK_JARVIS=1)\n');
    }
    // ──────────────────────────────────────────────────────────────────────────
    return {
        dispose: () => {
            onboarding.dispose();
            clearInterval(workerStallTimer); // F-N04: stop the liveness watchdog
            pty.off('data', onData);
            pty.off('exit', onExit);
            transcriptWatcher.stop();
            codexWatcher.stop();
            cronTickLoop.stop();
            remotePty.off('data', onData);
            remotePty.off('exit', onExit);
            remotePty.killAll();
            pty.killAll();
            void mcpHost?.stop().catch(() => { });
            mcpHost = null;
            void remoteBridge?.stop().catch(() => { });
            remoteBridge = null;
            jarvisService?.dispose();
            jarvisService = null;
        },
    };
}
//# sourceMappingURL=core.js.map