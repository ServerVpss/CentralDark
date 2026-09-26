# OUTRO - effects.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\hyperframes\skills\gsap\references\effects.md
**SHA:** e4a3e157c746963d
**Timestamp:** 2026-08-26T18:32:22.957361
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const typeStart = handoffTime + 0.5; // brief blink pause

### Padroes
- Pattern: blink → solid (typing starts) → type → solid → blink (typing done).

### Ouro Bruto (primeiros 5000 chars)
```
# GSAP Effects for HyperFrames

Drop-in animation patterns for HyperFrames compositions. Each effect is self-contained with HTML, CSS, and code.

All effects follow HyperFrames composition rules — deterministic, no randomness, timelines registered via `window.__timelines`.

## Table of Contents

- [Typewriter](#typewriter)
- [Audio Visualizer](#audio-visualizer)

---

## Typewriter

Reveal text character by character using GSAP's TextPlugin.

### Required Plugin

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/TextPlugin.min.js"></script>
<script>
  gsap.registerPlugin(TextPlugin);
</script>
```

### Basic Typewriter

```js
const text = "Hello, world!";
const cps = 10; // chars per second: 3-5 dramatic, 8-12 conversational, 15-20 energetic
tl.to(
  "#typed-text",
  { text: { value: text }, duration: text.length / cps, ease: "none" },
  startTime,
);
```

### With Blinking Cursor

Three rules:

1. **One cursor visible at a time** — hide previous before showing next.
2. **Cursor must blink when idle** — after typing, during pauses.
3. **No gap between text and cursor** — elements must be flush in HTML.

```html
<span id="typed-text"></span><span id="cursor" class="cursor-blink">|</span>
```

```css
@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
.cursor-blink {
  animation: blink 0.8s step-end infinite;
}
.cursor-solid {
  animation: none;
  opacity: 1;
}
.cursor-hide {
  animation: none;
  opacity: 0;
}
```

Pattern: blink → solid (typing starts) → type → solid → blink (typing done).

```js
tl.call(() => cursor.classList.replace("cursor-blink", "cursor-solid"), [], startTime);
tl.to("#typed-text", { text: { value: text }, duration: dur, ease: "none" }, startTime);
tl.call(() => cursor.classList.replace("cursor-solid", "cursor-blink"), [], startTime + dur);
```

### Backspacing

TextPlugin removes from front — wrong for backspace. Use manual substring removal:

```js
function backspace(tl, selector, word, startTime, cps) {
  const el = document.querySelector(selector);
  const interval = 1 / cps;
  for (let i = word.length - 1; i >= 0; i--) {
    tl.call(
      () => {
        el.textContent = word.slice(0, i);
      },
      [],
      startTime + (word.length - i) * interval,
    );
  }
  return word.length * interval;
}
```

### Spacing with Static Text

When a typewriter word sits next to static text, use `margin-left` on a wrapper span. Don't use flex gap (spaces cursor from text) or trailing space in static text (collapses when dynamic is empty).

```html
<div style="display:flex; align-items:baseline;">
  <span style="font-size:40px; color:#555;">Ship something</span>
  <span style="margin-left:14px;"><span id="word"></span><span id="cursor">|</span></span>
</div>
```

### Word Rotation

Type → hold → backspace → next word. Cursor blinks during every idle moment (holds, after backspace).

```js
words.forEach((word, i) => {
  const typeDur = word.length / 10;
  // Solid while typing
  tl.call(() => cursor.classList.replace("cursor-blink", "cursor-solid"), [], offset);
  tl.to("#typed-text", { text: { value: word }, duration: typeDur, ease: "none" }, offset);
  // Blink during hold
  tl.call(() => cursor.classList.replace("cursor-solid", "cursor-blink"), [], offset + typeDur);
  offset += typeDur + 1.5; // hold

  if (i < words.length - 1) {
    tl.call(() => cursor.classList.replace("cursor-blink", "cursor-solid"), [], offset);
    const clearDur = backspace(tl, el, word, offset, 20);
    tl.call(() => cursor.classList.replace("cursor-solid", "cursor-blink"), [], offset + clearDur);
    offset += clearDur + 0.3;
  }
});
```

### Appending Words

Build a sentence word-by-word into the same element:

```js
let accumulated = "";
words.forEach((word) => {
  const target = accumulated + (accumulated ? " " : "") + word;
  const newChars = target.length - accumulated.length;
  tl.to("#typed-text", { text: { value: target }, duration: newChars / 10, ease: "none" }, offset);
  accumulated = target;
  offset += newChars / 10 + 0.3;
});
```

### Multi-Line Cursor Handoff

When handing off between typewriter lines: hide previous → blink new → pause → solid when typing. Never go hidden→solid (skips idle state).

```js
tl.call(
  () => {
    prevCursor.classList.replace("cursor-blink", "cursor-hide");
    nextCursor.classList.replace("cursor-hide", "cursor-blink");
  },
  [],
  handoffTime,
);

const typeStart = handoffTime + 0.5; // brief blink pause
tl.call(() => nextCursor.classList.replace("cursor-blink", "cursor-solid"), [], typeStart);
tl.to("#next-text", { text: { value: text }, duration: dur, ease: "none" }, typeStart);
tl.call(() => nextCursor.classList.replace("cursor-solid", "cursor-blink"), [], typeStart + dur);
```

### Timing Guide

| CPS   | Feel             | Good for                   |
| ----- | ---------------- | -------------------------- |
| 3-5   | Slow, deliber
```