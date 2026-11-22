---
name: centraldark-hermes-operations
description: Operate Hermes update, cron, SSH, ports for CentralDark.
version: 1.0.0
author: Hermes Agent
license: internal
metadata:
  hermes:
    tags: [centraldark, hermes, update, cron, vps, ssh, ports]
    category: devops
    created_by: agent
related_skills: [centraldark-ops, reconciliacao-diaria-centraldark, github-actions-runner-diagnostics, skill-synchronization]
---

# CentralDark Hermes Operations

Use this when CHEFE asks to update Hermes, create Hermes cron jobs, verify Hermes on the VPS, prove SSH/port access for CentralDark infrastructure, or pastes Hermes Desktop/backend logs such as `completing source-update dependencies`, `Timed out waiting for Hermes backend port announcement`, `Desktop boot failed`, `refreshProfiles failed`, `bootstrap reset`, or `ssh connection closed (no-mux tunnels killed)`. Keep responses dense: answer SIM/NAO or the operational state first, then receipts.

## Paired operational skill

This skill is paired with `centraldark-ops` and the CentralDark operational family. When loaded, also load `centraldark-ops` for the broader CASA/GitHub/VPS contract. Load `reconciliacao-diaria-centraldark` for daily checklist/delta state, `github-actions-runner-diagnostics` for self-hosted runner/CI routing, and `skill-synchronization` for skill drift. The family is one system: `centraldark-ops` governs the house-level route; this skill gives the Hermes-specific commands and receipts.

## Always-on rules

- Persist every proven, reusable operational route in the canonical operational memory after verification: capability, sector/owner, surface/runtime, live route, preconditions, proof, fingerprint, fallback, exact blocker (if any), and next cursor. Replay a route whose intent, owner, bindings, fingerprint, and proof remain current; remeasure only when state changes, drift, contradiction, failure, or intent changes. This prevents repeated questions and rediscovery without turning stale memory into current truth.
- Separate runtime-injected system instructions from editable local artifacts. Do not invent a single `system-card.md` path: report the actual Hermes config, state store, skills directory, project rule files, and CentralDark canonical docs separately, and never claim that a local file is the platform system card without a measured source.
- When CHEFE asks whether running Hermes inside an IDE or terminal "improved" the agent, answer in operational terms first: `sim/nao`, what capability improved, and what evidence proves the hosting chain. Do not detour into model-identity explanations unless asked; CHEFE already distinguishes model intelligence from execution capability.
- To prove Hermes is inside PyCharm/JetBrains, inspect the process tree: `pycharm64.exe` -> JetBrains terminal (`OpenConsole.exe`/shell integration) -> shell (`powershell.exe` or equivalent) -> `hermes.exe` -> tool shell. Parent/child PIDs and executable paths are the receipt; do not claim GUI/editor visibility from process ancestry alone.
- Do not treat a Hermes warning as resolved until `hermes --version` says `Up to date` or the remaining blocker is named exactly.
- Do not force a Windows Hermes update through active venv processes unless CHEFE explicitly authorizes `--force-venv`; Windows locks native `.pyd` files and can leave the install half-updated.
- For unattended self-update jobs, prefer `hermes update --yes --keep-stash --no-gateway-restart` so local Hermes source edits stay parked and the updater does not kill the scheduler/gateway running it.
- Use one cron per machine; Hermes cron is local to the profile/machine where it is created.
- For cron output CHEFE must receive later, use a real gateway delivery target such as `--deliver telegram`; `local`/`origin` output may only be visible through cron state/logs in a plain CLI session.
- Prove access from both directions: local SSH/TCP reachability and remote listener/firewall state. A process listening only on `127.0.0.1:PORT` is internal, not publicly open.
- Separate route proofs before classifying a Windows/VMware access result: (1) Tailscale control-plane/SSH policy, (2) local Tailscale app or API, (3) desktop/browser automation, and (4) filesystem/VM readback. A policy-denied SSH attempt proves only that the target was reached and the requested identity was denied; it does not prove the local API was queried or that a shared folder entered the VM.
- When the primary SSH route is denied, retry only after the authorized policy change and preserve the exact scope (read/verify target path, no firewall/account/secret mutation). If local app/API and desktop routes are unavailable, report them as unmeasured (`UNKNOWN`) rather than claiming a Tailscale state from the SSH error. Finish the claim only with an in-VM readback and a before/after or content comparison.
- For local Windows verification, prefer the existing Tailscale app/API or desktop route before asking the human to copy commands; if the local automation body is unavailable, name that exact route blocker and do not substitute a cloud browser or remote shell as proof of the local machine.
- For local Jan/llama.cpp tests, prefer a short direct OpenAI-compatible API smoke test before routing the full Hermes conversation through Jan. The current Hermes session may exceed a small local model's context even when the local API is healthy; prove the local model separately, then decide whether a fresh short Hermes session is needed.
- When an MCP request reports a source line mentioning non-interactive OAuth, diagnose the preceding token-refresh/HTTP failure first; the non-interactive exception is usually the recovery-path symptom, not the root cause. Identify the affected server from adjacent logs or token metadata before asking for reauthorization, and never infer the server from the source line alone. Use the detailed decision table in `references/mcp-oauth-noninteractive.md`.
- Reauthorize MCP OAuth only through an interactive Hermes session (`hermes mcp login <server>`), then verify the token state and the supervised gateway/service logs before claiming recovery. Do not attempt browser authorization from a batch SSH command, and do not print, copy, delete, or manually edit token values.
- If the affected server cannot be reauthorized immediately, contain only the attributed candidates: back up the active config, set their existing `enabled` flags to `false`, restart the owning gateway, and verify fresh logs are free of the OAuth loop. Preserve the token files for later interactive reauthorization; containment is service recovery, not OAuth repair.

