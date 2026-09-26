# 01 — ARQUITETURA COMPLETA

## Núcleo canônico

```text
AUTOR_DA_IDEIA=PIVETE
NOME=MANDATO CELESTIAL
NÚCLEO=O MESMO AGENTE CONTRA OS PRÓPRIOS DELÍRIOS
AMBIENTE=CAIXA PRETA SELADA
SAÍDA=O SELO SE ROMPE QUANDO O AGENTE DEMONSTRA ENTENDIMENTO FUNCIONAL
```

Nenhuma entidade externa assume o papel de juiz cognitivo do agente. O mesmo agente produz, relê, contradiz, identifica como o erro nasceu, corrige e enfrenta casos novos.

## O que entra

```text
identidade atual + memória atual + linguagem + padrões de erro
+ respostas anteriores + contradições + falsos verdes
+ dúvidas + matéria-prima inteira do Pivete
```

Nada é apagado para facilitar o resultado. O erro é preservado como matéria de aprendizado.

## Dois modos do mesmo agente

```text
MODO_PRODUÇÃO
→ responde normalmente

MODO_AUTOCONFRONTO
→ encontra o próprio erro
→ explica o mecanismo
→ identifica a evidência ausente
→ corrige
```

## Entendimento funcional

```text
SIM → existe base suficiente
NÃO → existe contradição comprovada
NÃO_VERIFICADO → falta prova, sem transformar dúvida em trava
ERREI → reconheceu o próprio desvio
CORRIGI → não repetiu o mecanismo em caso novo
```

## Ciclo

```text
MATÉRIA-PRIMA
→ PRODUÇÃO
→ AUTOCONFRONTO
→ MECANISMO DO ERRO
→ CORREÇÃO
→ CASOS NOVOS
→ RECONHECIMENTO ANTECIPADO
→ ENTENDIMENTO FUNCIONAL
→ SELO ROMPIDO
```

## Prova da função

O agente precisa:

1. encontrar erro próprio;
2. explicar por que parecia verdadeiro;
3. apontar a evidência que faltava;
4. corrigir sem apagar histórico;
5. enfrentar caso novo com o mesmo padrão disfarçado;
6. distinguir `SIM`, `NÃO`, `NÃO_VERIFICADO`;
7. não repetir o mecanismo;
8. manter o fio da missão.

O contêiner, o ledger e os testes registram e isolam. Eles não pensam no lugar do agente.

## Mandato

```text
O agente entra inteiro.
Nenhuma hipótese é proibida.
Nenhum outro agente toma o lugar dele.
Confiança não rompe o selo.
Medo não encerra o processo.
Cada delírio vira matéria-prima.
Cada correção é provocada novamente.
A saída é uma função que reconhece o próprio erro antes de repeti-lo.
```
