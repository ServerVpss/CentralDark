# Gray Text ≠ Empty Field — Rendering Convention Trap

## The trap

When inspecting rendered UIs (web pages, Foundry VTT compendiums, web_extract output, file browsers), it is easy to misread gray/bolded/placeholder-styled text as:

- an auto-generated marker ("Generated in ≤15 minutes…");
- an empty field indicator;
- a placeholder;

when in fact the gray text may be **the source text displayed in an empty field**.

## The rule

**Gray text is a rendering convention, not a data-state claim.** Before concluding a field is blank, auto-generated, or a placeholder:

1. Determine the rendering convention for that specific UI.
2. When a field is empty AND gray text is present, treat the gray text as a candidate for source/displayed text — not automatically as a generation marker.
3. Do NOT assume all gray text on a page means the same thing. Different entries may use gray for different purposes.
4. When unsure, check the page source or raw extracted content, not just the rendered appearance.

## Concrete example (Foundry VTT compendium)

In a Foundry VTT 5e compendium rendered via web_extract, the "Other" category lists entries like:

- **Agent** — gray paragraph text appears below the name, looking like an auto-generated marker.
- **Spell** — same pattern.
- **Jailer** — gray text below the name.

The gray text is **not** a generation marker. It is the source/displayed text for an otherwise-empty field. The field value is empty, but the gray text is the source content shown in that empty slot.

This is distinct from a genuine auto-generated marker like "Generated in ≤15 minutes with VTT convert" — which would be a different visual convention entirely.

## How to verify

- Read the raw extracted markdown/text, not just the rendered appearance.
- Look for whether the gray text is consistent across entries (same wording = likely a marker) or varies per entry (likely source text).
- If the gray text is descriptive content about the entry (e.g., "A creature that…"), it is source text, not a marker.
- If the gray text is meta/instructional ("Generated in…", "Auto-generated…"), it is a marker.

## Related

- `codebase-inspection` pitfall #5: Visual rendering is not data state.
- `codebase-inspection` workflow: Systematic scan before deep-dive.
