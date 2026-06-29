# 🧠 BRAIN — CentralDark

> Arquivo mestre do segundo cérebro. Toda IA que escrever aqui deve usar `[[links]]` do Obsidian.
> Atualizado automaticamente. Não editar manualmente — use a skill `obsidian-writer`.

---

## Identidade

**Projeto:** CentralDark (TelePanel + microsserviços + Cérebro Vivo)
**Repo oficial:** `ServerVpss/CentralDark`
**VPS:** `/root/CentralDark/`
**Pivete (dono):** SegredoiDev

---

## Hierarquia de Fontes

| Prioridade | Fonte | Papel |
|---|---|---|
| 1 | GitHub `ServerVpss/CentralDark` | Código, docs, commits — única verdade |
| 2 | `docs/CONSCIENCIA/` | Regras, memória e decisões das IAs |
| 3 | Mega Painel `status.centralldark.com` | Estado vivo operacional |
| 4 | `docs/PENDENCIAS.md` | Pendências oficiais |
| 5 | `docs/BRAIN/` | Este vault — camada navegável para o Pivete |
| 6 | Notion | Espelho humano — sync automático via workflow |
| 7 | Obsidian local | Leitura no PC — Obsidian Git faz pull a cada 10 min |

---

## Mapa do Vault

- [[00-MAPA]] — Visão geral e entrada rápida de todas as áreas
- [[01-PENDENCIAS]] — Espelho navegável das pendências ativas
- [[02-ARQUITETURA]] — Stack, serviços, portas, domínios
- [[06-DECISOES]] — Decisões consolidadas com motivo e data
- [[PLANO]] — Plano de evolução do vault e segundo cérebro

---

## Infraestrutura Viva (estado atual)

### Stack Principal
```
Frontend:  React 18 + Vite 5 + Tailwind v3 + TypeScript 5
Backend:   Lovable Cloud (Supabase gerenciado)
VPS:       /root/CentralDark/ — PM2 + Caddy
Bot:       @srver1bot — unified-bot.cjs — webhook ativo
MCP:       mcp.centralldark.com — 95 ferramentas
```

### Processos PM2 (todos CentralDark-*)
```
CentralDark-HubBot              ← bot Telegram principal
CentralDark-MCP                 ← servidor MCP
CentralDark-WebhookDeploy       ← webhook de deploy
CentralDark-Respiracao          ← VPS reporter (heartbeat)
CentralDark-GuardiaoConsciencia ← vigia de arquivos (17% CPU normal)
CentralDark-GuardiaoAnalista    ← fila de propostas do guardião
CentralDark-TelePainelDeploy    ← deploy do TelePanel
CentralDark-ContasAdmin         ← painel OAuth admin
CentralDark-BotServer           ← servidor auxiliar do bot
```

### Domínios Ativos
```
status.centralldark.com   ← painel público + bot webhook
mcp.centralldark.com      ← servidor MCP (OAuth + tools)
hub.centralldark.com      ← hub operacional
```

---

## Sistema de Skills (Bot Telegram)

Localização: `apps/bot-telegram/skills/`

### Skills de Metodologia (protocolos para IAs)
- `code-review` — áreas sensíveis: DB, RLS, autenticação, VPS, secrets
- `documentation-memory` — atualizar docs ao final de cada alteração
- `runtime-error-prevention` — evitar tela branca e erros fatais
- `systematic-debugging` — debugar com hipótese → isolamento → evidência
- `using-superpowers` — mentalidade arquiteto sênior
- `verification-before-completion` — provar que funciona antes de declarar pronto
- `writing-plans` — planejar antes de alterar múltiplos arquivos

### Skills Executáveis (conectadas à API)
- `brainstorming` — ideias criativas via Claude API (aiReady: true)
- `find-skills` — busca no marketplace skills.sh
- `memoria-longa` — lê/escreve em `docs/CONSCIENCIA/`
- `painel-status` — consulta `painel-data.json` local
- `obsidian-writer` — cria notas Zettelkasten neste vault com `[[links]]`

### Motor de Consciência
`consciousness.cjs` detecta intenção da mensagem e roteia para a skill certa automaticamente.
Sessões persistem 30 min e restauram `agent` e `cogMode` no restart do PM2.

---

## Agentes Cognitivos (COG_MODES)

No bot, o Pivete pode ativar modos cognitivos especiais:

| Modo | Emoji | Uso |
|------|-------|-----|
| `sistema2` | 🔬 | Análise profunda, passo a passo |
| `cot` | 🔗 | Chain of Thought — raciocínio encadeado |
| `react` | ⚛️ | Raciocínio + Ação iterativa |
| `reflexao` | 🪞 | Auto-crítica — questiona as próprias respostas |

---

## Pendências Grandes (aguardam Pivete)

1. **Reconstrução MCP + Hub** — novo plano a ser apresentado
2. **Sistema de Skills no novo MCP** — `manager.cjs` vira `forMCPTools()`, cada skill é uma ferramenta MCP nativa
3. **`obsidian-writer` no Hub** — quando Hub for construído, adicionar tool `obsidian_write(folder, title, content)`
4. **Renomeação `docs/` → `.consciencia`** — aguardar comando explícito

---

## Regras de Escrita Neste Vault

```
1. Notas curtas — um tema por nota
2. Sempre usar [[links]] para conectar notas relacionadas
3. Frontmatter YAML em toda nota nova (tags, date)
4. IA nunca edita nota existente — sempre ANEXA ao final
5. INDEX.md é gerado automaticamente — não editar manualmente
6. Obsidian Git: auto-pull 10 min, auto-push DESLIGADO
```

---

## Configuração Obsidian Git (Windows)

```
Vault:       E:\CentralDark\ObsidianRepo\docs\BRAIN\
Remote URL:  https://github.com/ServerVpss/CentralDark.git
Branch:      main
Auto Pull:   ON — 10 minutos
Auto Push:   OFF
Pull on startup: ON
Author name: SegredoiDev
```

---

## Fluxo de Atualização

```
IA escreve nota via obsidian-writer skill
    ↓
docs/BRAIN/<pasta>/<nota>.md criada no VPS
    ↓
git push → GitHub (ServerVpss/CentralDark)
    ↓
workflow obsidian-index.yml regenera INDEX.md
    ↓
Notion sync atualiza (se arquivo toca docs/CONSCIENCIA/)
    ↓
Obsidian Git no PC do Pivete faz pull (≤10 min)
    ↓
Pivete abre Obsidian → vê nota nova no Graph View
```
