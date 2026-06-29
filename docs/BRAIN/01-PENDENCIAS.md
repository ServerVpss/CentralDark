---
title: "Pendências CentralDark"
date: 2026-06-29
tags: ["pendencias", "tarefas", "centraldark", "operacional"]
updated: 2026-06-29
---

# 📋 PENDÊNCIAS — CentralDark

> Última atualização: 2026-06-29
> Toda IA que abrir este arquivo deve ler ANTES de propor qualquer tarefa nova.

---

## 🔴 Grandes Tarefas (aguardam "PERMITO PIVETE")

| # | Tarefa | O que é | Por onde começa |
|---|--------|---------|----------------|
| G1 | **Novo MCP + Hub** | Reconstrução completa do servidor MCP e Hub de controle. É o maior projeto pendente. | Pivete diz "PERMITO PIVETE — iniciar MCP+Hub" |
| G2 | **WhatsApp para gravar ideias** | Conectar o WhatsApp ao sistema para o Pivete poder gravar pensamentos de qualquer lugar, não só pelo Telegram | Verificar WuzAPI e MultiZap-Gateway |
| G3 | **MCP universal — conectar ao Lovable** | O MCP do CentralDark pode ser conectado a qualquer IA (Lovable, Cursor, Claude.ai). Expor via HTTPS pelo Caddy e registrar como conector | Configurar endpoint público do MCP |

---

## 🟡 Em andamento / semi-prontos

| # | Tarefa | Status |
|---|--------|--------|
| A1 | Bot `@srver1bot` skills + consciência | ✅ Funcionando — pode evoluir |
| A2 | Obsidian vault sincronizado | ✅ Funcionando — Pivete configurou hoje |
| A3 | Notificações Telegram melhoradas | ✅ Feito — Vigia + Pipeline + Guardião + obsidian-writer |
| A4 | Tutorial Obsidian no vault | ✅ Criado — aparece em ≤10 min |
| A5 | Aprendizado de horário online do Pivete | 🟡 Pendente — bot precisa logar horários de interação e sugerir janelas |
| A6 | Sugestões proativas periódicas | 🟡 Pendente — bot precisa de um cron que manda sugestão ou lembrete |
| A7 | Detecção de ideia duplicada | 🟡 Pendente — quando Pivete gravar uma ideia, verificar se já existe algo parecido |
| A8 | Migração `centralldark.com` + DNS | 🟡 Código pronto, falta executar com autorização |

---

## 🧠 Objetivos de aprendizado do Pivete (sugerir recursos)

| Tema | Sugestão |
|------|---------|
| Inteligência Artificial | Curso gratuito: "Elements of AI" (traduzido PT-BR) |
| Governança de sistemas | Aprender sobre PM2, logs, backup automático |
| Full-stack | Começar pelo JavaScript/Node.js (já usa no bot) |
| MCP Protocol | Ler `docs/CONSCIENCIA/06-MCP-CENTRALDARK.md` |
| Obsidian | Tutorial no vault: `05 - Documentacao/TUTORIAL-OBSIDIAN.md` |

---

## 🔒 Áreas protegidas — não mexer sem autorização

| Área | Senha necessária |
|------|----------------|
| `apps/bot-telegram/` estrutural | PERMITO PIVETE |
| `scripts/webhook/` | PERMITO PIVETE |
| `infra/caddy/` | PERMITO PIVETE |
| `secrets/` | NUNCA |
| Novo MCP + Hub | PERMITO PIVETE + plano aprovado |

---

## 🔄 Regra anti-duplicata

Antes de registrar qualquer ideia nova, verificar:
1. Este arquivo
2. `docs/BRAIN/00 - Mapa do Sistema/BRAIN.md`
3. `docs/CONSCIENCIA/07-PENDENCIAS-E-HORARIO.md`

Se já existir algo parecido → atualizar a entrada existente, não criar nova.

---

*Arquivo atualizado pela IA do CentralDark. Sincroniza com Obsidian em ≤10 min.*

---

## ✅ Implementado em 29/06/2026

| Item | O que foi feito |
|------|----------------|
| Issues Agent | `scripts/issues-agent/issues-agent.mjs` — cron */30, timer interno 45-110min, fecha duplicatas/resolvidos/parados, notifica Telegram |
| Vigia recuperação | `vigia-actions-vermelhos.yml` agora notifica 🟢 quando workflow volta ao verde após falha |
| Hooks Claude Code | `~/.claude/settings.json` — hook Stop + Notification disparam Telegram quando Claude termina tarefa ou aguarda input |

---

## 🆕 Melhorias de UX solicitadas em 29/06/2026

| # | Melhoria | Descrição |
|---|----------|-----------|
| U1 | **Bot: editar mensagem no lugar** | Botões inline devem editar a mensagem existente (`editMessageText`), não criar mensagens novas. Menus ficam no mesmo lugar. |
| U2 | **Paginação de listas longas** | Quando há muitas pendências/itens, usar botões ◀️ ▶️ para paginar sem criar novas mensagens |
| U3 | **Lista completa ao perguntar pendências** | Sempre mostrar a lista completa (com paginação se necessário) ao perguntar "o que falta?" |
| U4 | **Refinador de fala para prompt** | Quando Pivete falar de forma informal, a IA deve: (1) entender a intenção, (2) mostrar o prompt refinado que foi gerado, (3) executar, (4) registrar o par fala→prompt para aprender |
| U5 | **Explicar o prompt gerado** | Quando Pivete quiser aprender, mostrar "aqui está o prompt que criei a partir do que você disse" |

---

## 🔐 Aguardando "PERMITO PIVETE" (29/06/2026)

| # | Feature | O que é |
|---|---------|---------|
| P2 | **Modo Terminal via Telegram** | Botão no bot para Pivete comandar o Claude Code diretamente pelo Telegram. Skill nova + webhook Anthropic API. Toca em `apps/bot-telegram/` |
| P4 | **Email para eventos importantes** | Além do Telegram, receber email em eventos críticos. Precisa configurar Resend ou sendmail na VPS |
| P5 | **Botão "Realizar Testes"** | Botão no menu do bot para verificar MCP, workflows e endpoints. Toca em `apps/bot-telegram/` |

