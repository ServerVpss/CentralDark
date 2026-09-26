# Session 2026-09-06 — Verification Pattern & Measure-First Lesson (Master Funnel)

## Contexto
Usuário corrigiu múltiplas vezes: assumi estado local sem medir GitHub/main/remote. O site na VPS (`centralldark.com`, `telepainel.centralldark.com`, `api.centralldark.com`) **É** o projeto CentralDark em produção. O Omni Router **EXISTE E RODA** local (porta 8099).

## Lição Central: #ACORDAR = MEDIR ANTES DE ASSUMIR

### O que errei (pitfall Master Funnel)
1. Disse "Omni Router não existe" → **MENTIRA** — `curl http://127.0.0.1:8099/health` prova que roda
2. Disse "site local ≠ site VPS" → **MENTIRA** — mesmo projeto, mesmo repo, deploy VPS já no ar
3. Não verifiquei GitHub antes de falar: `gh pr list`, `gh run list`, `gh api repos/.../contents`
4. Assumi que Bolt App precisava "subir" sem checar lockfile (`pnpm-lock.yaml` tem duplicate key `@remix-run/dev`)

### Padrão Correto (o que o usuário exige — já está no skill como AUTO-BOOT)
```bash
# ANTES de qualquer afirmação sobre estado:
gh pr list --limit 20
gh run list --limit 10
gh api repos/ServerVpss/CentralDark/contents/<path>
curl <endpoint>  # prova real de runtime
git log --oneline -5
git status
```

### Evidências coletadas nesta sessão
| Comando | Resultado | Prova |
|---------|-----------|-------|
| `curl http://127.0.0.1:8099/health` | 200 OK, engines: nous+claude-code | Omni Router VIVO |
| `curl https://centralldark.com` | 200 OK, Cloudflare | Portal VPS no ar |
| `curl https://telepainel.centralldark.com/dashboard` | 200 OK | TelePainel no ar |
| `curl https://api.centralldark.com/v1/models` | 200 OK, 200+ modelos | Arsenal/Abacus Router VPS |
| `gh pr list` | PR #1438 aberto (ADM comando universal) | GitHub state |
| `gh run list` | Autonomia promoção pending/queued | CI state |
| `cat apps/modulos/elite-gateway/scripts/centraldark_omni_router.py` | 872 linhas, v0.3.0 | Arquivo existe |
| `cat apps/modulos/Bolt/source/package.json` | name: centraldark-desktop, scripts: dev/build/electron | Bolt App config |
| `pnpm install --frozen-lockfile` | **FAIL**: `ERR_PNPM_BROKEN_LOCKFILE` duplicate `@remix-run/dev` | Lockfile corrompido |

### Ação corretiva para próxima sessão
1. **Fixar lockfile** do Bolt: `pnpm install --no-frozen-lockfile` ou editar `pnpm-lock.yaml` removendo entrada duplicada linha 375
2. **Subir Bolt local**: `npm run dev` em `apps/modulos/Bolt/source/`
3. **Configurar Omni Router completo**: criar `.env` com TODAS keys reais (Abacus, OpenAI se tiver, etc.) e reiniciar router
4. **Persistir no motor**: PM2/ecosystem para boot automático

### Regra de Ouro reforçada
> **NUNCA ASSUMIR: DECLARED=INSTALLED, LOCKED=INSTALLED, INSTALLED=WORKING, BUILD_STARTED=BUILD_PASS, LOCAL=REMOTE, HISTORY=CURRENT_STATE**
>
> **SEMPRE MEDIR: curl, gh, git, cat, node --check ANTES DE FALAR**

### Conexão com SEARCH_BEFORE_ASK / DO_NOT_ASK_USER_FOR_DISCOVERABLE_STATE (já no skill)
Se a pergunta que o agente está prestes a fazer É MENSURÁVEL por ferramenta (git/terminal/gh/ssh/vision), **NÃO PERGUNTE — MEÇA**.
- Ex: "o que significa tic-tac?" → NÃO perguntar, é intenção dada
- "devo medir GitHub?" → NÃO perguntar, é obrigação
- "está autorizado?" → se a ordem atual cobre, NÃO reask

---

**Fixed Point desta lição**: `FIXED_POINT=TRUE` — padrão de verificação medido, registrado e contraprovado.