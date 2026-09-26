## API Reference

### GraphQL Analytics API

**Endpoint**: `https://api.cloudflare.com/client/v4/graphql`

**Query Workers Metrics**:
```graphql
query {
  viewer {
    accounts(filter: { accountTag: $accountId }) {
      workersInvocationsAdaptive(
        limit: 100
        filter: {
          datetime_geq: "2025-01-01T00:00:00Z"
          datetime_leq: "2025-01-31T23:59:59Z"
          scriptName: "my-worker"
        }
      ) {
        sum {
          requests
          errors
          subrequests
        }
        quantiles {
          cpuTimeP50
          cpuTimeP99
          wallTimeP50
          wallTimeP99
        }
      }
    }
  }
}
```

### Analytics Engine SQL API

**Endpoint**: `https://api.cloudflare.com/client/v4/accounts/{account_id}/analytics_engine/sql`

**Authentication**: `Authorization: Bearer <API_TOKEN>` (Account Analytics Read permission)

**Common Queries**:

```sql
-- List all datasets
SHOW TABLES;

-- Time-series aggregation (5-minute buckets)
SELECT
  intDiv(toUInt32(timestamp), 300) * 300 AS time_bucket,
  blob1 AS endpoint,
  SUM(_sample_interval) AS total_requests,
  AVG(double1) AS avg_response_time_ms
FROM api_metrics
WHERE timestamp >= NOW() - INTERVAL '24' HOUR
GROUP BY time_bucket, endpoint
ORDER BY time_bucket DESC;

-- Top customers by usage
SELECT
  index1 AS customer_id,
  SUM(_sample_interval * double1) AS total_api_calls,
  AVG(double2) AS avg_response_time_ms
FROM api_usage
WHERE timestamp >= NOW() - INTERVAL '7' DAY
GROUP BY customer_id
ORDER BY total_api_calls DESC
LIMIT 100;

-- Error rate analysis
SELECT
  blob1 AS error_type,
  COUNT(*) AS occurrences,
  MAX(timestamp) AS last_seen
FROM error_tracking
WHERE timestamp >= NOW() - INTERVAL '1' HOUR
GROUP BY error_type
ORDER BY occurrences DESC;
```

### Console Logging API

**Methods**:
```typescript
// Standard methods (all appear in Workers Logs)
console.log('info message');
console.info('info message');
console.warn('warning message');
console.error('error message');
console.debug('debug message');

// Structured logging (recommended)
console.log({
  level: 'info',
  user_id: '123',
  action: 'checkout',
  amount: 99.99,
  currency: 'USD'
});
```

**Log Levels**: All console methods produce logs; use structured fields for filtering:
```typescript
console.log({
  level: 'error',
  message: 'Payment failed',
  error_code: 'CARD_DECLINED'
});
```

### Analytics Engine Binding Types

```typescript
interface AnalyticsEngineDataset {
  writeDataPoint(event: AnalyticsEngineDataPoint): void;
}

interface AnalyticsEngineDataPoint {
  // Indexed strings (use for filtering/grouping)
  indexes?: string[];

  // Non-indexed strings (metadata, IDs, URLs)
  blobs?: string[];

  // Numeric values (counts, durations, amounts)
  doubles?: number[];
}
```

**Field Limits**:
- Max 20 indexes
- Max 20 blobs
- Max 20 doubles
- Max 25 `writeDataPoint` calls per request

### Tail Consumer Event Type

