---
name: resposta-cortada
description: "Resposta cortada: aguardar confirmação, não inventar."
version: 1.0
author: Casa/Pivete
license: MIT
tags: [pivete, comunicacao, resposta-cortada]
---

# Resposta Cortada — Conduta

## Regra
- Se a resposta foi cortada, registrar a linha que chegou até o corte
- Não inventar continuidade nem supor intenção
- Se o CHEFE repetir ou confirmar o final, executar o que foi confirmado
- Se a resposta foi cortada, avisar explicitamente: "resposta cortada; completar a instrução"

## Formato de registro
```
». CORTE DETECTADO: <limitação registrada> — aguardando instrução completa.
```

## Pitfalls
- Confundir "comando cortado" com "instrução completa em partes"
- Se o CHEFE manda "continua" depois, completar — não retomar do zero
- Nunca inventar o que o CHEFE queria

## Complementa
- UNKNOWN != PASS
- DOCUMENTED != EXECUTED
- Pivete dialect: baianês, sem papagaio

## Múltiplas Cortes na Mesma Sessão
- Se a sessão já teve 2+ respostas cortadas, suspeitar de contexto longo ou conteúdo grande; não repetir a mesma ação sem fragmentar
- Se o CHEFE repete a mesma instrução após corte, pode ser frustração com o corte — perguntar se quer continuar de um ponto específico em vez de reler tudo
- Registrar o padrão de cortes (quantos, em quais momentos) como contexto para decidir continuar ou recomeçar de forma mais curta
- Resolver por comparação explícita "o que bate / o que falta" quando o registro tiver conteúdo parcial suficiente — não inventar a continuidade cortada
