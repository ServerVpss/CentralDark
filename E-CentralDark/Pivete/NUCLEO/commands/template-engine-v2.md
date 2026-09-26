# COMANDO - template-engine-v2.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\es\guides\template-engine-v2.md
**SHA:** 551a558ff3c28181
**Timestamp:** 2026-08-28T02:02:35.104455
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- **Retorna:** `Object` - `{ valid: boolean, missing: string[], found: string[] }`
- console.error('Missing:', validation.missing);

### Ouro Bruto (primeiros 5000 chars)
```
<!--
  Traducción: ES
  Original: /docs/en/guides/template-engine-v2.md
  Última sincronización: 2026-01-26
-->

# Motor de Plantillas v2.0

> 🌐 [EN](../../guides/template-engine-v2.md) | [PT](../../pt/guides/template-engine-v2.md) | **ES**

---

> Motor de generación de documentos y sustitución de variables para Synkra AIOS.

**Versión:** 2.0
**Última Actualización:** 2025-12-05

---

## Descripción General

El Motor de Plantillas proporciona una forma consistente de generar documentos (PRDs, ADRs, Stories, etc.) con sustitución de variables, condicionales y bucles. Potencia todas las tareas de generación de documentos en AIOS.

### Características Principales

| Característica | Sintaxis                                | Descripción                               |
| -------------- | --------------------------------------- | ----------------------------------------- |
| Variables      | `{{VAR_NAME}}`                          | Sustitución simple de variables           |
| Condicionales  | `{{#IF_CONDITION}}...{{/IF_CONDITION}}` | Bloques condicionales                     |
| Bucles         | `{{#EACH_ITEMS}}...{{/EACH_ITEMS}}`     | Iterar sobre arrays                       |
| Rutas Anidadas | `{{user.name}}`                         | Acceder a propiedades de objetos anidados |
| Escape         | `\{{literal}}`                          | Prevenir el procesamiento de plantilla    |

---

## Inicio Rápido

### Uso Básico

```javascript
const TemplateEngine = require('./.aios-core/infrastructure/scripts/template-engine');

const engine = new TemplateEngine();

const template = `
# {{TITLE}}

Created by: {{AUTHOR}}
Date: {{DATE}}

## Summary
{{SUMMARY}}
`;

const variables = {
  TITLE: 'My Document',
  AUTHOR: 'Dex (@dev)',
  DATE: '2025-12-05',
  SUMMARY: 'This is a generated document.',
};

const output = engine.process(template, variables);
console.log(output);
```

### Salida

```markdown
# My Document

Created by: Dex (@dev)
Date: 2025-12-05

## Summary

This is a generated document.
```

---

## Referencia de API

### Clase TemplateEngine

```javascript
const TemplateEngine = require('./.aios-core/infrastructure/scripts/template-engine');
const engine = new TemplateEngine();
```

### Métodos

#### `process(template, variables)`

Procesa una cadena de plantilla con las variables proporcionadas.

**Parámetros:**

- `template` (string) - Cadena de plantilla con marcadores de posición
- `variables` (Object) - Pares clave-valor para sustitución

**Retorna:** `string` - Plantilla procesada

```javascript
const result = engine.process('Hello, {{NAME}}!', { NAME: 'World' });
// Retorna: "Hello, World!"
```

#### `loadAndProcess(templatePath, variables)`

Carga un archivo de plantilla y lo procesa.

**Parámetros:**

- `templatePath` (string) - Ruta al archivo de plantilla
- `variables` (Object) - Variables a sustituir

**Retorna:** `Promise<string>` - Plantilla procesada

```javascript
const result = await engine.loadAndProcess('.aios-core/product/templates/story-tmpl.md', {
  STORY_ID: '3.12',
  TITLE: 'Documentation',
});
```

#### `validateTemplate(template, requiredVars)`

Valida que una plantilla tenga todos los marcadores de posición requeridos.

**Parámetros:**

- `template` (string) - Plantilla a validar
- `requiredVars` (string[]) - Lista de nombres de variables requeridas

**Retorna:** `Object` - `{ valid: boolean, missing: string[], found: string[] }`

```javascript
const validation = engine.validateTemplate(template, ['TITLE', 'DATE']);
if (!validation.valid) {
  console.error('Missing variables:', validation.missing);
}
```

#### `getTemplateVariables(template)`

Extrae todas las variables usadas en una plantilla.

**Parámetros:**

- `template` (string) - Plantilla a analizar

**Retorna:** `Object` - `{ simple: string[], conditionals: string[], loops: string[] }`

```javascript
const vars = engine.getTemplateVariables(template);
console.log('Variables needed:', vars.simple);
console.log('Conditionals:', vars.conditionals);
console.log('Loop variables:', vars.loops);
```

#### `escapeInput(input)`

Escapa caracteres especiales en la entrada del usuario para prevenir inyección.

**Parámetros:**

- `input` (string) - Entrada del usuario a escapar

**Retorna:** `string` - Entrada escapada

```javascript
const safeInput = engine.escapeInput(userProvidedValue);
```

---

## Sintaxis de Plantillas

### Variables Simples

```markdown
# {{TITLE}}

Author: {{AUTHOR}}
Version: {{VERSION}}
```

### Variables Anidadas

Accede a propiedades de objetos anidados con notación de punto:

```markdown
Project: {{project.name}}
Owner: {{project.owner.name}}
Email: {{project.owner.email}}
```

```javascript
const variables = {
  project: {
    name: 'AIOS',
    owner: {
      name: 'Pedro',
      email: 'pedro@example.com',
    },
  },
};
```

### Condicionales

Incluye contenido solo si una variable es verdadera (truthy):

```markdown
{{#IF_HAS_DEPENDENCIES}}

## Dependencies

This project depends on:
{{DEPENDENCIES}}
{
```

---

# COMANDO - template-engine-v2.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\guides\template-engine-v2.md
**SHA:** eddd795ff40438da
**Timestamp:** 2026-08-28T02:02:36.489051
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- **Returns:** `Object` - `{ valid: boolean, missing: string[], found: string[] }`
- console.error('Missing:', validation.missing);

### Ouro Bruto (primeiros 5000 chars)
```
# Template Engine v2.0

> **EN** | [PT](../pt/guides/template-engine-v2.md) | [ES](../es/guides/template-engine-v2.md)

---

> Document generation and variable substitution engine for Synkra AIOS.

**Version:** 2.0
**Last Updated:** 2025-12-05

---

## Overview

The Template Engine provides a consistent way to generate documents (PRDs, ADRs, Stories, etc.) with variable substitution, conditionals, and loops. It powers all document generation tasks in AIOS.

### Key Features

| Feature      | Syntax                                  | Description                     |
| ------------ | --------------------------------------- | ------------------------------- |
| Variables    | `{{VAR_NAME}}`                          | Simple variable substitution    |
| Conditionals | `{{#IF_CONDITION}}...{{/IF_CONDITION}}` | Conditional blocks              |
| Loops        | `{{#EACH_ITEMS}}...{{/EACH_ITEMS}}`     | Iterate over arrays             |
| Nested Paths | `{{user.name}}`                         | Access nested object properties |
| Escaping     | `\{{literal}}`                          | Prevent template processing     |

---

## Quick Start

### Basic Usage

```javascript
const TemplateEngine = require('./.aios-core/infrastructure/scripts/template-engine');

const engine = new TemplateEngine();

const template = `
# {{TITLE}}

Created by: {{AUTHOR}}
Date: {{DATE}}

## Summary
{{SUMMARY}}
`;

const variables = {
  TITLE: 'My Document',
  AUTHOR: 'Dex (@dev)',
  DATE: '2025-12-05',
  SUMMARY: 'This is a generated document.',
};

const output = engine.process(template, variables);
console.log(output);
```

### Output

```markdown
# My Document

Created by: Dex (@dev)
Date: 2025-12-05

## Summary

This is a generated document.
```

---

## API Reference

### TemplateEngine Class

```javascript
const TemplateEngine = require('./.aios-core/infrastructure/scripts/template-engine');
const engine = new TemplateEngine();
```

### Methods

#### `process(template, variables)`

Process a template string with given variables.

**Parameters:**

- `template` (string) - Template string with placeholders
- `variables` (Object) - Key-value pairs for substitution

**Returns:** `string` - Processed template

```javascript
const result = engine.process('Hello, {{NAME}}!', { NAME: 'World' });
// Returns: "Hello, World!"
```

#### `loadAndProcess(templatePath, variables)`

Load a template file and process it.

**Parameters:**

- `templatePath` (string) - Path to template file
- `variables` (Object) - Variables to substitute

**Returns:** `Promise<string>` - Processed template

```javascript
const result = await engine.loadAndProcess('.aios-core/product/templates/story-tmpl.md', {
  STORY_ID: '3.12',
  TITLE: 'Documentation',
});
```

#### `validateTemplate(template, requiredVars)`

Validate that a template has all required placeholders.

**Parameters:**

- `template` (string) - Template to validate
- `requiredVars` (string[]) - List of required variable names

**Returns:** `Object` - `{ valid: boolean, missing: string[], found: string[] }`

```javascript
const validation = engine.validateTemplate(template, ['TITLE', 'DATE']);
if (!validation.valid) {
  console.error('Missing variables:', validation.missing);
}
```

#### `getTemplateVariables(template)`

Extract all variables used in a template.

**Parameters:**

- `template` (string) - Template to analyze

**Returns:** `Object` - `{ simple: string[], conditionals: string[], loops: string[] }`

```javascript
const vars = engine.getTemplateVariables(template);
console.log('Variables needed:', vars.simple);
console.log('Conditionals:', vars.conditionals);
console.log('Loop variables:', vars.loops);
```

#### `escapeInput(input)`

Escape special characters in user input to prevent injection.

**Parameters:**

- `input` (string) - User input to escape

**Returns:** `string` - Escaped input

```javascript
const safeInput = engine.escapeInput(userProvidedValue);
```

---

## Template Syntax

### Simple Variables

```markdown
# {{TITLE}}

Author: {{AUTHOR}}
Version: {{VERSION}}
```

### Nested Variables

Access nested object properties with dot notation:

```markdown
Project: {{project.name}}
Owner: {{project.owner.name}}
Email: {{project.owner.email}}
```

```javascript
const variables = {
  project: {
    name: 'AIOS',
    owner: {
      name: 'Pedro',
      email: 'pedro@example.com',
    },
  },
};
```

### Conditionals

Include content only if a variable is truthy:

```markdown
{{#IF_HAS_DEPENDENCIES}}

## Dependencies

This project depends on:
{{DEPENDENCIES}}
{{/IF_HAS_DEPENDENCIES}}
```

```javascript
const variables = {
  HAS_DEPENDENCIES: true,
  DEPENDENCIES: '- react\n- typescript',
};
```

### Loops

Iterate over arrays:

```markdown
## Tasks

{{#EACH_TASKS}}

- [ ] {{ITEM.title}} ({{ITEM.priority}})
      {{/EACH_TASKS}}
```

```javascript
const variables = {
  TASKS: [
    { title: 'Write docs', priority: 'HIGH' },
    { title: 'Add tests', priority: 'MEDIUM' },
    { title: 'Revi
```

---

# COMANDO - template-engine-v2.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\pt\guides\template-engine-v2.md
**SHA:** d4741d5aaa183083
**Timestamp:** 2026-08-28T02:02:39.603415
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- **Retorna:** `Object` - `{ valid: boolean, missing: string[], found: string[] }`
- console.error('Missing:', validation.missing);

### Ouro Bruto (primeiros 5000 chars)
```
<!--
  Tradução: PT-BR
  Original: /docs/en/guides/template-engine-v2.md
  Última sincronização: 2026-01-26
-->

# Template Engine v2.0

> 🌐 [EN](../../guides/template-engine-v2.md) | **PT** | [ES](../../es/guides/template-engine-v2.md)

---

> Motor de geração de documentos e substituição de variáveis para Synkra AIOS.

**Versão:** 2.0
**Última Atualização:** 2025-12-05

---

## Visão Geral

O Template Engine fornece uma forma consistente de gerar documentos (PRDs, ADRs, Stories, etc.) com substituição de variáveis, condicionais e loops. Ele alimenta todas as tarefas de geração de documentos no AIOS.

### Funcionalidades Principais

| Funcionalidade     | Sintaxe                                 | Descrição                                  |
| ------------------ | --------------------------------------- | ------------------------------------------ |
| Variáveis          | `{{VAR_NAME}}`                          | Substituição simples de variáveis          |
| Condicionais       | `{{#IF_CONDITION}}...{{/IF_CONDITION}}` | Blocos condicionais                        |
| Loops              | `{{#EACH_ITEMS}}...{{/EACH_ITEMS}}`     | Iteração sobre arrays                      |
| Caminhos Aninhados | `{{user.name}}`                         | Acesso a propriedades de objetos aninhados |
| Escape             | `\{{literal}}`                          | Prevenir processamento do template         |

---

## Início Rápido

### Uso Básico

```javascript
const TemplateEngine = require('./.aios-core/infrastructure/scripts/template-engine');

const engine = new TemplateEngine();

const template = `
# {{TITLE}}

Created by: {{AUTHOR}}
Date: {{DATE}}

## Summary
{{SUMMARY}}
`;

const variables = {
  TITLE: 'My Document',
  AUTHOR: 'Dex (@dev)',
  DATE: '2025-12-05',
  SUMMARY: 'This is a generated document.',
};

const output = engine.process(template, variables);
console.log(output);
```

### Saída

```markdown
# My Document

Created by: Dex (@dev)
Date: 2025-12-05

## Summary

This is a generated document.
```

---

## Referência da API

### Classe TemplateEngine

```javascript
const TemplateEngine = require('./.aios-core/infrastructure/scripts/template-engine');
const engine = new TemplateEngine();
```

### Métodos

#### `process(template, variables)`

Processa uma string de template com as variáveis fornecidas.

**Parâmetros:**

- `template` (string) - String de template com placeholders
- `variables` (Object) - Pares chave-valor para substituição

**Retorna:** `string` - Template processado

```javascript
const result = engine.process('Hello, {{NAME}}!', { NAME: 'World' });
// Retorna: "Hello, World!"
```

#### `loadAndProcess(templatePath, variables)`

Carrega um arquivo de template e o processa.

**Parâmetros:**

- `templatePath` (string) - Caminho para o arquivo de template
- `variables` (Object) - Variáveis a substituir

**Retorna:** `Promise<string>` - Template processado

```javascript
const result = await engine.loadAndProcess('.aios-core/product/templates/story-tmpl.md', {
  STORY_ID: '3.12',
  TITLE: 'Documentation',
});
```

#### `validateTemplate(template, requiredVars)`

Valida se um template possui todos os placeholders obrigatórios.

**Parâmetros:**

- `template` (string) - Template a validar
- `requiredVars` (string[]) - Lista de nomes de variáveis obrigatórias

**Retorna:** `Object` - `{ valid: boolean, missing: string[], found: string[] }`

```javascript
const validation = engine.validateTemplate(template, ['TITLE', 'DATE']);
if (!validation.valid) {
  console.error('Missing variables:', validation.missing);
}
```

#### `getTemplateVariables(template)`

Extrai todas as variáveis usadas em um template.

**Parâmetros:**

- `template` (string) - Template a analisar

**Retorna:** `Object` - `{ simple: string[], conditionals: string[], loops: string[] }`

```javascript
const vars = engine.getTemplateVariables(template);
console.log('Variables needed:', vars.simple);
console.log('Conditionals:', vars.conditionals);
console.log('Loop variables:', vars.loops);
```

#### `escapeInput(input)`

Escapa caracteres especiais em entrada do usuário para prevenir injeção.

**Parâmetros:**

- `input` (string) - Entrada do usuário a escapar

**Retorna:** `string` - Entrada escapada

```javascript
const safeInput = engine.escapeInput(userProvidedValue);
```

---

## Sintaxe de Templates

### Variáveis Simples

```markdown
# {{TITLE}}

Author: {{AUTHOR}}
Version: {{VERSION}}
```

### Variáveis Aninhadas

Acesse propriedades de objetos aninhados com notação de ponto:

```markdown
Project: {{project.name}}
Owner: {{project.owner.name}}
Email: {{project.owner.email}}
```

```javascript
const variables = {
  project: {
    name: 'AIOS',
    owner: {
      name: 'Pedro',
      email: 'pedro@example.com',
    },
  },
};
```

### Condicionais

Inclua conteúdo apenas se uma variável for truthy:

```markdown
{{#IF_HAS_DEPENDENCIES}}

## Dependencies

This project depends on:
{{DEPENDENCIES}}
{{/IF_HAS_DEPENDENCIES}}
```

```javascr
```