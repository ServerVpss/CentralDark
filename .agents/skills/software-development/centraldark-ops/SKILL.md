---
name: centraldark-ops
description: "Operate CentralDark across Casa, GitHub, VPS, Hermes."
related_skills: [centraldark-hermes-operations, reconciliacao-diaria-centraldark, github-actions-runner-diagnostics, skill-synchronization]
---

# CentralDark ops (CASA · GitHub · VPS)

CHEFE is final authority. SOL coordinates. Hermes executes. Do not invent a parallel system, V2/V3, or a second loop.

## Always-on

- Workspace operational = `E:\\CentralDark`. Hermes install on `C:` is APP_INSTALL_DIR, not workspace.
- Nested git root is usually `E:/CentralDark/CentralDark/CentralDark`. `E:\\CentralDark` itself is not the repo.
- Dirty local worktree: measure it, do not `reset --hard` unless CHEFE explicitly authorizes that exact tree.
- Authorized technical work is action-first: do not return tool menus, internal topology, or approval prompts when the machine can measure, scan, test, reconcile, or write a reversible receipt inside the active scope. Return the decision/receipt with proof, UNKNOWN, blockers, and next cursor.
- Remote connector down is not a Casa blocker. Measure this machine directly.
- UNKNOWN != PASS. ACTION != PROOF. PID != SESSION_ID. HISTORY != CURRENT_STATE.
- One writer per scope. Restart only the named PM2 process. Never `restart all`.
- `git -C <dir>` succeeding is **not** proof of a separate repository. Any subdirectory of an existing worktree is a valid `git -C` target and will report the **same** `.git` dir as the root. To test whether a path is a *distinct* repo root, compare `git -C <path> rev-parse --git-common-dir` across candidates: if several paths return the same common-dir, they are one repo, not many. Cross-check with `git worktree list` (separate worktrees appear there with their own HEAD) and with `.gitmodules` (real submodules are registered there, and an uninitialized submodule is a tracked path, not a second repo). Do not conclude "sprawling submodules / clones" from `git -C` success alone.

  **Diagnostic procedure when suspecting scattered repos:**
  1. `git rev-parse --show-toplevel` from the suspected root — gives the actual worktree root.
  2. `git worktree list` from the root — lists all working trees linked to this `.git` dir; separate worktrees appear here with their own HEAD.
  3. For each candidate path, `git -C <path> rev-parse --git-common-dir` — must be the same for all subdirs of one repo, relative or absolute. If all return `../.git` or `../../.git`, they are one repo.
  4. `git submodule status` — lists registered submodules; an absent `U` marker means uninitialized (path exists, `.git` absent, not a second repo).
  5. `.gitmodules` — canonical registration of submodules; if a path is not here, it is not a submodule, even if a `.git` directory exists in it.
  6. If a path has `.git` but is not in `.gitmodules`, not in `git worktree list`, and `git -C <path> rev-parse --show-toplevel` differs from the root, **then** investigate whether it is a distinct repo, legacy artifact, or symlink/junction.
- Caddy: if live import already equals main, do not reload for ritual.
- **Hermes Desktop browser automation**: `browser_exec` with `local=true` renders to the **right-hand preview rail**, not a separate window. The rail has hide/restore (preserves state) and detach (opens standalone window) controls. Timeout on `browser_exec local=true` means the preview engine is unavailable (can happen in headless/VPS environments or when Hermes Desktop is not running locally); fallback is manual browser open or text-based web extraction (`web_extract`).
- Ingress: Hermes `AppData\\Local\\hermes\\attachments\\` is a read-only door. SHA-256, classify, copy only the useful delta into `E:\\CentralDark\\workspace\\temp` or the existing owner. Do not make C: the workspace. Do not ask the human to move pastes by hand.
- "Configura na VPS" is not a VPS mutation until measurement names a VPS owner. GitHub `action_required` with empty jobs is the autonomia owner, not PM2/Caddy/runner.
- Code change while Casa git is dirty/behind: do not patch that tree. `git worktree add` from `origin/main` (or live main SHA) and write only the named owner files. See `references/autonomia-actions.md`.

