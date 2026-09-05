---
title: "VERTEX inverso — pepitas provadas recuperadas"
status: "CRISTALIZADO_COM_ESCOPO_DE_PROVA"
date: 2026-09-05
intent_authority: "SEGREDO/CHEFE"
method: "conclusao -> vertex inverso -> historia -> prova -> cristalizacao"
---

# INTENÇÃO

Depois de uma conclusão material, voltar pela árvore causal em VERTEX inverso para recuperar fatos úteis já provados que ficaram espalhados no histórico, sem reabrir pendência fechada e sem transformar source/commit em runtime.

```text
CONCLUSAO
→ VERTEX_INVERSO
→ PARENTS / COMMITS / RECEIPTS / TESTES
→ CLAIM_ATOMICO
→ PROVA_REF
→ CRISTALIZAR
→ DEDUPE
→ NEXT_CURSOR
```

## LEI

```text
COMMIT_NA_MAIN=PROVA_DE_SOURCE
TESTE_NO_COMMIT=PROVA_DO_ESCOPO_DO_TESTE
WORKFLOW_GREEN=PROVA_DO_HEAD_EXATO_QUANDO_MEDIDO
SOURCE != RUNTIME
COMMITTED != DEPLOYED
HISTORICAL != CURRENT_RUNTIME
UNKNOWN != PASS
```

# PEPITAS RECUPERADAS

## 1. Handoff Zendrive está ligado ao Trigger Fabric existente

```text
CLAIM=ZENDRIVE_MASTER_CYCLE_BINDING_EXISTS_IN_SOURCE
ESTADO=PROVADO
PROVA_REF=fb124620e5582b36e31c52b79bbfb23afc90af3b
```

O commit `fb124620...` adicionou ao gate do Trigger Fabric uma contraprova explícita do corredor Zendrive → Master Cycle → RANDOLF/Hub, incluindo `py_compile`, self-test do bridge, `node --check`, presença de `context_preserved`, `session_id`, `profile_id`, `next_cursor` e launcher apontando para o bridge.

Consequência: não voltar a listar "ligar Zendrive ao Master Cycle/Hub" como pendência de source sem nova contraprova causal.

## 2. Handoff preserva contexto RANDOLF/Hub no source

```text
CLAIM=RANDOLF_HUB_CONTEXT_BINDING_EXISTS_IN_SOURCE
ESTADO=PROVADO
PROVA_REF=fb124620e5582b36e31c52b79bbfb23afc90af3b
```

O próprio gate declara `RANDOLF_HUB_CONTEXT_BINDING=PASS` no escopo de source/teste do pacote. Isso não prova serviço remoto vivo.

## 3. Launcher do handoff foi ligado e testado no pacote

```text
CLAIM=LAUNCHER_HANDOFF_BINDING_EXISTS_IN_SOURCE
ESTADO=PROVADO
PROVA_REF=fb124620e5582b36e31c52b79bbfb23afc90af3b
```

O gate exige que `run_zendrive_segredo.ps1` referencie `zendrive_gateway_bridge.py` e declara `LAUNCHER_HANDOFF_BINDING=PASS`.

## 4. BaselineLock perdido foi restaurado

```text
CLAIM=FIXED_POINT_BASELINE_LOCK_RESTORED_IN_MAIN
ESTADO=PROVADO_SOURCE
PROVA_REF=2cfe3a059ba4d66226df8791520ec4a72727704e
```

A existência do commit específico de restauração na linhagem da main fecha a pendência de source correspondente. Runtime continua separado.

## 5. Signal Watcher e PR Mother Pulse foram alinhados ao runner canônico

```text
CLAIM=SIGNAL_WATCHER_CANONICAL_RUNNER_ALIGNMENT_COMMITTED
ESTADO=PROVADO_SOURCE
PROVA_REF=f832c58276a2592606b47947b800603fc7b6c94b

CLAIM=PR_MOTHER_PULSE_CANONICAL_RUNNER_ALIGNMENT_COMMITTED
ESTADO=PROVADO_SOURCE
PROVA_REF=77d324034d148509f1a8f93cb124107ca19feb40
```

Não reabrir "alinhar workflow ao runner canônico" como falta de implementação sem drift novo. Saúde atual do runner/check é claim temporal diferente.

## 6. Central de Notificações foi incorporada ao Hub único no source

```text
CLAIM=CENTRAL_NOTIFICACOES_HUB_CONTRACT_COMMITTED
ESTADO=PROVADO_SOURCE
PROVA_REF=4acabf64a90795fa20d5167626371ab3a4124d5e

CLAIM=CENTRAL_NOTIFICACOES_GATE_SAME_HEAD_COMMITTED
ESTADO=PROVADO_SOURCE
PROVA_REF=41e8c658c3b6babf87c32ef6bc7b306d9972f3a6
```

