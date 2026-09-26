# INDEX-MODELOS — tabela viva por CAPACIDADE

> Router pensa em CAPACIDADE, não em modelo. Cada página é um modelo. Esta
> tabela organiza pelo **score de capacidades** (não por data).

## Como ler

- **Quando o Hermes precisa decidir**, ele olha esta tabela + perfis de tarefa.
- **score_x** = nota de 0-10 em cada capacidade.
- **status** = prova real medida: `✅ online` / `🟡 trial_exhausted` / `🔴 quota` / `⚪ não testado`.

## Tabela — ordenada por score agente (1M contexto disponível)

| id | reasoning | coding | context | latency | cost | status | provedor | rota |
|---|---:|---:|---:|---:|---:|---|---|---|
| `gpt-5.5` | 10 | 10 | 10 (1M) | 6 | 1 | 🔴 | openai-codex | OAuth ChatGPT |
| `MiniMax-M3` | 9 | 9 | 10 (1M) | 7 | 9 | 🟡 | minimax | Token Plan |
| `gemini-2.5-flash` | 7 | 7 | 10 (1M) | 9 | 10 (free) | ✅ | openrouter | free tier ⭐ |
| `MiniMax-M2.7-highspeed` | 8 | 8 | 6 (204k) | 10 | 9 | 🟡 | minimax | Token Plan |
| `MiniMax-M2.7` | 8 | 8 | 6 (204k) | 7 | 9 | 🟡 | minimax | Token Plan |
| `gpt-4o-mini` | 7 | 7 | 4 (128k) | 8 | 10 (free) | ✅ | openrouter | free tier |
| `gpt-5-nano` | 6 | 6 | 8 | 9 | 8 | 🔴 | darkai | 402 sem_creditos |
| `gemini-2.5-pro` | 9 | 8 | 9 | 7 | 4 | 🔴 | openrouter | sem saldo |
| `gpt-5` | 9 | 9 | 9 | 6 | 2 | 🔴 | darkai | 402 sem_creditos |

## Próximos a triar

| id | status | prioridade |
|---|---|---|
| `MiniMax-M2.5` | 🟡 trial_exhausted | alta (mesma família) |
| `MiniMax-M2.5-highspeed` | 🟡 trial_exhausted | alta |
| `MiniMax-M2.1` | 🟡 trial_exhausted | baixa |
| `MiniMax-M2` | 🟡 trial_exhausted | baixa |
| `claude-opus-4.7` | ⚪ não testado | média (REGRAS #14 diz bloqueado) |
| `claude-sonnet-4.6` | ⚪ não testado | baixa |
| `gemini-3.1-pro` (darkai) | 🔴 sem_creditos | média |

## Atualização

**Última:** 2026-08-07 14:30
**Mudança:** tabela reescrita por **capacidade**, não por data. Score por 5 dimensões.
**Próxima:** quando M3 ou M2.7-highspeed tiver saldo, atualizo score real.
