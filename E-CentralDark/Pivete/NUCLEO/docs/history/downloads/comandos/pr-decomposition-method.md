# Método de Decomposição Determinística de PR Histórico (PR Inexistente)

## Contexto
PR #455 referenciado no commit `2ef0128c2` (2026-07-31) como "delta-canonico isolado de PR #455" — **mas PR #455 não existe no GitHub remoto** (404 API, não em `git log --all --grep`, não em `gh pr list --state all`).

## Metodologia Validada (Esta Sessão)

### 1. Confirmar Inexistência
```bash
gh api repos/SERVERVPSS/CentralDark/pulls/455  # 404
git log --all --grep="#455" --oneline           # vazio
gh pr list --state all --search "455"           # vazio
```

### 2. Descobrir Branches Relacionadas
```bash
git branch -a | grep -i "meta-lupa\|gate\|adversarial"
# → evol/meta-lupa-falso-verde-20260727
# → promover-mae-meta-lupa-20260727
# → feat/meta-lupa-gate-final-adversarial-20260804 (remote)
```

### 3. Comparar Cada Branch vs Main
```bash
git diff main...<branch> --stat
git diff main...<branch> -- .github/workflows/ .agents/skills/meta-lupa/
```

### 4. Decompor em `c_i` (Mudanças Atômicas)
Para cada mudança no PR histórico, medir contra `main` atual:
| Métrica | Fonte |
|---------|-------|
| `r_i` = relevância atual | O que sobreviveu no main |
| `d_i` = duplicação absorvida | Commits reorganizando a área |
| `g_i` = ganho de gate | Fail-closed já provado |
| `t_i` = custo teste/revalidação | Tempo CI + complexidade |
| `q_i` = risco regressão | Áreas protegidas CLAUDE.md |

### 5. Pesos Derivados de Baseline (NÃO ESCOLHIDOS)
```bash
# w_d = duplicação medida (ex: 23 commits reorganizando workflows)
# w_t = custo teste (meta-lupa tests = 15min, workflows = 10min c/u)
# w_q = risco regressão (áreas protegidas CLAUDE.md = 15 paths)
# w_r = relevância (apenas delta-canonico sobreviveu como unit isolado)
# w_g = ganho gate (fail-closed já provado em 3 workflows)
# λ1 = 0.3 (reaproveitar), λ2 = 0.7 (revalidar)
```

### 6. Fórmula e Classificação
```
J_i = w_d*d_i + w_t*t_i + w_q*q_i - w_r*r_i - w_g*g_i

J_i > λ2     → REJEITAR
λ1 < J_i ≤ λ2 → REVALIDAR
J_i ≤ λ1     → REAPROVEITAR
```

### 7. Resultado Desta Sessão
| Item | Classificação | Evidência |
|------|---------------|-----------|
| PROTOCOLO_ADVERSARIAL | REJEITAR | Meta Lupa atual superevangeliza |
| GATE_FAIL_CLOSED | REJEITAR | 3 workflows canônicos implementam |
| 27+ WORKFLOWS | REJEITAR | 23 commits reorganizando → 33 atuais |
| META_LUPA_ANTIGA | REJEITAR | SKILL.md 26539 bytes + AutoLupa SHA `42691e0` |
| HOOKS_PRE_COMMIT | REVALIDAR | Root não tem; apenas Bolt scope |
| SESSION_INTEL_HARVESTER | REVALIDAR | Skill existe, hook fim não comprovado |
| DELTA_CANONICO | REAPROVEITAR | `.agents/contratos/delta-canonico/` vivo, 14/15 testes |
| KNOWLEDGE_COMPILER | REAPROVEITAR | Skill operacional com compiler.mjs |

### Princípios-Chave
- **ESTADO VIVO > histórico**
- **MAIN ATUAL > HEAD antigo do PR**
- **HISTÓRICO != ESTADO ATUAL**
- **DOCUMENTADO != EXECUTADO**
- **UNKNOWN != PASS**
- **REASONING != EVIDENCE**
- **ONE_WRITER_PER_SCOPE**
- Pesos e thresholds DEVEM vir de baseline medido, não feeling