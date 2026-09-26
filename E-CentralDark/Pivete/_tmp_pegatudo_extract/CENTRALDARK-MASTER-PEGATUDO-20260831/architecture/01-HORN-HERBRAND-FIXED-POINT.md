# Horn + Herbrand aplicados à CentralDark

O motor lógico não tenta representar toda a realidade. Ele representa somente **gates operacionais que podem ser expressos com segurança como regras Horn**.

## Forma

```text
A ∧ B ∧ C -> D
A ∧ X -> FALSE
TRUE -> FACT
```

Fatos entram apenas por medição/receipts.

## Exemplo

```text
CURRENT_HEAD ∧ TESTS_PASS ∧ COUNTERPROOF_SURVIVES -> CANDIDATE_GREEN
UNKNOWN_MATERIAL -> FALSE_IF_PROMOTING
WRITER_COLLISION -> FALSE_IF_MUTATING
HASH_CHAIN_VALID ∧ CANDIDATE_GREEN ∧ T1_STABLE -> FIXED_POINT_PASS
```

## Least fixed point

As regras positivas são aplicadas repetidamente até uma rodada completa não derivar fato novo.
Esse fecho é a interpretação mínima: não adicionamos fatos que não tenham sido derivados.

## Constraints

Se o corpo de uma constraint for satisfeito, deriva-se `FALSE`. A missão não pode promover.

## Dois fixed points

`LOCAL_FIXED_POINT` significa apenas que aquele subproblema parou de produzir fatos novos.
Ele **não encerra a missão**.

`GLOBAL_FIXED_POINT` só existe após contraprova, T1, realidade, integridade e unknown material zerado.
