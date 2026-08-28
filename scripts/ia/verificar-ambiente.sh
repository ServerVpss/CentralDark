#!/usr/bin/env bash
set -euo pipefail

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "BLOQUEADO: este diretório não é um repositório Git."
  exit 20
fi

branch="$(git branch --show-current)"
sha="$(git rev-parse HEAD)"
root="$(git rev-parse --show-toplevel)"
status="$(git status --short)"

printf 'BOOT CENTRALDARK\n'
printf 'Diretório: %s\n' "$root"
printf 'Branch: %s\n' "${branch:-DETACHED_HEAD}"
printf 'Commit: %s\n' "$sha"

if [[ -n "$status" ]]; then
  echo "Workspace: ALTERADO"
  printf '%s\n' "$status"
else
  echo "Workspace: LIMPO"
fi

if [[ -z "$branch" ]]; then
  echo "BLOQUEADO: HEAD destacado. Selecione uma branch autorizada."
  exit 21
fi

case "$branch" in
  main)
    echo "MODO: LEITURA SOMENTE"
    echo "BLOQUEADO: não editar, commitar ou fazer deploy diretamente na main."
    exit 10
    ;;
  pivete/dev)
    echo "MODO: DESENVOLVIMENTO"
    echo "Destino permitido: ambiente DEV."
    ;;
  pivete/auditoria)
    echo "MODO: AUDITORIA"
    echo "Destino permitido: ambiente AUDIT/STAGING."
    ;;
  missao/*|feature/*|fix/*|chore/*|docs/*|pivete/*)
    echo "MODO: BRANCH DE MISSÃO"
    echo "Confirme a branch-base, o escopo e o destino do PR antes de editar."
    ;;
  *)
    echo "BLOQUEADO: branch não reconhecida pelo protocolo CentralDark."
    exit 22
    ;;
esac

cat <<'EOF'

Leituras obrigatórias:
- AGENTS.md
- docs/COFRE/README.md
- docs/GOVERNANCA/FLUXO-PIVETE-DEV-AUDITORIA.md
- docs/GOVERNANCA/BOOT-IA.md

Antes do deploy:
editar → testar → commit → push → deploy do SHA → smoke test → evidência
EOF
