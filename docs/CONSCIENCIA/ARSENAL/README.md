# 🔫 ARSENAL — Cofre de Ferramentas e IAs da CentralDark

> Cofre único onde vive TUDO que a gente pode chamar/combinar/refinar.
> Atualizado sempre que uma ferramenta nova entra ou sai.
> Última atualização: 03/07/2026

---

## 📁 Estrutura

```
ARSENAL/
├── README.md              ← este arquivo (inventário mestre)
├── DEBATES/               ← histórico de debates entre IAs
├── EVOLUCAO/YYYY-MM-DD/   ← melhorias diárias que o Hermes autônomo propõe
└── REFINAMENTOS/          ← respostas refinadas por Council de IAs
```

---

## 🖥️ CLIs disponíveis na VPS

| CLI | Path | O que faz |
|---|---|---|
| `claude` | /usr/bin/claude | Claude Code oficial (Anthropic) |
| `codex` | /usr/local/bin/codex | Codex CLI (OpenAI) |
| `darkai` | /usr/local/bin/darkai | **CLI unificado** — 17 modelos via 1 comando |
| `gh` | /usr/bin/gh | GitHub CLI |

---

## 🧠 Modelos acessíveis via `darkai` (17 no total)

**Google Gemini (7):**
- `google/gemini-3-flash-preview` ← padrão (rápido/barato)
- `google/gemini-3.1-flash-lite`
- `google/gemini-3.5-flash`
- `google/gemini-3.1-pro-preview`
- `google/gemini-2.5-pro` (multimodal, contexto grande)
- `google/gemini-2.5-flash`
- `google/gemini-2.5-flash-lite`

**OpenAI GPT (10):**
- `openai/gpt-5`, `openai/gpt-5-mini`, `openai/gpt-5-nano`
- `openai/gpt-5.2`
- `openai/gpt-5.4`, `openai/gpt-5.4-mini`, `openai/gpt-5.4-nano`, `openai/gpt-5.4-pro`
- `openai/gpt-5.5`, `openai/gpt-5.5-pro` ← estado da arte

---

## 🚪 Gateways HTTP rodando 24/7 no PM2

| Gateway | PM2 id | Porta interna | Serve |
|---|---|---|---|
| **EliteAnthropic** | 52 | interno | Claude (4 modelos HTTP 200) |
| **EliteHTTP** | 51 | 8080 | ChatGPT via HTTP (~21ms) |
| **EliteWS** | 50 | interno | ChatGPT via WebSocket (fallback) |

**API pública:** `https://api.centralldark.com/v1/chat/completions` (EliteHTTP exposto)

---

## 🎯 Tabela "qual IA pra qual tarefa" (Router de referência)

| Tipo de tarefa | Melhor IA | Velocidade | Custo |
|---|---|---|---|
| Simples / rápido | Gemini Flash | ⚡⚡⚡ | 💰 |
| Raciocínio médio | GPT-5-mini ou Claude Sonnet | ⚡⚡ | 💰💰 |
| Raciocínio complexo | GPT-5.4 ou Claude Opus | ⚡ | 💰💰💰 |
| Código / debug | Claude ou GPT-5.4 | ⚡⚡ | 💰💰 |
| Resumo / leitura | Gemini Flash Lite | ⚡⚡⚡ | 💰 |
| Análise longa (200k+ tokens) | Gemini 2.5 Pro | ⚡⚡ | 💰💰 |
| Estado da arte (crítico) | GPT-5.5-pro | ⚡ | 💰💰💰💰 |

---

## 🤖 Bots ativos

| Bot | Handle | Função |
|---|---|---|
| **HubBot** | @srver1bot | Central — controle geral CentralDark |
| **TelePainel** | @SEGREDOPUXADASBOT | Módulo Fiscal — puxadas/consultas |

---

## 🛠️ MCP tools (70 no runtime)

Categorias principais:
- **GitHub:** read + write + workflows + PRs
- **VPS:** run-once scripts, read/write safe, tree
- **Supabase:** leitura, schema, projetos
- **Notion:** buscar, criar, ler, anexar
- **Linear:** issues, ciclos, equipes
- **Sentry:** issues, resolver
- **Gemini:** analisar
- **Elite Gateway:** chat + status + logs
- **Memória:** LEMBRANCAS + CONSCIENCIA + PENDENCIAS
- **Skills:** listar, instalar, atualizar

---

## 🧬 IAs autônomas rodando 24/7 (agentes internos)

| Agente | PM2 id | O que faz |
|---|---|---|
| GuardiaoConsciencia | 28 | Vigia integridade do cérebro vivo |
| GuardiaoAnalista | 29 | Análise contínua de mudanças |
| Respiracao | 31 | Heartbeat/ritmo do sistema |
| EvolucaoIAs | 45 | Evolução automática |
| RefreshIAs | 54 | Atualização das IAs |
| Zentinel | 49 | Sentinela geral |
| SyncDrive | 46 | Sync com Google Drive |

---

## 🎁 O que dá pra combinar (Multi-Model Orchestration)

1. **Router Inteligente** — decide qual IA por tipo de tarefa
2. **Parallel Calling** — 2 IAs ao mesmo tempo + síntese
3. **Council de IAs (Multi-Agent Debate)** — N IAs debatem, juiz decide
4. **Hierarquia de Especialistas** — arquiteto (Opus) delega pra executor (Flash)
5. **Self-Refine** — IA responde, outra IA critica, primeira refina

Histórico de tudo isso vai ficar em `DEBATES/`, `REFINAMENTOS/` e `EVOLUCAO/`.

---

## 📌 Como consultar rapidamente

Do próprio Telegram:
```
/arsenal          → mostra este README
/arsenal cli      → só CLIs
/arsenal modelos  → só modelos
/arsenal bots     → só bots
```

(comandos a implementar na Fase 3)

---

## ⚠️ O que falta no arsenal

- 🔴 `ollama` — modelos locais grátis (Llama, Mistral) — instalar depois
- 🔴 `aider` — pair-programming com git integrado
- 🔴 Router HTTP unificado (Fase 2)
- 🔴 Council de IAs (Fase 2)
- 🔴 Botões no painel (Fase 4)
- 🔴 Hermes autônomo (Fase 5)
