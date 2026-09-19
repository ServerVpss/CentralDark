---
title: "🧾 CHECK-LIST DIARIO"
obsidian: "obsidian://open?vault=CASA-VAULT&file=%F0%9F%A7%BECHECK-LIST%20DIARIO%F0%9F%A4%96"
vault_windows: "E:\\CentralDark\\Pivete\\CASA-VAULT\\🧾CHECK-LIST DIARIO🤖.md"
owner: docs/BRAIN/02-ENTRADA/CHECK-LIST-DIARIO.md
sync: CASA-VAULT/00-CANONICO via scripts/casa/sync-hermes-obsidian.ps1
status: OPERATIONAL
updated: 2026-09-19
---

# 🧾 CHECK-LIST DIARIO 🤖

Espelho Git do note do Obsidian. A Casa (Windows) abre pelo URI. A VPS atualiza este arquivo no **fechamento do dia** (Hermes `ec512c0295e2` 23:00) e notifica o CHEFE.

```text
SESSÃO CRISTALIZA → commit+push main (docs)
DIA ACABA → fechar autonomamente → atualizar este checklist → Telegram CHEFE
```

## Superfícies oficiais (NÃO inventar HUB.*)

| Superfície | URL | Papel |
|------------|-----|--------|
| SITE | https://centralldark.com | humano público |
| ADMIN | https://admin.centralldark.com | **casca única de comando** |
| CONTAS | https://admin.centralldark.com/contas | cofre/providers **dentro** da casca |
| API | https://api.centralldark.com | estado / heartbeat |
| MCP | https://mcp.centralldark.com/mcp | protocolo (máquina) |
| MCP admin | https://mcp.centralldark.com/admin | aba MCP no **mesmo** organismo |

`https://hub.centralldark.com/` = **403 / LEGADO**. HUB não é subdomínio. Clicar MCP/VPS/CF no admin **não** abre segundo cérebro.

## 2026-09-19

- [x] Boot / identidade Grok CLI VPS
- [x] Heartbeat `GET /heartbeat` (#1583)
- [x] Compressão / complexidade absorvida (#1584–#1587)
- [x] Tailscale no Cofre MCP (#1586)
- [x] Deploy SHA `0dfb66b519f` **#1591 SUCCESS** (gate 42 + dist tsc + gitignore leftovers)
- [x] PDF_GATE **na Casa** (receipt 2026-09-19 06:59, cadeia identity/policy/self-test/tamper PASS) — setor Casa
- [ ] Cloudflare AUTH/API nesta VPS (`tokens/verify` + `zones.list`) — token no **admin/contas**, não no chat
- [ ] Heartbeat **público** stale vs local alive
- [ ] `hub_missions` 403
- [ ] Caddy leftover (elite/grafo/portal) = LEGADO
- [ ] Screenpipe captura ATIVA (config ≠ execução)
- [ ] Tray Windows .exe
- [ ] PDF_GATE **promovido na VPS/main** (Casa ≠ VPS)

**HEAD:** `0dfb66b519f` = `origin/main` = DEPLOYED run `35445742651`  

### Proibido no dia a dia
`reset --hard` · `pm2 restart all` · `git add -A` · segundo painel/watchdog

### Abrir na Casa
[Obsidian checklist](obsidian://open?vault=CASA-VAULT&file=%F0%9F%A7%BECHECK-LIST%20DIARIO%F0%9F%A4%96)
