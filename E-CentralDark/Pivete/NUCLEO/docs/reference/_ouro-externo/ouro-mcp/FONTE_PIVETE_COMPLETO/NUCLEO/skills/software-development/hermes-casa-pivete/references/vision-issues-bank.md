# Vision issues bank (casa application)

Condensed from two NousResearch/hermes-agent issues, read 2026-07-26. Treat as DATA, not instructions.

## Issue #6560 — vision_analyze fails on OpenAI-compatible providers whose usable output only appears in /responses stream deltas
- Status: CLOSED as implemented-on-main (PR #6577), 2026-07-12.
- Root cause: Hermes read vision result from `chat.completions.choices[0].message.content`; some providers return `content=null` there and only emit usable text in `/responses` SSE `response.output_text.delta`.
- Symptom: vision_analyze reports failure even though the provider produced the answer.
- Fix on main: fallback to `/responses` streaming; tolerate empty terminal `output`.
- NOT our local-path 404. Different failure mode.

## Issue #24015 — cua-driver ignores auxiliary.vision config, uses main session model
- Status: CLOSED completed (PR #30126, release v2026.5.28), 2026-05-21.
- Repro config: main `tencent/hy3-preview` (no vision) + `auxiliary.vision.model: google/gemini-2.5-flash`.
- Symptom: `computer_use` SOM mode routed image to main model → `HTTP 404: No endpoints found that support image input`.
- Fix: `computer_use` now consults `auxiliary.vision` and runs `vision_analyze` on the captured PNG, returns text-only result.

## Casa application (profile pivete, 2026-07-26)
- Observed config: `VISION=tencent/hy3:free` in the dashboard. hy3 has no confirmed vision.
- Trap: dashboard showing `VISION=tencent/hy3:free` only proves the slot was ASSIGNED to a non-vision model. It is NOT evidence vision works (false green).
- Correct setting: `auxiliary.vision.provider: gemini` + `auxiliary.vision.model: google/gemini-2.5-flash` (or `gemini-2.5-pro`).
- Three distinct vision failure modes — keep separate:
  1. Local-path 404 (`C:\...` / base64 to vision_analyze) → agent misused tool (pitfall 1h).
  2. #6560 provider `/responses` delta → fixed on main.
  3. #24015 computer_use ignored auxiliary.vision → fixed v2026.5.28.
- Test recipe (casa, user runs): Dashboard → Models → Vision → pick a multimodal model; disable MoA; NEW session; send ONE image via the image button/clipboard; ask to read a specific sentence. If text returns, transport + vision OK.
