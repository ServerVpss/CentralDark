---
title: "SHARED writer lease — contraprova multi-janela"
status: "CRISTALIZADO_COM_UNKNOWN_EXPLICITO"
date: 2026-09-05
intent_authority: "SEGREDO/CHEFE"
method: "#ACORDAR -> !MULTIBUSSOLA_META -> !META_LUPA -> !CONTRAPROVA -> !VERTEX_INVERSO -> !CARACOL -> !FIXED_POINT"
owner_policy: "REUSE_BEFORE_CREATE + ONE_SYSTEM_ONLY + ONE_WRITER_PER_SCOPE"
---

# INTENÇÃO

Cristalizar somente o que foi efetivamente observado/provado no experimento multi-janela da CentralDark, sem transformar convenção textual em garantia de concorrência e sem reabrir claims já selados.

> “Muitos olhos percorrem a obra; uma só mão assina a pedra final.”

Oxente: o comando compartilhado transportou a intenção, mas a META_LUPA encontrou a ferida que faltava — cada janela isolada ainda pode acreditar que chegou primeiro. Portanto o contrato de Writer precisa de arbitragem compartilhada real.

# PROVAS DA RODADA

```text
SHARED_COMMAND_CONTEXT_TRANSPORT=PROVED_OBSERVED
CENTRALDARK_AS_SHELL_COMMAND=FALSE_IN_OBSERVED_ENV
SKILL_TRIGGER_RECOVERY=PROVED_OBSERVED
CENTRALDARK_SKILLS_LOADED=PROVED_OBSERVED
MEASURE_BEFORE_ACTION=PROVED_OBSERVED

PROMPT_ONLY_FIRST_WRITER_SAFETY=REFUTED
SHARED_WRITER_LEASE_IMPLEMENTED=UNKNOWN
MULTI_WINDOW_SINGLE_WRITER_E2E=UNKNOWN
CENTRALDARK_SHARED_SHELL_ALIAS=UNKNOWN
FIRST_WRITER_FINALIZES=DESIRED_CONTRACT
```

## 1. O comando compartilhado transportou contexto suficiente

Uma janela independente recebeu o comando/página compartilhada e recuperou as regras centrais: mesma missão, múltiplos readers, `ONE_WRITER_PER_SCOPE`, serialização de mutação, META_LUPA contínua, VERTEX/CARACOL e retorno de delta ao Writer.

Isso prova transporte/reconstrução observada de contexto. Não prova, sozinho, sincronização distribuída entre processos.

## 2. `!CENTRALDARK` não era comando shell naquele ambiente

A tentativa de executar diretamente o texto `!CENTRALDARK RECONCILIAR_SHARED ...` no terminal terminou com `exit 127`.

Conclusão:

```text
!CENTRALDARK=SKILL_TRIGGER_IN_OBSERVED_HERMES_ENV
!CENTRALDARK!=PROVEN_SHELL_BINARY
```

Não registrar novamente “falta implementar todo o método” por causa desse erro: a falha foi de superfície/invocação, não ausência do protocolo.

## 3. Houve recuperação autônoma após a falha

Depois do erro shell, o agente distinguiu trigger de skill de binário e carregou componentes CentralDark relevantes, incluindo:

- `centraldark-master-funnel-autonomo`;
- `centraldark-operational-discipline`;
- `centraldark-status-reconciliation`.

Isso é prova observada de recuperação do protocolo, não prova de fixed point global.

## 4. Medição precedeu nova ação

A janela passou a medir estado vivo do repositório, PRs, `DELTA-CONTINUO.md`, task list e demais superfícies antes de continuar.

Logo:

```text
MEASURE_BEFORE_ACTION=PROVED_OBSERVED
ACTION_IS_NOT_PROOF=true
```

# CONTRAPROVA CENTRAL — O PROMPT NÃO É MUTEX

Uma janela independente concluiu autonomamente que era a primeira e se declarou `WRITER_PRIMARY`.

Esse fato refuta a interpretação forte de que:

```text
FIRST_WRITER_WINS=true
```

escrito no prompt seja suficiente para garantir exclusão mútua entre janelas/processos independentes.

Portanto:

```text
PROMPT_FIRST_WRITER_WINS != DISTRIBUTED_LOCK
PROMPT_DECLARATION != CONCURRENCY_PROOF
SELF_DECLARE_PRIMARY=FORBIDDEN
DEFAULT_ROLE=READER_FIRST
WRITER_ACQUIRE_REQUIRES_SHARED_LEASE=true
```

