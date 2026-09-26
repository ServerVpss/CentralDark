# Contabo API — restart (não forense)

Fonte: https://api.contabo.com/ e help.contabo.com (How can I access the Contabo API?).

## Auth
POST https://auth.contabo.com/auth/realms/contabo/protocol/openid-connect/token
grant_type=password
client_id / client_secret / username (API user) / password (API password)
Painel: https://my.contabo.com/api/details

## Restart
1. GET https://api.contabo.com/v1/compute/instances
   Headers: Authorization Bearer, x-request-id (uuid4), Accept application/json
   Lista: data[] ou result[] — checar os dois.
   Alvo CentralDark: ip 89.117.78.124 ou nome contendo central.
2. POST https://api.contabo.com/v1/compute/instances/{instanceId}/actions/restart
   Body: {}  Content-Type application/json
   Alternativa documentada: .../actions/reboot

## Onde NÃO roda
- Hermes local sem CONTABO_* no env
- GitHub Actions self-hosted com runner offline
- Script SETUP forense (MUTATION=0) — só lê

## Onde roda
- Codex/container com os 4 secrets na UI
- Job hosted (ubuntu-latest) depois que os 4 secrets existirem no repo
