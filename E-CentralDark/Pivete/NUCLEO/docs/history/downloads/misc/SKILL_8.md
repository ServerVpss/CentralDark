---
name: netlify-blobs
description: Guide for using Netlify Blobs object storage. Use when storing files, images, documents, or simple key-value data without a full database. Covers getStore(), CRUD operations, metadata, listing, deploy-scoped vs site-scoped stores, and local development.
---

# Netlify Blobs

Netlify Blobs is zero-config object storage available from any Netlify compute (functions, edge functions, framework server routes). No provisioning required.

```bash
npm install @netlify/blobs
```

## Getting a Store

```typescript
import { getStore } from "@netlify/blobs";

const store = getStore({ name: "my-store" });

// Use "strong" consistency when you need immediate reads after writes
const store = getStore({ name: "my-store", consistency: "strong" });
```

## CRUD Operations

These are the **only** store methods. Do not invent others.

### Create / Update

```typescript
// String or binary data
await store.set("key", "value");
await store.set("key", fileBuffer);

// With metadata
await store.set("key", data, {
  metadata: { contentType: "image/png", uploadedAt: new Date().toISOString() },
});

// JSON data
await store.setJSON("key", { name: "Example", count: 42 });
```

### Read

```typescript
// Text (default)
const text = await store.get("key");                    // string | null

// Typed retrieval
const json = await store.get("key", { type: "json" });  // object | null
const stream = await store.get("key", { type: "stream" });
const blob = await store.get("key", { type: "blob" });
const buffer = await store.get("key", { type: "arrayBuffer" });

// With metadata
const result = await store.getWithMetadata("key");
// { data: any, etag: string, metadata: object } | null

// Metadata only (no data download)
const meta = await store.getMetadata("key");
// { etag: string, metadata: object } | null
```

### Delete

```typescript
await store.delete("key");
```

### List

```typescript
const { blobs } = await store.list();
// blobs: [{ etag: string, key: string }, ...]

// Filter by prefix
const { blobs } = await store.list({ prefix: "uploads/" });
```

## Store Types

- **Site-scoped** (`getStore()`): Persist across all deploys. Use for most cases.
- **Deploy-scoped** (`getDeployStore()`): Tied to a specific deploy lifecycle.

## Limits

| Limit | Value |
|---|---|
| Max object size | 5 GB |
| Store name max length | 64 bytes |
| Key max length | 600 bytes |

## Local Development

Local dev uses a sandboxed store (separate from production). For Vite-based projects, install `@netlify/vite-plugin` to enable local Blobs access. Otherwise, use `netlify dev`.

