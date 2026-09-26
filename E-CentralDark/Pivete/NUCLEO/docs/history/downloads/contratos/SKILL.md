---
name: unit-economics
description: Bottoms-up unit economics decomposition for any public company
---

Perform a bottoms-up unit economics decomposition for the company named in the user's request. If no ticker or company is provided, ask for one before proceeding.

**Before starting, read `../data-access.md` for data access methods and `../design-system.md` for formatting conventions.** Follow the data access detection logic and design system throughout this skill.

Follow these steps:

## 1. Company Lookup
Look up the company by ticker using `discover_companies`. Capture:
- `company_id`
- `latest_calendar_quarter` — anchor for all period calculations below (see `../data-access.md` Section 1.5)
- `latest_fiscal_quarter`
- Firm name for report attribution (default: "Daloopa") — see `../data-access.md` Section 4.5

## 2. Series Discovery & Business Archetype Detection
Cast a wide net to discover ALL available series for this company. Search with multiple keyword sets to maximize coverage:
- Financial: "revenue", "income", "profit", "margin", "eps", "cost"
- Operating KPIs: "subscriber", "user", "customer", "unit", "arpu", "retention", "churn"
- Segment/Product: "segment", "product", "service", "geographic"
- Business-specific: "store", "gmv", "order", "booking", "backlog", "premium", "loan", "aum", "room", "seat", "bed", "acreage"

Collect all unique series IDs. Read every series name and description returned. **This is how you learn what kind of business this is and what unit-level KPIs Daloopa tracks for it.**

Based on series availability, classify the business into one of these archetypes (or a hybrid). This classification drives the entire report structure:

| If you find series like... | Archetype | Unit = |
|---|---|---|
| ARR, MRR, net dollar retention, customers, ACV, churn, CAC, LTV | **SaaS / Subscription** | Customer or subscription |
| Store count, same-store sales, AUV, restaurant-level margin, new openings | **Unit-based retail / Restaurant** | Store or unit |
| GMV, take rate, orders, AOV, active buyers/sellers | **Marketplace / E-commerce** | Order or transaction |
| Subscribers, ARPU, churn, content spend per sub | **Consumer subscription (media/streaming)** | Subscriber |
| Premiums written, loss ratio, combined ratio, policies in force | **Insurance** | Policy |
| NIM, loans, deposits, provision for credit losses, NCOs | **Banking / Lending** | Loan or account |
| ASP, units shipped, cost per unit, gross margin per unit | **Hardware / Manufacturing** | Unit shipped |
| AUM, management fee rate, performance fees, fund flows | **Asset Management** | Dollar of AUM |
| Revenue per available room (RevPAR), occupancy, ADR | **Hospitality / Lodging** | Room night |
| RPM, RASM, CASM, load factor, ASMs | **Airlines / Transportation** | Available seat mile |
| Revenue per user, DAU, MAU, ARPU, engagement | **Digital platform / Advertising** | User |
| Beds, admissions, revenue per admission, case mix | **Healthcare facilities** | Admission or bed |
| Acreage, production per acre, realized price per unit | **Commodity / E&P** | Unit of production |

If the business is a hybrid or doesn't fit neatly, construct a custom framework from the available series. The archetype is a starting guide, not a constraint.

**Edge cases:**
- **Diversified / multi-segment companies**: Pick the largest or most analytically interesting segment for primary analysis. Note other segments briefly. If the user specifies a segment, focus there.
- **Pre-revenue / early-stage companies**: Focus on burn rate per unit of growth, cash efficiency, and path to unit profitability.
- **Financial companies (banks, insurance, asset managers)**: These have specialized unit economics. For banks, the "unit" is a dollar of assets — focus on NIM, fee income/assets, efficiency ratio, credit costs. For insurance, focus on the combined ratio decomposition. Don't force a SaaS or retail framework onto financials.
- **Companies with no obvious unit-level KPIs in Daloopa**: Fall back to a margin bridge / operating leverage analysis using standard income statement data. Decompose revenue into whatever sub-components are available (segment, geography, product line) and analyze profitability at that level. Note the limitation.
- **Companies that stopped disclosing unit data**: Some major companies (e.g., Apple post-2018) no longer report unit shipments or ASPs. If unit-level data is not available, adapt to the highest-resolution decomposition the data supports (e.g., segment revenue × segment margin). Clearly flag the data gap and explain what proxy you used. Do not fabricate unit estimates.

