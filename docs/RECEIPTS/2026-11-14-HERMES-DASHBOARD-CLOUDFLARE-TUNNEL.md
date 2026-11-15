# Hermes Dashboard — rota HTTPS por Cloudflare Tunnel

## Escopo

Registrar a conexão observada entre o Hermes Dashboard desta máquina e o endereço público usado pelo Hermes Desktop/iPhone.

## Estado observado

```text
DASHBOARD_LOCAL_HOST=127.0.0.1
DASHBOARD_LOCAL_PORT=18787
DASHBOARD_PUBLIC_URL=https://gateway.centralldark.com
DASHBOARD_AUTH_REQUIRED=true
DASHBOARD_AUTH_PROVIDERS=nous|session-token
CLOUDFLARE_TUNNEL_NAME=centraldark-dashboard
CLOUDFLARE_TUNNEL_ID=fe52c8b1-dcc3-46c3-ab75-ee41fa3c3555
DNS_TARGET=fe52c8b1-dcc3-46c3-ab75-ee41fa3c3555.cfargotunnel.com
INGRESS_SERVICE=http://127.0.0.1:18787
```

## Provas funcionais

```text
GET https://gateway.centralldark.com/api/status
→ HTTP 200
→ Content-Type: application/json
→ gateway_running=true
→ auth_required=true

GET https://gateway.centralldark.com/api/auth/ws-ticket
→ HTTP 401
→ Content-Type: application/json
→ reason=no_cookie

GET https://gateway.centralldark.com/login
→ HTTP 200
→ Hermes Agent sign-in page
```

O `401` sem cookie é esperado. Ele prova que a rota chegou ao Gateway correto e que a autenticação permaneceu ativa.

## Segurança

- Nenhum token, certificado ou credencial é versionado.
- O arquivo de credenciais permanece fora do repositório em `/data/.cloudflared/`.
- O Dashboard continua ligado a `127.0.0.1`.
- O DNS do `gateway.centralldark.com` foi apontado para o Tunnel nomeado.
- O túnel rápido temporário foi encerrado.

## Rota reserva Tailscale

O primeiro teste direto pelo Tailscale retornou `HTTP 400` porque o hostname `*.ts.net` não correspondia ao `webapp.public_url` canônico. A correção mantém o Dashboard em loopback e adiciona um proxy local sem alterar a URL pública do Hermes:

```text
Tailscale Serve
→ https://0886c2779b0c.tail89b909.ts.net
→ Caddy 127.0.0.1:18788
→ Hermes 127.0.0.1:18787
```

O Caddy reescreve o `Host` para `gateway.centralldark.com` antes de encaminhar ao Hermes.

```text
GET http://127.0.0.1:18788/api/status
→ HTTP 200 application/json
→ gateway_running=true
→ auth_required=true

Tailscale Serve readback
→ HTTPS 443
→ proxy http://127.0.0.1:18788
```

Arquivos runtime, fora do Git e sem segredos:

```text
/data/.cloudflared/tailscale-fallback.Caddyfile
/data/.cloudflared/dashboard.yml
```

## Limite operacional

```text
CLOUDFLARE_RESOURCE_PERSISTENT=true
TAILSCALE_SERVE_CONFIGURED=true
TAILSCALE_FALLBACK_HOST_COMPATIBILITY=PROVED_LOCAL_PROXY
CLOUDFLARE_PROCESS_CURRENT=true
CADDY_PROCESS_CURRENT=true
SYSTEM_AUTOSTART=false
```

Os recursos Cloudflare e Tailscale são persistentes. Os processos `cloudflared` e Caddy ainda são iniciados manualmente neste container; não há `systemd` ou `sudo` disponíveis para instalar auto-start neste host.

## Uso

Principal:

```text
https://gateway.centralldark.com
```

Reserva dentro do tailnet:

```text
https://0886c2779b0c.tail89b909.ts.net
```

Não usar `:18787` ou `:18788` publicamente.
