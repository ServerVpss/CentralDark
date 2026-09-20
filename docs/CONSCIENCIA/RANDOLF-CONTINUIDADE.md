---
title: "RANDOLF — continuidade e persistência auditável"
status: "CANONICAL"
updated: 2026-09-05
owner: "CENTRALDARK_TRIGGER_FABRIC"
intent_authority: "SEGREDO/CHEFE"
---

# RANDOLF — continuidade dentro da CentralDark

RANDOLF é a função de **continuidade, persistência auditável e reencontro de contexto** da CentralDark. Ele não cria um segundo cérebro, um segundo Hub, um segundo orquestrador ou uma segunda autoridade.

```text
RANDOLF=CONTINUIDADE_PERSISTENCIA_AUDITAVEL
RANDOLF_IS_SECOND_BRAIN=false
RANDOLF_IS_SECOND_HUB=false
RANDOLF_IS_ORCHESTRATOR=false
RANDOLF_IS_WRITER=false
RANDOLF_IS_JUDGE=false
RANDOLF_IS_HUMAN_AUTHORITY=false
ONE_SYSTEM_ONLY=true
ONE_WRITER_PER_SCOPE=true
REALITY_IS_JUDGE=true
UNKNOWN_IS_NOT_PASS=true
```

## Perfil humano canônico da SOL

A apresentação humana vigente da coordenadora é:

```text
PROFILE_ID=ORQUESTRACAO_SOL
PROFILE_DISPLAY=😎 Orquestração SOL 🌞
PROFILE_IS_AUTHORITY=false
MODEL_IS_PROFILE=false
SESSION_IS_PROFILE=false
```

Trocar modelo, provider, aba, rota ou sessão não cria uma nova SOL. O perfil identifica a superfície humana; intenção, owners e evidência continuam mandando no fluxo técnico.

## Posição no fluxo único

```text
👑 SEGREDO/CHEFE — INTENÇÃO + GOAL
→ !CENTRALDARK / CENTRALDARK_AI_BOOT
→ HISTORY RENDEZVOUS
→ RANDOLF / CONTINUIDADE + RECEIPTS + CURSOR
→ CAPABILITY LINEAGE
→ DEDUPE / ABSORB
→ ONE SURVIVING DELTA
→ 🏛️ ENEIAS / estratégia contextual quando material
→ ☀️ SOL / coordenação e reconciliação
→ 🧭 MULTIBÚSSOLA
→ ⊛ META LUPA
→ ONE WRITER
→ ☿ HERMES/PIVETE / execução
→ CONTRAPROVA
→ REMEDIÇÃO
→ ⚖ REALITY JUDGE
→ FIXED_POINT
→ REGISTRA
→ HUB DE CONHECIMENTO / GRAFO / RECEIPT / CURSOR
→ CENTRAL DE NOTIFICAÇÕES / PROJEÇÃO
→ MICRO_DEPLOY ou FULL_DEPLOY conforme cone causal
→ BOOT
```

`CARACOL_REVERSO` atravessa esse mesmo fluxo quando existe divergência: volta ao último cursor provado, preserva evidências independentes e revalida somente o cone afetado.

## O que RANDOLF guarda

RANDOLF não guarda "tudo" sem critério. Ele preserva o mínimo necessário para reconstruir a passagem:

```text
INTENT_GOAL
CURRENT_OWNER
SOURCE
SOURCE_SURFACE
SESSION_ID_QUANDO_OBSERVADO
PROFILE_ID
PROFILE_DISPLAY
SOURCE_SHA_QUANDO_APLICAVEL
HEAD_SHA_QUANDO_APLICAVEL
EVIDENCE_REF
KNOWLEDGE_EVENT_ID_QUANDO_APLICAVEL
CLASSIFICATION
DELTA_UTIL
COUNTERPROOF
RESULT
RESIDUAL
NEXT_CURSOR
PROVENANCE
TIMESTAMP
```