## Communication and environment clarity

Always read `references/hermes-desktop-communication-style.md` when working with CHEFE in Hermes Desktop — it covers communication density preference and browser automation behavior in the preview rail.

## Paired operational skill

This skill is paired with the CentralDark operational family: `centraldark-hermes-operations`, `reconciliacao-diaria-centraldark`, `github-actions-runner-diagnostics`, and `skill-synchronization`. When the trigger is Hermes-specific (update, cron, Desktop/backend boot, SSH/no-mux, VPS Hermes version, port/firewall proof for Hermes routes), load `centraldark-hermes-operations` too. When the trigger is daily state, checklist, abandoned deltas, or skill drift, load the matching sibling too. `centraldark-ops` carries the broader CASA/GitHub/VPS operating contract; siblings carry concrete procedures. They are one operational family, not competing owners.

## VPS — resiliência semântica sob drift técnico

Esta é a regra padrão para **qualquer** leitura, diagnóstico, correção, deploy, runner, serviço, rede, SSH, PM2, Caddy, cron ou automação na VPS.

```text
REPORT_t = OBSERVATIONS_t + UNKNOWN_t + NEXT_CURSOR_t
REPORT_t != CURRENT_STATE_t+n

OPERATIONAL_GRAMMAR_MAY_SURVIVE_TECHNICAL_DRIFT=true
SEMANTIC_CONTINUITY_IS_NOT_CURRENT_TECHNICAL_PROOF=true
METHOD_STABLE_DOES_NOT_PROVE_RUNTIME_STABLE=true
CURRENT_HEAD_DEPENDENT_DECISION_REQUIRES_REMEASUREMENT=true
CURRENT_RUNTIME_DEPENDENT_DECISION_REQUIRES_LIVE_VPS_MEASUREMENT=true
SAME_SEMANTIC_BOOT_DIFFERENT_ROUTE_CAN_CHANGE_EXECUTIVE_CAPABILITY=true
OLD_REPORT_IS_PROVENANCE_NOT_AUTHORITY=true
UNKNOWN_FROM_OLD_REPORT_MUST_BE_REEVALUATED_WHEN_MEASURABLE=true
MEASURED_CURRENT_EVIDENCE_OVERRIDES_STALE_REPORT_FOR_SAME_CLAIM_SCOPE_TIME=true
```

Operationally:

```text
LOAD_STABLE_METHOD
→ LOAD_RELEVANT_REPORTS_AS_PROVENANCE
→ EXTRACT OBSERVATIONS_t / UNKNOWN_t / NEXT_CURSOR_t
→ MEASURE CURRENT_MAIN WHEN CODE/WORKFLOW DECISION DEPENDS ON IT
→ MEASURE LIVE_VPS WHEN RUNTIME DECISION DEPENDS ON IT
→ CLASSIFY OLD CLAIM = STILL_TRUE | STALE | CONTRADICTED | UNKNOWN
→ REUSE SAME OWNER / RECIPE
→ ADAPT ONLY LIVE BINDINGS
→ EXECUTE MINIMUM COMPLETE DELTA
→ PROVE EFFECT
→ COUNTERPROVE
→ EMIT RECEIPT + NEXT_CURSOR
```

Do not “update” an old report by pretending its old observations were made now. Preserve the old report as a true snapshot of its time and add a new CURRENT layer. A report can preserve a correct operational grammar even when every volatile technical value in it has drifted.

For VPS work specifically:

