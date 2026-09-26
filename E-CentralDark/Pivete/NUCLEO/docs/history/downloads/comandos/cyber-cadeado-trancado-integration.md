# Contexto Cyber & CADEADO TRANCADO — Integração ao Método Operacional

**Data:** 2026-08-22
**Fonte:** `C:/Users/danda/Downloads/Compressed/Nova pasta/CADEADO TRANCADO  SO COM PERMITO SEGREDO/` (127MB ZIP + pasta extraída)
**Skill relacionada:** `edr-zero-trust-hunter` (criada em `cybersecurity/edr-zero-trust-hunter`)

---

## Visão Geral do Material

O pacote `CADEADO TRANCADO` contém **ouro operacional consolidado** em 5 componentes principais:

| Componente | Tamanho | O que é | Status no Repo Atual |
|------------|---------|---------|---------------------|
| `centraldark-hardening-pack` | ~127KB | Scripts UFW/PM2/secrets/evidence capture para VPS hardening | Parcial: `vps-exec-selfhosted.yml`, `porta-de-entrada.yml` existem; checklists/scripts **não estão no repo** |
| `CENTRALDARK-MANDATO-CELESTIAL` | ~500KB | Arquitetura cognitiva: mesmo agente vs próprios delírios (Caixa Preta Selada, ReAct+MetaLupa+AutoLupa, estados SEALED_*) | Conceitualmente alinhado com `meta-lupa` + `centraldark-operational-method`; **runtime Python não está no repo** |
| `CentralDark-Runtime-Closed-Loop-01` | ~50KB | Orquestração: Scout → Local Triage → Frontier → Judge → Writer único; fases A-H; cleanroom | `porta-de-entrada.yml` + `pr-auto-review.yml` cobrem parte; **fases B-H + prompts não estão no repo** |
| `self-learning-skills-main` | ~65KB | Meta-skill: colhe "golden path" → skill reutilizável; promotion rule (passing check + named failure + ruled-out dead-end) | `centraldark-operational-method` cita aprendizado; **skill `self-learning` não existe no `.agents/skills/`** |
| `go.txt` | ~190KB | Missão canônica: defesa FABLE_LOOP, porta única, quarentena, cleanroom, capability stripping, mutant tests, contraprova | `meta-lupa` + `auditoria-pr` + `porta-de-entrada.yml` cobrem peças; **defesa integrada não existe** |

---

## Mapeamento para Integração (REUSE_BEFORE_CREATE)

### 1. Hardening VPS → Estender Workflows Existentes
**Owners:** `vps-exec-selfhosted.yml`, `porta-de-entrada.yml`
**Ação:** Incorporar checklists (`ORDEM-APLICACAO.md`, `ROTACAO-SECRETS.md`) e scripts (`00-capture-evidence.sh`...`04-pm2-stability-snippet.sh`) como steps nos workflows ou como scripts referenciados.

### 2. Mandato Celestial → Cristalizar em Meta Lupa + Método Operacional
**Owners:** `meta-lupa` (já tem AutoLupa), `centraldark-operational-method` (já tem ReAct loop)
**Ação:** Adicionar seção "Autoconfronto Cognitivo" referenciando estados SEALED_* e ciclo Matéria-Prima → Autoconfronto → Correção → Casos Novos → Selo Rompido.

### 3. Runtime Closed Loop → Estender Porta de Entrada + PR Auto Review
**Owners:** `porta-de-entrada.yml`, `pr-auto-review.yml`
**Ação:** Estender com fases B-H (Topology, Detectors, Model Routing, Patch Plan, Isolated Implementation, Independent Judge, Controlled Promotion) + prompts correspondentes.

### 4. Self-Learning → Criar/Estender Skill de Harvesting
**Owner:** `.agents/skills/centraldark-operational-method` (já tem seção de memória/aprendizado)
**Ação:** Adicionar subseção "Self-Learning Harvest" com promotion rule: passing check + named failure pattern + ruled-out dead-end = skill. Referenciar `self-learning-skills-main/skills/self-learning/SKILL.md` como template.

### 5. FABLE_LOOP Defense (go.txt) → Estender Meta Lupa + Auditoria PR + Porta de Entrada
**Owners:** `meta-lupa`, `auditoria-pr`, `porta-de-entrada.yml`
**Ação:** Integrar gates de quarentena, cleanroom, capability stripping, mutant tests (20 mutantes listados), contraprova, separação Autor/Executor/Revisor.

