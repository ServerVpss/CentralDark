---
title: "Preços reais — Nemotron 3 Ultra vs GPT-5.6 (jul/2026)"
data: 2026-07-23
fonte: OpenRouter API pública (`https://openrouter.ai/api/v1/models`)
autor: Lovable (a pedido do Pivete)
status: evidência coletada, decisão de roteamento PENDENTE de confirmação
---

# 💰 Preços reais coletados em 23/07/2026

Puxados direto do endpoint público do OpenRouter. Valores em **USD por 1M tokens**.

| Modelo | Input | Output | Nível |
|---|---:|---:|---|
| `nvidia/nemotron-3-ultra-550b-a55b` | **$0,50** | **$2,20** | Topo |
| `openai/gpt-5.6-sol` | $5,00 | $30,00 | Topo |
| `openai/gpt-5.6-terra` | $2,50 | $15,00 | Balanceado |
| `openai/gpt-5.6-luna` | $1,00 | $6,00 | Rápido |
| `openai/gpt-5.5` (referência anterior) | $5,00 | $30,00 | Geração passada |
| `openai/gpt-5.4` | $2,50 | $15,00 | Geração passada |
| `openai/gpt-5.4-mini` | $0,75 | $4,50 | Geração passada |
| `openai/gpt-5.4-nano` | $0,20 | $1,25 | Geração passada |
| `nvidia/nemotron-3-super-120b-a12b` | $0,08 | $0,45 | Médio |
| `nvidia/nemotron-3-nano-30b-a3b` | $0,05 | $0,20 | Nano |

## 🔎 Achado principal

**Nemotron 3 Ultra 550B custa ~10× menos que GPT-5.6 Sol no input e ~14× menos no output**, mesmo sendo tier topo. Isso inverte a recomendação anterior (que era baseada em chute de memória, não em preço real).

## ⚠️ Aplicação da Lupa Bayesiana — falsificadores acionados

Antes de trocar o cérebro padrão do CentralDark, precisa checar:

1. **Compatibilidade de gateway** — `docs/CONSCIENCIA/ARSENAL/regras.json` diz explicitamente:
   > "prefixos google/openai/anthropic REMOVIDOS — provider é Abacus RouteLLM, que rejeita IDs com prefixo."
   
   Então `nvidia/nemotron-3-ultra-550b-a55b` (com prefixo) **provavelmente será rejeitado** pelo Arsenal Council. Precisa confirmar por qual rota o Nemotron entra: OpenRouter direto? Elite Gateway próprio? Novo provider?

2. **Latência real** — preço bom não vale nada se o p95 for > 10s. Falta medir com uma amostra real.

3. **Qualidade em PT-BR** — Nemotron é treinado majoritariamente em EN. Falta teste A/B em prompts curtos em português (caso de uso do cockpit).

## 📌 Próximos passos (pendente de OK do Pivete)

- [ ] Confirmar gateway de saída para Nemotron (OpenRouter direto vs Elite Gateway).
- [ ] Rodar 20 prompts reais do cockpit em Nemotron Ultra e Sol em paralelo; comparar qualidade + latência.
- [ ] Só então atualizar `apps/modulos/HERMES-CORE/core/cadeia.json` e `docs/CONSCIENCIA/ARSENAL/regras.json`.

## 🧾 Fio da missão

Pivete pediu comparação real de custo entre Nemotron Ultra e GPT-5.6. Lovable entregou tabela oficial + acionou falsificador da Lupa antes de propagar mudança de config. Aguarda confirmação de gateway antes de mexer em Arsenal e Hermes.
