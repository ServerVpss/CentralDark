# Adversarial phase and mission audit

Use this reference when Pivete asks for a **critical agent**, a no-go review, or an attempt to falsify a phase/mission before advancement. The goal is not to confirm the mission's own report; it is to test each approval claim against independent, reproducible evidence.

## Operating posture

- Start from **“not proven”**, not from “probably correct.”
- Keep the audit read-only unless Pivete explicitly authorizes a restore drill or correction.
- Do not execute an out-of-scope source tree merely to inspect it.
- Timestamp evidence and recheck mutable artifacts at the end. A backup, database, process list, or report can change while the audit runs.
- Separate four outcomes:
  - **confirmed failure** — independent evidence contradicts the claim;
  - **risk / incomplete gate** — no contradiction, but approval evidence is insufficient;
  - **survived attack** — independent checks support the claim;
  - **inconclusive** — available evidence cannot decide it.
- Report discarded false positives explicitly. A critical audit is not permission to overclaim.

## 1. Map state domains before comparing anything

Inventory each domain separately:

1. active Hermes profile (`profiles/<name>`);
2. global/default Hermes state;
3. documentary NÚCLEO;
4. frozen prototype/archive;
5. temporary restore or test copy;
6. external monorepo or future runtime.

Never treat these as interchangeable. A documentary NÚCLEO can coexist with a valid frozen runtime; an auxiliary SQLite database is not automatically a competing memory store; a temporary restored database is not the active profile.

Create a claim matrix with: **claim, source document, independent probe, result, impact, approval criterion**.

## 2. Canonical files and manifests

For a declared SHA-256 manifest:

1. parse every declared path and digest;
2. independently enumerate the relevant live files using the manifest's stated exclusions;
3. calculate current hashes;
4. report `missing`, `untracked`, and `mismatch` separately;
5. verify whether the manifest itself is excluded by design;
6. check whether later reports, handoffs, launchers, or session records escaped coverage.

A manifest with zero missing files can still be invalid when files are untracked or hashes differ. Do not regenerate it during the audit; that destroys the evidence of divergence.

Also check whether the canonical tree has Git metadata. If it does not, do not invent a commit/HEAD identity. Use an artifact hash and explicitly state that fine-grained VCS rollback is unavailable.

## 3. Backup integrity, publication, and confidentiality

A robust independent check covers all of these layers:

- external sidecar hash matches the current archive;
- ZIP CRC succeeds;
- internal manifest covers every intended entry with zero missing, extra, size, or hash mismatches;
- no path traversal, case-colliding names, unsafe absolute paths, or symlink surprises;
- every SQLite snapshot passes `integrity_check` and `foreign_key_check`;
- schema and non-sensitive row counts are recorded;
- secret-bearing files are reported only by **presence/class**, never by content;
- archive and sidecar ACLs are checked, as well as the parent directory's create/delete-child permissions.

Observe publication behavior. Stat/hash the archive before and after reading. A timestamped final filename that changes hash or size is not immutable, even if the last version is valid. Require restricted staging, complete verification, and one atomic publication under a unique generation ID.

When disk writes are forbidden, SQLite bytes from an archive may be structurally checked in an in-memory connection. If WAL-mode header flags prevent in-memory opening, an **in-memory-only** header adjustment can support a structural check; never modify the archive, and label this as weaker than a real isolated restore.

## 4. A backup is not a rollback

Reject “rollback ready” until there is a tested runbook. A restore drill must:

1. extract the same archive into two empty locations: a **pristine evidence extraction** and a **disposable runtime extraction**;
2. never select the pristine extraction as the live `HERMES_HOME`, run tests inside it, or allow bytecode/log/cache creation there;
3. verify all pristine file hashes before execution;
4. reopen every SQLite database in both copies and compare integrity, foreign keys, schema, and counts;
5. validate config, memories, sessions, skills, and required launch files without exposing secrets;
6. remove or ignore volatile artifacts such as lock files, PIDs, heartbeats, restart-loop state, process registries, and transient stderr logs in the disposable runtime copy only;
7. launch only the disposable copy with an explicit isolated profile/home, if execution was authorized;
8. prove both the original live profile and pristine extraction remain untouched;
9. record expected post-run mutations in the disposable runtime copy separately;
10. document promotion and reversal steps, RPO/RTO, and stop conditions.

