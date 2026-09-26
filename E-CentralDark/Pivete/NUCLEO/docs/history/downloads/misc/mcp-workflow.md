# OUTRO - mcp-workflow.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\mcp-workflow.md
**SHA:** 605d43ed509a0084
**Timestamp:** 2026-08-28T02:02:06.389342
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- blocker: true
- blocker: true
- blocker: false
- blocker: true
- blocker: true
- blocker: false

### Ouro Bruto (primeiros 5000 chars)
```
# MCP Workflow Creation Task

> Create Code Mode workflows that execute in Docker MCP sandbox for ~98.7% token savings.

---

## Task Definition

```yaml
task: mcpWorkflow()
responsavel: Dev Agent
responsavel_type: Agente
atomic_layer: Development
elicit: true

**Entrada:**
- campo: workflow_name
  tipo: string
  origem: User Input
  obrigatorio: true
  validacao: Kebab-case name (e.g., scrape-process-store)

- campo: workflow_description
  tipo: string
  origem: User Input
  obrigatorio: true
  validacao: Brief description of workflow purpose

- campo: mcps_required
  tipo: array
  origem: User Selection
  obrigatorio: true
  validacao: List of MCPs the workflow will use

- campo: input_params
  tipo: object
  origem: User Input
  obrigatorio: false
  validacao: Input parameters specification

- campo: output_format
  tipo: string
  origem: User Selection
  obrigatorio: false
  validacao: json, text, or custom

**Saida:**
- campo: workflow_file
  tipo: file
  destino: scripts/mcp-workflows/{workflow_name}.js
  persistido: true

- campo: workflow_meta
  tipo: object
  destino: Console output
  persistido: false
```

---

## Pre-Conditions

```yaml
pre-conditions:
  - [ ] Docker MCP Toolkit available
    tipo: pre-condition
    blocker: true
    validacao: docker mcp --version succeeds
    error_message: "Docker MCP Toolkit not installed"

  - [ ] Required MCPs enabled
    tipo: pre-condition
    blocker: true
    validacao: All specified MCPs available in docker mcp tools ls
    error_message: "Missing MCPs - add with *add-mcp"

  - [ ] Workflow directory exists
    tipo: pre-condition
    blocker: false
    validacao: scripts/mcp-workflows/ directory exists
    error_message: "Will create directory automatically"
```

---

## Interactive Elicitation

### Step 1: Workflow Basics

```
ELICIT: Workflow Definition

Let's create a new MCP workflow!

1. Workflow name (kebab-case):
   Example: scrape-classify, batch-process, api-sync
   → _______________

2. Brief description:
   What does this workflow do?
   → _______________

3. Category:
   [ ] Data Processing (scraping, ETL, transformation)
   [ ] Automation (scheduled tasks, batch operations)
   [ ] Integration (API sync, cross-system operations)
   [ ] Analysis (metrics, reports, classification)
   → Select: ___
```

### Step 2: MCP Selection

```
ELICIT: MCP Selection

Which MCPs will your workflow use?

Available MCPs:
  [x] fs        - File system operations
  [ ] fetch     - HTTP requests, web scraping
  [ ] github    - GitHub API operations
  [ ] postgres  - PostgreSQL database
  [ ] notion    - Notion workspace
  [ ] puppeteer - Browser automation

→ Select MCPs (comma-separated): _______________

Note: Ensure selected MCPs are enabled.
Check with: docker mcp tools ls
```

### Step 3: Input/Output Specification

```
ELICIT: Input/Output

Define workflow parameters:

INPUT PARAMETERS:
1. Parameter name: _______________
   Type: [string/number/boolean/array/object]
   Required: [y/n]
   Default: _______________
   Description: _______________

→ Add another parameter? (y/n): ___

OUTPUT FORMAT:
1. [ ] JSON object (structured data)
2. [ ] Plain text (logs, reports)
3. [ ] File path (write to file)
4. [ ] Custom format

→ Select output format: ___
```

### Step 4: Workflow Logic

```
ELICIT: Workflow Steps

Describe the workflow logic:

What are the main steps?

Example for "scrape-classify":
1. Fetch URL content (fetch MCP)
2. Extract text from HTML (local processing)
3. Classify content (local processing)
4. Save results to file (fs MCP)

Your workflow steps:
1. _______________
2. _______________
3. _______________
4. _______________

→ Any additional steps? (y/n): ___
```

### Step 5: Error Handling

```
ELICIT: Error Handling

How should errors be handled?

1. [ ] Fail fast - Stop on first error
2. [ ] Continue - Log errors, continue processing
3. [ ] Retry - Retry failed operations (specify retries)

→ Select strategy: ___

Retry attempts (if selected): ___
```

---

## Implementation Steps

### 1. Create Workflow File

Use template: `.aios-core/product/templates/mcp-workflow.js`

```javascript
/**
 * {WORKFLOW_NAME}
 * {WORKFLOW_DESCRIPTION}
 *
 * MCPs: {MCP_LIST}
 * Token Savings: ~98.7%
 */

'use strict';

const WORKFLOW_META = {
  name: '{workflow_name}',
  version: '1.0.0',
  description: '{workflow_description}',
  mcps_required: [{mcp_list}],
};

async function runWorkflow(params) {
  const startTime = Date.now();

  try {
    // Step 1: {step1_description}
    console.log('[1/{total}] {step1_action}...');
    // Implementation

    // Step 2: {step2_description}
    console.log('[2/{total}] {step2_action}...');
    // Implementation

    // Return minimal result to LLM
    return {
      success: true,
      // Minimal output fields
      processingTime: `${Date.now() - startTime}ms`,
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = { runWorkflow, WORKFLOW_META };
```


```