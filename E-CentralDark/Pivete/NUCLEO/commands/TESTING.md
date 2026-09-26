# COMANDO - TESTING.md
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\TESTING.md
**SHA:** e3ab32a2caf63e07
**Timestamp:** 2026-08-23T14:15:51.428707
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - [ ] **DB gap query after device switch** — run: `sqlite3 ~/.screenpipe/db.sqlite "SELECT t1.timestamp as gap_start, t2.timestamp as gap_end, (julianday(t2.timestamp) - julianday(t1.timestamp)) * 864
- - [ ] **Screen Recording Later preserves restart consent** — Grant Screen Recording, click **Later** in macOS, and verify screenpipe stays open with a clear **restart screenpipe** button and the warni

### Ouro Bruto (primeiros 5000 chars)
```
# screenpipe regression testing checklist

> **purpose**: prevent regressions. test core features rigorously every time

## critical edge cases (sorted by regression frequency)

### 1. window overlay & fullscreen spaces (macOS)

### 1.1. Live Text Interaction (macOS)

commits: `e9c76934`, `9acdf850`

- [ ] **Native Live Text selection** — On macOS, verify that native Live Text selection works within the app's text overlay.
- [ ] **Native Data Detectors** — On macOS, verify that native data detectors (e.g., phone numbers, addresses, dates) are active and clickable within the app's text overlay.
- [ ] **Cross-architecture Live Text compilation** — On both x86_64 (Intel) and arm64 (Apple Silicon) macOS machines, verify that Live Text functionality is available and works without compilation errors or runtime issues.


- [ ] **window mode CSS restore** — In window mode (not fullscreen), verify that CSS styling is correct and as expected (e.g., no unexpected transparent panels).
- [ ] **keyboard input in main window from tray** — Open the main window from the tray icon and immediately try typing. Verify that keyboard input works without requiring a click.
- [ ] **WKWebView keyboard focus recovery** — Interact with embedded web views (e.g., billing, help sections), then navigate back to other UI elements. Verify keyboard focus is correctly recovered by the WKWebView.



these break CONSTANTLY. any change to `window_api.rs`, `main.rs` shortcuts, activation policy, or NSPanel code must test ALL of these.

commits that broke this area: `0752ea59`, `d89c5f14`, `4a64fd1a`, `fa591d6e`, `8706ae73`, `6d44af13`, `b6ff1bf7`, `09a18070`

- [ ] **overlay shortcut on fullscreen space** — press shortcut while a fullscreen app (e.g., Chrome fullscreen) is active. overlay MUST appear on top.
- [ ] **chat shortcut on fullscreen space** — press chat shortcut while on a fullscreen space. chat panel MUST appear on top. Fixed: panel pre-created at startup, show uses order_front→activate order.
- [ ] **chat shortcut on normal desktop** — chat appears, receives keyboard focus, can type immediately.
- [ ] **overlay toggle on/off** — press shortcut twice. first shows, second hides. no "ghost" window left behind.
- [ ] **chat toggle on/off** — press chat shortcut twice. first shows, second closes.
- [ ] **overlay does NOT follow space swipe** — show overlay, then three-finger swipe to another space. overlay should NOT follow you (no blink-and-disappear). was broken by `MoveToActiveSpace` staying set.
- [ ] **no blink on show** — overlay appears instantly, no flash of white/transparent then reappear. was broken multiple times (`3097872b`, `8706ae73`, `09a18070`).
- [ ] **no blink on hide** — overlay disappears instantly. no momentary reappear after hiding.
- [ ] **overlay on second monitor** — with 2 monitors, show overlay. it appears on the monitor where the mouse cursor is.
- [ ] **window mode vs fullscreen mode** — switch overlay mode in settings. shortcut still works in both modes. no crash.
- [ ] **switch modes while overlay is visible** — change from fullscreen to window mode in settings while overlay is showing. should not crash (`b4eb2ab4`).
- [ ] **keyboard focus in overlay** — show overlay, start typing. text input works immediately without clicking (`d74d0665`, `5a50aaad`).
- [ ] **keyboard focus in chat** — show chat, start typing. text input works immediately.
- [ ] **escape closes overlay** — press Escape while overlay is visible. it hides.
- [ ] **no space jump on show** — showing the overlay should NOT cause a space transition animation (`6d44af13`, `d74d0665`).
- [ ] **no space jump on hide** — hiding the overlay should NOT switch you to a different space.
- [ ] **screen recording visibility setting** — toggle "Hide from screen recordings" in settings. The overlay is visible in recordings by default and disappears only while the setting is enabled (`206107ba`).
- [ ] **search panel focus** — open search, keyboard focus is in search input immediately (`2315a39c`, `1f2681e3`).
- [ ] **ghost clicks after hide** — hide overlay via `order_out`. clicking where overlay was should NOT trigger overlay buttons (`32e1a962`).
- [ ] **pinch-to-zoom works** — pinch gesture on trackpad zooms timeline without needing to click first (`d99444a7`, `523a629e`).
- [ ] **shortcut reminder on all Spaces** — switch between 3+ Spaces (including fullscreen apps). reminder pill stays visible on every Space simultaneously.
- [ ] **shortcut reminder on fullscreen app** — fullscreen Chrome/Safari, reminder shows at top center. not just leftmost Space.
- [ ] **shortcut reminder doesn't steal focus** — showing reminder never takes keyboard focus from active app.
- [ ] **chat on non-primary Space** — switch to Space 3 (normal desktop), press chat shortcut. chat appears on Space 3, not Space 1. no Space transition animation.
- [ ] **chat re-show on fullscreen Space** — show chat on fullscreen Space, hide it, show again. must reappear on same fullscreen Spac
```

---

# COMANDO - TESTING.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\TESTING.md
**SHA:** e3ab32a2caf63e07e20bb170fef616d2408f35aa0736e2a4830524ce6b213468
**Timestamp:** 2026-08-23T23:43:05.671049
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - [ ] **DB gap query after device switch** — run: `sqlite3 ~/.screenpipe/db.sqlite "SELECT t1.timestamp as gap_start, t2.timestamp as gap_end, (julianday(t2.timestamp) - julianday(t1.timestamp)) * 864
- - [ ] **Screen Recording Later preserves restart consent** — Grant Screen Recording, click **Later** in macOS, and verify screenpipe stays open with a clear **restart screenpipe** button and the warni

