# Formatos de exportação do Google Docs

## Visão geral

O Google Docs permite exportar em múltiplos formatos. O formato escolhido afeta como o arquivo deve ser tratado.

## Formatos comuns

### PDF
- Detecção: `file arquivo` → "PDF document, version 1.4"
- Extensões: `.pdf`, mas pode ser `.md` se nome original era .md
- Conteúdo: Texto renderizado com formatação
- Extração: PyMuPDF (`fitz`) para texto por página
- Limitação: PDF imagem escaneada sem texto extraível — usar OCR

### DOCX
- Detecção: `file arquivo` → "Microsoft Word 2007+" ou "Zip archive"
- Extração: `python-docx` para extrair parágrafos
- Observação: DOCX é na verdade um ZIP contendo XML

### TXT/Plain Text
- Detecção: `file arquivo` → "UTF-8 Unicode text" ou "ASCII text"
- Extração: Leitura direta — `read_file`, `cat`

### Markdown
- Detecção: `file arquivo.md` → "ASCII text" ou "UTF-8 Unicode text"
- Extração: Leitura direta

## Como detectar formato real

Sempre usar `file` antes de assumir formato pela extensão:

```bash
file "CAMINHO_DO_ARQUIVO"
```

Saídas comuns:
- `arquivo.pdf: PDF document, version 1.4, 8 page(s)`
- `arquivo.txt: UTF-8 Unicode text`
- `arquivo.md: ASCII text`
- `arquivo.docx: Microsoft Word 2007+ document`

## Problemas comuns

### Extensão errada
Google Drive pode manter nome original mesmo após download em formato diferente. Um arquivo `.md` pode ser na verdade PDF.

**Solução**: Sempre detectar formato com `file` antes de processar.

### Encoding fantasma
Arquivos exportados podem ter encoding diferente do esperado.

**Solução**: Sempre usar `encoding='utf-8'` com `errors='ignore'` ou `errors='replace'`.

### PDF sem texto extraível
PDF pode ser imagem escaneada ou ter texto como curva.

**Solução**: Verificar se `page.get_text()` retorna conteúdo. Se vazio para todas as páginas, é imagem — usar OCR ou informar impossível.

### Arquivo grande
Documentos longos podem ter muitas páginas/caracteres.

**Solução**: Extrair para arquivo, não imprimir no terminal. Usar head/tail para pré-visualização.

## Ferramentas

### PyMuPDF
```bash
pip install pymupdf
```
`page.get_text()` extrai texto de PDF.

### python-docx
```bash
pip install python-docx
```
`Document('arquivo').paragraphs` retorna parágrafos de DOCX.

### file (Unix)
Comando para detectar tipo de arquivo. Disponível no Git Bash/MSYS no Windows.

### Tesseract OCR
Para PDF imagens, usar OCR para extrair texto.
