# MultiZap — Deploy automático: erros corrigidos

## Arquivos principais

- `multizap-gateway-deploy/deploy-hooks/multizap-gh-pull.sh`
- `multizap-gateway-deploy/deploy-hooks/multizap-github-webhook-listener.js`

## Regras corrigidas

1. `GITHUB_PAT` não é obrigatório se `git fetch origin main` funcionar.
2. Se não existir `package-lock.json`, usar `npm install` em vez de `npm ci`.
3. Antes de reiniciar PM2, carregar `.env` e forçar:
   - `MULTIZAP_WEBHOOK_URL=https://multizap.dev/api/public/wuzapi/webhook`
   - `NODE_ENV=production`
4. Limpar `/root/.pm2/dump.pm2` para remover URL Lovable antiga.
5. Validar ENV real do PM2 via `/proc/<pid>/environ` antes de usar fallback `pm2 env`.
6. Não fazer rollback falso quando URL e `NODE_ENV` estão corretos.
7. Deploy só é sucesso com `/health` status `ok`, `urls_ok=true`, `parity_ok=true` e sem `lovable.app` no ENV real.

## Não tocar

- `/root/whatsapp-server`
- PM2 `whatsapp-server`
- porta `3000`
- webhook antigo `9001`
- Recargas Brasil
- PIX / pagamentos / saldo / recargas
- banco/RLS/secrets/service_role
- WuzAPI Docker/volumes sem autorização

## Comando de instalação na VPS

```bash
cd /root/Multizap-repo || exit 1
git fetch origin main
git reset --hard origin/main

install -m 755   /root/Multizap-repo/multizap-gateway-deploy/deploy-hooks/multizap-gh-pull.sh   /usr/local/bin/multizap-gh-pull

bash -n /usr/local/bin/multizap-gh-pull && echo "SCRIPT OK"
multizap-gh-pull --force
```
