# Pitfall: BLOCKED_SKILL_IDENTITY false-block (lupa-bayesiana)

## What happened (2026-07-22)
A long HUB mission demanded the canonical `lupa-bayesiana` skill. The agent checked the
checked-out `main` branch, found no `SKILL.md` with `name: lupa-bayesiana`, saw a `.lnk`
shortcut to a manually downloaded copy, and returned `BLOCKED_SKILL_IDENTITY` — STOP-WRITE.

That was WRONG. The canonical skill lives on a NON-DEFAULT branch:
- `origin/pivete/dev:.agents/skills/lupa-bayesiana/SKILL.md` (git blob `b71af825`).

## Correct procedure before declaring BLOCKED_SKILL_IDENTITY
1. `git fetch origin --prune`
2. Search ALL remote refs, not just the checked-out branch:
   - `git ls-tree -r origin/pivete/dev --name-only | grep -i lupa-bayesiana`
   - `git show origin/pivete/dev:.agents/skills/lupa-bayesiana/SKILL.md`
3. A `.lnk` shortcut or manually downloaded copy on disk is NOT the canonical source.
   Missions explicitly forbid using a manual download as source of truth.
4. Only return BLOCKED if, after fetching all refs, the skill is truly absent or two
   conflicting candidates exist with no provenance to break the tie.

## Why it matters
Returning BLOCKED on a false skill-identity gap kills an entire mission run unnecessarily
and wastes the user's authorization token. Always resolve canonical sources across all
remote refs first.

## Escalation (same session): "PARE DE PROCURAR ARQUIVOS SOLTOS"

After the agent FINALLY found `lupa-bayesiana` on `origin/pivete/dev`, it kept hunting for
the skill as a loose file on disk (e.g. `METALUPA-BAYESIANA-CANONICA.md`, `BOOT-METALUPA-*.md`)
instead of resolving it to its canonical local destination. The user stopped it:
**"PARE DE PROCURAR ARQUIVOS SOLTOS. A SKILL CANÔNICA É origin/pivete/dev:.agents/skills/lupa-bayesiana/SKILL.md — O DESTINO LOCAL CANÔNICO É E:\CentralDark\Pivete\CentralDark\.agents\skills\lupa-bayesiana\"**.

### Lesson (FIRST-CLASS style/workflow correction)
- The canonical source is a **git tree path**, not a downloaded file. Stop searching the
  filesystem for loose `.md` / `.lnk` copies once the git path is known.
- The canonical LOCAL destination is fixed:
  `E:\CentralDark\Pivete\CentralDark\.agents\skills\lupa-bayesiana\`
  (the same `.agents/skills/<nome>/` layout the repo uses). Do NOT save into `E:\CentralDark`
  root, do NOT create `V2`, a second skill, or a parallel file.
- Recovery recipe when the skill is missing locally but present on a remote branch:
  1. `git switch -c feat/<slug>-<timestamp>` (work branch, preserves history)
  2. `git checkout origin/pivete/dev -- .agents/skills/lupa-bayesiana/SKILL.md`
  3. Read it, then extend IN PLACE (same artifact) — no parallel copy.

## Side pitfall: `git add -A` dies on junk untracked files
In the CentralDark repo a junk `NUL` (95-byte ASCII text, untracked) made `git add -A`
fail with `error: short read while indexing NUL / failed to insert into database`.
Workaround: stage the explicit path instead of `-A`:
`git add .agents/skills/lupa-bayesiana/` (leave the junk `NUL`, `supabase/.temp/*`,
`LEMBRANÇAS*.txt` untracked — they are outside scope and not yours to clean).
Never use `git add -A` / `git clean` blindly in this repo.
