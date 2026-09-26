---
name: kanban-inventory
description: "Use when operating Hermes Kanban for profile pivete: inventory, classify blocks, drift contract, canary, authority gates."
trigger: manual
---

# Kanban Inventory + Local Stabilizer (profile pivete)

Class-level skill for Hermes Kanban on profile **pivete**: read-only inventory by default, optional authorized local stabilizer (contract + drift detector + canary).

## Purpose

- Keep **Hermes Kanban** as the single operational board (tasks, blocks, proof, next step).
- **Miro** is optional mental map only — no Miro integration here.
- Default mode = **read-only**. Board writes only with explicit authority and proven CLI verbs.
- Improve **this** skill in place. Never create `kanban-v2`, `kanban-final`, or parallel boards.

## Authority (active path)

```text
AUTHORITY_FINAL = SEGREDO/CHEFE
AUTHORIZATION_MARKER = PERMITO SEGREDO
COORDINATOR = SOL
EXECUTOR = PIVETE/HERMES
WRITER = single writer (this mission / profile)
```

| Marker | Effect on autocorrection / canary write |
|--------|----------------------------------------|
| `PERMITO SEGREDO` + authority `SEGREDO/CHEFE` | may proceed if all nine gates true |
| `PERMITO PIVETE` alone | **BLOCKED** (legacy / negative test only) |
| missing authority | **BLOCKED** |
| conflict (e.g. marker SEGREDO + authority PIVETE) | **BLOCKED** |

Do **not** invent native CLI flags:

- `--apply` — not official
- `PERMITO_PIVETE=true` env — not official
- `hermes kanban-inventory` as a CLI binary — skill name, not a hermes subcommand

Official surface: `hermes kanban <verb>`, dashboard, worker `kanban_*` tools — same SQLite board.

## Layout (pivete-owned only)

```text
skills/productivity/kanban-inventory/
  SKILL.md
  contracts/kanban-contract.json
  scripts/drift_detector.py
  selectors/  rules/  tests/  state/
  references/  (session proofs, CLI quirks)
```

**Upstream** (`hermes-agent` install, `hermes_cli/kanban*.py`) = **READ_ONLY**. Never patch donos' code from this skill.

## Phase 0 — Prove real CLI (always)

```bash
hermes --version
hermes kanban --help
hermes kanban boards show
hermes kanban list
hermes kanban show <id>
hermes kanban runs <id>
hermes kanban log <id>
```

Use only verbs from `--help`. Proven set includes:
`init, boards, create, list/ls, show, assign, block, unblock, complete, comment, attach, archive, dispatch, runs, log, claim, promote, schedule, ...`

**Not a verb:** `cancel`. Temporary canary cleanup = `archive` then `archive --rm <id>`.

`create` flags (proven): positional `title`, `--body`, `--assignee`, `--idempotency-key`, `--json`. `--kind` only on `block`.

## Phase 1 — Inventory (read-only)

For each card capture:

```text
ID, TITLE, STATUS, ASSIGNEE, PRIORITY, WORKSPACE, SKILLS, DEPENDENCIES,
RUNS, EVENTS, LAST_RESULT, LAST_ERROR, PROOF, NEXT_STEP
```

Prefer:

```bash
hermes kanban show <id>
hermes kanban runs <id>
hermes kanban log <id>
hermes kanban diagnostics
```

over guessing from the list line title.

## Phase 2 — Classify blocks (evidence, not title)

Canonical classes:

| Class | Evidence sources |
|-------|------------------|
| PROVIDER_RATE_LIMIT | log/API: HTTP 429, usage limit reached |
| PROVIDER_CREDIT_OR_QUOTA | quota/credits exhausted |
| PROVIDER_ENDPOINT_UNREACHABLE | connection/timeout |
| PROVIDER_AUTH_MISSING | 401 / unauthorized |
| SKILL_MISSING | Unknown skill(s): … |
| WORKER_CRASH | pid not alive, consecutive_failures, crashed runs |
| STALE_CLAIM | claim expired / stale |
| DEPENDENCY_OPEN | waiting on parent |
| HUMAN_INPUT_REQUIRED | needs_input / approval |
| CAPABILITY_MISSING | unknown provider/model/feature |
| CIRCUIT_BREAKER_TRIPPED | gave_up, failure_limit |
| UNKNOWN | anything else — do not force a class |

**Pitfall:** do not set PROVIDER_RATE_LIMIT from the word ALLOWED in a title. Confirm via `log` / `runs` of the **same** task.

