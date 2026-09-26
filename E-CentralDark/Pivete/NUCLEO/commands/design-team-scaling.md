# COMANDO - design-team-scaling.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\aiox-core\squads\design-studio\tasks\design-team-scaling.md
**SHA:** 8168559a3c8060a2
**Timestamp:** 2026-08-28T13:25:03.049370
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Principios
- This task guides strategic planning for scaling a design team from current state to target size. It emphasizes building systems before adding headcount, following Malouf's principle: "Scale through sy
- principle: "Build the system before hiring - otherwise you're just adding chaos."

### Ouro Bruto (primeiros 5000 chars)
```
# design-team-scaling

> Plan design team growth and structure using Dave Malouf's scaling framework and team topology principles.

## Overview

This task guides strategic planning for scaling a design team from current state to target size. It emphasizes building systems before adding headcount, following Malouf's principle: "Scale through systems, not just headcount."

## Prerequisites

- Completed `designops-maturity-assessment.md` (know your current maturity)
- Understanding of business growth plans
- Budget parameters (rough estimates acceptable)
- Timeline expectations

## Malouf Framework Reference

### Scaling Phases
| Phase | Size | Name | Key Focus |
|-------|------|------|-----------|
| 1 | 0-5 | Founding | Establish credibility, first wins |
| 2 | 5-15 | Building | Standardize, build foundations |
| 3 | 15-50 | Scaling | Scale processes, build management |
| 4 | 50-150 | Optimizing | Efficiency, centers of excellence |
| 5 | 150+ | Enterprise | Multi-BU coordination, global |

### Team Topologies
| Topology | Description | Best For |
|----------|-------------|----------|
| Centralized | All designers in one team | <20 designers, consistency priority |
| Embedded | Designers sit in product teams | Speed priority, deep product knowledge |
| Federated | Embedded with dotted line to design | 50+ designers, balance consistency/speed |
| Hybrid | Mix based on function | Large, complex orgs, specialized needs |

### Scaling Principles
1. Systems before headcount
2. Hire one level ahead
3. Document before scaling
4. Measure what matters
5. Culture is fragile at scale
6. Governance enables, not restricts

## Task Steps

### Phase 1: Current State Assessment

```yaml
step: 1
name: "Assess Current State"
questions:
  headcount:
    - "How many designers currently?"
    - "What's the breakdown by role/level?"
    - "What's the designer-to-engineer ratio?"
    - "What's the designer-to-PM ratio?"
  maturity:
    - "What's your DesignOps maturity level?"
    - "What processes are documented?"
    - "What's working well?"
    - "What's breaking?"
  structure:
    - "Current topology (centralized/embedded/etc)?"
    - "Reporting structure?"
    - "Who manages designers?"
output: |
  CURRENT STATE SNAPSHOT

  Headcount: [X] designers
  Breakdown:
  - Senior: [X]
  - Mid: [X]
  - Junior: [X]
  - Specialists: [X] (research, systems, etc.)

  Ratios:
  - Designer:Engineer = 1:[X]
  - Designer:PM = 1:[X]

  Maturity Level: [X]/5
  Current Topology: [type]

  Strengths:
  - [list]

  Pain Points:
  - [list]
```

### Phase 2: Target State Definition

```yaml
step: 2
name: "Define Target State"
questions:
  growth:
    - "Target headcount in 6/12/18 months?"
    - "What's driving the growth?"
    - "What new capabilities are needed?"
  business_context:
    - "New products/markets?"
    - "Acquisition/merger planned?"
    - "Reorganization coming?"
  constraints:
    - "Budget constraints?"
    - "Hiring market conditions?"
    - "Timeline pressures?"
output: |
  TARGET STATE DEFINITION

  Timeline: [X] months
  Target Headcount: [Y] designers
  Growth Rate: [Z] designers/quarter

  New Capabilities Needed:
  - [list]

  Business Drivers:
  - [list]

  Constraints:
  - [list]
```

### Phase 3: Gap Analysis (Systems vs Headcount)

```yaml
step: 3
name: "Identify Systems Gaps"
principle: "Build the system before hiring - otherwise you're just adding chaos."
checklist:
  processes:
    - "[ ] Design workflow documented?"
    - "[ ] Handoff process defined?"
    - "[ ] Review process standardized?"
    - "[ ] Project intake established?"
  tools:
    - "[ ] Tool stack standardized?"
    - "[ ] Asset management centralized?"
    - "[ ] Design system exists?"
    - "[ ] Collaboration tools unified?"
  people_ops:
    - "[ ] Hiring process documented?"
    - "[ ] Interview rubric exists?"
    - "[ ] Onboarding program built?"
    - "[ ] Career ladder defined?"
  governance:
    - "[ ] Decision rights clear?"
    - "[ ] Standards documented?"
    - "[ ] Escalation paths defined?"
    - "[ ] Quality gates established?"
  metrics:
    - "[ ] Baseline metrics collected?"
    - "[ ] Success metrics defined?"
    - "[ ] Reporting cadence set?"
output: |
  SYSTEMS GAP ANALYSIS

  Ready to Scale:
  - [list of checked items]

  Must Build Before Scaling:
  - [list of unchecked items, prioritized]

  Estimated Effort: [X] weeks/months to close gaps
```

### Phase 4: Topology Recommendation

```yaml
step: 4
name: "Evaluate Team Topology"
decision_factors:
  - current_size: "[X]"
  - target_size: "[Y]"
  - product_complexity: "[low/medium/high]"
  - consistency_priority: "[1-5]"
  - speed_priority: "[1-5]"
  - maturity_level: "[1-5]"

evaluation_matrix: |
  | Factor | Weight | Centralized | Embedded | Federated | Hybrid |
  |--------|--------|-------------|----------|-----------|--------|
  | Size fit | 30% | [1-5] | [1-5] | [1-5] | [1-5] |
  | Consistency | 25% | [1-5] | [1-5] | [1-5] | [1-5] |
  | Speed | 25% | [1-5] | [1-5] | [1-5] | 
```