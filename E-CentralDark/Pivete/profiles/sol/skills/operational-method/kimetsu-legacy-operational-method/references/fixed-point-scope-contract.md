# Fixed Point Scope Contract

## Lei Fundamental

```text
MISSION_FIXED_POINT
!=
LEARNING_STOP
```

## Definição

O **Fixed Point** encerra **SOMENTE** o loop ativo da missão/escopo material que atingiu estabilidade comprovada (conforme as 5 condições: objective_closed, counterproof_survived, applicable_invariants_hold, no_material_unknown, no_new_material_failure).

**O Fixed Point NÃO desativa:**
- Captura futura de evidência
- Learning triggers (MATERIAL_INGEST, HUMAN_CORRECTION, TOOL_ERROR, TEST_FAILURE, CONTRADICTION_FOUND, PATTERN_FOUND, MEMORY_DELTA, KNOWLEDGE_CRYSTAL, CRYSTAL_PROMOTED, POST_MUTATION, RUNTIME_DRIFT, SESSION_END)
- Pattern discovery
- Memory delta
- Knowledge compilation
- Metacognição
- Melhoria futura da MetaLupa
- Revalidação quando o estado mudar (NEW_EVENT_OR_STATE_CHANGE → CAN_PRODUCE_NEW_LEARNING)

## Após FIXED_POINT

```text
→ Gerar receipt
→ Colher somente delta novo (HARVEST_NEW_DELTA_ONLY)
→ Registrar candidato de aprendizado (LEARNING_CANDIDATE)
→ Não reabrir a missão sem novo evento/material
→ Próxima execução consome o aprendizado provado
```

## Contrato do MASTER-CYCLE (atual)

O `centraldark_master_cycle.py` e `MASTER-CYCLE.yml` explicitam:

```yaml
self_improvement:
  meta_lupa_final: false
  evolution_mode: EVENT_DRIVEN
  mission_fixed_point_stops_learning_capacity: false
```

E a cadeia arquitetural:

```text
REALITY_JUDGE
→ PROMOTE_OR_REJECT_ROLLBACK
→ MISSION_FIXED_POINT
→ REGISTRO_DO_OURO
→ NEXT_ACORDAR
```

## Contrato da MetaLupa

A MetaLupa declara:

```text
META_LUPA_FINAL = FALSE
EVOLUTION_MODE = EVENT_DRIVEN
MISSION_FIXED_POINT_STOPS_LEARNING_CAPACITY = FALSE
```

E no loop de metacognição:

```text
VER MELHOR
→ CARREGAR MENOS
→ SABER MELHOR
→ AGIR MELHOR
→ APRENDER COM O DELTA
→ VER MELHOR DE NOVO
↺
```

## Gatilhos de Aprendizado (Trigger Fabric)

Os gatilhos que sobrevivem ao Fixed Point:

| Gatilho | Descrição |
|---------|-----------|
| MATERIAL_INGEST | Nova matéria ingerida |
| HUMAN_CORRECTION | Correção humana |
| TOOL_ERROR | Erro de ferramenta |
| TEST_FAILURE | Falha de teste |
| CONTRADICTION_FOUND | Contradição encontrada |
| PATTERN_FOUND | Padrão encontrado |
| MEMORY_DELTA | Delta de memória |
| KNOWLEDGE_CRYSTAL | Cristal de conhecimento |
| CRYSTAL_PROMOTED | Cristal promovido |
| POST_MUTATION | Pós-mutação |
| RUNTIME_DRIFT | Drift de runtime |
| SESSION_END | Fim de sessão |

O `SESSION_END` explicitamente manda:
```text
HARVEST_NEW_DELTA_ONLY
CHECKPOINT
NEXT_CURSOR
```

## Risco de Shorthand Isolado

A lacuna real não é arquitetural — é semântica de compressão:

| Shorthand perigoso | O que realmente significa |
|--------------------|---------------------------|
| `NO_NEW_INFORMATION=STOP` | STOP WASTING COMPUTE ON SAME INPUT (dedup) |
| `FIXED POINT ENCERRA` | Encerra aquela investigação específica |
| `ponto fixo resfria e encerra` | Temperatura evidencial daquela investigação |

**Quando extraído isolado via RAG/retrieval sem contexto, perde:**
- STOP_SCOPE
- PROOF_TARGET
- MISSION_ID
- MATERIAL_SCOPE
- NEXT_CURSOR
- LEARNING_CONTINUES_ON_NEW_DELTA

## Verificação (Self-Test)

```text
ASSERT:
MISSION_FIXED_POINT=true
AND
NEW_LEARNING_EVENT_ACCEPTED=true
```

Se ambos TRUE → Contrato respeitado.