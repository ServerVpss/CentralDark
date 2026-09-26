---
name: git-local-remote-workflow
description: "Git local→remote: local velho/na frente, rebase/merge, dirty/clean, HEAD mismatch."
---

# Git Local→Remote Workflow

**Scope:** reconcile local branch with remote `origin/main` (multi-writer, shared clone).  
**Owner:** HERMES-CASA when acting on CentralDark.  
**Guardrail:** never push dirty/orphaned commits; never assume "I am owner" without PR #1381 or explicit handoff.

## Core distinction (user correction, 2026-09-01)

- If `origin/main` has commits local doesn't have → local is **behind** (stale).
- If local has commits remote doesn't have → local is **ahead** (must decide: push? rebase? keep local-only?).
- **Both can be true** at the same time: ahead 8 + behind 2 → state is **diverged**, not just "late".

This is the difference between:
- "local is ahead of remote" → local has work remote doesn't.
- "local is behind remote" → local misses commits remote already has.
- "diverged" → both: local has private work AND misses public work.

## Decision rule (what to do, not just what to measure)

| Local state | Motive action | Notes |
|---|---|---|
| Behind only (ahead 0, behind >0) | `git fetch` + `git merge` or rebase, then continue | no push of your own commits needed |
| Ahead only (ahead >0, behind 0) | Decide: push to remote, keep local-only, or squash/rewrite | if it belongs in GitHub, push; if it's local investigation, keep local |
| Diverged (ahead>0 AND behind>0) | Bring remote commits in + then decide on local commits | Rebase or merge; resolve conflicts; rewrite only if you own the branch and it's safe |
| Dirty working tree ( M / ?? files) | Stash or clean before moving HEAD, or decide those changes are part of the next commit | `git status --short` tells you what's modified/untracked |

## Why this matters in CentralDark

- The clone is shared: multiple agents can be writing.
- `origin/main` advances via chore/bot commits (panel, notion-sync, emoji-heritage fix).
- A snapshot like "ahead 18 / behind 0" can become "ahead 1 / behind 2" in seconds.
- Never cache "I am ahead / behind" across turns without re-measuring.

## Correct measurement sequence

1. `git fetch origin --prune`
2. `git rev-list --left-right --count origin/main...HEAD` → "behind ahead"
3. Interpret: behind = missing remote commits, ahead = local commits not on remote.
4. If dirty: `git status --short` before moving HEAD.
5. Then decide: fetch-and-merge, fetch-and-rebase, push, or hold local-only.

## Common wrong moves (pitfalls)

- Treating "ahead" as "I am ahead, I can push anything" — no: only push what belongs to that branch and that owner.
- Treating "behind" as "I must rebase everything" — maybe you just need to fetch and merge, or maybe local work is independent.
- Treating "diverged" as "something broke" — no: it's normal when local and remote evolved separately.
- Assuming "I am owner" from a label, bot, or status — ownership comes from PR #1381 or explicit handoff, not from a name.

## Reference

- `git rev-list --left-right --count A...B` — counts commits unique to each side.
- `git status --short` — modified/untracked inventory before touching HEAD.
- `git fetch origin --prune` — refresh remote refs without touching local branches.
