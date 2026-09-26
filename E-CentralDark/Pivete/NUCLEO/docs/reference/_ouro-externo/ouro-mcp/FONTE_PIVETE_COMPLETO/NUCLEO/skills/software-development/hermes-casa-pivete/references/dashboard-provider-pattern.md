# Dashboard Architecture — Provider Pattern (07/08/2026)

## Contexto
Durante a sessão, Pivete revisou o Painel 747 e propôs a evolução arquitetural para produção:
- Hoje: UI → `getDashboardData()` → Mock
- Futuro: UI → DashboardService → Providers (Meta Ads, Google Ads, GA4, Supabase, Hermes, VPS, GitHub)

## Padrão Canônico (Consumer → Contract → Provider)

```
┌─────────────────────────────────────────────┐
│  Dashboard (UI)                             │
│  → consome apenas DashboardData (tipo)      │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│  DashboardService (orquestrador)            │
│  → não conhece APIs, conhece Providers      │
│  → agrega, normaliza, cacheia, fallback     │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│  Providers (implementam DataProvider)       │
│  ├── MetaAdsProvider                        │
│  ├── GoogleAdsProvider                      │
│  ├── GA4Provider                            │
│  ├── SupabaseProvider                       │
│  ├── HermesProvider (métricas do agente)    │
│  ├── VPSProvider (PM2, logs, health)        │
│  └── GitHubProvider (PRs, deploys, CI)      │
└─────────────────────────────────────────────┘
```

## Paralelo com Hermes (mesmo padrão)

| Hermes | Dashboard |
|---|---|
| **Modelo** → **Skill** → **Artefato** | **UI** → **DashboardData** → **Provider** |
| Skill = contrato estável | DashboardData = contrato estável |
| Troca modelo sem quebrar skill | Troca provider sem quebrar UI |
| Memória 3 temperaturas = cache semântico | Cache layer no Service = mesma ideia |

## Implementação Atual (código real em aiox-core/ui/)

```
src/
├── lib/
│   ├── dashboard-data.ts          # ← DashboardData (contrato/tipo)
│   ├── dashboard-service.ts       # ← DashboardService (orquestrador - ESQUELETO)
│   └── providers/
│       ├── index.ts               # ← interface DataProvider
│       ├── meta-ads.ts            # ← MetaAdsProvider (stub)
│       ├── google-ads.ts          # ← GoogleAdsProvider (stub)
│       ├── ga4.ts                 # ← GA4Provider (stub)
│       ├── supabase.ts            # ← SupabaseProvider (stub)
│       ├── hermes.ts              # ← HermesProvider (stub)
│       ├── vps.ts                 # ← VPSProvider (stub)
│       └── github.ts              # ← GitHubProvider (stub)
├── components/cockpit/
│   ├── MetricCard.tsx
│   ├── TrendChart.tsx
│   ├── GaugeDial.tsx
│   └── StatusLed.tsx
└── app/dashboard/page.tsx         # ← RSC, URL-driven, zero client JS
```

## Próximos Passos (quando for canônico no CentralDark)

1. **Criar interface `DataProvider`** em `src/lib/providers/index.ts`
2. **Mover mock para `MockProvider`** (implementa interface)
3. **Implementar `MetaAdsProvider`** real (edge function Supabase → Meta Marketing API)
4. **Wire no `DashboardService`** com prioridade + fallback + TTL
5. **UI continua intocada** — só recebe `DashboardData` tipado

## Ganhos
- Dashboard **não sabe** se CTR veio de Meta, GA4 ou mock
- Adicionar fonte = **novo arquivo**, zero toque na UI
- Cache/TTL/fallback centralizado no Service
- Métricas do Hermes (Dream job, skills, memórias) viram **mais um provider**

## Decisão Pendente
Painel 747 deve virar módulo oficial em `ServerVpss/CentralDark/apps/modulos/painel747/` OU estender `apps/modulos/status/`?