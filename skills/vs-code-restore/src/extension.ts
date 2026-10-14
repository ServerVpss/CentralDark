import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

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
    vscode.commands.registerCommand('centraldark.mapWorkspace', () => mapNativeWorkspace(context))
  );
  const onOpen = vscode.workspace.getConfiguration('centraldark.restore').get<boolean>('onOpen', false);
  if (onOpen) {
    void restore(context, false);
  }
}

export function deactivate(): void {}

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
