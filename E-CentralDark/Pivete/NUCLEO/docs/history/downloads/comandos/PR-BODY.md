## INTENÇÃO

Fechar o falso verde encontrado no PR #1136: o gate citava o owner canônico de handoff, mas não verificava o owner real.

Intent-Authorized: SEGREDO/CHEFE
Merge-Policy: AUTO_SQUASH_IF_CLEAN
Intent-Scope: pombo-handoff-owner-fail-closed
Writer: SOL
Writer-Scope: handoff owner + trigger-fabric verifier/counterproof/package

## DELTA

- fortalece `docs/CONSCIENCIA/02-PROTOCOLO-HANDOFF-IA.md`;
- `verify_repo_contract.py` valida o owner real;
- adiciona contraprova:
  - delete owner -> FAIL;
  - regress invariant -> FAIL;
- workflow existente passa a disparar para owner/cristal e executa a contraprova;
- pacote Trigger Fabric existente passa a carregar owner/cristal/verificador/contraprova;
- `verify_package.py` prova esses guards após fresh extraction.

## NÃO CRIA

- novo owner;
- novo gate;
- novo workflow;
- nova autoridade;
- novo cérebro/orquestrador.

## PROVA ESPERADA

```text
POMBO_CANONICAL_HANDOFF_OWNER=PASS
DELETE_OWNER_FAILS_CLOSED=PASS
REGRESSED_OWNER_FAILS_CLOSED=PASS
POMBO_OWNER_COUNTERPROOF=PASS
```

Runtime universal externo permanece `EVIDÊNCIA FALTANTE`.
