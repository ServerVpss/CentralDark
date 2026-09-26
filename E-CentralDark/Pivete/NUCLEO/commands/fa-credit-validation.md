# COMANDO - fa-credit-validation.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\dnb-finance-analytics\skills\fa-jobs-to-be-done\fa-skills\references\fa-credit-validation.md
**SHA:** 23e786dcd895c3cb
**Timestamp:** 2026-08-26T18:31:14.610649
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- - If OBR is available and MCR is missing: state MCR as `Not available`.
- - If both OBR and MCR are missing: state `Not available via tools`.

### Ouro Bruto (primeiros 5000 chars)
```
# FA Credit Limit Validation - Sub-flow Reference

**Tools used:** `fa_search_tool`, `query_portfolio`, `get_company_report`

This file defines the Credit Limit Validation workflow. It is loaded by the master
`SKILL.md` when user intent resolves to credit limit approval, increase, validation,
or a concise credit decision recommendation for a specific company.

**Core question answered by this workflow:**

> "Can I approve $X for [Company Y]?" or "Should I increase the credit limit for this customer?"

Use this workflow for concise, decision-focused credit limit assessments. Do not use it
for broad credit decisioning (use `fa-credit-decisioning.md`) or for creating new credit
applications (use the decisioning tools via `fa-onboarding-workflow.md`).

---

## Pipeline Overview

```
Stage 1:  Resolve Company
  -> Stage 2:  Retrieve Portfolio and Report Data
    -> Stage 3:  Produce Credit Validation Response
```

---

## Trigger Examples

- "Can I approve a 50,000 credit limit for Company X?"
- "I am owed 100,000 by Company Y. Can I increase the credit limit to 200,000?"
- "Validate this customer for a credit increase."
- "Give me a concise credit decision view for Company Z."
- "Can X's credit limit be raised to 50K?"
- "Should I extend more credit to this account?"

---

## Stage 1 - Resolve Company

**Purpose:** Identify the correct company and obtain its DUNS number.

**Tool call sequence:**

1. If the user provided a DUNS directly: use it. Skip `fa_search_tool`.
2. If the user provided only a company name: call `fa_search_tool` with name and country.
   - Identity resolution must use `fa_search_tool`, not `query_portfolio`.
   - If exactly one high-confidence match: proceed.
   - If multiple matches: show a short table (name, country, DUNS) and ask the user to
     confirm the correct company or provide the DUNS directly.
   - If no match: report that no record was found and ask the user to verify the name.

**Required outputs:** Confirmed company name, DUNS, country.

**Failure condition:** Do not proceed without a resolved DUNS.

---

## Stage 2 - Retrieve Portfolio and Report Data

**Purpose:** Gather the risk and financial data needed to perform the credit validation.
Portfolio data is the primary source; report data supplements missing fields only.

**Tool call sequence:**

1. Call `query_portfolio` with the resolved DUNS.
   - Restrict lookup to `credit_file_type` = `ACCOUNT` or `DUNSRIGHT` unless the user
     explicitly asks for another entity type.
   - A single DUNS may have **multiple accounts** in the portfolio. Retrieve ALL accounts
     associated with the DUNS. Never rely on a single account record for calculations.
   - Extract: `overall_business_risk`, `max_credit_recommendation`, `paydex_current`,
     `failure_score`, `delinquency_score`, `total_outstanding_dollars`,
     `total_past_due_dollars`, `credit_limit_utilization`, `db_bankruptcy_present`,
     trade payment indicators, legal event indicators, financial stress indicators.
   - Calculate the **Aggregated Existing Outstanding Amount** by summing
     `total_outstanding_dollars` across ALL accounts for the DUNS. Retain the
     account-level split for inclusion in Supporting Factors.
   - Calculate the **Aggregated Past Due Amount** by summing `total_past_due_dollars`
     across ALL accounts. Retain the account-level split.

2. Compare the returned fields against the required validation fields listed above.
   - If all required fields are present in the portfolio record: proceed to Stage 3
     without calling `get_company_report`.
   - If one or more required fields are missing from the portfolio record: call
     `get_company_report` with the resolved DUNS and extract only the missing fields.
   - **Portfolio values take precedence.** Never override a populated portfolio value
     with `get_company_report` data.

3. If the company is not in the portfolio at all: call `get_company_report` with the
   resolved DUNS for all validation data. Note in the output that the company is not
   in the portfolio.

**Required outputs:**

- Overall Business Risk (OBR) label
- Maximum Credit Recommendation (MCR) amount and currency
- PAYDEX / payment reliability score
- Failure Score and delinquency score
- Aggregated Existing Outstanding Amount (with account-level split if multiple accounts)
- Aggregated Past Due Amount
- Credit limit utilisation
- Bankruptcy and legal event flags
- Data source for each field (portfolio or report)

**Failure condition:** If neither portfolio nor report data is available, say that the
company could not be resolved or that validation data is unavailable. Do not invent values.

---

## Stage 3 - Produce Credit Validation Response

**Purpose:** Produce a concise, decision-supporting credit validation output. The response
must be 10-15 lines total and follow the output template exactly.

**Analysis rules:**

- Use `overall_business_risk` (OBR) and `max_credit_recommendation` (MCR) as the primary
  decision anchor
```