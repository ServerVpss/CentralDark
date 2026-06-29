---
title: "Arquitetura do Sistema CentralDark"
date: 2026-06-29
tags: ["arquitetura", "mcp", "hub", "federacao", "memoria"]
---

# Arquitetura do Sistema — CentralDark

---

## Visão Geral

```
Seu PC (Windows)
  └── Obsidian vault ← puxa do GitHub (10min)

VPS /root/CentralDark/
  ├── Bot @srver1bot   ← cockpit principal (Telegram)
  ├── MCP Server       ← 95 ferramentas, acesso universal
  ├── Guardião         ← vigia arquivos e memória
  └── docs/BRAIN/      ← fonte da verdade do vault

GitHub ServerVpss/CentralDark
  └── Fonte da verdade (git é autoritativo)

Outras IAs (ChatGPT, Gemini, Lovable, Cursor...)
  └── Conectam via MCP → acesso às ferramentas e memória
```

---

## Federação de Memória entre IAs

> Conceito aprovado pelo Pivete em 29/06/2026

**O problema:** Pivete fala com várias IAs diferentes. Cada uma tem memória isolada. Uma ideia gerada no ChatGPT não chega automaticamente ao CentralDark.

**A solução (design do novo MCP+Hub):**

```
Pivete tem ideia conversando com ChatGPT
         ↓
Mais tarde, abre CentralDark (bot, Claude, Lovable...)
         ↓
MCP pergunta: "Tem algo de outra sessão para registrar?"
         ↓
Pivete conta a ideia
         ↓
MCP verifica se já existe algo parecido
  ├── SIM → "Já temos isso aqui. Quer atualizar?"
  └── NÃO → Notifica Telegram: "Nova ideia: X. Registro?"
         ↓
Pivete aprova → grava em Obsidian + CONSCIENCIA
```

**Regras da Federação:**
1. Nunca registrar sem perguntar — toda memória externa precisa de aprovação
2. Sempre verificar duplicata antes de criar nota nova
3. Marcar a fonte — "ideia de sessão ChatGPT", "insight do Lovable", etc.
4. A IA avalia relevância antes de propor o registro

**O que já funciona HOJE:**
- Qualquer IA conecta ao MCP e lê a memória — funciona agora
- Qualquer IA conecta ao MCP e escreve notas — funciona agora
- Bot reconhece comandos de gravação naturais ("grava aí que...")
- Detecção de mensagem copiada de outra IA

**O que precisa ser construído (novo MCP+Hub):**
- Ferramenta `importar_sessao(ideias, fonte_ia)`
- Verificação automática de duplicata
- Notificação Telegram pedindo aprovação do Pivete
- Painel mostrando de onde cada memória veio

---

## MCP é Universal — Conectar outras IAs

| IA / Ferramenta | Como conectar |
|----------------|--------------|
| Claude.ai | Settings → MCP → URL do servidor |
| Lovable | Connectors → MCP → URL do servidor |
| Cursor | `.cursor/mcp.json` → URL |
| Qualquer cliente MCP | URL + autenticação |

Quando uma IA se conecta ao MCP, ela passa a:
- LER suas memórias (docs/CONSCIENCIA/)
- ESCREVER notas no Obsidian (docs/BRAIN/)
- VER suas pendências e projetos
- EXECUTAR ferramentas do sistema

Pendência: expor o MCP via HTTPS no Caddy para acesso externo.

---

## Serviços ativos na VPS

| Serviço | Função |
|---------|--------|
| CentralDark-HubBot | Bot Telegram — cockpit principal |
| CentralDark-MCP | Servidor MCP — 95 ferramentas |
| CentralDark-GuardiaoConsciencia | Vigia arquivos e organização |
| CentralDark-WebhookDeploy | Deploy automático via GitHub |
| CentralDark-ContasAdmin | Painel OAuth admin |
| CentralDark-Respiracao | Reporter de saúde da VPS |
| Elite-Gateway | Gateway HTTP/WS |
| Zentinel | Monitor externo de saúde |

---

*Atualizado em 2026-06-29 — skill Obsidian-Writer*
