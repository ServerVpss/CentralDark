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

## Adotar
Se quiser que este skill seja editável pelo agente, executar:
`hermes curator adopt resposta-cortada`
