# Windows runtime hardening for Hermes profiles

Use this reference when auditing, backing up, restoring, or stabilizing a live Hermes profile on Windows. It supplements the official Hermes documentation; do not edit official binaries to implement these procedures.

## 0. Strict read-only observer lane

Use this lane when an executor is changing the profile and Pivete asks a separate observer to prove the real state without repairing, restarting, killing, checkpointing, or copying the live files.

1. Pin the exact native profile path and record an initial timestamp. Inventory file metadata before interpreting application status.
2. Avoid Hermes CLI commands that may initialize caches, rotate logs, update checks, or otherwise write as a startup side effect. Obtain version facts from package metadata and executable `VersionInfo` when literal zero-write scope is required.
3. Inventory complete process trees, not names alone. Distinguish installed **Hermes One**, a locally built **Hermes Desktop**, their Python backends, gateway, background terminals, and delegated workers by executable path, parent PID, start time, profile flag, loopback ports, and product version. Never print raw command lines; reduce them to safe booleans or recognized subcommands.
4. On Windows, query file users through Restart Manager only: `RmStartSession` → `RmRegisterResources` → `RmGetList` → `RmEndSession`. Never call restart/close actions. Query `state.db`, `-wal`, `-shm`, gateway/log/kanban locks, config, and memory locks separately so holder ownership remains attributable.
5. A lock filename is only a marker. Classify it as active only when an alive process holds it or the owning subsystem independently confirms it. Empty `.lock` sidecars with no holder are stale markers, not proof of contention.
6. For SQLite, sample `state.db`, WAL, and SHM more than once. Hash only when size and mtime remain stable across the read. Growth, WAL reset, or checkpoint between samples proves live activity and makes naïve file-copy backup unsafe; it does not by itself prove corruption.
7. Use SQLite URI `mode=ro&immutable=1` for main-database schema, aggregate counts, and `quick_check` without touching WAL/SHM. Label the result **main DB only**. Do not present it as the current committed WAL view.
8. Raw WAL files can retain preallocated frames from an older salt after reset. The valid current range is bounded by the SHM header's `mxFrame` (or the contiguous current-salt prefix), not by physical WAL length. Require matching SHM header copies, page size, `mxFrame`, `nPage`, and raw salt; ignore stale allocated tail frames.
9. Query only safe aggregates: session/source/model counts, message counts and timestamps, delegation states/owner PIDs, and lock expiry. Never print message bodies, titles, chat IDs, auth values, request headers, or event/result JSON.
10. Treat `sessions/request_dump_*` as credential- and prompt-bearing if its schema contains an Authorization field. Inventory only shape, count, size, hash, and ACL; never display values.
11. Compare config twice: raw bytes for evidence and parsed YAML for semantics. A concurrent rewrite that changes formatting/size but yields no semantic diff is reserialization, not a setting change.
12. Re-scan the requested backup destination during the observation. The executor may publish the final archive after the first inventory; an initial empty result is not a final absence claim.
13. Account for observer effects. Loading a skill can update `skills/.usage.json` usage telemetry, while the active session writes its own database/log state. In a literal no-write mission, minimize such calls, baseline known telemetry, and disclose any framework-maintained side effect instead of claiming that nothing changed anywhere.

Report four layers separately: observed evidence, interpretation, conclusion, and unresolved uncertainty. Multiple live holders are a concurrency fact; call it a defect only when it violates the requested singleton or causes proven divergence.

## 1. Inventory every SQLite database

Do not assume `state.db` is the only SQLite file. Search the durable profile scope by the SQLite header (`SQLite format 3`), not only by filename extension. A normal profile may contain official auxiliary stores such as:

- `state.db` — sessions, messages, routing and FTS;
- `verification_evidence.db` — official execution-evidence ledger; it is not a competing session or memory database;
- `response_store.db` — response/conversation support store;
- `cron/executions.db` — cron execution history.

Classify each database by source code/schema before calling it a duplicate. A second active `state.db` is a conflict; an official auxiliary DB with a different contract is not.

## 2. Consistent backup and isolated restore

For every SQLite database in the durable scope:

1. Use `sqlite3.Connection.backup()` while the source is live.
2. Never copy the live database together with raw `-wal` or `-shm` files as the canonical backup.
3. Run `PRAGMA integrity_check` and `PRAGMA foreign_key_check` on each snapshot.
4. Record schema, table counts and SHA-256 without printing message bodies or credentials.
5. Archive stable non-SQLite profile files separately from volatile/reinstallable caches.
6. Verify the ZIP CRC and assert that no `-wal`/`-shm` entry leaked into it.
7. Extract the same archive into **two different empty directories**:
   - **pristine evidence extraction** — never select it as `HERMES_HOME` and never run Hermes/tests inside it;
   - **disposable runtime extraction** — reserved for authorized startup/smoke testing.
