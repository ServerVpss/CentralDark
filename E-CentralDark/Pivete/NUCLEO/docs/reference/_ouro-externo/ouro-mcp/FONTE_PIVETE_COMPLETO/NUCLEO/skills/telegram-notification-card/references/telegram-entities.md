# Telegram Message Entities — relevant excerpt

Source: https://core.telegram.org/api/entities (fetch via `curl`, `web_extract` blocks this host).

## Entity length = UTF-16 code units
- When computing entity length, count **UTF-16 code units**, NOT code points, NOT bytes.
- BMP code points (U+0000–U+FFFF) = 1 unit.
- Supplementary planes (U+10000–U+10FFFF, incl. all color emoji U+1Fxxx) = **2 units** (surrogate pair).
- The `<pre>` block (`messageEntityPre`) is monospace; a 2-unit emoji therefore renders as **2 columns**.

## Practical consequence for the Card Hermes
- The spec says "largura fixa 36 caracteres". That means **36 visual columns**.
- Color emoji inside the box (🟡 🎯 📘 ⚙️ 🧠 🚨 ✅ ⏳ 🔧) each consume 2 columns.
- Padding must be by **display width** (BMP=1, supplementary=2, U+FE0F variation selector=0), never by `len()`.
- A correctly padded card has every bordered line = 38 visual columns (36 inner + 2 `║`).

## parse_mode
- For `<pre>`/`<b>` etc. use `parse_mode: "HTML"`.
- `messageEntityPre` is produced by `<pre>...</pre>`.
