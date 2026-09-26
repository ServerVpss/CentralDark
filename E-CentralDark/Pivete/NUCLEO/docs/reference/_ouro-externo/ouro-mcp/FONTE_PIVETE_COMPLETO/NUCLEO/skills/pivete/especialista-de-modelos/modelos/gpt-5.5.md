---
modelo: gpt-5.5
provider: openai
capability_tier: flagship
version_pagina: 0.2.0
data_criacao: 2026-08-07
ultima_atualizacao: 2026-08-07 14:10
aliases_outros_nomes:
  - "spud" (codinome interno)
  - "gpt-5.5-pro" (variante parallel test-time compute)
  - "gpt-5.5-thinking" (variante reasoning)
fontes_primarias:
  - url: https://deploymentsafety.openai.com/gpt-5-5
    tipo: system_card_oficial
    data_consulta: 2026-08-07
    sha: nao_verificado
  - url: https://www.vellum.ai/blog/everything-you-need-to-know-about-gpt-5-5
    tipo: analise_tecnica
    data_consulta: 2026-08-07
    sha: nao_verificado
  - url: https://github.blog/changelog/2026-04-24-gpt-5-5-is-generally-available-for-github-copilot/
    tipo: changelog
    data_consulta: 2026-08-07
    sha: nao_verificado
classificacao_5c_fonte_principal:
  classe_a_promovido: 8
  classe_b_ignorado: 0
  classe_c_lacuna: 0
  classe_d_rejeitado: 4
  classe_e_rejeitado: 6
manter_sempre:
  - capacidade_de_razonamento_antes_resposta
  - parallel_test_time_compute_na_variante_pro
  - treinando_para_checar_proprio_trabalho_e_continuar
---

# Modelo: GPT-5.5

## Identidade
- **provider:** OpenAI
- **capability_tier:** flagship
- **context_window:** 1M tokens (API) / 400K (Codex)
- **modalities:** texto, imagem, áudio, vídeo (nativamente omnimodal, fim-a-fim)
- **aliases:** "spud" (interno), gpt-5.5-pro (parallel test-time compute), gpt-5.5-thinking
- **release_date:** 2026-04-24 (GitHub Copilot rollout)
- **hardware_co_design:** GB200 + GB300 NVL72 (NVIDIA)

## Comportamento validado

### Razão como núcleo (Class A — OpenAI System Card)
- **Think before answer.** Modelo de raciocínio treinado por RL para pensar
  antes de responder. Produz cadeia interna longa de pensamento.
- **Refine + retry.** Aprende a refinar o próprio pensamento, tentar
  estratégias diferentes, reconhecer erros.
- **Checks its own work and keeps going until done.** — frase literal do
  system card. Esse é o padrão de comportamento documentado.
- **Parallel test-time compute (Pro).** Mesma base, setting que materializa
  paralelismo. Tem implicações diretas em benchmarks (Pro lidera FrontierMath).

### Capacidades-chave (Class A — Vellum)
- **Natively omnimodal fim-a-fim.** Texto, imagem, áudio, vídeo numa
  arquitetura única. Não é "stitching" de modelos anteriores.
- **Latência por token ≈ GPT-5.4** apesar de ser mais capaz. Co-design NVIDIA
  explica.
- **Self-improving infra.** Codex reescreveu o serving da OpenAI antes do
  lançamento. Gerou +20% token/s.
- **MRCR v2 long-context:** 74.0% (512K–1M), 87.5% (128K–256K). Salto
  qualitativo vs GPT-5.4 (36.6%).
- **ARC-AGI-2:** 85.0% vs Claude Opus 4.7 (75.8%) e Gemini 3.1 Pro (77.1%).
- **Terminal-Bench 2.0:** 82.7% vs Claude Opus 4.7 (69.4%). Lidera codificação
  agentic.
- **OSWorld-Verified:** 78.7% (lidera, mas apertado vs Claude 78.0%).
- **GDPval:** 84.9% (44 ocupações reais).

### Como o Pivete vai usar (preenchido depois)
- _aguardando padrões de uso reais do Pivete_

## Limites conhecidos

