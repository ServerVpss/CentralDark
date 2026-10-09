---
name: skill-synchronization
description: "Keep CentralDark autonomous skills sealed between current main and Hermes runtime."
version: 0.2.0
related_skills: [centraldark-ops, reconciliacao-diaria-centraldark, centraldark-hermes-operations, centraldark-oracle-surface]
centraldark_autosync: true
centraldark_autosync_policy: main-runtime-lock
oracle_review_on_change: true
---

# Skill Synchronization

This is the single synchronization owner for CentralDark autonomous/core skills.

Canonical source:
ServerVpss/CentralDark@main under .agents/skills/**/SKILL.md

Runtime consumer/mirror:
~/.hermes/skills/<same-relative-path>/SKILL.md

## Contract

CURRENT_MAIN_IS_CANONICAL=true
RUNTIME_IS_EVIDENCE_AND_CONSUMER=true
NO_SECOND_SKILL_SYNC_ENGINE=true
ONE_WRITER_PER_SCOPE=true
NO_BLIND_OVERWRITE=true
ORACLE_REVIEW_ON_MATERIAL_SKILL_CHANGE=true
MAIN_RUNTIME_HASH_SEAL=true

Only skills with centraldark_autosync: true are in automatic scope. This avoids bulk-enabling unrelated third-party/security skills.

## Procedure

At every CentralDark Eternal Self-Heal wake and after a canonical autonomous-skill mutation:

bash scripts/skill-sync-check.sh --apply

The existing script must:
1. fetch exact origin/main and record SHA;
2. inventory opt-in skills from that exact main;
3. map each to the same relative Hermes runtime path;
4. serialize with one lock;
5. back up any runtime replacement;
6. mirror main to runtime only when runtime is missing, identical, or still equals the previously sealed canonical hash;
7. refuse independent runtime drift;
8. seal main SHA + canonical hash + runtime hash;
9. emit ORACLE_REQUIRED_RUNTIME_DRIFT when the live copy changed independently.

On ORACLE_REQUIRED_RUNTIME_DRIFT:

PRESERVE_RUNTIME_DELTA
→ centraldark-oracle-surface
→ compare CHEFE intent + CURRENT main/docs + owner + live runtime
→ counterproof
→ canonical writer promotes only surviving minimum delta
→ rerun --apply
→ seal hashes

No human /memory approve or manual file copy is required when the applicable existing gates already prove alignment. UNKNOWN remains UNKNOWN.

## Modes

--check = read-only classification.
--apply = safe main-to-runtime convergence.
--seal = apply and fail nonzero if any opt-in skill remains divergent.

Never reset a repository, delete local runtime skills or overwrite independently changed runtime files.

For the VPS checkout owner `scripts/vps/auto-sync-main.sh`, tracked worktree edits remain fail-closed, but known untracked runtime scopes must be quarantined automatically under `/root/CentralDark-preserve/auto-sync-untracked-<UTC>/`, fast-forward applied, and restored with a manifest after every outcome. A recurring cron entry alone is not proof: verify `VPS_HEAD == origin/main`, the exact backup path/hash, and the sync log/status readback. Never classify `BLOCKED dirty checkout` as autonomous sync success when only untracked runtime artifacts caused it.

## Success

MAIN_SHA=<current origin/main>
AUTOSYNC_SKILLS=<n>
SYNCED=<n>
ORACLE_REQUIRED=0
MAIN_RUNTIME_LOCK=PASS

SYNCED != EXECUTED.
