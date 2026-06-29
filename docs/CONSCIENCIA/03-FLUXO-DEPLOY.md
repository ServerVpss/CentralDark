---
title: "03 FLUXO DEPLOY"
date: 2026-06-29
tags: ["consciencia"]
updated: 2026-06-29
---

# 03 — Fluxo de deploy

## Regra principal

**Commit DIRETO na `main`. SEM PR.** Pra mudança normal.

## Como o código chega na VPS

1. **Cron `gh-pull`** — roda a cada 5 minutos, faz `git pull` no repo da VPS. **Funciona.**
2. **Webhook GitHub → VPS** — instantâneo. **HOJE QUEBRADO:** Caddy aponta pra porta 9002, mas o serviço escuta 9000. Já tá registrado em `docs/PENDENCIAS.md`.

Enquanto o webhook não volta, basta esperar até 5 min ou forçar:

```bash
ssh-vps "cd /root/Multizap/apps/clone-deck && git pull"
```

## Quando vira PR + auto-merge

Só pra mudança **crítica**:
- Caddyfile
- Docker
- Banco (migração destrutiva)
- Secrets
- Qualquer coisa que pode derrubar produção

Nesse caso: branch → PR → auto-merge (sem review humana).

## Instalador (regra inviolável)

`install.sh` na raiz + pasta `docs/INSTALADOR/` (README + 12 arquivos numerados).

**Toda mudança** que afete:
- Dependência nova
- Porta
- Variável de ambiente
- Serviço PM2
- Pasta nova
- Rota Caddy
- Migração de banco

→ **ATUALIZA** o arquivo correspondente de `docs/INSTALADOR/` **no MESMO commit**.

Sem isso, o instalador falha em VPS nova.

## GitHub Achievements (farmar medalhas)

Em todo commit em repo público, adicionar trailer:

```
Co-authored-by: SegredoiDev <segredounlock@users.noreply.github.com>
```

Isso conta pra medalha "Pair Extraordinaire".
