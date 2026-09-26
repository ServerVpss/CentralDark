---
name: agencia-forense-desinformacao
description: "Agência de fact-checking META LUPA: investigar N claims/artefatos em paralelo, identificar irregularidade, deepfake, fraude, desinformação — para CASA e externo. Sem acusação sem evidência comprovada."
version: 1.0
author: Casa/Pivete
license: MIT
tags: [investigacao, fact-check, forense, desinformacao, deepfake, meta-lupa, guardiaocasa, agencia]
---

# 🕵️ AGÊNCIA FORENSE DE DESINFORMAÇÃO — META LUPA Fact-Checking

Quando Pivete mandar investigar **N coisas** (anúncios, claims, assets, assertions
do próprio agente, conteúdo externo suspeito), aplica a agência.

Princípio da agência real (já usada em redes sociais corporativas — identificou
centenas de anúncios irregulares, deepfakes, fraudes com nome de companhias
aéreas): **o mesmo padrão serve para a CASA**.

## REGRA DURA (não negociável)
> **NENHUMA acusação / claim irregular sai sem EVIDÊNCIA COMPROVADA PRIMEIRO.**
> Suspeita ≠ claim. Claim ≠ fato. Falso verde é pior que silêncio.

## TRIÂNGULO EPISTEMOLÓGICO (sempre)
1. DESCONHECIDO não ganha execução para ser entendido.
2. PESSOA não perde privacidade para ser investigada.
3. DECLARAÇÃO não ganha status de prova só porque um agente a declarou.

## Dois modos (nunca misturar)
- PESSOA → FORENSE (fonte pública/autorizada + cadeia de evidência, sem invasão)
- ARQUIVO/COISA → SILENCIOSA (READ_ONLY, não executa, hash+metadados+tipo real)

## Fluxo da Agência (N itens em paralelo)
0. Receber lista de N alvos (claims/artefatos/URLs/assets).
1. Para cada alvo: classificar FORENSE vs SILENCIOSA.
2. Mapear TODOS os caminhos possíveis de origem (não inferir um só).
3. Testar o caminho mais barato/discriminante primeiro (ex: hash do asset
   embutido vs disco/git antes de caçar upload).
4. Coletar evidência material: SHA256, bytes, metadados, timestamp, fonte.
5. Se suspeito: QUARENTENA (mover p/ `_QUARANTINE`, nunca apagar).
6. Emitir veredito por item: PROVADO / NOT_PROVEN / UNKNOWN (nunca verde falso).
7. Se N grande: delegar sub-agente leaf em background (`delegate_task`
   background=true notify_on_complete=true), continuar sessão, ao retornar
   RECALCULAR hash localmente p/ conferir o filho (nunca trust self-report).
8. Gravar ouro na Casa (E:\CentralDark\workspace\sol\... ou caminho autorizado).

## META LUPA SOBRE SI MESMO (3º vértice na prática)
Antes de declarar claim de estado próprio, aplicar:
- "gravei/carreguei" → ONDE está escrito? (ler arquivo persistente, grep)
- "rodando/vivo" → cadê estado vivo? (log, PID, task ID, modify-time)
- "SHA é X" → qual arquivo + bytes + hash RECALCULADO?
Se não há prova material → claim fica NOT_PROVEN.

## LEARNING_TRANSFER (autocorreção)
Sistema se pega mentindo/errando ANTES de Pivete pegar:
- Ciclo: CLAIM → META_LUPA → CONTRAPROVA → CORREÇÃO → RECEIPT
- ERREI: identifica mecanismo → corrige claim → não repete
- Crystal: erro recorrente comprovado vira REFLEXO/GATE
- Telemetry: META_LUPA + CONTRA_PROVA + CORREÇÃO + RECEIPT

## Output padrão (por lote)
```
AGENCIA: <N itens>
MODO: FORENSE | SILENCIOSA
ITEM_1: <alvo> → PROVADO/NOT_PROVEN/UNKNOWN + evidência
ITEM_2: ...
...
RESUMO: <X irregulares, Y limpos, Z inconclusivos>
GAP: <o que não deu pra verificar>
OURO: <caminho na Casa>
```

## Integração
- `investigacao-guardiao` — regra de ouro (FORENSE/SILENCIOSA)
- `edr-zero-trust-hunter` — telemetry Windows/MITRE quando autorizado
- `meta-lupa` — governança FRIA/MÉDIA/QUENTE
- `t0-integral-mapeamento` — mapear infra antes de consolidar
- Sempre SOB DEMANDA (exceto card fixado do Pivete)