## 3. Unit Economics Data Pull
Calculate 10 quarters backward from `latest_calendar_quarter`. Pull all archetype-relevant series identified in Step 2 for those periods, plus standard financials:
- Revenue (total and segment)
- COGS / cost of revenue
- Gross profit
- Operating income
- Net income
- All operating KPIs relevant to the detected archetype

**Derived metrics** (calculate from pulled data, label each as "(calc.)" and show formulas):
- Revenue per unit (Revenue / units)
- Gross margin per unit
- Contribution margin per unit (if variable costs are available)
- Unit growth rate (QoQ and YoY)
- Revenue per unit growth rate (QoQ and YoY)
- Any archetype-specific derived metrics (e.g., CAC payback = CAC / (ARPU × gross margin), LTV/CAC, 4-wall margin, take rate, combined ratio)

## 4. Qualitative Research
Search SEC filings for context on the unit economics. Use archetype-specific search terms:
- **SaaS**: Try "net dollar retention", "customer acquisition cost"; fallback to "expansion", "churn", "upsell"
- **Restaurant/Retail**: Try "average unit volume", "restaurant-level margin"; fallback to "same-store", "new unit", "unit opening"
- **Marketplace**: Try "take rate", "gross merchandise value"; fallback to "active buyers", "order volume", "monetization"
- **Hardware/Manufacturing**: Try "average selling price", "units shipped"; fallback to "ASP", "volume", "mix"
- **Insurance**: Try "combined ratio", "loss ratio"; fallback to "underwriting", "premium", "policy"
- **Banking**: Try "net interest margin", "provision"; fallback to "loan growth", "credit quality", "efficiency"
- **Digital platform**: Try "average revenue per user", "monthly active users"; fallback to "engagement", "monetization", "ARPU"
- **General (all archetypes)**: Try "unit economics", "pricing"; fallback to "profitability", "margin", "per unit"

Extract management commentary on pricing, retention, expansion, new unit openings, margin levers, etc. with document citations.

## 5. Analysis & Report Synthesis

**Section 1: Business Model & Unit Definition (brief)**
- 2-3 sentence description of what the "unit" is for this business
- Why this decomposition matters for understanding the company's economics
- What the revenue build-up looks like: units × revenue-per-unit, or equivalent

**Section 2: Revenue Decomposition**
- Show the bottoms-up revenue build: how units × price/rate × utilization (or equivalent) bridges to reported revenue
- Table: quarterly history (10 quarters) showing each component
- Highlight which lever is driving growth: volume vs. price vs. mix
- Include growth rates (YoY) as sub-rows beneath each metric

**Section 3: Unit-Level Profitability**
The core of the report. Show margin/profitability at the unit level over time:
- For SaaS: gross margin per customer, CAC payback period, LTV/CAC ratio
- For restaurants: 4-wall EBITDA margin, new unit payback, cash-on-cash return
- For marketplace: contribution margin per order, after accounting for fulfillment/transaction costs
- For insurance: loss ratio + expense ratio = combined ratio per policy
- For hardware: gross margin per unit, cost per unit breakdown
- Adapt to whatever the business actually is
- Table: historical trend with period-over-period change
- Explicitly call out whether unit economics are improving or deteriorating and by how much

