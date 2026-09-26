# CONTRATO - SKILL.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\moody-s\skills\moody-s-peer-analysis\SKILL.md
**SHA:** f0291ec3cf465486
**Timestamp:** 2026-08-26T18:31:10.035571
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- Use the pattern: `{target_company_slug}_peer_analysis.html`

### Gaps
- <div class="pbc-note">Peer median 0.032% | Peer avg 0.032% (n=3). Target: 0.111%. Gap: +0.079pp above peer avg (3.5×). PD-implied rating: A1.</div>

### Ouro Bruto (primeiros 5000 chars)
```
---
name: moody-s-peer-analysis
description: >
  Produce a Peer Analysis HTML report for a target company and its credit peers using Moody's
  GenAI MCP tools. Use this skill whenever the user asks to compare a company against its peers,
  run a peer analysis, do a credit peer comparison, generate a peer group report, or analyze
  relative credit positioning. Trigger even if they just name a company and mention "peers",
  "peer comparison", "credit comparison", "peer group", or "relative value".
---

# Peer Analysis Skill

Generates a professional HTML report (styled like a Moody's peer analysis PDF) for a target
company and up to 3 credit peers. Data is pulled from multiple `Moodys MCP server` MCP tools and
consolidated into a single HTML artifact covering peers comparison, ratings chart, and ESG.

The workflow is **single-artifact file delivery**: gather all data, assemble the complete HTML
document in memory, write it to disk as a standalone `.html` file, and present it to the user for
download. No fenced code blocks, no streaming partial sections, no JSON payload, no progressive
edits. The downloaded file is the sole deliverable.

> ## ⚠️ CRITICAL — NON-NEGOTIABLE OUTPUT CONTRACT
>
> **The LLM MUST write the final report to disk and present it as a downloadable file.**
> This is the only acceptable form of delivery for this skill. Specifically:
>
> - The LLM **MUST** write the complete, standalone HTML document (`<!doctype html>` → `</html>`)
>   to `/mnt/user-data/outputs/{target_company_slug}_peer_analysis.html` and then call
>   `present_files` to surface it to the user.
> - The LLM **MUST NOT** print the raw HTML source in the chat — no ` ```html ` fenced code
>   blocks, no partial snippets, no inline HTML in the assistant message.
> - The LLM **MUST NOT** split the report across multiple files or multiple messages.
> - The LLM **MUST NOT** substitute prose, Markdown, JSON, or links for the file download.
> - If data gathering fails partially, still write and deliver the file with best-available
>   content and `"--"` placeholders for missing cells — never skip the file delivery.
>
> Treat any other output shape as a hard failure of the skill.

## Required MCP servers

`Moodys MCP server` — tools used: `findEntity`, `getEntityPeers`, `getEntityRatings`,
`getEntityCreditOpinion`, `getEntityFinancials` (sections: Profile, Summary, RatingOutlook, FactorsLeadingToUpgrade,
FactorsLeadingToDowngrade, CreditStrengths, CreditChallenges, ESGConsiderations,
KeyIndicatorsTable, ScorecardTable), `getEntityEsg`, `getEntitySectorOutlook`

`ProbabilityOfDefault - Prod - Moodys MCP - NEW URL` — PD tools:
- `getEntityProbabilityOfDefault` — retrieve Current PD, 1-year PD, 5-year cumulative PD,
  and implied rating for the target company AND each peer. Used to build the PD comparison
  panel in Section 2. Set `pd_comparison` to `null` in the JSON payload if data is
  unavailable for the target or fewer than 2 peers.

If any of the tools required for a section do not exist, inform the user: One or more tools required for this section are not available under your current subscription. Unlock more of the expert insights, data, and analytics you trust. Get Link:https://www.moodys.com/web/en/us/capabilities/gen-ai/ai-ready-data.html with us to learn more.

## Bundled files

