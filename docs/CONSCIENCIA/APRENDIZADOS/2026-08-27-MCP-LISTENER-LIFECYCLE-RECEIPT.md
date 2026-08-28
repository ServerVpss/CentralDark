---
title: "2026 08 27 MCP LISTENER LIFECYCLE RECEIPT"
date: 2026-08-28
tags: ["consciencia"]
updated: 2026-08-28
---

# 2026-08-27-MCP-LISTENER-LIFECYCLE-RECEIPT.md

!REGISTRA — MCP listener lifecycle

**MISSION_ID:** `MCP_LISTENER_LIFECYCLE_20260827`
**REGISTERED_AT:** 2026-08-27
**MODE:** READ_ONLY_RECONCILIATION
**MUTATION:** false
**RESTART:** false

---

## Estado reconciliado

| Campo | Valor |
|-------|-------|
| `REMOTE_MAIN` | `a1f37078dcab11e7447df319c641a1bdc7391fd7` |
| `RUNTIME_PID` | `3092588` |
| `PID_START` | `02:32:09` |
| `T0_MCP_REQUEST_200` | `PROVED` |
| `T1_PORT_9100_ABSENT` | `PROVED` |
| `PROCESS_ALIVE_T1` | `PROVED` |
| `OLD_CLAIM_NEVER_LISTENED` | `INVALIDATED` |
| `OLD_MCP_LISTENING_GREP` | `INVALIDATED_WRONG_FIELD` |
| `LOG_PID_ATTRIBUTION` | `UNKNOWN` |
| `RUNTIME_CODE_PROVENANCE` | `UNKNOWN` |
| `LISTENER_LOSS_CAUSE` | `UNKNOWN` |

---

## Veredito

O par temporal provado é:

- **T0:** houve POST /mcp autorizado com status 200
- **T1:** porta 9100 ausente enquanto PID 3092588 continuava vivo

Isso ainda não prova que o request de T0 e o processo vivo em T1 pertencem ao mesmo worker/PID nem que executavam os mesmos bytes. Portanto:

- `LISTENER_LOST_WHILE_PROCESS_ALIVE` = `NOT_YET_PROVED`
- `CAUSE` = `UNKNOWN`
- `FIXED_POINT` = `NOT_YET`

---

## Invalidações preservadas

- **never listened** caiu porque existe requisição MCP real com status=200 em T0.
- A busca antiga por `message:mcp_listening` não vale porque o marcador correto deve ser procurado no campo `event`.
- PM2 online não prova listener saudável.
- Import ausente, build não atômico ou deploy incompleto permanecem hipóteses; nenhum deles foi provado como causa do desaparecimento do listener.

---

## Proveniência dos anexos

Dois anexos Markdown eram byte-idênticos (SHA-256 `3a3e308cdd3764b4bc60308cff2bb3b13ce175cf648980c2390298c441bab168`) e contam como uma única fonte.

O registro usa os dados fornecidos na sessão; nenhuma nova medição remota foi executada neste fechamento.

Nenhum valor de secret foi copiado ou registrado.

---

## NEXT_CURSOR

```
bind structured log → workerId/PID
→ recover mcp_listening with event field
→ measure runtime git HEAD + dist mtime/hash
→ !RECONCILIAR
```

---

## !BOOT

```
#ACORDAR
→ grep event:mcp_listening
→ grep event:hub_mission_consumer_started
→ bind workerId → PID
→ medir runtime HEAD
→ medir dist/index.js mtime + hash
→ CROSS_BEARING_RENDEZVOUS
→ !META_LUPA
→ só depois decidir restart/instrumentação
```

---

## Fio da missão

Antes parecia que o ouvido do processo morreu. Agora a pergunta correta é anterior: provar que aquele ouvido pertencia exatamente àquele corpo. Se a atribuição fechar, então poderá ser julgado o claim `LISTENER_LOST_WHILE_PROCESS_ALIVE`; até lá, a causa permanece `UNKNOWN`.
