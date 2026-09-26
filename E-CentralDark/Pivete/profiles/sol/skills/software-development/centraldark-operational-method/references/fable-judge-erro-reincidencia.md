# FABLE JUDGE — Erro Reincidência Pattern

## Contexto
Validado na sessão 2026-08-30 durante missão `CASA_GITHUB_CARACOL_RECONCILIATION`. Adicionado step no workflow `porta-de-entrada.yml` para rodar testes de reincidência de erro registrado.

## Pattern do FABLE JUDGE

### Conceito
> Erro registrado não pode reincidir sem ser detectado.
> JUDGE read-only, EXECUTOR_CANNOT_SELF_APPROVE, JUDGE_DOES_NOT_MUTATE.

### Workflow Integration (porta-de-entrada.yml)

```yaml
- name: Testar juiz de reincidência de erro registrado
  run: node --test scripts/lupa/erro-reincidencia.test.mjs

- name: FABLE JUDGE — erro registrado não pode reincidir
  run: |
    set -uo pipefail
    BASE="${{ github.event.pull_request.base.sha || github.event.before }}"
    HEAD_REF="${{ github.event.pull_request.head.sha || github.sha }}"
    if [ -n "$BASE" ] && [ "$BASE" != "0000000000000000000000000000000000000000" ]; then
      node scripts/lupa/erro-reincidencia.mjs --intervalo "$BASE..$HEAD_REF"
    else
      echo "REINCIDENCIA_ESCOPO=SEM_BASE — auditando apenas o HEAD"
      node scripts/lupa/erro-reincidencia.mjs --intervalo "$HEAD_REF~1..$HEAD_REF"
    fi
```

### Detectors Implementados (20 testes passando)

| Detector | Descrição |
|---|---|
| `padrao_proibido` | Detecta padrões proibidos em diff (ex: `rm -rf` sem recibo) |
| `delete_sem_recibo` | `rm -rf` sem recibo citado = reincidência |
| `commit_anuncia_prova_sem_conteudo` | Commit alega prova mas diff é `+{}` × 3 |

### Contraprovas que Forçaram Correções

1. **Não pegava próprio E09**: Diff real era `+{}` × 3 → não-vazio, contava 3 substantivas e passava no limiar 3. **Fix**: Substância = conteúdo (≥3 chars alnum), não caractere.

2. **Acusava 17 scripts legados com `rm -rf`**: HISTORICAL != CURRENT. **Fix**: Com `--intervalo`, detectores olham só o delta.

3. **Acusava commit 328dfb027** (remediação do falso verde). **Fix**: Commit com remoções não é falso verde.

### Matriz de Contraprova (5 commits da branch)

| Commit | Tipo | Detector | Resultado |
|---|---|---|---|
| `41f1f7e85` | Falso verde real | ACUSA | OK |
| `2dd6a7273` | Restauro provado | passa | OK |
| `4253d9ace` | Registro de erros | passa | OK |
| `328dfb027` | Remediação | passa | OK |
| `a9e09a084` | Causa-da-causa | passa | OK |

### Princípios

```text
JUDGE_READ_ONLY=true
EXECUTOR_CANNOT_SELF_APPROVE=true
JUDGE_DOES_NOT_MUTATE=true
KNOWN_BAD → MUST_FAIL
KNOWN_GOOD → MUST_PASS
UNKNOWN != PASS
HISTORICAL != CURRENT
```

### Usage

```bash
# Rodar testes unitários
node --test scripts/lupa/erro-reincidencia.test.mjs

# Auditoria em intervalo de commits
node scripts/lupa/erro-reincidencia.mjs --intervalo "BASE..HEAD"

# Auditoria apenas HEAD
node scripts/lupa/erro-reincidencia.mjs --intervalo "HEAD~1..HEAD"
```

### Integração CI (Gate)

Adicionar no workflow `porta-de-entrada` (já feito):

```yaml
- name: Testar juiz de reincidência de erro registrado
  run: node --test scripts/lupa/erro-reincidencia.test.mjs

- name: FABLE JUDGE — erro registrado não pode reincidir
  run: |
    set -uo pipefail
    BASE="${{ github.event.pull_request.base.sha || github.event.before }}"
    HEAD_REF="${{ github.event.pull_request.head.sha || github.sha }}"
    if [ -n "$BASE" ] && [ "$BASE" != "0000000000000000000000000000000000000000" ]; then
      node scripts/lupa/erro-reincidencia.mjs --intervalo "$BASE..$HEAD_REF"
    else
      echo "REINCIDENCIA_ESCOPO=SEM_BASE — auditando apenas o HEAD"
      node scripts/lupa/erro-reincidencia.mjs --intervalo "$HEAD_REF~1..$HEAD_REF"
    fi
```

### Verificação

```bash
# 20 testes devem passar
node --test scripts/lupa/erro-reincidencia.test.mjs
# ✔ 20 pass, 0 fail
```