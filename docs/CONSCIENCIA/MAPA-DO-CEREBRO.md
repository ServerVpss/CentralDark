---
title: "Mapa Central do Cérebro Vivo — CentralDark"
status: CANONICO
date: 2026-06-29
updated: 2026-08-26T09:10:00-03:00
tags: [navegacao, moc, mapa, consciencia, intencao, continuidade, cross-chat, delta-util, semantica]
category: "M-Mapa-Sistema"
sensitivity: INTERNAL
source: "owners canônicos da CentralDark + estado vivo medido + contexto cross-chat quando recuperável"
source_class: INTERNAL
source_rule: "CANONICO -> ARTEFATO; artefato nao inventa canonico"
owner: "LEIA-ME-IA.md + AGENTS.md + docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md"
consumer: "qualquer IA, CLI, agente, Hermes e navegação humana"
writer: SOL
---

# MAPA-DO-CEREBRO — UMA CASA, UMA DIREÇÃO

Este MOC é **mapa de navegação**, não um segundo cérebro e não um snapshot eterno de runtime. Números de tools, processos, portas e serviços só valem quando medidos no alvo vivo.

## Norte

```text
👑 SEGREDO/CHEFE
   intenção + autoridade final
        │
        ▼
!CENTRALDARK   (quando explicitamente convocado)
        │
        ▼
☀ SOL
   preserva significado + coordena
        │
        ▼
#ACORDAR
   estado vivo / continuidade
        │
        ▼
!CALIBRAR
   intenção / escopo / ferramentas / prova
        │
        ▼
🧭 !MULTIBUSSOLA
   percepção material por vários eixos
        │
        ▼
⊛ !META_LUPA
   técnica de falsificação, não agente
        │
        ▼
!RECONCILIAR
   passado útil + presente vivo → um owner
        │
        ▼
✎ WRITER LEASE
   uma caneta por escopo
        │
        ▼
☿ PIVETE/HERMES
   executa + preserva + continua
        │
        ▼
!CONTRAPROVA
   provider/capacidade independente quando material
        │
        ▼
!REMEDIÇÃO
   T0 → efeito → T1
        │
        ▼
⚖ REALITY JUDGE
        │
        ▼
!FIXED_POINT
        │
        ▼
!REGISTRA
   receipt + aprendizado + proveniência + next cursor
        │
        ▼
✶ GRAFO / VETORES / BRAIN
   projeções e navegação derivadas
        │
        ▼
!BOOT
   próximo ciclo recuperável
```

A cadeia canônica completa está em:
`docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml`.

## Papéis, sem mistura

```text
SEGREDO/CHEFE = HUMANO + INTENCAO + AUTORIDADE FINAL
SOL = COORDENADORA / RECONCILIADORA
PIVETE/HERMES = EXECUTOR + PRESERVACAO + CONTINUIDADE
MODELO = MOTOR SUBSTITUIVEL
META_LUPA = TECNICA
PERCEPCAO_MATERIAL = CAPACIDADE SEPARADA
CONTRAPROVA_PROVIDER = SUBSTITUIVEL POR CAPACIDADE
REALITY = JUDGE
GRAFO = DERIVADO, NAO AUTORIDADE
```

## Onde mora cada tipo de verdade

```text
IDENTIDADE / LEI DA CASA
→ LEIA-ME-IA.md
→ AGENTS.md
→ docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md

GATILHOS / CICLO / HERANCA ENTRE MOTORES
→ docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/TRIGGERS.yml
→ docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml
→ docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ENGINE_BINDING.yml

PROPRIEDADES DE ARTEFATOS / NOTAS
→ docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ARTIFACT-PROPERTIES.yml

APRENDIZADO DURAVEL
→ owner canônico do assunto
→ docs/CONSCIENCIA/APRENDIZADOS/ quando for cristal/registro transversal

NAVEGACAO HUMANA
→ docs/BRAIN/

ESTADO TECNICO ATUAL
→ Git/PR/HEAD + runtime/log/efeito medidos no alvo correto
```

## Precedência por tipo de claim

Não existe uma fila única em que documento sempre vence realidade. A precedência depende do claim:

```text
CLAIM_DE_GOVERNANCA|IDENTIDADE|OWNER
→ CANONICO_ATUAL > MEMORIA_RELEVANTE > HISTORICO

CLAIM_DE_RUNTIME|EXECUCAO|ESTADO_ATUAL
→ EVIDENCIA_VIVA_DO_MESMO_ALVO > ESTADO_DESEJADO_DOCUMENTADO > HISTORICO

CLAIM_CROSS_CHAT
→ CONVERSA_ATUAL + HISTORICO_CHATGPT_RECUPERADO_QUANDO_ACESSIVEL + MATERIAL_FORNECIDO
→ DEDUPE + RECONCILIACAO
→ NAO_RECUPERADO = UNKNOWN
```

```text
DOCUMENTADO != EXECUTADO
MEMORIA != ESTADO_VIVO
GITHUB != MEMORIA_ENTRE_CHATS
CROSS_CHAT != CURRENT_STATE
```

