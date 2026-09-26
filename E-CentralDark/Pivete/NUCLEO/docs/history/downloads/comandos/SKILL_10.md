---
name: statistical-and-uncertainty-visualization
description: Design statistically honest and uncertainty-aware visualizations. Use when the user needs help showing distributions, intervals, confidence, missingness, sampling effects, or analytical rigor in charts and dashboards.
---

# Statistical and Uncertainty Visualization

## Overview

Use this skill when the risk is analytical distortion rather than rendering difficulty. This skill focuses on distributions, intervals, uncertainty, missingness, aggregation effects, and common statistical storytelling failures.

Default assumption: if a claim depends on variability, estimation, sampling, or model uncertainty, the visualization should show that explicitly.

## Working Pattern

1. Identify whether the viewer needs exact values, distributions, intervals, or model-derived estimates.
2. Choose encodings that show spread, uncertainty, missingness, or sample size honestly.
3. Avoid summarizing away the variation that matters to the decision.
4. Pair concise explanations with the view when the uncertainty concept is nontrivial.

## Output Expectations

- Name the statistical question, not just the chart type.
- Explain why the chosen encoding is more truthful than the tempting alternative.
- Call out when aggregation, smoothing, or interval choice can mislead.

## References

- Shared theory:
  - `../../references/foundations/task-abstraction-and-chart-selection.md`
  - `../../references/foundations/perception-color-and-encoding.md`
- Skill references:
  - `./references/distribution-and-summary-choices.md`
  - `./references/uncertainty-encodings.md`
  - `./references/experimental-and-analytical-pitfalls.md`
  - `./references/missingness-and-confidence.md`

## Representative Prompts

- "What chart should I use to show uncertainty here?"
- "Should this be a histogram, box plot, violin plot, or density plot?"
- "How do I show confidence intervals without misleading people?"
- "This dashboard hides variability. How should I fix it?"
- "Help me visualize missing data and sample size honestly."

```

Lints `index.html` and all files in `compositions/`. Reports errors (must fix), warnings (should fix), and info (with `--verbose`).

## Visual Inspect

```bash
npx hyperframes inspect                 # inspect rendered layout over the timeline
npx hyperframes inspect ./my-project    # specific project
npx hyperframes inspect --json          # agent-readable findings
npx hyperframes inspect --samples 15    # denser timeline sweep
npx hyperframes inspect --at 1.5,4,7.25 # explicit hero-frame timestamps
```

Use this after `lint` and `validate`, especially for compositions with speech bubbles, cards, captions, or tight typography. It reports:

- Text extending outside the nearest visual container or bubble
- Text clipped by its own fixed-width/fixed-height box
- Text extending outside the composition canvas
- Children escaping clipping containers

Errors should be fixed before rendering. Warnings are surfaced for agent review; add `--strict` to fail on warnings too. Repeated static issues are collapsed by default so JSON output stays compact for LLM context windows. If overflow is intentional for an entrance/exit animation, mark the element or ancestor with `data-layout-allow-overflow`. If a decorative element should never be audited, mark it with `data-layout-ignore`.

`npx hyperframes layout` remains available as a compatibility alias for the same visual inspection pass.

## Previewing

```bash
npx hyperframes preview                   # serve current directory
npx hyperframes preview --port 4567       # custom port (default 3002)
```

Hot-reloads on file changes. Opens the studio in your browser automatically.

When handing a project back to the user, use the Studio project URL, not the
source `index.html` path:

```text
http://localhost:<port>/#project/<project-name>
```

Use the actual port from the preview output and the project directory name. For
example, after `npx hyperframes preview --port 3017` in `codex-openai-video`,
report `http://localhost:3017/#project/codex-openai-video`.

Treat `index.html` as source-code context only. It is fine to link it as an
implementation file, but do not label it as the project or preview surface.

## Rendering

```bash
npx hyperframes render                                # standard MP4
npx hyperframes render --output final.mp4             # named output
npx hyperframes render --quality draft                # fast iteration
npx hyperframes render --fps 60 --quality high        # final delivery
npx hyperframes render --format webm                  # transparent WebM
npx hyperframes render --docker                       # byte-identical
```

