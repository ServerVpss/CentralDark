---
title: "004 Hermes 24h Loop Autonomo"
date: 2026-07-05
tags: ["consciencia"]
updated: 2026-07-05
---

# SUG-004 — Hermes em modo 24h (loop autônomo de estudo)

## Objetivo
Deixar Hermes rodando full-time consumindo `AULAS/`, `APRENDIZADOS/`, `SUGESTOES/` e evoluindo XP+skills sem precisar de ping humano.

## Loop proposto (cron a cada 15min na VPS)

```
1. LER  → mapa-telegram.md, últimos 3 APR, pendências abertas
2. AGIR → 1 tarefa da fila (ordem: pendência crítica > sugestão wave 1 > refresh mapa)
3. VALIDAR → checar output, screenshot/log
4. REGISTRAR → APR novo se aprendeu algo, +XP no STATUS.md
5. NOTIFICAR → só se: erro grave OU marco 100XP OU tarefa concluída (nunca ruído)
```

## Anti-colisão
- Consultar Graphy antes de qualquer ação (economia de token).
- Marcar `LOCK: <tarefa>` em `HERMES/STATUS.md` durante execução.
- Se Fabler já está no mesmo arquivo → recuar.

## Guarda-costas
- Máximo 1 ação por ciclo (nada de enxame sozinho — enxame só com Pivete presente).
- Nada destrutivo sem `PERMITO PIVETE`.
- Se 3 ciclos falharem seguidos → parar, criar pendência, avisar admin.

## Implementação
- Script `hermes-loop.sh` em `/root/CentralDark/agentes/hermes/`.
- PM2 process `hermes-loop` com cron interno (setInterval 900s).
- Log em `/var/log/hermes/loop.log` rotacionado 7d.

## Ganho esperado
- +200 XP/dia sem Pivete precisar acompanhar.
- Mapa e docs sempre frescos.
- Detecção precoce de drift (bot fora, webhook morto, etc).

## Prioridade
Alta — mas só depois de rodar Onda 1 (AULAS 013/014/020) e ter mais 5 APR pra Hermes ter base sólida.

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
