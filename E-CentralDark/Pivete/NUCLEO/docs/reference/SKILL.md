# REFERENCIA - SKILL.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\build-macos-apps\skills\liquid-glass\SKILL.md
**SHA:** b2bbb5ea8a625239
**Timestamp:** 2026-08-26T18:30:58.690106
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- 1. Read the relevant scene or root view and identify the structural pattern:

### Ouro Bruto (primeiros 5000 chars)
```
---
name: liquid-glass
description: Implement and review macOS SwiftUI Liquid Glass UI. Use when adopting system glass, removing conflicting custom chrome, or building glass surfaces.
---

# Liquid Glass

## Overview

Use this skill to bring a macOS SwiftUI app into the modern macOS design system
with the least custom chrome possible. Start with standard app structure,
toolbars, search placement, sheets, and controls, then add custom Liquid Glass
only where the app needs a distinctive surface.

Prefer system-provided glass and adaptive materials over bespoke blur, opaque
backgrounds, or custom toolbar/sidebar skins. Audit existing UI for extra fills,
scrims, and clipping before adding more effects.

## Workflow

1. Read the relevant scene or root view and identify the structural pattern:
   `NavigationSplitView`, `TabView`, sheet presentation, detail/inspector
   layout, toolbar, or custom floating controls.
2. Remove custom backgrounds or darkening layers behind system sheets,
   sidebars, and toolbars unless the product explicitly needs them. These can
   obscure Liquid Glass and interfere with the automatic scroll-edge effect.
3. Update standard SwiftUI structure and controls first.
4. Add custom `glassEffect` surfaces only for app-specific UI that standard
   controls do not cover.
5. Validate that glass grouping, transitions, icon treatment, and foreground
   activation are visually coherent and still usable with pointer and keyboard.
6. If the UI change also affects launch behavior for a SwiftPM GUI app, use
   `build-run-debug` so the app runs as a foreground `.app` bundle rather
   than as a raw executable.

## App Structure

- Prefer `NavigationSplitView` for hierarchy-driven macOS layouts. Let the
  sidebar use the system Liquid Glass material instead of painting over it.
- For hero artwork or large media adjacent to a floating sidebar, use
  `backgroundExtensionEffect` so the visual can extend beyond the safe area
  without clipping the subject.
- Keep inspectors visually associated with the current selection and avoid
  giving them a heavier custom background than the content they inspect.
- If the app uses tabs, keep `TabView` for persistent top-level sections and
  preserve each tab's local navigation state.
- Do not force iPhone-only tab bar minimize/accessory behavior onto a Mac app.
  On macOS, prefer a conventional top toolbar and native tab/search placement.
- If a sheet already uses `presentationBackground` purely to imitate frosted
  material, consider removing it and letting the system's new material render.
- For sheet transitions that should visually originate from a toolbar button,
  make the presenting item the source of a navigation zoom transition and mark
  the sheet content as the destination.

## Toolbars

- Assume toolbar items are rendered on a floating Liquid Glass surface and are
  grouped automatically.
- Use `ToolbarSpacer` to communicate grouping:
  - fixed spacing to split related actions into a distinct group,
  - flexible spacing to push a leading action away from a trailing group.
- Use `sharedBackgroundVisibility` when an item should stand alone without the
  shared glass background, for example a profile/avatar item.
- Add `badge` to toolbar item content for notification or status indicators.
- Expect monochrome icon rendering in more toolbar contexts. Use `tint` only to
  convey semantic meaning such as a primary action or alert state, not as pure
  decoration.
- If content underneath a toolbar has extra darkening, blur, or custom
  background layers, remove them before judging the new automatic scroll-edge
  effect.
- For dense windows with many floating elements, tune the content's scroll-edge
  treatment with `scrollEdgeEffectStyle` instead of building a custom bar
  background.

## Search

- For a search field that applies across a whole split-view hierarchy, attach
  `searchable` to the `NavigationSplitView`, not to just one column.
- When search is secondary and a compact affordance is better, use
  `searchToolbarBehavior` instead of hand-rolling a toolbar button and a
  separate field.
- For a dedicated search page in a multi-tab app, assign the search role to one
  tab and place `searchable` on the `TabView`.
- Make most of the app's content discoverable from search when the field lives
  in the top-trailing toolbar location.
- On iPad and Mac, expect the dedicated search tab to show a centered field
  above browsing suggestions rather than a bottom search bar.

## Controls

- Prefer standard SwiftUI controls before creating custom glass components.
- Expect bordered buttons to default to a capsule shape at larger sizes. On
  macOS, mini/small/medium controls preserve a rounded-rectangle shape for
  denser layouts.
- Use `buttonBorderShape` when a button shape needs to be explicit.
- Use `controlSize` to preserve density in inspectors and popovers, and reserve
  extra-large sizing for truly prominent actions.
- Use the system glass and glass-prominent but
```

