---
name: google-drive-document-handling
description: >
  Detect and convert file formats from Google Drive exports.
---

# Google Drive Document Handling

## Gatilhos

Use quando:
- Baixou arquivo do Google Drive e `read_file` retorna "Binary file"
- Arquivo tem extensão `.md` mas não lê como texto
- Precisa extrair texto de PDF Google Docs

Não use quando:
- Arquivo é claramente texto que lê sem erro
- Arquivo é imagem/vídeo/zip por design

## Fluxo

### 1. Detectar formato

```bash
file "ARQUIVO"
```

PDF Google Docs retorna: `arquivo.md: PDF document, version 1.4`

### 2. Se PDF: converter com pymupdf

```bash
pip install pymupdf
python -c "
import fitz
doc = fitz.open('ARQUIVO')
texto = ''.join(page.get_text() for page in doc)
open('SAIDA.txt', 'w').write(texto)
print(f'{len(doc)} páginas, {len(texto)} chars')
"
```

No Windows, use `python` não `python3`.

### 3. Se DOCX: extrair

```bash
pip install python-docx
python -c "
from docx import Document
doc = Document('ARQUIVO')
texto = '\n'.join(p.text for p in doc.paragraphs)
open('SAIDA.txt', 'w').write(texto)
"
```

### 4. Se texto: ler direto

Se `file` retorna "text", usar `read_file` normal.

## Armadilhas

- PDF pode ter extensão .md — sempre detectar antes de ler
- `python3` no Windows é alias MS Store que falha — usar `python`
- PDF imagem escaneada sem texto extraível — usar OCR ou informar impossível
- Always use `encoding='utf-8'` ao salvar

## Scripts

- `scripts/detect-and-extract.py` — script automático de detecção e extração
- `references/google-docs-export-formats.md` — formatos de exportação do Google Docs
