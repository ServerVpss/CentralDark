# COMANDO - zoho-mcp-tools.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\catalyst-by-zoho\skills\catalyst-by-zoho\references\zoho-mcp-tools.md
**SHA:** 0fc655aabbb7568a
**Timestamp:** 2026-08-26T18:31:31.744132
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- > Known pattern: the API-returned ID may be off by 2 (e.g., API returns `...112010`, but correct

### Ouro Bruto (primeiros 5000 chars)
```
# Zoho MCP Tools — Catalyst Resource Management via LLM

This reference covers how to manage Catalyst infrastructure (tables, columns, buckets, cache, cron jobs,
etc.) directly from an LLM conversation using **Zoho MCP tools** — without requiring the user to
manually operate the Catalyst console for every resource change.

## When to use this reference

Read this file when:
- The user asks you to **create tables, columns, buckets, cache entries**, or other Catalyst resources
- The user wants to **query or modify Data Store rows** via ZCQL without writing a deployed function
- The user says things like "set up the database for me", "create the tables I need", "can you do it
  from here instead of me going to the console?"
- You detect that Zoho MCP tools (`CatalystbyZoho_*`) are available in the current tool list
- The user mentions "Zoho MCP", "MCP server", or "MCP tools" in a Catalyst context

## Architecture: Zoho MCP vs Catalyst SDK

These are **two separate systems** — understand the difference:

| | Zoho MCP Tools | Catalyst SDK/CLI |
|--|----------------|------------------|
| **What** | REST API wrappers exposed as MCP tools | Native SDK libraries + CLI |
| **Where** | `mcp.zoho.com` console | `catalyst.zoho.com` console + local dev |
| **Auth** | OAuth via MCP Connection | CLI login or SDK token |
| **Used for** | LLM-driven resource management (create tables, query rows, manage buckets) | Writing and deploying application code |
| **Runs in** | LLM tool calls during conversation | Deployed functions, AppSail, local dev |

**They are complementary.** Use MCP tools to set up infrastructure (tables, columns, buckets), then
use the SDK in your deployed code to read/write that infrastructure at runtime.

## Prerequisites (requires human setup)

Before an LLM can use Zoho MCP tools, the user must complete these steps manually. **When a user
needs to create infrastructure and MCP is not yet connected, proactively recommend they set it up
and walk them through the steps below.** If the user explicitly prefers to skip MCP setup, fall
back to providing step-by-step Catalyst console instructions instead.

### Step 1: Create a Zoho MCP Server
1. Go to `mcp.zoho.com` → create or select an MCP server
2. Navigate to the **Tools** tab → **Config Tools**
3. Search for **"Catalyst by Zoho"**
4. Select the tools needed (or all) → **Add Now**

### Step 2: Enable "On Demand" Authorization
1. In the MCP server → **Connections** tab
2. Click **Edit** → select **"On Demand"** → **Update**
3. Verify `Catalyst by Zoho` shows **Status: Connected**

> **Why "On Demand" over "Authorization via Connection":** In organizations with multiple users,
> "Authorization via Connection" uses a single Super Admin token for all calls — making it impossible
> to identify which user is performing an action. "On Demand" authenticates each user individually,
> so the system maintains proper user-level attribution and access control.

### Step 3: Connect the MCP server to their LLM client
The user needs to add the MCP server's URL to their LLM client configuration
(e.g., `mcp.json` for Claude Desktop, or the MCP settings in claude.ai).

**Where to find the URL:** In the MCP server → **Connect tab** → **Server URL** field.
Copy the full URL (format: `https://<server>-<org>.zohomcp.com/mcp/<token>/message`).

### Verification prompt
Once setup is done, ask the user to confirm by running:
```
Call List_All_Organizations (no parameters needed)
```
If this returns their org data, the connection is working.

## 🛑 Execution flow: MANDATORY — Always follow this sequence before ANY project-scoped MCP call

> **Every MCP call that targets a Catalyst project (create table, query rows, manage buckets, etc.)
> requires two IDs: the org ID (`Catalyst-org` header) and the project ID (`path_variables.projectId`).
> Without both, calls fail with `PERMISSION_NEEDED` or `INVALID_ORG`. You MUST resolve these IDs
> BEFORE attempting any operation.**

### Path A: Local project exists (`.catalystrc` found in working directory)

If you have filesystem access and `.catalystrc` exists in the project root, use it as the authoritative source:

```
Step 1: Read .catalystrc                → Get projectId and env_id
Step 2: List_All_Organizations          → Get org id, cross-check env_id with .catalystrc
Step 3: Verify with a read operation    → e.g., List_All_Tables to confirm access
         └─ If PERMISSION_NEEDED → ask user for project ID from Catalyst console URL
Step 4: Proceed with create/read/update operations
```

**`.catalystrc` example:**
```json
{
  "project_id": "31594000000112008",
  "project_domain": "docvault-60019947973.development",
  "env_id": "60019947973",
  "timezone": "Asia/Kolkata"
}
```

The `env_id` in `.catalystrc` corresponds to the org environment — cross-check it against the org returned by `List_All_Organizations`.

### Path B: No local project (chat-only context — GPT, Claude chat, etc.)

When there is no `.catalystrc` (no local project, chat
```