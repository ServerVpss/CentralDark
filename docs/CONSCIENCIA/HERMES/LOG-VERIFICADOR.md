---
title: "LOG VERIFICADOR"
date: 2026-07-05
tags: ["consciencia"]
updated: 2026-07-05
---

# 🔍 Hermes Log-Verificador — Documentação Oficial

**Criado em:** 05/07/2026
**Local no repo:** `apps/modulos/HERMES-CORE/agents/Log-Verificador/`
**Processo PM2:** `CentralDark-HermesVerificador` (registrar manualmente após sync — NÃO entra em `ecosystem.config.cjs`)

## Por que existe

O ecossistema tem 25 processos PM2. Sem um vigia dedicado, um crash-loop ou
padrão de erro passa despercebido até alguém rodar `pm2 status` manualmente.
O `Auto-Diagnostico` só olha `status`/`restart_time` do `pm2 jlist`, e o
`Deploy-Watcher` só olha commit vs deploy. Ninguém **abria os logs** e olhava
padrões de conteúdo. Agora sim.

## Comportamento em 1 tela

```
loop 60s → escaneia todos PM2
           │
           ├─ status/errored ou crash-loop?  → auto-restart (trava 3/24h) + card
           ├─ padrão suspeito nos logs?      → card + análise IA (DarkAI Gemini)
           ├─ >5 "error/failed/exception"?   → card aviso
           └─ voltou ao normal?              → card ✅ recuperado

a cada 1h → placar horário (✅ OK / ⚠️ aviso / ❌ erro)
```

## Padrões de alerta (case-insensitive)

`FATAL` · `unhandled rejection` · `uncaught exception` · `throw ... Error`
· `ENOSPC` · `EACCES` · `ECONNREFUSED` · `ETIMEDOUT` · `Segmentation fault`
· `out of memory` · `permission denied`

## Anti-abuso

| Trava | Valor |
|-------|-------|
| Cooldown entre restarts do mesmo serviço | 30 min |
| Máx restarts / 24h por serviço | 3 |
| Desduplicação de alerta (chave = serviço+nível+primeira hit) | ativa |

Passou de 3 restarts em 24h ele **desiste sozinho** e manda card pedindo
intervenção humana.

## Integração com a rede especialista

Roda como PM2 próprio, mas usa o **mesmo `utils/notify.mjs` do HERMES-CORE**,
então os cards saem pelo mesmo canal Telegram admin (Card Hermes v1.3) que
o Hermes Core, o Deploy-Watcher e o Auto-Diagnostico usam. Uma família só.

## Como registrar (VPS, após sync GitHub → VPS)

```bash
pm2 start /root/CentralDark/apps/modulos/HERMES-CORE/agents/Log-Verificador/daemon.mjs \
  --name CentralDark-HermesVerificador --time
pm2 save
```

## Como remover (rollback total)

```bash
pm2 delete CentralDark-HermesVerificador && pm2 save
```

Zero impacto no resto — o `ecosystem.config.cjs` (área protegida 🔒) nunca foi
tocado.

## Decisão de design registrada

- **Não** virou missão do Hermes Core (evitar ocupar o `ocupado=true` do loop principal).
- **Não** foi injetado no `orchestrator.mjs` (isola crash — se o vigia morrer, o Hermes segue).
- **Sim** compartilha `utils/notify.mjs` (mesmo canal, mesmo formato de card).
- Auto-restart limitado a 3/24h/serviço pra evitar mascarar bug real com restart infinito.

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
