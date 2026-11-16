# Mirror body reconciliation (Samba share → VM dev server → main)

A CentralDark tree exposed over Samba has no `.git`, so Git cannot tell you whether a file is stale or locally edited. The dev server on the VM is the real consumer. This recipe establishes both facts before any write.

## 1. Prove the consumer

```bash
curl -sS -o "$SCRATCH/mod.ts" -w 'http=%{http_code}\n' \
  --connect-timeout 6 --max-time 25 "http://<vm-ip>:8080/src/lib/<module>.ts"
grep -oE '<token-a>|<token-b>' "$SCRATCH/mod.ts" | sort | uniq -c
grep -oE '<token-a>|<token-b>' "<mirror>/apps/<app>/src/lib/<module>.ts" | sort | uniq -c
```

Matching counts prove the dev server reads the mirror. A `200` alone does not.

Note: `createServerFn` modules are served as client RPC stubs, so server-only symbols (`user_roles`, SQL, secrets) legitimately do **not** appear in the served body. Verify those on disk, not over HTTP.

## 2. Classify each target file

```bash
for f in <paths>; do
  V=$(sha256sum "<mirror>/$f" | cut -d' ' -f1)
  M=$(git show "origin/main:$f" | sha256sum | cut -d' ' -f1)
  [ "$V" = "$M" ] && echo "MATCH $f" || echo "DIVERGENT $f"
done
```

For each `DIVERGENT`, find which historical commit the mirror matches:

```bash
for c in $(git log --format=%H -20 -- "$f"); do
  H=$(git show "$c:$f" | sha256sum | cut -d' ' -f1)
  [ "$H" = "$V" ] && { echo "MATCH_COMMIT=$c"; break; }
done
```

| Result | Meaning | Action |
|---|---|---|
| `MATCH` with `origin/main` | already reconciled | skip |
| matches an older commit | mirror is stale, no local work | safe to overwrite |
| matches no commit | edited outside Git | diff and inspect; treat as local work |

Line-ending differences alone do not explain a hash mismatch — check with `tr -d '\r'` before concluding, but a same-line-count mismatch is usually a real content difference.

## 3. Back up, then write

```bash
BK="<mirror>/.auto-sync/backup-$(date +%Y%m%d)"
mkdir -p "$BK/$(dirname "$f")" && cp "<mirror>/$f" "$BK/$f"
git show "origin/main:$f" > "<mirror>/$f"
```

For deletions, copy to the backup dir first, then `rm`. Record the retired paths in `$BK/legacy-deleted.txt` so the VM owner has an inventory.

## 4. Verify after writing

- Re-run the hash comparison: every written file must be byte-identical to `origin/main`.
- Re-fetch the module over the dev server and confirm the token counts flipped (HMR picks it up within seconds).
- Re-read the sync owner's `status.json`; if `last_sync` predates your writes, the sync has not reverted you.

## 5. What stays with the sync owner

A mirror with a conflict count in `status.json` has files outside your mission. Do not resolve them by hand — that makes you a second writer and destroys the owner's conflict accounting. Report the count, the overlap, and the next cursor.

## 6. Detached HEAD with a dirty worktree

When the local checkout sits on a detached HEAD far behind `origin/main` and carries uncommitted work:

```bash
git stash push -- <only the file that overlaps>
git merge --ff-only origin/main
git stash pop
```

Stash only the overlapping path, never the whole tree. Verify the restored file's `sha256` against a pre-stash backup before claiming preservation.

---

## Measured case: dirty git checkout 407 commits behind (not a Samba mirror)

A second body shape looks nothing like a Samba copy: a full `.git` checkout whose worktree carries local edits **and** whose HEAD sits hundreds of commits behind `origin/main`. The mirror rules above still apply, but the decision owner is the resolver, not a hash comparison.

Measured on `openkylin-vm:/home/CentralDark-OS/CentralDark` (2026-11-16):

| step | command | verdict |
|---|---|---|
| plan | `python3 scripts/auto-sync/AUTO-SYNC-MASTER.py --dry-run --no-fetch --remote-ref origin/main --json` | `32 conflicts`, `mutated_worktree=false` |
| align | `git checkout <main-sha> -- <path groups>` | `22` superseded paths aligned |
| retire | deleted on both sides | `8` legacy paths closed |
| preserve | exclusive local delta, zero consumers, dead port | `1` patch only, not published |
| re-plan | same command | `conflicts=0`, `state=DIRTY_RECONCILE_READY` |

Gates read after alignment (the gate's *own* input files must be aligned first, or the gate fails on paths the plan never listed): `verify:hud` 36/36, `verify-sync-safety` 8/8, `library-router` 27/27, MCP `pairing-consent-flow` 9/9. Cockpit served `HTTP 200` from the VM on `:8080` — a real consumer, so the body was validated by execution, not by inspection.

What the resolver did **not** do, and must not be claimed: it did not move HEAD. After full reconciliation the checkout was still 407 commits behind. Aligning a mission's paths and synchronizing a body are different claims; report the second one as `BLOCKED`/`UNKNOWN` until HEAD actually advances.

Two classifier defects were found this way and fixed in the owner (`#2080`, `#2081`): a probe that returned `PATH_SHAPE_OR_DELETE` whenever BASE, remote **or** local was absent, without consulting the other two sides, turns every already-reconciled path into a permanent conflict. Fix it in the resolver, never with per-path workarounds in the checkout.
