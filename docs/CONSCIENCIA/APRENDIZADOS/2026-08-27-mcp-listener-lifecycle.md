---
title: "MCP listener lifecycle — atribuição antes da causa"
status: KNOWLEDGE_ONLY
date: 2026-08-27
updated: 2026-08-28T04:47:01Z
observed_at: 2026-08-27T14:05:51Z
tags: [aprendizado, mcp, listener, lifecycle, runtime, pid, logs, proveniencia, meta-lupa, contraprova, next-cursor]
category: "A-Aprendizado-Operacional"
sensitivity: INTERNAL
source: "evidência observada na sessão do SEGREDO/CHEFE em 2026-08-27; reconciliada sem nova mutação remota"
source_class: OBSERVED_EVIDENCE
source_rule: "HISTORY != CURRENT_STATE; LOG_EVENT != PID sem atribuição; CURRENT_SOURCE != RUNTIME_BYTES sem proveniência"
owner: "apps/modulos/mcp/src/index.js + logs estruturados do CentralDark-MCP"
consumer: "Hermes/PIVETE na investigação do runtime; SOL na reconciliação e contraprova"
writer: "ChatGPT/SOL"
related_notes: [docs/CONSCIENCIA/APRENDIZADOS/2026-08-26-intencao-unica-propriedades-ciclo-mestre.md, apps/modulos/mcp/src/index.js]
relation_types: [EXPLICA, DEPENDE_DE, COMPLEMENTA]
semantic_summary: "Antes de atribuir perda do listener a um processo vivo, vincular evento, worker/PID e bytes efetivamente executados."
---

# MCP listener lifecycle — atribuição antes da causa

## Receipt mínimo

```text
MISSION_ID=MCP_LISTENER_LIFECYCLE_20260827
MODE=READ_ONLY_RECONCILIATION

SESSION_REPORTED_REMOTE_MAIN=a1f37078dcab11e7447df319c641a1bdc7391fd7

RUNTIME_PID=3092588
PID_START=02:32:09

T0_MCP_REQUEST_200=PROVED
T1_PORT_9100_ABSENT=PROVED
PROCESS_ALIVE_T1=PROVED

OLD_CLAIM_NEVER_LISTENED=INVALIDATED
OLD_MCP_LISTENING_GREP=INVALIDATED_WRONG_FIELD

LOG_PID_ATTRIBUTION=UNKNOWN
RUNTIME_CODE_PROVENANCE=UNKNOWN
LISTENER_LOSS_CAUSE=UNKNOWN

LISTENER_LOST_WHILE_PROCESS_ALIVE=NOT_YET_PROVED
FIXED_POINT=NOT_YET

RESTART=false
MUTATION=false
```

## O que a convergência provou

O par temporal preservado é:

```text
T0 → houve POST /mcp autorizado com status 200
T1 → porta 9100 ausente enquanto PID 3092588 continuava vivo
```

Isso derruba o claim antigo de que o MCP nunca chegou a servir requisição. Também derruba a busca antiga por `message:mcp_listening`: no owner atual, o registro é emitido por `log.info("mcp_listening", ...)`, e o logger estruturado materializa o nome como evento.

Na reconciliação do repositório, `apps/modulos/mcp/src/index.js` em `main` foi lido com blob `3a62b42d3ca9fc8e95d502ee09164d4aa14cbab5` e contém:

```js
app.listen(config.port, "127.0.0.1", () => {
    log.info("mcp_listening", {
        port: config.port,
        publicUrl: config.publicUrl,
        githubOwner: config.github.owner,
        githubRepo: config.github.repo,
    });
});
```

Essa leitura prova a forma do source atual. Ela **não prova** que o PID `3092588` executava esse mesmo blob ou o mesmo `dist/index.js`.

## Fronteira causal

Ainda não existe vínculo material suficiente entre:

```text
EVENTO_T0
→ workerId/PID
→ PID_3092588
→ HEAD_RUNTIME
→ dist/index.js executado
→ ESTADO_T1
```

Portanto, continuam como hipóteses — não causas provadas:

- build/deploy não atômico;
- `dist/` incompleto;
- import dinâmico ausente;
- fechamento silencioso do listener;
- processo PM2 vivo sem handle de escuta.

```text
PM2_ONLINE != LISTENER_HEALTHY
CURRENT_REPO_SOURCE != RUNTIME_CODE_PROVENANCE
TEMPORAL_CORRELATION != PROCESS_ATTRIBUTION
HYPOTHESIS != CAUSE
```

## Invalidação escopada

A mudança de estado invalida somente claims dependentes:

```text
INVALIDATED:
- NEVER_LISTENED
- GREP_MESSAGE_FIELD_VALID

PRESERVED:
- T0 request 200
- T1 port 9100 absent
- PID alive at T1

UNKNOWN:
- T0 log event belongs to PID 3092588
- runtime HEAD and dist byte identity
- listener loss mechanism
```

## Evidência e deduplicação

- Dois anexos da sessão eram byte-idênticos: `SHA-256 3a3e308cdd3764b4bc60308cff2bb3b13ce175cf648980c2390298c441bab168`; contam como uma fonte, não duas provas.
- O receipt local cristalizado após a reconciliação tem `SHA-256 de4195e378d44520ab20e3fcf768ddd1d112d4ddd2f351f2e1ccee2e2c0fe6ad`.
- Nenhum valor de secret foi copiado ou registrado.
- Nenhum restart, deploy ou mutação na VPS foi executado nesta cristalização.

## NEXT_CURSOR

```text
bind structured log → workerId/PID
→ recover mcp_listening with event field
→ measure runtime git HEAD + dist/index.js mtime/hash
→ CROSS_BEARING_RENDEZVOUS
→ !META_LUPA
→ !RECONCILIAR
→ só depois decidir restart/instrumentação
```

## !BOOT

```text
#ACORDAR
→ grep event:mcp_listening
→ grep event:hub_mission_consumer_started
→ bind workerId → PID
→ medir runtime HEAD
→ medir dist/index.js mtime + hash
→ CROSS_BEARING_RENDEZVOUS
→ !META_LUPA
→ !RECONCILIAR
→ REALITY_JUDGE
```

## Fio da missão

Antes parecia que o ouvido do processo morreu. A pergunta correta vem primeiro: **aquele ouvido pertencia exatamente àquele corpo e àqueles bytes?** Somente depois dessa atribuição será legítimo julgar `LISTENER_LOST_WHILE_PROCESS_ALIVE`.
