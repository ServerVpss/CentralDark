# Validate Agents Task

## Purpose

Validate all agent definition files for structural integrity, required fields,
dependency existence, and unified activation pipeline reference.

Story ACT-6: Framework integrity checking via `*validate-agents` command.

---

## Parameters

- **scope**: `all` (default) | `{agent-id}` - Validate all agents or a specific one
- **strict**: `false` (default) | `true` - Fail on warnings in addition to errors
- **output**: `summary` (default) | `detailed` - Output verbosity

---

## Execution Steps

### Step 1: Discover Agent Files

Scan `.aios-core/development/agents/` for all `.md` files.
Expected agents: dev, qa, architect, pm, po, sm, analyst, data-engineer, ux-design-expert, devops, aios-master, squad-creator

### Step 2: Parse YAML Block

For each agent file:
1. Extract the YAML block between ` ```yaml ` and ` ``` ` fences
2. Parse using `js-yaml.load()` (safe loader)
3. If parse fails, try normalizing compact command format first
4. Report parse errors with line numbers

### Step 3: Validate Required Fields

| Field | Required | Default | Notes |
|-------|----------|---------|-------|
| `agent.id` | Yes | - | Must match filename |
| `agent.name` | Yes | - | Human-readable name |
| `agent.icon` | No | - | Emoji icon |
| `persona_profile` | Yes | - | Must have greeting_levels |
| `persona_profile.greeting_levels` | Yes | - | minimal, named, archetypal |
| `persona.role` | Yes | - | Role description |
| `commands` | Yes | [] | Array of command objects |
| `activation-instructions` | Yes | - | Must include STEP 1-5 |

### Step 4: Validate Activation Pipeline Reference

Check that STEP 3 in `activation-instructions` references:
- `unified-activation-pipeline.js` (Story ACT-6)
- NOT the old `greeting-builder.js` direct reference

Report as WARNING if still referencing old path.

### Step 5: Validate Dependencies

For each agent's `dependencies.tasks` list:
1. Check that each referenced task file exists in `.aios-core/development/tasks/`
2. Report missing dependencies as ERRORS

For each agent's `dependencies.checklists` list:
1. Check in `.aios-core/development/checklists/`
2. Report missing as WARNINGS

### Step 6: Validate Command Structure

For each command in `commands` array:
1. Must have `name` field (string)
2. `description` is recommended (WARNING if missing)
3. `visibility` array is recommended for session-aware filtering

### Step 7: Cross-Agent Validation

1. Verify no duplicate agent IDs across files
2. Verify all 12 expected agents are present
3. Verify `*yolo` command exists (universal command)

### Step 8: Generate Report

Output format:

```
=== Agent Validation Report ===

[PASS] dev.md - 15 commands, 8 tasks, pipeline: unified
[PASS] qa.md - 12 commands, 6 tasks, pipeline: unified
[WARN] devops.md - Missing visibility metadata on 5 commands
[FAIL] broken-agent.md - YAML parse error at line 42

Summary: 11 passed, 1 warning, 0 failed
```

---

## Error Handling

