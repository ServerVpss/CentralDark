# COMANDO - nav-tracking-mitigations-mapping.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\ECentralDark_RECONCILIATIONOUROLOCALskills 2\references\nav-tracking-mitigations-mapping.md
**SHA:** 1d117714e59022b2
**Timestamp:** 2026-08-28T02:57:24.972018
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: node scripts/nav-tracking-audit.mjs
- run: node scripts/bounce-chain-detect.mjs

### Ouro Bruto (primeiros 5000 chars)
```
---
title: Privacy CG Nav Tracking Mitigations — Mapeamento CentralDark
captured_at: "2026-08-22"
source: "https://privacycg.github.io/nav-tracking-mitigations/#bounce-tracking-mitigations"
---

# Privacy CG Navigational Tracking Mitigations — Mapeamento para Stack CentralDark

## Spec Status
- **W3C Privacy Community Group** — Experimental, não é padrão W3C
- Define como browsers devem mitigar *navigational tracking* cross-site
- Foco: *bounce tracking* (redirects + link decoration para correlacionar identidades)

## Requisitos da Spec (R1-R8)

| ID | Requisito | Tipo |
|----|-----------|------|
| R1 | Detectar cadeia: `origem → intermediários → destino` | Passiva |
| R2 | Identificar link decoration (query params, fragments alta entropia) | Passiva |
| R3 | Detectar bounce tracking: redirects (3xx, meta refresh, JS) + decoration | Passiva |
| R4 | Classificar intermediários: legítimo vs bounce tracker | Algoritmo/List-based |
| R5 | Verificar interação humana real no intermediário | Heurística |
| R6 | Limpar estado residual (cookies, storage, cache) de trackers | Ativa |
| R7 | Grace period configurável (ex: 1h) | Config |
| R8 | Diferenciar params legítimos (ID produto) vs tracking | Allow/deny list |

## Mapeamento Stack CentralDark

| Componente | Cobre | Gap |
|------------|-------|-----|
| `elite-gateway` / `lovable-proxy` | Proxy borda — intercepta requests/responses | ❌ Middleware strip/decoration detection |
| `porta-de-entrada.yml` | Gate PR — discovery, receipt, validar mapa | ❌ Step auditoria navegação |
| `sentinela-divergencias` | Drift guard, log-verificador | ❌ Regra bounce chain detection |
| `meta-lupa` | 3 temperaturas + AutoLupa | ❌ Temperatura `NAVEGACIONAL_TRACKING` |
| `hermes-verificador` | Monitora processos PM2 | ❌ Monitora navegação browser |
| `oauth-broker` | OAuth flow, tokens | ⚠️ Origem de decorations legítimas |

## Gaps Reais para Integrar

| Gap | Onde | Esforço | Prioridade |
|-----|------|---------|------------|
| **G1** Middleware strip/decoration detection | `elite-gateway` ou `lovable-proxy` | Médio | **ALTA** |
| **G2** Bounce chain detector (redirect chain + decoration) | `sentinela-divergencias` ou standalone | Médio | **ALTA** |
| **G3** Temperatura `NAVEGACIONAL_TRACKING` na MetaLupa | `.agents/skills/meta-lupa/SKILL.md` | Baixo | **MÉDIA** |
| **G4** Step auditoria navegação em `porta-de-entrada.yml` | Workflow gate | Baixo | **MÉDIA** |
| **G5** Config grace period + allow/deny lists | Config centralizada | Baixo | **BAIXA** |
| **G6** Limpeza estado residual | **NÃO FAZEMOS** — não controlamos browser do usuário | N/A | **NÃO APLICÁVEL** |

## Parâmetros de Tracking Conhecidos (para strip)

```javascript
const TRACKING_PARAMS = [
  'fbclid', 'gclid', 'gclsrc', 'msclkid', 'ttclid', 'li_fat_id',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'utm_id', 'utm_source_platform', 'utm_creative_format', 'utm_marketing_tactic',
  'mc_eid', 'mc_cid', '_ga', '_gl', '_hsenc', '_hsmi',
  'yclid', 'dm_i', 'hsCtaTracking', 'vero_id', 'vero_conv',
  'igshid', 'dmcid', 'dma', 'ref', 'referrer'
];
```

## Plano de Integração (quando GitHub disponível)

### FASE 1 — Core Detection (skill `nav-tracking-detector`)
```
.agents/skills/nav-tracking-detector/
├── SKILL.md
├── src/
│   ├── detector.ts           # parse URL, detect decoration, classify bounce
│   ├── params-list.json      # allow/deny lists
│   ├── chain-analyzer.ts     # reconstrói cadeia redirect
│   └── grace-period.ts       # config grace period
└── tests/detector.test.ts
```

### FASE 2 — Elite-Gateway Middleware
```typescript
// apps/modulos/elite-gateway/src/middleware/nav-tracking.ts
const detection = NavTrackingDetector.analyze(req.url, req.headers);
if (detection.isTracking) {
  auditLog.navTracking(detection);
  if (config.stripTrackingParams) req.url = NavTrackingDetector.strip(req.url);
}
```

### FASE 3 — App Flutuante SOL (Dashboard)
- Painel tempo real: cadeias detectadas, intermediários classificados, params stripados, alertas bounce chain > 2 hops

### FASE 4 — Porta-de-Entrada + Sentinela
```yaml
# porta-de-entrada.yml
- name: Auditoria navegação (nav-tracking)
  run: node scripts/nav-tracking-audit.mjs

# sentinela-divergencias.yml
- name: Bounce chain detection
  run: node scripts/bounce-chain-detect.mjs
```

## O que Precisa do CHEFE para Iniciar

| Decisão | Necessária? |
|---------|-------------|
| Confirmar "app flutuante da SOL" = dashboard em `apps/modulos/sol-floating-app`? | **SIM** |
| Autorizar skill `nav-tracking-detector` em `.agents/skills/`? | **SIM** |
| Confirmar `elite-gateway` como proxy de borda? | **SIM** |
| Definir grace period padrão (1h? 24h?) | **SIM** |
| Listar params allow/deny iniciais | **OPCIONAL** |

## Bloqueio Atual
```
MISSION_ID=UNRESOLVED
STATUS=BLOCKED_GITHUB_UNAVAILABLE
```
Não consigo validar contra repo remoto (LEIA-ME-IA.md, branch, HEAD, Writer, estrutura `elite-gateway`, existência `sol-floating-app`).
```