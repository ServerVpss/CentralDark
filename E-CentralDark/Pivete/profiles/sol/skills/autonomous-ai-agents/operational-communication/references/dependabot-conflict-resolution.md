# Dependabot Conflict Resolution — Padrão Canônico

## Padrão

```
PR Dependabot abre → workflow dispara → resolve-conflicts.sh → auto-merge squash
```

## 10 Frentes de Difusão

1. `scripts/dependabot/resolve-conflicts.sh` — motor determinístico
2. `.github/workflows/dependabot-auto-merge.yml` — gatilho
3. `dependabot.yml` — labels canônicas
4. `git-conflict-resolve-house-standard` skill
5. `dependabot-conflict-resolver` skill
6. SOUL — menção ao padrão
7. LEIA-ME-IA — boot inclui resolução de conflito
8. CENTRALDARK_AI_BOOT — campo conflict_resolution
9. PR template — aviso de conflito
10. APRENDIZADOS.md — caso #1193, #1341, #1355, #1356

## Política de Resolução

| Caminho | Lado que vence | Por quê |
|---|---|---|
| package.json/lock (qualquer dir) | PR (`--ours`) | o PR é o bump |
| todo o resto | main (`--theirs`) | fail-closed |

## Armadilhas

1. `--ours`/`--theirs` invertidos — motor na branch do PR, `--ours` = PR
2. Lockfile único = conflito em cadeia — agrupar, não rebasear
3. `groups` sem `applies-to` cobre só `version-updates`
4. 22k = falso positivo de filtro — filtrar por FIELD, não por linha

## Prova (2026-08-28)

- PR #1355: dependabot bump → motor → NO_CONFLICT
- PR #1356: conflito artificial → motor → auto-merge → MERGED
