# Gate red on ALL PRs — recipe bank (CentralDark)

Condensed from real incidents (Aug 2026). Every "all PRs red on same gate" case had
the cause on `origin/main`, NOT in any PR diff. Diagnose first with:
`git ls-tree origin/main <path-from-error>` — if it already exists on main, the PR inherits it.

## Case A — submodule flattened to directory (PR #1221 / issue #1230)
Symptom in `Juiz determinístico` / `porta-de-entrada` log:
```
git submodule status
##[error]fatal: no submodule mapping found in .gitmodules for path 'skills/pretty-mermaid'
Bad Submodules found, removing existing files
```
Root cause: main declared `skills/pretty-mermaid` as submodule (gitlink `160000`),
the PR flattened it to a plain dir (`040000` tree) but left `.gitmodules` declaring it.

Minimal fix (in the PR, not main):
```bash
# in a worktree checked out at the PR head
printf '' > .gitmodules                       # empty it
git add .gitmodules
# ensure NO 160000 gitlink remains for that path in the index
git ls-files -s skills/pretty-mermaid | awk '$1=="160000"{print $4}' | while read f; do git rm --cached "$f"; done
git commit -m "fix(git): remover entrada órfã de submodule (PR achatou p/ dir)"
```
Contraproof: `git submodule status` → exit 0.

## Case B — compatibility alias hard-coded in forbidden list (PR #1231 / issue #1188)
Symptom: `Lupa Drift Guard` FAILURE on EVERY open PR, even empty ones.
Root cause: `.agents/skills/tecnica-da-lupa/SKILL.md` is a LEGIT `COMPATIBILITY_ALIAS`
(`status: COMPATIBILITY_ALIAS`, `owner: meta-lupa`, `IS_SECOND_*=false`) kept on main for
historical-call discovery. But `lupa-drift-guard.yml` listed `tecnica-da-lupa` by name:
```bash
for proibido in tecnica-da-lupa metalupa-bayesiana-canonica lupa-premium; do
```
So the guard failed on all PRs regardless of content.

Minimal fix (MAIN-branch workflow, needs PERMITO-SEGREDO + explicit go → open a PR, never push main):
- Remove `tecnica-da-lupa` from the name list.
- Add a semantic guard that only blocks real second-authority skills:
```bash
for base in .agents/skills .claude/skills .workspace/skills; do
  for d in "$base"/*/; do
    [ -f "${d}SKILL.md" ] || continue
    if grep -qiE '^(type|status):[[:space:]]*redirect' "${d}SKILL.md" 2>/dev/null; then continue; fi
    if grep -qiE 'IS_SECOND_(SKILL|OWNER|AUTHORITY)=true' "${d}SKILL.md" 2>/dev/null; then
      echo "skill paralela detectada: ${d}"; exit 1
    fi
  done
done
```
Contraproof (run both):
- current state (alias present) → PASS
- planted `IS_SECOND_SKILL=true` skill → FAIL (exit 1) — proves gate not weakened

## General acceptance gate
A gate fix is accepted ONLY when local sim shows fixed-state PASS + planted-violation FAIL.
Then push; the self-hosted runner confirms mechanically (it may be busy/queued — wait, do not spin).
