# Collision Checklist — Colisões Conhecidas CentralDark

## Uso
Executar antes de qualquer consolidação. Marcar cada item verificado.

---

## Checklist de Colisões

### Portas
- [ ] **8787** — hermes-webui (CANONICAL_PRODUCT) — único owner ✅
- [ ] **8788** — auto-destilador (INTERNAL_SERVICE) — único owner ✅
- [ ] **8917** — Forja preview (PREVIEW) — IPv6 `::` PID 74920 — **RETIRAR após absorver**
- [ ] **9100** — MCP CentralDark (INTERNAL_SERVICE) — único owner ✅
- [ ] **8090** — Arsenal adapter (DECLARED_NOT_LIVE) — investigar se deve subir
- [ ] **8082** — Elite proxy (DECLARED_NOT_LIVE) — investigar se deve subir
- [ ] **9200** — Bot hub-adm (DECLARED_NOT_LIVE) — investigar se deve subir
- [ ] **9500** — Bot webhook (DECLARED_NOT_LIVE) — investigar se deve subir
- [ ] **3030** — Graph Panel (DECLARED_NOT_LIVE) — VPS only
- [ ] **3100** — MultiZap (DECLARED_NOT_LIVE) — VPS only
- [ ] **8790** — **COLLISION** — investigar explicitamente

### Hostnames / Domínios
- [ ] `centralldark.com` — DEFAULT_PUBLIC_DOMAIN ✅
- [ ] `www.centralldark.com` — redirect para principal ✅
- [ ] `mcp.centralldark.com` — MCP backend ✅
- [ ] `ui.centralldark.com` — Arsenal referer ✅
- [ ] `api.centralldark.com` — Bolt gateway ✅
- [ ] `status.centralldark.com` — Bot webhook ✅
- [ ] `telepainel.centralldark.com` — PLANNED
- [ ] `hub.centralldark.com` — Hub standalone ✅
- [ ] `whatsapp.centralldark.com` — TelePainel route ✅
- [ ] `crm.centralldark.com` — TelePainel route ✅
- [ ] `financeiro.centralldark.com` — TelePainel route ✅
- [ ] `*.centralldark.com` — wildcard Caddy ✅

### Rotas
- [ ] `/` → TelePainel dist (Caddy) — KEEP
- [ ] `/mapa` → ABSORB (Mapa HTML)
- [ ] `/forja` → ABSORB (Forja preview 8917)
- [ ] `/billing` → ABSORB (Billing HTML)
- [ ] `/legenda` → ABSORB (Legenda HTML)
- [ ] `/mermaid` → ABSORB (Mermaid MD)
- [ ] `/chat` → hermes-webui RuntimeAdapter — KEEP
- [ ] `/sessions` → hermes-webui Sessions API — KEEP
- [ ] `/kanban` → hermes-webui Kanban Bridge — KEEP
- [ ] `/workspace` → hermes-webui Workspace — KEEP
- [ ] `/settings/cloudflare` → ABSORB (Cloudflare panel)

### Capabilities / Owners
- [ ] **Theme Engine** — Tailwind + ThemeProvider (2 temas) → UNIFY para 3 temas globais
- [ ] **Cloudflare** — Caddy + CF API → INTEGRATE em hermes-webui Settings
- [ ] **Subdomínios** — Caddy + DNS → ON_DEMAND via panel
- [ ] **SOUL** — AppData (HERMES legacy) vs E:\ (HERMES-CASA) — DOCUMENTED_DIVERGENCE

### Writers
- [ ] Verificar `git status` — writers ativos no mesmo escopo
- [ ] Verificar PRs ativos — mesmo caminho
- [ ] Verificar worktrees — mesma missão

---

## Colisões Resolvidas (Histórico)

| Colisão | Resolução | Data |
|---------|-----------|------|
| 4 HTMLs separados vs 1 Casa | Absorver todos em hermes-webui routes | 2026-08-24 |
| SOUL AppData vs E:\ | Documented divergence (não mover) | 2026-08-23 |
| elite-gateway zendriver | LEGACY_DISABLED (zero processos) | 2026-08-23 |
| PR #455 inexistente | Decomposição determinística | 2026-08-22 |

---

## Novas Colisões Descobertas
*Adicionar aqui conforme descobertas*