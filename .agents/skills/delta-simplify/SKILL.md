---
name: delta-simplify
description: Revisar o delta já produzido para reduzir duplicação, complexidade, desperdício e correção superficial sem mudar a intenção nem substituir auditoria de correctness. Usar quando houver diff/PR/branch pronta para limpeza, quando a pergunta for "dá para fazer menor?", antes de promover mudança relevante, ou quando a mesma intenção está sendo reprocessada sem informação/estado novo. Não usar para caçar bug de correctness; para isso usar auditoria-pr + MetaLupa.
---

# DELTA SIMPLIFY — MENOR DELTA QUE PRESERVA A INTENÇÃO

> Adaptação CentralDark inspirada nos padrões públicos de `fcakyon/claude-codex-settings` (Apache-2.0), especialmente a skill `simplify`. O texto e o fluxo abaixo foram reescritos para o contrato da Casa; não importa plugin, hook, marketplace ou autoridade externa.

## Papel

Esta skill revisa **qualidade estrutural do delta**, não correctness.

```text
CORRECTNESS / FALSO VERDE / PROVA
→ .agents/skills/auditoria-pr/SKILL.md
→ .agents/skills/meta-lupa/SKILL.md

QUALIDADE DO DELTA
→ delta-simplify
```

Ela nunca vira segundo Writer no mesmo escopo. Se outro Writer estiver ativo:

```text
DELTA_SIMPLIFY_ROLE=DELTA_PARTNER+READ_ONLY
```

Só aplica correções se o agente for o Writer daquele escopo ou houver handoff explícito.

## Princípios

```text
REUSE_BEFORE_CREATE=true
DELETE_OR_REPLACE_BEFORE_ADD=true
SMALLEST_CAUSAL_DELTA=true
INTENT_MUST_NOT_CHANGE=true
NO_V2_V3=true
NO_PARALLEL_ARCHITECTURE=true
NO_BEHAVIOR_CHANGE_BY_CLEANUP=true
```

A pergunta central é:

> **Qual parte deste delta pode desaparecer sem perder o comportamento autorizado?**

## Regra global — repetição sem delta vira ação, não nova cognição

A Casa já classifica `NO_NEW_INFORMATION=NO_CHANGE`. Esta skill projeta isso para execução: se a intenção, a autorização e o estado material continuam iguais, repetir a mesma explicação, auditoria ou planejamento não produz informação.

```text
MESMA_INTENCAO
+ MESMA_AUTORIZACAO
+ NENHUMA_INFORMACAO_NOVA
+ NENHUMA_MUDANCA_DE_ESTADO_MATERIAL
= NAO_REPROCESSAR
→ EXECUTAR_PROXIMO_PASSO_MATERIAL_JA_DERIVADO
→ MEDIR_RESULTADO
→ RACIOCINAR_DE_NOVO_SOMENTE_SE_ESTADO|EVIDENCIA|RISCO|AUTORIDADE_MUDAR
```

Forma comprimida:

```text
REPETICAO != INFORMACAO_NOVA
→ NAO_GASTAR_COGNICAO
→ AGIR
→ MEDIR
```

Isto não autoriza ação nova e não pula gate. Só elimina toil cognitivo dentro de uma intenção já autorizada.

```text
NO_REPROCESS_WITHOUT_DELTA=true
ACTION_REQUIRES_EXISTING_AUTHORITY=true
MEASURE_AFTER_ACTION=true
STATE_CHANGE_REOPENS_REASONING=true
UNKNOWN_MATERIAL_REOPENS_REASONING=true
NEW_RISK_REOPENS_REASONING=true
```

Exceção: uma checagem final exigida por contrato continua sendo executada mesmo que a hipótese não tenha mudado; ela é **prova**, não reprocessamento da mesma crença.

## Regra global — verde + delta fechado promove; não continua pensando

Quando o mesmo `HEAD` já tem a validação aplicável concluída, não existe conflito material, a intenção já está autorizada e o delta está fechado, a ação útil restante é **promover pelo fluxo canônico e verificar a `main`**. Não abrir nova rodada de melhoria cosmética no mesmo branch só porque ainda há capacidade disponível.

