# 08 — ROTEADOR DE GATILHOS E CADEIA MASTER

## Regra externa

O CHEFE precisa de **um único comando**:

```text
!CENTRALDARK <objetivo>
```

ou:

```text
#CENTRALDARK <objetivo>
```

Os dois são semanticamente idênticos.

## Normalização

Todo gatilho registrado aceita `!` e `#`.

Exemplos:

- `!ACORDAR` = `#ACORDAR`
- `!CALIBRAR` = `#CALIBRAR`
- `!PEGATUDO` = `#PEGATUDO`
- `!CENTRALDARK` = `#CENTRALDARK`

Por dentro, o prefixo é removido e o evento é normalizado para maiúsculas.

`!centraldark`, `#CentralDark` e `#CENTRALDARK` viram:

```text
CENTRALDARK
```

O prefixo não altera autoridade, modo ou rigor.

## Cadeia automática do master

`CENTRALDARK` expande:

```text
ACORDAR
→ CALIBRAR
→ DELTAUTIL
→ PEGATUDO
→ MULTIBUSSOLA_META
→ META_LUPA
→ RECONCILIAR
→ DEFINE_GUME
→ CONTRAPROVA
→ REALITY_JUDGE
→ PLAN_MINIMUM_SAFE_CHANGE
→ SELECT_DEPLOY
→ EXECUTE
→ TEST
→ CONTRAPROVA_POST
→ REMEASURE
→ REMEDIATE_UNTIL_GREEN_OR_REAL_BLOCKER
→ REGISTRA
→ SELF_REVIEW_CENTRALDARK
→ FINAL_VERDICT
```

Assim, `#PEGATUDO` é um órgão interno obrigatório do `!CENTRALDARK`. O CHEFE não precisa chamá-lo.

## Objetivo inline

O texto após o comando vira a missão atual:

```text
!CENTRALDARK resolver o gate vermelho sem regressão
```

Não vira outro DELTA externo. Continua:

```text
EXTERNAL_DELTA_COUNT=1
```

## Fail-closed

Um `#` usado apenas como título Markdown não dispara nada, salvo se a palavra seguinte for um evento registrado.

Gatilho desconhecido não executa por aproximação.

## Deploy

O estágio `SELECT_DEPLOY` escolhe a estratégia em vez de o CHEFE decorar uma.

Preferência inicial: **micro-deploy**, porque reduz superfície e produz prova discriminante rápida.

Mas ele não é dogma:

- MICRO_DEPLOY: mudança pequena, blast radius pequeno, rollback simples.
- ROLLING: serviço pouco stateful e coexistência segura.
- CANARY: comportamento real precisa ser observado em parcela pequena do tráfego.
- BLUE_GREEN: rollback/cutover rápido justificam ambiente paralelo.

A seleção é recalculada se o estado material mudar.
