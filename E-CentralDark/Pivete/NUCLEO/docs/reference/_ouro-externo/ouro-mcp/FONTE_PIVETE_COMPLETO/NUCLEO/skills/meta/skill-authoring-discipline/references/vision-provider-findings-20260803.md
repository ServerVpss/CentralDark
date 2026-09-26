# Vision provider findings — session 2026-08-03 (Pivete profile)

## Reuse-first lesson (the trigger for this skill)
Pivete: "verifica se vc tem skil de visao ou plugins! antes de criar noos
skils asvezes vooce ja tem em suas skils". Always scan before authoring.

## What already existed (user-owned, OFF-LIMITS to patch)
- `hermes/img-view` — image transport rules (anexo nativo/URL only; path=404).
- `hermes/visao-perfil-pivete` — transport + falso verde + bugs #6560/#24015.
- `vision-fallback-autoresilient` — multimodal fallback chain.

No new vision skill was needed; the existing ones cover the class.

## Gemini API rate-limit facts (verified ai.google.dev/gemini-api/docs/rate-limits)
- API key is REUSABLE; not one-shot. Does not expire by usage.
- Limits are applied PER PROJECT, not per API key.
- Multiple keys in ONE project SHARE the same RPM/RPD pool.
- Hitting limit => HTTP 429 RESOURCE_EXHAUSTED. Fix: wait for reset
  (midnight PT) or use a SEPARATE GCP project (separate pool).
- Deleting/recreating keys does NOT raise capacity.
- Implication: 10-20 keys in `gen-lang-client-0578089097` = redundancy only,
  NOT more capacity. Real scaling needs separate projects.

## Broken primary discovered this session
- `auxiliary.vision` was `routellm/gemini-2.5-flash-image` -> 241x
  `400 no remaining credits` (Abacus/RouteLLM exhausted).
- Working alternative proven by curl: Gemini direct
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`
  with `X-goog-api-key:` header -> HTTP 200 text + image (base64 inline).
- `config.yaml` edits are BLOCKED by the Hermes runtime guard
  ("Refusing to write to Hermes config file"). Apply via app / `hermes config`
  / manual edit; agent cannot write it even with explicit user order.

## Recommended recovery (if skill gets adopted for patching)
In `vision-fallback-autoresilient`: change primary from
`routellm/gemini-2.5-flash-image` to a confirmed-working Gemini route, and
document that Abacus/RouteLLM credits are NOT the same as Gemini API credits.
