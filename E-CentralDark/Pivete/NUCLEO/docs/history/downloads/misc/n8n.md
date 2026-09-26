# OUTRO - n8n.yaml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\infrastructure\tools\mcp\n8n.yaml
**SHA:** f9d9536ec47f9911
**Timestamp:** 2026-08-28T02:02:16.690830
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Start:

### Padroes
- - pattern: sequential
- - pattern: parallel
- - pattern: conditional
- - pattern: loop
- - pattern: missing_error_handling
- - pattern: invalid_node_connections
- - pattern: missing_credentials

### Ouro Bruto (primeiros 5000 chars)
```
tool:
  schema_version: 2.0
  id: n8n
  type: mcp
  name: n8n Workflow Automation
  version: 1.0.0
  description: n8n workflow management with execution validation and credential handling
  knowledge_strategy: executable

  executable_knowledge:
    validators:
      # Combined validator for execute_workflow
      - id: validate-execute-workflow
        validates: execute_workflow
        language: javascript
        checks:
          - required_fields: [workflow_id]
        function: |
          (function() {
            const errors = [];

            // 1. Required workflow_id
            if (!args.args.workflow_id && !args.args.workflowId) {
              errors.push("workflow_id is required");
            }

            // 2. Validate data parameter structure if provided
            if (args.args.data) {
              if (typeof args.args.data !== 'object') {
                errors.push("data must be an object");
              }
            }

            // 3. Validate wait_for_completion is boolean
            if (args.args.wait_for_completion !== undefined &&
                typeof args.args.wait_for_completion !== 'boolean') {
              errors.push("wait_for_completion must be boolean");
            }

            return {
              valid: errors.length === 0,
              errors: errors
            };
          })();

      # Validator for create_workflow
      - id: validate-create-workflow
        validates: create_workflow
        language: javascript
        function: |
          (function() {
            const errors = [];

            // 1. Required name field
            if (!args.args.name) {
              errors.push("name is required");
            }

            // 2. Validate nodes structure if provided
            if (args.args.nodes) {
              if (!Array.isArray(args.args.nodes)) {
                errors.push("nodes must be an array");
              } else {
                args.args.nodes.forEach((node, index) => {
                  if (!node.type) {
                    errors.push(`nodes[${index}] missing required 'type' field`);
                  }
                  if (!node.name) {
                    errors.push(`nodes[${index}] missing required 'name' field`);
                  }
                });
              }
            }

            // 3. Validate connections structure
            if (args.args.connections) {
              if (typeof args.args.connections !== 'object') {
                errors.push("connections must be an object");
              }
            }

            return {
              valid: errors.length === 0,
              errors: errors
            };
          })();

      # Validator for create_credential
      - id: validate-create-credential
        validates: create_credential
        language: javascript
        function: |
          (function() {
            const errors = [];

            if (!args.args.name) {
              errors.push("name is required for create_credential");
            }
            if (!args.args.type) {
              errors.push("type is required for create_credential");
            }
            if (!args.args.data) {
              errors.push("data is required for create_credential");
            } else if (typeof args.args.data !== 'object') {
              errors.push("data must be an object");
            }

            return {
              valid: errors.length === 0,
              errors: errors
            };
          })();

      # Validator for update_credential
      - id: validate-update-credential
        validates: update_credential
        language: javascript
        function: |
          (function() {
            const errors = [];

            if (!args.args.credential_id && !args.args.credentialId) {
              errors.push("credential_id is required for update_credential");
            }

            return {
              valid: errors.length === 0,
              errors: errors
            };
          })();

      # Validator for delete_credential
      - id: validate-delete-credential
        validates: delete_credential
        language: javascript
        function: |
          (function() {
            const errors = [];

            if (!args.args.credential_id && !args.args.credentialId) {
              errors.push("credential_id is required for delete_credential");
            }

            return {
              valid: errors.length === 0,
              errors: errors
            };
          })();

    helpers:
      - id: extract-workflow-state
        language: javascript
        runtime: isolated_vm
        description: "Extract current state from workflow execution"
        function: |
          (function() {
            const { execution } = args;
            if (!execution) return null;

            return {
              id: execution.id,
              status: execution.finished ? 'finished' : execution.stoppedAt ? 'stopped' : 'running',
              startedAt: ex
```