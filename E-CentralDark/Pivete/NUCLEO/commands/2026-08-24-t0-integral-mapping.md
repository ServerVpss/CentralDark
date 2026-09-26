# COMANDO - 2026-08-24-t0-integral-mapping.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\ECentralDark_RECONCILIATIONOUROLOCALskills 2\references\2026-08-24-t0-integral-mapping.md
**SHA:** c467572780f205b5
**Timestamp:** 2026-08-28T02:57:23.915515
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- **Regra:** `DECLARED != LIVE` | `HISTORICAL != CURRENT`

### Ouro Bruto (primeiros 5000 chars)
```
# T0 Mapeamento Integral — Metodologia Obrigatória Antes de Qualquer Consolidação

**Origem:** Sessão 2026-08-24 | Contrato canônico Seções A-P | CentralDark ServerVpss/CentralDark

---

## Princípio

> **NÃO PRESUMIR. NÃO USAR DOCUMENTAÇÃO HISTÓRICA COMO ESTADO ATUAL. NÃO CONSOLIDAR ANTES DE CONHECER O DENOMINADOR.**

Antes de qualquer mutação, executar medição completa da Casa inteira. T0 = inventário de terreno.

---

## Estrutura do T0 (16 Blocos Obrigatórios)

| Bloco | Foco | Ferramentas/Comandos-Chave |
|-------|------|----------------------------|
| **A. Git/Governança** | repo, branch, HEAD, worktrees, PRs, writers, CI | `git status`, `git worktree list`, `gh pr list` |
| **B. Todas as Portas** | varredura repo + runtime real + classificação | `grep -r PORT`, `netstat/ss/Get-NetTCPConnection` |
| **C. Domínios/Subdomínios** | inventário DNS + Cloudflare + Caddy | `grep -r centralldark`, Caddyfiles |
| **D. Cloudflare** | capacidades existentes, owner real | workflows CF, Caddy TLS |
| **E. Caddy/Proxy/Edge** | mapeamento host→route→service→port→owner | Caddyfiles, reverse_proxy |
| **F. Runtimes** | PM2, systemd, Docker, Node, Python, MCP, etc | `ecosystem.config*`, PM2 list |
| **G. Frontends/UIs** | App.tsx, SPA, HTMLs, rotas, owners | `find App.tsx`, rotas React |
| **H. Rotas** | BrowserRouter, Routes, Caddy rewrite | matriz CURRENT→TARGET |
| **I. Temp/Scratchpad/HTML** | classificação: TEMP ≠ SOURCE, REFERENCE ≠ PRODUCT | hash, purpose, owner, delta |
| **J. Themes** | ThemeProvider, tokens, registry, 3 temas | ThemeProvider, tailwind.config |
| **K. Skills/Método** | skills reais no runtime Hermes | `skill_view`, profile skills |
| **L. Claude→Hermes** | inventário ouro da sessão | handoff receipt |
| **M. Colisões** | mesma porta/rota/capacidade + 2 owners | investigar 8790, 8090, etc |
| **N. Segurança** | scan secrets, tokens, .env tracked | `.gitignore`, secrets scan |
| **O. Matriz Mestra T0** | SURFACE → ACTION (KEEP/ABSORB/RETIRE) | síntese acionável |
| **P. Só Depois Consolidar** | MAP → DEDUPE → CAUSAL_CLUSTER → MUTATION | sequência rígida |

---

## Classificação de Portas (Bloco B)

```
DECLARED_PORTS    → configs, ecosystem.config, .env
LIVE_PORTS        → netstat/ss/Get-NetTCPConnection (PID + processo)
HISTORICAL_PORTS  → docs, configs antigos, legacy

CLASSIFICAÇÃO:
CANONICAL_PRODUCT   → produto humano (ex: 8787 hermes-webui)
INTERNAL_SERVICE    → serviço interno (ex: 9100 MCP, 8788 auto-destilador)
DEV_SERVER          → Vite, preview (ex: 5173)
PREVIEW             → auxiliar temporário (ex: 8917 Forja)
LEGACY              → declarado, não vivo (ex: 8090, 8082, 9200, 9500)
COLLISION           → mesma porta + 2 owners
UNKNOWN             → não classificado
```

**Regra:** `DECLARED != LIVE` | `HISTORICAL != CURRENT`

---

## Classificação de Artefatos (Bloco I)

```
CANONICAL          → owner ativo, runtime, persistido
REUSABLE_DELTA     → ouro para absorver no owner canônico (ex: 4 HTMLs + 1 MD)
DUPLICATE          → mesmo conteúdo, remover (ex: .md duplicando .html)
REFERENCE          → histórico, manter como referência
TEMP               → scratchpad, preview, não é owner
PREVIEW            → auxiliar, retirar após absorver
LEGACY             → congelado, não mexer
UNKNOWN            → investigar
```

**Regra de Ouro:** `TEMP != SOURCE_OF_TRUTH` | `REFERENCE != PRODUCT`

---

## Matriz Mestra T0 — Saída Obrigatória (Bloco O)

| Surface | Current Owner | Current Port | Live? | Target Owner | Target Route | ACTION |
|---------|---------------|--------------|-------|--------------|--------------|--------|
| hermes-webui | FastAPI BFF | 8787 | ✅ | KEEP (CANONICAL) | `/` | KEEP |
| auto-destilador | Python Daemon | 8788 | ✅ | KEEP (DAEMON) | `/health` | KEEP |
| MCP | Node/PM2 | 9100 | ✅ | KEEP (MCP) | `/mcp` | KEEP |
| Forja Preview | Static HTTP | 8917 | ✅ | ABSORB | `/forja` | ABSORB |
| Mapa HTML | File | — | — | ABSORB | `/mapa` | ABSORB |
| Billing HTML | File | — | — | ABSORB | `/billing` | ABSORB |
| Legenda HTML | File | — | — | ABSORB | `/legenda` | ABSORB |
| Mermaid MD | File | — | — | ABSORB | `/mermaid` | ABSORB |
| Cloudflare | Caddy + CF API | 443 | ✅ | INTEGRATE | `/settings/cloudflare` | ABSORB |
| Theme Engine | Tailwind + TP | — | ⚠️ (2 temas) | UNIFY | 3 temas globais | UNIFY |
| Vite Build | Node/Vite | — | ❌ BLOCKED | FIX | — | FIX |

**ACTION ∈ {KEEP, ABSORB, REDIRECT, RETIRE, QUARANTINE, UNKNOWN}**

---

## Integração com Dream-Review (O "Sono")

```
SESSÃO HERMES (acordado)
    ↓ executa missões
    ↓ emite CARVE (rastro.jsonl)
    ↓ atualiza LAST_GOOD_STATE
    ↓
HANDOFF RECEIPT (obrigatório)
    ↓
DREAM-REVIEW RODA (sono)
    ↓ lê rastro.jsonl + LEMBRANCAS.md + head_sha
    ↓ detecta padrões (pattern-discovery)
    ↓ gera proposals (CANDIDATE / NO_NEW_INFORMATION)
    ↓ roteia agent calls ABSORB_PROVEN_PATTERN
    ↓
PRÓXIMA SESSÃO HERMES (acorda)
    ↓ CENTRALDARK_AI_BOOT carrega LAST_GOOD_STATE
    ↓ carrega proposals pendentes
    ↓ Writer executa ab
```