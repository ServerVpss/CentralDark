# CAPABILITY HARVEST + MEDIA/CAPTION + HANDOFF RECOVERY

This is an additive contract under the existing CENTRALDARK/PEGATUDO/Documentation Hub owners. It is not a second engine, skill authority, media subsystem, or router.

## 1. Opportunity is material input

When the CHEFE intentionally surfaces code, chat history, Drive material, screenshots, debug payloads or parallel-agent output, the system must not stop at search.

```text
INPUT
-> SOURCE_CLASS
-> MATERIALITY
-> DEDUPE
-> EXISTING_OWNER
-> COMPATIBILITY
-> INFORMATION_GAIN
-> TEST/FALSIFIER when material
-> CRYSTALLIZE_IN_EXISTING_OWNER | RECEIPT | NEXT_CURSOR | QUARANTINE | IRRELEVANT(reason)
```

`SEARCH_ONLY != ABSORPTION`
`FOUND != INTEGRATED`
`INTEGRATED != PROVEN`

## 2. Named-skill recovery

A human may refer to a remembered capability by an approximate name. The agent must not fabricate an exact skill name.

```text
REQUESTED_NAME
-> EXACT_LOOKUP
-> if found: LOAD + VERIFY OWNER
-> if missing: CAPABILITY_LOOKUP
-> MATCH EXISTING SKILL/OWNER
-> PROVE SEMANTIC COMPATIBILITY
-> USE EXISTING OWNER
-> if material ambiguity remains: UNKNOWN
```

Fable is an auxiliary method/reviewer. It does not become a fallback engine, master, authority, MetaLupa replacement or Reality Judge replacement merely because a remembered label contains “Fable” or “fallback”.

## 3. Dense handoff

Grammar may be removed for machine density; required meaning may not.

```text
[SKILL]: canonical capability/skill
[TRIG]: entry/alias
[OWNER]: mutable owner
[IN]: inputs
[PRE]: preconditions
[EXEC]: minimal logic/command
[OUT]: expected result
[PROOF]: discriminating evidence
[FAIL]: fail-closed state
[NEXT]: next cursor
[REV]: HEAD/revision/hash when applicable
```

Never include tokens, cookies, private keys, client secrets or raw credential values.

## 4. YouTube/debug caption locator

The player debug object is evidence about the player/media session, not the full subtitle payload.

Observed locator fields can include:

- `debug_videoId` or `docid`: media identity;
- `cc`: caption/translation mode hint;
- `au_d`: audio/language hint;
- `len`: media duration;
- `origin`;
- `timestamp`;
- `reqBlocked`: transport observation.

The caption track itself must be resolved from observed caption-track metadata or the caption request. For YouTube web traffic this commonly appears in an observed `timedtext` request. Useful request fields may include `v`, `lang`, `kind`, `name`, `tlang`, `fmt`. These fields are measured; they are not guessed from `Stats for nerds`.

`captions.js` is an implementation artifact, not a stable external API contract.

## 5. Complete-text gate

```text
MEDIA_IDENTIFIED
AND CAPTION_TRACK_IDENTIFIED
AND TEXT_ACQUIRED_FROM_AUTHORIZED_SOURCE
AND COVERAGE_CHECKED_AGAINST_DURATION_OR_TRACK_BOUNDARY
AND PROVENANCE_RECORDED
= COMPLETE_CAPTION_CANDIDATE
```

A partial response, one viewport, one debug JSON or one translated fragment never equals a complete transcript.

## 6. Crystallization path

```text
COMPLETE_CAPTION_CANDIDATE
-> NORMALIZE
-> DEDUPE
-> REALITY_SCOPE_GATE
-> RECONCILE
-> CAPABILITY_HARVEST
-> EXISTING_OWNER
-> DOCUMENTATION_GATE
-> RECEIPT
```

The goal is not to archive every sentence as authority. The goal is to extract reusable, testable capability while preserving source/provenance.
