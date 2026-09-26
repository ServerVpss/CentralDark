# RECEIPT - C: TO E:\CentralDark

Date: 2026-09-01
Status: PARTIAL_PASS_WITH_ONE_PHYSICAL_BLOCKER

## Intent

Move CentralDark projects, worktrees, source material, and historical artifacts
from `C:` to `E:\CentralDark` without flattening repositories, losing dirty
state, or treating same-name artifacts as duplicates.

## Canonical rule reused

The existing Casa owner already defines:

```text
C_DRIVE_AGENT_WRITES=FORBIDDEN
CASA_ROOT=E:\CentralDark
AGENT_TEMP_ROOT=E:\CentralDark\workspace\temp
```

This receipt is evidence of the migration. It is not a second owner or a new
architecture.

## Git worktrees moved and verified

| Destination | Branch | HEAD | Preserved state |
|---|---|---|---|
| `E:\CentralDark\Pivete\worktrees\CD-emoji-models` | `fix/model-import-response-style` | `128e7137b0ca650fb591f2f2a9ab3a8ec9c72703` | 2 tracked EOL-visible changes preserved |
| `E:\CentralDark\Pivete\worktrees\CDPR1389` | `codex/pr1389-bind-standard-flow` | `7b26b2bf1709a6ff4c0818c683f31f7051e96e72` | 10 tracked changes preserved |
| `E:\CentralDark\Pivete\worktrees\CDSF` | `codex/centraldark-standard-flow-20260831` | `db03080bdd6898aba6d6842061d22c7edd4f4cea` | clean |
| `E:\CentralDark\Pivete\worktrees\relquia-worktree` | `docs/segredo-reliquia-hud-20260816` | `1cc28856687bbbadb9dcd01484523d09caeb14da` | clean; stale C registration repaired |

The four corresponding C paths are absent. `git worktree list --porcelain`
points to E destinations.

## Other material moved

- `C:\CentralDark-Audit` -> `E:\CentralDark\_QUARANTINE\from-C-20260831\CentralDark-Audit`
- `C:\Users\danda\CentralDark` -> `E:\CentralDark\_QUARANTINE\from-C-20260831\Users-danda-CentralDark`
- historical Codex work, Hermes WebUI/router provider, Grok-Api, desktop trees,
  cleanup proof, packages, metadata, and loose CentralDark artifacts ->
  `E:\CentralDark\_RECONCILIATION\from-C-users-danda-20260901` or
  `E:\CentralDark\inbox\from-C-users-danda-20260901`
- `C:\c\install_kokoro.sh` -> `E:\CentralDark\runtime\audio\installers\install_kokoro.sh`

Unknown or same-name material was preserved and classified; it was not deleted
as a duplicate by name.

## Authorized C exceptions

- `C:\c\Kokoro-FastAPI` remains by explicit human decision.
- Windows application/profile configuration under `C:\Users\danda` remains
  where its live consumer requires the Windows profile path. It is not a Casa
  project root.
- An official site runtime may use C only when it is actually deployed/live and
  the runtime benefit is measured. Source, history, inactive copies, and agent
  workspaces remain on E.

## Physical blocker

`C:\temp.zip` remains on C:

```text
SIZE=2243338
SHA256=6CEC99934FD406AF3A09FD98CD7DCBD77982AE85D6B380288915A3E88E500B20
MANDATORY_INTEGRITY_LABEL=HIGH
CURRENT_SESSION_CANNOT_WRITE_OR_MOVE=TRUE
```

The file ACL grants modify rights, but its High Mandatory Integrity Label has
`NW` (no-write-up). A non-elevated process cannot move or relabel it. No copy was
left on E, preserving the human decision that the operation must be a move, not
a duplicate copy.

## Empty source shells

- `C:\Users\danda\Documents\Codex` contains zero files but its directory handle
  is held by the active Codex task.
- The long OneDrive `PASTA CHEFE...` source contains zero files but its directory
  handle is held by OneDrive/Explorer.

These shells contain no project material and do not represent duplicate state.

## Verdict

```text
MATERIAL_PROJECT_MIGRATION=PASS
GIT_STATE_PRESERVED=PASS
NO_SAME_NAME_DELETION=PASS
AUTHORIZED_KOKORO_EXCEPTION=PASS
TEMP_ZIP_MOVE=BLOCKED_BY_WINDOWS_HIGH_INTEGRITY
DATA_LOSS=FALSE
```