- A historical runner/service/port/HEAD/route/hostname is **never** current merely because the report was correct when written.
- A stable recipe, owner, invariant, or semantic boot may be reused without rediscovery, but its environment bindings must be remeasured.
- If route A is stale or unavailable, apply the multiroute law: classify that route only, then measure another authorized route before elevating the problem to system-level BLOCKED.
- If the claim depends on GitHub code, use live `main`/HEAD. If it depends on the VPS body, use live VPS measurement. Neither substitutes for the other.
- A previous UNKNOWN becomes PASS/FAIL only through new evidence; time passing alone does not resolve it.
- A previous PASS remains historical provenance until equivalent conditions are proven or the claim is remeasured.
- Semantic fidelity to the method is **not** evidence that a mutation succeeded. Runtime effect/readback remains mandatory.

Compact law:

```text
METHOD_STABLE + REALITY_REMEASURED
SEMANTIC_RESILIENCE_UNDER_TECHNICAL_DRIFT=true
GRAMMAR_PRESERVED != TECHNICAL_STATE_CURRENT
REPORT_OLD != STATE_NOW
```

## Procedure — three-plane reconcile then micro-deploy

1. **GitHub (live API, not local origin/main)**
   - `gh auth status` then `gh api repos/ServerVpss/CentralDark/commits/main --jq '{sha:.sha,msg:.commit.message}'`
   - Confirm the named PR with `gh pr view N --repo ServerVpss/CentralDark --json number,state,mergedAt,mergeCommit,headRefOid`
   - Local `origin/main` can be stale; GitHub SHA is the promotion target.
2. **Casa**
   - `git -C E:/CentralDark/CentralDark/CentralDark status -sb` and `rev-parse HEAD`
   - Record dirty/behind. Do not fetch-reset unless ordered.
   - Session binding: see `references/hermes-desktop-binding.md`.
3. **VPS** via SSH host `segredo-vpss` (config in `~/.ssh/config`, user root).
   - Measure in one ssh: `/root/CentralDark` HEAD, `/var/lib/centraldark/canonical-main` HEAD, `origin/main`, branch, dirty porcelain, PM2 with `PM2_HOME=/root/.pm2`, Caddy live import, `:9400`, public health.
   - Canonical-main is the source of truth for already-promoted files. `/root/CentralDark` checkout may lag; do not reset the whole tree to "fix" two files.
   - Classify every dirty path before any sync (`GENERATED` / `RUNTIME_STATE` / `CASA_KNOWLEDGE` / `CANONICAL_CODE` / `SECRET` / `UNKNOWN`). Never stash, reset, or force-clean unclassified dirty.
   - If checkout is **behind** live `origin/main`, dirty does **not** overlap the main file delta, and the worktree allows it: `git -C /root/CentralDark merge --ff-only origin/main`. Record `VPS_HEAD_BEFORE` and `VPS_HEAD_AFTER`. Generated/runtime dirty stays.
   - If a child PR is still OPEN: sync VPS to **live main only**. Do not copy or restart from the child branch. `MERGED != DEPLOYED`; OPEN child is not a deploy source.
4. **Diff only the authorized files** against canonical-main (and against live Caddy if a Caddyfile is in scope).
5. **Backup** those files next to the owner (`_tmp/microdeploy-<utc>/`).
6. **Copy from canonical-main** (already at expected main SHA) into the runtime owner paths. Do not rewrite `/etc/caddy` if the managed import already matches.
7. **Prove compile/validate**: `python3 -m py_compile` for Python; `caddy validate --config /etc/caddy/Caddyfile` for Caddy.
8. **Restart only if content changed** and only the owning process.
9. **Counterproof** both stripped upstream and public prefixed URL. Capture PM2 restart deltas so you can assert no other process moved.
10. **Receipt** under `E:\\CentralDark\\LOGS\\CASA\\...` with MAIN_HEAD, CASA_HEAD, VPS_SOURCE, RUNTIME_OWNER, health codes, deployed blob SHAs, UNKNOWN list. Stop. Do not crystallize a dirty checkout as main.

## Hermes Desktop boot/update failure trigger

When CHEFE pastes Hermes Desktop logs like `completing source-update dependencies`, `Timed out waiting for Hermes backend port announcement`, `Desktop boot failed`, `refreshProfiles failed`, `bootstrap reset`, or `ssh connection closed (no-mux tunnels killed)`, treat it as a CentralDark operations signal, not generic chat.

