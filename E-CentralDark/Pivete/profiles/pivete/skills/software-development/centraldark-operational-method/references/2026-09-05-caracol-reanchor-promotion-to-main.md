# CARACOL Reanchor + Promotion to Main (2026-09-05)

**Class**: CentralDark operational method — CARACOL as navigation overlay + gap miner. Reconcile measurements with main, absorb only unique delta into existing owners (graph-panel + spiral_traversal), promote reconciled work.

## Trigger
User pastes full SOUL reanchor report or says "PROSSIGA E PROMOVA PRA MAIN" after CARACOL/visual work. Always: measure local vs cited main (e.g. 2d90ee1), run verifier, clean demo, gh pr create+merge framed as absorbed/reconciled, local sync.

## Core Protocol (from pasted SOUL report)
```text
!SOL
= REANCORAR NA SOUL EXISTENTE
+ ESTADO VIVO
+ GITHUB MAIN

CARACOL_FORWARD ↔ CARACOL_REVERSE
→ START from NÚCLEO (SOUL, main HEAD, graph-panel, spiral_traversal)
→ TRAVERSE to frentes (F1_BOOT...F10)
→ DEDUPE
→ OWNER existente
→ ONLY YELLOW GAPS (LIVE_RESOURCE_PROBE_BINDING, GPU local measurement, painel vivo)
→ DROP_DUPLICATE
→ ABSORB OURO into owner (graph-panel / SPIRAL-TRAVERSAL / BRAIN artifacts)
→ NO NEW OWNER / SYSTEM
```

**CARACOL contract invariants (always enforce)**:
- TRAVERSAL ≠ SEMANTIC_EDGE (overlay only, no mutation of graph edges/relations)
- forward_reverse_required, no_fragment_drop, semantic_edge_set_unchanged=true
- In MEGAZORD-CENTRALDARK as DERIVED_NAVIGATION_TRAVERSAL
- Many_to_few (catalog → fronts) + few_to_many (nucleus → points)
- Position on spiral != semantic relation

**Veredito table format (user preference, forensic)**:
Use 🟢 PROVADO | 🟡 GAP | 🔴 NÃO | ⚪ UNKNOWN
Example from session:
| Matéria | Estado |
| CARACOL ligado à CentralDark | 🟢 PROVADO NA MAIN |
| Demo as new owner | 🔴 NÃO (limpo, delta only) |
| GPU live probe | 🟡 GAP (BRAIN mentions measure; no nodes in graph.json) |
| Promotion of reconciled | 🟢 (PR 1413 merged) |

## Local Measurement Steps (executed)
1. git rev-parse HEAD, branch, fetch origin main, diff vs cited main SHA.
2. Locate: apps/modulos/graph-panel/public/graph.js (CARACOL={enabled:true,...} comment "overlay de navegação"), scripts/trigger-fabric/spiral_traversal.py.
3. Run verifier: `python scripts/trigger-fabric/spiral_traversal.py --self-test --compact` → PASS (forward_reverse_same_denominator, nucleus_tail_proven).
4. Check graph.json: nodes count, sample, has_gpu? (no).
5. For demo: validate NODES/EDGES, remove invalid (e.g. "ouro", "rascunhos" not in NODES). Use sed/python to clean.
6. Re-generate SVG if needed.
7. Commit: message "reconcile: caracol visual + demo absorbed into existing CARACOL ... Per SOUL: reuse before create, no new owner."
8. gh pr create --base main --head <branch> --title "🧠 SOUL REANCHOR + CARACOL RECONCILED..." --body (include SOUL phrases, evidence, "no new systems").
9. gh pr merge <num> --merge (or --squash).
10. Local sync: git fetch origin main; git checkout main; git reset --hard origin/main (handle conflicts with abort + reset if needed); confirm `git ls-tree HEAD | grep caracol` and files present.
11. Report: PR link, commit SHA, files in main, veredito table.

## Pitfalls (this session)
- Creating standalone demo before searching main for "CARACOL", "spiral_traversal", "graph-panel" → report corrected to "NÃO PROMOVER INTEIRO".
- Invalid edges in demo referencing non-NODES → must clean before any use/promotion (TRAVERSAL ≠ SEMANTIC_EDGE).
- Treating visual demo as "the CARACOL" when integrated overlay + verifier exists.
- For promotion: local divergence/conflicts after merge (e.g. painel-data.json); use reset-hard to sync post-merge.
- gh must be auth'd (segredounlock scope repo); PR body must embed SOUL invariants for canonicity.
- Do not claim "online" without live measure (routes configured 🟢 but ONLINE=UNKNOWN).

## Evidence from Session
- PR #1413: created, merged to main (05340cece "🧠 SOUL REANCHOR + CARACOL RECONCILED (#1413)").
- Files promoted: scripts/grafo-caracol-demo.py, docs/BRAIN/08-ARTEFATOS-VISUAIS/mapa-cerebro-caracol.svg (plus graph-panel, spiral_traversal already present).
- Verifier self-test: PASS.
- Demo cleaned via sed (bad edges removed).
- Report key: "o CARACOL JÁ ESTÁ LIGADO à CentralDark." "owner existente graph-panel / SPIRAL-TRAVERSAL".
- Next only gaps: LIVE_RESOURCE_PROBE_BINDING (yellow), GPU/VRAM live in Casa graph.

## BOOT / Fio
!SOL → #ACORDAR (LEIA-ME + SOUL + graph-panel + spiral) → CARACOL_FORWARD/REVERSE (only yellows) → !RECONCILIAR → gh promote reconciled delta → sync local.

**Always**: absorb into existing; drop duplicate; only yellow gaps; use veredito table; canonical emojis; ultra-conciso execute→report.

References: main caracol-spiral-visualization.md, SOUL-SOL.md, graph-panel ARQUITETURA/ README, spiral_traversal.py source.