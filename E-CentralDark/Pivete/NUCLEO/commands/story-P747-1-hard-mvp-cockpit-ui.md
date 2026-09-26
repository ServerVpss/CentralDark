# COMANDO - story-P747-1-hard-mvp-cockpit-ui.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\stories\epics\epic-painel-747\story-P747-1-hard-mvp-cockpit-ui.md
**SHA:** efc84783209fb4c6
**Timestamp:** 2026-08-28T02:02:40.442066
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- **Quality Gate:** @architect
- quality_gate: "@architect"
- - Quality gate: **CONCERNS** (nao bloqueador funcional)

### Ouro Bruto (primeiros 5000 chars)
```
# Story P747-1: Hard MVP Cockpit UI (Top 6 + Integracoes Basicas)

**Epic:** Painel 747
**Status:** Ready for Review
**Priority:** P1
**Complexity:** M (Medium)
**Type:** Feature
**Created:** 2026-03-02
**Executor:** @dev
**Quality Gate:** @architect
**Quality Gate Tools:** [lint, build, frontend-architecture-review]
**Depends On:** docs/prd.md, docs/architecture.md, docs/front-end-architecture.md

## Executor Assignment

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools: [lint, build, frontend-architecture-review]
```

---

## User Story

**As a** afiliado,
**I want** um cockpit visual com metricas criticas e filtros de contexto,
**so that** eu monitore rapidamente a performance da campanha e identifique desvios sem trocar de ferramenta.

---

## Scope

### IN Scope

- Criar rota de dashboard em `ui/src/app/dashboard/page.tsx`
- Implementar visual cockpit (paineis digitais, gauges, trend bars, status leds)
- Componentizar UI principal (`MetricCard`, `TrendChart`, `GaugeDial`, `StatusLed`)
- Integrar dados com API + fallback resiliente:
  - `/api/v1/dashboard/top6`
  - `/api/v1/alerts/history`
  - `/api/v1/metrics/deep-dive`
- Adicionar filtros reais de contexto via query params (`productId`, `period`)
- Redirecionar `/` para `/dashboard`
- Ajustar tema global para direcao visual cockpit no `globals.css`

### OUT of Scope

- Autenticacao real/controle de sessao backend
- Persistencia de filtros em storage
- Tela completa de deep dive separada
- Integracao de products dinamica via endpoint dedicado
- Deploy em producao

---

## Acceptance Criteria

- [x] **AC1:** Dashboard cockpit acessivel em `/dashboard` com layout visual inspirado em cockpit
- [x] **AC2:** Top 6 metricas renderizadas por componentes reutilizaveis
- [x] **AC3:** Dados carregados de `/dashboard/top6` com fallback automatico
- [x] **AC4:** Alert history e deep-dive highlights conectados a endpoints dedicados com fallback por bloco
- [x] **AC5:** Filtros `productId` e `period` funcionam via query params e atualizam contexto
- [x] **AC6:** Layout responsivo para desktop/mobile preservando legibilidade
- [x] **AC7:** Rota raiz redireciona para `/dashboard`
- [x] **AC8:** Qualidade minima validada com `npm run lint` no app `ui`

---

## Tasks / Subtasks

### Task 1: Base Cockpit UI (AC: 1, 2, 6)
- [x] 1.1 Criar pagina `ui/src/app/dashboard/page.tsx`
- [x] 1.2 Implementar estrutura visual cockpit (topbar, top6, console lateral)
- [x] 1.3 Ajustar `globals.css` com tokens e estilos cockpit responsivos

### Task 2: Componentizacao (AC: 2)
- [x] 2.1 Criar `MetricCard.tsx`
- [x] 2.2 Criar `TrendChart.tsx`
- [x] 2.3 Criar `GaugeDial.tsx`
- [x] 2.4 Criar `StatusLed.tsx`
- [x] 2.5 Criar tipos compartilhados em `components/cockpit/types.ts`

### Task 3: Integracao de Dados (AC: 3, 4)
- [x] 3.1 Criar camada `ui/src/lib/dashboard-data.ts`
- [x] 3.2 Integrar endpoint `/api/v1/dashboard/top6`
- [x] 3.3 Integrar endpoint `/api/v1/alerts/history`
- [x] 3.4 Integrar endpoint `/api/v1/metrics/deep-dive`
- [x] 3.5 Implementar fallback resiliente por bloco

### Task 4: Filtros de Contexto e Navegacao (AC: 5, 7)
- [x] 4.1 Adicionar filtros de produto/periodo via query params
- [x] 4.2 Atualizar visual para estados ativos dos filtros
- [x] 4.3 Redirecionar `ui/src/app/page.tsx` para `/dashboard`

### Task 5: Validacao Tecnica (AC: 8)
- [x] 5.1 Executar `npm run lint` em `ui/`

---

## Dev Notes

### Architecture Reference
- `docs/prd.md` (Hard MVP + Expansion Gate)
- `docs/architecture.md`
- `docs/front-end-architecture.md`

### Technical Decisions
- Query params como fonte de contexto do cockpit (`productId`, `period`)
- Fallback por endpoint para manter cockpit funcional mesmo com APIs parciais
- Server component async em `/dashboard` para carregar dados no servidor

---

## Testing

### Executed Checks
- `npm run lint` (workdir: `ui/`) ✅

### Suggested Next QA Checks
- `npm run build` (ui)
- Validacao visual de responsividade em 390px / 768px / 1440px
- Verificacao de estados `ok/delayed/unavailable` com dados reais

---

## File List

| File | Action | Description |
|------|--------|-------------|
| `ui/src/app/dashboard/page.tsx` | CREATE/MODIFY | Cockpit page, data wiring and query filters |
| `ui/src/app/globals.css` | MODIFY | Global cockpit theme and responsive styles |
| `ui/src/app/layout.tsx` | MODIFY | App metadata + expressive typography setup |
| `ui/src/app/page.tsx` | MODIFY | Root redirect to `/dashboard` |
| `ui/src/components/cockpit/types.ts` | CREATE | Shared cockpit types |
| `ui/src/components/cockpit/MetricCard.tsx` | CREATE | Reusable metric card |
| `ui/src/components/cockpit/TrendChart.tsx` | CREATE | Reusable trend chart bars |
| `ui/src/components/cockpit/GaugeDial.tsx` | CREATE | Reusable gauge dial |
| `ui/src/components/cockpit/StatusLed.tsx` | CREATE | Reusable source health status row |
| `ui/src/lib/dashboard-data.ts` | CREATE/MODIFY | API integration + fallback for top6/alerts/deep-dive |
| `docs/front-end-arc
```