# -*- coding: utf-8 -*-
import os, sys

path = 'E:/CentralDark/Pivete/pastes/paste_15_020535.txt'
out  = 'E:/CentralDark/Pivete/_paste15_out.txt'

with open(path, 'rb') as f:
    raw = f.read()

text = raw.decode('utf-8-sig')

# Preserva CRLF como linha se for texto com CRLF
if b'\r\n' in raw:
    text = raw.decode('utf-8-sig')
    lines = text.replace('\r\n', '\n').splitlines()
else:
    lines = raw.decode('utf-8-sig').splitlines()

buf = []
buf.append(f'TAMANHO_BYTES_ORIGINAL={len(raw)}')
buf.append(f'CRLF_PRESENTE={b"\\r\\n" in raw}')
buf.append(f'LINHAS={len(lines)}')
buf.append('---CONTEUDO---')
for i, line in enumerate(lines, 1):
    buf.append(f'{i}|{line}')

with open(out, 'w', encoding='utf-8') as f:
    f.write('\n'.join(buf) + '\n')

print(f'SAVED={out}')
print(f'TAMANHO_BYTES={len(raw)}')
print(f'CRLF={b"\\r\\n" in raw}')
print(f'LINHAS={len(lines)}')
print('---RESUMO---')
print('\n'.join(buf[:60]))
