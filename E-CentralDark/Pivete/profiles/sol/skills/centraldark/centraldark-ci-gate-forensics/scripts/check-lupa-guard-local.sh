#!/usr/bin/env bash
# Local replica of the Lupa Drift Guard "MetaLupa canônica única" step.
# Use to contraprove a drift-guard fix WITHOUT waiting for the self-hosted runner.
# Run from a worktree checked out at the PR head (or origin/main to test base state).
#
# Both directions must hold:
#   - real repo state (alias present, no parallel skill)  -> exit 0 (PASS)
#   - planted IS_SECOND_*=true skill                       -> exit 1 (FAIL, gate intact)
set -euo pipefail

echo "== drift-guard local check (replica of lupa-drift-guard.yml step) =="
test -f .agents/skills/meta-lupa/SKILL.md || { echo "canonica ausente"; exit 1; }

# name-list portion (after fix: tecnica-da-lupa removed)
for proibido in metalupa-bayesiana-canonica lupa-premium; do
  for base in .agents/skills .claude/skills .workspace/skills; do
    if [ -d "$base/$proibido" ]; then
      echo "skill removida reapareceu: $base/$proibido"; exit 1
    fi
  done
done

# semantic guard: block only real second-authority skills, allow redirect/alias
for base in .agents/skills .claude/skills .workspace/skills; do
  for d in "$base"/*/; do
    [ -f "${d}SKILL.md" ] || continue
    if grep -qiE '^(type|status):[[:space:]]*redirect' "${d}SKILL.md" 2>/dev/null; then
      continue  # compatibility alias allowed (e.g. tecnica-da-lupa)
    fi
    if grep -qiE 'IS_SECOND_(SKILL|OWNER|AUTHORITY)=true' "${d}SKILL.md" 2>/dev/null; then
      echo "skill paralela detectada: ${d}"; exit 1
    fi
  done
done

echo "PASS: meta-lupa canonical; compatibility aliases allowed; no parallel skill"
