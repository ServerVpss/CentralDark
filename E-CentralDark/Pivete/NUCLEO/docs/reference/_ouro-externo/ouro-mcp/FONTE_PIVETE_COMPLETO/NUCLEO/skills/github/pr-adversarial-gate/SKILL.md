---
name: pr-adversarial-gate
description: Fechar honestamente um PR de escopo adversarial/auditável com gate determinístico — congelar escopo, validar writer canônico no repo canônico via git cat-file, baixar o HEAD remoto num temp read-only, rodar o gate final (compile + testes + ledger_check + ataques + regressões), e fazer merge normal SOMENTE se tudo verde. Usar quando o Pivete mandar "finalizar PR", "fechar PR honesto", ou um goal de adversarial harness/audit com merge condicional.
---

# PR Adversarial Gate — fechamento honesto com merge condicional

Objetivo: fechar um PR cujo valor é **prova determinística** (harness adversarial, guard canônico, ledger íntegro), sem fabricar PASS de runtime externo e sem incluir alteração não relacionada.

## Quando usar
- Goal tipo "FINALIZAR O PR #N SEM RECOMEÇAR".
- PR de auditoria / adversarial / ledger / guard.
- O Pivete quer merge condicional: só se o gate determinístico passar.

## Princípios (decorar)
- **Não recomeçar.** Não criar branch/PR/worktree/skill/ledger novo. Continuar do HEAD remoto atual.
- **Congelar escopo (ETAPA 1).** O PR prova SÓ o que está no diff. Tudo que não é do escopo (WebUI/docker-compose/Bolt/.env/secret) fica FORA, mesmo que modificado localmente.
- **Runtime externo bloqueado ≠ falha do PR.** Se o runtime do agente não roda por causa de provider/rota (ex: HTTP 404 tool use), registrar como pendência externa (follow-up separado). NÃO usar isso para invalidar as provas determinísticas. NÃO fabricar PASS.
- **Prova antes de merge.** Rodar o gate no HEAD remoto baixado, não no working tree local (que pode ter sujeira).
- **Merge normal.** `gh pr merge --merge` (sem force, sem squash salvo política obrigatória, sem reescrever história). Não incluir arquivo externo. Não deploy.

## Sequência (ETAPAS)

### ETAPA 2 — validar estado real (read-only)
```bash
gh pr view N --repo OWNER/REPO --json number,headRefName,baseRefName,headRefOid,state,files,statusCheckRollup
git fetch origin
# writer canônico existe no repo canônico?
git cat-file -t <WRITER_SHA>          # deve imprimir "commit"
git log --oneline -1 <WRITER_SHA>     # confirma a mensagem
# diff do PR só tem escopo?
git diff --name-only main..HEAD       # rodar no clone do PR
git diff --name-only main..HEAD | grep -iE "webui|bolt|\.env|secret|docker-compose" || echo "NENHUM_ARQUIVO_EXTERNO"
```

### ETAPA 3 — baixar HEAD remoto num temp read-only e rodar o gate
```bash
rm -rf /tmp/prN_gate && mkdir -p /tmp/prN_gate
cd /tmp/prN_gate
git clone --filter=blob:none --no-checkout https://github.com/OWNER/REPO.git
cd REPO
git checkout <PR_HEAD_SHA>
# 1) compilação
python -m py_compile <arquivos>.py
# 2) testes (ver contorno Windows abaixo)
python -m pytest <testes> -q
# 3) ledger_check apontando pro ledger REAL (path Windows puro, ver pitfall)
python ledger_check.py --ledger "E:/caminho/real/uso-ledger.jsonl" --json
```
Exigir: TESTS_PASS, ROUND_1/2, ATTACKS_PREVENTED=5/5, LEDGER_SHA256_UNCHANGED, XP_DELTA=0, ORPHAN/BAD_HASH/DANGLING=0, UNRELATED_FILES=0, PR_HEAD_SHA==TESTED_HEAD_SHA.

### ETAPA 4 — atualizar PR (comentário, não mentir)
`gh pr comment N --repo OWNER/REPO --body-file -` com: PR_HEAD_SHA, WRITER_COMMIT, comandos, resultados, hashes, arquivos de prova, bloqueio honesto do runtime (HERMES_RUNTIME_VERDICT=BLOCKED_EXTERNAL_PROVIDER_404), e "runtime tratado fora deste PR".

### ETAPA 5 — merge + confirmar
```bash
gh pr merge N --repo OWNER/REPO --merge --delete-branch=false
gh pr view N --repo OWNER/REPO --json state,mergeCommit   # state: MERGED
gh api repos/OWNER/REPO/branches/main --jq '.commit.sha'   # == mergeCommit.oid
```

## PITFALLS (capturados 26/07)

- **pytest no Windows dá PermissionError/FileNotFoundError em `tempfile`** mesmo com TMPDIR custom do MSYS (`/tmp/...`). O Python insiste em `C:\tmp\...` ou `AppData\Local\Temp`. Contorno que FUNCIONOU:
  ```bash
  mkdir -p "C:/tmp/pytest_prN/b"
  TMPDIR="C:/tmp/pytest_prN" TEMP="C:/tmp/pytest_prN" TMP="C:/tmp/pytest_prN" python -c "
  import tempfile,os
  os.makedirs('C:/tmp/pytest_prN', exist_ok=True)
  tempfile.tempdir='C:/tmp/pytest_prN'
  import pytest
  raise SystemExit(pytest.main(['-q','-p','no:cacheprovider','--basetemp=C:/tmp/pytest_prN/b','test_x.py','test_y.py']))
  "
  ```
  Usar path Windows real (`C:/...`), NÃO `/tmp` do MSYS.

- **ledger_check reclama "LEDGER_MISSING" com path MSYS (`/e/...`).** Passar path Windows puro (`E:/...` ou `E:\...`).

- **`gh` precisa de auth:** `gh auth status` deve mostrar a conta certa. Token em keyring funciona no Windows.

- **Não confundir "tests ERROR" com "tests FAIL".** ERROR por PermissionError de ambiente NÃO é falha do código do PR — contornar o temp e rodar de novo. Se após o contorno ainda der ERROR/Fail, é falha reproduzível → não mergear, informar o arquivo/exato.

- **MoA reference block aparece bloqueado:** ignorar, não é parte do PR. Responder como agregador (eu).

## SAÍDA FINAL esperada (preencher e entregar)
```
PR_NUMBER=
PR_HEAD_SHA=
TESTED_HEAD_SHA=
CANONICAL_WRITER_COMMIT=
FILES_IN_SCOPE=
UNRELATED_FILES=
TESTS=
ROUND_1=
ROUND_2=
ATTACKS_PREVENTED=
LEDGER_SHA256_UNCHANGED=
XP_DELTA=
LEDGER_INTEGRITY=
HERMES_RUNTIME=
PR_SCOPE_VERDICT=
MERGED=
MERGE_COMMIT_SHA=
FOLLOW_UP=
```
