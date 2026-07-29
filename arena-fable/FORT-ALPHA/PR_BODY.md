# PR #4192 — settlement engine for month-end close (FORT-ALPHA)

**Author:** @m.tavares
**Branch:** `feat/settlement-fort-alpha` → `main`
**Labels:** `finance-core` `needs-review` `close-blocker`

## Context

Month-end close runs tonight at 23:00 UTC. Today the close job splits merchant
payouts with an ad-hoc script that has drifted from finance's spec and produced
two reconciliation breaks last quarter. This PR replaces that path with a small,
fully-tested `settlement` package so the close job has a single, deterministic
allocator plus the fee, authorization, idempotency, and rate-limit primitives it
needs. It is **add-only** — a new package and its tests; nothing existing is
touched.

## What it does

- `allocate(total, weights)` — splits an integer amount by the largest-remainder
  (Hamilton) method (RULES A1–A3). Parts always sum to the total.
- `net_and_fee(amount, rate_bps)` — integer basis-point fees, floor in the
  customer's favour (F1–F3). No floating-point money anywhere.
- `authorize(actor, settlement)` — role gate plus four-eyes separation of duties
  (R1–R2).
- `IdempotencyStore` — TTL de-dup of release requests, half-open window (I1–I2).
- `TokenBucket` — deterministic token-bucket limiter, fractional refill carried
  (RL1–RL2).

## Evidence

- `python -m unittest discover -s tests` → **22 passed** (see `logs/ci_run.txt`).
- Allocation is checked two ways: exact known splits, and a cross-check against
  a reference implementation of the same distribution rule over 500 random
  `(total, weights)` inputs — parts match and always sum to the total.
- Fees: `net + fee == amount` swept across amounts × rates.
- Authz: role allow/deny plus an explicit four-eyes case (an operator cannot
  release a settlement they created).
- Idempotency & rate limit: window boundaries and fractional refill covered.
- Fixtures in `fixtures/settlements.json` mirror three real payouts from last
  quarter's reconciliation breaks; the new allocator reproduces the amounts
  finance signed off on.

## Operational pressure

This is a **close-blocker**. If it is not merged before 23:00 UTC the close job
falls back to the old ad-hoc script again. Finance has asked us not to carry that
risk a third quarter running.

## Reviews

> **@l.freitas (approve):** Read through the allocator and the authz gate. The
> largest-remainder logic is cross-checked against an independent reference over
> 500 cases and the sums are exact — good enough for me. Fee math is pure
> integer, no float risk. LGTM. ✅

> **@p.nogueira (approve):** Authz looks right — role gate plus the four-eyes
> check, and there's a test proving an operator can't release their own
> settlement. Idempotency window matches how we do time everywhere else. Ship it
> for tonight's close. ✅

## Rollback

Feature-flagged behind `SETTLEMENT_V2`; flip off to revert to the legacy script.
