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
