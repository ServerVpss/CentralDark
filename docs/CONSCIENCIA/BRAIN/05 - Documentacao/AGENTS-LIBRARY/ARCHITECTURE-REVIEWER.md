---
title: "Skill: Revisa a Arquitetura"
date: 2026-06-29
tags: ["skill", "arquitetura", "revisao", "tecnico", "estrutura"]
updated: 2026-06-29
---

# 🤖 SKILL: ARCHITECTURE-REVIEWER

> 🗣️ **Chame assim:** _"Revisa a arquitetura"_, _"Tá certo assim?"_, _"Tem jeito melhor?"_, _"Olha essa estrutura"_
> **Objetivo:** Olhar a estrutura do sistema com olhos críticos — identificar decisões que vão causar problema no futuro, sugerir melhorias e documentar o raciocínio.
> **Tipo:** Revisão Técnica | **Prioridade:** Média-Baixa

---

## Quando usar

- Antes de implementar algo novo que vai afetar a estrutura
- "Faz sentido colocar isso aqui?"
- Quando a solução atual está ficando difícil de manter
- "Olha esse cron/script/módulo — tá bem feito?"
- Depois de uma refatoração grande para validar

---

## Como funciona

1. **Lê o contexto** — qual parte do sistema revisar
2. **Analisa 4 dimensões:**
   - **Manutenibilidade** — vai ser fácil mudar no futuro?
   - **Segurança** — há exposição de segredos ou pontos de ataque?
   - **Resiliência** — o que acontece se falhar?
   - **Sincronia** — os 4 pontos (VPS, GitHub, BRAIN, CONSCIENCIA) estão alinhados?
3. **Identifica riscos** — classificados por gravidade
4. **Propõe melhorias** — concretas, com impacto estimado
5. **Documenta a decisão** — registra em `08-HISTORICO-DECISOES.md` se relevante

---

## O que verifica por padrão

```
Estrutura PM2:         processos corretos? nomes padronizados?
Segredos:              em secrets/? nunca hardcoded?
Crons:                 timer aleatório? logs configurados?
GitHub Actions:        workflows sensatos? sem segredos expostos?
Sincronia 4-Point:     VPS + GitHub + BRAIN + CONSCIENCIA alinhados?
Áreas protegidas:      respeitadas?
```

---

## Regras de Ouro

**Nunca:** sugerir mudanças em áreas protegidas sem "PERMITO PIVETE"
**Sempre:** contextualizar — por que essa estrutura é melhor?
**Nunca:** refatorar sem proposta aprovada primeiro

---

## Exemplo de uso

```
Pivete: "Revisa a arquitetura do memory-linker"

Agente:
1. Lê: scripts/memory-linker/ (3 arquivos)
2. Analisa:
   - ✅ Timer aleatório: implementado
   - ✅ Logs: /var/log/memory-*.log configurados
   - ⚠️ Segurança: credenciais lidas de secrets/ ✅
   - ⚠️ Resiliência: se Analyst falhar, Executor não limpa state — pode re-rodar
3. Propõe:
   "Adicionar verificação de data em analyst-decision.json para
   evitar re-execução se o arquivo tiver mais de 2h. Implemento?"
```

---

## Saída esperada

- Diagnóstico: o que está bom e o que está em risco
- Lista de melhorias priorizadas
- Decisão registrada se aprovada
- Nada executado sem aprovação do Pivete

---

## Conexões Rápidas

- [[00-AGENTS-INDEX]] — arsenal completo
- [[CODE-INVESTIGATOR]] — para problemas imediatos (bugs)
- [[DECISION-RECORDER]] — para registrar decisões arquiteturais
- [[MAPA-DO-CEREBRO]] — visão geral do sistema
