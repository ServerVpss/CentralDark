# DECISAO - naming-conventions.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\figma\skills\figma-generate-library\references\naming-conventions.md
**SHA:** 16810f87eab00ea9
**Timestamp:** 2026-08-26T18:31:13.512335
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- Semantic variables alias primitives. They use the role-based `{category}/{role}` or `{category}/{subcategory}/{role}` pattern:
- _Parts/Avatar.Status   (UI3 pattern: _Parts/{ParentName}.{SubPart})
- _Slider/Handle         (UI3 pattern: _{ParentName}/{SubPart})
- Pattern: replace "/" with "-", wrap in var(--)
- Pattern: replace "/" with "", capitalize each word after first
- Pattern: first segment becomes class name, remainder becomes property (camelCase)

### Ouro Bruto (primeiros 5000 chars)
```
> Part of the [figma-generate-library skill](../SKILL.md).

# Naming Conventions Reference

This reference documents every naming convention used in the figma-generate-library workflow. Cover all naming decisions in order: variables, components, pages, variants, styles, separators, status indicators. The last section explains when to match an existing file's conventions vs. using the defaults here.

---

## 1. Variable Naming

### Slash hierarchy (the universal pattern)

All Figma variables use slash-separated paths. The slash creates visual grouping in the Variables panel and maps directly to the token hierarchy in code.

```
{category}/{subcategory}/{role}
```

Real examples from Simple DS and Material 3:

```
color/bg/primary
color/bg/secondary
color/text/primary
color/text/muted
color/border/default
color/border/focus
color/feedback/error
color/feedback/success
spacing/xs
spacing/sm
spacing/md
spacing/lg
spacing/xl
spacing/2xl
radius/none
radius/sm
radius/md
radius/lg
radius/full
typography/body/font-size
typography/body/line-height
typography/heading/font-size
typography/heading/font-weight
```

### Primitives collection

Primitive variables hold raw values and are **not** exposed to consumers (scope = `[]`). They use a flat `{family}/{step}` format matching the color scale convention from Simple DS:

```
blue/50
blue/100
blue/200
...
blue/900
gray/50
gray/100
...
gray/900
red/500
green/500
```

Step numbers follow the convention of the target codebase. If the codebase uses `100–900`, use that. If it uses `50–950`, use that. If there is no codebase convention, use `100–900` in increments of 100.

### Semantic collection

Semantic variables alias primitives. They use the role-based `{category}/{role}` or `{category}/{subcategory}/{role}` pattern:

```
color/bg/primary         → alias: primitives/white (light), primitives/gray/900 (dark)
color/bg/secondary       → alias: primitives/gray/100 (light), primitives/gray/800 (dark)
color/text/primary       → alias: primitives/gray/900 (light), primitives/white (dark)
color/text/secondary     → alias: primitives/gray/600 (light), primitives/gray/400 (dark)
color/border/default     → alias: primitives/gray/200 (light), primitives/gray/700 (dark)
```

**Rule:** Semantic variables must never hold raw hex values — they always alias a primitive. If you need a new color value, create the primitive first, then create the semantic alias.

### Casing

**Default:** Use **lowercase** with forward slashes: `color/bg/primary`, `spacing/2xl`.

**When to deviate:**
- If the existing file uses PascalCase (e.g., Material 3 uses `Schemes/Primary`) — match it.
- If the design team prefers PascalCase for readability in the Variables panel — acceptable as long as the code syntax is separately defined and uses the platform-correct case.
- Mode names can use spaces and mixed case (e.g., `SDS Light`, `Mode 1 → Light`) — these are labels, not identifiers.

**Never:** camelCase inside variable names (`colorBgPrimary` as a Figma name is wrong — that belongs in Android code syntax only). Never use spaces inside a path segment: `color/bg primary` is wrong; `color/bg/primary` is correct.

**Key distinction:** The casing rule applies to *Figma variable names*. Code syntax names follow *platform conventions* regardless of the Figma name case — see §9 for the full picture.

---

## 2. Component Naming

### Main components: PascalCase, no prefix

Published components intended for library consumers use plain PascalCase names:

```
Button
Input
Checkbox
Toggle
Avatar
Badge
Card
Dialog
Tooltip
Banner
```

Do not use a namespace prefix for public components (e.g., do not name them `DS/Button` or `sds-Button`). Slashes in component names create nested grouping in the Assets panel, which is correct for sub-components but not for top-level public components.

### Sub-components: underscore prefix + slash namespace

Internal sub-components that are NOT meant for library consumers use the `_` prefix. This hides them from the Assets panel by default and signals to other designers that they should not be used directly.

```
_Button/Slot           (internal icon slot for Button)
_Input/Indicator       (internal state indicator for Input)
_Badge/Dot             (internal dot sub-component of Badge)
_Parts/Avatar.Status   (UI3 pattern: _Parts/{ParentName}.{SubPart})
_Slider/Handle         (UI3 pattern: _{ParentName}/{SubPart})
```

Pattern rules:
- Use `_` prefix for ALL internal sub-components — no exceptions.
- Use slash namespacing to group sub-components under their parent: `_Button/IconSlot`.
- For sub-components shared by multiple parents, use `_Parts/{ComponentName}.{SubPart}`.

### Private documentation components

Components used only for internal documentation (not for production use) use the `.` prefix:

```
.ExampleCard
.GuidelineHeader
.DemoFrame
```

This hides them from consumers while keeping them accessible on the canvas.

---

## 3. Page Naming

Five reference design systems use three disti
```