**Section 4: Cohort / Vintage Analysis (if data supports it)**
- For subscription businesses: net retention curves, expansion vs. contraction
- For unit-based businesses: same-store vs. new-store contribution, unit maturation
- For lending: vintage loss curves, seasoning
- If insufficient data for true cohort analysis, note this and substitute with proxy analysis (e.g., new customer growth rate vs. retention rate implies cohort behavior)

**Section 5: Scalability & Operating Leverage**
- How do unit economics change as the business scales?
- Fixed cost absorption: which costs are truly fixed vs. variable per unit?
- Show operating leverage by plotting revenue growth vs. cost growth
- Incremental margins: are they expanding or compressing as the business grows?

**Section 6: Key Drivers & What to Watch**
This is the most analytically valuable section. Based on the data, identify:
- **The 3-5 metrics that matter most** for this company's unit economics, ranked by sensitivity / impact
- For each metric: current level, historical range, direction of travel, and what would cause it to inflect
- **Bull case drivers**: what would improve unit economics (e.g., pricing power, mix shift to higher-margin products, operating leverage kicking in, retention improving)
- **Bear case risks**: what would deteriorate unit economics (e.g., competitive pricing pressure, rising CAC, input cost inflation, regulatory impact on take rates)
- Connect each driver to its P&L impact: "a 100bps improvement in net retention would add ~$X to ARR" or "each new store generates ~$Xm in 4-wall EBITDA in year 2"

**Section 7: Summary Assessment**
- 3-4 sentence verdict on the health and trajectory of the company's unit economics
- Is this a business with improving, stable, or deteriorating unit economics?
- What is the single most important thing to monitor going forward?

**Analytical standards:**
- **Three-layer density**: every data point should have context (vs. prior period, vs. peers if known) and an implication (what it means for the investment case)
- **Show your math**: when you derive a metric (e.g., implied CAC = S&M expense / new customers added), show the calculation explicitly so the reader can verify
- **Flag data gaps**: if a key metric for the archetype isn't available in Daloopa's data, say so explicitly and explain what proxy you used or why the analysis is limited
- **No generic filler**: if you don't have data to support a section, skip it or shorten it. Never pad with boilerplate
- **Source everything**: every number should be traceable. Use Daloopa source citations per the design system conventions
- **Prefer rates and ratios over absolutes**: unit economics are about efficiency, not scale. Lead with margins, returns, and per-unit metrics. Include absolutes as context

## 6. Charts
Use `infra/chart_generator.py` for charts. Include at minimum:
1. A **revenue decomposition chart** (waterfall or time-series showing units × price → revenue)
2. A **unit profitability trend chart** (time-series showing the key unit margin metric over time)
3. Additional charts as warranted by the archetype (e.g., net retention waterfall for SaaS, same-store sales trend for restaurants, take rate trend for marketplaces)

**All charts must be embedded in the HTML as base64 data URIs** (e.g., `<img src="data:image/png;base64,...">`) so the report is fully self-contained with no external file dependencies. After generating each chart PNG, read the file and convert to base64 for embedding. Do not use relative `<img src="filename.png">` paths.

If chart_generator.py is unavailable, embed simple inline SVG charts directly in the HTML.

## 7. Save Report
Save to `reports/{TICKER}_unit_economics.html` using the HTML report template from `../design-system.md`. Write the full analysis as styled HTML with the design system CSS inlined. This is the final deliverable — no intermediate markdown step needed.

Structure the report with these sections:

