# Full inventory scans for Casa roots

Use this when the user asks for a full map, dedupe, C/E comparison, or proof that nothing useful remains unmined.

## Contract

- Treat `full` literally: discover every directory under the requested roots. Do not globally skip `.git`, `node_modules`, `dist`, `build`, `.cache`, or generated trees during discovery; mark expensive content as deferred only after the path exists in inventory.
- Keep the scan database and checkpoints in Hermes scratch, never under `C:\CentralDark` or `E:\CentralDark`; the target roots stay read-only until a later explicit execution manifest.
- A timeout is not a reduced-scope success. Save a checkpoint and return `PARTIAL_NOT_PASS` with `NEXT_CURSOR`, then resume from that cursor instead of restarting.
- `sample`, `SIZE_ONLY`, equal path, or equal size are not content identity. Prove dedupe by full SHA-256 and byte equality where necessary.
- Do not classify repos or deltas as active/stale/generated from origin URL or folder name alone. Classify after evidence: git graph, worktree relationship, tracked/untracked state, content hash, owner, and consumer.

## Procedure

1. Create or reuse a SQLite inventory in scratch with tables for directories, files, git repos, checkpoints, and receipts.
2. Discovery phase: persist each directory with `path`, `realpath`, `parent`, `type`, `size`, `mtime`, attributes/reparse marker, git marker, `scan_status`, and error if inaccessible.
3. Git graph phase: for every `.git` or worktree marker, capture `toplevel`, `git-common-dir`, HEAD, branch, origin, refs, worktree relationship, merge/rebase/cherry-pick state, dirty/staged/untracked counts, ahead/behind, merge-base to current main, exclusive commits, and exclusive tree diff.
4. Content index phase: persist every file with `path`, `relative_path`, `size`, `mtime`, then hash full contents with SHA-256. Group by size only as a candidate prefilter; never as proof.
5. C/E comparison phase: compute complete `C_ONLY`, `E_ONLY`, `C_E_IDENTICAL`, `C_E_SAME_PATH_DIFFERENT_CONTENT`, `SAME_HASH_DIFFERENT_PATH`, `GIT_TRACKED`, `GIT_UNTRACKED`, `GENERATED_CANDIDATE`, `CACHE_CANDIDATE`, `UNMINED_CANDIDATE`, and `UNKNOWN` sets.
6. Completeness gate: emit a final receipt only when discovery is complete for every root, all discovered dirs/files are accounted for, reparse points and git objects are accounted for, and content hashing is complete or every inaccessible item is explicitly listed.
7. Include conservation counters: `discovered_dirs = completed_dirs + inaccessible_dirs` and `discovered_files = indexed_files + inaccessible_files`. No item may disappear between counters.

## Output shape

Return a compact receipt, not a tool menu:

```text
SCAN_ENGINE_PATCH_RECEIPT=
DB_PATH=
DISCOVERY_COMPLETE=
CONTENT_INDEX_COMPLETE=
CONSERVATION_COUNTERS=
C_ONLY=
E_ONLY=
IDENTICAL=
DIFFERENT_CONTENT=
INACCESSIBLE=
UNKNOWN=
RECEIPT_SHA256=
INVENTORY_SHA256=
NEXT_CURSOR=
FIXED_POINT=
```

If incomplete, `FIXED_POINT=false`, `STATUS=PARTIAL_NOT_PASS`, and `NEXT_CURSOR` names the next pending directory/file. Continue automatically in batches when allowed.
