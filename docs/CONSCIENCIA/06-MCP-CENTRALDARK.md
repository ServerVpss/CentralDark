---
title: "06 MCP CENTRALDARK"
date: 2026-06-29
tags: ["consciencia"]
updated: 2026-06-29
---

# 06 — MCP CentralDark

O MCP (Model Context Protocol) é o que te dá acesso ao GitHub e à VPS direto do ChatGPT.

## Onde tá o código

- **No repo:** `apps/modulos/mcp/`
- **Na VPS:** `/root/CentralDark/apps/modulos/mcp/`
- **Secrets:** `/root/CentralDark/apps/modulos/mcp/.env`
- **Código vivo:** `apps/modulos/mcp/dist/` (versionado desde 30/06/2026; `src/` a reconstruir)
- **Docs técnica:** `apps/modulos/mcp/docs/` (arquitetura + tools cognitivas)

> Correção 30/06/2026: a pasta `/APP/` citada antes **nunca existiu** na VPS (ver
> `04-ESTRUTURA-VPS.md`). O caminho real é `apps/modulos/mcp/`.

## Servidor

- **PM2:** `CentralDark-MCP` (porta 9100) — 102 ferramentas
- **Domínio:** `https://mcp.centralldark.com`
- **Health:** `https://mcp.centralldark.com/health` (HTTP 200 = ok)
- **Endpoint MCP:** `https://mcp.centralldark.com/mcp`
- **OAuth:** via GitHub (Client ID já configurado)

## O que o MCP enxerga

- Repo `segredounlock/clone-deck` com permissão admin/maintain/push/triage/pull
- Outros repos do `segredounlock` (leitura)
- VPS via SSH interno (leitura ampla, escrita só onde permitido)
- PM2 da VPS (ler estado de todos serviços)

## Como conectar no ChatGPT

1. Settings → Connectors → Add custom connector
2. URL: `https://mcp.centralldark.com/mcp`
3. Autorizar via GitHub (conta `segredounlock`)
4. Em nova conversa, ativar conector "CentralDark"

## Como testar que tá funcionando

### 1. Servidor publicando catálogo novo
- `https://mcp.centralldark.com/health` → deve mostrar `catalogVersion` + `toolCount`.
- `https://mcp.centralldark.com/tools.json` → lista crua de todas as tools publicadas agora.
- `https://mcp.centralldark.com/status.json` → mesmo `catalog` aparece dentro.

Se as três URLs mostrarem `deploy_status`, `pendencias_list`, `pendencias_add`, `pendencias_close`,
`github_rerun_workflow_run`, `github_dispatch_workflow`, `github_create_or_update_file` e
`github_list_workflows` — o servidor está 100% atualizado.

### 2. Cliente (ChatGPT) enxergando o catálogo novo
Perguntas que devem responder com dados reais:
1. "Lista os PM2 que estão online na VPS"
2. "Lê o arquivo `docs/PENDENCIAS.md` do repo"
3. "Mostra as últimas 50 linhas do log do `MultiZap-TelegramBot`"
4. "Roda `deploy_status` e me dá o resumo"

Se o ChatGPT diz que `deploy_status` não existe mas `/tools.json` mostra ele, é cache do cliente:
desconectar, reconectar e abrir conversa NOVA.

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