Estados permitidos:

```text
PROVADO
QUEBRADO
EVIDENCIA_FALTANTE
CANDIDATE
HISTORICAL
SUPERSEDED
```

Nunca converter ausência de evidência em verde.

## Sessões observadas — aliases de proveniência, não autoridade

Os identificadores abaixo foram trazidos como rastros de sessões relevantes do Hermes/Desktop e entram no RANDOLF para reencontro. Eles **não são tratados como prova de painel, owner ou estado atual sem leitura do runtime que os produziu**.

```text
20260905_031340_68bd10  → CANDIDATE_ANCHOR · 😎 Orquestração SOL 🌞
20260905_030855_9d0c93  → OBSERVED_SESSION_ALIAS · painel exato a remedir
20260905_010608_8c07f9  → OBSERVED_SESSION_ALIAS · Zendrive/chat gateway histórico
20260902_231220_48846d  → OBSERVED_SESSION_ALIAS · operação/estado vivo histórico
20260830_050658_252bc7  → OBSERVED_SESSION_ALIAS · CARACOL/mapa visual histórico
```

Regras:

```text
SESSION_ID != AUTHORITY
SESSION_ID != CURRENT_STATE
SESSION_TITLE != RUNTIME_PROOF
PINNED != FIXED_POINT
LAST_ACTIVE_SESSION != GLOBAL_OWNER
SESSION_ALIAS_MAY_HELP_RENDEZVOUS=true
EXACT_PANEL_BINDING_REQUIRES_RUNTIME_EVIDENCE=true
```

Se o runtime provar qual sessão é a âncora atual do perfil `ORQUESTRACAO_SOL`, RANDOLF registra essa associação no receipt atual; até lá o vínculo permanece `CANDIDATE`.

## Continuidade entre abas, modelos, voz e agentes

Toda aba, modelo, agente, worker ou superfície da Casa deve nascer no mesmo padrão lógico quando estiver em contexto CentralDark:

```text
BOT_ENTRY | SESSION_RESUME | NEW_TAB | MODEL_CHANGE | AGENT_HANDOFF | VOICE_COMMAND
→ CENTRALDARK_AI_BOOT
→ RECOVER_CURRENT_INTENT
→ HISTORY_RENDEZVOUS
→ RANDOLF_RECOVER_LAST_GOOD_STATE
→ CAPABILITY_LINEAGE
→ RECONCILIAR
→ CONTINUAR_DO_NEXT_CURSOR
```

Voz é **modalidade de entrada**, não segundo sistema de gatilhos:

```text
#ACORDAR
!CENTRALDARK
!CENTRALDARK SOL ACORDAR
"acordar" via input_mode=voice
"centraldark" via input_mode=voice
"centraldark sol acordar" via input_mode=voice
→ MESMO MASTER FUNNEL
→ UMA MISSÃO
```

Em texto comum, a palavra `CentralDark` continua sem disparar o master automaticamente; isso evita falso gatilho em documentação ou conversa sobre o nome.

```text
NEW_TAB != NEW_BRAIN
MODEL_CHANGE != RESET
AGENT_CHANGE != NEW_AUTHORITY
SESSION_CHANGE != NEW_MISSION
VOICE_CHANGE != NEW_PIPELINE
MANY_SURFACES_ONE_STATE=true
CROSS_SURFACE_CAUSAL_TRANSPORT_REQUIRES_EVIDENCE=true
```

## Hub único de conhecimento

RANDOLF aponta para o Hub existente; não cria banco paralelo.