### Ouro Bruto (primeiros 5000 chars)
```
# screenpipe regression testing checklist

> **purpose**: prevent regressions. test core features rigorously every time

## critical edge cases (sorted by regression frequency)

### 1. window overlay & fullscreen spaces (macOS)

### 1.1. Live Text Interaction (macOS)

commits: `e9c76934`, `9acdf850`

- [ ] **Native Live Text selection** — On macOS, verify that native Live Text selection works within the app's text overlay.
- [ ] **Native Data Detectors** — On macOS, verify that native data detectors (e.g., phone numbers, addresses, dates) are active and clickable within the app's text overlay.
- [ ] **Cross-architecture Live Text compilation** — On both x86_64 (Intel) and arm64 (Apple Silicon) macOS machines, verify that Live Text functionality is available and works without compilation errors or runtime issues.


- [ ] **window mode CSS restore** — In window mode (not fullscreen), verify that CSS styling is correct and as expected (e.g., no unexpected transparent panels).
- [ ] **keyboard input in main window from tray** — Open the main window from the tray icon and immediately try typing. Verify that keyboard input works without requiring a click.
- [ ] **WKWebView keyboard focus recovery** — Interact with embedded web views (e.g., billing, help sections), then navigate back to other UI elements. Verify keyboard focus is correctly recovered by the WKWebView.



these break CONSTANTLY. any change to `window_api.rs`, `main.rs` shortcuts, activation policy, or NSPanel code must test ALL of these.

commits that broke this area: `0752ea59`, `d89c5f14`, `4a64fd1a`, `fa591d6e`, `8706ae73`, `6d44af13`, `b6ff1bf7`, `09a18070`

- [ ] **overlay shortcut on fullscreen space** — press shortcut while a fullscreen app (e.g., Chrome fullscreen) is active. overlay MUST appear on top.
- [ ] **chat shortcut on fullscreen space** — press chat shortcut while on a fullscreen space. chat panel MUST appear on top. Fixed: panel pre-created at startup, show uses order_front→activate order.
- [ ] **chat shortcut on normal desktop** — chat appears, receives keyboard focus, can type immediately.
- [ ] **overlay toggle on/off** — press shortcut twice. first shows, second hides. no "ghost" window left behind.
- [ ] **chat toggle on/off** — press chat shortcut twice. first shows, second closes.
- [ ] **overlay does NOT follow space swipe** — show overlay, then three-finger swipe to another space. overlay should NOT follow you (no blink-and-disappear). was broken by `MoveToActiveSpace` staying set.
- [ ] **no blink on show** — overlay appears instantly, no flash of white/transparent then reappear. was broken multiple times (`3097872b`, `8706ae73`, `09a18070`).
- [ ] **no blink on hide** — overlay disappears instantly. no momentary reappear after hiding.
- [ ] **overlay on second monitor** — with 2 monitors, show overlay. it appears on the monitor where the mouse cursor is.
- [ ] **window mode vs fullscreen mode** — switch overlay mode in settings. shortcut still works in both modes. no crash.
- [ ] **switch modes while overlay is visible** — change from fullscreen to window mode in settings while overlay is showing. should not crash (`b4eb2ab4`).
- [ ] **keyboard focus in overlay** — show overlay, start typing. text input works immediately without clicking (`d74d0665`, `5a50aaad`).
- [ ] **keyboard focus in chat** — show chat, start typing. text input works immediately.
- [ ] **escape closes overlay** — press Escape while overlay is visible. it hides.
- [ ] **no space jump on show** — showing the overlay should NOT cause a space transition animation (`6d44af13`, `d74d0665`).
- [ ] **no space jump on hide** — hiding the overlay should NOT switch you to a different space.
- [ ] **screen recording visibility setting** — toggle "Hide from screen recordings" in settings. The overlay is visible in recordings by default and disappears only while the setting is enabled (`206107ba`).
- [ ] **search panel focus** — open search, keyboard focus is in search input immediately (`2315a39c`, `1f2681e3`).
- [ ] **ghost clicks after hide** — hide overlay via `order_out`. clicking where overlay was should NOT trigger overlay buttons (`32e1a962`).
- [ ] **pinch-to-zoom works** — pinch gesture on trackpad zooms timeline without needing to click first (`d99444a7`, `523a629e`).
- [ ] **shortcut reminder on all Spaces** — switch between 3+ Spaces (including fullscreen apps). reminder pill stays visible on every Space simultaneously.
- [ ] **shortcut reminder on fullscreen app** — fullscreen Chrome/Safari, reminder shows at top center. not just leftmost Space.
- [ ] **shortcut reminder doesn't steal focus** — showing reminder never takes keyboard focus from active app.
- [ ] **chat on non-primary Space** — switch to Space 3 (normal desktop), press chat shortcut. chat appears on Space 3, not Space 1. no Space transition animation.
- [ ] **chat re-show on fullscreen Space** — show chat on fullscreen Space, hide it, show again. must reappear on same fullscreen Spac
```