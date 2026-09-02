---
title: "!REMEDIÇÃO — comando oficial da CentralDark"
status: "CANÔNICO"
date: 2026-08-20
authority: "SEGREDO/CHEFE"
scope: "Comando oficial que remede o estado real depois de qualquer ação para fechar o veredito"
owner: "Metacognição operacional + MetaLupa; sem novo cérebro/orquestrador"
---

# !REMEDIÇÃO — comando oficial da CentralDark

`!REMEDIÇÃO` é um gatilho oficial da Casa, no mesmo nível de entrada operacional de `#ACORDAR`, `!CALIBRAR`, `!MULTIBUSSOLA` e `!EXECUÇÃO_REVERSÍVEL`, com função própria:

```text
!EXECUÇÃO_REVERSÍVEL
= antes da ação: garantir rollback

!REMEDIÇÃO
= depois da ação: medir de novo o estado real,
  comparar T0 → T1, só então declarar veredito
```

O comando **não cria outro agente, skill, cérebro, memória, promotor ou orquestrador**. Reutiliza `#ACORDAR`, `!CALIBRAR`, `!MULTIBUSSOLA`, `!EXECUÇÃO_REVERSÍVEL`, MetaLupa, Meta Menos É Mais, owners/prova existentes e o Writer vigente.

## 1. Sintaxe e ativação

```text
!REMEDIÇÃO
!REMEDICAO
!REMEDIÇAO
```

Aceitar sem sensibilidade a maiúsculas/minúsculas nem acentuação.

## 2. Fluxo

```text
AÇÃO EXECUTADA
↓
!REMEDIÇÃO
↓
MEDIR ESTADO REAL AGORA (T1)
↓
COMPARAR COM ESTADO ANTES (T0)
↓
DELTA REAL = T1 - T0
↓
DELTA BATE COM O QUE FOI PROMETIDO?
↓
SE SIM → VEREDITO = PROVADO
SE NÃO → VEREDITO = NÃO PROVADO (nunca "quase" ou "parcial")
```

## 3. Regra

```text
DECLARADO_PRONTO != PROVADO
EXECUTADO != FUNCIONOU
FUNCIONOU_UMA_VEZ != FIXED_POINT
T0_T1_COMPARISON_REQUIRED=true
NO_YELLOW_STATUS=true
SO_VERDE_COM_RECIBO_OU_NAO_PROVADO=true
NEW_ORCHESTRATOR=false
NEW_AGENT=false
NEW_AUTHORITY=false
```

## 4. Retomada do fio antes de continuar

A recuperação do fio continua pertencendo à Porta de Entrada/Trigger Fabric; esta seção apenas amarra a retomada à remedição para impedir reinício cego ou falso contexto.

```text
#ACORDAR !CENTRALDARK
RECUPERA O FIO ATUAL DA CENTRALDARK, RECONCILIA COM O ESTADO VIVO E CONTINUA DO ÚLTIMO CURSOR PROVADO. NÃO RECOMEÇA DO ZERO.
```

A retomada não depende de palavra mágica isolada. Ela usa contexto recuperável da sessão, owners/receipts, âncoras concretas como repo/PR/HEAD e então remede a realidade viva antes de continuar.

```text
SAME_SESSION_CONTEXT=RECOVERY_HINT
TRIGGER_IS_NOT_PROOF=true
REPO_PR_OWNER_ANCHORS_CONTINUITY=true
RECOVERABLE_CONTEXT_SHOULD_NOT_BE_REASKED=true
LAST_PROVEN_CURSOR_IS_RESUME_TARGET=true
LIVE_REMEASURE_OVERRIDES_STALE_CONTEXT=true
DO_NOT_RESTART_FROM_ZERO=true
MISSING_RECOVERABLE_CONTEXT=UNKNOWN
```

Em qualquer superfície/modelo, a ordem mínima é:

```text
CONTEXTO_RECUPERÁVEL
→ #ACORDAR / !CENTRALDARK
→ OWNER + RECEIPT + PR/HEAD QUANDO APLICÁVEL
→ REMEASURE
→ RECONCILIAR DELTA
→ ÚLTIMO CURSOR PROVADO
→ CONTINUAR A MESMA INTENÇÃO
```

## 5. Remedição → !REGISTRA → ledger ativo

Quando T1 produzir **delta material**, a remedição não termina em narrativa. O resultado precisa entrar no ledger do escopo já ativo antes de qualquer decisão sobre outro PR.

```text
T1 MEDIDO
→ CLASSIFICAR DELTA
→ SE DELTA MATERIAL: !REGISTRA
→ REUSAR PR ATIVO DO MESMO ESCOPO
→ COMMITAR DELTA COALESCIDO / DEDUPLICADO
→ TESTE + CONTRAPROVA + CI DO MESMO HEAD
→ FIXED POINT
→ MERGE
→ MAIN CANÔNICA
```

```text
REGISTRA_REQUIRED_FOR_MATERIAL_DELTA=true
REGISTRA_REQUIRED_FOR_ALL_CENTRALDARK_AGENTS_AND_SURFACES=true
NO_MATERIAL_DELTA_NO_COMMIT_REQUIRED=true
COMMIT_PER_MESSAGE=false
SAME_SCOPE_ACTIVE_PR_REUSED=true
ONE_ACTIVE_PROMOTION_PR_PER_SCOPE=true
MANY_COMMITS_PER_ACTIVE_PR_ALLOWED=true
NEW_PR_PER_CHAT=false
NEW_PR_PER_COMMIT=false
NEW_PR_ONLY_AFTER_PREVIOUS_SCOPE_PR_CLOSED_OR_MERGED=true
NEW_PR_REQUIRES_REAL_MATERIAL_DELTA=true
NEXT_PR_STARTS_FROM_CURRENT_MAIN=true
DIRECT_MAIN_WRITE=false
```

`!REGISTRA` grava fato reconstruível — intenção, escopo, owner, HEAD/estado, delta, evidência, contraprova, status e próximo cursor. Não grava raciocínio privado nem segredos.

Bug material detectado pode iniciar o próximo ciclo apenas depois que o PR anterior do mesmo escopo terminar e `owner + scope + evidence` estiverem provados. Feature nova não nasce autonomamente sem intenção do SEGREDO/CHEFE.

ADMINISTRABLE_COMMAND=!REMEDIÇÃO

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
