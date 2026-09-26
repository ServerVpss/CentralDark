# CI Vermelho no Dependabot — Diagnóstico por Causa Raiz

## Quando usar
- PR do Dependabot com CI vermelho
- Workflow `dependabot-auto-merge.yml` falhou
- CI vermelho não é óbvio (diff parece OK)

## Classificação rápida

### 1. Falha de infraestrutura do workflow (não problema do PR)

#### 1a. HTTP 422 — aprovação bloqueada
- **Erro**: `GitHub Actions is not permitted to approve pull requests`
- **Onde**: passo "Aprovar PR" usando `actions/github-script` + `createReview({event:'APPROVE'})`
- **Causa**: repositório privado bloqueia criação de review via API Actions
- **Correção**: remover o passo de aprovação; o `enablePullRequestAutoMerge` via GraphQL é suficiente
- **Validado**: PR #1397 (fast-uri) — CI vermelho pelo passo de aprovação, diff OK

#### 1b. Workflow YAML inválido
- **Sintoma**: run falha imediatamente, sem executar steps
- **Causa**: aninhamento incorreto de `runs-on` e `steps` dentro de um step (YAML aceita, schema do Actions não)
- **Diagnóstico**: `gh run view RUN_ID --log` mostra falha na validação do workflow
- **Correção**: ajustar estrutura YAML conforme schema do GitHub Actions

### 2. Problema real do PR

#### 2a. Conflito de merge
- **Sintoma**: `mergeable=false` ou `CONFLICTING`
- **Correção**: `scripts/dependabot/resolve-conflicts.sh $PR_NUMBER`

#### 2b. Diff incompatível
- **Sintoma**: CI falha em gates de lint/build/test
- **Correção**: investigar dependência real, não assumir que é problema do workflow

## Fluxo de diagnóstico

```bash
# 1. Ver checks do PR
gh pr checks $PR_NUMBER

# 2. Ver run do workflow
gh run list --workflow dependabot-auto-merge.yml --limit 5

# 3. Ver log do run específico
gh run view $RUN_ID --log | grep -E "(error|Error|fail|failures|422)"

# 4. Decidir ação baseada no erro
```

## Contrasignal

Nem todo CI vermelho exige correção do PR. Às vezes o problema é a automação que tenta cuidar do PR.
