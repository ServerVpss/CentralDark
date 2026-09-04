---
title: "Skill: Investiga o Código"
date: 2026-06-29
tags: ["skill", "codigo", "debug", "investigacao", "bug"]
updated: 2026-06-29
---

# 🤖 SKILL: CODE-INVESTIGATOR

> 🗣️ **Chame assim:** _"Investiga o código"_, _"Acha o bug"_, _"O que tá quebrando?"_, _"Por que isso não funciona?"_
> **Objetivo:** Mergulhar no código e achar o problema, a causa raiz, e a solução — sem precisar que o Pivete saiba onde olhar.
> **Tipo:** Diagnóstico | **Prioridade:** Alta

---

## Quando usar

- Algo quebrou e você não sabe por quê
- Um script parou de funcionar do nada
- Quer entender como um trecho de código funciona
- "O bot tá mandando mensagem errada"
- "O cron não tá rodando"
- "Esse erro apareceu: [cola o erro]"

---

## Como funciona

1. **Coleta o contexto** — qual arquivo, qual erro, qual comportamento esperado vs atual
2. **Lê os logs** — PM2, cron, Telegram, sistema
3. **Traça a causa raiz** — onde o problema realmente está (não só o sintoma)
4. **Mapeia o impacto** — o que mais pode ser afetado
5. **Propõe a correção** — exata, com arquivo e linha
6. **Avisa antes de mexer** em áreas protegidas

---

## Locais que sempre verifica

| Onde | O que verifica |
|------|----------------|
| `apps/bot-telegram/` | Lógica do bot (ÁREA PROTEGIDA — avisa antes) |
| `scripts/` | Crons e automações |
| `/var/log/` | Logs do sistema |
| `pm2 logs` | Erros em tempo real dos processos |
| `scripts/memory-linker/` | Pipeline de memória |

---

## Regras de Ouro

**Nunca:** mexer em área protegida sem "PERMITO PIVETE"
**Sempre:** mostrar o erro + causa raiz + solução proposta antes de executar
**Nunca:** adivinhar — se não tiver certeza, pedir mais contexto

---

## Exemplo de uso

```
Pivete: "Acha o bug — o memory-linker não tá notificando no Telegram"

Agente:
1. Lê: scripts/memory-linker/memory-linker-agent.mjs
2. Verifica: secrets/telegram-alerts.env (SRVER1_BOT_TOKEN existe?)
3. Lê: /var/log/memory-linker.log (qual erro aparece?)
4. Identifica: variável TELEGRAM_BOT_TOKEN sendo usada em vez de SRVER1_BOT_TOKEN
5. Reporta:
   "Bug encontrado: linha 15 usa TELEGRAM_BOT_TOKEN mas o arquivo
   correto tem SRVER1_BOT_TOKEN. Corrijo em memory-linker-agent.mjs?"
```

---

## Saída esperada

- Causa raiz identificada (arquivo + linha)
- Explicação de por que quebrou
- Solução proposta clara
- Confirmação antes de mexer em código

---

## Conexões Rápidas

- [[00-AGENTS-INDEX]] — arsenal completo
- [[DAILY-REVIEWER]] — revisão diária inclui verificar saúde do sistema
- [[ARCHITECTURE-REVIEWER]] — para problemas estruturais maiores
