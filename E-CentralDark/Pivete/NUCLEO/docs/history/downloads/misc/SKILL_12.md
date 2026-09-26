---
name: capital-allocation
description: Deep dive into capital deployment, buybacks, dividends, and shareholder
  yield
---

Perform a deep dive into capital allocation for the company named in the user's request. If no ticker or company is provided, ask for one before proceeding.

**Before starting, read `../data-access.md` for data access methods and `../design-system.md` for formatting conventions.** Follow the data access detection logic and design system throughout this skill.

Follow these steps:

## 1. Company Lookup
Look up the company by ticker using `discover_companies`. Capture:
- `company_id`
- `latest_calendar_quarter` — anchor for all period calculations below (see `../data-access.md` Section 1.5)
- `latest_fiscal_quarter`
- Firm name for report attribution (default: "Daloopa") — see `../data-access.md` Section 4.5

## 2. Market Data
Get the current stock price, market cap, and shares outstanding for {TICKER} (see `../data-access.md` Section 2 for how to source market data in your environment).
- This is needed to compute yields and per-share metrics

If market data is unavailable, note that market-derived metrics (yields, etc.) cannot be computed and proceed with Daloopa data only.

## 3. Capital Allocation Data
Calculate 8 quarters backward from `latest_calendar_quarter`. Pull:

**Share Count & Buybacks:**
- Diluted shares outstanding
- Share repurchase amounts (dollars)
- Shares retired/repurchased (units, if available)

**Dividends:**
- Dividends per share
- Total dividend payments
- Special dividends (if any)

**Cash Flow:**
- Operating Cash Flow
- Capital Expenditures
- Free Cash Flow (compute as OCF - CapEx, label "(calc.)")
- D&A (for reference)

**Balance Sheet:**
- Cash and equivalents
- Short-term investments / marketable securities
- Total debt (short + long term)
- Net debt (compute as Total Debt - Cash - Investments, label "(calc.)")

**M&A / Investments:**
- Search for "acquisition", "purchase of business", "investment" in series
- Pull any available M&A-related series

## 4. Compute Capital Allocation Metrics
Calculate for each quarter where data is available:

**Shareholder Returns:**
- Total Buyback Amount
- Total Dividend Amount
- Total Shareholder Return = Buybacks + Dividends
- Shareholder Yield = (Buybacks + Dividends) / Market Cap (annualized)
- Buyback Yield = Buybacks / Market Cap (annualized)
- Dividend Yield = Dividends / Market Cap (annualized)

**FCF Deployment:**
- FCF Payout Ratio = Total Shareholder Return / FCF
- CapEx as % of Revenue
- CapEx as % of OCF
- FCF Margin = FCF / Revenue

**Leverage:**
- Net Debt / EBITDA (if EBITDA available; compute from Operating Income + D&A if needed)
- Net Debt / Equity
- Interest Coverage = Operating Income / Interest Expense (if available)
- Cash as % of Market Cap

**Share Count Dynamics:**
- QoQ share count change
- YoY share count change
- Implied buyback rate (QoQ % reduction)
- At current buyback rate, years to retire X% of shares

## 5. Qualitative Research
Search SEC filings for capital allocation strategy and context. Try multiple searches:
- **Buyback program**: Try "repurchase program", "share repurchase"; fallback to "buyback", "authorization"
- **Dividend policy**: Try "dividend", "capital return"; fallback to "distribution", "payout"
- **M&A strategy**: Try "acquisition", "strategic"; fallback to "purchase", "investment"
- **Capital priorities**: Try "capital allocation", "priorities"; fallback to "deploy", "balance sheet"
- **Debt management**: Try "debt", "refinance"; fallback to "leverage", "maturity"

Extract:
- Board-authorized buyback programs (remaining authorization amount)
- Dividend policy (commitment to growth, payout ratio targets)
- M&A philosophy (bolt-on vs transformational, deal pipeline commentary)
- Management's stated capital allocation framework and priorities
- Any changes in capital allocation strategy
- Direct quotes with document citations

## 6. Historical Analysis & Value Judgment
Analyze the 8-quarter trend:
- Is buyback activity accelerating or decelerating?
- Is the company buying back more shares when price is lower (disciplined) or higher (less disciplined)?
- Dividend growth rate (if applicable)
- Shift between CapEx, buybacks, dividends, and debt repayment over time
- FCF conversion trend (is more/less of OCF converting to FCF?)

