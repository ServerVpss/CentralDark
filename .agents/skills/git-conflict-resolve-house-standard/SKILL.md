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
COSTURA_NAME_ONLY=true
NO_VERSIONED_COSTURA=true
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


## PR #1900 — marcador previamente commitado não é conflito novo de índice

**Evidência 12/11/2026:** `mcp-admin.js` em `17e744c0` já contém um bloco literal
`<<<<<<< HEAD / ======= / >>>>>>> origin/main`. Além disso, a simulação
`git merge-tree --write-tree` contra `5442e1c6` identificou conflitos em
`mcp-admin.js` e `mcp-diagnostics.js`. São **duas classes diferentes**.

O classificador `scripts/dependabot/classify-conflict.mjs` lê o blob imutável
`HEAD:path` e registra `committed_marker_state`, `committed_marker_blocks`
e linhas dos marcadores. Em código/config alterado pelo PR, o resolvedor faz
preflight antes de executar merge: qualquer marcador já commitado bloqueia
`--apply` com `NO_PUSH_ON_COMMITTED_MARKERS=1` e saída 20. Mesmo um padrão
anteriormente conhecido não pode selecionar cegamente um lado nesse caso.

**Padrões conhecidos relevantes:** catálogo MCP (`mcp-admin.js`), diagnóstico
(`mcp-diagnostics.js`) e índice central (`.agents/library-index.json`).
`SAFE_RESOLUTION=REVIEW` significa **YELLOW** e exige discriminação pelo
owner, não é permissão para substituir o código pela main nem unir texto às cegas.
No #1900, preservar a rota nativa Tailscale/fallback sob autorização e a rota
nova `CASA_NATIVE_PID_INVENTORY`, com cardinalidade e testes de catálogo;
nunca repetir `RDC_DESKTOP_COMMANDER`.

Receita: medir `HEAD` e `main` atuais -> comparar intenções dos dois lados ->
compor em worktree temporário -> remover marcadores -> `git diff --check` e
`node --check` -> validar unicidade/escopo do catálogo -> same-HEAD CI ->
receipt/decisão de publicação separada. Nada disso autoriza push de PR nem main
sem gates. `--dry-run` atual prova somente refs e nenhuma escrita; **não**
afirma ter conciliado conteúdo. `UNKNOWN != PASS`.

Referências Git: https://git-scm.com/docs/git-merge-tree (não altera índice/
worktree; status 1 indica conflitos) e
https://www.kernel.org/pub/software/scm/git/docs/gitmergeconflicts.html
(marcadores são produto de conflito textual, não prova de composição semântica).

## Primary-source-first — contrato executável da COSTURA

```text
PRIMARY_SOURCE_REQUIRED_BEFORE_RESOLUTION=true
PRIMARY_SOURCE_SCOPE=CONFLICTED_FILE_HISTORY
PRIMARY_SOURCE_PR=git_log_PR_HEAD_for_conflicted_path
PRIMARY_SOURCE_MAIN=git_log_MAIN_HEAD_for_conflicted_path
REGISTRY_PROVENANCE=SOURCE_REF_PLUS_PRESERVE_RULE
UNKNOWN_INTENT_OR_MISSING_HUNK=YELLOW_NO_PUSH
TRADEOFF_REQUIRED_FOR_CURRENT_OR_INCOMING=true
PROJECT_BEHAVIOR_TESTS_REQUIRE_SAME_HEAD_CI=true
TRUSTED_HELPERS_AND_REGISTRY_FROM_RESOLVER_CHECKOUT=true
```

O motor usa os commits de cada lado como fonte primária mínima, registrando
`PR_HEAD`, `MAIN_SHA`, `MERGE_BASE`, mensagens e quantidade de hunks **antes**
de aplicar a estratégia. Para padrões conhecidos exige `SOURCE_REF` e
`PRESERVE_RULE` no registry. Quando a intenção não estiver sustentada por
histórico verificável, ou o conflito não for textual, a resolução fica
**YELLOW, sem push**. A evidência por arquivo não equivale a prova semântica
por hunk: conflitos novos ou incompatíveis precisam de discriminante e replay.

`CURRENT`/`INCOMING` registram explicitamente qual lado foi descartado;
`BOTH`/`STRUCTURED` só são permitidos por política homologada. Não inventar
comportamento para acomodar conflito. Nunca tratar sintaxe verde como testes
comportamentais verdes: os testes do projeto rodam no CI sem privilégios no
**novo HEAD**, não dentro do job privilegiado `pull_request_target`.

A regra externa “nunca abortar” não se aplica cegamente aqui: o trabalho é
feito num worktree efêmero; quando faltar prova, abortar **somente esse merge
isolado**, descartar o worktree e impedir push é a fronteira segura.

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
ssh Segredo-VPS "cd /root/CentralDark && bash scripts/dependabot/resolve-conflicts.sh --dry-run <PR>"
# Somente apos autorizacao e contraprova:
ssh Segredo-VPS "cd /root/CentralDark && bash scripts/dependabot/resolve-conflicts.sh --apply <PR>"
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