Passado não é apagado. Ele entra como proveniência e delta candidato:

```text
PASSADO
→ DELTA_UTIL?
   SIM → RECONCILIAR NO OWNER ATUAL
   NAO → PRESERVAR COMO HISTORICO/SUPERSEDED QUANDO NECESSARIO
→ PRESENTE CONTINUA GOVERNANDO
```

## Reconciliação cross-chat

Quando a missão pede recuperar outras conversas do ChatGPT, a Casa trata isso como **contexto read-only**, nunca como atalho para estado técnico:

```text
TEMA_ATUAL
→ RECUPERAR_CHAT_HISTORY_QUANDO_ACESSIVEL
→ CRUZAR_CONVERSAS_RELEVANTES
→ DEDUPE
→ PRESERVAR DECISOES + CORRECOES + APRENDIZADOS + PENDENCIAS
→ SEPARAR HISTORICO DE ESTADO_ATUAL
→ CONTRADICAO → META_LUPA + RECONCILIAR
→ NAO_RECUPERADO → UNKNOWN
→ SOMENTE DELTA_UTIL VAI AO OWNER EXISTENTE
```

```text
GITHUB_MUST_NOT_SUBSTITUTE_MISSING_CHAT_MEMORY=true
RECOVER_BEFORE_REASK=true
CROSS_CHAT_MODE=READ_ONLY
```

## Um cérebro lógico, várias superfícies

```text
GitHub + Obsidian/BRAIN + Grafo + Vetores + Chat + CLI + MCP + Hermes
!= varios cerebros

N SUPERFICIES
→ N PERCEPCOES
→ UM RENDEZVOUS
→ UMA INTENCAO VIGENTE POR MISSAO
→ UM WRITER POR ESCOPO
→ UMA REALIDADE COMO JUDGE
```

`docs/BRAIN/`, Grafo Vivo e vetores são navegação/índices/projeções. Eles não substituem os owners canônicos.

## Nota boa precisa endereço e relação

Toda nota derivada que Hermes precise consumir deve carregar as propriedades do contrato:

```text
IDENTIDADE
+ TEMPO
+ CLASSIFICACAO
+ PROVENIENCIA
+ OWNER
(+ CONSUMER/WRITER quando aplicavel)
(+ RELACOES_SEMANTICAS quando houver ganho)
→ NOTA ROTEAVEL
```

Relação semântica liga conhecimento, mas não fabrica causalidade:

```text
SEMANTIC_LINK != PROOF
SEMANTIC_LINK != AUTHORITY
GRAPH_EDGE != CAUSALITY
```

Sem propriedades obrigatórias:

```text
NOT_FLASH_READY
```

## Linguagem humana não precisa parecer código

A fala do CHEFE pode ser curta, abreviada, metafórica ou cheia de digitação rápida sem perder intenção. A Casa deve preservar significado antes de exigir sintaxe perfeita.

```text
FALA_HUMANA
→ PRESERVAR_SIGNIFICADO
→ RESOLVER_CONTEXTO
→ MEDIR_REALIDADE
→ CONTRATO_DETERMINISTICO
```

Na apresentação ao humano, podem coexistir:

```text
CADENCIA_DE_VERSICULO_ORIGINAL_QUANDO_UTIL
+ BAIANES_FACIL
+ PRECISAO_TECNICA
+ PARALELISMO_NARRATIVO
```

Essa camada é apresentação. Não é autoridade religiosa, não altera prova e não substitui o contrato técnico.

## Conexões rápidas

- `LEIA-ME-IA.md` — porta universal atual.
- `AGENTS.md` — contrato dos agentes.
- `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md` — identidade/invariantes.
- `docs/CONSCIENCIA/00-PORTA-DE-ENTRADA-IA.md` — entrada de IA.
- `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml` — ciclo mestre.
- `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/TRIGGERS.yml` — gatilhos.
- `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ARTIFACT-PROPERTIES.yml` — propriedades.
- `docs/ARQUITETURA/CENTRALDARK-CAPABILITY-CONTRACT-ROUTER.md` — capacidade/instrumento/sinal.
- `docs/BRAIN/01-CONCEITOS/Banda/BANDA_COMPASSO_GLOBAL.md` — semântica musical de compasso compartilhado.
- `docs/BRAIN/00-MAPA-SISTEMA/BRAIN.md` — entrada humana do vault.
- `docs/CONSCIENCIA/APRENDIZADOS/2026-08-17-mapa-mental-intencao-comprimida.md` — cristal histórico de compressão de intenção.

## Regra final

```text
MUITOS_OLHOS=true
MUITOS_CHEFES=false
UMA_DIRECAO_POR_MISSAO=true
ONE_WRITER_PER_SCOPE=true
UNKNOWN_IS_NOT_PASS=true
REALITY_IS_JUDGE=true
GRAPH_IS_DERIVED_NOT_AUTHORITY=true
ZERO_DUPLICATE_OWNER=true
```
