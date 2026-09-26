---
name: data-cleaner
description: Universal data cleaning skill that analyzes, cleans, and standardizes datasets across CSV, TSV, Excel, Parquet, JSON, XML, and YAML formats. Generates Python scripts for efficient processing of large datasets (1M+ rows) without loading data into LLM context.
license: MIT
metadata:
  version: 1.4.0
  model: claude-opus-4-5-20251101
---

# Data Cleaner

Intelligent data cleaning via Python script generation. Handles large datasets efficiently.

---

## Quick Start

```
clean my data file customers.csv
```

Or with options:

```
/data-cleaner customers.xlsx --mode auto
```

The skill will:
1. Create a cleaning folder: `customers-cleaning/`
2. Analyze your file structure and field patterns
3. Present findings and ask for decisions (interactive) or proceed with defaults (auto)
4. Generate and execute cleaning scripts
5. Output cleaned data and reports to the cleaning folder

---

## Triggers

- `clean data` / `clean my data`
- `data cleaning` / `clean dataset`
- `/data-cleaner {file}`
- `standardize {file}`
- `fix data quality in {file}`

---

## Quick Reference

| Input | Output | Mode |
|-------|--------|------|
| Any supported file | `{name}-cleaned.{ext}` + report | Interactive (default) |
| File + `--mode auto` | Same + assumptions documented | Autonomous |

### Supported Formats

| Format | Extension | Library |
|--------|-----------|---------|
| CSV | .csv | Polars |
| TSV | .tsv | Polars |
| Excel | .xlsx, .xls | openpyxl/xlrd |
| Parquet | .parquet | Polars |
| JSON | .json | Native + Polars |
| XML | .xml | lxml |
| YAML | .yaml, .yml | PyYAML |

---

## How It Works

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   INPUT     │───▶│  ANALYZE    │───▶│  LLM SEMANTIC│
│  (any fmt)  │    │  (script)   │    │  (if needed) │
└─────────────┘    └─────────────┘    └──────┬───────┘
                                             │
      ┌──────────────────────────────────────┘
      ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   DECIDE    │───▶│   CLEAN     │───▶│   OUTPUT    │
│ (user/auto) │    │  (script)   │    │  (-cleaned) │
└─────────────┘    └─────────────┘    └─────────────┘
```

**Key principles:**
- Scripts handle volume (1M+ rows)
- LLM handles intelligence (semantic understanding)
- Only **unique values** go to LLM, never raw data
- 1M rows with 6 unique values = only 6 values analyzed

---

## LLM Semantic Analysis

The skill uses LLM intelligence **only when needed** for tasks that require understanding:

### When LLM IS Used

| Task | Example | Why LLM? |
|------|---------|----------|
| Categorical variants | USA/US/United States | Semantic equivalence |
| Complex currencies | $85k, 52 000 €, ranges | Human notation |
| Non-standard dates | 1990年5月15日, Arabic numerals | Script can't parse |
| Typo correction | Engneering → Engineering | Context needed |

### When LLM is NOT Used

| Task | Method | Why Script? |
|------|--------|-------------|
| Email validation | Regex | Pattern matching |
| Whitespace trim | String ops | Mechanical |
| Exact duplicates | Hash | Comparison |
| Null standardization | Lookup | Known values |
| Case normalization | String ops | No semantics |

### How It Works

```
Field: "state" with 1,000,000 rows

Step 1: Script extracts unique values
  → ["CA", "cali", "Utah", "indiana", "houston", "FLORIDA"]
  → Only 6 values (not 1M!)

Step 2: LLM analyzes the 6 values
  → Detects: US state field, mostly codes
  → Maps: cali→CA, Utah→UT, indiana→IN, FLORIDA→FL
  → Flags: houston (city, not state)

Step 3: Script applies mappings to all 1M rows
  → Simple dict lookup, O(N)
