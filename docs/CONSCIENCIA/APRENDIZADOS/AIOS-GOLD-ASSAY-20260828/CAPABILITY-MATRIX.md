# Capability Matrix — AIOS/AIOX × CentralDark

Esta matriz é uma bancada de reconciliação. `GAP_CANDIDATE` não significa que a CentralDark não possui a capacidade; significa que a comparação ainda exige abertura do owner/consumer real e teste discriminante.

| Matéria observada no pacote | CentralDark relacionada | Estado inicial | Prova exigida do Hermes | Destino se sobreviver |
|---|---|---|---|---|
| reverse dependency impact | House Inventory / grafo / Trigger Fabric | `GAP_CANDIDATE_STRONG` | dado um path real, produzir consumidores transitivos + owner + gate afetado e comparar com capacidades atuais | estender owner existente |
| visual impact tree | projeções/grafo/UI existentes | `EXTEND_CANDIDATE` | provar que acrescenta informação e não outra autoridade | view derivada |
| token extraction | visual-design-method | `EXTEND_CANDIDATE` | extrair tokens de superfície real e comparar com tokens canônicos | visual-design-method |
| W3C DTCG export | visual-design-method | `GAP_CANDIDATE` | procurar exportador DTCG atual; se ausente, fixture round-trip | visual-design-method |
| atomic layer classifier | visual-design-method / componentes existentes | `GAP_CANDIDATE` | classificar componentes reais e validar utilidade sem impor taxonomia externa | owner visual existente |
| design build/quality workflow | visual-design-method + gates existentes | `REUSE_AND_EXTEND` | mapear etapas para gates atuais; zero workflow paralelo | gates/owner visual atuais |
| IDE sync/projection | boot universal / governança de agentes | `GAP_CANDIDATE` | provar ausência de projeção equivalente e gerar view sem nova autoridade | gerador subordinado ao canônico |
| Copilot rules view | boot universal / Copilot como motor | `EXTEND_CANDIDATE` | view deve ser derivada e regenerável do canônico | mesma fonte de verdade |
| precompact session digest | session-intelligence-harvester / memory-linker | `REUSE_OR_EXTEND` | medir schema/consumer atuais e identificar campos realmente ausentes | owner de continuidade existente |
| codebase map | House Inventory | `DUPLICATE_OR_EXTEND` | comparar dados produzidos com inventário atual | House Inventory se delta existir |
| migration/orphan inventory | arqueologia/reconciliação | `GAP_CANDIDATE` | fixture com órfão conhecido + rollback plan; sem executar migração | owner existente a resolver |
| dynamic focus/gate selection | Trigger Fabric / MetaLupa / CI | `EXTEND_CANDIDATE` | mudança conhecida deve selecionar gates materiais sem esconder obrigatório | Trigger Fabric/gates |
| health-check registry | validadores/Trigger Fabric | `DUPLICATE_OR_EXTEND` | inventariar checks existentes e provar ganho de registry único | owner existente |
| semantic conflict detection | writer/merge/reconciliação | `READ_ONLY_CANDIDATE` | detectar conflito sem aplicar merge | percepção/contraprova |
| semantic merge writer | SERIALIZE_MUTATION | `REJECT` | não aplicável | nenhum |
| AIOS orchestrator/governance | CentralDark organism | `REJECT` | não aplicável | nenhum |
| AIOS MCP framework | MCP CentralDark existente | `REJECT` | não aplicável | nenhum |
| Red Team/personas externas | governança CentralDark | `REJECT` | não aplicável | nenhum |

## Ordem de prova recomendada

```text
1 DEPENDENCY_IMPACT
2 DESIGN_PIPELINE_DTCG
3 IDE_COPILOT_PROJECTION
4 SESSION_DIGEST
5 MIGRATION_ORPHAN_INVENTORY
6 DYNAMIC_GATE_SELECTION
7 HEALTH_REGISTRY
```

A ordem prioriza ganho material e possibilidade de prova determinística. Não autoriza implementação em lote.
