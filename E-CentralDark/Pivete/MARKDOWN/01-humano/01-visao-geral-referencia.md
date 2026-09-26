# 01 — Visão geral do padrão de produto (referência de mercado)

## Problema que o padrão resolve

Devs pagam caro em modelos flagship (ex.: Claude Opus / Max) e **queimam o limite** em tarefas que um modelo barato faria:

- ler arquivos longos
- buscar no repo
- escrever schema / rota simples
- rodar testes
- tarefas repetitivas de execução

**Dor final:** rate limit no meio da semana + custo alto + só **1 agente serial**.

---

## Solução em uma frase

> **IDE / cockpit multi-agent:** um orquestrador “caro” pensa; workers “baratos” executam em paralelo; o usuário vê custo e progresso em tempo real.

---

## Três pilares do produto

### 1) Orquestração (cérebro)
- Decompõe missão em subtarefas
- Escolhe papel (scout, builder, reviewer, executor)
- Escolhe modelo por custo/qualidade

### 2) Paralelismo (músculo)
- Várias “panes” / sessões / agents ao mesmo tempo
- Cada um com modelo e budget próprios
- Cost cap por agent (não estoura conta)

### 3) Observabilidade de custo (nervo)
- $/min, total da missão, tokens/s
- Comparativo “vs solo” (1 modelo fazendo tudo)
- Histórico por missão

---

## O que o usuário **compra** vs o que ele **trazer**

| Ele compra do produto | Ele traz / paga fora |
|-----------------------|----------------------|
| App / cockpit | API keys dos providers |
| Multi-pane / multi-agent | Tokens Anthropic, OpenAI, etc. |
| Cost tracker | Conta Claude Code / CLIs |
| Papéis e templates | Preferências de stack |
| (opcional) voz / skills | Grants / bolsas de terceiros |

**Insight crítico:** o SaaS **não revende token**. Ele vende **coordenação**.

---

## Analogia simples

```
SEM o padrão:
  Você = 1 pedreiro genial caro fazendo tudo (pensar + carregar tijolo)

COM o padrão:
  Você = mestre de obra
  1 arquiteto caro (pensa)
  5 ajudantes baratos (executam)
  Painel de custo por pessoa em tempo real
```

---

## Posicionamento de mercado (genérico)

| Tipo de ferramenta | Foco | Limite típico |
|--------------------|------|---------------|
| Chat único (Claude/ChatGPT) | Conversa | 1 thread |
| IDE com AI (Cursor etc.) | Editar código com AI | Ainda centrado em 1 fluxo |
| Swarm / executor | Rodar tasks paralelas | Pouca “IDE” visual |
| **Cockpit multi-agent** | Orquestrar N models + N papéis + custo | Complexidade de produto alpha |

O padrão que estamos estudando é o da **última linha**.

---

## Status típico desse tipo de produto

- Alpha / build-in-public
- Cross-platform (desktop ou web)
- Comunidade Discord forte
- Growth por **economia de custo** + **hack de grants** (ex.: bolsas de provider)
- Founder-led sales (live, email, community)

---

## O que importar para o Central Dark

Não importar o app. Importar o **padrão mental**:

1. Separar **pensar** vs **executar**
2. Expor **papéis** (não só modelos)
3. Medir **custo por missão/agent**
4. Monetizar o **gateway/cockpit**, não o token do provider
5. Usar **providers próprios** (Abacus / Arsenal) como “fábrica de workers”
