# COMANDO - full-workflow.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\morningstar\skills\fund-summarizer\references\full-workflow.md
**SHA:** d5ac34ad65f61438
**Timestamp:** 2026-08-26T18:31:15.555234
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- For direct PDF export from an already rendered HTML report, run:

### Ouro Bruto (primeiros 5000 chars)
```
# Partner-authored workflow details

# Fund Summary Skill

A skill for generating a self-contained HTML report with Morningstar insights into a given fund. This skill interacts directly with the Morningstar app to retrieve and summarize key information about a fund, including its ratings, returns, holdings, analyst research, and other relevant metrics.

# Operating Constraints

0. **Default output is the HTML report**: When the user makes a broad request for a fund summary, fund analysis, or fund report, generate the self-contained HTML report and provide the file path. This includes terse requests like "Summarize DODWX" or "Analyze VTSAX". Do not answer with only a text summary unless the user explicitly says not to create a report, asks for text only, or asks a tightly scoped factual question such as "What is the expense ratio?", "What is the Medalist Rating?", "Show top holdings", or "How has it performed YTD?".

1. **No analysis**: You should not perform any analysis or interpretation of the data retrieved from the Morningstar app. Instead, you should focus on summarizing the information in a clear and concise manner without adding any subjective opinions or insights. When summarizing the text information from analysts or articles, you should focus on extracting the key insights and presenting them without adding any additional commentary or analysis.

2. **No financial advice**: You should not provide any financial advice or recommendations based on the information retrieved from the Morningstar app. You should strictly adhere to providing factual information and summaries without making any suggestions or recommendations to the user.

3. **Use the provided template and visual guidance**: When constructing the report, you should use the provided HTML template and populate it with the relevant information about the fund. You should not deviate from the structure of the template or add any additional sections or information that is not relevant to the fund summary. You should also rely on the provided visual guidance for any charts or graphics included in the report, ensuring that they adhere to Morningstar's design standards and color guidelines.

4. **Data availability**: The information you can retrieve about the fund is limited to what is available in the Morningstar app. This only includes ETF's, open-end, and closed-end funds. This would not be available for equities. If the user asks for a summary of an equity, this skill would not apply.

# Workflow

When a user asks for a summary of a fund, you will need to interact with the Morningstar app to retrieve the necessary information. The workflow typically involves the following steps. You do not need to explicitly call out these steps in your response nor provide interim commentary, but you should follow this general process to ensure that you are retrieving and summarizing the information effectively.

## Step 1. Resolve the Fund

First, use `morningstar_id_lookup_tool` to identify the specific fund the user is asking about. If possible, use the ticker for the fund and be precise when requesting a security name, since many securities have very similar names.

If the name-based search returns multiple results, ask the user for more information to narrow down the search. Once you have identified the correct fund, you can proceed to retrieve its information.
The output from this step will include the Morningstar ID for the fund, which you will use in the next step to retrieve detailed information about the fund.

If you cannot identify a fund based on the information provided by the user, you should ask for additional details to help narrow down the search. This could include asking for the fund's ticker symbol, the name of the fund manager, or any other relevant information that could help identify the correct fund.

## Step 2. Retrieve Fund Information

Retrieve the following information from `morningstar_data_tool` using the Morningstar Fund ID obtained in the previous step. Use `morningstar_id_lookup_tool` to resolve datapoint IDs when needed; the IDs listed below are the target Morningstar datapoints. This will include key metrics such as the fund's ratings, returns, and other relevant data points that will be used to construct the summary report. These are chunked in order to be sure that the full JSON output persists in context, rather than only being able to view a truncated version, which can occur when retrieving a large number of data points in a single call.
If any of the data points are not available for the fund, you should note that in the summary report and avoid making any assumptions or interpretations based on missing data.

**Step 2 is the source of truth.** Every value assembled in Step 4 must come from the datapoints and tools listed in Step 2, or from an explicit calculation using those Step 2 values. Do not introduce additional datapoints while constructing the report. If Step 4 appears to need a datapoint that is not listed in
```e 5 call:

```