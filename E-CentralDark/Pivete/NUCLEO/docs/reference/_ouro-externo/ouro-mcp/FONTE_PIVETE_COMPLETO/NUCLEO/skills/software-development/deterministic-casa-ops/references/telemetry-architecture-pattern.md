# Telemetry Architecture Pattern (07/08/2026)

## Convergência de Arquiteturas

Mesma filosofia em dois domínios:

| Hermes | Dashboard/Telemetria |
|--------|---------------------|
| Modelo | Provider |
| Skill | Contrato (TelemetrySnapshot) |
| Artefato | Interface |

## Arquitetura Provider-First

```
Dashboard (UI) → DashboardData (Contrato) → DashboardService (Orquestração) → Provider Registry → Providers
```

### Provider Registry
Responsabilidades:
- Descobrir providers disponíveis
- Habilitar/desabilitar por configuração
- Definir prioridade
- Aplicar timeout individual
- Registrar saúde (health) de cada provider

### TelemetrySnapshot
Camada intermediária entre aquisição e apresentação:

```typescript
interface TelemetrySnapshot {
  source: string;           // "meta-ads", "ga4", "supabase", "hermes", "vps", "github"
  collectedAt: string;      // ISO timestamp
  latency: number;          // ms
  ttl: number;              // segundos
  health: "healthy" | "degraded" | "down";
  payload: any;             // dados brutos do provider
}
```

Fluxo: **Snapshots → Normalization → DashboardData → UI**

### DataProvider Interface (Contrato Mínimo)
```typescript
interface DataProvider {
  id: string;
  priority: number;         // ordem de coleta/fallback
  ttl: number;              // cache TTL em segundos
  health(): Promise<Health>;
  collect(ctx: DashboardContext): Promise<TelemetrySnapshot>;
}
```

Providers planejados/implementados:
- `MetaAdsProvider` (Meta Marketing API via edge function)
- `GA4Provider` (Google Analytics Data API)
- `SupabaseProvider` (Postgres + Realtime)
- `HermesProvider` (métricas do agente: Dream job, skills, memórias)
- `VPSProvider` (PM2, logs, health checks)
- `GitHubProvider` (PRs, deploys, CI status)
- `OpenRouterProvider` (quota, modelos, custos)

## Separação de Responsabilidades

| Camada | Responsabilidade | Não faz |
|--------|-----------------|---------|
| Provider | Coleta bruta + health | Normalização, agregação |
| Service | Orquestração, prioridade, timeout, fallback, cache | UI, regras de negócio |
| Normalization | TelemetrySnapshot → DashboardData tipado | Coleta, cache |
| UI | Apresentação (DashboardData) | Qualquer lógica de coleta |

## Benefícios
- Adicionar provider = novo arquivo, zero toque na UI
- Cache/TTL/fallback centralizado no Service
- Trocar Meta Ads por outra fonte sem quebrar contrato
- Métricas do Hermes viram "mais um provider"
- Testável: mock `DataProvider` → testa Service isolado