# 03 — #PEGATUDO COMO MOTOR DE EVOLUÇÃO

## Definição

`#PEGATUDO` é o estágio de recuperação e reconciliação histórica do comando mestre.

Ele garante três coisas simultâneas:

1. **não perder ouro antigo**;
2. **não ressuscitar implementação ruim**;
3. **não confundir história com estado atual**.

## Grafo de lineage

Cada item encontrado vira um nó com:

- `id`
- `tipo`
- `origem`
- `timestamp`
- `sha/head` quando existir
- `capability_fingerprint`
- `owner provável`
- `estado histórico`
- `estado atual medido`
- `classificação`
- `delta único`
- `provenance`
- `destino`

Arestas mínimas:

- `DERIVED_FROM`
- `SUPERSEDES`
- `ABSORBED_BY`
- `DUPLICATES`
- `CONFLICTS_WITH`
- `FIXES`
- `REGRESSED_BY`
- `PROVES`
- `REFUTES`
- `DEPENDS_ON`

## Fingerprint da capacidade

Um artefato só entra na mesma família quando compartilhar materialmente:

`OWNER + FILES + BEHAVIOR + PROOF_TARGET + DEPENDENCIES + CAUSE_SIGNATURE`

Número de issue ou PR não define família.

## Recuperação de PRs antigos

Para cada PR relacionado:

1. medir `base`, `head`, merge-base e estado atual;
2. ler diff e arquivos tocados;
3. identificar comportamento pretendido;
4. comparar com `main` atual;
5. classificar cada delta:
   - já absorvido;
   - ainda útil;
   - regressivo;
   - conflitante;
   - superado;
   - apenas histórico;
6. extrair ouro;
7. transformar falhas em testes;
8. preservar link;
9. nunca mergear PR velho só porque contém código desejável.

## Recuperação de commits antigos

Commit é uma cápsula de decisão, não um comando para cherry-pick.

O sistema deve:
- comparar patch com owner atual;
- detectar se a mudança já foi absorvida por outra forma;
- extrair semântica que ainda falta;
- preservar SHA como provenance;
- criar patch novo mínimo quando necessário.

## O que acontece com coisa ruim

Exemplo:

Um commit antigo criou dois writers e causou corrida.

Ele não precisa sobreviver como código. O valor dele pode ser cristalizado como:

`TWO_WRITERS_SAME_SCOPE -> FAIL`

e um teste que reproduza a corrida.

Assim o passado ruim vira imunidade.

## Evolução para o futuro

Antecipar lacunas não significa escrever código especulativo.

Uma hipótese futura passa por:

`OBSERVAÇÃO -> RISCO -> FALSIFICADOR -> TESTE -> GATE -> SÓ ENTÃO IMPLEMENTAÇÃO`

O futuro entra primeiro como uma propriedade verificável.

## Fixed point histórico

O `#PEGATUDO` termina quando:

- todos os nós relevantes foram classificados;
- todo ouro identificado foi absorvido ou preservado;
- todo conflito material tem owner/decisão;
- nenhuma duplicação operacional permanece sem justificativa;
- os testes negativos cobrem falhas históricas importantes;
- novo passe de busca não encontra delta material não classificado.

Isso é o **fixed point de lineage**.
