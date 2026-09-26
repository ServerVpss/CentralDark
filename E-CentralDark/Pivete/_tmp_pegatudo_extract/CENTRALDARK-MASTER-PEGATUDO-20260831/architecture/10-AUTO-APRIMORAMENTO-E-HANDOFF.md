# Autoaprimoramento sem deriva

Autoaprimoramento não significa que um agente ganha liberdade para reescrever a governança.

A capacidade permitida é:

1. detectar uma falha observável;
2. demonstrar um falsificador;
3. encontrar o owner existente;
4. corrigir o mínimo;
5. registrar a falha como conhecimento negativo;
6. criar teste que falha antes e passa depois;
7. rodar a suíte existente;
8. submeter a contraprova;
9. registrar receipt;
10. ensinar o próximo agente via estado versionado + receipt.

## Generalização

Só generalizar quando o padrão sobreviver a mais de uma ocorrência ou quando a propriedade for estruturalmente demonstrável.

Generalizar para:
- gate;
- test helper;
- canonical contract;
- adapter rule;
- skill;
- lint;
- receipt schema.

Nunca generalizar para:
- "sempre faça X" por causa de um caso;
- bypass de CI;
- autoridade autônoma;
- duplicação de owner.

## Aprender no mesmo PR

Se a descoberta pertence à mesma capability/owner e não altera o escopo material:
`patch -> test -> receipt -> same PR`.

Se a descoberta abre outra capability independente:
registrar `NEXT_CURSOR` / issue apropriada; não inflar o PR atual.

## Ensino entre agentes

O agente sucessor recebe fatos, não personalidade:
- HEAD;
- branch/PR;
- owner;
- prova;
- falhas já refutadas;
- próximos falsificadores;
- estado UNKNOWN remanescente.

Assim o aprendizado fica no sistema, não preso à memória do modelo.

## Handoff denso sem perda semântica

Para handoff entre agentes, gramática pode ser sacrificada em favor de concisão; campos materiais não.

`[SKILL] [TRIG] [OWNER] [IN] [PRE] [EXEC] [OUT] [PROOF] [FAIL] [NEXT] [REV]`.

Se o nome de uma skill pedido pelo CHEFE não existir exatamente:

`EXACT_NAME_MISS -> SEARCH_CAPABILITY -> MATCH_EXISTING_OWNER -> PROVE_COMPATIBILITY -> CONTINUE`.

Não fabricar `fallback-loop`, `fable-loop` ou qualquer nome lembrado vagamente só para satisfazer a frase. Nome ausente não é autorização para skill nova.

## Colheita de capacidade

Busca, leitura e escavação de código são meio, não fim. Achado útil precisa virar uma destas saídas: owner existente atualizado; teste/falsificador; provenance; quarantine; NEXT_CURSOR; ou descarte justificado.

`SEARCH_ONLY_WITHOUT_RECONCILIATION=INCOMPLETE`.

