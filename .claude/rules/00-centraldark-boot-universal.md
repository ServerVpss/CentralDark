# Claude Code — autoload fino CentralDark

```text
CANONICAL_AGENT_CORE=LEIA-ME-IA.md
ADAPTER_ROLE=AUTOLOAD_POINTER_ONLY
ENGINE=CLAUDE_CODE
```

Esta regra existe somente para garantir descoberta automática no Claude Code. Antes de responder ou agir, leia `LEIA-ME-IA.md` integralmente e execute o roteamento canônico definido ali.


## Gate obrigatório antes da primeira resposta operacional

```text
CONSULTAR_CANONICO_ANTECEDE_INVESTIGAR=true
REPLAY_BEFORE_REDISCOVERY=true
CANONICAL_CONSUMPTION_GATE=scripts/centraldark/canonical-consumption-gate.mjs
CANONICAL_LEARNING_SOURCE=docs/CONSCIENCIA/APRENDIZADOS.md
CANONICAL_LEARNING_MODE=ALL_NUMBERED_LEARNINGS
CANONICAL_LEARNING_GATE_ARGS=--learning ALL
SEARCH_MISS_IS_NOT_STOP_CONDITION=true
SEARCH_MISS_FALLBACK=DIRECT_CANONICAL_PATH_READ
TITLE_ONLY_IS_NOT_LEARNING_CONSUMED=true
TOOL_AVAILABLE_MUST_BE_ATTEMPTED_BEFORE_UNKNOWN=true
UNKNOWN_WITH_MEASUREMENT_ROUTE=FAIL_CLOSED
```

Claude não pede ao CHEFE para mandar reler um aprendizado quando GitHub/path canônico
está acessível. Busca zero cai automaticamente para leitura direta do arquivo. O boot consome TODOS os aprendizados numerados antes do primeiro roteamento; a seleção por pertinência vem depois desse inventário.
`#ACORDAR` só fecha depois do consumo do registro canônico.

```text
RASTRO_FISCAL_BEFORE_CURRENT_LEDGER_RETURN=true
PR_BODY_IS_HISTORY_NOT_CURRENT=true
LEDGER_CURRENT_REQUIRES_EXPLICIT_CURRENT_MAIN=true
EXACT_COMMENT_ID_DIRECT_LOOKUP_BEFORE_PAGINATION=true
MEASURABLE_CURRENT_UNKNOWN_IS_FAIL=true
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

Nenhum `.claude/agents/*` pode substituir `LEIA-ME-IA.md`, `AGENTS.md`, Trigger Fabric, owner canônico, Writer ou Reality Judge.

PADRÃO ÚNICO DE RESOLUÇÃO DE CONFLITO (não criar segundo): `.agents/skills/git-conflict-resolve-house-standard/SKILL.md` — amarrado ao motor `dependabot-auto-merge.yml` + `scripts/dependabot/resolve-conflicts.sh`. Padrão se adapta à realidade atual.

## Referências canônicas com token

- [ai-universal-entrypoint] `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md` — coordenação/Writer unico
CENTRALDARK_AI_BOOT
.agents/skills/meta-lupa/SKILL.md
.agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA
docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json
FALHA_DE_RECONCILIACAO_DE_CONTEXTO