Required move:

1. Load this skill and `references/hermes-desktop-communication-style.md`.
2. Measure the local Hermes install (`hermes --version`, `hermes doctor` or targeted status, running Hermes/Python processes, recent logs under `%LOCALAPPDATA%\\hermes\\logs`).
3. If local Desktop/backend is down but SSH `segredo-vpss` works, use the VPS as alternate body for CentralDark operations: prove `ssh segredo-vpss`, `hermes --version`, `hermes cron list`, ports/firewall, and CentralDark workdir state before declaring blocked.
4. Do not claim CentralDark is down because one surface failed. Surface failure means `SURFACE=DOWN|DEGRADED`; organism status depends on alternate channel proof.
5. For update-related boot hangs, check whether the install is finishing dependency sync before killing processes. Prefer `hermes pm install`/`hermes update --yes --keep-stash --no-gateway-restart` only when safe and measured; do not use `--force-venv` unless CHEFE explicitly authorizes.
6. Receipt must separate: `LOCAL_DESKTOP`, `LOCAL_BACKEND`, `LOCAL_CLI`, `VPS_SSH`, `VPS_HERMES`, `CENTRALDARK_OPS_ROUTE`, `BLOCKER_EXACT`.

## Local Windows Bridge / MCP TLS probe debugging

When the CentralDark Bridge UI reports an MCP probe as unreachable over SSL/TLS but OAuth or authenticated MCP already works, debug the probe edge before touching server, OAuth, tunnel, Caddy, or VPS.

1. **Locate the real owner from the emitted strings**: search the existing package for `[MCP_PROBE]`, `REACHABLE=`, and the localized SSL/TLS error. Name `SOURCE_FILE`, `FUNCTION`, `HTTP_CLIENT`, `TLS_STACK`, and `TARGET_URL` before mutating. The known owner class is the local Bridge source under the existing `CentralDark-Unified-OneShot` package, not a new Bridge/client.
2. **Compare broken and working stacks**: identify the probe HTTP stack and the OAuth/MCP stack that already passes. If OAuth uses PowerShell `Invoke-WebRequest`/`Invoke-RestMethod` and the probe uses C# `HttpWebRequest`, treat TLS negotiation/config as a falsifiable difference, not a conclusion.
3. **Run a discriminating TLS probe under the same Windows/.NET family** before patching. Minimal PowerShell 5.1 pattern:
   ```powershell
   [Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls
   # run the same HttpWebRequest POST to the MCP endpoint; expect SSL/TLS failure if legacy protocol is causal
   [Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12
   # run the same request again; 401/403 from a protected endpoint is TLS transport PASS
   [Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::SystemDefault
   # run again; SystemDefault should be preserved when it works
   ```
   Pitfall: do not declare the endpoint down from `401 Unauthorized` on an MCP/admin-protected route — HTTP reached the server, so classify `TLS_CONNECTION=PASS` and `AUTH_STATUS=EXPECTED_UNAUTHENTICATED` unless the authenticated flow also fails.
4. **Apply the smallest owner-local delta**: preserve `SystemDefault`; only add `Tls12` when `ServicePointManager.SecurityProtocol` is visibly legacy-only (`Ssl3`, `Tls`, or `Ssl3|Tls`). Do not create `TlsProbeV2`, a second bridge, a second daemon, or a parallel client. Make the probe output separate `TLS_CONNECTION`, `TRANSPORT_REACHABLE`, `HTTP_STATUS`, and `AUTH_STATUS` so auth gates never collapse back into transport failure.
5. **Build through the package’s canonical `BUILD.ps1`**. If the EXE is locked, identify the running `CentralDarkBridge.exe`, stop only that process, rebuild, and reopen it. Do not restart unrelated CentralDark processes.
6. **Counterprove with reflection or the actual UI plus the existing auth path**: invoke the built EXE’s probe with a forced legacy TLS input and with `SystemDefault`, then run the existing OAuth/MCP script for the `Segredo` profile without forcing login when the DPAPI cache is valid. Required receipt fields: build exit, EXE path/hash, `TLS_PROTOCOL_BEFORE/AFTER`, HTTP class, OAuth cache/token result, `MCP_TOOLS_LIST`, admin HTTP, and remaining UNKNOWN.
7. **Register in the existing handoff/receipt owner** for the unified package; extend the same receipt instead of creating a dated V2/V3 receipt. The fixed point is only true when root cause is proven, owner is reused, build opens, TLS transport passes, HTTP/auth are classified separately, authenticated MCP still passes, admin still responds, and critical UNKNOWN is zero.

