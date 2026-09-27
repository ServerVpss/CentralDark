---
title: "Banda — Intenção Única, Compasso e Sincronização Viva"
status: "CURRENT_CONCEPT_UPDATED_REQUIRES_RUNTIME_PROOF"
owner: "docs/BRAIN/01-CONCEITOS/02-BANDA/"
updated: 2026-09-24
truth_scope: "CONCEPTUAL_CONTRACT_NOT_RUNTIME_GREEN"
canonical_rule: "REGRA-ZERO-CENTRALDARK"
related_runtime:
  - "BRAIN_NOTE_RECOGNITION_TRIGGER"
  - "BRAIN_ARTIFACT_CAPTURE"
  - "OBSIDIAN_GRAFO_VIVO_AUTOSYNC"
  - "OBSIDIAN_LOCAL_REST_API_MCP_BRIDGE"
  - "KANBAN_CICD_FEEDBACK_LOOP"
tags:
  - banda
  - intencao
  - compasso
  - cross-chat
  - sincronizacao
  - semantica
  - grafo
  - centraldark
  - obsidian
  - brain
  - webhook
  - vps
  - ci-cd
  - kanban
  - mcp
related:
  - "[[INTENT_SYNC_STATE]]"
  - "[[BANDA_COMPASSO_GLOBAL]]"
  - "[[LACUNA_BANDA_INTENCAO_UNICA]]"
  - "[[SEMANTIC-LINKER]]"
  - "[[GRAPH-INVESTIGATOR]]"
  - "[[BRAIN_ARTIFACT_CAPTURE]]"
  - "[[BOOT_ENXAME_OMEGA]]"
---

# Banda — Intenção Única, Compasso e Sincronização Viva

> Uma banda pode ter muitos músicos. A CentralDark pode ter muitas janelas, bots, agentes, notas, plugins, rotas e Kanbans. A canção continua sendo uma só quando todos tocam no **mesmo compasso causal**.

## 1. Estado preservado

A lacuna original continua válida:

```text
N_JANELAS != N_MISSOES
MESMO_GLOBAL_INTENT_ID = UMA_MISSAO
N_PERCEPÇÕES = LEITORES
ONE_WRITER_PER_SCOPE = MUTAÇÃO SERIALIZADA
REALIDADE_IS_JUDGE = VERDADE SÓ COM PROVA
```

O que mudou em 2026-09-24 é que o compasso agora precisa incluir também:

```text
BRT_TIME
VPS_TIME
WEBHOOK_EVENT_ID
OBSIDIAN_NOTE_PATH
BRAIN_MANIFEST_ENTRY
CI_CD_RECEIPT
KANBAN_STATE
```

## 2. Compasso temporal

Toda nota/evento compatível deve carregar duas referências de tempo:

```text
client_time_brt = horário de Brasília observado no cliente/plugin/bot
server_time_vps = horário assinado pela API/VPS no recebimento
```

Regra:

```text
CLIENT_TIME != SERVER_AUTHORITY
BRT_TIME = contexto humano
VPS_TIME = autoridade operacional do recebimento
CI_CD_TIME = autoridade de promoção/receipt
```

Se houver divergência, não corrigir no grito. Registrar a diferença e deixar o CI/CD ou receipt decidir a promoção.

## 3. Rota viva de nota

```text
Telegram / Bot / API / Obsidian / Drive
→ /memoria/ingest
→ CANDIDATE_EVENT
→ hash + metadata + origem + horário BRT + horário VPS
→ BRAIN manifest
→ CI/CD valida contrato
→ receipt
→ Grafo/Plugin/Obsidian atualiza
→ nota volta a ser consultável
```

Nada entra direto como verdade final. Entra como candidato com rastro.

## 4. Obsidian plugin como superfície viva

Owner atual:

```text
apps/modulos/obsidian-plugin-grafo-vivo/
```

O plugin já é a superfície correta para abrir notas por `obsidian_path`, ver grafo vivo e enviar notas ao Hub. A atualização de 2026-09-24 adiciona o contrato:

```text
OBSIDIAN_NOTE_CREATE_OR_MODIFY
→ autosync debounce
→ POST https://api.centralldark.com/memoria/ingest
→ kind=obsidian.note.autosync
→ metadata.client_time_brt
→ metadata.client_time_iso
→ metadata.vps_time_source=server_api_authoritative
→ CANDIDATE
```

