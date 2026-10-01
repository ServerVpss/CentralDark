---
title: "2026 08 16 Verde Delta Fechado Promove"
date: 2026-08-27
tags: ["consciencia"]
updated: 2026-08-27
---

# Aprendizado — verde + delta fechado = promover

Data: 2026-08-16
Origem: incidente observado na sequência de promoção dos PRs #983, #985 e #982.
Autoridade de intenção: SEGREDO/CHEFE.
Owner operacional relacionado: `scripts/github-autonomia-promocao.mjs`.
Owner cognitivo relacionado: `.agents/skills/delta-simplify/SKILL.md`.

## Problema observado

A promoção ficou materialmente mais lenta sem haver uma sequência equivalente de erros técnicos. O padrão dominante foi reprocessamento e reinício de prova:

```text
PR VERDE
→ pequena mudança adicional
→ HEAD novo
→ prova do HEAD anterior perde validade
→ workflows anteriores cancelam/reiniciam
→ fila de runner
→ receipt envelhece
→ novo ciclo
```

Também houve uso de `Draft` como semáforo temporário de ordenação. Isso vazou um botão humano para a cabine mesmo quando a intenção já estava autorizada e a máquina podia decidir a continuação pelo estado.

## Causa composta

```text
HEAD_MUDANDO_DEPOIS_DO_VERDE
+ DRAFT_USADO_COMO_SEMAFORO
+ RECEIPT_TTL_MENOR_QUE_A_JANELA_REAL_DE_FILA
= LATENCIA_ARTIFICIAL_DE_PROMOCAO
```

No estado medido durante o incidente, o promotor tinha receipt máximo de 15 minutos enquanto a janela padrão de espera era 45 minutos. Essa combinação permite `RECEIPT_EXPIRED` por espera legítima de runner antes do próprio timeout operacional.

## Cristal

```text
VERDE + DELTA_FECHADO + AUTORIZACAO_VIGENTE + SEM_CONFLITO
→ CONGELAR_HEAD
→ NAO_ADICIONAR_MELHORIA_LATERAL
→ NAO_REPROCESSAR_SEM_DELTA
→ PROMOVER_PELO_CAMINHO_CANONICO
→ MEDIR_MAIN
→ ENCERRAR
```

Forma curta:

```text
VERDE + DELTA FECHADO = PROMOVER, NAO CONTINUAR PENSANDO
```

## Invariantes

```text
HEAD_CHANGE_INVALIDATES_HEAD_BOUND_PROOF=true
NO_HEAD_CHANGE_AND_NO_NEW_EVIDENCE_DO_NOT_RESTART_FULL_PROOF=true
GREEN_CLOSED_DELTA_PREFERS_PROMOTION_OVER_LATERAL_IMPROVEMENT=true
DRAFT_IS_NOT_DEPENDENCY_SEMAPHORE=true
HUMAN_REASK_AFTER_VALID_AUTHORIZATION=false
QUEUE_DELAY_IS_NOT_NEW_INFORMATION=true
RECEIPT_TTL_MUST_NOT_BE_SHORTER_THAN_NORMAL_PROMOTION_WAIT_WINDOW=true
```

A regra `QUEUE_DELAY_IS_NOT_NEW_INFORMATION` não transforma `PENDING` em `PASS`. Ela apenas impede reiniciar raciocínio ou alterar o HEAD porque a fila demorou. O gate continua decidindo PASS/FAIL no mesmo HEAD.

## Regra de execução

Quando um PR já chegou a estado materialmente pronto:

```text
SAME_HEAD
+ SAME_INTENT
+ SAME_AUTHORITY
+ SAME_REQUIRED_GATES_GREEN
+ NO_NEW_RISK
+ NO_CONFLICT
→ NEXT_MATERIAL_STEP=PROMOTE
```

Se aparecer melhoria que não é necessária para a intenção atual:

```text
LATERAL_IMPROVEMENT_AFTER_GREEN
→ NAO_MUTAR_HEAD_ATUAL
→ registrar apenas se houver delta reutilizável real
→ tratar em outro ciclo somente quando necessário
```

Se o HEAD mudar por necessidade causal real, a prova presa ao HEAD deve ser refeita somente para a fronteira afetada. Não reutilizar verde de SHA antigo.

## Draft

```text
DRAFT_HUMANO_REAL → respeitar
DEPENDENCIA_ENTRE_PRS → representar por dependência/estado de máquina
DRAFT_COMO_TRAVA_TEMPORARIA → anti-padrão
```