## Route proof (prefix strip)

Caddy `handle_path /contas*` strips `/contas` before uvicorn. Therefore:

- Public `https://admin.centralldark.com/contas/health` = 200 does **not** require `http://127.0.0.1:9400/contas/health` = 200.
- Prove uvicorn at the **stripped** path (`:9400/health`, `:9400/ai-review.html`).
- Prove public at the **prefixed** path. 404 on the prefixed path hitting uvicorn directly is expected, not a failed deploy.

Hermes preview `file:///ai-review.html` ERR_FILE_NOT_FOUND is a local preview miss, not VPS health. Do not treat the preview pane as the public route. Open the **public** admin URL in `desktop_preview` when CHEFE needs to see the live page.

## Autonomia — `action_required` is not a finished job

`workflow_run` completed never fires if no job started. `status=completed` + `conclusion=action_required` + `jobs=[]` is the GitHub first-time/fork approval gate ("Approve workflows to run"), not a runner, queue, or Hermes-down failure.

1. Confirm live main with `gh api repos/ServerVpss/CentralDark/commits/main` (not local `origin/main`).
2. List waiting runs: `gh api "repos/ServerVpss/CentralDark/actions/runs?status=action_required&per_page=20"`.
3. Filter by **current** PR `head_sha` before acting. `action_required` on older SHAs of the same branch is history, not the live HEAD. Repo-wide `total_count` is not the current-HEAD count.
4. Classify: trusted author + same-repo + Intent-Authorized + **this HEAD** → WAIT + approve. Do not treat as FAIL.
4. Prove the endpoint: `gh api -X POST repos/ServerVpss/CentralDark/actions/runs/{id}/approve` then **re-read** the run (`status`, `run_attempt`, `conclusion`). Empty `{}` can be 204 success.
5. Encode the consumer in the existing autonomia motor (`scripts/github-autonomia-promocao.mjs` + green-guard + `autonomia-promocao.yml`). FAST path must fetch runs for the PR HEAD. Promote on WAIT: POST approve, then `centraldark_autonomia_recheck`. Do not `continue` on WAIT as a no-op.
6. Green-first: `action_required` is not PASS and not FAIL — it is ACTION_REQUIRED until jobs actually run.
7. GitHub does not replay old `action_required` events onto a listener merged later. Approve live waiting runs; do not wait for history to wake Hermes.

## Autonomia — conflict resolution is a system capability, not per-PR manual agent work

When merge conflicts appear in CentralDark PRs, the target behavior is autonomous conflict resolution through the existing Dependabot/COSTURA owner, not invoking an agent manually for each PR or each conflict.

Contract:

```text
AUTONOMOUS_CONFLICT_RESOLUTION=true
AGENT_MANUAL_INVOCATION_PER_CONFLICT=false
BUTTON_DECISION_PER_HUNK=true
PRIMARY_SOURCE_INTENT_REQUIRED=true
ONE_CONFLICT_OWNER=true
```

Flow:

```text
CONFLITO APARECE
→ Dependabot/COSTURA detecta
→ mede HEAD CURRENT
→ classifica arquivo/hunk
→ busca intenção/fontes
→ decide Current | Incoming | Both por hunk
→ resolve
→ marca
→ valida
→ commit/push na branch
→ same-head checks
→ próximo conflito
```

