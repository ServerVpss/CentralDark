---
name: centraldark-pr-label
description: Aplicar labels canônicas obrigatórias em todo PR da CentralDark (identifica executor + autorização + categoria). Trigger: abrir ou editar PR no repo ServerVpss/CentralDark.
trigger:
  - gh pr create
  - gh pr edit
  - todo abrir PR
  - todo fechar PR
phases: "LIST_REMOTE_LABELS → MATCH_EXACT → APPLY_ON_CREATE → VERIFY"
rules:
  - TODO PR DEVE TER LABELS (independente de quem abre: CHEFE, HERMES, qualquer agente)
  - OBRIGATÓRIAS: 👑 PERMITO-SEGREDO (autorização humana) + 🧠 AGENTE-HERMES (executor) ou label de agente correspondente
  - CATEGORIA: ✨ MELHORIA / 🐞 BUG / 📚 DOCS / 🎨 FRONTEND etc conforme mudança
  - USA_LABELS_EXISTENTES_NO_REMOTO (nunca inventar nome)
  - NOME_EXATO_INCLUI_EMOJI_SE_HOUVER
runtime_checks:
  - gh auth status
  - gh api repos/ServerVpss/CentralDark/labels --jq '.[].name'
  - gh pr view <num> --json labels
failure_signature: "PR_WITHOUT_CANONICAL_LABELS"
remediation:
  - LISTAR labels via API (não gh label list que pode cachear errado)
  - APLICAR nome exato com emoji
  - VERIFICAR com gh pr view
provenance:
  sources:
    - "SKILL.md"
  tests:
    - "abrir PR de teste e confirmar labels"
  receipts:
    - "centraldark.pr.label.receipt"
counterproof: "PR aberto com 👑 PERMITO-SEGREDO + 🧠 AGENTE-HERMES visível em gh pr view"
fixed_point_contribution: "Todo PR da Casa tem rastreabilidade de executor + autorização"
mantra: "LABEL_EXISTENTE > INVENTAR; NOME_EXATO_COM_EMOJI; TODO_PR_ETIQUETADO"
---

# CENTRALDARK PR LABEL — Canônico

## Regra de Ouro
TODO PR no repo `ServerVpss/CentralDark` recebe labels existentes no remoto, obrigatoriamente:
- 👑 PERMITO-SEGREDO (autorização humana canônica)
- 🧠 AGENTE-HERMES (ou label de agente executor: AGENTE-CLAUDE, AGENTE-CODEX, etc.)
- + categoria (✨ MELHORIA, 🐞 BUG, 📚 DOCS, 🎨 FRONTEND, 🔧 SELF-HEAL...)

## Passo a passo obrigatório

```bash
# 1. Listar labels REAIS do remoto (API, não gh label list)
gh api repos/ServerVpss/CentralDark/labels --jq '.[].name'

# 2. Abrir PR JÁ com labels (não abrir e corrigir depois)
gh pr create \
  --title "..." \
  --body "..." \
  --label "👑 PERMITO-SEGREDO,🧠 AGENTE-HERMES,✨ MELHORIA"

# 3. Verificar
gh pr view <num> --json labels --jq '.labels[].name'
```

## Por que falha comum
- `gh label list` às vezes mostra labels de outro contexto/cache → usar `gh api`
- Nome sem emoji dá `not found` se remoto tem com emoji → usar nome EXATO
- Abrir PR sem `--label` → corrigir depois é erro de processo

## Fixed Point
PR aberto + `gh pr view` mostra 👑 PERMITO-SEGREDO + 🧠 AGENTE-HERMES + categoria = TRUE.
