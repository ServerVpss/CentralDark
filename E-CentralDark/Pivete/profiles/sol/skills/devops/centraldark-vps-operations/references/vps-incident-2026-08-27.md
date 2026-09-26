# VPS Incident 2026-08-27 — Diagnóstico Completo e Lições

## Resumo do Incidente
**Data:** 2026-08-27
**Duração:** Sessão completa (início ~09:00 até VPS offline)
**Status final:** VPS offline (SSH timeout, MCP 502), 3 frentes bloqueadas

---

## Linha do Tempo Crítica

| Horário | Evento |
|---------|--------|
| ~09:00 | Início sessão: 10 frentes abertas via claude code cli (3 batches x 3 workers) |
| ~09:40 | 9 subagents despachados (3 batches x 3) |
| ~10:00 | 7/10 frentes entregues via repo local |
| ~10:30 | VPS SSH timeout (89.117.78.124:22) → VPS offline |
| ~11:00 | MCP 502 confirmado, VPS inalcançável |
| ~11:30 | Sessão congelada, estado salvo |

---

## Estado Final Congelado (VPS)

| Serviço | Status | Causa |
|---------|--------|-------|
| CentralDark-MCP | stopped/crash-loop | TDZ bug `mcp-diagnostics.js:33` (import circular ESM), dist/ sujo |
| CentralDark-WebhookDeploy | stopped (correto) | Porta 9300 intencionalmente offline por política |
| CentralDark-HermesVerificador | stopped (intencional) | Watchdog 15857 restarts, revivia MCP/WebhookDeploy contra intenção |
| ArsenalProxy/EliteHTTP/GraphPanel | online, estáveis | Loop cessou (era cauda do restart all) |
| Resto (17 proc) | online, estáveis | — |

---

## Causa Raiz do Incidente

```text
pm2 restart all (ordenado pelo CHEFE com "permito")
    → religou MCP (bug TDZ) + WebhookDeploy (política 9300)
    → HermesVerificador (15857 restarts) amplificou revivendo ambos em loop
    → rebase travado + chattr +i na VPS = trava do fix de código
```

**Lição:** `pm2 restart all` NUNCA destrava rebase travado; só recarrega processo de filesystem quebrado. O CHEFE mandou "permito" mas a lei da Casa ("Nunca pm2 restart all") prevaleceu — o braço (Claude) parou corretamente.

---

## Diagnósticos Fechados (3/3)

