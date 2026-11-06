import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { execFile } from 'child_process';
import { startRemoteTerminal, configureRemoteTerminal, remoteTerminalStatus } from './remote-terminal';
import { CentralDarkVibeProvider, openCentralDarkVibe, runNaturalCentralDarkCommand } from './vibe-panel';
import { randomBytes } from 'crypto';
import { registerVsCodeAutoUpdate, checkVsCodeUpdates } from './autoUpdater';
import { startRemoteTerminal, configureRemoteTerminal, remoteTerminalStatus } from './remote-terminal';

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
let traceOutput: vscode.OutputChannel | undefined;

function emitTrace(
  event: 'activate' | 'cli_focus' | 'shell_start' | 'shell_end' | 'shell_integration' | 'workspace_map' | 'restore' | 'show_trace',
  state: 'OBSERVED' | 'PASS' | 'ATTENTION' | 'UNKNOWN' = 'OBSERVED'
): void {
  traceOutput?.appendLine(`${new Date().toISOString()} event=${event} state=${state}`);
}

export function activate(context: vscode.ExtensionContext): void {
  traceOutput = vscode.window.createOutputChannel('CentralDark Trace');
  context.subscriptions.push(traceOutput);
  emitTrace('activate', 'PASS');
  const vibeProvider = new CentralDarkVibeProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('centraldark.vibeCoding', vibeProvider)
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('centraldark.restoreWorkspace', () => restore(context, true)),
    vscode.commands.registerCommand('centraldark.mapWorkspace', () => mapNativeWorkspace(context)),
    vscode.commands.registerCommand('centraldark.zendriveCli', focusExistingCliTerminal),
    // Acessibilidade: rótulo literal VS Code para ditado/ASR; mesma implementação, nenhum novo executor.
    vscode.commands.registerCommand('centraldark.focusExistingTerminal', focusExistingCliTerminal),
    vscode.commands.registerCommand('centraldark.probeVpsSsh', () => probeVpsSsh(false)),
    vscode.commands.registerCommand('centraldark.connectVpsSsh', () => probeVpsSsh(true)),
    vscode.commands.registerCommand('centraldark.locateVsCodeByPid', locateVsCodeByPid),
    vscode.commands.registerCommand('centraldark.pairVsCode', () => pairVsCode(context)),
    vscode.commands.registerCommand('centraldark.verifyVsCodePairing', () => verifyVsCodePairing(context)),
    vscode.commands.registerCommand('centraldark.checkUpdates', () => checkVsCodeUpdates(context, sshExecutable, VPS_ROUTES, true)),
    vscode.commands.registerCommand('centraldark.remoteTerminalPair', () => configureRemoteTerminal(context)),
    vscode.commands.registerCommand('centraldark.remoteTerminalStatus', () => remoteTerminalStatus(context)),
    vscode.commands.registerCommand('centraldark.browserSurfacesCatalog', browserSurfacesCatalog),
    vscode.commands.registerCommand('centraldark.buildExtension', buildExtension),
    vscode.commands.registerCommand('centraldark.prepareAll', () => prepareAll(context)),
    vscode.commands.registerCommand('centraldark.openVibeCoding', openCentralDarkVibe),
    vscode.commands.registerCommand('centraldark.naturalCommand', () => runNaturalCentralDarkCommand()),
    vscode.commands.registerCommand('centraldark.showTrace', () => {
      emitTrace('show_trace', 'PASS');
      traceOutput?.show(true);
    })
  );
  const vibeStatus = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  vibeStatus.text = '$(sparkle) CentralDark';
  vibeStatus.tooltip = 'Abrir CentralDark · Vibe Coding';
  vibeStatus.command = 'centraldark.openVibeCoding';
  vibeStatus.show();
  context.subscriptions.push(vibeStatus);
  registerTerminalTelemetry(context);
  void startRemoteTerminal(context);
  registerVsCodeAutoUpdate(context, sshExecutable, VPS_ROUTES);
  context.subscriptions.push(vscode.window.registerWebviewViewProvider('centraldarkVibeCoding', new CentralDarkVibeViewProvider(context)));
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
  emitTrace(event, typeof exitCode === 'number' ? (exitCode === 0 ? 'PASS' : 'ATTENTION') : 'UNKNOWN');
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
const VPS_ROUTES = [
  { name: 'TAILSCALE', alias: 'Segredo-VPS', options: [] },
  { name: 'PUBLIC_FALLBACK', alias: 'segredo-vpss', options: [] }
] as const;

