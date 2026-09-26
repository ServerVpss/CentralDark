# 10 FRENTES PARALELAS — PADRÃO DE EVIDÊNCIA FRESCA

> **Origem**: Sessão 2026-09-07 — Contraprova eliminou falsos verdes de medições stale
> **Princípio**: MEDIR SEMPRE, NUNCA ASSUMIR, RENDEZVOUS OBRIGATÓRIO

---

## O Padrão

Quando a missão exige **cobertura total do estado operacional** (repo, PRs, CI, runtime, adapters, owners, docs, infra, security, handoff), executar **10 frentes paralelas de medição** com rendezvous obrigatório.

---

## As 10 FRENTES CANÔNICAS

| Frente | Foco | Comandos-Chave | Classificação Obrigatória |
|--------|------|----------------|---------------------------|
| **01** | REPO_MAIN_HEAD_CURRENT_STATE | `gh api commits/main`, `git rev-parse HEAD`, `ssh VPS git rev-parse` | ON_MAIN_ALREADY / CURRENTLY_PROVEN |
| **02** | LINEAGE_ISSUES_PRS_COMMITS_BRANCHES | `gh pr list`, `gh issue list`, `git branch -a`, `git log --oneline` | PROVEN_HISTORICAL / CURRENTLY_PROVEN |
| **03** | CASA_WORKTREES_RUNTIME | `git worktree list`, `ls -la workspace`, `ssh VPS ls -la` | CURRENTLY_PROVEN / UNKNOWN |
| **04** | DRIVE_DOCS_RECEIPTS | `ls -la BRAIN/01-OURO`, `ls -la BRAIN/02-SESSOES`, `find -newer` | CURRENTLY_PROVEN / DUPLICATE |
| **05** | OWNERS_ARCHITECTURE_CONTRACTS | `ls apps/modulos/*`, `cat DELTA-CONTINUO.md`, `cat SOUL-SOL.md` | ON_MAIN_ALREADY / PROVEN_HISTORICAL |
| **06** | SKILLS_TOOLS_AUTOMATION | `ls skills/`, `hermes skill list`, `find SKILL.md \| wc -l` | ON_MAIN_ALREADY / CURRENTLY_PROVEN |
| **07** | PROVIDERS_MODELS_ROUTER | `curl health`, `curl models`, `hermes config show`, `cat omni_router.py` | CURRENTLY_PROVEN / UNKNOWN |
| **08** | TESTS_FALSIFIERS_COUNTERPROOF | `node --test`, `npm test`, `python meta_lupa.py` | CURRENTLY_PROVEN / CONFLICTING |
| **09** | INFRA_PERFORMANCE_SECURITY | `netstat -ano \| findstr`, `ps aux \| findstr`, `curl health` | CURRENTLY_PROVEN / UNKNOWN |
| **10** | DOCUMENTATION_HANDOFF_NEXT_CURSOR | `cat session files`, `cat LEIA-ME-IA.md`, `cat PROOF-OWNERSHIP.json` | PROVEN_HISTORICAL / CURRENTLY_PROVEN |

---

## Regras Invariantes

```
PARALLELIZE_PERCEPTION=true    # Todas leem/medem juntas
SERIALIZE_MUTATION=true        # Escritas serializadas, 1 writer/escopo
RENDEZVOUS_REQUIRED=true       # Consolidar ANTES de prosseguir
CLASSIFICAÇÃO_OBRIGATÓRIA      # Todo achado classificado
MAIN_SHA_MUDA_SEMPRE           # Re-medir main no início de CADA ciclo
SAME_HEAD_CI_GREEN_OBRIGATÓRIO # mergeable ≠ pronto; READY=UNKNOWN até green
```

---

## Lição Crítica desta Sessão (2026-09-07)

### O Erro
Medições da sessão anterior (fictícias/fabricadas) reportaram:
- MAIN = `f60ad718` (STALE)
- PR #1444 = "todos PASS" (FALSO VERDE)
- PR #1445 = "todos PASS" (FALSO VERDE)
- "Nenhum PR vermelho" (FALSO)

### A Realidade Medida AGORA
- MAIN = `9319769c` (NOVO - avançou)
- PR #1444 = `c871fcad` → CI **QUEUED/PENDING**, READY=UNKNOWN
- PR #1445 = `09478cd` → Trigger Fabric **FAILURE**, READY=UNKNOWN
- Casa = `10f9fe9a` → 100+ untracked files
- VPS = `0f183719` → 200+ drift missions, status files modified

### Contraprova Executada
| Claim Anterior | Evidência Fresca | Veredito |
|----------------|------------------|----------|
| "MAIN = f60ad718" | `gh api` → `9319769c` | **FALSO** |
| "PR #1444 PASS" | CI queued, nenhum completed | **FALSO VERDE** |
| "PR #1445 PASS" | Trigger Fabric FAILURE | **FALSO VERDE** |
| "VPS = MAIN" | VPS = `0f183719` divergente | **FALSO** |

### Princípio Reforçado
> **EVIDÊNCIA TEM VALIDADE TEMPORAL** — `TIK_TAK`
> - Mediu → age começa a contar
> - Agir muda estado
> - Perguntar = perde tempo
> - Evidência vira história
> - **SEMPRE RE-MEDIR NO INÍCIO DE CADA CICLO**

---

## Rendezvous Template (Usar após 10 frentes)

```markdown
## RENDEZVOUS — [MISSION_ID] — [TIMESTAMP]

### MAIN SHA
`gh api` → [SHA_ATUAL]

### PRs ATIVOS
| PR | HEAD | CI Status | READY |
|----|------|-----------|-------|
| #XXX | [SHA] | [workflows] | UNKNOWN/PASS/FAIL |

### CASA / VPS
| Ambiente | HEAD | Status |
|----------|------|--------|
| Casa | [SHA] | [clean/untracked/modified] |
| VPS | [SHA] | [clean/untracked/modified] |

### CLASSIFICAÇÃO CONSOLIDADA
- ON_MAIN_ALREADY: [...]
- PROVEN_HISTORICAL: [...]
- CURRENTLY_PROVEN: [...]
- UNKNOWN: [...]
- CONFLICTING: [...]

### CONTRA-PROVA
Claims falsificados: [...]

### NEXT_CURSOR
[Próximo cursor com causa explícita]
```

---

## Checklist de Execução

- [ ] Disparar 10 frentes em paralelo (terminal batch)
- [ ] Aguardar todas completarem
- [ ] Rendezvous: consolidar em tabela única
- [ ] Classificar CADA achado
- [ ] Contraprova: listar claims anteriores vs evidência fresca
- [ ] NEXT_CURSOR com causa explícita (não vago)
- [ ] Receipt do rendezvous gerado
- [ ] Só prosseguir se READY=PASS ou fronteira explícita

---

## Anti-Patterns (NÃO FAZER)

| Anti-Pattern | Correção |
|--------------|----------|
| Assumir MAIN não mudou | `gh api commits/main` SEMPRE no boot |
| Trust `mergeable=true` como ready | Exigir SAME_HEAD CI GREEN |
| Usar medição de 1 turno atrás | RE-MEDIR: evidência envelhece |
| Pular frente "porque sei" | 10 frentes OBRIGATÓRIAS para cobertura total |
| Consolidar no chat | Rendezvous = tabela + classificação + receipt |
| Declarar FIXED_POINT sem rendezvous | Rendezvous é gate do Fixed Point |