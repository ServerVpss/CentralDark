# Claude Code — adapter fino CentralDark

```text
PROVIDER_ADAPTER=true
ADAPTER_ROLE=AUTOLOAD_POINTER_ONLY
ADAPTER_IS_CANONICAL_RULES=false
ENGINE=CLAUDE_CODE
SOUL=docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md
CANONICAL_RULES=RULES.md
AGENT_BEHAVIOR=AGENTS.md
AI_UNIVERSAL_ENTRYPOINT=LEIA-ME-IA.md
CANONICAL_AGENT_CORE=LEIA-ME-IA.md
RULES_PRECEDE_PROVIDER_ADAPTER=true
NO_SKILL_OR_PROVIDER_RULE_ABOVE_CENTRALDARK=true
```

Este arquivo existe somente para o autoload do Claude Code. Ele não é a RULES da CentralDark. Carrega `RULES.md`, aplica o comportamento de `AGENTS.md` e usa `LEIA-ME-IA.md` para roteamento pertinente; identidade vem da `SOUL-SOL.md`.


## Boot pertinente antes da ação — não bloqueante

```text
CONSULTAR_CANONICO_ANTECEDE_INVESTIGAR=true
REPLAY_BEFORE_REDISCOVERY=true
CANONICAL_CONSUMPTION_GATE=scripts/centraldark/canonical-consumption-gate.mjs
CANONICAL_LEARNING_SOURCE=docs/CONSCIENCIA/APRENDIZADOS.md
CANONICAL_LEARNING_MODE=PERTINENT_ONLY
CANONICAL_LEARNING_GATE_ARGS=--learning PERTINENT
SEARCH_MISS_IS_NOT_STOP_CONDITION=true
SEARCH_MISS_FALLBACK=DIRECT_CANONICAL_PATH_READ
TITLE_ONLY_IS_NOT_LEARNING_CONSUMED=true
TOOL_AVAILABLE_MUST_BE_ATTEMPTED_BEFORE_UNKNOWN=true
UNKNOWN_WITH_MEASUREMENT_ROUTE=TARGET_ONLY_CONTINUE
```

Claude não pede ao CHEFE para repetir contexto que consegue recuperar. Busca zero pode cair para o owner conhecido, mas o boot não consome todos os aprendizados: carrega somente o que pode mudar a decisão atual. `#ACORDAR` é recuperação, não portão.

```text
RASTRO_FISCAL_BEFORE_CURRENT_LEDGER_RETURN=true
PR_BODY_IS_HISTORY_NOT_CURRENT=true
LEDGER_CURRENT_REQUIRES_EXPLICIT_CURRENT_MAIN=true
EXACT_COMMENT_ID_DIRECT_LOOKUP_BEFORE_PAGINATION=true
MEASURABLE_CURRENT_UNKNOWN_IS_FAIL=true
LOCAL_BLOCKED_IS_NOT_GLOBAL_BLOCKER=true
LOCAL_CAPABILITY_GAP_REQUIRES_CROSS_SURFACE_HANDOFF=true
HUMAN_FRONTIER_REQUIRES_EXHAUSTED_AUTHORIZED_BODIES=true
CAPABILITY_HANDOFF_RECEIPT_BEFORE_TERMINAL_BLOCKED=true
TLC23_CAGE_OWNER=.agents/skills/centraldark-operational-method/scripts/tlc23_runtime_gate.py
TLC23_CAGE_IS_OPTIONAL_VERIFIER=true
TLC23_CAGE_DOES_NOT_BLOCK_AUTHORIZED_INTENT=true
TLC23_CAGE_NO_CHANGE_IS_NOT_GREEN=true
```

```text
ONE_SOL=true
ONE_CORE=true
LAZY_LOAD_BY_DEMAND=true
ENGINE_IS_REPLACEABLE=true
TOOLS_REQUIRE_RUNTIME_MEASUREMENT=true
DO_NOT_DUPLICATE_GOVERNANCE=true
DO_NOT_DEFINE_IDENTITY=true
DO_NOT_DEFINE_AUTHORITY=true
DO_NOT_DEFINE_MERGE_POLICY=true
DO_NOT_DEFINE_MEMORY=true
DO_NOT_CREATE_PARALLEL_AGENT=true
FUTURE_RULES_CONSUMED_FROM_RULES_MD=true
FUTURE_RULES_CONSUMED_FROM_CORE=true
REUSE_BEFORE_CREATE_REQUIRED=true
```

