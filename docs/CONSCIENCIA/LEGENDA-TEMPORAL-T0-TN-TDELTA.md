---
title: "Padrão de legenda operacional — T0, TΔ, T1...Tn"
status: "CANDIDATO_CANONICO"
date: 2026-08-27
authority: "SEGREDO/CHEFE"
scope: "Padronizar como símbolos, estados e índices operacionais são explicados visualmente, sem renomear termos pelo executor"
owner: "docs/CONSCIENCIA/MULTIBUSSOLA.md"
rename_authority: "SEGREDO/CHEFE"
---

# Padrão de legenda operacional — T0, TΔ, T1...Tn

Este documento propõe um **padrão oficial de explicação visual/semântica** para termos operacionais da CentralDark.

Ele **não renomeia** termos em nome do SEGREDO/CHEFE. O padrão define **como explicar** um nome; a escolha do nome continua humana.

```text
PADRAO_EXPLICA=true
PADRAO_RENOMEIA=false
NOME_FINAL_PERTENCE_AO_SEGREDO_CHEFE=true
ONE_SYSTEM_ONLY=true
REUSE_BEFORE_CREATE=true
```

## 1. Regra oficial de legenda

Todo símbolo, sigla, índice, estado, gate ou marcador operacional que possa causar ambiguidade deve, quando material, declarar pelo menos:

```text
IDENTIFICADOR
→ SIGNIFICADO
→ TIPO
→ QUANDO_ENTRA
→ QUANDO_SAI
→ O_QUE_NAO_SIGNIFICA
→ EXEMPLO_MINIMO
→ OWNER/ESCOPO
```

Quando o termo participa de prova ou decisão, acrescentar:

```text
PROVA_EXIGIDA
FRONTEIRA_DE_AUTORIDADE
ESTADO_UNKNOWN
```

Forma curta recomendada para visualização humana e leitura por IA:

| Campo | Pergunta que responde |
| --- | --- |
| `IDENTIFICADOR` | Como chamamos isso agora? |
| `SIGNIFICADO` | O que isso quer dizer? |
| `TIPO` | É tempo, estado, severidade, papel, gate, evento...? |
| `QUANDO_ENTRA` | Quando esse marcador passa a valer? |
| `QUANDO_SAI` | Quando deixa de valer ou avança? |
| `NAO_SIGNIFICA` | Com o que não pode ser confundido? |
| `EXEMPLO` | Como aparece numa sequência real? |
| `OWNER/ESCOPO` | Quem governa a semântica e onde ela vale? |

## 2. Regra visual

Para facilitar manutenção e leitura rápida:

```text
SIMBOLO = SIGNIFICADO
A → B   = sequência/propagação
A ↔ B   = comparação/round-trip
Δ       = mudança entre estados
UNKNOWN = ausência de prova suficiente, nunca PASS
```

Cores, emojis, Mermaid e estilos podem ajudar a leitura, mas **não alteram autoridade nem veredito**.

```text
VISUAL != AUTHORITY
COLOR != VERDICT
MERMAID != RUNTIME_PROOF
LABEL != REALITY
REALITY_IS_JUDGE=true
```

## 3. Regra-base temporal

```text
T = instante/rodada de observação
n = índice temporal da observação
Δ = mudança/delta entre estados observados
```

Os índices temporais **não representam gravidade, prioridade, qualidade, cargo ou versão**.

## 4. T0

```text
T0 = estado vivo inicial observado
```

É a primeira fotografia operacional confiável do alvo no ciclo atual.

Pergunta humana equivalente:

> Como isso está quando eu começo a medir?

```text
TIPO=TEMPO/OBSERVACAO
QUANDO_ENTRA=inicio_da_linha_temporal
NAO_SIGNIFICA=prioridade_zero|severidade_zero|versao_zero
```

## 5. TΔ

```text
TΔ = eventos, mudanças e deltas ocorridos entre estados observados
```

`TΔ` não significa obrigatoriamente uma nova rodada numerada. Ele descreve **o que mudou** entre duas observações relevantes.

```text
T0 → TΔ → T1
T1 → TΔ → T2
T2 → TΔ → T3
```

Pergunta humana equivalente:

> O que mudou desde a última medição?

```text
TIPO=DELTA/EVENTO
QUANDO_ENTRA=quando_ha_mudanca_material
NAO_SIGNIFICA=passo_numerado_obrigatorio
```

## 6. T1

```text
T1 = primeira remedição após T0
```

No ciclo mínimo da Multibússola, `T0 → TΔ → T1`, T1 é o estado final remedido daquele ciclo.

Se a investigação for reaberta porque o mundo mudou de novo, a linha pode continuar em `T2`, `T3` etc. Assim, **"final" significa final da medição naquele momento, não estado eterno**.