function sshExecutable(): string {
  // Usar preferencialmente o MESMO ssh.exe selecionado pelo Remote-SSH
  // que já está conectado à VPS, em vez de forçar Git SSH primeiro.
  const preferred = vscode.workspace.getConfiguration('remote.SSH').get<string>('path');
  if (preferred && fs.existsSync(preferred)) { return preferred; }
  if (process.platform === 'win32') {
    const winSsh = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'OpenSSH', 'ssh.exe');
    if (fs.existsSync(winSsh)) { return winSsh; }
    const gitSsh = path.join(process.env.ProgramFiles || 'C:\\Program Files', 'Git', 'usr', 'bin', 'ssh.exe');
    if (fs.existsSync(gitSsh)) { return gitSsh; }
  }
  return 'ssh';
}

function remoteSshConfigOptions(): string[] {
  // Remote-SSH pode usar um ~/.ssh/config personalizado. Respeitar o
  // mesmo arquivo ja aprovado pelo usuario, sem criar segunda identidade.
  const configured = vscode.workspace.getConfiguration('remote.SSH').get<string>('configFile');
  return configured && fs.existsSync(configured) ? ['-F', configured] : [];
}

function checkSshRoute(binary: string, alias: string, options: readonly string[]): Promise<{ ok: boolean; status: string; host?: string }> {
  const args = [
    '-o', 'BatchMode=yes',
    '-o', 'StrictHostKeyChecking=yes',
    '-o', 'ConnectTimeout=6',
    '-o', 'NumberOfPasswordPrompts=0',
    ...remoteSshConfigOptions(),
    ...options,
    alias,
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
  output.appendLine('[INFO] Primeiro Segredo-VPS pela VPN; fallback segredo-vpss publico. Host key estrita; config inalterado.');
  const binary = sshExecutable();
  let succeeded: (typeof VPS_ROUTES)[number] | null = null;
  for (const route of VPS_ROUTES) {
    output.appendLine('[TESTE] ' + route.name);
    const result = await checkSshRoute(binary, route.alias, route.options);
    output.appendLine(result.ok
      ? '[OK] ' + route.name + ' | host=' + result.host
      : '[AVISO] ' + route.name + ' | ' + result.status);
    if (result.ok) {
      succeeded = route;
      break;
    }
  }
  output.show(true);
  if (!succeeded) {
    void vscode.window.showWarningMessage('CentralDark: SSH indisponivel nas rotas atuais. Veja a saida CentralDark — SSH Casa/VPS.');
    return;
  }
  if (!connectAfter) {
    void vscode.window.showInformationMessage(
      'CentralDark: teste SSH PASS pela rota ' + succeeded.name + ' (' + succeeded.alias + ').');
    return;
  }
  const remoteSsh = vscode.extensions.getExtension('ms-vscode-remote.remote-ssh');
  if (!remoteSsh) {
    void vscode.window.showWarningMessage(
      'CentralDark: dependencia Remote - SSH ausente (ms-vscode-remote.remote-ssh).');
    return;
  }
  if (!remoteSsh.isActive) {
    await remoteSsh.activate();
  }
  const commands = await vscode.commands.getCommands(true);
  const openCommand = commands.includes('opensshremotes.openEmptyWindow')
    ? 'opensshremotes.openEmptyWindow'
    : commands.includes('opensshremotes.openEmptyWindowInCurrentWindow')
      ? 'opensshremotes.openEmptyWindowInCurrentWindow'
      : null;
  if (!openCommand) {
    void vscode.window.showWarningMessage(
      'CentralDark: Remote - SSH ativo, mas a API de conexao esperada nao foi exposta.');
    return;
  }
  // Usa exatamente o alias que acabou de passar no probe. Nao abre picker,
  // nao corrige nome por heuristica e nao cria Host/IdentityFile paralelo.
  output.appendLine('[CONECTAR] alias comprovado=' + succeeded.alias + ' | comando=' + openCommand);
  await vscode.commands.executeCommand(openCommand, { host: succeeded.alias });
}



/**
 * Localizacao read-only de VS Code existente a partir de PID de PowerShell,
 * extension host ou processo do proprio Code.exe. No Windows mostra a arvore
 * de pais e janelas, nao inicia/focaliza outro VS Code e nao le arquivos.
 */
async function locateVsCodeByPid(): Promise<void> {
  const pidText = await vscode.window.showInputBox({
    title: 'CentralDark — localizar VS Code por PID',
    prompt: 'PID opcional (PowerShell/terminal/Code.exe). Deixe vazio para listar janelas abertas.',
    placeHolder: 'Ex.: 21172',
    validateInput: value => (!value || /^[1-9][0-9]{0,9}$/.test(value))
      ? undefined : 'Informe apenas um PID decimal ou deixe vazio.'
  });
  if (pidText === undefined) { return; }
  const output = vscode.window.createOutputChannel('CentralDark — Rastreio PID/VS Code');
  output.clear();
  output.appendLine('ZENDRIVE | VS Code observado via Extension API + Windows');
  output.appendLine('Capturado UTC: ' + new Date().toISOString());
  output.appendLine('ExtensionHost PID: ' + process.pid);
  output.appendLine('VS Code remoteName: ' + (vscode.env.remoteName || 'local'));
  output.appendLine('Workspace(s): ' + (vscode.workspace.workspaceFolders ?? []).map(x => x.name).join(', '));
  for (const t of vscode.window.terminals) {
    output.appendLine('Terminal: ' + t.name + ' | PID=' + (await t.processId ?? 'UNKNOWN'));
  }
  if (process.platform !== 'win32') {
    output.appendLine('[SEM CONSULTA WIN32] O inventario nativo acima continua disponivel.');
    output.show(true);
    return;
  }
  // Codigo literal fixo, sem interpolacao de entrada de shell:
  // PID decimal segue separado em argumento do PowerShell.
  const script = [
    '$ErrorActionPreference="Stop"',
    '$wanted=' + (pidText ? Number(pidText) : 0),
    '$all=@(Get-CimInstance Win32_Process -ErrorAction Stop)',
    '$index=@{}',
    'foreach($p in $all){$index[[int]$p.ProcessId]=$p}',
    '$window=@(Get-Process Code -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | ForEach-Object { [pscustomobject]@{pid=$_.Id;process="Code.exe";windowPresent=$true} })',
    '$chain=@()',
    'if($wanted -gt 0){ $cursor=$wanted; $seen=@{}; for($i=0;$i -lt 20;$i++){',
    'if($seen.ContainsKey($cursor) -or -not $index.ContainsKey($cursor)){break}',
    '$seen[$cursor]=$true; $p=$index[$cursor]',
    '$chain+= [pscustomobject]@{pid=[int]$p.ProcessId;parentPid=[int]$p.ParentProcessId;process=$p.Name}',
    'if($p.Name -ieq "Code.exe"){break}',
    '$cursor=[int]$p.ParentProcessId',
    '}}',
    '$codeCount=@($all | Where-Object {$_.Name -ieq "Code.exe"}).Count',
    '[pscustomobject]@{requestedPid=$wanted;codeProcessCount=$codeCount;windows=$window;parentChain=$chain} | ConvertTo-Json -Depth 6 -Compress'
  ].join('; ');
  await new Promise<void>(resolve => {
    execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], {
      timeout: 10000, maxBuffer: 65536, windowsHide: true
    }, (error, stdout) => {
      if (error) {
        output.appendLine('[ERRO] Localizacao Win32 indisponivel: ' + String((error as NodeJS.ErrnoException).code ?? 'QUERY_FAILED'));
        output.show(true);
        resolve();
        return;
      }
      try {
        const data = JSON.parse(stdout);
        output.appendLine('Processos Code.exe: ' + Number(data.codeProcessCount || 0));
        for (const w of (Array.isArray(data.windows) ? data.windows : data.windows ? [data.windows] : [])) {
          output.appendLine('Janela VS Code: PID=' + w.pid + ' | windowPresent=' + Boolean(w.windowPresent));
        }
        for (const p of (Array.isArray(data.parentChain) ? data.parentChain : data.parentChain ? [data.parentChain] : [])) {
          output.appendLine('Cadeia: PID=' + p.pid + ' | pai=' + p.parentPid + ' | exe=' + p.process);
        }
        const chain = Array.isArray(data.parentChain) ? data.parentChain : data.parentChain ? [data.parentChain] : [];
        output.appendLine(chain.some((p: {process: string}) => p.process?.toLowerCase() === 'code.exe')
          ? '[VINCULO] PID tem ancestral Code.exe.' : '[VINCULO] Sem Code.exe ancestral demonstrado para esse PID.');
      } catch {
        output.appendLine('[ERRO] O Windows nao retornou JSON valido. Nenhum PID foi presumido.');
      }
      output.show(true);
      resolve();
    });
  });
}

