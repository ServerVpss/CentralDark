# 03 — Modelo de negócio (padrão multi-agent cockpit)

## Definição

**Modelo:** SaaS de **orquestração de agentes de IA** (subscription),  
com **providers externos** (BYOK — bring your own key) e/ou **gateway próprio**.

---

## Proposta de valor (value prop)

| Para quem | Promessa |
|-----------|----------|
| Dev solo / vibe coder | Mais output, menos custo, menos rate limit |
| Indie hacker | Time de “devs AI” sem contratar gente |
| Time pequeno | Padronizar papéis e custo por missão |
| Power user | Paralelismo real + observabilidade de $ |

**Promessa central mensurável:**  
*“Mesmo resultado (ou melhor), com X× menos $/missão, com N agents em paralelo.”*

---

## O que se vende (oferta)

### Core (sempre)
1. **Cockpit multi-agent** (UI + runtime)
2. **Roteamento por papel** (não só por modelo)
3. **Metering de custo**
4. **Templates de squad**
5. **Atualizações + comunidade**

### Upsells comuns
- Voz / push-to-talk
- Mais agents paralelos
- Skills/agents premium no catálogo
- Team seats / org
- SLA / self-host enterprise

### O que **não** se vende (no padrão BYOK puro)
- Tokens Anthropic/OpenAI (usuário paga direto)
- “Créditos mágicos” do provider de terceiros

### Variante híbrida (importante pro Central Dark)
Você **pode** vender:
- **Acesso ao gateway próprio** (Arsenal / Abacus)
- **Packs de uso** + assinatura do cockpit  
Isso muda o modelo: de BYOK puro → **platform + usage**.

---

## Quem paga o quê (cadeia de valor)

```
USUÁRIO FINAL
  │
  ├─► Assinatura do COCKPIT  ──► receita do SEU SaaS
  │
  └─► Uso de MODELOS
        ├─ BYOK: paga Anthropic/OpenAI/etc.
        └─ VIA SEU GATEWAY: paga VOCÊ (margem no token/roteamento)
```

### Tabela de papéis financeiros

| Ator | Entra dinheiro? | Como |
|------|-----------------|------|
| Seu produto (cockpit) | Sim | Assinatura / seats / upsell |
| Provider LLM (Anthropic…) | Sim (do user ou de você) | API usage |
| Gateway agregado (Abacus/OpenRouter) | Sim | Markup ou plan do user |
| Comunidade / Discord | Não direto | Retenção + aquisição |
| Grants/bolsas de provider | Reduz custo do user | Growth hack (não é sua receita) |

---

## Estrutura de planos (template genérico)

| Plano | Preço lógico | Limites | Feature âncora |
|-------|--------------|---------|----------------|
| Free / Trial | 0 ou 7 dias | 1–2 agents | provar valor |
| Pro | mensal/anual | N agents + cost tracker | uso diário |
| Pro+ | 1.5–2× Pro | voz / skills / mais parallel | upsell |
| Team | por seat | org + policies | B2B |
| Enterprise | custom | SLA, SSO, VPC | ticket alto |

**Regra de pricing psicologicamente comum:**
- Anual com desconto 15–50%
- Garantia 7 dias (reduz atrito)
- Cancela quando quiser (Stripe portal)

---

## Modelo de receita (fórmulas)

### 1) Pure orchestration SaaS (BYOK)
```
MRR = assinantes_ativos × ARPU
COGS_software ≈ hospedagem + auth + support (baixo)
Margem bruta ≈ alta (70–90% se bem desenhado)
```

### 2) Platform + usage (Central Dark friendly)
```
MRR_assinatura + receita_usage_gateway
COGS = tokens_comprados_upstream + infra VPS
Margem = markup_gateway + assinatura
```

### 3) Hybrid (recomendado para você)
```
Assinatura HUB/Cockpit  +  créditos Arsenal/Abacus  +  upsells (voz, team, MCP premium)
```

---

## Custos do negócio (o que queima caixa)

| Custo | Tipo | Notas |
|-------|------|-------|
| VPS / cloud | fixo+var | PM2, Caddy, storage |
| Supabase / DB | var | auth, logs, audit |
| Tokens de demo / suporte | var | cuidado |
| Payment fees (Stripe ~3%) | var | |
| Founder time / lives | “soft” | growth |
| Suporte Discord | soft | escala mal sem docs |
| Marketing | var | ads opcional |

---

## Métricas que importam (não vaidade)

| Métrica | Por quê |
|---------|---------|
| **Missions / week / user** | Engajamento real |
| **$/mission economizado** (claim vs baseline) | Value proof |
| **Activation** (1ª missão multi-agent em 24h) | Onboarding |
| **Retention D7/D30** | Produto ou fadiga de alpha |
| **ARPU + churn** | Sustentabilidade |
| **% usage no gateway próprio** | Se híbrido |
| **Cost cap hit rate** | UX + confiança |
| **NPS / Discord active** | Community health |

---

## Moat (defesa) possível

1. **Gateway + routing inteligente** (Arsenal modes)
2. **Políticas / PDP / approvals** (enterprise-ish)
3. **Memória + auditoria** (compliance e replay)
4. **Integrações MCP profundas**
5. **Comunidade e playbooks BR**
6. **Dados de custo real por missão** (melhora o router)

Moat fraco se for só “UI bonita em cima de Claude Code”.

---

## Anti-modelos (o que quebra o negócio)

- Revender token sem markup nem assinatura → vira pass-through sem margem
- Prometer “8× barato” sem metering → desconfiança
- Alpha eterno sem caminho de estabilidade → churn
- Depender 100% de grant de terceiro → growth morre quando grant acaba
- Copiar concorrente sem stack própria → commodity

---

## Posição estratégica para Central Dark

Você **já tem** pedaços de platform+usage:

- Gateway OpenAI-compat (`api.centralldark.com`)
- Arsenal modes (router/parallel/debate/hermes)
- Abacus com dezenas/centenas de modelos
- HUB Supabase (keys, audit, roles)
- MCP tools, voz, Hermes, memória

**Modelo natural:**  
**HUB Cockpit (assinatura)** + **Arsenal usage (créditos/planos)** + **BYOK opcional**.

Isso é **mais forte** que pure BYOK de IDE genérico.
