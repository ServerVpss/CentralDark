# ORDEM PARE — hard stop (Pivete)

## Triggers (any)
```text
PARE
PARA
ORDEM DIRETA PARE
STOP
PQ EU PEDI PRA PARA E TU CONTINUA
```

## Required behavior
1. **Stop operational work immediately** — no more tools that advance the mission.
2. Reply short: acknowledge the order + that you were wrong if you continued.
3. Wait for a **new explicit order**. Silence is not resume.

## Forbidden after PARE (even “harmless”)
- “só verificar” / “só status”
- unittest / YAML parse / git status “pra deixar limpo”
- push, commit, merge, cancel runs, workflow_dispatch
- reopen previous goal “só um pouquinho”
- memory/skill writes that keep executing the stopped mission (skill library curator pass is separate when user asks for it)

## Why
On 2026-08-06 the agent stopped “the mission” then still ran local verification after `ORDEM DIRETA PARE`. Pivete correctly called that continuing.  
**Verification after PARE = still working.**

## Resume
Only on clear new instruction (e.g. “GOO”, “continua”, “prossiga”, scoped task). Do not invent resume from gratitude, emoji, or prior goal text alone.
