# COMANDO - research-prompt-tmpl.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\templates\research-prompt-tmpl.md
**SHA:** 000676982a6f1a22
**Timestamp:** 2026-08-28T02:02:09.789260
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- # Deep Research Prompt: {{specialist_name}} {{activity_expanded}} Methodology
- # Deep Research Prompt: Eugene Schwartz Headline Creation Methodology

### Ouro Bruto (primeiros 5000 chars)
```
# Deep Research Prompt Template

**Template ID:** research-prompt-template-v1
**Purpose:** Generate structured deep research prompts for agent creation
**Based On:** Meta-framework for Deep Research prompt construction

---

## Template Variables

| Variable                   | Type   | Description              | Example                              |
| -------------------------- | ------ | ------------------------ | ------------------------------------ |
| `{{specialist_name}}`      | string | Human expert name        | "Gary Halbert"                       |
| `{{specialist_slug}}`      | string | Slug format              | "gary_halbert"                       |
| `{{activity}}`             | string | Specific activity        | "sales-page"                         |
| `{{activity_expanded}}`    | string | Expanded description     | "Sales Page Creation"                |
| `{{domain}}`               | string | Domain area              | "copywriting"                        |
| `{{time_period}}`          | string | Relevant years           | "1970-2007"                          |
| `{{agent_purpose}}`        | string | What agent does          | "Create high-converting sales pages" |
| `{{local_knowledge_note}}` | string | What's already available | "Already have 3,520 lines..."        |
| `{{scope_items}}`          | array  | 4-6 research angles      | [...]                                |
| `{{requirements}}`         | array  | 3-4 research parameters  | [...]                                |
| `{{sources}}`              | array  | 3-4 source types         | [...]                                |
| `{{deliverables}}`         | array  | 3-5 expected outputs     | [...]                                |

---

## Prompt Template

```markdown
# Deep Research Prompt: {{specialist_name}} {{activity_expanded}} Methodology

---

## REFINED TOPIC

"The {{activity_expanded}} Engineering of {{specialist_name}}: {{topic_description}} ({{time_period}})"

---

## CONTEXT

{{context_paragraph}}

---

## SCOPE

{{#each scope_items}}

### {{this.number}}. {{this.title}}

{{#each this.sub_points}}

- {{this}}
  {{/each}}

{{/each}}

---

## REQUIREMENTS

{{#each requirements}}
{{this.number}}. {{this.text}}
{{/each}}

---

## RECOMMENDED SOURCES

{{#each sources}}

- {{this}}
  {{/each}}

---

## EXPECTED RESULTS

{{#each deliverables}}
{{this.number}}. "{{this.name}}" - {{this.description}}
{{/each}}

---

## CLARIFYING QUESTIONS (Optional)

{{#each clarifying_questions}}
{{this.number}}. {{this.question}}
{{/each}}

---

## RESEARCH NOTES

{{#if local_knowledge_note}}
**Existing Material:** {{local_knowledge_note}}
**Research Mode:** Complementary (focus on gaps)
{{else}}
**Existing Material:** None found
**Research Mode:** Comprehensive
{{/if}}
```

---

## Pre-Built Scope Templates by Domain

### Copywriting (Specialist-Based)

```yaml
scope_templates:
  copywriting:
    - title: "{{SPECIALIST_NAME}}'S CORE METHODOLOGY"
      sub_points:
        - 'Fundamental principles and rules (explicit statements)'
        - 'Process/workflow from start to finish'
        - 'Quality criteria they used to evaluate work'
        - 'What they considered mistakes/anti-patterns'

    - title: '{{OUTPUT_TYPE}} ANATOMY/STRUCTURE'
      sub_points:
        - 'Section-by-section breakdown'
        - 'Purpose of each section'
        - 'Transitions between sections'
        - 'Length/proportion guidelines'

    - title: 'REAL EXAMPLES ANALYZED'
      sub_points:
        - "{{Specialist}}'s best known works"
        - 'Line-by-line or section-by-section analysis'
        - 'What made them effective'
        - 'Common patterns across winners'

    - title: 'CREATION PROCESS'
      sub_points:
        - 'Research phase before writing'
        - 'Drafting methodology'
        - 'Revision and editing process'
        - 'Testing and iteration'

    - title: 'MODERN ADAPTATION (2025)'
      sub_points:
        - 'Digital equivalents of original techniques'
        - 'What principles remain timeless'
        - 'What needs adjustment for modern context'
        - 'Platform-specific considerations'

    - title: 'QUALITY CRITERIA & CHECKLISTS'
      sub_points:
        - 'How {{specialist}} evaluated their own work'
        - 'Red flags and warning signs'
        - 'Approval criteria before shipping'
        - 'Comparison: excellent vs weak examples'
```

### Product Management (Generic)

```yaml
scope_templates:
  product_management:
    - title: 'FRAMEWORK COMPARISON'
      sub_points:
        - 'Major frameworks in this area'
        - 'When to use which approach'
        - 'Pros/cons of each'
        - 'Integration possibilities'

    - title: 'PROCESS & METHODOLOGY'
      sub_points:
        - 'Step-by-step workflow'
        - 'Key decision points'
        - 'Inputs and outputs at each stage'
        - 'Time allocation guidelines'

    - title: 'TECHNIQUES & TOOLS'
      sub_points:
        - 'Specific techniques with how-to'
        - 'Tools tha
```