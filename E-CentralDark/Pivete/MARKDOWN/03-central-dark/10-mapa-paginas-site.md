# 10 — Mapa das páginas do site (como funciona cada uma)

> **NÃO é cópia do conteúdo.** É o **mapa funcional** do que cada área do site faz no negócio e na jornada do usuário.  
> Menu observado: **DASHBOARD · PLANOS · BAIXAR APP · DIREÇÃO · AJUDA**

**Rotas reais vistas no histórico Chrome / sessão:**

| Menu (PT) | Rota típica | Auth? |
|-----------|-------------|:-----:|
| DASHBOARD | `/app/dashboard` | sim |
| PLANOS | landing `#pricing` + `/app/checkout?plan=...` + `/app/billing` | checkout sim |
| BAIXAR APP | `/download` (+ GitHub releases) | opcional |
| DIREÇÃO | `/app/roadmap` (+ sprints `/app/roadmap/sprints/...`) | sim (founder) |
| AJUDA | `/app/help` + `?category=...` + artigos | sim (docs founder) |

Outras rotas de suporte ao funil:
- `/app/login?next=...`
- `/auth/callback` (OAuth Google via Supabase)
- `/app/success?session_id=...` (pós-Stripe)
- `/discord`
- `/catalogo`
- `/privacy` · `/terms`

---

## Árvore de navegação (site)

```
overclock.sh
│
├── /                          LANDING (marketing + prova + pricing âncora)
│
├── /download                  BAIXAR APP
│
├── /discord                   Comunidade (retenção / suporte social)
├── /catalogo                  Biblioteca agents/skills
│
└── /app                       ÁREA LOGADA (produto SaaS web)
    ├── /login                 Auth (desktop_flow ou next=)
    ├── /dashboard             DASHBOARD (home do membro)
    ├── /billing               Assinatura / portal
    ├── /checkout?plan=        Checkout Stripe
    ├── /success               Obrigado pós-pagamento
    ├── /roadmap               DIREÇÃO (roadmap founders)
    │   └── /sprints/:id       Detalhe de sprint
    └── /help                  AJUDA
        ├── ?category=primeiros-passos
        ├── ?category=instalacao
        ├── ?category=providers
        ├── ?category=todos
        ├── /mimo-aplicar-creditos
        ├── /terminal-wsl-path
        └── /help-docs-designer
```

**App desktop** (fora do site, mas ligado):
- Binários em GitHub `overclock-releases` (público só releases)
- Login desktop: `/app/login?desktop=1&desktop_state=...&desktop_flow=login`
- Auto-update a cada launch / ~4h (README público)

---

# 1) DASHBOARD — `/app/dashboard`

## Função no negócio
**Casa do assinante.** Onde o usuário sente “eu tenho acesso”, vê status e caminhos para o resto.

## O que essa página PRECISA fazer (padrão)
| Bloco | Função |
|-------|--------|
| Status da conta | plano ativo / trial / past_due |
| CTA principal | baixar app OU abrir cockpit / keys |
| Atalhos | Planos, Ajuda, Direção, Billing |
| Health | app version, update, providers conectados |
| Onboarding residual | checklist se ainda não baixou / não conectou key |

## Como funciona (fluxo)
```
Login OK
  → dashboard
  → se sem entitlement: empurra PLANOS/checkout
  → se com entitlement: empurra BAIXAR APP + setup providers (AJUDA)
  → se desktop já instalado: deep-link / instruções de abrir
```

## Conversão Central Dark
| Dashboard deles | Seu HUB |
|-----------------|---------|
| Status Boost | Plano HUB Free/Pro/Team |
| Link download app | Link apps / Mission Room web-first |
| Providers | API keys Arsenal + BYOK |
| Billing | Stripe/EFI portal |
| Roadmap | Roadmap público Central Dark / changelog |

**Módulo alvo:** `hub/` → página `/dashboard` ou home autenticada.

---

# 2) PLANOS — pricing + checkout + billing

## Função no negócio
**Captura de receita.** Transforma interesse em assinatura recorrente.