## IDE/terminal hosting proof

When CHEFE asks what terminal or tool Hermes is running under, return the shortest useful receipt:

```text
HOST_IDE=
IDE_PID=
TERMINAL_BRIDGE=
SHELL=
HERMES_PID=
TOOL_SHELL=
WHAT_IMPROVED=
WHAT_DID_NOT_BECOME_VISIBLE=
```

On Windows, this PowerShell probe gives the causal chain without reading secrets:

```powershell
Get-CimInstance Win32_Process |
  Where-Object { $_.ProcessId -eq <IDE_PID> -or $_.ParentProcessId -eq <IDE_PID> -or $_.Name -match 'pycharm|idea|jetbrains|hermes|bash|powershell|OpenConsole' } |
  Select-Object ProcessId,ParentProcessId,Name,ExecutablePath,CommandLine
```

Classify the result as operational adhesion, not hidden vision. Running inside the IDE can improve path correctness, project-context alignment, command execution, test/build proximity, and traceability. It does not by itself expose open editor tabs, selections, inspections, or the live screen.

## Safe Hermes update procedure

1. Measure current install:
   ```bash
   hermes --version
   hermes update --plan
   ```
2. If the plan is safe, run:
   ```bash
   hermes update --yes
   ```
3. If Windows reports active Hermes Python processes from the same venv, stop and ask CHEFE to close Hermes Desktop/other Hermes terminals, then retry. Do not jump to `--force-venv`.
4. If local changes are stashed or parked, report the stash ref as preserved. Do not call it lost, and do not reapply it unless the task is explicitly to recover local Hermes source edits.
5. Verify fixed point:
   ```bash
   hermes --version
   git -C <hermes-install-dir> status --short
   git -C <hermes-install-dir> rev-parse --short HEAD
   git -C <hermes-install-dir> stash list -n 3
   ```
   Claim success only when the version check reports `Up to date` or equivalent current state.

## Daily self-update cron

