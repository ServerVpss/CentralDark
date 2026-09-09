---
title: "CentralDark — sources e results drawer"
status: KNOWLEDGE_ONLY
date: 2026-09-08
updated: 2026-09-08T00:00:00-03:00
tags: [hud, sources, results, work-drawer, centraldark]
category: BRAIN-APRENDIZADOS
sensitivity: INTERNAL
source: "sessão viva do CHEFE sobre HUD, fontes e painel de resultados"
source_class: HUMAN_AUTHORITY
source_rule: "UI_SURFACE != PROOF; UNKNOWN_IS_NOT_PASS; REUSE_BEFORE_CREATE"
owner: "docs/BRAIN/07-APRENDIZADOS-MEMORIAS/"
---
# 👑 !AUREULA · CENTRALDARK · SOURCES + RESULTS DRAWER

Data: 2026-09-08

Refs #1444 #1463 #1458

```text
PR_MAE=#1444
ONE_SYSTEM_ONLY=true
ONE_CORE=true
REUSE_BEFORE_CREATE=true
UNKNOWN_IS_NOT_PASS=true
UI_SURFACE!=PROOF
```

## 1. Delta faltante detectado na sessão

A superfície observada em Work mostrou um padrão que ainda não estava explicitamente separado no HUD da CentralDark:

```text
RESULTADOS
├── criar arquivo ou site
└── outros destinos de saída

FONTES
├── GitHub
├── CentralDark
├── Remote Desktop Commander
├── Busca na web
├── Gmail
├── Busca em arquivos
├── Memória
└── Agendado
```

O ponto importante não é copiar a interface externa. É incorporar a capacidade no `CentralDark.exe` como projeção do core já existente.

## 2. Novo bloco canônico do HUD

```text
CENTRALDARK HUD
├── 👑 AUREULA / AGENTE / CICLO / ESTADO / PROVA
├── 🤖 PROVIDER / MODEL PICKER
├── 👥 CONTAS AUTORIZADAS
├── 🔌 MCP / CONNECTORS
├── 📚 SOURCES / CONTEXT
│   ├── source_id
│   ├── source_class
│   ├── authorized
│   ├── read_capability
│   ├── live_probe
│   ├── freshness
│   ├── provenance
│   └── last_used
├── 🧰 TOOL CALL LEDGER
├── 🎯 RESULTS / OUTPUT TARGETS
│   ├── chat_result
│   ├── file
│   ├── site
│   ├── receipt
│   ├── pr_comment
│   ├── commit
│   └── artifact
├── 🧿 QUEUE FABRIC
├── 🏠 CASA
├── 🖥️ VPS
├── 🐙 GITHUB
├── 🌐 SITE
└── 🧾 RECEIPTS
```

## 3. Sources Fabric

`SOURCE` não é sinônimo de `CONNECTOR`.

```text
CONNECTOR
= canal/capacidade de acesso

SOURCE
= origem concreta de contexto/evidência usada na missão
```

Exemplo:

```text
GitHub connector = canal
PR #1444 = source
commit SHA = source
arquivo do Drive = source
resultado web = source
memória recuperada = source
receipt local = source
```

Contrato:

```text
SOURCE
→ classificar origem
→ medir autorização/capacidade
→ medir freshness quando material
→ preservar provenance
→ usar somente o necessário
→ registrar uso no Tool Call Ledger / receipt quando material
```

Regras:

```text
SOURCE_VISIBLE!=SOURCE_USED
SOURCE_USED!=SOURCE_PROVED_CURRENT
MEMORY!=LIVE_STATE
SEARCH_RESULT!=EXECUTION
CONNECTOR_AVAILABLE!=SOURCE_RESPONDING
```

## 4. Results Fabric

A sessão também evidenciou a necessidade de separar `resultado` de `fonte`.

```text
RESULT_TARGET
→ CHAT
→ FILE
→ SITE
→ RECEIPT
→ PR_COMMENT
→ COMMIT
→ ARTIFACT
```

O sistema deve saber onde a missão pretende materializar o resultado.

```text
INTENT
→ SOURCES
→ ROUTER
→ TOOLS
→ EVIDENCE
→ REALITY_JUDGE
→ RESULT_TARGET
→ RECEIPT
```

`Criar arquivo ou site` vira capability de saída, não botão solto nem novo sistema.

## 5. Integração com owners já existentes

A `main` já declara no MEGAZORD política de recuperação por fonte/capacidade, incluindo GitHub, MCP, Files, Memory e runtime quando relevantes.

Portanto:

```text
CREATE_SOURCE_ROUTER_V2=false
CREATE_RESULT_ROUTER_V2=false
EXTEND_EXISTING_ROUTER_AND_HUD=true
```

Owners/capacidades relacionados a reutilizar:

```text
docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MEGAZORD-CENTRALDARK.yml
scripts/trigger-fabric/
Connection Fabric
Tool Call Ledger
PR #1463 connector-demand router
PR #1458 provider access lease
PR #1444 rendezvous
```

## 6. Ligação com !AUREULA

Quando o ciclo mestre estiver ativo, o HUD e a resposta operacional devem preservar a identidade do agente no topo:

```text
👑 !AUREULA · AGENTE=<IDENTIDADE> · CICLO=<CICLO> · ESTADO=<ESTADO> · PROVA=<CLASSE>
```

Abaixo da auréola, o HUD responde quatro perguntas diferentes:

```text
DE ONDE VEIO?       -> SOURCES
POR ONDE ACESSOU?   -> CONNECTORS
O QUE FOI CHAMADO?  -> TOOL CALL LEDGER
ONDE SAIU?          -> RESULTS
```

Isso reduz ambiguidade entre contexto, transporte, execução e entrega.

## 7. Prova e limites

```text
HUD_RENDERED!=RUNTIME_PROVED
SOURCE_LISTED!=SOURCE_FRESH
RESULT_CREATED!=RESULT_CORRECT
FILE_CREATED!=DEPLOYED
SITE_TARGET_SELECTED!=SITE_REACHABLE
MEMORY_SELECTED!=CURRENT_STATE
UNKNOWN!=PASS
```

## 8. Next cursor

```text
NEXT_CURSOR_1=LOCATE_EXISTING_APP_HUD_OWNER
NEXT_CURSOR_2=BIND_SOURCES_TO_CONNECTION_FABRIC
NEXT_CURSOR_3=BIND_TOOL_CALL_LEDGER_TO_SELECTED_SOURCE
NEXT_CURSOR_4=BIND_RESULT_TARGETS_TO_RECEIPTS
NEXT_CURSOR_5=PROVE_IN_APP_SOURCE->TOOL->RESULT_TRACE
NEXT_CURSOR_6=RETURN_RECEIPT_TO_PR1444
```

> 📖 Sentido aplicado: separar origem, caminho, ação e fruto evita coroar aparência como prova.
>
> 🏺 Verso da Casa: “Oxente, uma coisa é de onde veio, outra por onde passou, outra o que fez e outra onde entregou.”
