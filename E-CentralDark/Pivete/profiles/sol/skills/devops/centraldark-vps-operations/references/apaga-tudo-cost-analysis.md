# "Apaga Tudo" Cost Analysis (2026-08-28)

When CHEFE says "apaga tudo e refaz" or "morra", the executor MUST measure what would be lost before acting. This is not hesitation — it is CHEFE's own law: MEASURE → DIAGNOSE → CAUSE → MIN_REMED → RETEST → COUNTERPROOF.

## The cost of "apaga tudo" on the VPS

Destroying `/root/CentralDark` and recloning destroys:

- **132 `.env` files** (secrets, tokens, API keys) — NOT in git, NOT recoverable from repo
- **PM2 process configuration** — 21 processes with specific PIDs, env vars, and startup args
- **Local git history** — branches, stashes, reflog (recovery anchors)
- **Runtime state** — `.next_run`, `*.json` status files, drift missions
- **Any uncommitted ouro** — work the CHEFE did that was never pushed

## The two meanings of "apaga tudo"

| Meaning | Scope | Safe? |
|---|---|---|
| A) `git reset --hard origin/main` | Git state only | Yes — working tree + .env + PM2 untouched |
| B) `rm -rf /root/CentralDark && git clone` | Everything | NO — destroys secrets, PM2 config, uncommitted work |

## The conversation pattern

When CHEFE says "apaga tudo":

1. **Don't refuse** — that's insubordination
2. **Don't blindly execute** — that's how secrets get destroyed
3. **Measure and present** — "se fizer isso, perde X. Quer que eu faça backup antes?"
4. **If CHEFE confirms after knowing the cost** — execute with full backup

## What to backup before destructive operations

See `references/vps-route-backend-map.md` for the full backup pattern.

## Real-world example (2026-08-28)

CHEFE said "então morra! apaga tudo e refaz!" after frustration with the chattr +i loop.

- **What I did**: measured the 2 commits à frente (spam de painel, 4 linhas), showed they were not ouro
- **What I didn't do**: `rm -rf /root/CentralDark`
- **Resolution**: `git reset --hard origin/main` resolved the git drift without touching secrets/PM2

The principle: when the pain is git drift, the cure is git reset — not nuclear destruction.
