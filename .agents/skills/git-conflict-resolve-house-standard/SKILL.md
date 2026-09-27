---
name: git-conflict-resolve-house-standard
description: Padrão único da Casa para resolver conflito de PR (dependabot ou humano). Use quando um PR abrir CONFLICTING, quando a main avançar sob um PR aberto, ou quando perguntarem como resolver conflito. Não criar segundo resolvedor, não fazer merge manual fora deste padrão.
metadata:
  type: operational
  version: "1.0"
  owner: SEGREDO/CHEFE
---

# Conflito de PR — padrão único da Casa

Owner do motor: `scripts/dependabot/resolve-conflicts.sh`
Gatilho: `.github/workflows/dependabot-auto-merge.yml`
Registry estruturado de padrões recorrentes: `scripts/dependabot/known-conflict-patterns.json`

Se aparecer um segundo resolvedor, ele é o errado. Este se **atualiza**; não se
duplica.

## A regra que quase ninguém acerta

O motor está **na branch do PR** e faz `git merge origin/main`. Logo:

```text
--ours    = lado do PR    (HEAD)
--theirs  = lado da main  (MERGE_HEAD)
```

Isso é contraintuitivo e já custou caro: a versão anterior do motor tinha os
comentários invertidos em relação ao código — dizia "mantém main" e usava
`--ours`, que aceita o PR.

```text
FAIL_CLOSED_ESCRITO != FAIL_CLOSED_IMPLEMENTADO
```

Efeito real do bug: o default "fail-closed" falhava **aberto**. Um PR que
tocasse `.github/**`, `docs/**` ou `scripts/trigger-fabric/**` tinha a versão
dele aceita automaticamente, sem revisão humana.

## Política de resolução

| Caminho | Lado que vence | Por quê |
|---|---|---|
| `package.json`, `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock` — em qualquer diretório | **PR** (`--ours`) | o PR **é** o bump; manter a main aqui apaga o motivo do PR |
| conflito conhecido não-manifesto | política registrada (normalmente **main**) | preserva owner canônico já provado |
| conflito desconhecido textual (`.md/.txt/.mmd/.jsonl/.csv/.rst/.adoc`) | **ambos** | auto-review preserva os dois deltas; CI/contraprova julga a composição |
| conflito desconhecido de código/config | **PR como candidato** | preserva o delta do PR, mas NÃO promove sem same-head CI/contraprova |

Sem lista de exceções para core. O default já protege tudo que não é manifesto.

## Conflitos recorrentes conhecidos

Os caminhos que já apareceram como feridas operacionais recorrentes ficam
registrados em `scripts/dependabot/known-conflict-patterns.json`. Esse registry
machine-readable é **telemetria/roteamento**, não autorização para um resolvedor
paralelo e não muda a tabela `--ours`/`--theirs`.

Quando um conflito tocar um caminho registrado, o motor emite receipt:

```text
KNOWN_CONFLICT_PATH=true
CONFLICT_ID=<id>
OWNER=<owner>
RESOLUTION_POLICY=<policy>
SOURCE_REF=<evidência>
```

Depois aplica a mesma política única: manifestos/lockfiles preservam o PR;
conflitos conhecidos seguem o registry; conflito desconhecido entra em
`AUTO_REVIEW`. Texto usa composição dos dois lados. Código/config preserva o
lado do PR como **candidato**, nunca como PASS: `git diff --check`, validação
sintática aplicável e SAME_HEAD CI/contraprova decidem a promoção.

```text
UNKNOWN_CONFLICT
→ AUTO_REVIEW
→ APPLY_CANDIDATE
→ COUNTERPROOF
→ SAME_HEAD_CI
→ PASS | REMEDIATE
```

O CHEFE não escolhe manualmente `Accept current / incoming / both` quando a
Casa consegue produzir e testar uma resolução reversível.

## 🪡 COSTURA — UI humana ↔ motor automático

A interface humana e o motor automático são duas superfícies do mesmo fluxo. O nome canônico continua **COSTURA**; não versionar o nome nem criar owner paralelo.

No merge usado por este owner (`branch do PR` como `HEAD`, recebendo `origin/main`):

```text
CURRENT / OURS = branch do PR
INCOMING / THEIRS = main recebida pelo PR
```

Equivalência operacional:

| Ação visível | Efeito real | Equivalente da Casa |
|---|---|---|
| `Update branch` | sincroniza a base atual para a branch do PR; pode criar novo HEAD | `PUT /pulls/{PR}/update-branch` |
| `Accept Both Changes` | compõe os dois blocos daquele conflito; não prova que a composição é correta | `scripts/dependabot/semantic-all-resolver.mjs` quando a política semântica permitir ambos |
| `Mark as resolved` | marca o arquivo como resolvido no índice; não promove o PR | `git add -- <arquivo>` depois de remover os marcadores |
| `Commit merge` | grava a resolução + base recebida na **branch do PR**; muda o HEAD do PR | `git commit --no-edit` + push para `refs/heads/<PR_HEAD_REF>` |
| `Merge pull request` / squash | promove um delta elegível para a base | promoção separada; nunca confundir com a COSTURA |

Cadeados:

```text
UI_LABEL != RESOLUTION_POLICY
ACCEPT_BOTH != BLIND_ACCEPT_BOTH
MARK_AS_RESOLVED != MERGED
COMMIT_MERGE != MERGE_PULL_REQUEST
UPDATE_BRANCH != PROMOTION
UPDATE_BRANCH_WRITES_MAIN=0
COMMIT_MERGE_WRITES_MAIN=0
HEAD_CHANGED_AFTER_COSTURA -> REVIEW_AND_CHECKS_MUST_REMEASURE_CURRENT_HEAD
REVIEWED_SHA != CURRENT_HEAD -> REVIEW_CURRENTNESS=STALE_UNTIL_REVALIDATED
```

A astúcia é separar **mecanismo** de **política**: o botão pode preservar dois lados, mas só classificação do conflito + sintaxe/teste/contraprova dizem se os dois lados devem sobreviver.

### ⏰ TIK-TAK — alimentação contínua

A COSTURA é um laço vivo orientado a eventos, não uma fotografia única. Cada avanço material da `main` reabre a medição das PRs abertas e o `synchronize` do novo HEAD alimenta a próxima etapa.

```text
MAIN_ADVANCES
→ UPDATE_BRANCH_SWEEP
→ PR_HEAD_ADVANCES
→ SYNCHRONIZE
→ REMEASURE_CURRENT_HEAD
→ CONFLICT? RESOLVE/MARK/COMMIT/PUSH
→ SAME_HEAD_CHECKS
→ MAIN_ADVANCES_AGAIN? REENTER_COSTURA
```

```text
TIK_TAK_COSTURA_CONTINUA=true
EVENT_DRIVEN_NEAR_REAL_TIME=true
STRICT_ZERO_LATENCY_REAL_TIME=false
CURRENT_MAIN_REMEASURED_EACH_CYCLE=true
PR_HEAD_REMEASURED_EACH_CYCLE=true
NEW_MAIN_INVALIDATES_OLD_UP_TO_DATE_SNAPSHOT=true
NEW_HEAD_INVALIDATES_OLD_REVIEW_CURRENTNESS=true
NO_STALE_GREEN=true
```

Se a `main` avançar enquanto uma sincronização ainda assenta, isso não é regressão: a rodada corrente fica amarela até remedição, e o próximo evento/recheck continua do último HEAD provado. A meta é convergir continuamente sem transformar um snapshot antigo em verdade eterna.

### 🪬 Ferida CURRENT explícita

O contrato exige `CLASSIFY_EACH_CONFLICT`. O helper `semantic-all-resolver.mjs` executa a composição dos dois lados quando chamado, mas **não decide sozinho** se os lados são semanticamente compatíveis. Portanto `SEMANTIC_ALL_APPLIED=1` prova mecanismo aplicado; não prova, por si só, que `Accept Both` era a política correta para aquele arquivo.

```text
CLASSIFICATION_REQUIRED_BEFORE_SEMANTIC_ALL=true
SEMANTIC_ALL_HELPER_IS_MECHANISM_NOT_POLICY=true
SEMANTIC_ALL_APPLIED != SEMANTIC_COMPATIBILITY_PROVEN
```

## SAME/ALL — reconciliação semântica canônica

O caso provado no PR #1613 vira regra reutilizável do mesmo owner, não um resolvedor novo.