```

### Format Preservation

LLM preserves the dominant format in your data:
- If most values are codes (CA, TX) → output codes
- If most values are full names (California) → output full names
- Ambiguous values (Springfield) → kept unchanged

---

## Commands

| Command | Description |
|---------|-------------|
| `/data-cleaner {file}` | Clean file interactively |
| `/data-cleaner {file} --mode auto` | Clean with autonomous decisions |
| `/data-cleaner {file} --analyze-only` | Show analysis without cleaning |
| `/data-cleaner {file} --dry-run` | Generate scripts without executing |

---

## Operating Modes

### Interactive (Default)

1. Analyze dataset → present summary
2. For each ambiguous field → show examples, ask treatment
3. For fuzzy duplicates → present pairs, ask action
4. Confirm plan → execute → report

### Autonomous (`--mode auto`)

1. Analyze dataset
2. Apply best-guess rules for ambiguous cases
3. Skip fuzzy duplicate removal (exact only)
4. Execute → report with all assumptions documented

---

## Field Type Detection

The analysis script detects these field types with confidence scores:

| Type | Detection Pattern | Cleaning Action |
|------|-------------------|-----------------|
| Person Name | 2+ words, alphabetic | Title Case, nullify garbage |
| Email | `*@*.*` pattern | Lowercase, validate format |
| Date | Various patterns | ISO 8601 (YYYY-MM-DD) |
| DateTime | Date + time patterns | ISO 8601 (YYYY-MM-DDTHH:MM:SS) |
| Currency | Numeric + symbols | Normalize format, detect locale |
| Currency (Normalized) | Numeric + symbols | `{amount} {ISO_CODE}` format |
| Phone | Digits + formatting | Normalize or preserve |
| Phone (E.164) | Digits + formatting | E.164 format: `+{country}{number}` |
| URL | http(s):// pattern | Validate, preserve |
| ID/Code | Alphanumeric, unique | Preserve, no normalization |
| City | Text, low cardinality | LLM semantic normalization |
| Categorical | Limited unique values | Standardize case |
| Numeric | Pure numbers | Standardize decimals |
| Boolean | true/false variants | Normalize to true/false |
| Free Text | Unstructured | Trim whitespace only |
| Ambiguous | Mixed patterns | Ask user (interactive) |

---

## Cleaning Operations

### Always Applied
- Trim leading/trailing whitespace
- Normalize internal whitespace (multiple spaces → single)
- Remove empty rows (all fields null)
- Remove exact duplicate rows
- Fix encoding issues (→ UTF-8)
- Normalize unicode (composed forms, standard quotes)

### Per-Field (Based on Detection)
- **Names:** Title Case, nullify single chars/numeric
- **Emails:** Lowercase, nullify invalid patterns
- **Dates:** Convert to ISO 8601
- **Currency:** Standardize format, normalize decimals
- **Currency (Normalized):** Convert to `{amount} {ISO_CODE}` format
  - Handles k/K suffix ($85k → 85000)
  - Handles M suffix ($1.5M → 1500000)
  - Detects EU vs US format (65.000 vs 65,000)
  - Preserves ranges ($55k-$65k → 55000-65000 USD)
- **Phone (E.164):** Convert to `+{country}{number}` format
  - Uses country field to infer country code
  - Converts vanity numbers (1-800-FLOWERS → +18003569377)
  - Validates E.164 length (7-15 digits)
- **City:** LLM semantic normalization (NYC → New York)
- **Nulls:** Standardize (NULL, N/A, None, -, etc. → null)

### Optional (Interactive Mode)
- Fuzzy duplicate detection and removal
- Column header normalization (→ snake_case)
- Date locale disambiguation

---

## Dependencies

```bash
# Required
pip install polars chardet

# For Excel files
pip install openpyxl xlrd

# For fuzzy matching
pip install rapidfuzz

# For date parsing
pip install python-dateutil

# For phone number validation (optional but recommended)
pip install phonenumbers

# For XML
pip install lxml