- `assets/template.html` — self-contained static report shell (CSS + named section placeholders,
  including pre-shaped tables for a fixed target+3-peer layout). No embedded data, no inline
  script. Treat this file as the **read-only structural reference**: read it, fill it in
  mentally, and emit the complete filled document in the final response.

## Template (shared)

Before emitting the HTML report, **read both**:
1. [`skills/shared/template/SKILL.md`](../shared/template/SKILL.md) — authoring rules (which
   classes / snippets are owned by the shared layer, allowed per-skill overrides, outlook-badge
   usage).
2. [`skills/shared/template/assets/template.html`](../shared/template/assets/template.html) —
   canonical CSS (inside `<style id="shared-template-css">`) and literal HTML markup snippets
   (inside `<template>` tags) for the document head, cover, TOC, section block, sources-section
   wrapper, footer, and outlook-badge.

**Lookup order — always check the shared template before inventing.** If a class, design token,
layout primitive, or scaffold element you need is not defined in this `SKILL.md` or already
present in this skill's `assets/template.html`, the shared template skill is authoritative. Do
not invent CSS, HTML scaffolds, or design tokens that the shared skill already provides; do not
silently restyle anything the shared skill owns (cover, TOC, section, sources-section wrapper,
footer, outlook-badge, design tokens, reset, body / page base).

At emit time, copy the **contents** (not the `<style>` wrapper) of `<style id="shared-template-css">`
from the shared asset into the parent template's reserved marker region between the CSS-com
```

---

# CONTRATO - SKILL.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\replayio\skills\replayio\SKILL.md
**SHA:** d314b7bc1ec50c31
**Timestamp:** 2026-08-26T18:41:12.952470
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Then, if you need the uploaded Replay URL before your response, run:
- Set recording flags before the run:

### Ouro Bruto (primeiros 5000 chars)
```
---
name: "replayio"
description: "Use when you need to record or inspect an agent browser run in Replay, test a local app with the host agent browser using Replay Chromium, or use the Replay MCP server for deeper debugging of an uploaded recording."
---

# Replay Browser + Agent Browser + Replay MCP

Use the host **agent browser** with Replay Chromium whenever you need a recorded browser session. Do **not** drive the app with `playwright-cli` for normal browser work.

Before opening the agent browser, point it at Replay Chromium:

```bash
export AGENT_BROWSER_EXECUTABLE_PATH=/path/to/chromium
```

For the standard Replay install on macOS, the executable is usually:

```bash
export AGENT_BROWSER_EXECUTABLE_PATH="$HOME/.replay/runtimes/Replay-Chromium.app/Contents/MacOS/Chromium"
```

Recordings upload through the plugin's stop/idle hook as a safety net. If you need the Replay URL before reporting results, close the agent browser tab/session and force an upload with `replayio upload-all || replayio upload`.

## Direct Agent Browser First

Use the host agent browser directly for live browser control and first-pass inspection. Do not reach for the Replay MCP server just to click, type, read DOM state, inspect console output, check network requests, take screenshots, read storage, or check cookies.

Use the Replay MCP server only after a recording has uploaded and you need deeper Replay-specific debugging, such as inspecting execution history, narrowing a time-travel debugging problem, or investigating details that the live agent browser cannot answer.

In Browser-plugin hosts, follow the Browser skill and use the selected `iab` browser. Typical direct checks look like this:

```js
await browser.nameSession("replay repro");
if (typeof tab === "undefined") {
  globalThis.tab = await browser.tabs.new();
}
await tab.goto(URL);
console.log(await tab.playwright.domSnapshot());
console.log(await tab.title());
console.log(await tab.url());
console.log(await tab.dev.logs({ levels: ["error"], limit: 50 }));
await nodeRepl.emitImage(await tab.screenshot({ fullPage: false }));
```

Use the browser API's Playwright/DOM/vision helpers for interaction; the key restriction is to avoid the external `playwright-cli` path.

## Close-When-Done Contract

After you finish a test run, **before reporting the outcome to the user**, close the agent browser tab or session using the host browser API.

