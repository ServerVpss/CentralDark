# Webhooks e Deploy

## Webhook Deploy Seguro

O caminho planejado para deploy rapido sem consumir GitHub Actions e o Webhook Deploy Seguro com fila.

Arquivos do repo:

- `scripts/webhook/github-webhook-deploy.mjs`
- `scripts/webhook/deploy-job.sh`
- `scripts/run-once/instalar-webhook-deploy-seguro.sh`
- `scripts/run-once/testar-webhook-deploy-local.sh`
- `infra/caddy/deploy-centraldark.Caddyfile`
- `docs/CONSCIENCIA/WEBHOOK-DEPLOY-SEGURO.md`

Servico planejado:

```txt
CentralDark-WebhookDeploy
127.0.0.1:9300
```

Dominio planejado:

```txt
deploy.centralldark.com -> 127.0.0.1:9300
```

Secret local fora do repo:

```txt
/root/CentralDark/secrets/webhook.env
```

Regras:

- HMAC SHA256 obrigatorio.
- Aceitar somente `push` em `refs/heads/main`.
- Usar lock e fila pending.
- Logs completos em `/root/Multizap/revisoes/YYYYMMDD-HHMMSS/webhook-deploy/`.
- Nao aplicar Caddy reload nem cadastrar webhook real sem veredito humano.
