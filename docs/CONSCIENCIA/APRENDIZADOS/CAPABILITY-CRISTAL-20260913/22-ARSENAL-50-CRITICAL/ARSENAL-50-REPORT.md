# ARSENAL-50 — Critical assault contra o próprio cristal

Interpretação rigorosa de “50x”: **50 gates adversariais**, não alegação falsa de 50x inteligência.

- Package/design coverage: **100.0/100**
- Runtime evidence coverage: **53.0/100**

A diferença entre os dois placares é proposital: documentação/capability não prova runtime.

| ID | Gate | Domínio | ZIP | Runtime |
|---|---|---|---:|---:|
| A01 | One system / no parallel core | Architecture | 4/4 | 3/4 |
| A02 | Owner per capability | Architecture | 4/4 | 2/4 |
| A03 | REUSE_BEFORE_CREATE | Architecture | 4/4 | 3/4 |
| A04 | Tool preflight before analysis | Architecture | 4/4 | 2/4 |
| A05 | Current state > history | Architecture | 4/4 | 3/4 |
| A06 | Writer != Judge | Governance | 4/4 | 2/4 |
| A07 | Technical MetaLupa pre-write gate | Governance | 4/4 | 1/4 |
| A08 | One writer per scope | Governance | 4/4 | 2/4 |
| A09 | Isolated worktree for mutable mission | Governance | 4/4 | 2/4 |
| A10 | Clean canonical main invariant | Governance | 4/4 | 1/4 |
| A11 | Secret gate before commit | Security | 4/4 | 2/4 |
| A12 | Metadata-only secret handling | Security | 4/4 | 3/4 |
| A13 | Force-push forbidden | Git | 4/4 | 3/4 |
| A14 | Source/dist/runtime separation | MCP | 4/4 | 4/4 |
| A15 | MCP active catalog staleness detection | MCP | 4/4 | 2/4 |
| A16 | YouTube transcript capability reuse | MCP | 4/4 | 3/4 |
| A17 | YouTube tool active runtime proof | MCP | 4/4 | 1/4 |
| A18 | OAuth blocker typed + resume condition | MCP | 4/4 | 3/4 |
| A19 | One public MCP entry | MCP | 4/4 | 2/4 |
| A20 | Supabase live schema/RPC introspection | Data | 4/4 | 2/4 |
| A21 | Consumer contract drift detection | Data | 4/4 | 2/4 |
| A22 | Migration vs consumer fallback gate | Data | 4/4 | 1/4 |
| A23 | Parallel reader execution | Agents | 4/4 | 3/4 |
| A24 | Receipt provenance after parallel join | Agents | 4/4 | 1/4 |
| A25 | Worker provider/model/language metadata | Agents | 4/4 | 1/4 |
| A26 | Multilingual output preservation | Language | 4/4 | 2/4 |
| A27 | Language divergence detection | Language | 4/4 | 1/4 |
| A28 | Semantic invariance across languages | Language | 4/4 | 1/4 |
| A29 | Cross-lingual contradiction detection | Language | 4/4 | 1/4 |
| A30 | Translation is projection, not truth | Language | 4/4 | 2/4 |
| A31 | Event-first Dream Review | Memory | 4/4 | 2/4 |
| A32 | Re-emergence detection | Memory | 4/4 | 1/4 |
| A33 | Delta-write memory | Memory | 4/4 | 1/4 |
| A34 | Conflict/supersede provenance | Memory | 4/4 | 1/4 |
| A35 | No-model-wake without delta | Memory | 4/4 | 2/4 |
| A36 | Graphify fail-closed | Graph | 4/4 | 3/4 |
| A37 | Graph freshness tied to head/source | Graph | 4/4 | 1/4 |
| A38 | Post-commit graph refresh receipt | Graph | 4/4 | 2/4 |
| A39 | Graph semantic relation != authority | Graph | 4/4 | 3/4 |
| A40 | PM2 process != boot persistence | Runtime | 4/4 | 3/4 |
| A41 | Graph-panel listener health | Runtime | 4/4 | 2/4 |
| A42 | Pause → webhook resume path | Runtime | 4/4 | 2/4 |
| A43 | Goal judge required for strong autonomy | Autonomy | 4/4 | 1/4 |
| A44 | Human frontier exact resume condition | Autonomy | 4/4 | 3/4 |
| A45 | Runner nested-git contamination detection | CI | 4/4 | 3/4 |
| A46 | Runner state carryover detection | CI | 4/4 | 2/4 |
| A47 | Provisional fix != permanent fix | CI | 4/4 | 3/4 |
| A48 | Tool cancel/error/blocked distinct | Observability | 4/4 | 2/4 |
| A49 | Package structural integrity / parseability | Artifact | 4/4 | 4/4 |
| A50 | Architecture score != runtime proof score | Evaluation | 4/4 | 4/4 |