Isso fecha a falta de contrato/gate no source; entrega real de notificação permanece dependente de medição do runtime aplicável.

## 7. Voz, sessão SOL e perfil foram ligados ao funil/Hub no source

```text
CLAIM=VOICE_SESSION_SOL_FUNNEL_SOURCE_BINDING_COMMITTED
ESTADO=PROVADO_SOURCE
PROVA_REF=f050f3e92e3f5c0d61604ecb981748062b691f09

CLAIM=RANDOLF_SOL_SESSION_NOTIFICATION_BINDING_COMMITTED
ESTADO=PROVADO_SOURCE
PROVA_REF=6776ee5861cf6feb693a21d3f7fbda1ffce2386d

CLAIM=HUB_VOICE_SOL_SESSION_NOTIFICATION_INTEGRATION_COMMITTED
ESTADO=PROVADO_SOURCE
PROVA_REF=cc00f1abef86a0c5fd2c657540fbc1a55f6f3305
```

A cadeia de commits fecha a ausência de integração no source. Voz funcionando no ambiente real continua claim de runtime.

## 8. Omni Router teve medição HEALTHY registrada

```text
CLAIM=OMNI_ROUTER_HEALTH_200_MODELS_200_CHAT_200
ESTADO=HISTORICAL_PROVEN_MEASUREMENT
PROVA_REF=5fee0dd5520182af7a30389837ec36f59e588509
```

O commit registra health 200, models 200 e chat 200, com Nous free + Claude Code. Como saúde é temporal, isso vira prova histórica válida, não garantia eterna do presente.

## 9. Porta única e failover foram incorporados ao source

```text
CLAIM=CENTRALDARK_SINGLE_ROUTER_SITE_DESKTOP_SOURCE=PROVADO
PROVA_REF=6634e2db1760baf8b12ce96d4ff9a296da64a1b0

CLAIM=OMNI_ROUTER_SOL_DESKTOP_SOURCE_BINDING=PROVADO
PROVA_REF=35d117c76fda53274dfafb9e9e9ca11e7630a979

CLAIM=OMNI_ROUTER_HEALTH_BRIDGE_SOURCE=PROVADO
PROVA_REF=4d9a33c4ae4d455c7f1b87468db99b83ad2586cb

CLAIM=ROUTER_FAILOVER_RESPONSES_API_SOURCE=PROVADO
PROVA_REF=94327e01f214758e8f1e5ae20ecf758a3bcb0cca
```

Esses fatos não devem reaparecer como "falta implementar" sem regressão concreta. Operação E2E continua sujeita à medição atual.

## 10. Casa E foi fixada como vault vivo no source

```text
CLAIM=LIVE_VAULT_POINTS_TO_E_CENTRALDARK
ESTADO=PROVADO_SOURCE
PROVA_REF=f0014b0bd63edd4ea888ec2fdd9ae8842f9bae4e
```

Isso cristaliza a decisão de source sobre `E:\CentralDark`; existência/estado físico atual do disco é claim local separado.

# ANTI-PENDÊNCIA

Para cada claim acima:

```text
PENDENCIA_DE_IMPLEMENTACAO_SOURCE=false
REOPEN_SOURCE_ONLY_WITH_NEW_CAUSAL_EVIDENCE=true
RUNTIME_CLAIM_REMAINS_SEPARATE=true
```

# PRÓXIMO CURSOR VERTEX INVERSO

Continuar para trás procurando:

1. receipts anteriores com `PASS` que ainda aparecem como `pending` em documentação viva;
2. commits `test:*`, `fix:*`, `gate:*`, `receipt:*` que fecharam claims mas não foram cristalizados no ledger;
3. PRs antigos cuja capacidade foi absorvida pela main e ainda são tratados como trabalho futuro;
4. provas históricas temporais que precisam ser marcadas `HISTORICAL`, não `UNKNOWN` nem `CURRENT`;
5. duplicações de owners que podem ser reduzidas por `REUSE_BEFORE_CREATE`.

# VEREDITO

```text
VERTEX_INVERSO_ROUND=1
PEPITAS_CRISTALIZADAS=10_GRUPOS
FALSE_RUNTIME_PROMOTIONS=0
SOURCE_CLAIMS_REOPENED_WITHOUT_CAUSE=0
NEXT_CURSOR=CONTINUE_BACKWARD
```
