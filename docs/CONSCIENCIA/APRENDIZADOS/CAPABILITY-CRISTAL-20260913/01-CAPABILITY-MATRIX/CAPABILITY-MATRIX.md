# Matriz crítica — TODAS as capacidades mineradas

Total mapeado: **165 capacidades**.

Contagem: `{"EXISTING": 43, "PARTIAL": 50, "NEW_DELTA": 60, "GAP": 10, "VERIFY_LIVE": 2}`

| Domínio | Capacidade | Estado | Prioridade | Owner/candidato | Delta útil |
|---|---|---|---|---|---|
| Cognitive | Modo Padrão | **EXISTING** | P2 | CAPACIDADES-COGNITIVAS | modo rápido/suficiente por default |
| Cognitive | Sistema 2 | **EXISTING** | P1 | CAPACIDADES-COGNITIVAS | deliberação para tarefa difícil |
| Cognitive | ReAct Loop | **EXISTING** | P0 | cot-react-loop | observe→act→observe→re-evaluate→verify |
| Cognitive | Fable Loop | **EXISTING** | P0 | fable-loop | classify→define done→evidence→act→verify→report |
| Cognitive | Auto-crítica | **EXISTING** | P0 | MetaLupa / cognitive mode | criticar hipótese e resposta |
| Cognitive | 17 Respirações / Kimetsu | **EXISTING** | P0 | centraldark-operational-method | cadência de contexto e contraprova |
| Cognitive | Multibússola | **EXISTING** | P0 | MULTIBUSSOLA | físico→temporal→causal→contraprova |
| Cognitive | MetaLupa FRIA/MÉDIA/QUENTE | **EXISTING** | P0 | meta-lupa | falsificação calibrada por risco |
| Cognitive | Reality Judge | **EXISTING** | P0 | Reality Judge | writer != judge |
| Cognitive | Knowledge Compiler | **EXISTING** | P0 | knowledge-compiler | multi-fontes→cristal único |
| Cognitive | Capability Contract Router | **EXISTING** | P0 | capability-contract-router | intenção+estado→capability+owner+handoff |
| Cognitive | DELTAUTIL | **EXISTING** | P0 | DELTAUTIL | extrair somente ouro ausente no owner vivo |
| Cognitive | PEGATUDO universal | **PARTIAL** | P0 | harvester/router | enumerar N capacidades por input, não parar no primeiro delta |
| Cognitive | Instinto Superior | **EXISTING** | P0 | REGRAS + skill telemetria | guardar mecanismo de reencontro + known_failures |
| Cognitive | Self-healing por recorrência | **PARTIAL** | P0 | memory-linker + known_failures | recorrência→causa→fix→counterproof→regression |
| Prompt | System prompt anatomy | **EXISTING** | P1 | CONSCIÊNCIA / boot | identidade, ferramentas, segurança e prioridades explícitas |
| Prompt | Prompt Mínimo Viável | **PARTIAL** | P1 | prompt/skill owner | começar pequeno; crescer apenas por falha observada |
| Prompt | Persona separada de autoridade | **EXISTING** | P1 | identity/rules | voz != permissão != owner |
| Prompt | Tool Contract | **EXISTING** | P0 | skills + MCP contracts | gatilho, pré-condição, exclusão, batching, chaining |
| Prompt | Behavior mining from logs | **PARTIAL** | P0 | Dream Review / knowledge compiler | logs→padrão→guia de decisão→skill candidate |
| Prompt | Prompt diff semântico | **PARTIAL** | P1 | Git + analysis | comparar efeito comportamental, não só texto |
| Prompt | Prompt onion detector | **NEW_DELTA** | P1 | existing prompt owner | detectar camadas repetidas/contraditórias |
| Prompt | Emphasis inflation detector | **NEW_DELTA** | P2 | existing prompt owner | detectar excesso de ALWAYS/NEVER/URGENT |
| Prompt | Rule-with-why gate | **PARTIAL** | P1 | Forja / docs gate | regra material deve ter motivo e prova |
| Prompt | Consolidation without behavior loss | **PARTIAL** | P0 | Knowledge Compiler | comprimir regras mantendo comportamento comprovado |
| Agentic | Agentic steerability | **PARTIAL** | P1 | cognitive/prompt owner | controle explícito de personalidade/estilo sem fundir identidade |
| Agentic | Solution persistence | **EXISTING** | P0 | operational method | continuar até done/stop gate |
| Agentic | Tool calling patterns | **EXISTING** | P0 | skills/router | quando usar read/apply/shell e como encadear |
| Agentic | Planning protocol | **EXISTING** | P1 | operational method | planejar→agir→atualizar→verificar |
| Agentic | Metaprompt root-cause + surgical revision | **PARTIAL** | P0 | MetaLupa | achar causa e revisar cirurgicamente |
| QA | Risk profiling | **NEW_DELTA** | P1 | Forja/QA owner | risco técnico, integração, regressão, mitigação |
| QA | Test design per acceptance criterion | **PARTIAL** | P0 | tests/Forja | cenários por AC + nível unit/integration/E2E |
| QA | Requirements tracing | **PARTIAL** | P0 | trace/evidence | AC→teste→evidência de cobertura |
| QA | NFR assessment | **NEW_DELTA** | P1 | Forja/QA owner | security/performance/reliability/maintainability gate |
| QA | Quality gate decision | **EXISTING** | P0 | Reality Judge/Forja | PASS/CONCERNS/FAIL/WAIVED equivalente |
| QA | Brownfield-first workflow | **EXISTING** | P0 | REUSE_BEFORE_CREATE | tratar sistema existente antes de greenfield |
| Agents | Role-specialized team | **EXISTING** | P1 | Hermes executors | analyst/architect/dev/qa/etc como papéis, não cores |
| Agents | Semi-automatic/full-automatic execution modes | **PARTIAL** | P1 | autonomous task routing | selecionar autonomia por risco/escopo |
| Agents | Advanced elicitation | **NEW_DELTA** | P2 | planning owner | forçar alternativas, riscos e critérios antes de mutar |
| AI | Prompt engineering advanced | **EXISTING** | P2 | prompt/skills | zero/few-shot, role, CoT-mode UI, examples |
| AI | LangChain integration concepts | **PARTIAL** | P2 | tool/runtime adapters | chains/retrieval/tools como adapters, não core |
| AI | Autonomous agents (AGNO patterns) | **PARTIAL** | P1 | Hermes-Core | autonomia, tools, memory, planning |
| AI | Multi-agent orchestration (CrewAI patterns) | **EXISTING** | P1 | SOL+Hermes | papéis, delegation, shared mission |
| AI | MCP fundamentals | **EXISTING** | P0 | CentralDark MCP | universal capability surface |
| AI | Production/deploy | **EXISTING** | P1 | Actions/VPS deploy | build, deploy, monitor, rollback |
| AI | Multimodal fundamentals | **PARTIAL** | P1 | BRAIN visual/media | texto+imagem+áudio+vídeo como sources |
| UI | Dockable multi-pane workspace | **PARTIAL** | P1 | SalaControle/Bolt | painéis destacáveis/reacopláveis sem perder estado |
| UI | Single-instance shared UI state | **PARTIAL** | P0 | SalaControle | view != process; fechar floating reancora |
| Agents | Feature toggles for agents/connectors/executors | **NEW_DELTA** | P1 | capability registry/router | is_active runtime sem quebrar core |
| Agents | Event-bus message exchange | **PARTIAL** | P1 | Hub/router | substituir acoplamento direto por eventos no owner existente |
| Runtime | Unified module registry | **PARTIAL** | P1 | MCP catalog/Hermes registry | agent|connector|executor + lifecycle + state |
| Runtime | Dependency preflight invariants | **NEW_DELTA** | P1 | dependency-intelligence owner | checar Python/Rust/Node/OS antes de instalar/carregar |
| Runtime | Dependency auto-update with rollback | **NEW_DELTA** | P1 | dependency-intelligence owner | manifest→validate→hot reload→rollback |
| Accounts | Multi-account Google Hub | **PARTIAL** | P1 | Account Hub/OAuth Broker | N contas→um fluxo, origem preservada |
| Accounts | Chromium profile registry | **PARTIAL** | P2 | browser/profile owner | perfis isolados + status + account linkage |
| Accounts | Per-account feature toggle | **NEW_DELTA** | P2 | Account Hub | ativar/desativar consumo sem duplicar arquitetura |
| Memory | Dream Review | **EXISTING** | P0 | scripts/memory-linker | handoff→patterns→candidate→autonomy queue |
| Memory | Pattern Discovery | **EXISTING** | P0 | memory-linker | dedupe/fingerprint/pattern candidates |
| Memory | LAST_GOOD_STATE | **PARTIAL** | P0 | checkpoints | herança intersessão/model swap |
| Semantic | Hybrid retrieval EXACT/STRUCTURED/LEXICAL/VECTOR/GRAPH | **EXISTING** | P0 | Semantic Fabric | retrieval seletivo por consulta |
| Semantic | Embedding model/version/dimension gate | **PARTIAL** | P0 | Semantic Fabric | não misturar espaços vetoriais |
| Semantic | Secret scrub before embedding | **PARTIAL** | P0 | Semantic Fabric/security | segredo não entra em embedding |
| Semantic | Semantic benchmark Recall@K/MRR/NDCG | **NEW_DELTA** | P1 | evaluation harness | benchmark de retrieval e regressão |
| Trace | Trace IDs end-to-end | **EXISTING** | P0 | trace-context | mission/request/correlation/trace/span |
| Trace | Message↔trace round trip | **PARTIAL** | P0 | trace + Personal Context refs | resposta→evento→fonte→artefato |
| Trace | TURN_CONTEXT_MISMATCH | **GAP** | P0 | existing trace owner | detector estrutural + semântico de contexto errado |
| Trace | Trace Viewer | **GAP** | P1 | SalaControle extension | visualizar cadeia causal no cockpit |
| Trace | Preservation export + restore drill | **NEW_DELTA** | P2 | existing memory/export owner | BagIt/JSONL/CSV/SQLite + hash restore |
| Media | YouTube transcript | **VERIFY_LIVE** | P0 | CentralDark MCP media | transcrever vídeo por ID/URL |
| Media | Frame extraction local all/fps/timestamps | **NEW_DELTA** | P0 | MCP media owner | ffprobe+ffmpeg+hash+manifest |
| Media | Frame semantic vectorization | **NEW_DELTA** | P0 | Semantic Fabric visual owner | frame→embedding→vector metadata |
| Media | Video chapter semantic index | **NEW_DELTA** | P1 | media+semantic owner | transcript+timestamp+frame+concept |
| Media | Scene-change sampling | **NEW_DELTA** | P2 | media owner | dedupe visual e reduzir frames redundantes |
| Media | Video download job | **NEW_DELTA** | P1 | media owner | URL→job→artifact→provenance |
| Media | ASR transcription pipeline | **NEW_DELTA** | P1 | media owner | Whisper/Parakeet style model adapter |
| Media | Translation pipeline | **NEW_DELTA** | P2 | media owner | transcript→translation with terms preserved |
| Media | TTS synthesis | **NEW_DELTA** | P1 | media owner | text→speech model adapter |
| Media | Voice clone | **NEW_DELTA** | P2 | media owner | voice sample→TTS voice profile |
| Media | Dubbing pipeline | **NEW_DELTA** | P1 | media owner | ASR→translate→TTS→sync→mux |
| Media | Diarization | **NEW_DELTA** | P2 | media owner | speaker segmentation |
| Media | Audio/video synchronization | **NEW_DELTA** | P1 | media owner | timing alignment + presets |
| Media | Media job queue + WebSocket progress | **NEW_DELTA** | P1 | job/runtime owner | queued/running/completed + live progress |
| Media | Model manager / GPU fallback | **NEW_DELTA** | P1 | runtime/model owner | GPU detect→fallback CPU/model |
| Media | Media checkpoint/resume | **NEW_DELTA** | P1 | job/checkpoint owner | retomar pipeline sem repetir etapas concluídas |
| MCP | One public CentralDark MCP | **EXISTING** | P0 | CentralDark MCP | um endpoint, N capabilities |
| MCP | OAuth 2.1 PKCE | **VERIFY_LIVE** | P0 | MCP auth owner | login automático do cliente |
| MCP | OAuth Broker | **EXISTING** | P0 | oauth-broker | provider start/callback/token refresh |
| MCP | Account Hub | **EXISTING** | P0 | /accounts | accounts/providers/connections |
| MCP | Tool capability signature | **PARTIAL** | P0 | MCP catalog + capability router | cada tool declara capability/inputs/side-effects/proof |
| MCP | Package capability scanner | **NEW_DELTA** | P0 | DELTAUTIL/harvester | zip/html/md/json→N capability candidates |
| MCP | Generative capability search | **NEW_DELTA** | P0 | capability router | gap→search→candidate→sandbox→Forja |
| MCP | Video frame tool registration | **NEW_DELTA** | P0 | MCP media owner | registrar capability do pacote anterior |
| MCP | Composio OAuth client proof | **GAP** | P0 | existing MCP auth | OAuth→callback→tools/list live proof |
| Cockpit | Cockpit Shell | **EXISTING** | P1 | SalaControle | UI base com abas |
| Cockpit | Electron bridge | **EXISTING** | P1 | Bolt | window.centraldark bridge |
| Cockpit | Terminal/PTY | **GAP** | P0 | SalaControle/Bolt candidate | terminal vivo, após remeasure de owner oculto |
| Cockpit | Live logs | **PARTIAL** | P0 | useCockpitLive | substituir mock por SSE/WebSocket runtime |
| Cockpit | Session Manager | **GAP** | P1 | Hermes-Core candidate | registry live de sessões |
| Cockpit | Command Channel | **GAP** | P0 | Bolt/Hermes bridge candidate | canal bidirecional UI→runtime |
| Cockpit | Agent Manager UI | **PARTIAL** | P1 | Hermes-Core + SalaControle | backend existe, UI falta |
| Cockpit | MCP Panel UI | **PARTIAL** | P1 | MCP admin + SalaControle | backend existe, UI falta |
| Cockpit | Process Viewer live | **PARTIAL** | P1 | Status | trocar dados estáticos por live |
| Cockpit | Receipt Viewer live | **PARTIAL** | P1 | COCKPIT-AVANCO + SalaControle | receipt JSON→timeline UI |
| Security | Security gates read/write/destructive | **EXISTING** | P0 | OAuth/Admin | gates por operação |
| Security | Sensitive quarantine | **PARTIAL** | P0 | source envelope/security | token/secret metadata sem imprimir valores |
| Security | AI proxy bridge secret separation | **EXISTING** | P0 | ai-proxy | bridge credential outside provider secret |
| Deploy | GitHub→VPS deploy evidence | **EXISTING** | P0 | Actions/deploy | merged != deployed; compare heads |
| Deploy | Behavior regression before promotion | **PARTIAL** | P0 | evaluating-llms-harness + Forja | prompt/skill changes need behavior tests |
| Operations | Tool Surface Preflight Before Analysis | **NEW_DELTA** | P0 | surface/capability discovery | tentar tools relevantes antes da análise; BLOCKED != OFFLINE |
| Git | Transactional Writer Boundary | **PARTIAL** | P0 | writer / operational method / git guardrails | centralizar pre-write gates |
| Git | Technical MetaLupa Pre-Write Gate | **GAP** | P0 | MetaLupa + Writer Boundary | BEGIN ausente bloqueia tecnicamente write |
| Git | Mission-Isolated Worktree | **PARTIAL** | P0 | git operational method | missão mutável isola branch/scope |
| Git | Canonical Main Clean Invariant | **NEW_DELTA** | P0 | git operational method | checkout canônico como espelho limpo; dirty vira violação |
| Git | Mission-End Full Path Classification | **PARTIAL** | P0 | DELTAUTIL + git guardrails | todo residual recebe classe/owner |
| Git | Safe Worktree Teardown Gate | **NEW_DELTA** | P1 | git operational method | só remover após clean/no unique delta/receipt/promotion |
| Observability | Dirty-as-Pipeline-Violation Incident | **PARTIAL** | P0 | Guardião / sentinela-divergencias | sentinela assertion/incident, não faxineiro |
| Deploy | Scheduled GitHub-main ↔ VPS-HEAD Drift Check | **GAP** | P1 | deploy_status + existing scheduler | automatizar commits-behind já existente sob demanda |
| Memory | Event-First Dream Trigger | **EXISTING** | P0 | memory-linker / Dream Review | SESSION_END/HANDOFF dispara review |
| Memory | Conditional Scheduler Dream Backstop | **EXISTING** | P0 | house scheduler + memory-linker | fallback temporal só quando houver delta |
| Memory | Re-emergence Detection | **NEW_DELTA** | P1 | Pattern Discovery / memory-linker | padrão descartado que reaparece ganha nova avaliação |
| Memory | Delta-Write Memory | **NEW_DELTA** | P0 | DELTAUTIL / Knowledge Compiler / Semantic Fabric | near-dupe NO_CHANGE; similar residual; conflito/supersede |
| Memory | Conflict/Supersede Provenance | **PARTIAL** | P1 | Semantic Fabric / memory-linker | supersede/conflict com trilha |
| Cognitive | Selective Grill-Me Escalation | **PARTIAL** | P2 | grill-me skill + MetaLupa | pressure-test só em decisão material |
| Memory | No-Model-Wake Without Delta | **EXISTING** | P0 | Dream scheduler contract | NO_NEW_INFORMATION→silêncio |
| Language | Worker Output Language Provenance | **NEW_DELTA** | P0 | receipt/trace owner | worker/provider/model/language metadata per output |
| Language | Raw Multilingual Output Preservation | **NEW_DELTA** | P0 | evidence store | hash and preserve raw worker output before projection |
| Language | Final Locale Projection | **NEW_DELTA** | P1 | UI/report projection | render PT-BR without rewriting source truth |
| Language | Provider/Subagent Language Divergence Detector | **NEW_DELTA** | P1 | orchestration observability | detect language drift by worker/provider |
| Language | Cross-Lingual Semantic Invariance Benchmark | **NEW_DELTA** | P0 | evaluation harness | same mission across languages/providers must retain semantics |
| Language | Cross-Lingual Contradiction Detection | **NEW_DELTA** | P0 | MetaLupa/Semantic Fabric | detect semantic conflict hidden by translation/language change |
| Language | Cross-Lingual Semantic Dedupe | **NEW_DELTA** | P1 | Semantic Fabric | dedupe equivalent claims across languages |
| Language | Multilingual Exact-Identifier Gate | **NEW_DELTA** | P0 | retrieval selector | stable IDs bypass translation ambiguity |
| Language | Graph Canonical Alias Mapping | **NEW_DELTA** | P1 | Graph/Semantic Fabric | multilingual aliases point to one canonical entity |
| Language | Translation Is View Not Truth | **NEW_DELTA** | P0 | projection layer | translated text cannot replace provenance/raw evidence |
| Agents | Receipt Join Provenance Integrity | **NEW_DELTA** | P0 | SOL/reconcile owner | join P1..PN without losing source worker/model/language |
| Agents | Per-Worker Provider/Model/Language Metadata | **NEW_DELTA** | P0 | trace context | attach worker execution identity to receipts |
| Agents | Parallel Lane Causal Trace | **PARTIAL** | P0 | SOL/Hermes trace | parallel execution lanes converge with traceable receipts |
| Agents | Semantic Consensus Across Providers | **NEW_DELTA** | P1 | SOL/MetaLupa | compare claims not surface wording across providers |
| Agents | Stable Error Codes Across Languages | **NEW_DELTA** | P1 | runtime contracts | machine error identity remains language-independent |
| MCP | Active Catalog Staleness Detector | **NEW_DELTA** | P0 | MCP admin/catalog owner | detect source/dist toolCount != active process catalog |
| MCP | Source-Dist-Runtime Promotion Proof | **PARTIAL** | P0 | MCP deploy owner | prove capability from source -> dist -> active catalog -> tools/call |
| MCP | YouTube Transcript Runtime Promotion | **GAP** | P0 | MCP media owner | tool exists source/dist; active process promotion must be proven |
| MCP | Typed OAuth Human Frontier Resume | **PARTIAL** | P0 | MCP auth/Hermes client | blocker ID + owner + missing dependency + resume condition |
| Database | Supabase RPC/Schema Introspection | **NEW_DELTA** | P0 | Hub/Supabase owner | measure tables, columns and RPC before consumer patch |
| Database | Consumer Schema Contract Drift Detector | **NEW_DELTA** | P0 | Hub mission consumer owner | consumer expectation vs live PostgREST/RPC schema |
| Database | Migration-vs-Consumer-Fallback Decision Gate | **NEW_DELTA** | P1 | Hub/Supabase owner | choose schema migration or adapt consumer after evidence |
| Runtime | PM2 Boot Persistence Proof | **PARTIAL** | P1 | graph-panel runtime owner | PM2 online != system boot restore proven |
| Runtime | Graph Panel Listener Health Proof | **PARTIAL** | P1 | graph-panel runtime owner | distinguish process online from port/listener healthy |
| Runtime | Pause-to-Webhook Resume Bridge | **PARTIAL** | P1 | Hermes gateway/goals owner | paused execution can emit resumable webhook with evidence |
| Runtime | Goal Judge Configuration Gate | **GAP** | P0 | Hermes goals owner | provider/model None must block autonomy claims |
| Graph | Graphify Fail-Closed Import | **PARTIAL** | P0 | graph pipeline owner | graphify/import failure stops pipeline instead of stale success |
| Graph | Graph Snapshot Freshness Contract | **NEW_DELTA** | P0 | graph pipeline owner | graph stats tied to source/head/timestamp before use |
| Graph | Post-Commit Graph Refresh Receipt | **PARTIAL** | P1 | post-commit/graph owner | hook refresh emits receipt/hash/log |
| Graph | Semantic Match Is Not Owner Proof | **EXISTING** | P0 | Semantic Fabric/owner resolver | semantic relation cannot grant authority |
| CI | Runner Nested-Git/Submodule Contamination Detector | **NEW_DELTA** | P0 | CI/runner guardrails | detect .git directory inside tracked normal directory |
| CI | Runner State Carryover Detector | **NEW_DELTA** | P0 | CI/runner guardrails | detect persistent self-hosted runner residue after checkout |
| CI | Provisional-vs-Permanent Fix Classifier | **NEW_DELTA** | P0 | MetaLupa/CI owner | runner workaround cannot masquerade as root-cause repair |
| Observability | Kanban Wound Machine-Readable Contract | **PARTIAL** | P1 | Hub/Kanban | wound id/status/action/human frontier structured |
| Observability | Tool Cancellation vs Failure Classification | **NEW_DELTA** | P1 | tool runtime receipts | cancelled/error/blocked are distinct terminal states |
| Security | Secrets Recovery Metadata-Only Path | **PARTIAL** | P0 | secret owner | recover/reference secret location without printing value |
| Autonomy | Bounded Open-World Capability Acquisition | **PARTIAL** | P0 | capability router/Forja | discover/generate/test missing capability without direct canonical write |
| Autonomy | Autonomy Claim Requires Goal Judge | **NEW_DELTA** | P0 | Reality Judge/goals owner | autonomy score blocked if goal_judge provider/model unset |
| Autonomy | Human Frontier With Resume Condition | **EXISTING** | P0 | operational method | human-only blocker must include exact resume condition |
| Evaluation | Architecture-vs-Runtime Dual Score | **NEW_DELTA** | P0 | evaluation harness | design maturity cannot substitute runtime proof |
| Evaluation | 50-Gate Adversarial Package Assault | **NEW_DELTA** | P0 | MetaLupa/Forja harness | repeatable critical suite against capability crystal |

## Delta provado — 2026-10-04 · multimodal completo antes da ação

| Domínio | Capability | Estado | Prioridade | Owner | Efeito provado |
|---|---|---:|---:|---|---|
| Media | Connected-provider ASR transcription | **EXISTING** | P0 | session-intelligence-harvester + media router | attachment→provider import→job→timecoded transcript→provenance |
| Media | Multimodal session evidence completion | **EXISTING** | P0 | session-intelligence-harvester | hash/metadata→dense visual coverage→audio→ASR→cross-modal compare→epistemic classification |
| Semantic | Symbolic cue routing without implicit authority | **EXISTING** | P0 | AUREOLA + session-intelligence-harvester | cue→recover recipe/context; write requires explicit current intent or canonical mapping |
| Memory | Minimum-sufficient cross-surface continuation | **EXISTING** | P0 | session-intelligence-harvester + canonical memory | session/chat/model may change while owner/recipe/fingerprint/next cursor preserve continuity |

> Distinção obrigatória: o row histórico `ASR transcription pipeline = NEW_DELTA` continua representando ASR local/nativo ainda não provado. O PASS desta sessão é uma rota de capability por provider conectado, sem criar segundo owner.