/** Catalogo da ponte do navegador, sem confundir plugin ChatGPT com API da extensao. */
function browserSurfacesCatalog(): void {
  const out = vscode.window.createOutputChannel('CentralDark — Catalogo Browser/ZENDRIVE');
  out.clear();
  out.appendLine('CAPACIDADES EXISTENTES, sem criar novo conector');
  out.appendLine('VS Code API: tabs, terminais, comandos, extension host e workspace (local).');
  out.appendLine('ZENDRIVE: terminal existente, SSH e localizador PID/VS Code.');
  out.appendLine('ChatGPT Browser conectado: list_tabs + get_tab_context (leitura no cliente autorizado).');
  out.appendLine('CONTROLE de aba/clique pelo plugin nesta sessao: NAO EXPOSTO.');
  out.appendLine('Ponte ChatGPT Browser -> extensao VS Code: AINDA NAO IMPLEMENTADA.');
  out.appendLine('Owner MCP: apps/modulos/mcp/src/tools/core/mcp-admin.js');
  out.appendLine('Owner VS Code: skills/vs-code-restore/src/extension.ts');
  out.show(true);
}


function extensionOwnerPath(): string | undefined {
  for (const folder of vscode.workspace.workspaceFolders ?? []) {
    const root = folder.uri.fsPath;
    const direct = path.join(root, 'package.json');
    if (path.basename(root).toLowerCase() === 'vs-code-restore' && fs.existsSync(direct)) {
      return root;
    }
    const nested = path.join(root, 'skills', 'vs-code-restore');
    if (fs.existsSync(path.join(nested, 'package.json'))) {
      return nested;
    }
  }
  if (process.platform === 'win32') {
    const canonical = 'K:\\skills\\vs-code-restore';
    if (fs.existsSync(path.join(canonical, 'package.json'))) {
      return canonical;
    }
  }
  return undefined;
}

