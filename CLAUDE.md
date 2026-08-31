---
title: "CLAUDE.md"
date: 2026-08-24
updated: 2026-08-29T17:10:00-03:00
status: DERIVED_VIEW
tags: [boot, contrato, claude, ponte]
category: "A-Agentes"
sensitivity: INTERNAL
source: AGENTS.md + LEIA-ME-IA.md
source_class: INTERNAL
source_rule: "CANONICO -> ARTEFATO; artefato nao inventa canonico"
owner: AGENTS.md
consumer: Claude Code / engines Claude
---

# CLAUDE.md — ponte para o contrato canônico

Este arquivo **não** é segundo cérebro nem contrato paralelo.

```text
CANONICAL_BOOT = LEIA-ME-IA.md
CANONICAL_AGENTS = AGENTS.md
TRIGGER_FABRIC = docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/
ARTIFACT_PROPERTIES = docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ARTIFACT-PROPERTIES.yml
```

Antes de agir:

1. Ler `LEIA-ME-IA.md`
2. Ler `AGENTS.md`
3. Medir branch/HEAD/PR/writer/tools
4. Emitir `CENTRALDARK_AI_BOOT` uma vez
5. Todo material entra no moinho canônico; não criar memória/governança paralela
6. Artefato derivado sem propriedades obrigatórias **não** é `FLASH_READY`

```text
ENGINE=CLAUDE
ENGINE_IS_OWNER=false
COPY_BRAIN=false
SEGREDO/CHEFE > SOL > PIVETE/HERMES
```

## Claude ↔ subagentes, sem inversão de autoridade

```text
SUBAGENT_ROOT=.claude/agents
CLAUDE_DISCOVERS_SUBAGENTS=true
SUBAGENTS_INHERIT_CLAUDE_BRIDGE=true
SUBAGENTS_INHERIT_CANONICAL_CORE=true
SUBAGENTS_ARE_CAPABILITY_ADAPTERS=true
SUBAGENT_IS_AUTHORITY=false
CAPABILITY_SELECTION_OWNER=.agents/skills/capability-contract-router/SKILL.md
DELEGATION_OWNER=scripts/agent-call.mjs
PROVIDER_LOCAL_MEMORY_ROLE=WORKING_CACHE_ONLY
PROVIDER_LOCAL_MEMORY_IS_CANONICAL=false
```

O “vice-versa” é descoberta de capacidade e handoff: Claude pode localizar subagentes especializados; todo subagente Claude volta por esta ponte ao core. Nem Claude nem subagente redefine intenção, autoridade, owner, Writer, memória canônica ou Judge.

## Assinatura de adapter fino

```text
CANONICAL_AGENT_CORE=LEIA-ME-IA.md
ONE_SOL=true
ONE_CORE=true
LAZY_LOAD_BY_DEMAND=true
ENGINE_IS_REPLACEABLE=true
TOOLS_REQUIRE_RUNTIME_MEASUREMENT=true
DO_NOT_DUPLICATE_GOVERNANCE=true
DO_NOT_DEFINE_IDENTITY=true
DO_NOT_DEFINE_AUTHORITY=true
DO_NOT_DEFINE_MERGE_POLICY=true
DO_NOT_DEFINE_MEMORY=true
DO_NOT_CREATE_PARALLEL_AGENT=true
FUTURE_RULES_CONSUMED_FROM_CORE=true
```

## Padrão Multi-Agente — Todas as Interfaces

Este CLAUDE.md é ponte para o canônico e padrão único para **Claude Code, Hermes (VPS), CLI, MCP servidores, GitHub Actions, Telegram bots, WebUI**. Nenhum agente inventa governo paralelo.

```text
AGENTS_COVERED: Claude Code, Hermes, API, MCP, GitHub, CLI, CI/CD, future engines
SOURCE_OF_TRUTH: ServerVpss/CentralDark @ GitHub
GOVERNING_SOUL: docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md
FREQUENCY_RULES: docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/FREQUENCIAS-OPERACIONAIS-SOL.md
ONE_WRITER_PER_SCOPE: true
REALITY_JUDGE: measured_evidence > assumptions
UNKNOWN_IS_NOT_PASS: true
```

## Boot Obrigatório (Todos os Agentes)

**Ordem imutável:**
1. `LEIA-ME-IA.md` — entrada única
2. `AGENTS.md` — contrato operacional
3. `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md` — identidade
4. `docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json` — reúso obrigatório

Emitir uma vez `CENTRALDARK_AI_BOOT` de `LEIA-ME-IA.md` (linhas 112–128).

## MCP Servidores & Conectores

- **screenpipe-mcp** — observabilidade (recordings, frames, activity). Status: bloqueado (bunx cache); workaround: CLI `screenpipe-app.exe` ou dados diretos
- **GitHub MCP** — PR/issue/workflow automation
- **Supabase** — schema, migrations, edge functions
- **Skill customizadas** — `.agents/skills/<name>/SKILL.md`
- **Meta-Lupa** — validação crítica (falsificação); `.agents/skills/meta-lupa/SKILL.md`
- **Git Conflict Resolve** — único padrão; `.agents/skills/git-conflict-resolve-house-standard/`

## GitHub Integração & Fluxo

```
main (estável) ← reconciliacao/casa-* (work branch) ← feature (efêmero)
```

- **Origem:** `ServerVpss/CentralDark`
- **Workflows:** `.github/workflows/` — CI, merge automation
- **Dependabot:** Auto-conflict via `.agents/skills/git-conflict-resolve-house-standard/`
- **Branches:** sempre `git status` antes de agir; `git fetch origin` + `git pull origin main` para sync
- **Commits:** incluir `Co-Authored-By: [agent] <noreply@...>`

