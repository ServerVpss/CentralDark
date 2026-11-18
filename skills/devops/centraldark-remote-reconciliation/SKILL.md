---
name: centraldark-remote-reconciliation
description: "Use when reconciling dirty CentralDark checkouts vs main."
version: 2.0.0
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
- Prove that the implementation target is a Git checkout before using Git status, branch, or HEAD as evidence; a copied or extracted directory is a working artifact, not a canonical owner.
- Reconcile the owner before reconciling the file: if the canonical checkout is dirty, divergent, or contains deletions of related surfaces, preserve it and classify promotion as `BLOCKED` until provenance is resolved.
- Treat a successful tool exit with missing or truncated evidence as `UNKNOWN`; rerun a bounded, machine-readable probe before making a claim.

## Procedure

1. Identify the exact remote target and owner through the existing route. Confirm the repository root and target path before reading or writing. First run `git rev-parse --show-toplevel` and classify non-repository paths as extracted/copy artifacts; do not edit them as if they were the owner.
2. In one captured read-only probe, collect `git rev-parse HEAD`, `git rev-parse origin/main` (or the explicitly named canonical ref), `git status --short --branch`, and SHA-256 plus size/line count for each relevant surface. Preserve the complete probe output in a file or structured record when the terminal may demote long output; an exit code alone is insufficient proof.
3. Locate prior receipts and scratch artifacts, but bind them to their recorded base/source hashes. Reuse evidence only when its vertices match the current claim scope; otherwise classify it as historical.
4. Construct explicit three-way inputs in scratch: base, local/worktree version, and canonical version. Use `git merge-file --diff3 -p` and capture its exit code, output hash, conflict regions, and marker lines.
5. Review every conflict region semantically. Classify it as local-only, canonical-only, identical, safely composable, or ambiguous. A changed conflict count after changing the base is lineage drift, not resolution.
6. Run syntax/fixture/render checks appropriate to the artifact only on the scratch candidate. If any region remains ambiguous or markers remain, stop promotion and preserve the evidence.
7. Promote only the smallest candidate that has zero unresolved conflicts, preserves both required contributions, and has concrete tests plus independent readback. If those conditions are absent, leave the worktree unchanged.
8. Re-measure the refs, status, target hashes, and candidate outcome. Emit the receipt and set `NEXT_CURSOR` to the exact unresolved dependency or next autonomous measurement.

## Multi-body sync: local checkout → GitHub main → other bodies

Use when a local checkout is ahead and dirty, another body is behind, and both must converge on `origin/main`. The safe order is **reconcile first, publish second** — never publish a tree you have not classified.

1. Classify before touching anything. Ask the resolver for the plan (see *Auto-sync resolver* below). Never stage the whole tree: `git add -A` sweeps unrelated local work into a commit whose message names one file, and that has already shipped private edits to `main` in this repo.
2. Stage exactly the intended paths, then confirm the index matches that list:
   ```bash
   git add -- <path> [<path> ...]
   git diff --cached --name-only   # must equal the intended set, nothing else
   git commit -m "<message>" -- <path> [<path> ...]
   ```
   Committing with an explicit pathspec ignores anything else that happens to be staged. Put the message flag **before** the `--`: after it, every token is a path, so `git commit -- <paths> -m "msg"` fails with *"did not match any file(s) known to git"*.
3. Publish through the PR gate, not by pushing to `main` directly: branch → push → `gh pr create` → merge squash. Direct `git push origin main` is the one path that bypasses review and CI.
4. When `git push` is rejected because the remote moved, fetch and rebase **your branch**, not a dirty shared checkout:
   ```bash
   git fetch origin main
   git -c rebase.autoStash=true rebase --onto origin/main <base> <branch>
   ```
   Never force-push `main`. Never `git reset --hard` a checkout that holds local work — that is how uncommitted work is destroyed.
5. Bring the other bodies forward with an explicit ref, and prove it with the ref read back:
   ```bash
   ssh <body> 'cd <repo> && git fetch origin main && git checkout <main-sha> -- <paths-with-local-changes>'
   ```
   A checkout that is many commits behind cannot be "aligned" file by file in one pass: aligning the mission's paths does not move HEAD. Report the remaining distance to `origin/main` as `BLOCKED`/`UNKNOWN` instead of calling the body synchronized.
6. Verify convergence by reading the same object everywhere: `git rev-parse origin/main` on each body must return the same SHA, and the mission's paths must be byte-identical to it.

Pitfall: `git pull --rebase` on a dirty shared checkout mixes your local work with remote commits and can resurrect it into an unrelated commit. Rebase a dedicated branch; leave the shared checkout's local work untouched.

Pitfall: Vite dev mode only reads `.env` and `.env.local`, NOT `.env.production.local`. When Supabase or other integration vars live only in `.env.production.local`, dev mode gets `undefined` and throws. Fix: `cp .env.production.local .env.local` on each body. Commit `.env.example` with placeholder keys so the next developer knows which vars are required. Never commit `.env.local` — `*.local` in `.gitignore` protects it.

## Mirror body (Samba/VM) → main

Use when a *body* must be brought in line with `origin/main` and Git alone cannot decide it: a CentralDark tree exposed over Samba (no `.git`) served live by the VM dev server, **or** a Git checkout that is far behind and dirty. Both ask the same question — stale copy or real local work? Full recipe: `references/mirror-body-reconciliation.md`.

