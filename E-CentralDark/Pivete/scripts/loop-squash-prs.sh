#!/usr/bin/env bash
# Loop autônomo: squash PRs MERGEABLE + rebase canônico para dependabot CONFLICTING.
# Princípio: paz e amor, várias canetas uma direção. Não invasão de branch alheio.
set -u
REPO="ServerVpss/CentralDark"
LOG="/e/CentralDark/Pivete/NUCLEO/loop-squash-$(date +%Y%m%d).log"

while true; do
  echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) === CICLO ===" >> "$LOG"
  # Todos os PRs abertos
  PRS=$(gh pr list --state open --json number,mergeable,headRefName --jq '.[] | "\(.number)\t\(.mergeable)\t\(.headRefName)"' 2>/dev/null)
  while IFS=$'\t' read -r num mrg head; do
    [ -z "$num" ] && continue
    if [ "$mrg" = "MERGEABLE" ]; then
      # Squash se sem conflito (padrão revelado: botão verde = squash)
      if gh pr merge "$num" --squash --delete-branch --repo "$REPO" >> "$LOG" 2>&1; then
        echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) MERGED $num ($head)" >> "$LOG"
      else
        echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) MERGE_FAIL $num ($head)" >> "$LOG"
      fi
    elif [ "$mrg" = "CONFLICTING" ]; then
      # Só rebase canônico se for branch do dependabot (não invasão de branch alheio)
      case "$head" in
        dependabot/*)
          gh pr comment "$num" --body "@dependabot rebase" >> "$LOG" 2>&1 && \
            echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) REBASE_REQUESTED $num ($head)" >> "$LOG"
          ;;
        *)
          echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) SKIP_CONFLICT_NON_DEPENDABOT $num ($head)" >> "$LOG"
          ;;
      esac
    fi
  done <<< "$PRS"
  sleep 60
done