## 💎 Método reutilizável da COSTURA autônoma

A síntese portátil/ensinável deste owner vive em:

`.agents/skills/centraldark-autonomous-conflict-costura/SKILL.md`

Esse skill é **METHOD_ADAPTER**, não segundo resolvedor. Ele formaliza o ciclo
`CURRENT|INCOMING|BOTH|STRUCTURED|YELLOW`, o aprendizado por replay e a
fronteira amarela. Owner, motor, registry e Judge continuam sendo os desta
skill canônica.

```text
METHOD_SKILL_IS_NOT_SECOND_OWNER=true
METHOD_SKILL_IS_NOT_SECOND_RESOLVER=true
AUTONOMOUS_KNOWN_CONFLICTS=true
UNKNOWN_CONFLICT_STOPS_YELLOW=true
PROVEN_YELLOW_RESOLUTION_ENTERS_EXISTING_REGISTRY=true
```

## COSTURA checkout sujo: simulação e resolução em árvore isolada (13/11/2026)

O mesmo owner `scripts/dependabot/resolve-conflicts.sh` atende a conflitos
de PR **e** a reconciliação de Casa/VMware, sem segundo motor. Primeiro criar
um checkpoint rastreado por `git stash create`, fixar seu SHA em
`refs/centraldark/checkpoints/` e atualizar apenas `origin/main` com fetch.
Não usar `stash push/pop` nem `git reset --hard`.

```bash
# Dez frentes de leitura por host; writer único dentro do motor.
bash scripts/dependabot/resolve-conflicts.sh \
  --checkout-dry-run MAIN_SHA CHECKPOINT_SHA -- docs/arquivo.md
bash scripts/dependabot/resolve-conflicts.sh \
  --checkout-apply MAIN_SHA CHECKPOINT_SHA -- docs/arquivo.md
```

- `--checkout-dry-run` apenas planeja a resolução de um caminho; pode gerar
  objetos Git da simulação, mas não altera HEAD, índice, arquivos ou refs.
- `--checkout-apply` exige SHAs completos, checkpoint cujo pai seja o HEAD
  atual, readback remoto da main, arquivo rastreado e não staged, hash local
  igual ao snapshot **ou à main atual**, com prova por blob, e lock de writer
  único compartilhado com COSTURA PR.
- Caminho seguro adicional: se o **blob atual do worktree é exatamente igual ao
  blob da main** e o owner não está staged, o motor aceita esse blob na árvore
  candidata mesmo quando o checkpoint antigo divergia. A igualdade por SHA é
  obrigatória; nunca aplicar `--theirs` por conveniência.
- Fora desse caso, apenas inserções textuais de **um hunk com um lado vazio**
  são elegíveis (`.md`, `.txt`, `.json` com parse). Conflitos de duas
  alterações materiais, exclusões, arquivo divergente sem prova, sintaxe
  inválida e mais de um hunk permanecem YELLOW.
- A aplicação atualiza **somente** uma árvore Git candidata em
  `refs/centraldark/checkpoints/costura-<main>-<snapshot>-tree`, com
  índice temporário, escrita por path, `git diff --check`, CAS e readback.
  Não reescreve os arquivos locais nem faz commit, merge ou push.
- Conflito resolvido na árvore candidata **não equivale** a checkout
  sincronizado. Restantes incluem conflitos estruturais sem marcadores;
  contabilizar apenas arquivos efetivamente modificados no candidato.
- Antes de publicar, resolver todos os conflitos restantes por owner,
  executar os testes afetados, conferir a árvore limpa, passar pelos gates
  de revisão e só então avançar o checkout e medir os SHAs.
- Os fixtures continuam no `resolve-conflicts-policy.test.sh` existente.

`DRY_RUN != APPLY` · `TREE_RESOLVED != HEAD_SYNCED` ·
`SINGLE_WRITER_PER_SCOPE` · `UNKNOWN != PASS`.

## COSTURA sem merge: auditoria de base e indice isolado

A falha observada em 11/11/2026 mostrou um caso diferente de conflito de PR:
o checkout da Casa tinha HEAD local divergente da main remota. O comando
`git diff --cached --check` comparou o indice isolado contra o HEAD local,
misturando erros preexistentes de outras missoes. Nao era conflito de merge.

O **mesmo motor** `scripts/dependabot/resolve-conflicts.sh` possui agora
o modo somente leitura `--audit-index`, sem novo resolvedor ou writer:

```bash
# GIT_INDEX_FILE aponta para indice temporario construido pelo caller
# com git read-tree <SHA_BASE> e update-index apenas dos arquivos permitidos.
REPO_DIR="$REPO" GIT_INDEX_FILE="$INDEX_ISOLADO" \
  bash scripts/dependabot/resolve-conflicts.sh \
  --audit-index "$SHA_BASE" refs/heads/main -- "caminho/arquivo.md"
```