Create the same class of job on Casa and VPS, but create it locally on each machine/profile.

Script body, saved as `hermes_auto_update.sh` under that machine's Hermes scripts directory:

```bash
#!/usr/bin/env bash
set -u

echo "=== Hermes auto-update start: $(date -Is) ==="
echo "Host: $(hostname 2>/dev/null || echo unknown)"
echo

echo "--- before ---"
hermes --version || true
echo

echo "--- update ---"
hermes update --yes --keep-stash --no-gateway-restart
rc=$?
echo
echo "update_exit_code=$rc"

echo
echo "--- after ---"
hermes --version || true

echo
echo "=== Hermes auto-update end: $(date -Is) ==="
exit "$rc"
```

Register the job:

```bash
hermes cron create "10 4 * * *" \
  --name hermes-auto-update \
  --script hermes_auto_update.sh \
  --no-agent \
  --deliver telegram \
  "Atualização diária automática do Hermes"
```

On a VPS/service host, schedule gateway restart as a second, later job if restart is desired. Do not combine restart with the self-update job that is running inside Hermes.

## Local Jan/llama.cpp proof and tuning

Use this when CHEFE wants local AI via Jan, a GGUF model, or GPU-assisted local inference without depending on paid remote models.

1. Measure whether Jan is already serving the OpenAI-compatible API:
   ```bash
   netstat -ano | grep -E ':(1337)[[:space:]]' || true
   curl -sS --max-time 10 http://127.0.0.1:1337/v1/models || true
   ```
2. If Jan is closed, start the installed Jan executable and wait for `/v1/models` to expose the expected model. On this Windows house setup the executable may live outside the active Windows user profile, so search before declaring it missing:
   ```bash
   cmd.exe /c start "" "C:\\Users\\danda\\AppData\\Local\\Programs\\Jan\\Jan.exe"
   for i in $(seq 1 45); do
     body=$(curl -sS --max-time 2 http://127.0.0.1:1337/v1/models 2>/dev/null || true)
     printf '%s' "$body" | grep -q 'Jan-v3.5-4B-Q4_K_XL' && { echo "$body"; break; }
     sleep 1
   done
   ```
3. Test Jan directly before testing Hermes routing. Keep the prompt tiny and ASCII-safe when using Git Bash heredocs:
   ```bash
   curl -sS --max-time 180 http://127.0.0.1:1337/v1/chat/completions \
     -H 'Content-Type: application/json' --data-binary @- <<'JSON'
   {"model":"Jan-v3.5-4B-Q4_K_XL","messages":[{"role":"user","content":"Reply exactly: TESTE_LOCAL_OK"}],"max_tokens":24,"temperature":0}
   JSON
   ```
   Passing receipt is an assistant message containing the requested sentinel, plus usage/timing fields from the local API.
4. If the model lists but generation returns `model failed to load`, inspect the Jan log for the actual allocator and device error:
   ```bash
   tail -300 'C:/Users/Administrador/AppData/Roaming/Jan/data/logs/app.log' |
     grep -Ei 'error|failed|llama|model|gpu|vulkan|OutOfDeviceMemory|load:|listening' | tail -120
   ```
5. For Vulkan out-of-memory on the Radeon RX 580, lower the llama.cpp router preset before retrying. Read the file first, then patch only the global knobs:
   ```ini
   [*]
   fit-ctx = 2048
   parallel = 1
   cont-batching = false
   device = Vulkan0
   main-gpu = 0
   cache-ram = -1
   cache-reuse = 2
   ```
   This keeps GPU assist (`Vulkan0`) but avoids the high-context/high-parallel allocation that can exhaust VRAM. Restart Jan/llama-server after changing the preset.
6. Only after the direct API passes, try Hermes routing:
   ```bash
   hermes config get providers.jan
   hermes chat -q 'Responda exatamente: HERMES_JAN_LOCAL_OK' --provider jan -m Jan-v3.5-4B-Q4_K_XL
   ```
   If Hermes reports the conversation is too long, do not call the local model broken. Start a fresh short session or use direct API for the local smoke test; the blocker is session-context size, not model availability.