```typescript
interface TraceItem {
  event: TraceEvent;
  logs: TraceLog[];
  exceptions: TraceException[];
  scriptName?: string;
}

interface TraceEvent {
  outcome: 'ok' | 'exception' | 'exceededCpu' | 'exceededMemory' | 'unknown';
  cpuTime: number; // microseconds
  wallTime: number; // microseconds
}

interface TraceLog {
  timestamp: number;
  level: 'log' | 'info' | 'debug' | 'warn' | 'error';
  message: any; // string or structured object
}

interface TraceException {
  name: string;
  message: string;
  timestamp: number;
}
```results` instead)
- `engine` — engine metadata

### Progress fields by resource

| Resource | Progress fields |
|---|---|
| `predictions:structure-and-binding` | `status`; no per-item progress |
| `predictions:adme` | `status`; results in `output.molecules[]` on success (no per-item progress) |
| `small-molecule:library-screen` | `num_molecules_screened`, `num_molecules_failed`, `total_molecules_to_screen`, optional `rejection_summary` |
| `small-molecule:design` | `num_molecules_generated`, `total_molecules_to_generate` |
| `protein:library-screen` | `num_proteins_screened`, `num_proteins_failed`, `total_proteins_to_screen` |
| `protein:design` | `num_proteins_generated`, `total_proteins_to_generate` |

### Route from the ID prefix when possible

```bash
# Pick the resource from the ID prefix above, then run one concrete command.
boltz-api protein:design retrieve --id "<job-id>" --format json

# If the prefix is unknown, probe explicitly one command at a time until one succeeds.
boltz-api predictions:structure-and-binding retrieve --id "<job-id>" --format json
boltz-api predictions:adme retrieve --id "<job-id>" --format json
boltz-api small-molecule:library-screen retrieve --id "<job-id>" --format json
boltz-api small-molecule:design retrieve --id "<job-id>" --format json
boltz-api protein:library-screen retrieve --id "<job-id>" --format json
boltz-api protein:design retrieve --id "<job-id>" --format json
```

### `predictions:structure-and-binding` 400 quirk

Failed SAB jobs may expose only:

```json
{"code": "VALIDATION_ERROR", "message": "Request validation failed"}
```

with no `details`. The other endpoints include field paths. If you see the bare message, inspect the `input.entities` and `input.constraints` by hand.

## `list-results` mode (pipeline endpoints only)

Applies to the four pipeline resources (not SAB or ADME, which return their full `output` on `retrieve`):

```bash
boltz-api <resource> list-results --id "<job-id>" --limit 100
```

Each row:

- `id` — server-assigned `pres_*` result ID
- `external_id` — client-supplied `id` from the original `molecules[]` / `proteins[]` entry
- `smiles` (SM) or `entities` (protein)
- `metrics.*` — same fields documented in each start-family skill's `references/api.md`
- `artifacts.structure.url`, `artifacts.archive.url` — presigned, short-lived; refetch via re-`retrieve` or re-`list-results` if expired
- `warnings` — any per-item server warnings

Pagination:

- `--limit N` — per-page size. CLI auto-paginates, streaming records one per object.
- `--after-id <pres_*>` / `--before-id <pres_*>` — cursor.
- The CLI emits one JSON record per object (no `{data:[]}` wrapper); `--transform` applies per-row. Pipe through `head -N` to cap total.

## `download-status` mode

Use `download-status` when you want the local checkpoint only, without making an API call:

```bash
boltz-api --format json download-status --name "<run-name>" --root-dir "<output-root>"
```

Selectors:

- `--name <slug>` — look up `<output-root>/<run-name>/`
- `--run-dir <path>` — inspect an explicit run directory
- `--name` and `--run-dir` are mutually exclusive
- `--root-dir` cannot be used with `--run-dir`

Structured fields include:

- `run_dir`, `name`, `run_type`, `run_id`
- `status`, `phase`, `ready`
- `pending_kind`, `pending_count`, `pending_after_id`, `pending_page_last_id`, `pending_result_ids`
- `cursor_after_id`, `latest_result_id`
- `started_at`, `completed_at`, `stopped_at`, `error_code`

## `download-results` resume semantics

```bash
# Launch this command in the agent runtime's background/non-blocking mode.
# Claude Code: Bash with run_in_background=true.
# Codex: foreground shell command with yield_time_ms=1000; keep the returned session_id if one is provided.
# Do not append "&" or use nohup in Codex.
boltz-api download-results \
  --id "<job-id>" --name "<run-name>" \
  --root-dir "<output-root>" \
  --poll-interval-seconds 30
