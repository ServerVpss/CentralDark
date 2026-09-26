# COMANDO - example-workflow.yaml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\templates\squad-template\workflows\example-workflow.yaml
**SHA:** ae6b2e5eadba6625
**Timestamp:** 2026-08-28T02:02:10.014106
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- prompt: "What would you like to do?"
- prompt: "What is the name of the item?"

### Ouro Bruto (primeiros 5000 chars)
```
# Example Workflow Definition
# Replace placeholders with your workflow's details

name: example-workflow
version: 1.0.0
description: Multi-step workflow that orchestrates tasks

trigger:
  command: "*example-command"
  agent: example-agent

elicitation:
  enabled: true
  questions:
    - id: action_type
      prompt: "What would you like to do?"
      type: choice
      options:
        - Create new item
        - Update existing item
        - Delete item

    - id: item_name
      prompt: "What is the name of the item?"
      type: text
      required: true

steps:
  - id: step-1
    task: example-task
    inputs:
      input1: "{{elicitation.item_name}}"
      options:
        action: "{{elicitation.action_type}}"
    on_success: step-2
    on_error: error-handler

  - id: step-2
    action: log-result
    description: Log the successful result
    inputs:
      message: "Operation completed successfully"

error_handling:
  - id: error-handler
    action: notify
    message: "Workflow failed: {{error.message}}"
    severity: error

completion:
  message: "Workflow completed successfully!"
  next_steps:
    - Review the output
    - Verify the changes

```