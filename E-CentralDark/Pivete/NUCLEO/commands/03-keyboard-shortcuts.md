# COMANDO - 03-keyboard-shortcuts.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\docs\user-guide\03-keyboard-shortcuts.md
**SHA:** c996860849f9c8ed
**Timestamp:** 2026-08-28T02:52:41.871137
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- and its focus hint names the card rather than the prompt: `Tab/Space:
- Focus prompt:     Space or any letter key (auto-focuses and types)
- Focus prompt:     i, Tab, or Space

### Contratos
- They share one contract:

### Ouro Bruto (primeiros 5000 chars)
```
# Keyboard Shortcuts

Reference for key bindings in the Grok Build TUI. Bindings are built in and cannot currently be remapped.

---

## Input Modes

Grok has two input modes that control how you navigate the scrollback:

- **Simple mode** (default): Arrow keys for navigation, `Shift+Arrow` for turn navigation, `Space` to focus the prompt, and any letter key auto-focuses the prompt.
- **Vim mode** (opt-in): `j`/`k` for navigation, `H`/`L` for turn navigation, `J`/`K` for response navigation, `h`/`l` for fold, `e`/`E` for expand/collapse, and `i`/`Tab`/`Space` to focus the prompt.

Simple mode is active by default. To switch to Vim mode, set `vim_mode = true` under `[ui]` in `~/.grok/config.toml`, or toggle it at runtime with `/vim-mode`. See [Configuration](05-configuration.md) for details.

The tables below document bindings for both modes. The "Key" column shows the Vim-mode binding, and the "Alt Key" column shows the equivalent in simple mode (arrow keys, etc.).

> **Vim-mode required**: Single-letter and `Shift+letter` bindings in the
> **Scrollback** context (`j/k`, `h/l`, `g/G`, `L/H`, `y/Y`, `o/O`, `r`,
> `x`, `e/E`, and the `i` insert-mode alt) require `[ui].vim_mode = true`
> in `~/.grok/config.toml` (or `/vim-mode` to toggle). Arrow keys, `Tab`,
> `Esc`, `Space`, `PageUp/Down`, and every `Ctrl+letter` shortcut work in
> both modes.

---

## Navigation (Scrollback Focused)

Move through conversation entries in the scrollback pane.

| Key | Alt Key | Action |
|-----|---------|--------|
| `j` | `Down` | Select next entry |
| `k` | `Up` | Select previous entry |
| `⇧L` | `Shift+Right` | Jump to next turn (user prompt) |
| `⇧H` | `Shift+Left` | Jump to previous turn (user prompt) |
| `⇧J` | | Jump to next assistant response |
| `⇧K` | | Jump to previous assistant response |
| `g` | | Go to top of scrollback |
| `⇧G` | | Go to bottom of scrollback |
| `Ctrl+K` | | Scroll up one line (without changing selection) |
| `Ctrl+J` | | Scroll down one line (without changing selection) |
| `PageUp` | | Scroll up one page (selection moves to the top of the viewport) |
| `PageDown` | | Scroll down one page (selection moves to the bottom of the viewport) |
| `Ctrl+U` | | Scroll up half page |
| `Ctrl+D` (`Shift+D` in VSCode) | | Scroll down half page |

`PageUp` and `PageDown` also scroll the conversation while the ordinary prompt
is focused, without moving focus or changing the draft. An active prompt
history, `@` file search, slash menu, or completion dropdown keeps the keys for
its own navigation.

---

## View (Scrollback Focused)

Control how entries are displayed in the scrollback.

| Key | Alt Key | Action |
|-----|---------|--------|
| `h` | `Left` | Collapse selected entry |
| `l` | `Right` | Expand selected entry |
| `e` | | Toggle fold on selected entry |
| `⇧E` | | Expand all / collapse all entries |
| `Ctrl+E` | | Expand/collapse all thinking blocks |
| `r` | | Toggle raw markdown on selected entry |

Setting `respect_manual_folds = true` under `[scrollback.scroll]` in
`pager.toml` (opt-in, off by default — see
[Configuration](05-configuration.md)) makes a hand-folded block pinned:
streaming updates and finish events (for example a thinking block ending)
leave it alone instead of resetting it, and expanding a block while
auto-scroll is following the tail stops following so you can read; resume
with `⇧G`, `j` at the last entry, scrolling past the bottom, or sending a new
prompt. `⇧E` clears all pins, and `Ctrl+E` clears pins on thinking blocks.

### Block Content

| Key | Action |
|-----|--------|
| `y` | Copy block content to clipboard |
| `⇧Y` | Copy block metadata (e.g., the shell command) to clipboard |
| `Enter` | Open block content in fullscreen viewer |
| `Ctrl+F` | Open block content in fullscreen viewer (alt binding) |

---

## Focus

Switch between the prompt input and scrollback pane.

| Key | Alt Key | Context | Action |
|-----|---------|---------|--------|
| `Tab` | `Space` (and `i` in vim mode) | Scrollback focused | Focus the prompt input |
| `Tab` | | Prompt focused | Focus the scrollback (both simple and vim scrollback modes) |
| `Tab` | `Shift+Tab` (backwards) | A blocking card is focused (question, permission prompt, cancel-turn panel) | Walk that card's rows, wrapping round at the ends. Focus stays in the card |
| `Tab` | `Space` (and `i` in vim mode) | Scrollback focused with a card parked | Hand the keyboard back to the card (the bar's focus hint names it) |
| `Enter` | | Prompt focused | Send the current prompt |

**Esc is not a focus key.** It follows the cancel / clear / rewind semantics below. The mid-turn cancel is the only branch gated on `[ui].vim_mode` (scrollback nav); nothing depends on `[ui].simple_mode` (prompt editor). Overlays, modals, slash/file dropdowns, voice, search, and selection still steal Esc first.

## Blocking cards

Three surfaces block the agent on your answer and take over the keyboard while
they are open: the **question card** (`ask_user_question`), the
```