```

Behavior:

- `download-results` itself is a blocking poller. Launch it through the agent runtime's background/non-blocking command facility. In Claude Code, use Bash with `run_in_background: true`. In Codex, run it as a foreground shell command with `yield_time_ms=1000`; if Codex returns a session id, save it for optional same-thread polling, but treat `download-status` plus the run directory as the durable source of truth. In Codex app/desktop runtimes with same-thread heartbeat automation support, schedule a heartbeat that checks `download-status` periodically, posts only material status changes or terminal completion/failure, and stops once terminal. If the current host has no heartbeat automation support, do not claim an automatic next check; report the job ID, run name, output directory, and `download-status` command instead.
- It emits machine-readable JSONL progress events on stderr by default. Use `--progress-format text --verbose` only when you explicitly want human-readable logs.
- Writes `<output-root>/<run-name>/.boltz-run.json` containing the cursor (`cursor_after_id`), status, idempotency key, and timing.
- On re-run with the same `--root-dir` + `--name`, reuses `.boltz-run.json` and only pulls results past the recorded cursor. Idempotent.
- If the run dir exists and `.boltz-run.json` has the ID, `--id` can be omitted.
- If `--name` is not passed, the CLI generates a randomly named dir — use `--name` for cross-session resume.
- Do not use shell `&`, terminal backgrounding, or `nohup` as the Codex detach mechanism. Codex may clean up shell-backgrounded descendants when the tool command exits, before `.boltz-run.json` is fully written. Prefer the managed foreground session with a short yield, or recover later by re-running `download-results` with the same ID/name/root.

### Directory layout

```
<output-root>/<run-name>/
├── .boltz-run.json                       # cursor, status, idem key, timing
├── outputs/                              # SAB only
│   └── archive.tar.gz                    # unpacks to prediction/{metrics.json, *.cif, *.pae.npz}
└── results/                              # screens and designs only
    ├── pres_55p3z0ew50xt7uitsMnU/
    │   ├── archive.tar.gz
    │   └── files/result/
    │       ├── metrics.json
    │       ├── <pres_*>_predicted.cif
    │       └── pae.npz
    └── pres_...                           # one dir per per-item result, keyed by server ID
```

## Common recovery recipes

### "My session died during the download — same slug available"

```bash
# just re-run; CLI reads .boltz-run.json and resumes
boltz-api download-results \
  --id "<job-id>" --name "<run-name>" \
  --root-dir "<output-root>"
```

### "My session died — I only have the job ID"

```bash
# 1. Use the ID prefix to pick one retrieve endpoint and get idempotency_key.
boltz-api protein:design retrieve --id "<job-id>" --format json

# 2. Resume with the recovered idempotency_key as the run name.
# If idempotency_key is empty, pick a fresh recovery slug.
boltz-api download-results \
  --id "<job-id>" --name "<run-name-or-recovery-slug>" \
  --root-dir "<output-root>"
```

## Escape hatch

- Python SDK reference: <https://api.boltz.bio/docs/api/python>
- `boltz-api <resource> list --help` / `retrieve --help` / `boltz-api download-results --help` / `boltz-api download-status --help`
ured.

```javascript
const icon = instance.findInstance('Icon')

if (icon && icon.type === 'INSTANCE' && icon.hasCodeConnect()) {
  const iconCode = icon.executeTemplate().example
} else {
  // Fallback when no Code Connect
  const iconCode = figma.code`<Icon />`
}
```

#### `codeConnectId(): string | null`

Returns the Code Connect ID of the instance.

```javascript
const id = instance.codeConnectId()
// Returns the 'id' from the template's export
```

### Nested Component Patterns

#### Simple Nested Component

```javascript
const figma = require('figma')
const instance = figma.selectedInstance

const label = instance.getString('Label')
const icon = instance.findInstance('Icon')