## Superfícies
| Superfície | Rota | Papel |
|------------|------|-------|
| Pricing marketing | `/#pricing` | convencer, comparar, âncora de preço |
| Checkout | `/app/checkout?plan=monthly\|yearly\|boost_pro_*` | cobrir (Stripe) |
| Success | `/app/success?session_id=` | confirmar + next step (download) |
| Billing | `/app/billing` | gerenciar assinatura / fatura / cancelar |

## Como o modelo de planos funciona (estrutura, não copy)

```
PLAN
├── id (ex: pro_monthly, pro_yearly, pro_plus_monthly)
├── price_cents
├── interval (month|year)
├── features[]
│   ├── app_access
│   ├── multi_pane
│   ├── cost_tracker
│   └── voice (upsell)
├── trial_or_discount (ex: 50% primeiros N períodos)
└── stripe_price_id
```

### Lógica de upsell
- Plano base = cockpit + multi-agent + cost
- Plano + = mesma base + **feature âncora** (voz)
- Anual = desconto vs mensal (cashflow + retenção)

### Lógica de garantia
- 7 dias → reduz fricção de compra em alpha
- Cancela no portal Stripe

## Fluxo de dinheiro
```
Landing PLANOS
  → login se necessário (?next=/app/checkout?plan=...)
  → Stripe Checkout
  → webhook → marca entitlement no DB
  → /app/success
  → BAIXAR APP + AJUDA primeiros passos
```

## O que o SaaS **não** inclui no preço
- Tokens LLM (BYOK / pago ao provider)
- Grant de terceiros (só facilita playbook)

## Conversão Central Dark
| Elemento | Central Dark |
|----------|--------------|
| 2 tiers (base / pro) | HUB Access + HUB Pro (voz/memória) |
| Checkout Stripe | Stripe **ou** EFI PIX (você já tem secrets EFI) |
| Entitlement | tabela `user_roles` / plans + flags |
| Usage separado | **Arsenal Credits** (sua margem no gateway) |

**Não copie** nomes Boost/Pro nem preços. Copie a **estrutura**: base vs âncora + anual + garantia.

---

# 3) BAIXAR APP — `/download`

## Função no negócio
**Entrega do produto desktop** (onde o valor multi-pane roda de verdade no caso deles).

## Como funciona
1. Página `/download` lista plataformas (Mac/Win/Linux)
2. Binários em **GitHub Releases** (repo só de releases; source closed)
3. Soft launch macOS: assinatura ad-hoc → Gatekeeper “Open” manual
4. App faz **auto-update** (check no launch + periódico)
5. Desktop auth volta pro site: `login?desktop=1&desktop_state=...`

## Por que separar site e releases
| Peça | Onde | Motivo |
|------|------|--------|
| Marketing + billing | site | SEO, Stripe, auth |
| Binário | GitHub Releases | CDN fácil, versionamento |
| Source | privado | proteção IP |

## Conversão Central Dark
Você **não precisa** desktop no dia 1.

| Fase | Entrega |
|------|---------|
| MVP | Mission Room **100% web no HUB** |
| v2 | CLI `centraldark` / adapter local |
| v3 | Desktop opcional se multi-pane local for diferencial |

Se for ter “Baixar”:
- Releases **seu** GitHub (`CentralDark-releases`)
- Auto-update
- Login OAuth igual HUB

---

# 4) DIREÇÃO — `/app/roadmap` (“Direção”)

## Função no negócio
**Transparência + retenção de founders** em produto alpha.

Mostra:
- para onde o produto vai
- sprints (ex.: `m01-sprint-soft`)
- o que já saiu / o que está em andamento

## Como funciona (padrão build-in-public)
```
Roadmap
├── Visão por mês/sprint
├── Cards: planned | in_progress | shipped
├── Detalhe de sprint (escopo, notas)
└── (opcional) votação de features
```

## Valor estratégico
1. Reduz churn em alpha (“eles estão mexendo”)
2. Justifica preço founder
3. Canal de feedback → roadmap
4. Marketing gratuito (lives alinhadas ao roadmap)

## Conversão Central Dark
| Direção deles | Sua versão |
|---------------|------------|
| Roadmap founders | `/hub/roadmap` ou Notion/GitHub Projects espelhado |
| Sprints M01… | Sprints alinhados ao dossiê Arsenal (P0–P4) |
| Soft launch notes | Changelog + status.centralldark.com |

