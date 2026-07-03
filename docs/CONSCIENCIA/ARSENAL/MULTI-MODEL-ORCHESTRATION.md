---
title: "MULTI MODEL ORCHESTRATION"
date: 2026-07-03
tags: ["consciencia"]
updated: 2026-07-03
---

# 🎼 Multi-Model Orchestration — visão do sistema

> Filosofia: nunca chamar uma IA só quando dá pra combinar várias.
> Router → Parallel → Council → Hermes.

---

## 5 técnicas (do simples ao avançado)

| # | Nome | Dificuldade | Ganho velocidade | Ganho qualidade |
|---|---|---|---|---|
| 1 | Router Inteligente | Fácil | Alto | Médio |
| 2 | Parallel Calling + Síntese | Médio | Muito Alto | Alto |
| 3 | Multi-Agent Debate (Council) | Médio-Alto | Médio | Muito Alto |
| 4 | Hierarquia de Especialistas | Médio | Alto | Alto |
| 5 | Self-Refine + Verificação | Médio | Baixo | Alto |

---

## Fluxo Council (Multi-Agent Debate)

```
Pergunta do Pivete
    │
    ├──> Claude Opus     (opinião A)
    ├──> GPT-5.4         (opinião B)   ← rodadas em paralelo
    └──> Gemini 2.5 Pro  (opinião C)
              │
              ▼
        JUIZ (Gemini Flash barato)
        analisa as 3 opiniões
        decide qual tem razão
              │
              ▼
        Resposta final sintetizada
              │
              ▼
        Salva em DEBATES/YYYY-MM-DD-tema.md
        Posta ao vivo no grupo Telegram
```

---

## Hermes Autônomo (Fase 5)

Cron diário às 6h da manhã:

1. Pega item aleatório de `docs/PENDENCIAS.md`
2. Dispara Council sobre esse item ("como resolver X?")
3. Salva debate em `EVOLUCAO/YYYY-MM-DD/pendencia-N.md`
4. Se o juiz aprovar (>80% consenso), gera PR automático no GitHub
5. Se for melhoria menor, aplica direto e commita
6. Manda resumo no Telegram

Regra de ouro: **nunca quebra nada — só propõe, você aprova**.
Só executa direto se estiver na whitelist (docs, comentários, refactor puro).

---

## Onde fica salvo tudo

```
docs/CONSCIENCIA/ARSENAL/
├── DEBATES/
│   └── 2026-07-03-como-otimizar-mcp.md
├── REFINAMENTOS/
│   └── 2026-07-03-refactor-notion-sync.md
└── EVOLUCAO/
    └── 2026-07-03/
        ├── pendencia-1-analise.md
        ├── pendencia-1-debate.md
        └── pendencia-1-decisao.md
```

Tudo commitado no git → aparece no Notion (via sync) → você vê no celular.

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