In Browser-plugin hosts:

```js
await tab.close();
```

Then, if you need the uploaded Replay URL before your response, run:

```bash
replayio upload-all || replayio upload
```

Do not leave a browser open at the end of your turn. If you forget, the stop/idle hook will attempt to upload pending recordings as a safety net, but you may not see the resulting Replay URL before responding.

**Exception - authentication wall:** If you must stop because the user needs to sign in interactively (see below), **do not** close the browser just to retry or reset. Leaving the session open preserves the headed window they should use; closing can end the recording before login is done.

## Web App Authentication Walls

If you hit a **login or authorization barrier** you cannot complete with automation alone - for example a sign-in page, SSO redirect, MFA step, CAPTCHA, or consent screen - **do not** close the browser and loop on reopen/retry. That drops useful context and trains failing retries.

Instead:

1. **Stop driving the browser** for this turn.
2. Briefly report what blocked you (URL or visible state).
3. Ask the user to complete sign-in **in the existing headed browser session** when that is possible (or give them the exact URL if they must use another window).
4. Ask them to **send another message when they are logged in** so you can attach to the same session or continue from an authenticated page.
5. End your turn there; resume only after they confirm.

Do not treat an auth wall as a generic error to brute-force by closing and reopening the Replay browser.

## The Reliable Path

1. Verify the Replay runtime exists and the CLI is logged in.
2. Resolve the Replay Chromium executable path.
3. Export `AGENT_BROWSER_EXECUTABLE_PATH` to that executable **before** opening the agent browser.
4. Set both `RECORD_ALL_CONTENT='1'` and `RECORD_REPLAY_VERBOSE='1'`.
5. If Replay QA will be used, map `REPLAY_QA_API_KEY` from `SECRET_REPLAY_QA_API_KEY` when available.
6. If testing a local app, start it first and verify the actual reachable URL.
7. Drive and inspect the page directly with the host agent browser, not `playwright-cli`.
8. Use fresh DOM snapshots or screenshots after navigation and major UI changes.
9. Close the agent browser tab/session when done.
10. Run `replayio upload-all || replayio upload` if you need the uploaded Replay URL before reporting results.

## Prerequisites

Check Replay first:

```bash
replayio info
replayio whoami
```

If Replay is missing, verify `npx` exists:

```bash
command -v npx >/dev/null 2>&1
```

If `npx` is missing, 
```

---

# CONTRATO - SKILL.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\zoom\skills\phone\SKILL.md
**SHA:** 42ef1d3efebbc088
**Timestamp:** 2026-08-26T18:42:51.058284
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- - Phone API service pattern: [examples/phone-api-service-pattern.md](examples/phone-api-service-pattern.md)

### Contratos
- - Event contract: [references/smart-embed-event-contract.md](references/smart-embed-event-contract.md)

### Ouro Bruto (primeiros 5000 chars)
```
---
name: build-zoom-phone-integration
description: Use when building Phone.
---

# Build Zoom Phone Integration

Use this skill when the target workflow is Zoom Phone, CTI, CRM calling, call events, or Smart Embed behavior.

## Workflow

1. Classify the integration: REST API automation, webhook event processing, Smart Embed, URI launch, CRM dialer, or call-handling workflow.
2. Confirm the actor, account settings, phone entitlements, and OAuth scopes before implementation.
3. Keep call control, call records, number management, and webhook processing as separate modules.
4. For Smart Embed, validate postMessage event contracts, embedding constraints, and CRM state mapping.
5. Debug by checking scopes, phone license, role permissions, number ownership, webhook subscriptions, and event payload shape.

## References

- Full preserved guide: [references/full-guide.md](references/full-guide.md)
- Architecture and lifecycle: [concepts/architecture-and-lifecycle.md](concepts/architecture-and-lifecycle.md)
- Phone API service pattern: [examples/phone-api-service-pattern.md](examples/phone-api-service-pattern.md)
- Smart Embed bridge: [examples/smart-embed-postmessage-bridge.md](examples/smart-embed-postmessage-bridge.md)
- Event contract: [references/smart-embed-event-contract.md](references/smart-embed-event-contract.md)
- Common issues: [troubleshooting/common-issues.md](troubleshooting/common-issues.md)