8. Before executing anything, compare every pristine member to the archive manifest and record the pristine tree hash/counts.
9. Reopen every restored DB in both extractions and compare integrity, foreign keys, counts and hashes.
10. For `state.db`, also require session/message counts and equality between `messages`, `messages_fts`, and `messages_fts_trigram` when those tables exist.
11. Validate `config.yaml`, `USER.md`, `MEMORY.md`, sessions and skills in the pristine extraction without exposing secrets.
12. For the runtime drill, set `HERMES_HOME` explicitly to the disposable extraction and run only bounded, offline-safe smoke checks. Never point an import/restore command at the live profile merely to prove the backup.
13. After the smoke check, prove the live profile and pristine extraction remain unchanged. Record mutations in the disposable runtime copy separately; cache, logs and SQLite activity there are expected post-start evidence, not archive divergence.

Only after all checks converge may migration or corrective writes begin. Preserve the original profile until final approval.

### Scope traps in official backup/profile commands

Verify the installed Hermes source/docs before trusting a command name. In the Windows implementation audited in July 2026:

- full `hermes backup` and `hermes import` resolve `get_default_hermes_root()`; `--profile pivete` does **not** make those full commands a named-profile-only backup/restore contract;
- `hermes profile export` is a portability export, not a complete live rollback: named-profile export deliberately excludes `.env` and `auth.json`, and its staged `copytree` path is not the same as an online SQLite snapshot contract;
- `hermes profile import` safely refuses an existing profile and blocks traversal/links, but it can only restore what the export contained.

Use official commands only for the contracts their implementation actually provides. For a complete live named-profile rollback, combine stable-file capture with `sqlite3.Connection.backup()` for every durable database, then validate through the two-extraction drill above. Re-check this caveat after Hermes upgrades because the official implementation may improve.

### Windows SHA sidecar pitfall

Text writers may normalize a `.sha256.txt` sidecar to CRLF. GNU `sha256sum -c` under Git Bash can then treat `\r` as part of the archive filename. Write the sidecar as ASCII bytes with one LF (`\n`), then verify both the byte-level line ending and `sha256sum -c`. Sidecars normally contain a **relative archive filename**, so run `sha256sum -c` with the backup directory as the current working directory (or validate the referenced path explicitly); running it from another directory produces a false “No such file” failure. The archive may be valid even when a CRLF/cwd sidecar check fails, but the sidecar contract is not proven until the check passes from the correct directory.

### Backup ACL and atomic publication

If the archive contains `.env` or OAuth material, create it under a restricted staging path and grant only the current user, SYSTEM and Administrators **before secret-bearing bytes are published**. Verify both the archive and sidecar ACLs. Also inspect the parent directory: broad create/delete-child rights can let another identity remove or replace an otherwise protected child.

Before changing Windows ACLs, save a restorable baseline with `icacls <path> /save <acl-file>` and hash/stat that baseline. Remember that `Modify` does not grant `WRITE_DAC`: a non-elevated process may read/write the directory yet still receive `Access denied` on the first `/grant` or inheritance change. Run the ACL sequence with fail-fast behavior. If the first mutation fails, do **not** improvise with `takeown`, recursive resets, or repeated grants; verify the DACL stayed unchanged, re-check the backup hash, and ask Pivete for an elevated run. After an authorized elevated change, re-read the effective parent and child ACLs and test archive readability.

Publish only after hash, CRC, manifest coverage and SQLite checks pass. Use a unique generation ID and one atomic rename; never rewrite a timestamped final backup under the same name. Stat/hash before and after independent verification to detect a backup that changed during the audit. Re-run the hash/CRC checks after ACL changes to prove the current user can still read the final artifact.

When practical, encrypt secret-bearing backups at rest. Never inspect or print credential contents merely to validate a backup; presence, class, size and protected custody are enough.

### Restore hygiene and application consistency

A per-database online backup proves each SQLite snapshot is structurally consistent, but it is not automatically a globally atomic application snapshot. Record capture start/end times and the active gateway/dashboard processes. If exact cross-store consistency is required, quiesce writers under an authorized procedure or prove that the stores have independent contracts.