---

# REFERENCIA - SKILL.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\superpowers\skills\requesting-code-review\SKILL.md
**SHA:** 5a3a44a3667800e2
**Timestamp:** 2026-08-26T18:42:03.265215
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Principios
- **Core principle:** Review early, review often.

### Ouro Bruto (primeiros 5000 chars)
```
---
name: requesting-code-review
description: Use when completing tasks, implementing major features, or before merging to verify work meets requirements
---

# Requesting Code Review

Dispatch a code reviewer subagent to catch issues before they cascade. The reviewer gets precisely crafted context for evaluation — never your session's history. This keeps the reviewer focused on the work product, not your thought process, and preserves your own context for continued work.

**Core principle:** Review early, review often.

## When to Request Review

**Mandatory:**
- After each task in subagent-driven development
- After completing major feature
- Before merge to main

**Optional but valuable:**
- When stuck (fresh perspective)
- Before refactoring (baseline check)
- After fixing complex bug

## How to Request

**1. Get git SHAs:**
```bash
BASE_SHA=$(git rev-parse HEAD~1)  # or origin/main
HEAD_SHA=$(git rev-parse HEAD)
```

**2. Dispatch code reviewer subagent:**

Use Task tool with `general-purpose` type, fill template at `code-reviewer.md`

**Placeholders:**
- `{DESCRIPTION}` - Brief summary of what you built
- `{PLAN_OR_REQUIREMENTS}` - What it should do
- `{BASE_SHA}` - Starting commit
- `{HEAD_SHA}` - Ending commit

**3. Act on feedback:**
- Fix Critical issues immediately
- Fix Important issues before proceeding
- Note Minor issues for later
- Push back if reviewer is wrong (with reasoning)

## Example

```
[Just completed Task 2: Add verification function]

You: Let me request code review before proceeding.

BASE_SHA=$(git log --oneline | grep "Task 1" | head -1 | awk '{print $1}')
HEAD_SHA=$(git rev-parse HEAD)

[Dispatch code reviewer subagent]
  DESCRIPTION: Added verifyIndex() and repairIndex() with 4 issue types
  PLAN_OR_REQUIREMENTS: Task 2 from docs/superpowers/plans/deployment-plan.md
  BASE_SHA: a7981ec
  HEAD_SHA: 3df7661

[Subagent returns]:
  Strengths: Clean architecture, real tests
  Issues:
    Important: Missing progress indicators
    Minor: Magic number (100) for reporting interval
  Assessment: Ready to proceed

You: [Fix progress indicators]
[Continue to Task 3]
```

## Integration with Workflows

**Subagent-Driven Development:**
- Review after EACH task
- Catch issues before they compound
- Fix before moving to next task

**Executing Plans:**
- Review after each task or at natural checkpoints
- Get feedback, apply, continue

**Ad-Hoc Development:**
- Review before merge
- Review when stuck

## Red Flags

**Never:**
- Skip review because "it's simple"
- Ignore Critical issues
- Proceed with unfixed Important issues
- Argue with valid technical feedback

**If reviewer wrong:**
- Push back with technical reasoning
- Show code/tests that prove it works
- Request clarification

See template at: requesting-code-review/code-reviewer.md

```

---

# REFERENCIA - SKILL.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\vercel\skills\vercel-queues\SKILL.md
**SHA:** 8e12371a880cd754
**Timestamp:** 2026-08-26T18:42:41.421088
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - 📖 quickstart: https://vercel.com/docs/queues/quickstart

