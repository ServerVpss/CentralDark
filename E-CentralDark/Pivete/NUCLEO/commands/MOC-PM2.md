# COMANDO - MOC-PM2.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\docs\BRAIN\00-MAPA-SISTEMA\MOC-PM2.md
**SHA:** c619214b1b6471f8
**Timestamp:** 2026-08-28T02:56:45.623950
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- - Prefixo padrão: `CentralDark-*`

### Ouro Bruto (primeiros 5000 chars)
```
---
title: "MOC: PM2 — Gerenciador de Processos"
date: 2026-06-29
tags: ["moc", "pm2", "infra", "processos", "vps"]
updated: 2026-06-29
---

# ⚙️ PM2 — Gerenciador de Processos

> **O que é:** PM2 mantém os serviços do CentralDark rodando 24/7 na VPS. Se um processo cair, ele reinicia automaticamente.

---

## Processos ativos (principais)

| ID | Nome | Função |
|----|------|--------|
| 4  | CentralDark-BotServer | Bot Telegram legado |
| 27 | CentralDark-HubBot | Bot principal (@srver1bot) |
| 28 | CentralDark-GuardiaoConsciencia | Monitor do vault CONSCIENCIA |
| 29 | CentralDark-GuardiaoAnalista | Analista de integridade |
| 33 | CentralDark-MCP | Servidor MCP (ferramentas para IAs) |
| 1  | whatsapp-server | **STOPPED** — estado desejado |

## Regras

- `pm2 save` obrigatório após qualquer mudança de estado
- whatsapp-server (id 1) = **sempre stopped** — não subir
- Prefixo padrão: `CentralDark-*`

## Comandos úteis

```bash
pm2 list                    # ver todos os processos
pm2 logs NomeDoProcesso     # ver logs em tempo real
pm2 restart NomeDoProcesso  # reiniciar
pm2 save                    # salvar estado atual
```

## Conexões Rápidas

- [[MAPA-DO-CEREBRO]] — visão geral da infra
- [[CentralDark-HubBot]] — processo do bot principal
- [[DIAGRAMAS-CENTRALDARK]] — diagrama da arquitetura

```