```
<h1>{Company Name} ({TICKER}) — Unit Economics Analysis</h1>
<p>Generated: {date}</p>

<h2>Summary</h2>
{2-3 sentences: What is the "unit"? Are unit economics improving or deteriorating? Key takeaway.}

<h2>Business Model & Unit Definition</h2>
{Section 1 content}

<h2>Revenue Decomposition</h2>
<table>
| Component | Q(-9) | Q(-8) | ... | Q(latest) |
{Units, revenue per unit, revenue — with Daloopa citations and YoY growth sub-rows}
</table>
{Commentary on volume vs. price drivers}

<h2>Unit-Level Profitability</h2>
<table>
| Metric | Q(-9) | Q(-8) | ... | Q(latest) |
{Archetype-specific unit margins — with Daloopa citations}
</table>
{Commentary on unit economics trajectory}

<h2>Cohort / Vintage Analysis</h2>
{Section 4 content, or note if insufficient data}

<h2>Scalability & Operating Leverage</h2>
<table>
| Metric | Q(-9) | Q(-8) | ... | Q(latest) |
{Revenue growth vs cost growth, incremental margins}
</table>
{Operating leverage assessment}

<h2>Key Drivers & What to Watch</h2>
{Ranked drivers with sensitivity analysis and bull/bear scenarios}

<h2>Summary Assessment</h2>
{3-4 sentence verdict}
```

All financial figures must use Daloopa citation format: `<a href="https://daloopa.com/src/{fundamental_id}">$X.XX million</a>`

Tell the user where the HTML report was saved.

Highlight the 2-3 most important findings about the company's unit economics and what they signal for the investment case.
ase 12 — Render Research Note (HTML)

Using the HTML Report Template from `../design-system.md`, generate a styled HTML report with full CSS inlined. The report should include:

**Header Section:**
- Company name and ticker
- Report date and firm attribution
- Five Key Tensions (numbered list)

**Section 1: Executive Summary**
- Key metrics table
- Executive summary narrative
- Variant perception

**Section 2: Company Overview**
- Business description
- Investment thesis

**Section 3: Recent News & Catalysts**
- News timeline
- Forward catalysts
- Policy backdrop

**Section 4: Financial Analysis**
- Financials table (8-16 quarters)
- Cost structure & margin analysis
- OpEx breakdown table
- Segment and geographic tables
- Share count table

**Section 5: Industry-Specific Analysis**
- Industry deep dive narrative

**Section 6: Guidance Track Record**
- Guidance table and beat/miss analysis (if available)

**Section 7: What You Need to Believe**
- Bull beliefs with valuation target
- Bear beliefs with valuation target
- Risk/reward assessment

**Section 8: Catalysts**
- Forward catalysts
- Policy backdrop

**Section 9: Capital Allocation**
- Capital allocation commentary

**Section 10: Valuation**
- DCF summary and sensitivity (if available)
- Comps commentary (if available)

**Section 11: Risks**
- Risks summary

**Section 12: Monitoring Framework**
- Quantitative monitors
- Qualitative monitors

**Appendix:**
- Additional context or data

### Context Key Checklist
Verify these keys exist before rendering (set empty string if data unavailable):

**Cover & Summary:**
`company_name`, `ticker`, `date`, `price`, `market_cap`, `five_key_tensions`, `executive_summary`, `key_metrics_table`

**Thesis & Overview:**
`investment_thesis`, `variant_perception`, `company_description`

**News:**
`news_timeline`

**Financials:**
`financials_table`, `cost_margin_analysis`, `opex_breakdown_table`, `segments_table`, `geo_table`, `shares_outstanding_table`

**Industry:**
`industry_deep_dive`

**Guidance:**
`has_guidance`, `guidance_track_record`

**What You Need to Believe:**
`bull_beliefs`, `bull_target`, `bear_beliefs`, `bear_target`, `risk_reward_assessment`

**Catalysts:**
`forward_catalysts`, `policy_backdrop`

**Capital Allocation:**
`capital_allocation_commentary`

**Valuation:**
`has_dcf`, `dcf_summary`, `has_comps`, `comps_commentary`

**Risks:**
`risks_summary`

**Monitoring:**
`monitoring_quantitative`, `monitoring_qualitative`

**Appendix:**
`appendix_content`

**Citation enforcement:** Every financial figure from Daloopa in the HTML report must use citation format: `[$X.XX million](https://daloopa.com/src/{fundamental_id})`. If a number came from `get_company_fundamentals`, it must have a citation link. No exceptions.

