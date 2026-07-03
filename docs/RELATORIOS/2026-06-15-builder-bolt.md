# Relatório — Builder Bolt CentralDark

- **Data:** 2026-06-15
- **Categoria:** preparação segura / Docker / Caddy / handoff
- **Status:** estrutura versionável preparada no repositório; execução real na VPS bloqueada até confirmação operacional.

## Objetivo

Preparar uma instância separada do `bolt.diy` para o futuro construtor visual da CentralDark, acessível futuramente em `https://builder.centralldark.com`, sem tocar no Open WebUI, WuzAPI, WhatsApp, CRM, Supabase, banco real, secrets ou containers antigos.

## O que foi preparado

- Pasta `apps/builder-bolt/` com README, plano, compose e exemplo de ambiente.
- Script `scripts/deploy/install-builder-bolt.sh` para instalação idempotente na VPS.
- Snippet Caddy isolado `infra/caddy/builder.centralldark.com.Caddyfile` apontando para `127.0.0.1:5174`.
- Pendência registrada para ativação real na VPS com confirmação humana.

## Decisões de segurança

- O código upstream do `bolt.diy` será clonado em `apps/builder-bolt/source` somente durante o deploy na VPS.
- O repo CentralDark não versiona secrets nem `.env` real.
- A porta pública não é exposta diretamente; o compose usa bind local `127.0.0.1:5174`.
- Caddy deve ser aplicado em etapa separada com backup, validação e confirmação humana.

## Validações esperadas

Antes da ativação real:

```bash
docker compose -f apps/builder-bolt/docker-compose.yml config
bash -n scripts/deploy/install-builder-bolt.sh
```

Durante a ativação real na VPS, após confirmação:

```bash
cd /root/CentralDark
bash scripts/deploy/install-builder-bolt.sh
curl http://127.0.0.1:5174
```

Depois do Caddy real, também após confirmação:

```bash
caddy validate --config <config-real>
curl -I https://builder.centralldark.com
```

## O que não foi tocado

- Open WebUI e porta `3000`.
- WuzAPI, WhatsApp e sessões.
- CRM, Supabase e banco real.
- Secrets, `.env` real, tokens, chaves e arquivos sensíveis.
- Containers existentes.
- Reload real do Caddy.

## Próximo passo

Pedir confirmação humana específica para executar Docker na VPS. Depois de validar o HTTP local, pedir nova confirmação para aplicar Caddy com backup e reload controlado.
