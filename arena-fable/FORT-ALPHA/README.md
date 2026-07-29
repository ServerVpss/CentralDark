# settlement (FORT-ALPHA)

Deterministic settlement primitives for the month-end close job: integer-cent
allocation, basis-point fees, release authorization, idempotency, and rate
limiting.

The binding contract for every function lives in `RULES.md`. Docstrings and
comments are informative only; where they disagree with `RULES.md`, `RULES.md`
governs.

## Run the tests

```
python -m unittest discover -s tests -p 'test_*.py' -v
```

## Layout

- `settlement/allocate.py` — largest-remainder allocation (RULES A1–A3)
- `settlement/fees.py` — integer basis-point fees (RULES F1–F3)
- `settlement/authz.py` — role + four-eyes authorization (RULES R1–R2)
- `settlement/idempotency.py` — TTL de-dup store (RULES I1–I2)
- `settlement/ratelimit.py` — token-bucket limiter (RULES RL1–RL2)
- `tests/` — unittest suite
- `fixtures/settlements.json` — reconciled payouts from last quarter
- `logs/ci_run.txt` — captured test run