# For YAML
pip install pyyaml
```

Or install all:

```bash
pip install polars chardet openpyxl xlrd rapidfuzz python-dateutil phonenumbers lxml pyyaml
```

---

## Interactive Config Options

When running in interactive mode, these options are available:

| Option | Values | Default | Description |
|--------|--------|---------|-------------|
| Phone format | `e164`, `national`, `preserve` | `e164` | E.164 normalizes to +country format |
| Currency format | `normalized`, `numeric`, `preserve` | `normalized` | Normalized outputs `{amount} {ISO_CODE}` |
| City normalization | `enabled`, `disabled` | `enabled` | LLM semantic deduplication |
| Date locale | `US`, `EU`, `ISO`, `auto` | `auto` | For ambiguous MM/DD vs DD/MM |

### Auto Mode Defaults

When using `--mode auto`, these defaults are applied without prompting:

| Setting | Auto Default | Behavior |
|---------|--------------|----------|
| Phone format | `e164` | All phones normalized to E.164 |
| Currency format | `normalized` | All currencies to `{amount} {ISO_CODE}` |
| City normalization | `enabled` | LLM semantic deduplication applied |
| Date locale | `auto` | Infer from unambiguous dates; if ambiguous, assume US |
| Fuzzy duplicates | `report-only` | Detected but not removed |
| Header normalization | `snake_case` | All headers converted |

---

## Combined Example

Single row transformation showing all v1.2+ features working together:

**Input row:**
```json
{
  "name": "john DOE",
  "phone": "1-800-FLOWERS",
  "salary": "$85k",
  "city": "NYC",
  "country": "USA",
  "hire_date": "03/15/2024"
}
```

**Output row:**
```json
{
  "name": "John Doe",
  "phone": "+18003569377",
  "salary": "85000 USD",
  "city": "New York",
  "country": "USA",
  "hire_date": "2024-03-15"
}
```

**What happened:**
| Field | Transformation | Method |
|-------|---------------|--------|
| name | Title case | Script |
| phone | E.164 + vanity conversion | Script (phonenumbers) |
| salary | k-suffix expansion + ISO code | Script |
| city | NYC → New York | LLM semantic |
| country | Unchanged (already canonical) | LLM semantic |
| hire_date | US locale → ISO 8601 | Script |

---

## Output Folder Structure

All outputs are organized in a dedicated cleaning folder to keep your source directory clean:

```
customers.csv                   # Your original file (untouched)
customers-cleaning/             # All cleaning artifacts
├── analysis.json               # Field analysis results
├── config.json                 # Cleaning configuration
├── mappings.json               # LLM-generated semantic mappings
├── customers-cleaned.csv       # Cleaned data
└── cleaning-report.md          # Detailed report of all changes
```

| File | Description |
|------|-------------|
| `analysis.json` | Field type detection, pattern analysis, unique values |
| `config.json` | User decisions and cleaning configuration |
| `mappings.json` | LLM-generated semantic normalization mappings |
| `new_values.json` | New values needing LLM analysis (incremental mode) |
| `unmapped_values.json` | Values not in mappings (queue mode) |
| `{name}-cleaned.{ext}` | Cleaned data in original format |
| `cleaning-report.md` | Detailed report with statistics and examples |

---

## Incremental Cleaning

**Critical feature for production pipelines:** When you get updated data, ensure output format stays consistent with previous cleaning runs.

### The Problem

```
Day 1: Clean 10,000 rows → LLM maps "NYC" → "New York"
Day 2: Get 12,000 rows (updated data with new cities like "CHI")
Goal: "NYC" must STILL map to "New York", and "CHI" needs LLM analysis
```

### The Solution

```
┌─────────────────────────────────────────────────────────────────┐
│ INCREMENTAL CLEANING WORKFLOW                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Run analysis → detects mappings.json exists                 │
│                    │                                             │
│                    ▼                                             │
│  2. Load existing mappings (NEVER modified)                     │
│                    │                                             │
│                    ▼                                             │
│  3. Find NEW values only (not in mappings)                      │
│                    │                                             │
│                    ▼                                             │
│  4. LLM analyzes ONLY new values → new_values.json              │
│                    │                                             │
│                    ▼                                             │
│  5. Merge new mappings (append-only, never overwrite)           │
│                    │                                             │
│                    ▼                                             │
│  6. Clean with updated mappings                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Reproducibility Guarantees

| Guarantee | Implementation |
|-----------|----------------|
| Same input → same output | mappings.json is source of truth |
| Existing mappings never change | Append-only merge strategy |
| New values don't break existing | New values use fallback mode |
| Efficient updates | Only new values sent to LLM |

### Unmapped Value Modes

When a value isn't in `mappings.json`, the cleaning script can:

| Mode | Behavior | Use Case |
|------|----------|----------|
| `preserve` | Keep original value (default) | Safe for incremental cleaning |
| `strict` | Return null | Production pipelines requiring mapped values |
| `null` | Set to null | When unmapped = invalid |
| `queue` | Track for later LLM analysis | Collect new values for batch processing |

### Example: Incremental Workflow