Always-on rules for this body:

- **Prove the consumer before writing.** `HTTP 200` on the VM port proves a server, not the owner. Fetch a source module over the dev server (`GET :8080/src/<path>`) and compare its tokens against the file on disk; only a match proves the mirror is the live source.
- **Prove the mirror file is an older version of `main`, not local work.** Compare its `sha256` against `git show <commit>:<path>` across the file's history. No match anywhere means someone edited it outside Git — diff and inspect before touching it.
- **Back up before any write or delete**, inside the mirror itself (`<mirror>/.auto-sync/backup-<date>/`), so the VM owner can recover without you.
- **Do not become a second writer outside your delta.** Files the sync owner still reports as conflicted belong to that owner; reconcile only the files your mission names and report the rest as pending.

## Auto-sync resolver (cd40.v1) — large dirty set against main

Use when a checkout has dozens of dirty paths and a "N conflicts" report. The owner of that decision is `scripts/auto-sync/AUTO-SYNC-MASTER.py`; never hand-resolve path by path before asking it.

1. Persist the plan, never read it from a scrolling terminal:
   ```sh
   python3 scripts/auto-sync/AUTO-SYNC-MASTER.py --dry-run --no-fetch --remote-ref origin/main --json > /tmp/plan.json
   ```
   The claim is the parsed object: `state`, `conflicts`, `conflict_hunks`, `overlap`, `auto_mergeable`, `non_overlap_dirty`, `behind`, `mutated_worktree`. `mutated_worktree=false` must hold; if it does not, the plan is not a plan.
2. Back up inside the owner before any write: tar the touched paths plus a `git stash create` snapshot into `.auto-sync/backup-reconcile-<TS>/`, and record the SHA so recovery does not depend on memory.
3. Classify each `conflict_paths[]` entry by reason, not by count. Three outcomes: exclusive local work (preserve as a patch, do not publish), superseded artifact (align to `origin/main`), consistent removal on both sides (retire).
4. Before publishing an "exclusive" delta, prove it is or is not live: search the whole tree for its markers (route, constant, symbol), look for a consumer/test/doc, and check whether the port its code needs is even listening. Zero consumers plus a dead port means patch-only preservation, not a merge.
5. Align with `git checkout <main-sha> -- <path>`, one path group at a time, and re-run the plan afterwards. Treat `conflicts` dropping to `0` with `state=DIRTY_RECONCILE_READY` as the machine verdict.
6. When the resolver itself is wrong, fix the resolver. A classifier that returns "path shape or delete" without consulting the other two sides turns already-reconciled paths into permanent conflicts, and a stale-workaround in the checkout leaves the owner broken for every other body. Patch the probe so each existence combination is decided by content, keep genuinely divergent cases as conflicts requiring an owner, and prove the change with the same `--dry-run --json` before/after.
7. Reconciling conflict paths does **not** advance HEAD. Gates that read several files will still fail on paths the plan never listed, because the checkout is many commits behind; align the gate's own input files (the test script plus every file it reads) before claiming the gate passes, and report the remaining distance to `origin/main` as `BLOCKED`/`UNKNOWN`, not `PASS`.

## Commit gate pitfalls (CentralDark repo)

- The `pre-commit` hook fails **closed and silently** when `python3` lacks PyYAML: it prints the registry `PASS` lines, then exits 1 with no message. Fix the environment (`python3 -m pip install pyyaml`), do not bypass with `--no-verify`.
- Capture the real exit code: piping `git commit` into another command reports that command's status. Redirect to a file, then read `$?`.
- A stale `.git/index.lock` from a dead process blocks every write. Confirm no `git` process is running, then remove it — never remove it blind. On the Windows host it reappears while a background git/editor process is mid-operation; re-check before assuming the lock is stale.
- **`git checkout <ref> -- <paths>` writes to the index, not only the worktree.** Any later `git commit` publishes every staged path, so a commit that names one file in its message ships unrelated local work to `main`. Before committing, `git diff --cached --name-only` must equal exactly the intended set — commit with an explicit pathspec (`git commit -- <paths>`), or unstage with `git restore --staged -- <paths>`. After a leaked commit, revert those paths to the pre-leak ref and restore the work locally with `git restore --source=<snapshot-sha> --worktree -- <paths>`; do not delete the user's work to clean up the mistake.
- **Never `git reset --hard` on an owner checkout.** It silently deletes local work that no branch holds. When it happens, recover from the pre-operation snapshot (`git stash create`, autostash commit, reflog dangling commit) with `git restore --source=<sha> --worktree -- <paths>` and verify with an empty `git diff <sha> -- <paths>`.
- A branch whose parent was squash-merged shows as `CONFLICTING` even when it adds a clean change. Rebase it onto the new main dropping the already-merged commit: `git -c rebase.autoStash=true rebase --onto origin/main HEAD~1` — autostash keeps a dirty worktree intact instead of forcing a stash/reset cycle.

## Working recipe (three-way dirty worktree)

Use the reusable three-way recipe in `references/three-way-dirty-worktree.md`. It contains the command shape and a decision table without tying the workflow to a single file or incident.