```

---

# CONTRATO - SKILL.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pdf\SKILL.md
**SHA:** ab8f22b470ef4626
**Timestamp:** 2026-08-28T02:52:28.450652
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- for idx, pg in enumerate(src.pages, start=1):

### Ouro Bruto (primeiros 5000 chars)
```
---
name: pdf
description: Read, create, and transform PDF files. Covers pulling text and tables out of PDFs, generating new PDFs, merging and splitting documents, rotating pages, watermarking, encrypting or removing passwords, extracting embedded images, running OCR on scanned documents, and filling out PDF forms including official tax forms. Apply this skill whenever a task involves a .pdf file as input or deliverable.
user-invocable: false
---

# Working with PDFs

Task-oriented recipes for PDF work, built around three Python libraries (`pypdf`, `pdfplumber`, `reportlab`) and the poppler-utils / qpdf command-line suites.

Companion documents in this directory — open them when the task calls for it:

- `forms.md` — required reading before filling out any PDF form
- `tax.md` — required reading before preparing the official tax forms bundled under `forms/`
- `reference.md` — deeper material: pypdfium2 rendering, JavaScript libraries (pdf-lib, pdfjs-dist), advanced qpdf/poppler flags, performance tuning, and troubleshooting

## Choosing a Tool

| Goal | Reach for |
|------|-----------|
| Pull out plain text | `pdfplumber` or `pdftotext` |
| Pull out tables | `pdfplumber` (`extract_tables`) |
| Combine documents | `pypdf` or `qpdf` |
| Break a document apart | `pypdf` (one writer per output) |
| Produce a new PDF | `reportlab` (Canvas for absolute layout, Platypus for flowing documents) |
| Grab embedded images | `pdfimages` |
| Render pages as pictures | `pdftoppm` / `pdf2image` |
| OCR a scanned document | `pytesseract` + `pdf2image` |
| Fill out a form | see `forms.md` |

## Getting Content Out of a PDF

### Text

```python
import pdfplumber

with pdfplumber.open("report.pdf") as doc:
    full_text = "\n".join(pg.extract_text() or "" for pg in doc.pages)
```

From the shell, `pdftotext` is quickest; `-layout` keeps the visual column structure and `-f`/`-l` bound the page range:

```bash
pdftotext -layout report.pdf report.txt
pdftotext -f 2 -l 4 report.pdf middle_pages.txt
```

### Tables

`pdfplumber` returns each table as a list of rows; feed them straight into pandas when you need to reshape or export:

```python
import pandas as pd
import pdfplumber

frames = []
with pdfplumber.open("report.pdf") as doc:
    for pg in doc.pages:
        for tbl in pg.extract_tables():
            if tbl:
                frames.append(pd.DataFrame(tbl[1:], columns=tbl[0]))

if frames:
    pd.concat(frames, ignore_index=True).to_excel("tables.xlsx", index=False)
```

### Document Metadata

```python
from pypdf import PdfReader

info = PdfReader("report.pdf").metadata
for key in ("title", "author", "subject", "creator"):
    print(key, "=", getattr(info, key))
```

### Embedded Images vs. Page Renders

These are different operations — pick the right one:

- `pdfimages -all report.pdf img/fig` copies the *original bitmap objects* embedded in the file, untouched by page layout.
- `pdftoppm -png -r 300 report.pdf pages/pg` *rasterizes* whole pages — text, vectors, and annotations included — producing what is effectively a screenshot of each page.

A rendered page is never a substitute for an extracted image, and vice versa.

### Scanned Documents (OCR)

Scanned PDFs contain pictures of text, so extraction tools return nothing useful. Rasterize first, then OCR each page:

```python
# pip install pytesseract pdf2image
import pytesseract
from pdf2image import convert_from_path

pages = convert_from_path("scan.pdf")
recognized = [pytesseract.image_to_string(img) for img in pages]
print("\n\n".join(recognized))
```

## Reorganizing Pages

### Combine Documents

```python
from pypdf import PdfWriter

writer = PdfWriter()
for path in ["intro.pdf", "body.pdf", "appendix.pdf"]:
    writer.append(path)

with open("combined.pdf", "wb") as out:
    writer.write(out)
```

Or from the shell:

```bash
qpdf --empty --pages intro.pdf body.pdf appendix.pdf -- combined.pdf
```

### Split into Pieces

```python
from pypdf import PdfReader, PdfWriter

src = PdfReader("combined.pdf")
for idx, pg in enumerate(src.pages, start=1):
    part = PdfWriter()
    part.add_page(pg)
    with open(f"part_{idx}.pdf", "wb") as out:
        part.write(out)
```

`qpdf` handles page ranges without any code:

```bash
qpdf combined.pdf --pages . 1-5 -- first_five.pdf
```

### Rotate

```python
from pypdf import PdfReader, PdfWriter

src = PdfReader("sideways.pdf")
writer = PdfWriter()
for pg in src.pages:
    writer.add_page(pg)
writer.pages[0].rotate(90)  # clockwise degrees; must be a multiple of 90

with open("upright.pdf", "wb") as out:
    writer.write(out)
```

### Stamp a Watermark

Overlay one PDF page (the watermark) onto every page of another:

```python
from pypdf import PdfReader, PdfWriter

stamp = PdfReader("stamp.pdf").pages[0]
src = PdfReader("contract.pdf")
writer = PdfWriter()

for pg in src.pages:
    pg.merge_page(stamp)
    writer.add_page(pg)

with open("stamped.pdf", "wb") as out:
    writer.write(out)
```

### Passwords

```python
from pypd
```

---

# CONTRATO - SKILL.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\.grok\skills\centraldark\SKILL.md
**SHA:** b585b665a527bc10
**Timestamp:** 2026-08-28T02:56:04.284898
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- Antes de criar qualquer skill, módulo, workflow, engine, painel, router, memória ou contrato:

### Ouro Bruto (primeiros 5000 chars)
```
---
name: centraldark
description: Adaptador Grok para operar no ServerVpss/CentralDark usando apenas a governança canônica já existente.
---

# CentralDark — Grok Adapter

Você está entrando na CentralDark.

Este arquivo NÃO é uma segunda governança.
NÃO recrie identidade, memória, MetaLupa, orquestrador, painel, router ou método próprio.
A autoridade continua nos artefatos canônicos do repositório e na intenção vigente de SEGREDO/CHEFE.

## BOOT

Antes de agir:

1. Localize a raiz real do repositório.
2. Leia `AGENTS.md`.
3. Leia `LEIA-ME-IA.md`.
4. Siga os donos canônicos referenciados por esses arquivos.
5. Meça branch, HEAD, PR/issue aplicável, Writer, checks, runtime e ferramentas realmente disponíveis.
6. Se a mensagem contiver `#ACORDAR`, `#ACORDA` ou `!CALIBRAR`, execute a calibração canônica antes de continuar.
7. Estado vivo comprovado vence snapshot, print, comentário e memória antigos.
8. Se GitHub/remoto estiver indisponível, não invente estado: marque `BLOCKED_GITHUB_UNAVAILABLE` ou `UNKNOWN` somente para a fronteira afetada e continue no que ainda puder ser provado.

## AUTORIDADE E PAPÉIS

`SEGREDO/CHEFE` = humano, autor da intenção e autoridade final.

`SOL` = coordenação/reconciliação operacional.

`PIVETE/HERMES` = execução, continuidade e preservação.

Modelo/provider = motor substituível.

