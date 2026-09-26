# T0 Master Template — Matriz Mestra de Inventário

## Uso
Preencher após completar medição dos 14 eixos (A–N). Uma linha por surface descoberta.

---

## Matriz Mestra T0

| Surface | Current Owner | Current Path | Current Port | Current Host | Current Route | Current Runtime | Live State | Target Owner | Target Route | Action |
|---------|---------------|--------------|--------------|--------------|---------------|-----------------|------------|--------------|--------------|--------|
| hermes-webui | FastAPI BFF | `C:\CentralDark\hermes-webui\` | 8787 | 127.0.0.1 | `/` | Python/Venv | ✅ LIVE | KEEP (CANONICAL) | `/` | KEEP |
| auto-destilador | Python Daemon | `NUCLEO/skills/auto-destilador/` | 8788 | 127.0.0.1 | `/health` | Python/Venv | ✅ LIVE | KEEP (DAEMON) | `/health` | KEEP |
| MCP CentralDark | Node/PM2 | `apps/modulos/mcp/dist/index.js` | 9100 | 127.0.0.1 | `/mcp` | Node/PM2 | ✅ LIVE | KEEP (MCP) | `/mcp` | KEEP |
| Forja Preview | Static HTTP | `scratchpad/forja-de-cartas.html` | 8917 (::) | :: | — | Python/HTTP | ✅ LIVE | ABSORB | `/forja` | ABSORB |
| Mapa HTML | File | `NUCLEO/docs/reference/MAPA-DA-CASA-ARQUITETURA.html` | — | — | — | — | — | ABSORB | `/mapa` | ABSORB |
| Billing HTML | File | `NUCLEO/docs/reference/BILLING-NOUS-PORTAL.html` | — | — | — | — | — | ABSORB | `/billing` | ABSORB |
| Legenda HTML | File | `NUCLEO/docs/reference/LEGENDA-SESSAO-20260823.html` | — | — | — | — | — | ABSORB | `/legenda` | ABSORB |
| Mermaid MD | File | `NUCLEO/docs/reference/CENTRALDARK-MERMAID-ATUAL.md` | — | — | — | — | — | ABSORB | `/mermaid` | ABSORB |
| Cloudflare | Caddy + CF API | `infra/caddy/` + workflows | 443 | VPS | — | VPS/Caddy | ✅ LIVE | INTEGRATE | `/settings/cloudflare` | ABSORB |
| Subdomínios | Caddy + DNS | `infra/caddy/landings-centraldark.Caddyfile` | 443 | VPS | — | VPS/Caddy | ✅ LIVE | ON_DEMAND | Panel | KEEP |
| Theme Engine | Tailwind + ThemeProvider | `src/shared/theme/` + `tailwind.config.ts` | — | — | — | React | ⚠️ 2 temas | UNIFY | 3 temas globais | UNIFY |
| Vite Build | Node/Vite | `package.json` + `vite.config.ts` | — | — | — | Node | ❌ BLOCKED | FIX | — | FIX |
| Git Repo | ServerVpss/CentralDark | `.git` | — | — | — | Git | ✅ LIVE | CANONICAL | — | KEEP |

---

## Legenda de Ações
- **KEEP** = Manter como está (já canônico)
- **ABSORB** = Integrar no owner canônico (hermes-webui)
- **REDIRECT** = Redirecionar para rota canônica
- **RETIRE** = Desativar/remover
- **QUARANTINE** = Isolar para análise
- **UNKNOWN** = Precisa investigação adicional
- **FIX** = Corrigir bloqueio técnico
- **UNIFY** = Unificar em sistema único