---

## Delta Mínimo por Owner (Prova de Integração)

| Ativo do Pack | Owner Canônico | Delta Mínimo |
|---------------|----------------|--------------|
| **Hardening VPS** | | |
| `scripts/00-capture-evidence.sh` | `vps-exec-selfhosted.yml` + `porta-de-entrada.yml` | Adicionar step `capture-evidence` no job `deploy-mcp`; exportar `EVIDENCE_DIR` |
| `scripts/01-fix-ufw-conflicts.sh` | `porta-de-entrada.yml` (job `validar`) | Integrar detecção conflitos 3000/9000 + `ss` listeners no step `Validar continuidade global` |
| `scripts/02-apply-ufw-canonical.sh` | `vps-exec-selfhosted.yml` | Novo job `ufw-canonical` (condicional `CLOSE_EXTRA=1`) com backup `/etc/ufw`, deny portas app, allow 22/80/443 |
| `scripts/03-verify-bind-and-ports.sh` | `vps-exec-selfhosted.yml` + `vps-healthcheck.yml` | Estender healthcheck: `ss` verify bind 127.0.0.1 + fail2ban pong + curl health endpoints |
| `scripts/04-pm2-stability-snippet.sh` | `vps-exec-selfhosted.yml` | Gerar `ecosystem.config.cjs` recomendado (max_restarts, min_uptime, exp_backoff) no deploy |
| `checklists/ORDEM-APLICACAO.md` | `vps-exec-selfhosted.yml` | Codificar fases 0-6 como jobs sequenciais com gates |
| `checklists/ROTACAO-SECRETS.md` | `vps-exec-selfhosted.yml` + `porta-de-entrada.yml` | Adicionar step `secrets-rotation` (grep `ghp_\|gho_\|sk-or-v1-\|sb_secret_\|lin_api_` no ecosystem) |
| `templates/caddy-internal-upstreams.snippet` | `infra/caddy/` | Validar Caddyfile real contra snippet; garantir `reverse_proxy 127.0.0.1:<porta>` |
| **Mandato Celestial** | | |
| `prompts/AUTODESTRUIDOR.md` (autoconfronto) | `meta-lupa` (AutoLupa) | **Já coberto** — AutoLupa já exige `SELF_FOUND_ERROR`, `ERROR_MECHANISM`, `WHY_IT_LOOKED_TRUE`, `MISSING_EVIDENCE`, `CORRECTION` |
| `prompts/CONSTRUTOR.md` / `GOAL-CAIXA-PRETA-SELADA.md` | `centraldark-operational-method` (Boot + Ciclo) | **Já coberto** — Boot universal + ciclo operacional + `SEALED_*` states = `CENTRALDARK_AI_BOOT` + `FIO_DA_MISSAO` |
| `prompts/VERIFICADOR-DE-SELO.md` | `meta-lupa` (AutoLupa + Ponto Fixo) | **Já coberto** — AutoLupa já valida `erro próprio + mecanismo + evidência + correção + casos novos + não repetição` |
| `docs/04-REACT-METALUPA-AUTOLUPA.md` | `meta-lupa` (3 temperaturas) | **Já coberto** — ReAct = ciclo operacional; Meta Lupa = 3 temperaturas; AutoLupa = ponto fixo |
| **Runtime Closed Loop** | | |
| `prompts/00-master-orchestrator.md` | `porta-de-entrada.yml` + `pr-auto-review.yml` | Fases A-H → estender jobs: `discovery` → `topology` → `detectors` → `model-routing` → `patch-plan` → `isolated-impl` → `independent-judge` → `promotion` |
| `prompts/01-local-triage.md` | `pr-auto-review.yml` (job `triage`) | Adicionar classificador `KNOWN_PATTERN \| PROBABLE_PATTERN \| UNKNOWN \| INSUFFICIENT_EVIDENCE` no output JSON |
| `prompts/02-frontier-agent.md` | `meta-lupa` (MÉDIA/QUENTE) | Estruturar saída `FACTS \| HYPOTHESES \| DISCRIMINATING_TESTS \| MINIMAL_FIX_PROPOSAL \| RISK \| ROLLBACK \| REMAINING_UNKNOWN` |
| `prompts/03-independent-judge.md` | `meta-lupa` (Judge) | Formalizar veredito exclusivo `APPROVED \| CORRECT \| BLOCKED` + checklist de auditoria |
| `schemas/finding.schema.json` | `meta-lupa` + `pr-auto-review.yml` | Adotar schema como contrato de finding; integrar no receipt do `porta-de-entrada` |
| `schemas/runtime-receipt.schema.json` | `porta-de-entrada.yml` + `vps-exec-selfhosted.yml` | Emitir receipt `centraldark.runtime.receipt.v1` ao final de cada run |
| `scripts/00-discovery-readonly.sh` | `porta-de-entrada.yml` (job `validar`) | Substituir `validar-continuidade-global.mjs` por discovery completo (system, PM2, Docker, Git, models) |
| **Self-Learning Skills** | | |
| `self-learning-skills-main/skills/self-learning/SKILL.md` | `centraldark-operational-method` (Registro do Ouro) | Adicionar seção **Harvest Procedure** (promotion rule: passing check + named failure + ruled-out dead-end) + `skills/self-learning/` no repo |
| `AGENTS.md` (portable) | `centraldark-operational-method` | Integrar loop `Recognize → Capture → Reuse` no método |
| **FABLE_LOOP Defense (go.txt)** | | |
| Porta única + quarentena + cleanroom | `porta-de-entrada.yml` | Estender: `RECEIVE → FREEZE → IDENTIFY ORIGIN → HASH → CLASSIFY → STRIP AUTHORITY → QUARANTINE → STATIC INSPECTION → CLEANROOM TEST → CONTRAPROVA → INDEPENDENT REVIEW → DECIDE → MINIMAL INCORPORATION` |
| Mutant tests (20 casos) | `pr-auto-review.yml` + `meta-lupa` | Adicionar job `mutant-tests` com 20 mutantes (prompt injection, fake receipt, cache bypass, loop detection, etc.) |
| Capability stripping | `vps-exec-selfhosted.yml` | Enforçar `NETWORK=OFF, SECRETS=NONE, GIT_CREDENTIALS=NONE, MOUNTS=READ_ONLY` no cleanroom |

