# Reconciliação & YAML Validation — Sessão 2026-08-30

## Contexto
Missão `CASA_GITHUB_CARACOL_RECONCILIATION` — reconciliar Casa ↔ GitHub ↔ Main canônica sem perda de delta útil, sem arquitetura paralela.

## Lições Operacionais

### 1. Estado Local Atrasado ≠ Remoto Ausente
**Erro cometido:** Clone local não tinha skill `yaml-validation-house-standard` → assumiu "não existe" → planejou recriar.
**Correto:**
```bash
git fetch origin --prune
git ls-tree -r origin/main --name-only | grep 'yaml-validation'
git show origin/main:.agents/skills/yaml-validation-house-standard/SKILL.md
```
**Regra:** `LOCAL_NAO_ENCONTROU != REMOTO_NAO_EXISTE`. Sempre `FETCH → REMEDIR → DEPOIS CONCLUIR`.

### 2. Skill Canônica Já Existia
- PR #1374 merged (`9910cb6a4`)
- Arquivo: `.agents/skills/yaml-validation-house-standard/SKILL.md` (382 linhas)
- Pipeline de validação: SYNTAX → DUPLICATE_KEYS → STRUCTURE → SCHEMA → CONSUMER → KNOWN_BAD → REALITY_JUDGE
- **Não recriar, não V2, não skill paralela.**

### 3. CI=false + ACTIONS_STEP_DEBUG Já Vieram do Main
O merge `origin/main` trouxe:
- `CI: false` nos jobs Node.js
- `ACTIONS_STEP_DEBUG: true` para debug condicional
**Não duplicar em outros workflows sem causa medida.**

### 4. Delta Real vs Duplicatas
| Arquivo | Classificação | Ação |
|---|---|---|
| `porta-de-entrada.yml` (+FABLE JUDGE steps) | **DELTA REAL** | Commit + push |
| `codex-validate.yml` | DUPLICADO (já em origin/main) | `git restore` |
| `lupa-conformance.yml` | DUPLICADO | `git restore` |
| `pr-title-contract.yml` | DUPLICADO | `git restore` |

### 5. Validação YAML Real (Não Apenas Sintaxe)
```bash
# Sintaxe
node -e "require('js-yaml').load(fs.readFileSync('file.yml'))"

# GitHub Actions schema (jobs/steps structure)
# Verificar: jobs.*.steps[].uses|run, não runs-on/steps no nível errado
```

### 5. Testes Obrigatórios Antes de Commit
```bash
node --test scripts/lupa/erro-reincidencia.test.mjs   # 20/20 PASS
node --test apps/modulos/HERMES-CORE/core/finalization-enforcement.test.mjs  # 12/12 PASS
```

### 6. Commits Mínimos + Push Sem Force
- Apenas `porta-de-entrada.yml` modificado (+3 linhas)
- Commit único: `feat(porta-de-entrada): add FABLE JUDGE reincidencia test steps`
- Push normal (sem force)

---

## Checklist de Reconciliação (Para Próximas Sessões)

- [ ] `git fetch origin --prune` **antes de qualquer conclusão**
- [ ] `git ls-tree -r origin/main --name-only | grep <skill>` para confirmar existência
- [ ] `git show origin/main:<path>` para ler conteúdo canônico
- [ ] Classificar working tree: CANONICAL_DELTA | DUPLICATE | LOCAL_WORK | GENERATED | CACHE | HISTORICAL | UNKNOWN
- [ ] `UNKNOWN != DELETE` — não apagar sem classificar
- [ ] Dropar duplicatas (`git restore`) antes de validar
- [ ] Validar YAML: syntax + duplicate keys + structure + schema + consumer
- [ ] Rodar testes conhecidos (KNOWN_BAD/KNOWN_GOOD)
- [ ] Commit mínimo, push normal
- [ ] `UNKNOWN != PASS`, `ACTION != PROOF`, `REALITY = JUDGE`

---

## Frases-Chave da Sessão

> "LOCAL ATRASADO != REMOTO AUSENTE"
> "MAIN JÁ ABSORVEU → NÃO RECRIAR"
> "MUITAS SKILLS ÚTEIS → BIG_LIBRARY → PRECISE_RETRIEVAL → SMALL_CONTEXT"
> "PAPAGAIO_OFF. REALITY=JUDGE."
> "Não empurre os 14 commits cegamente. Primeiro determine o que eles são."