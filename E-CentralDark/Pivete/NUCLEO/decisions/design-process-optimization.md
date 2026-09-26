# DECISAO - design-process-optimization.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\aiox-core\squads\design-studio\tasks\design-process-optimization.md
**SHA:** e4b49afb4cdc1f04
**Timestamp:** 2026-08-28T13:25:06.262296
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Principios
- This task systematically identifies and removes friction from design processes. Following Malouf's core principle: "Operations enable creativity - we remove friction so designers can focus on design."

### Ouro Bruto (primeiros 5000 chars)
```
# design-process-optimization

> Streamline design workflows and reduce friction using Dave Malouf's DesignOps Pillars framework, focusing on Workflow Operations.

## Overview

This task systematically identifies and removes friction from design processes. Following Malouf's core principle: "Operations enable creativity - we remove friction so designers can focus on design."

## Prerequisites

- Understanding of current design workflows
- Access to designers for interviews/observation
- Awareness of pain points (formal or informal)
- Stakeholder support for process changes

## Malouf Framework Reference

### Core Principle
> "Process should feel like a handrail, not a cage."

### Workflow Operations Pillar Components
1. **Process Design** - Sprints, intake, milestones, approvals
2. **Rituals** - Planning, reviews, critiques, retrospectives
3. **Handoffs** - Design to dev, research to design, QA
4. **Templates** - Briefs, specs, presentations

### Friction Categories
| Category | Examples | Impact |
|----------|----------|--------|
| Wait Time | Approval delays, stakeholder availability | Slower delivery |
| Rework | Unclear requirements, late feedback | Wasted effort |
| Context Switching | Multiple projects, unclear priorities | Reduced quality |
| Information Loss | Poor handoffs, missing documentation | Errors, confusion |
| Tool Friction | Manual tasks, poor integration | Lost time |

## Task Steps

### Phase 1: Friction Discovery

```yaml
step: 1
name: "Identify Friction Points"
methods:
  observation:
    - Shadow designers for a day
    - Attend design reviews and critiques
    - Observe handoff meetings
  interviews:
    questions:
      - "Where do you spend time that isn't designing?"
      - "What slows you down most often?"
      - "What do you wish was easier?"
      - "Where do things get lost or confused?"
      - "What repetitive tasks annoy you?"
  data_analysis:
    - Project timeline analysis (planned vs actual)
    - Revision counts per project
    - Handoff rejection rates
    - Meeting time analysis

friction_log_template: |
  ## FRICTION DISCOVERY LOG

  ### Friction Point: [Name]

  **Category:** [Wait/Rework/Context Switch/Info Loss/Tool]
  **Frequency:** [Daily/Weekly/Per Project]
  **Severity:** [1-5]
  **Who's Affected:** [roles]

  **Description:**
  [What happens]

  **Root Cause:**
  [Why it happens]

  **Current Workaround:**
  [How people cope]

  **Impact:**
  - Time lost: [X hours/week]
  - Quality impact: [description]
  - Morale impact: [description]

  ---
```

### Phase 2: Process Mapping

```yaml
step: 2
name: "Map Current Processes"
workflows_to_map:
  - Design project lifecycle
  - Design review/critique
  - Design handoff
  - Design system contribution
  - Research integration

mapping_template: |
  ## PROCESS MAP: [Process Name]

  ### Current State

  ```
  [Step 1] --> [Step 2] --> [Step 3] --> [Step 4]
     |            |            |            |
  [Actor]     [Actor]     [Actor]     [Actor]
     |            |            |            |
  [Time]      [Time]      [Time]      [Time]
     |            |            |            |
  [Friction]  [Friction]  [Friction]  [Friction]
  ```

  ### Step Details

  | Step | Owner | Inputs | Outputs | Avg Time | Friction |
  |------|-------|--------|---------|----------|----------|
  | [step] | [who] | [what] | [what] | [time] | [yes/no] |

  ### Bottlenecks Identified
  1. [bottleneck 1] - [impact]
  2. [bottleneck 2] - [impact]

  ### Wait Time Analysis
  - Active work time: [X hours]
  - Wait time: [Y hours]
  - Efficiency ratio: [X / (X+Y)]%
```

### Phase 3: Prioritization

```yaml
step: 3
name: "Prioritize Improvements"
framework: |
  Use Impact vs Effort matrix:

  HIGH IMPACT + LOW EFFORT = Quick Wins (Do First)
  HIGH IMPACT + HIGH EFFORT = Strategic (Plan Carefully)
  LOW IMPACT + LOW EFFORT = Nice to Have
  LOW IMPACT + HIGH EFFORT = Avoid

prioritization_template: |
  ## FRICTION PRIORITIZATION MATRIX

  ### Quick Wins (High Impact, Low Effort)
  | Friction Point | Impact | Effort | Action |
  |----------------|--------|--------|--------|
  | [friction] | [1-5] | [1-5] | [action] |

  ### Strategic Improvements (High Impact, High Effort)
  | Friction Point | Impact | Effort | Action |
  |----------------|--------|--------|--------|
  | [friction] | [1-5] | [1-5] | [action] |

  ### Nice to Have (Low Impact, Low Effort)
  | Friction Point | Impact | Effort | Action |
  |----------------|--------|--------|--------|
  | [friction] | [1-5] | [1-5] | [action] |

  ### Deprioritize (Low Impact, High Effort)
  | Friction Point | Impact | Effort | Reason to Skip |
  |----------------|--------|--------|----------------|
  | [friction] | [1-5] | [1-5] | [reason] |
```

### Phase 4: Solution Design

```yaml
step: 4
name: "Design Improvements"
solution_categories:
  process_simplification:
    - Remove unnecessary steps
    - Combine related steps
    - Eliminate approvals that don't add value
  ritual_optimization:
    - R
```