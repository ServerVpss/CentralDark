# LIVE STATE

Last remeasured `main` before this delta:

`078bf351acaae46091669aa6acdec76ef1d10730`

Observation time from repository event:

`2026-08-24T19:12:57.724Z` / `24/08/2026 16:12:57 BRT`

This branch intentionally moves after that base. Final verdict must remeasure both `main` and PR HEAD.

## Repository facts used

- `LEIA-ME-IA.md`, `AGENTS.md` and `docs/CONSCIENCIA/00-PORTA-DE-ENTRADA-IA.md` are canonical entry/governance surfaces.
- `#ACORDAR + !CALIBRAR + !MULTIBUSSOLA` is already the canonical compound; this delta does not create another trigger language.
- MetaLupa exists as a real skill/scripts/guardrails tree and blocks false green.
- Trigger Fabric already existed in `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/`; this change evolves the same family.
- Hermes Core consumes `apps/modulos/HERMES-CORE/prompts/hermes-core.md`; this branch binds that prompt to the existing Trigger Fabric contract.
- `.github/workflows/porta-de-entrada.yml` is the global entry gate and already requires workflow reuse.
- `.github/workflows/autonomia-promocao.yml` is the existing autonomous judge/promoter; this branch adds Trigger Fabric verification inside the same workflow.
- `.github/workflows/trigger-fabric-package.yml` is the existing package/counterproof workflow; this branch strengthens it instead of creating another workflow.
- Canonical labels remain governed by `docs/CONSCIENCIA/GITHUB-LABELS-OPERACIONAIS.md`.
- Hermes Core orchestrator contains mission polling, orphan recovery, graph refresh scheduling and legacy GC scheduling.
- GraphRAG-Master contains `atualizarGrafo()` and local knowledge fallback.
- `scripts/memory-linker/` contains deterministic fingerprint/dedupe, Dream Review, Pattern Discovery and autonomy-queue semantics.

## Classification

```text
REPO_TRIGGER_FABRIC_DELTA = WORKING_ON_BRANCH
BOT_ENTRY_CONTRACT = IMPLEMENTED_IN_REPO_DELTA
OUTPUT_GUARD_CONTRACT = IMPLEMENTED_IN_REPO_DELTA
HERMES_PROMPT_BINDING = IMPLEMENTED_IN_REPO_DELTA
AUTONOMIA_CI_BINDING = IMPLEMENTED_IN_REPO_DELTA
WINDOWS_LOCAL_RUNTIME_STATE = NOT_PROVEN
VPS_RUNTIME_CURRENT_STATE = NOT_PROVEN
ALL_ENGINES_RUNTIME_INHERITANCE = NOT_PROVEN
SESSION_END_HOOK_PHYSICAL_WIRING = NOT_PROVEN
VECTOR_MEMORY_RUNTIME = NOT_PROVEN
GLOBAL_RUNTIME_100_PERCENT = NOT_PROVEN
```

`IMPLEMENTED_IN_REPO_DELTA != MERGED != RUNNING_NOW`.

This file is current only for the explicitly measured state above plus the branch delta. A newer `main` or PR HEAD requires remeasurement before a current-state claim.
