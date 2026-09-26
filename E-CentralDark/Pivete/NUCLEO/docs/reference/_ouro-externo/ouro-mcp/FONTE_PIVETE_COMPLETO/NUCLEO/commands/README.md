# COMANDO - README.md
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\README.md
**SHA:** a43b6d4d987fa074
**Timestamp:** 2026-08-23T14:15:49.534481
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- To install the screenpipe skills and MCP configuration into every supported agent detected on your computer, run:

### Ouro Bruto (primeiros 5000 chars)
```
<h1 align="center"><a href="https://screenpipe.com/how-to-install?download=1">DOWNLOAD SCREENPIPE</a></h1>

<img width="1500" height="500" alt="image" src="https://github.com/user-attachments/assets/058a44b8-fcad-4a37-92d8-830167dbd400" />


<p align="center">
   <a href ="https://screenpi.pe">
      <img src="https://github.com/user-attachments/assets/d3b1de26-c3c0-4c84-b9c4-b03213b97a30" alt="logo" width="200">
   </a>
</p>

<h1 align="center">[ screenpipe | YC S26 ]</h1>




<p align="center">Screenpipe remembers how you actually work</p>
<p align="center">Record your screen continuously locally and provide context to your agents (Claude, Codex, Openclaw, Hermes, Runner...)</p>




<p align="center">
<a align="center" href="https://trendshift.io/repositories/20386" target="_blank"><img align="center" src="https://trendshift.io/api/badge/repositories/20386" alt="screenpipe%2Fscreenpipe | Trendshift" style="width: 250px; height: 55px;" width="250" height="55"/></a>
</p>

<p align="center">
  <a href="https://discord.gg/screenpipe">
    <img src="https://img.shields.io/discord/823813159592001537?style=for-the-badge&logo=discord&logoColor=white" alt="discord">
  </a>
  <a href="https://twitter.com/screenpipe">
    <img src="https://img.shields.io/twitter/follow/screenpipe?style=for-the-badge&logo=x&logoColor=white&label=follow" alt="twitter">
  </a>
  <a href="https://www.youtube.com/@screen_pipe">
    <img src="https://img.shields.io/youtube/channel/subscribers/UCwjkpAsb70_mENKvy7hT5bw?style=for-the-badge&logo=youtube&logoColor=white&label=subscribers" alt="youtube">
  </a>
</p>







https://github.com/user-attachments/assets/70fe94eb-6d2a-47ca-b7c3-c8ead13a5b7f

<img width="1312" height="947" alt="Screenshot 2026-07-16 at 1 57 50 PM" src="https://github.com/user-attachments/assets/e8de9f45-1f08-4157-ab52-10e3c31822db" />

<img width="1312" height="947" alt="Screenshot 2026-07-16 at 1 58 37 PM" src="https://github.com/user-attachments/assets/4448a90b-6113-46e5-80e4-244c24bb9ba8" />

---

## what is this?

screenpipe capture all your computer work locally and power your agents

```
┌─────────────────────────────────────────┐
│  screen + audio → local storage → ai   │
└─────────────────────────────────────────┘
```

- **remember everything** - never forget what you saw, heard, or did
- **run agents that work based on what you do** generate agents, skills, and automations based on what you do

<img width="360" height="311" alt="image" src="https://github.com/user-attachments/assets/cfbf0fd3-84ef-4feb-8c6d-2779d67058a7" />

- **search with ai** - find anything using natural language
- **100% local** - your data lives on your machine only
- **source-available** - inspect, modify, audit ([LICENSE.md](LICENSE.md))
  **company brain** - share knowledge with your team without turning it into surveillance

<p align="center">
   <a href ="https://screenpi.pe">
      <img src="https://github.com/user-attachments/assets/1f0c04f6-300a-417d-8bd3-5b73435ee2e9">
   </a>
</p>


## install

[download the desktop app](https://screenpipe.com/how-to-install?download=1) — all features, auto-updates

or run the CLI:

```
npx screenpipe record
```

then 

```bash
npx screenpipe setup
# or
claude mcp add screenpipe -- npx -y screenpipe-mcp@latest
```

then ask claude `what did i see in the last 5 mins?` or `summarize today conversations` or `create a pipe that updates linear every time i work on task X`

<details>
<summary>🤖 CLI-only setup for coding agents</summary>

If Claude Code, Codex, Gemini CLI, Cursor, or another coding agent is working from this repository, give it this instruction:

> Read the [screenpipe CLI skill](crates/screenpipe-core/assets/skills/screenpipe-cli/SKILL.md) before operating screenpipe. Set up always-on local capture, verify capture freshness and storage, then query my history without relying on the desktop app.

To install the screenpipe skills and MCP configuration into every supported agent detected on your computer, run:

```bash
npx screenpipe setup
```

The skill covers the recorder-first service default, explicit API-only server mode, human and JSON status, local search, safe read-only SQLite access, pipes, and connections.

</details>


## specs

- captures full accessibility tree, OCR as fallback, transcription, speakers, keyboard inputs, app switches
- 5-10% cpu usage
- 0.5-3gb ram
- ~20gb storage/month
- filters (window, app, chrome extensions, passwords, proprietary AI PII model)
- optional encryption at rest
- works offline

---

<p align="center">
    <a href="https://docs.screenpi.pe">docs</a> ·
    <a href="https://screenpi.pe/team">enterprise</a> ·
    <a href="https://discord.gg/screenpipe">discord</a> ·
    <a href="https://twitter.com/screenpipe">x</a> ·
    <a href="https://www.youtube.com/@screen_pipe">youtube</a> ·
    <a href="https://www.reddit.com/r/screen_pipe">reddit</a>
</p>

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines, maintainers, and how to sub
```

---

# COMANDO - README.md
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\apps\screenpipe-app-tauri\e2e\README.md
**SHA:** 071cff31e9d5420a
**Timestamp:** 2026-08-23T14:15:55.097120
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- The test runner (`wdio.conf.ts` `onPrepare`) calls `netstat -ano | findstr :4445` and kills the owner via `taskkill`. If it persists, manually run:

