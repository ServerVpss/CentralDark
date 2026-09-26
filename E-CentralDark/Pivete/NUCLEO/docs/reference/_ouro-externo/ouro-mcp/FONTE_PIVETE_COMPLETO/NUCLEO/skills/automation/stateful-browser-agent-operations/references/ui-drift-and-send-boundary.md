# UI drift recovery and send-boundary proof

Session-specific evidence for `../SKILL.md`. This note keeps only the transferable failure mechanism, working recovery, and verification contract.

## Failure mechanism

A background browser dialogue worker temporarily replaced a protected draft with an authorized report. Mouse/focus/layout drift occurred while the worker was acting. The worker then printed `REPORT_RENDERED=YES`, but its marker search included the composer itself. A fresh semantic snapshot proved the complete report was still inside the `Edit` composer; it had not reached the transcript.

The error was not “browser automation failed.” It was a boundary error:

```text
marker visible anywhere
!=
message present in transcript
```

The user supplied the corrective reasoning: combine computational state checks with human intent continuity. When UI geometry drifts, return to the last route that actually worked rather than improvising from stale coordinates.

## Working recovery

```text
last proven mission anchor
→ fresh semantic snapshot
→ confirm selected tab
→ inspect composer exact value
→ locate fresh semantic send control
→ activate once in background
→ prove composer cleared
→ prove marker exists outside the composer
→ restore protected draft
→ prove exact restoration
```

The successful recovery used the fresh semantic button label rather than a historical coordinate. It produced all four proofs:

```text
SEND_SEMANTIC=YES
COMPOSER_CLEARED=YES
MARKER_OUTSIDE_COMPOSER=YES
PROTECTED_DRAFT_RESTORED_EXACT=YES
```

## Human + computational zoom loop

Use both modes deliberately:

- **Computational:** compare exact process/window/tab/ref/value and measure effects.
- **Human:** preserve the goal and reuse the last mechanism known to satisfy it.
- **Zoom in:** inspect only the failing boundary—composer, send control, transcript marker.
- **Background debug:** keep output and polling off the foreground path.
- **Zoom out:** reconfirm mission, authority, target tab, protected draft, and next gate.

## Monitor rules

A sent marker is valid only when all are true:

1. The matching node is in transcript content, never an `Edit`/composer node.
2. The composer no longer contains the outbound payload.
3. A user-message boundary or assistant-generation signal appears after the marker.
4. Before declaring response complete, a response action bar appears after that sent-message marker and generation is stopped.

If the outbound payload remains in the composer, classify `SEND_NOT_CONFIRMED`, mint fresh semantic refs, and retry the last proven send route exactly once. This is not a duplicate risk because transcript absence and composer retention jointly prove the first send did not occur.

## Regression fixture

1. Put a protected draft in the composer.
2. Temporarily replace it with a payload containing a unique marker.
3. Simulate focus or geometry drift before activation.
4. Assert that a marker found only inside `Edit` cannot satisfy `SEND_CONFIRMED`.
5. Remap the semantic send control and activate once.
6. Assert marker outside composer, composer cleared, and protected draft restored exactly.