```text
MEMORY_READ_OWNER=apps/modulos/memoria-api/
GRAPH_PROJECTION_OWNER=apps/modulos/graph-panel/
OBSIDIAN_PLUGIN_OWNER=apps/modulos/obsidian-plugin-grafo-vivo/
MEMORY_LINKER_OWNER=scripts/memory-linker/
GRAPH_RAG_OWNER=apps/modulos/HERMES-CORE/agents/GraphRAG-Master/
KNOWLEDGE_HUB_CONTRACT=docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/KNOWLEDGE-HUB.yml
NOTIFICATION_OWNER=src/lib/notifications-events.ts + supabase/functions/_shared/notifications-events.ts
NOTIFICATION_CONTRACT=docs/NOTIFY/README.md
```

Fluxo de ingestão:

```text
CHAT / VOZ / AGENTE / GITHUB / WEBHOOK / OBSIDIAN / FIRECRAWL / RUNTIME
→ EVENT ENVELOPE
→ HUB DE CONHECIMENTO
→ DEDUPE
→ NORMALIZAÇÃO
→ PROVENIÊNCIA
→ CANDIDATE
→ MEMORY-LINKER / KNOWLEDGE-COMPILER
→ OWNER + CONSUMER + TEST + GATE
→ ONE WRITER
→ MAIN SOMENTE QUANDO PROVADO
```

Fluxo de notificação:

```text
EVENTO MATERIAL
→ MESMO CONTEXTO RANDOLF
→ event_key + severity + source_surface + session_id + profile + intent_goal + owner + head_sha + next_cursor
→ NOTIFICATIONS_LOG
→ MEGA PAINEL / TELEGRAM / SUPERFÍCIE CONSUMIDORA
```

```text
NOTIFICATION_IS_PROJECTION=true
NOTIFICATION_IS_AUTHORITY=false
NOTIFICATION_DELIVERY_IS_RUNTIME_PROOF=false
SECRET_VALUES_MUST_NOT_ENTER_NOTIFICATION=true
```

## Auto-correção

Auto-correção é **correção do sistema**, não reescrita cega de fatos.

```text
ERRO_DE_CODIFICACAO_OU_FORMATO
→ PRESERVAR_RAW_CHECKSUM
→ NORMALIZAR_SEM_PERDER_CONTEUDO
→ MARCAR_ENCODING_SUSPECT_QUANDO_INCERTO
→ NAO_INVENTAR_TEXTO

ERRO_OPERACIONAL
→ FAILURE_SIGNATURE
→ SEARCH_EXISTING_CRYSTAL
→ CAUSA
→ MENOR_REMEDIACAO
→ RETEST
→ CONTRAPROVA
→ REALITY_JUDGE
→ RECEIPT
```

Texto corrompido ou mojibake não pode ser "corrigido" semanticamente por chute. A matéria original continua preservada por checksum/proveniência; correção automática só ocorre quando determinística.

## Promoção e deploy

RANDOLF preserva o recibo, mas não aprova promoção.

```text
LOCAL_TEST_READY != PRODUCTION_READY
PERCENTUAL_IS_NOT_PROOF=true
MAIN_PROMOTION_REQUIRES_APPLICABLE_GATES=true
POST_MAIN_RUNTIME_CAN_CONTINUE_WITH_EXPLICIT_YELLOWS=true
MICRO_DEPLOY_FIRST_WHEN_CAUSAL_SCOPE_IS_LOCAL=true
FULL_DEPLOY_ONLY_WHEN_CAUSAL_CONE_REQUIRES=true
```

A faixa de maturidade 80–90% pode ser suficiente para **uso controlado e observação ao vivo** quando o denominador estiver definido e nenhum requisito crítico estiver quebrado. Ela não substitui teste, segurança, rollback nem prova do HEAD promovido.

## Regra final

```text
RANDOLF
= LEMBRAR_ONDE_ESTAVA
+ PRESERVAR_O_QUE_FOI_PROVADO
+ UNIFICAR_SESSÃO/PERFIL/VOZ_SEM_CRIAR_NOVO_CÉREBRO
+ NÃO_REPETIR_TRABALHO
+ NÃO_CRIAR_SEGUNDA_VERDADE
+ ENTREGAR_NEXT_CURSOR
```

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