- YAML parse errors: Report file, line number, error message
- Missing files: Report expected path
- Invalid fields: Report field name and expected format
- Continue validation on errors (don't stop at first failure)

---

## Dependencies

- `js-yaml` - YAML parsing
- `fs` - File system access
- Agent files in `.aios-core/development/agents/`
- Task files in `.aios-core/development/tasks/`
- `unified-activation-pipeline.js` - Pipeline reference check

---

*Story ACT-6 | Task: validate-agents | Created 2026-02-06*


---

# AGENTE - validate-agents.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\infrastructure\scripts\validate-agents.js
**SHA:** 3a800a109edfeced
**Timestamp:** 2026-08-28T02:02:14.345581
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- suggestion: `Consider converting to: - name: ${cmd.split(':')[0].trim()}\n    description: "${cmd.split(':')[1]?.trim() || 'TODO: add description'}"`,

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node

/**
 * AIOS Agent Consistency Validator
 *
 * Validates all agent definitions for consistency according to the
 * Agent Consistency Refactor PRD requirements:
 *
 * 1. Command uniqueness across agents (1 command = 1 owner)
 * 2. Dependency existence verification
 * 3. Format schema validation
 * 4. Cross-agent reference validation
 *
 * Usage:
 *   node validate-agents.js                    Validate all agents
 *   node validate-agents.js --json             Output as JSON
 *   node validate-agents.js --fix-suggestions  Show fix suggestions
 *
 * Exit codes:
 *   0 - All validations passed
 *   1 - Validation errors found
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

// Paths
const ROOT_DIR = path.join(__dirname, '..', '..');
const AGENTS_DIR = path.join(ROOT_DIR, 'development', 'agents');
const TASKS_DIR = path.join(ROOT_DIR, 'development', 'tasks');
const TEMPLATES_DIR = path.join(ROOT_DIR, 'development', 'templates');
const CHECKLISTS_DIR = path.join(ROOT_DIR, 'development', 'checklists');
const DATA_DIR = path.join(ROOT_DIR, 'development', 'data');
const UTILS_DIR = path.join(ROOT_DIR, 'development', 'utils');
const WORKFLOWS_DIR = path.join(ROOT_DIR, 'development', 'workflows');
const SCRIPTS_DIR = path.join(ROOT_DIR, 'development', 'scripts');

// Commands that are allowed to be shared by multiple agents
// These are utility/infrastructure commands, not domain-specific
const SHARED_COMMANDS = new Set([
  // Core utility commands (all agents)
  'help',
  'yolo',
  'exit',
  'guide',
  'session-info',
  // Document operations (multiple agents can output docs)
  'doc-out',
  'shard-doc',
  'shard-prd',
  'research',
  'execute-checklist',
  // Status/monitoring (multiple agents can check status)
  'status',
  // Infrastructure commands delegated to specific agents but callable from many
  'document-project',
  // Backlog operations (PO and QA both manage backlog items)
  'backlog-add',
  'backlog-review',
  // Build/rollback (dev operations that overlap between dev/devops/data)
  'build',
  'rollback',
  // Correct-course (all agents can use on own domain)
  'correct-course',
]);

/**
 * Extract YAML content from markdown file
 */
function extractYamlFromMarkdown(content) {
  const yamlBlockMatch = content.match(/```yaml\n([\s\S]*?)\n```/);
  if (yamlBlockMatch) {
    return yaml.load(yamlBlockMatch[1]);
  }
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    return yaml.load(frontmatterMatch[1]);
  }
  return null;
}

/**
 * Load all agent files
 */
async function loadAllAgents() {
  const agents = [];

  try {
    const files = await fs.readdir(AGENTS_DIR);
    for (const file of files) {
      if (file.endsWith('.md') && !file.startsWith('_')) {
        const filePath = path.join(AGENTS_DIR, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const parsed = extractYamlFromMarkdown(content);

        if (parsed?.agent) {
          agents.push({
            file,
            path: filePath,
            id: parsed.agent.id || file.replace('.md', ''),
            name: parsed.agent.name,
            commands: parsed.commands || [],
            dependencies: parsed.dependencies || {},
            parsed,
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error reading agents directory: ${error.message}`);
  }

  return agents;
}

/**
 * Check if a file exists
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate command uniqueness across agents
 * Returns: { errors: [], warnings: [], commandOwners: Map }
 */
function validateCommandUniqueness(agents) {
  const commandOwners = new Map(); // command -> [{ agent, hasVisibility }]
  const errors = [];
  const warnings = [];

  for (const agent of agents) {
    if (!Array.isArray(agent.commands)) continue;
    for (const cmd of agent.commands) {
      let cmdName;
      if (typeof cmd === 'string') {
        // String format: 'command: description'
        cmdName = cmd.split(':')[0].trim();
      } else if (cmd.name) {
        // Explicit format: { name: 'command', ... }
        cmdName = cmd.name;
      } else if (typeof cmd === 'object') {
        // Shorthand format: { command: 'description' } - take first key
        const keys = Object.keys(cmd);
        cmdName = keys[0]?.split(' ')[0]; // Handle 'command {args}' format
      }
      if (!cmdName) continue;

      if (!commandOwners.has(cmdName)) {
        commandOwners.set(cmdName, []);
      }
      commandOwners.get(cmdName).push({
        agent: agent.id,
        file: agent.file,
        hasVisibility: cmd.visibility !== undefined,
      });
    }
  }

  // Check for duplicates
  for (const [cmd, owners] of commandOwners) {
    if (owners.length > 1 && !SHARED_COMMANDS.has(cmd)) {
      const ownerList = owners.map((o) => `@${o.agent
```