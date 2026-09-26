# Verificação de CLIs de Agentes Autônomos — 2026-09-02

## Contexto
Usuário perguntou se Codex CLI estava instalado/autenticado para usar como motor subjacente.

## Resultado da Verificação
| CLI | Status | Versão/Detalhes |
|-----|--------|-----------------|
| **Codex** | ❌ NÃO INSTALADO | `codex` não encontrado no PATH; `/c/Users/danda/AppData/Local/Programs/OpenAI/Codex/bin/` não existe; `npm list -g @openai/codex` vazio |
| **Claude Code** | ✅ INSTALADO E FUNCIONAL | `claude --version` → `2.1.251 (Claude Code)`; binário em `/c/Users/danda/AppData/Roaming/npm/claude` |
| **Gemini CLI** | ❌ NÃO INSTALADO | `which gemini` → não encontrado |
| **OpenCode** | ❌ NÃO INSTALADO | `which opencode` → não encontrado |

## Para Instalar Codex (se necessário)
```bash
# Via npm (requer Node)
npm install -g @openai/codex

# Ou via installer oficial
curl -fsSL https://codex.openai.com/install.sh | bash
```

## Autenticação Codex (após instalar)
```bash
codex auth login
# ou
codex auth status
```

## Implicação para Uso como Motor Subjacente
- Hoje **apenas Claude Code** está disponível para invocação via terminal/tool calls
- Agente NÃO pode usar Codex "por debaixo dos panos" até instalação + autenticação
- Se usuário quiser delegar tarefas a Codex, precisa instalar primeiro

## Nota sobre Perfil "Default"
- Não existe perfil "default" em `C:\Users\danda\AppData\Local\hermes\profiles\`
- Perfis existentes: `claude`, `pivete`, `sol`, `teste`
- Perfil ativo nesta sessão: **pivete** (validado por `casa_boot.py`)