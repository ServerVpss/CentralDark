# 12 — MVP MÍNIMO VIÁVEL (pra app NÃO FALHAR)

**Objetivo:** o menor conjunto que deixa o app **usable e estável**.  
**Fora:** voz, desktop, catálogo bonito, debate avançado, team seats, roadmap UI fancy, grant de terceiro.

Se não estiver na lista **IN**, o Sonnet **não implementa agora**.

---

## Frase do MVP

> User loga no HUB → cria 1 missão → 1 conductor + 1 worker rodam via Arsenal → vê resposta + custo → budget para se estourar → não quebra, não vaza key, não some com o trabalho.

---

## IN — obrigatório (sem isso FALHA)

| # | Peça | Por que sem isso falha |
|---|------|-------------------------|
| 1 | **Login HUB** | Sem identidade não tem dono da missão |
| 2 | **API key Arsenal** (gerar/usar) | Sem cérebro a missão não roda |
| 3 | **Mission create/start/get** | Coração do app |
| 4 | **1 call real** `chat/completions` no gateway | Prova que não é mock |
| 5 | **2 roles mínimos** (conductor + worker) | Senão não é multi-agent de verdade |
| 6 | **Status da missão** (running/done/failed) | User não sabe se morreu |
| 7 | **Cost básico** (tokens ou $) | Sem isso user queima cota sem ver |
| 8 | **Budget hard-stop** | Sem isso vira fatura surpresa = produto morto |
| 9 | **Erro legível** (gateway down, key inválida, timeout) | Falha silenciosa = app “quebrado” |
| 10 | **Persistir missão** (DB) | Refresh some tudo = falha de confiança |
| 11 | **Auth na API** (não aceitar request anônimo em prod) | Segurança / abuso |
| 12 | **1 tela Mission Room** (lista + detalhe + nova) | Sem UI o user final não usa |

**Total: 12 itens. Só isso é MVP.**

---

## OUT — explicitamente depois (NÃO agora)

- ClockVoice / voz  
- App desktop / download  
- 6 panes iguais marketing alheio  
- Catálogo de skills grande  
- Debate/parallel/hermes UI completa (modes no gateway já existem — não precisa UI toda)  
- BYOK multi-provider (MVP = só Arsenal gateway)  
- Billing Stripe completo (pode feature-flag “pro” manual)  
- Roadmap página pública  
- Telegram notifica  
- Memória longa  
- Approvals complexas  
- Squad com 5 papéis  

---

## Fluxo MVP (único caminho feliz)

```
1. Login HUB
2. Dashboard simples: botão "Nova missão" + "Minha key"
3. Nova missão:
   - goal (texto)
   - budget_usd (número, default baixo ex. 1.00)
4. Start
5. Backend:
   - conductor decompõe em 1 subtarefa (pode ser simples)
   - worker executa via arsenal-router
   - grava events + cost
   - se spent >= budget → STOP + status budget_exceeded
6. UI mostra:
   - status
   - mensagens/resultado
   - custo parcial
7. Fim: completed | failed | budget_exceeded
```

Se esse fluxo roda 10 vezes seguidas sem crash → **MVP ok**.

---

## Dados mínimos (só 4 tabelas se precisar enxugar)

```
missions
  id, user_id, goal, status, budget_usd, spent_usd, result_text, created_at, updated_at

mission_events
  id, mission_id, kind, message, created_at
  -- kind: started|agent|token|error|completed|budget_stop

cost_ledger
  id, mission_id, model, tokens_in, tokens_out, usd, created_at

entitlements (mínimo)
  user_id, plan, max_missions_day, max_budget_default
```

Agents em tabela separada = opcional no MVP; pode ser JSON em `missions` se for mais rápido **desde que** status e cost existam.

---

## APIs mínimas

```
POST   /missions              { goal, budget_usd }
POST   /missions/:id/start
GET    /missions/:id
GET    /missions              (lista do user)
POST   /missions/:id/cancel   (opcional mas recomendado)
```

Gateway (já existe — só consumir):
```
POST https://api.centralldark.com/v1/chat/completions
GET  https://api.centralldark.com/v1/models
```

---

## Regras anti-falha (hard)

1. **Nunca** logar API key completa  
2. **Sempre** timeout na call do gateway (ex. 60–120s) + retry 1x só em 502/503  
3. **Sempre** hard-stop de budget (não só aviso)  
4. **Sempre** status `failed` + mensagem se gateway cair  
5. **Sempre** RLS / filtro `user_id` — user A não lê missão de B  
6. **Não** chamar provider sem auth  
7. **Default budget baixo** (protege o user distraído)  
8. **Idempotência simples:** start 2x na mesma missão não duplica 10 agents  

---

## Teste de aceite MVP (Sonnet roda isso)

```
[ ] Login com user de teste
[ ] Criar missão "Responda só: pong"
[ ] Start → status running → completed
[ ] result_text contém resposta
[ ] cost_ledger tem ≥1 linha
[ ] Criar missão com budget 0.0001 e forçar uso → budget_exceeded e PAROU
[ ] Key inválida → failed com erro claro (não 500 HTML)
[ ] User B não GET missão de user A
[ ] Refresh na UI: missão ainda está lá
[ ] 5 missões seguidas sem crash do processo
```

**Se 1 item falhar = MVP não shippa.**

---

## Ordem de implementação (3 fatias só)

### Fatia A — Backend core (1–2 dias foco)
- tables  
- create/start/get  
- 1 call Arsenal  
- cost + budget stop  
- auth user  

### Fatia B — UI mínima (1 dia)
- lista missões  
- form nova missão  
- detalhe com status/resultado/custo  

### Fatia C — Endurecer (meio dia)
- erros legíveis  
- timeout/retry  
- teste dos 10 checks  
- default budget  

**Para.** Não começa P4/P5.

---

## Prompt curto pro Sonnet

```
MVP ONLY — leia 12-MVP-MINIMO-VIABLE.md
Implemente SOMENTE os 12 itens IN.
Ignore OUT.
Prioridade: app não falhar (auth, persistência, gateway real, cost, budget hard-stop, erros claros).
Stack: HUB + arsenal-openai-adapter existentes.
Entregue fatia A → teste curl → fatia B → 10 checks de aceite.
Não copie produto de terceiro. Não peça senha. Não toque billing/banco.
```

---

## Relação com o roadmap grande

| Doc | Uso |
|-----|-----|
| `11-ROADMAP-COMPLETO...` | Visão longa (P0–P5) |
| **`12-MVP-MINIMO-VIABLE`** | **O que fazer AGORA** |

Sonnet em dúvida → **sempre ganha o 12**.
