# MISSAO - varredura-branches-orfas.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\.github\workflows\varredura-branches-orfas.yml
**SHA:** 3d2ac577ce1589c0
**Timestamp:** 2026-08-28T02:56:04.092966
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: Varredura — branches órfãs (inventário determinístico)

# Objetivo (intenção do SEGREDO/CHEFE):
# "Nada pode ficar pra trás." Este workflow NÃO faz merge, NÃO faz deploy,
# NÃO apaga nada. Ele apenas MEDE: lista todas as branches remotas e mostra,
# para cada uma, quantos commits ainda não estão convergidos na main e quais
# arquivos elas tocam. É o mapa que diz o que precisa convergir.
#
# Convergência é avaliada por conteúdo: a árvore final da branch precisa
# existir no histórico da main. Isso evita falso pendente após squash merge,
# mesmo quando os objetos de commit da branch não viram ancestrais da main.
#
# O relatório também mantém a varredura viva quando a branch não tem
# merge-base ou quando a saída é grande: limites são aplicados pelo Git
# e por um consumidor que drena a saída, sem pipe quebrado por head.
#
# Roda no runner self-hosted da Casa porque este repositório não dispõe de
# runner hospedado ubuntu-latest; as actions permanecem pinadas por SHA.

on:
  workflow_dispatch:
  schedule:
    - cron: "0 9 * * 1"

permissions:
  contents: read

jobs:
  inventario:
    name: Inventário de branches não convergidas
    runs-on: [self-hosted, Linux]
    timeout-minutes: 10

    steps:
      - name: Checkout completo (histórico inteiro)
        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          fetch-depth: 0
          persist-credentials: false

      - name: Medir cada branch contra a main
        shell: bash
        run: |
          set -euo pipefail
          
          mkdir -p relatorio
          REL=relatorio/branches-orfas.md
          TMP_DIR="$(mktemp -d)"
          trap 'rm -rf "$TMP_DIR"' EXIT
          
          printf '%s\n' "# Inventário de branches — $(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$REL"
          printf '%s\n' "" >> "$REL"
          MAIN_HEAD="$(git rev-parse origin/main)"
          MAIN_TREE="$(git rev-parse 'origin/main^{tree}')"
          printf '%s\n' "HEAD main: \`$MAIN_HEAD\`" >> "$REL"
          printf '%s\n' "" >> "$REL"
          
          MAIN_TREES="$TMP_DIR/main-trees"
          git log --format='%T' origin/main > "$MAIN_TREES"
          
          TOTAL=0
          PENDENTES=0
          INDETERMINADOS=0
          
          BRANCHES="$TMP_DIR/branches"
          git for-each-ref --sort=refname --format='%(refname:short)' refs/remotes/origin > "$BRANCHES"
          
          while IFS= read -r BRANCH; do
            case "$BRANCH" in
              origin|origin/main|origin/HEAD) continue ;;
            esac
          
            TOTAL=$((TOTAL+1))
            BRANCH_TREE="$(git rev-parse "$BRANCH^{tree}" 2>/dev/null || true)"
            ULTIMO="$(git log -1 --format='%ci' "$BRANCH" 2>/dev/null || true)"
            [ -n "$ULTIMO" ] || ULTIMO='desconhecido'
          
            if [ -z "$BRANCH_TREE" ]; then
              INDETERMINADOS=$((INDETERMINADOS+1))
              printf '%s\n' "" >> "$REL"
              printf '%s\n' "## 🔴 \`$BRANCH\` — não foi possível medir a árvore" >> "$REL"
              printf '%s\n' "Último commit: $ULTIMO" >> "$REL"
              continue
            fi
          
            MERGE_BASE="$(git merge-base origin/main "$BRANCH" 2>/dev/null || true)"
            if [ -n "$MERGE_BASE" ]; then
              AHEAD="$(git rev-list --count "$MERGE_BASE..$BRANCH" 2>/dev/null || true)"
            else
              AHEAD="$(git rev-list --count "$BRANCH" 2>/dev/null || true)"
            fi
            [ -n "$AHEAD" ] || AHEAD='desconhecido'
          
            if [ "$BRANCH_TREE" = "$MAIN_TREE" ] || grep -Fxq "$BRANCH_TREE" "$MAIN_TREES"; then
              printf '%s\n' "- ✅ \`$BRANCH\` — convergida por conteúdo (árvore presente no histórico da main; $AHEAD commit(s) fora da ancestralidade)" >> "$REL"
              continue
            fi
          
            PENDENTES=$((PENDENTES+1))
            printf '%s\n' "" >> "$REL"
          
            if [ -n "$MERGE_BASE" ]; then
              DIFF_BASE="$MERGE_BASE"
              printf '%s\n' "## 🟡 \`$BRANCH\` — $AHEAD commit(s) ainda fora da main" >> "$REL"
              printf '%s\n' "Base de comparação: merge-base \`$MERGE_BASE\`." >> "$REL"
              LOG_RANGE="$MERGE_BASE..$BRANCH"
            else
              DIFF_BASE='origin/main'
              printf '%s\n' "## 🟠 \`$BRANCH\` — sem merge-base; comparação direta das árvores" >> "$REL"
              printf '%s\n' "Atenção: o histórico é incomparável; a branch permanece pendente e não interrompe a varredura." >> "$REL"
              LOG_RANGE="$BRANCH"
            fi
          
            printf '%s\n' "" >> "$REL"
            printf '%s\n' "Último commit: $ULTIMO" >> "$REL"
            printf '%s\n' "" >> "$REL"
            printf '%s\n' "Commits pendentes (máximo 30):" >> "$REL"
            printf '%s\n' '```' >> "$REL"
            git log --oneline --no-decorate --max-count=30 "$LOG_RANGE" >> "$REL"
            printf '%s\n' '```' >> "$REL"
            printf '%s\n' 
```