---
name: t0-integral-mapeamento
description: Mede toda infraestrutura antes de consolidar na CentralDark.
---

# T0 Mapeamento Integral — Protocolo de Medição Pré-Consolidação

## Gatilho
**OBRIGATÓRIO antes de qualquer mutação/consolidação na CentralDark.** Sempre que a intenção for "consolidar tudo numa Casa única" ou similar.

## Princípio
```
MEDIR TUDO → MAPEAR → DEDUPLICAR → CLUSTER CAUSAL → TARGET_MAPPING
→ WRITER_SCOPES → MUTAÇÃO → TESTE → CONTRAPROVA → REALITY_JUDGE → FIXED_POINT
```

NUNCA presumir. NUNCA usar documentação histórica como estado atual. NUNCA consolidar antes de conhecer o denominador.

---

## 14 Eixos de Medição (A–N)

### A. GIT / GOVERNANÇA
```bash
REPO=$(git config --get remote.origin.url)
BRANCH=$(git branch --show-current)
HEAD_SHA=$(git rev-parse HEAD)
WORKTREE=$(git worktree list --porcelain)
ACTIVE_PRS=$(gh pr list --state open)
ACTIVE_WRITERS=via git status
CI=$(ls .github/workflows/)
LAST_GOOD_STATE=último build/dist conhecido bom
```

### B. TODAS AS PORTAS
- **Varredura repo inteiro**: `PORT`, `process.env.PORT`, `listen(`, `server.listen`, `ports:`, `EXPOSE`, `localhost:`, `127.0.0.1:`, `reverse_proxy`
- **Medição runtime real**: `netstat`/`ss`/`Get-NetTCPConnection` → PORT, PID, OWNER, COMMAND, PATH
- **Classificação**: `CANONICAL_PRODUCT` | `INTERNAL_SERVICE` | `DEV_SERVER` | `PREVIEW` | `LEGACY` | `COLLISION` | `UNKNOWN`
- **Separar**: `DECLARED_PORTS` ≠ `LIVE_PORTS` ≠ `HISTORICAL_PORTS`
- **Alvo humano**: `LOCAL_PRODUCT_PORT=8787`, `PUBLIC_PRODUCT_PORT=443`

### C. DOMÍNIOS / SUBDOMÍNIOS
Inventariar todos (`centralldark.com`, `www`, `app`, `api`, `bot`, `crm`, `mcp`, `gateway`, `webhook`, `status`, `telepainel`, `whatsapp`, `financeiro`, `hub`, `grafo`, `ui`, `builder`, `install`, `portainer`, `deploy` + outros).
Para cada: `HOST`, `DNS`, `CLOUDFLARE`, `CADDY`, `DESTINATION`, `PORT`, `ROUTE`, `OWNER`, `LIVE`, `KEEP|ABSORB|REDIRECT|RETIRE|UNKNOWN`

### D. CLOUDFLARE
Médir capacidades: OAuth, wildcard, DNS API, cf-sync, zones, domain state, TLS state, existing routes. Owner real existente. Alvo: Hermes-WebUI → Settings → Domains & Cloudflare.

### E. CADDY / PROXY / EDGE
Inventariar `infra/caddy/**`, mapear `HOST → ROUTE → SERVICE → PORT → OWNER`. Detectar `HOST_COLLISION`, `PORT_COLLISION`, `DUPLICATE_ROUTE`, `STALE_ROUTE`, `LEGACY_ROUTE`.

### F. RUNTIMES
Mapear: Hermes-WebUI, Vite, Docker, PM2, systemd, Node, Python, Builder, MCP, Graph, Memory API, Artifacts Builder, Gateway, Arsenal, OAuth broker, Telegram MTProto, watchers, workers, schedulers.
Para cada: `NAME`, `TYPE`, `PATH`, `START_COMMAND`, `PORT`, `OWNER`, `CONSUMERS`, `LIVE`, `CANONICAL`, `TARGET`.

