## 📋 JSON pronto pra colar

Substitui o teu `settings.json` inteiro por esse aqui — já com o `/v1` removido e tudo alinhado:

```json
{
  "CodeGPT.apiKey": "Grok",

  "chat.mcp.discovery.enabled": {
    "claude-desktop": true,
    "windsurf": true,
    "cursor-global": true,
    "cursor-workspace": true
  },
  "chat.mcp.autostart": true,
  "chat.useAgentsMdFile": true,
  "chat.useCustomizationsInParentRepositories": true,
  "gitlens.gitkraken.mcp.autoEnabled": true,

  "chat.agentFilesLocations": [
    "/root/CentralDark/.github/agents",
    "/root/CentralDark/.claude/agents"
  ],

  "geminicodeassist.outlines.automaticOutlineGeneration": false,
  "geminicodeassist.inlineCompletion.enable": false,

  "python.languageServer": "None",
  "python.analysis.autoImportCompletions": false,
  "python.terminal.activateEnvironment": false,
  "python.terminal.useEnvFile": false,

  "files.exclude": {
    ".git": true,
    "dist": true,
    "logs": true,
    "node_modules": true
  },
  "files.watcherExclude": {
    "dist/": true,
    "logs/": true,
    "node_modules/": true
  },

  "explorer.compactFolders": false,
  "scm.compactFolders": false,

  "terminal.integrated.profiles.windows": {
    "PowerShell": {
      "source": "PowerShell",
      "icon": "terminal-powershell"
    },
    "Command Prompt": {
      "path": [
        "${env:windir}\\Sysnative\\cmd.exe",
        "${env:windir}\\System32\\cmd.exe"
      ],
      "args": [],
      "icon": "terminal-cmd"
    },
    "Git Bash": {
      "source": "Git Bash",
      "icon": "terminal-git-bash"
    }
  },

  "claudeCode.allowDangerouslySkipPermissions": true,
  "claudeCode.environmentVariables": [
    "ANTHROPIC_API_KEY=sk-lab-xlZDWhRKdmE8YQd1boW2xNxcZhEzJ0_QXzA0oNX7zl8",
    "ANTHROPIC_BASE_URL=https://claude.ap7.site"
  ],

  "terminal.integrated.env.linux": {
    "ANTHROPIC_BASE_URL": "https://claude.ap7.site",
    "ANTHROPIC_API_KEY": "sk-lab-xlZDWhRKdmE8YQd1boW2xNxcZhEzJ0_QXzA0oNX7zl8"
  },
  "terminal.integrated.inheritEnv": true
}
```

## O que mudou

Só uma coisa: tirei o `/v1` do fim do `ANTHROPIC_BASE_URL` no bloco `claudeCode.environmentVariables`. Agora os dois blocos batem no mesmo endereço e o Claude Code vai montar a URL certinha.

## Depois de colar

1. Salva o arquivo (Ctrl+S).
2. `Ctrl+Shift+P` → **Developer: Reload Window**.
3. Manda "oi" no Claude Code.

Se ainda der 400, agora vai aparecer detalhado nos logs do proxy (o `upstream_error` que a gente montou). Confirma pra eu seguir?
