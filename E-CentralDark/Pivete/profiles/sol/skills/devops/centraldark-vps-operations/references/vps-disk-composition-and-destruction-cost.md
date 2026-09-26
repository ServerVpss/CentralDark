# VPS Disk Composition & Destruction Cost Analysis

Measured 2026-08-28 on CentralDark VPS (`/root/CentralDark`).

## Disk Composition

| Component | Size | Notes |
|-----------|------|-------|
| Total | 15 GB | |
| `.git/` | 8.1 GB | Inflated by 5000+ spam commits from painel bot |
| Working tree | 5.9 GB | |
| `.env` files | 30 files (131 .env*) | Secrets, NOT tracked in git |
| Logs | 166 MB | crafter-out.log (87MB), crafter-cycle.log (40MB), etc. |
| Untracked files | 10 | drift missions, status heartbeats, telepainel |

## PM2 Processes (21 total, 17 online)

All with cwd `/root/CentralDark`. Includes: MCP, Hermes, Arsenal, GraphPanel, Guardiao (Bot/Bridge/Consciencia), HubBot, Memoria, OAuthBroker, PiveteSync, WebhookDeploy, EliteHTTP, LovableBridge, ArtifactsBuilder/Crafter, GrafoVivo, AiPromptAPI, AiDiag (stopped), HermesVerificador (errored).

## The "Apaga Tudo" Near-Miss

A suggestion to "apaga tudo e refaz" (destroy everything and rebuild) was **disproportionate** for the actual problem (2 spam commits from painel bot). Cost of that suggestion:

- **132 .env files** (secrets) — do NOT exist on GitHub, would be permanently lost
- **21 PM2 processes** — all would crash simultaneously
- **15 GB of runtime state** — gone

**Lesson:** If the problem is N spam commits, the solution is `git reset --hard origin/main`, NEVER infrastructure destruction. Measure destruction cost BEFORE suggesting it. If cost > problem, the suggestion is wrong.

## The 22k False Positive

The "22,054 files with chattr +i" was a **filter bug**: `lsattr -R | awk '$1 ~ /i/'` counts the letter "i" anywhere in the line (file paths, other attributes, directory headers). Real count: **9 files** in HERMES-CORE.

**Correct filter:**
```bash
git ls-files -z | xargs -0 lsattr 2>/dev/null | awk '{print $1}' | grep '^.*i-'
```

## Backup-Before-Destroy Pattern

When CHEFE says "apaga tudo" or "morra":
1. Measure what exists (disk, .env, PM2 dump)
2. Backup to `/root/CentralDark-backup-<date>/` (outside repo tree)
3. Prove integrity (sha256 each file)
4. Only then execute destruction
5. Restore after reinvention

## Safe Cleanup Commands

```bash
# Align VPS with main (safe, reversible via anchor tag)
ssh Segredo-VPS "cd /root/CentralDark && git reset --hard origin/main"

# Remove orphan rebase residue
ssh Segredo-VPS "cd /root/CentralDark && rm -rf .git/rebase-merge"

# Clean logs (safe)
ssh Segredo-VPS "cd /root/CentralDark && find . -name '*.log' -not -path './.git/*' -delete"

# NEVER run this without explicit CHEFE authorization:
# ssh Segredo-VPS "rm -rf /root/CentralDark"  # DESTRUCTIVE
```
