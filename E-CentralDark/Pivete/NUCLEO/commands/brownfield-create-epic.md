# COMANDO - brownfield-create-epic.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\brownfield-create-epic.md
**SHA:** 548b1aaa7c4dbfe7
**Timestamp:** 2026-08-28T02:02:04.863684
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- //   quality_gate: '@architect' | '@dev' | '@pm',
- quality_gate: "@dev"                  # MUST be different from executor
- - **Executor Assignment**: `executor: @data-engineer`, `quality_gate: @dev`

### Riscos
- - **Primary Risk:** {{main risk to existing system}}
- - LOW RISK: Pre-Commit validation only
- - MEDIUM RISK: Pre-Commit + Pre-PR validation
- - HIGH RISK: Pre-Commit + Pre-PR + Pre-Deployment validation
- - Risk: Breaking existing checkout flow
- blocker: true
- blocker: true
- blocker: true

### Ouro Bruto (primeiros 5000 chars)
```
---
tools:
  - github-cli
checklists:
  - po-master-checklist.md
  - change-checklist.md
---

# Create Brownfield Epic Task

## Purpose

Create a single epic for smaller brownfield enhancements that don't require the full PRD and Architecture documentation process. This task is for isolated features or modifications that can be completed within a focused scope.

## When to Use This Task

**Use this task when:**

- The enhancement can be completed in 1-3 stories
- No significant architectural changes are required
- The enhancement follows existing project patterns
- Integration complexity is minimal
- Risk to existing system is low

**Use the full brownfield PRD/Architecture process when:**

- The enhancement requires multiple coordinated stories
- Architectural planning is needed
- Significant integration work is required
- Risk assessment and mitigation planning is necessary


## Configuration Dependencies

This task requires the following configuration keys from `core-config.yaml`:

- **`devStoryLocation`**: Location of story files (typically docs/stories)

- **`prdShardedLocation`**: Location for sharded PRD documents (typically docs/prd) - Required to access product requirements
- **`architectureShardedLocation`**: Location for sharded architecture documents (typically docs/architecture) - Required to read/write architecture documentation

**Loading Config:**
```javascript
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../../.aios-core/core-config.yaml');
const config = yaml.load(fs.readFileSync(configPath, 'utf8'));

const dev_story_location = config.devStoryLocation;
const prdShardedLocation = config.prdShardedLocation || 'docs/prd'; // prdShardedLocation
const architectureShardedLocation = config.architectureShardedLocation || 'docs/architecture'; // architectureShardedLocation
```

## Instructions

### 1. Project Analysis (Required)

Before creating the epic, gather essential information about the existing project:

**Existing Project Context:**

- [ ] Project purpose and current functionality understood
- [ ] Existing technology stack identified
- [ ] Current architecture patterns noted
- [ ] Integration points with existing system identified

**Enhancement Scope:**

- [ ] Enhancement clearly defined and scoped
- [ ] Impact on existing functionality assessed
- [ ] Required integration points identified
- [ ] Success criteria established

### 2. Epic Creation

Create a focused epic following this structure:

#### Epic Title

{{Enhancement Name}} - Brownfield Enhancement

#### Epic Goal

{{1-2 sentences describing what the epic will accomplish and why it adds value}}

#### Epic Description

**Existing System Context:**

- Current relevant functionality: {{brief description}}
- Technology stack: {{relevant existing technologies}}
- Integration points: {{where new work connects to existing system}}

**Enhancement Details:**

- What's being added/changed: {{clear description}}
- How it integrates: {{integration approach}}
- Success criteria: {{measurable outcomes}}

#### Stories (Enhanced with Quality Planning)

**🔧 Dynamic Executor Assignment (Story 11.1 - Projeto Bob)**

Use the executor-assignment module to automatically assign executor and quality gate for each story:

```javascript
// .aios-core/core/orchestration/executor-assignment.js
const { assignExecutorFromContent } = require('.aios-core/core/orchestration/executor-assignment');

// For each story in the epic:
const storyContent = `${storyTitle}\n${storyDescription}\n${acceptanceCriteria}`;
const assignment = assignExecutorFromContent(storyContent);

// Returns:
// {
//   executor: '@dev' | '@data-engineer' | '@devops' | '@ux-design-expert' | '@analyst' | '@architect',
//   quality_gate: '@architect' | '@dev' | '@pm',
//   quality_gate_tools: ['code_review', 'pattern_validation', ...]
// }
```

**Executor Assignment Table:**

| Work Type | Keywords | Executor | Quality Gate |
|-----------|----------|----------|--------------|
| Code/Features/Logic | feature, logic, handler, service, api | @dev | @architect |
| Schema/DB/RLS/Migrations | schema, table, migration, rls, query, database | @data-engineer | @dev |
| Infra/CI/CD/Deploy | ci/cd, deploy, docker, kubernetes, pipeline | @devops | @architect |
| Design/UI Components | component, ui, design, interface, accessibility | @ux-design-expert | @dev |
| Research/Investigation | research, investigate, analyze, poc | @analyst | @pm |
| Architecture Decisions | architecture, design_decision, pattern, scalability | @architect | @pm |

**CRITICAL RULES:**
- [ ] **executor != quality_gate** (ALWAYS different)
- [ ] Include `executor`, `quality_gate`, and `quality_gate_tools` in each story YAML frontmatter
- [ ] Log assignment for traceability

List 1-3 focused stories that complete the epic, including predicted quality gates and specialized agent assignments:

**Story Structure with Quality Predictions:**

Each story s
```