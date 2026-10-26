# Three-way analysis of a dirty worktree

## Inputs

Name the vertices before running the merge:

- `BASE`: the checked-out `HEAD` blob, unless a different base is explicitly proven.
- `OURS`: the current worktree file, copied without modifying it.
- `THEIRS`: the current canonical ref blob, commonly `origin/main`; a historical source is valid only when its provenance and purpose are recorded.

## Read-only probe

```sh
git rev-parse HEAD
git rev-parse origin/main
git status --short --branch
sha256sum path/to/worktree-file
git show HEAD:path/to/file | sha256sum
git show origin/main:path/to/file | sha256sum
```

On Windows, run the commands through the existing SSH/Tailscale route with POSIX shell syntax appropriate to the remote host. Capture stdout/stderr and exit status; do not rely on a summarized UI line.

## Isolated candidate

```sh
d=$(mktemp -d)
git show HEAD:path/to/file > "$d/base"
cp path/to/file "$d/ours"
git show origin/main:path/to/file > "$d/theirs"
set +e
git merge-file --diff3 -p "$d/ours" "$d/base" "$d/theirs" > "$d/candidate"
rc=$?
set -e
sha256sum "$d/base" "$d/ours" "$d/theirs" "$d/candidate"
grep -nE '^(<<<<<<<|=======|>>>>>>>)' "$d/candidate" || true
printf 'MERGE_FILE_RC=%s\n' "$rc"
```

Remove the temporary directory only after the receipt has recorded its path or artifact hashes. Never use the scratch command to overwrite `path/to/file`.

## Decision table

| Observation | Decision |
|---|---|
| Candidate has markers or merge exit is nonzero | Keep scratch only; classify unresolved; do not promote |
| Candidate has no markers but base/source hashes differ from prior scratch | Reclassify prior scratch as historical and re-run checks |
| Local and canonical edits touch disjoint, understood regions | Candidate may proceed to artifact-specific tests |
| Same region has different semantics or duplicated code | Preserve both in evidence; require a discriminant or owner decision |
| Tests pass but current refs/status changed | Recompute candidate against the new vertices |
| Candidate passes tests and independent readback confirms exact scope | Fixed point may be claimed for that scope only |

A merge tool's exit code is a signal, not the cause. Diagnose with the actual markers, diff, artifact checks, and current ref/status readback.