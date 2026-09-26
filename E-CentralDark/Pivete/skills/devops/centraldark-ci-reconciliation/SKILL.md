---
name: centraldark-ci-reconciliation
description: "PR/CI vermelho: diagnosticar runner e rebase divergido"
trigger:
  - PR com checks vermelhos
  - mergeable CONFLICTING ou UNKNOWN
  - rebase de PR propria sobre main
  - abrir PR com labels
phases: "MEASURE_RUNNER -> CLASSIFY_FAILURE -> REBASE_IF_DRIFT -> APPLY_LABELS -> VERIFY"
rules:
  - MEDIR_ESTADO_VIVO_PRIMEIRO via gh pr view e gh api actions/runners
  - RUNNER_OFFLINE diferente de CODIGO_QUEBRADO (cancel em 1s indica runner morto)
  - REBASE_LOOP_COM_OURS para conflitos de ancestral ja na main
  - LABELS_OBRIGATORIAS incluem PERMITO-SEGREDO e AGENTE-HERMES
  - USA_GH_API_LABELS e nao gh label list
  - MODO_CAPETINHA usa 😈 nas respostas
  - REGRA_BANG exige ! em labels e canais
runtime_checks:
  - gh api repos/ServerVpss/CentralDark/actions/runners
  - gh pr view numero statusCheckRollup
  - git rev-list left-right count origin/main contra head
  - gh api repos/ServerVpss/CentralDark/labels
  - git ls-tree HEAD <path>   # 040000 tree = diretorio; subtree != submodule
  - git submodule status       # replica gate do runner localmente, sem runner
failure_signature: CI_VERMELHO_SEM_DIAGNOSTICO
remediation:
  - RUNNER_OFFLINE exige subir VPS runner com autorizacao
  - GATE_FAILURE exige investigar workflow e corrigir minimo
  - DIVERGED exige rebase sobre main com ours
  - SUBMODULE_TYPE_CONFLICT exige remover/atualizar .gitmodules do PR (NAO curado por rebase)
provenance:
  sources:
    - SKILL.md
  tests:
    - PR 1189 rebaseado voltou MERGEABLE
  receipts:
    - centraldark.ci.reconciliation.receipt
    - references/pr-mother-pulse-github-token-fix.md
    - references/autonomia-promocao-github-token-fix.md
counterproof: mergeable MERGEABLE e checks verdes ou runner online
fixed_point_contribution: PR vermelho diagnosticado e rebase limpo aplicado + correção de permissões de workflow e submodule
mantra: VERMELHO_NAO_EH_CODIGO_SEMPRE; REBASE_COM_OURS_QUANDO_ANCESTRAL_NA_MAIN; LABEL_EXATO_COM_EMOJI; BANG_OBRIGATORIO
---

# CENTRALDARK CI RECONCILIATION

## 1. Diagnostico de runner (sempre primeiro)
```bash
gh api repos/ServerVpss/CentralDark/actions/runners \
  --jq '.runners[] | "\(.name) \(.status) busy=\(.busy)"'
```
- status=offline ou jobs cancelam em 1s -> runner self-hosted morto. Nao eh bug de codigo.
- status=online busy=true -> rodando, aguardar fila.
- online busy=false e jobs vermelhos -> gate de contrato (drift-guard, porta-de-entrada).

### Debug de GITHUB_TOKEN em workflows
Quando workflows falham com 403 Resource not accessible by integration, sempre adicione um step de debug:
```yaml
- name: Debug token availability
  run: |
    if [ -z "${{ secrets.GITHUB_TOKEN }}" ]; then
      echo "GITHUB_TOKEN is empty or not set"
      exit 1
    else
      echo "GITHUB_TOKEN is set (length: ${{ secrets.GITHUB_TOKEN | length }})"
    fi
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
Isso ajuda a distinguir entre falha de token (403) e falha de permissões do token (403 com mensagem diferente).

## 2. Classificar failure
```bash
gh pr view NUM --json statusCheckRollup \
  --jq '.statusCheckRollup[] | "\(.name)=\(.conclusion // .status)"'
