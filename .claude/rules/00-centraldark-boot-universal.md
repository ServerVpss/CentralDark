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

## Ponteiros canônicos verificáveis

Este adaptador carrega os owners `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md`, `.agents/skills/meta-lupa/SKILL.md` e `.agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA` por meio de `LEIA-ME-IA.md`, e emite `CENTRALDARK_AI_BOOT`. Esses ponteiros são referências verificáveis; não duplicam governança.

PADRÃO ÚNICO DE RESOLUÇÃO DE CONFLITO (não criar segundo): `.agents/skills/git-conflict-resolve-house-standard/SKILL.md` — amarrado ao motor `dependabot-auto-merge.yml` + `scripts/dependabot/resolve-conflicts.sh`. Padrão se adapta à realidade atual.