```bash
# Day 1: Initial cleaning
/data-cleaner customers.csv
# Creates: customers-cleaning/mappings.json

# Day 2: Updated data arrives
# Just run the same command - incremental mode auto-detects
/data-cleaner customers_updated.csv
# Output: "Incremental mode: Found existing mappings for 3 fields"
# Output: "New values for LLM: new_values.json (5 new values)"

# Mappings are automatically merged
# Existing mappings preserved, new mappings added
```

### Folder Structure (Incremental)

```
customers-cleaning/
├── mappings.json          # Source of truth (append-only)
├── new_values.json        # Delta for LLM analysis
├── unmapped_values.json   # Queue mode tracking (if used)
├── analysis.json          # Latest analysis
└── customers-cleaned.csv  # Output with consistent format
```

---

## Anti-Patterns

| Avoid | Why | Instead |
|-------|-----|---------|
| Loading data into LLM | Context limits, slow, privacy | Generate scripts |
| Overwriting original | Data loss risk | Always use `-cleaned` suffix |
| Silent transformations | Can't verify correctness | Detailed report |
| Auto fuzzy duplicate removal | High false positive risk | Report only, user decides |
| Assuming date locale | 01/02/03 is ambiguous | Ask user or document assumption |

---

## Limitations

| Limitation | Workaround |
|------------|------------|
| Western name bias | CJK/Arabic names: treat as free text |
| Excel formulas | Evaluated to values; originals lost |
| Password-protected files | Provide password when prompted |
| Relational integrity | FK relationships not checked; user responsible |
| Memory for huge files | Use `--chunk-size N` for streaming |

---

## Example Report

```markdown
# Data Cleaning Report

## Summary
- Input: customers.xlsx
- Output: customers-cleaned.xlsx
- Rows: 150,000 → 148,753 (-1,247)
- Fields: 12

## Changes by Field

### customer_name (Person Name, 94% confidence)
- 4,521 normalized to Title Case
- 89 nullified (single char or numeric)
- Nullified examples: "X", "123", "A"

### email (Email, 99% confidence)
- 45,000 lowercased
- 234 nullified (invalid format)

### order_date (Date, 87% confidence)
- Locale detected: US (MM/DD/YYYY)
- All converted to ISO 8601
- 12 unparseable → nullified

## Duplicates
- Exact removed: 1,200
- Fuzzy detected: 47 pairs (not removed)

## Encoding
- Detected: Windows-1252
- Converted: UTF-8
- Characters fixed: 847
```

---

<details>
<summary><strong>Deep Dive: Analysis Script</strong></summary>

The analysis script samples data intelligently and returns structured summaries:

```python
# Generated analysis script structure
import polars as pl
import json
from pathlib import Path

def analyze_field(df: pl.DataFrame, field: str) -> dict:
    """Analyze a single field for type detection."""
    col = df[field]
    total = len(col)
    null_count = col.null_count()

    # Sample for pattern analysis (not just first N)
    sample = col.drop_nulls().sample(min(1000, len(col)))

    patterns = detect_patterns(sample)
    anomalies = find_anomalies(sample, patterns)

    return {
        "field": field,
        "total_values": total,
        "null_count": null_count,
        "unique_count": col.n_unique(),
        "pattern_analysis": patterns,
        "sample_anomalies": anomalies[:10],
        "suggested_type": infer_type(patterns),
        "confidence": calculate_confidence(patterns)
    }
```

### Pattern Detection

```python
PATTERNS = {
    "email": r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$",
    "date_us": r"^\d{1,2}/\d{1,2}/\d{2,4}$",
    "date_eu": r"^\d{1,2}-\d{1,2}-\d{2,4}$",
    "date_iso": r"^\d{4}-\d{2}-\d{2}",
    "phone": r"^[\d\s\-\(\)\+]+$",
    "url": r"^https?://",
    "currency": r"^[$€£¥]?\s*[\d,\.]+\s*[$€£¥]?$",
    "two_word_name": r"^[A-Za-z]+\s+[A-Za-z]+",
}
```

### Output Format

```json
{
  "file": "customers.csv",
  "encoding": "utf-8",
  "rows": 150000,
  "fields": [
    {
      "field": "customer_name",
      "suggested_type": "person_name",
      "confidence": 0.94,
      "pattern_analysis": {
        "two_words_alpha": 0.89,
        "single_word": 0.06,
        "contains_numbers": 0.02,
        "single_char": 0.01,
        "empty": 0.02
      },
      "sample_anomalies": ["J", "123", "A1B2"]
    }
  ]
}
```