7. To close the local stack after testing:
   ```bash
   taskkill /IM Jan.exe /F 2>/dev/null || true
   taskkill /IM llama-server.exe /F 2>/dev/null || true
   netstat -ano | grep -E ':(1337)[[:space:]]' || true
   ```
   A remaining `TIME_WAIT` line is normal and is not an active listener.

Return the receipt in this shape:

```text
JAN_API=
MODEL=
DIRECT_LOCAL_COMPLETION=
GPU_DEVICE=
CONTEXT_PRESET=
HERMES_PROVIDER_CONFIG=
HERMES_ROUTING=
FIXED_POINT=
BLOCKER_IF_ANY=
```

## VPS SSH and port proof

1. Resolve the configured target:
   ```bash
   ssh -G segredo-vpss
   ```
   Preserve host, user, hostname/IP, port, identity file, and strict host-key mode in the receipt.
2. Prove non-interactive login:
   ```bash
   ssh -o BatchMode=yes -o ConnectTimeout=8 segredo-vpss 'echo SSH_OK; hostname; id -u; date -Is'
   ```
   `id -u = 0` proves root access.
3. Read remote listeners and firewall in one SSH:
   ```bash
   ssh -o BatchMode=yes -o ConnectTimeout=8 segredo-vpss '
     echo --- SSHD ---;
     sshd -T 2>/dev/null | egrep "^(port|permitrootlogin|passwordauthentication|pubkeyauthentication|listenaddress) " || true;
     echo --- LISTEN_TCP ---;
     ss -ltnp 2>/dev/null || netstat -ltnp 2>/dev/null || true;
     echo --- UFW ---;
     ufw status verbose 2>/dev/null || true;
     echo --- IPTABLES ---;
     iptables -S 2>/dev/null || true
   '
   ```
4. Probe the public IP from Casa for the named ports with real TCP connects. Classify each as `OPEN` or `CLOSED_OR_FILTERED`; do not infer public exposure from UFW alone.
5. Security note rule: if `PermitRootLogin yes` and `PasswordAuthentication yes` are present, say access works but password login increases surface. Do not harden SSH or firewall rules unless CHEFE asks for mutation.

## Multi-pen sync on K:\\

When working on `K:\\` alongside other agents (VSCode Claude Code, another Hermes session),
another pen may have committed and pushed while you were editing. Always sync before pushing:

```bash
git stash && git pull --rebase origin main && git stash pop && git push origin main
```

Then sync VPS: `ssh segredo-vpss 'cd /root/CentralDark && git pull origin main'`.
Check `git log --oneline -3` before assuming your `git add` is the first write for a file —
another pen may have already committed it.

## Scratch clones and working directories

