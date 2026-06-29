---
title: "BRAIN — Segundo Cérebro CentralDark"
date: 2026-06-29
tags: ["brain", "obsidian", "setup", "centraldark"]
updated: 2026-06-29
---

# 🧠 BRAIN — Segundo Cérebro CentralDark

**Status:** ativo  
**Fonte da verdade:** `ServerVpss/CentralDark`  
**Uso previsto:** Obsidian Git / IA externa / consulta rápida operacional

---

## Objetivo

Esta pasta concentra uma versão navegável do cérebro operacional do **CENTRAL DARK** para uso no Obsidian.

O fluxo oficial é:

```txt
IA / MCP / GitHub
      ↓
commit em ServerVpss/CentralDark
      ↓
Obsidian Git faz pull automático
      ↓
Pivete consulta no vault local
```

---

## Arquivos principais

| Arquivo | Função |
|---|---|
| `BRAIN.md` | Visão central do segundo cérebro |
| `00-MAPA.md` | Índice navegável do vault/repo |
| `01-PENDENCIAS.md` | Espelho resumido das pendências vivas |
| `02-ARQUITETURA.md` | Arquitetura operacional atual |
| `06-DECISOES.md` | Decisões históricas e regras consolidadas |
| `PLANO.md` | Próximos passos desta pasta |

---

## Configuração recomendada no Obsidian Git

```txt
Auto pull interval: 10
Auto push interval: 0
Pull on startup: ON
Commit-and-sync interval: 0
Show status bar: ON

Authentication/Commit Author:
Author name: SegredoiDev
Author email: segredounlock@users.noreply.github.com
```

---

## Regras

- GitHub é a fonte da verdade.
- Obsidian local apenas sincroniza e consulta.
- Não salvar `.env`, secrets, tokens, sessões ou credenciais no vault.
- Auto push desligado por segurança.
- Mudança operacional real deve voltar para `docs/CONSCIENCIA/`, `docs/PENDENCIAS.md` ou documentação específica do módulo.
