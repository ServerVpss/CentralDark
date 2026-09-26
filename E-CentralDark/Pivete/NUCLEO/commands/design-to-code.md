# COMANDO - design-to-code.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\figma\skills\figma-swiftui\references\design-to-code.md
**SHA:** 4a1224ad17dd59ca
**Timestamp:** 2026-08-26T18:31:16.356611
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- 2. **Stub each screen as a placeholder** before laying anything out — a one-liner like `ContentUnavailableView("Profile", systemImage: "person.crop.circle")` or a `Text("TODO: Welcome")` view is fine.

### Ouro Bruto (primeiros 5000 chars)
```
# Figma → SwiftUI (design → code)

Translate a Figma design into idiomatic SwiftUI. Assumes the shared context in [SKILL.md](../SKILL.md) is loaded (URL parsing, `clientLanguages`/`clientFrameworks`, "React+Tailwind is a reference not a source", screenshot is truth).

The tables in this doc are illustrative samples, not exhaustive references — use them to infer the right mapping for similar inputs you encounter. If you find yourself reaching for `ZStack`, `HStack`, or `.offset(x:y:)` to approximate something the system already provides — a tab bar, toolbar, segmented control, list separator, glass material — stop and recognize the pattern instead; the substitution is in §6 or §10.

## 1. Pull the design

Call `get_design_context` with `nodeId` and `fileKey` extracted from the Figma URL (see [SKILL.md](../SKILL.md) shared context #1), passing:

- `clientLanguages: "swift"`
- `clientFrameworks: "swiftui"`

The response includes React+Tailwind code, a screenshot, and any Code Connect mappings the file exposes. Treat the React+Tailwind as a **structural reference, not output**.

**If `get_design_context` returns "You currently have nothing selected" (or an access/empty error) despite an explicit `nodeId`,** the URL's node-id likely points at a page/canvas or other non-renderable node rather than a frame — codegen can't run on it, even though `get_screenshot` and `get_metadata` accept it fine. Recover by calling `get_metadata` first, locating the top-level frame inside that page, and retrying `get_design_context` on the frame's id. Do **not** settle for the screenshot + metadata alone: SF Symbol names and exact title/label text live only in the design-context output (the `<SFSymbol>{Image(systemName: "…")}</SFSymbol>` wrappers — see §5) and are not visually recoverable from a screenshot, so guessing them reliably produces wrong results.

## 2. Multi-screen files: scaffold navigation first

If the Figma file (or the design context output) contains more than one screen — typical of an onboarding flow, a tabbed app, or any flow with distinct entry points — **don't dive into translating one screen at a time**. Scaffold the navigation surface, gate, and shared data first, then translate each screen against that scaffold.

1. **Pick the top-level container** from the screen relationships:
   - **Bottom tab bar repeated across screens** → `TabView` with one `Tab` per top-level destination.
   - **Linear flow (Welcome → Sign in → Home, or Onboarding → App)** → `NavigationStack`, gated by `@AppStorage` (`@AppStorage("hasOnboarded")`) or `@State` on the root view. The persisted flag is what decides which screen the root renders on cold launch.
   - **Modal flow (Compose, Settings)** → `.sheet(isPresented:)` or `.fullScreenCover(isPresented:)` from the parent screen.
2. **Stub each screen as a placeholder** before laying anything out — a one-liner like `ContentUnavailableView("Profile", systemImage: "person.crop.circle")` or a `Text("TODO: Welcome")` view is fine. Wire the routing between them so you can click through the navigation before any real layout exists.
3. **Set up sample data once**, at the root, so each screen reads from the same shape — a small `@State` array or an `@Observable` model. Translating each screen against an ad-hoc data shape and then refactoring at the end always costs more than agreeing on the shape upfront.
4. **Then translate each screen** in isolation against the scaffold. Order doesn't matter once routing exists; pick the simplest one first to validate the data shape, not the visually-richest.
5. **If a screen has an add / create affordance, build its destination too.** A "+" toolbar button, an "Add" row, or an edit affordance implies a create/edit screen — build it rather than wiring the button to a TODO. This applies to *create/edit* affordances only: a row implies a detail `NavigationLink` only when it shows a trailing chevron (§3) or the user asks — don't wrap plain chevron-less rows in fabricated detail screens.

**Create / edit form convention.** A "New X" / "Edit X" screen is a `Form` with an inline title (§6). The Figma frame name decides presentation: **"Sheet" / "Modal"** → `.sheet` (wrap the `Form` in a `NavigationStack`, with an `xmark` `.cancellationAction`); **"Nav Stack" / "Push" / "Drill"** → a pushed `navigationDestination` (back chevron handles dismissal, so no cancel button). Either way the confirm action is a `checkmark` `.confirmationAction` styled `.borderedProminent` (or iOS 26's `.glassProminent`) and `.disabled` until the form is valid — use the semantic placements with glyphs, not text "Cancel" / "Done".

Resist the temptation to translate the hero screen first. Without the navigation scaffold you'll end up rewriting the entry points and threading data the long way around anyway.

## 3. Recognize iOS UI patterns by structure, not exact strings

Figma node names vary across files and design libraries. `data-name="Grouped Table View"` in one file might be `List`, `Sett
```