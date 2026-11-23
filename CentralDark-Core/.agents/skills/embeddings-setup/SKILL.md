---
name: embeddings-setup
description: Bring semantic search online — embedding API key, sqlite-vec extension, first reindex, optional periodic refresh. INVOKE when user mentions "embeddings", "semantic search", "vector index", or after search check reports missing pieces. SKIP for conceptual questions without setup intent.
---

# Embeddings Setup — Semantic Search Activation

Open Second Brain ships with two search paths: keyword-only (always on) and semantic via embedded vectors (opt-in). This skill walks the activation flow.

## Step 1 — Always start with search check
```bash
o2b search check
```
The output names every missing piece and ends with a `recommendations:` block.

Branch on what the report shows:
- `embedding_key: MISSING` → Step 2
- `vec_extension: unavailable` on macOS → Step 3
- `vec_extension: unavailable` on Linux → Step 4
- Everything OK but `semantic_enabled: false` → Step 5

## Step 2 — Provider and API key
Ask user which provider. Default: `text-embedding-3-small` from OpenAI (~$0.02/1M tokens). Any OpenAI-compatible endpoint works.

Required env vars (write to `~/.hermes/.env` or configured env file, never to tracked file):
```bash
OPEN_SECOND_BRAIN_EMBEDDING_PROVIDER=openai-compat
OPEN_SECOND_BRAIN_EMBEDDING_MODEL=text-embedding-3-small
OPEN_SECOND_BRAIN_EMBEDDING_KEY=<placeholder; user pastes key>
# Optional — when not using OpenAI:
# OPEN_SECOND_BRAIN_EMBEDDING_BASE_URL=https://api.together.xyz/v1
```
**Never invent or echo the key.** Write placeholder, ask user to paste. Recheck with `o2b search check`.

## Step 3 — macOS: install Homebrew SQLite
Apple's SQLite omits `LOAD_EXTENSION`. Homebrew's `sqlite` has it enabled.
```bash
brew install sqlite
```
The `o2b` wrapper auto-detects Homebrew SQLite on Darwin and exports `DYLD_LIBRARY_PATH`. Verify with `o2b search check` → expect `vec_extension: loaded`.

## Step 4 — Linux: reconfirm optional dependency
`sqlite-vec` ships as optional dependency. If install missed it, force rebuild:
```bash
bun pm ls | grep sqlite-vec
bun install --force
```
If present but won't load, check `sqlite3 :memory: "PRAGMA compile_options;"`.

## Step 5 — Compute first vectors
```bash
o2b search reindex --embeddings
```
Walks vault, chunks Markdown, computes embeddings. Cost scales linearly.

Verify:
```bash
o2b search "preferences for code review"
```
Output rows carry `(semantic)` in source column when match came from vector index.

## Step 6 — Offer periodic reindex
```bash
o2b search reindex --cron-template
```
Prints watchdog script + crontab line + `hermes cron create` command. Recommended:
- 30 min during active multi-agent work
- 6 hours when changes sporadic

## Multi-agent note
Only the agent running `reindex` needs `OPEN_SECOND_BRAIN_EMBEDDING_KEY`. Read-only consumers query already-computed vectors. Canonical reindex owner = Hermes (carries cron infra).

## What this skill does NOT do
- Does not invoke `brew install` on user's behalf
- Does not paste API key silently — always use placeholder
- Does not commit env files
- Does not launch long-running watcher — cron template is endorsed path