</details>

<details>
<summary><strong>Deep Dive: Cleaning Script</strong></summary>

The cleaning script applies transformations based on analysis and user decisions:

```python
import polars as pl
from pathlib import Path

def clean_dataset(input_path: str, config: dict) -> tuple[pl.DataFrame, dict]:
    """
    Clean dataset according to configuration.
    Returns cleaned DataFrame and statistics.
    """
    stats = {"changes": {}, "removed": {"duplicates": 0, "empty": 0}}

    # Load with detected encoding
    df = load_with_encoding(input_path, config["encoding"])
    original_rows = len(df)

    # Apply field-specific cleaning
    for field_config in config["fields"]:
        field = field_config["name"]
        field_type = field_config["type"]

        if field_type == "person_name":
            df, field_stats = clean_person_name(df, field)
        elif field_type == "email":
            df, field_stats = clean_email(df, field)
        elif field_type == "date":
            df, field_stats = clean_date(df, field, field_config["locale"])
        # ... other types

        stats["changes"][field] = field_stats

    # Remove exact duplicates
    df_deduped = df.unique()
    stats["removed"]["duplicates"] = len(df) - len(df_deduped)
    df = df_deduped

    # Remove empty rows
    df_clean = df.filter(~pl.all_horizontal(pl.all().is_null()))
    stats["removed"]["empty"] = len(df) - len(df_clean)

    return df_clean, stats
```

### Field Cleaners

```python
def clean_person_name(df: pl.DataFrame, field: str) -> tuple[pl.DataFrame, dict]:
    """Normalize person names to Title Case, nullify garbage."""
    stats = {"title_cased": 0, "nullified": 0, "nullified_examples": []}

    def normalize(value):
        if value is None:
            return None
        v = str(value).strip()
        # Nullify: single char, numeric, symbols
        if len(v) <= 1 or v.isdigit() or not any(c.isalpha() for c in v):
            return None
        # Title case with special handling
        return smart_title_case(v)

    df = df.with_columns(
        pl.col(field).map_elements(normalize, return_dtype=pl.Utf8)
    )
    return df, stats

def clean_email(df: pl.DataFrame, field: str) -> tuple[pl.DataFrame, dict]:
    """Lowercase emails, nullify invalid."""
    import re
    email_pattern = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")

    def normalize(value):
        if value is None:
            return None
        v = str(value).strip().lower()
        if not email_pattern.match(v):
            return None
        return v

    df = df.with_columns(
        pl.col(field).map_elements(normalize, return_dtype=pl.Utf8)
    )
    return df, stats
```

</details>

<details>
<summary><strong>Deep Dive: Null Detection</strong></summary>

### Null-Like Values

```python
NULL_VALUES = {
    "",           # Empty string
    "null",       # SQL null
    "none",       # Python None
    "nil",        # Ruby/Go nil
    "n/a",        # Not applicable
    "na",         # Abbreviated
    "-",          # Dash placeholder
    "--",         # Double dash
    ".",          # Period placeholder
    "nan",        # Not a number
    "#n/a",       # Excel error
    "#ref!",      # Excel error
    "#value!",    # Excel error
}

def is_null_like(value: str) -> bool:
    """Check if value represents null."""
    if value is None:
        return True
    v = str(value).strip().lower()
    return v in NULL_VALUES
```

### Context-Aware Handling

In interactive mode, flag suspicious cases:

```
Field 'username' contains literal value "null" in 1 row.
All other 49,999 values are valid usernames.

Is this:
1. An actual null value (convert to empty)
2. A legitimate username (preserve as "null")
```

</details>

<details>
<summary><strong>Deep Dive: Date Locale Detection</strong></summary>

### Ambiguity Detection

```python
def detect_date_locale(values: list[str]) -> tuple[str, float]:
    """
    Detect date locale from sample values.
    Returns (locale, confidence).
    """
    us_count = 0  # MM/DD/YYYY
    eu_count = 0  # DD/MM/YYYY
    ambiguous = 0

    for v in values:
        parts = parse_date_parts(v)
        if parts is None:
            continue

        first, second, year = parts

        if first > 12:  # Must be day
            eu_count += 1
        elif second > 12:  # Must be day
            us_count += 1
        else:  # Ambiguous (both <= 12)
            ambiguous += 1

    total = us_count + eu_count + ambiguous
    if total == 0:
        return "unknown", 0.0

    if us_count > eu_count:
        return "US", us_count / total
    elif eu_count > us_count:
        return "EU", eu_count / total
    else:
        return "ambiguous", 0.5
```