A restored directory mutated by tests is no longer byte-for-byte evidence of the archive. This is why the pristine and runtime copies must be separate, not merely compared at different times.

## 5. Detect false-green tests by reading test semantics

Do not accept test names as proof. Common false greens:

- **“new process”** creates a second object/connection in the same Python process;
- **portability** copies a tree but imports modules already cached from the original path;
- **offline** patches only `socket.socket.connect`, missing `connect_ex`, `create_connection`, UDP, subprocesses, or unexercised paths;
- **valid media** checks only file existence/size rather than container header, codec, decode, and intended playback contract;
- static discovery proves the number of test methods, not that they ran successfully;
- tests mutate the database/logs inside the artifact being certified;
- a zero exit code is cited without preserved command, environment, output, and artifact identity.

Approval-grade tests should use a fresh extraction, spawn real OS processes for restart/persistence, launch portability checks from only the copied runtime, capture exact output and exit status, and compare hashes before/after.

## 6. Declared policy versus enforced policy

For permission or safety files:

1. search production code for actual loading/enforcement, not only path declarations or documentation mentions;
2. inspect classifier precedence and early returns that may bypass danger detection;
3. distinguish “no executor exists” from “permission policy prevents execution”;
4. compare prototype policy with the real Hermes profile's terminal, code execution, browser, file, toolset, approval, checkpoint, and loop-guard settings;
5. verify sensitive-file ACLs against the identities that can run tools.

Never claim that a documentary guard constrains the installed Hermes runtime unless the integration is proven.

## 7. Profile and database isolation

A dashboard launched with `--profile default --open-profile <name>` is not, by itself, split-brain evidence. Confirm isolation by comparing writes:

- global versus named-profile session/message counts;
- `HERMES_HOME` and explicit profile arguments;
- gateway routing records;
- a controlled synthetic write, when authorized, followed by database deltas.

Classify databases by schema and role before calling them duplicates. `state.db`, verification evidence, response storage, and cron history may be legitimate separate stores.

## 8. Process and execution false positives

A process search command contains the path it is searching for, so it can match itself and its shell/parent chain. Exclude the audit process and ancestors, then require stronger evidence such as:

- CWD inside the target tree;
- executable/module loaded from it;
- child process launched from it;
- relevant open file/socket handles;
- durable external logs or history.

No current process and no shell-history hit do not prove a tree was never executed. Report that historical claim as inconclusive.

## 9. Version and document-source conflicts

Check for:

- sibling `v1`/`v2`/`v3`, `final`, `final2`, or corrected copies;
- distinct hashes under sibling version names;
- component-version ambiguity (Hermes app, prototype, skill, package);
- multiple top-level “unique report” or “canonical review” headings;
- a README that tells users to run files removed from the active tree;
- appended missions that changed a canonical report without updating its manifest.

Version findings outside the declared scope do not automatically fail the phase, but they block treating that external tree as a clean source of truth.

## 10. Verdict format

Use the house legend and attach an objective gate to each non-green item:

- 🔴 **CORRIGIR / BLOCKER** — contradicted claim or unsafe approval condition;
- 🟡 **REVISAR** — incomplete evidence or bounded risk;
- 🟢 **OK / SOBREVIVEU À CRÍTICA** — independently supported;
- ⚪ **INCONCLUSIVO** — neither proved nor disproved.

Recommended final order:

1. explicit `GO`, `NO-GO`, or conditional verdict;
2. blockers with exact evidence;
3. risks and inconclusive assumptions;
4. claims that survived the attack;
5. discarded false positives;
6. objective criteria required to reopen the gate;
7. scope statement: what was read, executed, or modified.

Do not hide a blocker inside a long narrative, and do not call the whole mission corrupt when independent checks validate important parts such as archive CRC, SQLite integrity, canonical hashes, or profile isolation.