Isso NÃO invalida `ONE_WRITER_PER_SCOPE`. Pelo contrário: identifica o menor mecanismo ainda faltante para torná-lo verificável sob concorrência.

# CONTRATO EVOLUÍDO — SHARED WRITER LEASE

Toda nova janela deve começar em estado não-mutante:

```text
ROLE=READER_FIRST
DISCOVER_ACTIVE_MISSION=true
DISCOVER_ACTIVE_WRITER=true
ACQUIRE_WRITER_ONLY_IF_NO_VALID_LEASE=true
WRITER_LEASE_REQUIRED=true
WRITER_ID_REQUIRED=true
WRITER_STARTED_AT_REQUIRED=true
WRITER_SCOPE_REQUIRED=true
NO_SELF_DECLARE_PRIMARY=true
```

Uma aquisição válida precisa produzir receipt compartilhado contendo, no mínimo:

```text
WRITER_ACQUIRE
MISSION_ID
WRITER_ID
SCOPE
HEAD
TIMESTAMP
LEASE
```

Se um Writer válido já existir:

```text
JOIN_AS=READER|SCOUT|REVIEWER|COUNTERPROOF
MUTATION=false
RETURN_TO_WRITER=true
```

# HANDOFF

Troca de Writer não ocorre por narrativa nem por timeout presumido.

Contrato mínimo:

```text
WRITER_HANDOFF_RECEIPT
+ OLD_WRITER_RELEASE
+ NEW_WRITER_ACQUIRE
```

O Writer original permanece finalizador enquanto sua lease estiver válida e não houver release/handoff comprovado.

# ANTI-PENDÊNCIA / CLAIM SEAL

Esta rodada não reabre ouro anterior.

```text
PREVIOUSLY_SEALED_CLAIMS_REOPENED=0
NEW_OPEN_GAP=SHARED_WRITER_LEASE
REOPEN_REQUIRES=REOPEN_CAUSE_REF
SAME_SIGNAL_WITHOUT_NEW_INFORMATION=DROP_DUPLICATE
```

Uma falha na eleição compartilhada não autoriza reabrir claims independentes de HERMES-CORE, Omni Router, Zendrive, GraphRAG, META_LUPA ou outras capacidades já provadas em seus próprios escopos.

# TESTE DISCRIMINANTE QUE AINDA FALTA

Somente este corredor pode promover a garantia multi-janela para PASS:

1. duas janelas/processos independentes iniciam a mesma `MISSION_ID` aproximadamente ao mesmo tempo;
2. ambos consultam o mesmo owner compartilhado da lease;
3. exatamente um recebe `WRITER_ACQUIRE=PASS`;
4. o perdedor registra `JOIN_AS=READER` e prova `MUTATION=false`;
5. ambos preservam o mesmo `TRACE_ID`/rastro;
6. o Writer recebe delta/evidence dos readers;
7. ocorre handoff explícito `release -> receipt -> acquire`;
8. o novo Writer somente então pode mutar;
9. apenas o Writer válido finaliza commit/push/PR/receipt do escopo;
10. a remedição confirma ausência de dois Writers simultâneos.

Somente após isso:

```text
MULTI_WINDOW_SINGLE_WRITER_E2E=PASS
```

# VEREDITO

```text
CONTEXT_TRANSPORT=PASS_OBSERVED
SKILL_TRIGGER_RECOVERY=PASS_OBSERVED
MEASURE_BEFORE_ACTION=PASS_OBSERVED
PROMPT_ONLY_LOCK=FAIL_REFUTED
REAL_SHARED_LOCK=UNKNOWN
MULTI_WINDOW_SINGLE_WRITER_E2E=UNKNOWN
PREVIOUSLY_SEALED_CLAIMS_REOPENED=0
FALSE_GREEN_CREATED=0
```

# PRÓXIMO CURSOR

Reusar o owner canônico já existente de missão/receipt e implementar o menor lease compartilhado possível. Não criar segundo cérebro, workflow paralelo, `V2/V3/V4` ou novo protocolo concorrente.

Depois, executar somente o teste discriminante de contenção multi-janela e selar o resultado correspondente.

# BOOT

```text
!CENTRALDARK
→ #ACORDAR
→ !CALIBRAR
→ !MULTIBUSSOLA_META
→ !META_LUPA
→ !RECONCILIAR
→ !CONTRAPROVA
→ !VERTEX_INVERSO
→ !CARACOL
→ !FIXED_POINT
→ !REGISTRA
→ !BOOT
```