## Phase 13 — Render Excel Model

Generate the `.xlsx` file directly using the best available spreadsheet-generation workflow. For Codex, prefer bundled spreadsheet tooling or Python/openpyxl when available. The workbook should:

1. Create 8 tabs with the following structure:

**Tab 1: Income Statement**
- Rows: Revenue, COGS, Gross Profit, R&D, SG&A, Total OpEx, Op Income, Interest, Pre-Tax Income, Tax, Net Income, Diluted EPS, Shares
- Columns: Historical periods (8-16Q) + Projected periods (4-8Q)
- Sub-rows: YoY growth %, margin % where applicable
- Header: Company name, ticker, report date
- Formatting: Numbers with commas/decimals, percentages, bold headers, frozen panes

**Tab 2: Balance Sheet**
- Rows: Assets section (Cash, Investments, AR, Inventory, Current Assets, PP&E, Goodwill, Total Assets), Liabilities section (AP, ST Debt, LT Debt, Total Liabilities, Equity)
- Columns: Historical + Projected periods
- Sub-rows: % of Total Assets for key line items
- Same formatting standards

**Tab 3: Cash Flow**
- Rows: Op Cash Flow, CapEx, Free Cash Flow, Acquisitions, Dividends, Buybacks, Net Change in Cash
- Columns: Historical + Projected periods
- Sub-rows: FCF yield %, CapEx as % Revenue
- Same formatting standards

**Tab 4: Segments**
- Rows: Revenue by segment, Op Income by segment (if available)
- Columns: Historical + Projected periods
- Sub-rows: Segment as % of total, segment growth rates
- Same formatting standards

**Tab 5: KPIs**
- Rows: All company-specific operating metrics discovered
- Columns: Historical + Projected periods
- Sub-rows: YoY growth or relevant unit economics
- Same formatting standards

**Tab 6: Projections**
- Editable assumption inputs (yellow highlighting): Revenue growth %, Gross margin %, Op margin %, CapEx % revenue, Tax rate %, Buyback rate QoQ
- Calculated outputs: Projected P&L, BS, CF driven by assumptions
- Commentary box explaining methodology
- Same formatting standards

**Tab 7: DCF**
- Inputs: WACC, Terminal Growth, Risk-Free Rate, ERP, Beta, Cost of Debt
- FCF Projection (5 years annualized)
- Terminal Value calculation
- PV calculations
- Enterprise Value → Equity Value → Implied Share Price
- Sensitivity table: WACC (rows) × Terminal Growth (cols) showing implied price
- Color scale: green (upside) to red (downside) vs current price
- Same formatting standards

**Tab 8: Summary**
- Company overview (name, ticker, sector, description)
- Current market data (price, market cap, shares, beta)
- Valuation summary: DCF implied price, peer-implied range, current price, upside/downside %
- Peer trading multiples table
- Key model outputs: Trailing revenue, Projected revenue growth, Trailing/Projected margins
- Same formatting standards

