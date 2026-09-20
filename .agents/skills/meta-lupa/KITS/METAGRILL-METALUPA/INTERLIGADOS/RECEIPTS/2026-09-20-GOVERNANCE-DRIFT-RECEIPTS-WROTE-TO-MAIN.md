# 🪬 GOVERNANCE DRIFT — receipts recentes escreveram em main

PR_MOTHER=#1562  
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current  
OBSERVED_MOTHER_HEAD=7c0c37ee38ec6e7196db33a7b82303dc399a64e3  
OBSERVED_MAIN_HEAD=9b9c0c9b64615a7b1733d7dcc3b988159c6b112f  
CHILD_GLOBAL_HEAD=333f0e8f32b14e18512b8717392aded6c6139903

## Fato

Algumas chamadas de create_file usaram branch derivada de get_pr_info, mas esse campo não estava presente no retorno usado. Com branch indefinida, o conector gravou no default branch.

Resultado: parte da cristalização recente entrou diretamente em main em vez de somente na branch do PR-MÃE.

## Classificação

EXECUTOR_BRANCH_SELECTION_BUG=true.  
DATA_LOSS=false.  
FORCE_PUSH_USED=false.  
RESET_HARD_USED=false.  
MAIN_RECEIVED_UNINTENDED_LEDGER_COMMITS=true.

## Regra corretiva imediata

PR_MOTHER_BRANCH_CANONICAL=sol/meta-lupa-corpo-operacional-20260917-current.

Toda gravação de ledger/receipt do #1562 deve usar essa branch explicitamente. Não inferir branch de campo ausente.

## Remediação

1. comparar main vs PR-MÃE;
2. identificar receipts/commits de ledger presentes em main e ausentes no PR-MÃE;
3. reaplicar/cherry-pick de forma não destrutiva para o PR-MÃE;
4. preservar main; qualquer limpeza futura deve usar commit reversível, nunca reset/force;
5. adicionar guardrail para branch explícita em toda cristalização futura.

## Aprendizado

UNDEFINED_BRANCH != PR_MOTHER_BRANCH.  
DEFAULT_BRANCH_FALLBACK_CAN_CAUSE_GOVERNANCE_DRIFT=true.  
PR_MOTHER_WRITE_REQUIRES_EXPLICIT_BRANCH=true.  
CRYSTALLIZATION_LOCATION_IS_PART_OF_THE_PROOF=true.

## NEXT_CURSOR

Compare main↔PR-MÃE e reconciliar todos os receipts desta sessão no PR-MÃE sem perda.
