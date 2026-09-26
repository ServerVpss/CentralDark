# Segurança — Atendimento WhatsApp Gateway

## Tokens

- `MULTIZAP_GATEWAY_TOKEN` — exigido em `Authorization: Bearer ...` em TODAS as rotas exceto `/health` e `/webhooks/wuzapi`.
- `WUZAPI_ADMIN_TOKEN` — usado só no Gateway → WuzAPI. **Nunca** sai do servidor.
- `WUZAPI_WEBHOOK_SECRET` — exigido em `X-Wuzapi-Secret` no webhook de entrada.
- `MULTIZAP_WEBHOOK_SECRET` — enviado em `X-Gateway-Secret` no encaminhamento ao CRM. O CRM deve validar.

Trocar TODOS os tokens antes do primeiro deploy. Usar mínimo 32 chars aleatórios (`openssl rand -hex 32`).

## Portas e isolamento

- WuzAPI bind em `127.0.0.1:8081` — não exposta publicamente.
- Gateway escuta `0.0.0.0:3100`. Recomendado proxy reverso com TLS (ver `wuzapi/nginx.conf.example`).
- Postgres da WuzAPI fica na rede Docker `atendimento-wuzapi-net` — sem porta publicada.
- Nada compartilhado com Baileys Recargas Brasil (`/root/whatsapp-server`, porta 3000, PM2 `whatsapp-server`).

## Logs

- Logger sanitiza chaves contendo `token`, `secret`, `password`, `authorization`, `apikey`.
- Tokens nunca aparecem completos em logs (máscara `abc…xyz`).
- Logs PM2 em `gateway/logs/{out,err}.log`.

## Rate limit anti-ban

- Atraso mínimo entre envios por conexão: `RATE_LIMIT_MIN_DELAY_MS` (default 1500ms).
- Máximo por minuto por conexão: `RATE_LIMIT_MAX_PER_MINUTE` (default 20).
- Envio bloqueado se a conexão não estiver `connected`.
- Telefone validado antes de enviar.

## Webhooks

- `/webhooks/wuzapi` exige `X-Wuzapi-Secret` correto.
- Encaminhamento para o CRM inclui `X-Gateway-Secret` — o CRM deve rejeitar requisições sem esse header.

## URL do CRM em produção — regra crítica

`MULTIZAP_WEBHOOK_URL` em produção **SEMPRE** tem que ser:

```
https://multizap.dev/api/public/wuzapi/webhook
```

**Proibido em produção** (URLs de preview Lovable):

- `*.lovable.app`
- `*.lovable.dev`
- `*.lovableproject.com`
- `atendimentoo.lovable.app`

URL de preview não tem garantia de estar publicada, pode mudar de host, não passa por DNS estável e quebra integrações que assinam payload com a URL canônica.

O healthcheck `GET /health` rejeita produção com URL de preview:
- `status: degraded`
- `urls_ok: false` / `parity_ok: false`
- `URL_PROIBIDA_LOVABLE_PREVIEW`
- `ENV_DIVERGENTE`

Qualquer um desses sinais = deploy **não saudável**. Corrigir antes de seguir.

### Conferência obrigatória pós-deploy

Não confie apenas no `.env`. O **dump do PM2** pode estar segurando env antigo mesmo depois de `pm2 restart --update-env`. Sempre rodar:

```bash
ID=$(pm2 id MultiZap-Gateway | tr -d '[] ')
pm2 env "$ID" | grep -E 'MULTIZAP_WEBHOOK_URL|NODE_ENV|LOG_LEVEL'
```

Receita completa pra corrigir drift de dump: ver `README_DEPLOY.md` → "Pós-deploy obrigatório — validar ENV real do PM2".

## O que NÃO está neste pacote

- SSH automático na VPS.
- Senhas de banco do CRM.
- Tokens de Recargas Brasil.
- Qualquer chamada a `eval` ou execução dinâmica de código.
