# DECISAO - designops-metrics-setup.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\aiox-core\squads\design-studio\tasks\designops-metrics-setup.md
**SHA:** 85c05e48d324fedd
**Timestamp:** 2026-08-28T13:25:06.815489
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Principios
- This task guides the establishment of a comprehensive DesignOps measurement system. Following Malouf's principle: "Measure at all three levels: output, outcome, impact." The goal is to connect design 

### Ouro Bruto (primeiros 5000 chars)
```
# designops-metrics-setup

> Establish DesignOps KPIs and measurement systems using Dave Malouf's three-layer Metrics Stack framework.

## Overview

This task guides the establishment of a comprehensive DesignOps measurement system. Following Malouf's principle: "Measure at all three levels: output, outcome, impact." The goal is to connect design work to business results while avoiding the trap of measuring activity without value.

## Prerequisites

- Basic understanding of current design operations
- Access to existing data sources (project tools, HR systems, etc.)
- Stakeholder alignment on what success looks like
- Tools or willingness to implement tracking

## Malouf Framework Reference

### The Metrics Stack
```
               IMPACT METRICS
              (Business Value)
                    |
             OUTCOME METRICS
           (Quality & Effectiveness)
                    |
              OUTPUT METRICS
           (Activity & Deliverables)
```

### Core Principle
> "You can't improve what you don't measure - but also, not everything needs measuring."

### Metrics by Three Lenses
| Lens | Output Examples | Outcome Examples | Impact Examples |
|------|-----------------|------------------|-----------------|
| How We Work | Throughput, cycle time | Quality, handoff success | Time to market |
| How We Grow | Hiring velocity, training hours | Retention, time to productivity | Talent attraction |
| How We Thrive | Community participation | Satisfaction scores | Design influence |

## Task Steps

### Phase 1: Define What to Measure

```yaml
step: 1
name: "Identify Measurement Goals"
questions:
  business:
    - "What does leadership need to know about design?"
    - "How is design success currently perceived?"
    - "What decisions need data support?"
  operational:
    - "What operational improvements are we targeting?"
    - "Where do we suspect inefficiencies?"
    - "What processes are we trying to optimize?"
  team:
    - "How do we know if the team is healthy?"
    - "What indicators suggest problems?"
    - "How do we track growth and development?"

goal_template: |
  ## MEASUREMENT GOALS

  ### Business Questions We Need to Answer
  1. [Question]: Required data: [data]
  2. [Question]: Required data: [data]

  ### Operational Questions We Need to Answer
  1. [Question]: Required data: [data]
  2. [Question]: Required data: [data]

  ### Team Health Questions We Need to Answer
  1. [Question]: Required data: [data]
  2. [Question]: Required data: [data]
```

### Phase 2: Select Output Metrics

```yaml
step: 2
name: "Define Output Metrics"
description: "What the team produces - activity and deliverables"
cadence: "Weekly or sprint-based"
warning: "Output metrics alone can incentivize wrong behaviors"

recommended_metrics:
  process:
    - name: "Design Throughput"
      definition: "Number of design deliverables completed per sprint"
      target: "Consistent or improving trend"
      collection: "Project management tool"

    - name: "Time to First Design"
      definition: "Days from brief to first design review"
      target: "< 5 days for standard projects"
      collection: "Project timestamps"

    - name: "Design Iteration Cycles"
      definition: "Number of major revisions per project"
      target: "2-3 cycles (not 0, not 10+)"
      collection: "Design tool version history"

    - name: "Handoff Completion Rate"
      definition: "% of handoffs with all required artifacts"
      target: "> 95%"
      collection: "Handoff checklist completion"

  tools:
    - name: "Tool Adoption Rate"
      definition: "% of team using standard tools"
      target: "> 95%"
      collection: "License/login data"

    - name: "Component Usage Rate"
      definition: "% of designs using design system components"
      target: "> 80%"
      collection: "Design system analytics"

    - name: "Asset Reuse Rate"
      definition: "% of new designs reusing existing assets"
      target: "> 60%"
      collection: "Design system analytics"

  growth:
    - name: "Hiring Velocity"
      definition: "Days from req open to offer accepted"
      target: "< 45 days"
      collection: "ATS data"

    - name: "Training Hours"
      definition: "Hours of training per designer per quarter"
      target: "> 20 hours"
      collection: "Learning system data"

selection_template: |
  ## SELECTED OUTPUT METRICS

  | Metric | Definition | Target | Source | Owner |
  |--------|------------|--------|--------|-------|
  | [metric] | [definition] | [target] | [source] | [owner] |
```

### Phase 3: Select Outcome Metrics

```yaml
step: 3
name: "Define Outcome Metrics"
description: "What the team achieves - quality and effectiveness"
cadence: "Monthly or quarterly"
warning: "Outcome metrics need context"

recommended_metrics:
  design_quality:
    - name: "Usability Test Success Rate"
      definition: "% of designs passing usability testing"
      target: "> 80%"
      collection: "Research results"

    - name: "Accessibility Compli
```