Never implement blanket `Accept Both` as green. `ACCEPT_BOTH_EVERYTHING != PASS`. The resolver must preserve intent per hunk using primary sources and owner-local evidence. If evidence is insufficient, stop at that hunk with `UNKNOWN`, preserve state, avoid fake green, and continue only safe independent work.

## Hermes VPS cron — PR reconcile (Dependabot owner, not Rabbit)

Owner is `dependabot-auto-merge.yml` + `scripts/dependabot/resolve-conflicts.sh` (+ `semantic-all-resolver.mjs` after the resolver lands on main). Cron on VPS:

```text
*/5 * * * * flock -n /tmp/centraldark-hermes-pr-reconcile.lock /root/CentralDark/scripts/vps/hermes-pr-reconcile-cron.sh
```

The script does **not** read `gh` `hosts.yml`. It only loads `GITHUB_TOKEN`/`GH_TOKEN` env or files under `/root/secrets/` (and a few `.env`). Live `gh auth status` can be OK while cron prints `TOKEN_STATUS=ABSENT_OR_UNREADABLE`.

Seed without echoing (never `read` token in chat):

```bash
umask 077; mkdir -p /root/secrets
gh auth token | tr -d '\r\n ' > /root/secrets/GITHUB_TOKEN
chmod 600 /root/secrets/GITHUB_TOKEN
```

Prove cron is actually running, not just installed:

- crontab line present: `crontab -l | grep hermes-pr-reconcile`
- token file present with correct perms: `stat -c '%a %s' /root/secrets/GITHUB_TOKEN` → expect `600` and `>=20` bytes
- cron log shows dispatches: `tail -n 25 /var/log/centraldark/hermes-pr-reconcile-cron.log` → look for `HTTP_STATUS=204 RESULT=DISPATCHED`
- GitHub shows the dispatch runs: `gh api "repos/ServerVpss/CentralDark/actions/runs?per_page=5&event=repository_dispatch" --jq '.workflow_runs[] | select(.display_title=="centraldark_dependabot_reconcile") | {id,status,conclusion,created_at}'`

`ACCEPT_ALL != PASS`: conflict compose still needs zero markers + validate + SAME_HEAD CI.

`semantic-all-resolver.mjs` missing on `/root/CentralDark` until the resolver lands on main is expected — do not copy from a dirty checkout.

### Pitfall — switching branches while dirty or behind main creates merge conflicts

When Casa is behind `origin/main`, do not `git checkout <feature-branch>` directly into `main` without reconciliation. Sequence: (1) fetch `origin/main`, (2) reconcile or isolate dirty state (classify, do not blindly reset), (3) **then** switch branch. If you need to investigate a feature branch while main is dirty/behind, use `git worktree add --detach <new-worktree-path> origin/<branch>` to get a clean checkout of that branch without mutating the main worktree. This avoids merge conflicts that arise from pulling main over a feature branch that diverged from an older main.

Pitfall — diagnose the failing job, not the whole workflow

When a multi-job workflow has mixed results (some jobs succeed, some fail, some cancel), do not treat the workflow as uniformly failed. List the jobs with `gh api "repos/{owner}/{repo}/actions/runs/{run_id}/jobs"` and read the specific failing job's steps/logs. In the dependabot workflow, the `🧮 Dependabot fast-path nativo → same-head → squash` job can succeed while `🧭 Casa — varrer e reconciliar todos os PRs abertos` fails or cancels — different guards, different conditions.

## Diagnosing CI / workflow failures

When a multi-job GitHub workflow has mixed results, do not treat the run as uniformly failed and do not read only the failed-step tail of the run log.

