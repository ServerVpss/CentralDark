import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { execFile } from 'child_process';

interface TerminalSpec {
  name: string;
  shell?: string;
  cwd?: string;
  command?: string | null;
}

interface EditorSpec {
  label: string;
  kind: string;
  target: string | null;
}

interface WorkspaceMap {
  versao: string;
  extensoes_instaladas: string[];
  terminais: TerminalSpec[];
  editores: EditorSpec[];
}

let restoredThisSession = false;

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('centraldark.restoreWorkspace', () => restore(context, true)),
    vscode.commands.registerCommand('centraldark.mapWorkspace', () => mapNativeWorkspace(context)),
    vscode.commands.registerCommand('centraldark.zendriveCli', focusExistingCliTerminal),
    // Acessibilidade: rótulo literal VS Code para ditado/ASR; mesma implementação, nenhum novo executor.
    vscode.commands.registerCommand('centraldark.focusExistingTerminal', focusExistingCliTerminal),
    vscode.commands.registerCommand('centraldark.probeVpsSsh', () => probeVpsSsh(false)),
    vscode.commands.registerCommand('centraldark.connectVpsSsh', () => probeVpsSsh(true))
  );
  registerTerminalTelemetry(context);
  const onOpen = vscode.workspace.getConfiguration('centraldark.restore').get<boolean>('onOpen', false);
  if (onOpen) {
    void restore(context, false);
  }
}

export function deactivate(): void {}

/**
 * Entrada ZENDRIVE CLI = foco no terminal JA existente, nunca um segundo Hermes.
 * ChatGPT/SOL e uma superficie de coordenacao; nao inventar autenticacao/API.
 * Telemetria so de ciclo/resultado, sem ler comando, saida ou conversas.
 */
const terminalLogPath = 'K:\\TEMP\\logs\\LOGS-VS-CODE.log';
type TerminalEvent = 'cli_focus' | 'shell_start' | 'shell_end' | 'shell_integration';

function emitTerminalMetadata(event: TerminalEvent, exitCode?: number): void {
  if (process.platform !== 'win32') { return; }
  const enabled = vscode.workspace.getConfiguration('centraldark.restore')
    .get<boolean>('terminalTelemetry', true);
  if (!enabled || !fs.existsSync(terminalLogPath)) { return; }
  const exit = typeof exitCode === 'number' ? (exitCode === 0 ? 'ok' : 'nonzero') : 'unknown';
  const line = `[INFO] [terminal] centraldark.zendrive_cli event=${event} exit=${exit} utc=${new Date().toISOString()}\n`;
  try {
    fs.appendFileSync(terminalLogPath, line, { encoding: 'utf8', flag: 'a' });
  } catch {
    // Telemetria opcional nunca bloqueia a bancada nem altera o terminal.
  }
}

function registerTerminalTelemetry(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.window.onDidStartTerminalShellExecution(() => emitTerminalMetadata('shell_start')),
    vscode.window.onDidEndTerminalShellExecution(event =>
      emitTerminalMetadata('shell_end', event.exitCode)),
    vscode.window.onDidChangeTerminalShellIntegration(() =>
      emitTerminalMetadata('shell_integration'))
  );
}

function focusExistingCliTerminal(): void {
  const terminals = vscode.window.terminals;
  const terminal = vscode.window.activeTerminal ??
    terminals.find(item => /hermes|bash|pwsh|powershell/i.test(item.name));
  if (!terminal) {
    void vscode.window.showWarningMessage(
      'ZENDRIVE CLI: nenhum terminal existente. Nao foi criado outro Hermes.');
    return;
  }
  terminal.show(false);
  emitTerminalMetadata('cli_focus');
  void vscode.window.showInformationMessage(
    'ZENDRIVE CLI: terminal existente em foco. SOL coordena; Hermes executa. ' +
    'A sessao ChatGPT/API nao e criada por este comando.');
}



/**
 * Rota propria ZENDRIVE (sem Desktop Commander):
 * mesma identidade SSH configurada na Casa, Tailscale primeiro e fallback
 * publico apenas se o privado falhar. Sem escrita, chave copiada ou daemon novo.
 * "Conectar" usa o picker oficial da extensao VS Code Remote-SSH.
 */
