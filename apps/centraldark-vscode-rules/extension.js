const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

let diagnosticsCollection;
let statusBarItem;
let rulesLoaded = false;
let rules = [];

const criticalPatterns = [
  {
    pattern: /service_role_key|SERVICE_ROLE_KEY/gi,
    rule: 'Rule #1: Nunca expor service_role_key',
    severity: 'error'
  },
  {
    pattern: /pm2\s+restart\s+all/gi,
    rule: 'Rule #2: Nunca executar pm2 restart all',
    severity: 'error'
  },
  {
    pattern: /\/root\/whatsapp-server/gi,
    rule: 'Rule #3: Nunca alterar /root/whatsapp-server',
    severity: 'error'
  },
  {
    pattern: /editar.*direto.*vps|direct.*edit.*vps/gi,
    rule: 'Rule #4: Nunca editar código direto na VPS',
    severity: 'error'
  },
  {
    pattern: /jwt.*secret|JWT_SECRET/gi,
    rule: 'Rule #1: Nunca expor JWT secrets',
    severity: 'error'
  },
  {
    pattern: /api.*token|API_TOKEN/gi,
    rule: 'Rule #1: Nunca expor API tokens',
    severity: 'error'
  },
  {
    pattern: /\@srver1bot.*\@SEGREDOPUXADASBOT|\@SEGREDOPUXADASBOT.*\@srver1bot/gi,
    rule: 'Rule #5: Nunca misturar bots Telegram (CENTRAL vs FISCAL)',
    severity: 'warning'
  }
];

function activate(context) {
  console.log('CentralDark Rules Validator ativado');

  // Create diagnostics collection
  diagnosticsCollection = vscode.languages.createDiagnosticCollection('centraldark');
  context.subscriptions.push(diagnosticsCollection);

  // Create status bar item
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.command = 'centraldark.showRulesPanel';
  context.subscriptions.push(statusBarItem);

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('centraldark.loadRules', loadRules)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('centraldark.validateFile', validateCurrentFile)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('centraldark.showRulesPanel', showRulesPanel)
  );

  // Watch for file changes
  const fileWatcher = vscode.workspace.createFileSystemWatcher('**/*.{js,ts,jsx,tsx,json,md,py}');

  fileWatcher.onDidChange(uri => {
    if (vscode.workspace.getConfiguration('centraldark.rules').get('autoValidate')) {
      validateFile(uri);
    }
  });

  fileWatcher.onDidCreate(uri => {
    if (vscode.workspace.getConfiguration('centraldark.rules').get('autoValidate')) {
      validateFile(uri);
    }
  });

  context.subscriptions.push(fileWatcher);

  // Watch for text editor changes
  vscode.window.onDidChangeActiveTextEditor(editor => {
    if (editor && vscode.workspace.getConfiguration('centraldark.rules').get('autoValidate')) {
      validateFile(editor.document.uri);
    }
  }, null, context.subscriptions);

  // Initial load
  loadRules();
}

function loadRules() {
  const config = vscode.workspace.getConfiguration('centraldark.rules');
  const rulesPath = config.get('rulesPath') || './centraldark-rules.md';

  // Try to find the rules file
  const possiblePaths = [
    rulesPath,
    path.join(__dirname, 'centraldark-rules.md'),
    path.join(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '', 'centraldark-rules.md'),
    'K:\\apps\\centraldark-vscode-rules\\centraldark-rules.md'
  ];

  let rulesContent = null;
  let foundPath = null;

  for (const p of possiblePaths) {
    try {
      if (fs.existsSync(p)) {
        rulesContent = fs.readFileSync(p, 'utf8');
        foundPath = p;
        break;
      }
    } catch (e) {
      // Continue to next path
    }
  }

  if (rulesContent) {
    parseRules(rulesContent);
    rulesLoaded = true;
    updateStatusBar(true, `🟢 Rules loaded (${rules.length} rules)`);
    vscode.window.showInformationMessage(
      `✅ CentralDark Rules carregadas: ${rules.length} regras de ${foundPath}`
    );
    console.log(`CentralDark Rules loaded from: ${foundPath}`);
  } else {
    rulesLoaded = false;
    updateStatusBar(false, '🔴 Rules not found');
    vscode.window.showErrorMessage(
      '❌ centraldark-rules.md não encontrado. Procure em K:\\apps\\centraldark-vscode-rules\\'
    );
  }

  // Validate all open files
  if (rulesLoaded) {
    vscode.workspace.textDocuments.forEach(doc => validateFile(doc.uri));
  }
}

