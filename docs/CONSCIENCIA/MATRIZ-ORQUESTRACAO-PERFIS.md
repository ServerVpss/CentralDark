---
title: "MATRIZ ORQUESTRACAO PERFIS"
date: 2026-08-27
tags: ["consciencia"]
updated: 2026-08-27
---

# MATRIZ-ORQUESTRACAO-PERFIS — CentralDark

> AUTORIDADE: SEGREDO/CHEFE
> OBJETIVO: 1 matriz onde cada eixo é uma chave e cada célula é um marcador único.
> REGRA DE OURO: NUNCA repetir marcador entre eixos nem dentro do mesmo eixo.
> USO: logs, Telegram, painel, GitHub, chat Hermes. Emissor monta a linha com 1 marcador por eixo.
> VERSAO: 1.0 (canônica, substitui link fantasma citado em 50+ docs)

---

## 🧩 EIXOS DA MATRIZ

### [GATILHO] — o que disparou a ação
| Marcador | Gatilho | Fase |
|----------|---------|------|
| 🔥 [GAT‑ACORDAR] | `#ACORDAR` | medição de estado vivo |
| 🧭 [GAT‑CALIBRAR] | `!CALIBRAR` | reconciliação / correção de rota |
| 🎯 [GAT‑MULTIBUSSOLA] | `!MULTIBUSSOLA` | objetivo / direção |
| 🔍 [GAT‑METALUPA] | `META LUPA` / `META(x)` | falsificar / prover |

### [CAMADA] — onde na pilha
| Marcador | Camada |
|----------|--------|
| 🤖 [LAYER‑BOTS] | Bots Telegram |
| ⚡ [LAYER‑HERMES] | Hermes (executor) |
| 💎 [LAYER‑SOL] | SOL / Esmeralda (coordenador) |
| 🔧 [LAYER‑PIVETE] | Pivete (executor legado) |
| 📡 [LAYER‑VPS] | VPS |
| 🗂️ [LAYER‑GITHUB] | GitHub |
| 💻 [LAYER‑LOCAL] | PC CentralDark |
| 🔗 [LAYER‑MCP] | MCP CentralDark |

### [ESCOPO] — alcance da ação
| Marcador | Escopo |
|----------|--------|
| 💻 [SCOPE‑LOCAL] | PC CentralDark |
| 📡 [SCOPE‑VPS] | servidor |
| 🌐 [SCOPE‑ALL] | ambos |

### [FOCO] — O QUE ESTÁ SENDO OLHADO (NOVO, do CHEFE)
| Marcador | Foco |
|----------|------|
| 👀 [FOCO‑OLHAR] | o que eu tô olhando (estado sendo observado) |
| ⚙️ [FOCO‑PROCESSO] | o processo (como está rodando / pipeline) |
| 🎯 [FOCO‑INTENCAO] | a intenção do SEGREDO (o que o CHEFE quis) |

### [STATUS] — resultado da ação
| Marcador | Status |
|----------|--------|
| ✅ [STATUS‑OK] | tudo verde / concluído |
| ⚠️ [STATUS‑WARN] | atenção / retry |
| ❌ [STATUS‑ERR] | erro definitivo |
| 🔄 [STATUS‑RUN] | em andamento |
| ⏳ [STATUS‑WAIT] | aguardando |
| 🔒 [STATUS‑BLOCK] | protegido / bloqueado |

### [AÇÃO] — verbo de trabalho
| Marcador | Ação |
|----------|------|
| 🚀 [ACT‑DEPLOY] | deploy / publish |
| 🛠️ [ACT‑FIX] | fix / correção |
| 🧠 [ACT‑LEARN] | aprendizado registrado |
| 📦 [ACT‑BUILD] | build / install |
| 🔨 [ACT‑WORK] | trabalho em execução |
| 🧙 [ACT‑ADVICE] | conselho / tutor |
| 📥 [ACT‑PULL] | checkout / download |
| 📤 [ACT‑PUSH] | push / upload |

---

## ⚒️ EXEMPLO DE LINHA (Hermes emitindo)

```
🔥[GAT-ACORDAR] ⚡[LAYER-HERMES] 💻[SCOPE-LOCAL] 👀[FOCO-OLHAR] 🔄[STATUS-RUN] 🔨[ACT-WORK]
→ medindo discos via WMIC
```

```
🎯[GAT-MULTIBUSSOLA] 💎[LAYER-SOL] 🌐[SCOPE-ALL] 🎯[FOCO-INTENCAO] ✅[STATUS-OK]
→ intenção do CHEFE aplicada nos 2 escopos
```

---

## ⚠️ REGRA ANTI-REPETIÇÃO
1. Cada marcador tem DONO único num eixo. Não reutilizar em outro eixo.
2. Emissor escolhe 1 marcador por eixo (pode omitir eixo não aplicável).
3. Marcador fora desta matriz = não canônico. Propor ao CHEFE antes de usar.
4. Conflitos resolvidos na v1:
   - `🔄` era ACORDAR + Andamento → ACORDAR virou 🔥 (no PADRAO-EMOJIS.md)
   - `🛠️` era CALIBRAR + Fix → CALIBRAR virou 🧭
   - `💎` era Esmeralda + Ouro → Esmeralda mantém 💎, Ouro é voz

---

ANCORADO: CHEFE / SEGREDO 👑
DONO: docs/CONSCIENCIA/MATRIZ-ORQUESTRACAO-PERFIS.md
VERSAO: 1.0

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
