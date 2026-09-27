# Receipt — PR Review Finding Runtime

ID=PR_REVIEW_FINDING_RUNTIME_20260916
STATUS=SOURCE_CRYSTALLIZED_RUNTIME_TEST_REQUIRED
OWNER=scripts/coderabbit-bridge.mjs
JUDGE=META-LUPA/REALIDADE

## Intenção

Unificar o padrão útil observado em PRs estruturados sem criar segundo cérebro:
PR/CodeRabbit/Dependabot produzem candidatos estruturados; Hermes reproduz/testa/contraprova; somente depois um finding pode alimentar Writer/receipt/histórico.

## Fluxo

```text
PR INTENT
  -> REVIEW FINDING (CANDIDATE)
  -> coderabbit-bridge.mjs
  -> Signal Watcher
  -> Hermes reproduce/test/counterprove
  -> Meta-Lupa/Reality
  -> receipt + next_cursor
```

## Schema

`centraldark.review-finding.v1` preserva PR/head/base, intenção, critérios de aceitação, finding, proveniência, verificação, owner/capability e próximo cursor.

## Invariantes

```text
REVIEW != PROOF
CURRENT_HEAD > REVIEW_SNAPSHOT
UNKNOWN != PASS
DEPENDABOT != CODERABBIT
ONE_OWNER_PER_CAPABILITY
WRITER != JUDGE
```

- CodeRabbit continua REVIEW_ONLY.
- Dependabot continua com o owner único `.agents/skills/git-conflict-resolve-house-standard/SKILL.md` + `scripts/dependabot/resolve-conflicts.sh`.
- Ambos convergem no envelope de finding; não convergem em autoridade.
- Finding velho que não reproduz no HEAD atual deve virar STALE/REFUTED/mineral, nunca correção automática cega.

## Prova esperada

1. `node --check scripts/coderabbit-bridge.mjs`
2. `node --test scripts/coderabbit-bridge.test.mjs`
3. parser do workflow Dependabot
4. parser do workflow Hermes Signal Watch
5. execução runtime com evento sintético sem secret, gerando `review_finding.state=CANDIDATE` e Signal Watcher receipt.

SOURCE_PASS != CI_PASS != DEPLOYED != RUNTIME_PROVEN