function runLogged(
  binary: string,
  args: string[],
  cwd: string,
  output: vscode.OutputChannel,
  stdin?: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    output.appendLine('> ' + binary + ' ' + args.join(' '));
    const child = execFile(binary, args, {
      cwd, windowsHide: true, maxBuffer: 1024 * 1024 * 8
    }, (error, stdout, stderr) => {
      if (stdout) output.append(stdout);
      if (stderr) output.append(stderr);
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
    child.stdout?.on('data', chunk => output.append(String(chunk)));
    child.stderr?.on('data', chunk => output.append(String(chunk)));
    if (stdin) {
      child.stdin?.end(stdin);
    }
  });
}

async function buildExtension(): Promise<void> {
  const owner = extensionOwnerPath();
  if (!owner) {
    void vscode.window.showWarningMessage(
      'CentralDark: abra o repositório que contém skills/vs-code-restore para compilar.'
    );
    return;
  }
  const output = vscode.window.createOutputChannel('CentralDark — Compilar extensão');
  output.clear();
  output.show(true);
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  try {
    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: 'CentralDark: testando e compilando a extensão…',
      cancellable: false
    }, async () => {
      await runLogged(npm, ['test'], owner, output);
      await runLogged(npm, ['run', 'compile'], owner, output);
      const pkg = JSON.parse(fs.readFileSync(path.join(owner, 'package.json'), 'utf8')) as { version?: string };
      const version = String(pkg.version || 'unknown');
      const vsix = path.join(owner, 'centraldark-vscode-restore-' + version + '.vsix');
      await runLogged(npx, [
        '--yes', '@vscode/vsce', 'package',
        '--no-dependencies',
        '--allow-missing-repository',
        '--out', vsix
      ], owner, output, 'y\n');
      output.appendLine('\n[OK] VSIX=' + vsix);
      void vscode.window.showInformationMessage('CentralDark: extensão ' + version + ' compilada e empacotada.');
    });
  } catch (error) {
    output.appendLine('\n[ERRO] ' + String(error));
    void vscode.window.showErrorMessage('CentralDark: compilação falhou. Veja “CentralDark — Compilar extensão”.');
  }
}


