import * as vscode from 'vscode';

const VIEW_ID = 'centraldark.vibeCoding';

const ACTIONS = {
  conectar: 'centraldark.connectVpsSsh',
  testar: 'centraldark.probeVpsSsh',
  parear: 'centraldark.remoteTerminalPair',
  status: 'centraldark.remoteTerminalStatus',
  terminal: 'centraldark.focusExistingTerminal',
  mapear: 'centraldark.mapWorkspace',
  restaurar: 'centraldark.restoreWorkspace',
  rastreio: 'centraldark.showTrace',
  compilar: 'centraldark.buildExtension',
} as const;

type ActionName = keyof typeof ACTIONS;

function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function actionFromNaturalLanguage(text: string): ActionName | undefined {
  const value = normalize(text);
  if (/compil|build|empacot|vsix/.test(value)) return 'compilar';
  if (/pare|dispositivo|autoriza/.test(value)) return 'parear';
  if (/status|estado|pid/.test(value)) return 'status';
  if (/test|probe|verifica.*conex|conex.*test/.test(value)) return 'testar';
  if (/conecta|abrir.*servidor|entrar.*vps|remote.*ssh/.test(value)) return 'conectar';
  if (/terminal|hermes|zendrive/.test(value)) return 'terminal';
  if (/mapear|interface|inventari/.test(value)) return 'mapear';
  if (/restaur|bancada|workspace/.test(value)) return 'restaurar';
  if (/rastre|trace|log/.test(value)) return 'rastreio';
  return undefined;
}



export async function runNaturalCentralDarkCommand(text?: string): Promise<void> {
  const value = text ?? await vscode.window.showInputBox({
    title: 'CentralDark — diga o que você quer fazer',
    prompt: 'Ex.: conecta no servidor, testa a conexão, mostra os PIDs, pareia este VS Code, compila a extensão.',
    placeHolder: 'Escreva em linguagem natural…'
  });
  if (!value) return;
  const action = actionFromNaturalLanguage(value);
  if (!action) {
    void vscode.window.showInformationMessage(
      'CentralDark: ainda não reconheci essa intenção. Use conectar, testar, parear, status/PIDs, terminal, mapear, restaurar, rastreio ou compilar.'
    );
    return;
  }
  await vscode.commands.executeCommand(ACTIONS[action]);
}

export class CentralDarkVibeProvider implements vscode.WebviewViewProvider {
  constructor(private readonly context: vscode.ExtensionContext) {}

  resolveWebviewView(view: vscode.WebviewView): void {
    view.webview.options = { enableScripts: true };
    view.webview.html = this.html(view.webview);
    const disposable = view.webview.onDidReceiveMessage(async (message: unknown) => {
      if (!message || typeof message !== 'object') return;
      const data = message as { type?: string; action?: string; text?: string };
      if (data.type === 'action' && data.action && data.action in ACTIONS) {
        await vscode.commands.executeCommand(ACTIONS[data.action as ActionName]);
        return;
      }
      if (data.type === 'natural' && typeof data.text === 'string') {
        await runNaturalCentralDarkCommand(data.text);
      }
    });
    this.context.subscriptions.push(disposable);
  }

  private html(webview: vscode.Webview): string {
    const nonce = String(Date.now());
    return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body{font-family:var(--vscode-font-family);padding:12px;color:var(--vscode-foreground)}
h2{margin:0 0 10px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
button,input{box-sizing:border-box;width:100%;border:1px solid var(--vscode-input-border);border-radius:6px;padding:8px}
button{background:var(--vscode-button-background);color:var(--vscode-button-foreground);cursor:pointer}
button:hover{background:var(--vscode-button-hoverBackground)}
.row{display:flex;gap:8px;margin-top:10px}.row input{flex:1}.row button{width:auto}
small{display:block;margin-top:10px;color:var(--vscode-descriptionForeground)}
</style>
</head>
<body>
<h2>🪬 CentralDark · Vibe Coding</h2>
<div class="grid">
<button data-action="conectar">Conectar ao servidor</button>
<button data-action="testar">Testar a conexão</button>
<button data-action="parear">Parear este VS Code</button>
<button data-action="status">Ver status e PIDs</button>
<button data-action="terminal">Abrir terminal existente</button>
<button data-action="compilar">Compilar a extensão</button>
<button data-action="mapear">Mapear o VS Code</button>
<button data-action="restaurar">Restaurar a bancada</button>
</div>
<div class="row">
<input id="natural" placeholder="Ex.: conecta no servidor, mostra os PIDs, compila a extensão">
<button id="go">Executar</button>
</div>
<small>Linguagem natural dispara os mesmos owners/comandos existentes; não cria segundo executor.</small>
<script nonce="${nonce}">
const vscode=acquireVsCodeApi();
document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>vscode.postMessage({type:'action',action:b.dataset.action})));
const input=document.getElementById('natural');
const run=()=>{const text=input.value.trim();if(text){vscode.postMessage({type:'natural',text});input.value='';}};
document.getElementById('go').addEventListener('click',run);
input.addEventListener('keydown',e=>{if(e.key==='Enter')run();});
</script>
</body>
</html>`;
  }
}

export async function openCentralDarkVibe(): Promise<void> {
  await vscode.commands.executeCommand('workbench.view.explorer');
  await vscode.commands.executeCommand(VIEW_ID + '.focus');
}
