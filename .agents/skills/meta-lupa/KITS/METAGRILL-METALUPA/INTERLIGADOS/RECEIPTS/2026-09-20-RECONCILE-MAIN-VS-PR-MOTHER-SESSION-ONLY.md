# 🪬 RECONCILE — main vs PR-MÃE / somente sessão atual

PR_MOTHER=#1562  
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current  
MOTHER_HEAD_AT_COMPARE=0b0d8e427263d69941bd61d11330e9ff23cf75e9  
MAIN_HEAD_AT_COMPARE=9b9c0c9b64615a7b1733d7dcc3b988159c6b112f

## Compare

status=diverged  
main ahead_by=56  
mother behind_by=16  
merge_base=65ff45dbab3c1b24b01b08cb56b5e96f4698616a

## Interpretação

Não é permitido inferir que os 56 commits de main pertencem a esta sessão. O compare mostra muitos arquivos de produto/runtime não relacionados ao erro de ledger.

O cone causal desta remediação é restrito aos commits/arquivos de cristalização desta sessão que foram enviados ao default branch por branch indefinida.

## Arquivos de sessão ausentes no PR-MÃE

O compare mostra como ADDED no lado main, entre outros da sessão:

- BUSCA-01-GITHUB-404-OWNER-DUPLICADO
- BUSCA-02-GITHUB-TOOLS-SEM-CONTRAPROVA
- BUSCA-03-GITHUB-TEST-BUILD-PATTERN
- BUSCA-04-CI-HEAD-9397A27
- BUSCA-COGNITIVE-BIOS-CANONICAL-OWNERS
- BUSCA-COGNITIVE-BIOS-EXECUTABLE-CONSUMERS
- BUSCA-COGNITIVE-BIOS-EXISTING-ADAPTIVE-BOOT
- BUSCA-COGNITIVE-BIOS-INSTINTO-METACOGNICAO
- BUSCA-COGNITIVE-BIOS-MINIMAL-EXECUTABLE-BINDING
- COGNITIVE-BIOS-CURRENT-HEAD-333F0E8
- COGNITIVE-BIOS-T1-PASS
- HUD-CURRENT-BEFORE-COGNITIVE-BIOS
- T1-CASA-SEM-DEPS-CI-COMO-EXECUTOR
- T1-CASA-SEM-NODE-MODULES-REUSE-VPS
- T1-GITHUB-NORMALIZER-ENV-MISSING-DEPS
- T1-GITHUB-NORMALIZER-SYNTAX-FAIL
- T1-VPS-FETCH-BLOCKED-GIT-AUTH

Também há delta no KIT.md correspondente à regra CRYSTALLIZE_AFTER_EACH_MATERIAL_SEARCH.

## Remediação restrita

CHERRY_PICK_ONLY_SESSION_LEDGER_COMMITS=true.  
MERGE_ALL_MAIN=false.  
RESET_HARD=false.  
FORCE_PUSH=false.  
UNRELATED_MAIN_DELTA_UNTOUCHED=true.

## NEXT_CURSOR

Cherry-pick somente os commits de ledger da sessão + KIT rule para a branch do PR-MÃE; contraprovar arquivos presentes; push normal; novo HUD.
