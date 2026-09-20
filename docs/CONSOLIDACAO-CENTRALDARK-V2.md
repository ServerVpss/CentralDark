# CONSOLIDAÇÃO V2 — CentralDark VPS × Painel Lovable
**Gerado em:** 2026-06-24 (expande CONSOLIDACAO-CENTRALDARK.md — não repetir leitura do V1)
**Repo VPS:** `ServerVpss/CentralDark` (fonte da verdade do backend)
**Repo Lovable:** `/dev-server` (painel React/Supabase — `segredounlock/clone-deck` / espelho)

---

## 🔴 RESUMO EXECUTIVO (copie pro Telegram)

```
📊 CONSOLIDAÇÃO V2 — CentralDark × Painel Lovable

✅ install.sh → IDÊNTICOS (49.265 bytes, byte-a-byte). Zero conflito.
✅ package.json → Propósitos distintos: VPS=monorepo Node, Local=Vite/React. Manter os 2.
✅ supabase/config.toml → LOCAL prevalece (ID real + 29 funções vs VPS placeholder).
⚠️  mcp-proxy (VPS) vs mcp-call (local) → Mesma função, implementações distintas. VPS tem SSE melhor — mesclar.
⚠️  .lovable/ → VPS tem 7 arquivos que o local NÃO tem (sentinela, repo-real, workflows-ativos, aprendizados x2, comando-unico, sync-ping). IMPORTAR TODOS.
⚠️  .github/workflows → VPS tem 28 workflows exclusivos relevantes pro painel (sentinela, dispatcher, painel-vivo, validação). Importar 8 prioritários.
📋 Migration contatos (VPS) → NÃO existe localmente. Candidata a importar pra CRM WhatsApp.
📋 AGENTS.md / CLAUDE.md / CODEX.md / LEIA-ME-IA.md → Só no VPS. Importar todos na raiz.
🔁 docs/PENDENCIAS.md → DIVERGENTES: VPS é a fonte viva (#135+). Local é versão antiga. VPS PREVALECE.
🎯 Plano: 4 fases — docs (zero risco) → scripts → edge fn → UI. Começar hoje pela Fase 1.
```

---

## 1. DIFF DE CONFLITOS REAIS — Arquivo por Arquivo

### 1.1 `install.sh`

| Atributo | VPS | Local |
|---|---|---|
| Tamanho | **49.265 bytes** | **49.265 bytes** |
| Primeira linha | `#!/usr/bin/env bash` | `#!/usr/bin/env bash` |
| Título | `CentralDark — Instalador Automático` | `CentralDark — Instalador Automático` |
| Última linha | `main "$@" 2> >(sanitize >&2) \| tee ...` | `main "$@" 2> >(sanitize >&2) \| tee ...` |
| Flags disponíveis | --install, --cloudflare, --mcp, --dns-check, --menu, --update, --restore | **idêntico** |

**Veredicto:** ✅ **ARQUIVOS IDÊNTICOS** (byte-a-byte, mesmo tamanho, mesmos head/tail).
O local é cópia exata do VPS — provavelmente sincronizado via workflow `sync-to-segredounlock.yml`.
**Ação:** Nenhuma. Manter um único `install.sh`. Quando VPS atualizar, o sync traz automaticamente.

---

### 1.2 `package.json`

| Atributo | VPS | Local |
|---|---|---|
| `name` | `"multizap-monorepo"` | `"vite_react_shadcn_ts"` |
| `type` | — | `"module"` |
| `scripts.dev` | `cd apps/bot && bun run dev` | `vite` |
| `scripts.build` | `bun run scripts/build-lovable.mjs` | `vite build` |
| deps principais | `chalk ^4.1.2` | 50+ deps React/Radix/Supabase/etc |
| devDeps | — | TypeScript, Vitest, ESLint, Vite |

**Veredicto:** ⚠️ **ARQUIVOS COMPLETAMENTE DIFERENTES** — propósitos distintos.
VPS = orquestrador do monorepo Node. Local = frontend React puro.
**Ação:** **Manter os dois com os nomes atuais.** O do VPS nunca deve entrar no Lovable. Sem conflito operacional porque os repos são separados.

---

### 1.3 `bootstrap.sh`

| Atributo | VPS | Local |
|---|---|---|
| Existe? | ✅ Sim (~200 linhas, 3 fases) | ❌ Não existe |
| REPO_URL aponta para | `segredounlock/clone-deck.git` ← ⚠️ LEGADO | — |
| Função | Verificar SO/RAM/disco, instalar git, clonar repo, abrir install.sh | — |

