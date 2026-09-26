# Architecture Fit Verification vs Live Main Remota (GitHub)

**Trigger / Class:** User requests verification if a document or strategy "encaixa bem" in the architecture and "compara a main viva remota no GitHub". Often with explicit "SIMples 3 LINHAS".

**Core rule from TRIGGER-FABRIC (main):** One intention, one core, many substitutable surfaces/adapters over existing owners (routers, fabric, JARVIS delta orchestration). Proposed content is delta, not new owner or parallel system.

## Mandatory verification steps (execute these first — use terminal tool)

```bash
git fetch origin main --quiet
git ls-tree -r --name-only origin/main docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/
git show origin/main:docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ARCHITECTURE.md | head -40
git show origin/main:docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/DELTA-CONTINUO.md
git show origin/main:docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md | head -30
# plus search_files for overlapping terms from the candidate
```

## Key excerpts from canonical main (this session verification)

DELTA-CONTINUO.md:
```
UMA_INTENCAO
→ UM_CORE
→ MUITAS_SUPERFICIES_SUBSTITUIVEIS
→ OWNERS_EXISTENTES
→ UM_WRITER_POR_ESCOPO
→ REALIDADE
```

ARCHITECTURE.md (TRIGGER-FABRIC):
" A Trigger Fabric continua sendo **contrato de interligação**, não um novo orquestrador."
ONE_SYSTEM_ONLY, REUSE_BEFORE_CREATE, MODEL_IS_REPLACEABLE, continuation of PR #1189 intention.

No equivalent "UNIFIED-SURFACE-STRATEGY.md" or "unified surface" standalone file exists on main.

## Classification & absorption

- If invariants match SOUL (ONE_SOUL, ONE_SYSTEM_ONLY, REUSE, no V1/V2/V3, absorb existing arms like Hermes/Claude/Screenpipe/Zendrive as capabilities, router as transport, surfaces as adapters) → good candidate.
- Map to existing owner: TRIGGER-FABRIC (or JARVIS for orchestration aspects).
- Verdict: **absorb unique delta into existing owner** (e.g., extend ARCHITECTURE.md or add targeted yml under TRIGGER-FABRIC). Do not recommend new top-level md file.
- Response format: after full verification, deliver "SIMples 3 LINHAS" (or ultra-concise with traffic light) as explicitly requested.

## Session example (2026-09-05 Orquestração SOL context)

Proposed content: CENTRALDARK-UNIFIED-SURFACE-STRATEGY.md (DRAFT_CANDIDATE, invariants, runtime reanchor AUREOLA/CARACOL, target CENTRALDARK UI=OURS / core=OURS, absorb existing (Hermes as engine, Claude/Gemini/ChatGPT/Screenpipe/Zendrive as capability arms), router split, garimpo→ouro, one active PR/delta continuous, promotion gates).

Veredito: Encaixa bem como delta (não sistema novo). Main remota já implementa o framework via TRIGGER-FABRIC + DELTA-CONTINUO ("muitas superfícies substituíveis"). Absorver no owner existente (não existe no main). 🟡 após reconciliação.

## Pitfalls (embed these)

- Skipping live origin/main fetch/show (local branch/PR state is not canonical).
- Framing the proposal as "nova estratégia" or new file instead of delta under fabric.
- Verbose explanation or options when user specified "SIMples 3 LINHAS" or ultra-conciso.
- Forgetting to reanchor/boot or measure git state (branch, HEAD, worktrees, conflicts) before architecture work (see Orquestração SOL invocations).

## Response template (concise)

Sim, encaixa [como delta / com ressalvas].

Main remota (TRIGGER-FABRIC/...): [key match, e.g. "já define UMA_INTENCAO → UM_CORE → MUITAS_SUPERFICIES..."].

Recomendação: absorver no owner [específico] via menor delta. [🟢🟡🔴]

Always prioritize REUSE_BEFORE_CREATE and ONE_WRITER_PER_SCOPE.

Update this references file with new examples as they occur.