**Honestly assess whether capital allocation is creating or destroying value:**
- If the company is buying back stock at all-time-high prices with deteriorating fundamentals, call it value destruction — even if EPS looks better from the lower share count.
- If the company is under-investing in CapEx or R&D to fund buybacks, flag the risk to long-term competitiveness.
- If FCF payout ratio exceeds 100%, the company is funding returns with debt or cash drawdowns — flag this as unsustainable.
- Compare the implied return from buybacks (inverse of P/E at purchase prices) to what the company could earn from organic reinvestment or M&A.

## 6.5. Reinvestment Assessment

Assess whether the company is adequately reinvesting in its business or funding returns at the expense of long-term competitiveness.

**Pull reinvestment metrics (8 quarters):**
- R&D expense (and R&D as % of revenue)
- Capital Expenditures (and CapEx as % of revenue)
- Key growth KPIs relevant to the business model (use sector taxonomy):
  - **SaaS/Cloud**: ARR, net revenue retention, RPO/cRPO, customers >$100K
  - **Consumer Tech**: DAU/MAU, ARPU, installed base, paid subscribers
  - **E-commerce/Marketplace**: GMV, take rate, active buyers/sellers
  - **Retail**: same-store sales, store count, average ticket
  - **Telecom/Media**: subscribers, churn, ARPU, content spend
  - **Hardware**: units shipped, ASP, attach rate
  - **Financial Services**: AUM, NIM, loan growth, fee income ratio
  - **Pharma/Biotech**: pipeline stage, patient starts, scripts, market share
  - **Industrials/Energy**: backlog, book-to-bill, utilization, production volumes

**Assess reinvestment adequacy:**
- Is R&D/revenue trending down while buybacks are increasing? This may indicate the company is funding shareholder returns by underinvesting in innovation.
- Is CapEx/revenue declining while the business requires sustained infrastructure investment (e.g., cloud, manufacturing, stores)?
- Are growth KPIs (subscriber adds, customer growth, same-store sales) deteriorating while capital returns are at record levels? This is a red flag — the company may be harvesting rather than growing.
- Compare R&D intensity and CapEx intensity vs peers (if available from the industry or comps skills). Is the company investing more or less than competitors?

**Value creation vs extraction verdict:**
- Net assessment: Is the company's capital allocation creating long-term value (reinvesting at high ROIC, buying back cheap stock, growing dividends sustainably) or extracting value (under-investing to fund buybacks at premium valuations, leveraging up for returns)?

## 7. Save Report
Save to `reports/{TICKER}_capital_allocation.html` using the HTML report template from `../design-system.md`. Write the full analysis as styled HTML with the design system CSS inlined. This is the final deliverable — no intermediate markdown step needed.

Structure the report with these sections:

```
<h1>{Company Name} ({TICKER}) — Capital Allocation Analysis</h1>
<p>Generated: {date}</p>

<h2>Summary</h2>
{2-3 sentences: How does this company deploy its capital? Key takeaways.}

<h2>Current Snapshot</h2>
<table>
| Metric | Value |
| Market Cap | $XXX |
| Trailing 4Q FCF | $XXX |
| FCF Yield | X.X% |
| Shareholder Yield | X.X% |
| Net Debt / EBITDA | X.Xx |
| Remaining Buyback Authorization | $XXX |
</table>

<h2>Cash Flow & FCF (8 Quarters)</h2>
<table>
| Metric | Q1 | Q2 | ... | Q8 |
{OCF, CapEx, FCF, FCF Margin % — with Daloopa citations}
</table>

<h2>Share Repurchases & Dividends (8 Quarters)</h2>
<table>
| Metric | Q1 | Q2 | ... | Q8 |
{Buyback $, Dividends $, Total Return, Share Count — with Daloopa citations}
</table>

<h2>Shareholder Yield Analysis</h2>
<table>
| Metric | Q1 | Q2 | ... | Q8 |
{Buyback Yield, Div Yield, Total Yield, FCF Payout Ratio}
</table>

<h2>Leverage & Balance Sheet (8 Quarters)</h2>
<table>
| Metric | Q1 | Q2 | ... | Q8 |
{Cash, Debt, Net Debt, Net Debt/EBITDA — with Daloopa citations}
</table>

<h2>Capital Allocation Framework</h2>
{Management's stated priorities from filings, with document citations}

<h2>Reinvestment Assessment</h2>
<table>
| Metric | Q1 | Q2 | ... | Q8 |
{R&D, R&D % Rev, CapEx, CapEx % Rev, key growth KPIs — with Daloopa citations}
</table>
{Analysis: Is the company adequately reinvesting? R&D/CapEx trends vs growth KPI trends. Value creation vs extraction verdict.}

<h2>Buyback Discipline Analysis</h2>
{Analysis of buyback timing vs price, share count reduction trend, authorization remaining}

<h2>M&A Activity</h2>
{Any acquisitions from filings, deal sizes, strategic rationale}

<h2>Key Observations</h2>
<ul>{3-5 bullet points on capital allocation quality, trends, and implications}</ul>
```