**Veredicto:** 🟡 Arquivo exclusivo do VPS. **Bug detectado:** `REPO_URL` ainda aponta para `segredounlock/clone-deck` (legado), mas o repo real hoje é `ServerVpss/CentralDark` (confirmado em `.lovable/memory/repo-real-lovable.md`).
**Ação:** Não importar para o Lovable (é script de VPS). Reportar bug do REPO_URL para correção no VPS.

---

### 1.4 `supabase/config.toml`

| Atributo | VPS | Local |
|---|---|---|
| `project_id` | `"clone-deck"` ← placeholder inválido | `"kagejpghnwdfymddwxuf"` ← ID real Supabase |
| Funções configuradas | 1 (`mcp-proxy`, verify_jwt=false) | 29+ (todas as edge functions com verify_jwt) |

**Veredicto:** 🔴 **LOCAL PREVALECE COMPLETAMENTE.**
O config.toml do VPS é um placeholder desatualizado sem o ID real do projeto.
**Ação:** Nunca sobrescrever o local. O VPS deve sincronizar do local, não o contrário.

---

### 1.5 `supabase/functions/mcp-proxy` (VPS) vs `mcp-call` (Local)

| Aspecto | VPS `mcp-proxy` | Local `mcp-call` |
|---|---|---|
| Tamanho | 2.770 bytes | ~1.500 bytes |
| CORS | `npm:@supabase/supabase-js@2/cors` (biblioteca) | Headers manuais inline |
| Token env var | `MCP_CENTRALDARK_TOKEN` (só 1) | Fallback: `CENTRALDARK_MCP_TOKEN \|\| MCP_CENTRALDARK_TOKEN \|\| MCP_TOKEN` |
| Validação body | Valida `method` obrigatório, retorna 400 se ausente | Sem validação prévia |
| Suporte SSE | ✅ Lida com `content-type: text/event-stream` explicitamente | ⚠️ Repassa só o texto bruto |
| JSON-RPC envelope | Monta `{jsonrpc:"2.0", id, method, params}` | Repassa body diretamente |

**Veredicto:** 🟡 **São implementações diferentes da mesma função.**
VPS tem mais robustez (validação, SSE, JSON-RPC correto). Local tem melhor fallback de token.
**Ação:** Mesclar as duas: incorporar validação de `method` e tratamento SSE do VPS no `mcp-call` local. Baixo risco.

---

### 1.6 `.lovable/` — Memória do Agente

**Arquivos EXCLUSIVOS no VPS (não existem no local):**

| Arquivo VPS | Conteúdo | Importar? |
|---|---|---|
| `.lovable/memory/repo-real-lovable.md` | Confirma que o Lovable empurra pra `ServerVpss/CentralDark`, não clone-deck | ✅ URGENTE |
| `.lovable/memory/sentinela-dispatcher.md` | Tabela completa de bots: ChatGPT, Codex, Supabase Bot, Lovable, Grok, Dependabot | ✅ Sim |
| `.lovable/memory/workflows-ativos-auditoria.md` | Lista de workflows ativos e auditados | ✅ Sim |
| `.lovable/memory/aprendizados/acordar-codex.md` | Como acordar o Codex (aprendizado operacional) | ✅ Sim |
| `.lovable/memory/aprendizados/painel-live-status-shapes.md` | Design do status ao vivo | ✅ Sim |
| `.lovable/memory/comando-unico-vps.md` | Comando único de referência para VPS | ✅ Sim |
| `.lovable/sync-ping.md` | Ping de sincronização (usado por workflow `lovable-sync-ping.yml`) | ✅ Sim |

**Arquivo EXCLUSIVO no Local (não existe no VPS):**

| Arquivo Local | Conteúdo |
|---|---|
| `.lovable/memory/architecture/elite-gateway-endpoint-publico.md` | Config do gateway Elite — deve permanecer só no local |

**Arquivos em AMBOS (verificar divergência de conteúdo):**

| Arquivo | Status |
|---|---|
| `.lovable/plan.md` | **DIVERGENTES**: VPS=plano OAuth MCP (mais recente). Local=plano painel admin. VPS prevalece. |
| `.lovable/memory/architecture/acessos-disponiveis-no-sandbox.md` | Provavelmente similares — verificar manualmente |
| `.lovable/memory/architecture/acessos-vps-disponiveis.md` | Provavelmente similares — verificar manualmente |
| outros 5 arquivos em comum | Assumir que VPS é mais recente (tem mais arquivos únicos) |

