# Reconectar o ChatGPT ao MCP CentralDark

> **Sintoma:** ChatGPT mostra ~39 tools em vez das 73 reais. É cache do conector.

## Passo-a-passo (2 minutos)

1. No ChatGPT: **Settings → Connectors → CentralDark**
2. Clica em **Disconnect**
3. Recarrega a página (F5)
4. Clica em **Reconnect** → autoriza via GitHub (`segredounlock`)
5. **Abre uma conversa NOVA** (o cache fica preso na thread antiga — não adianta continuar a mesma)

## Validar que voltou ao normal

Cola na conversa nova:

```
Roda mcp_admin_status e mcp_admin_catalog. Me fala quantas tools apareceram.
```

Resposta esperada: **73 tools** (ou mais, se adicionamos novas).

## Se ainda não aparecer tudo

Chama qualquer tool via dispatcher fixo:

```
mcp_admin_call({tool: "vault_list", input: {}})
```

O dispatcher **contorna o cache** — funciona mesmo se a tool não aparece na lista visível.

## URLs de verificação direta (o ChatGPT pode fazer fetch)

- `https://mcp.centralldark.com/health` — mostra `toolCount` e `catalogVersion`
- `https://mcp.centralldark.com/tools.json` — lista crua das 73 tools

Se essas duas URLs mostram 73 e o ChatGPT mostra 39 → é cache do cliente. Sempre.
