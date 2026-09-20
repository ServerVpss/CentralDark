# 👑🪬 Git drift — GitHub main vs Casa vs VPS

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current

## CURRENT

GITHUB_MAIN=9b9c0c9b64615a7b1733d7dcc3b988159c6b112f
CASA_HEAD=7d4fdaf54f8e0b45da10e20fb852d6eb4b7213a1
VPS_HEAD=f3c00f9c73c6691ef044bb237623e88ce57aaf38

CASA_DIRTY=1
VPS_DIRTY=13

## Compare GitHub main → Casa

status=diverged
ahead_by=19
behind_by=171
merge_base=d7d3c75981887d36310ac5cef5d0e67781a315fb

Interpretação:
Casa possui 19 commits exclusivos e está 171 commits atrás da main.
Não pode ser atualizada por reset/overwrite sem reconciliação.

## Compare GitHub main → VPS

status=behind
ahead_by=0
behind_by=21
merge_base=f3c00f9c73c6691ef044bb237623e88ce57aaf38

Interpretação:
VPS é ancestral direto da main e está 21 commits atrás.

## Casa → VPS

status=diverged
ahead_by=150
behind_by=19
merge_base=d7d3c75981887d36310ac5cef5d0e67781a315fb

## Veredito

VPS_RUNTIME_SOURCE_DRIFT=CONFIRMED_BEHIND_21.
CASA_SOURCE_DIVERGENCE=CONFIRMED.
RESET_HARD_FORBIDDEN=true.
BLIND_PULL_FORBIDDEN_ON_DIRTY_WORKTREES=true.
GLOBAL_FIXED_POINT=false.

## NEXT_CURSOR

- preservar 19 commits exclusivos da Casa;
- identificar owner/branch desses 19 antes de sincronizar;
- VPS pode receber main somente após classificar os 13 dirty paths e provar que não há delta útil local;
- Desktop Commander owner e Council runtime continuam em paralelo read-only.