Draft não deve ser usado para obrigar o humano a apertar `Ready for review` quando a máquina já possui autorização e estado suficiente para continuar.

## Extensão provada — branch não é estacionamento de intenção (2026-10-01)

Uma remedição viva encontrou 723 branches remotas no repositório e apenas 4 PRs abertos naquele instante. O inventário histórico já registrava várias branches `SEM PR CONHECIDO`, inclusive nomes de teste/placeholder como `stop-accidental-branches`, `tmp-noop*` e `tmp-placeholder-*`. O número é snapshot temporal, não denominador eterno; o padrão causal é o que fica.

Esse estado confirma a mesma classe de latência já observada com Draft: criar um contêiner Git sem um caminho de fechamento pode retirar o delta do funil ativo sem retirar a intenção humana.

```text
INTENCAO_AUTORIZADA
+ NEW_BRANCH_COMO_REFLEXO
+ SEM_PR_ATIVO_OU_LIFECYCLE_EXPLICITO
= RISCO_DE_DELTA_ESTACIONADO
```

Regra absorvida no owner operacional existente:

```text
NEW_PR_DEFAULT=false
NEW_REMOTE_BRANCH_DEFAULT=false
BRANCH_IS_TRANSPORT_NOT_INTENT=true
NO_BRANCH_PARKING_LOT=true
FIND_MATCHING_CHILD_BEFORE_NEW_BRANCH=true
DIRECT_MAIN_WHEN_ALREADY_AUTHORIZED_AND_APPLICABLE=true
REMOTE_BRANCH_ONLY_WHEN=DIRECT_MAIN_NOT_APPLICABLE|PR_REQUIRED|REMOTE_CI_REQUIRED|CROSS_AGENT_HANDOFF_REQUIRED|ISOLATION_REQUIRED
EPHEMERAL_BRANCH_OPEN_READY_PR_SAME_TURN=true
EPHEMERAL_BRANCH_DELETE_AFTER_MERGE=true
PERSISTENT_BRANCH_REQUIRES_EXPLICIT_OWNER_AND_PURPOSE=true
```

Isso não autoriza apagar branches históricas em massa. Branch antiga pode conter delta único; antes de excluir, o owner `.github/workflows/varredura-branches-orfas.yml` deve comparar conteúdo contra `main` e a branch só pode virar `SAFE_TO_REMOVE` quando a contraprova demonstrar ausência de ouro não convergido.

Draft e branch seguem a mesma disciplina: **estado intermediário só existe quando carrega causa material e próximo estado determinístico**. Caso contrário, a máquina continua a intenção pelo caminho já autorizado em vez de estacioná-la.
## Receipt / fila

Receipt continua preso a integridade, repositório e estado validado. A janela temporal deve ser coerente com a latência operacional normal:

```text
RECEIPT_MAX_AGE >= NORMAL_PROMOTION_WAIT_WINDOW
```

Além disso, o promotor deve continuar fazendo revalidação viva de PR/HEAD/base antes do squash; TTL maior nunca autoriza merge de estado mudado.

## Contraprovas obrigatórias

A regra NÃO permite:

- chamar `PENDING`, `QUEUED`, `SKIPPED`, `CANCELLED` ou `UNKNOWN` de PASS;
- reutilizar gates de HEAD diferente;
- ignorar conflito de merge;
- ignorar mudança de autorização/escopo;
- fazer merge direto fora do promotor canônico quando o contrato exigir o promotor;
- congelar HEAD quando existe correção causal obrigatória ainda não aplicada.

## Resultado desejado

Para o humano:

```text
AUTORIZA/EMPURRA
→ CASA PROVA
→ VERDE
→ CASA SQUASHA
→ CASA CONFERE MAIN
```

Sem pedir clique adicional, sem reiniciar CI por melhoria lateral e sem gastar cognição porque a fila apenas demorou.

## Relação com regras existentes

Este aprendizado não cria segunda lei. Ele especializa para promoção o que `delta-simplify` já determina:

```text
NO_REPROCESS_WITHOUT_DELTA=true
SAME_INTENT + SAME_STATE + NEXT_STEP_KNOWN = ACT_THEN_MEASURE
```

Implementação futura/ajuste no promotor deve reutilizar o mesmo owner e preservar `ONE_WRITER_PER_SCOPE`, `ZERO_FORCE_PUSH`, `UNKNOWN_IS_NOT_PASS` e squash canônico.

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
