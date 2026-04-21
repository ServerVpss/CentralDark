

# Sistema de Monitoramento de Saúde dos Módulos (Sem Auto-Toggle)

Cria um painel visual que mostra a saúde real de cada módulo, mas **deixa a decisão de ativar/desativar nas suas mãos**. Nada é mexido automaticamente.

## O que será construído

### 1. Tabela `module_health_status`
Uma linha por módulo, atualizada em tempo real:
- `module_key`, `total_attempts_24h`, `success_count_24h`, `notfound_count_24h`, `error_count_24h`
- `success_rate` (calculado)
- `last_success_at`, `last_failure_at`, `last_check_at`
- `health_label` ("healthy" / "degraded" / "no_data" / "failing")

Sem campo de auto-disable — o sistema **só observa, nunca decide**.

### 2. Instrumentação no `api-query`
A cada consulta real, registra o resultado (success / notFound / error) via RPC atômico `record_module_attempt(module_key, outcome)`. Zero impacto na latência.

### 3. Job de cálculo (cron a cada 15 min)
Nova Edge Function `module-health-calc` que recalcula as métricas de 24h e atualiza o `health_label` de cada módulo:
- 🟢 **Saudável** — sucesso ≥ 50%
- 🟡 **Degradado** — sucesso entre 10-50%
- 🔴 **Sem retorno** — 100% notFound ou erro com ≥ 3 amostras
- ⚪ **Sem dados** — < 3 amostras nas últimas 24h

### 4. UI no `QueryModulesManager.tsx`
Cada card de módulo ganha:
- **Badge de saúde** colorido ao lado do nome
- **Mini-stats abaixo**: "98% sucesso · 1.234 consultas · última 2min atrás"
- **Tooltip com detalhes**: contagem por outcome (✅ 145 / ❌ 0 / ⚠️ 12)

O **switch ON/OFF que já existe permanece igual** — você decide quando desativar com base no que vê.

### 5. Filtros e resumo no topo
Cards adicionais no painel:
- Saudáveis (verde) | Degradados (amarelo) | Sem retorno (vermelho) | Sem dados (cinza)

Filtro de busca: "Todos / Saudáveis / Problemáticos / Sem dados" para isolar rapidamente módulos que merecem atenção.

### 6. Botão "Recalcular agora"
Dispara o `module-health-calc` manualmente, sem esperar os 15 min do cron. Útil pra validar depois de uma rodada de testes.

## Fluxo do usuário

```text
Módulo /credilink começa retornando 100% notFound
   ↓ (próximo recálculo, até 15 min)
Painel mostra 🔴 "Sem retorno: 0/45 últimas 24h"
   ↓
Você vê, avalia, decide:
   ├─ Desliga manualmente o switch → módulo OFF
   └─ Ou deixa ligado pra continuar coletando dados
   ↓
Quando o provider voltar → badge muda pra 🟢 sozinho
   ↓ Você reativa quando quiser
```

## Detalhes técnicos

- **RPC atômico**: `record_module_attempt` usa `INSERT ... ON CONFLICT DO UPDATE` para evitar race conditions
- **Janela móvel**: métricas sempre em 24h, recalculadas a partir de `query_history` no cron
- **Realtime**: tabela `module_health_status` publicada no Supabase Realtime — badges atualizam sem refresh
- **Sem efeito colateral**: o cron NUNCA toca em `query_modules.enabled` — só atualiza o status visual

## Arquivos afetados

- `supabase/migrations/` — nova tabela `module_health_status` + RPC `record_module_attempt`
- `supabase/functions/module-health-calc/index.ts` — nova função (cron 15 min)
- `supabase/functions/api-query/index.ts` — instrumentação leve
- `src/components/bots/QueryModulesManager.tsx` — badges, mini-stats, filtros, botão recalcular
- `src/hooks/useModuleHealth.ts` — hook para subscrever ao Realtime

