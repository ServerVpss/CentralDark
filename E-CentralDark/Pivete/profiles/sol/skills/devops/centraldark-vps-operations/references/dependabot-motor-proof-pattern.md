# Dependabot Motor — Prova Real de Funcionamento

> Prova de que o motor resolve-conflicts.sh funciona em PRs abertos (2026-08-28).

## Cenário de Prova

Quando não há PRs Dependabot abertos, a prova requer criação de PR de teste com conflito real.

### Padrão de Criação de Conflito

```bash
# 1. Criar branch a partir de commit ANTES do bump da main
git checkout -b test/dependabot-<dep> <commit-antes-do-bump>

# 2. Aplicar bump artificial no package.json
python3 -c "
import json
p = 'apps/modulos/Bolt/source/package.json'
d = json.load(open(p))
d['dependencies']['<dep>'] = '<versão-antiga>'  # versão que conflita com main
json.dump(d, open(p, 'w'), indent=2)
"

# 3. Commit e push
git add apps/modulos/Bolt/source/package.json
git commit -m "chore(deps): bump <dep> (test)"
git push -u origin test/dependabot-<dep>

# 4. Criar PR
gh pr create --head test/dependabot-<dep> --base main \
  --title "test: bump <dep>" --body "Prova do motor"
```

### Execução do Motor

```bash
# Na VPS
ssh Segredo-VPS "cd /root/CentralDark && bash scripts/dependabot/resolve-conflicts.sh <PR_NUM>"
```

### Resultado Esperado

```
NO_CONFLICT  # se main já absorveu
# ou
CONFLICT_RESOLVED  # se resolveu e empurrou
```

### Provas Reais (2026-08-28)

| PR | Tipo | Resultado |
|---|---|---|
| #1355 | dependabot bump (cohere) | NO_CONFLICT ✓ |
| #1356 | conflito artificial (package.json) | auto-merge → MERGED ✓ |
| #1357 | bump real (zod) | NO_CONFLICT ✓ |
| #1358 | bump real (zod, conflito) | auto-merge → MERGED ✓ |

## Limpeza Após Prova

```bash
gh pr close <PR_NUM> --delete-branch
```

## Gatilho Automático (produção)

Em produção, o gatilho é automático:
1. Dependabot abre PR
2. `dependabot-auto-merge.yml` detecta `pull_request` do `dependabot[bot]`
3. Workflow dispara `resolve-conflicts.sh <PR>`
4. Motor resolve lockfile deterministicamente
5. Auto-merge squash dispara (se patch)

**Não é necessário criar PRs de teste em produção.** O gatilho é o próprio Dependabot.

## Armadilha: Workflow Skip

O workflow `dependabot-auto-merge.yml` tem guarda:
```yaml
if: github.actor == 'dependabot[bot]'
```

PRs criados manualmente (como os de teste acima) **não disparam o workflow automaticamente**. O motor só roda via workflow se o ator for o bot real do Dependabot.

Para testar o motor manualmente:
```bash
bash scripts/dependabot/resolve-conflicts.sh <PR_NUM>
```

## Referências

- Skill: `dependabot-conflict-resolver`
- Motor: `scripts/dependabot/resolve-conflicts.sh`
- Workflow: `.github/workflows/dependabot-auto-merge.yml`
- APRENDIZADOS.md #30
