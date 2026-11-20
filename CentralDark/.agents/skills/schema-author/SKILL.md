---
name: schema-author
description: Author and maintain schema definitions for structured knowledge in the vault. Use when defining new page types, artifact kinds, or extending the schema registry. Skip for ad-hoc note-taking.
---

# Schema Author

Define and maintain the schema registry for structured knowledge in the vault. Page types and artifact kinds determine how content is indexed, searched, and surfaced.

## Core principle
Schema is the contract between content and search surfaces. Every page type and artifact kind must have:
- Unique `type` identifier
- Required frontmatter fields
- Validation rules
- Search surface mapping (`generic` | `summary` | `source` | `kind`)

## Workflow
1. Read existing registry: `Brain/_brain.yaml` → `schema.page_types` + `schema.artifact_kinds`
2. Propose new type/kind with:
   - `type`: unique kebab-slug
   - `label`: human-readable
   - `required_fields`: array of frontmatter keys
   - `validation`: regex/pattern/enum constraints
   - `surface`: `generic` | `summary` | `source` | `kind`
   - `icon`: optional emoji for UI
4. Validate against existing — no duplicate types
5. Write to `Brain/_brain.yaml` (agent-writable) or propose to operator
6. Run `o2b search reindex` to refresh indices

## Rules
- Never write to user-authored note folders
- Schema changes require `o2b search reindex` to propagate
- Prefer extending existing types over creating new ones
- Preserve backward compatibility — add fields, don't remove
- Preserve provenance: every schema change logs author + reason

## CLI
```bash
o2b schema list
o2b schema add --type <type> --label <label> --surface <surface> --fields <fields>
o2b schema validate
o2b search reindex
```
