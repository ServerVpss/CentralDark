---
title: "Padrão de Emojis — Logs e Notificações"
date: 2026-07-03
tags: ["consciencia", "padrao", "logs"]
updated: 2026-07-03
---

# 📢 PADRÃO DE EMOJIS — Fonte da Verdade

> Toda IA/script/workflow que gerar log, notificação Telegram, mensagem GitHub ou linha no painel status DEVE usar SÓ esses emojis, na função certa. Nada de emoji aleatório, nada de mix.

## 🚦 Status
| Emoji | Uso |
|---|---|
| ✅ | Sucesso, ok, concluído |
| ⚠️ | Alerta, atenção, retry |
| ❌ | Erro, falha final |
| 🔄 | Em andamento, retry, sincronizando |
| ⏳ | Aguardando, fila, timeout |
| 🔒 | Protegido, bloqueado |

## 🛠️ Ação
| Emoji | Uso |
|---|---|
| 🚀 | Deploy, publish |
| 🛠️ | Fix, correção |
| 🧠 | Aprendizado registrado |
| 📦 | Build, install |
| 🎯 | Passo/objetivo atual |
| 🔨 | Trabalho em execução (Hermes) |
| 🧙 | Conselho/tutor debatendo |
| 📥 | Checkout, download |
| 📤 | Push, upload |

## 🧩 Módulo
| Emoji | Uso |
|---|---|
| 🤖 | Bots Telegram |
| 📊 | Painel status |
| 🧬 | HUB (hub.centralldark.com) |
| 📡 | VPS (PM2, Caddy) |
| 🗂️ | GitHub |
| 💾 | Supabase |
| 📚 | Segundo Cérebro |
| 🩸 | TelePainel/Fiscal |
| 🎨 | UI/UX (Esmeralda) |

## 👥 Agentes
| Emoji | Quem |
|---|---|
| 👑 | Pivete (admin) |
| 🧙 | Fabler (mestre-sábio) |
| 🔨 | Hermes (executor) |
| 💎 | Esmeralda (visual) |
| 🧠 | GPT-5.5 (analista) |
| ⚡ | Gemini 3 Flash (executor rápido) |
| 🎯 | GPT-5.4 (preciso) |
| 🔍 | Gemini 2.5 Pro (cético) |
| 🎨 | GPT-5 (criativo) |

## 📐 Card padrão (Telegram admin)

```
🔨 Hermes · Round N · HH:MM
🎯 Passo: <descrição curta>
🧙 Conselho: Fabler ✅ | GPT-5.5 ✅ | Gemini Pro ⚠️
📦 Commit: <sha> → <resumo>
⏱️ <duração> | 🧠 +N aprendizados
```

## 📏 Linha padrão (canal Status)

```
🔨 Hermes ▓▓▓▓▓░░░░░ 50% · <missão> · round N/~T
```

## ❌ Nunca
- Emoji sem função (decorativo).
- Empilhar (✅✅✅).
- Bandeiras, comidas, mãos em log técnico.

**Fonte da verdade:** este arquivo.