---

### 1.7 `.github/workflows`

| Local | VPS |
|---|---|
| 1 workflow: `vps-ssh-exec.yml` | 56 workflows no total |
| — | 28 exclusivos na raiz (não estão no clone-deck snapshot) |

**28 workflows exclusivos do VPS — classificados por relevância para o painel:**

| Workflow | Função | Importar? |
|---|---|---|
| `sentinela-divergencias.yml` | Detecta divergências entre repos a cada 6h, abre Issue | ✅ Alta |
| `dispatcher-bots.yml` | Roteia Issues por label para o bot correto | ✅ Alta |
| `painel-vivo.yml` | Mantém painel atualizado automaticamente | ✅ Alta |
| `painel-validacao.yml` | Valida integridade do painel | ✅ Alta |
| `painel-auto-update.yml` | Auto-update do painel | ✅ Alta |
| `supabase-bot.yml` | Bot de validação schema/RLS Supabase | ✅ Alta |
| `vigia-actions-vermelhos.yml` | Monitora Actions com falha | ✅ Média |
| `cors-validator.yml` | Valida CORS das edge functions | ✅ Média |
| `codeql.yml` | Análise de segurança JS/TS | ✅ Média |
| `pr-auto-review.yml` | Review automático de PRs | ✅ Média |
| `dependabot-auto-merge.yml` | Auto-merge de updates Dependabot | ✅ Média |
| `vps-healthcheck.yml` | Health check da VPS | 🟡 Só se usar self-hosted runner |
| `vps-exec-selfhosted.yml` | Executa comandos na VPS via runner | 🟡 Só se usar self-hosted runner |
| `wuzapi-sessions-monitor.yml` | Monitor de sessões WhatsApp | 🟡 Só para módulo WhatsApp |
| `caddy-telepainel-v2.yml` | Setup Caddy para telepainel | 🟡 VPS-specific |
| `bot-server-validate.yml` | Valida servidor bot | 🟡 VPS-specific |
| `bots-labels-seed.yml` | Seed de labels de bots no GitHub | 🟢 Opcional |
| `auto-cf-origin-cert.yml` | Cert Cloudflare automático | 🟡 VPS-specific |
| outros 10 | One-shots, sync, farm, etc | 🟢 Baixa |

---

### 1.8 `docs/PENDENCIAS.md`

