# Segurança — Deploy MultiZap

## Gateway em HTTPS obrigatório (proxy.multizap.dev)
- Frontend NUNCA chama o Gateway direto. Toda chamada passa por server function Lovable com `requireSupabaseAuth` + checagem `workspace_members`.
- `MULTIZAP_GATEWAY_URL` e `MULTIZAP_GATEWAY_TOKEN` ficam só em `process.env` no servidor (lido dentro do `.handler()`).
- Endpoint público HTTP `http://89.117.78.124:3100` está DEPRECADO — não usar mais em código, integração nem ferramenta externa.
- Caddy força redirect 301 HTTP→HTTPS e injeta HSTS (`max-age=31536000; includeSubDomains`).

## Rollback do checkpoint QR MultiZap (REGRA)
**NUNCA voltar `MULTIZAP_GATEWAY_URL` para `http://89.117.78.124:3100`.** Isso quebra chamadas via Cloudflare/Lovable (mixed content em página HTTPS + bloqueio SSRF a IP literal), expõe o IP da VPS e contradiz a regra de endpoint deprecado acima.

Rollback correto, em ordem de preferência (manter `MULTIZAP_GATEWAY_URL=https://proxy.multizap.dev` em todos os casos):
1. Reverter o último commit do `src/components/whatsapp/WhatsAppQrConnectionModal.tsx`.
2. Ocultar temporariamente o card "WhatsApp QR MultiZap" no frontend.
3. Desligar somente a feature flag do QR, se existir.

NÃO tocar em: Caddy, WuzAPI, Docker, MultiZap-Gateway, Recargas Brasil, `/root/whatsapp-server`, PM2 `whatsapp-server`, porta 3000, webhook 9001.


## Regra de exposição de tokens (Gateway → Frontend)
- **NUNCA** retornar em resposta pública: `WUZAPI_ADMIN_TOKEN`, `wuzapi_token` (token de sessão por conexão), `MULTIZAP_WEBHOOK_SECRET`, `WUZAPI_WEBHOOK_SECRET`.
- `connectionService.redact()` remove `wuzapi_token` de toda resposta de `listConnections`/`createConnection`.
- `safeLog` mascara qualquer chave que contenha `token|secret|auth|password|apikey` antes de logar.
- Tokens internos persistem em `gateway/data/connections.json` (necessário para chamar a WuzAPI), mas o arquivo nunca é servido por HTTP.


## Rotação obrigatória antes do primeiro QR real
Enquanto não houver sessões WhatsApp nem dados de produção, rotacionar:
- `MULTIZAP_GATEWAY_TOKEN`
- `WUZAPI_ADMIN_TOKEN`
- `WUZAPI_GLOBAL_ENCRYPTION_KEY` (só enquanto não houver sessão — se rotacionar depois invalida sessões cifradas)
- `WUZAPI_GLOBAL_HMAC_KEY` (mesma regra)
- `POSTGRES_PASSWORD` (só enquanto banco estiver vazio)

Nunca colar secrets em chat, log ou commit. Geração: `openssl rand -hex 32`.



## Tokens (todos NOVOS, exclusivos do MultiZap)

- `MULTIZAP_GATEWAY_TOKEN` — Bearer que o CRM envia ao Gateway (porta 3100).
- `MULTIZAP_WEBHOOK_SECRET` — o Gateway envia esse header para o CRM.
- `WUZAPI_ADMIN_TOKEN` — token administrativo da WuzAPI local.
- `WUZAPI_GLOBAL_ENCRYPTION_KEY` — chave global de criptografia das sessões WuzAPI (gerar com `openssl rand -hex 32`).
- `WUZAPI_GLOBAL_HMAC_KEY` — chave global HMAC pra assinar payloads internos da WuzAPI (gerar com `openssl rand -hex 32`).
- `WUZAPI_WEBHOOK_SECRET` — assinatura dos webhooks da WuzAPI → Gateway.
- `MULTIZAP_GITHUB_WEBHOOK_SECRET` — secret do webhook do GitHub (porta 9002).

**Proibido** reaproveitar qualquer token/secret do Recargas Brasil
(`SERVER_TOKEN`, `WEBHOOK_SECRET`, etc.).

## Onde os segredos vivem

- `.env` reais ficam **somente** na VPS (`/root/Multizap/gateway/.env`,
  `/root/Multizap/wuzapi/.env`).
- O repositório só guarda `.env.example`.
- O `multizap-gh-pull` **nunca** sobrescreve esses `.env` (rsync usa `--exclude`).

## Isolamento de rede

- WuzAPI escuta em `127.0.0.1:8081` (loopback). Nada exposto na internet.
- Gateway escuta em `3100` (pode ficar atrás de Nginx + TLS, se necessário).
- Webhook MultiZap escuta em `9002` (Recargas usa 9001).
- Recargas Baileys continua na porta `3000` — **não tocar**.

## Comandos PROIBIDOS

- `pm2 restart all`, `pm2 stop all`, `pm2 delete all`, `pm2 kill`
- `rm -rf auth_info_baileys`
- `git reset --hard` em `/root/whatsapp-server`
- Qualquer escrita em `/root/whatsapp-server` ou `/root/whatsapp-server-OLD-*`

O script `scripts/check-safety.sh` faz varredura do pacote para garantir
que nenhuma dessas referências entrou em arquivos executáveis.

## Validação da assinatura GitHub

O listener valida `x-hub-signature-256` com `crypto.timingSafeEqual`.
Requisições sem assinatura válida recebem `401` e não disparam o deploy.

## Lock de concorrência

`flock -n /tmp/multizap-gh-pull.lock` evita 2 deploys simultâneos.

## Deploy falha-cedo (fail-fast)

Desde o teste real de 2026-05-20, o `multizap-gh-pull` **aborta com `exit 1`** se qualquer um destes falhar:

- `start-wuzapi.sh` (variáveis ausentes, `docker compose up` falhou, ou porta `127.0.0.1:8081` não respondeu em 60s)
- `pm2 restart MultiZap-Gateway`
- `curl http://127.0.0.1:3100/health`

Nada de "AVISO seguindo". Deploy só fica `concluído com sucesso` se WuzAPI **e** Gateway estiverem respondendo.

## Preservação de dados no deploy

- `start-wuzapi.sh` usa `docker compose up -d --remove-orphans`. **Nunca** usa `-v`, `down -v`, `volume rm` ou qualquer comando que apague volumes.
- Volumes `wuzapi-multizap-data` e `wuzapi-multizap-files` guardam sessões WhatsApp e arquivos — preservados em todo deploy.
- `rsync` no pull preserva `gateway/.env`, `wuzapi/.env`, `gateway/data/` e `gateway/logs/`.

## O que o deploy NUNCA toca

- `/root/whatsapp-server` (Recargas Brasil)
- PM2 `whatsapp-server`
- porta `3000`
- webhook `9001` e seu gh-pull
- Nenhum `pm2 restart all` / `pm2 stop all` / `pm2 kill`.

## Tokens de sessão WuzAPI
- Gerados pelo Gateway (32 bytes hex) e persistidos apenas em `gateway/data/connections.json` (chmod 600 recomendado).
- Nunca retornados em respostas HTTP (`redact()` filtra `session_token` e `wuzapi_token`).
- Nunca logados (passam por `safeLog` que mascara qualquer chave contendo `token`/`secret`/`auth`).
- Ao deletar conexão, `DELETE /admin/users/:id` invalida o token no WuzAPI.
