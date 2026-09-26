# Pre-Dispatch Checklist for Multi-Agent Rendezvous

Use before dispatching agents to a shared mission. Clear each item before sending the brief.

## Mission identity
- [ ] MISSION_ID is set and stable (not derived from transient context)
- [ ] Current state is MEASURED FRESH (not from conversation history or prior session)
- [ ] No prior measurement is stale relative to last state change

## Scope ownership
- [ ] Every scope that needs mutation has ONE designated writer
- [ ] Scopes without a writer are marked READ_ONLY / pending
- [ ] No two agents will mutate the same scope
- [ ] Conflicting writers would trigger rendezvous, not parallel writes

## Evidence freshness (TIK_TAK)
- [ ] All measurements cited in the brief have a timestamp or are re-measured now
- [ ] Any state-changing action taken since last measurement is flagged as invalidating prior measurement
- [ ] No PASS claim rests on a measurement older than the last relevant action

## Brief contents
- [ ] Mission goal is clear and specific
- [ ] Current state is included (measured, not assumed)
- [ ] Next cursor is defined (where to continue if context is lost)
- [ ] Decisions already proven are listed (so agents don't re-discuss)
- [ ] Unknowns are listed (so agents know what's still open)
- [ ] Writer per scope is explicit
- [ ] What proves completion is defined (PROVE_BY)
- [ ] Brief contains what's needed to act — not the full conversation history

## Style check
- [ ] No options presented as questions ("A or B?")
- [ ] Lowest-motion path is chosen internally, not offered as a choice
- [ ] No re-asking authorization already given
- [ ] No repeating proof already delivered in this session

## After dispatch
- [ ] Each agent reports back with evidence, not just assertions
- [ ] Any new measurement invalidates prior measurements of the same state
- [ ] Context recovery path (MISSION_ID, CHECKPOINT, NEXT_CURSOR) survives session loss
