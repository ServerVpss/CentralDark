# Caso AIOX — Forense Externa Classificada (2026-08-30)

## Alvo
`SynkraAI/aiox-core` v5.4.1 — framework open source de orquestração CLI-first, agentes especializados, workflows, squads.

## Classificação (REGRA DO CHEFE)
| Alvo | Técnica | Conduta |
|------|---------|---------|
| **COISA DESCONHECIDA** (repo externo, pacote, ZIP) | **TÉCNICA SILENCIOSA** | NÃO executa. NÃO instala. NÃO conecta runtime. Lê como texto, calcula hash, inspeciona código-fonte, classifica, contrapova. |

## Proveniência
- Repositório: `SynkraAI/aiox-core` (GitHub)
- SHA inspecionado: `4ef6530ff03b83aea953e4a426f95e012b8b70c5`
- Package: `@aiox-squads/core@5.4.1`
- Licença: MIT + Commons Clause Condition v1.0 (conservador: sem cópia bruta)
- ZIP SHA256: `fd4eebcb50259a198ca4d68a63fc1a9c4445042f47b48e64a036f597c63dd411`
- Arquivos no ZIP (excl. node_modules): 3.420
- Development agents: 27 | tasks: 197 | workflows: 15

## Adapter Canônico (CentralDark)
Arquivo: `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/AIOX-CAPABILITY-ADAPTER.yml`
- Status: `EXTERNAL_REFERENCE_HARVESTED`
- Owner: `CENTRALDARK_TRIGGER_FABRIC`
- Consumer: `MEGAZORD-CENTRALDARK`
- Router: `capability-contract-router`

### Capabilities mapeadas (12 domínios)
1. `cli_runtime` — SOURCE_INSPECTED
2. `cli_presentation` — SOURCE_INSPECTED (ANSI, box-drawing, panel-renderer)
3. `mcp_and_computer_access` — DECLARED_IN_CANONICAL_CONFIG
4. `ide_and_agent_sync` — DECLARED_IN_CANONICAL_CONFIG
5. `context_engine` — SOURCE_INSPECTED (context pressure brackets, handoff warning)
6. `orchestration` — SOURCE_INSPECTED_AND_DECLARED (bounded parallel, all-settled)
7. `self_healing_and_change_safety` — DECLARED_IN_CANONICAL_CONFIG
8. `git_and_worktrees` — DECLARED_IN_CANONICAL_CONFIG
9. `decision_and_project_state` — DECLARED_IN_CANONICAL_CONFIG
10. `analytics_local` — SOURCE_INSPECTED (tool usage, token cost, hotspot detection)
11. `llm_usage_proxy` — SOURCE_INSPECTED (DeepSeek proxy local, port 8787)
12. `network_and_updates` — SOURCE_INSPECTED_AND_DECLARED

### Harvest Policy
**Absorver (14 padrões):**
- Context Pressure Brackets, Handoff Warning on Critical
- Multi-IDE Single Source Sync, Strict Drift Validation
- Bounded Parallel Execution, Local Sanitized Tool Usage
- Component Hotspot/Unused Analysis, Source Tree Protection
- Manifest Hash Validation, Safe Rollback/Transaction
- Project Status Autoload, Decision Logging
- MCP Capability Discovery, CLI Observability Rendering

**Roteamento para owners existentes (6):**
- Handoff → `docs/CONSCIENCIA/02-PROTOCOLO-HANDOFF-IA.md`
- Capabilities → `.agents/skills/capability-contract-router/SKILL.md`
- Self-healing → `ENGINE_BINDING.yml`
- Runtime transport → `elite-gateway/scripts/centraldark_omni_router.py`
- Live sensor → `.agents/skills/screenpipe-live-observer/SKILL.md`
- Proof → `REALITY_JUDGE`

**Rejeitar importação cega (8 vetos):**
- SECOND_ROUTER, SECOND_BRAIN, AIOX_AUTHORITY
- PROVIDER_PROXY_AS_DEFAULT, EXTERNAL_AUTO_FIX_WITHOUT_GATES
- BROAD_HOME_ACCESS_WITHOUT_RUNTIME_BOUNDARY
- GENERATED_AGENT_COPY_AS_NEW_OWNER
- TELEMETRY_OR_ANALYTICS_UPLOAD_NOT_EXPLICITLY_PROVEN

## Counterprova (AIOS-GOLD-ASSAY-2026-08-28)
| CP | Achado | Veredito |
|----|--------|----------|
| CP1 | FOUND != ABSORBED | Princípio base |
| CP2 | `validate:structure` declara `source-tree-guardian/index.js` — **NÃO EXISTE no ZIP** | `DECLARED != PRESENT` |
| CP3 | `test-quality-assessment.js` usa `_content` param mas referencia `content` interno | Bug material — não confiável |
| CP4 | `semantic-merge-engine.js` faz merge multiagente/AI | **REJEITADO** — CentralDark: `SERIALIZE_MUTATION`, `ONE_WRITER_PER_SCOPE` |
| CP5 | LICENSE = Commons Clause + MIT; package.json = MIT | Conservador: `BEHAVIORAL_DISTILLATION_ONLY` |
| CP6 | Sem conexão terceiros | `NETWORK_INTEGRATION=NONE` |
| CP7 | Sem Red Team | `RED_TEAM_IMPORT=REJECT` |
| CP8 | Design System não vira segundo | `AIOS_DESIGN_GOVERNANCE=REJECT` |
| CP9 | Sessão/memória não vira segundo cérebro | `REUSE_OR_EXTEND` only |
| CP10 | Inventário ≠ impacto | `GAP_CANDIDATE` needs fixture |

