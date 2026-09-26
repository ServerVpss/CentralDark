# COMANDO - entities-create.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\base44\skills\base44-cli\references\entities-create.md
**SHA:** f43b38ed198aca3b
**Timestamp:** 2026-08-26T18:30:48.383722
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- - Must match pattern: `/^[a-zA-Z0-9]+$/`

### Ouro Bruto (primeiros 5000 chars)
```
# Creating Entities

Base44 entities are defined locally in your project and then pushed to the Base44 backend.

## Critical: File Naming

Entity files MUST use kebab-case naming: `{kebab-case-name}.jsonc`

| Entity Name | File Name |
|-------------|-----------|
| `Task` | `task.jsonc` |
| `TeamMember` | `team-member.jsonc` |
| `ActivityLog` | `activity-log.jsonc` |

WRONG: `TeamMember.jsonc`, `teamMember.jsonc`
RIGHT: `team-member.jsonc`

## Table of Contents

- [Creating Entities](#creating-entities)
  - [Entity Directory](#entity-directory)
  - [How to Create an Entity](#how-to-create-an-entity)
  - [Entity Schema Structure](#entity-schema-structure)
  - [Supported Field Types](#supported-field-types)
  - [Field Properties](#field-properties)
  - [Complete Example](#complete-example)
  - [Naming Conventions](#naming-conventions)
  - [Relationships Between Entities](#relationships-between-entities)
  - [Row Level Security (RLS)](#row-level-security-rls)
  - [Field Level Security (FLS)](#field-level-security-fls)
  - [Pushing Entities](#pushing-entities)

## Entity Directory

All entity definitions must be placed in the `base44/entities/` folder in your project root. Each entity is defined in its own `.jsonc` file.

Example structure:
```
my-app/
  base44/
    entities/
      user.jsonc
      product.jsonc
      order.jsonc
```

## How to Create an Entity

1. Create a new `.jsonc` file in the `base44/entities/` directory
2. Define your entity schema following the structure below
3. Push the changes to Base44 using the CLI

## Entity Schema Structure

Each entity file follows a JSON Schema-like structure:

```jsonc
{
  "name": "EntityName",       // PascalCase entity name
  "type": "object",           // Always "object"
  "properties": {
    // Define your fields here
  },
  "required": ["field1"]      // Array of required field names
}
```

### Common Mistake: Nested Schema Property

**WRONG** - Do NOT wrap properties in a `schema` object:
```jsonc
{
  "name": "Task",
  "description": "A task entity",
  "schema": {                    // ❌ WRONG - don't use nested "schema"
    "type": "object",
    "properties": { ... }
  }
}
```

**CORRECT** - Put `type` and `properties` at the top level:
```jsonc
{
  "name": "Task",
  "description": "A task entity",
  "type": "object",              // ✅ CORRECT - top level
  "properties": { ... }          // ✅ CORRECT - top level
}
```

This is a common mistake that will cause "Invalid schema: Schema must have a 'type' field" errors when pushing entities.

## Supported Field Types

### String

Basic text field:
```jsonc
{
  "title": {
    "type": "string",
    "description": "Task title"
  }
}
```

With format:
```jsonc
{
  "due_date": {
    "type": "string",
    "format": "date",
    "description": "Due date"
  }
}
```

Available formats: `date`, `date-time`, `time`, `email`, `uri`, `hostname`, `ipv4`, `ipv6`, `uuid`, `file`, `regex`, `richtext`

### String with Enum

Constrained to specific values:
```jsonc
{
  "status": {
    "type": "string",
    "enum": ["todo", "in_progress", "done"],
    "default": "todo",
    "description": "Current status"
  }
}
```

### Number

```jsonc
{
  "position": {
    "type": "number",
    "description": "Position for ordering"
  }
}
```

### Integer

For whole numbers only:
```jsonc
{
  "quantity": {
    "type": "integer",
    "description": "Item quantity",
    "minimum": 0,
    "maximum": 1000
  }
}
```

### Binary

For file/blob data:
```jsonc
{
  "attachment": {
    "type": "binary",
    "description": "File attachment"
  }
}
```

### Boolean

```jsonc
{
  "notify_on_change": {
    "type": "boolean",
    "default": true,
    "description": "Enable notifications"
  }
}
```

### Array of Strings

```jsonc
{
  "labels": {
    "type": "array",
    "items": { "type": "string" },
    "description": "Task labels/tags"
  }
}
```

### Array of Objects

```jsonc
{
  "attachments": {
    "type": "array",
    "description": "File attachments",
    "items": {
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "url": { "type": "string" },
        "type": { "type": "string" }
      }
    }
  }
}
```

## Field Properties

| Property      | Description                                                                              |
| ------------- | ---------------------------------------------------------------------------------------- |
| `type`        | Data type: `string`, `number`, `integer`, `boolean`, `array`, `object`, `binary`         |
| `description` | Human-readable description of the field                                                  |
| `enum`        | Array of allowed values (for strings)                                                    |
| `enumNames`   | Human-readable labels for enum values (same order as `enum`)                             |
| `default`     | Default value when not provided                                                          |
| `format`      | Format hint: `date`, 
```