# COMANDO - facilitate-brainstorming-session.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\facilitate-brainstorming-session.md
**SHA:** a41594c9de95dd2d
**Timestamp:** 2026-08-28T02:02:05.941616
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - Prompt: "Build on or remix existing ideas. Generate 2-3 new ideas inspired by what you see."
- - Prompt: "Generate 1-2 unconventional or 'what if' ideas"

### Riscos
- blocker: true
- blocker: true
- blocker: true

### Ouro Bruto (primeiros 5000 chars)
```
---
id: facilitate-brainstorming-session
name: Facilitate Brainstorming Session
agent: aios-master
category: collaboration
complexity: medium
tools:
  - clickup        # Capture ideas and organize them
  - mcp            # Call specialized agents for domain expertise
checklists:
  - aios-master-checklist.md
---

# Facilitate Brainstorming Session

## Purpose

To conduct a structured brainstorming session with multiple AI agents (and optionally human participants) to generate, categorize, and prioritize ideas for features, solutions, or strategic decisions.

## Input

### Required Parameters

- **topic**: `string`
  - **Description**: The challenge, opportunity, or question to brainstorm about
  - **Example**: "How can we improve user onboarding for AIOS?"
  - **Validation**: Must be at least 20 characters

- **session_goal**: `string`
  - **Description**: What outcome is desired from this session
  - **Options**: `"ideation"` (generate many ideas), `"solution"` (solve a problem), `"strategy"` (strategic planning)
  - **Default**: `"ideation"`

### Optional Parameters

- **participating_agents**: `array<string>`
  - **Description**: Agent IDs to invite to the session
  - **Default**: Auto-select based on topic (using brief analysis)
  - **Example**: `["po", "architect", "ux-expert", "github-devops"]`

- **time_limit**: `number`
  - **Description**: Session duration in minutes
  - **Default**: `30`
  - **Range**: `10-60`

- **output_format**: `string`
  - **Description**: How to organize final output
  - **Options**: `"categorized"` (by theme), `"prioritized"` (by value), `"actionable"` (with next steps)
  - **Default**: `"categorized"`

- **context_documents**: `array<string>`
  - **Description**: Optional file paths for context (PRD, backlog, architecture docs)
  - **Example**: `["docs/prd.md", "docs/backlog.md"]`

## Output

- **ideas**: `array<object>`
  - **Structure**: `{ id, text, source_agent, category, priority, rationale }`
  - **Description**: All generated ideas with metadata

- **categories**: `array<object>`
  - **Structure**: `{ name, ideas_count, top_ideas }`
  - **Description**: Ideas grouped by theme

- **prioritized_recommendations**: `array<object>`
  - **Structure**: `{ idea, value_score, effort_estimate, roi, next_steps }`
  - **Description**: Top 5-10 ideas with actionable next steps

- **session_summary**: `object`
  - **Structure**: `{ topic, duration, agents_participated, ideas_generated, key_insights }`
  - **Description**: Session metadata and insights

- **clickup_board_url**: `string` (optional)
  - **Description**: ClickUp board with ideas organized (if ClickUp integration enabled)

## Process

### Phase 1: Setup & Context Loading (5 min)

1. **Load Context**
   - If `context_documents` provided, read and summarize key points
   - Extract relevant constraints, requirements, or goals

2. **Select Participating Agents**
   - If `participating_agents` not provided:
     - Analyze topic using brief analysis
     - Identify relevant domains (e.g., "user onboarding" → ux-expert, po, copywriter)
     - Auto-select 3-5 appropriate agents
   - Log: "✅ Session participants: [agent list]"

3. **Define Session Structure**
   - Based on `session_goal`:
     - **Ideation**: Divergent thinking (generate maximum ideas)
     - **Solution**: Convergent thinking (evaluate and refine)
     - **Strategy**: Structured frameworks (SWOT, OKRs, etc.)

### Phase 2: Divergent Thinking - Idea Generation (10-15 min)

4. **Round 1: Initial Ideas (5 min)**
   - Prompt each agent: "Generate 3-5 ideas for: {topic}"
   - Collect responses
   - No evaluation yet (pure brainstorming)

5. **Round 2: Build on Ideas (5 min)**
   - Share all ideas with agents
   - Prompt: "Build on or remix existing ideas. Generate 2-3 new ideas inspired by what you see."
   - Collect responses

6. **Round 3: Wild Cards (2 min)**
   - Prompt: "Generate 1-2 unconventional or 'what if' ideas"
   - Encourage creative risk-taking

### Phase 3: Convergent Thinking - Categorization (5-10 min)

7. **Categorize Ideas**
   - Use AI to identify themes/patterns
   - Group ideas into 3-7 categories
   - Example categories: "Quick Wins", "Big Bets", "Research Needed", "Technical Solutions", "UX Improvements"

8. **Deduplicate & Merge**
   - Identify similar ideas
   - Merge or link related concepts

### Phase 4: Evaluation & Prioritization (5-10 min)

9. **Score Ideas** (if `output_format: "prioritized"`)
   - Criteria:
     - **Value**: Impact on users/business (1-10)
     - **Effort**: Development complexity (1-10)
     - **ROI**: Value/Effort ratio
     - **Alignment**: Fits strategy/goals (1-10)
   - Calculate aggregate scores

10. **Select Top Ideas**
    - Identify top 5-10 ideas based on scores
    - For each, generate:
      - **Rationale**: Why this idea is valuable
      - **Next Steps**: Concrete actions to pursue it

### Phase 5: Documentation & Actionability (5 min)

11. **Create Session Report**
    - Summary of all ideas
    - Categ
```