# GENesis-AGI candidate inventory — API21

- **Source:** `WingedGuardian/GENesis-AGI`
- **Revision:** `780299c7a1779c633b72eeaa39ade094bdcc1913`
- **License:** `MIT`
- **Tree files:** `4781`
- **Inventory method:** GitHub tree API, recursive, exact revision; categories are path-level candidate classification, not behavioral proof.
- **Runtime fusion:** `UNKNOWN` — no GENesis runtime was installed or executed.
- **Code copied:** `NONE`.
- **Evidence limit:** source tree and repository metadata were read; each behavior still requires an owner-local test/counterproof.

## API21 matrix

| Category | Files matched | Representative source paths | CentralDark owner | Current proof | Decision |
|---|---:|---|---|---|---|
| Infrastructure | 68 | `scripts/deploy_candidates`, `scripts/deploy_candidates.py`, `scripts/deploy_candidates_core.py`, `scripts/deploy_candidates_gate.py` | `scripts/vps/centraldark-deploy.sh` | SOURCE_ONLY | ADAPT_OWNER_MINIMUM_DELTA |
| Operations | 322 | `scripts/acceptance_declaration.py`, `scripts/ambient/garble_features.py`, `scripts/ambient_awareness_worker.py`, `scripts/ambient_replay.py` | `scripts/vps/auto-sync-main.sh` | SOURCE_ONLY | ADAPT_OWNER_MINIMUM_DELTA |
| Communication | 102 | `az_plugins/genesis/extensions/message_loop_prompts_after/_52_genesis_memory_recall.py`, `changelog.d/20260908200002-fixed-per-message-fence-cannot-be-forged.md`, `changelog.d/20260909213000-added-cancel-a-queued-message.md`, `changelog.d/20260911032032-fixed-discord-posts-to-the-channel-you-named.md` | `apps/modulos/HERMES-CORE` | SOURCE_ONLY | EXTERNAL_CANDIDATE |
| Autonomy | 315 | `.claude/docs/background-sessions.md`, `changelog.d/20260923010200-fixed-persistent-timer-uninstall.md`, `changelog.d/20260927015737-fixed-guardian-thin-pool-relief.md`, `changelog.d/20260927033525-changed-watchgod-whole-disk-guardian.md` | `scripts/vps/main-pulse-reconciler.sh` | SOURCE_ONLY | REUSE_NO_CHANGE |
| Intelligence | 93 | `.agents/skills/genesis-external-client/SKILL.md`, `.claude/agents/genesis-architect.md`, `.claude/agents/genesis-codebase-mapper.md`, `.claude/agents/genesis-investigator.md` | `apps/modulos/HERMES-CORE/core/orchestrator.mjs` | SOURCE_ONLY | REUSE_NO_CHANGE |
| Memory | 320 | `.claude/docs/proactive-memory-hook.md`, `.claude/mcp/run-codebase-memory`, `az_plugins/genesis-memory/plugin.yaml`, `az_plugins/genesis/extensions/message_loop_prompts_after/_52_genesis_memory_recall.py` | `apps/modulos/mcp/src/lib/personal-context-store.js` | SOURCE_ONLY | ADAPT_OWNER_MINIMUM_DELTA |
| Cognitive | 189 | `az_plugins/genesis/extensions/agent_init/_60_genesis_reflection.py`, `changelog.d/20261001010825-fixed-ego-previous-assessment-is-its-own.md`, `changelog.d/20261002200336-fixed-ego-decision-same-tag-collapse.md`, `changelog.d/20261003195600-changed-reflection-observation-structure.md` | `apps/modulos/HERMES-CORE` | SOURCE_ONLY | EXTERNAL_CANDIDATE |
| Awareness | 174 | `changelog.d/20260915041500-added-css-isolation-lint-exact-selector-identity.md`, `changelog.d/20260925190336-fixed-contributor-review-request-identity.md`, `docs/journey/phase-1-awareness-loop.md`, `scripts/ambient_awareness_worker.py` | `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md` | SOURCE_ONLY | EXTERNAL_CANDIDATE |
| Reflection | 64 | `.claude/commands/challenge.md`, `.claude/commands/drift.md`, `.claude/docs/premise-check.md`, `az_plugins/genesis/extensions/agent_init/_60_genesis_reflection.py` | `.agents/skills/meta-lupa/SKILL.md` | SOURCE_ONLY | REUSE_NO_CHANGE |
| Perception | 68 | `.claude/commands/activate-browser.md`, `az_plugins/genesis/extensions/agent_init/_30_genesis_perception.py`, `changelog.d/20260923041122-security-file-browser-requires-login.md`, `changelog.d/20260923210745-security-knowledge-browser-scoped-to-its-own-store.md` | `apps/modulos/HERMES-CORE/core/perception-orchestra.mjs` | SOURCE_ONLY | EXTERNAL_CANDIDATE |
| Learning | 166 | `az_plugins/genesis/extensions/agent_init/_50_genesis_learning.py`, `changelog.d/20261006022558-fixed-codex-adapter-deny-messages.md`, `changelog.d/20261007060000-fixed-feedback-actor-authority.md`, `config/learned_knobs.yaml` | `docs/CONSCIENCIA/APRENDIZADOS.md` | SOURCE_ONLY | ADAPT_OWNER_MINIMUM_DELTA |
| Calibration | 242 | `.claude/commands/evaluate.md`, `.claude/commands/user-evaluate.md`, `.claude/docs/confidence-framework.md`, `changelog.d/20260918053959-changed-inbox-evaluation-skill-composition.md` | `scripts/trigger-fabric/verify_repo_contract.py` | SOURCE_ONLY | EXTERNAL_CANDIDATE |
| DB/Qdrant | 231 | `changelog.d/20260909003000-fixed-graph-store-database-errors.md`, `changelog.d/20260910010000-fixed-qdrant-oom-declaration.md`, `changelog.d/20260913061959-fixed-qdrant-client-server-version-skew.md`, `changelog.d/20260918180527-fixed-corrupt-database-backup-admission.md` | `apps/modulos/memoria-api` | SOURCE_ONLY | EXTERNAL_CANDIDATE |
| Routing | 177 | `changelog.d/20260903120000-added-daily-free-tier-budgets-for-providers.md`, `changelog.d/20260908225318-fixed-litellm-ssti-audit-triage.md`, `changelog.d/20260921163851-changed-routed-model-versions.md`, `changelog.d/20260925130000-changed-provider-names-no-longer-encode-a-version.md` | `apps/modulos/HERMES-CORE/core` | SOURCE_ONLY | REUSE_NO_CHANGE |
| Resilience | 76 | `changelog.d/20260908195652-fixed-one-retry-owner-per-alert-delivery.md`, `changelog.d/20261001141037-fixed-update-rollback-saves-uncommitted-edits.md`, `changelog.d/20261004232931-fixed-deploy-recovery-keeps-install-local-edits.md`, `changelog.d/20261005180300-security-vnc-fallback-password.md` | `scripts/vps/main-pinned-microdeploy.sh` | SOURCE_ONLY | REUSE_NO_CHANGE |
| Providers | 178 | `.claude/agents/genesis-architect.md`, `.claude/agents/genesis-codebase-mapper.md`, `.claude/agents/genesis-investigator.md`, `.claude/agents/genesis-researcher.md` | `apps/modulos/HERMES-CORE` | SOURCE_ONLY | EXTERNAL_CANDIDATE |
| Task Executor | 165 | `.claude/commands/task.md`, `changelog.d/20260909213000-added-cancel-a-queued-message.md`, `changelog.d/20260910204412-fixed-reflex-task-failed-dropped.md`, `changelog.d/20260915002004-fixed-code-intel-queue-safety.md` | `apps/modulos/HERMES-CORE/agents/Executor/agent.mjs` | SOURCE_ONLY | REUSE_NO_CHANGE |
| Sentinel/Guardian | 282 | `az_plugins/genesis/api_health.py`, `changelog.d/20260910210008-fixed-deploy-health-window.md`, `changelog.d/20260927011212-fixed-eval-health-signal-per-profile.md`, `changelog.d/20260927015737-fixed-guardian-thin-pool-relief.md` | `apps/modulos/mcp/src/log-funnel.js` | SOURCE_ONLY | ADAPT_OWNER_MINIMUM_DELTA |
| Skills | 89 | `.agents/skills/genesis-external-client/SKILL.md`, `.claude/skills/cc-update/SKILL.md`, `.claude/skills/closing-session/SKILL.md`, `.claude/skills/code-intelligence/SKILL.md` | `.agents/skills/` | SOURCE_ONLY | REUSE_NO_CHANGE |
| Channels | 91 | `changelog.d/20260911032032-fixed-discord-posts-to-the-channel-you-named.md`, `changelog.d/20261002013000-fixed-discord-bot-mcp-spawned-by-every-session.md`, `config/channels.yaml`, `src/genesis/autonomy/email_gate.py` | `apps/modulos/HERMES-CORE` | SOURCE_ONLY | EXTERNAL_CANDIDATE |
| Pipeline | 293 | `.claude/docs/builder-workflow-integrations.md`, `.claude/docs/proactive-memory-hook.md`, `.claude/hooks/README.md`, `.claude/hooks/cbm-discovery-gate.sh` | `.github/workflows` | SOURCE_ONLY | EXTERNAL_CANDIDATE |
| Browser | 584 | `.claude/commands/activate-browser.md`, `.claude/docs/web-tools-guide.md`, `.claude/skills/web-research/SKILL.md`, `changelog.d/20260911213000-added-shared-web-research.md` | `browser_exec / existing web route` | SOURCE_ONLY | EXTERNAL_CANDIDATE |
| Research | 48 | `.claude/agents/genesis-researcher.md`, `.claude/skills/web-research/SKILL.md`, `.claude/skills/youtube-fetch/SKILL.md`, `changelog.d/20260911213000-added-shared-web-research.md` | `centraldark-oracle-surface` | SOURCE_ONLY | EXTERNAL_CANDIDATE |
| Dashboard | 757 | `.claude/docs/builder-workflow-integrations.md`, `.claude/docs/code-intelligence-guide.md`, `.claude/docs/mcp-tools-guide.md`, `.claude/docs/web-tools-guide.md` | `docs/HUD/HUD.html` | SOURCE_ONLY | ADAPT_OWNER_MINIMUM_DELTA |
| Observability | 579 | `.claude/docs/observability-rules.md`, `.claude/skills/genesis-development/references/observability.md`, `CHANGELOG.md`, `JOURNAL.md` | `apps/modulos/mcp/src/log-funnel.js` | SOURCE_ONLY | ADAPT_OWNER_MINIMUM_DELTA |
| Recon | 106 | `.claude/agents/genesis-codebase-mapper.md`, `.claude/commands/audit-changes.md`, `.claude/skills/genesis-development/references/ai-code-audit.md`, `.claude/skills/genesis-development/references/codebase-map.md` | `software-development/centraldark-evidence-reconciliation` | SOURCE_ONLY | REUSE_NO_CHANGE |
| Identity | 126 | `.claude/commands/user-evaluate.md`, `changelog.d/20260908200005-fixed-user-request-reaches-the-reviewer-whole.md`, `changelog.d/20260915041500-added-css-isolation-lint-exact-selector-identity.md`, `changelog.d/20260920170000-added-pr-close-is-a-user-decision.md` | `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md` | SOURCE_ONLY | REUSE_NO_CHANGE |
| MCP | 80 | `.claude/docs/mcp-tools-guide.md`, `.claude/mcp/run-codebase-memory`, `.claude/mcp/run-gitnexus`, `.claude/mcp/run-mcp-server` | `apps/modulos/mcp/src/tools/core/mcp-admin.js` | SOURCE_ONLY | REUSE_NO_CHANGE |
| Eval | 1979 | `.claude/commands/evaluate.md`, `.claude/commands/user-evaluate.md`, `.claude/docs/premise-check.md`, `.claude/docs/testing-patterns.md` | `scripts/trigger-fabric/verify_repo_contract.py` | SOURCE_ONLY | REUSE_NO_CHANGE |

