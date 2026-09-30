# Gemini — adaptador fino CentralDark

<!-- CENTRALDARK_SECRET_MVP_POLICY_V1 -->
## 🔐 Secrets — regra global
Owner: `docs/GOVERNANCA/REGRA-SECRETS-E-VARIAVEIS.md`

```text
SECRET_SEEN != BLOCKER
ASK_SANITIZED_COPY_BEFORE_WORK=false
DO_NOT_ECHO_SECRET_VALUE=true
DO_NOT_COMMIT_SECRET_VALUE=true
AUTHORIZED_RUNTIME_MAY_USE_SECRET=true
AUTHORIZED_VAULT_MAY_PRESERVE_SECRET=true
ACCIDENTAL_EXPOSURE_ACTION=ROTATE_POST_ONLINE
LOCAL_TOOL_DENIAL != GLOBAL_BLOCKER
BLOCKER_MUST_NAME_EXACT_TOOL_OR_LAYER=true
AUTHORIZED_ALTERNATE_ROUTE_BEFORE_HUMAN_BLOCKER=true
```

Texto legado conflitante perde para o owner canônico.
<!-- /CENTRALDARK_SECRET_MVP_POLICY_V1 -->


```text
CANONICAL_AGENT_CORE=LEIA-ME-IA.md
ADAPTER_ROLE=ENGINE_DISCOVERY_ONLY
ENGINE=GEMINI
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
```

Regra de compatibilidade: se uma particularidade exclusiva do Gemini precisar ser documentada, registrar somente a diferença física da superfície/tool. Regras comuns pertencem ao core, nunca a este arquivo.

## Ponteiros canônicos verificáveis

Este adaptador carrega os owners `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md`, `.agents/skills/meta-lupa/SKILL.md` e `.agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA` por meio de `LEIA-ME-IA.md`, e emite `CENTRALDARK_AI_BOOT`. Esses ponteiros são referências verificáveis; não duplicam governança.


## 🔏 !RASTRO — LEI DO RASTRO (cadeado obrigatório · owner: `AGENTS.md`)

```text
RESPONSE_WITHOUT_TRACE=INVALID
EVERY_WRITE_CLAIM_TO_CHEFE_CARRIES=COMMIT_SHA+PATH+LINK+READBACK(remote_tip==local_sha)
EVERY_MEMORY_CLAIM_NAMES_WHERE=true
LEDGER_1562_RECEIPT_SAME_TURN_AS_DIRECT_MAIN=true
```

Vale para qualquer motor (Claude, ChatGPT, Codex, Gemini, Grok, Hermes, CI). Disse que gravou → mostra ID, caminho, link e prova de leitura de volta. Sem isso, não aconteceu.
