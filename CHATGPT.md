# ChatGPT — adaptador fino CentralDark

```text
CANONICAL_AGENT_CORE=LEIA-ME-IA.md
ADAPTER_ROLE=ENGINE_DISCOVERY_ONLY
ENGINE=CHATGPT
REUSE_BEFORE_CREATE_REQUIRED=true
CONTEXT_RECONCILIATION_CONTRACT=docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json
FALHA_DE_RECONCILIACAO_DE_CONTEXTO=BLOCK_AND_REANCHOR
```

Antes de responder ou agir, leia `LEIA-ME-IA.md` integralmente e siga o roteamento canônico definido ali. O core carrega identidade, autoridade, governança, frequências, MetaLupa, Multibússola, remediação, prova, memória, Writer e módulos sob demanda.

Este adaptador só informa qual engine/superfície chegou. Capacidades e ferramentas físicas devem ser medidas no runtime atual. Se o contexto material não reconciliar com o estado vivo, bloqueie a mutação, recarregue o owner e retome do último cursor provado; nunca invente arquitetura para preencher perda de contexto.

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

Regra de compatibilidade: se uma particularidade exclusiva do ChatGPT precisar ser documentada, registrar somente a diferença física da superfície/tool. Regras comuns pertencem ao core, nunca a este arquivo.

docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json
docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md
CENTRALDARK_AI_BOOT
.agents/skills/meta-lupa/SKILL.md
.agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA
