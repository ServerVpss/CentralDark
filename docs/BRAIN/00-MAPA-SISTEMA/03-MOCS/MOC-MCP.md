---
title: "MOC: MCP — Model Context Protocol"
date: 2026-06-29
tags: ["moc", "mcp", "integracao", "hub", "ia"]
updated: 2026-06-29
---

# 🔌 MCP — Model Context Protocol

> **O que é:** Protocolo que permite IAs (Claude, GPT, Lovable) usarem ferramentas externas — ler arquivos, executar comandos, acessar GitHub, Notion, Supabase.

---

## No CentralDark

- **Processo PM2:** `CentralDark-MCP` (id 33)
- **Localização:** `/root/CentralDark/`
- **Ferramentas expostas:** leitura de vault, escrita de notas, status VPS, GitHub, Supabase, Telegram

## Ferramentas principais

| Ferramenta | O que faz |
|---|---|
| `vps_read_file_safe` | Lê arquivos da VPS com segurança |
| `vps_write_file_safe` | Escreve arquivos na VPS |
| `github_commit` | Faz commit no repositório |
| `obsidian-writer` | Cria/atualiza notas no vault |
| `pendencias_add` | Adiciona tarefa em 01-PENDENCIAS |

## Conexões Rápidas

- [[MAPA-DO-CEREBRO]] — como o MCP se encaixa no sistema
- [[CentralDark-MCP]] — o processo PM2 do MCP
- [[DIAGRAMAS-CENTRALDARK]] — diagrama de fluxo com MCP
- [[00-LEIA-PRIMEIRO]] — regras de uso do MCP para IAs