### Ouro Bruto (primeiros 5000 chars)
```
# E2E Tests

Cross-platform E2E for Screenpipe using [tauri-plugin-webdriver](https://crates.io/crates/tauri-plugin-webdriver). macOS, Windows, Linux.

## Run

From `apps/screenpipe-app-tauri`:

**1. Build**

```bash
bun run build:tauri:e2e
```

- The script sets `NEXT_PUBLIC_SCREENPIPE_E2E=true` to compile in the frontend
  E2E hooks. CI sets this too (see `.github/workflows/e2e-test.yml`); without it
  the app-entitlement account seed is compiled out, so any spec that needs a
  signed-in surface (Brain, Chat) silently renders "sign in required" instead
- It selects the fast `debug-dev` profile, builds only the binary, enables the
  WebDriver plugin, and enters the same system-wide native build queue as normal
  development.

**2. Run tests**

```bash
bun run test:e2e
```

**Run the macOS audio fallback spec**

```bash
bun run test:e2e:audio-fallback:macos
```

This uses `SCREENPIPE_E2E_SEED=onboarding,no-recording,cloud-audio-fallback`
to keep vision capture off while leaving the audio settings visible with
Screenpipe Cloud saved and no logged-in user. It asserts the Recording fallback
alert and the persisted `/notifications` entry.

**Run the local hosted-AI gateway spec**

```bash
bun run test:e2e:local-ai-gateway:macos
```

This opt-in lane bundles the production AI Worker under Miniflare, applies all
checked-in migrations to an isolated in-memory D1 database, and launches the
real E2E app with its hosted-AI URL pinned to that loopback Worker. OpenAI is a
network-closed fake: the harness intercepts the exact chat endpoint and fails
the run if the Worker attempts any other outbound request. No production
gateway, customer data, provider credential, or paid model is used.

**Run the first-run AI summary spec**

```bash
bun run test:e2e:first-run-ai-summary:macos
```

Same local Worker lane, pointed at the post-setup learning window. It proves the
real app reaches the model through the real Pi command and the real Worker, that
the forwarded provider request carries the screen and audio excerpts (not just
app names), and that the model's text — never the deterministic fallback — is
what lands in the seeded chat.

`/activity-summary` is stubbed in the webview: resolving needs >= 10 captured
frames, which a CI machine with no desktop cannot produce and which is not what
this spec is testing. The real engine's answers are covered against a live
engine in `first-run-learning-window.spec.ts`.

**Run the macOS HD recording pipeline spec**

```bash
bun run test:e2e:hd:macos
```

Opt-in spec for the high-fps "HD recording" pipeline. Uses
`SCREENPIPE_E2E_SEED=onboarding` (vision ON) so it needs a host with **Screen
Recording granted and a real display**. It drives `POST /capture/hd/start`,
then asserts (1) the controller flips active, (2) a non-empty `hd_*.mp4` chunk
is written to disk, and (3) OCR rows keep landing via `/search` *during* the HD
window — i.e. high-fps capture and normal indexing run concurrently (#3699 /
#3707). Self-skips under the default `no-recording` seed or when the HD
controller is unavailable, so it never fails the default CI lane.

**Run the macOS gone-silent recovery reproduction**

```bash
bun run test:e2e:capture-stall-recovery:macos
```

This isolated fault lane includes the debug-only `ignore-disk-pressure` seed;
otherwise a host that crosses the 20 GiB production safety threshold during a
large debug build can correctly stop capture and mask the SCK failure under test.

It also parks the first SCK frame worker and proves an independent
CoreGraphics capture can reach a healthy terminal outcome. That seed clears
window filters only inside the isolated E2E store: the production fallback is
allowed only when no SCK window exclusions are active, so privacy failures stay
fail-closed.

This opt-in lane needs Screen Recording permission. It arms the fault only
after real capture has reached a healthy terminal outcome, then verifies the complete
stale-health / failure-pill / independent-watchdog / resumed-progress cycle.
Before fault injection it pauses every selected display through the real local
API, verifies health reports an intentional disabled state without surfacing
`recording needs help`, resumes every display, and proves capture progress
returns. Per-monitor unit coverage separately proves one healthy display cannot
mask a silent sibling on multi-monitor systems.
It also proves an id-based ScreenCaptureKit lookup is bounded and a fresh retry
still enumerates the display. The local API is isolated on port 3041.

**Or combined (build + test):**

```bash
./e2e/run.sh
```

Uses `.e2e/` as isolated data dir; real data is never touched.
The E2E launcher also moves the app-local focus/notification server to
`SCREENPIPE_FOCUS_PORT` (default `11436`) so tests can exercise `/notify` and
`/notifications` without colliding with a developer's production app on 11435.

## Running locally on Windows

### Prerequisites

- **Bun** ≥ 1.3.10 — `winget install oven-sh.bun` or from [bun.sh](https://bun.
```

---

# COMANDO - README.md
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\crates\screenpipe-semantic\evals\pipes\README.md
**SHA:** fc80e405329cfb3d
**Timestamp:** 2026-08-23T14:17:00.247328
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- turn a model comparison into an `auto` run:

### Contratos
- Run the stable deterministic gate:

### Ouro Bruto (primeiros 5000 chars)
```
# Pipe output evaluation

This suite compares how representative Screenpipe pipe tasks perform when the
same captured evidence is supplied as:

- persisted accessibility JSON;
- Screenpipe's current text-bearing element outline;
- compact semantic context.

The fast four-case harness follows the read and analysis contracts of installed
`ai-prompt-journal`, `workflow-discovery`, `sop-generator`, and
`chronos-time-tracker` pipes. It does not execute those installed prompts. It is
a deterministic representation and scoring regression check against sanitized
fixed evidence with reviewed ground truth.

The separate installed-pipe harness performs real pipe runs for
`workflow-discovery` and `sop-generator`. It reads each installed `pipe.md`,
records hashes of the full file and exact prompt body, renders the prompt
through `screenpipe_core::pipes::PipeManager`, launches Pi, and requires the
pipe to create its physical artifact. A successful subprocess with no artifact
is a failed run. Eight reviewed cases cover repeated workflows, ordered SOPs,
unrelated and single-occurrence abstention, cross-app evidence, and captured
prompt-injection text.

The deterministic gate measures exact `o200k_base` prompt tokens and verifies
that every required source fact remains visible. The opt-in Pi run additionally
scores valid JSON, required output fields, required-fact recall, forbidden
actor or invented-detail contamination, observed step order, output tokens, and
elapsed model time.

Run the stable deterministic gate:

```bash
cargo run --release -p screenpipe-semantic --example pipe_eval --locked -- \
  --report