### Resolution

**Interactive mode:**
```
Date field 'order_date' has ambiguous locale.

Sample values:
  - 01/02/2024 (Jan 2 or Feb 1?)
  - 03/04/2024 (Mar 4 or Apr 3?)

Detected pattern: 60% could be US, 60% could be EU

Please select:
1. US format (MM/DD/YYYY)
2. EU format (DD/MM/YYYY)
3. ISO format (already YYYY-MM-DD)
```

**Autonomous mode:** Use majority unambiguous pattern, document assumption.

</details>

<details>
<summary><strong>Deep Dive: Fuzzy Duplicate Detection</strong></summary>

### Similarity Scoring

```python
from rapidfuzz import fuzz
import polars as pl

def find_fuzzy_duplicates(
    df: pl.DataFrame,
    threshold: float = 0.85,
    key_fields: list[str] = None
) -> list[dict]:
    """
    Find rows that are similar but not exact matches.
    Returns list of duplicate pairs with similarity scores.
    """
    if key_fields is None:
        key_fields = df.columns

    duplicates = []
    rows = df.to_dicts()

    for i, row_a in enumerate(rows):
        for j, row_b in enumerate(rows[i+1:], i+1):
            similarity = calculate_row_similarity(row_a, row_b, key_fields)
            if similarity >= threshold and similarity < 1.0:
                diff = find_differences(row_a, row_b)
                duplicates.append({
                    "row_a": i,
                    "row_b": j,
                    "similarity": similarity,
                    "differences": diff
                })

    return duplicates

def calculate_row_similarity(row_a: dict, row_b: dict, fields: list[str]) -> float:
    """Calculate overall similarity between two rows."""
    scores = []
    for field in fields:
        a_val = str(row_a.get(field, ""))
        b_val = str(row_b.get(field, ""))
        scores.append(fuzz.ratio(a_val, b_val) / 100)
    return sum(scores) / len(scores)
```

### Performance Optimization

For large datasets, use blocking/indexing:

```python
def blocked_duplicate_detection(df: pl.DataFrame, block_key: str):
    """
    Group by blocking key to reduce comparisons.
    E.g., block on first 3 chars of name.
    """
    blocks = df.group_by(
        pl.col(block_key).str.slice(0, 3)
    )

    duplicates = []
    for block_name, block_df in blocks:
        # Only compare within block
        block_dups = find_fuzzy_duplicates(block_df)
        duplicates.extend(block_dups)

    return duplicates
```

</details>

<details>
<summary><strong>Deep Dive: Format Adapters</strong></summary>

### Adapter Interface

```python
from abc import ABC, abstractmethod
from pathlib import Path
import polars as pl

class FormatAdapter(ABC):
    """Base class for format-specific adapters."""

    @abstractmethod
    def load(self, path: Path, encoding: str = "utf-8") -> pl.DataFrame:
        """Load file into DataFrame."""
        pass

    @abstractmethod
    def save(self, df: pl.DataFrame, path: Path, metadata: dict = None):
        """Save DataFrame to file."""
        pass

    @abstractmethod
    def extract_metadata(self, path: Path) -> dict:
        """Extract format-specific metadata."""
        pass
```

### Excel Adapter

```python
class ExcelAdapter(FormatAdapter):
    def load(self, path: Path, encoding: str = "utf-8") -> pl.DataFrame:
        return pl.read_excel(path)

    def save(self, df: pl.DataFrame, path: Path, metadata: dict = None):
        df.write_excel(path)
        if metadata and metadata.get("preserve_formatting"):
            self._apply_formatting(path, metadata["formatting"])

    def extract_metadata(self, path: Path) -> dict:
        import openpyxl
        wb = openpyxl.load_workbook(path)
        return {
            "sheets": wb.sheetnames,
            "has_formulas": self._detect_formulas(wb),
            "formatting": self._extract_formatting(wb)
        }
```

### JSON/XML/YAML Adapters

For hierarchical formats, clean leaf values in-place:

