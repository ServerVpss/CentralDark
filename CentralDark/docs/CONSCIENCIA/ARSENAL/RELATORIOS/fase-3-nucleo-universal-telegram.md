---
title: "Fase 3 Nucleo Universal Telegram"
date: 2026-07-03
tags: ["consciencia"]
updated: 2026-07-03
---

# ✅ Fase 3 — Núcleo Universal + Telegram

**Data:** 02/07/2026
**Duração real:** ~1h
**Status:** 🟢 No ar

## 🎯 O que foi feito

Montei o **cérebro** do Arsenal Council e liguei no bot do Telegram (@srver1bot).

### 1. Orquestrador universal (Bash)
Arquivo: `docs/CONSCIENCIA/ARSENAL/scripts/arsenal-council.sh`

Três modos:
- **router** → 1 IA rápida (Gemini Flash), ~10s
- **parallel** → 3 IAs em paralelo (Gemini Pro + GPT-5 + Flash) + Juiz sintetiza, ~40s
- **debate** → 2 rodadas onde as IAs veem a resposta uma da outra + Juiz final, ~90s

Cada rodada salva um `.md` completo em `docs/CONSCIENCIA/ARSENAL/DEBATES/` com timestamp.

### 2. Handler do Telegram
Arquivo: `apps/bot-telegram/handlers/refinar.cjs`

Dispara o script em background, escuta o resultado, formata pro Telegram (limite 4096 chars) e responde no privado do admin + posta no grupo "Central Dark — Grupo Da Evolução".

### 3. Comandos registrados no @srver1bot
- `/refinar <tema>` ou `/parallel <tema>` — modo paralelo
- `/debate <tema>` — modo debate
- `/router <tema>` — modo rápido

### 4. Deploy
- PM2 27 (`CentralDark-HubBot`) restartado
- Notificação enviada pro admin privado + canal Status

## 🧪 Como testar

No privado do @srver1bot:
```
/router qual a diferença entre debounce e throttle?
/refinar como escalar um bot Telegram com 10k usuários simultâneos?
/debate vale a pena migrar de Node pra Bun em 2026?
```

## 📂 Onde mexer

- Adicionar novo backend de IA → `arsenal-council.sh`, criar nova função `call_*`
- Mudar formatação da resposta no Telegram → `refinar.cjs`
- Novo comando → `apps/bot-telegram/unified-bot.cjs` (procurar `case '/refinar'`)

## ⏭️ Próxima fase

**Fase 4 — Regras Configuráveis** (permitir trocar modelo sem editar código).

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