| Flag           | Options               | Default                    | Notes                       |
| -------------- | --------------------- | -------------------------- | --------------------------- |
| `--output`     | path                  | renders/name_timestamp.mp4 | Output path                 |
| `--fps`        | 24, 30, 60            | 30                         | 60fps doubles render time   |
| `--quality`    | draft, standard, high | standard                   | draft for iterating         |
| `--format`     | mp4, webm             | mp4                        | WebM supports transparency  |
| `--workers`    | 1-8 or auto           | auto                       | Each spawns Chrome          |
| `--docker`     | flag                  | off                        | Reproducible output         |
| `--gpu`        | flag                  | off                        | GPU-accelerated encoding    |
| `--strict`     | flag                  | off                        | Fail on lint errors         |
| `--strict-all` | flag                  | off                        | Fail on errors AND warnings |

**Quality guidance:** `draft` while iterating, `standard` for review, `high` for final delivery.

## Transcription

```bash
npx hyperframes transcribe audio.mp3
npx hyperframes transcribe video.mp4 --model medium.en --language en
npx hyperframes transcribe subtitles.srt   # import existing
npx hyperframes transcribe subtitles.vtt
npx hyperframes transcribe openai-response.json
```

## Text-to-Speech

```bash
npx hyperframes tts "Text here" --voice af_nova --output narration.wav
npx hyperframes tts script.txt --voice bf_emma
npx hyperframes tts --list  # show all voices
```

## Troubleshooting

```bash
npx hyperframes doctor       # check environment (Chrome, FFmpeg, Node, memory)
npx hyperframes browser      # manage bundled Chrome
npx hyperframes info         # version and environment details
npx hyperframes upgrade      # check for updates
```

Run `doctor` first if rendering fails. Common issues: missing FFmpeg, missing Chrome, low memory.

## Other

```bash
npx hyperframes compositions   # list compositions in project
npx hyperframes docs           # open documentation
npx hyperframes benchmark .    # benchmark render performance
```
tate/local returns (US) or VAT returns (UK/EU)
- Correspondence with tax authorities
- Tax disputes and assessments

For Pass 2 search queries and risk signal definitions, see `references/workstream-queries.md → Workstream 2`.

---

## Workstream 3 — Legal, Litigation & Regulatory

**What to look for structurally:**
- Pending/threatened litigation schedule
- Material contracts (particularly change of control clauses)
- Regulatory licences and their expiry dates
- Regulatory correspondence and enforcement history
- Insurance schedule

For Pass 2 search queries and risk signal definitions, see `references/workstream-queries.md → Workstream 3`.

---

## Workstream 4 — HR & Employment

**What to look for structurally:**
- Employee list (especially senior/licensed staff)
- Key employment agreements
- Non-compete and non-solicitation agreements
- Benefits, pension, and incentive plans
- Any redundancy, grievance, or disciplinary records

For Pass 2 search queries and risk signal definitions, see `references/workstream-queries.md → Workstream 4`.

---

## Workstream 5 — Commercial & Contracts

**What to look for structurally:**
- Top customer contracts (especially top 5–10 by revenue)
- Supplier and vendor agreements
- Distribution and agency agreements
- Contract expiry/renewal schedule

For Pass 2 search queries and risk signal definitions, see `references/workstream-queries.md → Workstream 5`.

---

## Workstream 6 — IP, Technology & ESG

**What to look for structurally (IP & Technology):**
- IP ownership documentation (patents, trademarks, registered rights)
- IP assignments from founders and employees
- Open-source software inventory
- Data privacy and cybersecurity policies
- IT system and licence agreements

**What to look for structurally (ESG):**
- Environmental compliance certificates and violation history
- Health & safety incident records
- Diversity and inclusion policies
- Modern Slavery Act statement (required for UK businesses >£36M turnover)

For Pass 2 search queries and risk signal definitions for both IP/Technology and ESG, see `references/workstream-queries.md → Workstream 6`.

---

## Step 3 — Compile findings

After completing all six workstreams, compile your findings into a structured list:

```
findings = [
  {
    area: "Tax",
    severity: "High",
    title: "Open IRS audit for FY2023",
    detail: "Correspondence in folder 3.6 references an open IRS examination for tax year 2023. No resolution letter found.",
    source: "3.6 IRS Correspondence / Letter dated March 2024"
  },
  ...
]
```

Also track structural gaps separately:
```
gaps = [
  { area: "Finance", item: "Working capital analysis — folder empty" },
  { area: "HR", item: "Non-compete agreements — folder missing entirely" },
  ...
]
```

Count risks by severity per area — this drives the dashboard scorecard.