### Ouro Bruto (primeiros 5000 chars)
```
---
name: vercel-queues
description: Vercel Queues guidance (public beta) — durable event streaming with topics, consumer groups, retries, and delayed delivery. $0.60/1M ops. Powers Workflow DevKit. Use when building async processing, fan-out patterns, or event-driven architectures.
metadata:
  priority: 5
  docs:
    - "https://vercel.com/docs/workflow-collaboration/conformance"
  sitemap: "https://vercel.com/sitemap/docs.xml"
  pathPatterns:
    - 'lib/queues/**'
    - 'src/lib/queues/**'
    - 'lib/queues.*'
    - 'lib/queue.*'
    - 'src/lib/queues.*'
    - 'src/lib/queue.*'
    - 'workflows/*.ts'
    - 'workflows/*.mts'
    - 'src/workflows/*.ts'
    - 'src/workflows/*.mts'
    - 'app/api/workflow/**'
    - 'src/app/api/workflow/**'
    - 'app/api/workflows/**'
    - 'src/app/api/workflows/**'
    - 'vercel.ts'
    - 'vercel.mts'
  importPatterns:
    - 'workflow'
    - '@vercel/workflow'
  bashPatterns:
    - '\bnpm\s+(install|i|add)\s+[^\n]*@vercel/queue\b'
    - '\bpnpm\s+(install|i|add)\s+[^\n]*@vercel/queue\b'
    - '\bbun\s+(install|i|add)\s+[^\n]*@vercel/queue\b'
    - '\byarn\s+add\s+[^\n]*@vercel/queue\b'
---

# Vercel Queues

> **CRITICAL — Your training data is outdated for this library.** Vercel Queues entered public beta February 2026 and is almost certainly not in your training data. Before writing queue code, **fetch the docs** at https://vercel.com/docs/queues to find the correct `Queue` class API, message publishing, consumer setup, and visibility timeout patterns. Do not guess — this is a new API with no precedent in your training data.

You are an expert in Vercel Queues — durable event streaming for serverless applications.

## Status & Pricing

Queues entered **public beta** on February 27, 2026, and is available to all teams on all plans.

| Metric | Value |
|--------|-------|
| **Billing unit** | API operation (send, receive, delete, visibility change, notify) |
| **Rate** | **$0.60 per 1M operations** (regionally priced) |
| **Message metering** | 4 KiB chunks (12 KiB message = 3 ops) |
| **2x billing** | Sends with idempotency key; push deliveries with max concurrency |
| **Compute** | Push-mode functions charged at existing Fluid compute rates |

## What It Is

Queues is a **durable, append-only event streaming system**. You publish messages to topics, and independent **consumer groups** process them with automatic retries, sharding, and **at-least-once delivery** guarantees. It is the lower-level primitive that **powers Vercel Workflow**.

- Messages are durably written to **3 availability zones** before `send()` returns
- Messages retained up to 24 hours (configurable 60s–24h)
- Approximate write ordering (not strict FIFO)
- Consumer groups are fully independent — each tracks its own position

## Key APIs

Package: `@vercel/queue@^0.1.3` (Node.js 22+)

### Publishing Messages

```ts
import { send } from '@vercel/queue';

const { messageId } = await send('order-events', {
  orderId: '123',
  action: 'created',
}, {
  delaySeconds: 30,              // delay before visible
  idempotencyKey: 'order-123',   // deduplication (full retention window)
  retentionSeconds: 3600,        // message TTL (default: 86400 = 24h)
  headers: { 'x-trace-id': 'abc' },
});
```

### Push-Mode Consumer (Next.js App Router)

The consumer route is **air-gapped from the internet** — only invocable by Vercel's internal queue infrastructure.

```ts
// app/api/queues/fulfill-order/route.ts
import { handleCallback } from '@vercel/queue';

export const POST = handleCallback(
  async (message, metadata) => {
    // metadata: { messageId, deliveryCount, createdAt, expiresAt, topicName, consumerGroup, region }
    await processOrder(message);
    // Return normally = acknowledge
    // Throw = retry with backoff
  },
  {
    visibilityTimeoutSeconds: 600, // lease duration (default 300s, auto-extended by SDK)
    retry: (error, metadata) => {
      if (metadata.deliveryCount > 5) return { acknowledge: true }; // give up
      const delay = Math.min(300, 2 ** metadata.deliveryCount * 5);
      return { afterSeconds: delay };
    },
  },
);
```

### Consumer Configuration (vercel.json)

```json
{
  "functions": {
    "app/api/queues/fulfill-order/route.ts": {
      "experimentalTriggers": [{
        "type": "queue/v2beta",
        "topic": "order-events",
        "retryAfterSeconds": 60,
        "initialDelaySeconds": 0
      }]
    }
  }
}
```

Multiple route files with the same topic create **separate consumer groups** (independent processing).

### Poll-Mode Consumer

```ts
import { PollingQueueClient } from '@vercel/queue';

