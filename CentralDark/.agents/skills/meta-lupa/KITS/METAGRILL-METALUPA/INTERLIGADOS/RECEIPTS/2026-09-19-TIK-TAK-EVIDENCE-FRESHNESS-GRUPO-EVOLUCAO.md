# ⏱️🧿 TIK TAK · EVIDENCE FRESHNESS · GRUPO DA EVOLUÇÃO

ID=TIK_TAK_EVIDENCE_FRESHNESS_GRUPO_EVOLUCAO_20260919
PR_MOTHER=#1562
PR_CHILD=#1577
HEAD_BEFORE_THIS_RECEIPT=4b78525971c108d3b82d64e722e0a4e9d35e738a
MAIN_OBSERVED=b5b71b520be2742ec3b1f372725d9e798f751570
ROLE=REVIEWER_COUNTERPROOF
WRITER_SCOPE=.agents/skills/meta-lupa/KITS/METAGRILL-METALUPA/INTERLIGADOS/RECEIPTS/2026-09-19-TIK-TAK-EVIDENCE-FRESHNESS-GRUPO-EVOLUCAO.md
TELEGRAM_CODE_WRITER=SOL
THIS_RECEIPT_MUTATES_TELEGRAM_CODE=false
FINALIZER=ONE_ONLY

## GOAL_PAI

melhorar o CONSELHO / GRUPO DE EVOLUÇÃO DAS IAs no Telegram
→ parar conversa paralela dizendo que aprendeu
→ exigir PROVA de aprendizado entre agentes
→ comunicação por estado externo verificável
→ um compasso / setores disjuntos / um finalizer
→ cristalizar no owner existente
→ CI → main pela rota canônica

## Provas CURRENT cruzadas

No HEAD observado, o owner do Telegram já separa:
CONVERSA → CANDIDATE → REPLAY_OBSERVED → PROVED_ADOPTED

e preserva:
LEARNED != SAID
DISCUSSED != ADOPTED
SAVED != APPLIED
CANDIDATE != PROVED_ADOPTED
REPLAY_OBSERVED != PROVED_ADOPTED

O commit CURRENT 4b78525971c108d3b82d64e722e0a4e9d35e738a adicionou teste determinístico exigindo um modo offline --self-test-learning, mas o source CURRENT ainda não contém esse modo.

SELF_TEST_LEARNING_CONTRACT=PASS_AS_TEST_REQUIREMENT
SELF_TEST_LEARNING_IMPLEMENTATION=MISSING
CURRENT_MICRO_GOAL=ADD_OFFLINE_SELF_TEST_BY_CURRENT_WRITER

## TIK TAK — não é sistema novo

TIK TAK é apenas o nome curto para a regra temporal já existente:
CURRENT > HISTORY
OBSERVED_AT_REQUIRED_FOR_CURRENT_CLAIM
HEAD/SHA + PROVENIÊNCIA
FRESHNESS
REMEASURE_AFTER_EXTERNAL_CHANGE

Owners já existentes incluem Trigger Fabric/CONTRACT, HERMES-CORE e a ontologia temporal do Screenpipe.
TIK_TAK != NEW_OWNER
TIK_TAK != NEW_ARCHITECTURE
TIK_TAK = EVIDENCE_FRESHNESS_MNEMONIC

## Contraprova nova — receipt forte ainda precisa de relógio

O bridge de promoção em apps/bot-telegram/contexto-centraldark.cjs hoje exige forma mínima do receipt:
verdict=PROVED_ADOPTED
same_scope=true
learning_id
before_ref
after_ref
tests PASS+evidence
counterproof
regressions PASS+evidence
verifier
receipt_sha256 com formato SHA-256

Mas a função local de promoção não prova sozinha:
receipt_sha256 recomputado = NÃO
evolution_gate.py realmente executado = NÃO
after_ref == estado/head validado agora = NÃO
observed_at/freshness no momento da promoção = NÃO

STRONG_SHAPE != EVOLUTION_GATE_PASS
VALID_SHA_FORMAT != RECEIPT_HASH_PROVEN
OLD_VALID_RECEIPT != CURRENT_LEARNING_PROOF

Isso NÃO autoriza este reviewer a tocar o código Telegram: o writer CURRENT desse setor é SOL.

## Handoff exato ao writer SOL

1. implementar --self-test-learning offline
2. fixture deve provar CANDIDATE
3. fixture deve provar REPLAY_OBSERVED
4. CANDIDATE/REPLAY não podem promover memória
5. fixture negativa: receipt apenas bonito / SHA de formato válido deve falhar
6. chamar/validar o evolution_gate canônico ou provar resultado equivalente pelo owner existente
7. amarrar promoção a before_ref/after_ref realmente verificáveis
8. carregar observed_at/validated_at/head quando claim for CURRENT
9. se HEAD/estado externo mudou, revalidar; não reutilizar verde temporal como CURRENT
10. só então PROVED_ADOPTED pode chegar a APRENDIZADOS.md

## PDF_GATE / TLC23 fresh before this receipt

STARTED_AT=2026-09-19T02:42:43.5938369-03:00
ENDED_AT=2026-09-19T02:42:45.9292923-03:00
EXIT_CODE=0
SECTOR_RESULT=PROBE_PASS
SHA256=b4e2a0655b7e0c85ca329c33971b377299dde6358779270c573f014f3aa606d1
SIZE=206674
IDENTITY=PASS
POLICY=PASS
SELF_TEST=PASS
NODE_TEST=5/5 PASS
TAMPER_COUNTERPROOF=PASS
PDF_GATE_PROMOTED=true

## SAME-HEAD CI

No HEAD 4b78525971c108d3b82d64e722e0a4e9d35e738a os workflows foram observados como queued no momento deste receipt.
GLOBAL_GREEN=NOT_YET
PROMOTION_READY=false
CI_RESULT_ON_THIS_RECEIPT_HEAD=UNKNOWN_UNTIL_COMPLETE

## Veredito

LEARNING_CONVERSATION_LAYER=PASS
CANDIDATE_LAYER=PASS
REPLAY_LAYER=PASS
PERMANENT_PROMOTION_GATE_SHAPE=PARTIAL_PASS
OFFLINE_SELF_TEST=MISSING
TEMPORAL_FRESHNESS_AT_PROMOTION=GAP_PROVEN_IN_BRIDGE
WRITER_LEASE_RESPECTED=PASS
NEW_ARCHITECTURE=NO
NEXT_CURSOR=SOL_WRITER_IMPLEMENT_SELF_TEST_AND_FRESHNESS_COUNTERPROOF
