# MISSAO - design-tooling-audit.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\aiox-core\squads\design-studio\tasks\design-tooling-audit.md
**SHA:** 01623e43870b6ba6
**Timestamp:** 2026-08-28T13:25:04.668662
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Principios
- principle: "Understand the process before evaluating tools."

### Gaps
- [Gap: ...]

### Ouro Bruto (primeiros 5000 chars)
```
# design-tooling-audit

> Evaluate and optimize design tool stack using Dave Malouf's "Governance over Tools" principle and Three Lenses framework.

## Overview

This task provides a structured approach to auditing the design tool ecosystem. Following Malouf's principle "Governance over tools - process clarity matters more than tool selection," we first understand workflows, then evaluate tools against actual needs.

## Prerequisites

- Understanding of current design workflows
- Access to tool usage data (if available)
- List of current tools and licenses
- Budget context for tool investments

## Malouf Framework Reference

### Core Principle
> "The best tools amplify good process - they can't fix bad process."

### Tool Categories (How We Work Lens)
1. **Design Tools** - Core design work (Figma, Sketch, etc.)
2. **Prototyping Tools** - Interactive prototypes
3. **Collaboration Tools** - Communication and feedback
4. **Asset Management** - Libraries, icons, images
5. **Design-Dev Integration** - Handoff and tokens
6. **Research Tools** - User research platforms
7. **Documentation Tools** - Specs and guidelines

### Evaluation Criteria
| Criterion | Description |
|-----------|-------------|
| Adoption | What % of team uses it? |
| Workflow Fit | Does it match how we work? |
| Integration | Does it connect to other tools? |
| Governance | Are there clear usage guidelines? |
| Cost Efficiency | Value vs cost? |
| Scalability | Will it work as we grow? |

## Task Steps

### Phase 1: Current State Inventory

```yaml
step: 1
name: "Tool Inventory"
template: |
  ## CURRENT TOOL INVENTORY

  ### Design Tools
  | Tool | Version | Licenses | Monthly Cost | Primary Use |
  |------|---------|----------|--------------|-------------|
  | [tool] | [X] | [Y] | $[Z] | [use case] |

  ### Prototyping Tools
  | Tool | Version | Licenses | Monthly Cost | Primary Use |
  |------|---------|----------|--------------|-------------|

  ### Collaboration Tools
  | Tool | Version | Licenses | Monthly Cost | Primary Use |
  |------|---------|----------|--------------|-------------|

  ### Asset Management
  | Tool | Version | Licenses | Monthly Cost | Primary Use |
  |------|---------|----------|--------------|-------------|

  ### Design-Dev Integration
  | Tool | Version | Licenses | Monthly Cost | Primary Use |
  |------|---------|----------|--------------|-------------|

  ### Research Tools
  | Tool | Version | Licenses | Monthly Cost | Primary Use |
  |------|---------|----------|--------------|-------------|

  ### Documentation Tools
  | Tool | Version | Licenses | Monthly Cost | Primary Use |
  |------|---------|----------|--------------|-------------|

  ---

  **Total Monthly Cost:** $[X]
  **Total Annual Cost:** $[Y]
  **Total Licenses:** [Z]
```

### Phase 2: Usage Analysis

```yaml
step: 2
name: "Analyze Actual Usage"
data_to_collect:
  quantitative:
    - Active users per tool
    - Login frequency
    - Feature usage (if available)
    - Integration usage
  qualitative:
    - Designer satisfaction per tool
    - Pain points
    - Workarounds in use
    - Feature requests

survey_questions:
  - "Which tools do you use daily? Weekly? Rarely?"
  - "Which tools cause the most friction?"
  - "What workarounds do you use?"
  - "What's missing from our tool stack?"
  - "If you could change one tool, which would it be?"

output: |
  ## USAGE ANALYSIS

  ### Adoption Rates
  | Tool | Team Size | Active Users | Adoption % | Status |
  |------|-----------|--------------|------------|--------|
  | [tool] | [X] | [Y] | [Z]% | [good/concern/critical] |

  ### Satisfaction Scores
  | Tool | Satisfaction (1-5) | Top Complaint |
  |------|-------------------|---------------|
  | [tool] | [X] | [complaint] |

  ### Identified Workarounds
  | Workaround | Why Needed | Frequency |
  |------------|------------|-----------|
  | [description] | [reason] | [daily/weekly/etc] |
```

### Phase 3: Workflow Mapping

```yaml
step: 3
name: "Map Tools to Workflows"
principle: "Understand the process before evaluating tools."

workflows_to_map:
  - name: "Design Creation"
    steps:
      - "Brief received"
      - "Research/discovery"
      - "Initial concepts"
      - "Design iteration"
      - "Review/feedback"
      - "Final design"
    tools_used: "[list per step]"
    gaps: "[where tools fail]"

  - name: "Design Handoff"
    steps:
      - "Design complete"
      - "Spec documentation"
      - "Developer review"
      - "Asset export"
      - "Implementation support"
    tools_used: "[list per step]"
    gaps: "[where tools fail]"

  - name: "Design System Management"
    steps:
      - "Component creation"
      - "Documentation"
      - "Token management"
      - "Version control"
      - "Distribution"
    tools_used: "[list per step]"
    gaps: "[where tools fail]"

output: |
  ## WORKFLOW-TOOL MAPPING

  ### Design Creation Workflow
  ```
  [Step 1] --[Tool]--> [Step 2] --[Tool]--> [Step 3]
                              |
               
```