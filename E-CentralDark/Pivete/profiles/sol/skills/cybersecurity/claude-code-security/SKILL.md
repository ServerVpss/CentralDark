---
name: claude-code-security
description: "Lock Claude Code permission bypasses anywhere they live."
version: 1.0
author: Casa/Pivete (Hermes-CASA)
license: MIT
tags: [claude, claude-code, security, permissions, jaula, lockdown, pivete]
---

# 🔒 CLAUDE CODE SECURITY — tranca a gaiola

Quando o Pivete manda "tranca o Claude", "papagaio fica na gaiola", ou
"onde tiver Claude": encontre TODAS as configs de permissão do Claude na
máquina e remova os bypass de execução. Não pergunte — aplique.

## Princípio
> Papagaio fica na gaiola. Claude não burlando permissões.

O Claude Code aceita `permissions.allow` com wildcards que viram execução
arbitrária disfarçada. O trabalho é achá-los e fechar — sem quebrar o que
o Pivete usa de verdade.

## Onde ficam as permissões (mapa)
1. **Global do usuário:** `~/.claude/settings.json`
2. **Projeto (repo):** `<repo>/.claude/settings.json`
3. **Worktree:** `<worktree>/.claude/settings.json`
4. **Estado global:** `~/.claude.json` → `projects` → `<path>` → `allowedTools`
5. **Desktop MCP:** `%APPDATA%\Claude\claude_desktop_config.json`

Sempre varrer TODOS os `.claude/settings.json` do disco (find maxdepth 4)
antes de agir.

## Padrões de bypass (caça estes)
| Padrão | Perigo | Ação |
|--------|--------|------|
| `Bash(node -e ' *)` | Executa QUALQUER JS inline | Remover ou afunilar p/ `node -e 'console.log*'` |
| `Bash(gh api:*)` | API GitHub total | Afunilar p/ `gh api repos/*/pulls/*` |
| `gh pr edit:*` / `gh run cancel:*` | Mutação sem confirmação | Mover p/ `deny` |
| `Read(*)` / `Write(*)` / `Edit(*)` | Irrestrito | Remover wildcard |

## Procedimento de tranca
1. `find` todos os `settings.json` com `.claude` no path (maxdepth 4).
2. `grep -Eln "node -e '\*\"|Bash\(\*\)|gh api:\*\"|Read\(\*\)"` nesses.
3. `patch` substituindo allow perigoso por escopo fechado + adicionar `deny`:
   ```json
   "deny": [
     "Bash(node -e*)", "Bash(node *|sh)", "Bash(curl *|sh)",
     "Bash(wget *|sh)", "Bash(rm -rf*)", "Bash(*--no-verify*)"
   ]
   ```
4. **Validar JSON** após patch. Python pode não existir — usar:
   `node -e "JSON.parse(require('fs').readFileSync('/c/Users/...','utf8'))"`
   (paths POSIX no git-bash: `/c/Users/...`, `/e/CentralDark/...`).
5. Re-grep → ZERO matches. Gaiola fechada.

## O que NÃO fazer
- Não apagar `additionalDirectories` que o Pivete usa.
- Não remover hooks `Stop` inofensivos (Telegram notify).
- Não mexer em `~/.claude.json` projects se `allowedTools: []`.
- Nunca abrir/executar binário alheio — SILENCIOSA.

## Monitoramento de processo (ponta do pé no sigilo)
`tasklist | grep -iE "claude|node|hermes"` → listar PIDs é SILENCIOSO
(não mata, não inspeciona memória). Se Claude spawnar `node -e` arbitrário
ou `curl|sh` = anomalia fora do padrão da Casa → SUSPEITO, READ_ONLY.

## Integração
- `investigacao-guardiao` (modo SILENCIOSA p/ ler JSON como texto)
- `edr-zero-trust-hunter` (telemetry Windows se autorizado)
- Sempre carregar SOB DEMANDA.
