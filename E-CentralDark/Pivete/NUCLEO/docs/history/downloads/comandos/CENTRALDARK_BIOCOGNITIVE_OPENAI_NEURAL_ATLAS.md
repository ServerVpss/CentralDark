# CENTRALDARK — BIO-COGNITIVE + OPENAI NEURAL ATLAS

## Estado desta revisão

Esta é a **mesma família canônica**, reconciliada contra a sessão inteira recuperável.

`REUSE_CANONICAL_FIRST → SESSION_ANIMAL_INVENTORY → TAXONOMY_DEDUPE → CAPABILITY_MATRIX → ZERO_REGRESSION → ONE_FINAL_ZIP`

## Correção material

A revisão anterior condensava o material em 12 macrofamílias. Isso preservava a taxonomia ampla, mas perdia três deltas explícitos:

1. `MACACO` como representante/metáfora de reconhecimento de padrões.
2. `CORVO` como representante explicitamente nomeado de corvídeos para planejamento.
3. `PREDADOR` e `PRESA` como papéis distintos: antecipação vs detecção de ameaça.

Resultado atual: **15 entidades/grupos explícitos**, organizados sem duplicar owners taxonômicos.

## Inventário reconciliado

| # | Entidade | Relação | Capacidades principais |
|---:|---|---|---|
| 1 | Formigas | macrogrupo / Insetos sociais | DISTRIBUTED_CONTROL, COOPERATION, EXPLORATION |
| 2 | Abelhas | macrogrupo / Insetos sociais | COMMUNICATION, EXPLORATION, NAVIGATION |
| 3 | Polvos | macrogrupo / Cefalópodes | DISTRIBUTED_CONTROL |
| 4 | Corvídeos | macrogrupo / Aves | MEMORY, PLANNING, TOOL_USE |
| 5 | Corvo | representante_explicito / Corvídeos | PLANNING |
| 6 | Papagaios | macrogrupo+metafora / Aves | COMMUNICATION |
| 7 | Elefantes | macrogrupo+metafora / Mamíferos | MEMORY |
| 8 | Cetáceos | macrogrupo / Mamíferos marinhos | COOPERATION, COMMUNICATION |
| 9 | Primatas | macrogrupo / Mamíferos | SOCIAL_LEARNING, CAUSAL_REASONING |
| 10 | Macaco | representante_explicito+metafora / Primatas | PATTERN_RECOGNITION, SOCIAL_LEARNING |
| 11 | Roedores | macrogrupo / Mamíferos | NAVIGATION, EXPLORATION |
| 12 | Peixes | macrogrupo / Vertebrados | NAVIGATION, SOCIAL_LEARNING, ENERGY_EFFICIENCY |
| 13 | Invertebrados | macrogrupo / Diversos | ENERGY_EFFICIENCY |
| 14 | Predador | papel_ecologico_explicito / Dinâmica predador–presa | ADVERSARIAL_ADAPTATION, PLANNING |
| 15 | Presa | papel_ecologico_explicito / Dinâmica predador–presa | ADVERSARIAL_ADAPTATION, PERCEPTION |

## Camada CentralDark — tríade cognitiva

```text
PAPAGAIO → LINGUAGEM REPRODUZÍVEL
MACACO   → RECONHECIMENTO DE PADRÕES
ELEFANTE → CONTINUIDADE / MEMÓRIA

CAMADA SUPERIOR:
CAUSALIDADE → CONTRAPROVA → REALIDADE → ADAPTAÇÃO → APRENDIZADO
```

Essa tríade é **metáfora operacional da sessão**, não taxonomia científica e não blueprint neural.

## OpenAI — separação obrigatória

O Atlas mantém a distinção já existente:

- GPT-4: `Transformer-style` no relatório público.
- gpt-oss: Transformer autoregressivo + MoE + mecanismos de atenção publicados.
- Whisper: encoder-decoder Transformer.
- CLIP: encoders visual/textual com objetivo contrastivo.
- Agents SDK: arquitetura de agente/sistema, não arquitetura neural.

`BIOLOGICAL_INSPIRATION != OPENAI_BLUEPRINT`
`AGENT_ARCHITECTURE != NEURAL_ARCHITECTURE`

A revisão animal desta entrega **não remede novamente o estado público da OpenAI**; preserva o último estado documentado no pacote e não transforma isso em prova nova.

## Capability Matrix

A matriz completa está em `CAPABILITY_MATRIX.csv`. O universo canônico de capacidades contém 15 eixos:

- `PERCEPTION`
- `MEMORY`
- `NAVIGATION`
- `SOCIAL_LEARNING`
- `COOPERATION`
- `DISTRIBUTED_CONTROL`
- `EXPLORATION`
- `PLANNING`
- `CAUSAL_REASONING`
- `TOOL_USE`
- `COMMUNICATION`
- `ADVERSARIAL_ADAPTATION`
- `ERROR_CORRECTION`
- `ENERGY_EFFICIENCY`
- `PATTERN_RECOGNITION`

## Zero Regression

Gate desta revisão:

- 12 macrofamílias anteriores preservadas.
- Macaco presente.
- Corvo presente.
- Predador presente.
- Presa presente.
- Papagaio mantém camada científica + metáfora.
- Elefante mantém camada científica + metáfora.
- Nenhum novo animal sem evidência textual recuperada é promovido a canônico.
- Dedupe não apaga representantes.
- Histórico anterior isolado em `SUPERSEDED/`.

`SESSION_COVERAGE = 15/15`
`ZERO_REGRESSION_FOR_RECOVERED_SESSION_INVENTORY = PASS`

## Invariantes

`REALITY = JUDGE`  
`UNKNOWN != PASS`  
`HISTORY != CURRENT_STATE`  
`ANALOGY != FACT`  
`BIOLOGICAL_INSPIRATION != OPENAI_ARCHITECTURE`  
`REUSE_BEFORE_CREATE`  
`ONE_SYSTEM_ONLY`

## BOOT

`SESSION_ANIMAL_INVENTORY → TAXONOMY_DEDUPE → CAPABILITY_MATRIX → COUNTERPROOF → ZERO_REGRESSION → ONE_FINAL_ZIP`

## Fio da missão

`sessão inteira → todos os animais/grupos explícitos → dedupe sem perda → capacidades → mesma família → pacote único`
