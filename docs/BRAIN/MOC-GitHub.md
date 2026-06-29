---
title: "MOC: GitHub — Repositório e Fonte da Verdade"
date: 2026-06-29
tags: ["moc", "github", "repositorio", "sync", "deploy"]
updated: 2026-06-29
---

# 🐙 GitHub — Fonte da Verdade

> **Repositório:** `ServerVpss/CentralDark`
> **Regra:** O GitHub é a fonte da verdade para novos desenvolvimentos. Toda mudança estrutural passa por aqui.

---

## Sync Bidirecional

```
VPS (/root/CentralDark/) ←→ GitHub ←→ Obsidian (via Obsidian Git)
                                   ←→ Lovable (sync automático)
```

## Workflows ativos

| Workflow | Função |
|----------|--------|
| `obsidian-index.yml` | Regenera INDEX.md do vault a cada push |
| `pr-agent.yml` | Proxy Anthropic para análise de PRs |
| `painel-data.yml` | Atualiza painel de dados do TelePainel |

## Regras

- Nunca commitar `secrets/` ou `.env`
- Usar `git stash && git pull --rebase -X theirs && git stash pop && git push` para evitar conflitos
- `INDEX.md` é gerado automaticamente — não editar à mão

## Conexões Rápidas

- [[MAPA-DO-CEREBRO]] — como o GitHub se encaixa no sistema
- [[DIAGRAMAS-CENTRALDARK]] — diagrama da sincronia 4-point
- [[00-LEIA-PRIMEIRO]] — regras de sync para IAs