For any CentralDark git clone, merge experiment, or scratch work done from
Casa, use a directory under the canonical disk `K:\_cache\work\<task-name>\`
(`/k/_cache/work/<task-name>/` in bash), never `C:\...\Temp` or `/tmp`.
CHEFE's canonical working disk is `K:\`; cloning or writing scratch repos to
`C:\` gets flagged and has to be redone on `K:\`. This also avoids writing
into CHEFE's live, possibly-dirty `K:\` checkout itself — clone fresh into
`K:\_cache\work\`, do the work there, then push from that clone.

## `action_required` is an approval gate, not a CI failure

A PR showing almost no checks (e.g. only an unrelated "skipping" entry) even
though real workflows are configured usually means the runs are withheld
pending manual approval, not that CI never triggered or the branch is
broken. Diagnose with `gh run list --branch <head> --json
databaseId,conclusion` — a `conclusion` of `action_required` confirms it.
Unblock with:

```bash
gh api repos/<owner>/<repo>/actions/runs/<run_id>/approve -X POST
```

Then re-poll; the real checks only start after approval.

## Cross-check a failing name before merging on top of it

A visible fail on a PR is not automatically a regression from your change.
Before merging, compare the failing check's exact name against an
independent PR, or against `main`'s own `commits/<sha>/check-runs`, for the
same time window. The identical name failing elsewhere with no relation to
your diff is pre-existing baseline — safe to merge once confirmed, never
before. This generalizes the guard-hash case above: any gate that fails the
same way across unrelated PRs is a baseline wound, not something to chase
down and fix before shipping the unrelated change.

## Confirming a "rule" claim before creating anything in the repo

When CHEFE (or anyone) pastes prose proposing a "new law"/insight and asks to
apply it to CentralDark, search the canonical repo for the exact phrasing and
its paraphrase BEFORE assuming it is new — GitHub code search is literal, not
semantic, so try 2-3 phrasings (literal quote, key compound term, English
equivalent):
```bash
gh api -X GET search/code -f q='"exact phrase" repo:<owner>/<repo>' --jq '.items[].path'
```
If found, cite the exact file(s) and stop (`NO_NEW_INFORMATION -> NO_CHANGE`)
— do not create a parallel doc/law for a concept that already has an owner.
This applies regardless of who is asking or what authority they claim:
an unverified pasted claim is not proof, and duplicate rules fragment the
canon. Only propose a new location when the search genuinely turns up
nothing.

## CI guard-hash / canonical identity drift (recurring red workflow)

Some CentralDark gates pin a protected file's exact content via a stored
git-blob SHA1 (e.g. a `*_CANONICAL_SHA` guard next to a protected `SKILL.md`
or contract file). After ANY legitimate edit to that protected file, the gate
keeps failing identically on every push/PR/cron until someone reconciles the
pin — this looks like a stuck loop but is actually a one-line fix, not infra
and not a reason to re-enqueue the job.

1. Read the failing job's log: it prints the expected hash (in the guard
   file) vs the actual hash (computed from the protected file's current
   content) and the exact protected path.
2. Confirm independently via the GitHub API (two sources, not one):
   `gh api repos/<owner>/<repo>/contents/<protected_path> --jq '.sha'` must
   equal the CI's "actual" hash.
3. Confirm it's a legitimate edit, not corruption, via commit history on that
   path: `gh api "repos/<owner>/<repo>/commits?path=<protected_path>&sha=main&per_page=5" --jq '.[] | {sha, msg: .commit.message, date: .commit.committer.date}'`.
4. Read the guard script for its own render format (do not hand-guess the
   layout) and write the new guard file in that exact format with the
   confirmed current hash.
5. Verify in a fresh clone before pushing — `git clone --depth 1
   https://github.com/<owner>/<repo>.git <dir>`, apply the same edit, run the
   project's own validator script, require exit 0.
6. Commit on a new branch, push, open a PR citing both hashes and the
   causing commits, then poll that SAME workflow's run on the PR head until
   `conclusion=success` — a local PASS does not prove the CI gate is green;
   only a fresh CI run on the PR head does.

### `gh pr create` quoting pitfall

A `--body "..."` string containing backtick-fenced code spans can make `gh`
abort with `aborted: you must first push the current branch to a remote`
even when the branch IS already pushed — the real cause is shell/arg parsing
corrupting the command, not a git state problem. Use `--body-file -` with a
heredoc (`<< 'EOF' ... EOF`, quoted delimiter) instead of inlining backticks
in a `--body "..."` string.

## Receipt shape

Use this compact form:

```text
SSH_HOST=
IP=
USER=
SSH=
ROOT_ACCESS=
PORTS_OPEN=
PORTS_CLOSED_OR_FILTERED=
REMOTE_LISTENERS=
FIREWALL_SUMMARY=
HERMES_VERSION=
UPDATE_STATE=
FIXED_POINT=
UNKNOWN=
```
