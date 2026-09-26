#!/usr/bin/env bash
set -euo pipefail

REPO="${1:-/root/CentralDark}"

echo "CENTRALDARK PREFLIGHT — READ ONLY"
echo "Repo: $REPO"

checks=(
  "LEIA-ME-IA.md"
  "AGENTS.md"
  ".agents/skills/session-intelligence-harvester/SKILL.md"
  ".agents/skills/knowledge-compiler/SKILL.md"
  ".agents/skills/meta-lupa/SKILL.md"
  "docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md"
)

for rel in "${checks[@]}"; do
  if [[ -e "$REPO/$rel" ]]; then
    printf "FOUND\t%s\n" "$rel"
  else
    printf "MISSING\t%s\n" "$rel"
  fi
done

if [[ -d "$REPO/.git" ]]; then
  echo
  echo "GIT:"
  git -C "$REPO" status --short --branch
  git -C "$REPO" rev-parse HEAD
else
  echo "GIT=UNKNOWN (no .git at target)"
fi

echo
echo "MUTATION=ZERO"