```python
class JSONAdapter(FormatAdapter):
    def load(self, path: Path, encoding: str = "utf-8") -> dict:
        import json
        with open(path, encoding=encoding) as f:
            return json.load(f)

    def clean_structure(self, data: dict, config: dict) -> dict:
        """Recursively clean leaf values."""
        if isinstance(data, dict):
            return {k: self.clean_structure(v, config) for k, v in data.items()}
        elif isinstance(data, list):
            return [self.clean_structure(item, config) for item in data]
        else:
            return self.clean_leaf_value(data, config)

    def clean_leaf_value(self, value, config: dict):
        """Apply cleaning rules to leaf value."""
        if value is None:
            return None
        if isinstance(value, str):
            return value.strip()  # Basic cleaning
        return value
```

</details>

---

## Extension Points

1. **New Format Adapters:** Add adapters for Arrow IPC, ORC, Avro, etc.
2. **Custom Field Detectors:** Register new pattern types beyond built-in 12
3. **Cleaning Plugins:** Add domain-specific cleaners (medical codes, SKUs, etc.)
4. **Output Formats:** Generate SQL INSERT statements, API payloads, etc.

---

## Related Skills

| Skill | Relationship |
|-------|--------------|
| project-indexer | Can index cleaned datasets |
| skillcreator | Created this skill |

---

## Changelog

### v1.4.0
- **Incremental cleaning mode**: Reproducible cleaning for updated data
  - Auto-detects existing `mappings.json` in cleaning folder
  - Identifies only NEW values needing LLM analysis
  - Append-only mapping merge (existing mappings NEVER modified)
  - Guarantees: same input + same mappings = same output
- **Unmapped value handling**: Configurable fallback modes
  - `preserve`: Keep original value (default, safest)
  - `strict`: Return null for production pipelines
  - `null`: Set unmapped to null
  - `queue`: Track for later batch LLM processing
- **New output files**:
  - `new_values.json`: Delta values for incremental LLM analysis
  - `unmapped_values.json`: Queue of values encountered during cleaning
- **Enhanced reporting**: Unmapped value statistics in cleaning report
- **Merge logic**: `merge_mappings_file()` for safe incremental updates

### v1.3.0
- **Cleaning folder structure**: All outputs in `{filename}-cleaning/` folder
  - Keeps source directory clean
  - Organizes analysis, config, mappings, cleaned data, and reports together
  - Scripts automatically create and use the cleaning folder
- **Enhanced phone validation**: Uses `phonenumbers` library when available
  - Falls back to regex validation if library not installed
  - More robust international number validation
- **Combined example**: Single row transformation showing all features
- **Auto mode defaults**: Documented explicit defaults for autonomous mode
- **Panel recommendations**: Implemented feedback from synthesis panel review

### v1.2.0
- **Phone E.164 normalization**: Convert to `+{country}{number}` format
  - Uses country field to infer country code when missing
  - Converts vanity numbers (1-800-FLOWERS → +18003569377)
  - Validates E.164 length (7-15 digits)
- **Currency normalization**: Convert to `{amount} {ISO_CODE}` format
  - Handles k/K suffix ($85k → 85000 USD)
  - Handles M suffix ($1.5M → 1500000 USD)
  - Detects EU vs US format (65.000 vs 65,000)
  - Preserves ranges ($55k-$65k → 55000-65000 USD)
  - Currency context from country field ($→MXN if country=Mexico)
- **City semantic normalization**: LLM-based deduplication
  - Abbreviations: NYC, NY → New York
  - Short forms: LA, SF, DC → full names
  - Keeps ambiguous values unchanged (Springfield)
- Interactive config options for phone/currency/city/date formats
- New prompt template: City Semantic Normalization
- Added phonenumbers to optional dependencies

### v1.1.0
- **Hybrid Script-LLM architecture**: LLM for semantic understanding, scripts for volume
- LLM only receives unique values (1M rows → 6 values if 6 unique)
- Semantic normalization: USA/US/United States → detected as same
- Complex currency parsing: $85k, 52 000 €, ranges
- Non-standard date parsing: Japanese, Arabic numerals
- Typo detection in categorical fields
- Format preservation: outputs match dominant format in data
- New reference: `references/llm-prompts.md`

### v1.0.0
- Initial release
- Support for CSV, TSV, Excel, Parquet, JSON, XML, YAML
- 12 field type detectors
- Interactive and autonomous modes
- Detailed cleaning reports
