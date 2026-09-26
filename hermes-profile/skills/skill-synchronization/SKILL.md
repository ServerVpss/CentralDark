---
name: skill-synchronization
description: "Verify CentralDark Hermes skill sync against canon."
related_skills: [centraldark-ops, reconciliacao-diaria-centraldark, centraldark-hermes-operations]
---

# Skill Synchronization

Part of the `centraldark-ops` operational family. Verifies that local Hermes Agent skills match the canonical versions in the CentralDark repository and reports any discrepancies via a comment on PR #1562. All changes must flow through the PR-magazine #1562 workflow; this skill only reports.

## Always-on
- REUSE_BEFORE_CREATE: use the existing verification script; do not invent ad‑hoc checks.
- ONE_SYSTEM_ONLY: source of truth is the canonical repo (`docs/CONSCIENCIA/HERMES-SKILLS/` on `main`).
- UNKNOWN_IS_NOT_PASS: treat ambiguous skill presence as unknown, not as present or missing.
- NO AUTOMATIC MUTATION: the skill only reports; never applies changes directly.
- ONE WRITER PER SCOPE: only PR #1562 comments are the output; no direct pushes to skills dir.

## Procedure
1. **Prerequisites**
   - `gh` CLI authenticated (`gh auth status`).
   - `jq` installed.
   - Access to the Hermes Agent local skills directory (`%LOCALAPPDATA%\hermes\skills`).
   - Workspace root of CentralDark repo (where `scripts/skill-sync-check.sh` resides).

2. **Run verification**
   - Execute `bash scripts/skill-sync-check.sh` from the repo root.
   - The script compares canonical skills (from `docs/CONSCIENCIA/HERMES-SKILLS/`) with locally installed skills.
   - It logs to `/tmp/skill-sync-check-<timestamp>.log` and, if differences exist, posts a comment to PR #1562.

3. **Interpret the report**
   - **Missing canonical skills** (❌): skills present in the repo but not installed locally. Install via:
     `skill_manage create --name <skill> --content <canonical file>`
   - **Extra local skills** (⚠️): skills present locally but not in the canon. Evaluate:
     - If they are work‑in‑progress, propose them as new skills via a PR.
     - If obsolete, consider removing them (still via PR).
   - **No comment**: skills are synchronized; no action needed.

4. **Frequency**
   - Run daily (e.g., via Windows Task Scheduler) to keep PR #1562 informed.
   - Also run after any local skill installation or before starting a reconciliação loop.

## Pitfalls
- **Do not treat the script as an automatic sync**: it only reports differences; never assume it has updated skills.
- **Preserve UNKNOWN**: if the script cannot determine a skill’s status (e.g., permission issues), report it as unknown.
- **Avoid skill drift**: regular verification prevents accumulation of divergences that would break the "no work stays only local" rule.
- **Never bypass the PR**: even if you are sure a change is safe, still submit it via a branch → PR → comment on #1562 → review → merge.

## References
- See `scripts/skill-sync-check.sh` for the exact verification implementation.
- See `docs/CONSCIENCIA/HERMES-SKILLS/` for the canonical skill definitions.
- See PR #1562 for the historical record of skill‑sync reports and decisions.
