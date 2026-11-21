# Receipt — portable operation contract / any chat

- Data: 2026-10-02
- Owner: `CENTRALDARK_AI_BOOT.yaml#portable_operation_contract`
- Writer reutilizado: PR-filho #1746
- PR-mãe #1562: ledger/rendezvous
- Escopo: contrato de entrada portátil; não prova disponibilidade de ferramentas em toda superfície.

## Invariantes fixas
```text
SEGREDO/CHEFE > SOL > PIVETE/HERMES
DEFAULT_OPERATION_MODE=CANONICAL_SELF_GRILL
ONE_SYSTEM_ONLY=true
REUSE_BEFORE_CREATE=true
ONE_WRITER_PER_SCOPE=true
NEW_CHAT_IS_NEW_SURFACE_NOT_NEW_BRAIN=true
```

## Bindings resolvidos em cada boot
```text
CURRENT_HEAD=RESOLVE_AT_BOOT
WRITER=RESOLVE_AND_LOCK_PER_SCOPE
OBSERVED_EVIDENCE=RESOLVE_AT_BOOT
ROUTES/TOOLS=MEASURE_AT_RUNTIME
```

## Contraprova
Uma cópia colada do contrato é handoff, não CURRENT. Se o chat não conseguir acessar o repo/runtime, não inventar HEAD, writer, ferramentas ou evidência.

NEXT_CURSOR: usar o bloco portátil como ponte de entrada e expandir para o CURRENT canônico antes de claim material.
