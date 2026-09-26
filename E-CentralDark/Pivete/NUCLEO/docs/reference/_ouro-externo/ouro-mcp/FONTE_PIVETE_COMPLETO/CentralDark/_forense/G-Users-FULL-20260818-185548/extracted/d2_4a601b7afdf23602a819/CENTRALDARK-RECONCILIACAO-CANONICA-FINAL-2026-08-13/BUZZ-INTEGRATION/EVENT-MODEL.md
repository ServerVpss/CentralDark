# EVENT-MODEL

Baseado em eventos assinados (Buzz/Nostr kinds) **como transporte**, com envelope CentralDark:

```
EVENT_ID
TRACE_ID
MISSION_ID
WHO / ROLE / MODEL
SOURCE / TARGET
TIMESTAMP
KIND_TRANSPORT   # kind Nostr se via Buzz
PAYLOAD_TYPE     # OBSERVATION | ALERT | REVIEW | EVIDENCE | MESSAGE | RESULT
RISK
STATUS           # IDLE|READING|ANALYZING|COMMUNICATING|REVIEWING|ALERT|BLOCKED|WAITING|EXECUTING|PROVEN|FAILED
EVIDENCE_REF
```

Regras:
- evento ≠ comando  
- ausência de campo obrigatório → FAIL_CLOSED (não publica / não executa)
