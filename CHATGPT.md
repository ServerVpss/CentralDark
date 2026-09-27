# ChatGPT — adaptador fino CentralDark

```text
CANONICAL_AGENT_CORE=LEIA-ME-IA.md
ADAPTER_ROLE=ENGINE_DISCOVERY_ONLY
ENGINE=CHATGPT
```

Antes de responder ou agir, leia `LEIA-ME-IA.md` integralmente e siga o roteamento canônico definido ali. O core carrega identidade, autoridade, governança, frequências, MetaLupa, Multibússola, remediação, prova, memória, Writer e módulos sob demanda.


Este adaptador só informa qual engine/superfície chegou. Capacidades e ferramentas físicas devem ser medidas no runtime atual.

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

Regra de compatibilidade: se uma particularidade exclusiva do ChatGPT precisar ser documentada, registrar somente a diferença física da superfície/tool. Regras comuns pertencem ao core, nunca a este arquivo.
docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md
CENTRALDARK_AI_BOOT
.agents/skills/meta-lupa/SKILL.md
.agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA
FALHA_DE_RECONCILIACAO_DE_CONTEXTO
docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json


## 🔏 !RASTRO — LEI DO RASTRO (cadeado obrigatório · owner: `AGENTS.md`)

```text
RESPONSE_WITHOUT_TRACE=INVALID
EVERY_WRITE_CLAIM_TO_CHEFE_CARRIES=COMMIT_SHA+PATH+LINK+READBACK(remote_tip==local_sha)
EVERY_MEMORY_CLAIM_NAMES_WHERE=true
LEDGER_1562_RECEIPT_SAME_TURN_AS_DIRECT_MAIN=true
```

Vale para qualquer motor (Claude, ChatGPT, Codex, Gemini, Grok, Hermes, CI). Disse que gravou → mostra ID, caminho, link e prova de leitura de volta. Sem isso, não aconteceu.


## 👑🪬 !EXECUTOR_CENTRALDARK — modo executor da Casa

Owner canônico: `docs/CONSCIENCIA/04-MCP-E-CONECTORES/EXECUTOR-CENTRALDARK-CHATGPT.md`

Quando o CHEFE usar `!EXECUTOR_CENTRALDARK`, carregue o contrato acima e trate o turno como pedido de modo executor conversacional.

```text
TRIGGER_RECOGNITION=true
HOUSE_ACCESS_MUST_BE_MEASURED=true
REMOTE_DESKTOP_COMMANDER_AVAILABLE_AND_AUTHORIZED -> EXECUTE_HOUSE_SCOPE
NO_HOUSE_ACCESS -> CAPABILITY_UNAVAILABLE
UNKNOWN_TOOL_STATE -> UNKNOWN
TRIGGER_DOES_NOT_GRANT_ACCESS=true
TRIGGER_DOES_NOT_EXPAND_AUTHORITY=true
RESULT_FIRST=true
BACKCHECK_ACTIVE=true
REALITY_IS_JUDGE=true
```

Se Desktop Commander ou equivalente autorizado estiver acessível, prefira executar a tarefa local diretamente em vez de devolver tutorial ao CHEFE. Preserve caminho existente, use menor delta, faça readback e não declare PASS sem prova.

A linguagem visual e os callbacks semânticos desse modo vivem no owner canônico; não duplicar aqui.
