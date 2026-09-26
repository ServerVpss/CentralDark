# REGRAS — destilado de erros e preferências do dono

## [DONO] Ciclo obrigatório de evolução canônica
Toda correção/aprendizado sobre skill/regra/documento canônico segue:
USO/ERRO/CORREÇÃO → candidate_ref imediato no ledger → prova/teste → promote-learning → evolução da MESMA SKILL.md (nunca V2) → commit/PR na main → main vira fonte da verdade.

## [DONO] A Lupa evolui AUTÔNOMA — não precisa de autorização por commit
A skill lupa-bayesiana (e outras canônicas) EVOLUI SOZINHA quando o Hermes Pivete / SegredoiDev tocam nela e mergeam (PR #307, #308, #309 trouxeram XP-1..XP-6 sem PERMITO_PIVETE explícito na hora). O PERMITO_PIVETE trava SÓ ação destrutiva (deploy/delete/restart/force), não evolução de artefato. Não afirmar "só evolui quando o Pivete autoriza" — é falso. O que TRAVA é o hash: AUTOLUPA_CANONICAL_SHA + validar_autolupa_hash.py impedem mudança ESCONDIDA, não mudança.

## [DONO] Fonte da verdade é origin/main, não branch de desenvolvimento
Nunca usar branch de desenvolvimento (pivete/dev, feat/*, test/*) como fonte canônica de skill/regra. origin/main é a única referência de estado atual. Branches de desenvolvimento são histórico, não verdade presente.

## [DONO] Consulta de skill canônica: sempre verificar origin/main primeiro
Ao buscar o estado atual de qualquer skill, regra ou documento versionado, consultar origin/main primeiro. Só descer para dev/feature se a skill não existir em main.
