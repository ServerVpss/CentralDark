---
title: "MCP FLUXO"
date: 2026-07-05
tags: ["consciencia"]
updated: 2026-07-05
---

# 🔒 MCP OAuth — Fluxo Oficial (onde cada coisa roda)

> Fonte da verdade: **VPS**. Nada de secret desse fluxo mora na Lovable Cloud.

## Fluxo end-to-end
```
ChatGPT / Claude / cliente
        │
        ▼
https://mcp.centralldark.com/authorize
        │
        ▼ (Caddy)
127.0.0.1:9100  ← Node.js
        │
        ▼
/root/CentralDark/apps/modulos/mcp/dist/index.js
        │
        ▼ lê
/root/CentralDark/apps/modulos/mcp/.env
        │
        ▼ senha vem de
/root/CentralDark/secrets/mcp-admin.password   (chmod 600 — VAULT)
```

## Localização exata

| Item                     | Onde fica                                                     |
|--------------------------|---------------------------------------------------------------|
| Domínio público          | `mcp.centralldark.com` (Caddy → 127.0.0.1:9100)              |
| Processo                 | PM2 id **17** — `CentralDark-MCP`                            |
| Binário                  | `/root/CentralDark/apps/modulos/mcp/dist/index.js`           |
| CWD                      | `/root/CentralDark/apps/modulos/mcp`                         |
| Porta interna            | **9100** (`MCP_PORT`)                                        |
| .env (usado pelo processo)| `/root/CentralDark/apps/modulos/mcp/.env`                    |
| Vault da senha admin     | `/root/CentralDark/secrets/mcp-admin.password` (chmod 600)   |
| Script de sync           | `/root/CentralDark/scripts/mcp/sync-mcp-password.sh`         |
| Script de status         | `/root/CentralDark/scripts/mcp/check-mcp-status.sh`          |
| JSON exposto ao painel   | `/root/CentralDark/apps/modulos/status/mcp-status.json`      |
| Cron do status           | `* * * * *` (roda a cada minuto)                             |

## Operação

**Trocar a senha admin:**
```bash
echo "NOVA_SENHA" > /root/CentralDark/secrets/mcp-admin.password
chmod 600 /root/CentralDark/secrets/mcp-admin.password
/root/CentralDark/scripts/mcp/sync-mcp-password.sh
```

**Checar status manualmente:**
```bash
/root/CentralDark/scripts/mcp/check-mcp-status.sh | jq
```

## Regras invioláveis

- ❌ **NUNCA** salvar `MCP_ADMIN_PASSWORD` na Lovable Cloud (o processo não lê de lá).
- ❌ **NUNCA** editar `.env` na mão sem passar pelo `sync-mcp-password.sh`.
- ✅ Rotacionar senha: sempre pelo vault → sync script.
- ✅ Após qualquer sync/restart: `pm2 save` (o script já faz).

## Semáforo do painel

- 🟢 **ok** — PM2 online + senha carregada + `/authorize` sem "ausente"
- 🟡 **senha_nao_carregada** — processo up mas `.env` não foi injetado (rodar sync)
- 🔴 **falha** — processo caído ou domínio fora do ar

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