### Pontos onde NÃO lidera (Class A do Vellum, contra-marketing)
- **HLE (sem tools):** 41.4% — Claude Opus 4.7 lidera com 46.9%.
- **SWE-Bench Pro:** 58.6% — Claude 4.7 lidera com 64.3%.
- **MCP Atlas:** 75.3% — Claude 79.1%, Gemini 78.2%.
- **GPQA Diamond:** 93.6% — Gemini 3.1 Pro (94.3%) e Claude (94.2%) lideram.
- **Regression em extremism/harassment:** Tabela 1 do system card mostra
  GPT-5.5 às vezes abaixo do GPT-5.4-thinking (ex: extremism 0.925 vs 1.000).
  A OpenAI declara "regressions não significativas" — fica marcado.

### Custos / Temporal (Class E — REJEITADO, não promover)
- 7.5× premium request multiplier no Copilot (temporal/promo).
- Preços por token voláteis (R$ rejeitar).
- Datas de rollout/descontinuação (R$ rejeitar).

## Padrões de uso (Pivete — a ser completado)

> Este bloco é **escrito pelo Pivete ou revisado por ele**. Eu proponho, ele
> aprova. Default: _aguardando_.

## Como a Casa usa (a ser preenchido)

- Hoje: modelo default ainda é MiniMax-M3 (Casa). GPT-5.5 fica disponível se
  o Pivete configurar `provider: openai` + chave.
- Possibilidade: usar GPT-5.5 como fallback multimodal (REGRAS #18 já tem
  Vision primário = Gemini 3.5-flash).
- Sem decisão automática — só com ordem.

## Evidência / SHA

- deploymentsafety.openai.com/gpt-5-5 — system card, atualizado 2026-04-24
- vellum.ai/blog/everything-you-need-to-know-about-gpt-5-5 — benchmarks
  (vendor-reported: declarar)
- github.blog/changelog/2026-04-24 — release note

## Última atualização
- 2026-08-07 14:10

## Pendente de verificação
- SHA-256 dos PDFs (montaremos quando baixar).
- Comparação independente (não vendor-reported) — sem fonte até então.
- Comportamento real em Casa (sem testes ainda).
- Padrões de uso do Pivete — bloco vazio.

---

## ANEXO — Classificação 5-classes aplicada às 3 fontes

### Github blog (Class E — REJEITADO)
- "rolling out" — temporal
- "7.5× premium multiplier" — temporal/preço
- "Copilot Pro+/Business/Enterprise" — D (plataforma)
- "model picker" — D (UI específica)
- "jetbrains/xcode/eclipse" — D (integração plataforma)
- Total: 0 A, 0 B, 0 C, 4 D, 2 E

### OpenAI System Card (Class A — PROMOVIDO)
- "reasoning trained via RL" — A
- "think before answer" — A
- "long internal chain of thought" — A
- "refine thinking, try different strategies, recognize mistakes" — A
- "checks its own work and keeps going until done" — A
- "parallel test time compute (Pro)" — A
- "Production Benchmarks with Challenging Prompts" — A (mérito de método)
- "200 early-access partners" — D (rejeitar como prova; é dado de processo)
- "Usage Policies reference" — D (URL de política)
- Tabela 1 (pontuações por categoria) — parcial A (comparação) + E (números)
- Total: 8 A, 0 B, 0 C, 2 D, 0 E

### Vellum (Class A — PROMOVIDO, com caveats)
- "natively omnimodal" — A
- "hardware co-design GB200/GB300" — A (padrão de engenharia)
- "self-improving infra: model rewrote its own serving" — A
- "long-context MRCR v2 74.0% vs 36.6%" — A (padrão de salto)
- "ARC-AGI-2 85.0% lead" — A
- "Terminal-Bench 2.0 82.7%" — A
- "Codex usado por 85% dos funcionários OpenAI" — D (rejeitar; é marketing)
- "Finance team: 24,771 K-1 forms" — D (anecdótico)
- "Ramsey numbers proof" — A (capacidade demonstrada)
- "Vendor-reported caveat" — A (TRANSPARÊNCIA importante)
- Total: 8 A, 0 B, 0 C, 4 D, 0 E

### blakecrosley (REJEITADO da página GPT-5.5)
- O guia de 22k palavras é sobre **Hermes Agent**, não sobre GPT-5.5.
- Os 19 artigos listados são posts separados — não extraídos (escopo fora).
- Vai pra `references/fontes-nao-usadas.md` se for útil.
