# Relatório — API oficial `api.centralldark.com`

Data: 2026-06-09

## Objetivo

Padronizar a rota oficial da API do CentralDark/MultiZap como:

```txt
https://api.centralldark.com
```

## Entregue pelo pacote

- Documento de domínio oficial em `docs/DOMINIOS/API-CENTRALDARK.md`.
- Documentação WhatsApp API atualizada para usar `/v1/whatsapp`.
- Catálogo de rotas públicas/internas no `apps/bot-server`.
- Constantes documentais de domínio/base URL em `CentralDark/apps/bot-server/src/config/api-domain.ts`.
- Atualização opcional do Mega Painel quando o script for executado.

## Segurança

Este pacote não executa ações sensíveis.

Não faz:

- Caddy;
- DNS/Cloudflare;
- SSL;
- Docker/WuzAPI;
- WhatsApp reset/logout;
- banco real;
- CRM;
- secrets.

## Próximo passo

Depois do PR/documentação, criar o adaptador read-only e, quando houver confirmação explícita, validar DNS/Caddy/SSL para a rota pública.
