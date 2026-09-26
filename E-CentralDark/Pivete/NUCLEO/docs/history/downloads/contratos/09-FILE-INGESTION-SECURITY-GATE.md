# FILE INGESTION SECURITY GATE — ENCAIXE

Qualquer arquivo recebido pelo Radar/Personal Learning Stream passa pelo FILE SECURITY GATE antes de entrar em runtime confiável.

```text
FILE
→ STABILIZE
→ SHA256
→ REAL TYPE
→ ADS/PROVENANCE WHEN APPLICABLE
→ SIGNATURE WHEN APPLICABLE
→ ANTIMALWARE/EDR
→ CONTAINER SAFE INSPECTION
→ COUNTERPROOF
→ DECISION
```

Regras:

```text
EXTENSION != TRUST
SIGNED != SAFE
SCAN_STARTED != CLEAN
UNKNOWN != PASS
ERROR != PASS
INSPECTION != EXECUTION
DETECTION != AUTO_DELETE
PASS_BOUND_TO_SHA256=true
```

Para archive:
- staging isolado;
- limites de profundidade/contagem/expansão;
- bloquear path traversal;
- cada membro recebe gate próprio.

Somente `DECISION=PASS` pode alimentar parsers/runtime confiáveis.

Este contrato deve reutilizar scanner/EDR/quarentena já existentes; não criar segundo sistema se houver um owner canônico.