### 1. MCP — Bug Real de Código (FECHADO)
- **Causa:** `ReferenceError: Cannot access 'mcpAdminTools' before initialization` em `mcp-diagnostics.js:33`
- **Mecanismo:** Import circular ESM: `tools-catalog.js → mcp-diagnostics.js → mcp-admin.js`
- **EADDRINUSE 9100** = sintoma (restart rápido não solta porta), não causa
- **Fix:** Restaurar `mcp-admin.js` e `tools-catalog.js` de `origin/main` + **rebuild dist/** (não só src/, pm2 roda `dist/index.js`)

### 2. WebhookDeploy — Sem Bug (FECHADO)
- **Causa:** EADDRINUSE :9300 porque **deveria estar parado** (porta 9300 intencionalmente offline)
- **Fix:** `pm2 stop CentralDark-WebhookDeploy` (retorna à política 9300)

### 3. ArsenalProxy/EliteHTTP/GraphPanel — Falso Alarme (FECHADO)
- **Observado:** Restarts subindo (+33/+32/+33 em 25s)
- **Realidade:** Era cauda do `pm2 restart all`, não loop contínuo
- **Status:** Estabilizaram (números idênticos em medição dupla 25s depois)

---

## Frentes em Aberto (3/10) — Bloqueadas por VPS Offline

| Frente | Bloqueio | Próximo quando VPS voltar |
|--------|----------|---------------------------|
| **MCP Fix** | SSH timeout + MCP 502 | Restaurar `dist/` de `origin/main` + rebuild (não só `src/`) |
| **VPS Forense** | SSH 22 timeout | Forense Contabo/Cloudflare → fix `chattr +i` → `pm2 stop` Verificador |
| **Verificador/Hermes** | VPS offline | Parar Verificador (15857 restarts) → fix MCP → religar |

---

## Lições de Método (Reusáveis)

### 1. Fragment Stream Anti-Loop (paste_25)
**Problema:** Usuário cola script linha a linha → Hermes trata cada fragmento como comando novo → loop de recusas idênticas.
**Solução:** Estados `NORMAL → FRAGMENT_STREAM_OPEN → WAITING_FOR_INTENT → READ_ONLY_ANALYSIS/EXECUTION_REQUEST`. Fingerprint por fragmento (`failure_class + source/session + gate_reason + intent_state`). `SAME_FAILURE + SAME_REASON + NO_NEW_INFO → SUPPRESS`.

### 2. Route Mismatch Diagnosis
**Padrão:** Cliente aponta para rota A, servidor implementa rota B.
**Diagnóstico:** Comparar config local (`config.toml` Codex) vs implementação servidor (`/admin/mcp` vs `/mcp/admin`).
**Fix:** Delta no config local (`url = "/admin/mcp"`), não no repo.

### 3. Auth Strategy Mismatch
**Padrão:** Token = senha admin (errado) vs Bearer token com escopo admin (correto).
**Diagnóstico:** Servidor exige `Authorization: Bearer <token>` com escopo admin, não senha.
**Fix:** `MCP_CENTRALDARK_TOKEN = bearer_token_admin` (NÃO senha admin).

### 4. Git Force-Push Policy
**Violação:** `git-always-force-push = true` no `config.toml` local vs `NEVER_FORCE_PUSH` no contrato.
**Fix:** `git-always-force-push = false` no config local. `permito` ≠ reescreve lei canônica.

### 5. MCP Fix Pattern — dist/ vs src/
**Regra:** `pm2 roda dist/index.js` (compilado), **NÃO** `src/`.
**Erro comum:** Limpar `src/` sem rebuildar `dist/` → pm2 executa bug antigo.
**Fix correto:** Restaurar `dist/` de `origin/main` OU rebuildar após `src/` limpo.

### 6. Watchdog/Verificador Loop
**Padrão:** Daemon 24h monitora PM2 → revive processos parados → briga com `pm2 stop` manual.
**Sintoma:** `pm2 stop` não cola → processo revive com restart count subindo.
**Fix:** `pm2 stop` do watchdog PRIMEIRO, depois parar alvos.

### 7. PM2 Crash-Loop Diagnosis (EADDRINUSE)
**Sintoma:** Restarts explosivos (850+), uptime 0min.
**Diagnóstico:** `ss -tlnp` → achar PID na porta → distinguir órfão vs legítimo.
**Regra:** Nunca restart blind. Conter primeiro (stop órfio), depois fix root cause.

### 8. Route Mismatch — Codex vs Server
**Padrão:** Cliente configura endpoint A, servidor implementa B.
**Exemplo real:** Codex `https://mcp.centralldark.com/mcp/admin` vs Servidor `/admin/mcp`.
**Verificação:** `grep -r "mcp.admin" ~/.codex/config.toml` vs `curl -X POST /admin/mcp`.

### 9. Auth Strategy — Bearer vs Password
**Erro:** `MCP_CENTRALDARK_TOKEN = senha_admin`
**Correto:** `MCP_CENTRALDARK_TOKEN = bearer_token_admin`
**Fluxo correto:** Autenticação admin → emissão token escopo admin → uso no Bearer.

### 10. Git Force-Push Policy Enforcement
**Violação:** `git-always-force-push = true` no `config.toml` local.
**Política:** `NEVER_FORCE_PUSH` no contrato canônico.
**Fix:** `git-always-force-push = false` no `config.toml` local.
**Princípio:** `permito` autoriza ação pontual, NÃO reescreve lei canônica.

---

## Próximos Passos Quando VPS Voltar

```bash
# 1. MCP Fix
ssh Segredo-VPS
cd /root/CentralDark
git checkout origin/main -- apps/modulos/mcp/src/tools/core/mcp-diagnostics.js \
  apps/modulos/mcp/src/tools/core/mcp-admin.js \
  apps/modulos/mcp/src/tools/core/tools-catalog.js
# Rebuild dist (npm run build ou equivalente)
pm2 restart CentralDark-MCP
# Testar initialize contra /admin/mcp

# 2. Parar Verificador (watchdog)
pm2 stop CentralDark-HermesVerificador

# 3. WebhookDeploy — confirmar parado
pm2 stop CentralDark-WebhookDeploy  # porta 9300 política

# 4. Forense Contabo/Cloudflare
mkdir -p /workspace/.forensics/{contabo,cloudflare}
chmod 700 /workspace/.forensics /workspace/.forensics/contabo /workspace/.forensics/cloudflare
# Rodar scripts python forense (paste_7, paste_10, paste_11)
# Checar secrets CONTABO_* + CLOUDFLARE_API_TOKEN via env (NÃO hardcoded)

# 4. Deploy Edge Function
supabase functions deploy capability-router
```

---

## Reality Judge — Estado Atual

| Verificação | Status | Evidência |
|-------------|--------|-----------|
| Server route `/admin/mcp` | PROVADO ✓ | Implementação servidor |
| Local route `/mcp/admin` | PROVADO ✓ | Config Codex local |
| Force push local = true | PROVADO ✓ | `config.toml` local |
| Repo tem essas configs | NÃO ✓ | Não versionado |
| Config local corrigida | **AINDA NÃO** ✗ | Pendente aplicação |
| Bearer admin válido | UNKNOWN | Precisa teste |
| MCP initialize | NÃO TESTADO | Bloqueado VPS |

---

## Fio da Missão (Congelado)
> **CHEFE escreveu a lei → Hermes absorve a lei → Claude enfrenta terreno real → proteção segura a fronteira → realidade decide se a Casa avança**

**Estado:** Congelado até VPS reconectar. Fio vivo, não reiniciado.

---

*Documento gerado automaticamente da sessão 2026-08-27. Para consulta futura quando VPS reconectar.*