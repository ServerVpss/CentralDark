# Plano — Enxame Final de Estabilização do HUB

Objetivo: deixar o HUB (`lyoigsqluyktoclwdaft`) rodando com a mesma paridade do projeto atual. O que já funcionava antes tem que continuar funcionando — se algum upstream (ex: VeiculosAPI) estiver fora, não é problema nosso, só garantimos que a rota/edge function responde bonito.

## Fase 1 — Hardening `api-status` 🛠️

Editar `supabase/functions/api-status/index.ts`:
- Antes de `.json()`, validar `response.ok` e `content-type: application/json`.
- Se vier HTML/502/timeout do upstream (veiculosapi.com), retornar `503` com JSON `{ ok:false, upstream:"veiculosapi", status:502, message:"upstream indisponível" }` em vez de estourar 500.
- Adicionar `console.log` estruturado: `[api-status] upstream=... status=... contentType=... latencyMs=...`.

## Fase 2 — Logs no `telegram-webhook` 🔍

Editar `supabase/functions/telegram-webhook/index.ts`:
- Log de entrada: método, path, headers relevantes (sem secret), `update_id`.
- Log de saída: status devolvido + motivo (401/405/200).
- Sem mudar lógica de auth (secret_token continua igual).

## Fase 3 — Caddy: liberar `/bot/webhook` no subdomínio status 🔓

Editar `infra/caddy/landings-centraldark.Caddyfile` no bloco `status.centralldark.com`:
- Adicionar ANTES do `file_server`:
  ```
  handle /bot/webhook {
      reverse_proxy https://lyoigsqluyktoclwdaft.supabase.co {
          header_up Host lyoigsqluyktoclwdaft.supabase.co
          rewrite * /functions/v1/telegram-webhook
      }
  }
  ```
- Fluxo: `caddy validate` → `systemctl reload caddy` → curl POST teste.
- Rollback: `cp` do arquivo original antes da mudança.

## Fase 4 — Enxame de mapeamento + paridade HUB 🐝

3 sub-agentes em paralelo:

**Agente A — Mapeador de Edge Functions**
- Lista os 47 functions no HUB, faz `curl` (OPTIONS + POST vazio) em cada uma.
- Marca: 🟢 responde (mesmo que erro esperado tipo 400), 🔴 não deployada / 500 real.
- Cruza com Lovable Cloud atual pra ver se comportamento bate.

**Agente B — Mapeador de Secrets/Webhooks**
- Confere as 26 secrets no HUB via Management API.
- `getWebhookInfo` Telegram, lista webhooks EFI e MistcPay.
- Reporta qualquer URL ainda apontando pro projeto antigo (`kagejpghnwdfymddwxuf`).

**Agente C — Deploy + Validação**
- Deploya `api-status` e `telegram-webhook` atualizados no HUB.
- Aplica Caddy (Fase 3).
- Smoke test final: `/health-check`, `/telegram-webhook` (POST fake), `/api-status`, `/efi-check-status`, `/misticpay-verify`.

## Fase 5 — Relatório Consolidado 📊

Placar visual (Método Gamificado):
```
Edge Functions HUB    ▓▓▓▓▓▓▓▓▓▓ 47/47 ✅
Secrets HUB           ▓▓▓▓▓▓▓▓▓▓ 26/26 ✅
Webhooks              ▓▓▓▓▓▓▓▓▓░ 2/3  ⚠️
Caddy /bot/webhook    ▓▓▓▓▓▓▓▓▓▓ POST 200 ✅
api-status hardening  ▓▓▓▓▓▓▓▓▓▓ 503 amigável ✅
```
+ lista do que ficou 🟡/🔴 com causa (upstream fora vs bug nosso).

## Detalhes técnicos

- Arquivos tocados: `supabase/functions/api-status/index.ts`, `supabase/functions/telegram-webhook/index.ts`, `infra/caddy/landings-centraldark.Caddyfile` (área protegida — autorização explícita concedida nesta mensagem).
- Nenhum schema DB alterado. Nenhum secret novo. Sem restart de whatsapp-server (fica `stopped`).
- Se algum upstream (VeiculosAPI, iSeek) estiver fora, marcamos 🟡 no relatório com causa "upstream externo" — não é bloqueio.
