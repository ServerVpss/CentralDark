# -*- coding: utf-8 -*-
import os, sys

path = 'E:/CentralDark/Pivete/_paste8_out.txt'
out  = 'E:/CentralDark/Pivete/_paste8_wide_fixed.txt'
max_width = 80

with open(path, 'rb') as f:
    raw = f.read()
text = raw.decode('utf-8-sig').replace('\r\n', '\n')

lines = text.splitlines()
buf = []
buf.append(f'TAMANHO_BYTES_ORIGINAL={len(raw)}')
buf.append(f'LINES_ORIGINAL={len(lines)}')
buf.append('---CONTEUDO---')
for i, line in enumerate(lines, 1):
    if len(line) > max_width:
        for j in range(0, len(line), max_width):
            buf.append(f'{i}|{line[j:j+max_width]}')
    else:
        buf.append(f'{i}|{line}')

with open(out, 'w', encoding='utf-8') as f:
    f.write('\n'.join(buf) + '\n')

print(f'SAVED={out}')
print(f'LINES_FIXED={len(buf)}')