Carregar o jeito do CHEFE NÃO significa herdar a autoridade do CHEFE.

Papel segue ESTADO + ESCOPO + NECESSIDADE.

## REGRA DE OURO

ENXERGUE TUDO.
MEXA SÓ ONDE DÓI.
NÃO PERCA OURO.
NÃO CARREGUE LIXO.
PROVE.
ABSORVA.
CONTINUE.

PARALELIZE PERCEPÇÃO.
SERIALIZE MUTAÇÃO.

MENOS É MAIS.

## WRITER / JUDGE

Um Writer por escopo.

Se outro Writer estiver ativo no mesmo dono/arquivo/PR:
- não dispute mutação;
- opere como `DELTA_PARTNER / JUDGE READ_ONLY`;
- tente quebrar hipóteses;
- entregue somente delta causal + evidência reproduzível.

Writer != Judge.

Troca de Writer exige handoff real quando o estado exigir.

## REUSE BEFORE CREATE

Antes de criar qualquer skill, módulo, workflow, engine, painel, router, memória ou contrato:

1. procure capacidade existente;
2. localize o dono canônico;
3. prove o gap;
4. melhore o dono existente;
5. crie algo novo somente se o gap sobreviver à contraprova.

Proibido criar V2/V3/paralelo por conveniência.

## ARQUEOLOGIA TOTAL

Fechado não significa resolvido.
Antigo não significa lixo.
Existente não significa absorvido.
Histórico não vira autoridade atual.

Para PRs, issues, branches, commits, planos, docs, skills, testes e workflows antigos:

INTENÇÃO ORIGINAL
→ ARTEFATOS
→ CONSUMIDOR
→ TESTE/PROVA
→ COMPARAR COM MAIN/ESTADO ATUAL
→ CLASSIFICAR

Classificações mínimas:
- ABSORVIDO
- PORTAR_DELTA_MINIMO
- SUPERSEDED_COM_PROVA
- HISTORICO_PRESERVADO
- REJEITADO_COM_MOTIVO
- BLOCKED_REAL
- UNKNOWN

`closed+unmerged` só é considerado curado quando houver prova de absorção ou destino explícito.

Não ressuscitar branch antiga inteira.
Portar somente ouro comprovadamente ausente para a arquitetura atual.
Registrar proveniência.

## CONFLITOS DE MERGE

Antes de escolher qualquer botão:

BASE + CURRENT/HEAD + INCOMING
→ intenção/commit/PR introdutor
→ consumidor
→ contrato
→ testes
→ semântica atual

`CURRENT` não é autoridade por posição.
`INCOMING` não é melhor por ser novo.

Se os dois lados coexistem validamente:
→ `Accept Both` é candidato preferencial
→ limpar duplicação/ordem/retorno/declarações incompatíveis
→ validar
→ só então `Mark resolved`

Se o valor é exclusivo — hash, identidade, autoridade, config única, porta, endpoint, schema pin ou equivalente:
→ provar o dono vigente
→ manter um único valor
→ validar

Botão é mecanismo. Semântica decide.

## METALUPA

MetaLupa também é falsificável.

Antes de proteger uma conclusão:
- defina o que a tornaria falsa;
- procure contraprova;
- aceite matar a própria hipótese;
- repetição do mesmo log/mesma cadeia sem informação nova não é prova independente.

UNKNOWN / SKIPPED / QUEUED / PENDING != PASS.

100% somente com denominador aplicável fechado.

## INSTINTO SUPERIOR

Durante drift, corrida de merge, mudança de HEAD, ferramenta caída ou descoberta nova:

NÃO REINICIAR A MISSÃO.
NÃO ENTRAR EM PÂNICO.
REMEDIR SOMENTE A FRONTEIRA AFETADA.
ABSORVER O DELTA CAUSAL.
COSTURAR O RESÍDUO.
REPROVAR.
CONTINUAR.

## EXPANSÃO DE DOMÍNIO

