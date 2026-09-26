# DECISAO - dashboard-templates.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\mixpanel-headless\skills\dashboard-expert\references\dashboard-templates.md
**SHA:** bb7ff996d4e3df7e
**Timestamp:** 2026-08-26T18:31:15.562238
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- | Post-feature flow | Start: `{feature_event}` | -- | -- | Sankey, top 5 next events |
- | Drop-off flow | Start: users who did `{funnel_step_1}` but not `{funnel_step_4}` | -- | -- | Sankey of next actions |
- | User paths | Start: `{login_event}` | -- | -- | Sankey, top 5 paths |

### Ouro Bruto (primeiros 5000 chars)
```
# Dashboard Design Templates

9 purpose-built dashboard templates for common analytics use cases. Each template specifies a complete row-by-row layout, text card content, chart types, and placeholder events that an agent adapts to the user's actual schema.

---

## How to Use These Templates

### Adaptation Workflow

1. **Pick a template** that matches the user's goal (or combine sections from multiple templates).
2. **Discover the schema** -- run `ws.events()` and `ws.properties(event=...)` to find real event names.
3. **Map placeholders to real events** -- replace `{signup_event}`, `{login_event}`, etc. with actual event names from the project. Drop any section whose placeholder events have zero volume.
4. **Validate data** -- query each event before building a report. Skip reports that would render as empty charts.
5. **Adapt row count** -- remove sections that don't apply, or add sections for project-specific needs. Stay within the 30-row dashboard limit.
6. **Build** -- follow the Build mode workflow in `SKILL.md`, using the template layout as the Phase B2 plan.

### Layout Conventions

| Symbol | Meaning |
|---|---|
| `w=N` | Cell width (columns out of 12). Widths in a row must sum to 12. |
| `h=N` | Row height in pixels. `h=0` means auto-height (text-only rows). |
| `insights-metric` | Big-number KPI card (single value with comparison). |
| `line` | Time-series line chart. |
| `bar` | Categorical bar chart. |
| `table` | Data table with sortable columns. |
| `line` + `plotStyle: stacked` | Stacked area/line chart for composition over time. |
| `funnel-steps` | Funnel visualization showing step-by-step conversion. |
| `retention-curve` | Retention curve or cohort grid. |
| `sankey` | Sankey/flow diagram showing user paths. |

### Placeholder Event Conventions

Templates use curly-brace placeholders for event names. The agent replaces these with real events discovered from the project schema.

| Placeholder | Typical Matches |
|---|---|
| `{signup_event}` | Sign Up, Create Account, Registration Complete |
| `{login_event}` | Login, Sign In, Session Start |
| `{core_action_event}` | The primary value-delivery action (e.g., Send Message, Create Post, Place Order) |
| `{purchase_event}` | Purchase, Order Completed, Subscription Started |
| `{feature_event}` | The specific feature being tracked (agent fills in) |
| `{error_event}` | Error, Exception, Crash, API Error |
| `{page_view_event}` | Page Viewed, Screen View, $mp_web_page_view |
| `{referral_event}` | Invite Sent, Referral Created, Share |
| `{onboarding_step_N}` | Sequential onboarding steps (agent discovers from schema) |

---

## Template 1: KPI Dashboard

**Description:** Executive overview of key business metrics with trend lines and core funnels.

**Use case:** Weekly standups, board meetings, investor updates, team-wide visibility into product health.

**Audience:** Leadership, founders, board members, cross-functional stakeholders.

**Placeholder events:** `{signup_event}`, `{login_event}`, `{core_action_event}`

### Layout

| Row | Content | Width | Height | Chart Type |
|---|---|---|---|---|
| 1 | Intro text card | w=12 | h=0 | text |
| 2 | KPI: DAU | w=3 | h=336 | insights-metric |
| 2 | KPI: WAU | w=3 | h=336 | insights-metric |
| 2 | KPI: MAU | w=3 | h=336 | insights-metric |
| 2 | KPI: New Signups | w=3 | h=336 | insights-metric |
| 3 | Section header: Growth Trends | w=12 | h=0 | text |
| 4 | DAU trend (90d) | w=6 | h=418 | line |
| 4 | New signups trend (90d) | w=6 | h=418 | line |
| 5 | Section header: Conversion | w=12 | h=0 | text |
| 6 | Signup-to-activation funnel | w=12 | h=588 | funnel-steps |
| 7 | Section header: Retention | w=12 | h=0 | text |
| 8 | New user retention curve | w=12 | h=500 | retention-curve |
| 9 | Section header: Engagement | w=12 | h=0 | text |
| 10 | Sessions per user (bar) | w=6 | h=418 | bar |
| 10 | Top events by volume (table) | w=6 | h=418 | table |

### Text Card Content

**Row 1 -- Intro:**
```
<h2>Key Performance Indicators</h2><p>Headline metrics for {product_name}. All reports use a rolling 90-day window unless noted.</p>
```

**Row 3 -- Growth Trends:**
```
<h2>Growth Trends</h2><p>User acquisition and daily engagement over time.</p>
```

**Row 5 -- Conversion:**
```
<h2>Conversion</h2><p>How effectively new visitors become activated users.</p>
```

**Row 7 -- Retention:**
```
<h2>Retention</h2><p>How well the product brings users back after their first visit.</p>
```

**Row 9 -- Engagement:**
```
<h2>Engagement</h2><p>Depth of product usage across active users.</p>
```

### Report Specifications

| Report | Event | Math | Breakdown | Notes |
|---|---|---|---|---|
| DAU | `{login_event}` | `dau` | -- | Compare to previous period |
| WAU | `{login_event}` | `wau` | -- | Compare to previous period |
| MAU | `{login_event}` | `mau` | -- | Compare to previous period |
| New Signups | `{signup_event}` | `total` | -- | Compare to previous period |
| DAU trend | `{login_event}` | `dau` | -- | Line c
```