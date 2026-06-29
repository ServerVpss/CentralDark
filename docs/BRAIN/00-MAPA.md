---
title: "Mapa do Segundo Cérebro CentralDark"
date: 2026-06-29
tags: ["navegacao", "mapa", "centraldark", "obsidian"]
updated: 2026-06-29
---

# 🗺️ MAPA — Segundo Cérebro CentralDark

## Entrada rápida

| Área | Arquivo |
|---|---|
| Cérebro principal | `docs/BRAIN/BRAIN.md` |
| Pendências | `docs/BRAIN/01-PENDENCIAS.md` |
| Arquitetura | `docs/BRAIN/02-ARQUITETURA.md` |
| Decisões | `docs/BRAIN/06-DECISOES.md` |
| Consciência mestra | `docs/CONSCIENCIA/CONSCIENCIA.md` |
| Aprendizados | `docs/CONSCIENCIA/APRENDIZADOS.md` |
| Pendências oficiais | `docs/PENDENCIAS.md` |
| Design system | `docs/ARQUITETURA/DESIGN-SISTEMA.md` |
| Padrão de resposta | `docs/CONSCIENCIA/2026-06-20-padrao-resposta-pivete.md` |
| Camada visual Vibe | `docs/CONSCIENCIA/21-PADRAO-APRESENTACAO.md` |

---

## Mapa operacional

```txt
Usuário / Pivete
      ↓
ChatGPT / Claude / agentes
      ↓
MCP CentralDark
      ↓
GitHub ServerVpss/CentralDark
      ↓
Workflows / Webhook / VPS
      ↓
Mega Painel / Relatórios / Obsidian Git
```

---

## Como usar no Obsidian

1. Abrir o vault `E:\CentralDark\Obsidian\Brain`.
2. Rodar `Obsidian Git: Pull`.
3. Começar por `docs/BRAIN/BRAIN.md`.
4. Consultar `docs/BRAIN/01-PENDENCIAS.md` antes de decidir próxima tarefa.
5. Consultar `docs/BRAIN/02-ARQUITETURA.md` antes de mexer em fluxo, webhook, MCP ou VPS.

---

## Regra de ouro

```txt
Se não está no GitHub, não é fonte oficial.
Se é decisão operacional, precisa virar doc, pendência, relatório ou memória.
```

---

## Os Motores Gêmeos do Sistema

Dois containers Docker que formam a interface de criação do CentralDark:

| Motor | Nome oficial | Container Docker | URL | Caminho oficial |
|-------|-------------|-----------------|-----|-----------------|
| **FÁBRICA DE ARTEFATOS** | Bolt.diy (customizado) | `CentralDark-Builder` | `builder.centralldark.com` | `/root/CentralDark/apps/modulos/Bolt/` |
| **INTERFACE VISUAL** | Open WebUI (customizado) | `CentralDark-WebUI` | `ui.centralldark.com` | `/root/CentralDark/apps/modulos/WebUI/` |

### Configuração ativa (29/06/2026)

**CentralDark-Builder** (`apps/modulos/Bolt/docker-compose.yml`):
- Proxy Anthropic: `https://claude.ap7.site` (via `ANTHROPIC_API_BASE_URL`)
- Elite Gateway: `https://api.centralldark.com/v1` (OpenAI-like)
- Dev server HMR na porta 5174 → Caddy → `builder.centralldark.com`

**CentralDark-WebUI** (`apps/modulos/WebUI/docker-compose.yml`):
- `WEBUI_NAME=CentralDark AI`
- Elite Gateway: `https://api.centralldark.com/v1`
- Porta 3000 → Caddy → `ui.centralldark.com`

> Portainer (visualização de containers): `portainer.centralldark.com`

---

## Conexões Rápidas

- [[BRAIN]] — documento raiz
- [[01-PENDENCIAS]] — o que está em aberto
- [[02-ARQUITETURA]] — como o sistema funciona
- [[06-DECISOES]] — decisões tomadas