All financial figures must use Daloopa citation format: `<a href="https://daloopa.com/src/{fundamental_id}">$X.XX million</a>`

Tell the user where the HTML report was saved.

Highlight the key capital allocation story (e.g., "AAPL returned $XX billion to shareholders over the last year, a X.X% shareholder yield, with buybacks accelerating").
| set[Component] | None = None, show_label: bool | None = None, container: bool = True, scale: int | None = None, min_width: int = 160, interactive: bool | None = None, visible: bool | Literal['hidden'] = True, streaming: bool = False, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value", format: Literal['wav', 'mp3'] | None = None, autoplay: bool = False, editable: bool = True, buttons: list[Literal['download', 'share'] | Button] | None = None, waveform_options: WaveformOptions | dict | None = None, loop: bool = False, recording: bool = False, subtitles: str | Path | list[dict[str, Any]] | None = None, playback_position: float = 0)`
Creates an audio component that can be used to upload/record audio (as an input) or display audio (as an output)..

### `Video(value: str | Path | Callable | None = None, format: str | None = None, sources: list[Literal['upload', 'webcam']] | Literal['upload', 'webcam'] | None = None, height: int | str | None = None, width: int | str | None = None, label: str | I18nData | None = None, every: Timer | float | None = None, inputs: Component | Sequence[Component] | set[Component] | None = None, show_label: bool | None = None, container: bool = True, scale: int | None = None, min_width: int = 160, interactive: bool | None = None, visible: bool | Literal['hidden'] = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value", webcam_options: WebcamOptions | None = None, include_audio: bool | None = None, autoplay: bool = False, buttons: list[Literal['download', 'share'] | Button] | None = None, loop: bool = False, streaming: bool = False, watermark: WatermarkOptions | None = None, subtitles: str | Path | list[dict[str, Any]] | None = None, playback_position: float = 0)`
Creates a video component that can be used to upload/record videos (as an input) or display videos (as an output).

### `File(value: str | list[str] | Callable | None = None, file_count: Literal['single', 'multiple', 'directory'] = "single", file_types: list[str] | None = None, type: Literal['filepath', 'binary'] = "filepath", label: str | I18nData | None = None, every: Timer | float | None = None, inputs: Component | Sequence[Component] | set[Component] | None = None, show_label: bool | None = None, container: bool = True, scale: int | None = None, min_width: int = 160, height: int | str | float | None = None, interactive: bool | None = None, visible: bool | Literal['hidden'] = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value", allow_reordering: bool = False, buttons: list[Button] | None = None)`
Creates a file component that allows uploading one or more generic files (when used as an input) or displaying generic files or URLs for download (as output).

### `Chatbot(value: list[MessageDict | Message] | Callable | None = None, label: str | I18nData | None = None, every: Timer | float | None = None, inputs: Component | Sequence[Component] | set[Component] | None = None, show_label: bool | None = None, container: bool = True, scale: int | None = None, min_width: int = 160, visible: bool | Literal['hidden'] = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, autoscroll: bool = True, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value", height: int | str | None = 400, resizable: bool = False, max_height: int | str | None = None, min_height: int | str | None = None, editable: Literal['user', 'all'] | None = None, latex_delimiters: list[dict[str, str | bool]] | None = None, rtl: bool = False, buttons: list[Literal['share', 'copy', 'copy_all'] | Button] | None = None, watermark: str | None = None, avatar_images: tuple[str | Path | None, str | Path | None] | None = None, sanitize_html: bool = True, render_markdown: bool = True, feedback_options: list[str] | tuple[str, ...] | None = ('Like', 'Dislike'), feedback_value: Sequence[str | None] | None = None, line_breaks: bool = True, layout: Literal['panel', 'bubble'] | None = None, placeholder: str | None = None, examples: list[ExampleMessage] | None = None, allow_file_downloads: <class 'inspect._empty'> = True, group_consecutive_messages: bool = True, allow_tags: list[str] | bool = True, reasoning_tags: list[tuple[str, str]] | None = None, like_user_message: bool = False)`
Creates a chatbot that displays user-submitted messages and responses.

