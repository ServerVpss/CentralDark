# CentralDark — Pombo Owner Fail-Closed

Pacote completo para fechar a lacuna provada no PR #1136.

## Estado-base

- Repositório: `ServerVpss/CentralDark`
- Base observada: `main@6bff74d4beec72ac0cc08828715f7f5d7f393dfe`
- PR que expôs a falha: `#1136`
- Merge do PR #1136: `a2ce71fb7c921220d878cf16effa69575a03876f`

## Ferida

O `verify_repo_contract.py` validava que o cristal do Pombo continha o texto do caminho:

`docs/CONSCIENCIA/02-PROTOCOLO-HANDOFF-IA.md`

mas não abria/verificava o owner real.

Contraprova observada no review do PR #1136:

```text
DELETE OWNER
→ verify_repo_contract.py ainda PASS
→ FALSO VERDE
```

## Delta deste pacote

```text
OWNER CANÔNICO REAL
→ invariantes de DESTINATION_LOCK / UNKNOWN / PROVENIÊNCIA / NEXT_CURSOR

VERIFICADOR EXISTENTE
→ passa a abrir o owner real

CONTRAPROVA
→ delete owner = FAIL
→ regress invariant = FAIL

WORKFLOW EXISTENTE
→ dispara quando owner/cristal mudam
→ executa contraprova

PACOTE TRIGGER FABRIC EXISTENTE
→ inclui owner + cristal + verifier + counterproof
→ fresh extraction verifica os guards
```

## Não cria

- novo owner;
- novo gate;
- novo workflow;
- novo cérebro;
- nova autoridade;
- novo sistema paralelo.

## Estrutura

- `PATCH_TREE/` — arquivos prontos para substituir/adicionar no repo.
- `TOOLS/APPLY-LOCAL.ps1` — aplica somente em worktree limpa e cria backup.
- `TOOLS/PROVE-LOCAL.ps1` — roda prova local.
- `DOCS/PR-BODY.md` — body pronto para PR.
- `DOCS/VEREDITO.md` — estado em `PROVADO / QUEBRADO / EVIDÊNCIA FALTANTE`.
- `MANIFEST.json` + `SHA256SUMS.txt` — integridade do pacote.
- `verify-this-package.py` — verifica o próprio ZIP extraído.

## Aplicação local segura

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\TOOLS\APPLY-LOCAL.ps1" -RepoRoot "E:\CentralDark"
```

Depois:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\TOOLS\PROVE-LOCAL.ps1" -RepoRoot "E:\CentralDark"
```

Nenhum script faz commit, push, reset ou deploy.

## PASS esperado

```text
REPO_CONTRACT_VERIFY=PASS
POMBO_CANONICAL_HANDOFF_OWNER=PASS
POMBO_CHECKSUM_HANDOFF_CONTRACT=PASS

BASELINE_OWNER_VERIFICATION=PASS
DELETE_OWNER_FAILS_CLOSED=PASS
REGRESSED_OWNER_FAILS_CLOSED=PASS
POMBO_OWNER_COUNTERPROOF=PASS

LOCAL_PROOF=PASS
```

## Limite real

`API.CENTRALLDARK / Hermes / Windows / VPS runtime universal = EVIDÊNCIA FALTANTE`

Contrato em Git e CI não prova ativação física universal.
