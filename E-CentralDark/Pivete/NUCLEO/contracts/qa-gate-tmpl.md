# CONTRATO - qa-gate-tmpl.yaml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\product\templates\qa-gate-tmpl.yaml
**SHA:** a0d3e4a37ee8f719
**Timestamp:** 2026-08-28T02:02:21.330341
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- title: "QA Gate: {{gate_name}}"
- qa_gate:

### Ouro Bruto (primeiros 5000 chars)
```
template:
  id: qa-gate-template-v1
  name: QA Gate Definition
  version: 1.0
  output:
    format: yaml
    filename: "{{task_id}}-gate.yaml"
    title: "QA Gate: {{gate_name}}"

workflow:
  mode: interactive
  elicitation: detailed-elicitation

sections:
  - id: initial-setup
    instruction: |
      Initial Setup for QA Gate Definition

      A QA GATE is a validation checkpoint before task handoff.

      Gate Types:
      - blocking: Must pass to proceed (hard stop)
      - warning: Issues noted but can proceed (soft stop)
      - informational: Just for visibility (no stop)

      Output file location: `qa-gates/{{task_id}}-gate.yaml`

  - id: gate-metadata
    title: Gate Metadata
    instruction: |
      Elicit basic gate information.
    elicit: true
    template: |
      qa_gate:
        id: {{gate_id}}
        name: {{gate_name}}
        task_id: {{task_id}}
        type: {{gate_type}}
        validator: {{validator}}
        version: {{version}}

  - id: validation-criteria
    title: Validation Criteria
    instruction: |
      Define the criteria used to validate task output.
      Organize into categories: completeness, correctness, quality, compliance.
    elicit: true
    template: |
        criteria:
          completeness:
            {{#each completeness_checks}}
            - check: {{check}}
              required: {{required}}
              validation_method: {{method}}
            {{/each}}

          correctness:
            {{#each correctness_checks}}
            - check: {{check}}
              required: {{required}}
              validation_method: {{method}}
            {{/each}}

          quality:
            {{#each quality_checks}}
            - check: {{check}}
              required: {{required}}
              threshold: {{threshold}}
              validation_method: {{method}}
            {{/each}}

          compliance:
            {{#each compliance_checks}}
            - check: {{check}}
              required: {{required}}
              standard: {{standard}}
              validation_method: {{method}}
            {{/each}}

  - id: severity-levels
    title: Severity Levels
    instruction: |
      Define what constitutes different severity levels for issues found.
    elicit: true
    template: |
        severity:
          critical:
            description: {{critical_description}}
            examples:
              {{#each critical_examples}}
              - {{this}}
              {{/each}}

          major:
            description: {{major_description}}
            examples:
              {{#each major_examples}}
              - {{this}}
              {{/each}}

          minor:
            description: {{minor_description}}
            examples:
              {{#each minor_examples}}
              - {{this}}
              {{/each}}

  - id: validation-process
    title: Validation Process
    instruction: |
      Define the step-by-step process for running this QA gate.
    elicit: true
    template: |
        validation_process:
          steps:
            {{#each validation_steps}}
            - step: {{step_number}}
              action: {{action}}
              {{#if automated}}
              automation:
                tool: {{automation_tool}}
                script: {{automation_script}}
              {{/if}}
              {{#if manual}}
              manual_check:
                instruction: {{manual_instruction}}
                reviewer: {{reviewer}}
              {{/if}}
            {{/each}}

  - id: decision-matrix
    title: Decision Matrix
    instruction: |
      Define the decision logic based on validation results.
    elicit: true
    template: |
        decision_matrix:
          pass:
            condition: {{pass_condition}}
            action: {{pass_action}}
            next_step: {{next_step_on_pass}}

          concerns:
            condition: {{concerns_condition}}
            action: {{concerns_action}}
            requires_review: {{requires_review}}
            reviewer: {{reviewer}}

          fail:
            condition: {{fail_condition}}
            action: {{fail_action}}
            {{#if gate_type == "blocking"}}
            blocks_handoff: true
            {{/if}}
            remediation_required: true

          waived:
            condition: {{waived_condition}}
            waiver_authority: {{waiver_authority}}
            waiver_reason_required: true
            documentation_required: true

  - id: issue-template
    title: Issue Template
    instruction: |
      Define the template for documenting issues found during QA.
    elicit: true
    template: |
        issue_template:
          fields:
            - issue_id: Auto-generated
            - severity: [critical | major | minor]
            - category: [completeness | correctness | quality | compliance]
            - description: {{issue_description_format}}
            - location: {{location_format}}
            - remediation: {{remediation_format}}
          
```