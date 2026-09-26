# PR Labels Obrigatórias — CentralDark

TODO PR em `ServerVpss/CentralDark` DEVE receber labels existentes no remoto, obrigatoriamente identificando executor + autorização + categoria.

## Regra de Ouro
- 👑 PERMITO-SEGREDO (autorização humana canônica)
- 🧠 AGENTE-HERMES (ou label de agente executor: AGENTE-CLAUDE, AGENTE-CODEX, etc.)
- + categoria (✨ MELHORIA, 🐞 BUG, 📚 DOCS, 🎨 FRONTEND, 🔧 SELF-HEAL...)

Independentemente de quem abre (CHEFE, HERMES, qualquer agente).

## Passo a passo obrigatório

```bash
# 1. Listar labels REAIS do remoto (API, não gh label list que cacheia errado)
gh api repos/ServerVpss/CentralDark/labels --jq '.[].name'

# 2. Abrir PR JÁ com labels (não abrir e corrigir depois)
gh pr create \
  --title "..." \
  --body "..." \
  --label "👑 PERMITO-SEGREDO,🧠 AGENTE-HERMES,✨ MELHORIA"

# 3. Verificar
gh pr view <num> --json labels --jq '.labels[].name'
```

## Armadilhas reais (da sessão 2026-08-26)
- `gh label list` mostrou labels SEM emoji, mas o remoto tem COM emoji.
  Usar nome SEM emoji → `gh pr edit --add-label "MELHORIA"` → **not found**.
  Correto: `gh pr edit --add-label "✨ MELHORIA"` (com emoji).
- `gh label list` pode listar de outro repo/cache. Fonte da verdade = `gh api repos/.../labels`.
- Abrir PR sem `--label` e corrigir depois = erro de processo (CHEFE reprovou).

## Fixed Point
PR aberto + `gh pr view` mostra 👑 PERMITO-SEGREDO + 🧠 AGENTE-HERMES + categoria = TRUE.
