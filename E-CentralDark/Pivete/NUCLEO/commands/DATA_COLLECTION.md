# COMANDO - DATA_COLLECTION.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\wix\skills\wix-app\references\DATA_COLLECTION.md
**SHA:** 7a5a8e1aad8f444b
**Timestamp:** 2026-08-26T18:42:50.539639
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- **If app namespace is provided in the prompt:**

### Ouro Bruto (primeiros 5000 chars)
```

# Wix Data Collection Builder

Creates CMS data collections for Wix CLI apps. The data collections extension allows your app to automatically create CMS collections when it's installed on a site. Collections store structured data that can be accessed from dashboard pages, site pages, backend code, and external applications.

**Important:** This extension automatically enables the site's code editor, which is required for the Wix Data APIs to work. Without this extension, apps using Data APIs would need the Wix user to manually enable the code editor on their site, which isn't guaranteed. With the data collections extension, your app can reliably use Data APIs to read and write data in the collections.

## Scaffold

Use `wix generate --params` with `extensionType: DATA_COLLECTION`. The only other param is `collectionName` (1-36 chars: letters, numbers, underscores, hyphens) — fields, permissions, displayName overrides, etc. are all edited after scaffolding in the generated file.

The CLI manages a shared aggregator file (`data-collections.extension.ts`) that imports every collection file and registers them in one `extensions.dataCollections({...})` builder. The aggregator and `src/extensions.ts` are updated automatically — don't edit them manually.

## App Namespace Handling

**App namespace is REQUIRED** for data collections to work. The namespace scopes your collection IDs to prevent conflicts between apps.

### Implementation Behavior

**If app namespace is provided in the prompt:**
- Use it in all code examples: `<actual-namespace>/collection-suffix`

**If app namespace is NOT provided:**
- Use the placeholder `<app-namespace>` in all code examples: `<app-namespace>/collection-suffix`
- Add to Manual Action Items: "Replace `<app-namespace>` with your actual app namespace from Wix Dev Center"

### Collection ID Format

- **In extension definition (`idSuffix`):** Use just the suffix, e.g., `"products"`. The CLI uses `collectionName` from the scaffold params as the `idSuffix` for the generated entry.
- **In API calls:** Use the full scoped ID: `"<app-namespace>/products"` — MUST match `idSuffix` exactly (case-sensitive, no camelCase/PascalCase transformation)
- **In `referencedCollectionId`:** Use the `idSuffix` only (not the full scoped ID) — the system resolves it automatically
- Example: If `idSuffix` is `"product-recommendations"`, API calls use `"<app-namespace>/product-recommendations"` NOT `"<app-namespace>/productRecommendations"`

## Collection File Shape

The CLI scaffolds `<CollectionName>.ts` as a `satisfies DataCollection` default export. The scaffolded `fields` and `dataPermissions` are placeholders — replace them with your real schema, and set permissions per the [Context-Based Permission Rules](#context-based-permission-rules) before shipping.

```typescript
import type { DataCollection } from '@wix/astro/builders';

export const collectionIdSuffix = '<CollectionName>';

export default {
  idSuffix: collectionIdSuffix,
  displayName: '<CollectionName>',
  displayField: 'title',            // Field shown when referencing items
  fields: [ /* field definitions */ ],
  dataPermissions: { /* itemRead, itemInsert, itemUpdate, itemRemove */ },
  indexes: [],
  initialData: [],
} satisfies DataCollection;
```

## Field Types

| Type              | Description                      | Use Case               |
| ----------------- | -------------------------------- | ---------------------- |
| `TEXT`            | Single-line text                 | Names, titles          |
| `RICH_TEXT`       | Formatted HTML text              | Blog content           |
| `RICH_CONTENT`    | Rich content with embedded media | Complex blog posts     |
| `NUMBER`          | Decimal numbers                  | Prices, quantities     |
| `BOOLEAN`         | True/false                       | Toggles, flags         |
| `DATE`            | Date only                        | Birthdays              |
| `DATETIME`        | Date with time                   | Timestamps             |
| `TIME`            | Time only                        | Schedules              |
| `IMAGE`           | Single image                     | Thumbnails             |
| `DOCUMENT`        | File attachment                  | PDFs                   |
| `VIDEO`           | Video file                       | Media                  |
| `AUDIO`           | Audio file                       | Podcasts               |
| `MEDIA_GALLERY`   | Multiple media                   | Galleries              |
| `REFERENCE`       | Link to one item                 | Author → User          |
| `MULTI_REFERENCE` | Link to many items               | Post → Tags            |
| `ADDRESS`         | Structured address               | Locations              |
| `URL`             | URL validation                   | Links                  |
| `PAGE_LINK`       | Link to Wix page                 | Internal navigation    |
| `LANGUAGE`        | Language code                    | Multi-l
```