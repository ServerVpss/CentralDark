# -*- coding: utf-8 -*-
import os, sys

path = 'E:/CentralDark/Pivete/pastes/paste_8_005839.txt'
out  = 'E:/CentralDark/Pivete/_paste8_out.txt'

with open(path, 'rb') as f:
    raw = f.read()

text = raw.decode('utf-8-sig')
crlf = b'\r\n' in raw

lines = text.replace('\r\n', '\n').splitlines()
with open(out, 'w', encoding='utf-8') as f:
    f.write(f'TAMANHO_BYTES={len(raw)}\n')
    f.write(f'LINES={len(lines)}\n')
    f.write(f'CRLF={crlf}\n')
    f.write('---CONTEUDO---\\n')
    for i, line in enumerate(lines, 1):
        f.write(f'{i}|{line}\n')

print(f'SAVED={out}')
print(f'TAMANHO_BYTES={len(raw)}')
print(f'LINES={len(lines)}')
print(f'CRLF={crlf}')
