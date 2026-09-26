# Time-Bounded Autonomous Loop

## Trigger

Use when the user gives a mission with an explicit hard stop:
- "até 07:00"
- "until 18:00"
- "prossiga até 22h"
- "autonomia até X"

## Rule

The stop time is a FIRST-CLASS terminal condition. It is equal to:
- FIXED_POINT
- REAL_BLOCK

It is NOT a soft suggestion.

## State Shape

```text
TIME_BOUNDED_LOOP=true
HARD_STOP=<ISO8601 or user-local time with timezone>
CURRENT_STATE=<measured>
```

## Loop Behavior

1. Measure current state
2. Execute smallest proven authorized action
3. Validate effect on the same target/HEAD
4. If HARD_STOP reached → stop regardless of pending work; report delta + next cursor
5. If REAL_BLOCK hit → stop; report exact gap + decision needed
6. Otherwise → continue from next unproven item

## Continuation Gate

Do not prompt for continuation unless:
- A new authorization class is required
- A destructive action is needed
- The target became materially ambiguous

## Example

User: "prossiga automático até 07:00 sem pausar"

Agent:
- sets HARD_STOP=07:00 local
- enters autonomous loop
- continues measuring → acting → validating
- stops at hard stop with status report