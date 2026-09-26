# COMANDO - squad-creator-extend.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\squad-creator-extend.md
**SHA:** ba5fbc0d4c1512f2
**Timestamp:** 2026-08-28T02:02:09.178185
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- 3. Run: *validate-squad my-squad
- 3. Run: *validate-squad ${squadName}

### Riscos
- blocker: true
- blocker: true
- blocker: true
- blocker: true
- blocker: false

### Ouro Bruto (primeiros 5000 chars)
```
---
task: extendSquad()
responsavel: "@squad-creator"
responsavel_type: Agent
atomic_layer: Task
elicit: true

Entrada:
  - campo: squad_name
    tipo: string
    origem: User Input
    obrigatorio: true
    validacao: Squad must exist in ./squads/ directory

  - campo: component_type
    tipo: string
    origem: User Input
    obrigatorio: true
    validacao: "agent | task | workflow | checklist | template | tool | script | data"

  - campo: component_name
    tipo: string
    origem: User Input
    obrigatorio: true
    validacao: "kebab-case, no special characters"

  - campo: agent_id
    tipo: string
    origem: User Input
    obrigatorio: false
    validacao: "Required for tasks - must exist in squad's agents/"

  - campo: story_id
    tipo: string
    origem: User Input
    obrigatorio: false
    validacao: "Format: SQS-XX (optional traceability)"

Saida:
  - campo: created_file
    tipo: string
    destino: Squad directory
    persistido: true

  - campo: updated_manifest
    tipo: boolean
    destino: squad.yaml
    persistido: true

  - campo: validation_result
    tipo: object
    destino: Console
    persistido: false

Checklist:
  - "[ ] Validate squad exists"
  - "[ ] Collect component type"
  - "[ ] Collect component name and metadata"
  - "[ ] Create file from template"
  - "[ ] Update squad.yaml manifest"
  - "[ ] Run validation"
  - "[ ] Display result and next steps"
---

# Extend Squad Task

## Purpose

Add new components to an existing squad with automatic manifest updates and validation. This task enables incremental squad improvement without manual file manipulation.

## Story Reference

- **Story:** SQS-11 - Squad Analyze & Extend
- **Epic:** SQS - Squad System Enhancement

## Pre-Conditions

```yaml
pre-conditions:
  - [ ] Squad exists in ./squads/ directory
    tipo: pre-condition
    blocker: true
    validacao: |
      Check if squad directory exists with valid manifest
    error_message: "Squad not found. Use *list-squads to see available squads."

  - [ ] Component name is valid kebab-case
    tipo: pre-condition
    blocker: true
    validacao: |
      Must match /^[a-z][a-z0-9-]*[a-z0-9]$/
    error_message: "Invalid component name. Use kebab-case (e.g., my-component)"
```

## Elicitation Flow (Interactive Mode)

```
@squad-creator

*extend-squad my-squad

? What would you like to add?
  1. Agent - New agent persona
  2. Task - New task for an agent
  3. Workflow - Multi-step workflow
  4. Checklist - Validation checklist
  5. Template - Document template
  6. Tool - Custom tool (JavaScript)
  7. Script - Automation script
  8. Data - Static data file (YAML)

> 2

? Task name: process-data
? Which agent owns this task?
  1. lead-agent
  2. helper-agent
> 1
? Task description (optional): Process incoming data and generate output
? Link to story? (leave blank to skip): SQS-11

Creating task...
  Created: tasks/lead-agent-process-data.md
  Updated: squad.yaml (added to components.tasks)
  Validation: PASS

Next steps:
  1. Edit tasks/lead-agent-process-data.md
  2. Add entrada/saida/checklist
  3. Run: *validate-squad my-squad
```

## Direct Mode (Flags)

```bash
# Add agent directly
*extend-squad my-squad --add agent --name analytics-agent

# Add task with agent linkage
*extend-squad my-squad --add task --name process-data --agent lead-agent

# Add workflow with story reference
*extend-squad my-squad --add workflow --name daily-processing --story SQS-11

# Add all component types
*extend-squad my-squad --add template --name report-template
*extend-squad my-squad --add tool --name data-validator
*extend-squad my-squad --add checklist --name quality-checklist
*extend-squad my-squad --add script --name migration-helper
*extend-squad my-squad --add data --name config-data
```

## Execution Steps

### Step 1: Validate Squad Exists

```javascript
const { SquadLoader } = require('../scripts/squad/squad-loader');
const loader = new SquadLoader();

const squadPath = path.join('./squads', squadName);
const exists = await loader.squadExists(squadName);

if (!exists) {
  throw new Error(`Squad "${squadName}" not found`);
}
```

### Step 2: Collect Component Info

```javascript
// Interactive mode
if (!componentType) {
  componentType = await promptComponentType();
}

if (!componentName) {
  componentName = await promptComponentName(componentType);
}

// Validate name format
if (!isValidKebabCase(componentName)) {
  throw new Error('Component name must be kebab-case');
}

// For tasks, require agent
if (componentType === 'task' && !agentId) {
  const agents = await listAgents(squadPath);
  agentId = await promptAgentSelection(agents);
}
```

### Step 3: Create Component File

```javascript
const { SquadExtender } = require('../scripts/squad/squad-extender');
const extender = new SquadExtender();

const result = await extender.addComponent(squadPath, {
  type: componentType,
  name: componentName,
  agentId: agentId,
  storyId: storyId,
  description: description
});

// result = {
//   file
```