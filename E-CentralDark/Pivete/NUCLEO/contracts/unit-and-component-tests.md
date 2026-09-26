# CONTRATO - unit-and-component-tests.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\build-web-data-visualization\skills\testing-data-visualizations\references\unit-and-component-tests.md
**SHA:** 2bfb4bd690a4f35f
**Timestamp:** 2026-08-26T18:31:31.474624
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- - Component-test the public contract: visible labels, legends, empty and error states, interaction callbacks, focusable controls, and chart-adjacent UI.

### Ouro Bruto (primeiros 5000 chars)
```
# Unit and Component Tests

## What Problem This Solves

This reference clarifies which visualization behavior should be protected with fast logic tests and which should be exercised through component-level rendering.

## When to Use It

Use this when the user is unsure what deserves unit coverage, how to test a chart component without overfitting to library internals, or how to validate Canvas and SVG charts before adding visual regression.

## Key Takeaways

- Unit-test pure logic such as domain calculation, bin edges, stacked totals, sorting, formatting, nearest-point lookup, threshold rules, and tooltip payload shaping.
- Component-test the public contract: visible labels, legends, empty and error states, interaction callbacks, focusable controls, and chart-adjacent UI.
- Query for stable semantics such as roles, names, labels, headings, and explicit test ids at the chart boundary, not for deep library-generated DOM structure.
- For Canvas or WebGL charts, test the event contract, data plumbing, and render-ready signals rather than expecting rich DOM output.
- Prefer small fixtures with purposeful edge cases over huge copied payloads in logic tests.

## Common Mistakes

- Asserting exact SVG path strings or tick markup that belongs to the rendering library, not the product contract.
- Using giant DOM snapshots as a substitute for real assertions.
- Treating tooltip text, selection payloads, and loading states as too minor to test even when they drive user decisions.

## Adjacent Skills

- `../SKILL.md`
- `../../typescript-data-visualization-engineering/SKILL.md`
- `../../accessibility-and-inclusive-visualization/SKILL.md`

## Source Links

- [Testing Library queries](https://testing-library.com/docs/queries/about)
- [Vitest guide](https://vitest.dev/guide/)

```