- A base e obrigatoriamente um SHA completo, nao HEAD implicito.
- O motor compara `git diff --cached --check "$SHA_BASE"` e valida
  todos os paths alterados, rejeitando arquivos fora do escopo.
- `refs/heads/main` e lido do remoto antes do PASS; drift bloqueia.
- `-` no lugar da referencia remota exige modo local-only explicito.
- Exige GIT_INDEX_FILE isolado; nunca troca o indice normal da Casa.
- Nao executa merge, commit, reset, checkout, stash, push ou escrita.
- O HEAD local divergente e metadado de diagnostico, nao base da prova.
- Os testes do modo novo vivem no `resolve-conflicts-policy.test.sh`
  existente. Reutilizar a COSTURA para auditorias similares de branches,
  checkouts, staging, cherry-pick candidato e publicacoes por indice isolado.

```text
WRONG_IMPLICIT_HEAD_BASE != CONFLICT
REMOTE_PIN != LOCAL_HEAD
ISOLATED_INDEX != CASA_INDEX
SCOPED_DIFF_CHECK + REMOTE_READBACK -> REVIEWABLE_CANDIDATE
AUDIT_PASS != PUBLISHED
```
## COSTURA: preflight read-only, escritor unico e substituicao atomica

Essas garantias pertencem ao **metodo de conflito** e aos seus auxiliares
canônicos, nao ao reconciliador de notas. O motor continua unico:
`scripts/dependabot/resolve-conflicts.sh`.

```bash
# Preflight read-only: consulta SHA da main, branch do PR e ref de pull.
# Nao busca refs, cria worktree, altera indice, resolve conflitos ou publica.
PR_HEAD_REF=dependabot/exemplo REPO_DIR=/root/CentralDark \
  bash scripts/dependabot/resolve-conflicts.sh --dry-run 123

# Somente com autorizacao explicita; o workflow existente usa --apply.
PR_HEAD_REF=dependabot/exemplo REPO_DIR=/root/CentralDark \
  bash scripts/dependabot/resolve-conflicts.sh --apply 123
```

- `--dry-run` comprova somente preflight e SHAs atuais. A classificacao de
  conflitos permanece `UNPROVEN_NO_MERGE`; nao declarar resolucao PASS.
- `--apply` exige numero de PR valido e branch que nao seja `main`.
- O bloqueio exclusivo por `mkdir` atomico protege a raiz dos worktrees.
  Segundo escritor recebe `BLOCKED_COSTURA_WRITER_LOCK_BUSY` antes do fetch.
  Se houver encerramento abrupto, lock residual **bloqueia** ate auditoria;
  nao remover automaticamente nem roubar lock.
- Os auxiliares existentes `semantic-all-resolver.mjs` e
  `structured-conflict-resolver.mjs` fazem escrita temporaria no mesmo
  diretorio, `fsync`, `rename` atomico e readback do conteudo.
- `--audit-index` permanece read-only e independente de `--apply`.
- Nenhuma dessas etapas publica diretamente na `main`.

```text
DRY_RUN != RESOLVED
PREFLIGHT_PASS != SAME_HEAD_CI_PASS
LOCK_BUSY -> BLOCKED_BEFORE_FETCH
ATOMIC_REPLACE + READBACK != REMOTE_PUBLISHED
NO_EXPLICIT_APPLY -> BLOCKED
```

Regressoes comprovadas nos fixtures do
`scripts/dependabot/resolve-conflicts-policy.test.sh` existente.

## Python da COSTURA: selecao validada, sem confundir com Hermes (11/11/2026)

Contraprova da Casa: no Git Bash, `python3` foi resolvido em
`WindowsApps/python3`, iniciando um Python 3.14.7 incompleto
(sem `Lib/enum.py`). Esse interpretador **nao** era o runtime de Hermes.

O Hermes possui ambientes Python proprios e validos (3.14.9, venv 3.14.7 e
venv 3.11.16), mas o resolvedor de PR **nao depende** desses ambientes.

No mesmo motor `scripts/dependabot/resolve-conflicts.sh`, a funcao
`costura_python` verifica versao Python 3.8+ e imports
`ast`, `enum` e `pathlib`, tentando `python3` antes de `python`.
Somente um interpretador aprovado executa as validacoes YAML/Python.
A variavel opcional `CENTRALDARK_COSTURA_PYTHON` permite selecionar
explicitamente um interpretador, inclusive um ambiente Hermes, mas uma
selecao invalida **bloqueia** o processo; nao faz fallback silencioso.

```text
PYTHON3_COMMAND_FOUND != PYTHON_STDLIB_COMPLETE
HERMES_PYTHON_AVAILABLE != COSTURA_USES_HERMES
COSTURA_PYTHON_SELECTED=verified_runtime
INVALID_PYTHON -> BLOCKED_COSTURA_NO_VALID_PYTHON
NO_GLOBAL_PYTHON_PATH_CHANGE=true
```

A prova de regressao reside no `resolve-conflicts-policy.test.sh` existente,
que exige `COSTURA_PYTHON_SELECTED` no receipt do resolver.
