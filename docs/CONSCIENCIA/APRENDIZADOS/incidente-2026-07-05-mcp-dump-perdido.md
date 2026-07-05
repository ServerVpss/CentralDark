---
title: "Incidente 2026 07 05 Mcp Dump Perdido"
date: 2026-07-05
tags: ["consciencia"]
updated: 2026-07-05
---

# 🚨 Incidente 05/07/2026 — MCP caiu e dump.pm2 foi sobrescrito

## Causa raiz
1. MCP-CentralDark crashou (ver logs anteriores).
2. Durante o incidente, algum comando/script rodou `pm2 save` **enquanto só 7 processos estavam vivos** → o `/root/.pm2/dump.pm2` foi sobrescrito com apenas esses 7, perdendo permanentemente o mapa dos ~18 processos restantes (HubBot, LovableProxy, Memoria, EliteHTTP, ArsenalProxy, PiveteSync, HermesThinker, etc).
3. `pm2 resurrect` deixou de restaurar tudo automaticamente.

## Resolução (método arsenal validado)
Aplicado o `PLAYBOOK-RESSUSCITACAO-PM2.md`:
- Diagnóstico via SSH remoto (sem tocar em nada)
- Descoberta módulo-por-módulo (main/ecosystem/start.sh)
- Subida em enxame (12 daemons restaurados)
- Fixes acessórios: dotenv em ecosystem pro LovableProxy/PiveteSync

## Placar final
- 🟢 12 online (MCP, Hermes, HubBot, HermesThinker, Memoria, ArsenalProxy, PiveteSync, ArtifactsCrafter, ArtifactsBuilder, ArsenalAdapter, GraphPanel, GrafoVivo)
- 🟡 2 pendentes:
  - LovableProxy: falta `LOVABLE_API_KEY` no `.env` do módulo
  - EliteHTTP: venv `/root/dark/venv` foi apagado, precisa recriar

## Regra permanente
**NUNCA rodar `pm2 save` durante um incidente.** Backup antes com `cp dump.pm2 dump.pm2.bak.$(date +%s)`. Ver PLAYBOOK.

## Blindagem instalada
- `scripts/socorro-pm2.sh` — ressuscitação automática segura (backup → subir só o que falta → só salva se 100% ok → registra falha + Card Telegram)
- Documentação no cérebro vivo: `docs/CONSCIENCIA/HERMES/PLAYBOOK-RESSUSCITACAO-PM2.md`
