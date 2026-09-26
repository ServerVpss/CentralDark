# COMANDO - reference.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\nvidia\skills\physical-ai-infrastructure-setup-and-resilient-scaling\components\osmo-cli\reference.md
**SHA:** 0aada165576f1458
**Timestamp:** 2026-08-26T18:40:14.813186
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Then execute the command yourself — do not tell the user to run it. Once confirmed, run:
- GPUs, so let the user know before proceeding. If they agree, run:
- Example prompt:
- - **If PENDING** (or the user asks why it isn't scheduling), run:
- 3. **Create the app** — once the user confirms name and description, run:
- 2. **Run:**

### Ouro Bruto (primeiros 5000 chars)
```
# OSMO Platform And CLI

## Table of Contents

- [Prerequisites](#prerequisites)
- [Reference Files](#reference-files)
- [Intent Routing](#intent-routing)
- [Use Case: Check Available Resources](#use-case-check-available-resources)
- [Use Case: Generate and Submit a Workflow](#use-case-generate-and-submit-a-workflow)
- [Use Case: Orchestrate a Workflow End-to-End](#use-case-orchestrate-a-workflow-end-to-end)
- [Use Case: List Workflows](#use-case-list-workflows)
- [Use Case: Check Workflow Status](#use-case-check-workflow-status)
- [Use Case: Fetch Workflow Data](#use-case-fetch-workflow-data)
- [Use Case: Explain What a Workflow Does](#use-case-explain-what-a-workflow-does)
- [Use Case: Create an App](#use-case-create-an-app)
- [Compatibility Reference: Run a Workflow Locally](#compatibility-reference-run-a-workflow-locally)
- [Use Case: Set Up an Image Registry Credential](#use-case-set-up-an-image-registry-credential)
- [Quick Command Reference](#quick-command-reference)
- [Workflow Spec Quick Reference](#workflow-spec-quick-reference)
- [Environment Variables](#environment-variables)
- [Architecture at a Glance](#architecture-at-a-glance)


## Overview

OSMO is a workflow orchestration platform for Physical AI. It manages
heterogeneous Kubernetes clusters and provides a CLI (`osmo`) for submitting
workflows, managing data, and monitoring jobs. This skill covers end-to-end
OSMO use cases plus a complete CLI command and workflow-spec reference.

## Prerequisites

The CLI must be installed at version 6.3.0 or newer and authenticated. Run
`scripts/preflight.sh` before workflow submit/query work.

```bash
osmo login <OSMO_URL>           # device-code flow (default)
osmo login <OSMO_URL> --method password --username <user> --password <pass>
osmo login <OSMO_URL> --method token --token-file /path/to/refresh_token
```

Credentials are stored in `~/.config/osmo/login.yaml` (or `$OSMO_CONFIG_FILE_DIR`).

## Reference Files

Run `scripts/preflight.sh` first when this component is selected. It checks the
OSMO CLI binary and minimum supported version.

The `agents/` directory contains instructions for specialized subagents. Read
them when you need to spawn the relevant subagent.

- `agents/workflow-expert.md` — workflow generation, resource check, submission, failure diagnosis
- `agents/logs-reader.md` — log fetching and summarization for monitoring and failure diagnosis

The `references/` directory has additional documentation:

- `references/cli-commands.md` — Full CLI command reference with all flags
- `references/workflow-spec.md` — Complete workflow YAML schema and examples
- `references/workflow-patterns.md` — Multi-task, parallel execution, data dependencies, Jinja templating
- `references/advanced-patterns.md` — Checkpointing, retry/exit behavior, node exclusion

---

## Intent Routing

- Asks about resources, pools, GPUs, or quota → **Check Available Resources**
- Wants to submit a job (simple, no monitoring) → **Generate and Submit a Workflow**
- Wants to submit + monitor + handle failures → **Orchestrate a Workflow End-to-End**
- Asks about a workflow's status or logs → **Check Workflow Status**
- Asks to fetch, inspect, list, or download workflow results/output/data → **Fetch Workflow Data**
- Lists recent workflows → **List Workflows**
- Asks what a workflow does → **Explain What a Workflow Does**
- Wants to publish a workflow as an app → **Create an App**
- Wants to run a workflow locally (no cluster) → out of scope for infrastructure setup; use this component only as a compatibility CLI reference.
- Asks about image/registry/pull credentials, `nvcr.io` pull secrets, "how do I set the credential", `osmo credential set`, or a workflow that fails to pull a private image → **Set Up an Image Registry Credential**
- Asks for a command's syntax, flags, or purpose → jump to **Quick Command Reference** below (or `references/cli-commands.md`)
- Asks about workflow YAML schema → jump to **Workflow Spec Quick Reference** below (or `references/workflow-spec.md`)

---

## Use Case: Check Available Resources

**When to use:** The user asks what resources, nodes, GPUs, or pools are available
(e.g. "what resources are available?", "what nodes can I use?", "do I have GPU quota?",
"what pools do I have access to?").

### Steps

1. **Check accessible pools** — run to see which pools the user's profile has access to:
   ```bash
   osmo profile list
   ```
   This returns the user's profile settings, including which pools they belong to.

2. **Check pool resources** — run to see GPU availability across all accessible pools:
   ```bash
   osmo pool list
   ```
   By default this shows used/total GPU counts. To see what's free instead:
   ```bash
   osmo pool list --mode free
   ```

### Reading the output

The `osmo pool list` table columns mean:

| Column | Meaning |
|---|---|
| Quota Limit | Max GPUs for HIGH/NORMAL priority workflows |
| Quota Used | GPUs currently consumed by your workflows |
| Quota Free | GPUs you can
```