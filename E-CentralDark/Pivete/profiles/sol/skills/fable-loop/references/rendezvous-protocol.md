# Rendezvous Protocol — 10 Fronts → One Writer → Fixed Point

> Canonical protocol for FABLE LOOP rendezvous after 10 parallel readers.
> Crystallized from CentralDark session 2026-09-01.

---

## 10 Fronts — Expected Outputs

| # | Front | Saída Esperada (Reader) |
|---|-------|-------------------------|
| 01 | REPO_MAIN_HEAD_CURRENT_STATE | branch, HEAD, dirty files, PRs abertos, writer ativo |
| 02 | LINEAGE_ISSUES_PRS_COMMITS_BRANCHES | histórico de commits, merges, conflitos resolvidos |
| 03 | CASA_WORKTREES_RUNTIME | worktrees ativos, PIDs, ports, health checks |
| 04 | DRIVE_DOCS_RECEIPTS | receipts, PDFs, notas, mapeamento Drive↔GitHub |
| 05 | OWNERS_ARCHITECTURE_CONTRACTS | skills, triggers, configs, owners por escopo |
| 06 | SKILLS_TOOLS_AUTOMATION | skills carregadas, ferramentas disponíveis, gaps |
| 07 | PROVIDERS_MODELS_ROUTER | modelos ativos, fallbacks, latency, health |
| 08 | TESTS_FALSIFIERS_COUNTERPROOF | testes existentes, falsificadores, contraprovas |
| 09 | INFRA_PERFORMANCE_SECURITY | VPS, secrets, GPU, TTS, rede, segredos |
| 10 | DOCUMENTATION_HANDOFF_NEXT_CURSOR | handoff ChatGPT format, next_cursor, blockers |

---

## Rendezvous Protocol (10 Steps)

```
1. COLLECT → todas as 10 saídas chegam
2. RECONCILE → cruzar claims, HEADs, hashes, runtime observations
3. OWNER_MATCH → cada delta útil vai para owner existente (REUSE_BEFORE_CREATE)
4. ONE_WRITER_PER_SCOPE → PR único por escopo mutável
5. PATCH_MINIMUM → delta mínimo que resolve
6. TEST → prova no mesmo HEAD
7. COUNTERPROOF → Meta Lupa derruba cada claim
8. REALITY_JUDGE → PASS / FAIL / BLOCKER
9. FIXED_POINT → todas as condições satisfeitas
10. REGISTER → receipt persistido, next_cursor, boot refresh
```

---

## Key Invariants

- **FRONTS ARE READERS, NOT WRITERS** — parallel perception only
- **SERIALIZE_MUTACAO_PER_SCOPE** — one writer per mutable scope
- **ALL_10_FRONTS_RETURNED != FIXED_POINT_AUTOMATICALLY** — reality judgment required
- **OWNER_MATCH BEFORE PATCH** — reuse existing owner, no second brain
- **PATCH_MINIMUM** — delta mínimo que resolve, zero lixo
- **TEST ON SAME HEAD** — prova no HEAD exato medido
- **COUNTERPROOF MANDATORY** — Meta Lupa derruba cada claim antes de fechar
- **HANDOFF COMPLETO OU BLOCKER** — never return "plano" or "estado compreendido"

---

## Handoff ChatGPT Format (Front 10 Output)

```
=== HANDOFF CHATGPT ===
MEASURED_AT=
CENTRALDARK_BRANCH=
CENTRALDARK_HEAD=
ACTIVE_PR=
WRITER_SCOPE=
NOTEPAD:
  WINDOWS_FOUND=
  TABS_FOUND=
  UNSAVED_TABS=
  FILE_BACKED_TABS=
  DEDUPED_ITEMS=
  SENSITIVE_QUARANTINED=
  HISTORICAL_ITEMS=
  CURRENT_CANDIDATES=
  FORMAT_VERIFIED=
CURRENT_FACTS: (somente fatos reconciliados contra estado atual)
SUPERSEDED_HISTORY: (fatos antigos úteis, marcados como superados)
OPEN_GAPS: (somente UNKNOWN material)
CONTRADICTIONS: (histórico versus realidade atual)
IPNAMES_DELTA: (somente se houver correlação observável útil)
NEXT_SAFE_ACTION: (menor delta material seguinte)
=== END HANDOFF ===
```

---

## Anti-Patterns (What Violates FABLE LOOP)

- Returning "estado compreendido" or "próximos passos" instead of HANDOFF
- Creating Figma/Slack as destination (they're coordination, not consumer)
- Inventing V2/V3/second architecture
- Promoting HISTORICAL → CURRENT without reconciliation
- Accepting UNKNOWN as PASS
- Writer colliding with another writer on same scope
- Skipping Meta Lupa counterproof