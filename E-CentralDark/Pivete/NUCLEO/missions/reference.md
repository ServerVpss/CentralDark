# MISSAO - reference.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\nvidia\skills\physical-ai-infrastructure-setup-and-resilient-scaling\components\openclaw-azure-login\reference.md
**SHA:** 0622df7d58d51695
**Timestamp:** 2026-08-26T18:40:14.468161
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- name, then run:

### Ouro Bruto (primeiros 5000 chars)
```
# OpenClaw Azure Login

## Purpose

Use Azure CLI device-code flow when `az login` cannot launch a browser or the
chat surface cannot host interactive auth.

## Procedure

1. Check current auth:

```bash
az account show --query "{name:name,id:id,tenantId:tenantId,user:user.name}" -o table
```

If it succeeds and the subscription is correct, return to
`components/azure-access/reference.md` for PIM/role, provider, and region
checks.

2. Start device-code login. Use a tenant only when the user or org config gives
one; otherwise omit `--tenant`.

```bash
az login --use-device-code
az login --use-device-code --tenant <tenant-id-or-domain>
```

Do not use `--output none`; the agent must see the code and link. Do not run
bare `az login` in OpenClaw.

Use a streaming shell/session. If the shell tool returns a session ID, poll
until the code appears, then tell the user immediately; do not wait for login
completion before sharing the code.

3. When the CLI prints device instructions, immediately send the user:

```text
Open https://microsoft.com/devicelogin
Enter code: <code from az login output>
Then tell me "done" here.
```

Copy the exact code from the current command output. If Azure CLI prints a
different URL, use that exact URL. Keep the login command running while the
user completes auth. Do not start a second login unless the first expires or
fails; it changes the code.

4. After the command exits, verify:

```bash
az account show --query "{name:name,id:id,tenantId:tenantId,user:user.name}" -o table
```

If the wrong subscription is selected, ask the user for the subscription ID or
name, then run:

```bash
az account set --subscription <subscription-id-or-name>
az account show --query "{name:name,id:id,tenantId:tenantId,user:user.name}" -o table
```

## Failure Handling

- `AADSTS...` or tenant denied: rerun with `--tenant <tenant-id>` if the user
  or org config gives one; otherwise ask for the tenant.
- Code expired: rerun device-code login and send the fresh code/link.
- `PermissionError` writing Azure CLI config: request permission for the Azure
  CLI config directory or set `AZURE_CONFIG_DIR` to a user-private ignored
  path. Never commit Azure tokens or put them in `.env`.
- No subscriptions: stop before Terraform or Foundry work; the user must switch
  account/tenant or get subscription access.
- Conditional Access/MFA delay: leave the login command running; verify with
  `az account show` only after it exits.

## Handoff

Return to `components/azure-access/reference.md`, then the selected Azure skill:

- Cluster: `skills/physical-ai-infrastructure-setup-and-resilient-scaling/components/cluster-azure/reference.md`
- Inference: `skills/physical-ai-infrastructure-setup-and-resilient-scaling/components/inference-azure/reference.md`
- Osmo: `skills/physical-ai-infrastructure-setup-and-resilient-scaling/components/osmo-azure/reference.md`

```

---

# MISSAO - reference.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pdf\reference.md
**SHA:** c08d0c9790c342db
**Timestamp:** 2026-08-28T02:52:28.435084
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- for idx, pg in enumerate(doc, start=1):
- for idx, pg in enumerate(doc, start=1):
- When sweeping a directory, isolate failures per file so one bad PDF doesn't sink the run:
- for pg in src.pages[start : start + pages_per_chunk]:

### Ouro Bruto (primeiros 5000 chars)
```
# PDF Reference — Advanced Topics

Material that goes beyond the day-to-day recipes in SKILL.md: high-performance rendering, JavaScript tooling, less-common CLI flags, precision extraction, and troubleshooting.

## Fast Rendering with pypdfium2

pypdfium2 wraps PDFium (the Chromium PDF engine) and is the strongest choice for turning pages into images quickly. It also serves as a permissively licensed stand-in for PyMuPDF.

```python
import pypdfium2 as pdfium

doc = pdfium.PdfDocument("paper.pdf")

# Single page at 2x resolution
first = doc[0].render(scale=2.0, rotation=0)
first.to_pil().save("page_1.png", "PNG")

# Whole document as JPEGs
for idx, pg in enumerate(doc, start=1):
    pg.render(scale=1.5).to_pil().save(f"page_{idx}.jpg", "JPEG", quality=90)