Cadeado:

```text
NOTE_SYNC != TRUTH_PROMOTION
DOCUMENTED != EXECUTED
KANBAN_CARD != CI_GREEN
PATCH_NOTE != DEPLOY
```

## 5. Obsidian Local REST API + MCP

A Local REST API do Obsidian/MCP pode ser usada como ponte local autenticada para scripts, browser extensions e agentes abrirem, lerem, buscarem e patcharem notas no vault.

Mas ela é **ponte local**, não autoridade global:

```text
LOCAL_REST_API_IS_LOCAL_BRIDGE=true
LOCAL_REST_API_TOKEN_LOCAL_ONLY=true
NO_TOKEN_IN_REPO=true
NO_PUBLIC_EXPOSED_OBSIDIAN_API=true
MCP_OBSIDIAN_CAN_READ_OR_PATCH_NOTE=true
MCP_OBSIDIAN_CANNOT_PROMOTE_TRUTH_ALONE=true
```

Rota segura:

```text
VPS/HERMES/BOT
→ API/HUB
→ evento candidato
→ CI/CD
→ receipt
→ BRAIN manifest
→ plugin Obsidian lê/abre nota
→ Local REST API/MCP pode patchar seção ou Kanban local
→ alteração volta por autosync
→ novo candidato
```

Isso cria o ciclo, mas mantém a trava:

```text
LOCAL_PATCH != CANONICAL_APPROVAL
OBSIDIAN_KANBAN_MOVE != DEPLOY
OBSIDIAN_LOCAL_STATE != VPS_RUNTIME_STATE
```

## 6. Kanban como fluxo, não juiz

O Kanban pode representar o fluxo operacional:

```text
Inbox
→ Candidate
→ Measuring
→ CI/CD
→ Review/Greg
→ Deploy Gate/Dex
→ Receipt
→ Fixed Point
```

Mas mover card não promove realidade. O card é interface humana/visual. A promoção continua exigindo:

```text
hash
receipt
CI/CD
runtime proof
Reality Judge
```

## 7. Compatibilidade de conteúdo

Quando entrar algo novo, a CentralDark deve decidir compatibilidade antes de misturar:

```text
SAME_INTENT_ID?          se sim, pode reconciliar
SAME_NOTE_PATH?          se sim, pode patchar seção
SAME_HASH?               se sim, deduplicar
CONFLICTING_CONTENT?     se sim, criar delta/receipt, não sobrescrever calado
BINARY_OR_EXECUTABLE?    guardar/indexar/provar/linkar; não executar
```

Artefatos seguem:

```text
GUARDAR != EXECUTAR
ARQUIVO_GUARDADO != ARQUIVO_SEGURO
EXE_STORED != EXE_ALLOWED_TO_RUN
TODO_ARTEFATO_TEM_HASH=true
TODO_ARTEFATO_TEM_SIDECAR_MD=true
TODO_ARTEFATO_ENTRA_NO_MANIFEST=true
CI_CD_DECIDE_PROMOCAO=true
```

## 8. Webhook e auto-update

O webhook não é só notificação. Ele é pulso da banda:

```text
WEBHOOK_EVENT
→ normalizar fonte
→ carimbar horário VPS
→ preservar horário humano/BRT quando existir
→ gerar event_id
→ atualizar manifest
→ acionar CI/CD quando material
→ publicar receipt
→ plugin/kanban/grafo refletem estado
```

Se o evento não muda decisão, não martelar loop.

```text
NO_REPEAT_WITHOUT_INFORMATION_GAIN=true
```

## 9. Fio vivo

A frase canônica desta nota passa a ser:

> O que a humanidade aprende não pode morrer na janela de uma IA.

Rota:

```text
BRAIN → GIT → CI/CD → VPS → MCP → HERMES → OBSIDIAN → KANBAN → REALIDADE
```

A banda toca quando todas as superfícies seguem o mesmo compasso: intenção única, rastro único, prova atual, writer único.

## 10. Estado atual

```text
CONCEPT_UPDATED=true
PLUGIN_ROUTE_UPDATED_IN_PR_1662=true
RUNTIME_PROOF=UNKNOWN
CI_STATUS=UNKNOWN
OBSIDIAN_LOCAL_REST_RUNTIME=UNKNOWN
```

Esta nota não declara runtime verde. Ela declara o contrato atualizado para o próximo TIK-TAK.
