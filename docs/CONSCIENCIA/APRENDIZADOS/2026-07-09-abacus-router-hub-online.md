---
title: "2026 07 09 Abacus Router Hub Online"
date: 2026-08-27
tags: ["consciencia"]
updated: 2026-08-27
---

# 🟢 Ouro — Abacus Router no HUB Supabase (ONLINE)

**Data:** 2026-07-09
**Autor:** Lovable (via SSH + Management API)

## O que foi feito

### (A) ABACUS_API_KEY configurada no HUB Supabase ✅
- Chave real `s2_7…ed9c` (35 chars) lida de `/root/CentralDark/secrets/.env` na VPS.
- Setada como secret do projeto HUB (`lyoigsqluyktoclwdaft`) via Supabase Management API:
  `POST https://api.supabase.com/v1/projects/lyoigsqluyktoclwdaft/secrets`
  com PAT do Lovable (`HUB_SUPABASE_PAT`), payload **array** `[{name,value}]`.
- `abacus-router` redeployado via `supabase functions deploy abacus-router --no-verify-jwt`.
- Evidência: `GET /abacus-router/status` →
  `{"keyConfigured":true,"keyHint":"ed9c","modelCount":134}`.

### (B) Reapontamento Caddy → HUB — NÃO executado (motivo técnico) ⚠️
- `abacus-router` exige **user JWT do Supabase** em `/models`, `/logs`, `/set-key`,
  `/v1/chat/completions`. Só `/status` é público.
- Reapontar `api.centralldark.com/v1/models` cru pra ele quebra qualquer cliente
  OpenAI-compat (bots, scripts, IDE) que não faça `auth.getUser` no HUB.
- Solução correta: ajustar o `CentralDark-ArsenalAdapter` (127.0.0.1:8090) pra ir
  direto no Abacus RouteLLM (`https://routellm.abacus.ai/v1`) usando a
  `ABACUS_API_KEY` do `.env`, em vez de bater no `arsenal-proxy` do Lovable Cloud.

## Armadilhas aprendidas

1. **Payload da Management API é array**, não objeto — HTTP 400 se mandar objeto solto.
2. `hub.env`/`.env` no cofre do HUB não existe na VPS; injetar `SUPABASE_ACCESS_TOKEN=<PAT>` inline no SSH.
3. Cache de secret do Supabase: esperar 2-3s antes de bater no `/status`.
4. `abacus-router` só expõe `/status` público — não serve como gateway OpenAI-compat público sem camada de auth adicional.

## Próximos passos sugeridos

- Ajustar `apps/modulos/arsenal-openai-adapter/server.mjs` pra roteamento direto no Abacus quando `ABACUS_API_KEY` presente.
- OU criar rota pública paralela no HUB (`/abacus-router/public/*`) com validação via `X-CentralDark-Key`.

---
_Fluxo de Ouro respeitado: mudança de estado registrada aqui em vez de commit direto na VPS._
