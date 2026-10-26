---
name: centraldark-remote-reconciliation
description: "Use when reconciling dirty CentralDark checkouts."
version: 1.0.0
author: Hermes Agent
license: internal
related_skills:
  - centraldark-ops
  - devops-integrado-tailscale-centraldark
  - reconciliacao-diaria-centraldark
metadata:
  hermes:
    tags: [centraldark, reconciliation, git, ssh, proof, dirty-worktree]
    category: devops
---

# CentralDark remote reconciliation

## When to Use

Use this skill for a dirty CentralDark checkout with a mirror, historical source, or canonical Git ref that may diverge.

Use this class skill when a CentralDark file exists in a dirty remote checkout and may also exist as a mirror, historical source, or newer canonical Git ref. The goal is to establish current provenance, preserve contributions, and promote only a tested, unambiguous delta.

## Always-on contract

- Keep one existing owner and one executor; route through the authorized SSH/Tailscale binding already available.
- Treat reported hashes, commits, receipts, and conflict counts as claims until independently read back.
- Never mutate the dirty checkout while investigating: no `git pull`, `git reset`, `git clean`, or `git stash`.
- Use an isolated temporary directory for all merge experiments; never write the candidate over the worktree file.
- `UNKNOWN != PASS`: a historical source, mirror match, HTTP/API success, or successful merge command does not prove current reconciliation.
- Preserve local and canonical contributions when intent cannot be resolved deterministically; do not force a merge.
- Re-read the exact target, refs, status, and hashes after analysis. Report `FIXED_POINT` only for the measured sub-scope; a stale repository HEAD blocks a global claim even when the target subtree matches the canonical ref.
- Compare tracked content with Git object hashes or canonical tree entries, not only raw filesystem SHA-256; checkout filters and line endings can make byte hashes differ while Git content is equal.
- Investigate untracked exception files by searching real consumers and runtime entrypoints before promoting them; preserve generated/ignored runtime data and do not version an unconsumed helper merely to make the tree look complete.
- Return a compact receipt with target, current HEAD, canonical ref, exact hashes, operations, conflict state, independent readback, fixed-point scope, and next cursor.

## Procedure

1. Identify the exact remote target and owner through the existing route. Confirm the repository root and target path before reading or writing.
2. In one captured read-only probe, collect `git rev-parse HEAD`, `git rev-parse origin/main` (or the explicitly named canonical ref), `git status --short --branch`, and SHA-256 plus size/line count for each relevant surface.
3. Locate prior receipts and scratch artifacts, but bind them to their recorded base/source hashes. Reuse evidence only when its vertices match the current claim scope; otherwise classify it as historical.
4. Construct explicit three-way inputs in scratch: base, local/worktree version, and canonical version. Use `git merge-file --diff3 -p` and capture its exit code, output hash, conflict regions, and marker lines.
5. Review every conflict region semantically. Classify it as local-only, canonical-only, identical, safely composable, or ambiguous. A changed conflict count after changing the base is lineage drift, not resolution.
6. Run syntax/fixture/render checks appropriate to the artifact only on the scratch candidate. If any region remains ambiguous or markers remain, stop promotion and preserve the evidence.
7. Promote only the smallest candidate that has zero unresolved conflicts, preserves both required contributions, and has concrete tests plus independent readback. If those conditions are absent, leave the worktree unchanged.
8. Re-measure the refs, status, target hashes, and candidate outcome. Emit the receipt and set `NEXT_CURSOR` to the exact unresolved dependency or next autonomous measurement.

## Multi-body sync: Local (K:/) → GitHub main → VPS

Use when local Windows checkout has commits ahead and possibly dirty, VPS is behind, and both must converge on GitHub main.

1. Stage and commit local changes on K:/:
   ```bash
   cd K:/ && git add -A && git status
   git commit -m 'descriptive message'
   ```
2. Pull rebase to integrate any remote-ahead commits (VPS or other pen may have pushed):
   ```bash
   git pull --rebase origin main
   ```
3. If conflicts arise during rebase:
   - Edit the conflicted file: remove `<<<<<<<`, `=======`, `>>>>>>>` markers.
   - When both sides contributed identical lines, keep ONE copy — do not leave duplicates.
   - On Windows, skip the editor popup during continue: `GIT_EDITOR="true" git rebase --continue`.
4. Push to GitHub:
   ```bash
   git push origin main
   ```
   If rejected again (`fetch first`), repeat step 2–4. Another pen pushed between your pull and push.
5. Pull on VPS:
   ```bash
   ssh segredo-vpss 'cd /root/CentralDark && git pull origin main && git log --oneline -3'
   ```
6. Verify all three bodies share the same HEAD.

Pitfall: when `git push` is rejected with "remote contains work you do not have locally", always `git pull --rebase` — never force-push main.

Pitfall: Vite dev mode only reads `.env` and `.env.local`, NOT `.env.production.local`. When Supabase or other integration vars live only in `.env.production.local`, dev mode gets `undefined` and throws. Fix: `cp .env.production.local .env.local` on each body. Commit `.env.example` with placeholder keys so the next developer knows which vars are required. Never commit `.env.local` — `*.local` in `.gitignore` protects it.

## Working recipe (three-way dirty worktree)

Use the reusable three-way recipe in `references/three-way-dirty-worktree.md`. It contains the command shape and a decision table without tying the workflow to a single file or incident.