async function prepareAll(context: vscode.ExtensionContext): Promise<void> {
  const script = path.join(context.extensionPath, 'tools', 'centraldark-oneclick.ps1');
  if (!fs.existsSync(script)) {
    void vscode.window.showErrorMessage('CentralDark: bootstrap one-click nao encontrado no pacote instalado.');
    return;
  }
  if (process.platform !== 'win32') {
    void vscode.window.showWarningMessage('CentralDark: Preparar tudo foi definido para a Casa Windows.');
    return;
  }
  const output = vscode.window.createOutputChannel('CentralDark — Preparar tudo');
  output.clear();
  output.show(true);
  try {
    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: 'CentralDark: calibrando, compilando, instalando e conectando…',
      cancellable: false
    }, async () => {
      await runLogged(
        'pwsh.exe',
        ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', script],
        context.extensionPath,
        output
      );
    });
    void vscode.window.showInformationMessage(
      'CentralDark: preparação concluída. Uma janela nova carrega a versão instalada.'
    );
  } catch (error) {
    output.appendLine('\n[ERRO] ' + String(error));
    void vscode.window.showErrorMessage(
      'CentralDark: Preparar tudo falhou. Veja “CentralDark — Preparar tudo”.'
    );
  }
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
  emitTrace('restore', 'OBSERVED');
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
    // O mapa de 14/10 foi capturado na Casa Windows (cwd K:\\).
    // Nunca restaurar cwd/shell Windows dentro de um workspace SSH Linux.
    // Não criar sessões duplicadas quando o terminal já estiver aberto.
    if (vscode.window.terminals.some(current => current.name === t.name)) { continue; }
    const remoteWorkspace = Boolean(vscode.env.remoteName);
    const windowsMapped = /^[a-zA-Z]:[\\\\/]/.test(t.cwd || '') ||
      /^[a-zA-Z]:[\\\\/]/.test(t.shell || '');
    if (remoteWorkspace && windowsMapped) {
      problems.push('Terminal ' + t.name + ' preservado: mapa da Casa nao pode abrir em SSH remoto.');
      continue;
    }
    if (t.cwd && !fs.existsSync(t.cwd)) {
      problems.push('Terminal ' + t.name + ' ignorado: cwd nao existe neste ambiente.');
      continue;
    }
    if (t.shell && !fs.existsSync(t.shell)) {
      problems.push('Terminal ' + t.name + ' ignorado: executavel shell nao existe neste ambiente.');
      continue;
    }
    try {
      const terminal = vscode.window.createTerminal({
        name: t.name,
        ...(t.shell ? { shellPath: t.shell } : {}),
        ...(t.cwd ? { cwd: t.cwd } : {})
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
  emitTrace('restore', problems.length > 0 ? 'ATTENTION' : 'PASS');
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
    emitTrace('workspace_map', 'PASS');
    void vscode.window.showInformationMessage(
      'CentralDark: mapa salvo — ' + commands.length + ' comandos, ' +
      terminals.length + ' terminais, ' + extensions.length + ' extensoes.'
    );
  } catch (error) {
    emitTrace('workspace_map', 'ATTENTION');
    void vscode.window.showErrorMessage('CentralDark: mapa nao persistido: ' + String(error));
    throw error;
  }
}

/**
 * Pareamento por codigo confirmado no MESMO MCP OAuth 2.1.
 * Nao gera admin key e NAO auto-aprova o proprio dispositivo. A aprovacao
 * precisa vir do navegador autenticado do dono (cookie cd_admin existente).
 * O segredo de posse nao entra na URL, em logs, nem no Git.
 */
const DEVICE_TOKEN_KEY = 'centraldark.device.token';
const DEVICE_REFRESH_KEY = 'centraldark.device.refreshToken';
const DEVICE_ID_KEY = 'centraldark.device.id';
const MCP_DEVICE_BASE = 'https://mcp.centralldark.com/device';

type StartDevicePairing = {
  ok: boolean; pair_id: string; pair_secret: string;
  code: string; expires_at: string;
};
type DevicePairingStatus = {
  status: 'pending' | 'approved' | 'expired' | 'denied';
  token?: string; refresh_token?: string; device_id?: string;
};
type HeartbeatResult = {ok?: boolean; device_id?: string; error?: string};

async function postDevice<T>(route: string, data: object, token?: string): Promise<T> {
  const response = await fetch(MCP_DEVICE_BASE + route, {
    method: 'POST', redirect: 'error',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {})
    },
    body: JSON.stringify(data),
    signal: AbortSignal.timeout(12000)
  });
  const reply: unknown = await response.json();
  if (!response.ok || !reply || typeof reply !== 'object') {
    throw Error('MCP_PAIRING_HTTP_' + response.status);
  }
  return reply as T;
}

