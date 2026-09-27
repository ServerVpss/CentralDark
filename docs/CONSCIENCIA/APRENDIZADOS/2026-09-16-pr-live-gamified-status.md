# Aprendizado — PR vivo gamificado dirigido por eventos

## Ferida

PRs e workflows podem estar tecnicamente corretos e ainda perder continuidade humana: intenção some entre sessões/modelos, gates ficam espalhados e o estado visual não mostra claramente o que falta.

## Regra aprendida

A intenção do CHEFE permanece ativa até todos os critérios materiais passarem, o CHEFE mudar/cancelar a missão ou existir blocker material/humano registrado.

O PR deve usar o padrão visual oficial da Casa como projeção humana e checklist vivo como projeção dos gates.

## Invariantes

```text
INTENT_OWNER=CHEFE
CONTINUITY_OWNER=CENTRALDARK
MODEL != OWNER_DA_MISSAO
CHECKBOX != PROOF
EVENTO = EVIDENCIA
REALIDADE = JUIZ
NO_PERCENT_WITHOUT_CLOSED_DENOMINATOR=true
PASS_SHA_ANTIGO != PASS_SHA_ATUAL
POLLING_BURRO=FORBIDDEN_WHEN_EVENT_SOURCE_EXISTS
```

## Atualização

Cada gate/finding/runtime/receipt publica mudança; o agregador só reescreve card/checklist se o `STATE_HASH` mudar.

```text
EVENT → NORMALIZE → DEDUPE → AGGREGATE → UPDATE_IF_CHANGED
```

Isso reaproveita Trigger Fabric, Hermes Core, review runtime, handoff e padrão card existentes. Não cria owner paralelo.