2. Apply `../design-system.md` formatting conventions:
- Number format: $X.Xbn for large numbers, X.X% for percentages, X.Xx for multiples
- Color palette: Navy #1B2A4A (headers), Steel Blue #4A6FA5 (sub-headers), Gold #C5A55A (highlights), Green #27AE60 (positive), Red #C0392B (negative)
- Bold headers, frozen top row and left column
- Yellow fill (#FFEB3B) for editable input cells

3. Save the workbook as `reports/{TICKER}_model.xlsx`

## Output
Present both deliverables to the user:

**Research Note (HTML):**
- Save the styled HTML report to `reports/{TICKER}_initiate_report.html`.
- Tell the user where the HTML file was saved and that it can be opened in a browser for full formatting.

**Excel Model:**
- Save the generated Excel model to `reports/{TICKER}_model.xlsx`.
- Tell the user where the `.xlsx` file was saved.
- Note that yellow cells in the Projections tab are editable inputs.

**Summary:**
- 3-4 sentence executive summary
- Key valuation range (DCF implied price + comps range)
- Top 3 findings
- Bull upside % vs bear downside % risk/reward assessment

All financial figures must use Daloopa citation format: [$X.XX million](https://daloopa.com/src/{fundamental_id})
graphy** → `#ecs-geography`
Summarise the general conditions of the market by geography. Emit exactly four regional blocks, in this order: **North America**, **Latin America**, **Europe, Middle East and Africa**, **Asia Pacific**. No other regions may be added; do not split or rename these four. Each block has a `<strong class="subsection-title">…</strong>` subheader of **no more than 70 characters that summarises the bullets below** (single line, no trailing period). Then a `<ul>` with **at least 2 `<li>` bullets**, **200–250 characters combined per region**, opens directly after the `</strong>`. Each bullet may carry inline citations.
**Provide your view on the trends or patterns observed across all covered companies** — each regional block must reflect cross-company observations of conditions in that geography, not a single-company anecdote.
**Each bullet (and every comment) must explicitly name the company or companies it applies to** by stating the company name(s) directly within the sentence. **Mention the name of the specific companies that are facing the event being described in each point.** If two or more companies share the dynamic in that region, name all of them in the same bullet. Do not write company-agnostic bullets.
If none of the covered companies discussed a given region on their earnings call, **omit that region's block entirely** rather than emitting an empty subheader.

**j. Next Quarter & Full Year Business Outlook / Guidance** → `#ecs-outlook`
One commentary per company (≥2 bullets, 200–250 chars combined). Include next-quarter AND full-year guidance as stated on the earnings call. Include quantitative data where available in the transcript. Each bullet may carry inline citations.
The `<strong class="subsection-title">…</strong>` subtitle **must be a single line in the form `Company Name: Short General Summary`**, where the summary is a brief, general descriptor (≤80 chars, no trailing period) of what the bullets below cover. The summary lives **inside** the `<strong>` tag, joined to the company name by a colon — it is part of the subtitle itself, not a separate sentence underneath. Example: `<strong class="subsection-title">Company Name: Focused on AI-Driven Turnaround and Pipeline Conversion</strong>`. The `<ul>` of bullets opens directly after the `</strong>`.

**k. Earnings Revisions for Applicable Companies** → `#ecs-revisions`
One commentary per company that revised earnings (≥2 bullets, 200–250 chars combined). Each bullet may carry inline citations.
The `<strong class="subsection-title">…</strong>` subtitle **must be a single line in the form `Company Name: Short Summary`**, where the summary is a brief descriptor (≤80 chars, no trailing period) of the revisions covered in the bullets below. The summary lives **inside** the `<strong>` tag, joined to the company name by a colon — it is part of the subtitle itself, not a separate sentence underneath. Example: `<strong class="subsection-title">Company Name: Narrowed Revenue Decline, Raised Free Cash Flow Guidance</strong>`. The `<ul>` of bullets opens directly after the `</strong>`.
Whenever a bullet states that management **raised or lowered a specific financial metric** (revenue, EPS, margin, FCF, capex, etc.), it **must support the claim with the quantitative data point from the transcript when available** — include the new figure, the prior figure, and/or the magnitude of change (e.g., `raised FY revenue guidance to $12.4B from $12.1B (+2.5%)`). Only omit the figure if the transcript itself does not provide it.
If a company did not make or did not mention any revision in its earnings call transcript, **omit that company entirely from this section** — do not emit a subtitle, summary sentence, bullets, or any "No revisions disclosed" placeholder for it.

**l. Corporate Events** → `#ecs-events`
One commentary per company with relevant events (≥2 bullets, 300–350 chars combined).
Cover M&A, restructurings, plant closures, force majeures **as discussed on the earnings call**. Each bullet may carry inline citations.
The `<strong class="subsection-title">…</strong>` subtitle **must be a single line in the form `Company Name: Short Summary`**, where the summary is a brief descriptor (≤80 chars, no trailing period) of the events covered in the bullets below. The summary lives **inside** the `<strong>` tag, joined to the company name by a colon — it is part of the subtitle itself, not a separate sentence underneath. Example: `<strong class="subsection-title">Company Name: Closed Target Co. Acquisition and Restructured EMEA Operations</strong>`. The `<ul>` of bullets opens directly after the `</strong>`.

### Citations & sources (write last)

- `#ecs-cite-a` … `#ecs-cite-l` — optional per-section recap blocks. Use the
  `<div class="section-citations">…</div>` markup defined in
  [skills/shared/citations/SKILL.md](../shared/citations/SKILL.md). Omit any section's block
  if empty.
- `#ecs-sources` — end-of-document Citations rows. One `<div class="source-item">` per
  source, in `[1], [2], …` order, using the canonical row markup from the shared citations
  skill.
---

## Streaming protocol (element → content mapping)

| Element ID                       | Content type                                                       |
|----------------------------------|--------------------------------------------------------------------|
| `#ecs-report-date`               | Plain text date                                                    |
| `#ecs-footer-date`               | Plain text date (same value)                                       |
| `#ecs-company-count`             | Plain text integer                                                 |
| `#ecs-company-chips`             | Sequence of `<span class="company-chip">…</span>`                  |
| `#ecs-cover-img-right`           | `<img>` element — set `src` attribute                              |
| `#ecs-cover-img-bottom`          | `<img>` element — set `src` attribute                              |
| `#ecs-executive-summary`         | One or more `<p>`; prose may carry inline citations |
| `#ecs-credit-badge`              | Single `<div class="credit-badge …">` element                      |
| `#ecs-overall-credit`            | `<p>` intro + `<ul><li>` bullets; prose may carry inline citations |
| `#ecs-tbody-revenue`             | `<tr>` rows with `.yoy-change` class; commentary cell may carry inline citations |
| `#ecs-tbody-volumes`             | `<tr>` rows with `.yoy-change` class; commentary cell may carry inline citations |
| `#ecs-tbody-prices`              | `<tr>` rows with `.yoy-change` class; commentary cell may carry inline citations |
| `#ecs-qualitative`               | `<strong class="subsection-title">` + `<p>` (×3); prose may carry inline citations |
| `#ecs-end-markets`               | `<strong class="subsection-title">` + `<ul><li>` (×4); bullets may carry inline citations |
| `#ecs-supply-chain`              | `<strong class="subsection-title">` + `<ul><li>` (×3); bullets may carry inline citations |
| `#ecs-geography`                 | `<strong class="subsection-title">Region: Summary</strong>` + `<ul><li>` (×4 fixed regions); bullets may carry inline citations |
| `#ecs-outlook`                   | `<strong class="subsection-title">` + `<ul><li>` per company; bullets may carry inline citations |
| `#ecs-revisions`                 | `<strong class="subsection-title">` + `<ul><li>` per company; bullets may carry inline citations |
| `#ecs-events`                    | `<strong class="subsection-title">` + `<ul><li>` per company; bullets may carry inline citations |
| `#ecs-cite-a` … `#ecs-cite-l`    | `<div class="section-citations">…</div>` (optional, see shared citations skill) |
| `#ecs-sources`                   | `<div class="source-item">` rows (see shared citations skill)      |

### Reference HTML snippets

**YOY table row** (`#ecs-tbody-revenue`, `#ecs-tbody-volumes`, `#ecs-tbody-prices`):

```html
<tr>
  <td class="company-name">Company A</td>
  <td class="yoy-change up">+5.20%</td>
  <td>Revenue growth driven by pricing gains in North America <a href="https://example.com/transcript-q1-2026" target="_blank" class="cite-ref">[1]</a>, partially offset by volume declines in EMEA <a href="https://example.com/credit-opinion-a" target="_blank" class="cite-ref">[2]</a>.</td>
</tr>
```

**Company chip** (`#ecs-company-chips`):

```html
<span class="company-chip">Company A</span>
```

**Credit sentiment badge** (`#ecs-credit-badge`):

```html
<div class="credit-badge positive">Positive</div>
```

**Subsection subheader inside prose containers**:

```html
<strong class="subsection-title">North America</strong>
<ul>
  <li>Retail demand held up against tariff pass-through <a href="https://example.com/transcript-q1-2026" target="_blank" class="cite-ref">[1]</a>.</li>
  <li>Pricing remained disciplined across grocery and consumables <a href="https://example.com/sector-outlook" target="_blank" class="cite-ref">[3]</a>.</li>
</ul>
```

**Section citations recap** (`#ecs-cite-a` … `#ecs-cite-l`) and **sources rows**
(`#ecs-sources`): see [skills/shared/citations/SKILL.md](../shared/citations/SKILL.md) for the
canonical markup. Reuse the same `[n]` numbering across inline references, optional recap
blocks, and the end-of-document Citations block.

### Class-selection rules

**`.yoy-change`** modifier (on the second `<td>` of YOY rows):
- `up` — value starts with `+`, equals `Up`, or parses to a positive number
- `down` — value starts with `-`, equals `Down`, or parses to a negative number
- `flat` — value equals `Flat` or `0`
- `na` — value is `Not specified`, `N/A`, empty, or `—`
**`.credit-badge`** modifier (for `#ecs-credit-badge`):
- `positive`, `negative`, or `neutral`. Label text is the capitalized sentiment.
### Conventions

- Use `<p>` for paragraphs, `<ul><li>` for bullets, `<strong class="subsection-title">…</strong>` for bold subheaders inside prose containers.
- Emit inline citations per [skills/shared/citations/SKILL.md](../shared/citations/SKILL.md). Inline citations are the primary attribution mechanism — the optional per-section blocks (`#ecs-cite-a` … `#ecs-cite-l`) remain available as supplementary summary boxes. Numeric `.yoy-change` cells stay citation-free.
- Do NOT include overall section titles — the template already has those.
- `yoy_change` values: `+X.XX%` or `-X.XX%` if numeric, else `Up` / `Down` / `Flat` / `Not specified`.
---

## Step 5 — Tell the user

After `present_files` returns, add a single short sentence in chat confirming the report is
ready (e.g. `Earnings Call Summary for {Company A}, {Company B}, … — the report is available
above as a self-contained HTML artifact.`). Do not paste the HTML into chat and do not suggest
shell commands. The presented file itself is the deliverable.

---

## Tips

- Run ALL data-gathering tool calls in a single parallel batch (one message, many tool calls).
- Emit the final HTML as a single `.html` file written to `/mnt/user-data/outputs/` and
  surfaced via `present_files` — do not paste it inline as a fenced code block, do not stream
  partial sections, do not split across multiple files or messages.
- If `searchEntityEarningsCall` returns no usable transcript for a company, fall back to
  `web_search` **only** to retrieve that company's earnings call transcript from the web, and
  apply the 100-day recency rule. If no transcript can be located within that window, note
  the omission in the Executive Summary and exclude that company from every other section
  (no rows, no subtitles, no placeholders).
- Do not call any other MCP tool (no credit opinion, no sector outlook, no news, no peers, no
  ESG, no document search) — those sources are out of scope for this skill.
- Pick the correct `.yoy-change` / `.credit-badge` modifier class yourself using the rules above — the template no longer does this at render time.
- Emit `<tr>` rows directly inside each `<tbody id="ecs-tbody-…">` placeholder; do not re-create the `<table>` or `<thead>`.
- Inline citations follow the shared citations skill — read [skills/shared/citations/SKILL.md](../shared/citations/SKILL.md) before authoring any `[n]` reference or the Citations block.
