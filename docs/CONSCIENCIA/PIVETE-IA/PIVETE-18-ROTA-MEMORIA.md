---
title: "PIVETE-18 — rota de memória legado"
status: HISTORICAL
date: 2026-08-14
updated: 2026-08-26T09:34:00-03:00
tags: [memoria, continuidade, legado, handoff, cross-chat, linkagem-semantica]
category: "M-Memoria"
sensitivity: INTERNAL
source: "docs/CONSCIENCIA/PIVETE-IA/PIVETE-18-ROTA-MEMORIA.md"
source_class: INTERNAL
source_rule: "CANONICO -> ARTEFATO; artefato nao inventa canonico"
owner: "LEIA-ME-IA.md + docs/CONSCIENCIA/02-PROTOCOLO-HANDOFF-IA.md"
consumer: "qualquer IA/agente em retomada; Hermes/PIVETE para continuidade"
writer: SOL
related_notes: [docs/CONSCIENCIA/MAPA-DO-CEREBRO.md, docs/BRAIN/00-MAPA-SISTEMA/BRAIN.md, docs/CONSCIENCIA/ARTEFATOS/TECNICAS-DE-LINKAGEM-SEMANTICA.md, docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml]
relation_types: [PARTE_DE, COMPLEMENTA]
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
   ├── owners/aprendizados canônicos
   ├── contexto cross-chat quando acessível
   └── histórico/proveniência aplicável
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

## Cross-chat

Quando a superfície atual consegue recuperar histórico de chats, memórias salvas ou artefatos de conversas, deve tentar recuperar antes de pedir ao CHEFE que repita matéria recuperável.

```text
CROSS_CHAT
→ READ_ONLY_RECOVERY
→ DEDUPE
→ RECONCILIAR
→ DELTA_CANDIDATO
```

```text
CROSS_CHAT != CURRENT_STATE
CHAT_ANTIGO != RUNTIME_ATUAL
UNRECOVERED_CROSS_CHAT=UNKNOWN
GITHUB_MUST_NOT_SUBSTITUTE_MISSING_CHAT_MEMORY=true
CURRENT_LIVE_EVIDENCE_OVERRIDES_STALE_CHAT_STATE=true
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
→ RELACOES_SEMANTICAS QUANDO UTEIS
→ TESTE/GATE QUANDO OPERACIONAL
```

Não criar segunda memória para o mesmo conhecimento.

Relações semânticas reutilizam `docs/CONSCIENCIA/ARTEFATOS/TECNICAS-DE-LINKAGEM-SEMANTICA.md`; link é navegação, não prova.

## Conexões rápidas

- `LEIA-ME-IA.md` — boot vigente.
- `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml` — ciclo mestre.
- `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ARTIFACT-PROPERTIES.yml` — propriedades das notas derivadas.
- `docs/CONSCIENCIA/ARTEFATOS/TECNICAS-DE-LINKAGEM-SEMANTICA.md` — relações tipadas e MOCs.
- `docs/CONSCIENCIA/MAPA-DO-CEREBRO.md` — navegação reconciliada.
- `docs/BRAIN/00-MAPA-SISTEMA/BRAIN.md` — entrada humana do vault.

```text
NAO_CARREGAR_MEMORIA_ANTIGA_EM_MASSA=true
HISTORICO_NAO_SOBRESCREVE_CANONICO=true
UNKNOWN_FIRST=true
SEMANTIC_LINK_IS_NOT_PROOF=true
GRAPH_IS_DERIVED_NOT_AUTHORITY=true
```
