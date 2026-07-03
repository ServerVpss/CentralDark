# 📚 Relatórios — Arsenal Council

> Aqui fica o **histórico completo** do sistema **Arsenal Council** (Conselho de IAs).
> Cada fase concluída vira um `.md` com data, o que foi feito, onde mexer e como testar.

## 📂 Estrutura

- `README.md` (este arquivo) — índice e roteiro geral
- `fase-3-nucleo-universal-telegram.md` — Orquestrador universal + comandos no @srver1bot
- `fase-4-regras-configuraveis.md` — `regras.json` + `/router status|trocar|testar`
- `fase-6-hermes-autonomo.md` — Cron que aprende sozinho (em construção)
- `fase-5-painel-visual.md` — Card "Conselho Vivo" no status.centralldark.com (em construção)

## 🎯 O que é o Arsenal Council?

Um **Conselho de IAs** que roda por baixo do `@srver1bot` no Telegram. Três modos:

| Modo | O que faz | Tempo |
|------|-----------|-------|
| 🎯 `/router` | 1 IA rápida responde | ~10s |
| ⚡ `/refinar` (parallel) | 3 IAs respondem em paralelo + Juiz sintetiza | ~40s |
| 🔥 `/debate` | 2 IAs debatem em 2 rodadas vendo a resposta uma da outra + Juiz final | ~90s |

Todo debate é salvo em `docs/CONSCIENCIA/ARSENAL/DEBATES/` e replicado no grupo "Central Dark — Grupo Da Evolução".

## 🗓️ Ordem das fases

```
Fase 3 ✅  Núcleo universal + Telegram
Fase 4 ✅  Regras editáveis por Telegram (regras.json + hot-reload)
Fase 6 ⏳  Hermes Autônomo (cron aprendendo sozinho)
Fase 5 ⏳  Painel visual (status.centralldark.com)
```

## 📌 Regra do Pivete

**Todo relatório de qualquer fase mora aqui.** Nada de espalhar em outras pastas.
