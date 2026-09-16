# Receipt — known conflict patterns registry

```text
ID=KNOWN_CONFLICT_PATTERNS_REGISTRY_20260916
MAIN_BEFORE=49d32ab2196e8fbfc4f5f7fefdd90d78ffa31925
OWNER=.agents/skills/git-conflict-resolve-house-standard/SKILL.md
ENGINE=scripts/dependabot/resolve-conflicts.sh
REGISTRY=scripts/dependabot/known-conflict-patterns.json
RUNTIME_APPLICABLE=PARTIAL
FIXED_POINT=NOT_REACHED
```

## Feito

Cristalizado o seed de conflitos conhecidos do SEGREDO/CHEFE como registry
machine-readable consumido pelo motor único do Dependabot, sem criar resolvedor
paralelo.

O motor agora:

- reconhece padrões conhecidos por `CONFLICT_ID`;
- emite receipt com owner, classe, policy, source ref e aplicabilidade runtime;
- preserva manifestos/lockfiles pelo lado do PR quando o conflito é o bump;
- preserva `main` para conflitos conhecidos não-manifesto;
- bloqueia conflito desconhecido como `UNKNOWN_CONFLICT_PATH`, sem auto-resolver.

O CodeRabbit bridge agora inclui o registry no receipt consultivo como sinal de
roteamento, mantendo `REVIEW_IS_NOT_PROOF`.

## Padrões cristalizados

```text
CONFLICT_PATTERNS_CRYSTALLIZED=19
UNKNOWN_CONFLICT_AUTORESOLVE=false
REGISTRY_IS_SECOND_RESOLVER=false
```

Classes cobertas:

- dependency manifest/lockfile bump;
- boot/entrypoint/canonical architecture;
- operational skills;
- MCP source/dist;
- reports/learning;
- Casa/VPS discovery and validators;
- VS Code/Claude harness scripts;
- orphan `scratch/grok-build` gitlink;
- Dependabot workflow single-engine guard.

## Contraprova

```text
bash -n scripts/dependabot/resolve-conflicts.sh
bash -n scripts/dependabot/resolve-conflicts-policy.test.sh
bash -n scripts/dependabot/dependabot-integration-test.sh
node --check scripts/coderabbit-bridge.mjs
node --test scripts/dependabot/fixed-point.test.mjs
git diff --check
bash scripts/dependabot/resolve-conflicts-policy.test.sh
bash scripts/dependabot/dependabot-integration-test.sh
```

Resultado observado:

```text
RESOLVE_CONFLICTS_POLICY_TEST=PASS
DEPENDABOT_INTEGRATION_TEST=PASS
FIXED_POINT_TESTS=4/4 PASS
DIFF_CHECK=PASS
```

O teste descartável provou:

```text
KNOWN_CONFLICT: package.json -> USE_PR_SIDE
KNOWN_CONFLICT: CENTRALDARK_AI_BOOT.yaml -> USE_MAIN_SIDE
KNOWN_CONFLICT: docs/ARQUITETURA/CENTRALDARK-REMOTE-MCP-GATEWAY.md -> USE_MAIN_SIDE
UNKNOWN_CONFLICT: docs/unknown-conflict.md -> BLOCK_REVIEW rc=5
```

## Pendências

```text
CI_HEAD=UNKNOWN_UNTIL_GITHUB_RUNS
RUNTIME_DEPLOYED=NO
HUD_PROJECTION=NOT_UPDATED_IN_PR_1551
GLOBAL_FIXED_POINT=NOT_PROVEN
```

Próximo cursor:

```text
1. push main
2. medir CI do novo HEAD
3. se CI verde, microdeploy apenas dos arquivos runtime-applicable para VPS/canonical-main com backup
4. reconciliar PR #1551 para projetar esses contadores no HUD existente, sem merge enquanto HEAD/checks estiverem instáveis
```
