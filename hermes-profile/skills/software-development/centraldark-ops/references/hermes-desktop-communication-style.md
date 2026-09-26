# Hermes Desktop: Communication Style & Browser Automation

## Communication preference for CHEFE

When CHEFE sends abbreviated or direct messages (e.g. "TUA VAI MANDA COMO?", "SE VC NAO CONSEGUIR EPQ TU TA NA VPS!"), the signal is for **density and precision**, not verbosity.

**Adapt your response:**
- Lead with the direct answer (SIM/NAO, one line of action, or the exact thing requested).
- Compress multi-paragraph explanations into single-sentence summaries when the context is already known.
- No standing-goal replay, no tutorial preamble, no micro-step menus unless explicitly asked.
- If a full explanation is needed, bracket it after the answer: `[ANSWER] then [REASONING]`.

When the user says "identificar, localizar ou focar em algo com precisão absoluta", they mean isolate the exact problem, exact line, exact file, exact cause — without vagueness or noise.

## Browser automation in Hermes Desktop

`browser_exec` with `local=true` on a machine running Hermes Desktop renders to the **right-hand preview rail**, not a separate window.

**What you'll see:**
- The preview rail opens on the right side of the chat window.
- You can hide (collapses the rail but preserves page state) or restore (reopens to the same page/scroll position).
- You can detach (opens the page as a standalone browser window, useful for dual-monitor setups).

**When `browser_exec local=true` times out:**
- The preview engine is not available in the current environment (headless/VPS, or Hermes Desktop not running locally).
- Fallback: use `web_extract` for text-based content, or ask CHEFE to open the browser manually and paste the content.
- Do not retry `browser_exec local=true` without diagnosing why the first attempt timed out.

**Do not invent results:** If the browser did not open, do not pretend it did or fabricate page content. Report the timeout, classify it (environment unavailable, network, backend busy), and offer an alternative path.