Expansão de Domínio significa combinar contexto + ferramentas + regras + observabilidade dentro do escopo autorizado.

Não cria autoridade nova.
Não autoriza bypass.
Não autoriza deploy.
Não transforma hipótese em ordem humana.

Use somente capacidades causais para a fronteira atual.

## SELF-HEALING

SELF_HEALING != SELF_JUSTIFYING.

Erro:
→ reproduzir
→ localizar causa
→ procurar mecanismo existente
→ correção mínima
→ teste
→ contraprova
→ Judge
→ absorver ouro
→ voltar ao fio

Incidente curado não significa classe do defeito curada.

Se um padrão bom se repetir e houver consumidor real, melhorar o dono canônico existente de forma determinística.

## TDD / DEBUG / REVIEW — OURO EXTERNO

Quand
```

---

# CONTRATO - SKILL.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\ECentralDark_RECONCILIATIONOUROLOCALskills 2\kimetsu-legacy-operational-method\SKILL.md
**SHA:** f18334150fb19e28
**Timestamp:** 2026-08-28T02:57:23.735727
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- IF invariantes_ou_risco:              RETURN PEDRA

### Ouro Bruto (primeiros 5000 chars)
```
---
name: kimetsu-legacy-operational-method
description: Execute Kimetsu Legacy 17 Respirações with Fixed Point.
---

# Kimetsu Legacy Operational Method — Motor Operacional CentralDark

Esta skill documenta o **Motor Operacional Kimetsu Legacy** adotado como método oficial da CentralDark. Substitui e expande o método anterior (`centraldark-operational-method`).

---

## Visão Geral

O método Kimetsu Legacy modela a operação como uma **árvore de 17 Respirações** (políticas operacionais), orquestradas por um **Motor de Seleção** e fechadas por **Fixed Point** com 5 condições.

> **Concentração Total** = Kernel observador (sempre ativo)
> **Sol** = Meta-orquestrador (raiz da árvore)
> **Lua** = Espelho adversarial (contraprova obrigatória no fechamento)

---

## 1. Arquitetura das 14 Matrizes de Respiração (Cristalizadas 2026-08-23)

| # | Matriz | Essência | Derivação | Tipo |
|---|--------|----------|-----------|------|
| 0 | **CONCENTRAÇÃO TOTAL** | Kernel observador contínuo | — | Núcleo Global |
| 1 | **SOL** | Meta-orquestrador / Raiz | — | Raiz |
| 2 | **ÁGUA** | Flexibilidade / Adaptação / Contorno | — | Fundamento |
| 3 | **CHAMAS** | Persistência orientada por evidência / Sustentação | — | Fundamento |
| 4 | **TROVÃO** | Velocidade decisiva / Impacto cirúrgico | — | Fundamento |
| 5 | **VENTO** | Propagação / Blast radius / Propagação | — | Fundamento |
| 6 | **PEDRA** | Invariantes / Safety rails | — | Fundamento |
| 7 | **LUA** | Espelho adversarial / Contraprova obrigatória | Derivação paralela do Sol | Meta |
| 8 | **FLOR** | Precisão estética / Interceptação de fluxos secundários | (Água) | Especialização |
| 9 | **SERPENTE** | Rota não-linear / Dependency tracing | (Água) | Especialização |
| 10 | **INSETO** | Correção cirúrgica de baixo impacto | (Água → Flor) | Especialização |
| 11 | **AMOR** | Coesão de interfaces / Ajuste ao operador | (Chamas) | Especialização |
| 12 | **SOM** | Ritmo e sequenciamento / Timing / Telemetria | (Trovão) | Especialização |
| 13 | **NÉVOA** | Redução de entropia cognitiva / Clareza | (Vento) | Especialização |
| 14 | **FERA** | Descoberta exploratória / Mapeamento anomalias | (Vento) | Especialização |

### Árvore Completa (14 Matrizes)