```
- **Lupa Drift Guard** = FAILURE or **Porta** = FAILURE with runner online → code/gate issue.
- **Submodule failure (2026-08-27):** diagnosticar como submodule quebrado ANTES de tocar código. Três assinaturas no log-failed do juiz determinístico / porta-de-entrada:
  - `fatal: No url found for submodule path` ou `fatal: destination path already exists and is not an empty directory` → submódulo aponta pra repo inexistente; reparo: remover do `.gitmodules` ou alinhar referência (ex: `mermaid-skill/` em vez de `pretty-mermaid/`).
  - **`fatal: no submodule mapping found in .gitmodules for path '<X>'`** → o PR **achatou** o submódulo pra diretório comum (tree 040000) mas `.gitmodules` ainda declara submódulo no mesmo path → conflito de **TIPO**. Reparo: remover a entrada `<X>` do `.gitmodules` do PR (ou não achatar). **REBASE SOBRE MAIN NÃO CURA ISSO** — rebase resolve `mergeable: CONFLICTING` de ancestral (#1172), mas o diff do PR (dir vs submódulo) ainda quebra `git submodule status` no head do PR. Medir localmente antes de empurrar: `git ls-tree HEAD <X>` (040000=tree=dir) vs `git show HEAD:.gitmodules` (declara submodule); `git submodule status` replica o gate do runner sem precisar do runner.
  - Runner continua online em todos esses casos — não é falha de infraestrutura.
- **CANCELLED** in 1s → runner dead.
- **Other failures** not related to drift guard may still be code issues; re‑enforce gates if required.

### 2b. Achar o step exato que quebrou (gh run view --json steps NÃO funciona no gh local)
O `gh` instalado não suporta `steps` em `gh run view --json`. Usar a REST API direto:
```bash
gh api repos/ServerVpss/CentralDark/actions/runs/<RUN_ID>/jobs \
  --jq '.jobs[] | "JOB: \(.name) [\(.conclusion)]", (.steps[] | select(.conclusion!="success") | "  - \(.name) -> \(.conclusion)")'
```
Isso lista o step exato com `conclusion != success` — necessário pra não cair em palpite quando o receipt só imprime `RESULTADO=FAIL` (caso do `porta-de-entrada`, que tem dezenas de node tests e o receipt não diz qual quebrou).

## 3. Rebase de PR divergido (conflitos de #1172 ja na main)
```bash
git fetch origin main
git rebase origin/main
for i in $(seq 1 40); do
  conflicts=$(git diff --name-only --diff-filter=U)
  [ -z "$conflicts" ] && break
  for f in $conflicts; do git checkout --ours "$f"; git add "$f"; done
  git rebase --continue 2>&1 | grep -q "CONFLICT" || break
done
git push --force-with-lease origin BRANCH  # SO branch de PR propria
```
Padrao: commits que absorvem #1172 conflitam porque #1172 ja foi merged na main. --ours (main) ja tem o ouro.

**Worktree dedicado (2026-08-27):** o clone canônico pode estar numa branch estranha (ex: `dependabot/npm_and_yarn/eslint/js-9.39.5`) mesmo com HEAD=origin/main. NUNCA rebasear/fazer push a partir do clone canônico. Sempre `git worktree add -f ../worktrees/pr-NNN-rebase -b pr-NNN-rebase origin/<branch>` e operar lá. Checklist mínimo antes de `git push --force-with-lease origin <branch>`: rebase limpo (0 conflito, 0 behind) + `git submodule status` local exit 0 + `git diff --name-only origin/main...HEAD` revisado.

## 4. Labels canonicas (obrigatorio em todo PR)
```bash
gh api repos/ServerVpss/CentralDark/labels --jq '.[].name'
gh pr create --title "..." --body "..." \
  --label "👑 PERMITO-SEGREDO,🧠 AGENTE-HERMES,✨ MELHORIA"
