# OUTRO - retrieving_metrics.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\hugging-face\skills\trackio\references\retrieving_metrics.md
**SHA:** fa1339a8f6a7f88d
**Timestamp:** 2026-08-26T18:31:25.164063
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - Missing run: `Error: Run '<name>' not found in project '<project>'.`

### Ouro Bruto (primeiros 5000 chars)
```
# Retrieving Metrics with Trackio CLI

The `trackio` CLI provides direct terminal access to query Trackio experiment tracking data locally without needing to start the MCP server.

## Quick Command Reference

| Task | Command |
|------|---------|
| List projects | `trackio list projects` |
| List runs | `trackio list runs --project <name>` |
| List metrics | `trackio list metrics --project <name> --run <name>` |
| List system metrics | `trackio list system-metrics --project <name> --run <name>` |
| List alerts | `trackio list alerts --project <name> [--run <name>] [--level <level>] [--since <timestamp>]` |
| Get project summary | `trackio get project --project <name>` |
| Get run summary | `trackio get run --project <name> --run <name>` |
| Get metric values | `trackio get metric --project <name> --run <name> --metric <name>` |
| Get metric at step | `trackio get metric ... --metric <name> --step <N>` |
| Get metric around step | `trackio get metric ... --metric <name> --around <N> --window <W>` |
| Get all metrics snapshot | `trackio get snapshot --project <name> --run <name> --step <N>` |
| Get system metrics | `trackio get system-metric --project <name> --run <name>` |
| Show dashboard | `trackio show [--project <name>]` |
| Sync to Space | `trackio sync --project <name> --space-id <space_id>` |

## Core Commands

### List Commands

```bash
trackio list projects                                    # List all projects
trackio list projects --json                            # JSON output

trackio list runs --project <name>                      # List runs in project
trackio list runs --project <name> --json               # JSON output

trackio list metrics --project <name> --run <name>      # List metrics for run
trackio list metrics --project <name> --run <name> --json

trackio list system-metrics --project <name> --run <name>  # List system metrics
trackio list system-metrics --project <name> --run <name> --json

trackio list alerts --project <name>                       # List alerts
trackio list alerts --project <name> --run <name> --json   # Filter by run
trackio list alerts --project <name> --level error --json  # Filter by level
trackio list alerts --project <name> --json --since <ts>   # Poll since timestamp
```

### Get Commands

```bash
trackio get project --project <name>                    # Project summary
trackio get project --project <name> --json             # JSON output

trackio get run --project <name> --run <name>           # Run summary
trackio get run --project <name> --run <name> --json

trackio get metric --project <name> --run <name> --metric <name>  # Metric values
trackio get metric --project <name> --run <name> --metric <name> --json
trackio get metric ... --metric <name> --step 200                 # At exact step
trackio get metric ... --metric <name> --around 200 --window 10   # ±10 steps
trackio get metric ... --metric <name> --at-time <ts> --window 60 # ±60 seconds

trackio get snapshot --project <name> --run <name> --step 200 --json       # All metrics at step
trackio get snapshot --project <name> --run <name> --around 200 --window 5 --json  # Window
trackio get snapshot --project <name> --run <name> --at-time <ts> --window 60 --json

trackio get system-metric --project <name> --run <name>           # All system metrics
trackio get system-metric --project <name> --run <name> --metric <name>  # Specific metric
trackio get system-metric --project <name> --run <name> --json
```

### Dashboard Commands

```bash
trackio show                                              # Launch dashboard
trackio show --project <name>                           # Load specific project
trackio show --theme <theme>                            # Custom theme
trackio show --mcp-server                                # Enable MCP server
trackio show --color-palette "#FF0000,#00FF00"         # Custom colors
```

### Sync Commands

```bash
trackio sync --project <name> --space-id <space_id>     # Sync to HF Space
trackio sync --project <name> --space-id <space_id> --private  # Private space
trackio sync --project <name> --space-id <space_id> --force   # Overwrite
```

## Output Formats

All `list` and `get` commands support two output formats:

- **Human-readable** (default): Formatted text for terminal viewing
- **JSON** (with `--json` flag): Structured JSON for programmatic use

## Common Patterns

### Discover Projects and Runs

```bash
# List all available projects
trackio list projects

# List runs in a project
trackio list runs --project my-project

# Get project overview
trackio get project --project my-project --json
```

### Inspect Run Details

```bash
# Get run summary with all metrics
trackio get run --project my-project --run my-run --json

# List available metrics
trackio list metrics --project my-project --run my-run

# Get specific metric values
trackio get metric --project my-project --run my-run --metric loss --json
```

### Query System Metrics

```bash
# List system metrics (GPU, etc.)
t
```