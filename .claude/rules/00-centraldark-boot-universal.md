# Claude Code — autoload fino CentralDark

```text
CANONICAL_AGENT_CORE=LEIA-ME-IA.md
ADAPTER_ROLE=AUTOLOAD_POINTER_ONLY
ENGINE=CLAUDE_CODE
```

Esta regra existe somente para garantir descoberta automática no Claude Code. Antes de responder ou agir, leia `LEIA-ME-IA.md` integralmente e execute o roteamento canônico definido ali.

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
