---
name: github-backlog-triage
description: "Triage/audit a large open-issue backlog (dozens), especially repos with auto-generated monitoring alerts (Sentinela-style bots). Classify by root cause, verify 'down' claims live with curl before reporting."
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [GitHub, Issues, Triage, Audit, Backlog, Monitoring-Bots]
    related_skills: [github-issues, github-pr-workflow]
---

# GitHub Backlog Triage (mass audit + live verification)

Use when asked to read, classify and group a large number of open issues — especially when the repo has a bot that auto-opens "service down / endpoint 5xx / workflow red" alerts. The defining trap: **auto-alerts go stale — never trust a "down" claim without a live curl check**, or you'll report 13 outages when only 1 is real.

## When to use

- "Leia todas as N issues abertas, classifique e agrupe por causa raiz."
- Any issue audit on a repo with a recurring health-check / sentinela bot.
- Triage where the output must distinguish *recovered* vs *still failing* vs *needs work* vs *blocked on human*.

## Workflow (verified on a 50-issue audit)

### 1. Pull full state as a JSON ARRAY (not a stream)
```bash
gh api repos/$OWNER/$REPO/issues?state=open&per_page=100 > issues_array.json
```
- `gh issue list` caps at 100 without pagination — prefer the raw API call for 50+ issues.
- Do **NOT** use `gh api ... --jq '.[]' | {...}` into a file then `json.load()` — the streamed NDJSON breaks Python's `json.load`. Fetch the array, then post-process in Python.

### 2. Split auto-alerts from human issues
```python
import json
data = json.load(open('issues_array.json'))
issues = [i for i in data if not i.get('pull_request')]  # GitHub returns PRs in /issues
def is_bot(i):
    return i['title'].startswith('[SENTINELA') or any(
        'sentinela' in (l.get('name') or '').lower() for l in i.get('labels', []))
sent = [i for i in issues if is_bot(i)]
human = [i for i in issues if not is_bot(i)]
```
- Reliable bot signal = title prefix `[SENTINELA` OR a `sentinela` label. Do **not** rely on the bot's other labels (noisy).
- Always exclude PRs (`pull_request` key) — they inflate the count.

### 3. Classify humans by the user's taxonomy, grouped by ROOT CAUSE
Use whatever enum the user gives (e.g. `JÁ_CORRIGIDA / OBSOLETA / DUPLICADA / FALHA_CONFIRMADA / PRECISA_DE_PR / BLOQUEADA_POR_PIVETE`). Group by **root cause**, not by issue type — that's what makes the table actionable. Dump each human body to a file for reading:
```python
import os
os.makedirs('bodies', exist_ok=True)
for i in human:
    open('bodies/%d.txt'%i['number'],'w').write(
        "TITLE: %s\nLABELS: %s\n\n%s"%(i['title'],
        [l.get('name') for l in i.get('labels',[])], i.get('body') or "(vazio)"))
```

### 4. Verify live status before trusting ANY "down" alert
Auto-alerts can be hours/days stale and relabel slowly. Probe the cited URL(s):
```bash
# Endpoint health
for u in "https://api.centralldark.com/health" "https://mcp.centralldark.com/health"; do
  curl -s -o /dev/null -w "HTTP %{http_code} | %{time_total}s | $u\n" --max-time 8 "$u"
done
# CORS-style alerts ("MCP sem CORS no painel"):
curl -s -I --max-time 8 "https://mcp.centralldark.com/health" | grep -i access-control-allow-origin
```
- Now 200 (+ expected CORS header) → **recovered / JÁ_CORRIGIDA**. Don't report as active.
- Still 502/503/timeout/fetch-failed → **FALHA_CONFIRMADA**.
- Many alerts on the same URL = one root cause (e.g. `install.centralldark.com` 503 → issues #23, #221, #195).

### 5. Find the gating blocker
If many CI/workflow alerts are red with no PR, find the shared root and state it once (e.g. "GitHub Bot Controller broken → `assign:*` bots can't act"). Don't list each red workflow separately.

### 6. Emit a compact table grouped by root cause
See `references/mass-triage-live-verify.md` for the probe recipe and an output-table template.

## Pitfalls
- **Don't classify an auto-alert as a live outage without curl.** On the audit that spawned this skill, 15/26 Sentinela alerts were already recovered (endpoints back to 200 + CORS `*`); only `install.centralldark.com` (503) was genuinely still down.
- `python3` may be missing on Windows hosts even when `python` (uv-shipped 3.11) works — use `python` in the MSYS terminal.
- Per-call terminal state does NOT persist between `terminal()` invocations on Windows MSYS — write intermediate JSON to `$HOME` and process in the same command, or chain fetch+process in one call. `/tmp` is unreliable across calls.
- **Branch born from `origin/main` lacks code from a still-draft PR.** If PR #X (e.g. auto-registro) is still draft, a new branch off `origin/main` will NOT contain that code; a script can silently regress to base version. Fix via `git cherry-pick <commits>` from the source branch (without touching the original PR) or merge the source branch in. Never mix the mission into the unrelated PR.
- **Don't close issues just to zero the counter.** Classify JÁ_CORRIGIDA / OBSOLETA / DUPLICADA / FALHA_CONFIRMADA / PRECISA_DE_PR / BLOQUEADA_POR_PIVETE. SENTINELA "down" claims need a live curl before closing (false-green = veto). RISCO-SERVIDOR / PRECISA-DE-OK stay BLOQUEADA (open, commented).
- **`gh issue list --json` prefix-filter beats label-filter for bots.** The `🛡️ SENTINELA` label is rare; the reliable bot signal is the `[SENTINELA` title prefix OR a `sentinela-xxxx` label. Using the official label alone undercounts (e.g. 2 vs 26).
- **Git conflict add/add on a ledger JSONL when merging main:** resolve by concatenating recibos (append-only, dedup by (usage_id, event)), never `--theirs` (that deletes the other side's recibos).
- **Merge control gates before `gh pr merge`:** fresh HEAD/SHA, diff only in scope, zero secrets (grep Bearer/KEY/IP/JWT/PAT — but sanitization regex STRINGS in diff are not leaks), checks COMPLETED, rollback demonstrable (`git revert` / parent of head). No force-push; `--force-with-lease` only with explicit Pivete authorization (consent gate fires without it).
- **`--pr` clashes with `--prior` in argparse** (prefix match). Use `--pr-state` or omit the arg in `finish-use`.

## Related
- `github-issues` — single-issue create/label/assign/view ops.
- `github-pr-workflow` — PR lifecycle, relevant when alerts say "needs PR".