export default {
  example: figma.code`
    <Button
      label="${label}"
      ${icon ? figma.code`icon={${icon.executeTemplate().example}}` : ''}
    />
  `,
  id: 'button-with-icon'
}
```

#### Multiple Nested Components

```javascript
const buttons = instance.findConnectedInstances(node => {
  return node.codeConnectId() === 'button'
})

const buttonElements = buttons.map(btn => btn.executeTemplate().example)

export default {
  example: figma.code`
    <ButtonGroup>
      ${buttonElements.join('\n')}
    </ButtonGroup>
  `
}
```

#### Nested with Metadata

```javascript
// Child component
export default {
  example: figma.code`<Icon name="${name}" />`,
  id: 'icon',
  metadata: {
    nestable: true,
    props: { iconName: name }
  }
}

// Parent component
const icon = instance.findConnectedInstance('icon')
if (icon) {
  const result = icon.executeTemplate()
  const iconName = result.metadata.props.iconName
  // Use iconName in parent logic
}
```

#### Children Pattern

```javascript
const children = figma.properties.children(['Card', 'Button'])

export default {
  example: figma.code`
    <Container>
      ${children.map(child => child.executeTemplate().example).join('\n')}
    </Container>
  `,
  id: 'container'
}
```

---

## Publishing and Management

### Installation

```bash
npm install --global @figma/code-connect@latest
```

### Publishing Code Connect Files

Publish all templates to make them visible in Figma Dev Mode:

```bash
npx figma connect publish --token=YOUR_ACCESS_TOKEN
```

**Using environment variable:**
```bash
export FIGMA_ACCESS_TOKEN=your_token_here
npx figma connect publish
```

**With custom config:**
```bash
npx figma connect publish --config path/to/figma.config.json
```

### Unpublishing

**Unpublish all files in config:**
```bash
npx figma connect unpublish
```

**Unpublish specific component:**
```bash
npx figma connect unpublish --node=https://figma.com/file/abc/File?node-id=123-456 --label=React
```

### Migration from Old Format

Convert existing Code Connect files to template format:

```bash
npx figma connect migrate --outDir ./templates
```

**Test migrations:**
1. Set temporary label in `figma.config.json`
2. Publish to test: `npx figma connect publish`
3. Verify in Figma
4. Unpublish when done: `npx figma connect unpublish`

### CLI Help

```bash
npx figma connect --help
npx figma connect publish --help
npx figma connect unpublish --help
```

---

## Type Reference

### SelectorOptions

```typescript
interface SelectorOptions {
  /** Full path of parent layer names to match */
  path?: string[]

  /** Whether to search inside nested component instances */
  traverseInstances?: boolean
}
```

**Example:**
```javascript
// Find icon only in specific hierarchy
const icon = instance.findInstance('Icon', {
  path: ['Header', 'Actions', 'IconSlot']
})

// Search everywhere including nested instances
const anyIcon = instance.findInstance('Icon', {
  traverseInstances: true
})
```

### Metadata

```typescript
interface Metadata {
  /**
   * Controls display in Code Connect panel:
   * - true: Shows code inline with parent
   * - false: Shows as expandable pill
   */
  nestable?: boolean

  /** Custom data accessible to parent templates */
  props?: Record<string, any>
}
```

> **Important:** `nestable` must be set in **two places** for nested templates to work correctly:
> 1. **`templateDataJson`** when calling `add_code_connect_map` — e.g. `'{"isParserless": true, "nestable": true}'`. This controls whether the child template is loaded into the parent's evaluation context. If missing, the parent cannot find or execute the child via `findConnectedInstance`, `findConnectedInstances`, or `hasCodeConnect()`.
> 2. **`metadata.nestable`** in the template's `export default` — controls the runtime rendering behavior (inline code vs. clickable pill).

### ResultSection Types

```typescript
type CodeSection = {
  type: "CODE"
  code: string
}

type InstanceSection = {
  type: "INSTANCE"
  guid: string      // Instance layer ID
  symbolId: string  // Component ID
}

