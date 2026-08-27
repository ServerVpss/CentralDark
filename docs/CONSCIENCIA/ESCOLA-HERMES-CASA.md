---
title: "ESCOLA HERMES CASA"
date: 2026-08-27
tags: ["consciencia"]
updated: 2026-08-27
---

# Escola Hermes Casa — aprendizado local, ouro canônico

## Fonte da verdade

A Escola não é um segundo sistema. Ela usa os arquivos já existentes:

- laboratório local: `CASA-VAULT/20-INBOX-HERMES`;
- aprendizado canônico: `docs/CONSCIENCIA/APRENDIZADOS.md`;
- comportamento geral: `LEIA-ME-IA.md`, `AGENTS.md` e `.agents/skills/`.

## Fluxo

```text
Hermes aprende durante uma tarefa
→ cria candidato no Inbox local
→ remove informação privada
→ registra problema, regra, prova e teste
→ promove com scripts/casa/promover-aprendizado-hermes.ps1
→ atualiza APRENDIZADOS.md
→ commit/PR
→ CI e revisão
→ merge
→ Casa faz pull e Hermes recarrega
```

## Regra de promoção

Um candidato só entra no canônico quando tiver:

- `LESSON_ID` único;
- problema observado;
- aprendizado reutilizável;
- prova reproduzível;
- teste ou forma objetiva de validação;
- `PRIVADO=NAO`.

O promotor rejeita palavras e formatos típicos de segredo. Ele nunca lê `.env`, cookies, sessões, chaves ou arquivos fora do candidato informado.

## O que permanece local

- memória pessoal;
- conversa;
- rotina da Casa;
- anexos privados;
- descobertas ainda não provadas;
- candidatos marcados como privados.

## Resultado

A Casa ensina. O GitHub consolida. Todas as IAs recebem o aprendizado aprovado na próxima carga da fonte da verdade.