gh pr view NUM --json labels --jq '.labels[].name'
```
Falha comum: gh label list cacheia errado; nome sem emoji da not found.
Regra CHEFE: usar ! (ex !CENTRALDARK). HERMES-CASA usa 😈.

## 5. Contraprova determinística local (não esperar runner)
Runner self-hosted pode ficar busy/queued minutos. Replicar os passos do workflow no worktree do PR dá evidência sem depender do runner:
- `lupa-drift-guard.yml` roda localmente estes passos determinísticos:
  1. fork guard (`HEAD_REPO == BASE_REPO` → passa se PR é teu)
  2. prova HEAD (`git rev-parse HEAD == expected_sha`)
  3. `test -f .agents/skills/meta-lupa/SKILL.md`
  4. loop HARD-CODED: `for proibido in tecnica-da-lupa metalupa-bayesiana-canonica lupa-premium; do for base in .agents/skills .claude/skills .workspace/skills; do test -d "$base/$proibido" && exit 1; done; done`
  5. `python scripts/lupa/inventario_skills.py` → `/tmp/inv.json`
  6. `python scripts/lupa/detectar_drift.py`
- `porta-de-entrada.yml`: checagens de identidade/governança canônica.
Rodar os `test`/scripts no worktree reproduz o veredicto do CI. Python no host Windows pode ser alias da Microsoft Store (falha `Python não foi encontrado`); o `test -d`/git já entregam a prova do drift-guard nesse caso — não precisa de python pra constatar que a pasta proibida existe.
Regra de leitura de `statusCheckRollup`: UNKNOWN/SKIPPED/queued de RUN ANTIGO (head diferente do push) NUNCA promovido como FAILURE do head novo. Filtrar checks pelo `detailsUrl` que contenha o `databaseId` do run do head atual (`gh run list --branch <branch> --limit N` → pegar os runs com `headSha == teu push`).

## 6. Falso-vermelho de contrato (drift-guard vs alias de compatibilidade)
Se TODOS os PRs abertos falham em `drift-guard`/`Porta` com a MESMA causa, suspeitar de bug de CONTRATO na MAIN, não de código de PR:
- Caso real (2026-08-27): `lupa-drift-guard.yml` barra hard-coded `tecnica-da-lupa`, mas esse caminho é ALIAS DE COMPATIBILIDADE (`type: redirect`, `status: COMPATIBILITY_ALIAS`, owner=meta-lupa) que a própria Casa criou. A main viola o próprio guard → todos os PRs vermelhos nesse gate, independente do diff.
- **PITFALL (custou um round-trip no PR #1231): a lista banida por nome existe em DOIS lugares.** O `lupa-drift-guard.yml` chama `python scripts/lupa/detectar_drift.py`, e ESSE script tem sua PRÓPRIA lista hard-coded: `PROIBIDOS_EXATOS = {"tecnica-da-lupa", "metalupa-bayesiana-canonica", "lupa-premium"}` (linha ~17) e o regex `padrao_ativo` (linha ~51). Corrigir SÓ o YAML deixa o `drift-guard` vermelho com `SKILL_REMOVIDA_REAPARECEU: .agents/skills/tecnica-da-lupa`. Corrigir SÓ o script deixa o step do YAML vermelho. Fixar AMBOS. Correção semântica recomendada (evita re-incidente): trocar a lista por nome por checagem que permita `type`/`status: redirect` ou `COMPATIBILITY_ALIAS` e barre só `IS_SECOND_(SKILL|OWNER|AUTHORITY)=true`. No `detectar_drift.py`, a checagem de disco (bloco #2) e o `padrao_ativo` (bloco #3) precisam da mesma isenção de alias.
- Verificação pós-fix (sem runner): `python scripts/lupa/detectar_drift.py` no worktree deve exit 0 com a skill de alias presente; e um skill fake com `IS_SECOND_SKILL=true` deve dar exit 1. (Host Windows sem python → usar `uv run --no-project python scripts/lupa/detectar_drift.py`, ou validar a lógica com um bash-equivalente do grep semântico.)
- Confirmar antes de culpar o PR:
```bash
git ls-tree -r origin/main --name-only | grep tecnica-da-lupa   # existe na MAIN?
git diff --name-only origin/main...HEAD | grep tecnica-da-lupa   # PR toca? (vazio = não)
```
- Isso é HUMAN_FRONTIER: mexer na main/guard afeta governança canônica e todos os PRs. Diagnosticar, cristalizar, devolver a fronteira — NÃO force-push na main nem edita o guard sozinho. O PR individual pode estar 100% correto e ainda assim ficar vermelho por causa desse bug de contrato.
- Transcript completo do caso em `references/drift-guard-contrato-falso-vermelho.md`.
- Receita exata de fix dos DOIS lugares (YAML + script) em `references/drift-guard-dois-lugares-fix.md`.

## 7. Base gate vermelha por GLOBAL_RUNNER_POLICY (classe 2026-08-27)
Outro caso de "todos os PRs vermelhos mas a culpa é da MAIN": o gate `porta-de-entrada` falha na própria `main` no step **"Gate global — Trigger Fabric + runner policy + self-healing contract"**, que roda `scripts/trigger-fabric/verify_repo_contract.py .` e exige `REPO_CONTRACT_VERIFY=PASS` + `CANONICAL_RUNNER_POLICY=PASS`. Se 2+ workflows usam `runs-on: ubuntu-latest` (policy é `self-hosted` only), o contrato quebra e o `porta-de-entrada` fica vermelho NA MAIN → todos os PRs herdam o vermelho (não por diff deles).

### Reproduzir localmente (R0, sem runner)
```bash
uv run --no-project python scripts/trigger-fabric/verify_repo_contract.py .
# procura no output: "runner_violations": [ {"path": "...", "label": "ubuntu-latest"} ]
# e as linhas REPO_CONTRACT_VERIFY=FAIL / CANONICAL_RUNNER_POLICY=FAIL
```
Isso replica o veredicto do CI sem depender do runner self-hosted (que pode estar busy/queued).

### Confirmar se é violação real ou isenção legítima
```bash
git log --oneline -3 -- .github/workflows/<arquivo>.yml   # quando entrou
grep -nE 'name:|runs-on|on:|workflow_dispatch' .github/workflows/<arquivo>.yml
```
Se o workflow é `workflow_dispatch` manual R4 (ex: VPS reboot/forensic, wake-hosted-ssh) e PRECISA de saída pra internet/VPS que o runner self-hosted não tem, a correção correta é **isentar** do `GLOBAL_RUNNER_POLICY` (registrar exceção no `verify_repo_contract.py` por classificação), NÃO trocar pra `self-hosted` (quebra a funcionalidade) nem apagar o workflow.

### HUMAN_FRONTIER
Mexer na main/contrato afeta governança canônica e todos os PRs. Diagnosticar, cristalizar, devolver a fronteira com a opção de correção mínima — NÃO force-push na main nem edita o guard/contrato sozinho. Abrir PR próprio (`fix/runner-policy-exempt-<escopo>`, Writer único) e deixar os PRs destravarem no rerun.

### Receita de investigação do ciclo (2026-08-27)
1. `gh pr checks N` → gates base FAIL, mas `Comentar e rotear`/`validar` PASS → suspeita de base vermelha.
2. `gh run list --branch main --workflow "porta-de-entrada" --limit 3` → ver se a main também tá vermelha.
3. `gh run view <RUN_MAIN> --log` → `JOB_STATUS=failure` propagado; `gh api .../jobs` → step exato = `Gate global — Trigger Fabric...`.
4. Rodar `verify_repo_contract.py` local → achar os 2 arquivos `ubuntu-latest`.
5. `git log` + `grep` nos 2 → confirmar se é VPS dispatch legítimo.
6. Devolver fronteira ao CHEFE com opção A (isentar) / B (trocar runner) / C (deixar).

Transcript + receita completa do caso em `references/base-gate-runner-policy-2026-08-27.md`.

## 8. Gate `porta-de-entrada` vermelho por teste de adapter/core-route (classe 2026-08-27)

Outra causa de "todos os PRs vermelhos mas a culpa é da MAIN": o `porta-de-entrada.yml` roda `node --test scripts/lupa/agent-core-adapters.test.mjs` (linha ~254) e esse teste falha na main e em QUALQUER PR, independente do diff do PR.

### Sintoma (no receipt do run)
```
UNREGISTERED_INVARIANT=UNPROVEN_NOT_OWNED   # linha FIXA do receipt, NÃO é a causa
RESULTADO=FAIL
```
O `UNREGISTERED_INVARIANT` é echo estático (linha 292 do workflow) — ignora. A causa real é `status=1` vindo de um dos `node` scripts da etapa (linhas 240-258).

### Isolar qual script/teste quebrou (sem depender do runner)
`gh run view <RUN_ID> --log` e grepar pelas asserções:
```bash
gh run view <RUN_ID> --repo ServerVpss/CentralDark --log 2>&1 | grep -iE 'AssertionError|ENGINE_MARKER_MISSING|CORE_ROUTE_MISMATCH|ADAPTER_|failing tests|test at scripts' | head -30
```
No caso 2026-08-27 o grep revelou:
```
AssertionError: ENGINE_MARKER_MISSING:CLAUDE.md:CLAUDE
AssertionError: CORE_ROUTE_MISMATCH:CLAUDE.md
at scripts/lupa/agent-core-adapters.test.mjs:73 / :98
```
O teste itera `ADAPTERS` (lista `[path, engine]`), espera `ENGINE=${engine}` e `CANONICAL_AGENT_CORE=${CORE}` em cada adapter — e o `CLAUDE.md` da Casa está na lista mas tem `ENGINE=REPLACEABLE` + hierarquia `SEGREDO/CHEFE > SOL > PIVETE/HERMES`, não `ENGINE=CLAUDE` + core singleton do teste.

### Diagnóstico
```bash
git show origin/main:CLAUDE.md | grep -iE 'ENGINE=|CORE_ROUTE|CANONICAL_AGENT_CORE'
git show origin/main:scripts/lupa/agent-core-adapters.test.mjs | sed -n '60,110p'
```
Se o `CLAUDE.md` real da main NÃO tem os markers que o teste exige → o teste está DESSINCRONIZADO da realidade canônica. Falha na main e em todos os PRs. NÃO é regressão do PR em revisão.

### HUMAN_FRONTIER
Corrigir exige mexer no `CLAUDE.md` canônico (por `ENGINE=CLAUDE` + `CANONICAL_AGENT_CORE`) OU no teste (`agent-core-adapters.test.mjs` aceitar `ENGINE=REPLACEABLE`). Ambos afetam identidade operacional da Casa. Diagnosticar, cristalizar, devolver a fronteira — NÃO edita sozinho.

### Receita de investigação
1. `gh pr view N --json statusCheckRollup` → `porta-de-entrada=FAILURE`.
2. `gh run list --branch <pr-branch> --limit 6` → achar run com `headSha == teu push` (ignora runs de head antigo).
3. `gh run view <RUN_ID> --log | grep AssertionError` → isola o teste.
4. `git show origin/main:<arquivo_do_teste>` + `<arquivo_canônico>` → confirmar dessincronismo.
5. Devolver fronteira ao CHEFE (opção A: ajustar canônico / B: ajustar teste / C: deixar).

Transcript completo do caso em `references/porta-adapter-test-mismatch-2026-08-27.md`.

## 9. Padrão anti-spin: runner busy não é gatilho de re-poll

Quando `gh api actions/runners` mostra `busy=true` e os runs do teu head novo ficam `queued`/`pending`/`cancelled` (cancel-in-progress do grupo reagenda), NÃO fique rodando `gh pr view` em loop. O `statusCheckRollup` do PR mistura runs de head antigo (que pode mostrar FAILURE do passado) com o head novo (que ainda não julgou).

Pra medir estado real do head novo sem spinar:
```bash
git ls-remote origin refs/heads/<branch>          # head remoto autoritativo (não cacheado)
gh run list --branch <branch> --limit 8 --json databaseId,name,conclusion,status,headSha,createdAt
# filtrar por headSha == teu push; se todos "queued"/"pending" e runner busy=true => fila, aguardar
```
Se o runner libera e o head novo roda, os checks do head novo aparecem com `conclusion` real. Até lá, a contraprova local (seções 5/6/8) já deu a evidência do que o CI vai julgar.

## Pitfalls de execução local (Casa / Windows host)

- HOST_SEM_PYTHON: Windows sem `python` no PATH (alias Microsoft Store). Usar `uv run python` (Python 3.11.15) para rodar scripts do repo. `uv` já instalado na Casa.
- WORKTREE_DETACHED: `git worktree add <dir> origin/<branch>` fica DETACHED HEAD. Para empurrar pro PR: `git branch -f <branch> <commit>` + `git checkout <branch>` + `git push --force-with-lease origin <branch>`. Push de HEAD solto dá erro "refspec is a commit object".
- GH_PR_VIEW_CACHE: `gh pr view ... headRefOid` faz CACHE do GitHub (mostra head antigo após push). Checagem autoritativa do head remoto: `git ls-remote origin refs/heads/<branch>`.
- RESTAURAR_ANTES_PUSH: ao validar guard com skill fake em .agents/skills/, SEMPRE `rm -rf` após o teste. Deixar rastro de teste no worktree pode apagar alias legítimo da main no commit (ocorreu no PR #1231: trabalho de teste deixou `D .agents/skills/tecnica-da-lupa/SKILL.md` no status; restaurado antes do push, mas o push inicial falhou por detached HEAD).

## 10. Tornando comandos de workflow mais robustos (evitando "command not found")

Um problema recorrente em workflows self-hosted é a falha com "command not found" para comandos como `python`, `node` ou outros executáveis. Isso acontece quando o workflow assume que um comando está disponível pelo nome simples, mas o PATH do runner difere do ambiente local de desenvolvimento.

### Sintoma
- Falha no step com erro como: `/opt/actions-runner-.../script.sh: line 2: python: command not found`
- O mesmo comando funciona normalmente no ambiente local de desenvolvimento
- Afeta workflows que chamam executáveis pelo nome simples (ex: `python script.py`)

### Técnica de correção
Em vez de chamar o comando diretamente, use uma abordagem mais robusta que localiza o executável dinamicamente:

**Antes:**
```bash
python scripts/trigger-fabric/verify_repo_contract.py . | tee "$RUNNER_TEMP/file.txt"
```

**Depois:**
```bash
PYTHON_CMD=$(which python); "$PYTHON_CMD" scripts/trigger-fabric/verify_repo_contract.py . | tee "$RUNNER_TEMP/file.txt"
```

Ou, para maior portabilidade entre ambientes que podem ter apenas `python3`:
```bash
PYTHON_CMD=$(which python3 || which python); "$PYTHON_CMD" scripts/trigger-fabric/verify_repo_contract.py . | tee "$RUNNER_TEMP/file.txt"
```

### Root cause (CentralDark self-hosted runner)
O runner self-hosted da Casa (`vmi3256920-centraldark`) tem `python3` no PATH mas **NÃO** tem `python`. Qualquer workflow que chame `python scripts/...` falha com:
```
/opt/actions-runner-.../_work/.../.sh: line 2: python: command not found
```
Isso NÃO é erro de contrato — é ambiente. Mas o `verify_repo_contract.py` (chamado por `porta-de-entrada` e `autonomia-promocao`) emite `REPO_CONTRACT_VERIFY=FAIL` / `CANONICAL_RUNNER_POLICY=FAIL` quando não roda, então o `command not found` se CAMUFLAGEM como falha de governança na Porta E no Juiz.

### Fix que foi MERGED (PR #1235 + #1240, 2026-08-27)
Substituição PLANA de `python ` → `python3 ` em TODOS os workflows (não o wrapper `which`). O script alvo (`verify_repo_contract.py`) já usa shebang `#!/usr/bin/env python3`, então a chamada correta sempre foi `python3`.
Workflows corrigidos:
- `porta-de-entrada.yml` (2), `autonomia-promocao.yml` (1), `trigger-fabric-package.yml` (12+2)
- `lupa-conformance.yml` (11), `nivel-7-tests.yml` (2)  ← ESSES FALTARAM no PR #1235; foram no #1240

