---
title: "Fase 6 Hermes Autonomo"
date: 2026-07-03
tags: ["consciencia"]
updated: 2026-07-03
---

# ✅ Fase 6 — Hermes Autônomo

**Data:** 03/07/2026
**Duração real:** ~40min
**Status:** 🟢 No ar (cron ativo)

## 🎯 O que foi feito

Criei o **Hermes** — um robô que **discute pendências sozinho** todo dia às 6h da manhã, sem você fazer nada. Vira o CentralDark de sistema reativo pra sistema que **pensa em background** e te apresenta propostas prontas.

## 🧠 Como funciona (fluxo)

```
06:00 da manhã (cron)
     ↓
1. Lê docs/PENDENCIAS.md
     ↓
2. Filtra itens 🟡 (média) e 🔴 (alta) que estão em aberto
     ↓
3. Escolhe 1 rotativo (dia-do-ano % total de itens)
     ↓
4. Chama arsenal-council.sh debate → 2 IAs debatem em 2 rodadas + Juiz decide
     ↓
5. Salva proposta em docs/CONSCIENCIA/ARSENAL/EVOLUCAO/YYYY-MM-DD/hermes-<slug>.md
     ↓
6. Manda pro Telegram:
   - Privado do admin: card completo (pendência + veredicto recortado)
   - Canal Status: linha curta ("Hermes analisou 1 pendência")
```

## 📂 Arquivos criados

| Arquivo | Papel |
|---------|-------|
| `docs/CONSCIENCIA/ARSENAL/scripts/hermes.sh` | Cérebro do Hermes (bash) |
| `docs/CONSCIENCIA/ARSENAL/scripts/hermes-notify.mjs` | Envia notificação Telegram (Node) |
| `docs/CONSCIENCIA/ARSENAL/EVOLUCAO/YYYY-MM-DD/` | Onde as propostas ficam salvas |
| `docs/CONSCIENCIA/ARSENAL/hermes.log` | Log de execução |
| **Crontab:** `0 6 * * * hermes.sh` | Dispara diariamente às 6h |

## 🔒 Segurança

- **Só lê e propõe.** Não executa mudanças, não abre PR sozinho, não toca em Caddy, migrations ou VPS.
- Toda proposta fica salva no Git (via sincronia Lovable ↔ VPS) pra você revisar.
- Se o debate falhar, gera `.erro` e Hermes aborta sem quebrar nada.

## 🧪 Como testar / rodar manualmente

Direto na VPS:
```bash
/root/CentralDark/docs/CONSCIENCIA/ARSENAL/scripts/hermes.sh
```

Ver histórico de propostas:
```bash
ls /root/CentralDark/docs/CONSCIENCIA/ARSENAL/EVOLUCAO/
tail -50 /root/CentralDark/docs/CONSCIENCIA/ARSENAL/hermes.log
```

## 📈 Evolução prevista (fases futuras — não incluído aqui)

- Deixar Hermes abrir PR no GitHub automaticamente quando consenso >80%
- Modo "conversa infinita" (cron a cada hora, tema livre sobre CentralDark)
- Painel visual das propostas (isso é a **Fase 5**)

## ⏭️ Próxima fase

**Fase 5 — Painel Visual**: card "Conselho Vivo" em `status.centralldark.com` mostrando debates recentes, últimas propostas do Hermes, botões pra disparar modo/tema pela web.