### `Button(value: str | I18nData | Callable = "Run", every: Timer | float | None = None, inputs: Component | Sequence[Component] | set[Component] | None = None, variant: Literal['primary', 'secondary', 'stop', 'huggingface'] = "secondary", size: Literal['sm', 'md', 'lg'] = "lg", icon: str | Path | None = None, link: str | None = None, link_target: Literal['_self', '_blank', '_parent', '_top'] = "_self", visible: bool | Literal['hidden'] = True, interactive: bool = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value", scale: int | None = None, min_width: int | None = None)`
Creates a button that can be assigned arbitrary .click() events.

### `Markdown(value: str | I18nData | Callable | None = None, label: str | I18nData | None = None, every: Timer | float | None = None, inputs: Component | Sequence[Component] | set[Component] | None = None, show_label: bool | None = None, rtl: bool = False, latex_delimiters: list[dict[str, str | bool]] | None = None, visible: bool | Literal['hidden'] = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value", sanitize_html: bool = True, line_breaks: bool = False, header_links: bool = False, height: int | str | None = None, max_height: int | str | None = None, min_height: int | str | None = None, buttons: list[Literal['copy']] | None = None, container: bool = False, padding: bool = False)`
Used to render arbitrary Markdown output.

### `HTML(value: Any | Callable | None = None, label: str | I18nData | None = None, html_template: str = "${value}", css_template: str = "", js_on_load: str | None = "element.addEventListener('click', function() { trigger('click') });", apply_default_css: bool = True, every: Timer | float | None = None, inputs: Component | Sequence[Component] | set[Component] | None = None, show_label: bool = False, visible: bool | Literal['hidden'] = True, elem_id: str | None = None, elem_classes: list[str] | str | None = None, render: bool = True, key: int | str | tuple[int | str, ...] | None = None, preserved_by_key: list[str] | str | None = "value", min_height: int | None = None, max_height: int | None = None, container: bool = False, padding: bool = False, autoscroll: bool = False, buttons: list[Button] | None = None, props: Any)`
Creates a component with arbitrary HTML.


## Custom HTML Components

If a task requires significant customization of an existing component or a component that doesn't exist in Gradio, you can create one with `gr.HTML`. It supports `html_template` (with `${}` JS expressions and `{{}}` Handlebars syntax), `css_template` for scoped styles, and `js_on_load` for interactivity — where `props.value` updates the component value and `trigger('event_name')` fires Gradio events. For reuse, subclass `gr.HTML` and define `api_info()` for API/MCP support. See the [full guide](https://www.gradio.app/guides/custom-HTML-components).

Here's an example that shows how to create and use these kinds of components:

```python
import gradio as gr

class StarRating(gr.HTML):
    def __init__(self, label, value=0, **kwargs):
        html_template = """
        <h2>${label} rating:</h2>
        ${Array.from({length: 5}, (_, i) => `<img class='${i < value ? '' : 'faded'}' src='https://upload.wikimedia.org/wikipedia/commons/d/df/Award-star-gold-3d.svg'>`).join('')}
        """
        css_template = """
            img { height: 50px; display: inline-block; cursor: pointer; }
            .faded { filter: grayscale(100%); opacity: 0.3; }
        """
        js_on_load = """
            const imgs = element.querySelectorAll('img');
            imgs.forEach((img, index) => {
                img.addEventListener('click', () => {
                    props.value = index + 1;
                });
            });
        """
        super().__init__(value=value, label=label, html_template=html_template, css_template=css_template, js_on_load=js_on_load, **kwargs)

    def api_info(self):
        return {"type": "integer", "minimum": 0, "maximum": 5}


with gr.Blocks() as demo:
    gr.Markdown("# Restaurant Review")
    food_rating = StarRating(label="Food", value=3)
    service_rating = StarRating(label="Service", value=3)
    ambience_rating = StarRating(label="Ambience", value=3)
    average_btn = gr.Button("Calculate Average Rating")
    rating_output = StarRating(label="Average", value=3)
    def calculate_average(food, service, ambience):
        return round((food + service + ambience) / 3)
    average_btn.click(
        fn=calculate_average,
        inputs=[food_rating, service_rating, ambience_rating],
        outputs=rating_output
    )

demo.launch()
```