```

It can also extract text:

```python
doc = pdfium.PdfDocument("paper.pdf")
for idx, pg in enumerate(doc, start=1):
    print(f"page {idx}: {len(pg.get_text())} chars")
```

## JavaScript: pdf-lib

pdf-lib (MIT) creates and edits PDFs in any JS runtime, and is notably good at preserving form structure during edits.

Open and extend an existing document:

```javascript
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';

const doc = await PDFDocument.load(fs.readFileSync('input.pdf'));
console.log(`${doc.getPageCount()} pages`);

const extra = doc.addPage([600, 400]);
extra.drawText('Appended page', { x: 100, y: 300, size: 16 });

fs.writeFileSync('extended.pdf', await doc.save());
```

Build a document from nothing, with fonts, shapes, and tabular text:

```javascript
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';

const doc = await PDFDocument.create();
const regular = await doc.embedFont(StandardFonts.Helvetica);
const bold = await doc.embedFont(StandardFonts.HelveticaBold);

const page = doc.addPage([595, 842]); // A4 in points
const { width, height } = page.getSize();

page.drawText('Invoice #12345', {
  x: 50, y: height - 50, size: 18, font: bold, color: rgb(0.2, 0.2, 0.8),
});
page.drawRectangle({
  x: 40, y: height - 100, width: width - 80, height: 30, color: rgb(0.9, 0.9, 0.9),
});

const rows = [
  ['Item', 'Qty', 'Price', 'Total'],
  ['Widget', '2', '$50', '$100'],
  ['Gadget', '1', '$75', '$75'],
];
let y = height - 150;
for (const row of rows) {
  row.forEach((cell, col) => {
    page.drawText(cell, { x: 50 + col * 120, y, size: 12, font: regular });
  });
  y -= 25;
}

fs.writeFileSync('invoice.pdf', await doc.save());
```

Selective merging — copy chosen pages between documents:

```javascript
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';

const target = await PDFDocument.create();
const a = await PDFDocument.load(fs.readFileSync('a.pdf'));
const b = await PDFDocument.load(fs.readFileSync('b.pdf'));

(await target.copyPages(a, a.getPageIndices())).forEach((p) => target.addPage(p));
(await target.copyPages(b, [0, 2, 4])).forEach((p) => target.addPage(p));

fs.writeFileSync('merged.pdf', await target.save());
```

## JavaScript: pdfjs-dist

PDF.js (Apache) is Mozilla's renderer, aimed at displaying PDFs in the browser.

```javascript
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = './pdf.worker.js'; // required for performance

const doc = await pdfjsLib.getDocument('paper.pdf').promise;
const page = await doc.getPage(1);
const viewport = page.getViewport({ scale: 1.5 });

const canvas = document.createElement('canvas');
canvas.width = viewport.width;
canvas.height = viewport.height;
await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
document.body.appendChild(canvas);
```

Text extraction, with per-item positions available when you need layout awareness:

```javascript
const doc = await pdfjsLib.getDocument('paper.pdf').promise;
for (let n = 1; n <= doc.numPages; n++) {
  const content = await (await doc.getPage(n)).getTextContent();
  const plain = content.items.map((it) => it.str).join(' ');
  const positioned = content.items.map((it) => ({
    text: it.str, x: it.transform[4], y: it.transform[5],
    width: it.width, height: it.height,
  }));
  console.log(`--- page ${n} ---\n${plain}`);
}
```

Reading annotations:

```javascript
const doc = await pdfjsLib.getDocument('annotated.pdf').promise;
for (let n = 1; n <= doc.numPages; n++) {
  for (const a of await (await doc.getPage(n)).getAnnotations()) {
    console.log(a.subtype, a.contents, a.rect);
  }
}
```

## poppler-utils Beyond the Basics

```bash
# Text with bounding boxes as XML — the basis for structured extraction
pdftotext -bbox-layout paper.pdf layout.xml

# Page renders: pick resolution, range, and format
pdftoppm -png -r 300 paper.pdf out/pg
pdftoppm -png -r 600 -f 1 -l 3 paper.pdf out/hires
pdftoppm -jpeg -jpegopt quality=85 -r 200 paper.pdf out/jpg

# Embedded images: list first, then pull what you need
pdfimages -list paper.pdf
pdfimages -all paper.pdf img/fig     # original formats
pdfimages -j -p paper.pdf img/pg     # JPEG, page numbers in names
```

##
```