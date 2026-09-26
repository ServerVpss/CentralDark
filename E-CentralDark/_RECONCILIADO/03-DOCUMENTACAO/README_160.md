# Deploy automático MultiZap (GitHub → VPS)

Pasta com tudo que sobe o **deploy automático isolado** do MultiZap.
Não compartilha NADA com o deploy do Recargas Brasil (gh-pull / porta 9001).

## Arquivos

- `multizap-github-webhook-listener.js` → instalar em `/root/multizap-github-webhook-listener.js`
- `multizap-gh-pull.sh` → instalar em `/usr/local/bin/multizap-gh-pull` (chmod +x)
- `ecosystem.config.cjs` → PM2 `MultiZap-GitHub-Webhook` (porta 9002)
- `.env.example` → exemplo de `MULTIZAP_GITHUB_WEBHOOK_SECRET`

## Instalação rápida na VPS

```bash
cp multizap-github-webhook-listener.js /root/multizap-github-webhook-listener.js
cp multizap-gh-pull.sh /usr/local/bin/multizap-gh-pull
chmod +x /usr/local/bin/multizap-gh-pull
touch /var/log/multizap-gh-pull.log /var/log/multizap-webhook.out.log /var/log/multizap-webhook.err.log

export MULTIZAP_GITHUB_WEBHOOK_SECRET="cole_aqui_o_secret"
pm2 start ecosystem.config.cjs
pm2 save
```

## Token do GitHub (obrigatório — sem isso o pull pede senha)

O `multizap-gh-pull` autentica no GitHub via HTTPS + Personal Access Token.
O token fica num arquivo local da VPS, **fora do repositório**.

1. Gerar token em https://github.com/settings/tokens
   - Fine-grained, repositório `segredounlock/atendimentoo`
   - Permissão **Contents: Read and write**
2. Na VPS, rodar uma vez só:

```bash
echo 'GITHUB_PAT=ghp_seu_token_aqui' > /root/.multizap-deploy.env
chmod 600 /root/.multizap-deploy.env
```

Pronto. A partir daí `multizap-gh-pull` roda sem pedir nada. Se o token vencer
ou for revogado, só refazer esses dois comandos com o novo token.


## Configuração no GitHub

Settings → Webhooks → Add webhook do repo `segredounlock/atendimentoo`:

- Payload URL: `http://SEU_IP:9002/webhook`
- Content type: `application/json`
- Secret: o mesmo valor de `MULTIZAP_GITHUB_WEBHOOK_SECRET`
- Eventos: somente **push**

## Regras de segurança

- Porta exclusiva **9002** (Recargas usa 9001 — não conflita).
- Secret exclusivo (nunca reusar `WEBHOOK_SECRET` do Recargas).
- Listener só aceita `push` + branch `main` + repo `segredounlock/atendimentoo`.
- `multizap-gh-pull` opera SOMENTE em `/root/Multizap`.
- NUNCA chama `pm2 restart all`, `pm2 kill`, `rm -rf auth_info_baileys`,
  `git reset --hard` em `/root/whatsapp-server`.