---


## Step 3b — Cross-document data consistency checks

Run the following consistency checks across the data room. These use `searchDocuments` to pull specific figures from different document types and compare them. Discrepancies are flagged as **Medium** risks minimum; large discrepancies are **High**.

### Headcount / FTE consistency
Find headcount figures in the following document types and compare them:
- P&L or financial statements (FTE cost line or employee note)
- HR employee list or org chart
- Board presentations or management accounts (FTE KPI)
- Any regulatory filings that reference employee numbers

Flag if the figures differ by more than 10% across sources, or if any source gives a materially different total. Note the specific sources and figures found.

### Top customer list consistency
If a "top 20 / top 50 customers" list exists, cross-check customer names and revenue figures against:
- Financial statements or revenue schedules
- CRM or sales data (if present)
- Any investor presentation or board pack referencing customer concentration

Flag customers who appear in one list but not another, or where revenue attributions differ materially.

### Top vendor / supplier spend consistency
If a vendor spend list exists, cross-check against:
- P&L cost line items (COGS, OpEx breakdown)
- Any procurement or spend analysis document

Flag if total vendor spend implied by the list is materially inconsistent with cost lines in the financials.

### Board and management roster consistency
Cross-check board member and senior management names across:
- Corporate documents (articles, board minutes, Companies House / registry filings)
- Org chart
- Employment contracts or service agreements
- Any investor or management presentation

Flag any person who appears in one source but not another (e.g. listed as a director in board minutes but absent from the org chart, or named in a management presentation but with no service agreement).

### Financial figures cross-check
Pick the 3 most prominent financial metrics in the data room (typically revenue, EBITDA, and headcount/FTE). Verify they are stated consistently across:
- Audited accounts
- Management accounts
- Board presentations / investor decks
- Any teaser or information memorandum

Flag any material discrepancy (>5% difference) as a **High** risk — buyers will spot these immediately and it will undermine confidence in the whole data room.

---

## Step 3c — External news intelligence on top customers and vendors

> This step uses web search, not `searchDocuments`. It is always free — no Blueflame credits required.

Extract the names of the top 5–10 customers and top 5–10 vendors from the data room (use the customer/vendor lists found in Step 3b, or from commercial documents identified in Workstream 5). Then run a targeted web news search for each name.

**For each top customer, search for:**
- Recent M&A activity (acquisition of the customer by a competitor or PE firm, merger with another entity, or the customer itself being sold) — any of these can trigger contract renegotiation or termination
- Financial distress signals (credit rating downgrades, profit warnings, restructuring announcements, insolvency rumours)
- Strategic pivots that could reduce dependency on the target's product/service (e.g. in-housing, switching to a competitor)
- Leadership changes (new CEO/CPO/CTO) — often precede vendor reviews
- Regulatory or legal issues that could disrupt the customer's own operations

**For each top vendor, search for:**
- M&A activity (vendor acquired by a competitor, merged, or restructuring) — may affect pricing, continuity, or exclusivity
- Financial distress or supply chain disruption signals
- Geopolitical exposure (sanctions, trade restrictions, country-of-origin risk)
- Price escalation announcements or force majeure notices

**How to run the search:**
Use web search with queries in the format: `"[Customer/Vendor Name]" news 2024 2025 acquisition OR merger OR restructuring OR insolvency OR "strategic review"`. Run a separate query for each name. If a name is generic (e.g. "Global Logistics Ltd"), add the sector or country to disambiguate.

**Risk signals to flag:**
- Top customer acquired by a known competitor of the target → **High** (high probability of contract review or termination post-close)
- Top customer in financial distress or undergoing restructuring → **High** (revenue at risk)
- Top customer announced vendor consolidation or platform shift → **High**
- Top vendor acquired by a company with conflicting interests → **High** (supply continuity risk)
- Top vendor subject to sanctions or trade restrictions → **High**
- M&A activity in the customer or vendor base with no change of control provision in the relevant contract → **Medium** (contract does not protect the target)
- New leadership at a key customer with no relationship established → **Medium**
- Any news (positive or negative) about a customer or vendor that is not reflected anywhere in the data room → **Medium** (disclosure gap — buyer will find it)

**Present findings as:** a table with columns: Name | Type (Customer/Vendor) | News Found | Risk Level | Source URL | Recommended Action.

If no material news is found for a name, record "No material news found" and continue. Do not skip this step — a clean result is itself a valuable finding.

