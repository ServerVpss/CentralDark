---
title: "🧩 Matriz de orquestração e perfis — CentralDark"
status: "ATIVO_RECONCILIADO"
date: 2026-08-27
updated: 2026-09-10
owner: "docs/CONSCIENCIA/MATRIZ-ORQUESTRACAO-PERFIS.md"
truth_scope: "VISUAL_ORCHESTRATION_MATRIX"
canonical: true
tags:
  - centraldark
  - consciencia
  - orquestracao
  - perfis
  - gatilhos
  - status
related:
  - "[[PADRAO-EMOJIS]]"
  - "[[PADRAO-GRAFO-VIVO-MARKDOWN]]"
links:
  - "docs/SEGURANCA/ADM-GATILHOS-OPERACIONAIS.json"
  - "docs/CONSCIENCIA/PADRAO-EMOJIS.md"
  - "docs/CONSCIENCIA/PADRAO-GRAFO-VIVO-MARKDOWN.md"
---

# 🧩 MATRIZ DE ORQUESTRAÇÃO E PERFIS — CentralDark

> A matriz combina eixos para logs, painel, GitHub e chat. Ela **não é owner dos gatilhos**. O texto visual dos gatilhos vem de `docs/SEGURANCA/ADM-GATILHOS-OPERACIONAIS.json`.

## 🧿 [GATILHO] — o que disparou a ação

| Marcador | Gatilho | Fase |
|---|---|---|
| 👑🪬 [GAT-CENTRALDARK] | `!CENTRALDARK` | carregar contrato e ciclo da Casa |
| 🔗 [GAT-INTERLIGADOS] | `!># INTERLIGADOS` | ligar camadas/fontes/trilha |
| ⭕ [GAT-AUREOLA] | `!AURÉOLA CANÔNICA` | mostrar ciclo percorrido |
| 🧿 [GAT-ACORDAR] | `#ACORDAR` | medição de estado vivo |
| 🎛️ [GAT-CALIBRAR] | `!CALIBRAR` | intenção × escopo × prova |
| 🧭 [GAT-MULTIBUSSOLA] | `!MULTIBÚSSOLA` | direção/próximo cursor |
| 🔎 [GAT-META-LUPA] | `!META_LUPA` | investigação/contraprova |
| 🔄 [GAT-RECONCILIAR] | `!RECONCILIAR` | convergência de estado |
| ⚖️ [GAT-CONTRAPROVA] | `!CONTRAPROVA` | julgar claim contra evidência |
| 💠 [GAT-FIXED-POINT] | `!FIXED_POINT` | fechamento provado |
| 🧾 [GAT-REGISTRA] | `!REGISTRA` | receipt/proveniência |
| 💎 [GAT-DELTA-UTIL] | `!DELTAÚTIL` | preservar delta material |

## 🧱 [CAMADA] — onde na pilha

| Marcador | Camada |
|---|---|
| 🤖 [LAYER-BOTS] | bots/interfaces |
| ⚡ [LAYER-HERMES] | Hermes executor |
| 💎 [LAYER-SOL] | SOL coordenação |
| 📡 [LAYER-VPS] | VPS |
| 🏛️ [LAYER-GITHUB] | GitHub main/PR |
| 🏠 [LAYER-LOCAL] | Casa/local |
| 🔌 [LAYER-MCP] | MCP/hub/connectors |

## 🌐 [ESCOPO] — alcance

| Marcador | Escopo |
|---|---|
| 🏠 [SCOPE-LOCAL] | Casa/local |
| 📡 [SCOPE-VPS] | servidor |
| 🌐 [SCOPE-ALL] | múltiplos ambientes |

## 🎯 [FOCO] — o que está sendo observado

| Marcador | Foco |
|---|---|
| 👀 [FOCO-ESTADO] | estado observado |
| ⚙️ [FOCO-PROCESSO] | processo/pipeline |
| 🎯 [FOCO-INTENCAO] | intenção do SEGREDO/CHEFE |
| 🔗 [FOCO-GRAFO] | relação entre owners/fontes |

## 🚦 [STATUS] — resultado

| Marcador | Status |
|---|---|
| 🟢 [STATUS-PROVED] | provado no escopo medido |
| 🟡 [STATUS-PARTIAL] | parcial/aguardando prova |
| 🔴 [STATUS-FAIL] | falha ou bloqueio confirmado |
| 🔄 [STATUS-RUN] | em andamento |
| ⏳ [STATUS-WAIT] | espera externa |
| 🔒 [STATUS-BLOCK] | protegido/bloqueado |

## 🛠️ [AÇÃO] — verbo de trabalho

| Marcador | Ação |
|---|---|
| 🚀 [ACT-DEPLOY] | deploy / publish |
| 🛠️ [ACT-FIX] | fix / correção |
| 🧠 [ACT-LEARN] | aprendizado/contexto |
| 📦 [ACT-BUILD] | build / install |
| 🔨 [ACT-WORK] | trabalho em execução |
| 📥 [ACT-PULL] | checkout / download |
| 📤 [ACT-PUSH] | push / upload |

## ⚒️ Exemplo

```text
🧿[GAT-ACORDAR] ⚡[LAYER-HERMES] 🏠[SCOPE-LOCAL] 👀[FOCO-ESTADO] 🔄[STATUS-RUN] 🔨[ACT-WORK]
→ medindo estado real da Casa
```

```text
🧭[GAT-MULTIBUSSOLA] 💎[LAYER-SOL] 🌐[SCOPE-ALL] 🎯[FOCO-INTENCAO] 🟢[STATUS-PROVED]
→ direção confirmada contra evidência disponível
```

## ⚖️ Regras

```text
TRIGGER_OWNER=docs/SEGURANCA/ADM-GATILHOS-OPERACIONAIS.json
MATRIX_IS_COMPOSITION_VIEW=true
MATRIX_DOES_NOT_OVERRIDE_TRIGGER_DISPLAY=true
UNKNOWN != PASS
ACTION != PROOF
HISTORY != CURRENT_STATE
```

Se a matriz divergir do registry, corrigir esta matriz. Não criar mapa concorrente.