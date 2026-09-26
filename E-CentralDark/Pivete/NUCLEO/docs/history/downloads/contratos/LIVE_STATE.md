# LIVE STATE — observado nesta execução

- Repository: `ServerVpss/CentralDark`
- Branch canônica: `main`
- PR #1131: **MERGED**
- Main/merge SHA observado: `9187cb2d4263ca8a5c116acf3f2da7dac902766f`
- Contrato na main contém: `bot_entry.mandatory=true`, `operational_rule_learning.mandatory=true`, `runner_policy.scope=ALL_ACTIVE_ROOT_GITHUB_WORKFLOWS`, `self_healing.scope=ALL_PR_COMMIT_AND_RUNTIME_ELIGIBLE_FAILURES`.
- `porta-de-entrada` cobre `push` em qualquer branch e PRs aplicáveis.

```text
CONTRACT_MERGED_TO_MAIN = PROVEN
CI_BINDING_IN_MAIN = PROVEN
SELF_HEALING_CONTRACT_IN_MAIN = PROVEN
GLOBAL_RUNTIME_INHERITANCE_ALL_ENGINES = NOT_PROVEN
VECTOR_MEMORY_RUNTIME = NOT_PROVEN
LEARNING_HOOKS_RUNTIME = NOT_PROVEN
```

`PACKAGE_PASS != RUNTIME_PASS`.