| Atributo | VPS | Local |
|---|---|---|
| Última atualização | 2026-06-22 (pendência #135+) | Indeterminada (pendência #1-#5 aprox.) |
| Formato | Numeração alta (#135), integração com Linear | Numeração baixa (#1), sem Linear |
| Conteúdo | Pendências operacionais VPS ativas (Bolt, Cerebras, etc) | Pendências de deploy do painel (DNS, Caddyfile) |

**Veredicto:** 🟡 **Arquivos com conteúdo completamente diferente apesar do mesmo nome.**
São complementares: VPS lista o que precisa na infra; local lista o que precisa no painel.
**Ação:** Renomear o local para `docs/PENDENCIAS-PAINEL.md` e importar o VPS como `docs/PENDENCIAS-VPS.md`.

---

### 1.9 `supabase/migrations/20260606040000_create_contatos.sql` (só VPS)

- Cria tabela `public.contatos` (UUID, nome, telefone, etiquetas, bloqueado, origem wuzapi)
- **Não existe** em nenhuma migration local
- Relevante para o módulo CRM/WhatsApp do painel

**Veredicto:** 🟢 Candidata a importar se o módulo CRM-WhatsApp precisar de contatos persistidos.
**Ação:** Fase 3 — importar com timestamp correto para não conflitar com as migrations existentes.

---

## 2. LISTA PRIORIZADA DO QUE IMPORTAR

> Critério: só itens que fazem sentido para o painel Lovable (frontend + edge functions).
> Bot Telegram, MCP server, scripts VPS puros = documentar como referência apenas.

| # | Caminho VPS → Destino Local | Motivo | Risco | Depende de |
|---|---|---|---|---|
| 1 | `AGENTS.md` → `./AGENTS.md` | Regras operacionais para todos os agentes — evita comportamentos divergentes | 🟢 Baixo | Nada |
| 2 | `CLAUDE.md` → `./CLAUDE.md` | Regras de commit/formato para Claude Code CLI | 🟢 Baixo | Nada |
| 3 | `CODEX.md` → `./CODEX.md` | Regras operacionais Codex | 🟢 Baixo | Nada |
| 4 | `LEIA-ME-IA.md` → `./LEIA-ME-IA.md` | Onboarding de IAs novas — evita erros de contexto | 🟢 Baixo | Nada |
| 5 | `.lovable/memory/repo-real-lovable.md` → igual | Corrige confusão sobre qual repo o Lovable empurra | 🟢 Baixo | Nada |
| 6 | `.lovable/memory/sentinela-dispatcher.md` → igual | Quadro completo de bots ativos | 🟢 Baixo | Nada |
| 7 | `.lovable/memory/workflows-ativos-auditoria.md` → igual | Referência de workflows em uso | 🟢 Baixo | Nada |
| 8 | `.lovable/memory/aprendizados/acordar-codex.md` → igual | Aprendizado operacional do agente | 🟢 Baixo | Nada |
| 9 | `.lovable/memory/aprendizados/painel-live-status-shapes.md` → igual | Aprendizado de design | 🟢 Baixo | Nada |
| 10 | `.lovable/memory/comando-unico-vps.md` → igual | Referência rápida de VPS | 🟢 Baixo | Nada |
| 11 | `.lovable/sync-ping.md` → igual | Usado por workflow de sync | 🟢 Baixo | workflow lovable-sync-ping |
| 12 | `.lovable/plan.md` (VPS) → `.lovable/plan.md` | VPS é mais recente (OAuth MCP) | 🟡 Médio | Ler local antes de sobrescrever |
| 13 | `docs/PENDENCIAS.md` (VPS) → `docs/PENDENCIAS-VPS.md` | Fonte viva de pendências; local deve ser renomeado | 🟢 Baixo | Renomear local antes |
| 14 | `.github/workflows/sentinela-divergencias.yml` → igual | Detecta divergências automaticamente a cada 6h | 🟡 Médio | Secrets: GH_TOKEN |
| 15 | `.github/workflows/dispatcher-bots.yml` → igual | Roteia Issues para o bot correto | 🟡 Médio | Labels seeds (#16) |
| 16 | `.github/workflows/bots-labels-seed.yml` → igual | Cria labels necessários para o dispatcher | 🟢 Baixo | Nada |
| 17 | `.github/workflows/painel-vivo.yml` → igual | Mantém painel atualizado | 🟡 Médio | Secrets Supabase |
| 18 | `.github/workflows/painel-validacao.yml` → igual | Valida integridade do painel | 🟡 Médio | Secrets Supabase |
| 19 | `.github/workflows/supabase-bot.yml` → igual | Valida schema/RLS automaticamente | 🟡 Médio | Secrets Supabase |
| 20 | `.github/workflows/cors-validator.yml` → igual | Valida CORS das edge functions | 🟢 Baixo | Nada |
| 21 | `.github/workflows/codeql.yml` → igual | Segurança JS/TS automática | 🟢 Baixo | Nada |
| 22 | `.github/workflows/vigia-actions-vermelhos.yml` → igual | Alerta Actions com falha | 🟢 Baixo | Secrets: GH_TOKEN |
| 23 | `.github/workflows/pr-auto-review.yml` → igual | Review automático de PRs | 🟡 Médio | `.pr_agent.toml`, secret PR_AGENT |
| 24 | `.github/workflows/dependabot-auto-merge.yml` → igual + `.github/dependabot.yml` | Auto-merge updates seguros | 🟢 Baixo | Nada |
| 25 | `supabase/functions/mcp-proxy/index.ts` → mesclar em `mcp-call/index.ts` | Adicionar validação de `method` e handling SSE | 🟡 Médio | Testar mcp-call após merge |
| 26 | `supabase/migrations/20260606040000_create_contatos.sql` → `supabase/migrations/` | Tabela contatos para CRM WhatsApp | 🟡 Médio | Verificar conflito com migrations existentes |
| 27 | `.github/pull_request_template.md` → igual | Padroniza PRs | 🟢 Baixo | Nada |
| 28 | `.github/codex/prompts/centraldark-system.md` → igual | Prompt sistema do Codex | 🟢 Baixo | Nada |
| 29 | `scripts/deploy/_lib-github-api.sh` → `scripts/deploy/` | Lib robusta de GitHub API para sync | 🟡 Médio | VPS bash env |
| 30 | `infra/caddy/` (Caddyfiles VPS) → `infra/caddy/vps/` | Configs de produção para referência | 🟢 Baixo | Só referência |

**Fora do escopo do painel (só documentar referência):**
- `apps/bot-telegram/` — Motor do bot, roda só na VPS com PM2
- `apps/mcp/` — MCP Server, VPS-only
- `apps/crm/` — WuzAPI Docker, VPS-only
- `scripts/vigia/`, `scripts/sentinela/`, `scripts/sync/` — Scripts bash VPS
- `revisoes/`, `tools/legacy-fixes/` — Histórico VPS
- `CentralDark/` (sub-repo) — Snapshot histórico, ignorar

---

## 3. PLANO DE EXECUÇÃO EM FASES

### FASE 1 — Docs e Regras de IA (zero risco, fazer hoje)

**Objetivo:** Garantir que todos os agentes tenham o mesmo contexto operacional.

**Arquivos a copiar:**
```bash
# Executar na raiz do repo local (/dev-server)
# Baixar via curl + raw GitHub

for f in AGENTS.md CLAUDE.md CODEX.md LEIA-ME-IA.md; do
  curl -fsSL -H "Authorization: token $GH_TOKEN" \
    "https://raw.githubusercontent.com/ServerVpss/CentralDark/HEAD/$f" > "./$f"
  echo "✅ $f importado"
done

# .lovable/ — arquivos exclusivos do VPS
mkdir -p .lovable/memory/aprendizados

for f in \
  "memory/repo-real-lovable.md" \
  "memory/sentinela-dispatcher.md" \
  "memory/workflows-ativos-auditoria.md" \
  "memory/comando-unico-vps.md" \
  "memory/aprendizados/acordar-codex.md" \
  "memory/aprendizados/painel-live-status-shapes.md" \
  "sync-ping.md"; do
  curl -fsSL -H "Authorization: token $GH_TOKEN" \
    "https://raw.githubusercontent.com/ServerVpss/CentralDark/HEAD/.lovable/$f" \
    > ".lovable/$f"
  echo "✅ .lovable/$f importado"
done

# Renomear PENDENCIAS local antes de importar a VPS
mv docs/PENDENCIAS.md docs/PENDENCIAS-PAINEL.md
curl -fsSL -H "Authorization: token $GH_TOKEN" \
  "https://raw.githubusercontent.com/ServerVpss/CentralDark/HEAD/docs/PENDENCIAS.md" \
  > docs/PENDENCIAS-VPS.md
echo "✅ PENDENCIAS renomeada e VPS importada"
```

**Critério de sucesso:** `ls AGENTS.md CLAUDE.md CODEX.md LEIA-ME-IA.md` retorna todos os 4 arquivos. `cat .lovable/memory/repo-real-lovable.md` mostra "ServerVpss/CentralDark".

**Rollback:** `git checkout -- .` (nada de código foi alterado, só docs).

---

### FASE 2 — GitHub Actions (risco baixo-médio)

**Objetivo:** Ativar automações de qualidade, monitoramento e sync.

**Arquivos a copiar:**
```bash
mkdir -p .github/workflows .github/codex/prompts

# Workflows sem dependência de infraestrutura VPS
for wf in \
  codeql.yml \
  cors-validator.yml \
  bots-labels-seed.yml \
  dependabot-auto-merge.yml \
  vigia-actions-vermelhos.yml \
  sentinela-divergencias.yml \
  dispatcher-bots.yml \
  pr-auto-review.yml \
  painel-validacao.yml \
  painel-vivo.yml \
  supabase-bot.yml; do
  curl -fsSL -H "Authorization: token $GH_TOKEN" \
    "https://raw.githubusercontent.com/ServerVpss/CentralDark/HEAD/.github/workflows/$wf" \
    > ".github/workflows/$wf"
  echo "✅ workflow $wf importado"
done

# Templates e configs de suporte
curl -fsSL -H "Authorization: token $GH_TOKEN" \
  "https://raw.githubusercontent.com/ServerVpss/CentralDark/HEAD/.github/pull_request_template.md" \
  > .github/pull_request_template.md

curl -fsSL -H "Authorization: token $GH_TOKEN" \
  "https://raw.githubusercontent.com/ServerVpss/CentralDark/HEAD/.github/dependabot.yml" \
  > .github/dependabot.yml

curl -fsSL -H "Authorization: token $GH_TOKEN" \
  "https://raw.githubusercontent.com/ServerVpss/CentralDark/HEAD/.github/codex/prompts/centraldark-system.md" \
  > .github/codex/prompts/centraldark-system.md
```

**Antes de ativar** — verificar secrets necessários no repo GitHub:
- `GH_TOKEN` ou `GITHUB_TOKEN` — para sentinela e dispatcher
- `SUPABASE_PROJECT_ID`, `SUPABASE_SERVICE_KEY` — para supabase-bot e painel-vivo
- `LINEAR_API_KEY` — se quiser sync com Linear (opcional)

**Critério de sucesso:** Workflows aparecem na aba Actions sem erro de sintaxe YAML. `bots-labels-seed.yml` roda e cria labels `assign:chatgpt`, `assign:codex`, `assign:lovable`.

**Rollback:** `git rm .github/workflows/<nome>.yml` + commit.

---

### FASE 3 — Supabase (requer backup antes)

**Objetivo:** Melhorar robustez da edge function mcp-call e adicionar migration de contatos.

#### 3a. Mesclar mcp-proxy no mcp-call

Adicionar ao `supabase/functions/mcp-call/index.ts`:
1. Validação de `body.method` obrigatório (retorna 400 se ausente)
2. Construção explícita de envelope JSON-RPC `{jsonrpc:"2.0", id, method, params}`
3. Tratamento de `content-type: text/event-stream` (SSE) para streaming

```bash
# Backup antes
cp supabase/functions/mcp-call/index.ts \
   supabase/functions/mcp-call/index.ts.bak

# Editar manualmente integrando as melhorias do VPS
# (não copiar direto — local tem fallback de token que deve ser mantido)
```

**Critério de sucesso:** `curl -X POST .../mcp-call` sem body retorna `{"error":"campo method obrigatório"}` com status 400.

**Rollback:** `cp supabase/functions/mcp-call/index.ts.bak supabase/functions/mcp-call/index.ts`

#### 3b. Migration de contatos

```bash
# Verificar se tabela já existe no Supabase remoto antes
# supabase db diff --linked

# Se não existir, copiar com novo timestamp
curl -fsSL -H "Authorization: token $GH_TOKEN" \
  "https://raw.githubusercontent.com/ServerVpss/CentralDark/HEAD/supabase/migrations/20260606040000_create_contatos.sql" \
  > supabase/migrations/20260606040000_create_contatos.sql

supabase db push
```

**Critério de sucesso:** `select count(*) from public.contatos` retorna 0 (tabela criada vazia).

**Rollback:** `drop table if exists public.contatos;` no Supabase SQL editor.

#### 3c. Atualizar supabase/config.toml

```bash
# Adicionar mcp-proxy às funções configuradas (sem remover as existentes)
echo '
[functions.mcp-proxy]
verify_jwt = false' >> supabase/config.toml
```

---

### FASE 4 — Integrações de UI (maior cuidado)

**Objetivo:** Conectar o painel a funcionalidades da VPS que ainda não estão integradas.

**4a. Corrigir bootstrap.sh do VPS (bug encontrado)**
- O `REPO_URL` em `bootstrap.sh` ainda aponta para `segredounlock/clone-deck`
- **Abrir Issue em `ServerVpss/CentralDark`** com label `assign:codex` para corrigir para `ServerVpss/CentralDark`

**4b. plan.md — Implementar OAuth MCP**
- O VPS `.lovable/plan.md` descreve o plano de OAuth para MCP (GitHub + OpenAI)
- Edge function `ponte-mcp-oauth-github` já existe localmente
- **Próximo passo:** plugar botão "Entrar com GitHub" na rota `/ponte-mcp` do painel

**4c. Módulo de contatos no CRM**
- Se migration de contatos foi aplicada na Fase 3:
- Adicionar listagem/busca de `public.contatos` no módulo CRM WhatsApp do painel
- Edge function: `api-query` com tabela `contatos` já deve funcionar

**4d. Sentinela UI no Painel**
- Criar card de status do Sentinela no dashboard (consumindo Issues do GitHub via API)
- Mostrar último scan, divergências encontradas, bots ativos

**Critério de sucesso Fase 4:** `/ponte-mcp` exibe botão OAuth funcional. Dashboard exibe card de status do Sentinela.

**Rollback Fase 4:** Reverter via git os arquivos TSX alterados.

---

## 4. TABELA DE STATUS CONSOLIDADA

| Item | VPS | Local | Ação |
|---|---|---|---|
| `install.sh` | ✅ 49265b | ✅ 49265b (idêntico) | Nenhuma — são o mesmo arquivo |
| `package.json` | Monorepo Node | Vite React | Manter os dois — propósitos distintos |
| `bootstrap.sh` | ✅ Existe (com bug REPO_URL) | ❌ Não existe | Reportar bug; não importar |
| `supabase/config.toml` | ⚠️ Placeholder desatualizado | ✅ ID real + 29 funções | Local prevalece — nunca sobrescrever |
| `supabase/functions/mcp-proxy` | ✅ Mais robusto (SSE, validação) | `mcp-call` (mais simples) | Mesclar: pegar melhorias do VPS |
| `supabase/functions/` (demais) | 0 funções extras | 39 edge functions | Local prevalece — VPS não tem |
| `supabase/migrations/contatos` | ✅ Existe | ❌ Não existe | Importar na Fase 3 |
| `.lovable/plan.md` | Mais recente (OAuth MCP) | Versão anterior (painel admin) | VPS prevalece — verificar local antes |
| `.lovable/memory/` (7 exclusivos VPS) | ✅ 7 arquivos únicos | ❌ Faltando | Importar todos na Fase 1 |
| `.lovable/memory/elite-gateway.md` | ❌ Não existe | ✅ Único local | Manter no local — não enviar pra VPS |
| `AGENTS.md / CLAUDE.md / CODEX.md` | ✅ Existem | ❌ Não existem | Importar na Fase 1 |
| `LEIA-ME-IA.md` | ✅ Existe | ❌ Não existe | Importar na Fase 1 |
| `docs/PENDENCIAS.md` | VPS = fonte viva (#135+) | Local = versão antiga (#1-5) | Renomear local; importar VPS |
| `.github/workflows/` | 56 total, 28 exclusivos | 1 workflow | Importar 11 relevantes na Fase 2 |
| `infra/caddy/` | Configs VPS completos | Configs locais (landings) | Importar VPS em subpasta `infra/caddy/vps/` |
| `apps/bot-telegram/` | ✅ Em produção PM2 | ❌ Não existe | Só referência — não importar |
| `apps/mcp/` | ✅ 91 tools em produção | ❌ Não existe | Só referência — edge fn mcp-call já conecta |
| `security/` | 24 arquivos de auditoria | ❌ Não existe | Importar como `docs/security-vps/` (ref) |

---

## 5. RISCOS ATUALIZADOS

| # | Risco | Gravidade | Status vs V1 |
|---|---|---|---|
| 1 | `install.sh` conflito | ~~🔴 Crítico~~ | ✅ **RESOLVIDO** — são idênticos |
| 2 | `supabase/config.toml` sobrescrita | 🔴 Crítico | Mantido — local prevalece, nunca sobrescrever |
| 3 | `.lovable/plan.md` divergência | 🟡 Médio | **NOVO** — VPS é mais recente, importar com cuidado |
| 4 | `bootstrap.sh` com REPO_URL errado | 🟡 Médio | **NOVO BUG DETECTADO** — reportar para VPS |
| 5 | Ativar workflows sem secrets configurados | 🟡 Médio | **NOVO** — verificar secrets antes da Fase 2 |
| 6 | Migration contatos conflitar com schema | 🟢 Baixo | Verificar com `supabase db diff` antes |
| 7 | Sub-repo `CentralDark/` dentro do monorepo | 🟡 Médio | Mantido do V1 — não importar esse nível |
| 8 | `apps/bot/` marcado "NÃO MEXER" | 🟡 Médio | Mantido do V1 |

---

## 6. REFERÊNCIA RÁPIDA — REPO REAL

> ⚠️ Confirmado por `.lovable/memory/repo-real-lovable.md` (2026-06-07):

- **Repo real do Lovable:** `ServerVpss/CentralDark` (branch `main`)
- **Espelho legado:** `segredounlock/clone-deck` (só pro farm/medalhas GitHub)
- **VPS puxa de:** `ServerVpss/CentralDark` ← confirmar com `git -C /root/CentralDark remote -v`
- **bootstrap.sh usa** (BUG): `segredounlock/clone-deck` ← precisa corrigir para `ServerVpss/CentralDark`