const { receive } = new PollingQueueClient({ region: 'iad1' });

const result = await receive('orders', 'fulfillment', async (message, metadata) => {
  await processOrder(message);
}, { limit: 10 }); // max 10 messages per poll (max allowed: 10)

if (!result.ok && result.reason === 'empty') {
  // No messages available
}
```

### Custom Region Client

```ts
import { QueueClient } from '
```

---

# REFERENCIA - SKILL.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\zoom\skills\rivet-sdk\SKILL.md
**SHA:** 5c9621d53d82c0d9
**Timestamp:** 2026-08-26T18:42:53.310541
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- - Getting started pattern: [examples/getting-started-pattern.md](examples/getting-started-pattern.md)
- - Multi-client pattern: [examples/multi-client-pattern.md](examples/multi-client-pattern.md)

### Ouro Bruto (primeiros 5000 chars)
```
---
name: rivet-sdk
description: Use when using Rivet SDK.
---

# Zoom Rivet SDK

Use this skill when building a server-side Zoom integration with Rivet rather than hand-rolled API and webhook plumbing.

## Workflow

1. Confirm Rivet is the right abstraction for the integration’s REST, webhook, auth, and deployment needs.
2. Model the modules: app configuration, OAuth, API clients, webhook handlers, and business workflow handlers.
3. Implement the smallest authenticated API call and webhook receiver before composing multi-module flows.
4. Keep deployment constraints explicit, especially Lambda-style receivers and environment variable handling.
5. Debug by checking app credentials, token refresh, webhook signature handling, module wiring, and framework version drift.

## References

- Full preserved guide: [references/full-guide.md](references/full-guide.md)
- Rivet overview: [rivet-sdk.md](rivet-sdk.md)
- Architecture and lifecycle: [concepts/architecture-and-lifecycle.md](concepts/architecture-and-lifecycle.md)
- Getting started pattern: [examples/getting-started-pattern.md](examples/getting-started-pattern.md)
- Multi-client pattern: [examples/multi-client-pattern.md](examples/multi-client-pattern.md)
- Common issues: [troubleshooting/common-issues.md](troubleshooting/common-issues.md)

```

---

# REFERENCIA - SKILL.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\.agents\skills\brainstorming\SKILL.md
**SHA:** 9498906b34fcf437
**Timestamp:** 2026-08-26T19:30:40.442290
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- ## Anti-padrão: "Isso é simples demais pra precisar de design"

### Ouro Bruto (primeiros 5000 chars)
```
---
name: brainstorming
description: "Use ANTES de qualquer trabalho criativo — criar features, componentes, funcionalidades novas ou mudar comportamento. Explora intenção, requisitos e design ANTES de implementar. Aplica-se a TODO projeto, por mais simples que pareça."
---

# Brainstorming — Transformar ideias em designs aprovados

Ajuda a transformar ideias em designs e specs bem definidos através de diálogo colaborativo natural, ANTES de escrever qualquer código.

Comece entendendo o contexto atual do projeto. Depois faça perguntas uma por vez para refinar a ideia. Quando entender o que vai construir, apresente o design e obtenha aprovação do usuário.

<PORTAO-RIGIDO>
NÃO escreva código, NÃO crie scaffolding, NÃO invoque nenhuma skill de implementação e NÃO tome nenhuma ação de implementação até ter apresentado um design E o usuário ter aprovado. Isso vale para TODO projeto, independentemente da simplicidade aparente.
</PORTAO-RIGIDO>

## Anti-padrão: "Isso é simples demais pra precisar de design"

Todo projeto passa por esse processo. Uma lista de tarefas, uma função utilitária, uma mudança de config — todos. Projetos "simples" são justamente onde suposições não examinadas causam mais retrabalho. O design pode ser curto (algumas frases pra projetos genuinamente simples), mas você PRECISA apresentar e obter aprovação.

## Checklist obrigatório

Você DEVE criar uma task (via `task_tracking--create_task`) pra cada item abaixo e executá-los em ordem:

