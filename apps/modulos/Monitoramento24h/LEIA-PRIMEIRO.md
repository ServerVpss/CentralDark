# 🛰️ Monitoramento 24h — LEIA PRIMEIRO

Bem-vindo ao **centro de monitoramento** do CentralDark. Aqui moram os "robôs"
(agentes) que vigiam o repositório e a VPS o tempo todo, e te avisam quando algo
acontece. Foi feito pra ser **fácil de entender mesmo sem ser técnico**.

## Como está organizado (a "garagem")

```
Monitoramento24h/
├── agentes/        → cada robô tem a SUA pasta, com nome fácil
├── nucleo/         → o "cérebro" comum que conversa com o painel (Hub)
├── artefatos/      → relatórios e logs de cada robô
├── regras/         → o que cada robô pode/não pode fazer
├── scripts/        → botões prontos (status, parar-todos, backup)
├── PROTECAO.md     → a regra de segurança (senha "Permito pivete")
└── .env            → segredos (fica só aqui, ninguém vê)
```

## Os robôs de hoje

| Pasta (nome fácil) | O que faz | Roda como (PM2) |
|---|---|---|
| `agentes/Guardiao-Notificacoes` | te avisa no Telegram | `CentralDark-TelegramBot` |
| `agentes/Guardiao-Consciencia` | mantém a memória viva do projeto | `guardiao-consciencia` |
| `agentes/Guardiao-Analista` | calcula números (uptime, acertos) | `guardiao-analista` |

## Regrinhas de ouro

1. **Nada aqui muda sem a senha** `Permito pivete` (ver `PROTECAO.md`).
2. **Os robôs sugerem, VOCÊ aprova.** Nada que mexe no sistema roda sem o seu "ok" no painel.
3. **Vai crescer:** dá pra plugar qualquer IA (Claude, GPT, Grok, Mistral…) pelo MCP, e
   adicionar novos sub-módulos aqui dentro.

## Onde eu vejo isso funcionando?

No seu Hub: **https://hub.centralldark.com/** → seção **Monitoramento 24h** (em construção),
com um card por robô, botões de parar/pausar e a fila de "aceitar/rejeitar".
