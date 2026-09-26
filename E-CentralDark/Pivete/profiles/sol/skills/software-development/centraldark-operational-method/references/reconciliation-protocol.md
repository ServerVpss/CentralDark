# Protocolo de Reconciliação — CentralDark

## Princípio Central
```
LOCAL ATRASADO != REMOTO AUSENTE
FOUND_LOCAL != CURRENT_REMOTE
HISTORY != CURRENT_STATE
```

## Fluxo Obrigatório Antes de Qualquer Criação/Commit

### 1. FETCH & REMEASURE
```bash
git fetch origin --prune
git rev-parse HEAD
git rev-parse origin/main
git merge-base HEAD origin/main
git rev-list --left-right --count origin/main...HEAD
```

### 2. CLASSIFICAR STATUS DO WORKING TREE
Para cada arquivo modificado/untracked:
| Tipo | Classificação | Ação |
|---|---|---|
| Já em origin/main | DUPLICADO | `git restore` / drop |
| Matéria nova real | CANONICAL_DELTA | Manter + validar |
| Trabalho em progresso | LOCAL_WORK_IN_PROGRESS | Avaliar |
| Gerado/cache | GENERATED / CACHE | Ignorar/limpar |
| Histórico | HISTORICAL | Arquivar |

**Regra**: `UNKNOWN != DELETE` — nunca apague sem classificar.

### 3. RECONCILIAR SOMENTE DELTA NOVO
- Owner principal já existe? → **REUSE_BEFORE_CREATE**
- Absorver somente o que NÃO estiver coberto no owner
- Não criar skill paralela / V2 / V3

### 4. VALIDAR (YAML/Workflow)
```bash
# Sintaxe
python3 -c "import yaml; yaml.safe_load(open('file.yml'))"

# Schema GitHub Actions (se aplicável)
# actionlint / schema validation

# Known-bad counterproof
KNOWN_BAD → MUST_FAIL
KNOWN_GOOD → MUST_PASS
```

### 5. COMMIT MÍNIMO
```bash
git add <apenas delta real>
git commit -m "tipo(escopo): descrição curta"
```

### 6. PUSH / PR
- Se Writer já existe para escopo → reconciliar nele
- Se não e há DELTA_REAL_PROVADO → um PR único
- Sem force-push, sem push dirty main

---

## Pitfalls Comuns

| Pitfall | Correção |
|---|---|
| Assumir "não existe" sem fetch | FETCH → REMEASURE primeiro |
| "14 commits ahead = push" | CLASSIFICAR → DEDUPE → DELTA → TEST |
| Modificar arquivo já no main | DIFF vs origin/main → DROP |
| Criar skill nova sem checar | SEARCH skills → REUSE |
| Push sem validar YAML | SYNTAX → SCHEMA → CONSUMER |

---

## Checklist de Reconciliação

- [ ] `git fetch origin --prune` executado
- [ ] `git rev-parse HEAD` e `origin/main` medidos
- [ ] `git diff --stat origin/main...HEAD` analisado
- [ ] Cada arquivo classificado (DUPLICADO / DELTA / LOCAL_WORK / etc)
- [ ] Duplicatas droppadas (`git restore`)
- [ ] Delta real validado (YAML syntax + schema + counterproof)
- [ ] Commit mínimo apenas com delta real
- [ ] Writer confirmado / sem colisão

---

## Referências Relacionadas
- `pivete-session-guide`: MEASURE → REUSE → ONE_WRITER
- `yaml-validation-house-standard`: pipeline de validação YAML
- `LEIA-ME-IA.md` / `SOUL-SOL.md`: regras canônicas