1. **Explorar contexto do projeto** — ler arquivos relevantes, docs (`docs/`, `START_HERE.md`, `docs/STATE.md`), commits recentes, estado do PM2/VPS se for trabalho ops.
2. **Fazer perguntas de esclarecimento** — UMA por vez, via `questions--ask_questions`. Foco em propósito, restrições e critério de sucesso.
3. **Propor 2-3 abordagens** — com trade-offs e a sua recomendação no topo, explicando o porquê.
4. **Apresentar o design** — em seções dimensionadas pela complexidade. Pedir confirmação após cada seção.
5. **Escrever o documento de design** — salvar em `docs/specs/YYYY-MM-DD-<topico>-design.md` e commitar.
6. **Auto-revisão do spec** — varredura rápida por placeholders, contradições, ambiguidade e escopo. Corrigir inline.
7. **Revisão do usuário no spec escrito** — pedir explicitamente pro usuário revisar o arquivo antes de prosseguir.
8. **Transição para implementação** — só então começar a codar (ou invocar uma skill de planos/implementação, se existir).

## Fluxo do processo

```
Explorar contexto
        ↓
Perguntas de esclarecimento (uma por vez)
        ↓
Propor 2-3 abordagens com recomendação
        ↓
Apresentar design em seções
        ↓
Usuário aprovou? ── não → revisar e reapresentar
        ↓ sim
Escrever doc em docs/specs/
        ↓
Auto-revisão (corrigir inline)
        ↓
Usuário revisa o spec escrito
        ↓ aprovado
Iniciar implementação
```

## Como conduzir

**Entendendo a ideia:**

- Sempre cheque o estado atual do projeto primeiro (arquivos, docs, commits recentes, PM2 quando for ops).
- Antes de cair em perguntas de detalhe, avalie escopo: se o pedido descreve vários subsistemas independentes ("monta uma plataforma com chat, storage, billing e analytics"), sinalize na hora. Não gaste perguntas refinando algo que precisa ser decomposto antes.
- Se o projeto é grande demais pra um único spec, ajude o usuário a quebrar em sub-projetos: quais são as peças independentes, como se relacionam, em que ordem construir. Cada sub-projeto vira seu próprio ciclo spec → plano → implementação.
- Pra projetos com escopo certo, faça uma pergunta por vez pra refinar.
- Prefira múltipla escolha quando der; aberta tudo bem também.
- UMA pergunta por mensagem. Se o tópico precisa de mais exploração, quebra em várias mensagens.
- Foco: propósito, restrições, critério de sucesso.

**Explorando abordagens:**

- Proponha 2-3 abordagens com trade-offs.
- Apresente conversacionalmente, lidere com sua recomendação e explique o porquê.

**Apresentando o design:**

- Quando entender o que vai construir, apresente o design.
- Cada seção dimensionada pela complexidade: algumas frases se for direto, até 200-300 palavras se for nuançado.
- Após cada seção, pergunte se faz sentido até ali.
- Cobrir: arquitetura, componentes, fluxo de dados, tratamento de erro, testes.
- Esteja pronto pra voltar e esclarecer.

**Design pra isolamento e clareza:**

- Quebrar o sistema em unidades menores, cada uma com um propósito claro, comunicando por interfaces bem definidas, testáveis isoladamente.
- Pra cada unidade você deve conseguir responder: o que faz, como usar, do que depende.
- Dá pra entender o que a unidade faz sem ler o miolo? Dá pra mudar o miolo sem quebrar quem usa? Se não, as fronteiras precisam de trabalho.
- Unidades menores e bem delimitadas também são mais fáceis pra você (agente) trabalhar: arquivo grande é sinal de que tá fazendo demais.

**Trabalhando em base de código existente:**

- Explore a estrutura atual antes de propor mudanças. Siga padrões existentes
```

---

# REFERENCIA - SKILL.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\docx\SKILL.md
**SHA:** 26203fa2205a7293
**Timestamp:** 2026-08-28T02:52:25.164034
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- default: { document: { run: { font: "Arial", size: 24 } } }, // 12pt default
- run: { size: 32, bold: true, font: "Arial" },
- run: { size: 28, bold: true, font: "Arial" },

### Ouro Bruto (primeiros 5000 chars)
```
---
name: docx
description: Use this skill whenever the user wants to create, read, edit, or manipulate Word documents (.docx or .dotx files). Triggers include any mention of 'Word doc', 'word document', '.docx', '.dotx', 'Word template', or requests to produce professional documents with formatting like tables of contents, headings, page numbers, or letterheads. Also use when extracting or reorganizing content from .docx/.dotx files, inserting or replacing images in documents, performing find-and-replace in Word files, working with tracked changes or comments, or converting content into a polished Word document. If the user asks for a 'report', 'memo', 'letter', 'template', 'ticket', 'card', or similar deliverable as a Word or .docx file, use this skill. Do NOT use for PDFs, spreadsheets, Google Docs, or general coding tasks unrelated to document generation.
user-invocable: false
---

