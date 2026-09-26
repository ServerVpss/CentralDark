---
title: "RECONECTAR CONECTOR"
date: 2026-07-05
tags: ["consciencia"]
updated: 2026-07-28
---

# Conectar qualquer IA ao MCP CentralDark

> **Vale pra:** ChatGPT, Claude, Grok, Gemini, Cursor, Codex, Copilot ou
> qualquer cliente MCP. **O servidor não olha qual IA está chamando** — não
> existe nenhuma regra por cliente no código. O que muda é o **endereço**
> que você usa.

---

## ⚠️ A parte que mais confunde: existem DOIS endereços

Não é o mesmo link pra tudo. Escolher errado é o motivo nº 1 de "sumiram
ferramentas".

| Endereço | Pra que serve | O que aparece |
|---|---|---|
| `https://mcp.centralldark.com/mcp` | uso normal, leitura | só ferramentas **não destrutivas** |
| `https://mcp.centralldark.com/admin/mcp` | **uso admin (Pivete)** | as não destrutivas **+ `mcp_admin_call`** |

**Por que o `/mcp` esconde coisas:** ele é o endereço comum, e o servidor
corta **todas** as ferramentas destrutivas nele — de propósito. O
`mcp_admin_call` é marcado como destrutivo, então cai nesse corte junto.
Não é bug, não é cache: é o desenho de segurança.

**Regra simples:** se você quer o `mcp_admin_call` e força total, é
`/admin/mcp`. Sempre.

---

## Passo-a-passo (2 minutos, funciona em qualquer cliente)

1. Abre as configurações de conectores/MCP do cliente
   (Settings → Connectors, Settings → Model Context, etc.)
2. Localiza **CentralDark** → clica em **Disconnect** (ou "Remove")
3. Recarrega a página / reinicia o cliente
4. Clica em **Reconnect / Add** e cola o endereço certo:
   - uso normal → `https://mcp.centralldark.com/mcp`
   - **uso admin** → `https://mcp.centralldark.com/admin/mcp`
5. Vai abrir a tela **"Autorizar conector"**. No modo admin ela mostra
   *"✓ Acesso administrativo completo"*. Digite a **senha de admin**.
   - Senha errada → a própria tela avisa **"Senha inválida."**
6. **Abre uma conversa NOVA** — a lista de ferramentas fica presa na
   conversa antiga; continuar a mesma não adianta.

---

## Validar que deu certo

Cola na conversa nova:

```
Roda mcp_admin_status. Depois tenta mcp_admin_call com tool "mcp_status".
```

- **Conectado em `/admin/mcp`:** `mcp_admin_status` responde **e** o
  `mcp_admin_call` existe e executa.
- **Conectado em `/mcp`:** `mcp_admin_status` responde, mas o
  `mcp_admin_call` **não existe** na lista. Isso é o esperado — não é
  defeito, é o endereço errado pro que você quer.

---

## ❌ Dois erros de diagnóstico que já custaram tempo

**1. "O dispatcher está sempre disponível, mesmo se não aparecer na lista."**
Falso. No `/mcp` ele é removido tanto da lista visível quanto da lista
executável. Não dá nem pra chamar às cegas — o servidor responde
"Tool desconhecida".

**2. "Se `/tools.json` mostra mais que o cliente, é cache. Sempre."**
Falso. O `/tools.json` devolve o catálogo **cru, sem filtro nenhum**
(hoje 102). O endpoint `/mcp` **sempre** vai mostrar menos, porque tira as
destrutivas. Esses dois números **nunca** foram feitos pra bater.

> Comparação que vale: `/mcp` com `/mcp` — se você reconectou no mesmo
> endereço e o número caiu, aí sim pode ser cache do cliente.

---

## Como o servidor decide o que mostrar (a regra, em 1 linha)

```
tem escopo admin E está em /admin/mcp?  → mostra não-destrutivas + mcp_admin_call
qualquer outro caso                     → mostra só as não-destrutivas
```

O corte é por **endereço + escopo**, nunca por qual IA está chamando.

---

## Depois de conectado no modo admin

Toda ferramenta destrutiva passa **só** pelo dispatcher, com auditoria
registrada (hash encadeado, não dá pra apagar rastro):

```
mcp_admin_call({ tool: "vault_list", input: {} })
```

Destrutiva exige confirmação literal:

```
mcp_admin_call({
  tool: "admin_vault_write",
  input: { name: "x", content: "y", overwrite: true },
  confirmAdmin: "PERMITO PIVETE"      // ou "CONFIRMO ADMIN"
})
```

Sem a confirmação, nada executa — volta `CONFIRMACAO_ADMIN_NECESSARIA`.

Pra descobrir o que dá pra chamar: `mcp_admin_catalog({})`.

---

## URLs de verificação direta (qualquer IA pode dar fetch)

| URL | O que responde |
|---|---|
| `/health` | `toolCount` e `catalogVersion` do catálogo cru |
| `/tools.json` | lista crua, **sem filtro** — não compare com o cliente |
| `/.well-known/oauth-protected-resource/admin/mcp` | confirma `scopes_supported: ["mcp","admin"]` |

---

## Se ainda não aparecer

1. Confirma o endereço: tem `/admin/mcp` no fim? (`/mcp/admin` **não
   existe** — devolve 404)
2. Confirma que abriu **conversa nova** depois de reconectar
3. Roda `mcp_admin_status` — se responder, a conexão está viva e o que
   falta é só o escopo/endereço admin
4. Token de acesso dura **1 hora**; o refresh dura 30 dias. Se ficou muito
   tempo parado, reconecta

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