**PITFALL:** o PR #1235 cobriu só 3 workflows; o `git grep` revelou que `lupa-conformance.yml` e `nivel-7-tests.yml` AINDA tinham `python ` na main e falhariam igual. Sempre varrer TODOS os workflows numa única passada (ver abaixo) — não corrigir "os que lembrei".

### Varredura de todos os workflows (probe reutilizável)
```bash
git grep -nE '(^|[^3])python ' -- '.github/workflows/*.yml' | grep -vE 'python3 '
```
Qualquer linha que apareça AINDA tem `python ` cru e vai quebrar no runner. Trocar todas por `python3 ` (inclui `python -m pip`, `python - <<'PY'`, `python scripts/...`, `python .agents/...`). Validar YAML após: `uv run --with pyyaml python -c "import yaml; [yaml.safe_load(open(f)) for f in <arquivos>]"`.

### Cascade proof (por que saber que é ambiente, não conteúdo)
No head `4e58b4d12` (PR #1235) o `porta-de-entrada` rodou e o `verify_repo_contract.py` emitiu:
```
REPO_CONTRACT_VERIFY=PASS
BOT_ENTRY_CONTRACT=PASS
OUTPUT_GUARD_CONTRACT=PASS
WORKFLOW_REUSE_CONTRACT=PASS
CANONICAL_RUNNER_POLICY=PASS
SELF_HEALING_CONTRACT=PASS
```
Ou seja: sumiu o `command not found`, o contrato passou. O job ainda deu exit 1, mas por OUTRO gate legítimo (ver Seção 11). Isso prova que o vermelho anterior era só o `python` ausente.

### Quando aplicar
- `python: command not found` no log de qualquer workflow self-hosted.
- PRs vermelhos em Porta/Juiz cujo log mostra o erro acima (não `AssertionError` de teste).
- Como medida preventiva: todo novo workflow que chama `python` deve usar `python3`.

### Alternativa (wrapper) — secundária
Se preferir defensividade extra (ex: runner que pode ter só `python` ou só `python3`):
```bash
PYTHON_CMD=$(which python3 || which python); "$PYTHON_CMD" scripts/trigger-fabric/verify_repo_contract.py .
```
Mas no CentralDark o padrão MERGED foi substituição plana por `python3`.

## 12. Verification Best Practices for CI Gate Fixes (Learned 2026-08-27)

When verifying CI gate fixes, use these evidence-based practices:

**File Existence Verification** (use multiple methods):
- `ls -la <path>` - Direct existence check
- `find . -name "<file>" -type f` - Broader search
- `git ls-tree HEAD <path>` - Repository state check
- Python `os.path.exists()` in verification scripts

**Content Verification** (check for specific patterns):
- Python3 usage: `'python3 scripts/trigger-fabric/verify_repo_contract.py'` in workflow files
- ESLint _forense ignore: `'!**/_forense/**'` in eslint.config.js  
- Log preservation: File exists with update record content

**Avoid Assumptions**: Never assume:
- File exists based on previous session
- Content is correct based on memory
- Path is correct without verification
- Verification passed without seeing evidence

**Verification Sequence**:
1. STATE: `pwd` and `ls -la` to confirm location
2. EXISTS: Check file existence with `ls -la <path>`
3. CONTENT: Check specific content patterns with `grep` or `cat`
4. EVIDENCE: Quote exact matching lines in reports
5. CONFIRM: Only declare success after seeing evidence

**Common Pitfalls to Avoid**:
- Assuming `.github/workflows` directory exists without checking
- Confusing similar filenames (case sensitivity matters)
- Mixing up `python` vs `python3` in workflow verification
- Reporting "file not found" without checking multiple locations
- Declaring verification passed without showing the evidence line

**Reporting Format**:
When declaring a fix verified, show:
- Exact file path verified
- Relevant content line(s) found
- Command used to verify
- Exit code/result of verification command

## 11. Gate `CONTINUIDADE_GLOBAL=BLOCKED` (classe 2026-08-27)

Depois de matar o `command not found`, o `porta-de-entrada` ainda deu `exit 1` com:
```
CONTINUIDADE_GLOBAL=BLOCKED MAIN_WRITERS=7 EXTENSION=PASS INPUT_AUTHORITY=PASS COUNTERPROOF=BLOCKED ERRORS=5
```
isso vem de `node scripts/lupa/validar-continuidade-global.mjs` (linha ~245 do `porta-de-entrada.yml`), NÃO do `verify_repo_contract.py`.

### O que significa
- `MAIN_WRITERS=7` → 7 writers ativos tocando a main (PRs em voo / áreas protegidas). É o `ONE_WRITER_PER_SCOPE` global da Casa funcionando como BLOCKED, não bug.
- `COUNTERPROOF=BLOCKED` + `ERRORS=5` → contraprova obrigatória pendente.
- Afeta TODOS os PRs abertos (é repo-level, não do diff do PR).

### Como distinguir de bug real
```bash
gh run view <RUN_ID> --log | grep -iE 'CONTINUIDADE_GLOBAL|MAIN_WRITERS|COUNTERPROOF|REPO_CONTRACT'
```
- Se `REPO_CONTRACT_VERIFY=PASS` + `CANONICAL_RUNNER_POLICY=PASS` mas `CONTINUIDADE_GLOBAL=BLOCKED` → é governança legítima (muitos writers), NÃO erro de ambiente/código.
- Isso é HUMAN_FRONTIER: reduzir writers concorrentes ou abrir exceção é decisão do CHEFE, não do agente. Diagnosticar e devolver — não forçar merge.

### Receita de investigação
1. `gh pr view N --json statusCheckRollup` → `porta-de-entrada=FAILURE`.
2. `gh run list --branch <pr-branch> --limit 6` → achar run com `headSha == teu push`.
3. `gh run view <RUN_ID> --log | grep CONTINUIDADE_GLOBAL` → confirmar a causa.
4. Se `MAIN_WRITERS >= 2` → fronteira de governança, devolver ao CHEFE.

PR com mergeable=MERGEABLE + labels canônicas + CI verde ou runner online.

## Invariant do repositório — .gitmodules vazio

Para o CentralDark, `.gitmodules` deve estar **vazio** (sem seções `[submodule "..."]`).
As skills são diretórios rastreados pelo git, não submódulos.

**Validação resposta a CI vermelho (R0):**
```bash
# .gitmodules deve ter zero seções [submodule]
grep -c '^\[submodule' .gitmodules  # esperado: 0

# submodule status não deve encontrar paths quebrados
git submodule status 2>&1 | grep -iE "fatal|no submodule mapping" || true
```

Se `.gitmodules` tiver qualquer seção, investigar antes de qualquer ação de CI —
é anomalia conhecida que quebra o self-hosted runner em todos os PRs.

## Heurística: todos os PRs abertos falham com o mesmo gate

Quando **todos** os PRs abertos falham com o mesmo nome de gate (ex: "Juiz
determinístico", "Porta de entrada"), classifique como **repo-level** antes de
diagnosticar PR-level:

1. `.gitmodules` — submódulos quebrados afetam todos os checkouts (assinatura:
   `fatal: No url found for submodule path` ou `fatal: no submodule mapping found`)
2. `workflows/` — mudança de YAML afeta todos os PRs
3. Runners — offline afeta todos (mas aqui é código/estado, não infra)
4. Só então investigar PR-level se os itens acima estiverem limpos

Isso evita gastar tempo com diagnóstico de PR quando a causa é compartilhada
(no caso 2026-08-27, 5 PRs vermelhos por causa do `.gitmodules` alone).