## Event Listeners

All event listeners share the same signature:

```python
component.event_name(
    fn: Callable | None | Literal["decorator"] = "decorator",
    inputs: Component | Sequence[Component] | set[Component] | None = None,
    outputs: Component | Sequence[Component] | set[Component] | None = None,
    api_name: str | None = None,
    api_description: str | None | Literal[False] = None,
    scroll_to_output: bool = False,
    show_progress: Literal["full", "minimal", "hidden"] = "full",
    show_progress_on: Component | Sequence[Component] | None = None,
    queue: bool = True,
    batch: bool = False,
    max_batch_size: int = 4,
    preprocess: bool = True,
    postprocess: bool = True,
    cancels: dict[str, Any] | list[dict[str, Any]] | None = None,
    trigger_mode: Literal["once", "multiple", "always_last"] | None = None,
    js: str | Literal[True] | None = None,
    concurrency_limit: int | None | Literal["default"] = "default",
    concurrency_id: str | None = None,
    api_visibility: Literal["public", "private", "undocumented"] = "public",
    time_limit: int | None = None,
    stream_every: float = 0.5,
    key: int | str | tuple[int | str, ...] | None = None,
    validator: Callable | None = None,
) -> Dependency
```

Supported events per component:

- **AnnotatedImage**: select
- **Audio**: stream, change, clear, play, pause, stop, pause, start_recording, pause_recording, stop_recording, upload, input
- **BarPlot**: select, double_click
- **BrowserState**: change
- **Button**: click
- **Chatbot**: change, select, like, retry, undo, example_select, option_select, clear, copy, edit
- **Checkbox**: change, input, select
- **CheckboxGroup**: change, input, select
- **ClearButton**: click
- **Code**: change, input, focus, blur
- **ColorPicker**: change, input, submit, focus, blur
- **Dataframe**: change, input, select, edit
- **Dataset**: click, select
- **DateTime**: change, submit
- **DeepLinkButton**: click
- **Dialogue**: change, input, submit
- **DownloadButton**: click
- **Dropdown**: change, input, select, focus, blur, key_up
- **DuplicateButton**: click
- **File**: change, select, clear, upload, delete, download
- **FileExplorer**: change, input, select
- **Gallery**: select, upload, change, delete, preview_close, preview_open
- **HTML**: change, input, click, double_click, submit, stop, edit, clear, play, pause, end, start_recording, pause_recording, stop_recording, focus, blur, upload, release, select, stream, like, example_select, option_select, load, key_up, apply, delete, tick, undo, retry, expand, collapse, download, copy
- **HighlightedText**: change, select
- **Image**: clear, change, stream, select, upload, input
- **ImageEditor**: clear, change, input, select, upload, apply
- **ImageSlider**: clear, change, stream, select, upload, input
- **JSON**: change
- **Label**: change, select
- **LinePlot**: select, double_click
- **LoginButton**: click
- **Markdown**: change, copy
- **Model3D**: change, upload, edit, clear
- **MultimodalTextbox**: change, input, select, submit, focus, blur, stop
- **Navbar**: change
- **Number**: change, input, submit, focus, blur
- **ParamViewer**: change, upload
- **Plot**: change
- **Radio**: select, change, input
- **ScatterPlot**: select, double_click
- **SimpleImage**: clear, change, upload
- **Slider**: change, input, release
- **State**: change
- **Textbox**: change, input, select, submit, focus, blur, stop, copy
- **Timer**: tick
- **UploadButton**: click, upload
- **Video**: change, clear, start_recording, stop_recording, stop, play, pause, end, upload, input

## Additional Reference

- [End-to-End Examples](examples.md) — complete working apps
