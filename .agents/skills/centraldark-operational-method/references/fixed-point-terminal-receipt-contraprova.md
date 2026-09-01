# Fixed Point local/terminal — contraprova e separação de escopo

**Owner canônico:** `.agents/skills/centraldark-operational-method/SKILL.md`

Esta reference absorve somente o delta operacional útil de um handoff/screenshot local. Não cria nova skill, workflow, cérebro, gate ou autoridade.

```text
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
UNKNOWN != PASS
ACTION != PROOF
TERMINAL_RECEIPT != CANONICAL_REPO_PROOF
BOOT_CONTEXT != ARTIFACT_SCOPE
```

## 1. Conteúdo misto não contamina a Casa

Uma entrada pode carregar, ao mesmo tempo:

- cabeçalho `CENTRALDARK_AI_BOOT` / governança da Casa;
- uma tarefa de domínio sem relação material com CentralDark (por exemplo, exercício matemático);
- receipts ou screenshots de outra missão.

A governança pode reger **como** o agente trabalha, mas isso não torna todo conteúdo da tarefa conhecimento da Casa.

```text
CENTRALDARK_BOOT_PRESENT
→ APPLY_GOVERNANCE_TO_EXECUTION
→ CLASSIFY_TASK_DOMAIN
→ MATERIAL_TO_CENTRALDARK ? RECONCILE : KEEP_OUT_OF_HOUSE_KNOWLEDGE
```

Portanto:

```text
UNRELATED_TASK_OUTPUT != CENTRALDARK_DELTA
MATH_SOLUTION != ARCHITECTURE_DELTA
BOOT_HEADER != LICENSE_TO_INGEST_ALL_CONTENT
```

O conteúdo matemático do handoff observado não entra no PR/owner porque não apresenta relação material demonstrada com a arquitetura, runtime, governança ou continuidade da CentralDark.

## 2. Receipt local de Fixed Point

Foi observado um receipt de terminal declarando, entre outros campos:

```text
HEAD=a5756eaa18b7044fff984acee56e90d8540a6307a
TESTS=health_check.test.sh 17/17
CI=porta-de-entrada.yml + autonomia-promocao.yml verdes
OWNER=SegredoiDev
NEXT_CURSOR=nada
PROCESSINGguard_can_approve=false
```

Ao consultar o repositório canônico `ServerVpss/CentralDark`, o SHA `a5756eaa18b7044fff984acee56e90d8540a6307a` **não resolveu como commit do repositório nesta medição**.

Classificação correta:

```text
LOCAL_TERMINAL_RECEIPT=OBSERVED
REPO_COMMIT_IDENTITY=UNRESOLVED
REPO_FIXED_POINT_PROVEN=false
LOCAL_FIXED_POINT_CLAIM=HISTORICAL_OR_LOCAL_ONLY
```

Isso não acusa o receipt de falso. Ele pode pertencer a clone/local branch/outro estado ainda não publicado. Apenas impede promovê-lo a fato do GitHub sem reconciliação.

## 3. Regra de identidade obrigatória

Quando um agente declarar `FIXED_POINT`, registrar e provar:

```text
repository
branch
head_sha
base_sha
writer
receipt_id
observed_at
local_or_remote
```

Se o claim tiver efeito sobre PR/main:

```text
HEAD_RESOLVES_IN_CANONICAL_REPO=true
SAME_HEAD_TESTS_PROVEN=true
SAME_HEAD_CI_PROVEN=true
WRITER_SCOPE_RECONCILED=true
```

Caso contrário:

```text
FIXED_POINT_SCOPE=LOCAL_ONLY|UNKNOWN
```

## 4. Aprovação é autoridade separada

O campo observado:

```text
PROCESSINGguard_can_approve=false
```

é compatível com um agente **observar e relatar** convergência, mas não autoriza aprovação/merge/promoção.

```text
CAN_OBSERVE_FIXED_POINT != CAN_APPROVE_PROMOTION
FIXED_POINT_REPORTED != MERGE_AUTHORIZED
```

## 5. CI escrita no terminal não substitui API/runner

Texto local dizendo que workflows estão verdes pode ser receipt útil, porém, quando a promoção depende do GitHub:

```text
TERMINAL_CI_CLAIM
→ RESOLVE HEAD
→ QUERY CANONICAL CI/RUN
→ SAME_HEAD ? PROVEN : UNKNOWN
```

Se não houver status/run observável no HEAD canônico, manter `UNKNOWN` em vez de converter a linha do terminal em CI remoto provado.

## 6. Fixed point é por missão

`NEXT_CURSOR=nada` pode encerrar aquela missão. Não significa que a Casa deixa de aprender ou que outro PR/runtime não tenha trabalho material.

```text
MISSION_FIXED_POINT=true
!=
GLOBAL_NO_MORE_LEARNING
```

## 7. Gate mínimo para receipts externos/locais

```yaml
FIXED_POINT_RECEIPT_GATE:
  receipt_observed: true
  repository: ServerVpss/CentralDark|UNKNOWN
  branch: <branch-ou-UNKNOWN>
  head_sha: <sha>
  head_resolves_in_repo: true|false|UNKNOWN
  same_head_tests: PASS|FAIL|UNKNOWN
  same_head_ci: PASS|FAIL|UNKNOWN
  writer_scope: RECONCILED|DRIFT|UNKNOWN
  approval_authority: true|false|UNKNOWN
  scope: REPO|LOCAL_ONLY|HISTORICAL|UNKNOWN
  verdict: PASS|BLOCKED|UNKNOWN
```

`PASS` para promoção de repositório exige identidade do HEAD + provas do mesmo HEAD. Screenshot/terminal sozinho preserva evidência, mas não sobe de camada sem a ponte causal.