const VPS_SSH_ALIAS = 'segredo-vpss';
const VPS_ROUTES = [
  {
    name: 'TAILSCALE',
    options: ['-o', 'HostName=100.90.199.124', '-o', 'HostKeyAlias=89.117.78.124']
  },
  { name: 'PUBLIC_FALLBACK', options: [] }
] as const;

function sshExecutable(): string {
  if (process.platform === 'win32') {
    const gitSsh = path.join(process.env.ProgramFiles || 'C:\\Program Files', 'Git', 'usr', 'bin', 'ssh.exe');
    if (fs.existsSync(gitSsh)) { return gitSsh; }
  }
  return 'ssh';
}

function checkSshRoute(binary: string, options: readonly string[]): Promise<{ ok: boolean; status: string; host?: string }> {
  const args = [
    '-o', 'BatchMode=yes',
    '-o', 'StrictHostKeyChecking=yes',
    '-o', 'ConnectTimeout=6',
    '-o', 'NumberOfPasswordPrompts=0',
    ...options,
    VPS_SSH_ALIAS,
    "printf 'CENTRALDARK_SSH_PASS\\n'; hostname"
  ];
  return new Promise(resolve => {
    execFile(binary, args, { timeout: 12000, windowsHide: true, maxBuffer: 8192 }, (error, stdout) => {
      if (error) {
        const code = (error as NodeJS.ErrnoException).code || 'SSH_FAILED';
        resolve({ ok: false, status: String(code).slice(0, 50) });
        return;
      }
      const lines = stdout.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
      const marker = lines.indexOf('CENTRALDARK_SSH_PASS');
      const host = marker >= 0 ? lines[marker + 1] : undefined;
      if (host && /^[a-zA-Z0-9.-]{1,100}$/.test(host)) {
        resolve({ ok: true, status: 'SSH_AUTHENTICATED', host });
      } else {
        resolve({ ok: false, status: 'SSH_READBACK_MISSING' });
      }
    });
  });
}

async function probeVpsSsh(connectAfter: boolean): Promise<void> {
  const output = vscode.window.createOutputChannel('CentralDark — SSH Casa/VPS');
  output.appendLine('[INFO] ZENDRIVE SSH: teste de leitura, sem Desktop Commander.');
  output.appendLine('[INFO] Alias existente: segredo-vpss; host key estrita; nenhuma configuracao alterada.');
  const binary = sshExecutable();
  let succeeded: string | null = null;
  for (const route of VPS_ROUTES) {
    output.appendLine('[TESTE] ' + route.name);
    const result = await checkSshRoute(binary, route.options);
    output.appendLine(result.ok
      ? '[OK] ' + route.name + ' | host=' + result.host
      : '[AVISO] ' + route.name + ' | ' + result.status);
    if (result.ok) {
      succeeded = route.name;
      break;
    }
  }
  output.show(true);
  if (!succeeded) {
    void vscode.window.showWarningMessage('CentralDark: SSH indisponivel nas rotas atuais. Veja a saida CentralDark — SSH Casa/VPS.');
    return;
  }
  if (!connectAfter) {
    void vscode.window.showInformationMessage('CentralDark: teste SSH PASS pela rota ' + succeeded + '.');
    return;
  }
  const commands = await vscode.commands.getCommands(true);
  if (!commands.includes('remote-ssh.connectToHost')) {
    void vscode.window.showWarningMessage('CentralDark: instale/ative a extensao oficial Remote - SSH e use o alias segredo-vpss.');
    return;
  }
  // O picker respeita o alias SSH do usuario. O teste Tailscale nao reescreve
  // o config SSH e nao altera implicitamente a rota usada pelo Remote-SSH.
  await vscode.commands.executeCommand('remote-ssh.connectToHost');
}


function loadMap(context: vscode.ExtensionContext): WorkspaceMap | undefined {
  const mapPath = path.join(context.extensionPath, 'workspace-map-20261014.json');
  if (!fs.existsSync(mapPath)) {
    void vscode.window.showWarningMessage('CentralDark: mapa nao encontrado em ' + mapPath);
    return undefined;
  }
  return JSON.parse(fs.readFileSync(mapPath, 'utf8')) as WorkspaceMap;
}

