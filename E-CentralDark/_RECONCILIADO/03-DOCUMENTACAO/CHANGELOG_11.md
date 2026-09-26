# Changelog — Atendimento WhatsApp Gateway

## 1.0.3 — 2026-05-27

- **Guardião de URLs (novo):** `scripts/check-production-urls.sh` na raiz do repo CRM bloqueia commits/deploys com URL `lovable.app`/`.dev`/`lovableproject.com`/`atendimentoo.lovable.app`. Exit 1 = deploy NÃO saudável.
- **Corretor automático (novo):** `scripts/fix-production-urls.sh` substitui pelos domínios oficiais (`https://multizap.dev`, `/api/public/wuzapi/webhook`, `https://proxy.multizap.dev`). Nunca toca em `.env`, token, secret, bearer, API key ou service_role.
- **Integração no deploy VPS:** `multizap-gh-pull.sh` agora roda `scripts/multizap-check-production-urls.sh` logo após o sync, antes do `npm ci` e do restart do PM2. Se achar URL proibida, faz `exit 1` e marca o deploy como `failed`.
- **Documentação:** README_DEPLOY.md ganhou seção "Pré-deploy obrigatório — guardião de URLs de produção" com como rodar check, como rodar fix e como interpretar o erro.

## 1.0.2 — 2026-05-27

- **Documentação:** nova regra obrigatória de pós-deploy — sempre validar ENV real do PM2 (`pm2 env $ID`), não confiar só no `.env`.
- **Documentação:** receita oficial pra corrigir drift de dump do PM2 (`delete` + `start` em vez de só `restart --update-env`).
- **Documentação:** URL `*.lovable.app` / `*.lovable.dev` / `*.lovableproject.com` proibida em produção; `MULTIZAP_WEBHOOK_URL` tem que ser `https://multizap.dev/api/public/wuzapi/webhook`.
- **Documentação:** healthcheck `status: degraded`, `URL_PROIBIDA_LOVABLE_PREVIEW` ou `ENV_DIVERGENTE` = deploy NÃO saudável.
- Atualizado: `README_DEPLOY.md`, `README_ROLLBACK.md`, `SECURITY.md`.
- Motivo: incidente confirmado na VPS — `.env` correto mas dump do PM2 segurando `MULTIZAP_WEBHOOK_URL=https://atendimentoo.lovable.app/...`.



## 1.0.1 — 2026-05-20

- WuzAPI: imagem trocada de `ghcr.io/asternic/wuzapi:latest` para `asternic/wuzapi:latest` (Docker Hub — GHCR retornava 404).
- WuzAPI: porta interna do container fixada em 8080 (`127.0.0.1:8081:8080`), eliminando uso de `${WUZAPI_PORT}` no lado do container.
- WuzAPI: adicionadas chaves globais obrigatórias `WUZAPI_GLOBAL_ENCRYPTION_KEY` e `WUZAPI_GLOBAL_HMAC_KEY` no environment.
- TZ agora vem do `.env` com default `America/Sao_Paulo` (antes hardcoded `America/Fortaleza`).
- `.env.example` atualizado: banco renomeado para `wuzapi_multizap`, novas chaves globais listadas, `WUZAPI_PORT=8081`.

## 1.0.0 — 2026-05-20

- Criação inicial do pacote de deploy isolado.
- Node Gateway (Express, porta 3100) com endpoints de conexão, envio e webhook.
- Docker Compose da WuzAPI/Whatsmeow + Postgres dedicado, bind em `127.0.0.1:8081`.
- Scripts: install-docker, start/stop, status, logs, backup.
- Documentação: README_DEPLOY, README_ROLLBACK, SECURITY.
- Isolamento total: nenhuma alteração no Baileys de Recargas Brasil.