```text
GREEN_APPLICABLE_CHECKS_ON_SAME_HEAD
+ NO_MATERIAL_CONFLICT
+ INTENT_AUTHORIZED
+ DELTA_CLOSED
= FREEZE_HEAD
→ CANONICAL_PROMOTION
→ VERIFY_MAIN
→ STOP_UNTIL_NEW_DELTA
```

Forma curta da Casa:

```text
VERDE + DELTA_FECHADO = PROMOVER, NAO_CONTINUAR_PENSANDO
```

A prova pertence ao `HEAD` que ela observou. Mudança material de `HEAD` invalida a prova presa ao SHA antigo e reabre somente a fronteira afetada. Sem `HEAD` novo, evidência nova, risco novo, conflito novo ou mudança de autoridade, não reexecutar a mesma bateria só para produzir outro recibo equivalente.

```text
HEAD_CHANGE_INVALIDATES_HEAD_BOUND_PROOF=true
NO_HEAD_CHANGE + NO_NEW_EVIDENCE + NO_NEW_RISK + NO_NEW_CONFLICT + SAME_AUTHORITY
= NO_PROOF_REPLAY_WITHOUT_CAUSE
```

Para evitar toil de promoção:

```text
HEAD_GREEN_AND_CLOSED → FREEZE_HEAD=true
NICE_TO_HAVE_AFTER_GREEN → NEXT_DELTA|DROP
DRAFT_IS_NOT_DEPENDENCY_SEMAPHORE=true
NO_DRAFT_READY_TOGGLE_WITHOUT_STATE_CAUSE=true
EXPIRED_OR_STALE_RECEIPT_WITH_SAME_HEAD != NEW_REASONING
SAME_HEAD_RECEIPT_REFRESH → REFRESH_MINIMUM_APPLICABLE_PROOF_ONLY
CANONICAL_PROMOTION_ONLY=true
```

`Draft` humano real continua sendo estado humano e não deve ser removido automaticamente sem o contrato específico aplicável. Esta regra só proíbe usar `Draft/Ready` como semáforo improvisado de dependência quando a Casa já possui promoção canônica e estado de máquina para isso.

Essa regra também vale para lotes de PRs independentes:

```text
PARALLELIZE_INDEPENDENT_SCOPES
→ ONE_WRITER_PER_SCOPE
→ EACH_HEAD_PROVES_ITS_DELTA
→ FREEZE_EACH_CLOSED_GREEN_HEAD
→ SERIALIZE_CANONICAL_PROMOTION
→ VERIFY_MAIN_AFTER_PROMOTION
```

O lote não autoriza merge cego: dependência real, conflito, segredo, `UNKNOWN` material ou mudança de escopo continuam bloqueando fail-closed.

## Fase 0 — Fixar o delta

Antes de opinar, medir o alvo exato:

```text
BASE_SHA=
HEAD_SHA=
PR/BRANCH=
FILES_CHANGED=
WRITER=
```

Revisar somente o que mudou no intervalo aplicável. Estado remoto atual vence print, memória e diff antigo.

Se o HEAD mudar durante a revisão:

```text
NAO_RECOMEÇAR_TUDO
→ recalcular somente a fronteira afetada
→ abandonar finding que morreu
```

Se o HEAD **não** mudou e nenhuma evidência nova entrou:

```text
NAO_REPETIR_AUDITORIA_INTEIRA
→ reutilizar achados ainda válidos
→ executar o próximo passo material pendente
→ medir
```

## Fase 1 — Quatro lentes obrigatórias

Cada lente pode ser executada em paralelo por leitores independentes quando isso reduzir latência, mas a saída é consolidada por mecanismo, não por quantidade de agentes.

### 1. REUSO

Perguntar:

```text
O delta reimplementa capacidade que já existe?
Existe helper, contrato, gate, função, skill ou fluxo com a mesma responsabilidade?
A nova abstração tem consumidor real além do próprio delta?
```

Finding válido deve apontar o componente existente a reutilizar.

### 2. SIMPLIFICAÇÃO

Procurar:

```text
estado derivável armazenado de novo
ramificação desnecessária
cópia quase igual
fallback que mascara causa
wrapper sem responsabilidade própria
arquivo/rota/regra criada só para contornar encaixe existente
código morto deixado depois da correção
```

