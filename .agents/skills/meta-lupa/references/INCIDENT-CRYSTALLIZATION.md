# Contrato — META cristalização de incidentes

Status: CANONICAL_CANDIDATE
Owner conceitual: `docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md`
Executor verificável: `.agents/skills/meta-lupa/scripts/incident_crystal_gate.py`
Ledger: `.agents/skills/meta-lupa/references/incident-crystals.json`

Este contrato não cria uma sétima lente META. `CRISTAL` continua sendo saída do refino META cruzado. Aqui a lei existente é aplicada à classe `INCIDENTE` para impedir cristalização narrativa, esquecimento histórico e autoabsolvição do próprio agente.

```text
DOCUMENTED != CRYSTALLIZED
RULE_EXISTS != ENFORCED
TEST_EXISTS != TEST_PASSED
GATE_EXISTS != SAME_HEAD_PASS
FIXED_POINT != IRREDUCIBLE
NARRATIVE_CLAIM != RECEIPT
```

## Denominador antes do total

A palavra `TOTAL`, `100%`, `TUDO CRISTALIZADO` ou equivalente só é válida quando existe denominador explicitamente fechado e ligado ao estado medido.

O denominador operacional desta capacidade é descoberto de três fontes:

```text
1. docs/**/*incidente*
2. docs/CONSCIENCIA/APRENDIZADOS.md
   → entradas incident-like: armadilha | erro-correcao | título de erro/falha/incidente/falso
3. história explícita registrada no ledger
   → PR/commit/incidente sem arquivo dedicado
```

```text
TOTAL_REQUIRES_CLOSED_DENOMINATOR=true
TOTAL_REQUIRES_ZERO_UNREGISTERED=true
TOTAL_REQUIRES_ZERO_NONTERMINAL=true
TOTAL_REQUIRES_ZERO_STRUCTURAL_ERRORS=true
DENOMINATOR_IS_BOUND_TO_REPOSITORY_STATE=true
AGENT_CANNOT_FIX_OFFICIAL_DENOMINATOR_BY_NARRATIVE=true
```

## Escada de cristalização

```text
OBSERVED
→ DISCOVERED
→ FORENSIC
→ OWNER_MAPPED
→ RULE_PROMOTED
→ REGRESSION_WIRED
→ COUNTERPROVED
→ SAME_HEAD_GATE_PASS
→ CROSS_META_COUNTERPROOF
→ FIXED_POINT
→ CRYSTAL
```

Nem todo incidente precisa produzir regra nova. Se não houver delta reutilizável, a saída pode ser `NO_CHANGE_PROVEN`. Registro puramente histórico pode terminar como `HISTORICAL_EXCEPTION` somente quando a exceção estiver justificada e não mascarar dívida operacional.

Estados terminais aceitos pelo denominador:

```text
CRYSTAL
NO_CHANGE_PROVEN
HISTORICAL_EXCEPTION
```

## Contrato mínimo por incidente

Todo item precisa nomear:

```text
ID
SOURCE_KEY
EVIDENCE_REF
EVIDENCE_LIMIT
STATUS
```

Para `CRYSTAL`, além disso:

```text
OWNER_PATH
COUNTERPROOF_REF
REGRESSION_PATH
SAME_HEAD_GATE=PASS
GATE_HEAD_SHA=<40 hex>
CROSS_META_COUNTERPROOF
FIXED_POINT=true
```

Se faltar um deles, a palavra `CRYSTAL` é falsa para esse item.

## Contraprova e limite da evidência

O incidente não pode crescer durante a cristalização. A mesma trilha que prova o que aconteceu precisa declarar o que **não** foi provado.

```text
EVIDENCE_SUPPORTS_X
!=
EVIDENCE_SUPPORTS_STRONGER_Y

OMISSION != CONFESSION
SCREENSHOT != HIDDEN_MECHANISM_PROOF
DOCUMENT != RUNTIME_PROOF
MODEL_CONSENSUS != INDEPENDENT_PROOF
```

## Autoaplicação

Se o próprio cristalizador errar — esquecer fonte, inflar prova, perder incidente, fabricar total, usar denominator mutável ou chamar PASS antes do runner — esse erro entra novamente como matéria do mesmo mecanismo.

```text
CRYSTALLIZER_FAILURE_REENTERS_DENOMINATOR=true
SELF_EXONERATION=FORBIDDEN
SELF_VALIDATION_WITHOUT_COUNTERPROOF=UNPROVEN
META_CRISTAL_IS_NEW_LENS=false
CRISTAL_IS_CROSS_META_OUTPUT=true
```

## Anti-mentira operacional

O gate procura marcadores explícitos de totalidade nos artefatos canônicos. Se existir claim de totalidade e o denominador ainda tiver qualquer item ausente/não terminal, o resultado é `FAIL`.

Isso não controla mecanicamente uma interface externa sem hook de runtime. Para chat/UI fora do repositório, o repositório fornece o contrato e o receipt verificável; alegação de enforcement externo sem canal provado continua `UNKNOWN`.

```text
REPO_GUARD_CAN_BLOCK_FALSE_CANONICAL_TOTAL=true
EXTERNAL_UI_ENFORCEMENT_REQUIRES_PROVEN_RUNTIME_HOOK=true
UNKNOWN_EXTERNAL_ENFORCEMENT_IS_NOT_PASS=true
```

## Regra curta

```text
ACHOU INCIDENTE → ENTRA NO DENOMINADOR
DOCUMENTOU → AINDA NÃO É CRISTAL
CRISTAL → TEM PROVA + LIMITE + OWNER + REGRESSÃO + CONTRAPROVA + SAME-HEAD PASS
DISSE TOTAL → DENOMINADOR TEM QUE ZERAR
O PRÓPRIO CRISTALIZADOR ERROU → ELE TAMBÉM VIRA INCIDENTE
```
