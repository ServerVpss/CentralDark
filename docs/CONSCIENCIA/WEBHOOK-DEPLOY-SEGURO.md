---
title: "WEBHOOK DEPLOY SEGURO"
date: 2026-06-29
tags: ["consciencia"]
updated: 2026-06-29
---

# Webhook Deploy Seguro

Este documento registra o desenho oficial para deploy rapido sem GitHub Actions.

## Arquitetura

```txt
GitHub/Lovable push
-> Webhook HTTPS
-> deploy.centralldark.com/github
-> Caddy
-> 127.0.0.1:9300
-> CentralDark-WebhookDeploy
-> valida HMAC SHA256
-> valida branch main
-> lock anti-duplo
-> fila pending
-> deploy-job.sh
-> logs em revisoes
-> validacao de dominios
```

## Seguranca

- O secret nao fica no repo.
- Arquivo local previsto: `/root/CentralDark/secrets/webhook.env`.
- Header obrigatorio: `X-Hub-Signature-256`.
- Algoritmo: HMAC SHA256.
- Evento aceito para deploy: `push`.
- Branch aceita: `refs/heads/main`.
- `ping` assinado responde 200.
- Assinatura ausente ou invalida responde 401.
- Payload nunca vira comando.
- O deploy local decide quais passos executar.

## Arquivos

- `scripts/webhook/github-webhook-deploy.mjs`
- `scripts/webhook/deploy-job.sh`
- `scripts/run-once/instalar-webhook-deploy-seguro.sh`
- `scripts/run-once/testar-webhook-deploy-local.sh`
- `infra/caddy/deploy-centraldark.Caddyfile`

## Como cadastrar webhook no GitHub

Cadastrar somente depois de veredito humano:

- Payload URL: `https://deploy.centralldark.com/github`
- Content type: `application/json`
- Secret: valor local de `/root/CentralDark/secrets/webhook.env`
- Events: `push`
- SSL verification: enabled

Nao colar o secret em chat, issue, commit, PR, painel ou log.

## Como testar

Validacoes locais:

```bash
node --check scripts/webhook/github-webhook-deploy.mjs
bash -n scripts/webhook/deploy-job.sh
bash -n scripts/run-once/instalar-webhook-deploy-seguro.sh
bash -n scripts/run-once/testar-webhook-deploy-local.sh
```

Teste local do endpoint:

```bash
bash scripts/run-once/testar-webhook-deploy-local.sh
```

## Logs

Logs completos:

```txt
/root/Multizap/revisoes/YYYYMMDD-HHMMSS/webhook-deploy/
```

Chat e relatorios devem mostrar apenas resumo sanitizado.

## Desativar PM2

Somente com veredito humano:

```bash
pm2 stop CentralDark-WebhookDeploy
pm2 delete CentralDark-WebhookDeploy
pm2 save
```

## O que pode fazer

- Receber `ping`.
- Receber `push` da `main`.
- Validar assinatura.
- Enfileirar deploy se ja houver execucao.
- Rodar script local controlado.
- Salvar logs sanitizados.

## O que nao pode fazer

- Executar comando vindo do payload.
- Expor secret.
- Fazer Caddy reload sem aprovacao.
- Mexer em Docker, WuzAPI, WhatsApp, banco real, CRM ou PM2 sensivel sem aprovacao.
- Cadastrar webhook real sem veredito.
