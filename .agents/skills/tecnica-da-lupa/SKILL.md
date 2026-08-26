---
name: tecnica-da-lupa
description: Checklist de 7 filtros para revisar criticamente output de agente (design, arquitetura, plano, código grande) antes de aprovar ou executar. Use quando qualquer IA (Lovable, Gemini, GPT, Cursor, Claude, Grok, Codex, Copilot) entregar algo grande demais pra confiar de olho.
metadata:
  type: operational
  version: "1.0"
  owner: SEGREDO/CHEFE
  origin: "garimpado de ~/.grok/skills/tecnicadalupa (pacote centraldark-skills-pacote.zip, 2026-08-26) — conteúdo original preservado, adaptado ao formato canônico da Casa"
---

# Técnica da Lupa — Revisão Crítica de Designs e Prompts

Método sistemático para revisar outputs de agentes antes de aprovar ou executar. Não substitui `.agents/skills/meta-lupa/SKILL.md` (falsificação crítica, fact/inference/hypothesis/UNKNOWN) — é um checklist mais estreito e prático, focado em avaliar entregas grandes (design, arquitetura, plano de implementação, código) antes de dar prosseguimento. Os dois se complementam: MetaLupa ataca a prova; esta técnica ataca o inchaço.

Quando um agente entregar um design, arquitetura, plano de implementação ou código grande, aplique os 7 filtros abaixo rigorosamente antes de dar prosseguimento.

## 1. Realidade vs Aparência

Isso resolve o problema real ou só está bonito/complexo para parecer completo?

Tem excesso de tabelas novas, painéis, edges, "ondas" ou componentes só para encher linguiça?

## 2. Impacto no que já funciona

Isso altera, toca ou reescreve algo que já está em produção e funcionando?

Circuit breaker, rate limit, dedup, funil único, trace_id ou qualquer fluxo crítico pode ser impactado? (Resposta ideal: não)

## 3. Complexidade vs Valor Real

O benefício justifica a complexidade que está sendo adicionada?

Estamos resolvendo poucos problemas com muitas peças novas? (Sinal de alerta)

## 4. Regressão

Existe plano explícito de como validar que nada quebrou?

Tem testes, checklist ou queries de sanidade para os fluxos críticos?

## 5. Rollback Seguro

Se der merda em produção, como revertemos rápido e com segurança?

Só feature flag é suficiente ou existe plano concreto de rollback por parte/onda?

## 6. Tratamento de Legado e Dívida Técnica

Está realmente isolando o código legado ou só colocando log em cima?

Os caminhos antigos continuam vivos sem plano real de remoção?

## 7. Manutenção e Complexidade Operacional

Quem vai manter isso daqui a 3 meses?

Estamos aumentando significativamente a superfície de falha e pontos de manutenção?

## Conexões Rápidas

- [[meta-lupa]] — falsificação crítica, separação fato/inferência/hipótese/UNKNOWN
- `LEIA-ME-IA.md` seção 5.2 — ontologia de evidência e causalidade