---

## O Que Já Existe (NÃO MEXER — REUSE CONFIRMADO)

| Capacidade | Onde Está | Prova |
|------------|-----------|-------|
| Meta Lupa (FRIA/MÉDIA/QUENTE + AutoLupa) | `.agents/skills/meta-lupa/SKILL.md` | 26539 bytes, SHA `42691e0` |
| Boot Universal + Ciclo Operacional | `skills/software-development/centraldark-operational-method/SKILL.md` | `CENTRALDARK_AI_BOOT` + 12-step cycle |
| Writer Único + Delta | `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md` | Contrato canônico |
| Porta de Entrada (fork guard, checkout, labels) | `.github/workflows/porta-de-entrada.yml` | Job `validar` |
| PR Auto Review (secret scan, diff check) | `.github/workflows/pr-auto-review.yml` | Job `triage` |
| VPS Deploy (lock, SHA validation, PM2) | `.github/workflows/vps-exec-selfhosted.yml` | Job `deploy-mcp` |
| Sentinela (drift, divergências) | `.github/workflows/sentinela-divergencias.yml` + `scripts/sentinela/` | Drift guard + log-verificador |

---

## Princípios de Integração (Já no Método, Reforçar)

```
REUSE_BEFORE_CREATE_REQUIRED
ONE_WRITER_PER_SCOPE
LOCAL_REALITY = JUDGE
HISTORICAL != CURRENT
UNKNOWN != PASS
DOCUMENTED != EXECUTED
```

---

## Próximos Passos Recomendados (Writer = NONE — Só Planejamento)

1. **Mapear owners atuais** para cada componente (workflows, skills, scripts)
2. **Extrair delta mínimo** de cada componente vs repo atual
3. **Criar mutant tests** para FABLE_LOOP defense (20 casos listados em go.txt)
5. **Cristalizar Self-Learning** como skill ou subseção do método operacional
6. **Integrar hardening VPS** nos workflows existentes sem duplicar lógica

---

## Referências Cruzadas

- `edr-zero-trust-hunter` (skill cybersecurity criada nesta sessão)
- `meta-lupa` (governança FRIA/MÉDIA/QUENTE + AutoLupa)
- `knowledge-compiler` (cristalização de achados)
- `session-intelligence-harvester` (extração de intel de sessões)
- `audit-rls` / `auditoria-pr` (code review segurança)
- `centraldark-operational-method` (este skill — método base)