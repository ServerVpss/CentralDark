# CONTRATO - CSS-GUIDELINES.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\wix\skills\wix-app\references\editor-react-component\CSS-GUIDELINES.md
**SHA:** ba2915263c9dfa32
**Timestamp:** 2026-08-26T18:42:51.159453
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- margin-inline-start: 8px;
- border-inline-start: 4px solid currentColor;

### Gaps
- gap: clamp(1rem, 2.5vw, 2rem);
- gap: 1rem;
- gap: clamp(1rem, 3vw, 2rem);
- gap: clamp(1rem, 2.5vw, 2rem);
- --gap: 16px;
- gap: var(--gap);
- gap: 16px;

### Ouro Bruto (primeiros 5000 chars)
```
# CSS guidelines

These rules govern the CSS authored for each generated site
component. The rules exist so the rendered component is editable in
the Wix visual editor, fits any user-resizable container, and can be
parsed by zeroConfig to produce a correct manifest. Each rule states
_why_; when an edge case isn't covered literally, follow the intent.

## Naming and class application

### Apply classes via the `classnames` helper; merge `className` on the root

All CSS lives in a single CSS module file imported as `import styles from './[ComponentName].module.css';`. There is no separate global CSS import.

There are two kinds of classes, determined by whether the element is a named part:

| Element type | className | Why |
|---|---|---|
| Named part | `classNames('heading', styles.heading)` | Global string → zeroConfig creates an editor element; module class → applies the component's own CSS |
| Non-part (layout/structural) | `styles.contentWrapper` | Module class only — invisible to zeroConfig, no spurious editor element created |

**Named parts** get both a global plain string and a module class. The global string (`'<component-name>'` for root, `'<part-name>'` for inner parts — kebab-case) is what zeroConfig scans. The module class is what carries the component's structural CSS for that element.

**Non-part elements** (layout wrappers, grouping containers, structural helpers) get only a module class. CSS module classes are mangled and invisible to zeroConfig.

The root also merges the consumer-provided `className` prop via the `classnames` helper.

**Why:** zeroConfig creates one editor element per global class. A global class on a non-part produces a spurious editor element with no meaningful surface.

```tsx
import classNames from 'classnames';
import styles from './ProfileCard.module.css';

// ✅ Root: global string + module class + consumer className
<div className={classNames(className, 'profile-card', styles.root)} id={id}>

  {/* ✅ Named part: global string + module class */}
  <h2 className={classNames('heading', styles.heading)}>{heading}</h2>

  {/* ✅ Non-part layout wrapper: module class only */}
  <div className={styles.contentWrapper}>
    <span className={classNames('label', styles.label)}>{label}</span>
  </div>
</div>

// ✅ Internal sub-components — same pattern on part slots
<CardHeader className={classNames('header', styles.header)}>
  <CardTitle className={classNames('title', styles.title)}>{title}</CardTitle>
</CardHeader>
```

### Use single-class selectors

Every selector is exactly one class, written as a flat top-level
rule. Compound selectors (`.a.b`), descendant
selectors (`.a .b`), child combinators (`.a > .b`), sibling
combinators (`.a + .b`), tag selectors, and CSS nesting (the `&`
syntax) are not permitted in component CSS.

**Why:** zeroConfig pairs each editor element with the single CSS
rule keyed on its class. A compound or relational selector means
either two elements share a rule or one element's appearance depends
on context — either way the editor cannot decide which rule to
modify when a user changes a property. CSS nesting compiles to
descendant selectors and has the same effect.

```css
/* ✅ Do: Single-class selector — unambiguous mapping to an editor control */
.profile-card {
}
.title {
}
.content {
}

/* ❌ Compound selector — rule applies only when both classes match the same element */
.profile-card.featured {
}

/* ❌ Descendant selector — rule depends on ancestor structure */
.profile-card .title {
}

/* ❌ Child combinator — rule depends on direct parent */
.profile-card > .content {
}

/* ❌ Sibling combinator — rule depends on a sibling element */
.title + .subtitle {
}

/* ❌ CSS nesting — compiles to a descendant selector */
.profile-card {
  & .title {
    color: black;
  }
}
```

## Layout and responsiveness

### Root fills its container

The root element sets `width: 100%`, `height: 100%`, and
`box-sizing: border-box`. The component never assumes a specific
pixel size for its outer box.

**Why:** Wix users place components in resizable slots whose
dimensions aren't known at authoring time. A root with hardcoded
width or height overflows or leaves gaps inside its slot.

```css
/* ✅ Do: Root fills any slot the user creates */
.profile-card {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}
```

### Pipe sizing through every layer below the root

Every element between the platform-sized root and the leaf content
must explicitly participate in the sizing chain — one unsized
wrapper collapses the entire subtree to intrinsic size.

Use `flex: 1; min-width: 0` (or `min-height: 0` on the block axis)
on children that should grow, and `flex: 0 0 auto` on children that
should stay fixed-size.

**Why:** flex/grid children default to `auto` sizing and shrink to
content. A wrapper `<div>` without explicit sizing breaks the chain
even when the root fills its slot correctly.

```css
/* ✅ Do: grower fills remaining space */
.wrapper {
  display: flex;
  flex: 1;
```