1. Enumerate the run's jobs: `gh api "repos/{owner}/{repo}/actions/runs/{run_id}/jobs" --jq '.jobs[] | {name,id,status,conclusion,step_run_duration_ms}'`.
2. Pick the specific failing (or stuck) job by name/id.
3. Read that job's logs: `gh run view {run_id} --job {job_id} --log-failed` (or `--log` when you need to see why a step partially succeeded).
4. If `--log-failed` returns nothing useful, check whether the run is still in progress (`status`) before concluding the log is empty.

Pitfall — `gh run view --job` and `gh api .../jobs/{id}/logs` fail outside a git repo:
both commands require a `.git` repository to determine the base repo context. Running them from a directory without `.git` (scratch dirs, arbitrary paths, worktree parent dirs) returns `failed to determine base repo: fatal: not a git repository`. Work from inside a valid git worktree or the repo root; `gh api repos/{owner}/{repo}/actions/jobs/{id}/logs` is the direct escape hatch when the CLI command blocks.

Pitfall — self-hosted runner online but busy means dispatch can kill the run without a job:
a self-hosted runner reported `status=online, busy=true` at dispatch time can leave a `runs-on: [self-hosted, Linux]` workflow failing with no jobs visible. Before reading the run as a code failure, check runner capacity: the online runner may already be executing another workflow. If a second self-hosted runner exists (`vmi3256920-centraldark` style naming), check its `status` too — one online, one offline is a frequent pattern. GitHub Actions does not queue for a busy single runner the way it would for GitHub-hosted capacity.
`gh run view --log-failed` on an in-progress run may return little or nothing; confirm `status` and retry sampling after a short wait, or inspect the specific job if other jobs already finished. Do not declare PASS from a missing log line.

Pitfall — workflow checkout is not the workspace checkout:
the workflow may clone to a dedicated checkout path (for example `.ci-house/`) and run scripts relative to that checkout. A script that exists in the local workspace tree may not be present in the workflow's checkout — especially when the local tree is behind `origin/main` or the script's path changed on main. When a workflow step references a script path, treat that path as authoritative for CI, not as a guarantee the file looks identical in the current local checkout.

Pitfall — CI FAIL on a SHA is not a local PASS on the same SHA:
reproduce the failing step on a **detached worktree of that exact HEAD** (`git worktree add --detach … origin/<branch>`). If contract/map/continuity pass locally and the CI log has no discriminant error, leave `CI_FAIL != LOCAL_REPRO` as UNKNOWN. Do not patch owners to "fix" a gate you cannot replay.

Pitfall — queued autonomia while the only online self-hosted runner is `busy` is WAIT, not FAIL:
do not treat a pending juiz job as a code blocker. Check both runners (`online+busy` vs `offline`) before inventing a second promoter or a VPS restart.

## Output shape CHEFE expects

When CHEFE asks SIM/NAO or "1 linha", answer that first in one line, then the block. No tutorial, no micro-step menu, no standing-goal HTML replay.

Literal block:

```text
MAIN_HEAD=
CASA_HEAD=
VPS_SOURCE=
RUNTIME_OWNER=
LOCAL_HEALTH=
PUBLIC_HEALTH=
MICRODEPLOY=
DEPLOYED_SHA=
RUNTIME_SHA=
FIXED_POINT=
```

VPS-reconciler / child-PR missions add:

```text
CHILD_HEAD=
VPS_HEAD_BEFORE=
VPS_HEAD_AFTER=
DIRTY_COUNT=
SAME_HEAD=
ACTION_REQUIRED=
PROMOTION_STATE=
COUNTERPROOF=
RECEIPT=
NEXT_CURSOR=
```

Then short tables of what moved. UNKNOWN stays visible. Do not re-argue PR-mãe or wait on ornamental CI. Post the receipt on the mother ledger; never merge the mother.

See `references/selfhosted-runner-git-auth.md` for the self-hosted runner Git auth failure pattern (fatal: could not read Username) and the first diagnostic moves before assuming script, diff, or buffer problems.

See `references/full-inventory-scans.md` for the C/E full-map scanner contract: resumable checkpoints, complete discovery, content hashing, and why sample/bounded receipts are not final proof.
