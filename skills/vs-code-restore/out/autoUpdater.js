"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkVsCodeUpdates = checkVsCodeUpdates;
exports.registerVsCodeAutoUpdate = registerVsCodeAutoUpdate;
// CentralDark: updater autonomo via mesma API GitHub Releases do Obsidian.
// A chave GitHub continua na VPS. SSH usa host key estrita e nunca pede senha.
const vscode = require("vscode");
const fs = require("node:fs");
const path = require("node:path");
const node_crypto_1 = require("node:crypto");
const node_child_process_1 = require("node:child_process");
const REPO = 'ServerVpss/CentralDark';
const TAG = 'centraldark-vscode-v';
let inProgress = false;
function args(route) {
    const file = vscode.workspace.getConfiguration('remote.SSH').get('configFile');
    const configArgs = file && fs.existsSync(file) ? ['-F', file] : [];
    return ['-o', 'BatchMode=yes', '-o', 'StrictHostKeyChecking=yes', '-o', 'ConnectTimeout=8',
        '-o', 'NumberOfPasswordPrompts=0', ...configArgs, ...route.options, route.alias];
}
function semver(a, b) {
    const aa = a.split('.').map(Number), bb = b.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
        if (aa[i] !== bb[i])
            return aa[i] > bb[i] ? 1 : -1;
    }
    return 0;
}
function sshRead(ssh, route, remote, binary = false) {
    return new Promise((resolve, reject) => {
        (0, node_child_process_1.execFile)(ssh(), [...args(route), ...remote], {
            encoding: 'buffer', windowsHide: true, timeout: binary ? 120000 : 22000,
            maxBuffer: binary ? 25 * 1024 * 1024 : 2 * 1024 * 1024
        }, (err, stdout) => {
            if (err) {
                reject(Error('SSH_OR_GITHUB_API_FAILED'));
                return;
            }
            resolve(Buffer.isBuffer(stdout) ? stdout : Buffer.from(stdout));
        });
    });
}
async function releases(ssh, routes) {
    let problem = 'API_UNAVAILABLE';
    for (const route of routes) {
        try {
            const bytes = await sshRead(ssh, route, ['gh', 'api',
                'repos/' + REPO + '/releases?per_page=25']);
            const data = JSON.parse(bytes.toString('utf8'));
            if (!Array.isArray(data))
                throw Error('INVALID_GITHUB_RESPONSE');
            return { route, data: data };
        }
        catch (e) {
            problem = e instanceof Error ? e.message : 'API_FAILED';
        }
    }
    throw Error(problem);
}
function pick(all, current) {
    const valid = /^\d+\.\d+\.\d+$/;
    if (!valid.test(current))
        return null;
    const ordered = all.filter(r => r && !r.draft && !r.prerelease &&
        typeof r.tag_name === 'string' && r.tag_name.startsWith(TAG) &&
        valid.test(r.tag_name.slice(TAG.length)) && semver(r.tag_name.slice(TAG.length), current) > 0)
        .sort((a, b) => semver(b.tag_name.slice(TAG.length), a.tag_name.slice(TAG.length)));
    for (const r of ordered) {
        const v = r.tag_name.slice(TAG.length);
        const filename = 'centraldark-vscode-restore-' + v + '.vsix';
        const asset = r.assets?.find(a => a.name === filename);
        if (asset && typeof asset.digest === 'string' && /^sha256:[0-9a-f]{64}$/i.test(asset.digest) &&
            Number.isInteger(asset.size) && asset.size > 1000 && asset.size <= 25 * 1024 * 1024)
            return { release: r, version: v, filename, asset };
    }
    return null;
}
async function installVsix(file) {
    // Workbench command officially supports a VSIX file URI; it installs
    // into the currently running VS Code, including the correct profile.
    // Do not guess the editor CLI path or create another installation.
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
        throw Error('VERIFIED_VSIX_NOT_FOUND');
    }
    const commands = await vscode.commands.getCommands(true);
    if (!commands.includes('workbench.extensions.installExtension')) {
        throw Error('VSCODE_NATIVE_INSTALL_UNAVAILABLE');
    }
    await vscode.commands.executeCommand('workbench.extensions.installExtension', vscode.Uri.file(file));
}
async function checkVsCodeUpdates(context, ssh, routes, manual = false) {
    if (inProgress)
        return;
    if (process.platform !== 'win32') {
        if (manual)
            void vscode.window.showWarningMessage('Atualizacao integrada disponivel na Casa Windows.');
        return;
    }
    if (!manual && !vscode.workspace.getConfiguration('centraldark.restore').get('autoUpdate', true))
        return;
    inProgress = true;
    try {
        const local = String(context.extension.packageJSON.version || '0.0.0');
        const { route, data } = await releases(ssh, routes);
        const found = pick(data, local);
        if (!found) {
            if (manual)
                void vscode.window.showInformationMessage('CentralDark: v' + local + ' atualizada.');
            return;
        }
        if (!manual && context.globalState.get('centraldark.update.deferred') === found.release.tag_name)
            return;
        const notes = String(found.release.body || '').slice(0, 900);
        const approval = await vscode.window.showInformationMessage('CentralDark · Vibe Coding ' + local + ' → ' + found.version +
            '. Baixar e instalar com verificacao SHA-256?\n' + notes, { modal: true }, 'Instalar', 'Depois');
        if (approval !== 'Instalar') {
            await context.globalState.update('centraldark.update.deferred', found.release.tag_name);
            return;
        }
        await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification,
            title: 'CentralDark: atualizando ' + found.version, cancellable: false }, async () => {
            const storage = context.globalStorageUri.fsPath;
            fs.mkdirSync(storage, { recursive: true, mode: 0o700 });
            const file = path.join(storage, found.filename);
            const required = found.asset.digest.slice(7).toLowerCase();
            const cached = fs.existsSync(file) ? fs.readFileSync(file) : null;
            let buffer = cached && cached.length === found.asset.size &&
                (0, node_crypto_1.createHash)('sha256').update(cached).digest('hex') === required ? cached : null;
            if (!buffer) {
                buffer = await sshRead(ssh, route, ['gh', 'release', 'download',
                    found.release.tag_name, '--repo', REPO, '--pattern', found.filename,
                    '--output', '-'], true);
                if (buffer.length !== found.asset.size ||
                    (0, node_crypto_1.createHash)('sha256').update(buffer).digest('hex') !== required)
                    throw Error('VSIX_SHA256_MISMATCH');
                fs.writeFileSync(file, buffer, { mode: 0o600 });
            }
            await installVsix(file);
        });
        await context.globalState.update('centraldark.update.deferred', found.release.tag_name);
        const action = await vscode.window.showInformationMessage('CentralDark v' + found.version + ' instalada. Recarregar o VS Code?', 'Recarregar', 'Depois');
        if (action === 'Recarregar')
            await vscode.commands.executeCommand('workbench.action.reloadWindow');
    }
    catch (e) {
        if (manual)
            void vscode.window.showWarningMessage('CentralDark update indisponivel: ' +
                (e instanceof Error ? e.message : 'UNKNOWN'));
    }
    finally {
        inProgress = false;
    }
}
function registerVsCodeAutoUpdate(context, ssh, routes) {
    let timer, starter;
    const schedule = () => {
        if (timer)
            clearInterval(timer);
        if (starter)
            clearTimeout(starter);
        const cfg = vscode.workspace.getConfiguration('centraldark.restore');
        if (!cfg.get('autoUpdate', true))
            return;
        const minutes = Math.min(1440, Math.max(5, cfg.get('autoUpdateIntervalMinutes', 10)));
        starter = setTimeout(() => { void checkVsCodeUpdates(context, ssh, routes); }, 30000);
        timer = setInterval(() => { void checkVsCodeUpdates(context, ssh, routes); }, minutes * 60000);
    };
    schedule();
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('centraldark.restore.autoUpdate') ||
            e.affectsConfiguration('centraldark.restore.autoUpdateIntervalMinutes'))
            schedule();
    }));
    context.subscriptions.push({ dispose() {
            if (timer)
                clearInterval(timer);
            if (starter)
                clearTimeout(starter);
        } });
}
//# sourceMappingURL=autoUpdater.js.map