## Coverage and safety

- Categorized path matches: `4366` / `4781`.
- Unclassified paths: `415`. They remain source candidates, not silently discarded; representative paths: `.coderabbit.yaml`, `.codex/config.toml`, `.genesis-source-commit`, `.gitattributes`, `.github/CODEOWNERS`, `.github/ISSUE_TEMPLATE/bug_report.yml`, `.github/ISSUE_TEMPLATE/feature_request.yml`, `.github/PULL_REQUEST_TEMPLATE.md`, `.github/dependabot.yml`, `.github/labeler.yml`, `.github/rulesets/README.md`, `.github/rulesets/approvals.json`, `.gitignore`, `.gitleaks.toml`, `.gitnexusrc`, `.serena/.gitignore`, `CODEOWNERS`, `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, `EMPTY`.
- The source advertises multiple MCP servers, Qdrant/vector storage, container infrastructure, background cognition and channels. These remain `EXTERNAL_CANDIDATE` until an existing CentralDark owner proves an equivalent effect.
- `SECOND-BRAIN.yml`, GraphRAG, MCP, One Heart/log-funnel, HUD and Obsidian are treated as existing owners/projections; no second runtime, MCP, scheduler, database or writer is introduced.
- MIT attribution is preserved by keeping this artifact as an inventory/attribution record; no source code was derived or copied.

## Fixed-point boundary

```text
GENESIS_SOURCE_READ=PASS
GENESIS_TREE_INVENTORY=PASS
GENESIS_LICENSE_READ=PASS
CENTRALDARK_OWNER_MAPPING=PASS
BEHAVIORAL_EQUIVALENCE=UNKNOWN
RUNTIME_FUSION=UNKNOWN
SECOND_BRAIN_CREATED=NO
FIXED_POINT_API21=FALSE
NEXT_CURSOR=OWNER_LOCAL_TESTS → API17_GRAPH → API18_INGEST → API22_EVENT_HEART
```
