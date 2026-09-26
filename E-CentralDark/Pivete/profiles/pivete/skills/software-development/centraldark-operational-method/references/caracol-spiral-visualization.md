# Caracol: Continuous Spiral Layout for MAPA DO CEREBRO

**Trigger**: User specifies continuous spiral ("caracol") trajectory for brain map / knowledge graph visualizations. Nodes distributed along the winding path (multiple turns, exterior → núcleo), real semantic edges overlaid on top (may cross turns). Position on spiral ≠ semantic relation. Explicit TESTE_DO_CARACOL required.

**Rejections (user corrections)**: Radial star ("cebola com fio"), concentric independent circles, funnel, layered stacks, simple force-directed without visible continuous winding. Approximations that pass as "spiral" but fail the hide-edges test are invalid.

**Proven Technique (Reconciled with existing Casa implementation)**:
- **Primary implementation (DO NOT duplicate)**: 
  - `apps/modulos/graph-panel/public/graph.js`: CARACOL overlay `{enabled: true, shellCount: 12, alpha: 0.28, lineWidth: 1.4}`. Explicit: "CARACOL é overlay de navegação: NÃO entra em edges, NÃO muda causalidade e NÃO muda a física." Uses `centroDoCaracol()`, `ordemCaracol()` (shells), `desenharCaracol()` on post-render frame. Draws trajectory over live `/api/graph` nodes/edges.
  - `scripts/trigger-fabric/spiral_traversal.py`: CARACOL traversal verifier. Classifies catalogued points into 10 adaptive fronts (F1_BOOT_IDENTITY ... F9_PROOF + F10 fallback), nucleus tokens ("mapa-do-cerebro", "consciencia"). Deterministic navigation WITHOUT creating semantic edges. Supports `--self-test` (PASS on forward/reverse same denominator, nucleus proven). Use for verification: `python scripts/trigger-fabric/spiral_traversal.py --self-test --compact`.
- **Demo / illustration only** (for precise visual when live graph not available): Pure Python SVG generator (no deps). Archimedean spiral math as below. Use only for standalone artifacts or when reconciling.
  ```
  t = i / (n-1)   # 0=outer, 1=inner
  theta = t * turns * 2 * π
  r = a + b * theta
  x = cx + scale * r * cos(theta)
  y = cy + scale * r * sin(theta)
  ```
  - Draw faint dashed trajectory curve (low opacity, for TESTE visibility even with edges hidden).
  - Place nodes sequentially along curve (exterior first).
  - Force core to exact center, larger size, distinct style (purple).
  - Draw ONLY real logical edges from Casa structure (SOUL, BRAIN concepts); never invent for proximity.
  - Dark theme matching Casa, offset labels.
  - Generator: `scripts/grafo-caracol-demo.py` (cleanup: remove any edges referencing non-existent node IDs like "ouro", "rascunhos").
  - Output: `docs/BRAIN/08-ARTEFATOS-VISUAIS/mapa-cerebro-caracol.svg`.
- For full production notes: derive order from graph-data.json or BRAIN md links + the spiral_traversal classifier / centrality. Never new viz engine.

**Mandatory Test (TESTE_DO_CARACOL)**:
1. Hide edges (lines).
2. Confirm continuous spiral (multiple clear turns converging to nucleus) is recognizable from curve + node positions alone.
3. Restore edges.
4. Confirm exact original semantic relations preserved (no added/lost due to layout).

**Placement & Governance (REUSE_BEFORE_CREATE / ONE_SYSTEM_ONLY — critical lesson from reanchor)**:
- **ALWAYS search first**: Before any standalone "caracol demo" or new layout code, run searches for "CARACOL", "spiral_traversal", "graph-panel", "caracol" in codebase + git main. Reconcile with existing.
- The integrated CARACOL (graph-panel overlay + trigger-fabric verifier) is the canonical owner. Demo script / SVG is illustration only; absorb any unique visual delta (e.g. precise math, test procedure) into existing owners or BRAIN artifacts.
- Never promote demo as new owner or parallel system. "NÃO PROMOVER INTEIRO — MINERAR SOMENTE DELTA ÚNICO — owner existente graph-panel / SPIRAL-TRAVERSAL".
- Follow all Casa invariants: measure HEAD/runtime first, contraprov, no new arch, semantic edges unchanged.
- Invalid demo edges (e.g. referencing non-nodes) must be cleaned before use — validate all edge targets exist in NODES.

**Pitfall (from 2026-09-05 reanchor)**: Treating a standalone demo script as the implementation when production CARACOL already exists as navigation overlay in graph-panel (enabled, draws trajectory without mutating graph) + verifier in trigger-fabric (fronts, no semantic edges). Always discover/reconcile before creating. The report confirmed "o CARACOL JÁ ESTÁ LIGADO à CentralDark".

**Communication / Response**:
- Execute the exact geometry from user spec + ASCII diagram.
- Report with evidence of TESTE_DO_CARACOL passing on both demo and (if applicable) live graph-panel.
- Phrase: "Caracol: curva tracejada + nós sequenciais = trajetória contínua visível independentemente das arestas. Real overlay in graph-panel confirmed; demo reconciled."
- When user corrects visual or provides reanchor report showing existing implementation, immediately update this reference and future outputs. Incorporate "TRAVERSAL ≠ SEMANTIC_EDGE".
- Use structured veredito table + BOOT + Fio when reporting reconciliation (user preference for operational reports).

**Related**:
- `apps/modulos/graph-panel/` (live CARACOL overlay, /api/graph)
- `scripts/trigger-fabric/spiral_traversal.py` (verifier, self-test)
- docs/BRAIN/ (MAPA DO CEREBRO structure)
- SOUL-SOL.md: position visual != authority/relation
- centraldark-operational-method: REUSE_BEFORE_CREATE, ONE_SYSTEM_ONLY, LOCAL_REALITY=JUDGE, execute first, baianês ultra-conciso
- `references/realidade-precedencia-hierarquia.md`

**Session origin / updates**: 2026-09-05 caracol spec + initial Python SVG demo; subsequent reanchor report (pasted analysis) revealed integrated implementation in main/graph-panel + trigger-fabric. Demo cleaned of invalid edges; reconciled as illustration only. Self-test on verifier: PASS.

**Next delta only on gaps**: Live resource probe for GPU/Casa in graph data; feed to conformance. Drop any duplicate standalone code.