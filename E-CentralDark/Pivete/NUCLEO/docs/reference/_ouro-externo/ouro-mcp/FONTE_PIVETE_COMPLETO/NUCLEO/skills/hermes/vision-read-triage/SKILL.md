---
name: vision-read-triage
description: Vision 404 on local image path = transport, not model.
category: hermes
---

# Vision Read Triage

## Core lesson (verified 02/08/2026, pivete profile)
A `vision_analyze` `404 "Couldn't find that, sorry."` on a locally-pathed image is a
**TRANSPORT failure, not a MODEL/PROVIDER failure.**

The pipeline only injects image pixels when the image arrives as:
1. a **native image attachment** (chat photo button — NOT "attach file" / `@file`), or
2. a **direct public image URL** (`.png`/`.jpg` raw — NOT a preview page like prnt.sc/lightshot).

Inputs that do NOT get injected → 404:
- `C:\Users\...\*.png` / `E:\...\*.png` (path local)
- `@file` desktop attachment
- any `data:` base64

**Swapping the vision model does NOT fix a transport 404.** Model fallback only helps
when the image WAS injected but the provider errored/timeout. On a transport 404,
looping model swaps stays blind and wastes calls.

## Verify the REAL fallback chain (do not trust a skill's doc)
Read the live config on disk before asserting any model names:
```
read_file C:/Users/danda/AppData/Local/hermes/profiles/pivete/config.yaml
# look at: auxiliary.vision.provider / model / fallback_chain
```
Verified 02/08/2026 (config.yaml lines 52-62):
- primary: `tencent/hy3:free`  (no native vision — this is the active model)
- `fallback_chain`:
  - `openrouter/x-ai/grok-4.5`  (timeout 180)
  - `openrouter/openai/gpt-5.5` (timeout 180)

Any skill claiming the primary is `nous/google/gemini-3.5-flash` is OUTDATED — fix it.

## Correct response on a transport 404
1. Confirm the image arrived as path / `@file` / base64 (not native attachment or public URL).
2. Declare the LACUNA immediately: "não consigo ler path local / preview" — **do NOT invent content**.
3. Offer the real fixes:
   - send via Telegram/Desktop **photo button** (not "attach file"), or
   - provide a **direct public image URL** (raw `.png`/`.jpg`).
4. Only AFTER a native attachment or public URL is provided, attempt analysis
   (optionally climbing the `fallback_chain` from config.yaml).

## Pitfall — the bug this skill exists to kill
Do NOT follow guidance that says *"never declare blind before exhausting the model
fallback chain"* when the error is a **transport 404**. That advice causes an endless
model-swap loop on a problem no model swap can fix.

The `vision-fallback-autoresilient` skill (user-owned, pivete profile) currently carries
this wrong guidance: it (a) lists `nous/google/gemini-3.5-flash` as primary — which does
not match the live config — and (b) omits the transport-404 distinction. Recommend
`hermes curator adopt vision-fallback-autoresilient` and correct it, or supersede with
the verified chain above.

## When model fallback IS the right move
If the image was injected natively (attachment/URL) but the primary vision model errors
(5xx, timeout, provider outage, empty analysis), THEN climb `auxiliary.vision.fallback_chain`
from config.yaml. That is the only case where swapping models helps.

## Related (user-owned, pivete profile — overlap; curator should consolidate)
- `img-view` — how pivete Hermes sees images (transport rules, re-send flow).
- `visao-perfil-pivete` — proven transport method + false-green panel warning.
- `vision-fallback-autoresilient` — fallback chain (OUTDATED: wrong primary + missing
  transport-404 distinction). USE THIS triage skill's verified chain instead.
