# MISSAO - google-workspace.yaml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\infrastructure\tools\mcp\google-workspace.yaml
**SHA:** f017c3154e9d480f
**Timestamp:** 2026-08-28T02:02:16.677809
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- - pattern: missing_oauth_scopes
- - pattern: ignoring_quota_limits
- - pattern: hardcoded_file_ids

### Ouro Bruto (primeiros 5000 chars)
```
tool:
  schema_version: 2.0
  id: google-workspace
  type: mcp
  name: Google Workspace
  version: 1.0.0
  description: Google Workspace integration with multi-service support (Drive, Docs, Sheets, Calendar, Gmail) and OAuth authentication
  knowledge_strategy: executable

  executable_knowledge:
    validators:
      # Drive operations - create_file
      - id: validate-create-file
        validates: create_file
        language: javascript
        checks:
          - required_fields: [name]
        function: |
          (function() {
            const errors = [];
            const params = args.args;

            if (!params.name) {
              errors.push({
                field: 'name',
                message: 'name is required for create_file'
              });
            }
            if (!params.content && !params.fileUrl) {
              errors.push({
                field: 'content',
                message: 'Either content or fileUrl is required for create_file'
              });
            }
            if (params.mimeType && !/^[\w\-\.]+\/[\w\-\.+]+$/.test(params.mimeType)) {
              errors.push({
                field: 'mimeType',
                message: 'Invalid mimeType format'
              });
            }

            return {
              valid: errors.length === 0,
              errors: errors
            };
          })();

      # Drive operations - share_file
      - id: validate-share-file
        validates: share_file
        language: javascript
        checks:
          - required_fields: [fileId]
        function: |
          (function() {
            const errors = [];
            const params = args.args;

            if (!params.fileId) {
              errors.push({
                field: 'fileId',
                message: 'fileId is required for share_file'
              });
            }
            if (!params.emailAddress && !params.type) {
              errors.push({
                field: 'emailAddress',
                message: 'Either emailAddress or type (anyone/domain) is required'
              });
            }

            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (params.emailAddress && !emailRegex.test(params.emailAddress)) {
              errors.push({
                field: 'emailAddress',
                message: 'emailAddress must be a valid email address'
              });
            }

            if (params.role && !['reader', 'writer', 'commenter', 'owner'].includes(params.role)) {
              errors.push({
                field: 'role',
                message: 'role must be one of: reader, writer, commenter, owner'
              });
            }

            return {
              valid: errors.length === 0,
              errors: errors
            };
          })();

      # Calendar operations - create_event
      - id: validate-create-event
        validates: create_event
        language: javascript
        checks:
          - required_fields: [user_google_email, summary, startTime, endTime]
        function: |
          (function() {
            const errors = [];
            const params = args.args;

            if (!params.user_google_email) {
              errors.push({
                field: 'user_google_email',
                message: 'user_google_email is required for create_event'
              });
            }
            if (!params.summary) {
              errors.push({
                field: 'summary',
                message: 'summary is required for create_event'
              });
            }
            if (!params.startTime && !params.start_time) {
              errors.push({
                field: 'startTime',
                message: 'startTime is required for create_event'
              });
            }
            if (!params.endTime && !params.end_time) {
              errors.push({
                field: 'endTime',
                message: 'endTime is required for create_event'
              });
            }

            // DateTime format validation (ISO 8601)
            const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/;
            if (params.startTime && !iso8601Regex.test(params.startTime)) {
              errors.push({
                field: 'startTime',
                message: 'startTime must be valid ISO 8601 format'
              });
            }
            if (params.endTime && !iso8601Regex.test(params.endTime)) {
              errors.push({
                field: 'endTime',
                message: 'endTime must be valid ISO 8601 format'
              });
            }

            // Attendees format validation
            if (params.attendees && !Array.isArray(params.attendees)) {
              errors.push({
                field: 'attendees',
                message: 'attendees must be an array of email addresses'
              });
            }

            // Validate individual attendee emai
```