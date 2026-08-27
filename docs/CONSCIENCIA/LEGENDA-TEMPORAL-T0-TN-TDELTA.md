---
title: "Legenda temporal — T0, TΔ, T1...Tn"
status: "RASCUNHO_PARA_RENOMEACAO_HUMANA"
date: 2026-08-27
authority: "SEGREDO/CHEFE"
scope: "Explicar a semântica temporal atual antes de qualquer renomeação"
owner: "docs/CONSCIENCIA/MULTIBUSSOLA.md"
rename_authority: "SEGREDO/CHEFE"
---

# Legenda temporal — T0, TΔ, T1...Tn

Este documento **não renomeia** os termos. Ele só explica o significado atual para que o SEGREDO/CHEFE possa escolher os nomes depois.

## Regra-base

```text
T = instante/rodada de observação
n = índice temporal da observação
Δ = mudança/delta entre estados observados
```

Os índices temporais **não representam gravidade, prioridade, qualidade, cargo ou versão**.

## T0

```text
T0 = estado vivo inicial observado
```

É a primeira fotografia operacional confiável do alvo no ciclo atual.

Pergunta humana equivalente:

> Como isso está quando eu começo a medir?

## TΔ

```text
TΔ = eventos, mudanças e deltas ocorridos entre estados observados
```

`TΔ` não significa obrigatoriamente uma nova rodada numerada. Ele descreve **o que mudou** entre duas observações relevantes.

Exemplos conceituais:

```text
T0 → TΔ → T1
T1 → TΔ → T2
T2 → TΔ → T3
```

Pergunta humana equivalente:

> O que mudou desde a última medição?

## T1

```text
T1 = primeira remedição após T0
```

Serve para verificar se o estado inicial permaneceu igual ou se algum delta material ocorreu.

Pergunta humana equivalente:

> Mudou alguma coisa? Mede de novo.

## T2

```text
T2 = segunda remedição sequencial
```

É usada quando o alvo muda novamente ou quando uma nova observação material precisa ser incorporada depois de T1.

## T3, T4, T5...

A numeração pode continuar enquanto houver necessidade real de remedição:

```text
T0 → T1 → T2 → T3 → T4 → T5 → ... → Tn
```

Não existe um limite conceitual fixo em `T3`.

## Tn

```text
Tn = qualquer observação temporal de índice n
```

É a forma genérica de dizer "alguma remedição posterior" sem impor um número máximo.

## Quando a sequência para?

A sequência pode parar quando o ciclo atinge um estado suficientemente estável para aquele escopo:

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

## Relação com a Multibússola canônica

A Multibússola hoje define a bússola temporal mínima como:

```text
T0 = estado vivo inicial
TΔ = eventos/deltas durante a investigação
T1 = estado vivo final remedido
```

Quando existem múltiplas remedições dentro da mesma linha temporal, a extensão operacional natural é:

```text
T0 = observação inicial
T1 = primeira remedição
T2 = segunda remedição
T3 = terceira remedição
...
Tn = enésima remedição
TΔ = delta material entre observações
```

Esta extensão **não cria novo motor, nova autoridade ou novo sistema**; apenas explicita a indexação temporal já utilizada nas medições operacionais.

## Tabela curta para futura renomeação

| Símbolo atual | Significado atual | Não significa |
| --- | --- | --- |
| `T0` | estado inicial medido | prioridade zero, severidade, versão |
| `TΔ` | mudança entre estados | etapa obrigatoriamente numerada |
| `T1` | primeira remedição | melhoria garantida |
| `T2` | segunda remedição | piora/gravidade nível 2 |
| `T3...Tn` | remedições seguintes | ranking, qualidade, maturidade |
| `Tn` | índice temporal genérico | limite máximo |

## Fronteira de autoridade

```text
DOCUMENTO_EXPLICA=true
DOCUMENTO_RENOMEIA=false
NOME_FINAL_PERTENCE_AO_SEGREDO_CHEFE=true
SOL_NAO_BATIZA=true
```

Qualquer renomeação futura deve preservar a semântica temporal ou declarar explicitamente a mudança de significado.