```text
CONFLICTING_PR
→ MEASURE_CURRENT_PR_HEAD_AND_FRESH_MAIN
→ CLASSIFY_EACH_CONFLICT
→ BOTH_SIDES_HAVE_USEFUL_COMPATIBLE_DELTA?
   → YES: SEMANTIC_ALL / PRESERVE_BOTH
   → NO: APPLY_EXISTING_PATH_POLICY_OR_TEST_DISCRIMINANT
→ REMOVE_CONFLICT_MARKERS
→ SYNTAX_OR_FORMAT_VALIDATION
→ TARGETED_TESTS
→ COUNTERPROOF
→ SAME_HEAD_CI
→ REMEASURE_PR_HEAD
→ PASS | REMEDIATE | UNKNOWN
```

```text
SAME_ALL_IS_DEFAULT_FOR_COMPATIBLE_USEFUL_DELTA=true
SAME_ALL_IS_NOT_BLIND_ACCEPT_BOTH=true
CONTRADICTORY_DELTA_REQUIRES_DISCRIMINANT_TEST=true
CONFLICT_MARKERS_AFTER_RESOLUTION=FAIL
RESOLUTION_WITHOUT_TARGETED_TEST=NOT_PROVEN
SAME_HEAD_REQUIRED_AFTER_CONFLICT_RESOLUTION=true
CURRENT_MAIN_MUST_BE_REMEASURED=true
UNKNOWN_REMAINS_UNKNOWN=true
REUSE_THIS_OWNER_FOR_ALL_EQUIVALENT_PRS=true
```

`SEMANTIC_ALL` preserva ambos somente quando os deltas coexistem sem contradição material. Código/config nunca vira PASS só porque a composição foi possível: sintaxe, teste aplicável, contraprova e SAME_HEAD continuam obrigatórios.

## Fluxo canônico

```text
PR abre/atualiza  ->  workflow dispara
                  ->  Update branch contra main
                  ->  conflito? motor único auto-revisa e resolve
                  ->  commit + push na branch do PR
                  ->  synchronize / same-head checks
                  ->  rerun falho transitório uma vez quando aplicável
                  ->  squash apenas pela política de promoção do PR
                  ->  main avança
```

Na mão, quando o runner estiver fora:

```bash
ssh Segredo-VPS "cd /root/CentralDark && bash scripts/dependabot/resolve-conflicts.sh <PR>"
```

## Regras de ferro

```text
UNKNOWN != PASS
ACTION != PROOF
MERGED != CI_PASS
```

- Não criar segundo script de conflito.
- Não `force push` em `main`.
- `NO_CONFLICT` significa que **naquele instante** não havia divergência. Se a
  main avançar depois, medir de novo — não reusar o veredito velho.
- Squash é o botão padrão da Casa. Mas verde do CI é medição, não formalidade:
  se um check aplicável falhou, isso é informação, não obstáculo a ignorar.

## Armadilhas registradas (todas medidas, nenhuma suposta)

1. **`--ours`/`--theirs` invertidos.** Provado com repositório de teste:
   merge de main na branch do PR, `--ours` devolveu o lado do PR e `--theirs`
   o lado da main. Sempre que mexer nesta política, reprovar com um repo
   descartável antes de confiar no comentário do código.

2. **Reinjetar bump por nome de branch.** O motor antigo resolvia o manifesto
   para a main (perdendo o bump) e tentava reaplicá-lo lendo o nome do branch.
   Além de frágil, gravava sempre em `package.json` da **raiz** — corrompendo
   o arquivo errado em PR de subdiretório (`apps/modulos/Bolt/source`).
   Resolvido na origem: o manifesto agora resolve para o lado do PR, que já
   contém o bump.

3. **Lockfile único = conflito em cadeia.** Vários PRs de bump no mesmo
   `pnpm-lock.yaml` conflitam entre si; `@dependabot rebase` não resolve,
   porque rebasear um recria o conflito nos outros enquanto a main avança.
   A cura é **agrupar** (`.github/dependabot.yml`), não resolver um a um.
   E `groups` sem `applies-to` cobre apenas `version-updates`: alerta de
   segurança gera `security-updates` e passa por fora do grupo.

## Adaptação

Realidade nova (outro gerenciador de pacotes, outro lockfile, outro
ecossistema) atualiza **este arquivo e o motor no lugar**. Nunca um segundo.
