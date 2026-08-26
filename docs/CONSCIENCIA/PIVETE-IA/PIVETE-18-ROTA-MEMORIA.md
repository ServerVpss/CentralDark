---
title: "PIVETE-18 — rota de memória legado"
status: HISTORICAL
date: 2026-08-14
updated: 2026-08-26T08:38:00-03:00
tags: [memoria, continuidade, legado, handoff]
category: "M-Memoria"
sensitivity: INTERNAL
source: "docs/CONSCIENCIA/PIVETE-IA/PIVETE-18-ROTA-MEMORIA.md"
source_class: INTERNAL
source_rule: "CANONICO -> ARTEFATO; artefato nao inventa canonico"
owner: "LEIA-ME-IA.md + docs/CONSCIENCIA/02-PROTOCOLO-HANDOFF-IA.md"
consumer: "qualquer IA/agente em retomada; Hermes/PIVETE para continuidade"
writer: SOL
---

# PIVETE-18 · ROTA DE MEMÓRIA — REDIRECT HISTÓRICO

Esta nota é **compatibilidade histórica**, não porta de entrada atual. A rota antiga começava por lembranças de curto prazo e podia deixar memória velha sobrescrever regra viva.

## Direção atual

```text
!CENTRALDARK quando explicitamente convocado
→ #ACORDAR
→ LEIA-ME-IA.md
→ AGENTS.md
→ SOUL-SOL.md
→ PORTA-DE-ENTRADA-IA.md
→ ESTADO VIVO
→ SOMENTE MEMORIA RELEVANTE À MISSÃO
```

## Precedência

```text
CANONICO_ATUAL > ESTADO_VIVO > MEMORIA_RELEVANTE > HISTORICO
```

Memória transporta contexto; não fabrica autoridade, permissão ou estado presente.

```text
SEGREDO/CHEFE = humano + intenção + autoridade final
SOL = coordena e reconcilia
PIVETE/HERMES = executa + preserva + continua
MODELO = substituível
REALITY = JUDGE
```

## Escrita de aprendizado

```text
DELTA_UTIL
→ OWNER_CANONICO_EXISTE?
   SIM → ATUALIZAR/REFERENCIAR O OWNER
   NAO → MENOR ARTEFATO NECESSARIO
→ PROPRIEDADES
→ PROVENIENCIA
→ CONSUMIDOR
→ TESTE/GATE QUANDO OPERACIONAL
```

Não criar segunda memória para o mesmo conhecimento.

## Conexões rápidas

- `LEIA-ME-IA.md` — boot vigente.
- `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml` — ciclo mestre.
- `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ARTIFACT-PROPERTIES.yml` — propriedades das notas derivadas.
- `docs/CONSCIENCIA/MAPA-DO-CEREBRO.md` — navegação reconciliada.
- `docs/BRAIN/00-MAPA-SISTEMA/BRAIN.md` — entrada humana do vault.

```text
NAO_CARREGAR_MEMORIA_ANTIGA_EM_MASSA=true
HISTORICO_NAO_SOBRESCREVE_CANONICO=true
UNKNOWN_FIRST=true
GRAPH_IS_DERIVED_NOT_AUTHORITY=true
```
