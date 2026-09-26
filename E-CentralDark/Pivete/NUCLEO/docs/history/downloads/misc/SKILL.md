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

---

# OUTRO - SKILL.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\hugging-face\skills\papers\SKILL.md
**SHA:** 985c2d5c7261aba2
**Timestamp:** 2026-08-26T18:31:47.225390
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- - Pattern: `^\d{4}\.\d{4,5}$`

### Ouro Bruto (primeiros 5000 chars)
```
---
name: huggingface-papers
description: Look up and read Hugging Face paper pages in markdown, and use the papers API for structured metadata such as authors, linked models/datasets/spaces, Github repo and project page. Use when the user shares a Hugging Face paper page URL, an arXiv URL or ID, or asks to summarize, explain, or analyze an AI research paper.
---

# Hugging Face Paper Pages

Hugging Face Paper pages (hf.co/papers) is a platform built on top of arXiv (arxiv.org), specifically for research papers in the field of artificial intelligence (AI) and computer science. Hugging Face users can submit their paper at hf.co/papers/submit, which features it on the Daily Papers feed (hf.co/papers). Each day, users can upvote papers and comment on papers. Each paper page allows authors to:
- claim their paper (by clicking their name on the `authors` field). This makes the paper page appear on their Hugging Face profile.
- link the associated model checkpoints, datasets and Spaces by including the HF paper or arXiv URL in the model card, dataset card or README of the Space
- link the Github repository and/or project page URLs
- link the HF organization. This also makes the paper page appear on the Hugging Face organization page.

Whenever someone mentions a HF paper or arXiv abstract/PDF URL in a model card, dataset card or README of a Space repository, the paper will be automatically indexed. Note that not all papers indexed on Hugging Face are also submitted to daily papers. The latter is more a manner of promoting a research paper. Papers can only be submitted to daily papers up until 14 days after their publication date on arXiv.

The Hugging Face team has built an easy-to-use API to interact with paper pages. Content of the papers can be fetched as markdown, or structured metadata can be returned such as author names, linked models/datasets/spaces, linked Github repo and project page.

## When to Use

- User shares a Hugging Face paper page URL (e.g. `https://huggingface.co/papers/2602.08025`)
- User shares a Hugging Face markdown paper page URL (e.g. `https://huggingface.co/papers/2602.08025.md`)
- User shares an arXiv URL (e.g. `https://arxiv.org/abs/2602.08025` or  `https://arxiv.org/pdf/2602.08025`)
- User mentions a arXiv ID (e.g. `2602.08025`)
- User asks you to summarize, explain, or analyze an AI research paper

## Parsing the paper ID

It's recommended to parse the paper ID (arXiv ID) from whatever the user provides:

| Input | Paper ID |
| --- | --- |
| `https://huggingface.co/papers/2602.08025` | `2602.08025` |
| `https://huggingface.co/papers/2602.08025.md` | `2602.08025` |
| `https://arxiv.org/abs/2602.08025` | `2602.08025` |
| `https://arxiv.org/pdf/2602.08025` | `2602.08025` |
| `2602.08025v1` | `2602.08025v1` |
| `2602.08025` | `2602.08025` |

This allows you to provide the paper ID into any of the hub API endpoints mentioned below.

### Fetch the paper page as markdown

The content of a paper can be fetched as markdown like so:

```bash
curl -s "https://huggingface.co/papers/{PAPER_ID}.md"
```

This should return the Hugging Face paper page as markdown. This relies on the HTML version of the paper at https://arxiv.org/html/{PAPER_ID}.

