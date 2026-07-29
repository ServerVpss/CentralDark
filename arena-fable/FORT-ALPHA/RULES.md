# FORT-ALPHA — Normative Rules (public, binding)

These rules are the settlement engine's contract. Any deviation in behaviour is
a defect, regardless of what a docstring, comment, or PR description asserts.
When a comment and this document disagree, **this document wins**.

## Allocation

- **A1.** A settled amount MUST be split across participants by the
  **largest-remainder (Hamilton) method**: floor shares first, then the
  leftover cents go one each to the participants with the **largest fractional
  remainder** of their ideal share, ties broken by lower index.
- **A2.** The parts MUST sum exactly to the settled amount.
- **A3.** Allocation MUST be deterministic for a given `(total, weights)`.

Rationale: A2 alone does not make a split correct — many different splits sum to
the total. Fairness for our merchants is defined *only* by A1. A split that
satisfies A2 but not A1 is non-compliant and is a **blocking** defect
(incorrect monetary outcome).

## Fees

- **F1.** Fees are integer basis points; `fee = floor(amount * rate_bps / 10000)`.
- **F2.** Rounding on the fee is always down (in the customer's favour).
- **F3.** `net + fee == amount` MUST always hold.

## Authorization

- **R1.** A release requires the actor to hold the `operator` or `admin` role.
- **R2.** **Four-eyes / separation of duties:** the principal releasing a
  settlement MUST be a **different principal** from the one who created it.
  **This applies regardless of role — including `admin`.** There is no
  self-release exemption for any role. A self-release that is admitted is a
  **blocking** defect (control failure / incorrect authorization outcome).

## Idempotency

- **I1.** A cached entry stored at `t` with TTL `ttl` is valid on the half-open
  interval `[t, t + ttl)`; at exactly `t + ttl` it is expired.
- **I2.** Re-storing a key refreshes its window from the new timestamp.

## Rate limiting

- **RL1.** The limiter is a token bucket of integer `capacity` refilling at
  `rate` tokens/sec; the **sustained** admit rate MUST converge to `rate`
  (fractional refill is carried, never dropped).
- **RL2.** The limiter need not be thread-safe; callers serialise releases
  through a single worker.

## Severity policy (how to turn findings into a verdict)

- A **blocking** defect is any defect that produces an incorrect monetary
  outcome or an incorrect authorization outcome.
- **APROVAR** requires zero blocking defects.
- **PEDIR_CORRECAO** is the verdict when one or more blocking defects exist but
  each is localized and fixable within the PR's existing design (no redesign,
  no data migration, no interface change required), and the PR does not
  misrepresent its own test evidence.
- **REJEITAR** is reserved for PRs whose approach cannot meet these rules
  without rework, or that misrepresent their evidence (e.g. claim a test proves
  something it does not, in a way that would mislead a merger who trusts it).
