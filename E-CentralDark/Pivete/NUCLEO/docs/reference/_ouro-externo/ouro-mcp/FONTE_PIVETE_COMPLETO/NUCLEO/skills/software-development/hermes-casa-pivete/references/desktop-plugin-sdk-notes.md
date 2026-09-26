# Desktop Plugin SDK — condensed knowledge bank (casa, verified 2026-07-24)

Condensed from the full human reference
`https://hermes-agent.nousresearch.com/docs/developer-guide/desktop-plugin-sdk`
(read live) plus confirmation against the real profile `config.yaml` and a live
`tasklist` of the running Desktop on profile pivete.

## Doc location pitfall
- PUBLIC URL works: `https://hermes-agent.nousresearch.com/docs/developer-guide/desktop-plugin-sdk`
- LOCAL HOST BLOCKED: `http://127.0.0.1:3000/docs/...` returns
  `Blocked: URL targets a private or internal network address` from `web_extract`.
  Use the public Nous URL, not localhost docs.
- `web_extract` on the public URL returns the full page (head+tail; truncated
  middle saved to `cache/web/*.md`) — read the saved file to page the middle.

## Security model (read BEFORE writing any plugin)
- A loaded plugin runs as ESM in the renderer with **full app authority**
  (React singleton + whole SDK: `host.request` gateway RPC, `ctx.rest`,
  storage, `navigate`). Isolation is **error isolation only** — can't crash the
  app, but can do anything the app can. The loader is NOT a trust boundary.
- Python backend (`plugin_api.py`) imports **only** when the id is in
  `plugins.enabled` in `config.yaml` (GHSA-mcfc-hp25-cjv7). In-app Settings →
  Plugins toggle is renderer-side and does NOT import Python.

### Secrets / providers / keys are NEVER exposed to a plugin
- The SDK is a **UI + RPC sandbox**, not a credential surface. It does NOT
  expose `api_key`, provider lists, account, endpoints, gateway URLs.
- `host.request` runs under the gateway's own auth; keys live in `config.yaml`
  / env, masked by default (`redact_secrets: true`). A plugin **cannot read
  your keys** — it can only trigger an action the gateway already allows.
  Never promise "show my keys / list my providers" in a plugin UI.
- Confirmed against real `config.yaml` (profile pivete): providers/keys live
  under `providers:`, `fallback_providers:`, `auxiliary.*`, `mcp_servers:` —
  all server-side, never reaching plugin JS.

## Buttons / controls (import from `@hermes/plugin-sdk`)
- `Button`; bare button via `jsx('button', { onClick })` (e.g. statusbar chip).
- `SegmentedControl` — ideal for a **model switcher** (segmented choice).
- `Select*`, `Switch` (on/off), `Tabs*`, `DropdownMenu*`, `ContextMenu*`,
  `Popover*`, `Dialog*` / `ConfirmDialog` (use for destructive).
- `CopyButton`, `Kbd`/`KbdGroup`, `Badge`, `StatusDot`, `Tooltip*`,
  `SearchField`, `ScrollArea`, `LogView`, `Codicon`, `DecodeText`.
- Helpers: `cn`, `icons.*`, `haptic`, `profileColor`, `relativeTime`,
  `fmtDateTime`, `useI18n`, `evaluateRuntimeReadiness`.
- **Never hardcode colors** — use `var(--ui-text-secondary/tertiary)`,
  `var(--ui-stroke-secondary)`, `var(--ui-accent)`.

## State atoms (`host.state.*`, readonly)
`activeSessionId`, `cwd`, `gateway` (`idle`|`connecting`|`open`), **`model`**
(active model — key for a switcher), `profile`, `viewport`.

## host API
`host.notify`, `host.navigate`, `host.onEvent`, `host.logs`, `host.status`,
`host.restartGateway`, `host.request<T>(method, params?)` (gateway JSON-RPC:
sessions, config, skills, cron).

## `ctx.*`
`ctx.register`/`registerMany` (each = button/pane/command, id namespaced
`<id>:<local>`), `ctx.rest`/`ctx.socket` (own `/api/plugins/<id>/` namespace;
`ctx.socket` no-op on OAuth remotes — keep polling fallback), `ctx.storage`
(persisted under `hermes.plugin.<id>.*`, plugin-isolated).

## Areas
`PANES_AREA`, `ROUTES_AREA` (+`SIDEBAR_NAV_AREA`), `STATUSBAR_AREAS.left/.right`,
`TITLEBAR_AREAS.*`, `PALETTE_AREA` (⌘K), `KEYBINDS_AREA`, `THEMES_AREA`,
`COMPOSER_AREAS`, `Contribute` (mount-scoped).

## `host.request` method-name GAP (verify before promising)
- Doc says "same JSON-RPC the app uses (sessions, config, skills, cron)" but
  does NOT list method names. For a model/config-change plugin the exact RPC
  (e.g. what the app calls to `config set model`) is undocumented here. Find it
  in app source (`apps/desktop/src/...`) or `hermes_cli.config` / gateway
  `cli.py` before shipping. Do NOT guess the method.
- Memory/context: via `host.request` memory/session methods or `ctx.storage`
  (plugin-scoped), not the 86%-memory tool directly.

## Live Desktop process inspection (read-only)
```bash
tasklist.exe /fo csv | grep -iE "hermes|electron|node\.exe"
```
- `Hermes.exe` = Desktop app (Electron); multiple = main + renderers.
- `node.exe` = app child/tooling. `hermes.exe` = CLI/gateway native binary.
- `python*.exe` = gateway backend (FastAPI/uvicorn) answering `host.request`.
- `tasklist` has no parent→child tree by default; use `wmic process` /
  `tasklist /svc` for hierarchy. Still read-only.
- Observed 2026-07-24 (profile pivete): 5× `Hermes.exe`, 11× `node.exe`,
  1× `hermes.exe`, several `python*.exe` — Desktop + gateway both alive.

## Memory-86% behavior (verified, not a complaint)
Durable `memory` tool (char limit 8000 / user 2000): NO auto-delete, NO decay,
NO hallucination near full. At cap a new `add` is **REJECTED** (shows current
entries); pod manually with one batch `remove` old + `add` new. Nothing
disappears on its own. Prefer `ctx.storage` (explicit, plugin-scoped) in plugins.
