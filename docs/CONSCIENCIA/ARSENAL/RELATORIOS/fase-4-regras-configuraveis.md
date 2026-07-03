# ✅ Fase 4 — Regras Configuráveis por Telegram

**Data:** 03/07/2026
**Duração real:** ~30min
**Status:** 🟢 No ar

## 🎯 O que foi feito

Agora dá pra **trocar qual IA fica em cada slot direto pelo Telegram**, sem mexer em código.

### 1. Arquivo de regras
Novo: `docs/CONSCIENCIA/ARSENAL/regras.json`

Guarda **qual modelo** ocupa cada função:
- `router` — IA rápida do modo /router
- `voz1_pro` — voz 1 do parallel/debate
- `voz2_gpt` — voz 2
- `voz3_flash` — voz 3
- `juiz` — quem dá o veredicto final

Também guarda timeouts e a lista de modelos conhecidos.

### 2. Hot-reload sem restart
Modifiquei `arsenal-council.sh` pra **ler o `regras.json` toda vez que roda**. Trocou o modelo? Próxima `/refinar` já usa o novo. Zero restart.

### 3. Novos comandos no @srver1bot

| Comando | O que faz |
|---------|-----------|
| `/router status` | Mostra o setup atual (modelo por slot + timeouts) |
| `/router trocar <slot> <modelo>` | Troca a IA de um slot na hora |
| `/router testar` | Pinga cada modelo pra ver quem está 🟢/🔴 |

**Exemplo:**
```
/router trocar juiz gpt-5
/router trocar voz1_pro claude-sonnet-4-5
/router status
```

### 4. Handler novo
Arquivo: `apps/bot-telegram/handlers/regras.cjs`

Lê/escreve o `regras.json` com segurança (HTML-escape, valida slot, avisa se modelo é desconhecido).

### 5. Dispatcher esperto
`unified-bot.cjs` foi patchado pra **detectar** se o `/router` veio com subcomando (status/trocar/testar) e mandar pro handler certo, senão cai no modo router normal.

## 🧪 Como testar

No privado do @srver1bot:
```
/router status
/router trocar juiz gpt-5-mini
/router status         (confirma que trocou)
/refinar qualquer tema (agora o juiz é o gpt-5-mini)
/router testar         (roda ping em todos os 5 modelos)
```

## 📂 Onde mexer

- Adicionar novo modelo à lista → `regras.json`, campo `modelos_disponiveis`
- Novo subcomando de regras → `regras.cjs`, função `regrasHandler`
- Timeout diferente → `regras.json`, campo `timeouts`

## ⏭️ Próxima fase

**Fase 6 — Hermes Autônomo**: cron roda todo dia às 6h da manhã, lê `PENDENCIAS.md`, discute sozinho, salva propostas e abre PR no GitHub quando o consenso for alto.