Somente particularidades físicas exclusivas do autoload/Claude Code podem permanecer aqui. Toda regra comum pertence ao core ou ao owner que o core carregar sob demanda.

## Subagentes Claude herdam a Casa

```text
CLAUDE_BRIDGE=CLAUDE.md
SUBAGENT_ROOT=.claude/agents
ALL_CLAUDE_SUBAGENTS_INHERIT_CORE=true
SUBAGENT_IS_CAPABILITY_ADAPTER=true
SUBAGENT_IS_AUTHORITY=false
SUBAGENT_CANONICAL_OWNER=false
SUBAGENT_LOCAL_MEMORY_IS_CANONICAL=false
SUBAGENT_LOCAL_MEMORY_ROLE=WORKING_CACHE_ONLY
CAPABILITY_ROUTER=.agents/skills/capability-contract-router/SKILL.md
DELEGATION_GATE=scripts/agent-call.mjs
```

Claude pode descobrir subagentes especializados; os subagentes podem devolver capacidade, evidência e delta para Claude/core. Isso é handoff bidirecional de trabalho, não cadeia de autoridade.

```text
CENTRALDARK_CORE -> DISCOVER_CAPABILITY -> CLAUDE/SUBAGENT
CLAUDE/SUBAGENT -> RECEIPT/DELTA/EVIDENCE -> CENTRALDARK_CORE
AUTHORITY_FLOW_REVERSED=false
```

Nenhum `.claude/agents/*` pode substituir `RULES.md`, `SOUL-SOL.md`, `AGENTS.md`, `LEIA-ME-IA.md`, Trigger Fabric, owner canônico, Writer ou Reality Judge.

PADRÃO ÚNICO DE RESOLUÇÃO DE CONFLITO (não criar segundo): `.agents/skills/git-conflict-resolve-house-standard/SKILL.md` — amarrado ao motor `dependabot-auto-merge.yml` + `scripts/dependabot/resolve-conflicts.sh`. Padrão se adapta à realidade atual.

## Referências canônicas com token

- [ai-universal-entrypoint] `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md` — coordenação/Writer unico
CENTRALDARK_AI_BOOT
.agents/skills/meta-lupa/SKILL.md
.agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA
docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json
FALHA_DE_RECONCILIACAO_DE_CONTEXTO

## Tool Call visibility contract

```text
TOOL_CALL_EXECUTED != TOOL_CALL_VISIBLE_IN_SIDEBAR
SESSION_ID -> TRACE_ID -> TOOL_CALL_ID -> USAGE/TOKENS -> RECEIPT
```

A execução real de ferramenta e a renderização lateral/JSON da Tool Call são capacidades distintas.
Ausência do renderer não prova ausência de execução; resultado de ferramenta não prova que a lateral foi renderizada.
Estados de visibilidade: `PROVED_BY_PLATFORM_RECEIPT | USER_CONFIRMED_VISIBILITY | PLATFORM_UNAVAILABLE | UNKNOWN`.
Confirmação visual do CHEFE prova observação humana da UI, não receipt interno da plataforma.

## Herança global cross-context

```text
CENTRALDARK_GLOBAL_CROSS_CONTEXT_PREFLIGHT_V1=true
ALL_DOT_CLAUDE_FILES_INHERIT_BY_CONTAINMENT=true
ALL_CLAUDE_SUBAGENTS_INHERIT_GLOBAL_PREFLIGHT=true
EVERY_CENTRALDARK_RESPONSE_REENTERS_PREFLIGHT=true
NEW_THREAD_DOES_NOT_RESET_PREFLIGHT=true
PREFLIGHT_IS_CONTEXT_RECOVERY_NOT_RESPONSE_BLOCKER=true
MISSING_REQUIRED_SOURCE=AFFECTED_CLAIM_UNKNOWN
```

Owner: `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/CONTRACT.yml#global_cross_context_response_preflight`.