---

## Step 4 — Offer outputs

Before generating the dashboard, ask:

> "I've completed the risk audit. Would you like me to generate the interactive HTML risk dashboard, or would a plain text risk summary in this conversation be enough? The dashboard uses additional credits to render — the plain text summary is free."

Only build the dashboard if the user confirms. If they decline, go to Step 5 and deliver a plain text summary.

### Dashboard specification (build only on user confirmation)

Generate a self-contained HTML page and write it as an artifact. The dashboard should include:

**Header:**
- Deal name, date of audit, total risk counts (High / Medium / Low)

**Risk Scorecard (top section):**
- Six area tiles, each showing: area name, risk counts (H/M/L), and a colour signal:
  - Any High → red tile border
  - Only Medium/Low → amber tile border
  - No findings → green tile border

**Detailed findings (below the scorecard):**
- Grouped by workstream
- Each finding shows: severity badge (colour-coded), title, detail text, and source reference
- A "Structural gaps" sub-section per area listing missing or sparse folders

**Style guidance:**
- Clean, professional — this will be shared in deal team meetings
- White background, dark headings, muted colour palette
- Severity badges: High = red (#DC2626), Medium = amber (#D97706), Low = grey (#6B7280)
- No external dependencies — fully self-contained HTML/CSS/JS

---

## Step 5 — Present to the user

After rendering the dashboard, give a brief verbal summary:

> "I've audited [N] sections of the data room and found [X] High, [Y] Medium, and [Z] Low risks. The areas with the most critical issues are [list]. Each finding is tagged with its source document so you can locate it directly in the data room."

Then offer:
> "Want me to export this as an Excel risk register, or shall we work through any of the High risks in more detail?"

---

## Operating principles

**Search intelligently, not exhaustively.** Run the targeted queries from `references/workstream-queries.md`. Don't attempt to read every document — the snippets are sufficient. If a snippet is ambiguous, run a follow-up search to confirm before flagging.

**Be specific about sources.** Every finding must reference the folder path or document name. Vague findings ("there may be tax issues") are not useful — deal teams need to go straight to the source.

**Calibrate to deal size.** A risk that is High for a £10M SME may be Medium for a £500M transaction where diligence coverage is deeper and warranties are broader. Use `transactionValue` from the project metadata to calibrate.

**Don't over-flag.** Not everything unusual is a risk. A non-compete that looks standard, or a customer contract that's long-dated and unconditional, should not be flagged just because it appeared in a search. Flag what a diligent buyer's counsel would genuinely raise.

**Sell-side framing.** This audit is for the team preparing the room, not buyers. Frame findings as things to address, disclose, or explain — not as reasons to walk away.

## Performance Notes

- **Fewer, well-evidenced findings are more valuable than many speculative ones.** Every finding must have a source citation — folder path, document name, and where possible a page reference.
- Run the targeted search queries listed per workstream. Do not attempt to read every document.
- Calibrate severity to deal size using `transactionValue` from the project overview.
- Do not over-flag. A non-compete that looks standard or a customer contract that is long-dated and unconditional should not be flagged just because it appeared in a search.

---

## Common Issues

**`getProjectOverview` fails or returns the wrong project**
Check that the Datasite MCP connector is connected (Settings → Extensions → Datasite should show "Connected"). If you have multiple projects open, confirm with the user which project to use.

**`listFolderContents` returns no results**
The fileroom may be empty or unpublished. Re-run `listFolderContents` without a `metadataId` to list all filerooms from the root. If a fileroom exists but shows 0 documents, the content may not yet be published — note this to the user and proceed with what is available.

**`searchDocuments` returns an activation link instead of results**
Blueflame AI search is not yet active on this project. Follow the Blueflame prompt in the skill instructions above. Do not attempt to answer using Claude's training knowledge.

**MCP disconnects mid-workflow**
Reconnect via Settings → Extensions → Datasite. Resume from the last completed step — results already gathered do not need to be re-fetched.

**`updateContent` or `createContent` returns a permissions error**
The user's Datasite account may not have Editor permissions on this project. Ask them to check their role in Datasite project settings.
state machine, sequence diagram, or dependency graph?"
- "I need a narrative figure for an executive audience, not a dashboard."
- "Should this be a scrollytelling story, parallax timeline, stepper, or small multiples?"
- "Explain why this visualization feels misleading even though the numbers are correct."
