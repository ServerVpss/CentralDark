# COMANDO - add-mcp.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\add-mcp.md
**SHA:** 8a19ae5f343b68d7
**Timestamp:** 2026-08-28T02:02:04.658299
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- ### Access pattern:

### Riscos
- blocker: true
- blocker: false
- blocker: true
- blocker: true
- blocker: true
- blocker: true

### Ouro Bruto (primeiros 5000 chars)
```
# Add MCP Server Task

> Dynamically add MCP servers to Docker MCP Toolkit from the catalog.

---

## Task Definition

```yaml
task: addMcp()
responsavel: DevOps Agent
responsavel_type: Agente
atomic_layer: Infrastructure
elicit: true

**Entrada:**
- campo: mcp_query
  tipo: string
  origem: User Input
  obrigatorio: true
  validacao: Search query for MCP catalog

- campo: mcp_name
  tipo: string
  origem: User Selection
  obrigatorio: true
  validacao: Exact MCP server name from catalog

- campo: credentials
  tipo: object
  origem: User Input
  obrigatorio: false
  validacao: API keys or tokens if required by MCP

**Saida:**
- campo: mcp_added
  tipo: boolean
  destino: Docker MCP configuration
  persistido: true

- campo: tools_available
  tipo: array
  destino: Console output
  persistido: false
```

---

## Pre-Conditions

```yaml
pre-conditions:
  - [ ] Docker MCP Toolkit running
    tipo: pre-condition
    blocker: true
    validacao: docker mcp gateway status succeeds
    error_message: "Start gateway: docker mcp gateway run --watch"

  - [ ] Dynamic MCP feature enabled
    tipo: pre-condition
    blocker: false
    validacao: docker mcp feature list shows dynamic-tools
    error_message: "Enable with: docker mcp feature enable dynamic-tools"
```

---

## Interactive Elicitation

### Step 1: Search MCP Catalog

```
ELICIT: MCP Search

What MCP server are you looking for?

Enter a search query (e.g., "notion", "slack", "database"):
→ _______________

[Searching Docker MCP catalog...]
```

### Step 2: Select from Results

```
ELICIT: MCP Selection

Found {n} MCPs matching "{query}":

1. mcp/notion
   └─ Notion workspace integration
   └─ Requires: NOTION_API_KEY

2. mcp/postgres
   └─ PostgreSQL database access
   └─ Requires: DATABASE_URL

3. mcp/sqlite
   └─ SQLite database access
   └─ Requires: None (local file)

→ Select MCP to add (number or name): ___
```

### Step 3: Configure Credentials

```
ELICIT: Credentials Configuration

The selected MCP requires authentication:

MCP: mcp/{name}
Required: {CREDENTIAL_NAME}

Options:
1. Set environment variable now
2. Configure later (MCP may fail without credentials)
3. Skip this MCP

→ Choose option: ___

[If option 1]
Enter value for {CREDENTIAL_NAME}:
→ _______________
(This will be set as an environment variable)
```

### Step 4: Confirm Addition

```
ELICIT: Confirmation

Ready to add MCP:

Server: mcp/{name}
Credentials: {configured/not configured}
Preset: {preset to add to, if any}

→ Proceed? (y/n): ___
```

---

## Implementation Steps

### 1. Search Catalog

```bash
# Search for MCPs
docker mcp catalog search {query}

# Example output:
# mcp/notion    Notion workspace integration
# mcp/postgres  PostgreSQL database access
```

### 2. Get MCP Details

```bash
# Get detailed info about an MCP
docker mcp catalog info {mcp-name}

# Shows: description, required credentials, tools provided
```

### 3. Add MCP Server

```bash
# Enable the server
docker mcp server enable {mcp-name}
```

### 3.1 Configure Credentials (CRITICAL - Known Bug Workaround)

⚠️ **BUG:** Docker MCP Toolkit's secrets store and template interpolation (`{{...}}`) do NOT work properly. Credentials set via `docker mcp secret set` are not passed to containers.

**WORKAROUND:** Edit the catalog file directly to hardcode env values.

```yaml
# Edit: ~/.docker/mcp/catalogs/docker-mcp.yaml
# Find your MCP entry and add/modify the env section:

{mcp-name}:
  # ... other config ...
  env:
    - name: {ENV_VAR_NAME}
      value: '{actual-api-key-value}'
    - name: TOOLS
      value: 'tool1,tool2,tool3'
```

**Example for Apify:**
```yaml
apify-mcp-server:
  env:
    - name: TOOLS
      value: 'actors,docs,apify/rag-web-browser'
    - name: APIFY_TOKEN
      value: 'apify_api_xxxxxxxxxxxxx'
```

**Security Note:** This exposes credentials in a local file. Ensure:
1. `~/.docker/mcp/catalogs/` is not committed to any repo
2. File permissions restrict access to current user only

**Alternative (if secrets work in future):**
```bash
# Set secret (currently NOT working)
docker mcp secret set {mcp-name}.{credential_name}={value}
```

### 4. Update Gordon Config (Optional)

If adding to gordon-mcp.yml:

```yaml
# Add to .docker/mcp/gordon-mcp.yml
services:
  {mcp-name}:
    image: mcp/{mcp-name}
    environment:
      - {CREDENTIAL_NAME}=${CREDENTIAL_NAME}
    labels:
      mcp.preset: "full,{custom}"
```

### 5. Verify Addition

```bash
# List tools from new MCP
docker mcp tools ls | grep {mcp-name}

# Test a tool
docker mcp tools call {mcp-name}.{tool} --param value
```

### 6. Add to Preset (Optional)

```bash
# Add to existing preset
docker mcp preset update {preset-name} --add-server {mcp-name}

# Or create new preset including the MCP
docker mcp preset create {new-preset} --servers fs,github,{mcp-name}
```

### 7. Update AIOS Documentation (REQUIRED)

Add the new MCP to `.claude/rules/mcp-usage.md`:

```markdown
## {MCP-Name} MCP Usage (via Docker)

### Use {MCP-Name} for:
1. [Primary use c
```