Classify non-SQLite files before archiving. Treat lock files, PID files, heartbeats, restart-loop state, process registries and transient root-level stderr logs as volatile even when they sit outside excluded cache/log directories. A restore runbook must omit or clean them before startup; blindly restoring them can create stale ownership and duplicate-process failures.

A valid ZIP is not yet a rollback. Require an isolated restore, post-extraction hash comparison before execution, reopened database checks, profile/config/session validation, an explicit promotion/reversal procedure, and proof that the live profile remained untouched.

## 3. Archive verification without extraction

Validate the published artifact without extracting it to disk:

1. Stat the ZIP before and after hashing; accept the SHA-256 only if size and mtime stayed stable.
2. Parse the sidecar and require both the digest and referenced filename to match.
3. Run ZIP CRC validation and reject duplicate names, absolute/parent-traversal paths, unexpected symlinks, encrypted members when no key contract exists, and undeclared extra members.
4. Hash every member listed in `backup-manifest.json`; require exact equality between manifest records and archive members, not just a valid outer ZIP hash.
5. Cross-check every `sqlite_snapshots` record against the archived database's size/hash, manifest `integrity_check`, foreign-key result, schema version, and safe table counts.
6. A standalone online-backup `state.db` can retain WAL-mode header bytes (`18`/`19` equal `2`) even though raw `-wal`/`-shm` were correctly excluded. If `sqlite3.deserialize()` cannot validate that byte string in RAM, clone it to a RAM-only `bytearray`, set bytes 18/19 to rollback mode (`1`), deserialize the clone, and run `quick_check`/`integrity_check`. Never change the archived bytes; retain their original SHA-256 as the artifact identity.
7. Compare the validated snapshot to later live state separately. New messages, heartbeat files, gateway state, usage telemetry, and SQLite growth after publication are expected temporal divergence unless the backup contract promised quiescence.
8. State explicitly whether sensitive classes (`.env`, auth stores, request dumps) are present, but never print their values or per-secret hashes in the report.

## 4. Autosave and `config.yaml` contention

A generic “Autosave failed / Internal server error” is not a root cause. Trace the backend log for `PUT /api/config failed` and the underlying exception.

On Windows, `PermissionError: [WinError 5]` at `os.replace(temp, config.yaml)` can be transient file contention even when attributes and ACLs are correct. Hermes' `_CONFIG_LOCK` is a Python `threading.RLock`, so it serializes writes inside one process only; two Desktop/backend processes can still write the same profile concurrently.

Diagnosis sequence:

1. Check `attrib` and `icacls` on `config.yaml`; do not loosen ACLs when the user already owns the file.
2. Inventory full parent/child process trees, command lines with secrets redacted, listening loopback ports and profile arguments.
3. Distinguish the current Desktop/backend/session from a legacy Desktop/dashboard before stopping anything.
4. Back up first.
5. Test the official write path with an idempotent `hermes --profile <name> config set` using the value already present.
6. Compare parsed YAML before/after, not only byte hashes: serialization may normalize `1.0` to `1` or reformat the file while preserving all keys and values.
7. If the write now succeeds and semantics match, classify the historical event as transient contention and eliminate the duplicate writer rather than applying permission escalation.
8. If it still fails, stop; preserve the backup and identify the process holding the target before further correction.

Do not patch the installed `atomic_replace()` or Desktop binary during a profile-repair mission unless the user explicitly authorizes source development.

## 5. Bundled platform plugins are lazy

For `kind: platform` bundled plugins, the generic `hermes plugins list` “enabled” column is not authoritative runtime connectivity. Platform manifests are registered lazily/deferred and imported when gateway, setup, cron or `send_message` asks for them.

Verify a platform through converging evidence:

1. `plugin.yaml` declares `kind: platform`;
2. its `register()` adds the expected platform registry entry;
3. requirements and adapter factory succeed in an isolated process;
4. gateway status/logs show the configured platform connected;
5. `hermes --profile <name> send --list <platform>` resolves a real destination;
6. a sanitized real send returns `success: true` and a delivery handle such as `message_id`.

Do not enable a bundled platform in the generic plugin list merely to make the column look green when the lazy adapter is already working.

## 6. Evidence discipline

A backup is approved only when generator output, independent shell checks, restored state and critic review converge. Reopen the gate when later evidence exposes an unsafe assumption—for example, discovering an auxiliary live SQLite database that was copied raw. Fix the single canonical artifact atomically; do not create `final`, `v2`, or parallel backup-report variants.