```
CONCENTRAÇÃO TOTAL (Núcleo Global / Kernel Contínuo)
│
├─ SOL (Meta-Orquestrador / Raiz)
│  ├─ ÁGUA (Flexibilidade / Adaptação)
│  │  ├─ FLOR (Alta Resolução / Validação de Borda)
│  │  │  └─ INSETO (Correção Cirúrgica)
│  │  └─ SERPENTE (Rota Não-Linear / Dependency Tracing)
│  ├─ CHAMAS (Persistência Orientada por Evidência)
│  │  └─ AMOR (Coesão / Ajuste ao Operador)
│  ├─ TROVÃO (Velocidade Decisiva / Impacto Cirúrgico)
│  │  └─ SOM (Ritmo / Sequenciamento / Telemetria)
│  ├─ VENTO (Propagação / Blast Radius)
│  │  ├─ NÉVOA (Redução de Ruído / Entropia Cognitiva)
│  │  └─ FERA (Descoberta Exploratória / Mapeamento Anomalias)
│  └─ PEDRA (Invariantes / Safety Rails)
│
└─ LUA (Espelho Adversarial / Contraprova Obrigatória) — Derivação Paralela do Sol
```

**Total: 14 Matrizes (1 Núcleo + 1 Raiz + 5 Fundamentos + 1 Meta + 6 Especializações)**

### Árvore Completa

```
CONCENTRAÇÃO TOTAL (Runtime Global / Kernel)
│
├─ SOL (Meta-Orquestrador / Raiz)
│  ├─ ÁGUA (Flexibilidade)
│  │  ├─ FLOR (Alta Resolução)
│  │  │  └─ INSETO (Correção Cirúrgica)
│  │  └─ SERPENTE (Rota Não-Linear)
│  ├─ CHAMAS (Persistência Evidência)
│  │  └─ AMOR (Ajuste ao Operador)
│  ├─ TROVÃO (Velocidade Decisiva)
│  │  └─ SOM (Ritmo/Sequenciamento)
│  ├─ VENTO (Propagação/Blast Radius)
│  │  ├─ NÉVOA (Redução de Ruído / Entropia Cognitiva)
│  │  └─ FERA (Descoberta Exploratória)
│  └─ PEDRA (Invariantes/Safety Rails)
│
└─ LUA (Espelho Adversarial / Contraprova) — Derivação Paralela do Sol
```

---

## 2. Runtime Global — Concentração Total

**Sempre ativo.** Kernel observador que precede e sucede toda Respiração.

### Executar (Pré-Ação)
```text
READ_INTENT()
MEASURE_STATE()
IDENTIFY_TARGET()
IDENTIFY_WRITER()
IDENTIFY_CONSTRAINTS()
SEPARATE_KNOWN_UNKNOWN()
```

### Executar (Pós-Ação)
```text
MEASURE_AGAIN()
COMPARE_BEFORE_AFTER()
CLASSIFY_RESULT()
SELECT_NEXT_BREATH()
```

### Invariantes do Kernel
```text
UNKNOWN != PASS
ACTION != PROOF
HISTORY != CURRENT_STATE
ASSUMPTION != FACT
```

---

## 3. Motor de Seleção

```text
FUNCTION SELECT_BREATH(state):
ALWAYS:
  CONCENTRATION_TOTAL

IF visão_global_necessária:           RETURN SOL
IF invariantes_ou_risco:              RETURN PEDRA
IF causa_desconhecida:                RETURN FERA
IF informação_demais:                 RETURN NÉVOA
IF dependência_indireta:              RETURN SERPENTE
IF propagação_importa:                RETURN VENTO
IF detalhe_fino_importa:              RETURN FLOR
IF causa_exata:                       RETURN INSETO
IF caminho_bloqueado:                 RETURN ÁGUA
IF sequência_temporal:                RETURN SOM
IF persistência_evidência:            RETURN CHAMAS
IF execução_multietapa_provada:       RETURN CHAMAS
IF ajuste_operador:                   RETURN AMOR
IF ajuste_humano
```