Pergunta humana equivalente:

> Mudou alguma coisa? Mede de novo.

```text
TIPO=TEMPO/REMEDICAO
QUANDO_ENTRA=primeira_reobservacao_pos_T0
NAO_SIGNIFICA=melhoria_garantida|PASS
```

## 7. T2

```text
T2 = segunda remedição sequencial da mesma linha temporal
```

É usada quando o alvo muda novamente ou quando nova evidência material exige reabertura depois de T1.

```text
TIPO=TEMPO/REMEDICAO
QUANDO_ENTRA=nova_mudanca_material_apos_T1
NAO_SIGNIFICA=gravidade_nivel_2|qualidade_2
```

## 8. T3, T4, T5...

A numeração pode continuar enquanto houver necessidade real de remedição:

```text
T0 → T1 → T2 → T3 → T4 → T5 → ... → Tn
```

Não existe limite conceitual fixo em `T3`.

## 9. Tn

```text
Tn = qualquer observação temporal de índice n
```

É a forma genérica de dizer "alguma remedição posterior" sem impor um número máximo.

O maior `Tn` observado é apenas **a medição mais recente daquela linha**, não sinônimo automático de conclusão ou sucesso.

```text
TIPO=INDICE_TEMPORAL_GENERICO
NAO_SIGNIFICA=limite_maximo|PASS|maturidade
```

## 10. Quando a sequência para?

A linha pode parar quando o escopo chega a um veredito estável o suficiente para fechamento:

```text
nenhuma informação material nova
+ claims materiais reconciliados
+ contraprova sobrevivida
+ veredito estável da realidade
→ encerrar a linha temporal daquele ciclo
```

Isso não transforma o último `Tn` em sucesso automaticamente.

```text
ULTIMO_T != PASS
FIXED_POINT != PASS
UNKNOWN != PASS
```

Se o mundo mudar depois, a investigação pode ser reaberta e o alvo deve ser remedido novamente segundo o contrato vigente.

## 11. Relação com a Multibússola canônica

A Multibússola define a forma mínima:

```text
T0 = estado vivo inicial
TΔ = eventos/deltas durante a investigação
T1 = estado vivo final remedido
```

A legenda estende a visualização sem alterar o motor:

```text
T0 = observação inicial
T1 = primeira remedição
T2 = segunda remedição, se a linha reabrir
T3 = terceira remedição, se necessário
...
Tn = enésima observação/remedição
TΔ = delta material entre observações
```

```text
NEW_ENGINE=false
NEW_AGENT=false
NEW_AUTHORITY=false
SEMANTIC_LEGEND_ONLY=true
```

## 12. Tabela curta para futura renomeação

| Símbolo atual | Significado atual | Não significa |
| --- | --- | --- |
| `T0` | estado inicial medido | prioridade zero, severidade, versão |
| `TΔ` | mudança entre estados | etapa obrigatoriamente numerada |
| `T1` | primeira remedição / final do ciclo mínimo | melhoria garantida |
| `T2` | segunda remedição se a linha continuar | piora/gravidade nível 2 |
| `T3...Tn` | remedições seguintes | ranking, qualidade, maturidade |
| `Tn` | índice temporal genérico | limite máximo ou PASS |

## 13. Template oficial para novos nomes operacionais

Antes de cristalizar um novo nome material, preencher:

```yaml
identifier: "NOME_ATUAL"
meaning: "o que significa em linguagem simples"
type: "tempo|estado|gate|papel|evento|prova|outro"
enters_when: "condição de entrada"
exits_when: "condição de saída"
does_not_mean:
  - "confusão comum 1"
  - "confusão comum 2"
minimal_example: "A → B → C"
owner: "owner existente"
scope: "onde vale"
proof_required: "quando aplicável"
authority_boundary: "quem pode mudar significado/nome"
```

Regra:

```text
NAME_WITHOUT_MEANING → AMBIGUOUS
MEANING_WITHOUT_BOUNDARY → DRIFT_RISK
VISUAL_WITHOUT_LEGEND → MAINTENANCE_COST
LEGEND_WITH_OWNER → REUSABLE_OPERATIONAL_LANGUAGE
```

## 14. Fronteira de autoridade

```text
DOCUMENTO_EXPLICA=true
DOCUMENTO_RENOMEIA=false
NOME_FINAL_PERTENCE_AO_SEGREDO_CHEFE=true
SOL_NAO_BATIZA=true
PADRAO_DE_LEGENDA_PODE_SER_REUTILIZADO=true
```

Qualquer renomeação futura deve preservar a semântica vigente ou declarar explicitamente a mudança de significado, escopo e impacto.

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
