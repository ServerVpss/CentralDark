# COMANDO - design-triage.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\aiox-core\squads\design-studio\tasks\design-triage.md
**SHA:** 22f68ae90ccfc927
**Timestamp:** 2026-08-28T13:25:06.911856
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- For MULTI_DOMAIN requests, select workflow pattern:
- workflow_pattern: "{If multi-domain}"
- workflow_pattern: null  # or workflow ID if multi-domain

### Ouro Bruto (primeiros 5000 chars)
```
# Design Triage - Request Classification and Routing

> Task ID: design-triage
> Agent: Design Chief (Orchestrator)
> Version: 1.0.0

## Purpose

Analyze incoming design requests, classify them by type (brand, UI, photo, video, business), assess complexity, and route to the appropriate specialist agent. This is the gateway task that ensures every design request reaches the expert best suited to deliver results.

## Context

The Design Squad consists of 9 elite specialists organized in three tiers:

**TIER 0 - Foundation (Strategy)**
- @marty-neumeier: Brand Strategy, Positioning, Differentiation
- @dave-malouf: DesignOps, Team Scaling, Processes

**TIER 1 - Masters (Execution)**
- @chris-do: Design Business, Pricing, Client Negotiation
- @paddy-galloway: YouTube Strategy, Thumbnails, CTR Optimization
- @joe-mcnally: Photography, Lighting, Flash Techniques

**TIER 2 - Specialists (Craft)**
- @brad-frost: Design Systems, Atomic Design, Tokens
- @aaron-draplin: Logo Design, Brand Marks, Visual Identity
- @peter-mckinnon: Photo/Video Editing, Lightroom, Color Grading

Design Chief's role is NEVER to execute - only to route intelligently.

## Prerequisites

- Active Design Chief context (`@design-chief` or `/design-studio:agents:design-chief`)
- Incoming design request from user
- Understanding of specialist capabilities and tier system

## Inputs

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| request | string | Yes | User's design request or project description |
| context | object | No | Additional context (business type, constraints, timeline) |
| priority | string | No | Priority level: low, medium, high, urgent |

## Workflow

### Phase 1: Request Analysis

**Step 1.1: Extract Core Intent**
- Parse the user's request for primary objective
- Identify key deliverables mentioned (logo, thumbnail, photo, system, etc.)
- Note any explicit specialist mentions or preferences
- Validation: Primary intent identified

**Step 1.2: Keyword Detection**
Execute keyword matching against routing matrix:

```yaml
brand_keywords:
  - brand, marca, identidade, posicionamento, diferenciacao, zag
  - route: @marty-neumeier

scaling_keywords:
  - escalar, scale, operacoes, processos, designops, team, governanca
  - route: @dave-malouf (then @brad-frost if system needed)

pricing_keywords:
  - preco, pricing, valor, cobrar, proposta, cliente, negociacao
  - route: @chris-do

logo_keywords:
  - logo, logotipo, marca grafica, simbolo, identidade visual, brand mark
  - route: @aaron-draplin

thumbnail_keywords:
  - thumbnail, miniatura, youtube, click, ctr, video cover
  - route: @paddy-galloway

photography_keywords:
  - foto, iluminacao, flash, retrato, lighting, portrait, shoot
  - route: @joe-mcnally (then @peter-mckinnon for editing)

system_keywords:
  - design system, tokens, components, atomic, padronizacao, ui library
  - route: @brad-frost

editing_keywords:
  - edicao, lightroom, preset, color grade, retouch, editing
  - route: @peter-mckinnon
```

- Validation: At least one keyword category matched OR marked as ambiguous

**Step 1.3: Complexity Assessment**
Evaluate request complexity on three axes:

```yaml
scope_complexity:
  single_deliverable: 1  # Just a logo
  multiple_deliverables: 2  # Logo + guidelines
  full_project: 3  # Complete rebrand

specialist_count:
  single: 1  # One specialist can handle
  sequential: 2  # Multiple specialists, sequential
  parallel: 3  # Multiple specialists, parallel work

timeline_pressure:
  flexible: 1  # No deadline
  defined: 2  # Has deadline
  urgent: 3  # Rush job
```

- Calculate complexity score: (scope + specialists + timeline) / 3
- Validation: Complexity score between 1.0 and 3.0

### Phase 2: Classification

**Step 2.1: Determine Request Type**

```yaml
request_types:
  BRAND_STRATEGY:
    description: "Strategic brand work - positioning, differentiation"
    primary_specialist: @marty-neumeier
    indicators:
      - New brand creation
      - Brand repositioning
      - Competitive differentiation
      - Brand voice/personality

  VISUAL_IDENTITY:
    description: "Logo and brand mark creation"
    primary_specialist: @aaron-draplin
    indicators:
      - Logo design request
      - Brand mark update
      - Visual identity system

  DESIGN_SYSTEM:
    description: "UI patterns, tokens, component libraries"
    primary_specialist: @brad-frost
    indicators:
      - Design system creation
      - Component audit
      - Token extraction
      - Pattern consolidation

  YOUTUBE_VISUAL:
    description: "YouTube thumbnails and channel visuals"
    primary_specialist: @paddy-galloway
    indicators:
      - Thumbnail optimization
      - CTR improvement
      - YouTube strategy

  PHOTOGRAPHY:
    description: "Photo capture and lighting"
    primary_specialist: @joe-mcnally
    indicators:
      - Product photography
      - Portrait session
      - Lighting setup

  PHOTO_VIDEO_EDITING:
    description: "Post-production editin
```