### G. FRONTENDS / UIs
Procurar: `src/App.tsx`, `apps/modulos/**`, HTMLs independentes. Mapear `UI → ROUTES → COMPONENTS → OWNER → RUNTIME → PORT`. Detectar `PARALLEL_UI`, `DUPLICATE_COMPONENT`, `DUPLICATE_ROUTER`, `LEGACY_ALIAS`. Alvo: `ONE_CANONICAL_UI=Hermes-WebUI`.

### H. ROTAS
Inventariar `BrowserRouter`, `Routes`, `Route`, `Navigate`, `hostRouting`, `rewrite`, `redirect`, `proxy`. Criar matriz `CURRENT_ROUTE → CURRENT_OWNER → TARGET_ROUTE → ACTION`.

### I. TEMP / SCRATCHPAD / HTML
Inventariar: `AppData/Local/Temp`, Claude scratchpad, `NUCLEO/docs/reference`, HTMLs soltos. Para cada: `SOURCE`, `HASH`, `PURPOSE`, `OWNER`, `DELTA`, `ABSORBED`, `CAN_DELETE_LATER`. `TEMP != SOURCE_OF_TRUTH`, `REFERENCE != PRODUCT`.

### J. THEMES
Médir: `ThemeProvider`, theme registry, CSS vars, tokens, hardcoded colors, localStorage/profile persistence. 3 temas oficiais: `OPERATIONAL`, `EMERALD`, `FORGE`. Mapear cobertura por componente. Alvo: `ONE_THEME_ENGINE`, `THREE_GLOBAL_THEMES`, `ZERO_LAYOUT_DUPLICATION`.

### K. SKILLS / MÉTODO
Inventariar skills reais no runtime Hermes: `kimetsu-legacy-operational-method`, `operational-communication`, `centraldark-operational-method`, `.agents/skills/meta-lupa/SKILL.md`. Para cada: `PATH`, `HASH`, `VERSION`, `CAPABILITY`, `LOADED?`, `RUNTIME_CONSUMER`, `OVERLAP`, `DELTA`. **COMPOSE, DON'T DUPLICATE.**

### L. CLAUDE → HERMES
Inventariar tudo que Claude aprendeu/criou: `FILES`, `METHODS`, `TESTS`, `SKILLS_USED`, `DESIGN_RULES`, `THEME_RULES`, `ERROR_PATTERNS`, `DECISIONS`, `RECEIPTS`. Todo ouro: `OWNER_MATCH → ABSORB → VERIFY → HERMES LOADS IT`.

### M. COLISÕES
Procurar: mesma porta + dois owners, mesmo hostname + dois targets, mesma rota + dois componentes, mesma capability + dois owners, mesmo arquivo + dois writers. Investigar explicitamente portas conhecidas (8790, etc).

### N. SEGURANÇA
Scan: tracked secrets, tokens, keys, credentials, `.env` accidentally tracked, hardcoded auth literals. Não exibir valores. Só: `PATH`, `TYPE`, `SEVERITY`, `TRACKED?`, `ACTION_REQUIRED`.

---

## O. MATRIZ MESTRA T0
Gerar tabela: `SURFACE | CURRENT_OWNER | CURRENT_PATH | CURRENT_PORT | CURRENT_HOST | CURRENT_ROUTE | CURRENT_RUNTIME | LIVE_STATE | TARGET_OWNER | TARGET_ROUTE | ACTION` onde `ACTION ∈ {KEEP, ABSORB, REDIRECT, RETIRE, QUARANTINE, UNKNOWN}`.

---

## P. SÓ DEPOIS CONSOLIDAR
```
T0_INVENTORY → MAP → DEDUPE → CAUSAL_CLUSTER → TARGET_MAPPING
→ WRITER_SCOPES → MUTATION → TEST → COUNTERPROOF → REALITY_JUDGE
→ T1_REMEASURE → FIXED_POINT
```

---

## Referências
- `references/t0-master-template.md` — template da matriz mestra
- `references/port-classification.md` — guia de classificação de portas
- `references/collision-checklist.md` — checklist de colisões conhecidas