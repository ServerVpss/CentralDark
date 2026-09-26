// wireOnboarding — handlers do wizard "Modo Guiado" (onboarding v0.9), ISOLADOS do
// core.ts pra não inchar wireCore. Porta os ipcMain.handle do Electron
// (registerConfigCliIpcHandlers.ts da v09) pro sidecar Tauri, re-wirando (não
// copy-paste): os push events (install:progress, login:changed) viram
// host.broadcast.send espelhando 'missions:updated' (TEMPLATE canônico de evento
// processo→renderer). Usa CliInstaller/claudeLogin de @overclock-app/core (Fase A).
//
// Re-wire notes (Electron → Tauri/WS):
//  - `event.sender` aqui é o WebSocket da conexão (não um Electron webContents). O
//    ciclo de vida do watcher de login amarra no `ws.on('close')` — equivalente WS
//    do 'destroyed'/'did-navigate'. Sem isso o poll de 2s vazaria a cada reload.
//  - ensureClaudeFolderTrust no destino tem assinatura (cwd, claudeJsonPath?) — sem
//    o `{ createIfMissing }` do claudeTrust.ts da v09 (que NÃO é portado). Pre-seed
//    é best-effort: se ~/.claude.json não existe, o Claude cria no onboarding.
import { homedir } from 'node:os';
import { join, sep } from 'node:path';
import { CliInstaller, isInstallableCli, ClaudeLoginRunner, ClaudeLoginWatcher, isClaudeCliLoggedIn, CLI_LOGIN_CHANGED, ensureClaudeFolderTrust, } from '@overclock-app/core';
// Canal de notificação de providers ao renderer — mesmo papel do PROVIDERS_UPDATED
// do Electron, broadcastado via host.broadcast.send (mirror de 'missions:updated').
// O consumidor no renderer (preload/shim) é wireado numa fase posterior.
const PROVIDERS_UPDATED = 'providers:updated';
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
const isRemoteWorkspacePath = (value) => typeof value === 'string' && value.startsWith('ssh://');
export function wireOnboarding(deps) {
    const { host, configStore, cliDetector, providerStore } = deps;
    // Logging no estilo do sidecar (process.stderr.write), embrulhado nas assinaturas
    // logInfo/logError que CliInstaller/ClaudeLogin esperam.
    const logInfo = (...args) => {
        process.stderr.write(`[onboarding] ${args.map((a) => (a instanceof Error ? a.message : String(a))).join(' ')}\n`);
    };
    const logError = (...args) => {
        process.stderr.write(`[onboarding] ${args.map((a) => (a instanceof Error ? a.message : String(a))).join(' ')}\n`);
    };
    // deps.send do CliInstaller → broadcast WS do progresso (mirror de 'missions:updated').
    const safeSend = (channel, ...args) => {
        host.broadcast.send(channel, ...args);
    };
    const cliInstaller = new CliInstaller({
        send: (channel, payload) => { safeSend(channel, payload); },
        logInfo,
        logError,
    });
    // O login do Claude CLI é fluxo de browser interativo sem evento — o passo
    // "Conectar" do wizard assina e o sidecar faz poll enquanto está em tela.
    const loginWatcher = new ClaudeLoginWatcher((loggedIn) => {
        safeSend(CLI_LOGIN_CHANGED, { cli: 'claude', loggedIn });
    });
    // Pre-seed do trust-folder (~/.claude.json por realpath — técnica validada, mesma
    // do spawn path). Sem isso o primeiro pane do wizard abre no trust dialog e o leigo
    // trava. Falha aqui nunca derruba o fluxo chamador.
    const seedWorkspaceTrust = async (workspacePath) => {
        if (isRemoteWorkspacePath(workspacePath))
            return;
        try {
            await ensureClaudeFolderTrust(workspacePath);
        }
        catch (err) {
            logError('trust pre-seed failed:', err instanceof Error ? err.message : String(err));
        }
    };
    // Fresh local probe + provider refresh — espelha redetectLocalAndRefreshProviders do
    // Electron. O cache do CliDetector vive pelo processo, então o redetect forçado é
    // obrigatório após instalar um CLI. Broadcast 'providers:updated' (mirror missions).
    const redetectAndRefreshProviders = () => {
        const detections = cliDetector.redetect();
        providerStore.refreshCodexModels();
        const presence = {
            claude: detections.some((d) => d.name === 'claude' && d.found),
            gemini: detections.some((d) => d.name === 'gemini' && d.found),
            codex: detections.some((d) => d.name === 'codex' && d.found),
            kimi: detections.some((d) => d.name === 'kimi' && d.found),
            antigravity: detections.some((d) => d.name === 'antigravity' && d.found),
            cursor: detections.some((d) => d.name === 'cursor' && d.found),
            copilot: detections.some((d) => d.name === 'copilot' && d.found),
            grok: detections.some((d) => d.name === 'grok' && d.found),
        };
        providerStore.setCliPresence(presence);
        safeSend(PROVIDERS_UPDATED, providerStore.listPublic());
    };
    host.ipcMain.handle('cli:install', async (_event, args) => {
        const cli = isRecord(args) && typeof args.cli === 'string' ? args.cli : '';
        const result = await cliInstaller.install(cli);
        if (result.ok && isInstallableCli(cli) && cli !== 'node') {
            try {
                redetectAndRefreshProviders();
            }
            catch (err) {
                logError('post-install redetect failed:', err instanceof Error ? err.message : String(err));
            }
            // Retry/reentrada: se o workspace default já existia antes do install, garantir
            // o trust agora (a ordem install→workspace pode inverter). Trust-folder é
            // conceito do Claude — os outros CLIs não usam.
            if (cli === 'claude') {
                const config = configStore.get();
                const lastWorkspacePath = typeof config.lastWorkspacePath === 'string' ? config.lastWorkspacePath : null;
                if (lastWorkspacePath)
                    await seedWorkspaceTrust(lastWorkspacePath);
            }
        }
        return result;
    });
    // Probe de node/npm pro painel de assistentes (cache no sidecar; installs invalidam).
    host.ipcMain.handle('cli:envStatus', () => cliInstaller.envStatus());
    // Login gerenciado: o sidecar dirige `claude auth login` e resolve quando o watcher
    // de login confirma — o renderer nunca toca em pane/PTY pra logar.
    const loginRunner = new ClaudeLoginRunner({ logInfo, logError });
    host.ipcMain.handle('cli:login', (_event, args) => {
        const cli = isRecord(args) && typeof args.cli === 'string' ? args.cli : '';
        return loginRunner.login(cli);
    });
    host.ipcMain.handle('cli:loginStatus', (_event, args) => {
        const cli = isRecord(args) && typeof args.cli === 'string' ? args.cli : 'claude';
        if (cli !== 'claude')
            return { loggedIn: false };
        return { loggedIn: isClaudeCliLoggedIn() };
    });
    // Ref-counted por conexão: subscribe adquire, unsubscribe libera. Reload/navegação
    // do renderer nunca manda o release — sem o amarre ao ws.on('close') (equivalente WS
    // do 'destroyed'/'did-navigate' do Electron), o poll de 2s vazaria pra sempre.
    const loginWatchRefs = new Map();
    const watchedSenders = new WeakSet();
    const releaseSenderWatch = (sender) => {
        const refs = loginWatchRefs.get(sender) ?? 0;
        loginWatchRefs.delete(sender);
        for (let i = 0; i < refs; i += 1)
            loginWatcher.release();
    };
    host.ipcMain.handle('cli:loginWatch', (event, active) => {
        const sender = event.sender;
        if (active === true) {
            loginWatcher.acquire();
            loginWatchRefs.set(sender, (loginWatchRefs.get(sender) ?? 0) + 1);
            const ws = sender;
            if (ws && typeof ws.on === 'function' && isRecord(ws) && !watchedSenders.has(ws)) {
                watchedSenders.add(ws);
                ws.on('close', () => releaseSenderWatch(sender));
            }
            return;
        }
        const refs = loginWatchRefs.get(sender) ?? 0;
        if (refs <= 0)
            return;
        if (refs === 1)
            loginWatchRefs.delete(sender);
        else
            loginWatchRefs.set(sender, refs - 1);
        loginWatcher.release();
    });
    host.ipcMain.handle('onboarding:getState', () => configStore.getOnboarding());
    host.ipcMain.handle('onboarding:setState', (_event, patch) => {
        const next = configStore.setOnboarding(isRecord(patch) ? patch : {});
        if (next.completed || next.skipped) {
            // firstRun é consumível: concluir OU pular o wizard consome a flag.
            configStore.set({ firstRun: false });
            loginWatcher.stop();
        }
        return next;
    });
    host.ipcMain.handle('onboarding:createDefaultWorkspace', async () => {
        try {
            const fs = await import('node:fs/promises');
            const base = join(homedir(), 'Overclock');
            const name = 'Meu Primeiro Projeto';
            // Retomada pós-restart: se o wizard já criou um espaço default antes
            // (lastWorkspacePath sob ~/Overclock, ainda em disco), reusa em vez de
            // incrementar "Meu Primeiro Projeto 2..3" a cada retomada.
            const config = configStore.get();
            const last = typeof config.lastWorkspacePath === 'string' ? config.lastWorkspacePath : null;
            if (last && last.startsWith(base + sep)) {
                try {
                    await fs.access(last);
                    await seedWorkspaceTrust(last);
                    logInfo(`default workspace reused at ${last}`);
                    return { ok: true, path: last };
                }
                catch {
                    // Pasta sumiu — segue pro fluxo de criação.
                }
            }
            let target = join(base, name);
            for (let i = 2; i <= 99; i += 1) {
                try {
                    await fs.access(target);
                    target = join(base, `${name} ${i}`);
                }
                catch {
                    break;
                }
            }
            await fs.mkdir(target, { recursive: true });
            configStore.set({ lastWorkspacePath: target });
            await seedWorkspaceTrust(target);
            logInfo(`default workspace created at ${target}`);
            return { ok: true, path: target };
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            logError('createDefaultWorkspace failed:', msg);
            return { ok: false, error: 'Não consegui criar a pasta do seu espaço de trabalho. Verifique se o disco não está cheio e tente de novo.' };
        }
    });
    return {
        dispose: () => {
            loginWatcher.stop();
        },
    };
}
//# sourceMappingURL=wireOnboarding.js.map