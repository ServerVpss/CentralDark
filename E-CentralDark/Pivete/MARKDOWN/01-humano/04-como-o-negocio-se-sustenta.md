# 04 — Como o negócio se sustenta (sustentabilidade)

## Resposta curta

O negócio se sustenta se:

1. **Usuário sente economia ou ganho de velocidade** toda semana  
2. **Assinatura cobre** infra + suporte + tempo de evolução  
3. **(Opcional)** usage no gateway gera margem recorrente  
4. **Aquisição** não depende só de ads caros (community + content + referral)

---

## Motor de sustentabilidade (4 volantes)

```
        ┌─────────────┐
        │  AQUISIÇÃO  │  lives, Discord, SEO, grant/playbook, indicação
        └──────┬──────┘
               ▼
        ┌─────────────┐
        │ ATIVAÇÃO    │  1ª missão multi-agent + 1º $ economizado visível
        └──────┬──────┘
               ▼
        ┌─────────────┐
        │ RETENÇÃO    │  squads salvos, histórico, keys, hábito diário
        └──────┬──────┘
               ▼
        ┌─────────────┐
        │ RECEITA     │  assinatura + (usage) + upsell
        └──────┬──────┘
               ▼
        ┌─────────────┐
        │ REFERRAL    │  “olha meu cost cap / meu squad”
        └─────────────┘
```

Se um volante para, o negócio sangra.

---

## Unit economics (exemplo didático — números fictícios)

### Cenário A — só assinatura (BYOK)

| Item | Valor exemplo |
|------|----------------|
| Preço Pro | R$ 97/mês |
| Churn mensal | 8% |
| CAC (community/organic) | R$ 40 |
| COGS/user | R$ 8 |
| Contribuição | ~R$ 89 |
| Payback | < 1 mês |

**Sustenta se:** retenção boa e suporte não explode.

### Cenário B — hybrid (Central Dark)

| Item | Valor exemplo |
|------|----------------|
| Assinatura HUB | R$ X/mês |
| Usage médio gateway | R$ Y/mês com 20–40% markup |
| COGS token | R$ Y × (1 − margem) |
| Infra alocada | R$ Z/user |

**Sustenta se:** usage recorrente + não subsidiar token demais.

---

## Como provar valor (sem marketing vazio)

O usuário precisa **ver no painel**:

```
Missão "refactor auth"
  Solo (1 flagship):     $4.20  |  42 min
  Squad (1 caro + 3 baratos): $0.71 | 18 min
  Economia: 6×  |  2.3× mais rápido
```

Sem isso, “8× barato” é slogan.

---

## Fontes de aquisição sustentáveis

| Canal | Custo | Escalabilidade | Risco |
|-------|-------|----------------|-------|
| Build-in-public / live | tempo | média | founder-dependent |
| Discord / comunidade | tempo | média | moderação |
| Playbook de economia | baixo | alta | claims regulatórios |
| SEO docs | médio | alta | lento |
| Ads | alto | alta | unit economics ruim cedo |
| Parceria com providers | baixo | alta | dependência |
| Product-led (invite) | baixo | alta | precisa de wow |

**Padrão de mercado observado:** grant/playbook de provider barato + comunidade BR + lives.

**Para Central Dark:** playbook de **Arsenal modes** + “como gastar menos no gateway” + demos do HUB.

---

## O que sustenta vs o que é açúcar

| Sustenta | Açúcar (ajuda, mas morre) |
|----------|---------------------------|
| Assinatura recorrente | Grant de 30 dias de terceiro |
| Usage com margem | Hype de lançamento |
| Retenção por workflow | Um viral no Twitter |
| Switching cost (squads, audit, keys no HUB) | Desconto eterno |
| Dados de routing melhores com o tempo | Feature cosmétisca |

---

## Riscos de sustentabilidade e antídoto

| Risco | Sintoma | Antídoto |
|-------|---------|----------|
| Dependência de 1 provider | outage / price hike | multi-provider + Abacus |
| Alpha quebra confiança | churn D7 | crash recovery + changelog |
| Suporte infinito no Discord | founder burnout | docs + status + tiers |
| Guerra de preço de IDE | race to bottom | focar em gateway+policy+audit |
| User só quer token barato | cancela cockpit | meter value no orchestration |
| Grant acaba | queda de signups | valor sem grant (metering) |

---

## Flywheel específico Central Dark

```
User usa Arsenal Parallel/Debate
        │
        ▼
Vê qualidade + custo no HUB
        │
        ▼
Salva squad/policy no HUB
        │
        ▼
Conecta MCP / GitHub / Telegram
        │
        ▼
Missões recorrentes (hábito)
        │
        ▼
Paga plano + usage
        │
        ▼
Dados de audit melhoram router
        │
        ▼
Produto fica mais esperto → mais retenção
```

---

## Checklist: “estamos sustentáveis?”

- [ ] ARPU > COGS + support alocado
- [ ] Churn mensal em faixa aceitável (<10% early-stage ok, mas caindo)
- [ ] Activation rate > 40% em 48h
- [ ] Pelo menos 1 “aha” visível (economia ou parallel win)
- [ ] Roadmap de estabilidade (não só feature)
- [ ] Canal de aquisição que não depende de 1 pessoa 24/7
- [ ] Margem de gateway medida semanalmente

---

## Conclusão operacional

> **Sustenta-se vendendo coordenação + (opcional) acesso inteligente a modelos,  
> provando economia/velocidade por missão, e criando switching cost no HUB.**

Não se sustenta “só porque tem multi-agent”.  
Multi-agent é feature. **Negócio** é retenção + margem + aquisição barata.
