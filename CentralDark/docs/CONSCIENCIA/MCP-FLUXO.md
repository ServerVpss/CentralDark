---
title: "MCP FLUXO"
date: 2026-07-05
tags: ["consciencia"]
updated: 2026-09-03
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

## 🪡 WebMCP / Fragment Bridge — mesma Casa, sem segundo MCP

Material WebMCP, bundles de navegador e envelopes JSON entram como **fonte de capacidade/proveniência**, nunca como nova autoridade ou novo cérebro. O contrato executável desta costura vive em:

`docs/CONSCIENCIA/04-MCP-E-CONECTORES/WEBMCP-FRAGMENT-BRIDGE.yml`

O consumidor determinístico vive em:

`.agents/skills/knowledge-compiler/scripts/fragment-bridge.mjs`

Fluxo:

```text
WEB PAGE / BUNDLE / SESSION JSON
→ HASH + PROVENIÊNCIA
→ SECRET SCREEN
→ EXTRAÇÃO DE TOOL/SÍMBOLOS
→ DEDUP_BY_HASH
→ KNOWLEDGE COMPILER
→ METACOGNIÇÃO OPERACIONAL
→ OWNER EXISTENTE
→ MCP QUANDO A CAPACIDADE FOR TOOL/CONNECTOR
→ TESTE
→ CONTRAPROVA
→ CRISTAL
```

WebMCP observado expõe o padrão de ferramenta de página (`ModelContext`, `ScriptTool`, registro imperativo/declarativo, schema, cancelamento e telemetria). A CentralDark absorve **a capacidade**, não copia um segundo runtime de navegador.

```text
WEBMCP_IS_CAPABILITY_NOT_NEW_BRAIN=true
WEBMCP_IS_NOT_SECOND_MCP=true
SOURCE_IS_PROVENANCE_NOT_AUTHORITY=true
RAW_BUNDLE_IS_NOT_RUNTIME_PROOF=true
TOOL_DECLARATION_IS_NOT_TOOL_EXECUTION_PROOF=true
```

Estado de conector também fica fail-closed e separado:

```text
UNKNOWN | CONNECTED | SYNCING | SYNCED | PARTIAL | FAILED | NOT_SYNCED

CONNECTED != SYNCHRONIZED
SYNCING != PASS
PARTIAL != PASS
SYNCED exige evidência aplicável
```

`MRP` literal permanece `UNRESOLVED`; não criar componente a partir de token não provado.

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
