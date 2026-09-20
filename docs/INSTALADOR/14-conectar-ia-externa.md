# 14 — Conectar uma IA externa ao projeto (ChatGPT / Claude / Cursor)

> **Status atual (2026-06-04):** ✅ ChatGPT conectado e funcional via OAuth GitHub. Claude e Cursor seguem o mesmo passo a passo. OAuth próprio CentralDark fica pra futuro (ver pendência 🟢 baixa).
>
> **Objetivo:** depois que o sistema tá de pé numa VPS nova, qualquer IA externa que você usar (ChatGPT, Claude, Cursor) precisa enxergar a mesma "consciência" que o agente do Lovable enxerga. Esse arquivo explica como conectar, em linguagem leiga.

---


## 🧠 O que é "consciência" aqui?

São 3 arquivos no repo que toda IA deve ler antes de agir:

1. `docs/CONSCIENCIA/CONSCIENCIA.md` → regras invioláveis, tom, permissões
2. `docs/PENDENCIAS.md` → o que tá aberto/fechado
3. `LEIA-ME-IA.md` (raiz) → resumo de 1 página

A ponte que entrega isso pra IA externa é o **MCP CentralDark**, que tá rodando em `mcp.centralldark.com`.

---

## 🔌 Como conectar o ChatGPT

1. Abra ChatGPT → Settings → **Connectors** (ou "Custom Connectors" no plano Pro/Team/Enterprise)
2. Add → MCP Server
3. URL: `https://mcp.centralldark.com/mcp`
4. Autenticação: **OAuth via GitHub** (o MCP já tá configurado com o Client ID; só clica "Authorize" e loga com a sua conta `segredounlock`)
5. Salva
6. Em qualquer chat, ative o connector e teste:

**Pergunta-teste 1:** "qual é a regra de SSH desse projeto?"
→ ChatGPT deve chamar `ler_consciencia` ou `ler_regras_invioláveis` e responder sobre o `setup-vps-ssh.sh`.

**Pergunta-teste 2:** "o que tá pendente?"
→ ChatGPT deve chamar `ler_pendencias` e listar os itens 🔴/🟡/🟢.

Se as duas funcionarem, tá conectado e refletindo a mesma consciência.

---

## 🔌 Como conectar o Claude (Desktop ou Web)

1. Claude → Settings → Connectors → Add custom MCP
2. URL: `https://mcp.centralldark.com/mcp`
3. OAuth: GitHub
4. Mesmas perguntas-teste acima.

---

## 🔌 Como conectar o Cursor

1. Cursor → Settings → MCP → Add Server
2. URL: `https://mcp.centralldark.com/mcp`
3. Transport: streamable HTTP
4. OAuth: GitHub

---

## 🛠️ Ferramentas que o MCP expõe (atalhos de consciência)

### Leitura (chamadas livres, sem confirmação)

| Tool | O que faz |
|---|---|
| `ler_consciencia` | Devolve `docs/CONSCIENCIA/CONSCIENCIA.md` inteiro |
| `ler_pendencias` | Devolve `docs/PENDENCIAS.md` inteiro |
| `ler_regras_invioláveis` | Devolve `LEIA-ME-IA.md` (resumo 1 página) |
| `ler_instalador` | Devolve `docs/INSTALADOR/README.md` (índice do instalador) |

### Escrita (comitam direto na `main` com co-autoria `SegredoiDev`)

| Tool | O que faz | Inputs principais |
|---|---|---|
| `adicionar_pendencia` | Cria item novo em `PENDENCIAS.md`, numera automático | `titulo`, `descricao`, `prioridade` (alta/media/baixa), `comoFechar?`, `ondeMexer?` |
| `fechar_pendencia` | Marca item como `✅ CONCLUÍDO em YYYY-MM-DD` | `numero`, `notaFinal?` |
| `atualizar_consciencia` | **DESTRUTIVO** — substitui seção inteira do `CONSCIENCIA.md` | `numeroSecao` (0..19), `conteudoNovo`, `motivo` |

Exemplo de uso no ChatGPT:
> "anota uma pendência alta: o webhook do Caddy tá apontando porta errada — onde mexer: `/etc/caddy/Caddyfile`"

ChatGPT chama `adicionar_pendencia`, MCP comita no repo, te devolve o link do commit.

Além desses atalhos, o MCP também tem as ferramentas gerais de GitHub (`github_get_file`, `github_list_commits`, `github_list_workflow_runs`, etc) e VPS (em `tools/vps.ts`).

---

## 🔄 Como o ciclo se mantém vivo

```
Lovable (mem://)  ⇄  Repo  ⇄  MCP CentralDark  ⇄  ChatGPT/Claude/Cursor
```

- Eu atualizo a memória aqui no Lovable → escrevo no repo → MCP serve atualizado pro ChatGPT.
- ChatGPT pede pra anotar algo → MCP comita no repo → eu leio na próxima sessão.
- Workflow `atualiza-memoria-consciencia.yml` roda a cada 6h e atualiza o snapshot da VPS no repo.

Ciclo de leitura E escrita fechado dos dois lados.

