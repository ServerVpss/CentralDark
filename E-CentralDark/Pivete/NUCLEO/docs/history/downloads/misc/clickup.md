# OUTRO - clickup.yaml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\infrastructure\tools\mcp\clickup.yaml
**SHA:** f8d1858164e629f7
**Timestamp:** 2026-08-28T02:02:16.610376
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- - pattern: wrong_assignee_format
- - pattern: missing_custom_field_validation
- - pattern: undocumented_rate_limit_handling

### Ouro Bruto (primeiros 5000 chars)
```
tool:
  schema_version: 2.0
  id: clickup
  type: mcp
  name: ClickUp
  version: 1.0.0
  description: ClickUp project management with pre-execution validation and API complexity handling
  knowledge_strategy: executable

  executable_knowledge:
    validators:
      # Combined validator for create_task (all checks in one function)
      - id: validate-create-task
        validates: create_task
        language: javascript
        checks:
          - required_fields: [name, list_id]
        function: |
          (function() {
            const errors = [];

            // 1. Required fields
            if (!args.args.name) {
              errors.push("name is required");
            }
            if (!args.args.list_id && !args.args.listId) {
              errors.push("list_id is required");
            }

            // 2. Assignee format (must be array for create)
            if (args.args.assignees && typeof args.args.assignees === 'object' && !Array.isArray(args.args.assignees)) {
              errors.push("assignees must be array for create_task, got object");
            }

            // 3. Custom fields structure
            const customFields = args.args.custom_fields;
            if (customFields) {
              if (!Array.isArray(customFields)) {
                errors.push("custom_fields must be an array");
              } else {
                customFields.forEach((field, index) => {
                  if (!field.id) {
                    errors.push(`custom_fields[${index}] missing required 'id' field`);
                  }
                  if (!field.hasOwnProperty('value')) {
                    errors.push(`custom_fields[${index}] missing required 'value' field`);
                  }
                });
              }
            }

            // 4. List ID format (numeric string)
            const listId = args.args.list_id || args.args.listId;
            if (listId && !/^\d+$/.test(String(listId))) {
              errors.push("list_id must be a numeric string");
            }

            // 5. Priority range (1-4)
            const priority = args.args.priority;
            if (priority !== undefined && priority !== null) {
              const p = Number(priority);
              if (isNaN(p) || p < 1 || p > 4) {
                errors.push("priority must be between 1 (urgent) and 4 (low)");
              }
            }

            // 6. Time estimate (positive number)
            const timeEstimate = args.args.time_estimate;
            if (timeEstimate !== undefined) {
              const estimate = Number(timeEstimate);
              if (isNaN(estimate) || estimate < 0) {
                errors.push("time_estimate must be a positive number (milliseconds)");
              }
            }

            return {
              valid: errors.length === 0,
              errors: errors
            };
          })();

      # Combined validator for update_task
      - id: validate-update-task
        validates: update_task
        language: javascript
        function: |
          (function() {
            const errors = [];
            const assignees = args.args.assignees;

            // Assignees format (must be object with add/rem for update)
            if (assignees) {
              if (Array.isArray(assignees)) {
                errors.push("assignees must be object {add: [], rem: []} for update_task, got array");
              } else if (typeof assignees === 'object') {
                if (assignees.add && !Array.isArray(assignees.add)) {
                  errors.push("assignees.add must be an array");
                }
                if (assignees.rem && !Array.isArray(assignees.rem)) {
                  errors.push("assignees.rem must be an array");
                }
              }
            }

            return {
              valid: errors.length === 0,
              errors: errors
            };
          })();

      # Validator for parse_webhook
      - id: validate-webhook-payload
        validates: parse_webhook
        language: javascript
        function: |
          (function() {
            const errors = [];
            const payload = args.args;

            if (!payload) {
              errors.push("payload is required");
            } else {
              // Check for required webhook identification fields
              if (!payload.event && !payload.webhook_id && !payload.history_items) {
                errors.push("Invalid webhook payload: missing event, webhook_id, or history_items");
              }
            }

            return {
              valid: errors.length === 0,
              errors: errors
            };
          })();

    helpers:
      - id: extract-custom-field
        language: javascript
        runtime: isolated_vm
        description: "Extract specific custom field value from task response"
        function: |
          (function() {
            const { response, fieldName } = args;
            if (!response || !response.custom_
```