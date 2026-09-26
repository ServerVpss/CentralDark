# 06 — Fluxos de usuário e de valor

## Fluxo A — Onboarding (do zero ao aha)

```
1. Chega na landing
2. Cria conta (Google/GitHub)
3. Escolhe plano / trial
4. Conecta provider OU gera API key do gateway
5. Abre cockpit
6. Escolhe squad template (ex: "feature-fast")
7. Escreve 1ª missão curta
8. Vê 2+ agents trabalhando
9. Vê cost panel mexendo
10. AHA: "isso é mais barato/rápido que sozinho"
```

**Métrica de ativação:** passo 10 em < 24h.

---

## Fluxo B — Missão feliz (happy path)

```
User: "Adiciona rate limit no endpoint /login"
        │
        ▼
Orchestrator gera plano:
  1. Scout: achar arquivos de auth
  2. Builder: implementar middleware
  3. Reviewer: checar edge cases
  4. Executor: rodar testes
        │
        ▼
Spawn paralelo (scout) → depois builder → reviewer → executor
        │
        ▼
Artifacts: diff + testes + resumo
        │
        ▼
Mission completed · cost $0.XX · duration Xm
```

---

## Fluxo C — Budget exceeded

```
CostMeter atinge 90% do budget
  → UI warning
CostMeter atinge 100%
  → hard stop agents
  → status = budget_exceeded
  → user escolhe: +budget | resumir | cancelar
```

Sem hard stop = usuário perde confiança (e dinheiro).

---

## Fluxo D — Escalation (barato → caro)

```
Executor barato falha 2× na mesma subtarefa
  → Orchestrator marca escalate
  → reatribui para flagship (Opus/Arsenal Parallel)
  → registra motivo no timeline
```

---

## Fluxo E — Approval humana (tool perigosa)

```
Agent quer: git push --force / drop table / deploy prod
  → Policy engine bloqueia
  → cria hub_approval
  → user aprova/rejeita no HUB
  → agent continua ou aborta
```

---

## Fluxo F — Billing

```
Checkout Stripe
  → webhook
  → entitlement ativo no HUB
  → feature flags liberam max_parallel, voice, etc.
Cancelamento
  → portal Stripe
  → entitlement até fim do período
```

---

## Fluxo de valor (dinheiro e percepção)

### Valor percebido pelo user
```
Tempo economizado + $ economizado + menos rate limit + menos context switch
```

### Valor capturado pelo negócio
```
Assinatura + (usage gateway) + upsell + retenção
```

### Valor entregue pelo stack
```
Routing inteligente + parallel + audit + memory + MCP
```

---

## Jornada semanal típica (power user)

| Dia | Ação | Valor |
|-----|------|-------|
| Seg | 3 missões feature | velocidade |
| Ter | 1 bugfix squad | qualidade |
| Qua | research scout + summary | barato |
| Qui | debate mode decisão arquitetural | confiança |
| Sex | report de custo da semana | controle |

Se o produto **não entra nessa rotina**, churn.

---

## Pontos de fricção a eliminar

1. Colar keys demais sem UX
2. Não saber qual squad usar
3. Não ver $ live
4. Agent travado sem feedback
5. Alpha crash sem recovery
6. Docs ruins → Discord vira suporte infinito

---

## Eventos de produto (analytics mínimos)

- `signup_completed`
- `provider_connected` / `gateway_key_created`
- `first_mission_started`
- `first_mission_completed`
- `budget_hit`
- `upgrade_clicked`
- `subscription_started`
- `mission_parallel_gt_1` (sinal de uso real multi-agent)

---

## Mapa mental: “fluxo de valor em 1 slide”

```
DOR: IA cara + serial + limite
  → COCKPIT: paralelo + papéis + budget
  → PROVA: $ e tempo na tela
  → HÁBITO: squads salvos
  → $: assinatura (+ usage)
  → MOAT: audit + policy + memória + gateway
```
