---
title: CentralDark - Nucleo Cristalizado de Autocorrecao
status: CRISTALIZADO
scope: Autocorrecao, fallback, webhook, PRs paralelos e zero regressao
source: SEGREDO/CHEFE, sessao 2026-09-09
owner: docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC
writer: SOL
---

# CentralDark - Nucleo Cristalizado de Autocorrecao

## Principio

Cada agente ajuda o outro, mas nenhum agente altera a hierarquia ou o contrato do sistema.

```text
CentralDark
  -> capability/scope
  -> executor
  -> PR
  -> correcao
  -> validacao
  -> receipt/NEXT_CURSOR
```

`capability + scope` escolhem o executor. Nome de modelo e somente proveniencia. Modelo nao decide autoridade, prioridade ou roteamento.

## Autonomia por escopo

Cadeias podem operar autonomamente por setor ou PR, em paralelo, sem depender de uma API central acoplada para existir.

Paralelismo aumenta velocidade; nao aumenta autoridade. Toda mutacao converge em um unico Writer por escopo material.

## Fallback Free Tier

Free Tier e fallback deterministico, nao executor permanente. So entra quando houver erro, falha de execucao, ausencia de resultado esperado ou webhook com ocorrencia material.

O fallback recebe o contexto minimo, identifica a falha e tenta corrigir apenas dentro do escopo autorizado.

## Webhook de erro

```text
erro
  -> identificar ponto material
  -> registrar
  -> corrigir
  -> validar
```

Webhook nao cria cadeia paralela infinita. Se nao puder corrigir com seguranca, comenta no PR exatamente onde esta o erro, sem mascarar a falha.

## Autocorrecao material

A correcao acontece no proprio ponto que feriu o codigo.

```text
localizar falha
  -> causa observavel
  -> menor correcao suficiente
  -> validacao
  -> retorno ao fluxo deterministico
```

Costurar a ferida, nao reescrever o corpo.

## Classes de erro

Classes recorrentes podem ter executor especializado quando existir owner: `Not Found`, `404`, rota, import, referencia quebrada, headers, configuracao, incompatibilidade detectavel e integracao.

## Zero regressao

Nao remover comportamento existente. Nao introduzir regressao conhecida. Nao criar V1/V2/V30 paralelo. Expandir somente quando necessario.

Antes de aplicar: preservar o que ja funcionava, comparar contra o estado anterior, alterar o minimo, validar de novo e rejeitar a correcao que quebra contrato existente.

## Anti-loop e anti-eco

```text
uma ferida
  -> uma ocorrencia
  -> uma cadeia de correcao
```

Nao criar issue eco, PR eco, evento equivalente ou reprocessamento infinito. Troca de modelo/proveniencia nao cria nova ocorrencia.

## Determinismo

A descoberta pode ser probabilistica; a aplicacao deve ser deterministica.

```text
falha observada
  -> local determinado
  -> patch minimo
  -> validacao
  -> aplicacao
```

Mesmo estado e mesmo contexto devem produzir comportamento previsivel no ponto de aplicacao.

## Registro minimo

Registrar apenas: fato observado, proveniencia, executor, correcao aplicada, resultado da validacao, receipt e `NEXT_CURSOR`.

## Cursor

`NEXT_CURSOR` e fronteira de continuidade. Consumiu, avanca. Confirmou, registra. Falhou antes de confirmar, nao avanca falsamente.

## Regra-mestra

CentralDark coordena. Capability/scope escolhem. Executor corrige. Proveniencia identifica. Webhook sinaliza. Free Tier faz fallback. Agentes trabalham em paralelo dentro do proprio escopo. A correcao acontece no ponto da falha. O PR retorna ao fluxo. Validacao impede regressao. Receipt e `NEXT_CURSOR` fecham o ciclo. Nenhum eco e criado.