## Comandos Padrão (Dev + VPS)

**Build/Test:**
```bash
npm run build       npm run dev       npm test       npm run lint
```

**Git:**
```bash
git status          git log --oneline -10       git fetch origin       git pull origin main
```

**PM2 (VPS Hermes Runtime):**
```bash
pm2 list            pm2 logs <id>       pm2 restart <id>       # NUNCA restart all
pm2 stop 1          # WhatsApp — deixar STOPPED
```

**MCP Health:**
```bash
curl -s http://localhost:9100/health       # MCP server
screenpipe-app.exe --version               # Screenpipe CLI
```

## Arquitetura & Estrutura

```
LEIA-ME-IA.md, AGENTS.md, CLAUDE.md     — Botas canônicas
.agents/skills/                          — Capacidades reutilizáveis
.claude/                                 — Claude Code config local
docs/CONSCIENCIA/                        — Identidade, valores, métodos
docs/ARQUITETURA/                        — Diagramas, orquestrações
.github/workflows/                       — CI/CD automação
scripts/                                 — Utilitários (notify, deploy, conflict-resolve)
_QUARANTINE/                             — Dedupes recuperáveis (nunca auto-delete)
_RECONCILIADO/                           — Checkpoints validados
```

## Prova & Convergência

Antes de declarar sucesso:

```yaml
#ACORDAR:    Load real state (git, PM2, MCP, VPS)
!CALIBRAR:   Match role + frequency + Writer + tools + gates
PROVAR:      Testes passam, builds sem erro, medidas
CONTRAPROVAR: PROVE novamente com dados novos
MAIN:        Documentar decisão + prova em commit
REMEDIR:     Medir T0 → T1; delta evidente
FIXED_POINT: Estado convergido, próxima ação clara
```

**Nenhuma asserção sem prova.** UNKNOWN never becomes PASS.

## Frequências SOL (Auto-Select)

- **LEVE:** docs, classificação, cache
- **RÁPIDA:** lookup, roteamento
- **MÉDIA:** dev normal, review, integração
- **PROFUNDA:** arquitetura, causalidade, prova pesada
- **FORTE:** missões críticas, regression gates
- **AVANÇADA:** META×META, evolução scaffold
- **FRIA:** segurança/Judge (só evidência)

Seleção automática por complexidade/risco/ambiguidade/custo/latência. Pode mudar durante mesmo trabalho sem reiniciar missão.

## Regras Invioláveis

- **Não** criar memória/governance/contrato paralelo
- **Não** `pm2 restart all` (congelaria o sistema)
- **Não** redefine Writer, autoridade, ou SOUL
- **Não** force-push sem aprovação SEGREDO/CHEFE
- **Não** crie V2/V3 quando original existe
- **Não** apague; mova para `_QUARANTINE` com manifest

## Contribuição & Sincronização (Todos os Agentes)

**Antes de mergear para main:**
1. Testes passam (local + CI verde)
2. Uma ou mais aprovações (SEGREDO/CHEFE, Writer, ou codeowner)
3. Sem force-push; rebase em main se divergiu
4. Commit message inclui scope + `Co-Authored-By`
5. Docs (`CONSCIENCIA/`, `ARQUITETURA/`) atualizadas se comportamento mudou
6. Ciclo `#ACORDAR → !CALIBRAR → PROVAR → CONTRAPROVAR → MAIN → REMEDIR → FIXED_POINT` completo

**Sincronização com main (tempo real):**
```bash
git fetch origin main
git rebase origin/main               # Se em branch feature
# Ou via dependabot auto-merge strategy
```

## Subagentes Claude & Delegação

Subagentes Claude herdam SOUL canônica sem criar identidade paralela:

```text
SUBAGENT_ROOT=.claude/agents
SUBAGENT_ROLE=CAPABILITY_ADAPTER (não authority)
SUBAGENT_INHERIT_CORE=true
SUBAGENT_INHERIT_SOUL=true
SUBAGENT_INHERIT_JUDGE=true (reality judge compartilhado)
DELEGATION_VIA=scripts/agent-call.mjs ou MCP
SUBAGENT_MEMORY_ROLE=WORKING_CACHE_ONLY (não canônico)
```

Cada subagente retorna prova, delta, e evidência ao núcleo SOL. Sem ciclos paralelos de governance.

## Operação no VPS (Hermes/PM2)

Runtime no VPS (`/root/CentralDark`) via Hermes (PM2):

```bash
# Verificar
cd /root/CentralDark && git status
pm2 list                             # Processos críticos
pm2 logs <id> | tail -50             # Diagnóstico

# Sync with GitHub
git fetch origin
git rebase origin/reconciliacao/casa-*

# Deploy (se aprovado)
pm2 restart <id>                     # Serviço específico
# NOT: pm2 restart all
```

MCP health no VPS: `curl -s http://localhost:9100/health`

Logs persistem em `apps/modulos/HERMES-CORE/logs/` (VPS).

## Deduplicação & Quarentena

Artefatos duplicados movem para `_QUARANTINE/` com manifest rastreável; nunca auto-delete. Usar `docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json` antes de criar novo. Reúso prioritário sobre recriação.

## Telegrafo & Notificações

Bots Telegram recebem estado via hooks:

```bash
# Hook de stop
scripts/notify-claude/notify-telegram.sh '🤖' 'Título' 'Mensagem'
```

Nunca expor secrets ou service_role_key em logs/mensagens.

---

**Última atualização:** 2026-08-31 | **Versão:** Canônica Multi-Agente v1.2.0
**Aplicável a:** Claude Code, Hermes, CLI, MCP, GitHub Actions, Telegram, WebUI, futuros motores
