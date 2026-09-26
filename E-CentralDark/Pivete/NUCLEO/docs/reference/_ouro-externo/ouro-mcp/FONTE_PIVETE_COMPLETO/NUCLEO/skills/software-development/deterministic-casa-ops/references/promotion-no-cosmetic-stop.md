# Promotion without cosmetic stop

Pivete correction during release train:

**Wrong:** hold forever on `READY_FOR_FINAL_PROMOTION` after gates are already the real bar.  
**Right (authorized):**
```text
GATES PASS
→ MERGE
→ BACKUP
→ DEPLOY CANARY
→ REAL TEST
→ PROMOTE
→ RECEIPT

FAIL
→ ROLLBACK
→ BLOCKED WITH EXACT CAUSE
```

Stop only for: missing secret, Writer conflict, no rollback path, unforeseen destructive risk, true UNKNOWN.

Happiness metric remains human-visible proof:
```text
distance(error_initial → functional result in eyes)
```

CI detail: `centraldark-pr/references/ci-self-hosted-receipt-pitfalls.md`  
Train order: `references/pr679-and-train-order.md`