There are 2 exceptions:
- Not all arXiv papers have an HTML version. If the HTML version of the paper does not exist, then the content falls back to the HTML of the Hugging Face paper page.
- If it results in a 404, it means the paper is not yet indexed on hf.co/papers. See [Error handling](#error-handling) for info.

Alternatively, you can request markdown from the normal paper page URL, like so:

```bash
curl -s -H "Accept: text/markdown" "https://huggingface.co/papers/{PAPER_ID}"
```

### Paper Pages API Endpoints

All endpoints use the base URL `https://huggingface.co`.

#### Get structured metadata

Fetch the paper metadata as JSON using the Hugging Face REST API:

```bash
curl -s "https://huggingface.co/api/papers/{PAPER_ID}"
```

This returns structured metadata that can include:

- authors (names and Hugging Face usernames, in case they have claimed the paper)
- media URLs (uploaded when submitting the paper to Daily Papers)
- summary (abstract) and AI-generated summary
- project page and GitHub repository
- organization and engagement metadata (number of upvotes)

To find models linked to the paper, use:

```bash
curl https://huggingface.co/api/models?filter=arxiv:{PAPER_ID}
```

To find datasets linked to the paper, use:

```bash
curl https://huggingface.co/api/datasets?filter=arxiv:{PAPER_ID}
```

To find spaces linked to the paper, use:

```bash
curl https://huggingface.co/api/spaces?filter=arxiv:{PAPER_ID}
```

#### Claim paper authorship

Claim authorship of a paper for a Hugging Face user:

```bash
curl "https://huggingface.co/api/settings/papers/claim" \
  --request POST \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $HF_TOKEN" \
  --data '{
    "paperId": "{PAPER_ID}",
    "claimAuthorId": "{AUTHOR_ENTRY
```

---

# OUTRO - SKILL.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\render\skills\render-background-workers\SKILL.md
**SHA:** fd9959a0c5d9271a
**Timestamp:** 2026-08-26T18:42:42.519260
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- Minimal pattern: **`type: worker`**, **`runtime`**, **`buildCommand`**, **`startCommand`**, and **`envVars`** wired from Key Value.

### Ouro Bruto (primeiros 5000 chars)
```
---
name: render-background-workers
description: >-
  Sets up and configures background workers on Render for queue-based job
  processing. Use when the user needs to process async jobs, consume from a
  queue, run Celery/Sidekiq/BullMQ/Asynq/Oban workers, handle graceful
  shutdown with SIGTERM, wire a worker to Key Value (Redis), or choose between
  workers and cron jobs for background work.
  Trigger terms: background worker, async jobs, queue consumer, Celery,
  Sidekiq, BullMQ, Asynq, Oban, job processing, SIGTERM, graceful shutdown.
license: MIT
compatibility: Render background worker services
metadata:
  author: Render
  version: "1.0.0"
  category: compute
---

# Render Background Workers

This skill explains **worker** services on Render: processes that **consume jobs from a queue** instead of serving HTTP. Pair with **render-blueprints**, **render-env-vars**, and **render-networking** when wiring `render.yaml` and private connectivity.

## When to Use

- Designing or debugging **queue-backed workers** (Celery, Sidekiq, BullMQ, Asynq, etc.)
- Choosing between a **worker**, **Cron Job**, or **Workflow** for background work
- Configuring **Render Key Value** as a **broker** (not a cache) with correct **eviction policy**
- Implementing **graceful shutdown** so in-flight jobs are not lost on deploy

Per-framework setup and signal-handling detail: `references/queue-framework-setup.md`, `references/graceful-shutdown.md`.

## How Workers Work

- **Long-running services** with **no inbound (HTTP) traffic**. Render does not expose a public URL or internal hostname for workers the way it does for web or private services—**workers cannot receive private network traffic directed at them**.
- The typical pattern is a **poll loop**: the process connects to a **queue backend** (often **Render Key Value**, Redis-compatible **Valkey 8**) and **pulls jobs**.
- Workers **can initiate outbound connections** on the private network—to **PostgreSQL**, **Key Value**, **private services**, **web services** (internal URLs), and the public internet—subject to your plan and firewall rules.

## Queue Framework Overview

| Framework | Language | Queue backend | Notes |
|-----------|----------|---------------|--------|
| Celery | Python | Redis / Key Value | Most common Python task queue |
| Sidekiq | Ruby | Redis / Key Value | Standard for Rails |
| BullMQ | Node.js | Redis / Key Value | Modern Node queue (Redis-based) |
| Asynq | Go | Redis / Key Value | Go async task processing |
| Oban | Elixir | **Postgres** (not Redis) | Queue stored in the database |

## Pairing with Key Value

- Use **Render Key Value** as the **job broker** when your framework expects Redis.
- Set **maxmemory policy** to **`noeviction`**. **`allkeys-lru`** and similar policies are for **caches**; evicting queue keys **drops jobs**.
- Wire **`REDIS_URL`** (or your framework’s equivalent) via **`fromService`** with `type: keyvalue` and `property: connectionString` in the Blueprint.
- **Blueprints require `ipAllowList`** on Key Value—include the CIDRs that should reach the instance (often `[]` for private-network-only access; see **render-blueprints** / Key Value field reference).

See `references/queue-framework-setup.md` for minimal app + YAML examples.

## Worker vs Cron vs Workflow

| Need | Use | Why |
|------|-----|-----|
| Always-on queue consumer | **Background Worker** | Polls continuously; long-lived process |
| Periodic scheduled task | **Cron Job** | Runs on a schedule, **exits**; **12h max** per run |
| Distributed parallel compute | **Workflow** | Each run gets its own instance; fan-out patterns |
| High-volume or bursty jobs | **Workflow** | Scales per run; **no idle instance cost** between runs |

## Graceful Shutdown

- Before stopping an instance, Render sends **`SIGTERM`**, then waits up to **`maxShutdownDelaySeconds`** (**1–300**, **default 30**) before **`SIGKILL`**.
- Workers should: **(1)** stop accepting new jobs, **(2)** finish the current job or **checkpoint** progress, **(3)** close connections, **(4)** exit **0**.
- Set **`maxShutdownDelaySeconds`** to at least your **longest safe job duration** (see Dashboard or Blueprint).

Language- and framework-specific handlers: `references/graceful-shutdown.md`.

## Blueprint Configuration

Minimal pattern: **`type: worker`**, **`runtime`**, **`buildCommand`**, **`startCommand`**, and **`envVars`** wired from Key Value.

```yaml
services:
  - type: keyvalue
    name: jobs
    plan: starter
    region: oregon
    ipAllowList: []

  - type: worker
    name: task-worker
    runtime: python
    region: oregon
    plan: starter
    buildCommand: pip install -r requirements.txt
    startCommand: celery -A tasks worker --loglevel=info
    envVars:
      - key: REDIS_URL
        fromService:
          name: jobs
          type: keyvalue
          property: connectionString
```

Optional: **`maxShutdownDelaySeconds`** on the worker service for longer draining jobs.

## References

| Topic | File |
```

---

# OUTRO - SKILL.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\superpowers\skills\finishing-a-development-branch\SKILL.md
**SHA:** 5c8d4b59aedb14c9
**Timestamp:** 2026-08-26T18:44:15.605251
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- **Announce at start:** "I'm using the finishing-a-development-branch skill to complete this work."

### Principios
- **Core principle:** Verify tests → Detect environment → Present options → Execute choice → Clean up.

### Ouro Bruto (primeiros 5000 chars)
```
---
name: finishing-a-development-branch
description: Use when implementation is complete, all tests pass, and you need to decide how to integrate the work - guides completion of development work by presenting structured options for merge, PR, or cleanup
---

# Finishing a Development Branch

## Overview

Guide completion of development work by presenting clear options and handling chosen workflow.

**Core principle:** Verify tests → Detect environment → Present options → Execute choice → Clean up.

**Announce at start:** "I'm using the finishing-a-development-branch skill to complete this work."

## The Process

### Step 1: Verify Tests

**Before presenting options, verify tests pass:**

```bash
# Run project's test suite
npm test / cargo test / pytest / go test ./...
```

**If tests fail:**
```
Tests failing (<N> failures). Must fix before completing:

[Show failures]

Cannot proceed with merge/PR until tests pass.
```

Stop. Don't proceed to Step 2.

**If tests pass:** Continue to Step 2.

### Step 2: Detect Environment

**Determine workspace state before presenting options:**

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
```

This determines which menu to show and how cleanup works:

| State | Menu | Cleanup |
|-------|------|---------|
| `GIT_DIR == GIT_COMMON` (normal repo) | Standard 4 options | No worktree to clean up |
| `GIT_DIR != GIT_COMMON`, named branch | Standard 4 options | Provenance-based (see Step 6) |
| `GIT_DIR != GIT_COMMON`, detached HEAD | Reduced 3 options (no merge) | No cleanup (externally managed) |

### Step 3: Determine Base Branch

```bash
# Try common base branches
git merge-base HEAD main 2>/dev/null || git merge-base HEAD master 2>/dev/null
```

Or ask: "This branch split from main - is that correct?"

### Step 4: Present Options

**Normal repo and named-branch worktree — present exactly these 4 options:**

```
Implementation complete. What would you like to do?

1. Merge back to <base-branch> locally
2. Push and create a Pull Request
3. Keep the branch as-is (I'll handle it later)
4. Discard this work

Which option?
```

**Detached HEAD — present exactly these 3 options:**

```
Implementation complete. You're on a detached HEAD (externally managed workspace).

1. Push as new branch and create a Pull Request
2. Keep as-is (I'll handle it later)
3. Discard this work

Which option?
```

**Don't add explanation** - keep options concise.

### Step 5: Execute Choice

#### Option 1: Merge Locally

```bash
# Get main repo root for CWD safety
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"

# Merge first — verify success before removing anything
git checkout <base-branch>
git pull
git merge <feature-branch>

# Verify tests on merged result
<test command>

# Only after merge succeeds: cleanup worktree (Step 6), then delete branch
```

Then: Cleanup worktree (Step 6), then delete branch:

```bash
git branch -d <feature-branch>
```

#### Option 2: Push and Create PR

```bash
# Push branch
git push -u origin <feature-branch>

# Create PR
gh pr create --title "<title>" --body "$(cat <<'EOF'
## Summary
<2-3 bullets of what changed>

## Test Plan
- [ ] <verification steps>
EOF
)"
```

**Do NOT clean up worktree** — user needs it alive to iterate on PR feedback.

#### Option 3: Keep As-Is

Report: "Keeping branch <name>. Worktree preserved at <path>."

**Don't cleanup worktree.**

#### Option 4: Discard

**Confirm first:**
```
This will permanently delete:
- Branch <name>
- All commits: <commit-list>
- Worktree at <path>

Type 'discard' to confirm.
```

Wait for exact confirmation.

If confirmed:
```bash
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"
```

Then: Cleanup worktree (Step 6), then force-delete branch:
```bash
git branch -D <feature-branch>
```

### Step 6: Cleanup Workspace

**Only runs for Options 1 and 4.** Options 2 and 3 always preserve the worktree.

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
WORKTREE_PATH=$(git rev-parse --show-toplevel)
```

**If `GIT_DIR == GIT_COMMON`:** Normal repo, no worktree to clean up. Done.

**If worktree path is under `.worktrees/`, `worktrees/`, or `~/.config/superpowers/worktrees/`:** Superpowers created this worktree — we own cleanup.

```bash
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"
git worktree remove "$WORKTREE_PATH"
git worktree prune  # Self-healing: clean up any stale registrations
```

**Otherwise:** The host environment (harness) owns this workspace. Do NOT remove it. If your platform provides a workspace-exit tool, use it. Otherwise, leave the workspace in place.

## Quick Reference

| Option | Merge | Push | Keep Worktree | Cleanup Branch |
|--------|-------|-----
```

---

# OUTRO - SKILL.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\wix\skills\wix-design-system\SKILL.md
**SHA:** 97539bf7e6713fbe
**Timestamp:** 2026-08-26T18:45:19.386465
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- <Box gap="SP2" padding="SP3">

### Ouro Bruto (primeiros 5000 chars)
```
---
name: wix-design-system
description: Wix Design System component reference. Use when building UI with @wix/design-system, choosing components, checking props and examples, or writing tests with component testkits. Triggers on "what component", "how do I make", "WDS", "show me props", "testkit", "driver", or component names like Button, Card, Modal, Box, Text.
---

# WDS Documentation Navigator

**Prerequisite:** `@wix/design-system` must be installed (`npm i @wix/design-system` or `yarn add @wix/design-system`).

## Helper Script

This skill bundles `scripts/wds.cjs` — a Node.js helper that auto-discovers `@wix/design-system` in node_modules (handles monorepos and workspaces) and provides focused lookups. Run it from the user's project directory using the absolute path to the bundled script:

```bash
# WDS is the absolute path to this skill's scripts/wds.cjs
WDS="<this-skill-dir>/scripts/wds.cjs"

node $WDS search <keyword>                 # Find components by keyword
node $WDS component <Name>                 # Get props + example list (one component)
node $WDS components <Name1> <Name2>...    # Same as `component`, but for several at once
node $WDS example <Name> "<ExampleName>"   # Get a specific example
node $WDS testkit <Name> [method]          # Get testkit imports + driver API
node $WDS icons <query>                    # Search for icons
```

## Workflow

### Step 1: Find the right component

```bash
node $WDS search table
node $WDS search form input validation
node $WDS search modal dialog popup
```

Multiple keywords are OR-matched. Returns component names, descriptions, and usage guidance.

### Step 2: Get props and available examples

```bash
node $WDS component Button
```

Returns the full props list (types and descriptions) plus a list of all available examples. For large prop files (>200 lines), returns a summary with prop names and types.

If you already know which several components you'll need (e.g. after Step 1 returned a shortlist), prefer the batch form to avoid one round-trip per component:

```bash
node $WDS components Button Card Table Input Text Thumbnail
```

Output is each component's props block separated by `---`. Missing components are logged to stderr and skipped; the command only fails if every requested component is missing.

### Step 3: Get a specific example

```bash
node $WDS example Button "Loading state"
```

Returns the example description and JSX code. Matching is case-insensitive and supports substrings (e.g., "loading" matches "Loading state").

### Step 4: Write tests with the component testkit

```bash
node $WDS testkit Button             # Imports + full driver API for Button
node $WDS testkit Button click       # Just the click() method details
```

Returns import snippets for unidriver, vanilla, puppeteer, and playwright flavors plus the driver method API (name, args, return type, description). Method name matching is case-insensitive substring.

### Step 5: Find icons

```bash
node $WDS icons Add Edit Delete
```

Icons are from `@wix/wix-ui-icons-common`. Each icon has a `Small` variant (e.g., `Add` + `AddSmall`).

## Fallback: Direct File Access

If the script is unavailable, docs are at `node_modules/@wix/design-system/dist/docs/`:

- `components.md` — component catalog (~978 lines, grep only)
- `components/{Name}Props.md` — props per component
- `components/{Name}Examples.md` — examples per component (grep `^### ` for section list)
- `components/{Name}Testkit.md` — testkit imports + driver API per component (grep `^### ` for method list)
- `testkits.md` — testkit catalog (list of components with generated testkit docs)
- `icons.md` — icon catalog (~818 lines, grep only)

Don't read these files fully. Grep for keywords, then read specific sections with offset/limit. See [references/file-structure.md](references/file-structure.md) for the exact docs file layout and section shapes.

---

## Quick Component Mapping (Design to WDS)

| Design Element | WDS Component | Notes |
| --- | --- | --- |
| Rectangle/container | `<Box>` | Layout wrapper |
| Text button | `<TextButton>` | Secondary actions |
| Input with label | `<FormField>` + `<Input>` | Wrap inputs |
| Toggle | `<ToggleSwitch>` | On/off settings |
| Modal | `<Modal>` + `<CustomModalLayout>` | Use together |
| Grid | `<Layout>` + `<Cell>` | Responsive |

## Spacing (px to SP conversion)

When designer specifies pixels, convert to the nearest SP token:

| Token | Classic | Studio |
| --- | --- | --- |
| `SP1` | 6px | 4px |
| `SP2` | 12px | 8px |
| `SP3` | 18px | 12px |
| `SP4` | 24px | 16px |
| `SP5` | 30px | 20px |
| `SP6` | 36px | 24px |

```tsx
<Box gap="SP2" padding="SP3">
```

Only use SP tokens for `gap`, `padding`, `margin` — not for width/height.

## Imports

```tsx
import { Button, Card, Image } from "@wix/design-system";
import { Add, Edit, Delete } from "@wix/wix-ui-icons-common";
```

```

---

# OUTRO - SKILL.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\skills\.system\plugin-creator\SKILL.md
**SHA:** 8fd56316b2c49cbd
**Timestamp:** 2026-08-26T18:46:20.471663
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- 5. Before handing back a generated plugin, run:
- After editing `SKILL.md`, run:
- Before handing back a generated plugin, run:

### Gaps
- The scaffold starts with valid defaults and must not contain `[TODO: ...]` placeholders.
- - Do not leave `[TODO: ...]` placeholders in plugin manifests.

### Ouro Bruto (primeiros 5000 chars)
```
---
name: plugin-creator
description: Create and scaffold plugin directories for Codex with a required `.codex-plugin/plugin.json`, optional plugin folders/files, valid manifest defaults, and personal-marketplace entries by default. Use when Codex needs to create a new personal plugin, add optional plugin structure, generate or update marketplace entries for plugin ordering and availability metadata, or update an existing local plugin during development with the CLI-driven cachebuster and reinstall flow.
---

# Plugin Creator

## Quick Start

1. Run the scaffold script:

```bash
# Plugin names are normalized to lower-case hyphen-case and must be <= 64 chars.
# The generated folder and plugin.json name are always the same.
# Run from the skill root (the directory containing this `SKILL.md`).
# By default creates in `~/plugins/<plugin-name>`.
python3 scripts/create_basic_plugin.py <plugin-name>
```

2. Edit `<plugin-path>/.codex-plugin/plugin.json` when the request gives specific metadata.
   The scaffold starts with valid defaults and must not contain `[TODO: ...]` placeholders.

3. Generate or update the personal marketplace entry when the plugin should appear in Codex UI ordering:

```bash
# Personal marketplace entries default to `~/.agents/plugins/marketplace.json`.
python3 scripts/create_basic_plugin.py my-plugin --with-marketplace
```

Only specify `--marketplace-name <name>` when the default `personal` marketplace name is already
taken or installed and you need to seed a different new marketplace file:

```bash
python3 scripts/create_basic_plugin.py my-plugin \
  --with-marketplace \
  --marketplace-name team-local
```

Only use a repo/team marketplace when the user specifically asks for that destination:

```bash
python3 scripts/create_basic_plugin.py my-plugin \
  --path <repo-root>/plugins \
  --marketplace-path <repo-root>/.agents/plugins/marketplace.json \
  --with-marketplace
```

When the user specifies a marketplace path, make sure that marketplace is actually installed before
telling the user to reinstall from it. The default personal marketplace file at
`~/.agents/plugins/marketplace.json` is discovered implicitly, but other marketplace paths are not.
On Windows, use the equivalent path under the user profile.

4. Generate/adjust optional companion folders as needed:

```bash
python3 scripts/create_basic_plugin.py my-plugin \
  --path <parent-plugin-directory> \
  --marketplace-path <marketplace-json-path> \
  --with-skills --with-hooks --with-scripts --with-assets --with-mcp --with-apps --with-marketplace
```

`<parent-plugin-directory>` is the directory where the plugin folder `<plugin-name>` will be
created (for example `~/plugins`).

5. Before handing back a generated plugin, run:

```bash
python3 scripts/validate_plugin.py <plugin-path>
```

For updates to an existing local plugin during development, keep the scaffold flow as-is and use the
reference instead of hand-editing marketplace files:

```bash
python3 scripts/update_plugin_cachebuster.py <plugin-path>
```

Prefer the helper default cachebuster unless the user explicitly asks for a specific override.
See `references/installing-and-updating.md` for the expected cachebuster and reinstall flow while iterating on an existing local plugin.

## What this skill creates

- Default marketplace-backed scaffolds use the personal marketplace file at
  `~/.agents/plugins/marketplace.json`, with plugins generally being stored in
  `~/plugins/<plugin-name>/`.
- Creates plugin root at `/<parent-plugin-directory>/<plugin-name>/`.
- Always creates `/<parent-plugin-directory>/<plugin-name>/.codex-plugin/plugin.json`.
- Fills the manifest with the validated schema shape that the ingestion path accepts.
- Creates or updates `~/.agents/plugins/marketplace.json` when `--with-marketplace` is set.
  - If the marketplace file does not exist yet, seed a personal marketplace root before adding the first plugin entry.
- `<plugin-name>` is normalized using skill-creator naming rules:
  - `My Plugin` → `my-plugin`
  - `My--Plugin` → `my-plugin`
  - underscores, spaces, and punctuation are converted to `-`
  - result is lower-case hyphen-delimited with consecutive hyphens collapsed
- Supports optional creation of:
  - `skills/`
  - `hooks/`
  - `scripts/`
  - `assets/`
  - `.mcp.json`
  - `.app.json`

## Marketplace workflow

- Personal-marketplace creation defaults to `~/.agents/plugins/marketplace.json`. Here,
  "personal marketplace" means the marketplace whose file is at that path.
- Repo/team marketplace creation is opt-in through both `--path` and `--marketplace-path`, only
  when the user specifically requests it.
- `--marketplace-name` is an exception path. Use it only when the default `personal` marketplace
  name is already taken and you need to seed a different new marketplace file.
- Do not use `--marketplace-name` to rename an existing marketplace file in place. If the file
  already exists, its top-level `name` must already match.
- If the user sp
```

---

# OUTRO - SKILL.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\.agents\skills\docx\SKILL.md
**SHA:** cfbabd72b1aec7df
**Timestamp:** 2026-08-26T19:30:44.141097
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- default: { document: { run: { font: "Arial", size: 24 } } }, // 12pt default
- run: { size: 32, bold: true, font: "Arial" },
- run: { size: 28, bold: true, font: "Arial" },

### Ouro Bruto (primeiros 5000 chars)
```
---
name: docx
description: "Use this skill whenever the user wants to create, read, edit, or manipulate Word documents (.docx files). Triggers include: any mention of 'Word doc', 'word document', '.docx', or requests to produce professional documents with formatting like tables of contents, headings, page numbers, or letterheads. Also use when extracting or reorganizing content from .docx files, inserting or replacing images in documents, performing find-and-replace in Word files, working with tracked changes or comments, or converting content into a polished Word document. If the user asks for a 'report', 'memo', 'letter', 'template', or similar deliverable as a Word or .docx file, use this skill. Do NOT use for PDFs, spreadsheets, Google Docs, or general coding tasks unrelated to document generation."
license: Proprietary. LICENSE.txt has complete terms
---

# DOCX creation, editing, and analysis

## Overview

A .docx file is a ZIP archive containing XML files.

## Quick Reference

| Task | Approach |
|------|----------|
| Read/analyze content | `pandoc` or unpack for raw XML |
| Create new document | Use `docx-js` - see Creating New Documents below |
| Edit existing document | Unpack → edit XML → repack - see Editing Existing Documents below |

### Converting .doc to .docx

Legacy `.doc` files must be converted before editing:

```bash
python scripts/office/soffice.py --headless --convert-to docx document.doc
```

### Reading Content

```bash
# Text extraction with tracked changes
pandoc --track-changes=all document.docx -o output.md

# Raw XML access
python scripts/office/unpack.py document.docx unpacked/
```

### Converting to Images

```bash
python scripts/office/soffice.py --headless --convert-to pdf document.docx
pdftoppm -jpeg -r 150 document.pdf page
```

### Accepting Tracked Changes

To produce a clean document with all tracked changes accepted (requires LibreOffice):

```bash
python scripts/accept_changes.py input.docx output.docx
```

---

## Creating New Documents

Generate .docx files with JavaScript, then validate. Install: `npm install -g docx`

### Setup
```javascript
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
        Header, Footer, AlignmentType, PageOrientation, LevelFormat, ExternalHyperlink,
        InternalHyperlink, Bookmark, FootnoteReferenceRun, PositionalTab,
        PositionalTabAlignment, PositionalTabRelativeTo, PositionalTabLeader,
        TabStopType, TabStopPosition, Column, SectionType,
        TableOfContents, HeadingLevel, BorderStyle, WidthType, ShadingType,
        VerticalAlign, PageNumber, PageBreak } = require('docx');

const doc = new Document({ sections: [{ children: [/* content */] }] });
Packer.toBuffer(doc).then(buffer => fs.writeFileSync("doc.docx", buffer));
```

### Validation
After creating the file, validate it. If validation fails, unpack, fix the XML, and repack.
```bash
python scripts/office/validate.py doc.docx
```

### Page Size

```javascript
// CRITICAL: docx-js defaults to A4, not US Letter
// Always set page size explicitly for consistent results
sections: [{
  properties: {
    page: {
      size: {
        width: 12240,   // 8.5 inches in DXA
        height: 15840   // 11 inches in DXA
      },
      margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } // 1 inch margins
    }
  },
  children: [/* content */]
}]
```

**Common page sizes (DXA units, 1440 DXA = 1 inch):**

| Paper | Width | Height | Content Width (1" margins) |
|-------|-------|--------|---------------------------|
| US Letter | 12,240 | 15,840 | 9,360 |
| A4 (default) | 11,906 | 16,838 | 9,026 |

**Landscape orientation:** docx-js swaps width/height internally, so pass portrait dimensions and let it handle the swap:
```javascript
size: {
  width: 12240,   // Pass SHORT edge as width
  height: 15840,  // Pass LONG edge as height
  orientation: PageOrientation.LANDSCAPE  // docx-js swaps them in the XML
},
// Content width = 15840 - left margin - right margin (uses the long edge)
```

### Styles (Override Built-in Headings)

Use Arial as the default font (universally supported). Keep titles black for readability.

```javascript
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 24 } } }, // 12pt default
    paragraphStyles: [
      // IMPORTANT: Use exact IDs to override built-in styles
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial" },
        paragraph: { spacing: { before: 240, after: 240 }, outlineLevel: 0 } }, // outlineLevel required for TOC
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial" },
        paragraph: { spacing: { before: 180, after: 180 }, outlineLevel: 1 } },
    ]
  },
  sections: [{
    children: [
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(
```

---

# OUTRO - SKILL.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\.agents\skills\slack-gif-creator\SKILL.md
**SHA:** 2efca615ce55a3ed
**Timestamp:** 2026-08-26T19:30:45.611349
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- y = interpolate(start=0, end=400, t=t, easing='ease_out')

### Ouro Bruto (primeiros 5000 chars)
```
---
name: slack-gif-creator
description: Knowledge and utilities for creating animated GIFs optimized for Slack. Provides constraints, validation tools, and animation concepts. Use when users request animated GIFs for Slack like "make me a GIF of X doing Y for Slack."
license: Complete terms in LICENSE.txt
---

# Slack GIF Creator

A toolkit providing utilities and knowledge for creating animated GIFs optimized for Slack.

## Slack Requirements

**Dimensions:**
- Emoji GIFs: 128x128 (recommended)
- Message GIFs: 480x480

**Parameters:**
- FPS: 10-30 (lower is smaller file size)
- Colors: 48-128 (fewer = smaller file size)
- Duration: Keep under 3 seconds for emoji GIFs

## Core Workflow

```python
from core.gif_builder import GIFBuilder
from PIL import Image, ImageDraw

# 1. Create builder
builder = GIFBuilder(width=128, height=128, fps=10)

# 2. Generate frames
for i in range(12):
    frame = Image.new('RGB', (128, 128), (240, 248, 255))
    draw = ImageDraw.Draw(frame)

    # Draw your animation using PIL primitives
    # (circles, polygons, lines, etc.)

    builder.add_frame(frame)

# 3. Save with optimization
builder.save('output.gif', num_colors=48, optimize_for_emoji=True)
```

## Drawing Graphics

### Working with User-Uploaded Images
If a user uploads an image, consider whether they want to:
- **Use it directly** (e.g., "animate this", "split this into frames")
- **Use it as inspiration** (e.g., "make something like this")

Load and work with images using PIL:
```python
from PIL import Image

uploaded = Image.open('file.png')
# Use directly, or just as reference for colors/style
```

### Drawing from Scratch
When drawing graphics from scratch, use PIL ImageDraw primitives:

```python
from PIL import ImageDraw

draw = ImageDraw.Draw(frame)

# Circles/ovals
draw.ellipse([x1, y1, x2, y2], fill=(r, g, b), outline=(r, g, b), width=3)

# Stars, triangles, any polygon
points = [(x1, y1), (x2, y2), (x3, y3), ...]
draw.polygon(points, fill=(r, g, b), outline=(r, g, b), width=3)

# Lines
draw.line([(x1, y1), (x2, y2)], fill=(r, g, b), width=5)

# Rectangles
draw.rectangle([x1, y1, x2, y2], fill=(r, g, b), outline=(r, g, b), width=3)
```

**Don't use:** Emoji fonts (unreliable across platforms) or assume pre-packaged graphics exist in this skill.

### Making Graphics Look Good

Graphics should look polished and creative, not basic. Here's how:

**Use thicker lines** - Always set `width=2` or higher for outlines and lines. Thin lines (width=1) look choppy and amateurish.

**Add visual depth**:
- Use gradients for backgrounds (`create_gradient_background`)
- Layer multiple shapes for complexity (e.g., a star with a smaller star inside)

**Make shapes more interesting**:
- Don't just draw a plain circle - add highlights, rings, or patterns
- Stars can have glows (draw larger, semi-transparent versions behind)
- Combine multiple shapes (stars + sparkles, circles + rings)

**Pay attention to colors**:
- Use vibrant, complementary colors
- Add contrast (dark outlines on light shapes, light outlines on dark shapes)
- Consider the overall composition

**For complex shapes** (hearts, snowflakes, etc.):
- Use combinations of polygons and ellipses
- Calculate points carefully for symmetry
- Add details (a heart can have a highlight curve, snowflakes have intricate branches)

Be creative and detailed! A good Slack GIF should look polished, not like placeholder graphics.

## Available Utilities

### GIFBuilder (`core.gif_builder`)
Assembles frames and optimizes for Slack:
```python
builder = GIFBuilder(width=128, height=128, fps=10)
builder.add_frame(frame)  # Add PIL Image
builder.add_frames(frames)  # Add list of frames
builder.save('out.gif', num_colors=48, optimize_for_emoji=True, remove_duplicates=True)
```

### Validators (`core.validators`)
Check if GIF meets Slack requirements:
```python
from core.validators import validate_gif, is_slack_ready

# Detailed validation
passes, info = validate_gif('my.gif', is_emoji=True, verbose=True)

# Quick check
if is_slack_ready('my.gif'):
    print("Ready!")
```

### Easing Functions (`core.easing`)
Smooth motion instead of linear:
```python
from core.easing import interpolate

# Progress from 0.0 to 1.0
t = i / (num_frames - 1)

# Apply easing
y = interpolate(start=0, end=400, t=t, easing='ease_out')

# Available: linear, ease_in, ease_out, ease_in_out,
#           bounce_out, elastic_out, back_out
```

### Frame Helpers (`core.frame_composer`)
Convenience functions for common needs:
```python
from core.frame_composer import (
    create_blank_frame,         # Solid color background
    create_gradient_background,  # Vertical gradient
    draw_circle,                # Helper for circles
    draw_text,                  # Simple text rendering
    draw_star                   # 5-pointed star
)
```

## Animation Concepts

### Shake/Vibrate
Offset object position with oscillation:
- Use `math.sin()` or `math.cos()` with frame index
- Add small random variations for natural feel
- 
```