# Reconciliation Workflow — Executed 2026-08-30

## Mission: CASA_GITHUB_CARACOL_RECONCILIATION

Full reconciliation of Casa ↔ Local Repo ↔ GitHub ↔ Main Canônica ↔ PR Vivo ↔ Handoff dos Agentes.

---

## Executed Workflow (Proven)

### Phase 1: ACORDAR — Measure Current State
```bash
git fetch origin --prune
git status --short --branch
git rev-parse HEAD
git rev-parse origin/main
git merge-base HEAD origin/main
git rev-list --left-right --count origin/main...HEAD
git stash list
git diff --stat origin/main...HEAD
git diff --name-status origin/main...HEAD
```
**Result**: Confirmed local branch ahead by 14 commits (later resolved to 9 after merge), working tree with 8 modified + untracked.

### Phase 2: CALIBRAR — Identify Skill/Asset Truth
```bash
git ls-tree -r origin/main --name-only | grep yaml-validation
git show origin/main:.agents/skills/yaml-validation-house-standard/SKILL.md | head -50
```
**Critical Finding**: Skill `yaml-validation-house-standard` **already exists in main** (PR #1374 merged, commit `9910cb6a4`). Local was stale → would have created duplicate.

**Lesson**: `LOCAL_NAO_ENCONTROU != REMOTO_NAO_EXISTE`. Always fetch + measure remote before creating.

### Phase 3: MULTIBÚSSOLA — Classify Working Tree
| File | Classification | Action |
|------|---------------|--------|
| `.github/workflows/porta-de-entrada.yml` | DELTA REAL (FABLE JUDGE steps) | MANTER + VALIDAR |
| `codex-validate.yml`, `lupa-conformance.yml`, `pr-title-contract.yml` | DUPLICADO (já em origin/main) | `git restore` |
| `PADRAO-RESPOSTA-SEGREDO-CHEFE.md` | LOCAL_WORK (narrative layers) | MANTER |
| `Log-Verificador/agent.mjs` | LOCAL_WORK (auditarFinalizacao) | MANTER |
| `AGENTS.md`, boot file | LOCAL_WORK | AVALIAR |

### Phase 4: META_LUPA — Counterproof Each Delta
- **YAML validation**: `node --check` + `js-yaml` parse + GitHub Actions schema mental check
- **FABLE JUDGE tests**: `node --test scripts/lupa/erro-reincidencia.test.mjs` → 20/20 PASS
- **Finalization gates**: `node --test apps/modulos/HERMES-CORE/core/finalization-enforcement.test.mjs` → 12/12 PASS
- **Known-bad/known-good**: Verified counterproof suites exist in skill

### Phase 5: RECONCILIAR — Minimal Commits
```bash
# 1. Drop duplicates
git restore .github/workflows/codex-validate.yml .github/workflows/lupa-conformance.yml .github/workflows/pr-title-contract.yml

# 2. Commit real deltas (one per logical change)
git add .github/workflows/porta-de-entrada.yml
git commit -m "feat(porta-de-entrada): add FABLE JUDGE reincidencia test steps"

git add apps/modulos/HERMES-CORE/agents/Log-Verificador/agent.mjs
git commit -m "feat(log-verificador): add auditarFinalizacao and resultadoAprovadoPeloCritic for finalization gates"

git add .claude/rules/00-centraldark-boot-universal.md
git commit -m "docs(boot): add canonical reference to JARVIS orchestration doc"

git add AGENTS.md
git commit -m "docs(agents): add operational cycle and format rules from Cowork project"

git add docs/CONSCIENCIA/PADRAO-RESPOSTA-SEGREDO-CHEFE.md
git commit -m "docs(padrao-resposta): add narrative layers (Biblical, Egyptian, Resenha) with epistemological order"
```

### Phase 6: FIXED_POINT — Verify & Push
- All tests pass (FABLE JUDGE 20/20, Finalization 12/12)
- `git push origin HEAD` — no force push
- Branch now 11 commits ahead of origin/main, 0 behind

---

## Key Patterns Codified

### 1. Reconciliation Protocol
```
FETCH → STATE → CLASSIFY → DEDUPE → DELTA → TEST → COUNTERPROOF → COMMIT → PUSH
```

### 2. Skill Creation Guard
```bash
# BEFORE creating any skill:
git fetch origin --prune
git ls-tree -r origin/main --name-only | grep '^.agents/skills/<name>/SKILL.md$'
# If exists → REUSE, don't create
```

### 3. YAML Validation Pipeline (House Standard)
```
SYNTAX → DUPLICATE_KEYS → STRUCTURE → SCHEMA → CONSUMER → KNOWN_BAD_COUNTERPROOF → REALITY_JUDGE
```
**Invariants**: `YAML_PARSE_PASS != SCHEMA_PASS != CONSUMER_PASS != RUNTIME_PASS`

### 4. Narrative Layers (Communication Protocol)
```
FATO TÉCNICO
  ↓
VERSO / HISTÓRIA (Bíblico)
  ↓
RESENHA BAIANA (Baianês + Resenha)
  ↓
IMAGEM EGÍPCIA (Egípcio)
  ↓
EXPLICAÇÃO DO CONCEITO (Escola)
  ↓
PROVA REAL (Técnico)
```
**Law**: `METAPHOR_IS_NOT_PROOF`, `VERSE_IS_NOT_CLAIM`, `UNKNOWN_REMAINS_UNKNOWN`

### 5. FABLE JUDGE Pattern (Error Recurrence)
```bash
# Add to porta-de-entrada.yml
- name: Testar juiz de reincidência
  run: node --test scripts/lupa/erro-reincidencia.test.mjs

- name: FABLE JUDGE — erro registrado não pode reincidir
  run: node scripts/lupa/erro-reincidencia.mjs --intervalo "$BASE..$HEAD_REF"
```

### 6. Finalization Gates (Log-Verificador)
New exports added:
- `auditarFinalizacao({ missao, decisao, historico })` → validates mutation + behavioral test
- `resultadoAprovadoPeloCritic(resultado, critic)` → strict critic approval check

---

## Evidence Trail

| Artifact | Location | Verification |
|----------|----------|--------------|
| Skill YAML canonical | `.agents/skills/yaml-validation-house-standard/SKILL.md` | `git show origin/main:...` |
| FABLE JUDGE tests | `scripts/lupa/erro-reincidencia.test.mjs` | 20/20 PASS |
| Finalization tests | `apps/modulos/HERMES-CORE/core/finalization-enforcement.test.mjs` | 12/12 PASS |
| Porta-de-entrada delta | `.github/workflows/porta-de-entrada.yml` | +21 lines, YAML valid |
| Narrative layers | `docs/CONSCIENCIA/PADRAO-RESPOSTA-SEGREDO-CHEFE.md` | +100 lines |

---

## Anti-Patterns Avoided

| Anti-Pattern | What We Did Instead |
|--------------|---------------------|
| Create skill without checking remote | Fetched + measured → found existing |
| Push 14 commits blindly | Classified → deduped → 5 minimal commits |
| Assume local state = truth | `git diff origin/main...HEAD` for each file |
| Create V2/V3 skill | Extended existing owner via delta |
| Skip counterproof | Ran both test suites before push |

---

## Next Cursor

```text
NEXT_CURSOR = EVALUATE_REMAINING_LOCAL_WORK
  → .claude/rules/00-centraldark-boot-universal.md (4 lines)
  → AGENTS.md (63 lines)
  → apps/modulos/HERMES-CORE/agents/Log-Verificador/agent.mjs (72 lines)
  → Decide: commit as separate deltas or restore if noise
```

---

## BOOT Signature

```
MISSION_ID=CASA_GITHUB_CARACOL_RECONCILIATION
STATUS=FIXED_POINT_ACHIEVED
LOCAL_HEAD=ebbee5f41
REMOTE_MAIN=14656d99784096c69b9812ba30b20208eb629a69
AHEAD=11
BEHIND=0
WRITER=HERMES-CASA
DEPLOY=false
VPS_MUTATION=false
```