# Validated turn loop — August 2026

Session evidence for the class-level workflow in `../SKILL.md`. This file records only transferable mechanics and compact measurements; it intentionally omits the conversation body and full accessibility dumps.

## Working turn sequence

Validated against an authenticated ChatGPT conversation in an existing Chrome window:

```text
full target validation
→ inspect composer
→ preserve non-placeholder draft
→ set authorized message
→ poll until send control appears
→ activate send once
→ verify sent marker rendered
→ restore preserved draft
→ background-poll response
→ require generation stopped + action bar after marker
→ extract response only
```

### Important mechanics

- A visible composer value can belong to the user. Preserve it exactly; do not send or overwrite it.
- Placeholder text must be normalized as empty before draft comparison.
- After text was set in a React composer, the send control appeared only in a later snapshot. Immediate absence was not proof of failure.
- An action verdict of `unverifiable` was followed by observation. The message was not resent.
- The response monitor kept the main conversation responsive and returned only completion state, action-bar state, and extracted text.

## Compact performance record

One variable changed: reuse the already-minted exact field ref before expanding to a new full validation.

```text
BASELINE_TIME=3.890s
NEW_TIME=2.325s
DELTA_PERCENT=40.231%
SPEED_FACTOR=1.673x
BASELINE_SEARCHES=2
NEW_SEARCHES=1
SEARCH_REDUCTION=50%
FALLBACK_USED=YES
LARGEST_BOTTLENECK=final full validation
```

Interpretation: the action path improved, but the final proof still required a full accessibility walk because the ref action returned `unverifiable`. The 40.231% gain includes that fallback. Eliminating proof cost without replacing it with an independent bounded verifier remained an open experiment at this point.

## Validated short-validation record

A following cycle changed one variable only: the scope of final validation. It reused the already-confirmed window and performed four read-only checks instead of another full accessibility walk:

```text
BASELINE_TIME=2.325s
NEW_TIME=1.019s
DELTA_TIME=-1.306s
GAIN_PERCENT=56.172%
SPEED_FACTOR=2.282x
SEARCHES=2
SHORT_VALIDATIONS=4
FALLBACK_AVAILABLE=YES
FALLBACK_ACTIVATED=NO
LARGEST_BOTTLENECK=validation-process startup
```

The four checks were: same native window, expected Chrome tab selected, composer semantic identifier still resolved, and preserved phrase still exact. There was no click, scroll, retype, or send. The full fallback stayed available but did not run, so it was recorded separately rather than mislabeled as used.

### Windows UIA detail

For Chrome tab selection, `AutomationElement.Current.IsSelected` was empty even though the tab was selected. The working read-only proof used `SelectionItemPattern.Current.IsSelected`. The composer was located by its stable automation identifier and its value was read through `ValuePattern`. This direct UIA path is validated for bounded reads only; browser/framework-aware transport remains responsible for writes.

The next proposed optimization—keeping the validation process resident—was not yet benchmarked in this session segment and is intentionally not recorded here as a validated workflow.

## External-source notes

Sources reviewed:

- Official project: `https://github.com/vercel-labs/agent-browser`
- Official documentation: `https://agent-browser.dev/`
- Secondary article supplied by the user: `https://medium.com/@richardhightower/agent-browser-ai-first-browser-automation-that-saves-93-of-your-context-window-7a2c52562f8c`
- Accessibility-tree CLI discussion: `https://github.com/HKUDS/CLI-Anything/issues/90`

### Reusable mechanisms

- compact semantic snapshot rather than full DOM/UI tree;
- deterministic short refs for later actions;
- persistent daemon/session to avoid repeated startup;
- refresh or invalidate refs when page state changes;
- background wait and stateful session continuity.

### Claims and status

The official agent-browser documentation reports roughly 200–400 tokens for compact text snapshots versus 3,000–5,000 for full DOM-style context. Those endpoints imply a theoretical savings range of about 86.667%–96%, with a midpoint of 92.5%. The secondary article's 93% figure is therefore mathematically plausible but remains `NOT_LOCALLY_VERIFIED` until a controlled benchmark runs in the actual browser workflow.

No package, extension, browser, or daemon was installed from these sources during this session.

## Regression checks for future sessions

1. Start with a real human draft in the composer and prove byte-for-byte restoration.
2. Delay framework rendering and prove no duplicate send occurs.
3. Return an `unverifiable` action and prove fallback cost is included in timing.
4. Change tab or URL and prove short validation escalates to full validation.
5. Stream a long response and prove main chat remains responsive.
6. Re-run the same route with one changed variable and calculate both delta percent and speed factor.
