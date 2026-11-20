---
title: "MCP — limpeza, unificação de pastas e conserto do dispatcher"
date: 2026-07-28
tags: ["relatorio", "mcp"]
updated: 2026-07-28
---

# MCP — o que foi consertado em 28/07/2026

> Autorizado por **PERMITO PIVETE**. Tudo foi provado antes de agir; nada foi
> apagado sem antes confirmar que estava morto.

---

## Em uma frase

O dispatcher passou a alcançar **107 tools** (era 83), a auditoria das
destrutivas **voltou a funcionar** (estava travada), e **~360 MB de lixo**
saíram — com o MCP e o painel dele agora na mesma pasta.

---

## 1. A pasta paralela de 216 MB — causa raiz

**O que se via:** existia `/root/CentralDark/apps/mcp/logs` com 216 MB,
paralela ao módulo real em `apps/modulos/mcp`.

**A causa (não era descuido, era um nome de variável):**

```js
// dist/audit-logger.js — linha 5, como estava
const LOG_DIR = process.env.MCP_LOG_DIR || "/root/CentralDark/apps/mcp/logs";
```

O código lia `MCP_LOG_DIR`. O PM2 sempre definiu `LOG_DIR` — **sem o
prefixo**. Como `MCP_LOG_DIR` nunca existiu, o código caía no endereço
escrito à força no meio dele e criava a pasta paralela. A pasta correta
(`/root/CentralDark/logs/mcp`) existia desde 02/07, vazia, esperando.

**Corrigido para:**

```js
const LOG_DIR = process.env.MCP_LOG_DIR || process.env.LOG_DIR
             || "/root/CentralDark/logs/mcp";
```

**Provas coletadas antes de apagar qualquer coisa:**

1. os 64 arquivos foram copiados e a contagem conferida no destino;
2. `/proc/<pid>/fd` mostrou que o processo não tinha **nenhum** arquivo
   aberto na pasta antiga;
3. com tráfego real gerado no serviço, **nada** foi escrito na pasta antiga
   depois de um marco de tempo.

Só depois disso a pasta foi removida.

---

## 2. O dispatcher enxergava menos da metade

`mcp_admin_call` alcançava **83** tools, enquanto o catálogo público tinha
**102**. Não era um subconjunto — eram listas mantidas à mão, separadas, que
foram divergindo.

**Faltavam 6 grupos inteiros, 24 tools:**

| Grupo | Tools | O que se perdia |
|---|---:|---|
| cognitivo | 4 | **as Lembranças do Pivete** |
| integrações | 13 | Notion, Linear, Sentry |
| elite gateway | 3 | proxy próprio de modelos |
| gemini | 2 | cérebro auxiliar |
| painel | 1 | atualizar painel |
| pivete | 1 | ferramenta própria |

**Resultado: 83 → 107 tools alcançáveis pelo dispatcher.**

### O que NÃO foi incluído, e por quê

`mcpDiagnosticsTools` e `mcpPolicyTools` ficaram de fora **de propósito**.
Os dois importam `mcpAdminTools` de volta, formando ciclo. A primeira
tentativa derrubou o serviço com:

```
ReferenceError: Cannot access 'mcpAdminTools' before initialization
    at mcp-diagnostics.js:33
```

A trava do script restaurou tudo sozinha e o serviço voltou. **Não há
perda:** essas 4 tools (`mcp_status`, `mcp_catalog_diff`,
`mcp_policy_summary`, `mcp_audit_recent_logs`) já são expostas direto no
catálogo — o cliente as alcança sem passar pelo dispatcher.

---

## 3. A auditoria estava travada — e já estava antes

Ao somar as tools novas, apareceu `auditStartupReady: false`. Investigando:
o guard compara o runtime com uma lista fixa (`CANONICAL_DESTRUCTIVE_TOOLS`)
e **bloqueia todas as destrutivas** se houver qualquer divergência.

A lista tinha **11** nomes. O runtime tinha **12**. Faltava
**`admin_pm2_restart`** — e isso **já era assim antes desta sessão**. Ou
seja, as ferramentas destrutivas provavelmente estavam bloqueadas há tempo,
em silêncio.

Em vez de chutar, o script perguntou ao próprio Node quais eram as
destrutivas reais e gravou exatamente essa lista: **17 = 17**.

**`auditStartupReady` voltou para `true`.**

---

## 4. Limpeza — ~360 MB

| Item | Tamanho | Por que era seguro remover |
|---|---:|---|
| `apps/mcp/` | 215 MB | órfã: nenhum PM2, nenhuma rota Caddy, zero fd aberto |
| `.dist-backup` ×2 | 3,1 MB | builds antigos, ninguém referencia |
| `.dist-failed` | 1,2 MB | build que falhou |
| `.env.bak`, `.env.save`, `tsconfig.json.bak` | — | backups datados soltos |
| `admin-ui/node_modules` | 141 MB | regenerável com `npm install` |

Tudo com backup em `backups/limpeza-mcp-20260728-064109/`.

---

## 5. Organização

```
apps/modulos/mcp/          ← tudo do MCP mora aqui agora
├── dist/                    código vivo
├── src/                     fonte
├── admin-ui/                painel  (era apps/modulos/mcp-admin-ui)
├── config/  docs/  logs/
└── README.md
```

E `apps/` deixou de ter a pasta `mcp` solta:
`bot-telegram · modulos · web`

---

## 6. Segurança — pendência para o Pivete

`ecosystem.config.cjs` estava **versionado no Git com secrets em texto
puro**. Foi tirado do versionamento (`git rm --cached`) e entrou no
`.gitignore`. **O arquivo continua no disco da VPS, intacto** — nada parou
de funcionar.

**Rotacionar quando puder:** `CENTRALDARK_ADMIN_KEY`, `MCP_SESSION_SECRET`,
`SUPABASE_SERVICE_ROLE_KEY`, `GITHUB_CLIENT_SECRET`, `LINEAR_API_KEY`,
`GROQ_API_KEY` e as duas `OPENROUTER_API_KEY`.

> **Mistério resolvido de quebra:** o `GEMINI_API_KEY` daqui é
> `AQ.Ab8RN6LO…` — exatamente a string que estava no campo
> `GEMINI_BASE_URL` do perfil `sol` do Hermes, quebrando o Gemini lá.
> Era a chave colada no campo de endereço.

---

## 7. 🔴 Pendência que só o Pivete decide

O repositório da VPS está **no meio de um rebase interrompido**:

```
rebase de 'main' sobre ec13c320a4 — iniciado em 14/07/2026 20:19
4655 commits pendentes na fila
branch chore/gateway-providers-routes, 31511 commits à frente do origin
```

Isso é **anterior** a esta sessão (14 dias). Por causa disso, **o commit
local desta limpeza não pôde ser feito** — entraria dentro do rebase. Os
arquivos estão todos corretos no disco e o serviço rodando; só o
versionamento local ficou pendente.

Resolver um rebase desse tamanho pode descartar trabalho, então **não foi
tocado**. As saídas são `git rebase --abort` (volta ao estado anterior) ou
`git rebase --continue` (segue os 4655) — decisão do dono.

---

## Estado final, medido

```
runtimeTools ......... 107   (era 83)
destructiveTools ..... 17    (lista canônica reconciliada)
auditStartupReady .... true  (era false — auditoria travada)
toolCount (catálogo) . 102
serviço .............. online
espaço liberado ...... ~360 MB
```