## Proof Plan (7 Provas — HERMES-PROOF-PLAN.md)
| Prova | Alvo | Estado inicial | Destino se sobreviver |
|-------|------|----------------|----------------------|
| A: Dependency Impact | House Inventory/grafo | `GAP_CANDIDATE_STRONG` | Estender owner existente |
| B: Design Pipeline/DTCG | visual-design-method | `EXTEND_CANDIDATE` | View derivada |
| C: IDE/Copilot Projection | Boot universal | `GAP_CANDIDATE` | Gerador subordinado |
| D: Session Digest | session-intelligence-harvester | `REUSE_OR_EXTEND` | Owner de continuidade |
| E: Migration/Orphan | Arqueologia/Trigger Fabric | `GAP_CANDIDATE` | Owner existente |
| F: Dynamic Gate Selection | Trigger Fabric/MetaLupa | `EXTEND_CANDIDATE` | Gates existentes |
| G: Health Registry | Validadores/gates | `DUPLICATE_OR_EXTEND` | Owner existente |

## Posição Oficial (ARCHITECTURE.md linha 396)
```
AIOS/AIOX = CANDIDATE_EXTERNAL_LEARNING
Papel: deltas de impacto/gates/mapa
Veto: raw runtime/control-plane rejeitado
RESERVE != ACTIVE_RUNTIME
```

## UI / "Site" — O que existe
**NÃO TEM site/web server.** É **CLI-first**.
- `public/index.html` = placeholder 15 linhas (link pro GitHub)
- Painel = **Observability Panel no terminal** (box-drawing Unicode + chalk ANSI)
- Código: `.aiox-core/core/ui/observability-panel.js` + `panel-renderer.js`
- Modos: `minimal` (pipeline+agent+terminals+tempo+erros) / `detailed` (+trade-offs+reasoning+next steps)

## Gate Bloqueando (False Positive)
`validar-identidade-operacional.mjs` flagga `EXTERNAL_SOURCE_PROJECT_FORBIDDEN` em 10 arquivos do Trigger Fabric:
- `AIOX-CAPABILITY-ADAPTER.yml` (provenance.repository + inspected_sha)
- `ARCHITECTURE.md` (linha 396)
- `README.md` (linha 189)
- `RECONCILIACAO-PR-MAE-1189.md` (linha 209)
- 6 arquivos em `AIOS-GOLD-ASSAY-20260828/`

**Causa:** Gate confunde **proveniência documentada** (legítima, classificada, contrapovada) com **runtime externo ativo** (rejeitado).

**Fix recomendado (menor delta):** Sanitizar referências org/repo/SHA explícitos nos 10 arquivos, manter classificação + harvest_policy + counterprova + proof plan. Referenciar só `SOURCES.json` + ZIP SHA256.

## Ouro Extraído
| Padrão | Destino na Casa |
|--------|----------------|
| Context Pressure Brackets | MetaLupa / handoff protocol |
| Handoff Warning Critical | Handoff protocol |
| Multi-IDE Single Source Sync | Capability router / boot universal |
| Strict Drift Validation | Lupa drift guard |
| Bounded Parallel Execution | Trigger Fabric / orchestrator |
| Local Sanitized Tool Usage | Analytics local / painel |
| Component Hotspot Analysis | Visual-design-method / quality gates |
| Source Tree Protection | Framework protection / path owners |
| Manifest Hash Validation | Git state safety / receipts |
| Safe Rollback/Transaction | Self-healing / writer-safe-push |
| Project Status Autoload | Continuidade / boot |
| Decision Logging | Receipt / aprendizado |
| MCP Capability Discovery | Elite-gateway / MCP |
| CLI Observability Rendering | Painel-vivo / elite-gateway panel |

## Veredito
**AIOX = OURO CLASSIFICADO, CERCADO, CONTRAPROVADO.**
- Não entra no runtime CentralDark
- Não vira segundo orquestrador/MCP/Design System/memória
- Padrões absorvidos reforçam owners existentes
- Bloqueio no gate = **false positive de proveniência** → sanitizar e segue

## Referências no Repo
- `/docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/AIOX-CAPABILITY-ADAPTER.yml`
- `/docs/CONSCIENCIA/APRENDIZADOS/AIOS-GOLD-ASSAY-20260828/` (6 arquivos)
- `/docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ARCHITECTURE.md` (linha 396)
- `/docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/SOURCES.json`