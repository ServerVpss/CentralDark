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

## Limite operacional

```text
CLOUDFLARE_RESOURCE_PERSISTENT=true
TUNNEL_PROCESS_CURRENT=true
SYSTEM_AUTOSTART=false
```

O recurso nomeado e o DNS são persistentes. O processo `cloudflared` ainda é iniciado manualmente neste container; não há `systemd` ou `sudo` disponíveis para instalar auto-start neste host.

## Uso

No Hermes Desktop/iPhone, usar somente:

```text
https://gateway.centralldark.com
```

Não usar `:18787` publicamente.
