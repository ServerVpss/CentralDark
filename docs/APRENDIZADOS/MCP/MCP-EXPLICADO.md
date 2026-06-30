---
title: "MCP explicado (pro Pivete)"
date: 2026-06-30
tags: ["aprendizado", "mcp", "conceito", "ia"]
updated: 2026-06-30
---

# 🔌 O que é o MCP (Model Context Protocol)

```
╔══════════════════════════════════════════════════╗
║   🔌 MCP — MODEL CONTEXT PROTOCOL                  ║
╠══════════════════════════════════════════════════╣
║   O que é:   a "porta USB-C" das IAs               ║
║   Serve pra: IA usar ferramentas + ter memória     ║
║   No nosso:  CentralDark-MCP · 100 tools · :9100   ║
║   Link:      modelcontextprotocol.io               ║
╚══════════════════════════════════════════════════╝
```

> Aprendizado salvo em 30/06/2026 — base de tudo que a gente montou no `CentralDark-MCP`.

## Link oficial

🔗 **https://modelcontextprotocol.io**

## Em 1 frase

O MCP é o **padrão oficial** (criado pela Anthropic) que faz uma IA conseguir **usar
ferramentas** de verdade — ler arquivo, mexer no GitHub, lembrar das coisas — em vez de só
conversar.

## A analogia que fixa

```
Sem MCP:  cada IA é uma ilha (não acessa nada, esquece tudo ao trocar)
Com MCP:  todas plugam na MESMA tomada → mesmas ferramentas + mesma memória
```

É tipo uma **"porta USB-C" pras IAs**: Claude, Grok, ChatGPT, Gemini — qualquer uma "pluga"
no mesmo conector e ganha acesso às mesmas ferramentas e à mesma memória (as Lembranças).
Por isso o seu contexto não se perde quando você troca de IA.

## Como isso vive no CentralDark

- Nosso servidor: `CentralDark-MCP` (PM2, porta 9100, `https://mcp.centralldark.com`).
- **100 ferramentas** expostas (GitHub, VPS, Consciência, Pendências, Supabase, Notion... +
  as 4 cognitivas: `consultar_memoria_reserva`, `consolidar_pensamento`,
  `injetar_consciencia_centraldark`, `analise_de_estado_cognitivo`).
- Código e docs ficam em `apps/modulos/mcp/` (pasta trancada).

## Links pra aprofundar (no seu ritmo)

| Tema | Link |
|------|------|
| MCP — introdução oficial | https://modelcontextprotocol.io |
| Exemplos de conectores prontos | https://modelcontextprotocol.io/examples |
| Documentação Claude/Anthropic | https://docs.claude.com |
| O Claude Code (essa ferramenta) | https://claude.com/claude-code |

## Conexões Rápidas

- [[06-MCP-CENTRALDARK]] — o MCP do projeto em detalhe
- [[MAPA-DOS-BOTS]] — quem faz o quê na automação