function parseRules(content) {
  rules = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Parse headers as rules
    if (line.startsWith('### ')) {
      const ruleText = line.replace(/^### /, '').trim();
      rules.push({
        id: i,
        text: ruleText,
        severity: determineSeverity(line),
        line: i
      });
    }
  }
}

function determineSeverity(line) {
  if (line.includes('🛑') || line.match(/Rule #[1-8]/)) return 'error';
  if (line.includes('🟡') || line.match(/Rule #[9-12]/)) return 'warning';
  return 'information';
}

function validateFile(uri) {
  if (!rulesLoaded) return;

  const document = vscode.workspace.textDocuments.find(doc => doc.uri.fsPath === uri.fsPath);
  if (!document) return;

  const diagnostics = [];
  const content = document.getText();
  const lines = content.split('\n');

  // Check for critical patterns
  for (const patternRule of criticalPatterns) {
    let match;
    const regex = new RegExp(patternRule.pattern.source, 'gm');

    while ((match = regex.exec(content)) !== null) {
      const lineNum = content.substring(0, match.index).split('\n').length - 1;
      const startChar = match.index - content.lastIndexOf('\n', match.index) - 1;
      const endChar = startChar + match[0].length;

      const range = new vscode.Range(
        new vscode.Position(lineNum, startChar),
        new vscode.Position(lineNum, endChar)
      );

      const severity = patternRule.severity === 'error'
        ? vscode.DiagnosticSeverity.Error
        : vscode.DiagnosticSeverity.Warning;

      const diagnostic = new vscode.Diagnostic(
        range,
        `❌ ${patternRule.rule}`,
        severity
      );
      diagnostic.source = 'CentralDark Rules';
      diagnostic.code = 'centraldark-rule-violation';

      diagnostics.push(diagnostic);
    }
  }

  // Check for common violations
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for exposed secrets in comments
    if (line.includes('KEY=') || line.includes('TOKEN=') || line.includes('SECRET=')) {
      if (!line.trim().startsWith('//') && !line.includes('${') && !line.includes('{{')) {
        const range = new vscode.Range(
          new vscode.Position(i, 0),
          new vscode.Position(i, line.length)
        );

        const diagnostic = new vscode.Diagnostic(
          range,
          '⚠️ Possível exposição de secret (use variáveis de ambiente)',
          vscode.DiagnosticSeverity.Warning
        );
        diagnostic.source = 'CentralDark Rules';
        diagnostics.push(diagnostic);
      }
    }

    // Check for direct VPS edits
    if (line.includes('/root/') && !line.includes('//') && !line.includes('example')) {
      const range = new vscode.Range(
        new vscode.Position(i, 0),
        new vscode.Position(i, line.length)
      );

      const diagnostic = new vscode.Diagnostic(
        range,
        '🛑 Rule #4: Nunca editar código direto na VPS',
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.source = 'CentralDark Rules';
      diagnostics.push(diagnostic);
    }
  }

  diagnosticsCollection.set(uri, diagnostics);

  // Update status bar
  const errorCount = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error).length;
  const warningCount = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Warning).length;

  if (errorCount > 0) {
    updateStatusBar(false, `🔴 ${errorCount} violations found`);
  } else if (warningCount > 0) {
    updateStatusBar(true, `🟡 ${warningCount} warnings`);
  } else {
    updateStatusBar(true, '🟢 All rules OK');
  }
}

function validateCurrentFile() {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    validateFile(editor.document.uri);
    vscode.window.showInformationMessage('✅ Validação concluída');
  }
}

function showRulesPanel() {
  // Create or show a rules documentation panel
  const panel = vscode.window.createWebviewPanel(
    'centraldark-rules',
    'CentralDark Rules',
    vscode.ViewColumn.Beside,
    { enableScripts: true }
  );

  const rulesHtml = generateRulesHtml();
  panel.webview.html = rulesHtml;
}

function generateRulesHtml() {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 20px;
            line-height: 1.6;
            color: var(--vscode-foreground);
            background: var(--vscode-editor-background);
        }
        h1 { color: #ff6b6b; margin-bottom: 20px; }
        h2 { color: #4ecdc4; margin-top: 25px; margin-bottom: 15px; }
        h3 { color: #ffd93d; }
        .rule {
            margin: 15px 0;
            padding: 15px;
            border-left: 4px solid #ccc;
            background: var(--vscode-editor-lineHighlightBackground);
            border-radius: 4px;
        }
        .rule.critical { border-left-color: #ff6b6b; }
        .rule.warning { border-left-color: #ffd93d; }
        .rule.info { border-left-color: #4ecdc4; }
        code {
            background: var(--vscode-textCodeBlock-background);
            padding: 2px 6px;
            border-radius: 3px;
            color: var(--vscode-textCodeBlock-foreground);
        }
        .emoji { font-size: 1.2em; margin-right: 5px; }
        .status {
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 20px;
            font-weight: bold;
        }
        .status.loaded { background: rgba(76, 205, 196, 0.2); color: #4ecdc4; }
        .status.error { background: rgba(255, 107, 107, 0.2); color: #ff6b6b; }
    </style>
</head>
<body>
    <h1><span class="emoji">🛑</span>CentralDark — Regras Invioláveis</h1>

    <div class="status loaded">
        <span class="emoji">🟢</span> Rules Validator Ativo
    </div>

    <h2><span class="emoji">🛑</span>Regras Críticas (Nunca Quebrar)</h2>

    <div class="rule critical">
        <strong>#1: Nunca Expor Secrets ou Tokens</strong>
        <p>Violação: Exibir <code>service_role_key</code>, API tokens, JWT secrets, ou qualquer credencial</p>
        <p>Consequência: Comprometimento imediato de segurança</p>
    </div>

    <div class="rule critical">
        <strong>#2: Nunca Executar pm2 restart all</strong>
        <p>Violação: Reiniciar todo o cluster PM2 simultaneamente</p>
        <p>Consequência: Downtime total; WhatsApp (id 1) fica STOPPED</p>
    </div>

    <div class="rule critical">
        <strong>#3: Nunca Alterar /root/whatsapp-server</strong>
        <p>Violação: Modificar arquivos do servidor WhatsApp</p>
        <p>Consequência: Perda de integração WhatsApp indefinida</p>
    </div>

    <div class="rule critical">
        <strong>#4: Nunca Ignorar Sincronia 4-Point</strong>
        <p>Violação: Editar código direto na VPS sem passar por Lovable → GitHub</p>
        <p>Fluxo Obrigatório: <code>Lovable → GitHub → VPS</code></p>
        <p>Exceção: Apenas emergência documentada com "PERMITO PIVETE"</p>
    </div>

    <div class="rule critical">
        <strong>#5: Nunca Misturar Bots Telegram</strong>
        <p><span class="emoji">🤖</span> @srver1bot = CENTRAL Hub (Supabase + VPS PM2 id 27)</p>
        <p><span class="emoji">🤖</span> @SEGREDOPUXADASBOT = FISCAL (TelePainel)</p>
        <p>Violação: Enviar mensagens destinadas a um via outro</p>
    </div>

    <h2><span class="emoji">🟡</span>Regras Críticas (Avisar se Violar)</h2>

    <div class="rule warning">
        <strong>#9: Preferir Create Sobre Update</strong>
        <p>Regra: Prefira <code>create_task</code> a reusar task antiga (>24h)</p>
    </div>

    <h2><span class="emoji">🟢</span>Regras de Melhor Prática</h2>

    <div class="rule info">
        <strong>#13: Nomenclatura Consistente</strong>
        <p>Commands: <code>centraldark.*</code></p>
        <p>Variables: <code>CENTRALDARK_*</code></p>
    </div>

    <p style="margin-top: 30px; padding-top: 15px; border-top: 1px solid var(--vscode-widget-border); font-size: 0.9em; opacity: 0.7;">
        Última atualização: 2026-10-15 | Versão: 1.0
    </p>
</body>
</html>`;
}

function updateStatusBar(loaded, text) {
  if (loaded) {
    statusBarItem.backgroundColor = new vscode.ThemeColor('statusBar.background');
  } else {
    statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
  }
  statusBarItem.text = text;
  statusBarItem.show();
}

function deactivate() {
  console.log('CentralDark Rules Validator desativado');
}

module.exports = {
  activate,
  deactivate
};