```

Inspect the balanced prompt pack without inference:

```bash
cargo run --release -p screenpipe-semantic --example pipe_eval --locked -- \
  --prompts
```

Run three counterbalanced repeats through a local Pi model:

```bash
cargo run --release -p screenpipe-semantic --example pipe_eval --locked -- \
  --run-pi ollama/screenpipe-gemma4:latest 3
```

The optional fourth argument limits a model run to one case, which is useful
for a fast parser or renderer regression check:

```bash
cargo run --release -p screenpipe-semantic --example pipe_eval --locked -- \
  --run-pi ollama/screenpipe-gemma4:latest 5 \
  ai_prompt_journal_actor_precision
```

Run three counterbalanced repeats through the actual installed pipe prompts:

```bash
cargo run --release -p screenpipe-semantic --example pipe_eval --locked -- \
  --run-installed-pipes "$HOME/.screenpipe/pipes" \
  ollama/screenpipe-gemma4:latest 3
```

Hosted Screenpipe models use the same sandboxed installed-prompt path, but
require an explicit existing Pi agent directory for authentication. The path
and credentials are not included in the report:

```bash
SCREENPIPE_EVAL_PI_AGENT_DIR="$HOME/.screenpipe/pi-config" \
cargo run --release -p screenpipe-semantic --example pipe_eval --locked -- \
  --run-installed-pipes "$HOME/.screenpipe/pipes" \
  screenpipe/gpt-5.6-terra 1
```

The optional final argument limits the run to one reviewed installed-pipe case:

```bash
cargo run --release -p screenpipe-semantic --example pipe_eval --locked -- \
  --run-installed-pipes "$HOME/.screenpipe/pipes" \
  ollama/screenpipe-gemma4:latest 3 sop_release_signing
```

Installed-pipe results include artifact existence, artifact-contract validity,
pre-inference source-fact retention, reviewed output-fact recall, forbidden
contamination, step order, evidence and rendered pipe-prompt tokens, output
tokens, wall time, per-case summaries, and paired semantic-versus-baseline
bootstrap intervals. The three representations are counterbalanced across case
and repeat order. Source retention and model recall are separate metrics so a
parser omission cannot be mistaken for a model failure, or vice versa.

For safety, each installed prompt runs from a temporary pipe directory. The
frontmatter is normalized only for manual eval execution, fixed model choice,
timeout, and disabled history; the installed prompt body is byte-for-byte
preserved and hashed. Pi receives only `read`, `write`, and `ls`; shell, live
Screenpipe APIs, integrations, notifications, extensions, skills, sessions,
and project context are unavailable. This tests the real PipeManager prompt,
installed pipe instructions, Pi tool use, and on-disk artifact contract without
allowing an eval to affect user data. It is intentionally stricter and safer
than a fully privileged production pipe invocation.

For the closest production-runtime check, run the same cases through the
already-running local Screenpipe pipe endpoint. It uses the configured `auto`
preset by default:

```bash
export SCREENPIPE_LOCAL_API_KEY="$(cd "$(mktemp -d)" && \
  bun x screenpipe@latest auth token)"
cargo run --release -p screenpipe-semantic --example pipe_eval --locked -- \
  --run-live-installed-pipes "$HOME/.screenpipe/pipes" \
  3 sop_release_signing
```

Set `SCREENPIPE_EVAL_PRESET` to the ID of another configured preset to compare
models without changing the instal
```

---

# COMANDO - README.md
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\packages\screenpipe-mcp\README.md
**SHA:** 661177f3dfe50735
**Timestamp:** 2026-08-23T14:17:19.309016
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- bun run start:http -- --port 3031

### Ouro Bruto (primeiros 5000 chars)
```
# Screenpipe MCP Server

<a href="https://www.pulsemcp.com/servers/screenpipe-screenpipe"><img src="https://www.pulsemcp.com/badge/top-pick/screenpipe-screenpipe" width="400" alt="PulseMCP Badge"></a>

<br/>

https://github.com/user-attachments/assets/7466a689-7703-4f0b-b3e1-b1cb9ed70cff

MCP server for screenpipe - search your screen recordings, audio transcriptions, and control your computer with AI.

## Installation

### Option 1: The screenpipe desktop app (Recommended)

The most reliable setup is to install the [screenpipe desktop app](https://screenpi.pe)
and connect Claude Desktop from **Settings → Connections** (or during onboarding).
This writes a config that:

- uses the **bundled `bun`** shipped with the app (an absolute path — no Node/`npx`
  or `PATH` dependency, and ~3× faster cold start), and
- injects your **`SCREENPIPE_LOCAL_API_KEY`** into the server's `env`, so the MCP
  authenticates instantly instead of running slow key discovery at startup.

Both matter: a config without the key forces the server to discover it via
subprocess fallbacks, which on a cold package cache can stall Claude Desktop's MCP
startup and produce `Could not attach to MCP server screenpipe`.

### Option 2: Manual NPX (no desktop app)

If you're not using the desktop app, edit your Claude Desktop config:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%AppData%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "screenpipe": {
      "command": "npx",
      "args": ["-y", "screenpipe-mcp@latest"],
      "env": {
        "SCREENPIPE_LOCAL_API_KEY": "sp-…"
      }
    }
  }
}
```

Requires Node/`npx` on `PATH`. Pin `@latest` so the first install doesn't cache a
stale version forever. Get your key with `screenpipe auth token`. If you omit the
key, the server will try to discover it (bundled bun → npx → local DB) — this works
but is slower and can time out on first run.

