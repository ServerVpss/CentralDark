# COMANDO - create-service.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\create-service.md
**SHA:** 6ce3eeeab6ed8ff6
**Timestamp:** 2026-08-28T02:02:05.435505
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- pattern: "^[a-z][a-z0-9-]*$"
- const namePattern = /^[a-z][a-z0-9-]*$/;

### Riscos
- blocker: true
- blocker: true
- blocker: true
- blocker: true
- blocker: false
- blocker: false

### Ouro Bruto (primeiros 5000 chars)
```
# Create Service

## Purpose

Create a new service using standardized Handlebars templates from WIS-10. Generates consistent TypeScript service structures with proper configuration, testing, and documentation.

## Task Definition (AIOS Task Format V1.0)

```yaml
task: createService()
agent: "@dev"
responsável: Dex (Developer)
responsavel_type: Agente
atomic_layer: Config

elicit: true

inputs:
  - name: service_name
    type: string
    required: true
    pattern: "^[a-z][a-z0-9-]*$"
    validation: Must be kebab-case, start with letter

  - name: service_type
    type: enum
    options: ["api-integration", "utility", "agent-tool"]
    required: true
    default: "utility"

  - name: has_auth
    type: boolean
    required: false
    default: false

  - name: description
    type: string
    required: true
    validation: Non-empty, max 200 characters

  - name: env_vars
    type: array
    required: false
    default: []

outputs:
  - name: service_directory
    type: directory
    location: ".aios-core/infrastructure/services/{service_name}/"
    persistido: true

  - name: files_created
    type: array
    destino: Memory
    persistido: false
```

---

## Pre-Conditions

```yaml
pre-conditions:
  - [ ] WIS-10 templates exist at .aios-core/development/templates/service-template/
    tipo: pre-condition
    blocker: true
    validação: Check template directory exists with required .hbs files
    error_message: "Templates not found. Run WIS-10 first."

  - [ ] Service name is unique (no existing service with same name)
    tipo: pre-condition
    blocker: true
    validação: Check .aios-core/infrastructure/services/{name}/ does not exist
    error_message: "Service '{name}' already exists. Choose a different name."

  - [ ] Service name follows kebab-case pattern
    tipo: pre-condition
    blocker: true
    validação: Regex match ^[a-z][a-z0-9-]*$
    error_message: "Invalid name. Use kebab-case (e.g., my-api-service)"
```

---

## Interactive Elicitation Process

### Step 1: Service Name
```
ELICIT: Service Name

What is the service name?
(Use kebab-case, e.g., "github-api", "file-processor", "auth-helper")

→ Validation: ^[a-z][a-z0-9-]*$
→ Check: Unique (not existing)
→ On invalid: Re-prompt with error message
```

### Step 2: Service Type
```
ELICIT: Service Type

What type of service is this?

1. api-integration - External API client with rate limiting and auth
2. utility - Internal helper/utility service
3. agent-tool - Tool for AIOS agents

→ Default: utility
→ If api-integration: Enable client.ts generation
```

### Step 3: Authentication
```
ELICIT: Authentication Required

Does this service require authentication?

1. Yes - Include auth configuration and secure headers
2. No - No authentication needed

→ Default: No
→ If Yes: Add auth placeholders to config
```

### Step 4: Description
```
ELICIT: Service Description

Brief description of the service:
(Max 200 characters, will appear in README and JSDoc)

→ Validation: Non-empty, <= 200 chars
```

### Step 5: Environment Variables
```
ELICIT: Environment Variables

What environment variables does this service need?
(Enter comma-separated list, or 'none')

Examples: API_KEY, BASE_URL, TIMEOUT_MS

→ Default: none
→ Parse: Split by comma, trim whitespace
→ Generate: .env.example entries
```

---

## Implementation Steps

### Step 1: Validate Inputs
```javascript
// Validate service_name
const namePattern = /^[a-z][a-z0-9-]*$/;
if (!namePattern.test(serviceName)) {
  throw new Error(`Invalid service name: ${serviceName}. Use kebab-case.`);
}

// Check uniqueness
const targetDir = `.aios-core/infrastructure/services/${serviceName}/`;
if (fs.existsSync(targetDir)) {
  throw new Error(`Service '${serviceName}' already exists.`);
}
```

### Step 2: Load Templates
```javascript
const templateDir = '.aios-core/development/templates/service-template/';
const templates = [
  'README.md.hbs',
  'index.ts.hbs',
  'types.ts.hbs',
  'errors.ts.hbs',
  'package.json.hbs',
  'tsconfig.json',      // Static (no .hbs)
  'jest.config.js',     // Static (no .hbs)
  '__tests__/index.test.ts.hbs'
];

// Conditional: client.ts.hbs only for api-integration
if (serviceType === 'api-integration') {
  templates.push('client.ts.hbs');
}
```

### Step 3: Prepare Template Context
```javascript
const context = {
  serviceName: serviceName,                    // kebab-case
  pascalCase: toPascalCase(serviceName),       // PascalCase
  camelCase: toCamelCase(serviceName),         // camelCase
  description: description,
  isApiIntegration: serviceType === 'api-integration',
  hasAuth: hasAuth,
  envVars: envVars.map(v => ({
    name: v,
    description: `${v} environment variable`
  })),
  storyId: 'WIS-11',
  createdAt: new Date().toISOString().split('T')[0]
};
```

### Step 4: Generate Files
```javascript
// Create target directory
fs.mkdirSync(targetDir, { recursive: true });
fs.mkdirSync(`${targetDir}__tests__/`, { recursive: true });

// Process each template
for (const temp
```