async function verifyDeviceToken(token: string): Promise<HeartbeatResult> {
  return postDevice<HeartbeatResult>('/heartbeat', {
    capabilities: {vscode: true, source: 'centraldark-vscode-restore'}
  }, token);
}

async function awaitDeviceApproval(
  request: StartDevicePairing, cancel: vscode.CancellationToken
): Promise<DevicePairingStatus> {
  const expiration = Date.parse(request.expires_at);
  if (!Number.isFinite(expiration)) throw Error('PAIRING_EXPIRATION_INVALID');
  // O servidor possui TTL de 2 min: nao prolongar autorizacao pelo cliente.
  while (Date.now() < expiration && !cancel.isCancellationRequested) {
    await new Promise<void>(resolve => setTimeout(resolve, 1800));
    if (cancel.isCancellationRequested) break;
    const result = await postDevice<DevicePairingStatus>('/pair/status', {
      id: request.pair_id,
      secret: request.pair_secret,
    });
    if (result.status === 'approved') return result;
    if (result.status === 'expired' || result.status === 'denied') {
      throw Error('PAIRING_' + result.status.toUpperCase());
    }
  }
  throw Error(cancel.isCancellationRequested ? 'PAIRING_CANCELLED' : 'PAIRING_EXPIRED');
}

async function pairVsCode(context: vscode.ExtensionContext): Promise<void> {
  const existingToken = await context.secrets.get(DEVICE_TOKEN_KEY);
  if (existingToken) {
    try {
      const current = await verifyDeviceToken(existingToken);
      if (current.ok && current.device_id) {
        await context.globalState.update(DEVICE_ID_KEY, current.device_id);
        void vscode.window.showInformationMessage(
          'CentralDark: VS Code ja pareado no MCP. ID: ' + current.device_id);
        return;
      }
    } catch { /* Nao supor autenticacao sem resposta do servidor. */ }
  }
  try {
    // Nao solicita senha admin ao plugin; o owner autoriza no mesmo dominio OAuth.
    const request = await postDevice<StartDevicePairing>('/pair/start', {
      device_name: 'SEGREDO-VSCODE', executor: 'vscode', surface: 'casa'
    });
    if (!request.ok || !/^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(request.code) ||
        !request.pair_id || !request.pair_secret) throw Error('PAIRING_START_INVALID');
    const approvedUri = vscode.Uri.parse(
      'https://mcp.centralldark.com/authorize?client_id=' +
      encodeURIComponent('centraldark.centraldark-vscode-restore') +
      '&pair_id=' + encodeURIComponent(request.pair_id));
    const opened = await vscode.env.openExternal(approvedUri);
    if (!opened) throw Error('PAIRING_BROWSER_NOT_OPENED');
    // Abrir pagina imediatamente sem gastar o TTL de 120s em um modal.
    // Exigir a conferencia do codigo e o clique humano no Cockpit.
    void vscode.window.showInformationMessage(
      'CentralDark: código ' + request.code + '. Confira na página aberta e clique em Confirmar pareamento.');
    const result = await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: 'CentralDark: aguardando Confirmar pareamento no MCP (' + request.code + ')',
      cancellable: true
    }, (_progress, cancel) => awaitDeviceApproval(request, cancel));
    if (!result.token || result.token.length < 32 ||
        !result.refresh_token || result.refresh_token.length < 32 ||
        !result.device_id) throw Error('PAIRING_APPROVAL_INCOMPLETE');
    const heartbeat = await verifyDeviceToken(result.token);
    if (!heartbeat.ok || heartbeat.device_id !== result.device_id)
      throw Error('PAIRING_HEARTBEAT_NOT_AUTHENTICATED');
    await context.secrets.store(DEVICE_TOKEN_KEY, result.token);
    await context.secrets.store(DEVICE_REFRESH_KEY, result.refresh_token);
    await context.globalState.update(DEVICE_ID_KEY, result.device_id);
    void vscode.window.showInformationMessage(
      'CentralDark: pareamento confirmado pelo MCP. Dispositivo: ' + result.device_id);
  } catch (error) {
    void vscode.window.showErrorMessage('CentralDark: pareamento NAO confirmado (' +
      (error instanceof Error ? error.message : 'UNKNOWN') + ').');
  }
}

