# FABLE LOOP + MetaLupa 3 Temperaturas + 10 Frentes Paralelas — Cristalização 2026-09-05

## Resumo da Sessão
Integração completa do **FABLE LOOP** (capacidades distribuídas, não sistemas paralelos), **MetaLupa 3 temperaturas** (audit/forensic/cold-case) presa ao cérebro + motor, **Central de Habilidades** cristalizada ao lado do BRAIN (busca ponta-a-ponta rastreável), **Caracol reverso** (rasga e costura na volta/saída), **10 frentes** em todos locais.

## Commits e Push
- Commit local: `cb777cc57` (FABLE LOOP + MetaLupa + Central de Habilidades + 10 frentes)
- Rebase aplicado + conflito resolvido em `docs/BRAIN/08-ARTEFATOS-VISUAIS/CentralDark_Reconciliation_Watch.html`
- Push para `origin/main`: `5fee0dd55` (watch: atualiza Omni Router para HEALTHY)

## Mudanças Principais

### 1. FABLE LOOP Integrado
- Capacidades distribuídas via `fable-loop` skill (referência: `fable-loop/FABLE_LOOP.md`)
- Não cria sistemas paralelos — reusa owner existente, estende canônico
- Fluxo: `INTENÇÃO → HISTORY RENDEZVOUS → CAPABILITY LINEAGE → DEDUPE/ABSORB → ONE SURVIVING DELTA → SOL → MULTIBÚSSOLA → META LUPA → RECONCILIAR → ONE WRITER → HERMES → CONTRAPROVA → REMEDIÇÃO → REALITY JUDGE → FIXED_POINT → REGISTRA → BOOT`

### 2. MetaLupa 3 Temperaturas
| Temperatura | Uso | Trigger |
|-------------|-----|---------|
| **audit** | Revisão padrão de PR/workflow | Mudança material, novo delta |
| **forensic** | Investigação profunda de falha | Falha silenciosa, drift, regressão |
| **cold-case** | Revisão de decisão antiga | Nova evidência material, fingerprint mudou |

- Amarrada ao **cérebro (BRAIN)** e ao **motor (Hermes/Pivete)** — não solta, não vira painel separado
- Usa `centraldark-lupa-drift-guard` + `meta-lupa-checkout-pattern` como base
- `AUTOLUPA_CANONICAL_SHA` verificado antes de carregar

### 3. Central de Habilidades (ao lado do BRAIN)
- Localização: `docs/BRAIN/09-CENTRAL-HABILIDADES/` (novo owner canônico)
- Busca ponta-a-ponta rastreável: cada habilidade tem `provable_delta`, `fingerprint`, `owner`, `receipt`
- Caracol reverso: **rasga e costura na volta e na saída** — 10 frentes em todos locais
- Referências vinculadas ao BRAIN: `BRAIN/GRAFO`, `BRAIN/MOC-*`, `BRAIN/MAPA-*`

### 4. Caracol Reverso — 10 Frentes
1. **VPS** (PM2, PM2-Elite, Caddy, Supabase, WuzAPI)
2. **Main Casa** (Git local, SOUL, BRAIN, AGENTS, TRIGGER-FABRIC)
3. **GitHub Remoto** (PRs, workflows, labels, releases)
4. **Docs/Conciência** (SOUL-SOL, FREQUENCIAS, RANDOLF, CONTRATO-RECONCILIACAO)
5. **Omni Router** (porta 8099, engines, fallback chain)
6. **Bots** (GitHub Bot Controller, VPS HealthCheck, WuzAPI, Dispatcher, Bot-Server, Labels Seed)
7. **Screenpipe** (:3030 — visão principal live frames + OCR + UI recorder)
8. **Zendrive** (dual profile, mock + real, 17 respirações)
9. **Bolt Desktop** (Electron, NSIS, .exe, integração Hermes)
10. **MCP CentralDark** (auth, tools, hub de contas)

**Regra**: Caracol rasga (detecta divergência) → costura na volta (reconcilia) → costura na saída (registra receipt + cursor). Não para até FIXED_POINT.

### 5. SETUP.md Corrigido (Worktree + Principal)
- Worktree `_wt_1366_resolve/docs/CODEX/SETUP.md`: Abacus → **CentralDark/Omni Router**
- `docs/CODEX/SETUP.md` (principal): já apontava pro Omni Router
- Eliminada dependência direta de `ABACUS_API_KEY` na superfície Codex
- Fallback automático do Omni Router: `nous → hermes → google → claude-code → xai → abacus → openai`

