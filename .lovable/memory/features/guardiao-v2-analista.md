---
name: Guardião v2 + Analista
description: Arquitetura 2 camadas — Guardião detecta (arquivos, Docker, PM2), Analista deduplica/agrupa/rate-limita e despacha pro Telegram. Mega Painel direto.
type: feature
---

Fonte oficial: `docs/CONSCIENCIA/REGRA-OFICIAL-GUARDIAO-V2-ANALISTA.md`

- Guardião escreve eventos em `infra/guardiao/queue/events.jsonl` (append-only).
- Analista (`guardiao-analista` no PM2) lê a fila e despacha.
- Rate-limit: 5 msgs/60s, cooldown 90s, jitter 5–15s. `critico` ignora rate mas dedupa 60s.
- Dedup por `event.key` com agregação em contador.
- Whitelist PM2 default: `whatsapp-server`.
- Modo `auto` segue travado até 08/07/2026.
