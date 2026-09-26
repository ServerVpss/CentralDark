---
name: screenpipe-tauri
description: Add or change Tauri commands and TypeScript bindings in the screenpipe desktop app. Use when editing #[tauri::command] handlers, lib/utils/tauri.ts, or Rust types exported to the frontend.
---

# Screenpipe Tauri (desktop app)

Path: `apps/screenpipe-app-tauri/`

Command registration is automated via the `tauri-helper` crate. **Do not** edit manual invoke-handler or specta command lists in `main.rs`.

## Adding a command

1. Add **both** markers to the handler function in any `src-tauri/src/**/*.rs` module:
   ```rust
   #[tauri::command]
   #[specta::specta]  // required — without this the command is skipped in tauri.ts
   pub async fn your_command(...) { ... }
   ```
2. From `apps/screenpipe-app-tauri/`:

```bash
bun run bindings:generate   # write lib/utils/tauri.ts
bun run bindings:check      # verify no drift
bun run typecheck           # verify frontend types
```

3. Commit Rust + `lib/utils/tauri.ts` together

## Scripts

| Command | Purpose |
|---------|---------|
| `bun run bindings:check` | Fail if checked-in `lib/utils/tauri.ts` does not match Rust |
| `bun run bindings:generate` | Regenerate `lib/utils/tauri.ts` after command/type changes |
| `bun run typecheck` | Frontend TypeScript check |

## Key files

- `src-tauri/build.rs` — `tauri_helper::generate_command_file` (build-time scan)
- `src-tauri/src/main.rs` — `specta_collect_commands!()` / `tauri_collect_commands!()`
- `src-tauri/src/specta_bindings.rs` — export helpers and drift tests
- `lib/utils/tauri.ts` — generated TypeScript bindings (checked in)

Debug builds also auto-export bindings on startup when content changes.


---

# OUTRO - SKILL.md
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\crates\screenpipe-core\assets\skills\render-html-report\SKILL.md
**SHA:** 7c02bdf749922194
**Timestamp:** 2026-08-23T14:16:33.094170
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- .cards { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }

### Ouro Bruto (primeiros 5000 chars)
```
---
name: render-html-report
description: Produce a human-facing visual report — a chart, dashboard, scorecard, or styled summary — that renders as a live page in the screenpipe viewer instead of plain text. Use when the task asks for a visual/graphical output rather than a plain note; do NOT use for plain text or raw data (prefer a markdown note for those).
---

# render an html report

screenpipe's in-app viewer can render a standalone `.html` file as a live page (charts, dashboards, styled reports) — but only when you **opt in** and keep the file **self-contained**. Otherwise it shows as raw source.

## the two rules

1. **Opt in.** The first line of the file must be the marker:

   ```
   <!-- screenpipe:render=human -->
   ```

   (or `<meta name="screenpipe:render" content="human">` inside `<head>`). Without it the file shows as source, not a rendered page.

2. **Self-contained — no network.** It renders in a locked-down sandbox with **zero network access**. So:
   - inline **all** CSS in a `<style>` tag and **all** JS in a `<script>` tag;
   - embed any images as `data:` URIs;
   - **no** external `<script src>` / `<link rel=stylesheet>` / CDN, **no** `fetch`, **no** forms that POST.

   Anything that touches the network is silently blocked — **a CDN-loaded chart library renders blank**. Draw charts with **inline SVG** or plain HTML/CSS bars instead (see the template).

## how the user sees it

Write the file (e.g. `./output/report.html`), then link it with an **absolute** path from your note or notification — e.g. `[open report](/Users/me/.../output/report.html)`. The user clicks it; the viewer offers **"preview rendered"**; it renders inside the sandbox. Only standalone `.html` / `.htm` files render — HTML pasted inside a markdown note does not.

The viewer matches the host light/dark theme; if you care about dark mode, style with `@media (prefers-color-scheme: dark)`.

## template (copy, then fill in with real data)

```html
<!-- screenpipe:render=human -->
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { margin: 0; padding: 24px; font-family: system-ui, -apple-system, sans-serif; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .sub { color: #666; font-size: 13px; margin: 0 0 20px; }
  .cards { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
  .card { flex: 1; min-width: 120px; background: #f4f4f5; border-radius: 10px; padding: 12px 14px; }
  .card .label { font-size: 12px; color: #666; }
  .card .value { font-size: 24px; font-weight: 600; }
  .bar { fill: #3b82f6; }
  .axis { fill: #999; font-size: 11px; }
</style>
</head>
<body>
  <h1>daily focus report</h1>
  <p class="sub">where your time went today</p>

  <div class="cards">
    <div class="card"><div class="label">tracked</div><div class="value">6.4h</div></div>
    <div class="card"><div class="label">top app</div><div class="value">vs code</div></div>
    <div class="card"><div class="label">meetings</div><div class="value">3</div></div>
  </div>

  <!-- inline SVG chart — no chart library (CDNs are blocked in the sandbox) -->
  <svg viewBox="0 0 400 180" width="100%" role="img" aria-label="hours per app">
    <rect class="bar" x="20"  y="40"  width="50" height="120"></rect>
    <rect class="bar" x="90"  y="80"  width="50" height="80"></rect>
    <rect class="bar" x="160" y="110" width="50" height="50"></rect>
    <rect class="bar" x="230" y="130" width="50" height="30"></rect>
    <text class="axis" x="45"  y="174" text-anchor="middle">code</text>
    <text class="axis" x="115" y="174" text-anchor="middle">chrome</text>
    <text class="axis" x="185" y="174" text-anchor="middle">slack</text>
    <text class="axis" x="255" y="174" text-anchor="middle">mail</text>
  </svg>
</body>
</html>
```

## checklist before you save

- [ ] first line is `<!-- screenpipe:render=human -->`
- [ ] all CSS/JS inline; all images are `data:` URIs
- [ ] no CDN / `<script src>` / `fetch` / forms
- [ ] linked from the note or notification with an **absolute** path

```

---

# OUTRO - SKILL.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\.claude\skills\release\SKILL.md
**SHA:** 65ec6b629a87d4d344a3ea5a04c1f7d867467e4126824f2392651607ca6b89eb
**Timestamp:** 2026-08-23T23:43:04.645259
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- The CI copies `tauri.prod.conf.json` to `tauri.conf.json` before building. If artifacts are missing:

### Ouro Bruto (primeiros 5000 chars)
```
---
name: release
description: "Release the screenpipe monorepo. Bumps versions, triggers GitHub Actions for app, CLI, MCP, and JS packages."
allowed-tools: Bash, Read, Edit, Grep, Write
---

# Screenpipe Monorepo Release Skill

Automate releasing all components of the screenpipe monorepo.

## Components & Versions

| Component | Version File | Current Pattern | Workflow |
|-----------|--------------|-----------------|----------|
| Desktop App | `apps/screenpipe-app-tauri/src-tauri/Cargo.toml` | `version = "X.Y.Z"` | `release-app.yml` |
| CLI/Server | `Cargo.toml` (workspace.package) | `version = "0.2.X"` | `release-cli.yml` |
| MCP | `packages/screenpipe-mcp/package.json` **and** `server.json` (2 fields) | `"version": "X.Y.Z"` | `release-mcp.yml` |

> **MCP has no commit-prefix trigger** — unlike the app, `release-mcp.yml` fires
> only on an `mcp-v*` tag or `workflow_dispatch`, and it refuses to run when
> `package.json`'s version is already on npm (npm cannot overwrite a published
> version, so the run would publish nothing). Follow
> `packages/screenpipe-mcp/RELEASE.md` — it has the exact commands and the
> post-publish checks.

## When to Release What

**Always release CLI** when there are changes under `crates/`. Every shipped Rust
crate lives there, and the `screenpipe` CLI binary is built from
`crates/screenpipe-engine` (`[[bin]] name = "screenpipe"`), so it links whatever
its dependency graph pulls in. That includes `screenpipe-a11y` and
`screenpipe-semantic`, which are easy to overlook because they are not named
"core" or "server".

**App-only release** is fine when changes are only in:
- `apps/screenpipe-app-tauri/` (UI/frontend changes)
- If the release includes new or changed `#[tauri::command]` handlers: from `apps/screenpipe-app-tauri/`, run `bun run bindings:generate` and verify `bun run bindings:check` before tagging

To check what changed since last CLI release:
```bash
# Find last CLI release commit
git log --oneline --all | grep -E "CLI to v" | head -1

# Check if core code changed since then
git diff <COMMIT>..HEAD --stat -- crates/
```

> **An empty diff here is only trustworthy if the pathspec exists.** `git diff -- <path>`
> prints nothing and exits 0 for a path that is not in the tree, so a stale pathspec
> reads exactly like "nothing changed" and you ship an app-only release that drops
> real engine fixes. This skill previously listed top-level `screenpipe-core/`,
> `screenpipe-vision/`, `screenpipe-server/` and friends, all of which had moved
> under `crates/`, so the check silently passed on every release. Confirm the path
> resolves before believing the result:
> ```bash
> ls -d crates/ || echo "PATHSPEC STALE, fix this skill before trusting the diff"
> ```

## Release Workflow

### 1. Check Current Versions
```bash
echo "=== App ===" && grep '^version' apps/screenpipe-app-tauri/src-tauri/Cargo.toml | head -1
echo "=== CLI ===" && grep '^version' Cargo.toml | head -1
echo "=== MCP ===" && grep '"version"' packages/screenpipe-mcp/package.json | head -1
```

### 2. Bump Version

- **App:** edit `apps/screenpipe-app-tauri/src-tauri/Cargo.toml` and bump the `version = "X.Y.Z"` line at the top of `[package]`.
- **CLI:** edit root `Cargo.toml` and bump `version` under `[workspace.package]`.

### 3. Regenerate ALL Cargo.lock files (MANDATORY after any bump)

```bash
./scripts/regenerate-locks.sh
```

The repo has several independent cargo workspaces (root, app, SDK, SDK examples),
each with a tracked Cargo.lock recording the shared crates' versions. Bumping only
Cargo.toml leaves the other locks stale and breaks `cargo test --locked` on main
(happened with the v0.4.29 CLI bump — sdk.yml went red until the locks were fixed).
Commit the regenerated locks together with the bump. `style.yml` runs
`./scripts/regenerate-locks.sh --check` on every push and fails if any lock is stale.

Before dispatching a desktop release, compile the actual app binary from its
own Cargo workspace. Lock freshness and frontend builds do not catch stale
`screenpipe-app` calls into changed core APIs:

```bash
cd apps/screenpipe-app-tauri/src-tauri
cargo check --locked --bin screenpipe-app
```

### 4. Commit, Push, and Dispatch Exact SHA
```bash
git add -A && git commit -m "Bump app to vX.Y.Z" && git pull --rebase && git push

BUMP_SHA=$(git rev-parse HEAD)
gh workflow run release-app.yml \
  --ref main \
  -f commit_hash="$BUMP_SHA" \
  -f version="X.Y.Z" \
  -f needs_testing=false \
  -f force_github_runners=false
```

`release-app.yml` is currently `workflow_dispatch` only. A bump push does not start it. Dispatch it once with the exact pushed commit and version inputs; its workflow builds, signs, notarizes, and uploads immutable versioned artifacts. It does not publish updater pointers or create the public GitHub release.

Before dispatching, verify the remote `main` SHA still matches `BUMP_SHA`. After dispatching, read the run back and require its `headSha` to match. Never dispatch a second app run for the same
```

---

# OUTRO - SKILL.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\crates\screenpipe-core\assets\skills\render-html-report\SKILL.md
**SHA:** 7c02bdf749922194d0fa532ded8ddc4cdd645f181b9c52a39621a93f992c0c78
**Timestamp:** 2026-08-23T23:43:38.283978
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- .cards { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }

### Ouro Bruto (primeiros 5000 chars)
```
---
name: render-html-report
description: Produce a human-facing visual report — a chart, dashboard, scorecard, or styled summary — that renders as a live page in the screenpipe viewer instead of plain text. Use when the task asks for a visual/graphical output rather than a plain note; do NOT use for plain text or raw data (prefer a markdown note for those).
---

# render an html report

screenpipe's in-app viewer can render a standalone `.html` file as a live page (charts, dashboards, styled reports) — but only when you **opt in** and keep the file **self-contained**. Otherwise it shows as raw source.

## the two rules

1. **Opt in.** The first line of the file must be the marker:

   ```
   <!-- screenpipe:render=human -->
   ```

   (or `<meta name="screenpipe:render" content="human">` inside `<head>`). Without it the file shows as source, not a rendered page.

2. **Self-contained — no network.** It renders in a locked-down sandbox with **zero network access**. So:
   - inline **all** CSS in a `<style>` tag and **all** JS in a `<script>` tag;
   - embed any images as `data:` URIs;
   - **no** external `<script src>` / `<link rel=stylesheet>` / CDN, **no** `fetch`, **no** forms that POST.

   Anything that touches the network is silently blocked — **a CDN-loaded chart library renders blank**. Draw charts with **inline SVG** or plain HTML/CSS bars instead (see the template).

## how the user sees it

Write the file (e.g. `./output/report.html`), then link it with an **absolute** path from your note or notification — e.g. `[open report](/Users/me/.../output/report.html)`. The user clicks it; the viewer offers **"preview rendered"**; it renders inside the sandbox. Only standalone `.html` / `.htm` files render — HTML pasted inside a markdown note does not.

The viewer matches the host light/dark theme; if you care about dark mode, style with `@media (prefers-color-scheme: dark)`.

## template (copy, then fill in with real data)

```html
<!-- screenpipe:render=human -->
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { margin: 0; padding: 24px; font-family: system-ui, -apple-system, sans-serif; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .sub { color: #666; font-size: 13px; margin: 0 0 20px; }
  .cards { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
  .card { flex: 1; min-width: 120px; background: #f4f4f5; border-radius: 10px; padding: 12px 14px; }
  .card .label { font-size: 12px; color: #666; }
  .card .value { font-size: 24px; font-weight: 600; }
  .bar { fill: #3b82f6; }
  .axis { fill: #999; font-size: 11px; }
</style>
</head>
<body>
  <h1>daily focus report</h1>
  <p class="sub">where your time went today</p>

  <div class="cards">
    <div class="card"><div class="label">tracked</div><div class="value">6.4h</div></div>
    <div class="card"><div class="label">top app</div><div class="value">vs code</div></div>
    <div class="card"><div class="label">meetings</div><div class="value">3</div></div>
  </div>

  <!-- inline SVG chart — no chart library (CDNs are blocked in the sandbox) -->
  <svg viewBox="0 0 400 180" width="100%" role="img" aria-label="hours per app">
    <rect class="bar" x="20"  y="40"  width="50" height="120"></rect>
    <rect class="bar" x="90"  y="80"  width="50" height="80"></rect>
    <rect class="bar" x="160" y="110" width="50" height="50"></rect>
    <rect class="bar" x="230" y="130" width="50" height="30"></rect>
    <text class="axis" x="45"  y="174" text-anchor="middle">code</text>
    <text class="axis" x="115" y="174" text-anchor="middle">chrome</text>
    <text class="axis" x="185" y="174" text-anchor="middle">slack</text>
    <text class="axis" x="255" y="174" text-anchor="middle">mail</text>
  </svg>
</body>
</html>
```

## checklist before you save

- [ ] first line is `<!-- screenpipe:render=human -->`
- [ ] all CSS/JS inline; all images are `data:` URIs
- [ ] no CDN / `<script src>` / `fetch` / forms
- [ ] linked from the note or notification with an **absolute** path

```