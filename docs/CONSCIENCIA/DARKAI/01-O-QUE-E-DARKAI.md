---
title: "01 O QUE E DARKAI"
date: 2026-07-02
tags: ["consciencia"]
updated: 2026-07-02
---

# 🧠 O que é DARKAI?

> **📖 Pra quem é:** você que nunca ouviu essa palavra.
> **⏱️ Tempo:** 5 minutos.

---

## A analogia do telefone central

Imagina que sua VPS é um **prédio comercial** cheio de escritórios (Claude Code, Bot Telegram, scripts Python, pipelines CI/CD, etc.). Cada escritório às vezes precisa **ligar pra uma IA** (Gemini, GPT) pra pedir ajuda.

**Sem DARKAI:**
- Cada escritório precisa ter seu próprio telefone
- Cada telefone precisa da própria conta paga
- Se você trocar a operadora, tem que trocar em todos os escritórios
- Se alguém deixar um telefone aberto, vaza a conta

**Com DARKAI:**
- Tem UMA central telefônica no térreo (a edge function `ai-proxy`)
- Todo escritório disca 3 números pra falar com qualquer IA
- A central sabe qual operadora usar, autentica, cobra certo, protege a chave
- Se você quiser trocar de IA, muda **só na central**

É isso. DARKAI é a **central telefônica** entre a sua VPS e o mundo das IAs.

---

## O nome vem de onde?

**DARK** (do seu projeto CentralDark) + **AI** (Inteligência Artificial) = **DARKAI**.

Simples assim.

---

## O que ele resolve na prática

| Problema real | Como DARKAI resolve |
|---------------|---------------------|
| "Cada script meu tem uma API key diferente" | Uma chave só (`LOVABLE_API_KEY`), guardada segura na Cloud |
| "Se vazar minha chave da OpenAI, gasto R$ 3000 numa noite" | A chave **nunca sai** da Lovable Cloud. Nem você vê ela |
| "Quero trocar de Gemini pra GPT-5 em 50 scripts" | Muda o parâmetro `--model`, ou o padrão da edge, e pronto |
| "Meu bot do Telegram, meu Claude Code e meu script bash usam IAs diferentes" | Todos falam com o mesmo `darkai`, mesmo gateway |
| "Não sei quanto tô gastando com IA" | Tudo cai numa única fatura Lovable, com log de uso |

---

## Quem pode chamar DARKAI?

Qualquer coisa que consiga fazer um `curl` HTTPS:

- ✅ Claude Code rodando na VPS
- ✅ Bot Telegram
- ✅ Scripts Bash / Python / Node
- ✅ Pipelines GitHub Actions
- ✅ Cron jobs
- ✅ Seu terminal local (Mac/Linux/Windows)
- ✅ Outra IA que você contratar amanhã

Basicamente: **tudo**.

---

## O que ele NÃO é

- ❌ Não é uma IA nova. Ele só **encaminha** pra IAs existentes.
- ❌ Não é um chatbot com memória. Cada chamada é independente (stateless).
- ❌ Não substitui a Lovable AI. Ele **usa** a Lovable AI por baixo.
- ❌ Não roda modelo local. Sempre chama Gemini/GPT via HTTPS.

---

Próximo: [`02-COMO-FUNCIONA-POR-DENTRO.md`](02-COMO-FUNCIONA-POR-DENTRO.md)

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