type ErrorSection = {
  type: "ERROR"
  message: string
  errorObject?: ResultError
}

type ResultSection = CodeSection | InstanceSection | ErrorSection
```

### Template Result

```typescript
type SectionsResult = {
  result: "SUCCESS"
  data: {
    type: "SECTIONS"
    sections: ResultSection[]
    language: string
    metadata?: {
      __props: Record<string, any>
      [key: string]: any
    }
  }
}
```

### Error Types

```typescript
type PropertyNotFoundError = {
  type: "PROPERTY_NOT_FOUND"
  propertyName: string
}

type ChildLayerNotFoundError = {
  type: "CHILD_LAYER_NOT_FOUND"
  layerName: string
}

type PropertyTypeMismatchError = {
  type: "PROPERTY_TYPE_MISMATCH"
  propertyName: string
  expectedType: string
}

type TemplateExecutionError = {
  type: "TEMPLATE_EXECUTION_ERROR"
}

type ResultError =
  | PropertyNotFoundError
  | PropertyTypeMismatchError
  | ChildLayerNotFoundError
  | TemplateExecutionError
```

---

## Complete Examples

### Button with States

```javascript
// url=https://www.figma.com/file/abc/Components?node-id=1-2
// source=src/components/Button.tsx
// component=Button

const figma = require('figma')
const instance = figma.selectedInstance

const label = instance.getString('Label')
const variant = instance.getEnum('Variant', {
  Primary: 'primary',
  Secondary: 'secondary',
  Tertiary: 'tertiary'
})
const size = instance.getEnum('Size', {
  Small: 'sm',
  Medium: 'md',
  Large: 'lg'
})
const disabled = instance.getBoolean('Has Disabled State')
const hasIcon = instance.getBoolean('Has Icon')
const icon = hasIcon ? instance.getInstanceSwap('Icon') : null

export default {
  example: figma.tsx`
    <Button
      variant="${variant}"
      size="${size}"
      ${disabled ? 'disabled' : ''}
      ${icon ? figma.tsx`icon={${icon.executeTemplate().example}}` : ''}
    >
      ${label}
    </Button>
  `,
  imports: ['import { Button } from "@/components/Button"'],
  id: 'button',
  metadata: {
    nestable: true
  }
}
```

### Card with Children

```javascript
// url=https://www.figma.com/file/abc/Components?node-id=10-20
// source=src/components/Card.tsx
// component=Card

const figma = require('figma')
const instance = figma.selectedInstance

const heading = instance.findText('Heading')
const body = instance.findText('Body')
const actions = figma.properties.children(['Button'])
const variant = instance.getEnum('Variant', {
  Elevated: 'elevated',
  Outlined: 'outlined',
  Filled: 'filled'
})

export default {
  example: figma.tsx`
    <Card variant="${variant}">
      <Card.Header>
        ${heading.textContent}
      </Card.Header>
      <Card.Body>
        ${body.textContent}
      </Card.Body>
      <Card.Actions>
        ${actions.map(action => action.executeTemplate().example).join('\n')}
      </Card.Actions>
    </Card>
  `,
  imports: ['import { Card } from "@/components/Card"'],
  id: 'card',
  metadata: {
    nestable: false
  }
}
```

### Form Field with Validation

```javascript
// url=https://www.figma.com/file/abc/Components?node-id=30-40
// source=src/components/TextField.tsx
// component=TextField

const figma = require('figma')
const instance = figma.selectedInstance

const label = instance.getString('Label')
const placeholder = instance.getString('Placeholder')
const helperText = instance.findText('Helper Text')
const errorState = instance.getEnum('State', {
  Default: false,
  Error: true
})
const required = instance.getBoolean('Required')
const disabled = instance.getBoolean('Disabled')