async function restore(context: vscode.ExtensionContext, manual: boolean): Promise<void> {
  if (restoredThisSession && !manual) {
    return;
  }
  restoredThisSession = true;

  const map = loadMap(context);
  if (!map) {
    return;
  }

  const startAgents = vscode.workspace.getConfiguration('centraldark.restore').get<boolean>('startAgents', false);
  const problems: string[] = [];

  const missing = map.extensoes_instaladas.filter(id => !vscode.extensions.getExtension(id));
  if (missing.length > 0) {
    problems.push('Extensoes ausentes (nao sao instaladas pelo plugin): ' + missing.join(', '));
  }

  for (const t of map.terminais) {
    try {
      const terminal = vscode.window.createTerminal({
        name: t.name,
        shellPath: t.shell,
        cwd: t.cwd
      });
      if (startAgents && t.command) {
        terminal.sendText(t.command, true);
      }
    } catch (err) {
      problems.push('Terminal ' + t.name + ': ' + String(err));
    }
  }

  for (const e of map.editores) {
    if (!e.target) {
      problems.push('Sem URL/arquivo no mapa: ' + e.label);
      continue;
    }
    try {
      if (e.kind === 'file') {
        const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(e.target));
        await vscode.window.showTextDocument(doc, { preview: false, preserveFocus: true });
      } else {
        await vscode.commands.executeCommand('simpleBrowser.show', e.target);
      }
    } catch (err) {
      problems.push('Aba ' + e.label + ': ' + String(err));
    }
  }

  const resumo = 'CentralDark: bancada restaurada (mapa ' + map.versao + ').';
  if (problems.length > 0) {
    void vscode.window.showWarningMessage(resumo + '\n' + problems.join('\n'));
  } else {
    void vscode.window.showInformationMessage(resumo);
  }
}


/**
 * Leitura nativa do VS Code, sem invocar comandos de terceiros.
 * Nao confundir comandos enumerados com botoes clicados ou acoes aprovadas.
 */
async function mapNativeWorkspace(context: vscode.ExtensionContext): Promise<void> {
  const commands = (await vscode.commands.getCommands(true)).sort();
  const terminals = await Promise.all(vscode.window.terminals.map(async (terminal) => ({
    name: terminal.name,
    pid: (await terminal.processId) ?? null,
    observed: true,
    effect_proof: 'UNKNOWN'
  })));
  const tabs = vscode.window.tabGroups.all.flatMap((group, groupIndex) =>
    group.tabs.map((tab) => ({
      group: groupIndex,
      label: tab.label.slice(0, 160),
      active: tab.isActive,
      pinned: tab.isPinned
    }))
  );
  const extensions = vscode.extensions.all
    .map((extension) => ({
      id: extension.id,
      version: String(extension.packageJSON?.version ?? ''),
      active: extension.isActive
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
  const snapshot = {
    captured_utc: new Date().toISOString(),
    owner: 'skills/vs-code-restore',
    source: 'VS Code Extension API — observacao read-only',
    workspace_folders: (vscode.workspace.workspaceFolders ?? []).map(folder => folder.name),
    commands,
    tabs,
    terminals,
    extensions,
    constraints: [
      'Comando enumerado nao significa acao executada',
      'Extensao instalada nao significa funcionando',
      'Botao nativo sem API requer Windows UIAutomation',
      'UNKNOWN != PASS; READBACK antes de acionar'
    ]
  };
  try {
    await vscode.workspace.fs.createDirectory(context.globalStorageUri);
    const target = vscode.Uri.joinPath(context.globalStorageUri, 'vscode-native-map.json');
    await vscode.workspace.fs.writeFile(target, Buffer.from(JSON.stringify(snapshot, null, 2), 'utf8'));
    const document = await vscode.workspace.openTextDocument(target);
    await vscode.window.showTextDocument(document, { preview: false, preserveFocus: false });
    void vscode.window.showInformationMessage(
      'CentralDark: mapa salvo — ' + commands.length + ' comandos, ' +
      terminals.length + ' terminais, ' + extensions.length + ' extensoes.'
    );
  } catch (error) {
    void vscode.window.showErrorMessage('CentralDark: mapa nao persistido: ' + String(error));
    throw error;
  }
}
