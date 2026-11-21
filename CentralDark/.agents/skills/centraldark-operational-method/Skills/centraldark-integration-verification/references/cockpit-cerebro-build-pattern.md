# Building cockpit sections from canonical docs

## Pattern: server function + typed parser + collapsible UI

When adding a new cockpit section that visualizes canonical docs:

### 1. Create a dedicated server function file

File: `src/lib/<domain>.functions.ts`
- Use `createServerFn({ method: "GET" })` from TanStack Start
- Discover repo root dynamically — check multiple candidates (K:/, /root/CentralDark, cwd)
- Parse markdown with regex on the server, never ship raw docs to client
- Return a fully typed object with a `resumo` aggregation field

Existing function files: `cockpit.functions.ts` (infra), `cerebro.functions.ts` (cognitive), `sync.functions.ts`, `admin.functions.ts`

### 2. Parse APRENDIZADOS.md

Format: `### N. Title` blocks, each containing:
- `**Categoria:** value` — categories: regra, erro-correcao, armadilha, aprendizado-coletivo, governanca-metodo-execucao
- `**Data:** value`
- NeuroLink: `GLOBAL_LINEAGE_UID=xxx`, `PREV_GLOBAL_UID=xxx`, `NEXT_GLOBAL_UID=xxx`

Split on `^### ` (global multiline), skip first empty block.

### 3. Parse NEUROLINK-LINEAGE.json

Structure: `{ schema, status, source_path, source_blob_sha, semantics, genesis, audit, nodes: [...] }`
Each node: `{ uid, legacy_learning_number, title, prev_uid, next_uid, relation_type }`
Verify chain integrity: every prev_uid and next_uid must exist in the node set.

### 4. Parse LEMBRANCAS/*.md

YAML frontmatter with `title:` and `status:` fields. Status may or may not be quoted.
Date extracted from filename pattern `YYYY-MM-DD-*`.

### 5. Git commits conformidade

`execSync("git log --oneline -20 --format=%H|||%s|||%aI")` — safe, no user input.
Cross-reference commit SHAs against aprendizado titles to tag linked commits.

### 6. UI component

Evolve ReceiptsDashboard rather than creating parallel dashboard.
Pattern: collapsible sections with `useState` toggle, `max-h-*` overflow scroll.
Color-code by category using a `Record<string, string>` map to Tailwind classes.

### 7. Sync workflow

```text
git stash → git pull --rebase → git stash pop → git push
ssh VPS "cd /root/CentralDark && git pull --ff-only"
```

If push rejected (non-fast-forward), always stash-rebase-pop-push. VPS SSH may timeout via direct IP; try Tailscale IP (100.97.68.136) as fallback.

## Pitfalls

- CockpitShell.tsx does NOT auto-discover component imports — always add explicit import line.
- `process.env.PROP` fails strict TS — use `process.env['PROP']` bracket notation.
- Regex match groups are `string | undefined` in strict TS — always null-coalesce with `?? ""`.
- `.map()` callback on `execSync` output needs explicit `: string` type annotation.
- ForjaExecutor import error in CockpitShell is pre-existing and unrelated — ignore it.
- Pre-existing TS errors in other files don't block: verify zero errors only in YOUR changed files.
