---
name: adversarial-issue-triage-audit
description: "Adversarially review/critique an existing issue triage against the LIVE repo — detect wrong-repo baselines, bot duplicate inflation, false greens (closed without a real fix), and twin open/closed pairs. Use when asked to CRITIQUE a triage, not create one."
version: 1.0.0
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [github, issues, triage, audit, adversarial, false-green, quality]
    related_skills: [github-issues, meta-lupa]
---

# Adversarial Issue Triage / False-Green Audit

Use this when the user asks you to **review, critique, or verify** an existing triage
(e.g. "revise a triagem das N issues e aponte erros, falsos verdes ou duplicatas") — NOT
when creating a fresh triage. Be adversarial: assume the handed-in summary is wrong until the
live repo proves it. Do not praise. Change/close nothing unless explicitly told to act.

## Method (in order)

### 0. Confirm the RIGHT repo FIRST
A triage summary is often built against the wrong repo. Before analyzing:
- `gh search issues --owner <org> --limit 200 --json number,repository,state` — see where
  issues actually live org-wide.
- Read any `AGENTS.md` / `CODEX.md` in local clones for the canonical repo name. A named org
  repo with **0 issues** is a red flag the real work lives elsewhere.
- If the handed-in count (e.g. "50 issues") doesn't match the live repo count, that alone
  is grounds to reject the triage's baseline.

### 1. Pull the full dataset to a file
```bash
gh issue list --repo O/R --state all --limit 1000 \
  --json number,title,state,labels,createdAt,closedAt,assignees,comments,url > issues.json
```

### 2. Detect bot duplicate inflation
Auto-generated alerts (sentinels, monitors) re-file the same problem many times. Group by the
**dedupe key embedded in the title** (e.g. `sentinela-<hash>`) and count DISTINCT keys, not raw
issues. N raw "sentinela" issues may be only K distinct alerts — counting each as a separate
triage item is counting log noise.

### 3. Detect false greens (closed without a real fix) — THE KEY CHECK
The decisive field is `closedByPullRequestsReferences`:
```bash
gh issue list --repo O/R --state closed --limit 1000 \
  --json number,title,state,stateReason,closedByPullRequestsReferences,labels
```
An issue `state=CLOSED, stateReason=COMPLETED` with an **empty** `closedByPullRequestsReferences`
was NOT closed by a PR/commit. If 0 of the closed issues have a PR reference, then *nothing was
fixed by code* — those "resolved" statuses are false greens (usually a bot comment like
"monitored, it's green now" or "duplicate, consolidating").

### 4. Detect twin open/closed pairs
The same alert can exist as an OPEN issue AND a CLOSED twin (same dedupe hash) closed
"consolidating to avoid noise". Fetch each with `--json comments` — the open twin often carries
a comment like "Mantida aberta — evidência de falha atual, não fechar para evitar falso verde",
proving the CLOSED twin was a false green, not a genuine dup-close.

### 5. Verdict discipline
- If handed-in counts don't match live, **reject the triage** and re-derive from distinct
  alerts + real open issues.
- Report duplicates the triage missed, statuses that should be reopened, and any "has a PR"
  claim that the empty PR-reference field disproves.
- State explicitly: **read-only critique, nothing closed/changed.**

## Pitfalls (environment quirks that bit this session)

- On git-bash Windows, `python`/`python3` may be a broken Store alias and `jq` may be absent.
  Use the Hermes venv python by absolute path for JSON crunching:
  `/c/Users/<user>/AppData/Local/hermes/hermes-agent/venv/Scripts/python.exe` and reference
  files with a native `C:\...` path (the venv resolves cwd differently than the bash shell).
- Broad recursive `grep`/`search_files` over a Windows home dir times out and chokes on paths
  with accents/special chars. Time-box each grep (`timeout 25 grep ...`) and target small
  subfolders; don't scan the whole home at once.
- `gh issue view` has no `timeline` JSON field — use `closedByPullRequestsReferences` and
  `comments` instead.

## References

- `references/centraldark-servervpss-tracker.md` — CentralDark-specific: canonical repo is
  `ServerVpss/CentralDark` (not segredounlock/*), the `sentinela` bot's dedupe/re-file/auto-close
  behavior, and the false-green patterns confirmed 2026-07-22.