Preferir remover ou mover a responsabilidade para o dono causal em vez de empilhar condição defensiva.

### 3. EFICIÊNCIA

Procurar desperdício introduzido pelo delta:

```text
I/O repetido
mesma busca/processamento executado várias vezes
operações independentes feitas serialmente sem motivo
trabalho pesado em bootstrap/hot path que pode ser adiado
objeto durável retendo contexto maior que o necessário
loop/recheck sem ganho de informação
repetição de conversa/planejamento quando o próximo passo material já está determinado
```

Regra CentralDark:

```text
SAME_ERROR + NO_NEW_INFORMATION + NO_BELIEF_DELTA = WASTE
SAME_INTENT + SAME_STATE + NEXT_STEP_KNOWN = ACT_THEN_MEASURE
```

### 4. ALTITUDE / CAUSA

Perguntar se a correção está no nível causal correto:

```text
O delta corrige a causa ou só o sintoma?
Há exceção local tentando compensar regra quebrada mais abaixo?
A mesma falha reapareceria por outra entrada?
O componente que ganhou a regra é realmente o dono da responsabilidade?
```

Correção superficial recorrente é finding material mesmo quando o caso atual passa.

## Fase 2 — Falsificar os findings

Antes de sugerir mudança, tentar matar cada finding:

```text
FINDING
→ abrir componente existente
→ provar consumidor/comportamento
→ comparar base vs head quando aplicável
→ procurar motivo real para a complexidade
→ manter finding somente se o custo material sobreviver
```

Não remover complexidade que representa requisito, segurança, compatibilidade ou rollback comprovadamente necessário.

## Fase 3 — Aplicar somente o delta líquido útil

Se o agente for Writer do escopo:

```text
DEDUPLICAR_FINDINGS
→ ordenar por maior redução de complexidade com menor risco
→ corrigir mínimo
→ testar comportamento preservado
→ remedir diff
```

Se não for Writer:

```text
NAO_EDITAR
→ ARQUIVO
→ LOCAL
→ CUSTO
→ MECANISMO_DUPLICADO/COMPLEXO
→ FORMA_MENOR
→ TESTE_QUE_PROVA_COMPORTAMENTO_PRESERVADO
```

## Gate negativo

A limpeza falha se qualquer uma destas condições surgir:

```text
MUDOU_INTENCAO=true
REMOVEU_GUARDRAIL_NECESSARIO=true
CRIOU_NOVO_COMPONENTE_SEM_GAP=true
TROCOU_CORRECTNESS_POR_ELEGANCIA=true
QUEBROU_ROLLBACK=true
WRITER_COLLISION=true
```

## Relação com MetaLupa

Delta Simplify produz candidato de melhoria. MetaLupa decide se existe aprendizado reutilizável.

```text
LIMPEZA_LOCAL_BEM_SUCEDIDA != NOVA_LEI
```

Só promover regra/skill/guardrail quando houver evidência de classe recorrente e ganho informacional real.

## Saída

```text
BASE_SHA=
HEAD_SHA=
WRITER=
ROLE=WRITER|DELTA_PARTNER_READ_ONLY

REUSE_FINDINGS=
SIMPLIFICATION_FINDINGS=
EFFICIENCY_FINDINGS=
ALTITUDE_FINDINGS=
FALSE_POSITIVES_DROPPED=
FIXES_APPLIED=
FIXES_SUGGESTED=
BEHAVIOR_CHANGED=NAO
WRITER_COLLISION=NAO
POINT_FIXED=SIM|NAO
```

## Regra curta

```text
MEDE O DELTA
→ PROCURA O QUE JÁ EXISTE
→ TENTA APAGAR COMPLEXIDADE
→ CORTA DESPERDÍCIO
→ SE NADA NOVO ENTROU, AGE EM VEZ DE REPENSAR
→ SE VERDE + DELTA FECHADO, CONGELA O HEAD E PROMOVE
→ MEDE O RESULTADO
→ SOBE A CORREÇÃO PARA A CAUSA CERTA
→ TENTA DERRUBAR OS PRÓPRIOS FINDINGS
→ MUDA SÓ O QUE SOBREVIVE
→ PROVA QUE A INTENÇÃO CONTINUA IGUAL
```