async function verifyVsCodePairing(context: vscode.ExtensionContext): Promise<void> {
  const stored = await context.secrets.get(DEVICE_TOKEN_KEY);
  if (!stored) {
    void vscode.window.showWarningMessage(
      'CentralDark: dispositivo nao pareado. Clique em "Parear este VS Code".');
    return;
  }
  try {
    const result = await verifyDeviceToken(stored);
    if (!result.ok || !result.device_id) throw Error(result.error || 'DEVICE_NOT_AUTHENTICATED');
    await context.globalState.update(DEVICE_ID_KEY, result.device_id);
    void vscode.window.showInformationMessage(
      'CentralDark: autenticacao e heartbeat confirmados. ID: ' + result.device_id);
  } catch (error) {
    void vscode.window.showWarningMessage('CentralDark: verificacao nao confirmou o dispositivo (' +
      (error instanceof Error ? error.message : 'UNKNOWN') + ').');
  }
}

class CentralDarkVibeViewProvider implements vscode.WebviewViewProvider {
  constructor(private readonly context: vscode.ExtensionContext) {}
  resolveWebviewView(view: vscode.WebviewView): void {
    const nonce = randomBytes(16).toString('base64');
    view.webview.options = { enableScripts: true };
    const filename = path.join(this.context.extensionPath, 'media', 'vibe.html');
    view.webview.html = fs.readFileSync(filename, 'utf8').replaceAll('__CSP_NONCE__', nonce);
    const allowed = new Set([
      'centraldark.connectVpsSsh', 'centraldark.probeVpsSsh',
      'centraldark.pairVsCode', 'centraldark.verifyVsCodePairing', 'centraldark.checkUpdates',
      'centraldark.focusExistingTerminal', 'centraldark.locateVsCodeByPid',
      'centraldark.mapWorkspace', 'centraldark.restoreWorkspace'
    ]);
    view.webview.onDidReceiveMessage((msg: unknown) => {
      if (!msg || typeof msg !== 'object') return;
      const cmd = (msg as { command?: unknown }).command;
      if (typeof cmd === 'string' && allowed.has(cmd))
        void vscode.commands.executeCommand(cmd);
    });
  }
}