Conteúdo inicial sugerido (seu, não deles):
1. Mission Room MVP  
2. Cost ledger $  
3. Budget hard-stop  
4. Entitlements  
5. Auth enforce gateway  

---

# 5) AJUDA — `/app/help`

## Função no negócio
**Reduzir suporte humano** e acelerar activation (1ª missão / 1º provider).

## Categorias vistas
| category | Propósito |
|----------|-----------|
| `primeiros-passos` | onboarding pós-compra |
| `instalacao` | OS, Gatekeeper, paths |
| `providers` | colar keys, stack ferramenta×modelo |
| `todos` | índice |
| artigos | `mimo-aplicar-creditos`, `terminal-wsl-path`, `help-docs-designer` |

## Como a AJUDA se encaixa no funil
```
Comprou
  → Success
  → Ajuda: instalação
  → Ajuda: providers
  → (opcional) playbook de custo zero / grant
  → 1ª missão no app
  → se travou: Discord (suporte social)
```

## Anatomia de um bom artigo de ajuda (padrão)
```
Título problema-oriented
Pré-requisitos
Passos numerados
Screenshot / trecho config
Erros comuns
Próximo passo (link interno)
```

## Conversão Central Dark
| Categoria referência | Sua docs |
|----------------------|----------|
| primeiros-passos | Criar key Arsenal + 1ª Mission |
| instalacao | HUB URL, CLI, VPS client |
| providers | Abacus/Arsenal modes + BYOK |
| artigos | WSL, OAuth GitHub, MCP tools, budget |
| community | Telegram grupo Evolução (já existe) |

**Módulos:** docs no HUB + `status` + posts Telegram.

---

# Mapa do funil completo (como as 5 páginas se conectam)

```
         LANDING (/)
            │
            ├─► PLANOS (#pricing)
            │       │
            │       ▼
            │   LOGIN → CHECKOUT → SUCCESS
            │       │
            ▼       ▼
         DASHBOARD ◄─┘
            │
            ├─► BAIXAR APP (/download) ──► App desktop ──► login desktop
            ├─► AJUDA (setup providers / install)
            ├─► DIREÇÃO (roadmap / confiança)
            └─► BILLING (manter / upgrade / cancel)
```

### Papel de cada página no “motor de dinheiro”

| Página | Adquire | Converte | Entrega | Retém | Expande $ |
|--------|:-------:|:--------:|:-------:|:-----:|:---------:|
| Landing | ● | ● | | | |
| PLANOS | | ● | | | ● (upsell) |
| DASHBOARD | | | ● | ● | ● |
| BAIXAR APP | | | ● | | |
| AJUDA | | | ● | ● | |
| DIREÇÃO | | | | ● | ● (founder) |

---

# O que extrair para o Central Dark (checklist de páginas mínimas)

## Site/HUB mínimo equivalente

```
/                     → marketing Central Dark (sua copy)
/app/login            → Supabase Auth (já tem)
/app/dashboard        → home do HUB
/app/plans            → planos HUB + Arsenal credits
/app/checkout         → Stripe/EFI
/app/missions         → Mission Room (coração do produto)
/app/keys             → API keys gateway
/app/roadmap          → direção / sprints
/app/help             → docs
/download             → (opcional fase 2)
```

## Entidades de backend por página

| Página | Tabelas / serviços |
|--------|--------------------|
| Dashboard | users, entitlements, usage_summary |
| Planos | plans, stripe_prices, subscriptions |
| Baixar | releases_manifest (version, urls) |
| Direção | roadmap_items, sprints |
| Ajuda | help_articles, categories |
| Missões (seu core) | missions, mission_agents, cost_ledger |

---

# Resumo em 5 linhas

1. **DASHBOARD** = casa do membro e roteador de CTAs.  
2. **PLANOS** = máquina de assinatura (pricing → checkout → entitlement).  
3. **BAIXAR APP** = entrega do runtime desktop (você pode substituir por web Mission Room).  
4. **DIREÇÃO** = roadmap transparente que segura founder em alpha.  
5. **AJUDA** = activation barata (install + providers + playbooks).

**Nada disso é o “segredo do código”.**  
O segredo do **negócio** é: **assinatura do cockpit + prova de valor (custo/parallel) + docs que fazem o user chegar na 1ª missão.**