**Pitfall:** one card can have **primary** WORKER_CRASH and **secondary** PROVIDER_RATE_LIMIT when both appear in evidence.

Upstream `block_kind` values: `dependency | needs_input | capability | transient`.

## Phase 3 — Drift contract + detector

Contract lives in `contracts/kanban-contract.json`. Measure hashes separately:

| Hash | What |
|------|------|
| DATABASE_SCHEMA_HASH | CREATE SQL of `kanban.db` only (not row data) |
| ADAPTER_CODE_HASH | SHA-256 of this skill's `SKILL.md` (or adapter code set) |
| CONTRACT_HASH | SHA-256 of canonical contract object |
| RUNTIME_SNAPSHOT_HASH | optional consistent snapshot file |

**KANBAN_URL:** discover at runtime (open ports / dashboard). Do **not** hardcode `8648`. Observed working dashboard: `http://127.0.0.1:9119/kanban?profile=pivete`.

```bash
python scripts/drift_detector.py --mode readonly
python scripts/drift_detector.py --run-tests
python scripts/drift_detector.py --canary   # only with PERMITO SEGREDO
```

Drift results: `NO_CHANGE | SAFE_ADAPTER_DRIFT | UPSTREAM_DRIFT | AMBIGUOUS_DRIFT | BROKEN_CONTRACT | BLOCKED`.

Default drift path = **no board write**.

## Phase 4 — Nine gates before autocorrection write

All must be true:

1. AUTHORITY_VALID — PERMITO SEGREDO + SEGREDO/CHEFE  
2. SCOPE_VALID — path/card inside mission scope  
3. BASELINE_VALID — before hashes recorded  
4. CAUSE_REPRODUCED — code/log proof, not title inference  
5. TRANSFORM_DETERMINISTIC — explicit rule  
6. MINIMAL_DIFF  
7. TESTS_VALID — positive, negative, regression, idempotence  
8. ROLLBACK_AVAILABLE — backup hashed and restorable  
9. RECEIPT_BOUND — mission_id, authority, writer, before/after hash, files, action, tests, rollback, timestamp  

Any false → `AUTOCORRECTION=BLOCKED`. Missing proof → `UNKNOWN` + next test, not silent PASS.

## Phase 5 — Canary (authorized only)

Single temporary card, clearly titled `[CANARY] ...`. Do **not** edit human cards.

Proven flow:

```text
create --json --idempotency-key ...
show                    # channel 2
block <id> reason --kind transient
show → status: blocked  # parse status field only
unblock <id>
show → status != blocked
archive <id>
archive --rm <id>
show → gone
```

**Pitfall:** after unblock, full `show` text still contains the word `blocked` in comments/events. Parse only:

```regex
(?im)^\s*status:\s*(\S+)
```

Two proof channels minimum (CLI create/show **and** status after change). HTTP 200 alone is not proof.

## Granularity

Create/update a card only for material work: executable task, real block, dependency, incident, proof, decision, recurring proven improvement. Not every chat message or typo.

## False green

Never emit `KANBAN_AUTONOMIA_LOCAL_VALIDADA` / `KANBAN_AUTOCORRECAO_LOCAL_VERIFICADA` because help opened, command exited 0, or UI loaded. Require the mission DoD checklist + hashes + tests.

## User style (this house)

- One best option from evidence, not menus of alternatives.
- Blocks 🟢🟡🔴 + manchete + próximo passo when reporting to Pivete.
- Paths as full human paths; no "grep this".
- Prove 100% before execution claims.

## Support files

| Path | Role |
|------|------|
| `scripts/drift_detector.py` | drift + nine gates + canary + 20-test suite |
| `contracts/kanban-contract.json` | deterministic contract + authority metadata |
| `state/` | baseline, drift reports, test_suite_*, receipt_*, canary_cleanup_* |
| `references/cli-and-canary-lessons.md` | CLI quirks and canary pitfalls (2026-08-05) |
| `references/phase5-receipt-pointer.md` | verified receipt location |

## Quick commands

```bash
hermes kanban list
hermes kanban show t_XXXX
hermes kanban runs t_XXXX
hermes kanban log t_XXXX

python "%LOCALAPPDATA%\hermes\profiles\pivete\skills\productivity\kanban-inventory\scripts\drift_detector.py" --mode readonly
python "...\scripts\drift_detector.py" --run-tests
```
