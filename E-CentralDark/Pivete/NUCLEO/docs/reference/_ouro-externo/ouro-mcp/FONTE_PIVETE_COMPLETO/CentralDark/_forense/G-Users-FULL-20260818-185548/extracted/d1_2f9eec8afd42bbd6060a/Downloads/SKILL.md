---
name: delta-simplify
description: Revisar o delta já produzido para reduzir duplicação, complexidade, desperdício e correção superficial sem mudar a intenção nem substituir auditoria de correctness. Usar quando houver diff/PR/branch pronta para limpeza, quando a pergunta for "dá para fazer menor?", ou antes de promover mudança relevante. Não usar para caçar bug de correctness; para isso usar auditoria-pr + MetaLupa.
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
```

Regra CentralDark:

```text
SAME_ERROR + NO_NEW_INFORMATION + NO_BELIEF_DELTA = WASTE
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
→ SOBE A CORREÇÃO PARA A CAUSA CERTA
→ TENTA DERRUBAR OS PRÓPRIOS FINDINGS
→ MUDA SÓ O QUE SOBREVIVE
→ PROVA QUE A INTENÇÃO CONTINUA IGUAL
```