**Common error**: "The environment has not been configured to use Netlify Blobs" — install `@netlify/vite-plugin` or run via `netlify dev`.
etmax":10},"max_items":10}' | python scripts/ncbi_entrez.py
```

## References
- Load `references/geo.md` only when the user specifically needs GEO query patterns.
- Keep the import package limited to this file, `references/geo.md`, and `scripts/ncbi_entrez.py`.
esign annotations** → follow any designer notes or constraints.
4. **Design tokens (CSS variables)** → map them to the project's token system.
5. **Raw hex / absolute positioning** → loosely structured; lean on the screenshot for intent.

## Error Recovery

- On a `get_design_context` error, STOP and read the message before retrying.
- If the design URL has no `node-id` (a file-only URL), ask the user for a node-specific URL — You MUST NOT guess or pass an empty `nodeId`.
- On a timeout, retry against a smaller node or selection.
- You MUST NOT silently fall back to hand-writing the screen from the screenshot alone when `get_design_context` can still provide context.
mand," "robust pipeline") didn't translate to actual results.

## 7. Commentary from Filings
Search SEC filings/documents across multiple queries to build a complete picture of guidance practices. If any search returns empty, try alternative keywords before giving up.

- **Explicit guidance language**: Try "guidance", "outlook"; fallback to "expect", "anticipate", "forecast"
- **Qualitative / directional guidance**: Try "similar to", "consistent with", "growth rate"; fallback to "low single digit", "mid single digit", "high single digit", "double digit", "sequential"
  - Many companies provide directional revenue guidance on earnings calls (e.g., "similar to the March quarter" or "low-to-mid-single-digit growth") rather than numeric ranges. Capture these and compare against actual growth rates.
- **Guidance methodology changes**: Try "change", "methodology", "no longer providing"; fallback to "withdraw", "suspend", "discontinue"
  - Flag any quarters where the company changed what metrics it guides on, or withdrew guidance entirely
- **Key drivers behind guidance**: Try "assumes", "includes", "excludes"; fallback to "headwind", "tailwind", "impact"
  - Capture what management said about the assumptions underpinning their guidance (e.g., FX assumptions, macro assumptions, one-time items included/excluded)

Extract direct management quotes where available and cite the document source.

## 7.5. Guidance Read-Throughs to Adjacent Companies

When a company raises, cuts, or materially changes its guidance, the implications often matter more for adjacent names than for the company itself. This section translates guidance signals into actionable read-throughs.

**For each major guidance change identified in the tracker, analyze the implications for adjacent companies:**

**Identify who is affected by this company's guidance:**
- **Suppliers**: Revenue/CapEx guidance changes directly affect supplier order books. A CapEx guidance raise is a near-term purchase order for equipment/component suppliers. A revenue guide-down signals softer demand flowing upstream.
- **Customers**: If this company supplies critical inputs, pricing or capacity guidance affects customer margins. Guiding for price increases = margin headwind for customers. Guiding for capacity expansion = supply relief.
- **Competitors**: Guidance on market growth, pricing environment, or demand trends is often the most honest signal about the competitive landscape. If Company A guides for share gains, that's a direct share loss for Company B.
- **Channel partners / distributors**: Volume guidance changes affect channel inventory and distributor revenue.

**For each read-through (aim for 4-6), state:**
1. **The guidance data point** — which metric changed, by how much, and in which quarter's call
2. **The affected company** (ticker + name)
3. **The implication** — bullish or bearish, with specific logic
4. **Timing** — is this a next-quarter impact or a multi-quarter trend?

**Focus on the highest-signal guidance changes:**
- Guidance raises after a period of conservatism → strong signal that the underlying business is inflecting
- Guidance cuts or "reaffirmed" when the market expected a raise → often more bearish than an explicit cut
- New metrics being guided on (or old metrics withdrawn) → management is redirecting attention, which itself is a signal
- Segment-level guidance changes → more specific read-throughs than consolidated figures
- KPI guidance (subscriber adds, unit volumes, ARPU) → often the most direct read-through to suppliers and competitors

**Example:**
- "NFLX raised Q2 subscriber guidance from +5M to +8M → **Negative for DIS+, WBD**: attention economy is zero-sum; NFLX's accelerating growth likely pressures competing streamers' subscriber adds. **Positive for cloud/CDN names (AMZN/AWS, NET)**: more streaming = more infrastructure demand."
- "TSMC raised full-year CapEx guidance by $4B (from $32B to $36B) → **Positive for ASML**: TSMC is ASML's largest customer; incremental CapEx skews toward EUV tools. **Positive for AMAT, LRCX, KLAC**: broader equipment spend benefits all semicap names."

**Web research for validation:**
Run 1 targeted search: `"{TICKER} guidance change implications read through {year}"` — analyst commentary on cross-company signals from guidance moves.

Present as a structured section in the report after the Pattern Analysis, grouped by guidance change (each major guide raise/cut gets its own sub-block with the read-throughs beneath it).

## 8. Save Report
Save to `reports/{TICKER}_guidance_tracker.html` using the HTML report template from `../design-system.md`. Write the full analysis as styled HTML with the design system CSS inlined. This is the final deliverable — no intermediate markdown step needed.

The report should include:
- Summary header with company name, ticker, and period covered
- Quarter mapping reference table showing the +1 offset explicitly:
  ```
  | Guidance Source Quarter | Guidance Applies To | Actual Result Quarter |
  | CQ1 2024               | CQ2 2024            | CQ2 2024              |
  | CQ2 2024               | CQ3 2024            | CQ3 2024              |
  ```
  This makes the offset rule visible and auditable for every row in the tracker.
- Main tracker table with columns: Guidance Source, Metric, Guidance, Actual Period, Actual, Delta, Beat/Miss (with Daloopa citations on all values)
- Summary statistics (beat rate, avg beat/miss by metric)
- Pattern analysis narrative
- Guidance read-throughs to adjacent companies (grouped by guidance change, with affected tickers and implications)
- Key guidance quotes from filings with document citations

All financial figures must use Daloopa citation format: `<a href="https://daloopa.com/src/{fundamental_id}">$X.XX million</a>`

Tell the user where the HTML report was saved.

Highlight the key patterns (e.g., "Management has beat revenue guidance 7 of the last 8 quarters by an average of 2.3%"). Include an honest credibility verdict: Is management's guidance informative or performative? Should investors trust the forward guidance, and if not, what should they anchor to instead?
