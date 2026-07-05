---
title: "RECONECTAR CONECTOR"
date: 2026-07-05
tags: ["consciencia"]
updated: 2026-07-05
---

# Reconectar qualquer IA ao MCP CentralDark

> **Vale pra:** ChatGPT, Claude, Grok, Gemini, Cursor, Codex, Copilot ou qualquer cliente MCP.
> **Sintoma:** A IA mostra menos tools do que o servidor publica (ex: 39 em vez de 73). É cache do conector no lado do cliente.

## Passo-a-passo (2 minutos, funciona em qualquer cliente)

1. Abre as configurações de conectores/MCP do cliente (Settings → Connectors, Settings → Model Context, etc)
2. Localiza **CentralDark** → clica em **Disconnect** (ou "Remove")
3. Recarrega a página / reinicia o cliente
4. Clica em **Reconnect / Add** → URL `https://mcp.centralldark.com/mcp` → autoriza via GitHub (`segredounlock`)
5. **Abre uma conversa NOVA** — o cache do `tools/list` fica preso na thread antiga, não adianta continuar a mesma

## Validar que voltou ao normal

Cola na conversa nova:

```
Roda mcp_admin_status e mcp_admin_catalog. Me fala quantas tools apareceram.
```

Resposta esperada: **73 tools** (ou mais, se novas foram adicionadas).

## Se ainda não aparecer tudo

Qualquer tool pode ser chamada via dispatcher fixo, ignorando o cache:

```
mcp_admin_call({tool: "vault_list", input: {}})
```

O dispatcher está sempre disponível — funciona mesmo se a tool não aparece na lista visível do cliente.

## URLs de verificação direta (qualquer IA pode dar fetch)

- `https://mcp.centralldark.com/health` — mostra `toolCount` e `catalogVersion`
- `https://mcp.centralldark.com/tools.json` — lista crua de todas as tools

Se essas URLs mostram 73 e o cliente mostra 39 → é 100% cache do cliente. Sempre.
