# DECISAO - fa-credit-decisioning.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\dnb-finance-analytics\skills\fa-jobs-to-be-done\fa-skills\references\fa-credit-decisioning.md
**SHA:** 4d9a62b564b0a7c5
**Timestamp:** 2026-08-26T18:31:05.259526
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- - Overall Business Risk: `<overall_risk_level from scoring.riskAssessment>`

### Ouro Bruto (primeiros 5000 chars)
```
# FA Credit Decisioning - Sub-flow Reference

**Tools used:** `fa_search_tool`, `query_portfolio`, `get_company_report`

This file defines the Credit Decisioning workflow. It is loaded by the master
`SKILL.md` when user intent resolves to a credit decisioning request or a
company overview to support a credit decision.

**Core question answered by this workflow:**

> "Give me a full picture of [Company X] so I can make an informed credit decision."

Use this workflow for broad, report-driven credit decisioning. Do not use it for
focused point questions (those call only the relevant tool directly) or for credit limit
validation requests (use `fa-credit-validation.md` instead).

---

## Pipeline Overview

```
Stage 1:  Resolve Company
  -> Stage 2:  Retrieve Report Data
    -> Stage 3:  Produce Credit Decisioning Report
```

---

## Trigger Examples

- "Provide an overview of Company Z to help me make a credit decision."
- "Provide an overview of Company Z, focusing on recent financials, negative legal events,
  and credit profile."
- "Run a credit decisioning for Company Z."
- "Generate the credit decisioning report for company X."
- Any question asking for a general company assessment that is NOT a portfolio question,
  NOT a focused credit limit validation, and NOT a narrow single-metric query.

---

## Stage 1 - Resolve Company

**Purpose:** Identify the correct company and obtain its DUNS number.

**Tool call sequence:**

1. If the user provided a DUNS directly: use it. Skip `fa_search_tool`.
2. If the user provided only a company name: call `fa_search_tool` with name and country.
   - If exactly one high-confidence match: proceed with that DUNS.
   - If multiple matches: show a short table (name, country, DUNS) and ask the user to
     select the correct company or provide the DUNS directly.
   - If no match: report that no record was found and ask the user to verify the name.

**Required outputs:** Confirmed company name, DUNS, country.

**Failure condition:** Do not proceed without a resolved DUNS.

---

## Stage 2 - Retrieve Report Data

**Purpose:** Pull the full D&B company report to populate the Credit Decisioning Report
template. Use portfolio data to supplement where available.

**Tool call sequence:**

1. Call `get_company_report` with the resolved DUNS.
   - Set `continue_report_pull` to `false` unless the user explicitly answered "yes" to
     a previous prompt about report retrieval. Do NOT carry this parameter over from
     earlier tool calls - each request requires a fresh evaluation.
   - Extract all fields listed in the Data Extraction Guide below.
2. Call `query_portfolio` with the resolved DUNS to retrieve any current portfolio
   account data (outstanding, past due, credit limit utilisation, account type).
   - Portfolio data supplements the report but does not override it for risk scores.
   - If the company is not in the portfolio, note this in the report.

**Data Extraction Guide - fields to extract from `get_company_report`:**

| Section | Field path |
|---|---|
| Company Name | `header.companyName` |
| DUNS | `header.duns` |
| Tradestyles | `header.tradestyles` |
| Business Status | `header.businessStatus` |
| Address | `header.address` (address1, city, stateCode, postalCode, country) |
| Phone | `header.phone` |
| Report Date | `header.reportDate` |
| PAYDEX Score | `scoring.paydex.score`, `.paymentBehavior`, `.days` |
| PAYDEX History | `scoring.paydex.history` |
| Delinquency Score | `scoring.delinquencyScore.score`, `.probability`, `.scoreCommentaryText` |
| Failure Score | `scoring.failureScore.score`, `.probability`, `.scoreCommentaryText` |
| D&B Rating | `scoring.currentDnbRating.score`, `.assignedRiskIndicatorMessageKey` |
| Viability Score | `scoring.viabilityScore.score`, `.viabRiskLevel`, `.portfolioRiskLevel` |
| Max Credit Recommendation | `scoring.maxCredit.amount`, `.currency`, `.riskLevel` |
| Overall Business Risk | `scoring.riskAssessment.overallAssessmentTextKey`, `.summaryRiskLevel` |
| Active/Bankruptcy Status | `scoring.activeStatus` |
| Annual Sales | `financialSummary.profitLoss.data.sales.current.value` |
| Net Worth | `financialSummary.balanceSheet.data.netWorth.current.value` |
| Total Assets | `financialSummary.balanceSheet.data.totalAsset.current.value` |
| Total Liabilities | `financialSummary.balanceSheet.data.totalLiabilities.current.value` |
| Current Assets | `financialSummary.balanceSheet.data.currentAsset.current.value` |
| Current Liabilities | `financialSummary.balanceSheet.data.currentLiabilities.current.value` |
| Pre-Tax Profit | `financialSummary.profitLoss.data.ebit.current.value` |
| Net Income | `financialSummary.profitLoss.data.netIncome.current.value` |
| Financial Source/Date | `financialSummary.source`, `.dateMonthYear` |
| Suits | `legalEvents.suitCount`, `.suitDate` |
| UCC Filings | `legalEvents.financingStatementFilingCount`, `.financingStatementFilingDate` |
| Judgments | `legalEvents.judgementCount`, `.judgementDate` |
| Lie
```