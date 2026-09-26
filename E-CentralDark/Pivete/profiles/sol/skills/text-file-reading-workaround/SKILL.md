---
name: text-file-reading-workaround
version: "1.0.0"
description: "read_file Binary file em texto UTF-8 — ler via Python."
trigger: "read_file falha com 'Binary file' em arquivo que é texto UTF-8; pastes de sessão Windows/MSYS chegam como binário; linhas >500 chars quebram exibição"
tags: [file-reading, crlf, utf-8, python, msys, workaround, paste]
category: file-handling
metadata:
  hermes:
    tags: [file-reading, crlf, utf-8, python, msys, workaround, paste]
---

# Text File Reading Workaround

## Problema
`read_file` reporta "Binary file - cannot display as text" em arquivos que são **texto UTF-8 de fato**, geralmente porque:

- Terminação de linha CRLF (`\r\n`)
- Linhas muito longas (500+ caracteres)
- Arquivo veio de paste/copy em sessão Windows/MSYS

Isso é limite do `read_file`, não arquivo binário real.

## Identação rápida
```bash
file <arquivo>
# "Unicode text, UTF-8 text" ou "ASCII text" → é texto, não binário
# "PNG image data", "JPEG image data", "Zip archive data" → realmente binário
```

## Técnica confiável

### Opção A — ler e imprimir (pequeno/médio)
```bash
python E:/CentralDark/Pivete/scripts/_read_text.py "C:/caminho/arquivo.txt"
```

Saída: TAMANHO_BYTES, LINES, CRLF, conteúdo numerado.

### Opção B — ler com quebra de linhas longas
```bash
python E:/CentralDark/Pivete/scripts/_read_text.py "C:/caminho/arquivo.txt" 80
```

Segundo argumento (opcional) = largura máxima por linha. Linhas longas são quebradas em blocos.

### Opção C — salvar arquivo normalizado e ler com read_file
Se conteúdo é grande e quer usar read_file depois:

```bash
python E:/CentralDark/Pivete/scripts/_read_text.py "C:/caminho/arquivo.txt" save "C:/caminho/entrada_fixa.txt"
```

Depois: `read_file(path="C:/caminho/entrada_fixa.txt")`

## Scripts

### scripts/_read_text.py
```python
# -*- coding: utf-8 -*-
import sys

path     = sys.argv[1] if len(sys.argv) > 1 else 'C:/caminho/arquivo.txt'
save_to  = sys.argv[3] if len(sys.argv) > 3 and sys.argv[2] == 'save' else None
max_width = int(sys.argv[2]) if len(sys.argv) > 2 and sys.argv[2] != 'save' else None

with open(path, 'rb') as f:
    raw = f.read()

text = raw.decode('utf-8-sig').replace('\r\n', '\n')
crlf = '\r\n' in raw.decode('utf-8-sig')
lines = text.splitlines()

out = []
out.append(f'TAMANHO_BYTES={len(raw)}')
out.append(f'LINES={len(lines)}')
out.append(f'CRLF={crlf}')
out.append('---CONTEUDO---')
for i, line in enumerate(lines, 1):
    if max_width and len(line) > max_width:
        for j in range(0, len(line), max_width):
            out.append(f'{i}|{line[j:j+max_width]}')
    else:
        out.append(f'{i}|{line}')

result = '\n'.join(out) + '\n'
if save_to:
    with open(save_to, 'w', encoding='utf-8') as f:
        f.write(result)
    print(f'SAVED={save_to}')
    print(f'TAMANHO_BYTES={len(raw)} LINES={len(lines)} CRLF={crlf}')
else:
    print(result, end='')
```

## Dicas de ambiente (Windows/MSYS)

- `python3` pode não estar no PATH; usar `python` (3.11 ou 3.13 disponível)
- Caminhos absolutos com `E:/...` funcionam; evitar `E:\\...` no Python (`\\` é escape)
- No MSYS bash, `python /e/CentralDark/...` pode falhar por dupla escaparia
- Solução: usar caminho Windows `python E:/CentralDark/Pivete/scripts/_read_text.py arquivo.txt` (barra, não backslash)
- `/tmp` pode não existir ou ser limpo entre comandos — usar path estável sob o repo

## Quando NÃO usar

- Arquivo realmente binário (imagem, ZIP, PDF, executável) → ferramenta apropriada (vision_analyze para imagens, extração específica para PDF/DOCX/XLSX)
- `read_file` funciona normalmente para text files com LF e linhas razoáveis → usar read_file direto

## O que não é workaround

- Falha de credencial/ambiente (`command not found`, pacote não instalado) → não documentar como skill; é problema de setup
- Arquivo que era imagem/PDF/DOCX de verdade → read_file já extrai, ou usar ferramenta certa