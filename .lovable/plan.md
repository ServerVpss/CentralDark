## Relatório read-only — sem edições

Consulta feita direto na API do GitHub via connector, sem clonar, sem editar, sem tocar em segredo.

### Campos obrigatórios

```text
WORKSPACE_REF_INSPECIONADA        = refs/heads/main (única ref remota consultável — a branch da missão não existe)
MAIN_SHA                          = d368731c86ed759ccbae52274daf852719322e48
BRANCH_SHA                        = (n/d — branch inexistente remotamente)
REMOTE_BRANCH_EXISTS              = false  (GET /branches/feat/zerar-issues-centraldark-2026-07-22-1700 → HTTP 404 "Branch not found")
AHEAD                             = (n/d — não há ref remota para comparar)
BEHIND                            = (n/d)
FILES_CHANGED                     = (n/d — sem diff remoto disponível)
NEW_PARALLEL_ARTIFACTS            = (n/d — sem diff)
PREEXISTING_PARALLEL_NAMES        = não inspecionado nesta passada (fora do escopo sem diff da missão)
OUT_OF_SCOPE_FILES                = (n/d — sem diff)
CANONICAL_STATUS                  = INDETERMINADO (sem branch para classificar)
SAFE_TO_RETURN_MAIN               = true  (nada foi empurrado; workspace remoto continua exatamente em main @ d368731c)
```

### Diagnóstico

```text
LOCAL_ONLY_OR_NOT_PUSHED
```

A branch `feat/zerar-issues-centraldark-2026-07-22-1700` não existe no remoto `ServerVpss/CentralDark`. Se ela foi criada, está apenas local (na VPS ou no ambiente do Hermes) e nunca foi publicada. Portanto não há commits à frente/atrás, não há diff, não há arquivos novos a classificar, e nenhum artefato paralelo pôde ter vazado para o remoto por essa via.

Como consequência: `main` remoto permanece intocado no SHA `d368731c86ed759ccbae52274daf852719322e48` (HEAD atual, commit `chore(notion-sync): relatório + changelog [skip ci]`). Nada precisa ser revertido no GitHub.

### EXACT_READ_ONLY_COMMANDS_TO_RETURN_MAIN

Comandos apenas para o ambiente local onde a branch pode existir (VPS/CentralDark). Todos read-only ou movimentação local — nenhum push, nenhum reset destrutivo do remoto:

```bash
# 1) Confirmar de novo que o remoto não tem a branch
git ls-remote origin refs/heads/feat/zerar-issues-centraldark-2026-07-22-1700
# Saída esperada: vazio

# 2) Ver se existe apenas local
git branch --list feat/zerar-issues-centraldark-2026-07-22-1700
git for-each-ref --format='%(refname:short) %(objectname:short) %(committerdate:iso8601)' refs/heads/feat/zerar-issues-centraldark-2026-07-22-1700

# 3) Voltar HEAD do workspace para main sincronizado, sem descartar nada da branch local
git fetch origin main
git checkout main
git status
git log -1 --format='%H %s' origin/main
# Esperado: d368731c86ed759ccbae52274daf852719322e48
```

Nenhum `push`, `reset --hard`, `branch -D`, deploy ou restart deve ser executado sem ordem explícita separada.

### Itens deixados sem inspecionar por serem fora do escopo desta passada

- Contagem/listagem de skills concorrentes `lupa-*` / `metalupa-*` / `tecnica-da-lupa*` em `main` não foi executada aqui porque o pedido pedia comparação **contra o diff da branch**, que não existe. Se quiser, na próxima passada faço a auditoria isolada de `.agents/skills/` em `main` como missão separada.

Nada foi alterado no repositório, no Lovable, na VPS ou em qualquer secret.