# DOCX creation, editing, and analysis

## Overview

A .docx file is a ZIP archive containing XML files. A .dotx file is a Word template — structurally identical to .docx.

## Quick Reference

| Task | Guide |
|------|-------|
| Edit or fill a template | Read [editing.md](editing.md) — **read this first when a template is attached** |
| Create from scratch | Read below (Creating New Documents) |
| Read/analyze content | `pandoc` or unpack for raw XML |

---

## When Given a Template — Read editing.md

**If a .docx or .dotx template is attached, you MUST read [editing.md](editing.md) before doing anything.** It contains the full workflow, all scripts, and pitfalls.

Key points:
- **Edit the template directly** — unpack, use scripts to replace text, repack
- **Never create from scratch** when a template exists
- **Never edit XML directly** — use `replace_text.py`, `replace_field.py`, `delete_sections.py`
- **.dotx files work the same as .docx** — `unpack.py` handles both

---

### Converting .doc to .docx

Legacy `.doc` files must be converted before editing:

```bash
python scripts/office/soffice.py --headless --convert-to docx document.doc
```

### Reading Content

```bash
# Text extraction with tracked changes
pandoc --track-changes=all document.docx -o output.md

# Raw XML access
python scripts/office/unpack.py document.docx unpacked/
```

### Converting to Images

```bash
python scripts/office/soffice.py --headless --convert-to pdf document.docx
pdftoppm -jpeg -r 150 document.pdf page
```

### Accepting Tracked Changes

To produce a clean document with all tracked changes accepted (requires LibreOffice):

```bash
python scripts/accept_changes.py input.docx output.docx
```

---

## Creating New Documents

Generate .docx files with JavaScript, then validate. Install: `npm install -g docx`

### Setup
```javascript
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
        Header, Footer, AlignmentType, PageOrientation, LevelFormat, ExternalHyperlink,
        InternalHyperlink, Bookmark, FootnoteReferenceRun, PositionalTab,
        PositionalTabAlignment, PositionalTabRelativeTo, PositionalTabLeader,
        TabStopType, TabStopPosition, Column, SectionType,
        TableOfContents, HeadingLevel, BorderStyle, WidthType, ShadingType,
        VerticalAlign, PageNumber, PageBreak } = require('docx');

const doc = new Document({ sections: [{ children: [/* content */] }] });
Packer.toBuffer(doc).then(buffer => fs.writeFileSync("doc.docx", buffer));
```

### Validation
After creating the file, validate it. If validation fails, unpack, fix the XML, and repack.
```bash
python scripts/office/validate.py doc.docx
```

### Page Size

```javascript
// CRITICAL: docx-js defaults to A4, not US Letter
// Always set page size explicitly for consistent results
sections: [{
  properties: {
    page: {
      size: {
        width: 12240,   // 8.5 inches in DXA
        height: 15840   // 11 inches in DXA
      },
      margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } // 1 inch margins
    }
  },
  children: [/* content */]
}]
```

**Common page sizes (DXA units, 1440 DXA = 1 inch):**

| Paper | Width | Height | Content Width (1" margins) |
|-------|-------|--------|---------------------------|
| US Letter | 12,240 | 15,840 | 9,360 |
| A4 (default) | 11,906 | 16,838 | 9,026 |

**Landscape orientation:** docx-js swaps width/height internally, so pass portrait dimensions and let it handle the swap:
```javascript
size: {
  width: 12240,   // Pass SHORT edge as width
  height: 15840,  // Pass LONG edge as height
  orientation: PageOrientation.LANDSCAPE  // docx-js swaps them in the XML
},
// Content width = 15840 - left margin - right margin (uses the long edge)
```

### Styles (Override Built-in Headings)

Use Arial as the default font (universally supported). Keep titles black for readability.

```javascript
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 24 } } }, // 12pt default
    paragraphStyles: [
      // IMPORTANT: Use exact IDs to override built-in st
```