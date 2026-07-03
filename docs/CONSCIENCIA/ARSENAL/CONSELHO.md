---
title: "CONSELHO DE IAs — Como usar"
date: 2026-07-02
tags: ["arsenal", "orquestracao"]
---

# 🧠 CONSELHO DE IAs (Fase 2)

Dispara 3 IAs em paralelo (Gemini Pro + GPT-5 + Gemini Flash) e um **Juiz** (Gemini Flash) sintetiza um veredicto único.

## Uso (rápido)

```bash
refinar "sua pergunta ou tema aqui"
```

Ou pelo caminho completo:

```bash
bash /root/CentralDark/docs/CONSCIENCIA/ARSENAL/scripts/council.sh "tema"
```

## O que acontece

1. **Paralelo:** 3 IAs respondem ao mesmo tempo (~15–30s)
2. **Juiz:** Gemini Flash lê as 3, aponta convergências/divergências, dá o veredicto
3. **Salva:** `docs/CONSCIENCIA/ARSENAL/DEBATES/YYYY-MM-DD-HHMM-<slug>.md`
4. **Imprime:** veredicto direto no terminal

## Exemplo real

```bash
refinar "Qual a melhor arquitetura pra um cache Redis de sessões?"
```

Saída: veredicto no terminal + arquivo completo com as 3 opiniões + síntese em `DEBATES/`.

## Configuração

O script já tem `DARKAI_URL` e `DARKAI_ANON_KEY` embutidos (fallback). Podem ser sobrescritos por env se precisar.

## Modelos usados

| Papel | Modelo | Por quê |
|---|---|---|
| Voz 1 | `gemini-3.1-pro-preview` | Raciocínio profundo |
| Voz 2 | `gpt-5` | Contraponto OpenAI |
| Voz 3 | `gemini-3-flash-preview` | Rápido, cria diversidade |
| Juiz | `gemini-3-flash-preview` | Rápido e barato pra sintetizar |

Trocar modelos: editar `scripts/council.sh`.

## Próximas fases

- **Fase 3:** comando `/refinar` no bot `@srver1bot` pra rodar do Telegram
- **Fase 5:** Hermes autônomo (cron 6h da manhã pega item de `PENDENCIAS.md`, roda conselho, salva em `EVOLUCAO/`)
