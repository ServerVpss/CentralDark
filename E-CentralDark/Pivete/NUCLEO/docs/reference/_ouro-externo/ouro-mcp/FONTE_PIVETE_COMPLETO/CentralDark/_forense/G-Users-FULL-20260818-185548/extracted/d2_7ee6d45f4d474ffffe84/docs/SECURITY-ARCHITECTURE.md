# Arquitetura de segurança privada

```mermaid
flowchart LR
  I[Internet] --> F[Frontend]
  F --> G[Gateway]
  A[Admin] --> G
  C[Casa] --> G
  V[VPS] --> G
  G --> B[Backend]
  B --> D[(Private DB)]
  G --> E[Audit/Event Store]
  M[Agent/Model] --> T[Tool Policy]
  T --> B
```

Nenhuma seta concede confiança implícita.

## Invariantes
- `AUTHENTICATED != AUTHORIZED`
- `LOCAL != TRUSTED`
- `MODEL_OUTPUT != AUTHORITY`
- `HISTORY != AUTHORITY`
- `FRONTEND != SECRET_STORE`
- `LOG != SECRET_STORE`
- `REVOKED_SESSION -> FAIL`
- `UNKNOWN != PASS`
- `DEFAULT -> DENY`
- `DECOY -> ISOLATED + NO_ATTACK_BACK`

## Fluxo de defesa
`DETECT -> VALIDATE -> DENY/THROTTLE/REVOKE/DROP/QUARANTINE -> AUDIT -> RECOVER -> LEARN -> HARDEN`.
