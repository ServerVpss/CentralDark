# scripts/webhook

Rotinas do Webhook Deploy Seguro do CentralDark.

## Arquivos

- `github-webhook-deploy.mjs`: servidor HTTP local em `127.0.0.1:9300`.
- `deploy-job.sh`: job controlado chamado pelo webhook.

## Regras

- Validar `X-Hub-Signature-256` com HMAC SHA256.
- Aceitar deploy somente para `push` em `refs/heads/main`.
- Nunca executar comando vindo do payload.
- Secret fica fora do repo em `/root/CentralDark/secrets/webhook.env`.
- Logs completos ficam em `/root/Multizap/revisoes/YYYYMMDD-HHMMSS/webhook-deploy/`.