export default {
  example: figma.tsx`
    <TextField
      label="${label}"
      placeholder="${placeholder}"
      ${helperText ? `helperText="${helperText.textContent}"` : ''}
      ${errorState ? 'error' : ''}
      ${required ? 'required' : ''}
      ${disabled ? 'disabled' : ''}
    />
  `,
  imports: ['import { TextField } from "@/components/TextField"'],
  id: 'text-field'
}
```

### Navigation with Dynamic Items

```javascript
// url=https://www.figma.com/file/abc/Components?node-id=50-60
// source=src/components/Navigation.tsx
// component=Navigation

const figma = require('figma')
const instance = figma.selectedInstance

const items = instance.findConnectedInstances(node => {
  return node.codeConnectId() === 'nav-item'
})

const direction = instance.getEnum('Direction', {
  Horizontal: 'horizontal',
  Vertical: 'vertical'
})

export default {
  example: figma.tsx`
    <Navigation direction="${direction}">
      ${items.map(item => item.executeTemplate().example).join('\n')}
    </Navigation>
  `,
  imports: ['import { Navigation } from "@/components/Navigation"'],
  id: 'navigation',
  metadata: {
    nestable: false
  }
}
```

---

## Best Practices

### 1. Use Descriptive IDs

```javascript
// Good - clear and descriptive
export default {
  id: 'primary-button',
  // ...
}

// Avoid - too generic
export default {
  id: 'btn',
  // ...
}
```

### 2. Handle Missing Properties Gracefully

```javascript
// Good - check type before calling hasCodeConnect
const icon = instance.findInstance('Icon')
const iconCode = icon && icon.type === 'INSTANCE' && icon.hasCodeConnect()
  ? icon.executeTemplate().example
  : null

// Avoid - assumes icon exists
const iconCode = instance.findInstance('Icon').executeTemplate().example
```

### 3. Use Appropriate Tagged Templates

```javascript
// Good - use specific template for language
const example = figma.tsx`<Button />`

// Avoid - generic when specific is available
const example = figma.code`<Button />`
```

### 4. Keep Templates Focused

```javascript
// Good - one component per file
export default {
  example: figma.tsx`<Button {...props} />`,
  id: 'button'
}

// Avoid - multiple components in one template
export default {
  example: figma.tsx`
    <Button />
    <Input />
    <Select />
  `
}
```

### 5. Use Metadata Appropriately

```javascript
// Good - small inline components
export default {
  id: 'icon',
  metadata: { nestable: true }
}
// Also set in templateDataJson when registering: {"isParserless": true, "nestable": true}

// Good - complex components as pills
export default {
  id: 'modal',
  metadata: { nestable: false }
}
```

**Note:** If using `add_code_connect_map`, `nestable` must also be set in `templateDataJson` for the child to be discoverable by parent templates. Setting `metadata: { nestable: true }` in the template alone is not sufficient — the stored `templateData.nestable` controls whether the child is loaded into `instanceTemplates`.

---

## Troubleshooting

### Property Not Found

**Error:** `Property "Label" not found`

**Solution:** Check property name in Figma matches exactly (case-sensitive):
```javascript
// Property name in Figma: "Button Label"
const label = instance.getString('Button Label')
```

### Layer Not Found

**Error:** `Child layer "Icon" not found`

**Solution:** Verify layer name and try with path:
```javascript
const icon = instance.findInstance('Icon', {
  path: ['Content', 'IconSlot'],
  traverseInstances: true
})
```

### Type Mismatch

**Error:** `Property type mismatch`

**Solution:** Use correct method for property type:
- Text properties → `getString()`
- Boolean properties → `getBoolean()`
- Variant properties → `getEnum()`
- Instance swap → `getInstanceSwap()`

### Template Not Rendering

**Issue:** Template doesn't appear in Figma

**Solution:**
1. Ensure URL comment matches component exactly
2. Check `figma.config.json` includes the file pattern
3. Verify file was published: `npx figma connect publish`
4. Check Figma file permissions

### Invalid Code Sections

**Issue:** Code appears broken in Figma

**Solution:** Never concatenate template results:
```javascript
// Wrong
const result = snippet1 + snippet2

// Correct
const result = figma.code`${snippet1}${snippet2}`
```
