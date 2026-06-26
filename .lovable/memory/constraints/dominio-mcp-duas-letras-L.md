---
name: Domínio oficial do MCP — CENTRALLDARK com 2 L
description: O domínio real é centralldark.com (DUAS letras L). centraldark.com (1 L) NÃO EXISTE e dá ERR_NAME_NOT_RESOLVED.
type: constraint
---

# ⚠️ REGRA CRÍTICA DE LETRAS

O domínio oficial registrado e que **realmente resolve no DNS** é:

## ✅ `centralldark.com` ← **DUAS letras L** (centra**LL**dark)

NÃO existe e dá `ERR_NAME_NOT_RESOLVED`:

## ❌ `centraldark.com` ← UMA letra L só (errado, NUNCA usar)

## Onde isso já causou bug real (26/06/2026)

- Arquivo `dist/config.js` linha 23 do MCP na VPS (`/root/CentralDark/apps/modulos/mcp/dist/config.js`) tinha **default hardcoded com 1 L**.
- Como o PM2 não tava carregando o `.env`, caía no default e o `/.well-known/oauth-authorization-server` publicava `issuer`, `authorization_endpoint`, `token_endpoint` e `registration_endpoint` todos com **1 L**.
- Resultado: ao conectar o `mcp_custom_z0d0P` no Lovable, o OAuth redirecionava o browser pra `mcp.centraldark.com` (1 L) → DNS não resolve → tela "Não é possível acessar esse site".
- Fix: `sed -i 's|mcp.centraldark.com|mcp.centralldark.com|g'` no `dist/config.js` + `pm2 restart MCP-CentralDark --update-env` com `.env` carregado.

## Como aplicar (proibido errar de novo)

Ao escrever, gerar, revisar ou colar **qualquer** uma das coisas abaixo, **conferir letra por letra** que tem **2 Ls** em `centralldark`:

- URLs (`https://centralldark.com`, `https://mcp.centralldark.com`, `https://status.centralldark.com`, `https://api.centralldark.com`, `https://telepainel.centralldark.com`, etc).
- Configurações de Caddy, PM2, edge functions, secrets, callbacks OAuth.
- Defaults em código (`opt("...", "https://...centralldark.com")`).
- Comentários e docs.
- Mensagens pro usuário.

**Regex de checagem:** `centraldark` (1 L) **fora** de palavras como `CentralDark1VPS`, `CentralDark-Bolt`, `centraldark-managed` (essas são nomes de repos/diretórios internos, sem `.com` na frente, e estão corretos com 1 L histórico) — **se aparecer `centraldark.com` em qualquer lugar, é bug. Trocar imediatamente.**

**Exceção válida (1 L):** apenas o e-mail `admin@centraldark.com` que tá em backups antigos do Caddy — não usar mais, deve ser `admin@centralldark.com` quando for renovado.
