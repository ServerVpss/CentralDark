---
title: "MULTI MODEL ORCHESTRATION"
date: 2026-07-03
tags: ["consciencia"]
updated: 2026-07-03
---

# 🎼 Multi-Model Orchestration — visão do sistema

> Filosofia: nunca chamar uma IA só quando dá pra combinar várias.

> **Nomenclatura (termos usados lá fora):**
> - **"Swarm Prompting"** / **"Multi-Agent Swarm"** — disparar vários sub-agentes em paralelo numa mesma missão, cada um com escopo próprio.
> - **"Fan-out / Fan-in"** — termo mais formal de engenharia de sistemas distribuídos: espalha o trabalho em paralelo (fan-out) e depois consolida os resultados num ponto único, o "juiz" (fan-in).
>
> É exatamente o modo de operação padrão desta sessão: orquestrador delega (fan-out), agentes executam em paralelo, orquestrador só espera e consolida (fan-in).
>
> - **"LLM Council" / "Council of Models"** — termo pra quando os agentes em paralelo fazem *debate cruzado* entre si antes do resultado final (não só trabalho independente) — é exatamente o que o **Arsenal Council** já implementa (`arsenal-parallel` = 3 modelos + juiz, `arsenal-debate` = 2 rodadas + veredito). Ver [[CONSELHO]] para detalhes do Arsenal.
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

## Sistema 10-80-10 (regra de custo por nível de tarefa)

Princípio pra qualquer orquestração multi-modelo (Arsenal, Hermes, delegação de sub-agentes): **suba de nível só quando precisar, delegue pra baixo sempre que der.**

```
Planejar (10% dos tokens)  → modelo topo (raciocínio profundo, arquitetura)
Executar (80% dos tokens)  → modelo padrão (construir, iterar, implementar)
Revisar  (10% dos tokens)  → modelo topo de novo (conferir, corrigir falhas)
```

- Trabalho braçal mecânico (corrigir typo, formatar JSON, renomear variável) NUNCA vai pro modelo mais caro — é a mesma qualidade por uma fração do custo num modelo mais barato/local.
- Regra prática: escolha de modelo por *tipo de tarefa*, não por hábito. Decisão de arquitetura → modelo forte. Execução padrão → modelo intermediário. Braçal → modelo barato ou grátis (local).
- Efeito medido (fonte externa trazida pelo Pivete, 10/07/2026): mesma qualidade final, 50%+ menos custo, até 3x mais barato em tarefas mecânicas.

### Template 1 — Prompt Orquestrador (nível topo comanda nível execução)

Uso: quando o Pivete quer que um modelo caro (Fable 5/Opus) planeje e um enxame de modelos mais baratos (Sonnet/Codex) execute.

```
Eu quero que você use o [MODELO TOPO] como orquestrador de agentes nível 2 como
[MODELO EXECUÇÃO A] e [MODELO EXECUÇÃO B] para construir e iterar a seguinte tarefa:

[TAREFA]

Antes de iniciar, [MODELO TOPO] deve fazer todo planejamento para depois os
subagentes executarem.

Dispachar no máximo 10 agentes para essa tarefa.

[MODELOS EXECUÇÃO] devem executar todo planejamento realizado pelo [MODELO TOPO].

Após finalizar a execução, [MODELO TOPO] deve sintetizar todos os achados e
validar cada pedaço da construção entregue pelos modelos inferiores.
```

### Template 2 — Prompt de Handoff (retomar sessão sem perder contexto)

Uso: fechar uma sessão longa e abrir limpo em outra, sem perder decisões/constraints. Candidato a virar skill/slash-command.

```
Give me a prompt I can use to restart this session in a new chat without
losing any of our context.

Include:
- What we decided
- What we built
- What the next steps are
- Any important constraints I must remember

Make it under 500 tokens so the new session starts lean.
```

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
