# COMANDO - dashboard-reference.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\mixpanel-headless\skills\dashboard-expert\references\dashboard-reference.md
**SHA:** 36eb5ad98df081ca
**Timestamp:** 2026-08-26T18:31:13.826774
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- 5. **Section header pattern:** `<h2>Section Title</h2><p>One sentence description.</p>` -- keep section titles to 2-4 words.
- 6. **Explainer pattern:** `<p>^ Brief data-driven insight about the chart above.</p>` -- the `^` caret is a visual convention indicating this card explains the chart directly above it.

### Ouro Bruto (primeiros 5000 chars)
```
# Dashboard Reference

Exhaustive technical reference for Mixpanel dashboard creation, layout, content actions, text card formatting, time filters, and known gotchas. Consult this when you need exact parameter names, field types, API behaviors, or formatting rules.

All code examples use the `mixpanel_headless` Python library.

```python
import mixpanel_headless as mp
from mixpanel_headless.types import (
    CreateDashboardParams,
    UpdateDashboardParams,
    UpdateTextCardParams,
    UpdateReportLinkParams,
    Dashboard,
)

ws = mp.Workspace()
```

---

## 1. API Reference

### 1.1 Types

#### CreateDashboardParams

Import: `from mixpanel_headless.types import CreateDashboardParams`

| Field | Type | Default | Constraints |
|---|---|---|---|
| `title` | `str` | **required** | Max 255 chars |
| `description` | `str \| None` | `None` | Max 400 chars |
| `is_private` | `bool \| None` | `None` (False) | |
| `is_restricted` | `bool \| None` | `None` (False) | |
| `filters` | `list[Any] \| None` | `None` | Dashboard-level filters |
| `breakdowns` | `list[Any] \| None` | `None` | Dashboard-level breakdowns |
| `time_filter` | `Any \| None` | `None` | Dashboard-level time filter (see Section 5) |
| `duplicate` | `int \| None` | `None` | ID of dashboard to duplicate |

```python
params = CreateDashboardParams(
    title="Product Health Dashboard",
    description="Key metrics for monitoring product health.",
)
```

#### UpdateDashboardParams

Import: `from mixpanel_headless.types import UpdateDashboardParams`

All fields are optional. Only provided fields are sent to the API.

| Field | Type | Default | Constraints |
|---|---|---|---|
| `title` | `str \| None` | `None` | Max 255 chars |
| `description` | `str \| None` | `None` | Max 400 chars |
| `is_private` | `bool \| None` | `None` | |
| `is_restricted` | `bool \| None` | `None` | |
| `filters` | `list[Any] \| None` | `None` | Dashboard-level filters |
| `breakdowns` | `list[Any] \| None` | `None` | Dashboard-level breakdowns |
| `time_filter` | `Any \| None` | `None` | Dashboard-level time filter |
| `layout` | `Any \| None` | `None` | Layout patch (see Section 3) |
| `content` | `Any \| None` | `None` | Content action (see Section 2) |

```python
params = UpdateDashboardParams(title="Q1 Metrics v2")
data = params.model_dump(exclude_none=True)
# {"title": "Q1 Metrics v2"}
```

#### UpdateTextCardParams

Import: `from mixpanel_headless.types import UpdateTextCardParams`

| Field | Type | Default | Notes |
|---|---|---|---|
| `markdown` | `str \| None` | `None` | HTML content for the text card (see Section 4) |

Model config: `extra="allow"` -- additional fields are preserved.

```python
params = UpdateTextCardParams(markdown="<h2>Section Title</h2><p>Description.</p>")
```

#### UpdateReportLinkParams

Import: `from mixpanel_headless.types import UpdateReportLinkParams`

| Field | Type | Default | Notes |
|---|---|---|---|
| `link_type` | `str` | **required** | Serialized as `"type"` via alias. Example: `"embedded"` |

Model config: `populate_by_name=True, extra="allow"`.

```python
params = UpdateReportLinkParams(link_type="embedded")
data = params.model_dump(by_alias=True, exclude_none=True)
# {"type": "embedded"}
```

#### Dashboard (response model)

Import: `from mixpanel_headless.types import Dashboard`

The `Dashboard` model uses `extra="allow"` so new API fields are preserved automatically. Key fields:

| Field | Type | Description |
|---|---|---|
| `id` | `int` | Unique dashboard identifier |
| `title` | `str` | Dashboard title |
| `description` | `str \| None` | Dashboard description |
| `is_private` | `bool` | Whether dashboard is private |
| `is_restricted` | `bool` | Whether access is restricted |
| `creator_id` | `int \| None` | Creator's user ID |
| `creator_name` | `str \| None` | Creator's name |
| `creator_email` | `str \| None` | Creator's email |
| `created` | `datetime \| str \| None` | Creation timestamp |
| `modified` | `datetime \| str \| None` | Last modification timestamp |
| `is_favorited` | `bool \| None` | Whether current user favorited it |
| `pinned_date` | `str \| None` | Date pinned, if any |
| `layout_version` | `str \| None` | Layout version metadata |
| `unique_view_count` | `int \| None` | Number of unique viewers |
| `total_view_count` | `int \| None` | Total view count |

The `layout` field (from `get_dashboard`) contains the full layout structure described in Section 3.

### 1.2 Workspace Methods

#### List dashboards

```python
def list_dashboards(self, *, ids: list[int] | None = None) -> list[Dashboard]
```

Retrieves all dashboards visible to the authenticated user, optionally filtered by specific IDs.

```python
dashboards = ws.list_dashboards()
dashboards = ws.list_dashboards(ids=[101, 102, 103])
```

#### Create dashboard

```python
def create_dashboard(self, params: CreateDashboardParams) -> Dashboard
```

Creates a new dashboard. Returns the newly created `Dashboard`.

```python
dashboard = ws.create_dashboard(C
```