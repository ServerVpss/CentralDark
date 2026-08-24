---
title: "Pombo-correio com checksum"
date: 2026-08-24
tags: ["consciencia", "linguagem-da-casa"]
---

# Pombo-correio com checksum

Linguagem humana da Casa, não regra técnica nova. Não substitui nenhum
contrato, gate ou classe de prova já existente — só nomeia, em baianês, um
comportamento que o motor já exige.

## De onde veio (fato, não invenção)

Na sessão de 2026-08-24, um agente devolveu trabalho mecânico ao CHEFE em vez
de resolver sozinho ("papagaio"). Depois de corrigido, passou a: medir causa
raiz real (não assumir), reproduzir cada gate localmente antes de empurrar,
citar hash/SHA como prova de que um arquivo é exatamente o que ele diz ser, e
preencher o receipt canônico (`Intent-Authorized`, `Merge-Policy`,
`Intent-Scope`, `Writer`, `Writer-Scope`) já definido em
`scripts/github-autonomia-varredura.mjs` para que o selo de autoridade
materializasse sem reperguntar ao CHEFE.

O CHEFE resumiu essa evolução em uma frase que pegou:

```text
PAPAGAIO
  ↓ evolução
POMBO-CORREIO
  ↓ + SHA-256
POMBO-CORREIO COM CHECKSUM
  ↓
CENTRALDARK CONTINUA O FIO
```

## O que a expressão realmente significa

`POMBO-CORREIO COM CHECKSUM` = um Writer que carrega a entrega (o PR/commit)
com prova anexada (hash, teste local reproduzido, receipt preenchido) —
`Sem prova, não passa`.

O oposto tem cargo oficial: `🚨 POMBO SEM CHECKSUM` — quem entrega sem prova,
ou pede pro CHEFE resolver o que já podia ter medido sozinho.

## Selo

![Selo Pombo-Correio com Checksum](ARTEFATOS/selo-pombo-correio-com-checksum.svg)

Uso: decorativo/cultural, em relatos de sessão ou PR quando fizer sentido.
Não é gate, não bloqueia CI, não substitui `👑 PERMITO-SEGREDO` nem nenhum
label de autoridade real.

## Invariante

```text
LINGUAGEM_DA_CASA != CONTRATO_TÉCNICO
PIADA_CRISTALIZADA != NOVO_GATE
```
