---
name: centraldark-label-conventions
description: Label conventions for ServerVpss/CentralDark repository.
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [any]
metadata:
  hermes:
    tags: [github, labels, conventions]
---
# Label Conventions for ServerVpss/CentralDark

This repository uses specific label naming conventions that include emoji prefixes for visual categorization.

## Agent Labels
- 🧠 AGENTE-HERMES - PIVETE/Hermes executor
- 🧠 AGENTE-CODEX - Codex como capacidade, nunca autoridade
- 🧠 AGENTE-CLAUDE - Claude como capacidade, nunca autoridade
- 🧠 AGENTE-CHATGPT - ChatGPT/SOL como capacidade, nunca autoridade
- 🧠 AGENTE-GROK - Grok como capacidade, nunca autoridade
- 🧠 AGENTE-SUPABASE - Supabase/banco
- 🧠 AGENTE-JARVIS - Jarvis/orquestração
- 🧠 AGENTE-SENTINELA - Sentinela detector

## Quality Labels
- ✨ MELHORIA - Melhoria/refinamento
- 📚 DOCS - Documentação/memória versionada
- 🐞 BUG - Algo quebrado

## Priority Labels
- 🔴 PRIORIDADE-ALTA - Resolver logo
- 🟡 PRIORIDADE-MÉDIA - Prioridade média
- 🟢 PRIORIDADE-BAIXA - Prioridade baixa

## Status Labels
- 🟢 SUCESSO - Validado/estável/concluído
- 🔴 ERRO - Falha confirmada
- 🟡 IA-PRECISA-REVISAR - Revisão técnica necessária
- 🟢 PRONTO-PARA-IA - Contexto suficiente para IA
- 🔴 FALTA-EVIDÊNCIA - Sem prova suficiente; UNKNOWN não é PASS
- 🤖 IA-REVISAR - IA revisar
- 🤖 IA-EXECUTAR - IA executar dentro do escopo autorizado
- 🤖 IA-PESQUISAR - IA pesquisar contexto
- 🤖 IA-DOCUMENTAR - IA documentar/organizar
- 🤖 IA-VALIDAR - IA validar/provar
- 🤖 IA-INFRA - IA em infra
- 🤖 IA-FRONTEND - IA em frontend
- 🤖 AUTO - Criado/atualizado por automação

## Special Labels
- 👑 PERMITO-SEGREDO - Autorização humana canônica de SEGREDO/CHEFE
- 🔴 RISCO-SERVIDOR - VPS/PM2/deploy/produção
- 🔴 PRIORIDADE-ALTA - Resolver logo
- 🎨 FRONTEND - Tela/layout/mobile
- 🧭 PAINEL - Painel/cockpit

## Key Principles
1. Label names are exact strings - must match precisely including emojis and spacing
2. Always verify existing labels with `gh label list` before applying new ones
3. Emoji prefixes are part of the label name and required for matching
4. When in doubt, check the label repository rather than guessing

## Example Usage
Correct:
```bash
gh pr edit 123 --add-label "🧠 AGENTE-HERMES,✨ MELHORIA"
```

Incorrect (will fail):
```bash
gh pr edit 123 --add-label "AGENTE-HERMES,MELHORIA"
```