# COMANDO - bulk-operations.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\box\skills\box\references\bulk-operations.md
**SHA:** f10970316db8985b
**Timestamp:** 2026-08-26T18:30:58.373259
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Use `box ai:extract` when you need key-value extraction via a freeform prompt:

### Ouro Bruto (primeiros 5000 chars)
```
# Bulk Operations

## Table of Contents

- When this applies
- Constraints
- Workflow: inventory, classify, plan, execute, verify
- Step 1 — Inventory
- Step 2 — Classify (when content-based sorting is needed)
- Step 3 — Plan the target hierarchy
- Step 4 — Create folders
- Step 5 — Move files
- Step 6 — Verify
- Rate-limit and backoff handling
- REST vs CLI for bulk work
- Partial failure recovery

Read `references/auth-and-setup.md` first when the acting identity or SDK vs REST choice is unclear.

## When this applies

Use this reference when the task involves more than a handful of files or folders in a single operation:

- Organizing or reorganizing files across folders (by type, date, project, etc.)
- Batch-moving files from a flat folder into a structured hierarchy
- Creating a folder tree for a classification or filing scheme
- Bulk-tagging files with metadata
- Migrating content between folder structures

## Constraints

### Box CLI must run serially

The Box CLI does not support concurrent invocations against the same environment. Launching multiple CLI processes in parallel causes auth conflicts, dropped operations, and unpredictable errors. **Always run CLI commands one at a time, waiting for each to complete before starting the next.**

### Box API rate limits

Box enforces per-user and per-app rate limits. Bulk operations that send requests too quickly will receive `429 Too Many Requests` responses. The response includes a `Retry-After` header with the number of seconds to wait. See [Rate-limit and backoff handling](#rate-limit-and-backoff-handling) below.

### Folder name uniqueness

Box enforces unique names within a parent folder. Creating a folder that already exists returns a `409 Conflict`. Check for existing folders before creating, or handle 409 by looking up the existing folder and reusing its ID.

## Workflow: inventory, classify, plan, execute, verify

Bulk operations follow this pattern. Do not skip ahead — moving files without a verified plan leads to misplaced content that is painful to undo.

```
Inventory → Classify (if needed) → Plan → Execute (serial) → Verify
```

Skip the classify step when files can be sorted by filename, extension, or existing metadata alone.

## Step 1 — Inventory

List everything in the source folder(s). Paginate fully — do not assume a single page covers all items.

```bash
# CLI — list up to 1000 items
python3 scripts/box_cli_smoke.py list-folder-items <FOLDER_ID> --max-items 1000 --fields id name type

# REST — paginate with offset
python3 scripts/box_rest.py get-folder-items --folder-id <FOLDER_ID> --limit 1000 --fields id name type
```

For folders with more items than one page returns, increment the offset and repeat until all items are captured.

Capture each item's `id`, `name`, and `type` into a working list before proceeding.

## Step 2 — Classify (when content-based sorting is needed)

Skip this step if files can be categorized by filename, extension, or existing metadata. Use it when the documents are unstructured and their content determines the category — for example, a folder of mixed invoices, receipts, contracts, and reports that all share the same file type.

### Preference order for content understanding

1. **Box AI Q&A or Extract** (preferred) — ask Box AI to classify or extract structured fields from each file. This keeps content server-side, requires no downloads, and leverages Box's own document understanding.
2. **Metadata inspection** — check existing Box metadata templates or properties already applied to the files.
3. **Previews or thumbnails** — use Box preview representations for lightweight visual inspection without downloading the full file.
4. **Local analysis (OCR, agent-side parsing)** — download the file and process it locally. Use only when Box AI is unavailable, not authorized, or insufficient for the document type.

### Sample-first strategy

Do not classify every file up front. Box AI calls are slower than metadata reads and have tighter rate limits.

1. **Pick a small sample** (5–10 files) that appear representative of the mix.
2. **Classify the sample** using Box AI to discover the category set and validate the prompt.
3. **Check for cheaper signals.** After seeing the sample results, determine whether filename patterns, extensions, or metadata can sort some or all of the remaining files without additional AI calls.
4. **Classify the remainder** — use AI only for files that cannot be sorted by cheaper signals. Pace AI calls at least 1–2 seconds apart.
5. **Record each classification** (file ID → category) as it completes so an interrupted run can resume without re-classifying finished files.

### Box AI classification via CLI

**Before the first AI call**, run `box ai:ask --help` to confirm the command exists in the installed CLI version and to check for any flag changes.

Use `box ai:ask` to classify a single file by asking a direct question:

```bash
box ai:ask --items=id=<FILE_ID>,type=file \
  --prompt "What 
```