Enterprise admins: add `SCREENPIPE_ENTERPRISE_TOKEN` (and, for orgs running their
own query gateway, `SCREENPIPE_TEAM_API_URL`) to the same `env` block to get the
`team-*` tools — see [Enterprise team tools](#enterprise-team-tools-team-).

### Option 3: HTTP Server (Remote / Network Access)

The MCP server can run over HTTP using the [Streamable HTTP transport](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports#streamable-http), allowing remote MCP clients to connect over the network instead of stdio. This is ideal when your AI assistant (e.g., OpenClaw) runs on a different machine than screenpipe.

```bash
# loopback only (default)
npx -y screenpipe-mcp --http --port 3031

# expose to your LAN with bearer auth
npx -y screenpipe-mcp --http --listen-on-lan --api-key $(openssl rand -hex 16)

# or from source — must build first so dist/ exists
bun install && bun run build
bun run start:http -- --port 3031
```

> Tip: `npx screenpipe-mcp-http` (without `--http`) does **not** work —
> npm resolves by package name, and there is no `screenpipe-mcp-http`
> package. The HTTP server ships as a transport inside the
> `screenpipe-mcp` package; use `--http` as shown above, or invoke the
> bin directly with `npx -p screenpipe-mcp screenpipe-mcp-http`.

The server exposes:
- **MCP endpoint**: `http://localhost:3031/mcp` — Streamable HTTP transport (POST for requests, GET for SSE stream)
- **Health check**: `http://localhost:3031/health` — always unauthenticated, for monitors

**Options:**
| Flag | Description | Default |
|------|-------------|---------|
| `--port` | Port for the MCP HTTP server | `3031` |
| `--screenpipe-port` | Port where screenpipe API is running | `3030` |
| `--listen-on-lan` | Bind `0.0.0.0` so other devices on the LAN can connect. Requires `--api-key`. | off (binds `127.0.0.1`) |
| `--api-key <secret>` | Bearer token required for non-loopback requests (`Authorization: Bearer <secret>`). Loopback always allowed. | none |

**Connecting a remote MCP client:**

Point any MCP client that supports HTTP transport at the `/mcp` endpoint:

```json
{
  "mcpServers": {
    "screenpipe": {
      "url": "http://<your-ip>:3031/mcp",
      "headers": {
        "Authorization": "Bearer <your-secret>"
      }
    }
  }
}
```

If your machines are on different networks, expose port 3031 via Tailscale, SSH tunnel, or similar — see the [OpenClaw integration guide](https://docs.screenpi.pe/openclaw) for detailed examples.

> **Note:** The HTTP server currently exposes `search_content` only. The stdio server has the full tool set (export-video, list-meetings, activity-summary, search-elements, frame-context). We're working on bringing HTTP to full parity.

### Option 4: From Source

Clone and build from source:

```bash
git clone https://github.com/screenpipe/screenpipe
cd screenpipe/packages/screenpipe-mcp
bun install
bun run build
```

Then configure Claude Desktop:

```json
{
  "mcpServers": {
    "screenpipe": {
      "command": "node",
      "args": ["/absolute/path/to/screenpipe
```

---

# COMANDO - README.md
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\crates\screenpipe-semantic\evals\context\README.md
**SHA:** 107f959e64797b81
**Timestamp:** 2026-08-23T16:36:43.268120
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Generate a balanced 30-row JSONL prompt pack for a Pi or other model A/B run:

### Ouro Bruto (primeiros 5000 chars)
```
# Semantic context evaluation

This fixed suite compares three representations of the same ten synthetic,
privacy-safe accessibility trees:

- persisted accessibility JSON;
- Screenpipe's current text-bearing element outline;
- compact semantic context rendered for an AI agent.

The report uses the exact `o200k_base` tokenizer. It scores both context-only
tokens and the complete fixed Pi input prompt, retained task facts, tokens per
retained fact, known off-screen suppression, parser selection, compact-tree
heap, and a 1,000-iteration local adapt/parse/render benchmark for each case.
Every case includes one synthetic, explicitly off-screen distractor that must
remain visible in the raw baselines and absent from semantic context while all
visible facts remain available. Seven cases cover the shared parser families
and three cover exact ChatGPT, Claude, and Obsidian app overrides; catalog tests
separately keep all 47 supported target profiles matched.

Run the deterministic report:

```bash
cargo run -p screenpipe-semantic --example context_eval --locked -- --report
```

Run a privacy-safe replay over time-distributed samples from the local
Screenpipe database:

```bash
scripts/eval-semantic-replay.sh \
  --days 30 \
  --samples-per-app 25 \
  --max-apps 25 \
  --output /tmp/screenpipe-semantic-replay-report.json
```

To iterate on one app parser, add an exact captured app name, for example
`--app-name ChatGPT --samples-per-app 100`.

The script first selects frame IDs and structural sizes, then retrieves only
those exact trees into a mode-0600 temporary file. The private tree export is
deleted before the aggregate report is generated. Reports contain only app
names, counts, parser IDs, sizes, exact token counts, timing, and bounded-tree
heap estimates. They never contain captured text, values, URLs, or semantic
output.

Real replay measures applicability, abstention, context reduction, latency,
and memory across the user's actual tree shapes. It does not establish parser
correctness because historical captures have no human-labelled semantic gold.
Use the fixed fixtures or a separately reviewed sanitized capture pack for
fidelity gates. A model comparison over parser-generated labels would measure
answerability, not correctness, and must not be reported as an accuracy score.

Generate a balanced 30-row JSONL prompt pack for a Pi or other model A/B run:

```bash
cargo run -p screenpipe-semantic --example context_eval --locked -- --prompts \
  > /tmp/screenpipe-semantic-context-prompts.jsonl
```

Each case has identical question and expected answer across `raw_json`,
`current_outline`, and `semantic`. Model accuracy must be reported separately
from deterministic fact retention. A model run is intentionally opt-in so CI
never requires credentials, network access, or paid inference.

Run the complete 30-prompt A/B through a local Pi model:

```bash
cargo run --release -p screenpipe-semantic --example context_eval --locked -- \
  --run-pi ollama/screenpipe-gemma4:latest
```

The runner disables tools, extensions, skills, project context, sessions, and
startup network checks. Only the privacy-safe synthetic suite enters the model.

This suite measures AI input efficiency. The database integration separately
tests transactional normalized writes, exact parse-run reuse, immutable item
versions, run-scoped ephemeral items, FTS retrieval, retention cleanup, and
SQLite page growth:

```bash
cargo test -p screenpipe-db --test semantic_storage_test -- --nocapture
```

The storage regression measures incremental semantic pages and write time for
repeated and changing synthetic traces. It does not claim total disk reduction
because opted-in capture still retains existing raw text, tree JSON, elements,
and media.

```

---

# COMANDO - README.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\README.md
**SHA:** a43b6d4d987fa07470dfad35cf280afd4ad56283b9347d766c740bfd57b8768d
**Timestamp:** 2026-08-23T23:43:05.335346
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- To install the screenpipe skills and MCP configuration into every supported agent detected on your computer, run:

### Ouro Bruto (primeiros 5000 chars)
```
<h1 align="center"><a href="https://screenpipe.com/how-to-install?download=1">DOWNLOAD SCREENPIPE</a></h1>

<img width="1500" height="500" alt="image" src="https://github.com/user-attachments/assets/058a44b8-fcad-4a37-92d8-830167dbd400" />


<p align="center">
   <a href ="https://screenpi.pe">
      <img src="https://github.com/user-attachments/assets/d3b1de26-c3c0-4c84-b9c4-b03213b97a30" alt="logo" width="200">
   </a>
</p>

<h1 align="center">[ screenpipe | YC S26 ]</h1>




<p align="center">Screenpipe remembers how you actually work</p>
<p align="center">Record your screen continuously locally and provide context to your agents (Claude, Codex, Openclaw, Hermes, Runner...)</p>




<p align="center">
<a align="center" href="https://trendshift.io/repositories/20386" target="_blank"><img align="center" src="https://trendshift.io/api/badge/repositories/20386" alt="screenpipe%2Fscreenpipe | Trendshift" style="width: 250px; height: 55px;" width="250" height="55"/></a>
</p>

<p align="center">
  <a href="https://discord.gg/screenpipe">
    <img src="https://img.shields.io/discord/823813159592001537?style=for-the-badge&logo=discord&logoColor=white" alt="discord">
  </a>
  <a href="https://twitter.com/screenpipe">
    <img src="https://img.shields.io/twitter/follow/screenpipe?style=for-the-badge&logo=x&logoColor=white&label=follow" alt="twitter">
  </a>
  <a href="https://www.youtube.com/@screen_pipe">
    <img src="https://img.shields.io/youtube/channel/subscribers/UCwjkpAsb70_mENKvy7hT5bw?style=for-the-badge&logo=youtube&logoColor=white&label=subscribers" alt="youtube">
  </a>
</p>







https://github.com/user-attachments/assets/70fe94eb-6d2a-47ca-b7c3-c8ead13a5b7f

<img width="1312" height="947" alt="Screenshot 2026-07-16 at 1 57 50 PM" src="https://github.com/user-attachments/assets/e8de9f45-1f08-4157-ab52-10e3c31822db" />

<img width="1312" height="947" alt="Screenshot 2026-07-16 at 1 58 37 PM" src="https://github.com/user-attachments/assets/4448a90b-6113-46e5-80e4-244c24bb9ba8" />

---

## what is this?

screenpipe capture all your computer work locally and power your agents

```
┌─────────────────────────────────────────┐
│  screen + audio → local storage → ai   │
└─────────────────────────────────────────┘
```

- **remember everything** - never forget what you saw, heard, or did
- **run agents that work based on what you do** generate agents, skills, and automations based on what you do

<img width="360" height="311" alt="image" src="https://github.com/user-attachments/assets/cfbf0fd3-84ef-4feb-8c6d-2779d67058a7" />

- **search with ai** - find anything using natural language
- **100% local** - your data lives on your machine only
- **source-available** - inspect, modify, audit ([LICENSE.md](LICENSE.md))
  **company brain** - share knowledge with your team without turning it into surveillance

<p align="center">
   <a href ="https://screenpi.pe">
      <img src="https://github.com/user-attachments/assets/1f0c04f6-300a-417d-8bd3-5b73435ee2e9">
   </a>
</p>


## install

[download the desktop app](https://screenpipe.com/how-to-install?download=1) — all features, auto-updates

or run the CLI:

```
npx screenpipe record
```

then 

```bash
npx screenpipe setup
# or
claude mcp add screenpipe -- npx -y screenpipe-mcp@latest
```

then ask claude `what did i see in the last 5 mins?` or `summarize today conversations` or `create a pipe that updates linear every time i work on task X`

<details>
<summary>🤖 CLI-only setup for coding agents</summary>

If Claude Code, Codex, Gemini CLI, Cursor, or another coding agent is working from this repository, give it this instruction:

> Read the [screenpipe CLI skill](crates/screenpipe-core/assets/skills/screenpipe-cli/SKILL.md) before operating screenpipe. Set up always-on local capture, verify capture freshness and storage, then query my history without relying on the desktop app.

To install the screenpipe skills and MCP configuration into every supported agent detected on your computer, run:

```bash
npx screenpipe setup
```

The skill covers the recorder-first service default, explicit API-only server mode, human and JSON status, local search, safe read-only SQLite access, pipes, and connections.

</details>


## specs

- captures full accessibility tree, OCR as fallback, transcription, speakers, keyboard inputs, app switches
- 5-10% cpu usage
- 0.5-3gb ram
- ~20gb storage/month
- filters (window, app, chrome extensions, passwords, proprietary AI PII model)
- optional encryption at rest
- works offline

---

<p align="center">
    <a href="https://docs.screenpi.pe">docs</a> ·
    <a href="https://screenpi.pe/team">enterprise</a> ·
    <a href="https://discord.gg/screenpipe">discord</a> ·
    <a href="https://twitter.com/screenpipe">x</a> ·
    <a href="https://www.youtube.com/@screen_pipe">youtube</a> ·
    <a href="https://www.reddit.com/r/screen_pipe">reddit</a>
</p>

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines, maintainers, and how to sub
```

---

# COMANDO - README.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\apps\screenpipe-app-tauri\e2e\README.md
**SHA:** 071cff31e9d5420a0e098ab1b7e4309527b9e0d8ea45d64bf0fe83f0945d973f
**Timestamp:** 2026-08-23T23:43:14.260379
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- The test runner (`wdio.conf.ts` `onPrepare`) calls `netstat -ano | findstr :4445` and kills the owner via `taskkill`. If it persists, manually run:

### Ouro Bruto (primeiros 5000 chars)
```
# E2E Tests

Cross-platform E2E for Screenpipe using [tauri-plugin-webdriver](https://crates.io/crates/tauri-plugin-webdriver). macOS, Windows, Linux.

## Run

From `apps/screenpipe-app-tauri`:

**1. Build**

```bash
bun run build:tauri:e2e
```

- The script sets `NEXT_PUBLIC_SCREENPIPE_E2E=true` to compile in the frontend
  E2E hooks. CI sets this too (see `.github/workflows/e2e-test.yml`); without it
  the app-entitlement account seed is compiled out, so any spec that needs a
  signed-in surface (Brain, Chat) silently renders "sign in required" instead
- It selects the fast `debug-dev` profile, builds only the binary, enables the
  WebDriver plugin, and enters the same system-wide native build queue as normal
  development.

**2. Run tests**

```bash
bun run test:e2e
```

**Run the macOS audio fallback spec**

```bash
bun run test:e2e:audio-fallback:macos
```

This uses `SCREENPIPE_E2E_SEED=onboarding,no-recording,cloud-audio-fallback`
to keep vision capture off while leaving the audio settings visible with
Screenpipe Cloud saved and no logged-in user. It asserts the Recording fallback
alert and the persisted `/notifications` entry.

**Run the local hosted-AI gateway spec**

```bash
bun run test:e2e:local-ai-gateway:macos
```

This opt-in lane bundles the production AI Worker under Miniflare, applies all
checked-in migrations to an isolated in-memory D1 database, and launches the
real E2E app with its hosted-AI URL pinned to that loopback Worker. OpenAI is a
network-closed fake: the harness intercepts the exact chat endpoint and fails
the run if the Worker attempts any other outbound request. No production
gateway, customer data, provider credential, or paid model is used.

**Run the first-run AI summary spec**

```bash
bun run test:e2e:first-run-ai-summary:macos
```

Same local Worker lane, pointed at the post-setup learning window. It proves the
real app reaches the model through the real Pi command and the real Worker, that
the forwarded provider request carries the screen and audio excerpts (not just
app names), and that the model's text — never the deterministic fallback — is
what lands in the seeded chat.

`/activity-summary` is stubbed in the webview: resolving needs >= 10 captured
frames, which a CI machine with no desktop cannot produce and which is not what
this spec is testing. The real engine's answers are covered against a live
engine in `first-run-learning-window.spec.ts`.

**Run the macOS HD recording pipeline spec**

```bash
bun run test:e2e:hd:macos
```

Opt-in spec for the high-fps "HD recording" pipeline. Uses
`SCREENPIPE_E2E_SEED=onboarding` (vision ON) so it needs a host with **Screen
Recording granted and a real display**. It drives `POST /capture/hd/start`,
then asserts (1) the controller flips active, (2) a non-empty `hd_*.mp4` chunk
is written to disk, and (3) OCR rows keep landing via `/search` *during* the HD
window — i.e. high-fps capture and normal indexing run concurrently (#3699 /
#3707). Self-skips under the default `no-recording` seed or when the HD
controller is unavailable, so it never fails the default CI lane.

**Run the macOS gone-silent recovery reproduction**

```bash
bun run test:e2e:capture-stall-recovery:macos
```

This isolated fault lane includes the debug-only `ignore-disk-pressure` seed;
otherwise a host that crosses the 20 GiB production safety threshold during a
large debug build can correctly stop capture and mask the SCK failure under test.

It also parks the first SCK frame worker and proves an independent
CoreGraphics capture can reach a healthy terminal outcome. That seed clears
window filters only inside the isolated E2E store: the production fallback is
allowed only when no SCK window exclusions are active, so privacy failures stay
fail-closed.

This opt-in lane needs Screen Recording permission. It arms the fault only
after real capture has reached a healthy terminal outcome, then verifies the complete
stale-health / failure-pill / independent-watchdog / resumed-progress cycle.
Before fault injection it pauses every selected display through the real local
API, verifies health reports an intentional disabled state without surfacing
`recording needs help`, resumes every display, and proves capture progress
returns. Per-monitor unit coverage separately proves one healthy display cannot
mask a silent sibling on multi-monitor systems.
It also proves an id-based ScreenCaptureKit lookup is bounded and a fresh retry
still enumerates the display. The local API is isolated on port 3041.

**Or combined (build + test):**

```bash
./e2e/run.sh
```

Uses `.e2e/` as isolated data dir; real data is never touched.
The E2E launcher also moves the app-local focus/notification server to
`SCREENPIPE_FOCUS_PORT` (default `11436`) so tests can exercise `/notify` and
`/notifications` without colliding with a developer's production app on 11435.

## Running locally on Windows

### Prerequisites

- **Bun** ≥ 1.3.10 — `winget install oven-sh.bun` or from [bun.sh](https://bun.
```

---

# COMANDO - README.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\crates\screenpipe-semantic\evals\pipes\README.md
**SHA:** fc80e405329cfb3db774391772de01d6290bcd1f4d44fdb47fa6413de2b2c558
**Timestamp:** 2026-08-23T23:43:56.011537
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- turn a model comparison into an `auto` run:

### Contratos
- Run the stable deterministic gate:

### Ouro Bruto (primeiros 5000 chars)
```
# Pipe output evaluation

This suite compares how representative Screenpipe pipe tasks perform when the
same captured evidence is supplied as:

- persisted accessibility JSON;
- Screenpipe's current text-bearing element outline;
- compact semantic context.

The fast four-case harness follows the read and analysis contracts of installed
`ai-prompt-journal`, `workflow-discovery`, `sop-generator`, and
`chronos-time-tracker` pipes. It does not execute those installed prompts. It is
a deterministic representation and scoring regression check against sanitized
fixed evidence with reviewed ground truth.

The separate installed-pipe harness performs real pipe runs for
`workflow-discovery` and `sop-generator`. It reads each installed `pipe.md`,
records hashes of the full file and exact prompt body, renders the prompt
through `screenpipe_core::pipes::PipeManager`, launches Pi, and requires the
pipe to create its physical artifact. A successful subprocess with no artifact
is a failed run. Eight reviewed cases cover repeated workflows, ordered SOPs,
unrelated and single-occurrence abstention, cross-app evidence, and captured
prompt-injection text.

The deterministic gate measures exact `o200k_base` prompt tokens and verifies
that every required source fact remains visible. The opt-in Pi run additionally
scores valid JSON, required output fields, required-fact recall, forbidden
actor or invented-detail contamination, observed step order, output tokens, and
elapsed model time.

Run the stable deterministic gate:

```bash
cargo run --release -p screenpipe-semantic --example pipe_eval --locked -- \
  --report
```

Inspect the balanced prompt pack without inference:

```bash
cargo run --release -p screenpipe-semantic --example pipe_eval --locked -- \
  --prompts
```

Run three counterbalanced repeats through a local Pi model:

```bash
cargo run --release -p screenpipe-semantic --example pipe_eval --locked -- \
  --run-pi ollama/screenpipe-gemma4:latest 3
```

The optional fourth argument limits a model run to one case, which is useful
for a fast parser or renderer regression check:

```bash
cargo run --release -p screenpipe-semantic --example pipe_eval --locked -- \
  --run-pi ollama/screenpipe-gemma4:latest 5 \
  ai_prompt_journal_actor_precision
```

Run three counterbalanced repeats through the actual installed pipe prompts:

```bash
cargo run --release -p screenpipe-semantic --example pipe_eval --locked -- \
  --run-installed-pipes "$HOME/.screenpipe/pipes" \
  ollama/screenpipe-gemma4:latest 3
```

Hosted Screenpipe models use the same sandboxed installed-prompt path, but
require an explicit existing Pi agent directory for authentication. The path
and credentials are not included in the report:

```bash
SCREENPIPE_EVAL_PI_AGENT_DIR="$HOME/.screenpipe/pi-config" \
cargo run --release -p screenpipe-semantic --example pipe_eval --locked -- \
  --run-installed-pipes "$HOME/.screenpipe/pipes" \
  screenpipe/gpt-5.6-terra 1
```

The optional final argument limits the run to one reviewed installed-pipe case:

```bash
cargo run --release -p screenpipe-semantic --example pipe_eval --locked -- \
  --run-installed-pipes "$HOME/.screenpipe/pipes" \
  ollama/screenpipe-gemma4:latest 3 sop_release_signing
```

Installed-pipe results include artifact existence, artifact-contract validity,
pre-inference source-fact retention, reviewed output-fact recall, forbidden
contamination, step order, evidence and rendered pipe-prompt tokens, output
tokens, wall time, per-case summaries, and paired semantic-versus-baseline
bootstrap intervals. The three representations are counterbalanced across case
and repeat order. Source retention and model recall are separate metrics so a
parser omission cannot be mistaken for a model failure, or vice versa.

For safety, each installed prompt runs from a temporary pipe directory. The
frontmatter is normalized only for manual eval execution, fixed model choice,
timeout, and disabled history; the installed prompt body is byte-for-byte
preserved and hashed. Pi receives only `read`, `write`, and `ls`; shell, live
Screenpipe APIs, integrations, notifications, extensions, skills, sessions,
and project context are unavailable. This tests the real PipeManager prompt,
installed pipe instructions, Pi tool use, and on-disk artifact contract without
allowing an eval to affect user data. It is intentionally stricter and safer
than a fully privileged production pipe invocation.

For the closest production-runtime check, run the same cases through the
already-running local Screenpipe pipe endpoint. It uses the configured `auto`
preset by default:

```bash
export SCREENPIPE_LOCAL_API_KEY="$(cd "$(mktemp -d)" && \
  bun x screenpipe@latest auth token)"
cargo run --release -p screenpipe-semantic --example pipe_eval --locked -- \
  --run-live-installed-pipes "$HOME/.screenpipe/pipes" \
  3 sop_release_signing
```

Set `SCREENPIPE_EVAL_PRESET` to the ID of another configured preset to compare
models without changing the instal
```

---

# COMANDO - README.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\packages\screenpipe-mcp\README.md
**SHA:** 661177f3dfe5073515b920fa04f4a314defb6f9d8f893680b2427d06e7c054dc
**Timestamp:** 2026-08-23T23:44:15.035763
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- bun run start:http -- --port 3031

### Ouro Bruto (primeiros 5000 chars)
```
# Screenpipe MCP Server

<a href="https://www.pulsemcp.com/servers/screenpipe-screenpipe"><img src="https://www.pulsemcp.com/badge/top-pick/screenpipe-screenpipe" width="400" alt="PulseMCP Badge"></a>

<br/>

https://github.com/user-attachments/assets/7466a689-7703-4f0b-b3e1-b1cb9ed70cff

MCP server for screenpipe - search your screen recordings, audio transcriptions, and control your computer with AI.

## Installation

### Option 1: The screenpipe desktop app (Recommended)

The most reliable setup is to install the [screenpipe desktop app](https://screenpi.pe)
and connect Claude Desktop from **Settings → Connections** (or during onboarding).
This writes a config that:

- uses the **bundled `bun`** shipped with the app (an absolute path — no Node/`npx`
  or `PATH` dependency, and ~3× faster cold start), and
- injects your **`SCREENPIPE_LOCAL_API_KEY`** into the server's `env`, so the MCP
  authenticates instantly instead of running slow key discovery at startup.

Both matter: a config without the key forces the server to discover it via
subprocess fallbacks, which on a cold package cache can stall Claude Desktop's MCP
startup and produce `Could not attach to MCP server screenpipe`.

### Option 2: Manual NPX (no desktop app)

If you're not using the desktop app, edit your Claude Desktop config:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%AppData%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "screenpipe": {
      "command": "npx",
      "args": ["-y", "screenpipe-mcp@latest"],
      "env": {
        "SCREENPIPE_LOCAL_API_KEY": "sp-…"
      }
    }
  }
}
```

Requires Node/`npx` on `PATH`. Pin `@latest` so the first install doesn't cache a
stale version forever. Get your key with `screenpipe auth token`. If you omit the
key, the server will try to discover it (bundled bun → npx → local DB) — this works
but is slower and can time out on first run.

Enterprise admins: add `SCREENPIPE_ENTERPRISE_TOKEN` (and, for orgs running their
own query gateway, `SCREENPIPE_TEAM_API_URL`) to the same `env` block to get the
`team-*` tools — see [Enterprise team tools](#enterprise-team-tools-team-).

### Option 3: HTTP Server (Remote / Network Access)

The MCP server can run over HTTP using the [Streamable HTTP transport](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports#streamable-http), allowing remote MCP clients to connect over the network instead of stdio. This is ideal when your AI assistant (e.g., OpenClaw) runs on a different machine than screenpipe.

```bash
# loopback only (default)
npx -y screenpipe-mcp --http --port 3031

# expose to your LAN with bearer auth
npx -y screenpipe-mcp --http --listen-on-lan --api-key $(openssl rand -hex 16)

# or from source — must build first so dist/ exists
bun install && bun run build
bun run start:http -- --port 3031
```

> Tip: `npx screenpipe-mcp-http` (without `--http`) does **not** work —
> npm resolves by package name, and there is no `screenpipe-mcp-http`
> package. The HTTP server ships as a transport inside the
> `screenpipe-mcp` package; use `--http` as shown above, or invoke the
> bin directly with `npx -p screenpipe-mcp screenpipe-mcp-http`.

The server exposes:
- **MCP endpoint**: `http://localhost:3031/mcp` — Streamable HTTP transport (POST for requests, GET for SSE stream)
- **Health check**: `http://localhost:3031/health` — always unauthenticated, for monitors

**Options:**
| Flag | Description | Default |
|------|-------------|---------|
| `--port` | Port for the MCP HTTP server | `3031` |
| `--screenpipe-port` | Port where screenpipe API is running | `3030` |
| `--listen-on-lan` | Bind `0.0.0.0` so other devices on the LAN can connect. Requires `--api-key`. | off (binds `127.0.0.1`) |
| `--api-key <secret>` | Bearer token required for non-loopback requests (`Authorization: Bearer <secret>`). Loopback always allowed. | none |

**Connecting a remote MCP client:**

Point any MCP client that supports HTTP transport at the `/mcp` endpoint:

```json
{
  "mcpServers": {
    "screenpipe": {
      "url": "http://<your-ip>:3031/mcp",
      "headers": {
        "Authorization": "Bearer <your-secret>"
      }
    }
  }
}
```

If your machines are on different networks, expose port 3031 via Tailscale, SSH tunnel, or similar — see the [OpenClaw integration guide](https://docs.screenpi.pe/openclaw) for detailed examples.

> **Note:** The HTTP server currently exposes `search_content` only. The stdio server has the full tool set (export-video, list-meetings, activity-summary, search-elements, frame-context). We're working on bringing HTTP to full parity.

### Option 4: From Source

Clone and build from source:

```bash
git clone https://github.com/screenpipe/screenpipe
cd screenpipe/packages/screenpipe-mcp
bun install
bun run build
```

Then configure Claude Desktop:

```json
{
  "mcpServers": {
    "screenpipe": {
      "command": "node",
      "args": ["/absolute/path/to/screenpipe
```

---

# COMANDO - README.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\crates\screenpipe-semantic\evals\context\README.md
**SHA:** 107f959e64797b814c13b7cadd91bde2408da1569081f4c2529a1ccf12d096fd
**Timestamp:** 2026-08-24T01:39:58.878940
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Generate a balanced 30-row JSONL prompt pack for a Pi or other model A/B run:

### Ouro Bruto (primeiros 5000 chars)
```
# Semantic context evaluation

This fixed suite compares three representations of the same ten synthetic,
privacy-safe accessibility trees:

- persisted accessibility JSON;
- Screenpipe's current text-bearing element outline;
- compact semantic context rendered for an AI agent.

The report uses the exact `o200k_base` tokenizer. It scores both context-only
tokens and the complete fixed Pi input prompt, retained task facts, tokens per
retained fact, known off-screen suppression, parser selection, compact-tree
heap, and a 1,000-iteration local adapt/parse/render benchmark for each case.
Every case includes one synthetic, explicitly off-screen distractor that must
remain visible in the raw baselines and absent from semantic context while all
visible facts remain available. Seven cases cover the shared parser families
and three cover exact ChatGPT, Claude, and Obsidian app overrides; catalog tests
separately keep all 47 supported target profiles matched.

Run the deterministic report:

```bash
cargo run -p screenpipe-semantic --example context_eval --locked -- --report
```

Run a privacy-safe replay over time-distributed samples from the local
Screenpipe database:

```bash
scripts/eval-semantic-replay.sh \
  --days 30 \
  --samples-per-app 25 \
  --max-apps 25 \
  --output /tmp/screenpipe-semantic-replay-report.json
```

To iterate on one app parser, add an exact captured app name, for example
`--app-name ChatGPT --samples-per-app 100`.

The script first selects frame IDs and structural sizes, then retrieves only
those exact trees into a mode-0600 temporary file. The private tree export is
deleted before the aggregate report is generated. Reports contain only app
names, counts, parser IDs, sizes, exact token counts, timing, and bounded-tree
heap estimates. They never contain captured text, values, URLs, or semantic
output.

Real replay measures applicability, abstention, context reduction, latency,
and memory across the user's actual tree shapes. It does not establish parser
correctness because historical captures have no human-labelled semantic gold.
Use the fixed fixtures or a separately reviewed sanitized capture pack for
fidelity gates. A model comparison over parser-generated labels would measure
answerability, not correctness, and must not be reported as an accuracy score.

Generate a balanced 30-row JSONL prompt pack for a Pi or other model A/B run:

```bash
cargo run -p screenpipe-semantic --example context_eval --locked -- --prompts \
  > /tmp/screenpipe-semantic-context-prompts.jsonl
```

Each case has identical question and expected answer across `raw_json`,
`current_outline`, and `semantic`. Model accuracy must be reported separately
from deterministic fact retention. A model run is intentionally opt-in so CI
never requires credentials, network access, or paid inference.

Run the complete 30-prompt A/B through a local Pi model:

```bash
cargo run --release -p screenpipe-semantic --example context_eval --locked -- \
  --run-pi ollama/screenpipe-gemma4:latest
```

The runner disables tools, extensions, skills, project context, sessions, and
startup network checks. Only the privacy-safe synthetic suite enters the model.

This suite measures AI input efficiency. The database integration separately
tests transactional normalized writes, exact parse-run reuse, immutable item
versions, run-scoped ephemeral items, FTS retrieval, retention cleanup, and
SQLite page growth:

```bash
cargo test -p screenpipe-db --test semantic_storage_test -- --nocapture
```

The storage regression measures incremental semantic pages and write time for
repeated and changing synthetic traces. It does not claim total disk reduction
because opted-in capture still retains existing raw text, tree JSON, elements,
and media.

```