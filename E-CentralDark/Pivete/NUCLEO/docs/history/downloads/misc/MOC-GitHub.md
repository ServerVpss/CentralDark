# OUTRO - MOC-GitHub.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\docs\BRAIN\00-MAPA-SISTEMA\MOC-GitHub.md
**SHA:** 2b748520f323aec5
**Timestamp:** 2026-08-28T02:56:45.653159
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- > **Regra:** O GitHub é a fonte da verdade para novos desenvolvimentos. Toda mudança estrutural passa por aqui.

### Ouro Bruto (primeiros 5000 chars)
```
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

```