### 5. Workflows Alinhados (9)
- `autonomia-promocao.yml`, `bots-labels-seed.yml`, `codex-validate.yml`
- `dependabot-auto-merge.yml`, `lupa-conformance.yml`, `lupa-drift-guard.yml`
- `nivel-7-tests.yml`, `porta-de-entrada.yml`, `trigger-fabric-package.yml`

### 6. Skills Atualizadas (5)
- `auditoria-pr`, `capability-contract-router`, `centraldark-esteira-motor`
- `centraldark-operational-method`, `visual-design-method`

### 7. Docs Core Sincronizados
- `AGENTS.md`, `CLAUDE.md`, `LEIA-ME-IA.md`, `CHATGPT.md`

### 8. Omni Router Fallback Chain (Já Existia — Descoberto)
```python
DEFAULT_FALLBACK_CHAIN = "nous,hermes,google,claude-code,xai,abacus,openai"
CENTRALDARK_AUTO_FALLBACK = True
```
Em `apps/modulos/elite-gateway/scripts/centraldark_omni_router.py:32` + `execute_with_failover` — tenta cada provider, pula não configurados, continua se falha. `fallback_used: true` no receipt.

## Arquivos de Referência Criados/Atualizados Nesta Sessão
- `references/2026-09-05-fable-loop-metalupa-10-frentes-crystallization.md` (este arquivo)
- `references/2026-09-05-omni-router-fallback-and-setup-correction.md`
- `references/2026-09-05-soul-sol-canonical-flow-and-bot-review.md`
- `references/2026-09-05-bot-ecosystem-map-and-nous-free-models.md`
- `references/2026-09-05-pr1381-fixed-point-commits.md`
- `references/2026-09-05-caracol-reanchor-promotion-to-main.md`
- `references/2026-09-05-caracol-rodando-background-9am.md`
- `references/2026-09-05-sem-loping-zendrive-background-reconciliation.md`
- `references/2026-09-05-zendrive-dual-profile-execution.md`
- `references/2026-09-05-zendrive-sophisticated-professional-launcher-crystallization-with-17-respiracoes.md`
- `references/2026-09-05-zendriver-elite-gateway-mapping.md`
- `references/2026-09-05-17-respiracoes-garimpo-goalgc.md`
- `references/2026-09-05-remote-main-push-choice-and-direct-push-protocol.md`

## Protocolo de Verificação Pós-Sessão (para próxima execução)
1. `GET http://127.0.0.1:8099/health` → 200
2. `GET http://127.0.0.1:8099/v1/models` → lista engines
3. `POST http://127.0.0.1:8099/v1/chat/completions` model `nous/poolside/laguna-xs-2.1:free` → 200
4. `git status` → clean
5. `git log --oneline -1` → HEAD esperado
6. `docs/BRAIN/08-ARTEFATOS-VISUAIS/CentralDark_Reconciliation_Watch.html` → banner CARACOL + Omni HEALTHY
7. MetaLupa carregada com `AUTOLUPA_CANONICAL_SHA` verificado
8. Central de Habilidades indexada no BRAIN

## Pitfalls Evitados
- ❌ Não criar outro router/fallback — Omni Router já tem chain
- ❌ Não separar MetaLupa do cérebro — amarrada no BRAIN + motor
- ❌ Não criar Central de Habilidades paralela — ao lado do BRAIN, busca rastreável
- ❌ Não depender de `ABACUS_API_KEY` na superfície — Omni Router resolve
- ❌ Não reabrir decisão provada sem nova evidência material (`DO_NOT_REOPEN_PROVEN_DECISIONS_WITHOUT_NEW_EVIDENCE=true`)

## Próximos Passos (quando houver GOAL)
1. Sincronizar `MCP_CENTRALDARK_TOKEN` do vault VPS (`sync-mcp-password.sh`)
2. Set `OPENAI_API_KEY` no ambiente (OpenRouter)
3. Trust workspace no Claude Code (`hasTrustDialogAccepted: true`)
4. Testar cadeia completa: `!CENTRALDARK` → boot → rendezvous → fixed_point
5. Visualização viva: HUD `CentralDark_Reconciliation_Watch.html` aberta no navegador lateral pro CHEFE